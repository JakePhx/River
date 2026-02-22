import {
  ConflictError,
  ForbiddenError,
  ValidationError,
} from '../common/errors';

export type FollowDecision =
  | { action: 'FOLLOW_NOW' }
  | { action: 'CREATE_REQUEST' };

export function assertCanFollow(params: {
  followerId: string;
  targetId: string;
  blockedEitherDirection: boolean;
  alreadyFollowing: boolean;
  alreadyRequested: boolean;
  targetIsPrivate: boolean;
}) {
  const {
    followerId,
    targetId,
    blockedEitherDirection,
    alreadyFollowing,
    alreadyRequested,
    targetIsPrivate,
  } = params;

  if (followerId === targetId)
    throw new ValidationError('Cannot follow yourself');
  if (blockedEitherDirection) throw new ForbiddenError('Blocked');
  if (alreadyFollowing) throw new ConflictError('Already following');
  if (alreadyRequested) throw new ConflictError('Request already sent');

  const decision: FollowDecision = targetIsPrivate
    ? { action: 'CREATE_REQUEST' }
    : { action: 'FOLLOW_NOW' };

  return decision;
}

export function assertCanAcceptRequest(params: {
  blockedEitherDirection: boolean;
}) {
  if (params.blockedEitherDirection) throw new ForbiddenError('Blocked');
}

export function assertCanBlock(params: {
  blockerId: string;
  targetId: string;
}) {
  if (params.blockerId === params.targetId)
    throw new ValidationError('Cannot block yourself');
}
