import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { Paperclip, X } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { PostCard } from "../../features/post/components/PostCard";
import { fetchFeed } from "../../features/post/post.slice";
import { FeedStatsCard } from "../../features/post/components/FeedStatsCard";
import { usePostComposer } from "../../features/post/usePostComposer";

export default function FeedRoute() {
  const dispatch = useAppDispatch();
  const { items, status, error, hasMore, nextCursor } = useAppSelector(
    (s) => s.feed,
  );
  const me = useAppSelector((s) => s.me.me);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    content,
    setContent,
    pendingFiles,
    setPendingFiles,
    posting,
    fileInputRef,
    onPickFiles,
    submitPost,
    canSubmit,
    postMediaAccept,
  } = usePostComposer();

  useEffect(() => {
    if (items.length === 0 && status === "idle") {
      void dispatch(fetchFeed({ reset: true }));
    }
  }, [dispatch, items.length, status]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && status === "idle") {
          void dispatch(fetchFeed({ cursor: nextCursor }));
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [dispatch, nextCursor, hasMore, status]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="min-w-0 flex-1 space-y-6 lg:max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Link to={me?.username ? `/u/${me.username}` : "/feed"}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={me?.profile?.avatarUrl ?? undefined} />
                <AvatarFallback>
                  {(me?.username ?? me?.name ?? "?")[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1 space-y-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What’s happening?"
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={postMediaAccept}
                className="hidden"
                onChange={onPickFiles}
              />
              {pendingFiles.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {pendingFiles.map((f, i) => (
                    <li
                      key={`${f.name}-${i}-${f.size}`}
                      className="flex max-w-full items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-1 text-xs"
                    >
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                        aria-label={`Remove ${f.name}`}
                        onClick={() =>
                          setPendingFiles((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Max 4 files, up to 2 videos, 100MB total.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={posting || pendingFiles.length >= 4}
            >
              <Paperclip className="h-4 w-4" />
              Attach media
            </Button>
            <p className="text-sm text-muted-foreground">
              {content.length}/280
            </p>
            <Button
              type="button"
              onClick={() => void submitPost()}
              disabled={!canSubmit || posting}
            >
              {posting ? "Posting…" : "Post"}
            </Button>
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error?.message}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {status === "loading" && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading feed…</p>
        ) : null}

        {items.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}

        {status !== "loading" && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your feed is empty. Follow someone and their posts will show up
            here.
          </p>
        ) : null}

        {status === "loading" && items.length > 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Loading more posts…
          </p>
        ) : null}

        <div ref={observerTarget} className="h-1" />
      </div>
      </div>

      <aside className="w-full shrink-0 lg:w-72 lg:max-w-sm">
        <FeedStatsCard />
      </aside>
    </div>
  );
}
