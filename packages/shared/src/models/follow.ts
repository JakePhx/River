import type { UserId } from './common';

// DTOs (request body - used only at controller layer)
export type FollowTargetDto = {
  targetUserId: UserId;
};

export type FollowRequestDecisionDto = {
  requesterId: UserId;
};

// Response (API output)
export type FollowActionResultRes = {
  ok: true;
  status: 'FOLLOWING' | 'REQUESTED';
};
