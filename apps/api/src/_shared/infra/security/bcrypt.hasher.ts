import { PasswordHasher } from '../../application/security/password.hasher';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptHasher implements PasswordHasher {
  async hash(plain: string) {
    return bcrypt.hash(plain, 10);
  }
  async compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
