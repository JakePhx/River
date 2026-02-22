import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

import { TOKENS } from './application/tokens';

// services
import { AuthService } from './application/auth/auth.service';
import { UserService } from './application/user/user.service';
import { ProfileService } from './application/profile/profile.service';
import { FollowService } from './application/follow/follow.service';
import { BlockService } from './application/block/block.service';
import { PostService } from './application/post/post.service';

// infra
import { PrismaUserRepo } from './infrastructure/repositories/prisma-user.repo';
import { PrismaProfileRepo } from './infrastructure/repositories/prisma-profile.repo';
import { PrismaFollowRepo } from './infrastructure/repositories/prisma-follow.repo';
import { PrismaFollowRequestRepo } from './infrastructure/repositories/prisma-follow-request.repo';
import { PrismaBlockRepo } from './infrastructure/repositories/prisma-block.repo';
import { PrismaPostRepo } from './infrastructure/repositories/prisma-post.repo';
import { BcryptHasher } from './infrastructure/security/bcrypt.hasher';
import { JwtSigner } from './infrastructure/security/jwt.signer';

// http
import { JwtStrategy } from './interfaces/http/strategies/jwt.strategy';
import { AuthController } from './interfaces/http/controllers/auth.controller';
import { UserController } from './interfaces/http/controllers/user.controller';
import { ProfileController } from './interfaces/http/controllers/profile.controller';
import { FollowController } from './interfaces/http/controllers/follow.controller';
import { BlockController } from './interfaces/http/controllers/block.controller';
import { PostController } from './interfaces/http/controllers/post.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AuthController,
    UserController,
    ProfileController,
    FollowController,
    BlockController,
    PostController,
  ],
  providers: [
    JwtStrategy,

    // use-cases
    AuthService,
    UserService,
    ProfileService,
    FollowService,
    BlockService,
    PostService,

    // adapters
    { provide: TOKENS.USER_AUTH_REPO, useClass: PrismaUserRepo },
    { provide: TOKENS.USER_READ_REPO, useClass: PrismaUserRepo },
    { provide: TOKENS.USER_RELATIONS, useClass: PrismaUserRepo },
    { provide: TOKENS.USER_VISIBILITY, useClass: PrismaUserRepo },

    { provide: TOKENS.PROFILE_REPO, useClass: PrismaProfileRepo },

    { provide: TOKENS.FOLLOW_REPO, useClass: PrismaFollowRepo },
    { provide: TOKENS.FOLLOW_REQUEST_REPO, useClass: PrismaFollowRequestRepo },

    { provide: TOKENS.BLOCK_REPO, useClass: PrismaBlockRepo },

    { provide: TOKENS.POST_REPO, useClass: PrismaPostRepo },

    { provide: TOKENS.PASSWORD_HASHER, useClass: BcryptHasher },
    { provide: TOKENS.TOKEN_SIGNER, useClass: JwtSigner },
  ],
})
export class AppModule {}
