import type { PostId, UserId } from '@/_shared/application/models/ids';

// Backend-only record
export type PostRecord = {
  id: PostId;
  authorId: UserId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

// Application input models
export type CreatePostInput = {
  content: string;
};
