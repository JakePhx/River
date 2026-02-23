import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../tokens';
import { ForbiddenError, NotFoundError } from '../../../domain/common/errors';
import {
  assertNotBlocked,
  canViewPrivateAccount,
} from '../../../domain/user/user.rules';
import type { ProfileRepoPort } from '../ports/profile-repo.port';
import type { UserVisibilityPort } from '../ports/user-visibility.port';
import type { ProfileViewRes } from '@social/shared';
import type { UserId } from '../../_shared/models/ids';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(TOKENS.PROFILE_REPO) private readonly profiles: ProfileRepoPort,
    @Inject(TOKENS.USER_VISIBILITY)
    private readonly visibility: UserVisibilityPort,
  ) {}

  async execute(
    viewerId: UserId | null,
    targetUserId: UserId,
  ): Promise<ProfileViewRes> {
    if (!(await this.visibility.exists(targetUserId)))
      throw new NotFoundError('User not found');

    if (viewerId) {
      const blocked = await this.visibility.isBlockedEitherDirection(
        viewerId,
        targetUserId,
      );
      assertNotBlocked(blocked);
    }

    const facts = await this.visibility.getPrivacyFacts(viewerId, targetUserId);
    const ok = canViewPrivateAccount({
      targetIsPrivate: facts.targetIsPrivate,
      viewerId,
      targetId: targetUserId,
      viewerFollowsTarget: facts.viewerFollowsTarget,
    });

    if (!ok) throw new ForbiddenError('Private account');

    const p = await this.profiles.getByUserId(targetUserId);
    const profile: ProfileViewRes = {
      userId: targetUserId,
      name: p?.name ?? null,
      avatarUrl: p?.avatarUrl ?? null,
    };
    return profile;
  }
}
