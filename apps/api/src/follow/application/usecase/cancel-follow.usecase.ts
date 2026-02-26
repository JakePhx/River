import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import type { FollowRequestRepo } from '../ports/follow-request-repo.port';
import type { UserRepo } from '@/user/application/port/user.repo';
import { CancelFollowBodyDTO } from '@/follow/interface/dto/follow-target.body.dto';
import {
  CancelFollowResponseDTO,
  CancelFollowErrorResponseDTO,
} from '@/follow/interface/dto/follow-target.response.dto';
import { UserNotFoundError } from '@/user/domain/error/user-error-code';

@Injectable()
export class CancelFollowUseCase {
  constructor(
    @Inject(TOKENS.FOLLOW_REQUEST_REPO)
    private readonly followRequestRepo: FollowRequestRepo,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepo,
  ) {}

  async execute(
    userId: string,
    input: CancelFollowBodyDTO,
  ): Promise<CancelFollowResponseDTO | CancelFollowErrorResponseDTO> {
    try {
      const targetId = input.targetUserId;

      // Validate users
      const requesterExists = await this.userRepo.existsById(userId);

      if (!requesterExists) {
        throw new UserNotFoundError();
      }

      const has = await this.followRequestRepo.exists(userId, targetId);
      if (!has) return { ok: true };
      await this.followRequestRepo.delete(userId, targetId);
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
