import { Inject, Injectable } from '@nestjs/common';

import { assertUserIsActive } from '../../domain/policy/user-active.policy';
import { USER_REPO, type UserRepo } from '../port/user.repo';
import { UserLoginBodyDTO } from '../../interface/dto/user-login.body.dto';
import {
  UserLoginErrorResponseDTO,
  UserLoginResponseDTO,
} from '../../interface/dto/user-login.response.dto';
import { Email } from '../../domain/value-object/email.vo';
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '../../domain/error/user-error-code';
import {
  type TokenSigner,
  TOKEN_SIGNER,
} from '@/_shared/application/security/token.signer';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '@/_shared/application/security/password.hasher';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPO) private readonly userRepo: UserRepo,
    @Inject(TOKEN_SIGNER) private readonly signer: TokenSigner,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(
    input: UserLoginBodyDTO,
  ): Promise<UserLoginResponseDTO | UserLoginErrorResponseDTO> {
    try {
      const isEmail = Email.isValid(input.usernameOrEmail);
      const user = isEmail
        ? await this.userRepo.findByEmail(input.usernameOrEmail)
        : await this.userRepo.findByUsername(input.usernameOrEmail);

      if (!user) throw new UserNotFoundError();
      assertUserIsActive(user);

      const ok = await this.hasher.compare(input.password, user.passwordHash);
      if (!ok) throw new InvalidCredentialsError();

      const accessToken = await this.signer.signAccessToken({
        sub: user.id.toString(),
        username: user.username.toString(),
        role: user.role,
      });
      return {
        accessToken,
        user: {
          id: user.id.toString(),
          email: user.email.toString(),
          username: user.username.toString(),
          role: user.role,
        },
      };
    } catch (error) {
      return {
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }
  }
}
