import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Grid, Snackbar, Alert } from '@mui/material';
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

const avatarColors = [
  '4E79A7', // Steel Blue
  'F28E2B', // Orange
  'E15759', // Muted Red
  '76B7B2', // Teal
  '59A14F', // Green
  'EDC948', // Yellow
  'B07AA1', // Muted Purple
  'FF9DA7', // Pink
  '9C755F', // Brown
  'BAB0AC', // Slate Gray
  '6A5ACD', // Slate Blue
  '20B2AA', // Light Sea Green
  'FF7F50', // Muted Coral
  '9370DB', // Medium Purple
];

const stringToColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

const getPlaceholderAvatar = (name: string) => {
  const bg = stringToColor(name);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&length=2&bold=true`;
};

export default function RoomPage() {
  const navigate = useNavigate();
  const params = useParams<{ roomId?: string }>();
  const { user, isLoading: authLoading, logout } = useAuth();

  const roomId = Number(params.roomId ?? '');
  const { data: rooms = [] } = useRoomsGet();
  const { data: room } = useRoom(roomId);
  const { data: participants = [] } = useRoomParticipants(roomId);
  const { data: messages = [] } = useRoomMessages(roomId);
  const [typingUserName, setTypingUserName] = useState<string | null>(null);
  const {
    connected,
    messages: socketMessages,
    sendMessage,
    sendTypingStatus,
  } = useRoomSocket(
    roomId,
  );
  const [liveMessages, setLiveMessages] = useState(messages);
  const [draft, setDraft] = useState('');
  const [privateRecipient, setPrivateRecipient] = useState<string | null>(null);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (participants.length > 0) {
      const onlineIds = new Set<number>();
      participants.forEach((p) => {
        if (p.is_online) {
          onlineIds.add(p.user_id);
        }
      });
      setOnlineUserIds(onlineIds);
    }
  }, [participants]);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('warning');

  const participantList = useMemo(
    () =>
      participants.map((participant) => ({
        user_id: participant.user_id,
        name: participant.name,
        role: participant.is_creator ? 'Criador' : 'Participante',
        avatar: getPlaceholderAvatar(participant.name),
        online: onlineUserIds.has(participant.user_id),
      })),
    [participants, onlineUserIds]
  );

  const roomsWithCreators = useMemo(
    () =>
      rooms.map((r) => ({
        id: r.id,
        title: r.title,
        creator: r.creator,
        members: r.members,
      })),
    [rooms]
  );

  useEffect(() => {
    setLiveMessages(messages);
  }, [messages]);
  useEffect(() => {
    const latest =
      socketMessages.length > 0
        ? socketMessages[socketMessages.length - 1]
        : undefined;

    if (!latest) return;

    if (latest.event === 'user_typing') {
      if (latest.room_id !== undefined && latest.room_id !== roomId) return;
      if (latest.is_typing) {
        const tycoon = participantList.find((p) => p.user_id === latest.user_id);
        setTypingUserName(tycoon ? tycoon.name : `Usuário ${latest.user_id}`);
      } else {
        setTypingUserName(null);
      }
      return;
    }

    if (latest.event === 'user_online') {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (latest.user_id) next.add(latest.user_id);
        return next;
      });
      return;
    }

    if (latest.event === 'user_offline') {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (latest.user_id) next.delete(latest.user_id);
        return next;
      });
      return;
    }


    if (latest.event !== 'new_message') return;
    if (latest.room_id !== roomId) return;

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
  }, [socketMessages, participantList]);

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
          created_at: message.created_at,
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
              typingUser={typingUserName}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
              onTypingStatusChange={(isTyping) => {
                const recipient = participantList.find((p) => p.name === privateRecipient);
                sendTypingStatus({
                  is_typing: isTyping,
                  recipient_id: isPrivateMode && recipient ? recipient.user_id : null,
                });
              }}
              isPrivateMode={isPrivateMode}
              selectedRecipient={selectedRecipient}
              onCancelPrivate={handleCancelPrivate}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <RoomSidebar
              suggestedRooms={roomsWithCreators}
              roomId={String(roomId)}
              onNavigate={(targetRoomId) => navigate(`/room/${targetRoomId}`)}
              onError={(msg) => {
                setToastSeverity('error');
                setToastMessage(msg);
              }}
            />
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
