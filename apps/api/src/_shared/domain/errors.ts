export type DOMAIN_ERROR_CODE = string;
export type DOMAIN_ERROR_MESSAGE = string;

export class DomainError extends Error {
  public status: number;
  public code: DOMAIN_ERROR_CODE;
  public message: DOMAIN_ERROR_MESSAGE;
  constructor(params: {
    code: DOMAIN_ERROR_CODE;
    message?: DOMAIN_ERROR_MESSAGE;
    status?: number;
  }) {
    super(params.message);
    this.code = params.code;
    this.message = params.message ?? 'Internal server error';
    this.status = params.status ?? 500;
  }
}

export class NotFoundError extends DomainError {
  constructor(params: {
    code: DOMAIN_ERROR_CODE;
    message?: DOMAIN_ERROR_MESSAGE;
    status?: number;
  }) {
    super({
      code: params.code,
      message: params.message ?? 'Not found',
      status: params.status ?? 404,
    });
  }
}

export class ConflictError extends DomainError {
  constructor(params: {
    code: DOMAIN_ERROR_CODE;
    message?: DOMAIN_ERROR_MESSAGE;
    status?: number;
  }) {
    super({
      code: params.code,
      message: params.message ?? 'Conflict',
      status: params.status ?? 409,
    });
  }
}

export class ForbiddenError extends DomainError {
  constructor(params: {
    code: DOMAIN_ERROR_CODE;
    message?: DOMAIN_ERROR_MESSAGE;
    status?: number;
  }) {
    super({
      code: params.code,
      message: params.message ?? 'Forbidden',
      status: params.status ?? 403,
    });
  }
}

export class ValidationError extends DomainError {
  constructor(params: {
    code: DOMAIN_ERROR_CODE;
    message?: DOMAIN_ERROR_MESSAGE;
    status?: number;
  }) {
    super({
      code: params.code,
      message: params.message ?? 'Validation error',
      status: params.status ?? 400,
    });
  }
}

export class UnauthorizedError extends DomainError {
  constructor(params: {
    code: DOMAIN_ERROR_CODE;
    message?: DOMAIN_ERROR_MESSAGE;
    status?: number;
  }) {
    super({
      code: params.code,
      message: params.message ?? 'Unauthorized',
      status: params.status ?? 401,
    });
  }
}

export class PaymentRequiredError extends DomainError {
  constructor(params: {
    code: DOMAIN_ERROR_CODE;
    message?: DOMAIN_ERROR_MESSAGE;
    status?: number;
  }) {
    super({
      code: params.code,
      message: params.message ?? 'Payment Required',
      status: params.status ?? 402,
    });
  }
}

export class DatabaseError extends DomainError {
  constructor(params: {
    code: DOMAIN_ERROR_CODE;
    message?: DOMAIN_ERROR_MESSAGE;
    status?: number;
  }) {
    super({
      code: params.code,
      message: params.message ?? 'Database error',
      status: params.status ?? 500,
    });
  }
}
