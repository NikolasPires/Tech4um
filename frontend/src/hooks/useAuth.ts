export type User = {
  name: string;
  email: string;
  avatar: string;
};

export function useAuth() {
  return {
    user: {
      name: 'Lara Alves',
      email: 'lara.alves@example.com',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    } as User,
    isAuthenticated: true,
  };
}
