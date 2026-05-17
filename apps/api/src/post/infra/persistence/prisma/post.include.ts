/** Shared Prisma include for posts returned to the domain layer. */
export const postWithAuthorAndAttachments = {
  author: {
    include: {
      profile: true,
    },
  },
  attachments: {
    orderBy: { position: 'asc' as const },
  },
} as const;
