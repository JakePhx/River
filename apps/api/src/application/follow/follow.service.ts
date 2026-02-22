import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../domain/common/errors';
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
    if (myId === targetId) throw new ValidationError('Cannot follow yourself');
    if (!(await this.users.exists(targetId)))
      throw new NotFoundError('User not found');

    if (await this.users.isBlockedEitherDirection(myId, targetId))
      throw new ForbiddenError('Blocked');
    if (await this.follows.isFollowing(myId, targetId))
      throw new ConflictError('Already following');

    const targetPrivate = await this.users.isPrivate(targetId);
    if (targetPrivate) {
      if (await this.requests.exists(myId, targetId))
        throw new ConflictError('Request already sent');
      await this.requests.create(myId, targetId);
      return { status: 'REQUESTED' as const };
    }

    await this.follows.createFollowTx({
      followerId: myId,
      followingId: targetId,
    });
    // cleanup request if any exists
    await this.requests.delete(myId, targetId).catch(() => {});
    return { status: 'FOLLOWING' as const };
  }

  async unfollow(myId: string, targetId: string) {
    if (!(await this.follows.isFollowing(myId, targetId))) return { ok: true };
    await this.follows.deleteFollowTx({
      followerId: myId,
      followingId: targetId,
    });
    return { ok: true };
  }

  async cancelRequest(myId: string, targetId: string) {
    if (!(await this.requests.exists(myId, targetId))) return { ok: true };
    await this.requests.delete(myId, targetId);
    return { ok: true };
  }

  async acceptRequest(myId: string, requesterId: string) {
    // requester wants to follow me
    if (!(await this.requests.exists(requesterId, myId)))
      throw new NotFoundError('Request not found');
    if (await this.users.isBlockedEitherDirection(myId, requesterId))
      throw new ForbiddenError('Blocked');

    // create follow + counters
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
