import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import { ConflictError } from '@/_shared/domain/errors';
import { assertCanBlock } from '../../domain/block.rules';
import type { BlockRepo } from '../port/block-repo';
import type { UserRepo } from '@/user/application/port/user.repo';
import { BlockTargetBodyDTO } from '../../interface/dto/block-target.body.dto';
import { UserNotFoundError } from '@/user/domain/error/user-error-code';

@Injectable()
export class BlockUserUseCase {
  constructor(
    @Inject(TOKENS.BLOCK_REPO)
    private readonly blocks: BlockRepo,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepo,
  ) {}

  async execute(blockerId: string, input: BlockTargetBodyDTO) {
    try {
      const { targetId } = input;

      // Validate users
      const targetExists = await this.userRepo.existsById(targetId);

      if (!targetExists) {
        throw new UserNotFoundError();
      }

      assertCanBlock({ blockerId, targetId });

      if (await this.blocks.exists({ blockerId, blockedId: targetId })) {
        throw new ConflictError('Already blocked');
      }

      await this.blocks.blockTx({ blockerId, blockedId: targetId });
      return { ok: true };
    } catch (error) {
      return {
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }
  }
}
