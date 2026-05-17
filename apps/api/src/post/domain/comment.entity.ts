import { UserId } from '@/user/domain/value-object/user-id.vo';
import { UserEntity } from '@/user/domain/entity/user.entity';
import { CommentId } from './comment-id.vo';

export class CommentEntity {
  constructor(
    public readonly id: CommentId,
    public readonly postId: string,
    public readonly authorId: UserId,
    public readonly parentId: CommentId | null,
    public content: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public author?: UserEntity,
  ) {}

  static create(params: {
    author: UserEntity;
    postId: string;
    parentId: CommentId | null;
    content: string;
  }): CommentEntity {
    return new CommentEntity(
      CommentId.create(),
      params.postId,
      params.author.id,
      params.parentId,
      params.content,
      new Date(),
      new Date(),
      params.author,
    );
  }

  static rehydrate(params: {
    id: string;
    postId: string;
    authorId: string;
    parentId: string | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author?: UserEntity;
  }): CommentEntity {
    return new CommentEntity(
      CommentId.from(params.id),
      params.postId,
      UserId.from(params.authorId),
      params.parentId ? CommentId.from(params.parentId) : null,
      params.content,
      params.createdAt,
      params.updatedAt,
      params.author,
    );
  }
}
