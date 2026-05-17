import { Inject, Injectable } from '@nestjs/common';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import {
  chatRejectForbidden,
  chatThreadNotFound,
} from '@/chat/domain/errors';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import {
  ChatWsGateway,
  CHAT_THREAD_UPDATED_EVENT,
  CHAT_UNREAD_EVENT,
} from '@/chat/interface/chat.ws.gateway';

@Injectable()
export class RejectChatThreadUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    private readonly chatGateway: ChatWsGateway,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(userId: string, threadId: string): Promise<{ ok: true }> {
    const result = await this.chatRepo.rejectThread(threadId, userId);
    if ('error' in result) {
      if (result.error === 'NOT_FOUND') throw chatThreadNotFound();
      throw chatRejectForbidden();
    }

    const thread = result.thread;
    const peerId =
      thread.userIdLow === userId ? thread.userIdHigh : thread.userIdLow;

    this.chatGateway.emitToUser(peerId, CHAT_THREAD_UPDATED_EVENT, {
      threadId,
      status: thread.status,
    });
    this.chatGateway.emitToUser(userId, CHAT_THREAD_UPDATED_EVENT, {
      threadId,
      status: thread.status,
    });

    const exPeer = await this.blockRepo.listBlockedRelatedPeerIds(peerId);
    const exUser = await this.blockRepo.listBlockedRelatedPeerIds(userId);
    const u1 = await this.chatRepo.computeUnreadSummary(peerId, exPeer);
    const u2 = await this.chatRepo.computeUnreadSummary(userId, exUser);
    this.chatGateway.emitToUser(peerId, CHAT_UNREAD_EVENT, u1);
    this.chatGateway.emitToUser(userId, CHAT_UNREAD_EVENT, u2);

    return { ok: true };
  }
}
