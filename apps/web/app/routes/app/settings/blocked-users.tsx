import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchBlockedUsers,
  unblockUser,
} from "../../../features/relation/relation.slice";

export default function SettingsBlockedUsersRoute() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector(
    (s) => s.relations.blockedList,
  );
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchBlockedUsers());
  }, [dispatch]);

  const onUnblock = async (targetUserId: string) => {
    setUnblockingId(targetUserId);
    try {
      await dispatch(unblockUser({ targetUserId })).unwrap();
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2 gap-1" asChild>
          <Link to="/settings">
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Blocked users</h1>
        <p className="text-sm text-muted-foreground">
          People you block can&apos;t follow you, message you, or see your
          posts in their feed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blocked accounts</CardTitle>
          <CardDescription>
            Unblocking lets them interact with you again according to your
            privacy settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {status === "loading" && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive">{error.message}</p>
          ) : null}

          {status === "idle" && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t blocked anyone.
            </p>
          ) : null}

          {items.length > 0 ? (
            <ul className="divide-y rounded-lg border">
              {items.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-3 p-3 first:rounded-t-lg last:rounded-b-lg"
                >
                  <Link to={`/u/${user.username}`} className="shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile?.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {user.username?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/u/${user.username}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {user.name || user.username}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={unblockingId === user.id}
                    onClick={() => void onUnblock(user.id)}
                  >
                    {unblockingId === user.id ? "Unblocking…" : "Unblock"}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
