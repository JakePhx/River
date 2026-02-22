export interface UserVisibilityPort {
  exists(userId: string): Promise<boolean>;
  isBlockedEitherDirection(a: string, b: string): Promise<boolean>;
  canViewPrivateContent(
    viewerId: string | null,
    targetId: string,
  ): Promise<boolean>;
}
