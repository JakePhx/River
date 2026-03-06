import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsString,
  ValidateNested,
} from "class-validator";
import { ErrorResponseDTO } from "../error.response.dto";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
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
  @IsEnum(Gender)
  gender!: Gender;
  @IsString()
  website!: string;
  @IsDate()
  birthDate!: Date;
  @IsString()
  location!: string;
  @IsString()
  avatarUrl!: string;
  @IsString()
  coverUrl!: string;
  @IsString()
  contact!: string;
}

export class UserErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
