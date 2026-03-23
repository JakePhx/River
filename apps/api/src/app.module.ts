import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { FollowModule } from './follow/follow.module';
import { BlockModule } from './block/block.module';
import { JwtStrategy } from './_shared/interface/strategies/jwt.strategy';
import { KafkaModule } from './_shared/infra/kakfa/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    UserModule,
    PostModule,
    FollowModule,
    BlockModule,
    KafkaModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
