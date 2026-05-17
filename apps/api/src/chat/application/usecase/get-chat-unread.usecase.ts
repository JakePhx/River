import { Inject, Injectable } from '@nestjs/common';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import { mapUnreadSummary } from '@/chat/application/mappers/chat.mapper';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';

import type { ChatUnreadSummaryDTO } from '@social/shared';

@Injectable()
export class GetChatUnreadUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(userId: string): Promise<ChatUnreadSummaryDTO> {
    const excluded = await this.blockRepo.listBlockedRelatedPeerIds(userId);
    const row = await this.chatRepo.computeUnreadSummary(userId, excluded);
    return mapUnreadSummary(row);
  }
}
