import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import type { CommentRepoPort } from '@/post/application/port/comment.repo.port';
import { CommentEntity } from '@/post/domain/comment.entity';
import {
  PrismaUser,
  UserPrismaMapper,
} from '@/user/infra/persistence/prisma/mappers/user.prisma-mapper';

@Injectable()
export class PrismaCommentRepo implements CommentRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(comment: CommentEntity): Promise<void> {
    await this.prisma.comment.create({
      data: {
        id: comment.id.toString(),
        postId: comment.postId,
        authorId: comment.authorId.toString(),
        parentId: comment.parentId ? comment.parentId.toString() : null,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<CommentEntity | null> {
    const row = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: { include: { profile: true } },
      },
    });
    if (!row) return null;
    return CommentEntity.rehydrate({
      id: row.id,
      postId: row.postId,
      authorId: row.authorId,
      parentId: row.parentId,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: UserPrismaMapper.toDomain(row.author as unknown as PrismaUser),
    });
  }

  async findByPostId(postId: string): Promise<CommentEntity[]> {
    const rows = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: { include: { profile: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) =>
      CommentEntity.rehydrate({
        id: row.id,
        postId: row.postId,
        authorId: row.authorId,
        parentId: row.parentId,
        content: row.content,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: UserPrismaMapper.toDomain(row.author as unknown as PrismaUser),
      }),
    );
  }
}
