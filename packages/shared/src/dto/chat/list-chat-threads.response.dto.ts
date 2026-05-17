import type { ChatThreadSummaryDTO } from "./chat-thread.response.dto";

export class ListChatThreadsResponseDTO {
  threads!: ChatThreadSummaryDTO[];
}
