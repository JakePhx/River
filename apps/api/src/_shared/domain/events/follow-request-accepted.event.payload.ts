export type FollowRequestAcceptedEventPayload = {
  /** User notified (the original requester). */
  requesterId: string;
  accepterId: string;
  redirectURL: string;
};
