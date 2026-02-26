import { randomUUID } from 'crypto';

export class UserId {
  private constructor(private readonly value: string) {}

  static create(value?: string): UserId {
    if (value && !UserId.isValid(value)) {
      throw new Error('Invalid UserId format');
    }

    return new UserId(value ?? randomUUID());
  }

  static isValid(value: string): boolean {
    return /^[0-9a-fA-F-]{36}$/.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
