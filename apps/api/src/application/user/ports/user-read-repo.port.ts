import type { UserId } from '../../_shared/models/ids';
import type { UserMeRes } from '@social/shared';

export interface UserReadRepoPort {
  getMe(userId: UserId): Promise<UserMeRes | null>;
  setPrivacy(userId: UserId, isPrivate: boolean): Promise<void>;
}
