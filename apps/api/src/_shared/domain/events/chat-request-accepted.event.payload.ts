export type ChatRequestAcceptedEventPayload = {
  /** Chat initiator who receives the notification. */
  initiatorId: string;
  threadId: string;
  accepterId: string;
  redirectURL: string;
};
