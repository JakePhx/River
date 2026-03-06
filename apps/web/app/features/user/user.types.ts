import type {
  ListUserResponseDTO,
  ListUserErrorResponseDTO,
  UserResponseDTO,
  UserErrorResponseDTO,
  ErrorResponseDTO,
} from "@social/shared";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  isPrivate: boolean;
  isActive: boolean;
  postCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    title?: string;
    company?: string;
    bio?: string;
    gender?: string;
    website?: string;
    birthDate?: Date;
    location?: string;
    avatarUrl?: string;
    coverUrl?: string;
    contact?: string;
  };
};

export type UserError = ErrorResponseDTO;

export type ListUserResponse = ListUserResponseDTO | ListUserErrorResponseDTO;

export type UserResponse = UserResponseDTO | UserErrorResponseDTO;

export type UpdatePrivacyDto = {
  isPrivate: boolean;
};

export type UpdateProfileDto = {
  name?: string;
  title?: string;
  company?: string;
  bio?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  website?: string;
  birthDate?: Date;
  location?: string;
  avatarUrl?: string;
  contact?: string;
};
