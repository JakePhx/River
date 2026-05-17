import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { TOKENS } from '@/_shared/application/tokens';

import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import {
  chatAcceptForbidden,
  chatThreadNotFound,
} from '@/chat/domain/errors';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import {
  ChatWsGateway,
  CHAT_REQUEST_ACCEPTED_EVENT,
  CHAT_THREAD_UPDATED_EVENT,
  CHAT_UNREAD_EVENT,
} from '@/chat/interface/chat.ws.gateway';
import type { ChatEventPublisherPort } from '@/chat/application/port/chat-event.publisher.port';
import type { UserRepoPort } from '@/user/application/port/user.repo.port';
import { UserId } from '@/user/domain/value-object/user-id.vo';

@Injectable()
export class AcceptChatThreadUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    private readonly chatGateway: ChatWsGateway,
    @Inject(TOKENS.CHAT_EVENT_PUBLISHER)
    private readonly chatEventPublisher: ChatEventPublisherPort,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepoPort,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(userId: string, threadId: string): Promise<{ ok: true }> {
    const result = await this.chatRepo.acceptThread(threadId, userId);
    if ('error' in result) {
      if (result.error === 'NOT_FOUND') throw chatThreadNotFound();
      throw chatAcceptForbidden();
    }

    const { thread, transitionedToActive } = result;
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

    if (transitionedToActive) {
      const initiatorId = thread.initiatedById;
      const accepter = await this.userRepo.findById(UserId.from(userId));
      const accepterName =
        accepter?.name?.trim() || accepter?.username || 'Someone';

      await this.chatEventPublisher.publishChatRequestAccepted({
        initiatorId,
        threadId,
        accepterId: userId,
        redirectURL: `/messages?with=${encodeURIComponent(userId)}`,
      });

      this.chatGateway.emitToThread(threadId, CHAT_REQUEST_ACCEPTED_EVENT, {
        threadId,
        accepterId: userId,
        accepterName,
        acceptedAt: new Date().toISOString(),
        eventId: randomUUID(),
      });
    }

    return { ok: true };
  }
}
