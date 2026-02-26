import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import { NotFoundError } from '@/_shared/domain/errors';
import type { FollowRepo } from '../ports/follow-repo.port';
import type { FollowRequestRepo } from '../ports/follow-request-repo.port';
import type { UserRepo } from '@/user/application/port/user.repo';
import { AcceptFollowBodyDTO } from '@/follow/interface/dto/accept-follow.body.dto';
import {
  AcceptFollowErrorResponseDTO,
  AcceptFollowResponseDTO,
} from '@/follow/interface/dto/accept-follow.response';
import { UserNotFoundError } from '@/user/domain/error/user-error-code';

@Injectable()
export class AcceptFollowUseCase {
  constructor(
    @Inject(TOKENS.FOLLOW_REPO)
    private readonly followRepo: FollowRepo,
    @Inject(TOKENS.FOLLOW_REQUEST_REPO)
    private readonly followRequestRepo: FollowRequestRepo,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepo,
  ) {}

  async execute(
    userId: string,
    input: AcceptFollowBodyDTO,
  ): Promise<AcceptFollowResponseDTO | AcceptFollowErrorResponseDTO> {
    try {
      const { requesterId } = input;

      // Validate users
      const requesterExists = await this.userRepo.existsById(requesterId);

      if (!requesterExists) {
        throw new UserNotFoundError();
      }

      const has = await this.followRequestRepo.exists(requesterId, userId);
      if (!has) throw new NotFoundError('Request not found');

      await this.followRepo.create({
        followerId: requesterId,
        followingId: userId,
      });
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
