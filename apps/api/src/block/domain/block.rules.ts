import { ValidationError } from '@/_shared/domain/errors';

export function assertCanBlock(params: { blockerId: string; targetId: string }) {
  if (params.blockerId === params.targetId) {
    throw new ValidationError('You cannot block yourself');
  }
}
