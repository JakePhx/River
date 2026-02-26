import { DomainError } from '@/_shared/domain-error';

export const UserErrorCode = {
  USER_INACTIVE: 'USER_INACTIVE',
  USER_BLOCKED: 'USER_BLOCKED',
  PRIVATE_ACCOUNT: 'PRIVATE_ACCOUNT',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_USERNAME: 'INVALID_USERNAME',
} as const;

export type UserErrorCode = (typeof UserErrorCode)[keyof typeof UserErrorCode];

export class UserInactiveError extends DomainError {
  constructor() {
    super(UserErrorCode.USER_INACTIVE, 'User is inactive');
  }
}

export class UserBlockedError extends DomainError {
  constructor() {
    super(UserErrorCode.USER_BLOCKED, 'User is blocked');
  }
}

export class UserPrivateAccountError extends DomainError {
  constructor() {
    super(UserErrorCode.PRIVATE_ACCOUNT, 'User is private');
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super(UserErrorCode.USER_NOT_FOUND, 'User not found');
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super(UserErrorCode.INVALID_CREDENTIALS, 'Invalid credentials');
  }
}

export class InvalidEmailError extends DomainError {
  constructor() {
    super(UserErrorCode.INVALID_EMAIL, 'Invalid email');
  }
}

export class InvalidUsernameError extends DomainError {
  constructor() {
    super(UserErrorCode.INVALID_USERNAME, 'Invalid username');
  }
}
