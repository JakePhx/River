import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../../../application/auth/auth.service';
import { RegisterDto } from '../../../application/auth/dto/register.dto';
import { LoginDto } from '../../../application/auth/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
