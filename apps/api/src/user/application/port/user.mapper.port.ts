import { UserEntity } from '../../domain/entity/user.entity';
import {
  ListUserResponseDTO,
  UserResponseDTO,
  UserRole,
  Gender,
} from '@social/shared';

export class UserEntityDTOMapperPort {
  static toDTO(user: UserEntity): UserResponseDTO {
    return {
      id: user.id.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      name: user.name,
      email: user.email.toString(),
      username: user.username.toString(),
      role: user.role as UserRole,
      isPrivate: user.isPrivate,
      isActive: user.isActive,
      postCount: user.postCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profile: {
        id: user.profile.id,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
        title: user.profile.title ?? '',
        company: user.profile.company ?? '',
        bio: user.profile.bio ?? '',
        gender: user.profile.gender
          ? (user.profile.gender as Gender)
          : Gender.OTHER,
        website: user.profile.website ?? '',
        birthDate: user.profile.birthDate ?? new Date(),
        location: user.profile.location ?? '',
        avatarUrl: user.profile.avatarUrl ?? '',
        coverUrl: user.profile.coverUrl ?? '',
        contact: user.profile.contact ?? '',
      },
    };
  }

  static toListDTO(
    users: UserEntity[],
    nextCursor: string | null,
  ): ListUserResponseDTO {
    return {
      items: users.map((user) => UserEntityDTOMapperPort.toDTO(user)),
      nextCursor: nextCursor,
    };
  }
}
