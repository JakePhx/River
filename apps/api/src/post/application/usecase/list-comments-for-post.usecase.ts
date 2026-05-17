import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

import type { CommentRepoPort } from '../port/comment.repo.port';
import type { PostRepoPort } from '../port/post.repo.port';
import { CommentEntityDTOMapperPort } from '../port/comment.mapper.port';

import { PostId } from '@/post/domain/post-id.vo';
import { PostIdInvalidError, PostNotFoundError } from '@/post/domain/errors';
import { ListCommentsResponseDTO } from '@social/shared';

@Injectable()
export class ListCommentsForPostUseCase {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly postRepo: PostRepoPort,
    @Inject(TOKENS.COMMENT_REPO)
    private readonly commentRepo: CommentRepoPort,
  ) {}

  async execute(rawPostId: string): Promise<ListCommentsResponseDTO> {
    if (!PostId.isValid(rawPostId)) {
      throw new PostIdInvalidError();
    }

    const post = await this.postRepo.findById(rawPostId);
    if (!post) {
      throw new PostNotFoundError();
    }

    const items = await this.commentRepo.findByPostId(rawPostId);

    return {
      comments: items.map((c) => CommentEntityDTOMapperPort.toDTO(c)),
    };
  }
}
