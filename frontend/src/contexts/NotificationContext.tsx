import React, { createContext, useContext, useEffect, useRef, useState, PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Button } from '@mui/material';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<any>(null);

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL as string | undefined) ?? '';

export function NotificationProvider({ children }: PropsWithChildren) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [targetRoomId, setTargetRoomId] = useState<number | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    async function connect() {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/chat/notifications/ticket`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          console.error('Failed to fetch notification websocket ticket');
          return;
        }

        const { ticket } = await res.json();

        if (!isMounted) return;

        const wsUrl = API_BASE_URL
          .replace('http://', 'ws://')
          .replace('https://', 'wss://');

        ws = new WebSocket(`${wsUrl}/chat/ws/notifications/${ticket}`);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log('[Notification WS] Connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'private_message_notification') {
              // Parse current roomId from path
              const match = window.location.pathname.match(/\/room\/(\d+)/);
              const currentRoomId = match ? Number(match[1]) : null;

              if (currentRoomId !== data.room_id) {
                // User is not in the room where message was sent, show toast
                setToastMessage(`O usuário ${data.sender_name} lhe enviou uma mensagem privada na sala ${data.room_name}`);
                setTargetRoomId(data.room_id);
                setToastOpen(true);
              }
            }
          } catch (err) {
            console.error('Error parsing notification message', err);
          }
        };

        ws.onclose = () => {
          console.log('[Notification WS] Closed, retrying in 3s...');
          if (isMounted) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error('[Notification WS] Error:', error);
        };

      } catch (err) {
        console.error('Error connecting to notification websocket:', err);
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isAuthenticated, user]);

  const handleClose = () => {
    setToastOpen(false);
  };

  const handleNavigate = () => {
    if (targetRoomId) {
      navigate(`/room/${targetRoomId}`);
      setToastOpen(false);
    }
  };

  return (
    <NotificationContext.Provider value={{}}>
      {children}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity="info"
          sx={{
            width: '100%',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            '& .MuiAlert-icon': {
              color: '#38bdf8',
            },
            '& .MuiAlert-action': {
              paddingTop: 0,
              paddingBottom: 0,
            }
          }}
          action={
            targetRoomId ? (
              <Button
                color="info"
                size="small"
                onClick={handleNavigate}
                sx={{
                  color: '#38bdf8',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  }
                }}
              >
                Ir para sala
              </Button>
            ) : undefined
          }
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used inside NotificationProvider');
  }
  return context;
}
