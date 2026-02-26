import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenSigner } from '../../application/security/token.signer';

@Injectable()
export class JwtSigner implements TokenSigner {
  constructor(private readonly jwt: JwtService) {}

  async signAccessToken(payload: { sub: string; username: string }) {
    return this.jwt.signAsync(payload);
  }
}
