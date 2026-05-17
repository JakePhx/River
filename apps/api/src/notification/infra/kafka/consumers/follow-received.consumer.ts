import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { EVENT_TYPE } from '@/_shared/domain/events';

import { CreateUserNotificationUseCase } from '@/notification/application/usecase/create-user-notification.usecase';
import type { FollowReceivedDomainEvent } from '@/notification/domain/follow-received.domain-event';
import { NotificationType } from '@/notification/domain/notification-type.enum';

@Controller()
export class FollowReceivedConsumer {
  private readonly logger = new Logger(FollowReceivedConsumer.name);

  constructor(
    private readonly createUserNotification: CreateUserNotificationUseCase,
  ) {}

  @EventPattern(EVENT_TYPE.FOLLOW_RECEIVED)
  async handle(@Payload() event: FollowReceivedDomainEvent): Promise<void> {
    this.logger.debug(`Received ${EVENT_TYPE.FOLLOW_RECEIVED}: ${event.eventId}`);

    const { followeeId, followerId, redirectURL } = event.payload;

    await this.createUserNotification.execute({
      userId: followeeId,
      type: NotificationType.FOLLOW_RECEIVED,
      payload: {
        followerId,
        redirectURL,
      },
      eventId: `follow:${followerId}:${followeeId}`,
    });
  }
}
