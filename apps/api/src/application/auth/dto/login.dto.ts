import { IsString, MinLength } from 'class-validator';
import type { LoginDto } from '@social/shared';

export class LoginDtoClass implements LoginDto {
  @IsString()
  usernameOrEmail!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
