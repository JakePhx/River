import type { UserId } from './common';

// DTO (request body - used only at controller layer)
export type BlockTargetDto = {
  targetUserId: UserId;
};
