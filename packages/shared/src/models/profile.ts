import type { UserId } from './common';

// DTO (request body - used only at controller layer)
export type UpdateProfileDto = {
  name?: string | null;
  avatarUrl?: string | null;
};

// Response (API output)
export type ProfileViewRes = {
  userId: UserId;
  name: string | null;
  avatarUrl: string | null;
};
