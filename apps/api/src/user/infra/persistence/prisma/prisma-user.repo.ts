import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../domain/entity/user.entity';
import { UserRepo } from '../../../application/port/user.repo';
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import { UserPrismaMapper, PrismaUser } from './mappers/user.prisma-mapper';

@Injectable()
export class PrismaUserRepo implements UserRepo {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: UserEntity): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id.toString() },
    });

    const data = {
      email: user.email.toString(),
      username: user.username.toString(),
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role,
      isPrivate: user.isPrivate,
      isActive: user.isActive,
      postCount: user.postCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      updatedAt: user.updatedAt,
    };
    const profileData = {
      title: user.profile.title,
      company: user.profile.company,
      bio: user.profile.bio,
      gender: user.profile.gender,
      website: user.profile.website,
      birthDate: user.profile.birthDate,
      location: user.profile.location,
      contact: user.profile.contact,
      avatarUrl: user.profile.avatarUrl,
      updatedAt: user.profile.updatedAt,
    };

    if (existingUser) {
      await this.prisma.user.update({
        where: { id: user.id.toString() },
        data,
      });
      await this.prisma.profile.update({
        where: { userId: user.id.toString() },
        data: profileData,
      });
    } else {
      await this.prisma.user.create({
        data: {
          ...data,
          id: user.id.toString(),
          createdAt: user.createdAt,
        },
      });
      await this.prisma.profile.create({
        data: {
          ...profileData,
          id: user.profile.id,
          userId: user.id.toString(),
          createdAt: user.profile.createdAt,
        },
      });
    }
  }
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        isPrivate: true,
        isActive: true,
        postCount: true,
        followersCount: true,
        followingCount: true,
        profile: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            title: true,
            company: true,
            bio: true,
            gender: true,
            website: true,
            birthDate: true,
            location: true,
            contact: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) return null;
    return UserPrismaMapper.toDomain(user as unknown as PrismaUser);
  }
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        isPrivate: true,
        isActive: true,
        postCount: true,
        followersCount: true,
        followingCount: true,
        profile: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            title: true,
            company: true,
            bio: true,
            gender: true,
            website: true,
            birthDate: true,
            location: true,
            contact: true,
            avatarUrl: true,
          },
        },
      },
    });
    if (!user) return null;
    return UserPrismaMapper.toDomain(user as unknown as PrismaUser);
  }
  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        isPrivate: true,
        isActive: true,
        postCount: true,
        followersCount: true,
        followingCount: true,
        profile: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            title: true,
            company: true,
            bio: true,
            gender: true,
            website: true,
            birthDate: true,
            location: true,
            contact: true,
            avatarUrl: true,
          },
        },
      },
    });
    if (!user) return null;
    return UserPrismaMapper.toDomain(user as unknown as PrismaUser);
  }
  async list(params: {
    cursor?: string;
    take: number;
    query?: string;
  }): Promise<{ items: UserEntity[]; nextCursor: string | null }> {
    const users = await this.prisma.user.findMany({
      take: params.take ? params.take + 1 : 21,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      skip: params.cursor ? 1 : 0,
      orderBy: { id: 'asc' },
      where: {
        OR: [
          { email: { contains: params.query ?? '', mode: 'insensitive' } },
          { username: { contains: params.query ?? '', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        isPrivate: true,
        isActive: true,
        postCount: true,
        followersCount: true,
        followingCount: true,
        profile: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            title: true,
            company: true,
            bio: true,
            gender: true,
            website: true,
            birthDate: true,
            location: true,
            contact: true,
            avatarUrl: true,
          },
        },
      },
    });
    let nextCursor: string | null = null;

    if (users.length > params.take) {
      const nextItem = users.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      items: users.map((user) =>
        UserPrismaMapper.toDomain(user as unknown as PrismaUser),
      ),
      nextCursor,
    };
  }
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
  async existsById(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return !!user;
  }

  // UserRelationsPort methods
  async exists(userId: string): Promise<boolean> {
    return this.existsById(userId);
  }

  async isPrivate(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPrivate: true },
    });
    return user?.isPrivate ?? false;
  }

  async isBlockedEitherDirection(a: string, b: string): Promise<boolean> {
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: a, blockedId: b },
          { blockerId: b, blockedId: a },
        ],
      },
      select: { blockerId: true },
    });
    return !!block;
  }

  // UserVisibilityPort methods
  async getPrivacyFacts(
    viewerId: string | null,
    targetId: string,
  ): Promise<{ targetIsPrivate: boolean; viewerFollowsTarget: boolean }> {
    const [target, follow] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: targetId },
        select: { isPrivate: true },
      }),
      viewerId
        ? this.prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: targetId,
              },
            },
            select: { followerId: true },
          })
        : null,
    ]);

    return {
      targetIsPrivate: target?.isPrivate ?? false,
      viewerFollowsTarget: !!follow,
    };
  }

  // PostUserPort methods
  async isActive(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });
    return user?.isActive ?? false;
  }
}
