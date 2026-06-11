import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Chip, Grid, Typography, useTheme } from '@mui/material';

export type RoomCardData = {
  id: string;
  title: string;
  creator: string;
  members: number;
  description: string;
  featured: boolean;
  size: 'large' | 'small';
};

export default function RoomCard({ room }: { room: RoomCardData }) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      onClick={() => navigate(`/room/${room.id}`)}
      sx={{
        cursor: 'pointer',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: '0px 14px 40px rgba(0, 0, 0, 0.06)',
        minHeight: room.size === 'large' ? 260 : 180,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0px 18px 45px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardContent
        sx={{
          p: room.size === 'large' ? 3 : 2.5,
          pb: 1,
          flexGrow: 1,
          minHeight: room.size === 'large' ? 260 : 180,
        }}
      >
        <Grid
          container
          direction="column"
          spacing={1}
          justifyContent="space-between"
          sx={{ minHeight: room.size === 'large' ? 260 : 180 }}
        >
          <Grid item>
            {room.featured && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.warning.main,
                  fontWeight: 700,
                  mb: 1,
                  display: 'block',
                  fontStyle: 'italic',
                  fontSize: 16,
                }}
              >
                Tópico em destaque!
              </Typography>
            )}
            <Typography
              variant="labelLarge"
              sx={{
                color: 'primary.dark',
                fontWeight: 700,
                mb: 1.5,
                fontSize: 28,
                ...(room.size === 'small'
                  ? {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '185px',
                    }
                  : { wordBreak: 'break-word' }),
              }}
            >
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
          <Grid item sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0 }}>
            <Typography sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: 14 }}>
              Criado por: <strong>{room.creator}</strong>
            </Typography>
            <Box sx={{ p: 0 }}>
              <Chip
                label={`+${room.members}`}
                clickable={false}
                sx={{
                  height: 35,
                  borderRadius: '40%',
                  minWidth: 41,
                  px: 1.5,
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
