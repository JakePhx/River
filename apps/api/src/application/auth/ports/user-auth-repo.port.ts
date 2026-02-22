export interface UserAuthRepoPort {
  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    username: string;
    password: string;
    role: 'USER' | 'ADMIN';
    isActive: boolean;
  } | null>;
  findByUsername(username: string): Promise<{
    id: string;
    email: string;
    username: string;
    password: string;
    role: 'USER' | 'ADMIN';
    isActive: boolean;
  } | null>;
  createUser(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<{
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'ADMIN';
  }>;
}
