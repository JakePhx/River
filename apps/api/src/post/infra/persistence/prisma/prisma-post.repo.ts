import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import { PostRepoPort } from '../../application/ports/post-repo.port';

@Injectable()
export class PrismaPostRepo implements PostRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async createPostTx(authorId: string, content: string) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: { authorId, content },
        select: { id: true, content: true, createdAt: true },
      });
      await tx.user.update({
        where: { id: authorId },
        data: { postCount: { increment: 1 } },
      });
      return post;
    });
  }

  async feed(userId: string, cursor?: string, take?: number) {
    const takeWithExtra = take ? take + 1 : 21;
    // posts by following + self
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const ids = [userId, ...following.map((f) => f.followingId)];

    const posts = await this.prisma.post.findMany({
      where: { authorId: { in: ids } },
      take: takeWithExtra,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      select: {
        id: true,
        authorId: true,
        content: true,
        createdAt: true,
        author: { select: { username: true } },
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
      items: items.map((p) => ({
        id: p.id,
        authorId: p.authorId,
        username: p.author.username,
        content: p.content,
        createdAt: p.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }
}
