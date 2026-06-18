import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import type { RoomCardData } from './RoomCard';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (room: RoomCardData) => void;
};

export default function CreateRoomModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    if (!title.trim()) {
      setError('Nome da sala é obrigatório');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Simular um objeto RoomCardData para passar ao hook
    // O hook vai fazer o POST real
    const roomData: RoomCardData = {
      id: '',
      title: title.trim(),
      createdBy: 0,
      creator: '',
      members: 0,
      description: description.trim(),
      featured: false,
      size: 'large',
    };

    // Chamar onCreate que dispara o mutate do useRoomsPost
    try {
      onCreate(roomData);
      setTitle('');
      setDescription('');
      setIsLoading(false);
      onClose();
    } catch (err) {
      setError('Erro ao criar sala');
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    setError(null);
    setTitle('');
    setDescription('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Criar 4um</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: error ? 1 : 2 }}>
          <TextField
            label="Nome da sala"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            disabled={isLoading}
            placeholder="Ex: React Lovers"
          />
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={isLoading}
            placeholder="Descreva o tema principal da sua sala..."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: 'primary.dark' }} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
