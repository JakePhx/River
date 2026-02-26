import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepo } from '../port/block-repo';
import type { UserRepo } from '@/user/application/port/user.repo';
import { UnBlockTargetBodyDTO } from '../../interface/dto/block-target.body.dto';
import { UserNotFoundError } from '@/user/domain/error/user-error-code';
import {
  UnBlockTargetResponseDTO,
  UnBlockTargetErrorResponseDTO,
} from '@/block/interface/dto/block-target.response.dto';

@Injectable()
export class UnblockUserUseCase {
  constructor(
    @Inject(TOKENS.BLOCK_REPO)
    private readonly blocks: BlockRepo,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepo,
  ) {}

  async execute(
    blockerId: string,
    input: UnBlockTargetBodyDTO,
  ): Promise<UnBlockTargetResponseDTO | UnBlockTargetErrorResponseDTO> {
    try {
      const { targetId } = input;

      // Validate users
      const targetExists = await this.userRepo.existsById(targetId);

      if (!targetExists) {
        throw new UserNotFoundError();
      }

      await this.blocks.unblock({
        blockerId,
        blockedId: targetId,
      });
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
