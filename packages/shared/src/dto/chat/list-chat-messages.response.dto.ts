import type { ChatMessageDTO } from "./chat-message.response.dto";

export class ListChatMessagesResponseDTO {
  messages!: ChatMessageDTO[];
  nextCursor!: string | null;
}
