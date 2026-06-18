import {
  Avatar,
  Box,
  Badge,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../contexts/AuthContext';

export type Participant = {
  user_id: number;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
};

type RoomParticipantsPanelProps = {
  participants: Participant[];
  onSelectRecipient: (name: string) => void;
};

export function RoomParticipantsPanel({
  participants,
  onSelectRecipient,
}: RoomParticipantsPanelProps) {
  const user = useAuth().user;
  
  const sortedParticipants = [...participants].sort((a, b) => {
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
        height: { xs: 'auto', md: '75vh' },
        display: 'flex',
        flexDirection: 'column',
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
          {sortedParticipants.map((participant) => (
            <Tooltip
              key={participant.user_id}
              title={user?.id !== participant.user_id ? `Enviar mensagem para ${participant.name}` : undefined}
              placement="top"
              arrow
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={'16px'}
                onClick={() => user?.id !== participant.user_id && onSelectRecipient(participant.name)}
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

export default RoomParticipantsPanel;
