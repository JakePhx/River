import type { ChatPeerSummaryDTO } from "./chat-peer.response.dto";

export type ChatThreadStatusDTO = "PENDING" | "ACTIVE" | "REJECTED";

export class ChatThreadSummaryDTO {
  id!: string;
  status!: ChatThreadStatusDTO;
  initiatedById!: string;
  peer!: ChatPeerSummaryDTO;
  lastMessageAt!: string | null;
  lastMessagePreview!: string | null;
  /** True when the other user sent the last message and you have not read it yet (ACTIVE threads). */
  hasUnread!: boolean;
  /** Incoming message request waiting for Accept/Reject. */
  pendingIncoming!: boolean;
}
