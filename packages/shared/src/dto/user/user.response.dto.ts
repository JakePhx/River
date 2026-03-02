import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsString,
  ValidateNested,
} from "class-validator";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export class UserResponseDTO {
  @IsString()
  id!: string;
  @IsDate()
  createdAt!: Date;
  @IsDate()
  updatedAt!: Date;
  @IsString()
  name!: string;
  @IsEmail()
  email!: string;
  @IsString()
  username!: string;
  @IsEnum(UserRole)
  role!: UserRole;
  @IsBoolean()
  isPrivate!: boolean;
  @IsBoolean()
  isActive!: boolean;
  @IsInt()
  postCount!: number;
  @IsInt()
  followersCount!: number;
  @IsInt()
  followingCount!: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ProfileResponseDTO)
  profile?: ProfileResponseDTO;
}

export class ProfileResponseDTO {
  @IsString()
  id!: string;
  @IsDate()
  createdAt!: Date;
  @IsDate()
  updatedAt!: Date;
  @IsString()
  title!: string;
  @IsString()
  company!: string;
  @IsString()
  bio!: string;
  @IsString()
  gender!: string;
  @IsString()
  website!: string;
  @IsDate()
  birthDate!: Date;
  @IsString()
  location!: string;
  @IsString()
  avatarUrl!: string;
  @IsString()
  contact!: string;
}

export class ListUsersResponseDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserResponseDTO)
  items!: UserResponseDTO[];

  @IsInt()
  take!: number;

  @IsString()
  nextCursor!: string | null;
}
