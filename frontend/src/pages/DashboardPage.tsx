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
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import RoomCardComponent from '../components/RoomCard';
import AppHeader from '../components/AppHeader';
import CreateRoomModal from '../components/CreateRoomModal';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useRoomsGet, useRoomsPost } from '../hooks/useRooms';
import { useUsersGet } from '../hooks/useUsers';

function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { data: rooms = [], isLoading } = useRoomsGet();
  const { data: users = [] } = useUsersGet();
  const createRoomMutation = useRoomsPost();

  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('warning');

  const skeletonItems = useMemo<number[]>(() => [1, 2, 3, 4], []);

  const roomsWithCreators = useMemo(() => {
    return rooms.map((room) => {
      const creator = users.find((u) => u.id === room.createdBy);
      return {
        ...room,
        creator: creator?.name ?? `Usuário ${room.createdBy}`,
      };
    });
  }, [rooms, users]);

  const handleCreate = (room: any) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      setToastSeverity('warning');
      setToastMessage('Você precisa estar logado para criar uma sala.');
      return;
    }
    createRoomMutation.mutate(room, {
      onSuccess: () => {
        setToastSeverity('success');
        setToastMessage('Sala criada com sucesso! 🚀');
        setIsCreateOpen(false);
      },
      onError: (error: any) => {
        setToastSeverity('error');
        setToastMessage(`Erro ao criar sala: ${error.message || 'tente novamente.'}`);
      }
    });
  };

  const filteredRooms = useMemo(() => {
    return roomsWithCreators.filter((r) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.creator.toLowerCase().includes(q)
      );
    });
  }, [roomsWithCreators, query]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingBottom: 6 }}>
      <AppHeader
        title="Seu fórum sobre tecnologia!"
        subtitle="Descubra e participe de salas ativas ou crie a sua própria"
        user={user}
        isLoading={authLoading}
        onLogin={() => setIsAuthOpen(true)}
        onLogout={logout}
      />

      <Container maxWidth="xl">
        {/* Seção de Boas-Vindas */}
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5, color: '#5f6368', fontFamily: 'Poppins' }}>
            Opa!
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#202124', fontFamily: 'Poppins' }}>
            Sobre o que gostaria de falar hoje?
          </Typography>
        </Box>

        {/* Barra de Pesquisa e Botões */}
        <Grid container spacing={2} sx={{ mb: 5, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Grid item xs={12} md={7} lg={8}>
            <TextField
              fullWidth
              placeholder="Em busca de uma sala? Encontre-a aqui 🔎"
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '100px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '100px',
                  px: 2,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={4} lg={3} display="flex" justifyContent="flex-end">
            <Button
              fullWidth
              variant="contained"
              onClick={() => (!isAuthenticated ? setIsAuthOpen(true) : setIsCreateOpen(true))}
              sx={{
                height: 56,
                px: 4,
                borderRadius: '18px',
                bgcolor: '#1565c0',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              Ou crie seu próprio 4um
            </Button>
          </Grid>
        </Grid>

        {/* Grid de Cards */}
        {isLoading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {skeletonItems.map((_, index) => (
              <Card
                key={`skeleton-${index}`}
                sx={{
                  borderRadius: '24px',
                  minHeight: 200,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Skeleton width={120} height={20} />
                    <Skeleton width="90%" height={32} />
                    <Skeleton width="100%" height={60} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },

              gap: 3,

              alignItems: 'start',
            }}
          >
            {filteredRooms.map((room) => (
              <Box
                key={room.id}
                sx={{
                  gridColumn: {
                    xs: 'span 1',
                    sm: room.size === 'large' ? 'span 2' : 'span 1',
                  },

                  height: 'fit-content',
                }}
              >
                <RoomCardComponent 
                  room={room} 
                  onAuthRequired={() => {
                    setIsAuthOpen(true);
                    setToastSeverity('warning');
                    setToastMessage('Você precisa estar logado para entrar em uma sala.');
                  }}
                />
              </Box>
            ))}
          </Box>
        )}


        <CreateRoomModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreate} />
        <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
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

export default DashboardPage;