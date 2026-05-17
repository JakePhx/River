import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { EVENT_TYPE } from '@/_shared/domain/events';

import { CreateUserNotificationUseCase } from '@/notification/application/usecase/create-user-notification.usecase';
import type { PostCommentedDomainEvent } from '@/notification/domain/post-commented.domain-event';
import { NotificationType } from '@/notification/domain/notification-type.enum';

@Controller()
export class PostCommentedConsumer {
  private readonly logger = new Logger(PostCommentedConsumer.name);

  constructor(
    private readonly createUserNotification: CreateUserNotificationUseCase,
  ) {}

  @EventPattern(EVENT_TYPE.POST_COMMENTED)
  async handle(@Payload() event: PostCommentedDomainEvent): Promise<void> {
    this.logger.debug(`Received ${EVENT_TYPE.POST_COMMENTED}: ${event.eventId}`);

    const { postId, postAuthorId, commentAuthorId, commentId } =
      event.payload;

    await this.createUserNotification.execute({
      userId: postAuthorId,
      type: NotificationType.POST_COMMENTED,
      payload: {
        postId,
        commentAuthorId,
        redirectURL: `/posts/${encodeURIComponent(postId)}`,
      },
      eventId: `post-comment:${postId}:${commentId}`,
    });
  }
}
