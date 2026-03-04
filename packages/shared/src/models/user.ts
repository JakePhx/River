import type { Role, UserId } from './common';

// DTO (request body - used only at controller layer)
export type UpdatePrivacyDto = {
  isPrivate: boolean;
};

// Response (API output)
export type UserMeRes = {
  id: UserId;
  email: string;
  username: string;
  role: Role;
  isPrivate: boolean;
  isActive: boolean;
  postCount: number;
  followersCount: number;
  followingCount: number;
};

export type UserSummaryRes = {
  id: UserId;
  username: string;
  role: Role;
  isPrivate: boolean;
  isActive: boolean;
  name: string | null;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  postCount: number;
};
