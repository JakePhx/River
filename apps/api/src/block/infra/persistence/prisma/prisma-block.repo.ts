import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import { BlockRepo } from '../../application/port/block-repo';

@Injectable()
export class PrismaBlockRepo implements BlockRepo {
  constructor(private readonly prisma: PrismaService) {}

  async exists(params: { blockerId: string; blockedId: string }) {
    const { blockerId, blockedId } = params;
    const row = await this.prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      select: { blockerId: true },
    });
    return !!row;
  }

  async blockTx(params: { blockerId: string; blockedId: string }) {
    const { blockerId, blockedId } = params;
    await this.prisma.$transaction(async (tx) => {
      await tx.block.create({ data: { blockerId, blockedId } });

      // remove follows both ways and fix counters if existed
      const aFollowsB = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: blockerId,
            followingId: blockedId,
          },
        },
        select: { followerId: true },
      });
      if (aFollowsB) {
        await tx.follow.delete({
          where: {
            followerId_followingId: {
              followerId: blockerId,
              followingId: blockedId,
            },
          },
        });
        await tx.user.update({
          where: { id: blockerId },
          data: { followingCount: { decrement: 1 } },
        });
        await tx.user.update({
          where: { id: blockedId },
          data: { followersCount: { decrement: 1 } },
        });
      }

      const bFollowsA = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: blockedId,
            followingId: blockerId,
          },
        },
        select: { followerId: true },
      });
      if (bFollowsA) {
        await tx.follow.delete({
          where: {
            followerId_followingId: {
              followerId: blockedId,
              followingId: blockerId,
            },
          },
        });
        await tx.user.update({
          where: { id: blockedId },
          data: { followingCount: { decrement: 1 } },
        });
        await tx.user.update({
          where: { id: blockerId },
          data: { followersCount: { decrement: 1 } },
        });
      }

      // remove follow requests both ways
      await tx.followRequest.deleteMany({
        where: {
          OR: [
            { requesterId: blockerId, requestedId: blockedId },
            { requesterId: blockedId, requestedId: blockerId },
          ],
        },
      });
    });
  }

  async unblock(params: { blockerId: string; blockedId: string }) {
    const { blockerId, blockedId } = params;
    try {
      await this.prisma.block.delete({
        where: { blockerId_blockedId: { blockerId, blockedId } },
      });
    } catch (e) {
      // Ignore if doesn't exist
    }
  }
}
