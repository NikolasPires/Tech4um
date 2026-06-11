import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ArrowForward } from '@mui/icons-material';

import RoomCardComponent, { RoomCardData as RoomCardDataType } from '../components/RoomCard';
import AppHeader from '../components/AppHeader';
import CreateRoomModal from '../components/CreateRoomModal';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useRoomsGet, useRoomsPost } from '../hooks/useRooms';
import { useUsersGet } from '../hooks/useUsers';

const layoutMap = {
  large: { xs: 12, md: 6 },
  small: { xs: 12, md: 3 },
};

function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const { data: rooms = [], isLoading } = useRoomsGet();
  const { data: users = [] } = useUsersGet();

  const createRoomMutation = useRoomsPost();

  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const skeletonItems = useMemo<number[]>(() => [1, 2, 3, 4], []);

  const roomsWithCreators = useMemo(() => {
    return rooms.map((room) => {
      const creator = users.find(
        (user) => user.id === room.createdBy
      );

      return {
        ...room,
        creator: creator?.name ?? `Usuário ${room.createdBy}`,
      };
    });
  }, [rooms, users]);

  const handleCreate = (room: RoomCardDataType) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    createRoomMutation.mutate(room);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', paddingBottom: 4 }}>
      <AppHeader
        title="Seu fórum sobre tecnologia!"
        subtitle="Descubra e participe de salas ativas ou crie a sua própria"
        user={user}
        isLoading={authLoading}
        onLogin={() => setIsAuthOpen(true)}
        onLogout={logout}
      />

      <Container maxWidth="xl">
        <Box sx={{ mb: 4, px: { xs: 0, md: 1 } }}>
          <Typography
            variant="titleLarge"
            sx={{
              fontWeight: 300,
              mb: 1,
              color: 'gray.main',
              fontFamily: 'Poppins',
            }}
          >
            Opa!
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'gray.main',
              fontFamily: 'Poppins',
            }}
          >
            Sobre o que gostaria de falar hoje?
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Em busca de uma sala? Encontre-a aqui 🔎"
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'gray.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '24px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'gray.light',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ marginLeft: { xs: 0, md: -10 } }}
            >
              <Button
                variant="contained"
                sx={{
                  minHeight: 56,
                  borderRadius: '20px',
                  bgcolor: 'primary.dark',
                }}
              >
                <ArrowForward fontSize="small" />
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!isAuthenticated) {
                    setIsAuthOpen(true);
                    return;
                  }

                  setIsCreateOpen(true);
                }}
                sx={{
                  minHeight: 44,
                  borderRadius: '20px',
                  bgcolor: 'primary.dark',
                }}
              >
                Ou crie seu próprio 4um
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {isLoading &&
            skeletonItems.map((_, index) => (
              <Grid item xs={12} md={layoutMap.large.md} key={`skeleton-${index}`}>
                <Card
                  elevation={0}
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: '0px 14px 40px rgba(0, 0, 0, 0.06)',
                    minHeight: 220,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Skeleton width={150} height={24} />
                      <Skeleton width="80%" height={32} />
                      <Skeleton width="60%" height={20} />
                      <Skeleton width="100%" height={84} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}

          {!isLoading &&
            roomsWithCreators
              .filter((r) => {
                if (!query) return true;

                const q = query.toLowerCase();

                return (
                  r.title.toLowerCase().includes(q) ||
                  r.description.toLowerCase().includes(q) ||
                  r.creator.toLowerCase().includes(q)
                );
              })
              .map((room) => {
                const { md } = layoutMap[room.size];

                return (
                  <Grid item xs={12} md={md} key={room.id}>
                    <RoomCardComponent room={room} />
                  </Grid>
                );
              })}
        </Grid>

        <CreateRoomModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
        />

        <AuthModal
          open={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      </Container>
    </Box>
  );
}

export default DashboardPage;