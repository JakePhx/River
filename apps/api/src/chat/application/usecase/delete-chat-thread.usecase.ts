import { Injectable } from '@nestjs/common';

import { chatThreadNotFound } from '@/chat/domain/errors';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import {
  ChatWsGateway,
  CHAT_THREAD_DELETED_EVENT,
  CHAT_UNREAD_EVENT,
} from '@/chat/interface/chat.ws.gateway';

import { GetChatUnreadUseCase } from './get-chat-unread.usecase';

@Injectable()
export class DeleteChatThreadUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    private readonly chatGateway: ChatWsGateway,
    private readonly getUnread: GetChatUnreadUseCase,
  ) {}

  async execute(
    userId: string,
    threadId: string,
  ): Promise<{ ok: true }> {
    const thread = await this.chatRepo.findThreadIfMember(threadId, userId);
    if (!thread) throw chatThreadNotFound();
    const peerId =
      thread.userIdLow === userId ? thread.userIdHigh : thread.userIdLow;

    await this.chatRepo.deleteThread(threadId);

    this.chatGateway.emitToUser(userId, CHAT_THREAD_DELETED_EVENT, {
      threadId,
    });
    this.chatGateway.emitToUser(peerId, CHAT_THREAD_DELETED_EVENT, {
      threadId,
    });

    const [uSelf, uPeer] = await Promise.all([
      this.getUnread.execute(userId),
      this.getUnread.execute(peerId),
    ]);
    this.chatGateway.emitToUser(userId, CHAT_UNREAD_EVENT, uSelf);
    this.chatGateway.emitToUser(peerId, CHAT_UNREAD_EVENT, uPeer);

    return { ok: true };
  }
}
