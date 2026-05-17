import { useEffect } from "react";
import { Paperclip, X } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { useAppSelector } from "../../../store/hooks";
import { usePostComposer } from "../usePostComposer";

type NewPostModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** After a successful create (e.g. refresh profile posts). */
  onPosted?: () => void;
};

export function NewPostModal({
  open,
  onOpenChange,
  onPosted,
}: NewPostModalProps) {
  const me = useAppSelector((s) => s.me.me);
  const {
    content,
    setContent,
    pendingFiles,
    setPendingFiles,
    posting,
    fileInputRef,
    onPickFiles,
    submitPost,
    clear,
    canSubmit,
    postMediaAccept,
  } = usePostComposer({
    onSuccess: () => {
      onPosted?.();
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) clear();
  }, [open, clear]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 pt-1">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={me?.profile?.avatarUrl ?? undefined} />
            <AvatarFallback>
              {(me?.username ?? me?.name ?? "?")[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What’s happening?"
              rows={4}
              className="resize-none"
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
                        setPendingFiles((prev) => prev.filter((_, j) => j !== i))
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
        <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 w-full sm:w-auto"
            onClick={() => fileInputRef.current?.click()}
            disabled={posting || pendingFiles.length >= 4}
          >
            <Paperclip className="h-4 w-4" />
            Attach media
          </Button>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <span className="text-sm text-muted-foreground">
              {content.length}/280
            </span>
            <Button
              type="button"
              onClick={() => void submitPost()}
              disabled={!canSubmit || posting}
            >
              {posting ? "Posting…" : "Post"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
