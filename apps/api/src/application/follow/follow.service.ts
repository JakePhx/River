import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import { NotFoundError } from '../../domain/common/errors';
import {
  assertCanAcceptRequest,
  assertCanFollow,
} from '../../domain/follow/follow.rules';
import type { FollowRepoPort } from './ports/follow-repo.port';
import type { FollowRequestRepoPort } from './ports/follow-request-repo.port';
import type { UserRelationsPort } from './ports/user-relations.port';

@Injectable()
export class FollowService {
  constructor(
    @Inject(TOKENS.FOLLOW_REPO)
    private readonly follows: FollowRepoPort,
    @Inject(TOKENS.FOLLOW_REQUEST_REPO)
    private readonly requests: FollowRequestRepoPort,
    @Inject(TOKENS.USER_RELATIONS)
    private readonly users: UserRelationsPort,
  ) {}

  async follow(myId: string, targetId: string) {
    const targetExists = await this.users.exists(targetId);
    if (!targetExists) throw new NotFoundError('User not found');

    const [
      blockedEitherDirection,
      alreadyFollowing,
      targetIsPrivate,
      alreadyRequested,
    ] = await Promise.all([
      this.users.isBlockedEitherDirection(myId, targetId),
      this.follows.isFollowing(myId, targetId),
      this.users.isPrivate(targetId),
      this.requests.exists(myId, targetId),
    ]);

    const decision = assertCanFollow({
      followerId: myId,
      targetId,
      blockedEitherDirection,
      alreadyFollowing,
      alreadyRequested,
      targetIsPrivate,
    });

    if (decision.action === 'CREATE_REQUEST') {
      await this.requests.create(myId, targetId);
      return { status: 'REQUESTED' as const };
    }

    await this.follows.createFollowTx({
      followerId: myId,
      followingId: targetId,
    });

    // cleanup request if it exists (public now)
    if (alreadyRequested) {
      await this.requests.delete(myId, targetId).catch(() => {});
    }

    return { status: 'FOLLOWING' as const };
  }

  async unfollow(myId: string, targetId: string) {
    const following = await this.follows.isFollowing(myId, targetId);
    if (!following) return { ok: true };
    await this.follows.deleteFollowTx({
      followerId: myId,
      followingId: targetId,
    });
    return { ok: true };
  }

  async cancelRequest(myId: string, targetId: string) {
    const has = await this.requests.exists(myId, targetId);
    if (!has) return { ok: true };
    await this.requests.delete(myId, targetId);
    return { ok: true };
  }

  async acceptRequest(myId: string, requesterId: string) {
    // requester wants to follow me
    const has = await this.requests.exists(requesterId, myId);
    if (!has) throw new NotFoundError('Request not found');

    const blockedEitherDirection = await this.users.isBlockedEitherDirection(
      myId,
      requesterId,
    );
    assertCanAcceptRequest({ blockedEitherDirection });

    await this.follows.createFollowTx({
      followerId: requesterId,
      followingId: myId,
    });
    await this.requests.delete(requesterId, myId);
    return { status: 'FOLLOWING' as const };
  }

  async rejectRequest(myId: string, requesterId: string) {
    await this.requests.delete(requesterId, myId).catch(() => {});
    return { ok: true };
  }
}
