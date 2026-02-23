import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../tokens';
import { NotFoundError } from '../../../domain/common/errors';
import { assertCanAcceptRequest } from '../../../domain/follow/follow.rules';
import type { FollowRepoPort } from '../ports/follow-repo.port';
import type { FollowRequestRepoPort } from '../ports/follow-request-repo.port';
import type { UserRelationsPort } from '../ports/user-relations.port';
import type { FollowRequestDecisionInput } from '../models/follow.models';
import type { FollowActionResultRes } from '@social/shared';
import type { UserId } from '../../_shared/models/ids';

@Injectable()
export class AcceptFollowRequestUseCase {
  constructor(
    @Inject(TOKENS.FOLLOW_REPO)
    private readonly follows: FollowRepoPort,
    @Inject(TOKENS.FOLLOW_REQUEST_REPO)
    private readonly requests: FollowRequestRepoPort,
    @Inject(TOKENS.USER_RELATIONS)
    private readonly users: UserRelationsPort,
  ) {}

  async execute(requestedId: UserId, input: FollowRequestDecisionInput): Promise<FollowActionResultRes> {
    const { requesterId } = input;
    const has = await this.requests.exists(requesterId, requestedId);
    if (!has) throw new NotFoundError('Request not found');

    const blocked = await this.users.isBlockedEitherDirection(
      requestedId,
      requesterId,
    );
    assertCanAcceptRequest({ blockedEitherDirection: blocked });

    await this.follows.createFollowTx({
      followerId: requesterId,
      followingId: requestedId,
    });
    await this.requests.delete(requesterId, requestedId);
    return { status: 'FOLLOWING' };
  }
}
