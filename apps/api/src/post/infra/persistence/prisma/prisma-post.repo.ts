import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import type { PostRepoPort } from '@/post/application/port/post.repo.port';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { PostEntity } from '@/post/domain/post.entity';
import {
  PrismaUser,
  UserPrismaMapper,
} from '@/user/infra/persistence/prisma/mappers/user.prisma-mapper';

@Injectable()
export class PrismaPostRepo implements PostRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(post: PostEntity): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.post.create({
        data: {
          id: post.id.toString(),
          authorId: post.authorId.toString(),
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
      });
      await tx.user.update({
        where: { id: post.authorId.toString() },
        data: { postCount: { increment: 1 } },
      });
    });
  }

  async feed(userId: UserId, pagination?: { cursor?: string; take?: number }) {
    const { cursor, take } = pagination ?? {};
    const takeWithExtra = take ? take + 1 : 21;
    // posts by following + self
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId.toString() },
      select: { followingId: true },
    });

    const ids = [userId.toString(), ...following.map((f) => f.followingId)];

    const posts = await this.prisma.post.findMany({
      where: { authorId: { in: ids } },
      take: takeWithExtra,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: string | null = null;
    const items = [...posts];
    if (take && items.length > take) {
      const lastItem = items.pop();
      nextCursor = lastItem?.id ?? null;
    } else if (!take && items.length > 20) {
      const lastItem = items.pop();
      nextCursor = lastItem?.id ?? null;
    }

    return {
      items: items.map((p) =>
        PostEntity.rehydrate({
          id: p.id,
          authorId: p.authorId,
          content: p.content,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          author: UserPrismaMapper.toDomain(p.author as unknown as PrismaUser),
        }),
      ),
      nextCursor,
    };
  }

  async findByAuthorId(
    authorId: UserId,
    pagination?: { cursor?: string; take?: number },
  ) {
    const { cursor, take } = pagination ?? {};
    const takeWithExtra = (take ?? 20) + 1;

    const posts = await this.prisma.post.findMany({
      where: { authorId: authorId.toString() },
      take: takeWithExtra,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: string | null = null;
    const items = [...posts];
    if (items.length > (take ?? 20)) {
      const lastItem = items.pop();
      nextCursor = lastItem?.id ?? null;
    }

    return {
      items: items.map((p) =>
        PostEntity.rehydrate({
          id: p.id,
          authorId: p.authorId,
          content: p.content,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          author: UserPrismaMapper.toDomain(p.author as unknown as PrismaUser),
        }),
      ),
      nextCursor,
    };
  }
}
