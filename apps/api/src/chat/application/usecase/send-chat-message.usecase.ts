import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import {
  CHAT_ATTACHMENT_MAX_BYTES,
} from '@social/shared';
import {
  chatAttachmentTooLarge,
  chatAttachmentUrlInvalid,
  chatBlocked,
  chatCannotMessageSelf,
  chatMessageEmpty,
  chatMustAcceptFirst,
  chatRejected,
  chatReplyTargetInvalid,
  chatWaitForRecipientAccept,
} from '@/chat/domain/errors';
import { mapMessage, mapThreadSummary } from '@/chat/application/mappers/chat.mapper';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import { ChatWsGateway, CHAT_MESSAGE_EVENT, CHAT_UNREAD_EVENT } from '@/chat/interface/chat.ws.gateway';
import { UserId } from '@/user/domain/value-object/user-id.vo';

import type { ChatMessageDTO, SendChatMessageBodyDTO } from '@social/shared';

@Injectable()
export class SendChatMessageUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
    private readonly chatGateway: ChatWsGateway,
  ) {}

  async execute(
    senderId: string,
    dto: SendChatMessageBodyDTO,
  ): Promise<{ message: ChatMessageDTO; threadId: string }> {
    if (senderId === dto.recipientId) {
      throw chatCannotMessageSelf();
    }

    const senderBlockedRecipient =
      await this.blockRepo.findBlockByBlockerIdAndBlockedId(
        UserId.from(senderId),
        UserId.from(dto.recipientId),
      );
    if (senderBlockedRecipient) throw chatBlocked();

    const recipientBlockedSender =
      await this.blockRepo.findBlockByBlockerIdAndBlockedId(
        UserId.from(dto.recipientId),
        UserId.from(senderId),
      );

    const text = (dto.content ?? '').trim();
    if (!text && !dto.attachment) {
      throw chatMessageEmpty();
    }

    if (dto.attachment) {
      if (dto.attachment.byteSize > CHAT_ATTACHMENT_MAX_BYTES) {
        throw chatAttachmentTooLarge();
      }
      let path: string;
      try {
        path = new URL(dto.attachment.url).pathname;
      } catch {
        throw chatAttachmentUrlInvalid();
      }
      const needle = `/chat/${senderId}/`;
      if (!path.includes(needle)) {
        throw chatAttachmentUrlInvalid();
      }
    }

    const { thread, message } = await this.chatRepo.sendMessageTransaction({
      senderId,
      recipientId: dto.recipientId,
      content: text,
      replyToMessageId: dto.replyToMessageId ?? null,
      attachment: dto.attachment
        ? {
            url: dto.attachment.url,
            contentType: dto.attachment.contentType,
            byteSize: dto.attachment.byteSize,
            fileName: dto.attachment.fileName ?? null,
          }
        : null,
      onRejected: () => {
        throw chatRejected();
      },
      onMustAccept: () => {
        throw chatMustAcceptFirst();
      },
      onWaitForRecipientAccept: () => {
        throw chatWaitForRecipientAccept();
      },
      onInvalidReply: () => {
        throw chatReplyTargetInvalid();
      },
    });

    const msgDto = mapMessage(message, senderId);

    const [rowForSender, rowForRecipient] = await Promise.all([
      this.chatRepo.getThreadListRowForUser(thread.id, senderId),
      this.chatRepo.getThreadListRowForUser(thread.id, dto.recipientId),
    ]);

    const summaryForSender = rowForSender
      ? mapThreadSummary(rowForSender as any, senderId)
      : null;
    const summaryForRecipient = rowForRecipient
      ? mapThreadSummary(rowForRecipient as any, dto.recipientId)
      : null;

    if (!recipientBlockedSender) {
      this.chatGateway.emitToUser(dto.recipientId, CHAT_MESSAGE_EVENT, {
        message: mapMessage(message, dto.recipientId),
        threadSummary: summaryForRecipient,
        threadId: thread.id,
      });
    }
    this.chatGateway.emitToUser(senderId, CHAT_MESSAGE_EVENT, {
      message: msgDto,
      threadSummary: summaryForSender,
      threadId: thread.id,
    });

    if (!recipientBlockedSender) {
      this.chatGateway.emitToThread(thread.id, CHAT_MESSAGE_EVENT, {
        message: msgDto,
        threadId: thread.id,
      });
    }

    const exRecipient = await this.blockRepo.listBlockedRelatedPeerIds(
      dto.recipientId,
    );
    const exSender = await this.blockRepo.listBlockedRelatedPeerIds(senderId);
    const recipientUnread = await this.chatRepo.computeUnreadSummary(
      dto.recipientId,
      exRecipient,
    );
    const senderUnread = await this.chatRepo.computeUnreadSummary(
      senderId,
      exSender,
    );

    if (!recipientBlockedSender) {
      this.chatGateway.emitToUser(dto.recipientId, CHAT_UNREAD_EVENT, recipientUnread);
    }
    this.chatGateway.emitToUser(senderId, CHAT_UNREAD_EVENT, senderUnread);

    return { message: msgDto, threadId: thread.id };
  }
}
