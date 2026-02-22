export interface UserReadRepoPort {
  getMe(userId: string): Promise<{
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'ADMIN';
    isPrivate: boolean;
    isActive: boolean;
    postCount: number;
    followersCount: number;
    followingCount: number;
  } | null>;

  setPrivacy(userId: string, isPrivate: boolean): Promise<void>;
}
