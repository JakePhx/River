import type { UserId } from '../../_shared/models/ids';
import type { UpdateProfileInput } from '../models/profile.models';
import type { ProfileViewRes } from '@social/shared';

export interface ProfileRepoPort {
  getByUserId(userId: UserId): Promise<ProfileViewRes | null>;
  upsertByUserId(
    userId: UserId,
    data: UpdateProfileInput,
  ): Promise<ProfileViewRes>;
}
