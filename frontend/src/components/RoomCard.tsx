import React from 'react';
import { Box, Card, CardContent, Chip, Grid, Typography, useTheme } from '@mui/material';

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
        boxShadow: '0px 14px 40px rgba(0, 0, 0, 0.06)',
        minHeight: room.size === 'large' ? 260 : 200,
      }}
    >
      <CardContent sx={{ p: 3, pb: 1, flexGrow: 1, minHeight: room.size === 'large' ? 260 : 200, }} >
        <Grid container direction="column" spacing={1} justifyContent="space-between" sx={{minHeight: room.size === 'large' ? 260 : 200,}}>
          <Grid item>
            {room.featured && (
              <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 700, mb: 1, display: 'block', fontStyle: 'italic', fontSize: 16 }}>
                Tópico em destaque!
              </Typography>
            )}
            <Typography variant="labelLarge" sx={{ color: 'primary.dark', fontWeight: 700, mb: 1.5, wordBreak: 'break-word', fontSize: 28 }}>
              {room.title}
            </Typography>
          </Grid>
          {room.size !== 'small' && (
            <Grid item>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.75 }}>
                {room.description}
              </Typography>
            </Grid>
          )}
          <Grid item direction="row" alignItems="center" sx={{display: 'flex', justifyContent: 'space-between', p: 0 }}>
            <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              Criado por: <strong>{room.creator}</strong>
            </Typography>
            <Box sx={{ p: 3, pt: 0, }}>
            <Chip
              label={`+${room.members}`}
              clickable={false}
              sx={{
                height: 35,
                borderRadius: '40%',
                minWidth: 41,
                padding: '20px',
                px: 0,
                fontWeight: 700,
                backgroundColor: theme.palette.primary.dark,
                color: theme.palette.primary.contrastText,
              }}
            />
          </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
