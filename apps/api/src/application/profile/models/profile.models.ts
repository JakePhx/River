import type { UserId, ProfileId } from '../../_shared/models/ids';

// Backend-only record
export type ProfileRecord = {
  id: ProfileId;
  userId: UserId;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Application input models
export type UpdateProfileInput = {
  name?: string | null;
  avatarUrl?: string | null;
};
