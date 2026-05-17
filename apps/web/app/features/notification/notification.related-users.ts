import type { Notification } from "./notification.types";

/** User ids to prefetch for avatars / labels (best-effort by notification type). */
export function relatedUserIdsForNotification(n: Notification): string[] {
  switch (n.type) {
    case "post.created": {
      const id = n.payload.authorId;
      return typeof id === "string" && id ? [id] : [];
    }
    case "post.commented": {
      const id = n.payload.commentAuthorId;
      return typeof id === "string" && id ? [id] : [];
    }
    case "chat.request.accepted": {
      const id = n.payload.accepterId;
      return typeof id === "string" && id ? [id] : [];
    }
    case "follow.received": {
      const id = n.payload.followerId;
      return typeof id === "string" && id ? [id] : [];
    }
    case "follow.request.accepted": {
      const id = n.payload.accepterId;
      return typeof id === "string" && id ? [id] : [];
    }
    default:
      return [];
  }
}
