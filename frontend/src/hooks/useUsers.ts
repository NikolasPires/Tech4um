import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL as string | undefined) ?? '';
const usersQueryKey = ['users'];

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  username: string;
};

export function useUsersGet() {
  return useQuery<UserProfile[]>({
    queryKey: usersQueryKey,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }

      return (await response.json()) as UserProfile[];
    },
  });
}

export function useUser(userId: number | string) {
  return useQuery<UserProfile>({
    queryKey: [...usersQueryKey, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar usuário');
      }

      return (await response.json()) as UserProfile;
    },
  });
}
