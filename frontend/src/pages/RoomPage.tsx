import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Grid } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../contexts/AuthContext';
import { useRoomsGet } from '../hooks/useRooms';
import {
  useRoom,
  useRoomParticipants,
  useRoomMessages,
  useCreateRoomMessage,
} from '../hooks/useRoom';
import {
  Message,
  Participant,
  RoomParticipantsPanel,
  RoomChatPanel,
  RoomSidebar,
} from '../components/Room';
import { useRoomSocket } from '../hooks/useRoomSocket';
const getPlaceholderAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&length=2`;

export default function RoomPage() {
  const navigate = useNavigate();
  const params = useParams<{ roomId?: string }>();
  const { user, isLoading: authLoading, logout } = useAuth();

  const roomId = Number(params.roomId ?? '');
  const { data: rooms = [] } = useRoomsGet();
  const { data: room } = useRoom(roomId);
  const { data: participants = [] } = useRoomParticipants(roomId);
  const { data: messages = [] } = useRoomMessages(roomId);
  const {
    connected,
    messages: socketMessages,
    sendMessage,
  } = useRoomSocket(
    roomId,
    user?.id ?? 0,
  );
  const [liveMessages, setLiveMessages] = useState(messages);
  const [draft, setDraft] = useState('');
  const [privateRecipient, setPrivateRecipient] = useState<string | null>(null);
  const [isPrivateMode, setIsPrivateMode] = useState(true);

  useEffect(() => {
  setLiveMessages(messages);
}, [messages]);
useEffect(() => {
  const latest =
  socketMessages.length > 0
    ? socketMessages[socketMessages.length - 1]
    : undefined;

  if (!latest) return;

  if (latest.event !== 'new_message') return;

  console.log('New message received via WebSocket:', latest);
  setLiveMessages((current) => {
    const alreadyExists = current.some(
      (message) => message.id === latest.id,
    );

    if (alreadyExists) {
      return current;
    }

    return [
      ...current,
      {
        id: latest.id!,
        room_id: latest.room_id!,
        user_id: latest.user_id!,
        recipient_id: latest.recipient_id ?? null,
        message: latest.message ?? '',
        image_url: null,
        message_metadata: null,
        created_at: latest.created_at ?? new Date().toISOString(),
        author_name: '',
        recipient_name: null,
      },
    ];
  });
}, [socketMessages]);

  const participantList = useMemo(
  () =>
    participants.map((participant) => ({
      user_id: participant.user_id,
      name: participant.name,
      role: participant.is_creator ? 'Criador' : 'Participante',
      avatar: getPlaceholderAvatar(participant.name),
      online: true,
    })),
  [participants]
);
  useEffect(() => {
    if (!privateRecipient && participantList.length > 0) {
      const firstRecipient = participantList.find((participant) => participant.name !== user?.name);
      setPrivateRecipient(firstRecipient?.name ?? participantList[0].name);
    }
  }, [privateRecipient, participantList, user?.name]);

  const sidebarRooms = useMemo(
    () => rooms.map((roomItem) => ({ id: roomItem.id, title: roomItem.title, creator: roomItem.creator || 'Desconhecido', members: roomItem.members })),
    [rooms],
  );

  const currentRoom = useMemo(
    () => ({
      id: String(roomId),
      title: room?.title ?? `Sala ${roomId}`,
      creator: participants.find((participant) => participant.user_id === room?.creatorId)?.name ?? room?.creator ?? 'Desconhecido',
      members: participantList.length,
    }),
    [roomId, room, participants, participantList.length],
  );

  const mappedMessages = useMemo<Message[]>(
    () =>
      liveMessages.map((message) => {
        const author =
          message.user_id === user?.id
            ? user.name
            : participants.find((participant) => participant.user_id === message.user_id)?.name ?? `Usuário ${message.user_id}`;
        const recipient = message.recipient_id
          ? message.recipient_id === user?.id
            ? user.name
            : participants.find((participant) => participant.user_id === message.recipient_id)?.name ?? `Usuário ${message.recipient_id}`
          : undefined;

        return {
          id: String(message.id),
          author,
          avatar: getPlaceholderAvatar(author),
          content: message.message,
          time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isPrivate: Boolean(message.recipient_id),
          recipient,
          self: message.user_id === user?.id,
        };
      }),
    [liveMessages, participants, user]
  );

  const visibleMessages = useMemo(
    () =>
      mappedMessages.filter((message) => {
        if (!message.isPrivate) return true;
        return message.author === user?.name || message.recipient === user?.name;
      }),
    [mappedMessages, user?.name],
  );

  const selectedRecipient = participantList.find((participant) => participant.name === privateRecipient) ?? null;

  const handleSend = () => {
    if (!draft.trim()) return;

    const recipient = participantList.find(
      (participant) => participant.name === privateRecipient,
    );

    sendMessage({
      message: draft.trim(),
      recipient_id: isPrivateMode && recipient
        ? recipient.user_id
        : null,
    });

    setDraft('');
  };

  const handleCancelPrivate = () => {
    setIsPrivateMode(false);
    setPrivateRecipient(null);
  };

  if (!params.roomId || Number.isNaN(roomId)) {
    navigate('/');
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: '32px' }}>
      <AppHeader
        user={user}
        isLoading={authLoading}
        title="Sala"
        subtitle={room?.title ?? 'Carregando...'}
        onLogin={() => navigate('/')}
        onLogout={logout}
      />

      <Container maxWidth="xl">
        <Box sx={{ mb: '24px', px: { xs: 0, md: '8px' } }}>
          <Button
            startIcon={<ArrowBackIosNew />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', color: 'text.primary' }}
          >
            Voltar para o dashboard
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <RoomParticipantsPanel
              participants={participantList}
              onSelectRecipient={(name) => {
                setPrivateRecipient(name);
                setIsPrivateMode(true);
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RoomChatPanel
              currentUser={user?.name ?? 'Você'}
              currentRoom={currentRoom}
              visibleMessages={visibleMessages}
              typingUser={!connected ? 'Conectando...' : null}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
              isPrivateMode={isPrivateMode}
              selectedRecipient={selectedRecipient}
              onCancelPrivate={handleCancelPrivate}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <RoomSidebar
              suggestedRooms={sidebarRooms}
              roomId={String(roomId)}
              onNavigate={(targetRoomId) => navigate(`/room/${targetRoomId}`)}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
