import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Check,
  CheckCheck,
  CornerDownLeft,
  MoreVertical,
  Paperclip,
  Pencil,
  X,
} from "lucide-react";
import {
  CHAT_ATTACHMENT_MAX_BYTES,
  type ChatMessageAttachmentBodyDTO,
} from "@social/shared";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { useToast } from "../../components/ToastProvider";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { timeAgo } from "../../shared/datetime";
import { uploadChatAttachment } from "../../shared/storage/s3";
import { fetchUserById } from "../../features/user/user.slice";
import { getChatSocket } from "../../features/chat/chat-socket";
import {
  acceptChatThread,
  blockPeerFromChat,
  deleteChatMessage,
  deleteChatThread,
  fetchChatMessages,
  fetchChatThreads,
  fetchChatUnread,
  markChatThreadRead,
  rejectChatThread,
  sendChatMessage,
  updateChatMessage,
} from "../../features/chat/chat.slice";
import { setRelationState } from "../../features/relation/relation.slice";
import { useChatThreadRoom } from "../../features/chat/useChatThreadRoom";
import type {
  ChatMessageDTO,
  ChatRequestAcceptedLineDTO,
  ChatThreadSummaryDTO,
} from "../../features/chat/chat.types";
import { cn } from "~/lib/utils";

function initials(name: string | null, username: string) {
  const display = name || username;
  return display
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatMessageTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function mergeChatTimeline(
  messages: ChatMessageDTO[],
  lines: ChatRequestAcceptedLineDTO[] | undefined,
): Array<
  | { kind: "message"; message: ChatMessageDTO }
  | { kind: "accepted"; line: ChatRequestAcceptedLineDTO }
> {
  const out: Array<
    | { kind: "message"; message: ChatMessageDTO }
    | { kind: "accepted"; line: ChatRequestAcceptedLineDTO }
  > = [];
  for (const message of messages) {
    out.push({ kind: "message", message });
  }
  for (const line of lines ?? []) {
    out.push({ kind: "accepted", line });
  }
  return out.sort(
    (a, b) =>
      (a.kind === "message"
        ? Date.parse(a.message.createdAt)
        : Date.parse(a.line.createdAt)) -
      (b.kind === "message"
        ? Date.parse(b.message.createdAt)
        : Date.parse(b.line.createdAt)),
  );
}

function chatReplySnippet(m: {
  content: string;
  attachment: ChatMessageDTO["attachment"];
}): string {
  const t = m.content?.trim();
  if (t) return t.length > 100 ? `${t.slice(0, 100)}…` : t;
  if (m.attachment?.fileName) return m.attachment.fileName;
  if (m.attachment) return "Attachment";
  return "Message";
}

function requestAcceptedCaption(
  meId: string | undefined,
  line: ChatRequestAcceptedLineDTO,
) {
  if (!meId) return `${line.accepterName} accepted the message request.`;
  if (line.accepterId === meId) return "You accepted the message request.";
  return `${line.accepterName} accepted your message request.`;
}

export default function MessagesRoute() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const withUserId = searchParams.get("with");

  const me = useAppSelector((s) => s.me.me);
  const threads = useAppSelector((s) => s.chat.threads);
  const threadsStatus = useAppSelector((s) => s.chat.threadsStatus);
  const messagesByThreadId = useAppSelector((s) => s.chat.messagesByThreadId);
  const requestAcceptedLinesByThreadId = useAppSelector(
    (s) => s.chat.requestAcceptedLinesByThreadId,
  );
  const typingByThreadId = useAppSelector((s) => s.chat.typingByThreadId);
  const peerOnlineByThreadId = useAppSelector(
    (s) => s.chat.peerOnlineByThreadId,
  );
  const entitiesById = useAppSelector((s) => s.users.entitiesById);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composeRecipientId, setComposeRecipientId] = useState<string | null>(
    null,
  );
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessageDTO | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);

  useChatThreadRoom(selectedId);

  useEffect(() => {
    setReplyingTo(null);
    setEditingMessageId(null);
    setText("");
  }, [selectedId]);

  useEffect(() => {
    if (editingMessageId) {
      composerInputRef.current?.focus();
    }
  }, [editingMessageId]);

  useEffect(() => {
    void dispatch(fetchChatThreads());
    void dispatch(fetchChatUnread());
  }, [dispatch]);

  useEffect(() => {
    if (!withUserId || !me) return;
    if (withUserId === me.id) {
      setSearchParams({}, { replace: true });
      return;
    }
    const existing = threads.find((t) => t.peer.id === withUserId);
    if (existing) {
      setSelectedId(existing.id);
      setComposeRecipientId(null);
    } else {
      setSelectedId(null);
      setComposeRecipientId(withUserId);
      if (!entitiesById[withUserId]) {
        void dispatch(fetchUserById({ userId: withUserId }));
      }
    }
  }, [withUserId, me, threads, dispatch, entitiesById, setSearchParams]);

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !threads.some((t) => t.id === selectedId)) {
      setSelectedId(null);
      setSearchParams({}, { replace: true });
    }
  }, [threads, selectedId, setSearchParams]);

  const composePeer = composeRecipientId
    ? entitiesById[composeRecipientId]
    : null;
  const selectedHasUnread = selected?.hasUnread ?? false;

  const msgState = selectedId ? messagesByThreadId[selectedId] : undefined;
  const acceptedLines = selectedId
    ? requestAcceptedLinesByThreadId[selectedId]
    : undefined;
  const timeline = mergeChatTimeline(msgState?.items ?? [], acceptedLines);

  useEffect(() => {
    if (!selectedId) return;
    void dispatch(fetchChatMessages({ threadId: selectedId }));
  }, [selectedId, dispatch]);

  useEffect(() => {
    if (!selectedId) return;
    if (!selectedHasUnread) return;
    void dispatch(markChatThreadRead({ threadId: selectedId }));
    void dispatch(fetchChatUnread());
    void dispatch(fetchChatThreads());
  }, [selectedId, selectedHasUnread, dispatch]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgState?.items.length, selectedId]);

  const emitTyping = useCallback((threadId: string, isTyping: boolean) => {
    const sock = getChatSocket();
    sock?.emit("typing", { threadId, isTyping });
  }, []);

  const onTextChange = (v: string) => {
    setText(v);
    if (!selectedId || editingMessageId) return;
    emitTyping(selectedId, true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitTyping(selectedId, false);
    }, 2000);
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingFile && !editingMessageId) return;

    const recipientId = composeRecipientId ?? selected?.peer.id ?? null;
    if (!recipientId && !editingMessageId) {
      showToast("Select a conversation");
      return;
    }
    if (!me?.id) return;

    try {
      if (selectedId) emitTyping(selectedId, false);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      if (editingMessageId) {
        if (!trimmed) return;
        setUploading(true);
        await dispatch(
          updateChatMessage({
            messageId: editingMessageId,
            content: trimmed,
          }),
        ).unwrap();
        setEditingMessageId(null);
        setText("");
        void dispatch(fetchChatUnread());
        void dispatch(fetchChatThreads());
        return;
      }

      setUploading(true);
      let attachment: ChatMessageAttachmentBodyDTO | undefined;
      if (pendingFile) {
        const up = await uploadChatAttachment({
          userId: me.id,
          file: pendingFile,
        });
        attachment = {
          url: up.url,
          contentType: up.contentType,
          byteSize: up.byteSize,
          fileName: pendingFile.name,
        };
      }

      const res = await dispatch(
        sendChatMessage({
          recipientId: recipientId!,
          content: trimmed,
          ...(attachment ? { attachment } : {}),
          ...(replyingTo ? { replyToMessageId: replyingTo.id } : {}),
        }),
      ).unwrap();
      setText("");
      setPendingFile(null);
      setReplyingTo(null);
      setComposeRecipientId(null);
      setSearchParams({}, { replace: true });
      setSelectedId(res.threadId);
      void dispatch(fetchChatUnread());
    } catch {
      showToast(
        editingMessageId
          ? "Could not update message"
          : "Could not send message",
      );
    } finally {
      setUploading(false);
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > CHAT_ATTACHMENT_MAX_BYTES) {
      showToast("File must be 100 MB or smaller");
      return;
    }
    setPendingFile(f);
  };

  const onSelectThread = (t: ChatThreadSummaryDTO) => {
    setSelectedId(t.id);
    setComposeRecipientId(null);
    setSearchParams({}, { replace: true });
  };

  /** Recipient of a pending request: show messages + Accept/Reject only (no input). */
  const isIncomingRequest =
    !!selected &&
    selected.status === "PENDING" &&
    selected.initiatedById !== me?.id;

  /** Requester already sent their one allowed message; wait for accept (API enforces the same). */
  const isInitiatorAwaitingAccept =
    !!selected &&
    selected.status === "PENDING" &&
    selected.initiatedById === me?.id &&
    !!selected.lastMessageAt;

  const showComposer =
    !isIncomingRequest &&
    !isInitiatorAwaitingAccept &&
    ((!!composeRecipientId && !!composePeer) ||
      (!!selected && selected.status !== "REJECTED"));

  const typingPeer = selectedId && typingByThreadId[selectedId]?.isTyping;

  const onDeleteChat = useCallback(async () => {
    if (!selectedId) return;
    if (
      !window.confirm(
        "Delete this conversation for both of you? This cannot be undone.",
      )
    )
      return;
    try {
      await dispatch(deleteChatThread({ threadId: selectedId })).unwrap();
      setSelectedId(null);
      setSearchParams({}, { replace: true });
      showToast("Conversation deleted");
    } catch {
      showToast("Could not delete conversation");
    }
  }, [selectedId, dispatch, setSearchParams, showToast]);

  const onBlockUserFromChat = useCallback(async () => {
    if (!selectedId || !selected) return;
    if (
      !window.confirm(
        `Block @${selected.peer.username}? You will not see each other here. They are not notified.`,
      )
    )
      return;
    try {
      const { blockedUserId } = await dispatch(
        blockPeerFromChat({ threadId: selectedId }),
      ).unwrap();
      dispatch(
        setRelationState({
          targetUserId: blockedUserId,
          rel: { blocked: true, followStatus: "NONE" },
        }),
      );
      setSelectedId(null);
      setSearchParams({}, { replace: true });
      showToast("User blocked");
    } catch {
      showToast("Could not block user");
    }
  }, [selectedId, selected, dispatch, setSearchParams, showToast]);

  return (
    <div className="flex flex-col gap-4 -mx-4 px-0 sm:mx-0 sm:px-0 min-h-[calc(100dvh-10rem)]">
      <h1 className="text-xl font-semibold px-4 sm:px-0">Messages</h1>
      <div className="flex border rounded-lg overflow-hidden bg-card min-h-[480px] max-h-[calc(100dvh-11rem)]">
        <aside className="w-full sm:w-80 border-r flex flex-col shrink-0 bg-muted/30">
          <div className="p-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto">
            {threadsStatus === "loading" && !threads.length ? (
              <div className="p-4 text-sm text-muted-foreground">Loading…</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No conversations yet. Visit a profile to send a message.
              </div>
            ) : (
              threads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectThread(t)}
                  aria-label={
                    t.hasUnread
                      ? `Conversation with @${t.peer.username}, unread or needs your attention`
                      : `Conversation with @${t.peer.username}`
                  }
                  className={cn(
                    "w-full text-left border-b border-border/60 border-l-2 py-2.5 pl-3 pr-3 flex gap-2 hover:bg-accent/80 transition-colors",
                    t.hasUnread
                      ? "border-l-destructive"
                      : "border-l-transparent",
                    selectedId === t.id && "bg-accent",
                    t.hasUnread && "font-semibold",
                  )}
                >
                  <div className="relative h-10 w-10 shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={t.peer.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {initials(t.peer.name, t.peer.username)}
                      </AvatarFallback>
                    </Avatar>
                    {t.hasUnread ? (
                      <span
                        className="absolute right-0 top-0 z-10 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-muted/30"
                        title="Waiting for your view"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-1 items-baseline">
                      <span className="truncate text-sm">
                        @{t.peer.username}
                      </span>
                      {t.lastMessageAt ? (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(t.lastMessageAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.status === "PENDING" && t.pendingIncoming
                        ? "Message request"
                        : (t.lastMessagePreview ?? "—")}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          {composeRecipientId && !selectedId && !composePeer ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : composeRecipientId && composePeer && !selectedId ? (
            <>
              <header className="border-b px-4 py-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={composePeer.profile?.avatarUrl ?? undefined}
                  />
                  <AvatarFallback>
                    {initials(composePeer.name, composePeer.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {composePeer.name || composePeer.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    @{composePeer.username}
                  </div>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto px-4 py-6 flex items-center justify-center text-sm text-muted-foreground text-center">
                Send a message to start the conversation. They will need to
                accept your request before you can continue chatting.
              </div>
            </>
          ) : selected ? (
            <>
              <header className="border-b px-4 py-3 flex items-center gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={selected.peer.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {initials(selected.peer.name, selected.peer.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        @{selected.peer.username}
                      </span>
                      {selectedId && peerOnlineByThreadId[selectedId] ? (
                        <span
                          className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"
                          title="Online"
                        />
                      ) : (
                        <span
                          className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0"
                          title="Offline"
                        />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {typingPeer ? (
                        <span className="text-primary">Typing…</span>
                      ) : selected.status === "REJECTED" ? (
                        "Conversation declined"
                      ) : isIncomingRequest ? (
                        "Message request — accept to reply"
                      ) : isInitiatorAwaitingAccept ? (
                        "Waiting for them to accept your request"
                      ) : (
                        "Messages are end-to-end visible to participants"
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-md"
                      aria-label="Conversation options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[10rem]">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => {
                        void onDeleteChat();
                      }}
                    >
                      Delete chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => {
                        void onBlockUserFromChat();
                      }}
                    >
                      Block user
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-background/50">
                {msgState?.status === "loading" && !msgState.items.length ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : null}
                {timeline.map((entry) => {
                  if (entry.kind === "accepted") {
                    const line = entry.line;
                    return (
                      <div
                        key={`acc-${line.eventId}`}
                        className="flex justify-center py-1"
                      >
                        <p className="max-w-[min(100%,28rem)] text-center text-xs leading-snug text-muted-foreground rounded-full bg-muted/90 px-3 py-1.5 border border-border/60">
                          {requestAcceptedCaption(me?.id, line)}
                          <span className="ml-1.5 tabular-nums opacity-80">
                            {formatMessageTime(line.createdAt)}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  const m = entry.message;
                  const mine = m.senderId === me?.id;
                  const att = m.attachment;
                  const isImage =
                    att?.contentType?.toLowerCase().startsWith("image/") ??
                    false;
                  const canEditText = mine && !!m.content.trim();
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex w-full group",
                        mine ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "flex gap-1 items-end max-w-[min(100%,24rem)]",
                          mine ? "flex-row-reverse" : "flex-row",
                        )}
                      >
                        {!mine ? (
                          <div className="flex flex-col justify-center shrink-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              aria-label="Reply"
                              onClick={() => {
                                setEditingMessageId(null);
                                setReplyingTo(m);
                                composerInputRef.current?.focus();
                              }}
                            >
                              <CornerDownLeft className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null}
                        <div
                          className={cn(
                            "min-w-0 rounded-2xl px-3 py-2 text-sm",
                            mine
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md",
                          )}
                        >
                          {m.replyTo ? (
                            <div
                              className={cn(
                                "mb-1.5 pl-2 border-l-2 space-y-0.5 text-[11px]",
                                mine
                                  ? "border-primary-foreground/45 opacity-95"
                                  : "border-primary/70 opacity-90",
                              )}
                            >
                              <div className="font-medium">
                                @{m.replyTo.senderUsername}
                              </div>
                              <div className="truncate">
                                {chatReplySnippet(m.replyTo)}
                              </div>
                            </div>
                          ) : null}
                          {att ? (
                            <div className="mb-1 space-y-1">
                              {isImage ? (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block overflow-hidden rounded-md"
                                >
                                  <img
                                    src={att.url}
                                    alt={att.fileName ?? "Attachment"}
                                    className="max-h-48 max-w-full object-contain"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={att.fileName || undefined}
                                  className={cn(
                                    "inline-flex max-w-full break-all text-xs underline",
                                    mine ? "text-primary-foreground" : "",
                                  )}
                                >
                                  {att.fileName ?? "Download file"} (
                                  {Math.round(att.byteSize / 1024)} KB)
                                </a>
                              )}
                            </div>
                          ) : null}
                          {m.content.trim() ? (
                            <p className="whitespace-pre-wrap break-words">
                              {m.content}
                            </p>
                          ) : null}
                          <div
                            className={cn(
                              "flex items-center justify-end gap-1 mt-1 text-[10px] opacity-80",
                              mine ? "text-primary-foreground" : "",
                            )}
                          >
                            <span>{formatMessageTime(m.createdAt)}</span>
                            {m.editedAt ? (
                              <span className="opacity-70">· edited</span>
                            ) : null}
                            {mine ? (
                              m.readAt ? (
                                <CheckCheck
                                  className="h-3.5 w-3.5"
                                  aria-label="Read"
                                />
                              ) : (
                                <Check
                                  className="h-3.5 w-3.5"
                                  aria-label="Sent"
                                />
                              )
                            ) : null}
                          </div>
                        </div>
                        {mine ? (
                          <div className="flex flex-col justify-center shrink-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  aria-label="Message actions"
                                >
                                  <Pencil className="h-4 w-4" fill="gray" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="min-w-[9rem]"
                              >
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setEditingMessageId(null);
                                    setReplyingTo(m);
                                    queueMicrotask(() =>
                                      composerInputRef.current?.focus(),
                                    );
                                  }}
                                >
                                  Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={!canEditText}
                                  onSelect={() => {
                                    if (!canEditText) return;
                                    setReplyingTo(null);
                                    setPendingFile(null);
                                    setEditingMessageId(m.id);
                                    setText(m.content);
                                    queueMicrotask(() =>
                                      composerInputRef.current?.focus(),
                                    );
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={() => {
                                    if (!window.confirm("Delete this message?"))
                                      return;
                                    void (async () => {
                                      try {
                                        await dispatch(
                                          deleteChatMessage({
                                            messageId: m.id,
                                          }),
                                        ).unwrap();
                                        void dispatch(fetchChatThreads());
                                        void dispatch(fetchChatUnread());
                                      } catch {
                                        showToast("Could not delete message");
                                      }
                                    })();
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                <div ref={listEndRef} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6">
              Select a conversation or open a profile to start a chat.
            </div>
          )}

          {isIncomingRequest && selected ? (
            <div className="border-t p-3 flex flex-col gap-2 bg-background sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:flex-1"
                onClick={async () => {
                  try {
                    await dispatch(
                      rejectChatThread({ threadId: selected.id }),
                    ).unwrap();
                    showToast("Request declined");
                    void dispatch(fetchChatThreads());
                    void dispatch(fetchChatUnread());
                  } catch {
                    showToast("Could not decline");
                  }
                }}
              >
                Reject
              </Button>
              <Button
                type="button"
                className="w-full sm:flex-1"
                onClick={async () => {
                  try {
                    await dispatch(
                      acceptChatThread({ threadId: selected.id }),
                    ).unwrap();
                    showToast("You can chat now");
                    void dispatch(fetchChatThreads());
                    void dispatch(fetchChatUnread());
                  } catch {
                    showToast("Could not accept");
                  }
                }}
              >
                Accept
              </Button>
            </div>
          ) : showComposer && (selected || composePeer) ? (
            <div className="border-t p-3 space-y-2 bg-background">
              {replyingTo && !editingMessageId ? (
                <div className="flex items-start justify-between gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-xs">
                  <div className="min-w-0">
                    <span className="text-muted-foreground">Replying to </span>
                    <span className="font-medium">
                      {replyingTo.senderId === me?.id
                        ? "You"
                        : `@${selected?.peer.username ?? "…"}`}
                    </span>
                    <p className="truncate text-muted-foreground mt-0.5">
                      {chatReplySnippet(replyingTo)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    aria-label="Cancel reply"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : null}
              {editingMessageId ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-dashed px-2 py-1.5 text-xs">
                  <span className="text-muted-foreground">Editing message</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      setEditingMessageId(null);
                      setText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : null}
              {pendingFile ? (
                <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-xs">
                  <span className="truncate">{pendingFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    aria-label="Remove file"
                    onClick={() => setPendingFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={onPickFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  title={`Attach file (max ${CHAT_ATTACHMENT_MAX_BYTES / (1024 * 1024)} MB)`}
                  aria-label="Attach file"
                  disabled={uploading || !!editingMessageId}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  ref={composerInputRef}
                  placeholder={
                    editingMessageId ? "Edit message…" : "Type a message…"
                  }
                  value={text}
                  disabled={uploading}
                  onChange={(e) => onTextChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  disabled={
                    uploading ||
                    (!editingMessageId && !text.trim() && !pendingFile) ||
                    (!!editingMessageId && !text.trim())
                  }
                  onClick={() => void send()}
                >
                  {uploading
                    ? editingMessageId
                      ? "Saving…"
                      : "Sending…"
                    : editingMessageId
                      ? "Save"
                      : "Send"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Attachments up to {CHAT_ATTACHMENT_MAX_BYTES / (1024 * 1024)} MB
              </p>
            </div>
          ) : isInitiatorAwaitingAccept && selected ? (
            <div className="border-t px-3 py-3 text-center text-xs sm:text-sm text-muted-foreground bg-muted/20">
              You can send more after @{selected.peer.username} accepts your
              request.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
