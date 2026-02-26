export class Username {
  private constructor(private readonly value: string) {}

  static create(value: string): Username {
    const normalized = value.trim().toLowerCase();

    if (!Username.isValid(normalized)) {
      throw new Error(
        'Username must be 3-20 characters and contain only letters, numbers, or underscores',
      );
    }

    return new Username(normalized);
  }

  static isValid(value: string): boolean {
    return /^[a-z0-9_]{3,20}$/.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}
