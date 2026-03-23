import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { TOKENS } from '@/_shared/application/tokens';

import { EVENT_TYPE, PostCreatedEventPayload } from '@/_shared/domain/events';

import { PostEventPublisherPort } from '@/post/application/port/event.publisher.port';
import { PostCreatedDomainEvent } from '@/notification/domain/post-created.domain-event';

@Injectable()
export class KafkaPostEventPublisher implements PostEventPublisherPort {
  constructor(
    @Inject(TOKENS.KAFKA_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async publishPostCreatedEvent(
    payload: PostCreatedEventPayload,
  ): Promise<void> {
    const event: PostCreatedDomainEvent = {
      eventId: randomUUID(),
      type: EVENT_TYPE.POST_CREATED,
      occurredAt: new Date(),
      payload,
    };
    await firstValueFrom(this.kafkaClient.emit(EVENT_TYPE.POST_CREATED, event));
  }
}
