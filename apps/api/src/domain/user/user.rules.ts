import { ForbiddenError } from '../common/errors';

export function assertUserIsActive(isActive: boolean) {
  if (!isActive) throw new ForbiddenError('User is inactive');
}

export function canViewPrivateAccount(params: {
  targetIsPrivate: boolean;
  viewerId: string | null;
  targetId: string;
  viewerFollowsTarget: boolean;
}) {
  const { targetIsPrivate, viewerId, targetId, viewerFollowsTarget } = params;

  if (!targetIsPrivate) return true;
  if (!viewerId) return false;
  if (viewerId === targetId) return true;
  return viewerFollowsTarget;
}

export function assertNotBlocked(blockedEitherDirection: boolean) {
  if (blockedEitherDirection) throw new ForbiddenError('Blocked');
}
