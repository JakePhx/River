import { Inject, Injectable } from '@nestjs/common';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import { mapThreadSummary } from '@/chat/application/mappers/chat.mapper';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';

import type { ListChatThreadsResponseDTO } from '@social/shared';

@Injectable()
export class ListChatThreadsUseCase {
  constructor(
    private readonly chatRepo: PrismaChatRepo,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(userId: string): Promise<ListChatThreadsResponseDTO> {
    const excluded = await this.blockRepo.listBlockedRelatedPeerIds(userId);
    const rows = (await this.chatRepo.listThreadsForUser(userId)).filter(
      (t) => {
        const peer = t.userIdLow === userId ? t.userIdHigh : t.userIdLow;
        return !excluded.has(peer);
      },
    );
    return {
      threads: rows.map((t) => mapThreadSummary(t as any, userId)),
    };
  }
}
