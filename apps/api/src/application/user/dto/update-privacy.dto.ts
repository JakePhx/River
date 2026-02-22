import { IsBoolean } from 'class-validator';

export class UpdatePrivacyDto {
  @IsBoolean()
  isPrivate!: boolean;
}
