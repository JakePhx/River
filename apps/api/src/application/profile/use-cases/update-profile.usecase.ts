import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../tokens';
import {
  validateAvatarUrl,
  validateProfileName,
} from '../../../domain/profile/profile.rules';
import type { ProfileRepoPort } from '../ports/profile-repo.port';
import type { UpdateProfileInput } from '../models/profile.models';
import type { ProfileViewRes } from '@social/shared';
import type { UserId } from '../../_shared/models/ids';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(TOKENS.PROFILE_REPO) private readonly profiles: ProfileRepoPort,
  ) {}

  async execute(
    userId: UserId,
    data: UpdateProfileInput,
  ): Promise<ProfileViewRes> {
    validateProfileName(data.name);
    validateAvatarUrl(data.avatarUrl);
    return this.profiles.upsertByUserId(userId, data);
  }
}
