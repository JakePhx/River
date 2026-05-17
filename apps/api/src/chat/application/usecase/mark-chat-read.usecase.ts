import { Inject, Injectable } from '@nestjs/common';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import { chatThreadNotFound } from '@/chat/domain/errors';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import {
  ChatWsGateway,
  CHAT_READ_EVENT,
  CHAT_UNREAD_EVENT,
} from '@/chat/interface/chat.ws.gateway';

@Injectable()
export class MarkChatReadUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    private readonly chatGateway: ChatWsGateway,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(userId: string, threadId: string): Promise<{ ok: true }> {
    const result = await this.chatRepo.markThreadRead(threadId, userId);
    if (!result) throw chatThreadNotFound();

    const peerId =
      result.thread.userIdLow === userId
        ? result.thread.userIdHigh
        : result.thread.userIdLow;

    this.chatGateway.emitToUser(peerId, CHAT_READ_EVENT, {
      threadId,
      messageIds: result.updatedMessages.map((m) => m.id),
      readAt: result.updatedMessages[0]?.readAt ?? new Date().toISOString(),
    });

    this.chatGateway.emitToThread(threadId, CHAT_READ_EVENT, {
      threadId,
      messageIds: result.updatedMessages.map((m) => m.id),
      readAt: result.updatedMessages[0]?.readAt ?? new Date().toISOString(),
      readerId: userId,
    });

    const exReader = await this.blockRepo.listBlockedRelatedPeerIds(userId);
    const exPeer = await this.blockRepo.listBlockedRelatedPeerIds(peerId);
    const uReader = await this.chatRepo.computeUnreadSummary(userId, exReader);
    const uPeer = await this.chatRepo.computeUnreadSummary(peerId, exPeer);
    this.chatGateway.emitToUser(userId, CHAT_UNREAD_EVENT, uReader);
    this.chatGateway.emitToUser(peerId, CHAT_UNREAD_EVENT, uPeer);

    return { ok: true };
  }
}
