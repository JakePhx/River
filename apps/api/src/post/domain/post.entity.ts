import { UserId } from '@/user/domain/value-object/user-id.vo';
import { PostId } from './post-id.vo';
import { UserEntity } from '@/user/domain/entity/user.entity';
import {
  PostAttachmentEntity,
  type PostAttachmentKind,
} from './post-attachment.entity';
import { assertPostAttachmentsPolicy } from './post.rules';

export type UpdatePostProps = {
  content: string;
};

export type CreatePostAttachmentInput = {
  url: string;
  contentType: string;
  byteSize: number;
  kind: PostAttachmentKind;
};

export class PostEntity {
  constructor(
    public readonly id: PostId,
    public readonly authorId: UserId,
    public content: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly attachments: readonly PostAttachmentEntity[],
    public author?: UserEntity,
  ) {}

  static create(params: {
    author: UserEntity;
    content: string;
    attachments?: CreatePostAttachmentInput[];
  }) {
    const raw = params.attachments ?? [];
    assertPostAttachmentsPolicy(
      raw.map((a) => ({
        byteSize: a.byteSize,
        kind: a.kind,
      })),
    );

    const attachments = raw.map((a, position) =>
      PostAttachmentEntity.createNew({
        url: a.url,
        contentType: a.contentType,
        byteSize: a.byteSize,
        kind: a.kind,
        position,
      }),
    );

    return new PostEntity(
      PostId.create(),
      params.author.id,
      params.content,
      new Date(),
      new Date(),
      attachments,
      params.author,
    );
  }

  static rehydrate(params: {
    id: string;
    authorId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    attachments?: PostAttachmentEntity[];
    author?: UserEntity;
  }) {
    return new PostEntity(
      PostId.from(params.id),
      UserId.from(params.authorId),
      params.content,
      params.createdAt,
      params.updatedAt,
      params.attachments ?? [],
      params.author,
    );
  }

  update(params: UpdatePostProps) {
    this.content = params.content;
    this.updatedAt = new Date();
  }
}
