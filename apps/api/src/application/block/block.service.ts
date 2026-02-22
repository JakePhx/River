import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import { ConflictError, ValidationError } from '../../domain/common/errors';
import type { BlockRepoPort } from './ports/block-repo.port';

@Injectable()
export class BlockService {
  constructor(
    @Inject(TOKENS.BLOCK_REPO) private readonly blocks: BlockRepoPort,
  ) {}

  async block(myId: string, targetId: string) {
    if (myId === targetId) throw new ValidationError('Cannot block yourself');
    if (await this.blocks.exists(myId, targetId))
      throw new ConflictError('Already blocked');
    await this.blocks.blockTx(myId, targetId);
    return { ok: true };
  }

  async unblock(myId: string, targetId: string) {
    await this.blocks.unblock(myId, targetId);
    return { ok: true };
  }
}
