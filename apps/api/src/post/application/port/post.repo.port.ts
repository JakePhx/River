import type { PostEntity } from '@/post/domain/post.entity';
import { UserId } from '@/user/domain/value-object/user-id.vo';

export interface PostRepoPort {
  create(post: PostEntity): Promise<void>;
  feed(
    userId: UserId,
    pagination?: {
      cursor?: string;
      take?: number;
    },
  ): Promise<{ items: PostEntity[]; nextCursor: string | null }>;
  findByAuthorId(
    authorId: UserId,
    pagination?: {
      cursor?: string;
      take?: number;
    },
  ): Promise<{ items: PostEntity[]; nextCursor: string | null }>;
}
