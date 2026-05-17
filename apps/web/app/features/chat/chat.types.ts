import type {
  ChatMessageDTO,
  ChatThreadSummaryDTO,
  ChatUnreadSummaryDTO,
} from "@social/shared";

export type {
  ChatMessageDTO,
  ChatThreadSummaryDTO,
  ChatUnreadSummaryDTO,
};

export type ChatMessagesState = {
  items: ChatMessageDTO[];
  nextCursor: string | null;
  status: "idle" | "loading" | "failed";
};

export type TypingState = { userId: string; isTyping: boolean };

/** In-thread line when the recipient accepts a message request (WS + merged into timeline). */
export type ChatRequestAcceptedLineDTO = {
  eventId: string;
  createdAt: string;
  accepterId: string;
  accepterName: string;
};
