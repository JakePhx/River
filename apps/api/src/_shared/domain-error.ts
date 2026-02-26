export class DomainError extends Error {
  public code: string;
  public message: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
