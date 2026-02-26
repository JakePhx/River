import { Inject, Injectable } from '@nestjs/common';
import { USER_REPO, type UserRepo } from '../port/user.repo';

@Injectable()
export class ListUserUseCase {
  constructor(@Inject(USER_REPO) private readonly users: UserRepo) {}

  async execute(query?: string, cursor?: string, take?: number) {
    return this.users.list({ query, cursor, take });
  }
}
