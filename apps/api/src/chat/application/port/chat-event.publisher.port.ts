import { ChatRequestAcceptedEventPayload } from '@/_shared/domain/events';

export interface ChatEventPublisherPort {
  publishChatRequestAccepted(
    payload: ChatRequestAcceptedEventPayload,
  ): Promise<void>;
}
