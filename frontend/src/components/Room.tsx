import { Avatar, Box, Button, Card, CardContent, Divider, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography, Chip } from '@mui/material';
import { ChatBubbleOutline, Send } from '@mui/icons-material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import SearchIcon from '@mui/icons-material/Search';

export type Message = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  isPrivate: boolean;
  recipient?: string;
  self?: boolean;
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
  return (
    <Card elevation={0} sx={{ borderRadius: '16px', boxShadow: '0px 14px 40px rgba(0,0,0,0.06)', height: '100%' }}>
      <CardContent sx={{ p: '24px' }}>
        <Stack direction="row" spacing={'16px'} alignItems="center" justifyContent="space-between" sx={{ mb: '16px' }}>
          <Typography variant="labelLarge" sx={{ fontWeight: 700, color: 'primary.dark' }}>
            Participantes
          </Typography>
          <SearchIcon sx={{ color: 'primary.main' }} />
        </Stack>

        <Stack spacing={'16px'}>
          {participants.map((participant) => (
            <Tooltip key={participant.name} title={`Enviar mensagem para ${participant.name}`} placement="top" arrow>
              <Stack
                direction="row"
                alignItems="center"
                spacing={'16px'}
                onClick={() => onSelectRecipient(participant.name)}
                sx={{
                  px: '16px',
                  py: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Avatar alt={participant.name} src={participant.avatar} />
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {participant.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray.main' }}>
                    {participant.role}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'primary.dark' }}>
                  <ChatBubbleOutline fontSize="small" />
                </IconButton>
              </Stack>
            </Tooltip>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

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
}: RoomChatPanelProps) {
  console.log(visibleMessages);
  return (
    <Card elevation={0} sx={{ borderRadius: '16px', boxShadow: '0px 14px 40px rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: '24px', pb: '16px' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="titleMedium" sx={{ color: 'primary.dark' }}>
            {currentRoom.title}
          </Typography>
          <Typography variant="labelLarge" sx={{ color: 'primary.dark', fontWeight: 300 }}>
            Criado por: <strong>{currentRoom.creator}</strong>
          </Typography>
        </Stack>
      </CardContent>

      <Divider />

      <Box sx={{ maxHeight: '58vh', overflowY: 'auto', px: '24px', pb: '16px', pt: '16px' }}>
        <Stack spacing={'16px'}>
          {visibleMessages.map((message) => {
            const isOwn = message.author === currentUser;
            const isPrivateVisible = message.isPrivate && (message.author === currentUser || message.recipient === currentUser);

            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
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
            );
          })}

          {typingUser && (
            <Card elevation={0} sx={{ bgcolor: 'background.default', borderRadius: '12px', p: '16px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="body2" sx={{ color: 'gray.main' }}>
                {typingUser} está digitando...
              </Typography>
            </Card>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mt: '16px' }} />

      <Box sx={{ px: '24px', py: '16px', bgcolor: isPrivateMode ? 'secondary.dark' : 'primary.dark', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
        <Stack spacing={'16px'}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={'8px'}>
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
            <Box sx={{ display: 'flex', gap: '16px' }}>
              <InsertEmoticonIcon sx={{ color: 'white', cursor: 'pointer' }} />
              <InsertPhotoOutlinedIcon sx={{ color: 'white', cursor: 'pointer' }} />
            </Box>
          </Stack>

          <TextField
            fullWidth
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Escreva aqui uma mensagem maneira para mandar para os colegas.."
            variant="filled"
            InputProps={{
              disableUnderline: true,
              sx: { borderRadius: '999px', backgroundColor: 'background.paper', px: '16px' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onSend} sx={{ color: 'primary.dark' }}>
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
};

export function RoomSidebar({ suggestedRooms, roomId, onNavigate }: RoomSidebarProps) {
  return (
    <Stack spacing={'12px'}>
      {suggestedRooms.map((room) => {
        const isSelected = room.id === roomId;

        return (
          <Box
            key={room.id}
            onClick={() => onNavigate(room.id)}
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
                label={`${room.members} devs`}
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
