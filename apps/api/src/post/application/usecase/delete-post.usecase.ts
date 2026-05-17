import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

import type { PostRepoPort } from '../port/post.repo.port';
import { PostNotFoundError, PostNotOwnerError } from '@/post/domain/errors';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { DeletePostResponseDTO } from '@social/shared';

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly postRepo: PostRepoPort,
  ) {}

  async execute(
    userId: UserId,
    postId: string,
  ): Promise<DeletePostResponseDTO> {
    const existing = await this.postRepo.findById(postId);
    if (!existing) throw new PostNotFoundError();
    if (existing.authorId.toString() !== userId.toString()) {
      throw new PostNotOwnerError();
    }

    const authorId = existing.authorId.toString();
    await this.postRepo.deleteById(postId);

    return {
      ok: true,
      postId,
      authorId,
    };
  }
}
