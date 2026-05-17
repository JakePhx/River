import { Inject, Injectable } from '@nestjs/common';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import { chatMessageNotFound } from '@/chat/domain/errors';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import {
  ChatWsGateway,
  CHAT_MESSAGE_DELETED_EVENT,
  CHAT_THREAD_UPDATED_EVENT,
  CHAT_UNREAD_EVENT,
} from '@/chat/interface/chat.ws.gateway';

@Injectable()
export class DeleteChatMessageUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    private readonly chatGateway: ChatWsGateway,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(
    userId: string,
    messageId: string,
  ): Promise<{ ok: true; threadId: string }> {
    const deleted = await this.chatRepo.deleteMessageBySender(
      messageId,
      userId,
    );
    if (!deleted) throw chatMessageNotFound();

    const { threadId } = deleted;
    const threadRow = await this.chatRepo.getThreadById(threadId);
    if (!threadRow) {
      return { ok: true, threadId };
    }

    const peerId =
      threadRow.userIdLow === userId
        ? threadRow.userIdHigh
        : threadRow.userIdLow;

    this.chatGateway.emitToUser(peerId, CHAT_MESSAGE_DELETED_EVENT, {
      threadId,
      messageId,
    });
    this.chatGateway.emitToUser(userId, CHAT_MESSAGE_DELETED_EVENT, {
      threadId,
      messageId,
    });
    this.chatGateway.emitToThread(threadId, CHAT_MESSAGE_DELETED_EVENT, {
      threadId,
      messageId,
    });

    const status = threadRow.status;
    this.chatGateway.emitToUser(userId, CHAT_THREAD_UPDATED_EVENT, {
      threadId,
      status,
    });
    this.chatGateway.emitToUser(peerId, CHAT_THREAD_UPDATED_EVENT, {
      threadId,
      status,
    });

    const exPeer = await this.blockRepo.listBlockedRelatedPeerIds(peerId);
    const exUser = await this.blockRepo.listBlockedRelatedPeerIds(userId);
    const uPeer = await this.chatRepo.computeUnreadSummary(peerId, exPeer);
    const uUser = await this.chatRepo.computeUnreadSummary(userId, exUser);
    this.chatGateway.emitToUser(peerId, CHAT_UNREAD_EVENT, uPeer);
    this.chatGateway.emitToUser(userId, CHAT_UNREAD_EVENT, uUser);

    return { ok: true, threadId };
  }
}
