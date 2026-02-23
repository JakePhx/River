import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../tokens';
import { NotFoundError } from '../../../domain/common/errors';
import { assertCanFollow } from '../../../domain/follow/follow.rules';
import type { FollowRepoPort } from '../ports/follow-repo.port';
import type { FollowRequestRepoPort } from '../ports/follow-request-repo.port';
import type { UserRelationsPort } from '../ports/user-relations.port';
import type {
  FollowTargetInput,
} from '../models/follow.models';
import type { FollowActionResultRes } from '@social/shared';
import type { UserId } from '../../_shared/models/ids';

@Injectable()
export class FollowUserUseCase {
  constructor(
    @Inject(TOKENS.FOLLOW_REPO)
    private readonly follows: FollowRepoPort,
    @Inject(TOKENS.FOLLOW_REQUEST_REPO)
    private readonly requests: FollowRequestRepoPort,
    @Inject(TOKENS.USER_RELATIONS)
    private readonly users: UserRelationsPort,
  ) {}

  async execute(followerId: UserId, input: FollowTargetInput): Promise<FollowActionResultRes> {
    const targetId = input.targetUserId;
    if (!(await this.users.exists(targetId)))
      throw new NotFoundError('User not found');

    const [blocked, alreadyFollowing, targetIsPrivate, alreadyRequested] =
      await Promise.all([
        this.users.isBlockedEitherDirection(followerId, targetId),
        this.follows.isFollowing(followerId, targetId),
        this.users.isPrivate(targetId),
        this.requests.exists(followerId, targetId),
      ]);

    const decision = assertCanFollow({
      followerId,
      targetId,
      blockedEitherDirection: blocked,
      alreadyFollowing,
      alreadyRequested,
      targetIsPrivate,
    });

    if (decision.action === 'CREATE_REQUEST') {
      await this.requests.create(followerId, targetId);
      return { status: 'REQUESTED' };
    }

    await this.follows.createFollowTx({
      followerId,
      followingId: targetId,
    });

    if (alreadyRequested)
      await this.requests.delete(followerId, targetId).catch(() => {});
    return { status: 'FOLLOWING' };
  }
}
