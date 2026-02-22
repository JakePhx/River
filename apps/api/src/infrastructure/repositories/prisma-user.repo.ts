import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserAuthRepoPort } from '../../application/auth/ports/user-auth-repo.port';
import { UserReadRepoPort } from '../../application/user/ports/user-read-repo.port';
import { UserRelationsPort } from '../../application/follow/ports/user-relations.port';
import { UserVisibilityPort } from '../../application/profile/ports/user-visibility.port';

@Injectable()
export class PrismaUserRepo
  implements
    UserAuthRepoPort,
    UserReadRepoPort,
    UserRelationsPort,
    UserVisibilityPort
{
  constructor(private readonly prisma: PrismaService) {}

  // Auth
  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        isActive: true,
      },
    });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        isActive: true,
      },
    });
  }

  createUser(data: { email: string; username: string; password: string }) {
    return this.prisma.user.create({
      data,
      select: { id: true, email: true, username: true, role: true },
    });
  }

  // User
  getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isPrivate: true,
        isActive: true,
        postCount: true,
        followersCount: true,
        followingCount: true,
      },
    });
  }

  async setPrivacy(userId: string, isPrivate: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isPrivate },
    });
  }

  // Relations/Visibility
  async exists(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return !!u;
  }

  async isPrivate(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPrivate: true },
    });
    return u?.isPrivate ?? false;
  }

  async isBlockedEitherDirection(a: string, b: string) {
    const row = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: a, blockedId: b },
          { blockerId: b, blockedId: a },
        ],
      },
      select: { blockerId: true },
    });
    return !!row;
  }

  async canViewPrivateContent(viewerId: string | null, targetId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { isPrivate: true },
    });
    if (!target) return false;
    if (!target.isPrivate) return true;
    if (!viewerId) return false;
    if (viewerId === targetId) return true;

    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: viewerId, followingId: targetId },
      },
      select: { followerId: true },
    });
    return !!follow;
  }
}
