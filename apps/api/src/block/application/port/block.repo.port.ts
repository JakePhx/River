import { BlockEntity } from '@/block/domain/block.entity';
import { UserEntity } from '@/user/domain/entity/user.entity';
import { UserId } from '@/user/domain/value-object/user-id.vo';

export interface BlockRepoPort {
  create(block: BlockEntity): Promise<void>;
  delete(block: BlockEntity): Promise<void>;
  findBlockByBlockerIdAndBlockedId(
    blockerId: UserId,
    blockedId: UserId,
  ): Promise<BlockEntity | null>;
  /** User ids this user has blocked (outgoing blocks only). */
  listBlockedRelatedPeerIds(userId: string): Promise<ReadonlySet<string>>;
  hasBlockingRelationBetween(a: string, b: string): Promise<boolean>;
  /** Users the given user has blocked (outgoing blocks only). */
  listUsersBlockedByBlocker(blockerId: UserId): Promise<UserEntity[]>;
}
