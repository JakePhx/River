import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DomainError } from '@/_shared/domain/errors';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { Username } from '@/user/domain/value-object/username.vo';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: { sub: string; username: string }) {
    try {
      return {
        userId: UserId.from(payload.sub),
        username: Username.create(payload.username),
      };
    } catch (e) {
      if (e instanceof DomainError) {
        throw e;
      }
      throw new UnauthorizedException();
    }
  }
}
