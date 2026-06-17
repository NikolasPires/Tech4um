import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)',
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            textAlign: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1799F6 0%, #1772B2 100%)',
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#ffffff',
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                marginBottom: 2,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              <WarningRoundedIcon sx={{ fontSize: 40, color: '#ffffff' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.5px',
                fontFamily: 'Poppins',
              }}
            >
              Algo deu errado por aqui...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                marginTop: 1,
                fontSize: '14px',
                fontFamily: 'Poppins',
              }}
            >
              O Tech4um encontrou um erro inesperado nesta página.
            </Typography>
          </Box>

          <CardContent sx={{ padding: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                marginBottom: 3,
              }}
            >
              <Button
                variant="contained"
                onClick={resetError}
                startIcon={<RefreshIcon />}
                sx={{
                  borderRadius: '16px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  backgroundColor: '#1799F6',
                  boxShadow: '0 4px 12px rgba(23, 153, 246, 0.2)',
                  '&:hover': {
                    backgroundColor: '#1772B2',
                    boxShadow: '0 6px 16px rgba(23, 153, 246, 0.3)',
                  },
                }}
              >
                Tentar Novamente
              </Button>
              <Button
                variant="outlined"
                onClick={handleGoHome}
                startIcon={<HomeIcon />}
                sx={{
                  borderRadius: '16px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  '&:hover': {
                    borderColor: '#94a3b8',
                    backgroundColor: '#f8fafc',
                  },
                }}
              >
                Voltar ao Início
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ErrorBoundaryFallback;
