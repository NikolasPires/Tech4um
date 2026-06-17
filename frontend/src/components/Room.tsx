import { Avatar, Box, Badge, Button, Card, CardContent, Divider, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography, Chip } from '@mui/material';
import { ChatBubbleOutline, Send, People } from '@mui/icons-material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useRef } from 'react';
import { useAddRoomParticipant } from '../hooks/useRoom';
import { useAuth } from '../contexts/AuthContext';

export type Message = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  isPrivate: boolean;
  recipient?: string;
  self?: boolean;
  created_at?: string;
};

export type Participant = {
  user_id: number;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
};

export type SuggestedRoom = {
  id: string;
  title: string;
  creator: string;
  members: number;
};

type RoomParticipantsPanelProps = {
  participants: Participant[];
  onSelectRecipient: (name: string) => void;
};

export function RoomParticipantsPanel({ participants, onSelectRecipient }: RoomParticipantsPanelProps) {
  const user = useAuth().user;
  participants.sort((a, b) => {
    if (a.role === 'Criador' && b.role !== 'Criador') return -1;
    if (a.role !== 'Criador' && b.role === 'Criador') return 1;
    return a.name.localeCompare(b.name);
  });
  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: '16px', 
        boxShadow: '0px 14px 40px rgba(0,0,0,0.06)', 
        height: { xs: 'auto', md: '75vh' }, // Travado na mesma altura do chat para simetria visual
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ p: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" spacing={'16px'} alignItems="center" justifyContent="space-between" sx={{ mb: '16px', flexShrink: 0 }}>
          <Typography variant="labelLarge" sx={{ fontWeight: 700, color: 'primary.dark' }}>
            Participantes
          </Typography>
          <SearchIcon sx={{ color: 'primary.main' }} />
        </Stack>

        <Stack spacing={'16px'} sx={{ overflowY: 'auto', flexGrow: 1, pr: '4px' }}>
          {participants.map((participant) => (
            <Tooltip key={participant.name} title={user?.id !== participant.user_id ? `Enviar mensagem para ${participant.name}` : undefined} placement="top" arrow>
              <Stack
                direction="row"
                alignItems="center"
                spacing={'16px'}
                onClick={() => onSelectRecipient(participant.name)}
                sx={{
                  px: '16px',
                  py: '12px',
                  borderRadius: '12px',
                  cursor: user?.id !== participant.user_id ? 'pointer' : undefined,
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: user?.id !== participant.user_id ? 'rgba(0, 0, 0, 0.04)' : undefined,
                  },
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: participant.online ? '#44b700' : '#bdbdbd',
                      color: participant.online ? '#44b700' : '#bdbdbd',
                      boxShadow: '0 0 0 2px #fff',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      '&::after': participant.online ? {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        animation: 'ripple 1.2s infinite ease-in-out',
                        border: '1px solid currentColor',
                        content: '""',
                      } : {},
                    },
                    '@keyframes ripple': {
                      '0%': {
                        transform: 'scale(.8)',
                        opacity: 1,
                      },
                      '100%': {
                        transform: 'scale(2.4)',
                        opacity: 0,
                      },
                    },
                  }}
                >
                  <Avatar alt={participant.name} src={participant.avatar} />
                </Badge>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {participant.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray.main' }}>
                    {participant.role}
                  </Typography>
                </Box>
                  {user?.id !== participant.user_id && (
                    <IconButton size="small" sx={{ color: 'primary.dark' }}>
                      <ChatBubbleOutline fontSize="small" />
                    </IconButton>
                  )}
              </Stack>
            </Tooltip>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

const getGroupLabel = (date: Date) => {
  if (!date || isNaN(date.getTime())) return 'Hoje';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hoje';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  } else {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

type RoomChatPanelProps = {
  currentUser: string;
  currentRoom: SuggestedRoom;
  visibleMessages: Message[];
  typingUser: string | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isPrivateMode: boolean;
  selectedRecipient: Participant | null;
  onCancelPrivate: () => void;
  onTypingStatusChange: (isTyping: boolean) => void;
};

export function RoomChatPanel({
  currentUser,
  currentRoom,
  visibleMessages,
  typingUser,
  draft,
  onDraftChange,
  onSend,
  isPrivateMode,
  selectedRecipient,
  onCancelPrivate,
  onTypingStatusChange,
}: RoomChatPanelProps) {
  
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Função para rolar o chat para baixo
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const typingTimeoutRef = useRef<any | null>(null);
  const isCurrentlyTypingRef = useRef(false);
  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, typingUser]);

  const handleInputChange = (value: string) => {
    onDraftChange(value);

    if (!isCurrentlyTypingRef.current && value.trim().length > 0) {
      isCurrentlyTypingRef.current = true;
      onTypingStatusChange(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (value.trim().length === 0) {
      isCurrentlyTypingRef.current = false;
      onTypingStatusChange(false);
    } else {
      typingTimeoutRef.current = setTimeout(() => {
        isCurrentlyTypingRef.current = false;
        onTypingStatusChange(false);
      }, 2000);
    }
  };

  const handleSendClick = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isCurrentlyTypingRef.current = false;
    onTypingStatusChange(false);
    onSend();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: '16px', 
        boxShadow: '0px 14px 40px rgba(0,0,0,0.06)',
        height: { xs: '70vh', md: '75vh' }, // Fixa o tamanho em telas grandes e adapta em mobile
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cabeçalho fixo */}
      <CardContent sx={{ p: '24px', pb: '16px', flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="titleMedium" sx={{ color: 'primary.dark' }}>
            {currentRoom.title}
          </Typography>
          <Typography variant="labelLarge" sx={{ color: 'primary.dark', fontWeight: 300 }}>
            Criado por: <strong>{currentRoom.creator}</strong>
          </Typography>
        </Stack>
      </CardContent>

      <Divider sx={{ flexShrink: 0 }} />

      <Box 
        ref={messagesContainerRef}
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          px: '24px', 
          py: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Stack spacing={'16px'} sx={{ width: '100%' }}>
          {(() => {
            let lastGroupLabel = '';
            return visibleMessages.map((message) => {
              const isOwn = message.author === currentUser;
              const isPrivateVisible = message.isPrivate && (message.author === currentUser || message.recipient === currentUser);

              const messageDate = message.created_at ? new Date(message.created_at) : new Date();
              const groupLabel = getGroupLabel(messageDate);
              const showDateHeader = groupLabel !== lastGroupLabel;
              lastGroupLabel = groupLabel;

              return (
                <Box key={message.id} sx={{ width: '100%' }}>
                  {showDateHeader && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: '24px', position: 'relative', alignItems: 'center' }}>
                      <Divider sx={{ position: 'absolute', width: '100%', zIndex: 1 }} />
                      <Chip 
                        label={groupLabel} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'background.paper', 
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          color: 'gray.main', 
                          fontWeight: 600,
                          fontSize: '12px',
                          px: '12px',
                          zIndex: 2
                        }} 
                      />
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      mt: '8px',
                      width: '100%'
                    }}
                  >
                    <Avatar alt={message.author} src={message.avatar} sx={{ width: '40px', height: '40px' }} />
                    <Box
                      sx={{
                        maxWidth: '100%',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        borderRadius: '12px',
                        p: '16px',
                        boxShadow: '0px 12px 24px rgba(0,0,0,0.04)',
                        width: '100%',
                      }}
                    >
                      <Stack spacing={'4px'}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="labelMedium" sx={{ fontWeight: 700 }}>
                            {isOwn ? 'Você' : message.author}{' '}
                            {message.isPrivate && isPrivateVisible && (
                              <Typography
                                component="span"
                                variant="labelMedium"
                                sx={{ color: isOwn ? 'warning.main' : 'primary.main', fontWeight: 700, ml: '8px' }}
                              >
                                mensagem privada
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="labelSmall" sx={{ color: 'gray.main' }}>
                            {message.time}
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              );
            });
          })()}

          {typingUser && (
            <Card 
              elevation={0} 
              sx={{ 
                bgcolor: 'background.default', 
                borderRadius: '12px', 
                p: '12px', 
                border: '1px solid rgba(0,0,0,0.08)',
                width: 'fit-content',
                alignSelf: 'flex-start',
                animation: 'fadeIn 0.3s ease-in-out'
              }}
            >
              <Typography variant="body2" sx={{ color: 'gray.main', fontStyle: 'italic' }}>
                {typingUser} está digitando...
              </Typography>
            </Card>
          )}
        </Stack>
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Caixa de Texto Fixa no rodapé */}
      <Box 
        sx={{ 
          px: '24px', 
          py: '16px', 
          bgcolor: isPrivateMode ? 'secondary.dark' : 'primary.dark', 
          borderBottomLeftRadius: '16px', 
          borderBottomRightRadius: '16px',
          flexShrink: 0 
        }}
      >
        <Stack spacing={'16px'}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={'8px'}>
            <Box gap={1} display="flex" alignItems="center">
              <Typography variant="labelSmall" sx={{ color: 'primary.contrastText' }}>
                {isPrivateMode && selectedRecipient ? `Enviando para ${selectedRecipient.name}` : 'Enviando para todos do 4um'}
              </Typography>
              {isPrivateMode && (
                <Button variant="text" onClick={onCancelPrivate} sx={{ color: 'primary.contrastText', textTransform: 'none', p: 0 }}>
                  <Typography variant="labelSmall" sx={{ textDecoration: 'underline' }}>
                    Cancelar envio privado
                  </Typography>
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: '16px' }}>
              <InsertEmoticonIcon sx={{ color: 'white', cursor: 'pointer' }} />
              <InsertPhotoOutlinedIcon sx={{ color: 'white', cursor: 'pointer' }} />
            </Box>
          </Stack>

          <TextField
            fullWidth
            value={draft}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder="Escreva aqui uma mensagem maneira para mandar para os colegas.."
            variant="filled"
            InputProps={{
              disableUnderline: true,
              sx: { 
                borderRadius: '999px', 
                backgroundColor: 'background.paper', 
                px: '16px',

                '&.Mui-focused': {
                  backgroundColor: 'background.paper',
                },

                '&:hover': {
                  backgroundColor: 'background.paper',
                }
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSendClick} sx={{ color: 'primary.dark' }}>
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            }}
/>
        </Stack>
      </Box>
    </Card>
  );
}

type RoomSidebarProps = {
  suggestedRooms: SuggestedRoom[];
  roomId: string;
  onNavigate: (roomId: string) => void;
  onError?: (message: string) => void;
};

export function RoomSidebar({ suggestedRooms, roomId, onNavigate, onError }: RoomSidebarProps) {
  const useAddParticipantMutation = useAddRoomParticipant();
  const user = useAuth().user;

  const handleRoomClick = async (targetRoomId: string) => {
    if (user) {
      try {
        await useAddParticipantMutation.mutateAsync({
          roomId: Number(targetRoomId),
          userId: user.id,
        });
      } catch (err) {
        console.error('Failed to add participant to clicked room:', err);
        if (onError) {
          onError('Falha ao entrar na sala sugerida. Tente novamente.');
        }
      }
    }
    onNavigate(targetRoomId);
  };

  return (
    <Stack spacing={'12px'} sx={{ maxHeight: { xs: 'auto', md: '75vh' }, overflowY: 'auto', pr: '4px' }}>
      {suggestedRooms.map((room) => {
        const isSelected = room.id === roomId;

        return (
          <Box
            key={room.id}
            onClick={() => handleRoomClick(room.id)}
            sx={{
              borderRadius: '12px',
              bgcolor: isSelected ? 'rgba(23, 153, 246, 0.08)' : 'background.paper',
              p: '16px',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: isSelected ? 'primary.main' : 'rgba(0, 0, 0, 0.06)',
              borderLeft: isSelected ? '6px solid' : '1px solid',
              borderLeftColor: isSelected ? 'primary.main' : 'rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flexShrink: 0,
              '&:hover': {
                bgcolor: isSelected ? 'rgba(23, 153, 246, 0.12)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: isSelected ? 'primary.main' : 'gray.light',
                transform: 'translateX(4px)',
              },
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={'8px'}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? 'primary.dark' : 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {room.title}
              </Typography>

              <Chip
                icon={<People style={{ color: 'inherit', fontSize: '14px' }} />}
                label={room.members}
                size="small"
                sx={{
                  fontSize: '11px',
                  height: '20px',
                  bgcolor: isSelected ? 'primary.main' : 'background.default',
                  color: isSelected ? 'primary.contrastText' : 'gray.main',
                  fontWeight: 600,
                }}
              />
            </Stack>

            <Typography variant="labelSmall" sx={{ color: 'gray.main', fontWeight: 400 }}>
              por: {room.creator}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}