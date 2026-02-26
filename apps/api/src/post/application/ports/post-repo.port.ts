import type { UserId } from '@social/shared';
import type { FeedItemRes } from '@social/shared';
import type { PostRecord } from '../models/post.models';

export interface PostRepoPort {
  createPostTx(
    authorId: UserId,
    content: string,
  ): Promise<Pick<PostRecord, 'id' | 'content' | 'createdAt'>>;
  feed(
    userId: UserId,
    cursor?: string,
    take?: number,
  ): Promise<{ items: FeedItemRes[]; nextCursor: string | null }>;
}
