import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import type { UserRepo } from '@/user/application/port/user.repo';
import { RejectFollowBodyDTO } from '@/follow/interface/dto/accept-follow.body.dto';
import type { FollowRequestRepo } from '../ports/follow-request-repo.port';
import {
  RejectFollowResponseDTO,
  RejectFollowErrorResponseDTO,
} from '@/follow/interface/dto/accept-follow.response';
import { UserNotFoundError } from '@/user/domain/error/user-error-code';

@Injectable()
export class RejectFollowUseCase {
  constructor(
    @Inject(TOKENS.FOLLOW_REQUEST_REPO)
    private readonly followRequestRepo: FollowRequestRepo,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepo,
  ) {}

  async execute(
    userId: string,
    input: RejectFollowBodyDTO,
  ): Promise<RejectFollowResponseDTO | RejectFollowErrorResponseDTO> {
    try {
      const { requesterId } = input;

      // Validate users
      const requesterExists = await this.userRepo.existsById(requesterId);

      if (!requesterExists) {
        throw new UserNotFoundError();
      }

      await this.followRequestRepo.delete(requesterId, userId);
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
