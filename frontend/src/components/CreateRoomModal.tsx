import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  MenuItem,
} from '@mui/material';
import { RoomCardData } from './RoomCard';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (room: RoomCardData) => void;
};

export default function CreateRoomModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<RoomCardData['size']>('small');
  const [featured, setFeatured] = useState(false);

  function handleCreate() {
    if (!title.trim() || !creator.trim()) return;

    const room: RoomCardData = {
      id: `${title.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: title.trim(),
      creator: creator.trim(),
      members: 1,
      description: description.trim(),
      featured,
      size,
    };

    onCreate(room);
    setTitle('');
    setCreator('');
    setDescription('');
    setSize('small');
    setFeatured(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Criar 4um</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="Criador" value={creator} onChange={(e) => setCreator(e.target.value)} fullWidth />
          <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />
          <TextField select label="Tamanho" value={size} onChange={(e) => setSize(e.target.value as any)}>
            <MenuItem value="large">Large</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="small">Small</MenuItem>
          </TextField>
          <FormControlLabel control={<Switch checked={featured} onChange={(e) => setFeatured(e.target.checked)} />} label="Em destaque" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleCreate}>Criar</Button>
      </DialogActions>
    </Dialog>
  );
}
