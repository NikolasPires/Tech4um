import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        setLoginEmail('');
        setLoginPassword('');
        onClose();
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (registerPassword !== registerPasswordConfirm) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      await register(registerName, registerUsername, registerEmail, registerPassword);
      setRegisterName('');
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterPasswordConfirm('');
      onClose();
    } catch (err: any) {
      console.log(err)
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setIsLogin(true);
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterUsername('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterPasswordConfirm('');
    onClose();
  };

  console.log(error)

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isLogin ? 'Entrar no 4um' : 'Criar uma conta'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
              />
              <TextField
                label="Senha"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
              />
            </Stack>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Não tem uma conta?{' '}
              </Typography>
              <Link
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                sx={{ cursor: 'pointer', textDecoration: 'underline', color: 'primary.dark', fontWeight: 700 }}
              >
                Crie uma aqui
              </Link>
            </Box>

            <DialogActions sx={{ mt: 3, gap: 1 }}>
              <Button onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="contained" type="submit" sx={{ bgcolor: 'primary.dark' }} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
              </Button>
            </DialogActions>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Nome completo"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
              />
              <TextField
                label="Nome de usuário"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
                helperText="Será usado para identificar você no fórum"
              />
              <TextField
                label="Email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
              />
              <TextField
                label="Senha"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
              />
              <TextField
                label="Confirmar senha"
                type="password"
                value={registerPasswordConfirm}
                onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                fullWidth
                required
                disabled={isLoading}
              />
            </Stack>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Já tem uma conta?{' '}
              </Typography>
              <Link
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                sx={{ cursor: 'pointer', textDecoration: 'underline', color: 'primary.dark', fontWeight: 700 }}
              >
                Faça login
              </Link>
            </Box>

            <DialogActions sx={{ mt: 3, gap: 1 }}>
              <Button onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="contained" type="submit" sx={{ bgcolor: 'primary.dark' }} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Criar conta'}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
