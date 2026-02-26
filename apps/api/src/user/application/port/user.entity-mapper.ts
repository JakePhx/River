import { UserId } from '../../domain/value-object/user-id.vo';
import { Email } from '../../domain/value-object/email.vo';
import { Username } from '../../domain/value-object/username.vo';
import { UserEntity, UserRole } from '../../domain/entity/user.entity';
import {
  ListUsersResponseDTO,
  UserResponseDTO,
} from '../../interface/dto/user.response.dto';

export class UserEntityMapper {
  static toDTO(user: UserEntity): UserResponseDTO {
    return {
      id: user.id.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      name: user.name,
      email: user.email.toString(),
      username: user.username.toString(),
      role: user.role,
      isPrivate: user.isPrivate,
      isActive: user.isActive,
      postCount: user.postCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profile: {
        id: user.profile.id,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
        title: user.profile.title,
        company: user.profile.company,
        bio: user.profile.bio,
        gender: user.profile.gender,
        website: user.profile.website,
        birthDate: user.profile.birthDate,
        location: user.profile.location,
        avatarUrl: user.profile.avatarUrl,
        contact: user.profile.contact,
      },
    };
  }

  static toListDTO(users: UserEntity[]): ListUsersResponseDTO {
    return {
      items: users.map((user) => UserEntityMapper.toDTO(user)),
      take: users.length,
      nextCursor: null,
    };
  }
}
