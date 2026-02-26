// Re-export from shared; internal composite keys stay here
export type { UserId, PostId, ProfileId } from '@social/shared';

// composite ids (backend-only, for ports/repos)
export type BlockKey = { blockerId: string; blockedId: string };
export type FollowKey = { followerId: string; followingId: string };
export type FollowRequestKey = { requesterId: string; requestedId: string };
