import type { AuthUserRecord, RegisterInput } from '../models/auth.models';
import type { AuthUserRes } from '@social/shared';

export interface UserAuthRepoPort {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findByUsername(username: string): Promise<AuthUserRecord | null>;
  createUser(data: RegisterInput): Promise<AuthUserRes>;
}
