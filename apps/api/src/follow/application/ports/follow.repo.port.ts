import { FollowEntity } from '@/follow/domain/follow.entity';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { UserEntity } from '@/user/domain/entity/user.entity';

export interface FollowRepoPort {
  create(follow: FollowEntity): Promise<void>;
  delete(follow: FollowEntity): Promise<void>;
  findFollowByFollowerIdAndFollowingId(
    followerId: UserId,
    followingId: UserId,
  ): Promise<FollowEntity | null>;
  listFollowers(
    userId: UserId,
    pagination?: { cursor?: string; take?: number },
  ): Promise<{ items: UserEntity[]; nextCursor: string | null }>;
  listAllFollowers(userId: UserId): Promise<UserEntity[]>;
  listFollowing(
    userId: UserId,
    pagination?: { cursor?: string; take?: number },
  ): Promise<{ items: UserEntity[]; nextCursor: string | null }>;
}
