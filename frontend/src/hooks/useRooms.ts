import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoomCardData } from '../components/RoomCard';

const roomsQueryKey = ['rooms'];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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
  creator: `Usuário ${room.created_by}`,
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

export type CreateRoomPayload = Omit<RoomCardData, 'size' | 'featured'> & {
  featured?: boolean;
};

export function useRoomsPost() {
  const queryClient = useQueryClient();

  return useMutation<RoomCardData, unknown, CreateRoomPayload>({
    mutationFn: async (newRoom) => {
      const room: RoomCardData = {
        ...newRoom,
        featured: newRoom.featured ?? false,
        size: computeRoomSize(newRoom),
      };
      return room;
    },
    onSuccess: (room) => {
      queryClient.setQueryData<RoomCardData[]>(roomsQueryKey, (currentRooms) => [room, ...(currentRooms ?? [])]);
    },
  });
}
