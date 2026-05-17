import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

import type { CommentRepoPort } from '../port/comment.repo.port';
import type { PostRepoPort } from '../port/post.repo.port';
import { CommentEntityDTOMapperPort } from '../port/comment.mapper.port';
import type { UserRepoPort } from '@/user/application/port/user.repo.port';
import type { PostEventPublisherPort } from '../port/event.publisher.port';

import { CommentEntity } from '@/post/domain/comment.entity';
import { CommentId } from '@/post/domain/comment-id.vo';
import { PostId } from '@/post/domain/post-id.vo';
import {
  CommentIdInvalidError,
  CommentNotFoundError,
  ParentCommentWrongPostError,
  PostIdInvalidError,
  PostNotFoundError,
} from '@/post/domain/errors';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { UserInactiveError, UserNotFoundError } from '@/user/domain/errors';
import { CreateCommentBodyDTO, CreateCommentResponseDTO } from '@social/shared';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly postRepo: PostRepoPort,
    @Inject(TOKENS.COMMENT_REPO)
    private readonly commentRepo: CommentRepoPort,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepoPort,
    @Inject(TOKENS.POST_EVENT_PUBLISHER)
    private readonly postEventPublisher: PostEventPublisherPort,
  ) {}

  async execute(
    viewerId: UserId,
    rawPostId: string,
    dto: CreateCommentBodyDTO,
  ): Promise<CreateCommentResponseDTO> {
    if (!PostId.isValid(rawPostId)) {
      throw new PostIdInvalidError();
    }

    const post = await this.postRepo.findById(rawPostId);
    if (!post) {
      throw new PostNotFoundError();
    }

    const author = await this.userRepo.findById(viewerId);
    if (!author) {
      throw new UserNotFoundError();
    }
    if (!author.isActive) {
      throw new UserInactiveError();
    }

    let parentId: CommentId | null = null;
    if (dto.parentCommentId) {
      if (!CommentId.isValid(dto.parentCommentId)) {
        throw new CommentIdInvalidError();
      }
      const parent = await this.commentRepo.findById(dto.parentCommentId);
      if (!parent) {
        throw new CommentNotFoundError();
      }
      if (parent.postId !== rawPostId) {
        throw new ParentCommentWrongPostError();
      }
      parentId = parent.id;
    }

    const comment = CommentEntity.create({
      author,
      postId: rawPostId,
      parentId,
      content: dto.content.trim(),
    });

    await this.commentRepo.create(comment);

    const postAuthorId = post.authorId.toString();
    const commenterId = viewerId.toString();
    if (postAuthorId !== commenterId) {
      await this.postEventPublisher.publishPostCommentedEvent({
        postId: rawPostId,
        postAuthorId,
        commentAuthorId: commenterId,
        commentId: comment.id.toString(),
      });
    }

    return {
      comment: CommentEntityDTOMapperPort.toDTO(comment),
    };
  }
}
