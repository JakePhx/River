import type { UserId } from '../../_shared/models/ids';
import type { Role } from '../../_shared/models/role';

// Backend-only record (has password)
export type AuthUserRecord = {
  id: UserId;
  email: string;
  username: string;
  password: string;
  role: Role;
  isActive: boolean;
};

// Application input models (used by use-cases and ports)
export type RegisterInput = {
  email: string;
  username: string;
  password: string;
};

export type LoginInput = {
  usernameOrEmail: string;
  password: string;
};
