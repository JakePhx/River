export interface FollowRepoPort {
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  createFollowTx(data: {
    followerId: string;
    followingId: string;
  }): Promise<void>;
  deleteFollowTx(data: {
    followerId: string;
    followingId: string;
  }): Promise<void>;
}
