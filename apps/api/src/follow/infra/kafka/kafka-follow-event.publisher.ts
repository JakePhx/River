import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { TOKENS } from '@/_shared/application/tokens';

import {
  EVENT_TYPE,
  FollowReceivedEventPayload,
  FollowRequestAcceptedEventPayload,
} from '@/_shared/domain/events';

import { FollowEventPublisherPort } from '@/follow/application/port/follow-event.publisher.port';
import type { FollowReceivedDomainEvent } from '@/notification/domain/follow-received.domain-event';
import type { FollowRequestAcceptedDomainEvent } from '@/notification/domain/follow-request-accepted.domain-event';

@Injectable()
export class KafkaFollowEventPublisher implements FollowEventPublisherPort {
  constructor(
    @Inject(TOKENS.KAFKA_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async publishFollowReceived(
    payload: FollowReceivedEventPayload,
  ): Promise<void> {
    const event: FollowReceivedDomainEvent = {
      eventId: randomUUID(),
      type: EVENT_TYPE.FOLLOW_RECEIVED,
      occurredAt: new Date(),
      payload,
    };
    await firstValueFrom(
      this.kafkaClient.emit(EVENT_TYPE.FOLLOW_RECEIVED, event),
    );
  }

  async publishFollowRequestAccepted(
    payload: FollowRequestAcceptedEventPayload,
  ): Promise<void> {
    const event: FollowRequestAcceptedDomainEvent = {
      eventId: randomUUID(),
      type: EVENT_TYPE.FOLLOW_REQUEST_ACCEPTED,
      occurredAt: new Date(),
      payload,
    };
    await firstValueFrom(
      this.kafkaClient.emit(EVENT_TYPE.FOLLOW_REQUEST_ACCEPTED, event),
    );
  }
}
