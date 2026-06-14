import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Chip, Typography, useTheme } from '@mui/material';

export type RoomCardData = {
  id: string;
  title: string;
  createdBy: number;
  creator?: string;
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
        borderRadius: '24px', // Cantos mais arredondados e cleans como na ref
        boxShadow: '0px 14px 40px rgba(0, 0, 0, 0.03)', // Sombra mais sutil
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 20px 45px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <CardContent
        sx={{
          p: 4, // Padding interno generoso para um visual mais clean
          pb: '24px !important',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1,
        }}
      >
        <Box>
          <Box
            sx={{
              height: 16,
              mb: 1,
            }}
          >
          {room.featured && (
            
            <Typography
              variant="caption"
              sx={{
                color: '#ff6b00', // Laranja de destaque da imagem de referência
                fontWeight: 800,
                mb: 1,
                display: 'block',
                fontStyle: 'italic',
                fontSize: 15,
              }}
            >
              Tópico em destaque!
            </Typography>
          )}
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: room.size === 'small' ? '#1976d2' : '#0d47a1',
              fontWeight: 800,
              mb: room.size === 'large' ? 2 : 0,
              fontSize: room.size === 'large' ? 26 : 22,
              wordBreak: 'break-word',
              lineHeight: 1.2,
            }}
          >
            {room.title}
          </Typography>

          {room.size !== 'small' && room.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary, 
                lineHeight: 1.6,
                mb: 3,
                fontSize: 14 
              }}
            >
              {room.description}
            </Typography>
          )}
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mt: room.size === 'small' ? 3 : 0 
          }}
        >
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13 }}>
            Criado por: <strong>{room.creator}</strong>
          </Typography>
          
          <Chip
            label={`+${room.members}`}
            sx={{
              height: 32,
              borderRadius: '16px',
              fontWeight: 700,
              backgroundColor: '#1565c0',
              color: '#fff',
              px: 0.5,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}