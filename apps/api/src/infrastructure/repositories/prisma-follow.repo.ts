import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowRepoPort } from '../../application/follow/ports/follow-repo.port';

@Injectable()
export class PrismaFollowRepo implements FollowRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async isFollowing(followerId: string, followingId: string) {
    const row = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
      select: { followerId: true },
    });
    return !!row;
  }

  async createFollowTx(data: { followerId: string; followingId: string }) {
    await this.prisma.$transaction(async (tx) => {
      await tx.follow.create({ data });

      await tx.user.update({
        where: { id: data.followerId },
        data: { followingCount: { increment: 1 } },
      });
      await tx.user.update({
        where: { id: data.followingId },
        data: { followersCount: { increment: 1 } },
      });
    });
  }

  async deleteFollowTx(data: { followerId: string; followingId: string }) {
    await this.prisma.$transaction(async (tx) => {
      await tx.follow.delete({ where: { followerId_followingId: data } });

      await tx.user.update({
        where: { id: data.followerId },
        data: { followingCount: { decrement: 1 } },
      });
      await tx.user.update({
        where: { id: data.followingId },
        data: { followersCount: { decrement: 1 } },
      });
    });
  }
}
