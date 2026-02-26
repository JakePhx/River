import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '@/_shared/domain/errors';

import { USER_REPO, type UserRepo } from '../port/user.repo';
import { UserEntityMapper } from '../port/user.entity-mapper';

@Injectable()
export class GetMeUseCase {
  constructor(@Inject(USER_REPO) private readonly users: UserRepo) {}

  async execute(userId: string) {
    const me = await this.users.findById(userId);
    if (!me) throw new NotFoundError('User not found');
    return UserEntityMapper.toDTO(me);
  }
}
