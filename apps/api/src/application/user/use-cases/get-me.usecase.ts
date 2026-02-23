import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../tokens';
import { NotFoundError } from '../../../domain/common/errors';
import type { UserReadRepoPort } from '../ports/user-read-repo.port';
import type { UserMeRes } from '@social/shared';
import type { UserId } from '../../_shared/models/ids';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(TOKENS.USER_READ_REPO) private readonly users: UserReadRepoPort,
  ) {}

  async execute(userId: UserId): Promise<UserMeRes> {
    const me = await this.users.getMe(userId);
    if (!me) throw new NotFoundError('User not found');
    return me;
  }
}
