import { IsBoolean } from 'class-validator';
import type { UpdatePrivacyDto } from '@social/shared';

export class UpdatePrivacyDtoClass implements UpdatePrivacyDto {
  @IsBoolean()
  isPrivate!: boolean;
}
