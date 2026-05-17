import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Pencil,
  Repeat2,
  Share2,
  ThumbsDown,
  Trash2,
} from "lucide-react";

import { useToast } from "~/components/ToastProvider";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Textarea } from "~/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import {
  createComment,
  deletePost,
  fetchPostComments,
  updatePost,
} from "../post.slice";
import type { Post } from "../post.types";
import { buildCommentTree } from "../comment-tree.utils";
import { CommentTree } from "./CommentTree";
import { PostMediaGallery } from "./PostMediaGallery";
import { timeAgo } from "~/shared/datetime";

function postPermalink(postId: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/posts/${encodeURIComponent(postId)}`;
}

interface PostCardProps {
  post: Post;
  /** When false, comments start collapsed. Defaults to expanded. */
  defaultCommentsExpanded?: boolean;
}

function TopLevelCommentForm({
  postId,
  inputRef,
  onCancel,
}: {
  postId: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onCancel: () => void;
}) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await dispatch(
        createComment({ postId, content: trimmed })
      ).unwrap();
      setText("");
    } catch {
      showToast("Could not post comment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 border-t pt-3">
      <Textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Post your reply…"
        rows={3}
        className="text-sm"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={busy || !text.trim()}
          onClick={() => void submit()}
        >
          Reply
        </Button>
      </div>
    </div>
  );
}

export function PostCard({
  post,
  defaultCommentsExpanded = true,
}: PostCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const topReplyRef = useRef<HTMLTextAreaElement>(null);

  const currentUserId = useAppSelector(
    (s) => s.me.me?.id ?? s.auth.user?.id
  );
  const isOwnPost =
    currentUserId !== undefined && currentUserId === post.authorId;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [editBusy, setEditBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const detailPost = useAppSelector((s) => s.feed.detail.post);
  const detailComments = useAppSelector((s) => s.feed.detail.comments);
  const commentsByPostId = useAppSelector((s) => s.feed.commentsByPostId);
  const commentsLoadStatus = useAppSelector((s) => s.feed.commentsLoadStatus);

  const isDetailView = detailPost?.id === post.id;
  const comments = isDetailView
    ? detailComments
    : (commentsByPostId[post.id] ?? []);
  const commentsCached = post.id in commentsByPostId;
  const loadStatus = commentsLoadStatus[post.id] ?? "idle";

  const [commentsExpanded, setCommentsExpanded] = useState(
    defaultCommentsExpanded
  );
  const [topReplyOpen, setTopReplyOpen] = useState(false);

  useEffect(() => {
    if (!commentsExpanded) return;
    if (isDetailView) return;
    if (commentsCached) return;
    void dispatch(fetchPostComments({ postId: post.id }));
  }, [
    commentsExpanded,
    commentsCached,
    dispatch,
    isDetailView,
    post.id,
  ]);

  const tree = useMemo(
    () => buildCommentTree(comments),
    [comments]
  );

  const onShare = async () => {
    const url = postPermalink(post.id);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Post URL is pasted to the clipboard");
    } catch {
      showToast("Could not copy link to the clipboard");
    }
  };

  const openEdit = () => {
    setEditText(post.content);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setEditBusy(true);
    try {
      await dispatch(
        updatePost({ postId: post.id, content: trimmed })
      ).unwrap();
      showToast("Post updated.");
      setEditOpen(false);
    } catch {
      showToast("Could not update post.");
    } finally {
      setEditBusy(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await dispatch(deletePost({ postId: post.id })).unwrap();
      showToast("Post deleted.");
      setDeleteOpen(false);
      if (isDetailView) navigate("/feed");
    } catch {
      showToast("Could not delete post.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const onMainReply = () => {
    setCommentsExpanded(true);
    setTopReplyOpen(true);
  };

  useEffect(() => {
    if (!topReplyOpen || !commentsExpanded) return;
    const id = window.setTimeout(() => topReplyRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [topReplyOpen, commentsExpanded]);

  const commentCount = comments.length;

  return (
    <Card key={post.id}>
      <CardContent className="flex gap-4 p-6">
        <Link to={`/u/${post.author.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.profile?.avatarUrl ?? undefined} />
            <AvatarFallback>
              {post.author.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Link
                to={`/u/${post.author.username}`}
                className="text-sm font-semibold hover:underline"
              >
                {post.author.name || post.author.username}
              </Link>
              <span className="text-xs text-muted-foreground">
                @{post.author.username}
              </span>
              <span className="text-muted-foreground">·</span>
              <Link
                to={`/posts/${encodeURIComponent(post.id)}`}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                {timeAgo(post.createdAt)}
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="Post options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void onShare()}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                {isOwnPost ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => openEdit()}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {post.content}
          </p>

          {post.attachments.length > 0 ? (
            <PostMediaGallery attachments={post.attachments} />
          ) : null}

          <div className="flex flex-wrap gap-1 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled
              title="Coming soon"
            >
              <Heart className="mr-1 h-4 w-4" />
              Like
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled
              title="Coming soon"
            >
              <ThumbsDown className="mr-1 h-4 w-4" />
              Unlike
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled
              title="Coming soon"
            >
              <Repeat2 className="mr-1 h-4 w-4" />
              Repost
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMainReply}
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Reply
            </Button>
          </div>

          {commentCount > 0 ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setCommentsExpanded((e) => {
                    const next = !e;
                    if (!next) setTopReplyOpen(false);
                    return next;
                  });
                }}
              >
                {commentsExpanded ? "Hide comments" : "Show comments"}
                {` (${commentCount})`}
              </Button>
            </div>
          ) : null}

          {commentsExpanded ? (
            <div className="space-y-4 border-t pt-4">
              {loadStatus === "loading" && !isDetailView ? (
                <p className="text-sm text-muted-foreground">
                  Loading comments…
                </p>
              ) : null}
              {loadStatus === "failed" && !isDetailView ? (
                <p className="text-sm text-destructive">
                  Could not load comments.
                </p>
              ) : null}
              <CommentTree roots={tree} postId={post.id} />
              {topReplyOpen ? (
                <TopLevelCommentForm
                  postId={post.id}
                  inputRef={topReplyRef}
                  onCancel={() => setTopReplyOpen(false)}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent onClose={() => setEditOpen(false)}>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={5}
            className="text-sm"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={editBusy || !editText.trim()}
              onClick={() => void saveEdit()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent onClose={() => setDeleteOpen(false)}>
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove the post and all of its comments. This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy}
              onClick={() => void confirmDelete()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
