import { useCallback, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { PostAttachment } from "../post.types";

function MediaTile({
  attachment,
  onOpen,
  className,
  overlay,
}: {
  attachment: PostAttachment;
  onOpen: () => void;
  className?: string;
  overlay?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={
        className ??
        "relative block aspect-square w-full overflow-hidden rounded-md bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      }
    >
      {attachment.kind === "image" ? (
        <img
          src={attachment.url}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <video
          src={attachment.url}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      )}
      {overlay}
    </button>
  );
}

function MediaLightbox({
  open,
  onOpenChange,
  attachments,
  index,
  onIndexChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: PostAttachment[];
  index: number;
  onIndexChange: (i: number) => void;
}) {
  const att = attachments[index];
  const hasNav = attachments.length > 1;

  const prev = useCallback(() => {
    onIndexChange((index - 1 + attachments.length) % attachments.length);
  }, [attachments.length, index, onIndexChange]);

  const next = useCallback(() => {
    onIndexChange((index + 1) % attachments.length);
  }, [attachments.length, index, onIndexChange]);

  if (!att) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      panelClassName="max-w-5xl w-full border-none bg-black/95 text-white shadow-2xl"
    >
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="p-4 sm:p-6"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Media preview</DialogTitle>
        </DialogHeader>
        <div className="relative flex min-h-[40vh] items-center justify-center">
          {hasNav ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-0 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : null}
          {att.kind === "image" ? (
            <img
              src={att.url}
              alt=""
              className="max-h-[80vh] max-w-full object-contain"
            />
          ) : (
            <video
              src={att.url}
              className="max-h-[80vh] max-w-full"
              controls
              playsInline
            />
          )}
          {hasNav ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-0 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PostMediaGallery({
  attachments,
}: {
  attachments: PostAttachment[];
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [carousel, setCarousel] = useState(0);

  const n = attachments.length;
  if (n === 0) return null;

  const openAt = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  if (n === 1) {
    const a = attachments[0];
    return (
      <>
        <div className="mt-2 overflow-hidden rounded-lg border border-border bg-muted">
          <MediaTile
            attachment={a}
            onOpen={() => openAt(0)}
            className="relative block max-h-[min(420px,70vh)] w-full overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          />
        </div>
        <MediaLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          attachments={attachments}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      </>
    );
  }

  if (n === 2) {
    return (
      <>
        <div className="mt-2 grid grid-cols-2 gap-1 sm:gap-2">
          {attachments.map((a, i) => (
            <MediaTile key={a.id} attachment={a} onOpen={() => openAt(i)} />
          ))}
        </div>
        <MediaLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          attachments={attachments}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      </>
    );
  }

  if (n === 3) {
    const i0 = carousel % n;
    const i1 = (carousel + 1) % n;
    return (
      <>
        <div className="relative mt-2">
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            <MediaTile
              key={attachments[i0].id}
              attachment={attachments[i0]}
              onOpen={() => openAt(i0)}
            />
            <MediaTile
              key={attachments[i1].id}
              attachment={attachments[i1]}
              onOpen={() => openAt(i1)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-border bg-background/90 shadow-sm"
            aria-label="Show previous media"
            onClick={() => setCarousel((c) => (c - 1 + n) % n)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-border bg-background/90 shadow-sm"
            aria-label="Show next media"
            onClick={() => setCarousel((c) => (c + 1) % n)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <MediaLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          attachments={attachments}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      </>
    );
  }

  const overflow = n > 4;
  const visible = overflow ? attachments.slice(0, 4) : attachments;
  const extra = overflow ? n - 4 : 0;

  return (
    <>
      <div className="mt-2 grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2">
        {visible.map((a, idx) => {
          const isLastCell = overflow && idx === 3;
          return (
            <MediaTile
              key={a.id}
              attachment={a}
              onOpen={() => openAt(isLastCell ? 4 : idx)}
              overlay={
                isLastCell && extra > 0 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
                    +{extra}
                  </span>
                ) : undefined
              }
            />
          );
        })}
      </div>
      <MediaLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        attachments={attachments}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
