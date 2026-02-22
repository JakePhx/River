export interface ProfileRepoPort {
  getByUserId(userId: string): Promise<{
    userId: string;
    name: string | null;
    avatarUrl: string | null;
  } | null>;
  upsertByUserId(
    userId: string,
    data: { name?: string | null; avatarUrl?: string | null },
  ): Promise<{ userId: string; name: string | null; avatarUrl: string | null }>;
}
