export class DomainError extends Error {}
export class NotFoundError extends DomainError {}
export class ConflictError extends DomainError {}
export class ForbiddenError extends DomainError {}
export class ValidationError extends DomainError {}
export class UnauthorizedError extends DomainError {}
