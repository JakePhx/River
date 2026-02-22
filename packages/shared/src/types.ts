export type AuthUser = { id: string; email: string; username: string };

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type Post = {
  id: string;
  authorId: string;
  authorUsername?: string;
  content: string;
  createdAt: string;
};

export type SimpleUser = { id: string; username: string };
