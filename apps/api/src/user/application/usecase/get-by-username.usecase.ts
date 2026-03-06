import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Ports
import type { UserRepoPort } from '../port/user.repo.port';
import { UserEntityDTOMapperPort } from '../port/user.mapper.port';

// Errors
import { UserNotFoundError } from '@/user/domain/errors';

// Entities, Value Objects, && DTOs
import { Username } from '@/user/domain/value-object/username.vo';
import { UserResponseDTO } from '@social/shared';

@Injectable()
export class GetByUserNameUseCase {
  constructor(@Inject(TOKENS.USER_REPO) private readonly users: UserRepoPort) {}

  async execute(username: Username): Promise<UserResponseDTO> {
    const me = await this.users.findByUsername(username);
    if (!me) throw new UserNotFoundError();
    const user = UserEntityDTOMapperPort.toDTO(me);
    console.log('user', user);
    return user;
  }
}
