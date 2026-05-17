import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login } from "../../features/auth/auth.slice";

function safeAppPath(next: string | null): string {
  if (!next) return "/feed";
  try {
    const path = decodeURIComponent(next);
    if (path.startsWith("/") && !path.startsWith("//")) return path;
  } catch {
    /* ignore malformed next */
  }
  return "/feed";
}

export default function SignInRoute() {
  const dispatch = useAppDispatch();
  const [search] = useSearchParams();
  const continueTo = safeAppPath(search.get("next"));
  const status = useAppSelector((s) => s.auth.status);
  const error = useAppSelector((s) => s.auth.error);
  const token = useAppSelector((s) => s.auth.accessToken);
  const me = useAppSelector((s) => s.me.me);

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const signedIn = Boolean(token && me);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(login({ usernameOrEmail, password }));
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Welcome back. Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          {signedIn ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You’re signed in. Continue to the app when you’re ready.
              </p>
              <Button className="w-full" asChild>
                <Link to={continueTo}>Continue</Link>
              </Button>
            </div>
          ) : null}
          {!signedIn ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Username or email</Label>
              <Input
                id="usernameOrEmail"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error.message}</p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <Link
                to="/sign-up"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
