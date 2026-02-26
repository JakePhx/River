import { Inject, Injectable } from '@nestjs/common';
import { ConflictError } from '@/_shared/domain/errors';
import { USER_REPO, type UserRepo } from '../port/user.repo';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '@/_shared/application/security/password.hasher';
import {
  TOKEN_SIGNER,
  type TokenSigner,
} from '@/_shared/application/security/token.signer';
import { UserRegisterBodyDTO } from '../../interface/dto/user-register.body.dto';
import {
  UserRegisterResponseDTO,
  UserRegisterErrorResponseDTO,
} from '../../interface/dto/user-register.response.dto';
import { Username } from '../../domain/value-object/username.vo';
import { Email } from '../../domain/value-object/email.vo';
import {
  InvalidEmailError,
  InvalidUsernameError,
} from '../../domain/error/user-error-code';
import { UserEntity } from '../../domain/entity/user.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPO) private readonly userRepo: UserRepo,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_SIGNER) private readonly signer: TokenSigner,
  ) {}

  async execute(
    input: UserRegisterBodyDTO,
  ): Promise<UserRegisterResponseDTO | UserRegisterErrorResponseDTO> {
    try {
      if (Email.isValid(input.email)) {
        throw new InvalidEmailError();
      }
      if (Username.isValid(input.username)) {
        throw new InvalidUsernameError();
      }
      if (await this.userRepo.findByEmail(input.email))
        throw new ConflictError('Email already in use');
      if (await this.userRepo.findByUsername(input.username))
        throw new ConflictError('Username already in use');

      const password = await this.hasher.hash(input.password);

      const user: UserEntity = await UserEntity.create({
        name: input.name,
        email: input.email,
        username: input.username,
        passwordHash: password,
        role: 'USER',
        isPrivate: false,
        isActive: true,
      });
      await this.userRepo.save(user);

      const accessToken = await this.signer.signAccessToken({
        sub: user.id.toString(),
        username: user.username.toString(),
        role: user.role,
      });
      return {
        user: {
          id: user.id.toString(),
          email: user.email.toString(),
          username: user.username.toString(),
          role: user.role,
        },
        accessToken,
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
