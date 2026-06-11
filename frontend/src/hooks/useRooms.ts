import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoomCardData } from '../components/RoomCard';

const roomsQueryKey = ['rooms'];

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL as string | undefined) ?? '';

type BackendRoom = {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string;
};

const computeRoomSize = (room: Pick<RoomCardData, 'title' | 'description'>) => {
  const titleLength = room.title.trim().length;
  const hasDescription = Boolean(room.description && room.description.trim());

  if (!hasDescription && (titleLength > 30 || titleLength < 15)) {
    return 'small' as const;
  }

  return 'large' as const;
};

const mapRoomFromBackend = (room: BackendRoom): RoomCardData => ({
  id: String(room.id),
  title: room.name,
  createdBy: room.created_by,
  members: 0,
  description: room.description ?? '',
  featured: new Date(room.created_at).getTime() >= Date.now() - 24 * 60 * 60 * 1000,
  size: computeRoomSize({ title: room.name, description: room.description ?? '' }),
});

const getRoomsUrl = () => `${API_BASE_URL}/chat/rooms`;

export function useRoomsGet() {
  return useQuery<RoomCardData[]>({
    queryKey: roomsQueryKey,
    queryFn: async () => {
      const response = await fetch(getRoomsUrl(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar salas');
      }

      const data = (await response.json()) as BackendRoom[];
      return data.map(mapRoomFromBackend);
    },
  });
}

export function useRoomsPost() {
  const queryClient = useQueryClient();

  return useMutation<RoomCardData, unknown, RoomCardData>({
    mutationFn: async (roomData) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const payload = {
        name: roomData.title,
        description: roomData.description,
      };

      const response = await fetch(getRoomsUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const data = (await response.json()) as BackendRoom;
      return mapRoomFromBackend(data);
    },
    onSuccess: (room) => {
      queryClient.setQueryData<RoomCardData[]>(roomsQueryKey, (currentRooms) => [room, ...(currentRooms ?? [])]);
    },
  });
}
