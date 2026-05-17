import { Link } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import type { Notification } from "../notification.types";
import type { User } from "../../user/user.types";
import { timeAgo } from "~/shared/datetime";

type NotificationRowProps = {
  notification: Notification;
  author: User | undefined;
  /** Resolved in-app path for this notification (if any). */
  navigateTarget: string | null;
  /** Mark read + optional navigation (handled by parent). */
  onActivate: () => void;
};

export function NotificationRow({
  notification,
  author,
  navigateTarget,
  onActivate,
}: NotificationRowProps) {
  const unread = !notification.isRead;

  const profileLink = author ? `/u/${author.username}` : "/feed";
  const who = author?.name || author?.username || "Someone";

  if (notification.type === "post.created") {
    const label = author
      ? `${author.name || author.username} posted`
      : "Someone you follow posted";

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onActivate()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        }}
        className={cn(
          "flex w-full cursor-pointer gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50",
          unread && "border-primary/30 bg-primary/5",
        )}
      >
        <Link
          to={profileLink}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-10 w-10">
            {author?.profile?.avatarUrl ? (
              <AvatarImage src={author.profile.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {(author?.username ?? "?")[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-snug">
            <Link
              to={profileLink}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {label}
            </Link>
            <span className="text-muted-foreground">
              {" "}
              · {timeAgo(notification.createdAt)}
            </span>
          </p>
          {navigateTarget ? (
            <p className="text-xs text-muted-foreground">
              Click this notification to open the post.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Open your feed to see new posts from people you follow.
            </p>
          )}
        </div>
        {unread ? (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
        ) : null}
      </div>
    );
  }

  if (notification.type === "post.commented") {
    const label = `${who} replied to your post`;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onActivate()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        }}
        className={cn(
          "flex w-full cursor-pointer gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50",
          unread && "border-primary/30 bg-primary/5",
        )}
      >
        <Link
          to={profileLink}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-10 w-10">
            {author?.profile?.avatarUrl ? (
              <AvatarImage src={author.profile.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {(author?.username ?? "?")[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-snug">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">
              {" "}
              · {timeAgo(notification.createdAt)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {navigateTarget
              ? "Open the post to see the comment thread."
              : "Open the post to read comments."}
          </p>
        </div>
        {unread ? (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
        ) : null}
      </div>
    );
  }

  if (notification.type === "chat.request.accepted") {
    const label = `${who} accepted your message request`;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onActivate()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        }}
        className={cn(
          "flex w-full cursor-pointer gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50",
          unread && "border-primary/30 bg-primary/5",
        )}
      >
        <Link
          to={profileLink}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-10 w-10">
            {author?.profile?.avatarUrl ? (
              <AvatarImage src={author.profile.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {(author?.username ?? "?")[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-snug">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">
              {" "}
              · {timeAgo(notification.createdAt)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {navigateTarget
              ? "Open messages to reply."
              : "Open Messages to continue the conversation."}
          </p>
        </div>
        {unread ? (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
        ) : null}
      </div>
    );
  }

  if (notification.type === "follow.received") {
    const label = `${who} started following you`;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onActivate()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        }}
        className={cn(
          "flex w-full cursor-pointer gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50",
          unread && "border-primary/30 bg-primary/5",
        )}
      >
        <Link
          to={profileLink}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-10 w-10">
            {author?.profile?.avatarUrl ? (
              <AvatarImage src={author.profile.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {(author?.username ?? "?")[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-snug">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">
              {" "}
              · {timeAgo(notification.createdAt)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {navigateTarget
              ? "Click to open their profile or chat."
              : "View their profile from the directory."}
          </p>
        </div>
        {unread ? (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
        ) : null}
      </div>
    );
  }

  if (notification.type === "follow.request.accepted") {
    const label = `${who} accepted your follow request`;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onActivate()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        }}
        className={cn(
          "flex w-full cursor-pointer gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50",
          unread && "border-primary/30 bg-primary/5",
        )}
      >
        <Link
          to={profileLink}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-10 w-10">
            {author?.profile?.avatarUrl ? (
              <AvatarImage src={author.profile.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>
              {(author?.username ?? "?")[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-snug">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">
              {" "}
              · {timeAgo(notification.createdAt)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            You are now following them. Say hello in messages.
          </p>
        </div>
        {unread ? (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onActivate()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      className={cn(
        "flex w-full cursor-pointer gap-3 rounded-lg border p-4 text-left text-sm hover:bg-accent/50",
        unread && "border-primary/30 bg-primary/5",
      )}
    >
      <span className="flex-1">{notification.type}</span>
      {navigateTarget ? (
        <span className="text-xs text-muted-foreground">
          Click to open · {timeAgo(notification.createdAt)}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </span>
      )}
    </div>
  );
}
