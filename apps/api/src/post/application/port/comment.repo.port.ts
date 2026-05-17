import type { CommentEntity } from '@/post/domain/comment.entity';

export interface CommentRepoPort {
  create(comment: CommentEntity): Promise<void>;
  findById(id: string): Promise<CommentEntity | null>;
  findByPostId(postId: string): Promise<CommentEntity[]>;
}
