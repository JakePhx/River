import type {
  ChatMessageDTO,
  ChatMessageReplyPreviewDTO,
  ChatThreadSummaryDTO,
  ChatUnreadSummaryDTO,
} from '@social/shared';
import type {
  ChatMessage,
  ChatMessageAttachment,
  ChatThread,
  Profile,
  User,
} from '@prisma/client';

type ReplyToRow = ChatMessage & {
  attachment: ChatMessageAttachment | null;
  sender: { id: string; username: string; name: string | null };
};

export type ChatMessageWithAttachment = ChatMessage & {
  attachment: ChatMessageAttachment | null;
  replyTo?: ReplyToRow | null;
};

function mapReplyPreview(reply: ReplyToRow): ChatMessageReplyPreviewDTO {
  const att = reply.attachment;
  return {
    id: reply.id,
    senderId: reply.senderId,
    senderUsername: reply.sender.username,
    content: reply.content,
    attachment: att
      ? {
          url: att.url,
          contentType: att.contentType,
          byteSize: att.byteSize,
          fileName: att.fileName,
        }
      : null,
  };
}

type UserWithProfile = User & { profile: Profile | null };

type ThreadListRow = ChatThread & {
  userLow: UserWithProfile;
  userHigh: UserWithProfile;
  readStates: {
    lastReadAt: Date | null;
    pendingRequestSeenAt: Date | null;
  }[];
};

export function mapPeer(
  thread: ThreadListRow,
  viewerId: string,
): ChatThreadSummaryDTO['peer'] {
  const peer = thread.userIdLow === viewerId ? thread.userHigh : thread.userLow;
  return {
    id: peer.id,
    username: peer.username,
    name: peer.name,
    avatarUrl: peer.profile?.avatarUrl ?? null,
  };
}

export function mapThreadSummary(
  thread: ThreadListRow,
  viewerId: string,
): ChatThreadSummaryDTO {
  const peer = mapPeer(thread, viewerId);
  const pendingIncoming =
    thread.status === 'PENDING' && thread.initiatedById !== viewerId;
  const seenPending =
    !!thread.readStates[0]?.pendingRequestSeenAt;

  let hasUnread = false;
  if (pendingIncoming) {
    hasUnread = !seenPending;
  } else if (thread.status === 'ACTIVE') {
    const lastFromPeer =
      thread.lastMessageSenderId &&
      thread.lastMessageSenderId !== viewerId;
    if (lastFromPeer && thread.lastMessageAt) {
      const rs = thread.readStates[0];
      const lastRead = rs?.lastReadAt ?? null;
      if (!lastRead || thread.lastMessageAt > lastRead) {
        hasUnread = true;
      }
    }
  }

  return {
    id: thread.id,
    status: thread.status,
    initiatedById: thread.initiatedById,
    peer,
    lastMessageAt: thread.lastMessageAt?.toISOString() ?? null,
    lastMessagePreview: thread.lastMessageText,
    hasUnread,
    pendingIncoming,
  };
}

export function mapMessage(
  m: ChatMessageWithAttachment,
  viewerId: string,
): ChatMessageDTO {
  const isOwn = m.senderId === viewerId;
  const att = m.attachment;
  return {
    id: m.id,
    threadId: m.threadId,
    senderId: m.senderId,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    readAt: isOwn ? (m.readAt?.toISOString() ?? null) : null,
    editedAt: m.editedAt?.toISOString() ?? null,
    attachment: att
      ? {
          url: att.url,
          contentType: att.contentType,
          byteSize: att.byteSize,
          fileName: att.fileName,
        }
      : null,
    replyTo: m.replyTo ? mapReplyPreview(m.replyTo) : null,
  };
}

export function mapUnreadSummary(
  row: { pendingIncoming: number; unreadMessages: number; total: number },
): ChatUnreadSummaryDTO {
  return {
    pendingIncoming: row.pendingIncoming,
    unreadMessages: row.unreadMessages,
    total: row.total,
  };
}
