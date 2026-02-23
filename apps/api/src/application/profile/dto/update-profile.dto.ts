import { IsOptional, IsString, MaxLength } from 'class-validator';
import type { UpdateProfileDto } from '@social/shared';

export class UpdateProfileDtoClass implements UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50) name?: string | null;
  @IsOptional() @IsString() @MaxLength(2048) avatarUrl?: string | null;
}
