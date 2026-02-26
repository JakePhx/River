import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUseCase } from '../application/usecase/register.usecase';
import { LoginUseCase } from '../application/usecase/login.usecase';
import type { UserRegisterBodyDTO } from './dto/user-register.body.dto';
import type { UserLoginBodyDTO } from './dto/user-login.body.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
  ) {}

  @Post('register')
  registerUser(@Body() dto: UserRegisterBodyDTO) {
    const input = {
      email: dto.email,
      username: dto.username,
      password: dto.password,
      name: dto.name,
    };
    return this.register.execute(input);
  }

  @Post('login')
  loginUser(@Body() dto: UserLoginBodyDTO) {
    const input = {
      usernameOrEmail: dto.usernameOrEmail,
      password: dto.password,
    };
    return this.login.execute(input);
  }
}
