import { ValidationError } from '../common/errors';

export function validateProfileName(name: string | null | undefined) {
  if (!name) return;
  if (name.length > 50) throw new ValidationError('Profile name too long');
}

export function validateAvatarUrl(url: string | null | undefined) {
  if (!url) return;
  if (url.length > 2048) throw new ValidationError('Avatar URL too long');
  // optional: basic check
  if (!/^https?:\/\//.test(url))
    throw new ValidationError('Avatar URL must be http(s)');
}
