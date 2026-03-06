import type { UserResponseDTO } from "@social/shared";
import type { User } from "./user.types";

export class UserMapper {
  static toUser(user: UserResponseDTO): User {
    return {
      id: user.id,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      isPrivate: user.isPrivate,
      isActive: user.isActive,
      postCount: user.postCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profile: {
        id: user.profile?.id,
        createdAt: user.profile?.createdAt
          ? new Date(user.profile.createdAt)
          : undefined,
        updatedAt: user.profile?.updatedAt
          ? new Date(user.profile.updatedAt)
          : undefined,
        title: user.profile?.title,
        company: user.profile?.company,
        bio: user.profile?.bio,
        gender: user.profile?.gender,
        coverUrl: user.profile?.coverUrl,
        website: user.profile?.website,
        birthDate: user.profile?.birthDate
          ? new Date(user.profile.birthDate)
          : undefined,
        location: user.profile?.location,
        avatarUrl: user.profile?.avatarUrl,
        contact: user.profile?.contact,
      },
    };
  }
}
