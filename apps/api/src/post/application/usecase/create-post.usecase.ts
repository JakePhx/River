import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Ports
import type { PostRepoPort } from '../port/post.repo.port';
import type { UserRepoPort } from '@/user/application/port/user.repo.port';

// Errors
import { UserInactiveError, UserNotFoundError } from '@/user/domain/errors';
import { PostEntityDTOMapperPort } from '../port/post.mapper.port';
import type { PostEventPublisherPort } from '../port/event.publisher.port';

// Entities, Value Objects, && DTOs
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { CreatePostBodyDTO, CreatePostResponseDTO } from '@social/shared';
import { PostEntity } from '@/post/domain/post.entity';

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly postRepo: PostRepoPort,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepoPort,
    @Inject(TOKENS.POST_EVENT_PUBLISHER)
    private readonly postEventPublisher: PostEventPublisherPort,
  ) {}

  async execute(
    authorId: UserId,
    input: CreatePostBodyDTO,
  ): Promise<CreatePostResponseDTO> {
    const user = await this.userRepo.findById(authorId);

    if (!user) throw new UserNotFoundError();
    if (!user.isActive) throw new UserInactiveError();

    const post = PostEntity.create({
      author: user,
      content: input.content,
    });

    const saved = await this.postRepo.create(post);

    await this.postEventPublisher.publishPostCreatedEvent({
      postId: saved.id.toString(),
      authorId: saved.authorId.toString(),
    });

    return {
      ok: true,
      post: PostEntityDTOMapperPort.toDTO(post),
    };
  }
}
