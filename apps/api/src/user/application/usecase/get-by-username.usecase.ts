import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '@/_shared/domain/errors';

import { USER_REPO, type UserRepo } from '../port/user.repo';
import { UserEntityMapper } from '../port/user.entity-mapper';

@Injectable()
export class GetByUserNameUseCase {
  constructor(@Inject(USER_REPO) private readonly users: UserRepo) {}

  async execute(username: string) {
    const me = await this.users.findByUsername(username);
    if (!me) throw new NotFoundError('User not found');
    return UserEntityMapper.toDTO(me);
  }
}
