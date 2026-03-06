import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../domain/entity/user.entity';
import {
  UpsertUserType,
  UserRepoPort,
} from '../../../application/port/user.repo.port';
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import { UserPrismaMapper, PrismaUser } from './mappers/user.prisma-mapper';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { Email } from '@/user/domain/value-object/email.vo';
import { Username } from '@/user/domain/value-object/username.vo';

@Injectable()
export class PrismaUserRepo implements UserRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(user: UserEntity, type?: UpsertUserType): Promise<void> {
    if (!type) type = 'USER_AND_PROFILE';
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id.toString() },
    });
    if (type === 'USER_AND_PROFILE' || type === 'USER_ONLY') {
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

      if (existingUser) {
        await this.prisma.user.update({
          where: { id: user.id.toString() },
          data,
        });
      } else {
        await this.prisma.user.create({
          data: {
            ...data,
            id: user.id.toString(),
            createdAt: user.createdAt,
          },
        });
      }
    }

    if (type === 'USER_AND_PROFILE' || type === 'PROFILE_ONLY') {
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
        await this.prisma.profile.update({
          where: { userId: user.id.toString() },
          data: profileData,
        });
      } else {
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
  }
  async findById(id: UserId): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.toString() },
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
            coverUrl: true,
          },
        },
      },
    });

    if (!user) return null;
    return UserPrismaMapper.toDomain(user as unknown as PrismaUser);
  }
  async findByEmail(email: Email): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toString() },
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
            coverUrl: true,
          },
        },
      },
    });
    if (!user) return null;
    return UserPrismaMapper.toDomain(user as unknown as PrismaUser);
  }
  async findByUsername(username: Username): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toString() },
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
            coverUrl: true,
          },
        },
      },
    });
    if (!user) return null;
    return UserPrismaMapper.toDomain(user as unknown as PrismaUser);
  }
  async list(params: {
    pagination: { cursor?: string; take: number };
    query?: string;
  }): Promise<{ items: UserEntity[]; nextCursor: string | null }> {
    const users = await this.prisma.user.findMany({
      take: params.pagination.take + 1,
      cursor: params.pagination.cursor
        ? { id: params.pagination.cursor }
        : undefined,
      skip: params.pagination.cursor ? 1 : 0,
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
            coverUrl: true,
          },
        },
      },
    });
    let nextCursor: string | null = null;

    if (users.length > params.pagination.take) {
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
  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.toString() },
    });
  }
  async existsById(id: UserId): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.toString() },
    });
    return !!user;
  }

  // UserRelationsPort methods
  async exists(userId: UserId): Promise<boolean> {
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
