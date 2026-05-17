import { ValidationError } from '@/_shared/domain/errors';
import type { PostAttachmentKind } from './post-attachment.entity';
import { PostErrorCode } from './errors';

/** Application policy (not enforced by the database). */
export const POST_ATTACHMENT_POLICY = {
  maxCount: 4,
  maxTotalBytes: 100 * 1024 * 1024,
  maxVideos: 2,
} as const;

export type PostAttachmentPolicyInput = {
  byteSize: number;
  kind: PostAttachmentKind;
};

export function assertPostAttachmentsPolicy(
  attachments: PostAttachmentPolicyInput[],
): void {
  if (attachments.length > POST_ATTACHMENT_POLICY.maxCount) {
    throw new ValidationError({
      code: PostErrorCode.POST_ATTACHMENTS_INVALID,
      message: `A post can include at most ${POST_ATTACHMENT_POLICY.maxCount} media files.`,
    });
  }

  let total = 0;
  let videos = 0;
  for (const a of attachments) {
    if (!Number.isFinite(a.byteSize) || a.byteSize < 0) {
      throw new ValidationError({
        code: PostErrorCode.POST_ATTACHMENTS_INVALID,
        message: 'Each attachment must include a valid byte size.',
      });
    }
    if (a.kind !== 'IMAGE' && a.kind !== 'VIDEO') {
      throw new ValidationError({
        code: PostErrorCode.POST_ATTACHMENTS_INVALID,
        message: 'Each attachment must be an image or a video.',
      });
    }
    total += a.byteSize;
    if (a.kind === 'VIDEO') videos += 1;
  }

  if (total > POST_ATTACHMENT_POLICY.maxTotalBytes) {
    throw new ValidationError({
      code: PostErrorCode.POST_ATTACHMENTS_INVALID,
      message: `Total media size cannot exceed ${POST_ATTACHMENT_POLICY.maxTotalBytes / (1024 * 1024)}MB.`,
    });
  }

  if (videos > POST_ATTACHMENT_POLICY.maxVideos) {
    throw new ValidationError({
      code: PostErrorCode.POST_ATTACHMENTS_INVALID,
      message: `A post can include at most ${POST_ATTACHMENT_POLICY.maxVideos} videos.`,
    });
  }
}
