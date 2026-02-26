import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import type { FollowRepo } from '../ports/follow-repo.port';
import type { UserRepo } from '@/user/application/port/user.repo';
import { FollowTargetBodyDTO } from '@/follow/interface/dto/follow-target.body.dto';
import {
  FollowTargetResponseDTO,
  FollowTargetErrorResponseDTO,
} from '@/follow/interface/dto/follow-target.response.dto';
import { UserNotFoundError } from '@/user/domain/error/user-error-code';

@Injectable()
export class FollowUserUseCase {
  constructor(
    @Inject(TOKENS.FOLLOW_REPO)
    private readonly followRepo: FollowRepo,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepo,
  ) {}

  async execute(
    userId: string,
    input: FollowTargetBodyDTO,
  ): Promise<FollowTargetResponseDTO | FollowTargetErrorResponseDTO> {
    try {
      const targetId = input.targetUserId;

      // Validate users
      const requesterExists = await this.userRepo.existsById(userId);

      if (!requesterExists) {
        throw new UserNotFoundError();
      }

      await this.followRepo.create({
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
