export interface UserVisibilityPort {
  exists(userId: string): Promise<boolean>;
  isBlockedEitherDirection(a: string, b: string): Promise<boolean>;
  getPrivacyFacts(
    viewerId: string | null,
    targetId: string,
  ): Promise<{
    targetIsPrivate: boolean;
    viewerFollowsTarget: boolean;
  }>;
}
