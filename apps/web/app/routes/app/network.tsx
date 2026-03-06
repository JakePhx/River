import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  searchUsers,
  setQuery,
  resetSearch,
} from "../../features/user/user.slice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function NetworkRoute() {
  const dispatch = useAppDispatch();
  const { items, status, query, hasMore, nextCursor } = useAppSelector(
    (s) => s.users,
  );
  const [searchTerm, setSearchTerm] = useState(query);
  const observerTarget = useRef<HTMLDivElement>(null);

  const hasMoreRef = useRef(hasMore);
  const nextCursorRef = useRef(nextCursor);
  const fetchingRef = useRef(false);

  hasMoreRef.current = hasMore;
  nextCursorRef.current = nextCursor;

  useEffect(() => {
    if (status !== "loading") {
      fetchingRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== query) {
        dispatch(setQuery(searchTerm));
        fetchingRef.current = true;
        void dispatch(searchUsers({ query: searchTerm, reset: true }));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch, query]);

  useEffect(() => {
    if (query === "" && items.length === 0 && status === "idle" && hasMore) {
      fetchingRef.current = true;
      void dispatch(searchUsers({ query: "", reset: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    if (hasMoreRef.current && !fetchingRef.current) {
      fetchingRef.current = true;
      void dispatch(searchUsers({ query, cursor: nextCursorRef.current }));
    }
  }, [dispatch, query]);

  useEffect(() => {
    const el = observerTarget.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    if (status !== "idle" || !hasMore) return;
    const el = observerTarget.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      loadMore();
    }
  }, [status, hasMore, loadMore]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Network</h1>
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((user) => (
          <Card key={user.id} className="overflow-hidden relative">
            <article
              aria-label={`Profile card for ${user.name || user.username}`}
            >
              <img
                src={user.profile?.coverUrl ?? undefined}
                alt={`Cover for ${user.name || user.username}`}
                className="object-cover w-full h-20 absolute top-0 left-0 right-0 z-0"
              />
              <CardContent className="relative z-10 p-6 pt-20">
                <div className="flex items-center gap-3">
                  <Link to={`/u/${user.username}`}>
                    <Avatar className="h-12 w-12 transition-opacity hover:opacity-80 ring-2 ring-card">
                      <AvatarImage src={user.profile?.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {user.username?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/u/${user.username}`}
                      className="block truncate font-semibold hover:underline"
                    >
                      {user.name || user.username}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>{user.followersCount} followers</span>
                  <span>{user.followingCount} following</span>
                  <span>{user.postCount} posts</span>
                </div>
              </CardContent>
            </article>
          </Card>
        ))}
      </div>

      <div ref={observerTarget} className="h-4" />

      {status === "loading" && (
        <div className="flex justify-center p-4">
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="flex justify-center p-4">
          <p className="text-sm text-muted-foreground">No more users found.</p>
        </div>
      )}

      {items.length === 0 && status === "idle" && (
        <div className="flex justify-center p-4">
          <p className="text-sm text-muted-foreground">No users found.</p>
        </div>
      )}
    </div>
  );
}
