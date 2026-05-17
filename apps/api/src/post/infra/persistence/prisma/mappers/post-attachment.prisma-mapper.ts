import type { PostAttachment as PrismaPostAttachment } from '@prisma/client';
import { PostAttachmentEntity } from '@/post/domain/post-attachment.entity';

export function mapPrismaAttachments(
  rows: PrismaPostAttachment[],
): PostAttachmentEntity[] {
  const sorted = [...rows].sort((a, b) => a.position - b.position);
  return sorted.map((r) =>
    PostAttachmentEntity.rehydrate({
      id: r.id,
      url: r.url,
      contentType: r.contentType,
      byteSize: r.byteSize,
      kind: r.kind,
      position: r.position,
    }),
  );
}
