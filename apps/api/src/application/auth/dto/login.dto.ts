import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  usernameOrEmail!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
