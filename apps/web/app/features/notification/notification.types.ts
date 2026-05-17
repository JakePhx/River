import type { ErrorResponseDTO } from "@social/shared";

/** Mirrors `NotificationType` on the API. */
export type NotificationTypeId =
  | "post.created"
  | "post.commented"
  | "chat.request.accepted"
  | "follow.received"
  | "follow.request.accepted";

export type PostCreatedPayload = {
  postId: string;
  authorId?: string;
  redirectURL?: string;
};

export type PostCommentedPayload = {
  postId: string;
  commentAuthorId: string;
  redirectURL?: string;
};

export type ChatRequestAcceptedNotificationPayload = {
  threadId: string;
  accepterId: string;
  redirectURL?: string;
};

export type FollowReceivedPayload = {
  followerId: string;
  redirectURL?: string;
};

export type FollowRequestAcceptedPayload = {
  accepterId: string;
  redirectURL?: string;
};

export type NotificationPayload =
  | PostCreatedPayload
  | PostCommentedPayload
  | ChatRequestAcceptedNotificationPayload
  | FollowReceivedPayload
  | FollowRequestAcceptedPayload;

export type Notification = {
  id: string;
  userId: string;
  type: NotificationTypeId;
  payload: NotificationPayload;
  isRead: boolean;
  eventId: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListApiItem = {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  eventId: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationError = ErrorResponseDTO;

export const NOTIFICATION_CREATED_EVENT = "notification.created";
