import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { TOKENS } from '@/_shared/application/tokens';

import { EVENT_TYPE, ChatRequestAcceptedEventPayload } from '@/_shared/domain/events';

import { ChatEventPublisherPort } from '@/chat/application/port/chat-event.publisher.port';
import type { ChatRequestAcceptedDomainEvent } from '@/notification/domain/chat-request-accepted.domain-event';

@Injectable()
export class KafkaChatEventPublisher implements ChatEventPublisherPort {
  constructor(
    @Inject(TOKENS.KAFKA_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async publishChatRequestAccepted(
    payload: ChatRequestAcceptedEventPayload,
  ): Promise<void> {
    const event: ChatRequestAcceptedDomainEvent = {
      eventId: randomUUID(),
      type: EVENT_TYPE.CHAT_REQUEST_ACCEPTED,
      occurredAt: new Date(),
      payload,
    };
    await firstValueFrom(
      this.kafkaClient.emit(EVENT_TYPE.CHAT_REQUEST_ACCEPTED, event),
    );
  }
}
