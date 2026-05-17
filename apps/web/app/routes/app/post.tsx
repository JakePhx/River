import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { PostCard } from "../../features/post/components/PostCard";
import { fetchPostById } from "../../features/post/post.slice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function PostRoute() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { post, status, error } = useAppSelector((s) => s.feed.detail);

  useEffect(() => {
    if (!postId) return;
    void dispatch(fetchPostById({ postId }));
  }, [dispatch, postId]);

  const backToFeed = () => {
    const idx = window.history.state?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
    } else {
      navigate("/feed");
    }
  };

  if (!postId) {
    return (
      <p className="text-sm text-muted-foreground">Missing post id in URL.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={backToFeed}
        >
          ← Back to feed
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive">{error.message}</p>
          ) : null}

          {status === "idle" && post ? (
            <PostCard post={post} defaultCommentsExpanded />
          ) : null}

          {status === "idle" && !post && !error ? (
            <p className="text-sm text-muted-foreground">No post loaded.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
