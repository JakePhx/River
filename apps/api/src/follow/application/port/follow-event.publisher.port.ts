import {
  FollowReceivedEventPayload,
  FollowRequestAcceptedEventPayload,
} from '@/_shared/domain/events';

export interface FollowEventPublisherPort {
  publishFollowReceived(payload: FollowReceivedEventPayload): Promise<void>;
  publishFollowRequestAccepted(
    payload: FollowRequestAcceptedEventPayload,
  ): Promise<void>;
}
