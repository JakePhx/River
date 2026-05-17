import type { PostId, UserId } from './common';

// DTO (request body - used only at controller layer)
export type CreatePostDto = {
  content: string;
  attachments?: Array<{
    url: string;
    contentType: string;
    byteSize: number;
    kind: 'image' | 'video';
  }>;
};

// Response (API output)
export type FeedItemRes = {
  id: PostId;
  authorId: UserId;
  username: string;
  content: string;
  createdAt: string; // ISO date string over the wire
};
