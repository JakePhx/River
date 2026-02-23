import type { UserId } from './common.js';

// DTOs (request body - used only at controller layer)
export type FollowTargetDto = {
  targetUserId: UserId;
};

export type FollowRequestDecisionDto = {
  requesterId: UserId;
};

// Response (API output)
export type FollowActionResultRes =
  | { status: 'FOLLOWING' }
  | { status: 'REQUESTED' };
