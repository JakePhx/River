import type { FollowKey, FollowRequestKey } from '../../_shared/models/ids';

// Backend-only records
export type FollowRecord = FollowKey & { createdAt: Date };
export type FollowRequestRecord = FollowRequestKey & { createdAt: Date };

// Application input models
export type FollowTargetInput = {
  targetUserId: string;
};

export type FollowRequestDecisionInput = {
  requesterId: string;
};
