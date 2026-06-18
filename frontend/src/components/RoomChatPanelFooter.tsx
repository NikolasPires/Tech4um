import React from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import { Participant } from './RoomParticipantsPanel';
import EmojiPicker from './EmojiPicker';
import { formatName } from '../utils/chatUtils';

type RoomChatPanelFooterProps = {
  draft: string;
  onInputChange: (value: string) => void;
  onSendClick: () => void;
  isPrivateMode: boolean;
  selectedRecipient: Participant | null;
  onCancelPrivate: () => void;
};

export function RoomChatPanelFooter({
  draft,
  onInputChange,
  onSendClick,
  isPrivateMode,
  selectedRecipient,
  onCancelPrivate,
}: RoomChatPanelFooterProps) {
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendClick();
    }
  };

  return (
    <Box
      sx={{
        px: '24px',
        py: '16px',
        bgcolor: isPrivateMode ? 'secondary.dark' : 'primary.dark',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        flexShrink: 0,
      }}
    >
      <Stack spacing={'16px'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={'8px'}>
          <Box gap={1} display="flex" alignItems="center">
            <Typography variant="labelSmall" sx={{ color: 'primary.contrastText' }}>
              {isPrivateMode && selectedRecipient
                ? `Enviando privado para ${formatName(selectedRecipient.name)}`
                : 'Enviando para todos do 4um'}
            </Typography>
            {isPrivateMode && (
              <Button
                variant="text"
                onClick={onCancelPrivate}
                sx={{ color: 'primary.contrastText', textTransform: 'none', p: 0 }}
              >
                <Typography variant="labelSmall" sx={{ textDecoration: 'underline' }}>
                  Cancelar envio privado
                </Typography>
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <EmojiPicker onEmojiSelect={(emoji) => onInputChange(draft + emoji)} />
            <IconButton
              size="small"
              sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <InsertPhotoOutlinedIcon />
            </IconButton>
          </Box>
        </Stack>

        <TextField
          fullWidth
          value={draft}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva aqui uma mensagem maneira para mandar para os colegas.."
          variant="filled"
          InputProps={{
            disableUnderline: true,
            sx: {
              borderRadius: '999px',
              backgroundColor: 'background.paper',
              px: '16px',
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
              },
              '&:hover': {
                backgroundColor: 'background.paper',
              },
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onSendClick} sx={{ color: 'primary.dark' }}>
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Box>
  );
}

export default RoomChatPanelFooter;
