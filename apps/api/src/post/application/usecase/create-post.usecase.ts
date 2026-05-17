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
import {
  CreatePostAttachmentKindDTO,
  CreatePostBodyDTO,
  CreatePostResponseDTO,
} from '@social/shared';
import { PostEntity } from '@/post/domain/post.entity';
import { ValidationError } from '@/_shared/domain/errors';
import { PostErrorCode } from '@/post/domain/errors';

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

    const attachments = (input.attachments ?? []).map((a) => ({
      url: a.url,
      contentType: a.contentType,
      byteSize: a.byteSize,
      kind:
        a.kind === CreatePostAttachmentKindDTO.video ? ('VIDEO' as const) : ('IMAGE' as const),
    }));

    const text = input.content.trim();
    if (!text && attachments.length === 0) {
      throw new ValidationError({
        code: PostErrorCode.POST_BODY_EMPTY,
        message: 'Add text or at least one attachment.',
      });
    }

    const post = PostEntity.create({
      author: user,
      content: text,
      attachments,
    });

    const saved = await this.postRepo.create(post);

    await this.postEventPublisher.publishPostCreatedEvent({
      postId: saved.id.toString(),
      authorId: saved.authorId.toString(),
    });

    return {
      ok: true,
      post: PostEntityDTOMapperPort.toDTO(saved),
    };
  }
}
