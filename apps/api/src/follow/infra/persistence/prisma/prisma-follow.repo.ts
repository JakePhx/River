import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import { FollowRepoPort } from '@/follow/application/ports/follow.repo.port';
import { FollowEntity } from '@/follow/domain/follow.entity';
import { FollowDatabaseError } from '@/follow/domain/errors';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import {
  PrismaUser,
  UserPrismaMapper,
} from '@/user/infra/persistence/prisma/mappers/user.prisma-mapper';

@Injectable()
export class PrismaFollowRepo implements FollowRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async listAllFollowers(userId: UserId) {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId.toString() },
      include: {
        follower: {
          include: {
            profile: true,
          },
        },
      },
    });
    return followers.map((f) =>
      UserPrismaMapper.toDomain(f.follower as unknown as PrismaUser),
    );
  }

  async listFollowers(
    userId: UserId,
    pagination?: { cursor?: string; take?: number },
  ) {
    const { cursor, take } = pagination ?? {};
    const takeWithExtra = (take ?? 20) + 1;

    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId.toString() },
      take: takeWithExtra,
      cursor: cursor
        ? {
            followerId_followingId: {
              followerId: cursor,
              followingId: userId.toString(),
            },
          }
        : undefined,
      skip: cursor ? 1 : 0,
      include: {
        follower: {
          include: {
            profile: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    const items = [...follows];
    if (items.length > (take ?? 20)) {
      const lastItem = items.pop();
      nextCursor = lastItem?.followerId ?? null;
    }

    return {
      items: items.map((f) =>
        UserPrismaMapper.toDomain(f.follower as unknown as PrismaUser),
      ),
      nextCursor,
    };
  }

  async listFollowing(
    userId: UserId,
    pagination?: { cursor?: string; take?: number },
  ) {
    const { cursor, take } = pagination ?? {};
    const takeWithExtra = (take ?? 20) + 1;

    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId.toString() },
      take: takeWithExtra,
      cursor: cursor
        ? {
            followerId_followingId: {
              followerId: userId.toString(),
              followingId: cursor,
            },
          }
        : undefined,
      skip: cursor ? 1 : 0,
      include: {
        following: {
          include: {
            profile: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    const items = [...follows];
    if (items.length > (take ?? 20)) {
      const lastItem = items.pop();
      nextCursor = lastItem?.followingId ?? null;
    }

    return {
      items: items.map((f) =>
        UserPrismaMapper.toDomain(f.following as unknown as PrismaUser),
      ),
      nextCursor,
    };
  }

  async findFollowByFollowerIdAndFollowingId(
    followerId: UserId,
    followingId: UserId,
  ): Promise<FollowEntity | null> {
    try {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: followerId.toString(),
            followingId: followingId.toString(),
          },
        },
      });
      if (!follow) return null;
      return FollowEntity.create({
        followerId,
        followingId,
      });
    } catch (e) {
      throw new FollowDatabaseError();
    }
  }

  async create(follow: FollowEntity) {
    try {
      const { followerId, followingId } = follow;
      await this.prisma.$transaction(async (tx) => {
        await tx.follow.create({
          data: {
            followerId: followerId.toString(),
            followingId: followingId.toString(),
          },
        });

        await tx.user.update({
          where: { id: followerId.toString() },
          data: { followingCount: { increment: 1 } },
        });
        await tx.user.update({
          where: { id: followingId.toString() },
          data: { followersCount: { increment: 1 } },
        });
      });
    } catch (e) {
      throw new FollowDatabaseError();
    }
  }

  async delete(follow: FollowEntity) {
    try {
      const { followerId, followingId } = follow;
      await this.prisma.$transaction(async (tx) => {
        await tx.follow.delete({
          where: {
            followerId_followingId: {
              followerId: followerId.toString(),
              followingId: followingId.toString(),
            },
          },
        });

        await tx.user.update({
          where: { id: followerId.toString() },
          data: { followingCount: { decrement: 1 } },
        });
        await tx.user.update({
          where: { id: followingId.toString() },
          data: { followersCount: { decrement: 1 } },
        });
      });
    } catch (e) {
      throw new FollowDatabaseError();
    }
  }
}
