import {
  Event,
  EVENT_TYPE,
  FollowReceivedEventPayload,
} from '@/_shared/domain/events';

export type FollowReceivedDomainEvent = Event<
  FollowReceivedEventPayload,
  EVENT_TYPE.FOLLOW_RECEIVED
>;
