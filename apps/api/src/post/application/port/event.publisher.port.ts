import { PostCreatedEventPayload } from '@/_shared/domain/events';

export interface PostEventPublisherPort {
  publishPostCreatedEvent(payload: PostCreatedEventPayload): Promise<void>;
}
