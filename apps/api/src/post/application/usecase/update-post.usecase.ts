import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

import type { PostRepoPort } from '../port/post.repo.port';
import { PostEntityDTOMapperPort } from '../port/post.mapper.port';
import { PostNotFoundError, PostNotOwnerError } from '@/post/domain/errors';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { UpdatePostBodyDTO, UpdatePostResponseDTO } from '@social/shared';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly postRepo: PostRepoPort,
  ) {}

  async execute(
    userId: UserId,
    postId: string,
    input: UpdatePostBodyDTO,
  ): Promise<UpdatePostResponseDTO> {
    const existing = await this.postRepo.findById(postId);
    if (!existing) throw new PostNotFoundError();
    if (existing.authorId.toString() !== userId.toString()) {
      throw new PostNotOwnerError();
    }

    existing.update({ content: input.content.trim() });
    await this.postRepo.update(existing);

    const updated = await this.postRepo.findById(postId);
    if (!updated) throw new PostNotFoundError();

    return {
      ok: true,
      post: PostEntityDTOMapperPort.toDTO(updated),
    };
  }
}
