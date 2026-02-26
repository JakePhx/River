import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<any>();
    const auth: string | undefined =
      req?.headers?.authorization ?? req?.headers?.Authorization;

    if (!auth || !auth.toLowerCase().startsWith('bearer ')) return true;
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) return null;
    return user;
  }
}

