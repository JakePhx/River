import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ChatThreadStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import { sortChatUserIds, threadPreviewFromSend } from './chat-pair.util';

export type ChatThreadRow = {
  id: string;
  userIdLow: string;
  userIdHigh: string;
  status: ChatThreadStatus;
  initiatedById: string;
  lastMessageAt: Date | null;
  lastMessageText: string | null;
  lastMessageSenderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaChatRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findThreadByUserPair(userA: string, userB: string): Promise<ChatThreadRow | null> {
    const [low, high] = sortChatUserIds(userA, userB);
    const row = await this.prisma.chatThread.findUnique({
      where: {
        userIdLow_userIdHigh: { userIdLow: low, userIdHigh: high },
      },
    });
    return row;
  }

  async getThreadById(threadId: string): Promise<ChatThreadRow | null> {
    return this.prisma.chatThread.findUnique({ where: { id: threadId } });
  }

  async findThreadIfMember(
    threadId: string,
    userId: string,
  ): Promise<ChatThreadRow | null> {
    return this.prisma.chatThread.findFirst({
      where: {
        id: threadId,
        OR: [{ userIdLow: userId }, { userIdHigh: userId }],
      },
    });
  }

  async sendMessageTransaction(params: {
    senderId: string;
    recipientId: string;
    content: string;
    replyToMessageId?: string | null;
    attachment?: {
      url: string;
      contentType: string;
      byteSize: number;
      fileName?: string | null;
    } | null;
    onRejected: () => never;
    onMustAccept: () => never;
    onWaitForRecipientAccept: () => never;
    onInvalidReply: () => never;
  }) {
    const { senderId, recipientId, content, attachment } = params;
    const [low, high] = sortChatUserIds(senderId, recipientId);
    const now = new Date();
    const preview = threadPreviewFromSend(content, attachment);

    return this.prisma.$transaction(async (tx) => {
      let thread = await tx.chatThread.findUnique({
        where: {
          userIdLow_userIdHigh: { userIdLow: low, userIdHigh: high },
        },
      });

      if (!thread) {
        thread = await tx.chatThread.create({
          data: {
            userIdLow: low,
            userIdHigh: high,
            status: ChatThreadStatus.PENDING,
            initiatedById: senderId,
            lastMessageAt: now,
            lastMessageText: preview,
            lastMessageSenderId: senderId,
          },
        });
      } else {
        if (thread.status === ChatThreadStatus.REJECTED) {
          params.onRejected();
        }
        if (
          thread.status === ChatThreadStatus.PENDING &&
          thread.initiatedById !== senderId
        ) {
          params.onMustAccept();
        }
        if (
          thread.status === ChatThreadStatus.PENDING &&
          thread.initiatedById === senderId
        ) {
          const priorFromInitiator = await tx.chatMessage.count({
            where: {
              threadId: thread.id,
              senderId,
            },
          });
          if (priorFromInitiator >= 1) {
            params.onWaitForRecipientAccept();
          }
        }

        thread = await tx.chatThread.update({
          where: { id: thread.id },
          data: {
            lastMessageAt: now,
            lastMessageText: preview,
            lastMessageSenderId: senderId,
            updatedAt: now,
          },
        });
      }

      if (params.replyToMessageId) {
        const target = await tx.chatMessage.findFirst({
          where: {
            id: params.replyToMessageId,
            threadId: thread.id,
          },
          select: { id: true },
        });
        if (!target) {
          params.onInvalidReply();
        }
      }

      const messageId = randomUUID();
      await tx.chatMessage.create({
        data: {
          id: messageId,
          threadId: thread.id,
          senderId,
          content,
          replyToId: params.replyToMessageId ?? null,
        },
      });

      if (attachment) {
        await tx.chatMessageAttachment.create({
          data: {
            id: randomUUID(),
            messageId,
            url: attachment.url,
            contentType: attachment.contentType,
            byteSize: attachment.byteSize,
            fileName: attachment.fileName ?? null,
          },
        });
      }

      const message = await tx.chatMessage.findUniqueOrThrow({
        where: { id: messageId },
        include: {
          attachment: true,
          replyTo: {
            include: {
              attachment: true,
              sender: { select: { id: true, username: true, name: true } },
            },
          },
        },
      });

      return { thread, message };
    });
  }

  async getThreadListRowForUser(threadId: string, userId: string) {
    return this.prisma.chatThread.findFirst({
      where: {
        id: threadId,
        OR: [{ userIdLow: userId }, { userIdHigh: userId }],
      },
      include: {
        userLow: { include: { profile: true } },
        userHigh: { include: { profile: true } },
        readStates: { where: { userId } },
      },
    });
  }

  async listThreadsForUser(userId: string) {
    return this.prisma.chatThread.findMany({
      where: {
        OR: [{ userIdLow: userId }, { userIdHigh: userId }],
      },
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
      include: {
        userLow: { include: { profile: true } },
        userHigh: { include: { profile: true } },
        readStates: { where: { userId } },
      },
    });
  }

  async getMessages(params: {
    threadId: string;
    userId: string;
    cursor?: string;
    limit: number;
  }) {
    const { threadId, userId, cursor, limit } = params;
    const member = await this.findThreadIfMember(threadId, userId);
    if (!member) return null;

    const take = Math.min(Math.max(limit, 1), 100);
    const where: Prisma.ChatMessageWhereInput = { threadId };
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      include: {
        attachment: true,
        replyTo: {
          include: {
            attachment: true,
            sender: { select: { id: true, username: true, name: true } },
          },
        },
      },
    });

    const hasMore = messages.length > take;
    const page = hasMore ? messages.slice(0, take) : messages;
    const nextCursor =
      hasMore && page.length
        ? page[page.length - 1]!.createdAt.toISOString()
        : null;

    return { messages: page.reverse(), nextCursor };
  }

  async acceptThread(threadId: string, userId: string) {
    const thread = await this.findThreadIfMember(threadId, userId);
    if (!thread) return { error: 'NOT_FOUND' as const };
    if (thread.status !== ChatThreadStatus.PENDING) {
      return {
        ok: true as const,
        thread,
        transitionedToActive: false as const,
      };
    }
    if (thread.initiatedById === userId) {
      return { error: 'ACCEPT_FORBIDDEN' as const };
    }
    const updated = await this.prisma.chatThread.update({
      where: { id: threadId },
      data: { status: ChatThreadStatus.ACTIVE },
    });
    return {
      ok: true as const,
      thread: updated,
      transitionedToActive: true as const,
    };
  }

  async rejectThread(threadId: string, userId: string) {
    const thread = await this.findThreadIfMember(threadId, userId);
    if (!thread) return { error: 'NOT_FOUND' as const };
    if (thread.status !== ChatThreadStatus.PENDING) {
      return { ok: true as const, thread };
    }
    if (thread.initiatedById === userId) {
      return { error: 'REJECT_FORBIDDEN' as const };
    }
    const updated = await this.prisma.chatThread.update({
      where: { id: threadId },
      data: { status: ChatThreadStatus.REJECTED },
    });
    return { ok: true as const, thread: updated };
  }

  async markThreadRead(threadId: string, readerId: string) {
    const thread = await this.findThreadIfMember(threadId, readerId);
    if (!thread) return null;

    const now = new Date();
    const pending = await this.prisma.chatMessage.findMany({
      where: {
        threadId,
        senderId: { not: readerId },
        readAt: null,
      },
      select: { id: true },
    });
    const ids = pending.map((m) => m.id);

    const markPendingSeen =
      thread.status === ChatThreadStatus.PENDING &&
      thread.initiatedById !== readerId;

    await this.prisma.$transaction([
      this.prisma.chatParticipantReadState.upsert({
        where: {
          threadId_userId: { threadId, userId: readerId },
        },
        create: {
          threadId,
          userId: readerId,
          lastReadAt: now,
          ...(markPendingSeen ? { pendingRequestSeenAt: now } : {}),
        },
        update: {
          lastReadAt: now,
          ...(markPendingSeen ? { pendingRequestSeenAt: now } : {}),
        },
      }),
      this.prisma.chatMessage.updateMany({
        where: { id: { in: ids } },
        data: { readAt: now },
      }),
    ]);

    const updatedMessages = ids.map((id) => ({
      id,
      readAt: now.toISOString(),
    }));

    return { thread, updatedMessages };
  }

  async deleteThread(threadId: string): Promise<void> {
    await this.prisma.chatThread.delete({ where: { id: threadId } });
  }

  async computeUnreadSummary(
    userId: string,
    excludedPeerIds?: ReadonlySet<string>,
  ) {
    const threads = await this.prisma.chatThread.findMany({
      where: {
        OR: [{ userIdLow: userId }, { userIdHigh: userId }],
      },
      include: {
        readStates: { where: { userId } },
      },
    });

    let pendingIncoming = 0;
    let unreadMessages = 0;

    for (const t of threads) {
      const peer = t.userIdLow === userId ? t.userIdHigh : t.userIdLow;
      if (excludedPeerIds?.has(peer)) continue;

      if (t.status === ChatThreadStatus.PENDING && t.initiatedById !== userId) {
        const rs = t.readStates[0];
        if (!rs?.pendingRequestSeenAt) {
          pendingIncoming += 1;
        }
        continue;
      }
      if (t.status !== ChatThreadStatus.ACTIVE) continue;
      if (!t.lastMessageAt || !t.lastMessageSenderId) continue;
      if (t.lastMessageSenderId === userId) continue;

      const rs = t.readStates[0];
      const lastRead = rs?.lastReadAt ?? null;
      if (!lastRead || t.lastMessageAt > lastRead) {
        unreadMessages += 1;
      }
    }

    return {
      pendingIncoming,
      unreadMessages,
      total: pendingIncoming + unreadMessages,
    };
  }

  async syncThreadLastMessageFromDb(threadId: string): Promise<void> {
    const last = await this.prisma.chatMessage.findFirst({
      where: { threadId },
      orderBy: { createdAt: 'desc' },
      include: { attachment: true },
    });
    const now = new Date();
    if (!last) {
      await this.prisma.chatThread.update({
        where: { id: threadId },
        data: {
          lastMessageAt: null,
          lastMessageText: null,
          lastMessageSenderId: null,
          updatedAt: now,
        },
      });
      return;
    }
    const preview = threadPreviewFromSend(last.content, last.attachment);
    await this.prisma.chatThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: last.createdAt,
        lastMessageText: preview,
        lastMessageSenderId: last.senderId,
        updatedAt: now,
      },
    });
  }

  async updateMessageBySender(params: {
    messageId: string;
    senderId: string;
    content: string;
  }) {
    const existing = await this.prisma.chatMessage.findFirst({
      where: { id: params.messageId, senderId: params.senderId },
      include: { attachment: true },
    });
    if (!existing) return { error: 'NOT_FOUND' };
    const trimmed = params.content.trim();
    if (!trimmed) return { error: 'EMPTY' };
    if (!existing.content.trim() && existing.attachment) {
      return { error: 'ATTACHMENT_ONLY' };
    }

    const updated = await this.prisma.chatMessage.update({
      where: { id: params.messageId },
      data: {
        content: trimmed,
        editedAt: new Date(),
      },
      include: {
        attachment: true,
        replyTo: {
          include: {
            attachment: true,
            sender: { select: { id: true, username: true, name: true } },
          },
        },
      },
    });

    await this.syncThreadLastMessageFromDb(updated.threadId);
    return { ok: true, message: updated };
  }

  async deleteMessageBySender(
    messageId: string,
    senderId: string,
  ): Promise<{ threadId: string } | null> {
    const row = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, senderId },
      select: { id: true, threadId: true },
    });
    if (!row) return null;
    await this.prisma.chatMessage.delete({ where: { id: messageId } });
    await this.syncThreadLastMessageFromDb(row.threadId);
    return { threadId: row.threadId };
  }
}
