// src/notification/infra/kafka/consumers/post-created.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_TYPE } from '@/_shared/domain/events';

import { CreatePostNotificationsUseCase } from '@/notification/application/usecase/crate-post-notifications.usecase';
import type { PostCreatedDomainEvent } from '@/notification/domain/post-created.domain-event';

@Controller()
export class PostCreatedConsumer {
  private readonly logger = new Logger(PostCreatedConsumer.name);

  constructor(
    private readonly createPostNotificationsUseCase: CreatePostNotificationsUseCase,
  ) {}

  @EventPattern(EVENT_TYPE.POST_CREATED)
  async handle(@Payload() event: PostCreatedDomainEvent): Promise<void> {
    this.logger.debug(`Received ${EVENT_TYPE.POST_CREATED}: ${event.eventId}`);

    await this.createPostNotificationsUseCase.execute({
      postId: event.payload.postId,
      authorId: event.payload.authorId,
    });
  }
}
