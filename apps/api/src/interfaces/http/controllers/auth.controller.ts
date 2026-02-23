import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDtoClass } from '../../../application/auth/dto/register.dto';
import { LoginDtoClass } from '../../../application/auth/dto/login.dto';
import { RegisterUseCase } from 'src/application/auth/use-cases/register.usecase';
import { LoginUseCase } from 'src/application/auth/use-cases/login.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
  ) {}

  @Post('register')
  registerUser(@Body() dto: RegisterDtoClass) {
    const input = {
      email: dto.email,
      username: dto.username,
      password: dto.password,
    };
    return this.register.execute(input);
  }

  @Post('login')
  loginUser(@Body() dto: LoginDtoClass) {
    const input = {
      usernameOrEmail: dto.usernameOrEmail,
      password: dto.password,
    };
    return this.login.execute(input);
  }
}
