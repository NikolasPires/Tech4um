import { useEffect, useRef } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { Participant } from './RoomParticipantsPanel';
import { SuggestedRoom } from './RoomSidebar';
import RoomChatPanelFooter from './RoomChatPanelFooter';
import { formatName, getGroupLabel } from '../utils/chatUtils';

export type Message = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  isPrivate: boolean;
  recipient?: string;
  self?: boolean;
  created_at?: string;
};

type RoomChatPanelProps = {
  currentUser: string;
  currentRoom: SuggestedRoom;
  visibleMessages: Message[];
  typingUser: string | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isPrivateMode: boolean;
  selectedRecipient: Participant | null;
  onCancelPrivate: () => void;
  onTypingStatusChange: (isTyping: boolean) => void;
};

export function RoomChatPanel({
  currentUser,
  currentRoom,
  visibleMessages,
  typingUser,
  draft,
  onDraftChange,
  onSend,
  isPrivateMode,
  selectedRecipient,
  onCancelPrivate,
  onTypingStatusChange,
}: RoomChatPanelProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const typingTimeoutRef = useRef<any | null>(null);
  const isCurrentlyTypingRef = useRef(false);

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, typingUser]);

  const handleInputChange = (value: string) => {
    onDraftChange(value);

    if (!isCurrentlyTypingRef.current && value.trim().length > 0) {
      isCurrentlyTypingRef.current = true;
      onTypingStatusChange(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (value.trim().length === 0) {
      isCurrentlyTypingRef.current = false;
      onTypingStatusChange(false);
    } else {
      typingTimeoutRef.current = setTimeout(() => {
        isCurrentlyTypingRef.current = false;
        onTypingStatusChange(false);
      }, 2000);
    }
  };

  const handleSendClick = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isCurrentlyTypingRef.current = false;
    onTypingStatusChange(false);
    onSend();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        boxShadow: '0px 14px 40px rgba(0,0,0,0.06)',
        height: { xs: '70vh', md: '75vh' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: '24px', pb: '16px', flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="titleMedium" sx={{ color: 'primary.dark' }}>
            {currentRoom.title}
          </Typography>
          <Typography variant="labelLarge" sx={{ color: 'primary.dark', fontWeight: 300 }}>
            Criado por: <strong>{currentRoom.creator}</strong>
          </Typography>
        </Stack>
      </CardContent>

      <Divider sx={{ flexShrink: 0 }} />

      <Box
        ref={messagesContainerRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: '24px',
          py: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={'16px'} sx={{ width: '100%' }}>
          {(() => {
            let lastGroupLabel = '';
            return visibleMessages.map((message) => {
              const isOwn = message.author === currentUser;
              const isPrivateVisible = message.isPrivate && (message.author === currentUser || message.recipient === currentUser);

              const messageDate = message.created_at ? new Date(message.created_at) : new Date();
              const groupLabel = getGroupLabel(messageDate);
              const showDateHeader = groupLabel !== lastGroupLabel;
              lastGroupLabel = groupLabel;

              return (
                <Box key={message.id} sx={{ width: '100%' }}>
                  {showDateHeader && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: '24px', position: 'relative', alignItems: 'center' }}>
                      <Divider sx={{ position: 'absolute', width: '100%', zIndex: 1 }} />
                      <Chip
                        label={groupLabel}
                        size="small"
                        sx={{
                          bgcolor: 'background.paper',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          color: 'gray.main',
                          fontWeight: 600,
                          fontSize: '12px',
                          px: '12px',
                          zIndex: 2,
                        }}
                      />
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      mt: '8px',
                      width: '100%',
                    }}
                  >
                    <Avatar alt={message.author} src={message.avatar} sx={{ width: '40px', height: '40px' }} />
                    <Box
                      sx={{
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        borderRadius: '12px',
                        p: '16px',
                        boxShadow: '0px 12px 24px rgba(0,0,0,0.04)',
                        width: 'fit-content',
                        maxWidth: { xs: '80%', md: '70%' },
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      <Stack spacing={'4px'}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" gap="16px">
                          <Typography variant="labelMedium" sx={{ fontWeight: 700 }}>
                            {isOwn ? 'Você' : formatName(message.author)}{' '}
                            {message.isPrivate && isPrivateVisible && (
                              <Typography
                                component="span"
                                variant="labelMedium"
                                sx={{ color: isOwn ? 'warning.main' : 'primary.main', fontWeight: 700, ml: '8px' }}
                              >
                                {isOwn
                                  ? `mensagem privada para ${formatName(message.recipient ?? '')}`
                                  : `mensagem privada`}
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="labelSmall" sx={{ color: 'gray.main' }}>
                            {message.time}
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              );
            });
          })()}

          {typingUser && (
            <Card
              elevation={0}
              sx={{
                bgcolor: 'background.default',
                borderRadius: '12px',
                p: '12px',
                border: '1px solid rgba(0,0,0,0.08)',
                width: 'fit-content',
                alignSelf: 'flex-start',
                animation: 'fadeIn 0.3s ease-in-out',
              }}
            >
              <Typography variant="body2" sx={{ color: 'gray.main', fontStyle: 'italic' }}>
                {typingUser} está digitando...
              </Typography>
            </Card>
          )}
        </Stack>
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      <RoomChatPanelFooter
        draft={draft}
        onInputChange={handleInputChange}
        onSendClick={handleSendClick}
        isPrivateMode={isPrivateMode}
        selectedRecipient={selectedRecipient}
        onCancelPrivate={onCancelPrivate}
      />
    </Card>
  );
}

export default RoomChatPanel;
