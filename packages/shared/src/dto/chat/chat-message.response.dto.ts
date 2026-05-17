export class ChatMessageAttachmentResponseDTO {
  url!: string;
  contentType!: string;
  byteSize!: number;
  fileName!: string | null;
}

/** Snapshot of the message being replied to (one level). */
export class ChatMessageReplyPreviewDTO {
  id!: string;
  senderId!: string;
  senderUsername!: string;
  content!: string;
  attachment!: ChatMessageAttachmentResponseDTO | null;
}

export class ChatMessageDTO {
  id!: string;
  threadId!: string;
  senderId!: string;
  content!: string;
  createdAt!: string;
  /** Set when the recipient has read this message (visible to sender for read receipts). */
  readAt!: string | null;
  /** Present when the sender last edited text; omitted or null when never edited. */
  editedAt!: string | null;
  attachment!: ChatMessageAttachmentResponseDTO | null;
  replyTo!: ChatMessageReplyPreviewDTO | null;
}
