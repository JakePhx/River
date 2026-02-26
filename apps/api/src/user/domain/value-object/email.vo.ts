export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (!Email.isValid(normalized)) {
      throw new Error('Invalid email format');
    }

    return new Email(normalized);
  }

  static isValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
