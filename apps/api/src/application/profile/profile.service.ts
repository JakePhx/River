import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import { ForbiddenError, NotFoundError } from '../../domain/common/errors';
import {
  validateAvatarUrl,
  validateProfileName,
} from '../../domain/profile/profile.rules';
import {
  assertNotBlocked,
  canViewPrivateAccount,
} from '../../domain/user/user.rules';
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
    const exists = await this.visibility.exists(targetUserId);
    if (!exists) throw new NotFoundError('User not found');

    // blocked check (only if viewer exists)
    if (viewerId) {
      const blocked = await this.visibility.isBlockedEitherDirection(
        viewerId,
        targetUserId,
      );
      assertNotBlocked(blocked);
    }

    // private visibility rule
    const facts = await this.visibility.getPrivacyFacts(viewerId, targetUserId);
    // facts = { targetIsPrivate, viewerFollowsTarget }
    const ok = canViewPrivateAccount({
      targetIsPrivate: facts.targetIsPrivate,
      viewerId,
      targetId: targetUserId,
      viewerFollowsTarget: facts.viewerFollowsTarget,
    });

    if (!ok) throw new ForbiddenError('Private account');

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
