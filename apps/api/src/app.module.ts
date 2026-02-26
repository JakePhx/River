import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { FollowModule } from './follow/follow.module';
import { BlockModule } from './block/block.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    UserModule,
    PostModule,
    FollowModule,
    BlockModule,
  ],
})
export class AppModule {}
