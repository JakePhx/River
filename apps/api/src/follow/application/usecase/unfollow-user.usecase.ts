import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import type { FollowRepo } from '../ports/follow-repo.port';
import type { UserRepo } from '@/user/application/port/user.repo';
import { UnFollowTargetBodyDTO } from '@/follow/interface/dto/follow-target.body.dto';
import {
  UnFollowTargetResponseDTO,
  UnFollowTargetErrorResponseDTO,
} from '@/follow/interface/dto/follow-target.response.dto';
import { UserNotFoundError } from '@/user/domain/error/user-error-code';

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    @Inject(TOKENS.FOLLOW_REPO)
    private readonly followRepo: FollowRepo,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepo,
  ) {}

  async execute(
    userId: string,
    input: UnFollowTargetBodyDTO,
  ): Promise<UnFollowTargetResponseDTO | UnFollowTargetErrorResponseDTO> {
    try {
      const targetId = input.targetUserId;

      // Validate users
      const targetExists = await this.userRepo.existsById(targetId);

      if (!targetExists) {
        throw new UserNotFoundError();
      }

      const following = await this.followRepo.exists(userId, targetId);
      if (!following) return { ok: true };
      await this.followRepo.delete({
        followerId: userId,
        followingId: targetId,
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
