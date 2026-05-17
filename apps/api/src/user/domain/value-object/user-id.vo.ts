import { randomUUID } from 'crypto';
import { UserIdInvalidError } from '../errors';

export class UserId {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(): UserId {
    return new UserId(`user_${randomUUID()}`);
  }

  static from(value: string | UserId): UserId {
    if (value instanceof UserId) {
      return value;
    }
    if (!this.isValid(value)) {
      throw new UserIdInvalidError();
    }
    return new UserId(value);
  }

  static isValid(value: string): boolean {
    return /^user_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
