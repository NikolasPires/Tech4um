import { useEffect, useMemo, useState } from 'react';
import { AppBar, Avatar, Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Message,
  Participant,
  SuggestedRoom,
  RoomParticipantsPanel,
  RoomChatPanel,
  RoomSidebar,
} from '../components/Room';

const currentUser = 'Amanda Oliveira';

const participants: Participant[] = [
  { name: 'Lara Alves', role: 'Criadora', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', online: true },
  { name: 'Lucas Pinheiro', role: 'Participante', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', online: true },
  { name: 'Arthur Silva', role: 'Participante', avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80', online: true },
  { name: 'Gabriela Rodrigues Souza', role: 'Participante', avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80', online: true },
  { name: 'Wellington Resende Pereira', role: 'Participante', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', online: false },
  { name: 'José Thiago Miranda', role: 'Participante', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', online: false },
];

const suggestedRooms = [
  { id: 'product-development-stuff', title: 'product-development-stuff', creator: 'Lara Alves', members: 115 },
  { id: 'seguranca', title: '#segurança', creator: 'Ricardo', members: 54 },
  { id: 'thinking-about', title: 'Thinking about...', creator: 'Ana Beatriz', members: 28 },
  { id: 'tem_muita_coisa', title: 'Tem_muita_coisa', creator: 'Bianca', members: 32 },
  { id: 'systemmmmm', title: 'Systemmmmm...', creator: 'Marina', members: 18 },
  { id: 'e-as-ferias-onde', title: 'E as férias, onde...', creator: 'Caio Santos', members: 115 },
];

const initialMessages: Message[] = [
  {
    id: '1',
    author: 'Lara Alves',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    content: 'Olá, pessoal! Agora temos esse espaço para falar sobre produto e dev :) Fiquem à vontade para mandar o que acharem que faz sentido aqui.',
    time: '15:02',
    isPrivate: false,
  },
  {
    id: '2',
    author: 'Lucas Pinheiro',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    content: 'Eba!!!! Cadê esse pessoal animado?',
    time: '15:04',
    isPrivate: false,
  },
  {
    id: '3',
    author: 'Arthur Silva',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
    content: '👏👏👏👏👏👏👏👏👏👏',
    time: '15:05',
    isPrivate: false,
  },
  {
    id: '4',
    author: 'Gabriela Rodrigues Souza',
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80',
    content: 'Chegou o meu momento de descarregar um monte de link aqui pra geral 😌',
    time: '15:07',
    isPrivate: false,
  },
  {
    id: '5',
    author: 'Wellington Resende Pereira',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    content: 'Estou com vergonha de interagir aqui hahahahah',
    time: '15:09',
    isPrivate: true,
    recipient: 'Amanda Oliveira',
  },
  {
    id: '6',
    author: 'Amanda Oliveira',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    content: 'Oi, Wellington! Pode mandar tranquilo, estamos aqui pra ajudar.',
    time: '15:10',
    isPrivate: true,
    recipient: 'Wellington Resende Pereira',
    self: true,
  },
];

function useMockRoomSocket() {
  const [typingUser, setTypingUser] = useState<string | null>('Amanda Oliveira');
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    const startTyping = window.setTimeout(() => {
      setTypingUser('Amanda Oliveira');
    }, 1800);

    const stopTyping = window.setTimeout(() => {
      setTypingUser(null);
    }, 7200);

    return () => {
      window.clearTimeout(startTyping);
      window.clearTimeout(stopTyping);
    };
  }, []);

  function sendMessage(content: string, recipient?: string) {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: `${Date.now()}`,
      author: currentUser,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      content: content.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPrivate: !!recipient,
      recipient,
      self: true,
    };

    setMessages((current) => [...current, newMessage]);
  }

  return { messages, typingUser, sendMessage };
}

export default function RoomPage() {
  const navigate = useNavigate();
  const params = useParams<{ roomId?: string }>();
  const { messages, typingUser, sendMessage } = useMockRoomSocket();
  const [draft, setDraft] = useState('');
  const [privateRecipient, setPrivateRecipient] = useState<string | null>('Wellington Resende Pereira');
  const [isPrivateMode, setIsPrivateMode] = useState(true);

  const roomId = params.roomId ?? suggestedRooms[0].id;
    const currentRoom = useMemo(
    () => suggestedRooms.find((room) => room.id === roomId) ?? suggestedRooms[0],
    [roomId],
  );

  const visibleMessages = useMemo(
    () => messages.filter((message) => {
      if (!message.isPrivate) return true;
      return message.author === currentUser || message.recipient === currentUser;
    }),
    [messages],
  );

  const selectedRecipient = participants.find((participant) => participant.name === privateRecipient) ?? null;

  const handleSend = () => {
    sendMessage(draft, isPrivateMode ? privateRecipient ?? undefined : undefined);
    setDraft('');
  };

  const handleCancelPrivate = () => {
    setIsPrivateMode(false);
    setPrivateRecipient(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: '32px' }}>
      <AppBar position="static" color="transparent" elevation={1} sx={{ mb: '32px' }}>
        <Container maxWidth="xl">
          <Box py={'16px'}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={'8px'} alignItems="center">
                <img src="/Logo.png" alt="Logo" style={{ height: '44px', width: '92px' }} />
                <Typography variant="body2" sx={{ color: 'gray.main' }}>
                  Seu fórum sobre tecnologia!
                </Typography>
              </Stack>
              <Stack direction="row" spacing={'16px'} alignItems="center">
                <Box textAlign="left">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Lara Alves
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray.main' }}>
                    sevala_ora1@email.com
                  </Typography>
                </Box>
                <Avatar alt="Lara Alves" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" />
              </Stack>
            </Stack>
          </Box>
        </Container>
      </AppBar>

      <Container maxWidth="xl">
        <Box sx={{ mb: '24px', px: { xs: 0, md: '8px' } }}>
          <Button startIcon={<ArrowBackIosNew />} onClick={() => navigate('/')} sx={{ textTransform: 'none', color: 'text.primary' }}>
            Voltar para o dashboard
          </Button>
        </Box>

        <Grid container spacing={'24px'}>
          {/* COLUNA 1: PARTICIPANTES */}
          <Grid item xs={12} md={3}>
            <RoomParticipantsPanel
              participants={participants}
              onSelectRecipient={(name) => {
                setPrivateRecipient(name);
                setIsPrivateMode(true);
              }}
            />
          </Grid>

          {/* COLUNA 2: CHAT PRINCIPAL */}
          <Grid item xs={12} md={6}>
            <RoomChatPanel
              currentUser={currentUser}
              currentRoom={currentRoom}
              visibleMessages={visibleMessages}
              typingUser={typingUser}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
              isPrivateMode={isPrivateMode}
              selectedRecipient={selectedRecipient}
              onCancelPrivate={handleCancelPrivate}
            />
          </Grid>

          {/* COLUNA 3: SELEÇÃO DE SALAS (DESIGN CORRIGIDO E ATUALIZADO) */}
          <Grid item xs={12} md={3}>
            <RoomSidebar suggestedRooms={suggestedRooms} roomId={roomId} onNavigate={(targetRoomId) => navigate(`/room/${targetRoomId}`)} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}