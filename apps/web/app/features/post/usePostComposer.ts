import { useCallback, useEffect, useRef, useState } from "react";
import { CreatePostAttachmentKindDTO } from "@social/shared";

import { useToast } from "../../components/ToastProvider";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getApiErrorMessage } from "../../shared/api/client";
import { uploadPostMedia } from "../../shared/storage/s3";
import { createPost } from "./post.slice";
import {
  POST_MEDIA_ACCEPT_ATTR,
  isAllowedVideoFile,
  postMediaSelectionErrorMessage,
  validatePostMediaFiles,
} from "./post-media.constants";

export function usePostComposer(options?: { onSuccess?: () => void }) {
  const onSuccessRef = useRef(options?.onSuccess);
  useEffect(() => {
    onSuccessRef.current = options?.onSuccess;
  }, [options?.onSuccess]);

  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const meId = useAppSelector((s) => s.me.me?.id ?? s.auth.user?.id);
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clear = useCallback(() => {
    setContent("");
    setPendingFiles([]);
  }, []);

  const onPickFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files ? Array.from(e.target.files) : [];
      e.target.value = "";
      const res = validatePostMediaFiles(pendingFiles, list);
      if (!res.ok) {
        showToast(postMediaSelectionErrorMessage(res.issue));
        return;
      }
      setPendingFiles(res.merged);
    },
    [pendingFiles, showToast],
  );

  const submitPost = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed && pendingFiles.length === 0) return;
    if (!meId) {
      showToast("You must be signed in to post.");
      return;
    }
    setPosting(true);
    try {
      let attachments:
        | {
            url: string;
            contentType: string;
            byteSize: number;
            kind: CreatePostAttachmentKindDTO;
          }[]
        | undefined;

      if (pendingFiles.length > 0) {
        try {
          const uploaded = await Promise.all(
            pendingFiles.map((f) => uploadPostMedia({ userId: meId, file: f })),
          );
          attachments = uploaded.map((u, i) => ({
            url: u.url,
            contentType: u.contentType,
            byteSize: u.byteSize,
            kind: isAllowedVideoFile(pendingFiles[i]!)
              ? CreatePostAttachmentKindDTO.video
              : CreatePostAttachmentKindDTO.image,
          }));
        } catch (uploadErr) {
          const msg =
            uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
          if (msg.includes("Missing PUBLIC_")) {
            showToast(
              "Media upload isn’t configured. Set PUBLIC_S3_* in apps/web/.env (see .env.example).",
            );
          } else if (
            /NetworkError|Failed to fetch|Load failed|CORS/i.test(msg)
          ) {
            showToast(
              "Could not reach storage (S3). If you use Docker, ensure LocalStack is running and CORS allows this site’s origin.",
            );
          } else if (
            /DOMParser|Deserialization error|\$response/i.test(msg)
          ) {
            showToast(
              "Upload failed: storage returned a bad response. Ensure LocalStack is up (port 4566), CORS allows your origin, and PUBLIC_S3_* point at http://127.0.0.1:4566 (not /s3). Docker Compose sets this on the web service by default.",
            );
          } else {
            showToast(`Could not upload media: ${msg}`);
          }
          return;
        }
      }

      await dispatch(
        createPost(
          attachments?.length
            ? { content: trimmed, attachments }
            : { content: trimmed },
        ),
      ).unwrap();
      clear();
      onSuccessRef.current?.();
    } catch (e) {
      const thunkMsg =
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : null;
      showToast(
        thunkMsg ??
          getApiErrorMessage(e) ??
          "Could not create post. Check your connection and try again.",
      );
    } finally {
      setPosting(false);
    }
  }, [clear, content, dispatch, meId, pendingFiles, showToast]);

  const canSubmit =
    (content.trim().length > 0 || pendingFiles.length > 0) && !posting;

  return {
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
    meId,
    postMediaAccept: POST_MEDIA_ACCEPT_ATTR,
  };
}
