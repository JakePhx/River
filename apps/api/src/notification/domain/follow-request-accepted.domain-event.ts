import {
  Event,
  EVENT_TYPE,
  FollowRequestAcceptedEventPayload,
} from '@/_shared/domain/events';

export type FollowRequestAcceptedDomainEvent = Event<
  FollowRequestAcceptedEventPayload,
  EVENT_TYPE.FOLLOW_REQUEST_ACCEPTED
>;
