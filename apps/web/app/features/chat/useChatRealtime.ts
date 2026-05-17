import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

import { resolveApiSocketOrigin } from "../../shared/api/client";
import { getAccessToken } from "../../shared/auth/token-storage";
import { setChatSocket } from "./chat-socket";
import { store } from "../../store/store";
import { useAppDispatch } from "../../store/hooks";
import {
  chatMessageDeletedReceived,
  chatMessageReceived,
  chatMessageUpdatedReceived,
  chatPresenceReceived,
  chatReadReceived,
  chatRequestAcceptedLineReceived,
  chatThreadDeletedReceived,
  chatThreadStatusReceived,
  chatTypingReceived,
  chatUnreadReceived,
  fetchChatThreads,
} from "./chat.slice";

export const CHAT_MESSAGE_EVENT = "chat.message";
export const CHAT_UNREAD_EVENT = "chat.unread";
export const CHAT_THREAD_UPDATED_EVENT = "chat.thread.updated";
export const CHAT_TYPING_EVENT = "chat.typing";
export const CHAT_PRESENCE_EVENT = "chat.presence";
export const CHAT_READ_EVENT = "chat.read";
export const CHAT_REQUEST_ACCEPTED_EVENT = "chat.request.accepted";
export const CHAT_THREAD_DELETED_EVENT = "chat.thread.deleted";
export const CHAT_MESSAGE_UPDATED_EVENT = "chat.message.updated";
export const CHAT_MESSAGE_DELETED_EVENT = "chat.message.deleted";

/**
 * Socket.IO `/chat` namespace — JWT in `auth.token`.
 * Pass `null` for userId to disconnect (e.g. logged out).
 */
export function useChatRealtime(userId: string | null) {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${resolveApiSocketOrigin()}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    setChatSocket(socket);

    socket.on(CHAT_MESSAGE_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as Record<string, unknown>;
      const message = o.message as
        | import("./chat.types").ChatMessageDTO
        | undefined;
      const threadId = o.threadId as string | undefined;
      const threadSummary = o.threadSummary as
        | import("./chat.types").ChatThreadSummaryDTO
        | null
        | undefined;
      if (!message?.id || !threadId) return;
      dispatch(
        chatMessageReceived({
          message,
          threadId,
          threadSummary: threadSummary ?? null,
        }),
      );
    });

    socket.on(CHAT_UNREAD_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const u = raw as import("./chat.types").ChatUnreadSummaryDTO;
      if (typeof u.total !== "number") return;
      dispatch(chatUnreadReceived(u));
    });

    socket.on(CHAT_THREAD_UPDATED_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as { threadId?: string; status?: string };
      if (!o.threadId || !o.status) return;
      if (o.status !== "PENDING" && o.status !== "ACTIVE" && o.status !== "REJECTED")
        return;
      dispatch(
        chatThreadStatusReceived({
          threadId: o.threadId,
          status: o.status,
        }),
      );
      void dispatch(fetchChatThreads());
    });

    socket.on(CHAT_THREAD_DELETED_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as { threadId?: string };
      if (!o.threadId) return;
      dispatch(chatThreadDeletedReceived({ threadId: o.threadId }));
    });

    socket.on(CHAT_MESSAGE_UPDATED_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as {
        threadId?: string;
        message?: import("./chat.types").ChatMessageDTO;
      };
      if (!o.threadId || !o.message?.id) return;
      dispatch(
        chatMessageUpdatedReceived({
          threadId: o.threadId,
          message: o.message,
        }),
      );
      void dispatch(fetchChatThreads());
    });

    socket.on(CHAT_MESSAGE_DELETED_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as { threadId?: string; messageId?: string };
      if (!o.threadId || !o.messageId) return;
      dispatch(
        chatMessageDeletedReceived({
          threadId: o.threadId,
          messageId: o.messageId,
        }),
      );
      void dispatch(fetchChatThreads());
    });

    socket.on(CHAT_REQUEST_ACCEPTED_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as {
        threadId?: string;
        eventId?: string;
        acceptedAt?: string;
        accepterId?: string;
        accepterName?: string;
      };
      if (
        !o.threadId ||
        !o.eventId ||
        !o.acceptedAt ||
        !o.accepterId ||
        typeof o.accepterName !== "string"
      )
        return;
      dispatch(
        chatRequestAcceptedLineReceived({
          threadId: o.threadId,
          eventId: o.eventId,
          acceptedAt: o.acceptedAt,
          accepterId: o.accepterId,
          accepterName: o.accepterName,
        }),
      );
    });

    socket.on(CHAT_READ_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as {
        threadId?: string;
        messageIds?: string[];
        readAt?: string;
      };
      if (!o.threadId || !Array.isArray(o.messageIds) || !o.readAt) return;
      dispatch(
        chatReadReceived({
          threadId: o.threadId,
          messageIds: o.messageIds,
          readAt: o.readAt,
        }),
      );
    });

    socket.on(CHAT_TYPING_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as {
        threadId?: string;
        userId?: string;
        isTyping?: boolean;
      };
      if (!o.threadId || !o.userId) return;
      const me = store.getState().me.me?.id;
      if (me && o.userId === me) return;
      dispatch(
        chatTypingReceived({
          threadId: o.threadId,
          userId: o.userId,
          isTyping: !!o.isTyping,
        }),
      );
    });

    socket.on(CHAT_PRESENCE_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as {
        threadId?: string;
        userId?: string;
        online?: boolean;
      };
      if (!o.threadId || !o.userId) return;
      const me = store.getState().me.me?.id;
      if (me && o.userId === me) return;
      dispatch(
        chatPresenceReceived({
          threadId: o.threadId,
          userId: o.userId,
          online: !!o.online,
        }),
      );
    });

    return () => {
      socket.disconnect();
      setChatSocket(null);
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [userId, dispatch]);
}
