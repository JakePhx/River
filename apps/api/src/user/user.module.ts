import { Module } from '@nestjs/common';

import { PrismaModule } from '@/_shared/infra/prisma/prisma.module';
import { TOKENS } from '@/_shared/application/tokens';
import { PASSWORD_HASHER } from '@/_shared/application/security/password.hasher';
import { TOKEN_SIGNER } from '@/_shared/application/security/token.signer';
import { BcryptHasher } from '@/_shared/infra/security/bcrypt.hasher';
import { JwtSigner } from '@/_shared/infra/security/jwt.signer';

// Controllers
import { UserController } from './interface/user.controller';
import { AuthController } from './interface/auth.controller';

// Use cases
import { GetByUserNameUseCase } from './application/usecase/get-by-username.usecase';
import { GetMeUseCase } from './application/usecase/get-me.usecase';
import { ListUserUseCase } from './application/usecase/list-user.usecase';
import { LoginUseCase } from './application/usecase/login.usecase';
import { RegisterUseCase } from './application/usecase/register.usecase';

// Repositories
import { PrismaUserRepo } from './infra/persistence/prisma/prisma-user.repo';

@Module({
  imports: [PrismaModule],

  controllers: [UserController, AuthController],

  providers: [
    // Use cases - user
    GetMeUseCase,
    GetByUserNameUseCase,
    ListUserUseCase,
    LoginUseCase,
    RegisterUseCase,

    // Services
    { provide: PASSWORD_HASHER, useClass: BcryptHasher },
    { provide: TOKEN_SIGNER, useClass: JwtSigner },

    // Repositories
    { provide: TOKENS.USER_REPO, useClass: PrismaUserRepo },
  ],

  exports: [
    GetMeUseCase,
    GetByUserNameUseCase,
    ListUserUseCase,
    TOKENS.USER_REPO,
  ],
})
export class UserModule {}
