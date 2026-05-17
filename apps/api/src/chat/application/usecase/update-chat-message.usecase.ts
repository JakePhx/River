import { Inject, Injectable } from '@nestjs/common';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import { mapMessage } from '@/chat/application/mappers/chat.mapper';
import {
  chatMessageEditAttachmentOnly,
  chatMessageEmpty,
  chatMessageNotFound,
} from '@/chat/domain/errors';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import {
  ChatWsGateway,
  CHAT_MESSAGE_UPDATED_EVENT,
  CHAT_THREAD_UPDATED_EVENT,
  CHAT_UNREAD_EVENT,
} from '@/chat/interface/chat.ws.gateway';

import type { ChatMessageDTO, UpdateChatMessageBodyDTO } from '@social/shared';

@Injectable()
export class UpdateChatMessageUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    private readonly chatGateway: ChatWsGateway,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(
    userId: string,
    messageId: string,
    dto: UpdateChatMessageBodyDTO,
  ): Promise<{ message: ChatMessageDTO; threadId: string }> {
    const result = await this.chatRepo.updateMessageBySender({
      messageId,
      senderId: userId,
      content: dto.content,
    });
    if ('error' in result) {
      if (result.error === 'NOT_FOUND') throw chatMessageNotFound();
      if (result.error === 'ATTACHMENT_ONLY') {
        throw chatMessageEditAttachmentOnly();
      }
      throw chatMessageEmpty();
    }

    const { message } = result;
    const threadId = message.threadId;
    const threadRow = await this.chatRepo.getThreadById(threadId);
    if (!threadRow) throw chatMessageNotFound();

    const peerId =
      threadRow.userIdLow === userId
        ? threadRow.userIdHigh
        : threadRow.userIdLow;

    const msgRow = message as Parameters<typeof mapMessage>[0];
    const dtoForSender = mapMessage(msgRow, userId);
    const dtoForPeer = mapMessage(msgRow, peerId);

    this.chatGateway.emitToUser(peerId, CHAT_MESSAGE_UPDATED_EVENT, {
      threadId,
      message: dtoForPeer,
    });
    this.chatGateway.emitToUser(userId, CHAT_MESSAGE_UPDATED_EVENT, {
      threadId,
      message: dtoForSender,
    });
    this.chatGateway.emitToThread(threadId, CHAT_MESSAGE_UPDATED_EVENT, {
      threadId,
      message: dtoForSender,
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

    return { message: dtoForSender, threadId };
  }
}
