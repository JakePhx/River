import type { Notification } from "./notification.types";

/**
 * In-app path from notification payload. Prefer server `redirectURL`; fall back by type.
 */
export function resolveNotificationRedirectURL(
  n: Notification
): string | null {
  const p = n.payload as Record<string, unknown>;
  const raw = p.redirectURL;
  if (typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  if (n.type === "post.created") {
    const postId = p.postId;
    if (typeof postId === "string" && postId.length > 0) {
      return `/posts/${encodeURIComponent(postId)}`;
    }
  }
  if (n.type === "post.commented") {
    const postId = p.postId;
    if (typeof postId === "string" && postId.length > 0) {
      return `/posts/${encodeURIComponent(postId)}`;
    }
  }
  if (n.type === "chat.request.accepted") {
    const accepterId = p.accepterId;
    if (typeof accepterId === "string" && accepterId.length > 0) {
      return `/messages?with=${encodeURIComponent(accepterId)}`;
    }
  }
  if (n.type === "follow.received") {
    const followerId = p.followerId;
    if (typeof followerId === "string" && followerId.length > 0) {
      return `/messages?with=${encodeURIComponent(followerId)}`;
    }
  }
  if (n.type === "follow.request.accepted") {
    const accepterId = p.accepterId;
    if (typeof accepterId === "string" && accepterId.length > 0) {
      return `/messages?with=${encodeURIComponent(accepterId)}`;
    }
  }
  return null;
}
