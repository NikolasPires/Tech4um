import { AppBar, Avatar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { User } from '../contexts/AuthContext';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  user: User | null;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export default function AppHeader({ title, subtitle, user, isLoading, onLogin, onLogout }: AppHeaderProps) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((segment) => segment[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const avatarColors = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
    '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
    '#6A5ACD', '#20B2AA', '#FF7F50', '#9370DB'
  ];

  const stringToColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4, py: 2, boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', px: { xs: 0, md: 2 } }}>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <img src="/Logo.png" alt="Logo" style={{ height: '44px', width: '92px' }} />
            <Typography variant="labelLarge" sx={{ color: 'gray.main', fontWeight: 300 }}>
              Seu fórum sobre tecnologia!
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            {user ? (
              <>
                <Box textAlign="left" sx={{
                  display: { xs: 'none', md: 'block' }
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray.main' }}>
                    {user.email}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: stringToColor(user.name), cursor: 'pointer' }}>
                  {getInitials(user.name)}
                </Avatar>
                <Button onClick={onLogout} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                  Sair
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={onLogin}
                sx={{ bgcolor: 'primary.dark', borderRadius: '20px' }}
                disabled={isLoading}
              >
                Entrar
              </Button>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
