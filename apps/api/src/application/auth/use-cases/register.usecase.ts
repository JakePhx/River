import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../tokens';
import { ConflictError } from '../../../domain/common/errors';
import type { UserAuthRepoPort } from '../ports/user-auth-repo.port';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { TokenSignerPort } from '../ports/token-signer.port';
import type { RegisterInput } from '../models/auth.models';
import type { AuthRes } from '@social/shared';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(TOKENS.USER_AUTH_REPO) private readonly users: UserAuthRepoPort,
    @Inject(TOKENS.PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(TOKENS.TOKEN_SIGNER) private readonly signer: TokenSignerPort,
  ) {}

  async execute(input: RegisterInput): Promise<AuthRes> {
    if (await this.users.findByEmail(input.email))
      throw new ConflictError('Email already in use');
    if (await this.users.findByUsername(input.username))
      throw new ConflictError('Username already in use');

    const password = await this.hasher.hash(input.password);
    const user = await this.users.createUser({
      email: input.email,
      username: input.username,
      password,
    });

    const accessToken = await this.signer.signAccessToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    return { user, accessToken };
  }
}
