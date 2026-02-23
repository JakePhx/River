import { IsString, MinLength } from 'class-validator';
import type { BlockTargetDto } from '@social/shared';

export class BlockTargetDtoClass implements BlockTargetDto {
  @IsString()
  @MinLength(1)
  targetUserId!: string;
}
