import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { EVENT_TYPE } from '@/_shared/domain/events';

import { CreateUserNotificationUseCase } from '@/notification/application/usecase/create-user-notification.usecase';
import type { ChatRequestAcceptedDomainEvent } from '@/notification/domain/chat-request-accepted.domain-event';
import { NotificationType } from '@/notification/domain/notification-type.enum';

@Controller()
export class ChatRequestAcceptedConsumer {
  private readonly logger = new Logger(ChatRequestAcceptedConsumer.name);

  constructor(
    private readonly createUserNotification: CreateUserNotificationUseCase,
  ) {}

  @EventPattern(EVENT_TYPE.CHAT_REQUEST_ACCEPTED)
  async handle(
    @Payload() event: ChatRequestAcceptedDomainEvent,
  ): Promise<void> {
    this.logger.debug(
      `Received ${EVENT_TYPE.CHAT_REQUEST_ACCEPTED}: ${event.eventId}`,
    );

    const { initiatorId, threadId, accepterId, redirectURL } = event.payload;

    await this.createUserNotification.execute({
      userId: initiatorId,
      type: NotificationType.CHAT_REQUEST_ACCEPTED,
      payload: {
        threadId,
        accepterId,
        redirectURL,
      },
      eventId: `chat-accept:${threadId}:${accepterId}`,
    });
  }
}
