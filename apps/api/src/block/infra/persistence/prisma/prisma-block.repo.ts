import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import { BlockEntity } from '@/block/domain/block.entity';
import { AlreadyBlockedError, BlockDatabaseError } from '@/block/domain/errors';
import {
  PrismaUser,
  UserPrismaMapper,
} from '@/user/infra/persistence/prisma/mappers/user.prisma-mapper';
import { UserId } from '@/user/domain/value-object/user-id.vo';

function prismaErrorCode(e: unknown): string | undefined {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    const c = (e as { code: unknown }).code;
    return typeof c === 'string' ? c : undefined;
  }
  return undefined;
}

@Injectable()
export class PrismaBlockRepo implements BlockRepoPort {
  private readonly logger = new Logger(PrismaBlockRepo.name);

  constructor(private readonly prisma: PrismaService) {}

  private logAndRethrow(e: unknown, operation: string): never {
    const code = prismaErrorCode(e);
    const msg = e instanceof Error ? e.message : String(e);
    this.logger.warn(`Block DB ${operation} failed${code ? ` [${code}]` : ''}: ${msg}`);
    throw new BlockDatabaseError();
  }

  async exists(block: BlockEntity) {
    try {
      return !!(await this.prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: block.blockerId.toString(),
            blockedId: block.blockedId.toString(),
          },
        },
        select: { blockerId: true },
      }));
    } catch (e) {
      this.logAndRethrow(e, 'exists');
    }
  }

  async create(block: BlockEntity) {
    try {
      const { blockerId, blockedId } = block;
      await this.prisma.$transaction(async (tx) => {
        await tx.block.create({
          data: {
            blockerId: blockerId.toString(),
            blockedId: blockedId.toString(),
          },
        });

        // remove follows both ways and fix counters if existed
        const aFollowsB = await tx.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: blockerId.toString(),
              followingId: blockedId.toString(),
            },
          },
          select: { followerId: true },
        });
        if (aFollowsB) {
          await tx.follow.delete({
            where: {
              followerId_followingId: {
                followerId: blockerId.toString(),
                followingId: blockedId.toString(),
              },
            },
          });
          await tx.user.update({
            where: { id: blockerId.toString() },
            data: { followingCount: { decrement: 1 } },
          });
          await tx.user.update({
            where: { id: blockedId.toString() },
            data: { followersCount: { decrement: 1 } },
          });
        }

        const bFollowsA = await tx.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: blockedId.toString(),
              followingId: blockerId.toString(),
            },
          },
          select: { followerId: true },
        });
        if (bFollowsA) {
          await tx.follow.delete({
            where: {
              followerId_followingId: {
                followerId: blockedId.toString(),
                followingId: blockerId.toString(),
              },
            },
          });
          await tx.user.update({
            where: { id: blockedId.toString() },
            data: { followingCount: { decrement: 1 } },
          });
          await tx.user.update({
            where: { id: blockerId.toString() },
            data: { followersCount: { decrement: 1 } },
          });
        }

        // remove follow requests both ways
        await tx.followRequest.deleteMany({
          where: {
            OR: [
              {
                requesterId: blockerId.toString(),
                requestedId: blockedId.toString(),
              },
              {
                requesterId: blockedId.toString(),
                requestedId: blockerId.toString(),
              },
            ],
          },
        });
      });
    } catch (e) {
      if (prismaErrorCode(e) === 'P2002') {
        throw new AlreadyBlockedError();
      }
      this.logAndRethrow(e, 'create');
    }
  }

  async delete(block: BlockEntity) {
    try {
      await this.prisma.block.delete({
        where: {
          blockerId_blockedId: {
            blockerId: block.blockerId.toString(),
            blockedId: block.blockedId.toString(),
          },
        },
      });
    } catch (e) {
      this.logAndRethrow(e, 'delete');
    }
  }

  async findBlockByBlockerIdAndBlockedId(blockerId: UserId, blockedId: UserId) {
    try {
      const block = await this.prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: blockerId.toString(),
            blockedId: blockedId.toString(),
          },
        },
      });

      if (!block) return null;
      return BlockEntity.rehydrate({
        blockerId: block.blockerId,
        blockedId: block.blockedId,
        createdAt: block.createdAt,
      });
    } catch (e) {
      this.logAndRethrow(e, 'findBlockByBlockerIdAndBlockedId');
    }
  }

  async listBlockedRelatedPeerIds(userId: string): Promise<ReadonlySet<string>> {
    if (!userId) {
      return new Set();
    }
    try {
      const outgoing = await this.prisma.block.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      });
      return new Set(outgoing.map((r) => r.blockedId));
    } catch (e) {
      this.logAndRethrow(e, 'listBlockedRelatedPeerIds');
    }
  }

  async hasBlockingRelationBetween(a: string, b: string): Promise<boolean> {
    if (!a || !b) {
      return false;
    }
    try {
      const [one, two] = await Promise.all([
        this.prisma.block.findUnique({
          where: {
            blockerId_blockedId: { blockerId: a, blockedId: b },
          },
          select: { blockerId: true },
        }),
        this.prisma.block.findUnique({
          where: {
            blockerId_blockedId: { blockerId: b, blockedId: a },
          },
          select: { blockerId: true },
        }),
      ]);
      return !!(one || two);
    } catch (e) {
      this.logAndRethrow(e, 'hasBlockingRelationBetween');
    }
  }

  async listUsersBlockedByBlocker(blockerId: UserId) {
    try {
      const blocks = await this.prisma.block.findMany({
        where: { blockerId: blockerId.toString() },
        orderBy: { createdAt: 'desc' },
        include: {
          blocked: {
            include: { profile: true },
          },
        },
      });
      return blocks.map((b) =>
        UserPrismaMapper.toDomain(b.blocked as unknown as PrismaUser),
      );
    } catch (e) {
      this.logAndRethrow(e, 'listUsersBlockedByBlocker');
    }
  }
}
