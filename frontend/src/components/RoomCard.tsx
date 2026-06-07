import React from 'react';
import { Box, Card, CardContent, Chip, Typography, useTheme } from '@mui/material';

export type RoomCardData = {
  id: string;
  title: string;
  creator: string;
  members: number;
  description: string;
  featured: boolean;
  size: 'large' | 'medium' | 'small';
};

export default function RoomCard({ room }: { room: RoomCardData }) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: '0px 14px 40px rgba(15, 23, 42, 0.06)',
        minHeight: room.size === 'large' ? 260 : 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent sx={{ p: 3, pb: 1, flexGrow: 1 }}>
        {room.featured && (
          <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 800, mb: 1, display: 'block', fontStyle: 'italic' }}>
            Tópico em destaque!
          </Typography>
        )}

        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 800, mb: 1.5, wordBreak: 'break-word' }}>
          {room.title}
        </Typography>


        {room.size !== 'small' && (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.75 }}>
            {room.description}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          {`Criado por: ${room.creator}`} • {room.members} pessoas
        </Typography>
      </CardContent>

      <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <Chip
          label={`+${room.members}`}
          color="primary"
          clickable={false}
          sx={{
            height: 44,
            borderRadius: '50%',
            minWidth: 44,
            px: 0,
            fontWeight: 700,
          }}
        />
      </Box>
    </Card>
  );
}
