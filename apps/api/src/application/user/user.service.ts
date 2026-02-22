import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import { NotFoundError } from '../../domain/common/errors';
import type { UserReadRepoPort } from './ports/user-read-repo.port';

@Injectable()
export class UserService {
  constructor(
    @Inject(TOKENS.USER_READ_REPO) private readonly users: UserReadRepoPort,
  ) {}

  async me(userId: string) {
    const u = await this.users.getMe(userId);
    if (!u) throw new NotFoundError('User not found');
    return u;
  }

  async updatePrivacy(userId: string, isPrivate: boolean) {
    await this.users.setPrivacy(userId, isPrivate);
    return { ok: true };
  }
}
