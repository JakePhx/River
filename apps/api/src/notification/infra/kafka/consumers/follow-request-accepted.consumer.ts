import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { EVENT_TYPE } from '@/_shared/domain/events';

import { CreateUserNotificationUseCase } from '@/notification/application/usecase/create-user-notification.usecase';
import type { FollowRequestAcceptedDomainEvent } from '@/notification/domain/follow-request-accepted.domain-event';
import { NotificationType } from '@/notification/domain/notification-type.enum';

@Controller()
export class FollowRequestAcceptedConsumer {
  private readonly logger = new Logger(FollowRequestAcceptedConsumer.name);

  constructor(
    private readonly createUserNotification: CreateUserNotificationUseCase,
  ) {}

  @EventPattern(EVENT_TYPE.FOLLOW_REQUEST_ACCEPTED)
  async handle(
    @Payload() event: FollowRequestAcceptedDomainEvent,
  ): Promise<void> {
    this.logger.debug(
      `Received ${EVENT_TYPE.FOLLOW_REQUEST_ACCEPTED}: ${event.eventId}`,
    );

    const { requesterId, accepterId, redirectURL } = event.payload;

    await this.createUserNotification.execute({
      userId: requesterId,
      type: NotificationType.FOLLOW_REQUEST_ACCEPTED,
      payload: {
        accepterId,
        redirectURL,
      },
      eventId: `follow-accept:${requesterId}:${accepterId}`,
    });
  }
}
