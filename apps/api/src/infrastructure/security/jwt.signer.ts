import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenSignerPort } from '../../application/auth/ports/token-signer.port';

@Injectable()
export class JwtSigner implements TokenSignerPort {
  constructor(private readonly jwt: JwtService) {}

  async signAccessToken(payload: { sub: string; username: string }) {
    return this.jwt.signAsync(payload);
  }
}
