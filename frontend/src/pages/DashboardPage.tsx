import { useMemo, useState, useCallback } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import SearchBar from '../components/SearchBar';
import RoomCardComponent, { RoomCardData as RoomCardDataType } from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';

interface RoomCardData {
  id: string;
  title: string;
  creator: string;
  members: number;
  description: string;
  featured: boolean;
  size: 'large' | 'medium' | 'small';
}

const mockRooms: RoomCardData[] = [
  {
    id: 'product-development-stuff',
    title: 'product-development-stuff',
    creator: 'Lara Alves',
    members: 115,
    description:
      'Converse sobre processos, ferramentas e melhorias de produto com a equipe.',
    featured: true,
    size: 'large',
  },
  {
    id: 'Designers_na_firma',
    title: 'Designers_na_firma',
    creator: 'Lara Alves',
    members: 96,
    description:
      'Espaço para discutir fluxo, tipografia e layouts que fazem a diferença.',
    featured: true,
    size: 'large',
  },
  {
    id: 'gente-maneira-discutindo-tema-maneiro',
    title: 'gente-maneira-discutindo-tema-maneiro',
    creator: 'Caio Santos',
    members: 115,
    description: 'Debate rápido sobre tecnologias, memes de dev e boas práticas.',
    featured: false,
    size: 'medium',
  },
  {
    id: 'Thinking about...',
    title: 'Thinking about...',
    creator: 'Ana Beatriz',
    members: 28,
    description: 'Ideas e insights rápidos.',
    featured: false,
    size: 'small',
  },
  {
    id: '#segurança',
    title: '#segurança',
    creator: 'Ricardo',
    members: 54,
    description: 'Discussões sobre cibersegurança e melhores práticas.',
    featured: false,
    size: 'small',
  },
  {
    id: 'gamegamegame!',
    title: 'gamegamegame!',
    creator: 'Bianca',
    members: 32,
    description: 'Jogos, devs e conversas leves.',
    featured: false,
    size: 'small',
  },
  {
    id: 'E as férias?...',
    title: 'E as férias?...',
    creator: 'Marina',
    members: 18,
    description: 'Planos, recomendações e histórias de viagens.',
    featured: false,
    size: 'small',
  },
];

function useRoomsQuery() {
  // Local stub to return mock data — keeps dashboard working without react-query version/type issues.
  return { data: mockRooms as RoomCardData[], isLoading: false } as { data: RoomCardData[]; isLoading: boolean };
}

const layoutMap: Record<RoomCardData['size'], { xs: number; md: number }> = {
  large: { xs: 12, md: 7 },
  medium: { xs: 12, md: 5 },
  small: { xs: 12, md: 3 },
};

// Use extracted RoomCard component

function DashboardPage() {
  const { data: initialRooms } = useRoomsQuery() as { data?: RoomCardData[]; isLoading: boolean };
  const [rooms, setRooms] = useState<RoomCardData[]>(initialRooms ?? mockRooms);
  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const skeletonItems = useMemo<number[]>(() => [1, 2, 3, 4, 5, 6, 7], []);

  const handleSearch = useCallback((value: string) => setQuery(value), []);

  const handleCreate = (room: RoomCardDataType) => {
    setRooms((s) => [room, ...s]);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F7FA', py: 4 }}>
      <Container maxWidth="xl">
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4 }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', px: { xs: 0, md: 2 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ color: '#0B6BCB', fontWeight: 900, textTransform: 'lowercase' }}>
                tech4um
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Seu fórum sobre tecnologia!
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Box textAlign="right">
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                  Lara Alves
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  lara.alves@example.com
                </Typography>
              </Box>
              <Avatar alt="Lara Alves" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=400&amp;q=80" />
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ mb: 4, px: { xs: 0, md: 1 } }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#111827' }}>
            Opa!
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
            Sobre o que gostaria de falar hoje?
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Em busca de uma sala? Encontre-a aqui 🔎"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6B7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E5E7EB',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                fullWidth
                variant="contained"
                sx={{ minHeight: 56, borderRadius: '20px' }}
                endIcon={<SearchIcon />}
              >
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ minHeight: 56, borderRadius: '20px' }}
              >
                Ou crie seu próprio 4um
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {skeletonItems && (
            // show skeletons only momentarily; initial data is local so no loading
            skeletonItems.map((_, index) => (
              <Grid item xs={12} md={layoutMap.large.md} key={`skeleton-${index}`}>
                <Card elevation={0} sx={{ backgroundColor: '#FFFFFF', borderRadius: 1, boxShadow: '0px 14px 40px rgba(15, 23, 42, 0.06)', minHeight: 220 }}>
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
            ))
          )}

          {(rooms ?? [])
            .filter((r) => {
              if (!query) return true;
              const q = query.toLowerCase();
              return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.creator.toLowerCase().includes(q);
            })
            .map((room) => {
              const { xs, md } = layoutMap[room.size];

              return (
                <Grid item xs={12} md={md} key={room.id}>
                  <RoomCardComponent room={room} />
                </Grid>
              );
            })}
        </Grid>

        <CreateRoomModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreate} />
      </Container>
    </Box>
  );
}

export default DashboardPage;
