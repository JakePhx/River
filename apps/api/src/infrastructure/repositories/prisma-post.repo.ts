import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostRepoPort } from '../../application/post/ports/post-repo.port';

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

  async feed(userId: string) {
    // posts by following + self
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const ids = [userId, ...following.map((f) => f.followingId)];

    const posts = await this.prisma.post.findMany({
      where: { authorId: { in: ids } },
      select: {
        id: true,
        authorId: true,
        content: true,
        createdAt: true,
        author: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return posts.map((p) => ({
      id: p.id,
      authorId: p.authorId,
      username: p.author.username,
      content: p.content,
      createdAt: p.createdAt,
    }));
  }
}
