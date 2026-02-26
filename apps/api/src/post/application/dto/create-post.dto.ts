import { IsString, MaxLength, MinLength } from 'class-validator';
import type { CreatePostDto } from '@social/shared';

export class CreatePostDtoClass implements CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content!: string;
}
