import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../domain/common/errors';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof ValidationError) status = 400;
    else if (exception instanceof UnauthorizedError) status = 401;
    else if (exception instanceof ForbiddenError) status = 403;
    else if (exception instanceof NotFoundError) status = 404;
    else if (exception instanceof ConflictError) status = 409;

    res.status(status).json({ message: exception.message ?? 'Error' });
  }
}
