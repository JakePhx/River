import type { BlockKey } from '../../_shared/models/ids';

// Backend-only record
export type BlockRecord = BlockKey & { createdAt: Date };

// Application input models
export type BlockTargetInput = {
  targetUserId: string;
};
