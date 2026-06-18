import React, { useState } from 'react';
import { Box, IconButton, Popover } from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
  '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
  '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
  '🙏', '✍️', '💅', '🤳', '💪', '🦾', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓',
  '💗', '💖', '💘', '💝', '💻', '🖥️', '📱', '⌨️', '🎧', '🚀',
  '💡', '🔥', '✨', '🎉', '🎈', '📢', '🔔', '💬',
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLButtonElement | null>(null);

  const handleEmojiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEmojiAnchor(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchor(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  const isEmojiOpen = Boolean(emojiAnchor);

  return (
    <>
      <IconButton
        size="small"
        onClick={handleEmojiClick}
        sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
      >
        <InsertEmoticonIcon />
      </IconButton>

      <Popover
        open={isEmojiOpen}
        anchorEl={emojiAnchor}
        onClose={handleEmojiClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 2,
            boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
            maxWidth: '320px',
            maxHeight: '250px',
            overflowY: 'auto',
            overflowX: 'auto',
          },
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5 }}>
          {EMOJIS.map((emoji, index) => (
            <IconButton
              key={index}
              size="small"
              onClick={() => handleEmojiSelect(emoji)}
              sx={{
                fontSize: '24px',
                p: 0.5,
                borderRadius: '8px',
                color: 'initial',
                opacity: 1,
                transition: 'transform 0.1s ease',
                '&:hover': {
                  backgroundColor: 'rgba(23, 153, 246, 0.15)',
                  transform: 'scale(1.25)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              <span style={{ color: 'initial', opacity: 1, filter: 'none' }}>
                {emoji}
              </span>
            </IconButton>
          ))}
        </Box>
      </Popover>
    </>
  );
}

export default EmojiPicker;
