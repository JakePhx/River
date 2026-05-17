import {
  Event,
  EVENT_TYPE,
  ChatRequestAcceptedEventPayload,
} from '@/_shared/domain/events';

export type ChatRequestAcceptedDomainEvent = Event<
  ChatRequestAcceptedEventPayload,
  EVENT_TYPE.CHAT_REQUEST_ACCEPTED
>;
