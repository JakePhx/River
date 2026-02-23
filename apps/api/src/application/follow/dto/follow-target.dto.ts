import { IsString, MinLength } from 'class-validator';
import type { FollowTargetDto } from '@social/shared';

export class FollowTargetDtoClass implements FollowTargetDto {
  @IsString()
  @MinLength(1)
  targetUserId!: string;
}
