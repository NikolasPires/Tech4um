import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL as string | undefined) ?? '';

export type RoomParticipantResponse = {
  user_id: number;
  room_id: number;
  name: string;
  username: string;
  email: string;
  is_creator: boolean;
};

export type RoomMessageResponse = {
  id: number;
  room_id: number;
  user_id: number;
  recipient_id: number | null;
  message: string;
  image_url: string | null;
  message_metadata: Record<string, unknown> | null;
  created_at: string;
  author_name: string;
  recipient_name: string | null;
};

export type RoomDetail = {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorId: number;
  featured: boolean;
  size: 'large' | 'small';
};

const roomDetailQueryKey = (roomId: number) => ['room', roomId];
const roomParticipantsQueryKey = (roomId: number) => ['roomParticipants', roomId];
const roomMessagesQueryKey = (roomId: number) => ['roomMessages', roomId];

const computeRoomSize = (title: string, description: string) => {
  const titleLength = title.trim().length;
  const hasDescription = Boolean(description.trim());

  if (!hasDescription && (titleLength > 30 || titleLength < 15)) {
    return 'small' as const;
  }

  return 'large' as const;
};

const mapRoomToDetail = (room: {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string;
  featured?: boolean;
}) => ({
  id: String(room.id),
  title: room.name,
  description: room.description ?? '',
  creator: `Usuário ${room.created_by}`,
  creatorId: room.created_by,
  featured: room.featured ?? false,
  size: computeRoomSize(room.name, room.description ?? ''),
});

const getRoomUrl = (roomId: number) => `${API_BASE_URL}/chat/rooms/${roomId}`;

export function useRoom(roomId: number) {
  return useQuery<RoomDetail>({
    queryKey: roomDetailQueryKey(roomId),
    enabled: !Number.isNaN(roomId),
    queryFn: async () => {
      const response = await fetch(getRoomUrl(roomId), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar sala');
      }

      const data = await response.json();
      return mapRoomToDetail(data);
    },
  });
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export function useRoomParticipants(roomId: number) {
  return useQuery<RoomParticipantResponse[]>({
    queryKey: roomParticipantsQueryKey(roomId),
    enabled: !Number.isNaN(roomId),
    queryFn: async () => {
      const response = await fetch(`${getRoomUrl(roomId)}/participants`, {
        headers: getAuthHeaders() as HeadersInit,
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar participantes');
      }

      return (await response.json()) as RoomParticipantResponse[];
    },
  });
}

export function useRoomMessages(roomId: number) {
  return useQuery<RoomMessageResponse[]>({
    queryKey: roomMessagesQueryKey(roomId),
    enabled: !Number.isNaN(roomId),
    queryFn: async () => {
      const response = await fetch(`${getRoomUrl(roomId)}/messages`, {
        headers: getAuthHeaders() as HeadersInit,
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar mensagens');
      }

      return (await response.json()) as RoomMessageResponse[];
    },
  });
}

export function useAddRoomParticipant() {
  const queryClient = useQueryClient();

  return useMutation<RoomParticipantResponse, unknown, { roomId: number; userId: number }>({
    mutationFn: async ({ roomId, userId }: { roomId: number; userId: number }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${getRoomUrl(roomId)}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar participante');
      }

      return (await response.json()) as RoomParticipantResponse;
    },
    onSuccess: (_participant: RoomParticipantResponse, variables: { roomId: number; userId: number }) => {
      queryClient.invalidateQueries({
        queryKey: roomParticipantsQueryKey(variables.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: ['rooms'],
      });
    },
  });
}

export function useCreateRoomMessage() {
  const queryClient = useQueryClient();

  return useMutation<RoomMessageResponse, unknown, { roomId: number; message: string; recipientId?: number }>({
    mutationFn: async ({ roomId, message, recipientId }: { roomId: number; message: string; recipientId?: number }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const payload: Record<string, unknown> = {
        room_id: roomId,
        message,
      };

      if (recipientId !== undefined) {
        payload.recipient_id = recipientId;
      }

      const response = await fetch(`${getRoomUrl(roomId)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }

      return (await response.json()) as RoomMessageResponse;
    },
    onSuccess: (_message: RoomMessageResponse, variables: { roomId: number; message: string; recipientId?: number }) => {
      queryClient.invalidateQueries({
        queryKey: roomMessagesQueryKey(variables.roomId),
      });
    },
  });
}
