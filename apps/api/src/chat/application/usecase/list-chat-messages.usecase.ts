import { Inject, Injectable } from '@nestjs/common';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import { mapMessage } from '@/chat/application/mappers/chat.mapper';
import { chatThreadNotFound } from '@/chat/domain/errors';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';

import type { ListChatMessagesResponseDTO } from '@social/shared';

@Injectable()
export class ListChatMessagesUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(params: {
    userId: string;
    threadId: string;
    cursor?: string;
    limit?: number;
  }): Promise<ListChatMessagesResponseDTO> {
    const thread = await this.chatRepo.findThreadIfMember(
      params.threadId,
      params.userId,
    );
    if (!thread) throw chatThreadNotFound();

    const excluded = await this.blockRepo.listBlockedRelatedPeerIds(
      params.userId,
    );
    const peer =
      thread.userIdLow === params.userId
        ? thread.userIdHigh
        : thread.userIdLow;
    if (excluded.has(peer)) throw chatThreadNotFound();

    const result = await this.chatRepo.getMessages({
      threadId: params.threadId,
      userId: params.userId,
      cursor: params.cursor,
      limit: params.limit ?? 40,
    });

    if (!result) throw chatThreadNotFound();

    return {
      messages: result.messages.map((m) => mapMessage(m, params.userId)),
      nextCursor: result.nextCursor,
    };
  }
}
