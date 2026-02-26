export type UserResponseDTO = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  username: string;
  role: string;
  isPrivate: boolean;
  isActive: boolean;
  postCount: number;
  followersCount: number;
  followingCount: number;
  profile?: {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    title?: string;
    company?: string;
    bio?: string;
    gender?: string;
    website?: string;
    birthDate?: Date;
    location?: string;
    avatarUrl?: string;
    contact?: string;
  };
};

export class ListUsersResponseDTO {
  items: UserResponseDTO[];
  take: number;
  nextCursor: string | null;
}
