import {
  Event,
  EVENT_TYPE,
  PostCreatedEventPayload,
} from '@/_shared/domain/events';

export type PostCreatedDomainEvent = Event<
  PostCreatedEventPayload,
  EVENT_TYPE.POST_CREATED
>;
