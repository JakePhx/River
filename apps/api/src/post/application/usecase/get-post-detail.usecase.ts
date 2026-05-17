import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

import type { CommentRepoPort } from '../port/comment.repo.port';
import type { PostRepoPort } from '../port/post.repo.port';
import { CommentEntityDTOMapperPort } from '../port/comment.mapper.port';
import { PostEntityDTOMapperPort } from '../port/post.mapper.port';

import { PostId } from '@/post/domain/post-id.vo';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { PostIdInvalidError, PostNotFoundError } from '@/post/domain/errors';
import { GetPostDetailResponseDTO } from '@social/shared';

@Injectable()
export class GetPostDetailUseCase {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly postRepo: PostRepoPort,
    @Inject(TOKENS.COMMENT_REPO)
    private readonly commentRepo: CommentRepoPort,
  ) {}

  async execute(
    _viewerId: UserId,
    rawPostId: string,
  ): Promise<GetPostDetailResponseDTO> {
    if (!PostId.isValid(rawPostId)) {
      throw new PostIdInvalidError();
    }

    const post = await this.postRepo.findById(rawPostId);
    if (!post) {
      throw new PostNotFoundError();
    }

    const comments = await this.commentRepo.findByPostId(rawPostId);

    return {
      post: PostEntityDTOMapperPort.toDTO(post),
      comments: comments.map((c) => CommentEntityDTOMapperPort.toDTO(c)),
    };
  }
}
