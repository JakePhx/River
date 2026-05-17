import { Injectable } from '@nestjs/common';

import { BlockUserUseCase } from '@/block/application/usecase/block-user.usecase';
import { AlreadyBlockedError } from '@/block/domain/errors';
import { chatThreadNotFound } from '@/chat/domain/errors';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import {
  ChatWsGateway,
  CHAT_UNREAD_EVENT,
} from '@/chat/interface/chat.ws.gateway';
import { UserId } from '@/user/domain/value-object/user-id.vo';

import { GetChatUnreadUseCase } from './get-chat-unread.usecase';

@Injectable()
export class BlockPeerFromChatUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    private readonly blockUser: BlockUserUseCase,
    private readonly chatGateway: ChatWsGateway,
    private readonly getUnread: GetChatUnreadUseCase,
  ) {}

  async execute(
    userId: string,
    threadId: string,
  ): Promise<{ ok: true; blockedUserId: string }> {
    const thread = await this.chatRepo.findThreadIfMember(threadId, userId);
    if (!thread) throw chatThreadNotFound();
    const peerId =
      thread.userIdLow === userId ? thread.userIdHigh : thread.userIdLow;

    try {
      await this.blockUser.execute(UserId.from(userId), {
        targetUserId: peerId,
      });
    } catch (e) {
      if (!(e instanceof AlreadyBlockedError)) throw e;
    }

    const [uSelf, uPeer] = await Promise.all([
      this.getUnread.execute(userId),
      this.getUnread.execute(peerId),
    ]);
    this.chatGateway.emitToUser(userId, CHAT_UNREAD_EVENT, uSelf);
    this.chatGateway.emitToUser(peerId, CHAT_UNREAD_EVENT, uPeer);

    return { ok: true, blockedUserId: peerId };
  }
}
