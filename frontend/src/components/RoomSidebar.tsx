import { Box, Chip, Stack, Typography } from '@mui/material';
import { People } from '@mui/icons-material';
import { useAddRoomParticipant } from '../hooks/useRoom';
import { useAuth } from '../contexts/AuthContext';

export type SuggestedRoom = {
  id: string;
  title: string;
  creator: string;
  members: number;
};

type RoomSidebarProps = {
  suggestedRooms: SuggestedRoom[];
  roomId: string;
  onNavigate: (roomId: string) => void;
  onError?: (message: string) => void;
};

export function RoomSidebar({
  suggestedRooms,
  roomId,
  onNavigate,
  onError,
}: RoomSidebarProps) {
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

export default RoomSidebar;
