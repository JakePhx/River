export interface FollowRepo {
  exists(followerId: string, followingId: string): Promise<boolean>;
  create(data: { followerId: string; followingId: string }): Promise<void>;
  delete(data: { followerId: string; followingId: string }): Promise<void>;
}
