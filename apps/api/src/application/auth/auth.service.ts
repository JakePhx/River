import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from '../../domain/common/errors';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { UserAuthRepoPort } from './ports/user-auth-repo.port';
import type { PasswordHasherPort } from './ports/password-hasher.port';
import type { TokenSignerPort } from './ports/token-signer.port';

@Injectable()
export class AuthService {
  constructor(
    @Inject(TOKENS.USER_AUTH_REPO) private readonly users: UserAuthRepoPort,
    @Inject(TOKENS.PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(TOKENS.TOKEN_SIGNER) private readonly signer: TokenSignerPort,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email))
      throw new ConflictError('Email already in use');
    if (await this.users.findByUsername(dto.username))
      throw new ConflictError('Username already in use');

    const password = await this.hasher.hash(dto.password);
    const user = await this.users.createUser({
      email: dto.email,
      username: dto.username,
      password,
    });

    const accessToken = await this.signer.signAccessToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    return { user, accessToken };
  }

  async login(dto: LoginDto) {
    const isEmail = dto.usernameOrEmail.includes('@');
    const user = isEmail
      ? await this.users.findByEmail(dto.usernameOrEmail)
      : await this.users.findByUsername(dto.usernameOrEmail);
    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (!user.isActive) throw new ForbiddenError('User is inactive');

    const ok = await this.hasher.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    const accessToken = await this.signer.signAccessToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      accessToken,
    };
  }
}
