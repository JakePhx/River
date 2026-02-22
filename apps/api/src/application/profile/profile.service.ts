import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import { ForbiddenError, NotFoundError } from '../../domain/common/errors';
import {
  validateAvatarUrl,
  validateProfileName,
} from '../../domain/profile/profile.rules';
import type { ProfileRepoPort } from './ports/profile-repo.port';
import type { UserVisibilityPort } from './ports/user-visibility.port';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(TOKENS.PROFILE_REPO)
    private readonly profiles: ProfileRepoPort,
    @Inject(TOKENS.USER_VISIBILITY)
    private readonly visibility: UserVisibilityPort,
  ) {}

  async getProfile(viewerId: string | null, targetUserId: string) {
    if (!(await this.visibility.exists(targetUserId)))
      throw new NotFoundError('User not found');

    if (
      viewerId &&
      (await this.visibility.isBlockedEitherDirection(viewerId, targetUserId))
    ) {
      throw new ForbiddenError('Blocked');
    }

    const canView = await this.visibility.canViewPrivateContent(
      viewerId,
      targetUserId,
    );
    if (!canView) throw new ForbiddenError('Private account');

    const p = await this.profiles.getByUserId(targetUserId);
    return {
      userId: targetUserId,
      name: p?.name ?? null,
      avatarUrl: p?.avatarUrl ?? null,
    };
  }

  async updateMyProfile(
    myUserId: string,
    data: { name?: string | null; avatarUrl?: string | null },
  ) {
    validateProfileName(data.name);
    validateAvatarUrl(data.avatarUrl);
    return this.profiles.upsertByUserId(myUserId, data);
  }
}
