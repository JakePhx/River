import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../tokens';
import { UnauthorizedError } from '../../../domain/common/errors';
import { assertUserIsActive } from '../../../domain/user/user.rules';
import type { UserAuthRepoPort } from '../ports/user-auth-repo.port';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { TokenSignerPort } from '../ports/token-signer.port';
import type { LoginInput } from '../models/auth.models';
import type { AuthRes } from '@social/shared';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(TOKENS.USER_AUTH_REPO) private readonly users: UserAuthRepoPort,
    @Inject(TOKENS.PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(TOKENS.TOKEN_SIGNER) private readonly signer: TokenSignerPort,
  ) {}

  async execute(input: LoginInput): Promise<AuthRes> {
    const isEmail = input.usernameOrEmail.includes('@');
    const user = isEmail
      ? await this.users.findByEmail(input.usernameOrEmail)
      : await this.users.findByUsername(input.usernameOrEmail);

    if (!user) throw new UnauthorizedError('Invalid credentials');
    assertUserIsActive(user.isActive);

    const ok = await this.hasher.compare(input.password, user.password);
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
