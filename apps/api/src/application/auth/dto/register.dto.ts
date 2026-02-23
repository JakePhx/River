import { IsEmail, IsString, MinLength } from 'class-validator';
import type { RegisterDto } from '@social/shared';

export class RegisterDtoClass implements RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
