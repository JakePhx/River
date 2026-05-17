import { useEffect } from "react";
import { useNavigate } from "react-router";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../features/notification/notification.slice";
import { NotificationRow } from "../../features/notification/components/NotificationRow";
import { relatedUserIdsForNotification } from "../../features/notification/notification.related-users";
import { resolveNotificationRedirectURL } from "../../features/notification/notification.utils";

export default function NotificationRoute() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.notifications);
  const entitiesById = useAppSelector((s) => s.users.entitiesById);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {status === "loading" && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive">{error.message}</p>
          ) : null}

          {status !== "loading" && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have no notifications yet. You will see posts from people you
              follow, new followers, accepted chats, and more here.
            </p>
          ) : null}

          <div className="space-y-2">
            {items.map((n) => {
              const related = relatedUserIdsForNotification(n);
              const author = related[0] ? entitiesById[related[0]] : undefined;
              const navigateTarget = resolveNotificationRedirectURL(n);

              return (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  author={author}
                  navigateTarget={navigateTarget}
                  onActivate={() => {
                    if (!n.isRead) {
                      void dispatch(markNotificationRead({ id: n.id }));
                    }
                    if (navigateTarget) navigate(navigateTarget);
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
