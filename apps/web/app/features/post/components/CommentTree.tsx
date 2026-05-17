import { useState } from "react";
import { Link } from "react-router";
import { Heart, MessageCircle, ThumbsDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { CommentNode } from "../comment-tree.utils";
import { createComment } from "../post.slice";
import { useAppDispatch } from "~/store/hooks";
import { timeAgo } from "~/shared/datetime";

function CommentReplyForm({
  postId,
  parentCommentId,
  onDone,
}: {
  postId: string;
  parentCommentId: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    setErr(null);
    try {
      await dispatch(
        createComment({
          postId,
          content: trimmed,
          parentCommentId,
        })
      ).unwrap();
      setText("");
      onDone();
    } catch {
      setErr("Could not post reply.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 space-y-2 border-l-2 border-muted pl-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply…"
        rows={2}
        className="text-sm"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy || !text.trim()}
          onClick={() => void submit()}
        >
          Reply
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}

function CommentBranch({
  node,
  postId,
  depth,
}: {
  node: CommentNode;
  postId: string;
  depth: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <div
      className="space-y-2"
      style={{ marginLeft: depth > 0 ? Math.min(depth * 12, 48) : 0 }}
    >
      <div className="flex gap-2">
        <Link to={`/u/${node.author.username}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={node.author.profile?.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs">
              {node.author.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2 text-xs">
            <Link
              to={`/u/${node.author.username}`}
              className="font-semibold hover:underline"
            >
              {node.author.name || node.author.username}
            </Link>
            <span className="text-muted-foreground">
              @{node.author.username}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{timeAgo(node.createdAt)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
            {node.content}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              disabled
              title="Coming soon"
            >
              <Heart className="mr-1 h-3.5 w-3.5" />
              Like
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              disabled
              title="Coming soon"
            >
              <ThumbsDown className="mr-1 h-3.5 w-3.5" />
              Unlike
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setReplyOpen((v) => !v)}
            >
              <MessageCircle className="mr-1 h-3.5 w-3.5" />
              Reply
            </Button>
          </div>
          {replyOpen ? (
            <CommentReplyForm
              postId={postId}
              parentCommentId={node.id}
              onDone={() => setReplyOpen(false)}
            />
          ) : null}
        </div>
      </div>
      {node.children.length > 0 ? (
        <div className="space-y-3 border-l border-muted/60 pl-3">
          {node.children.map((ch) => (
            <CommentBranch
              key={ch.id}
              node={ch}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CommentTree({
  roots,
  postId,
}: {
  roots: CommentNode[];
  postId: string;
}) {
  if (roots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {roots.map((node) => (
        <CommentBranch key={node.id} node={node} postId={postId} depth={0} />
      ))}
    </div>
  );
}
