import {
  Event,
  EVENT_TYPE,
  PostCommentedEventPayload,
} from '@/_shared/domain/events';

export type PostCommentedDomainEvent = Event<
  PostCommentedEventPayload,
  EVENT_TYPE.POST_COMMENTED
>;
