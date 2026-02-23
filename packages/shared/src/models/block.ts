import type { UserId } from './common.js';

// DTO (request body - used only at controller layer)
export type BlockTargetDto = {
  targetUserId: UserId;
};
