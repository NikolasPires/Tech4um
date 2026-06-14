// hooks/useRoomSocket.ts

import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL as string | undefined) ?? '';

export type SocketMessage = {
  event: 'new_message' | 'user_joined' | 'user_left' | 'user_typing';
  id?: number;
  room_id?: number;
  sender_id?: number;
  recipient_id?: number | null;
  user_id?: number;
  username?: string;
  message?: string;
  created_at?: string;
  is_typing?: boolean;
};

type SendMessagePayload = {
  message: string;
  recipient_id?: number | null;
};

type SendTypingPayload = {
  is_typing: boolean;
  recipient_id?: number | null;
};

export function useRoomSocket(
  roomId: number,
) {
  const socketRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);

  const [messages, setMessages] = useState<SocketMessage[]>([]);

  const connect = useCallback(() => {
    const wsUrl = API_BASE_URL
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const socket = new WebSocket(
      `${wsUrl}/chat/ws/rooms/${roomId}?token=${encodeURIComponent(token)}`,
    );

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onmessage = (event) => {
      const data: SocketMessage = JSON.parse(event.data);

      setMessages((current) => [...current, data]);
    };

    socketRef.current = socket;
  }, [roomId]);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      if (!socketRef.current) return;

      if (socketRef.current.readyState !== WebSocket.OPEN) return;

      socketRef.current.send(
        JSON.stringify({
          message: payload.message,
          recipient_id: payload.recipient_id ?? null,
        }),
      );
    },
    [],
  );

  const sendTypingStatus = useCallback(
    (payload: SendTypingPayload) => {
      if (!socketRef.current) return;
      if (socketRef.current.readyState !== WebSocket.OPEN) return;

      socketRef.current.send(
        JSON.stringify({
          event: 'typing_status',
          is_typing: payload.is_typing,
          recipient_id: payload.recipient_id ?? null,
        }),
      );
    },
    [],
  );

  useEffect(() => {
  if (!roomId) return;

  connect();

  return () => {
    disconnect();
  };
}, [roomId, connect, disconnect]);

  return {
    connected,
    messages,
    sendMessage,
    sendTypingStatus,
    disconnect,
  };
}