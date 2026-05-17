import { useState } from "react";
import { Link } from "react-router";
import { ChevronRight, UserX } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfile } from "../../features/me/me.slice";

export default function SettingsRoute() {
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.me.me);
  const status = useAppSelector((s) => s.me.status);
  const error = useAppSelector((s) => s.me.error);

  const [isPrivate, setIsPrivate] = useState<boolean>(me?.isPrivate ?? false);

  if (!me) return null;

  const onSave = async () => {
    await dispatch(updateProfile({ isPrivate })).unwrap();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Privacy and account options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link
            to="/settings/blocked-users"
            className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserX className="h-5 w-5 text-muted-foreground" />
              </span>
              <div className="space-y-1 text-left">
                <p className="font-medium leading-none">Blocked users</p>
                <p className="text-sm text-muted-foreground">
                  See everyone you&apos;ve blocked and unblock them if you want.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="privacy">Private account</Label>
              <p className="text-sm text-muted-foreground">
                Private accounts require follow requests to be accepted.
              </p>
            </div>
            <input
              id="privacy"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error.message}</p>
          ) : null}

          <div className="flex justify-end">
            <Button onClick={onSave} disabled={status === "loading"}>
              {status === "loading" ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
