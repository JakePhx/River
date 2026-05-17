/** Mirrors server-side `POST_ATTACHMENT_POLICY` for UX validation before upload. */
export const POST_MEDIA_MAX_FILES = 4;
export const POST_MEDIA_MAX_TOTAL_BYTES = 100 * 1024 * 1024;
export const POST_MEDIA_MAX_VIDEOS = 2;

export const POST_MEDIA_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "avif",
  "bmp",
  "svg",
] as const;

export const POST_MEDIA_VIDEO_EXTENSIONS = [
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "m4v",
] as const;

export const POST_MEDIA_ACCEPT_ATTR = "image/*,video/*";

function fileExt(file: File): string {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function isAllowedImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = fileExt(file);
  return POST_MEDIA_IMAGE_EXTENSIONS.includes(ext as (typeof POST_MEDIA_IMAGE_EXTENSIONS)[number]);
}

export function isAllowedVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  const ext = fileExt(file);
  return POST_MEDIA_VIDEO_EXTENSIONS.includes(ext as (typeof POST_MEDIA_VIDEO_EXTENSIONS)[number]);
}

export function isAllowedPostMediaFile(file: File): boolean {
  return isAllowedImageFile(file) || isAllowedVideoFile(file);
}

export type PostMediaSelectionIssue =
  | "type"
  | "count"
  | "videos"
  | "size";

export function validatePostMediaFiles(
  current: File[],
  adding: File[],
): { ok: true; merged: File[] } | { ok: false; issue: PostMediaSelectionIssue } {
  const merged = [...current, ...adding];
  if (merged.length > POST_MEDIA_MAX_FILES) {
    return { ok: false, issue: "count" };
  }
  let videos = 0;
  let total = 0;
  for (const f of merged) {
    if (!isAllowedPostMediaFile(f)) return { ok: false, issue: "type" };
    total += f.size;
    if (isAllowedVideoFile(f)) videos += 1;
  }
  if (videos > POST_MEDIA_MAX_VIDEOS) return { ok: false, issue: "videos" };
  if (total > POST_MEDIA_MAX_TOTAL_BYTES) return { ok: false, issue: "size" };
  return { ok: true, merged };
}

export function postMediaSelectionErrorMessage(issue: PostMediaSelectionIssue): string {
  switch (issue) {
    case "type":
      return "Only supported photo or video types are allowed.";
    case "count":
      return `You can attach at most ${POST_MEDIA_MAX_FILES} files per post.`;
    case "videos":
      return `You can attach at most ${POST_MEDIA_MAX_VIDEOS} videos per post.`;
    case "size":
      return "Total attachment size cannot exceed 100MB.";
    default:
      return "Invalid media selection.";
  }
}
