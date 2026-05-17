import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import type { PostRepoPort } from '@/post/application/port/post.repo.port';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { PostEntity } from '@/post/domain/post.entity';
import {
  PrismaUser,
  UserPrismaMapper,
} from '@/user/infra/persistence/prisma/mappers/user.prisma-mapper';
import { mapPrismaAttachments } from './mappers/post-attachment.prisma-mapper';
import { postWithAuthorAndAttachments } from './post.include';

@Injectable()
export class PrismaPostRepo implements PostRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(postId: string): Promise<PostEntity | null> {
    const row = await this.prisma.post.findUnique({
      where: { id: postId },
      include: postWithAuthorAndAttachments,
    });
    if (!row) return null;
    return PostEntity.rehydrate({
      id: row.id,
      authorId: row.authorId,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      attachments: mapPrismaAttachments(row.attachments),
      author: UserPrismaMapper.toDomain(row.author as unknown as PrismaUser),
    });
  }

  async create(post: PostEntity): Promise<PostEntity> {
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
      if (post.attachments.length > 0) {
        await tx.postAttachment.createMany({
          data: post.attachments.map((a, i) => ({
            postId: post.id.toString(),
            url: a.url,
            contentType: a.contentType,
            byteSize: a.byteSize,
            kind: a.kind,
            position: i,
          })),
        });
      }
      await tx.user.update({
        where: { id: post.authorId.toString() },
        data: { postCount: { increment: 1 } },
      });
    });

    const saved = await this.findById(post.id.toString());
    if (!saved) {
      throw new Error('Post was created but could not be reloaded');
    }
    return saved;
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
      include: postWithAuthorAndAttachments,
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
          attachments: mapPrismaAttachments(p.attachments),
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
      include: postWithAuthorAndAttachments,
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
          attachments: mapPrismaAttachments(p.attachments),
          author: UserPrismaMapper.toDomain(p.author as unknown as PrismaUser),
        }),
      ),
      nextCursor,
    };
  }

  async update(post: PostEntity): Promise<void> {
    await this.prisma.post.update({
      where: { id: post.id.toString() },
      data: {
        content: post.content,
        updatedAt: post.updatedAt,
      },
    });
  }

  async deleteById(postId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const row = await tx.post.findUnique({ where: { id: postId } });
      if (!row) return;
      await tx.post.delete({ where: { id: postId } });
      await tx.user.update({
        where: { id: row.authorId },
        data: { postCount: { decrement: 1 } },
      });
    });
  }
}
