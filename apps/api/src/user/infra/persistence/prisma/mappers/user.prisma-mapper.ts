// infra/persistence/prisma/mappers/user.prisma-mapper.ts
import { UserEntity } from '../../../../domain/entity/user.entity';
import { ProfileEntity } from '../../../../domain/entity/profile.entity';
import { UserId } from '../../../../domain/value-object/user-id.vo';
import { Email } from '../../../../domain/value-object/email.vo';
import { Username } from '../../../../domain/value-object/username.vo';

export type PrismaUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  isPrivate: boolean;
  isActive: boolean;
  postCount: number;
  followersCount: number;
  followingCount: number;
  profile?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    company?: string;
    bio?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    website?: string;
    birthDate?: Date;
    location?: string;
    contact?: string;
    avatarUrl?: string;
  };
};

export class UserPrismaMapper {
  static toDomain(raw: PrismaUser): UserEntity {
    const profile = raw.profile
      ? ProfileEntity.rehydrate({
          id: raw.profile.id,
          createdAt: raw.profile.createdAt,
          updatedAt: raw.profile.updatedAt,
          title: raw.profile.title,
          company: raw.profile.company,
          bio: raw.profile.bio,
          gender: raw.profile.gender,
          website: raw.profile.website,
          birthDate: raw.profile.birthDate,
          location: raw.profile.location,
          contact: raw.profile.contact,
          avatarUrl: raw.profile.avatarUrl,
        })
      : ProfileEntity.empty();

    return UserEntity.rehydrate({
      id: UserId.create(raw.id),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      name: raw.name,
      email: Email.create(raw.email),
      username: Username.create(raw.username),
      passwordHash: raw.passwordHash,
      role: raw.role,
      isPrivate: raw.isPrivate,
      isActive: raw.isActive,
      postCount: raw.postCount,
      followersCount: raw.followersCount,
      followingCount: raw.followingCount,
      profile,
    });
  }

  static toPrisma(entity: UserEntity) {
    return {
      id: entity.id.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: entity.name,
      email: entity.email.toString(),
      username: entity.username.toString(),
      passwordHash: entity.passwordHash,
      role: entity.role,
      isPrivate: entity.isPrivate,
      isActive: entity.isActive,
      postCount: entity.postCount,
      followersCount: entity.followersCount,
      followingCount: entity.followingCount,
      profile: {
        id: entity.profile.id,
        createdAt: entity.profile.createdAt,
        updatedAt: entity.profile.updatedAt,
        title: entity.profile.title,
        company: entity.profile.company,
        bio: entity.profile.bio,
        gender: entity.profile.gender,
        website: entity.profile.website,
        birthDate: entity.profile.birthDate,
        location: entity.profile.location,
        contact: entity.profile.contact,
        avatarUrl: entity.profile.avatarUrl,
      },
    };
  }
}
