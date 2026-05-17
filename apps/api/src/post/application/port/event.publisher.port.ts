import {
  PostCommentedEventPayload,
  PostCreatedEventPayload,
} from '@/_shared/domain/events';

export interface PostEventPublisherPort {
  publishPostCreatedEvent(payload: PostCreatedEventPayload): Promise<void>;
  publishPostCommentedEvent(
    payload: PostCommentedEventPayload,
  ): Promise<void>;
}
