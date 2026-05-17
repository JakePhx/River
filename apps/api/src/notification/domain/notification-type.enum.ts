/** Stored notification kinds; string values match `EVENT_TYPE` in `@/_shared/domain/events` (Kafka → consumers → persistence). */
export enum NotificationType {
  POST_CREATED = 'post.created',
  /** Someone commented on your post (top-level or reply in thread). */
  POST_COMMENTED = 'post.commented',
  /** Someone you messaged accepted your chat request (recipient → initiator). */
  CHAT_REQUEST_ACCEPTED = 'chat.request.accepted',
  /** Someone started following you (public follow). */
  FOLLOW_RECEIVED = 'follow.received',
  /** A private account accepted your follow request (requester is notified). */
  FOLLOW_REQUEST_ACCEPTED = 'follow.request.accepted',
}
