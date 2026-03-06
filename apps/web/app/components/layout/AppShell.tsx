import { Link, useLocation, useNavigate } from "react-router";
import { Home, LogOut, Settings, User, Users } from "lucide-react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib/utils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../features/auth/auth.slice";
import { clearMe } from "../../features/me/me.slice";
import { clearEntities } from "../../features/user/user.slice";
import { clearFeed } from "../../features/post/post.slice";
import { clearRelations } from "../../features/relation/relation.slice";

function initials(name: string, username: string) {
  const display = name || username;
  return display
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const me = useAppSelector((s) => s.me.me);

  const onLogout = () => {
    dispatch(logout());
    dispatch(clearMe());
    dispatch(clearEntities());
    dispatch(clearFeed());
    dispatch(clearRelations());
    navigate("/sign-in");
  };

  // If a token exists, never show the sign-in button regardless of meStatus.
  // layout.tsx handles the 401 case by dispatching logout() + redirecting.
  const showSkeleton = !!token && !me;

  return (
    <div className="min-h-dvh bg-background relative flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur z-100">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              ms
            </span>
            <span className="hidden sm:inline">mini-social</span>
          </Link>

          <nav className="flex items-center gap-2">
            {showSkeleton ? (
              <>
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
              </>
            ) : me ? (
              <>
                <Link
                  to="/feed"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent",
                    location.pathname.startsWith("/feed") && "bg-accent",
                  )}
                >
                  <Home />
                </Link>
                <Link
                  to="/network"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent",
                    location.pathname.startsWith("/network") && "bg-accent",
                  )}
                >
                  <Users />
                </Link>
                <Link
                  to={`/u/${me.username}`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent",
                    location.pathname.startsWith("/u/") && "bg-accent",
                  )}
                >
                  <Avatar className="h-7 w-7">
                    {me.profile?.avatarUrl ? (
                      <AvatarImage
                        src={me.profile.avatarUrl}
                        alt={me.username}
                      />
                    ) : null}
                    <AvatarFallback>
                      {initials(me.name, me.username) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">@{me.username}</span>
                </Link>

                <Link to="/settings">
                  <Button variant="ghost" size="icon" aria-label="Settings">
                    <Settings />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  aria-label="Logout"
                >
                  <LogOut />
                </Button>
              </>
            ) : (
              <Link to="/sign-in">
                <Button variant="ghost" className="gap-2">
                  <User />
                  Sign in
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 flex-1">
        {showSkeleton ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
