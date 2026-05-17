export type FollowReceivedEventPayload = {
  /** User who receives the notification (the followed account). */
  followeeId: string;
  followerId: string;
  redirectURL: string;
};
