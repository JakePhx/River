import { IsString, MinLength } from 'class-validator';
import type { FollowRequestDecisionDto } from '@social/shared';

export class FollowRequestDecisionDtoClass implements FollowRequestDecisionDto {
  @IsString()
  @MinLength(1)
  requesterId!: string;
}
