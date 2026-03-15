import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Ports
import type { PostRepoPort } from '../port/post.repo.port';
import { PostEntityDTOMapperPort } from '../port/post.mapper.port';

// Entities, Value Objects, && DTOs
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { ListPostResponseDTO } from '@social/shared';

@Injectable()
export class GetUserPostsUseCase {
  constructor(@Inject(TOKENS.POST_REPO) private readonly posts: PostRepoPort) {}

  async execute(
    userId: UserId,
    pagination?: { cursor?: string; take?: number },
  ): Promise<ListPostResponseDTO> {
    const { items, nextCursor } = await this.posts.findByAuthorId(
      userId,
      pagination,
    );

    return {
      items: items.map((p) => PostEntityDTOMapperPort.toDTO(p)),
      nextCursor,
    };
  }
}
