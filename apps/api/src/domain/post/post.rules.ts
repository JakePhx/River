import { ValidationError } from '../common/errors';

export function validatePostContent(content: string) {
  const trimmed = content.trim();
  if (trimmed.length < 1) throw new ValidationError('Post content is empty');
  if (trimmed.length > 500) throw new ValidationError('Post content too long');
  return trimmed;
}
