export interface UserRelationsPort {
  exists(userId: string): Promise<boolean>;
  isPrivate(userId: string): Promise<boolean>;
  isBlockedEitherDirection(a: string, b: string): Promise<boolean>;
}
