import { randomUUID } from 'crypto';

export class CommentId {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(): CommentId {
    return new CommentId(`comment_${randomUUID()}`);
  }

  static from(value: string): CommentId {
    if (!this.isValid(value)) {
      throw new Error('Invalid CommentId');
    }
    return new CommentId(value);
  }

  static isValid(value: string): boolean {
    return /^comment_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  toString(): string {
    return this.value;
  }

  equals(other: CommentId): boolean {
    return this.value === other.value;
  }
}
