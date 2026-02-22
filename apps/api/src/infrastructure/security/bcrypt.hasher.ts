import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasherPort } from '../../application/auth/ports/password-hasher.port';

@Injectable()
export class BcryptHasher implements PasswordHasherPort {
  async hash(plain: string) {
    return bcrypt.hash(plain, 10);
  }
  async compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
