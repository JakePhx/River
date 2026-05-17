import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

import type { BlockRepoPort } from '../port/block.repo.port';
import { UserEntityDTOMapperPort } from '@/user/application/port/user.mapper.port';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { ListUserResponseDTO } from '@social/shared';

@Injectable()
export class ListBlockedUsersUseCase {
  constructor(
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  async execute(blockerId: UserId): Promise<ListUserResponseDTO> {
    const users = await this.blockRepo.listUsersBlockedByBlocker(blockerId);
    return UserEntityDTOMapperPort.toListDTO(users, null);
  }
}
