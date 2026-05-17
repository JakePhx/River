import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { api, getApiErrorMessage } from "../../shared/api/client";
import { logout } from "../auth/auth.slice";

import type {
  ChatMessageDTO,
  ChatMessagesState,
  ChatRequestAcceptedLineDTO,
  ChatThreadSummaryDTO,
  ChatUnreadSummaryDTO,
} from "./chat.types";
import type {
  ListChatMessagesResponseDTO,
  ListChatThreadsResponseDTO,
  SendChatMessageBodyDTO,
} from "@social/shared";

type ChatError = { code: string; message: string };

type ChatState = {
  threads: ChatThreadSummaryDTO[];
  threadsStatus: "idle" | "loading" | "failed";
  threadsError: ChatError | null;
  messagesByThreadId: Record<string, ChatMessagesState>;
  /** System lines shown in the message timeline (e.g. request accepted). */
  requestAcceptedLinesByThreadId: Record<string, ChatRequestAcceptedLineDTO[]>;
  unread: ChatUnreadSummaryDTO | null;
  unreadStatus: "idle" | "loading" | "failed";
  typingByThreadId: Record<string, { userId: string; isTyping: boolean }>;
  peerOnlineByThreadId: Record<string, boolean>;
};

const emptyMessages = (): ChatMessagesState => ({
  items: [],
  nextCursor: null,
  status: "idle",
});

const initialState: ChatState = {
  threads: [],
  threadsStatus: "idle",
  threadsError: null,
  messagesByThreadId: {},
  requestAcceptedLinesByThreadId: {},
  unread: null,
  unreadStatus: "idle",
  typingByThreadId: {},
  peerOnlineByThreadId: {},
};

function upsertThread(
  threads: ChatThreadSummaryDTO[],
  next: ChatThreadSummaryDTO,
): ChatThreadSummaryDTO[] {
  const idx = threads.findIndex((t) => t.id === next.id);
  const copy = [...threads];
  if (idx >= 0) copy[idx] = next;
  else copy.push(next);
  return copy.sort((a, b) => {
    const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
    const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
    return tb - ta;
  });
}

export const fetchChatThreads = createAsyncThunk<
  ChatThreadSummaryDTO[],
  void,
  { rejectValue: ChatError }
>("chat/fetchThreads", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<ListChatThreadsResponseDTO>("/chat/threads");
    return res.data.threads ?? [];
  } catch (e) {
    return rejectWithValue({
      code: "FETCH_CHAT_THREADS_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const fetchChatUnread = createAsyncThunk<
  ChatUnreadSummaryDTO,
  void,
  { rejectValue: ChatError }
>("chat/fetchUnread", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<ChatUnreadSummaryDTO>("/chat/unread");
    return res.data;
  } catch (e) {
    return rejectWithValue({
      code: "FETCH_CHAT_UNREAD_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const fetchChatMessages = createAsyncThunk<
  { threadId: string; messages: ChatMessageDTO[]; nextCursor: string | null },
  { threadId: string; cursor?: string },
  { rejectValue: ChatError }
>("chat/fetchMessages", async ({ threadId, cursor }, { rejectWithValue }) => {
  try {
    const res = await api.get<ListChatMessagesResponseDTO>(
      `/chat/threads/${threadId}/messages`,
      { params: cursor ? { cursor } : undefined },
    );
    return {
      threadId,
      messages: res.data.messages ?? [],
      nextCursor: res.data.nextCursor ?? null,
    };
  } catch (e) {
    return rejectWithValue({
      code: "FETCH_CHAT_MESSAGES_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const sendChatMessage = createAsyncThunk<
  { message: ChatMessageDTO; threadId: string },
  SendChatMessageBodyDTO,
  { rejectValue: ChatError }
>("chat/sendMessage", async (body, { rejectWithValue, dispatch, getState }) => {
  try {
    const res = await api.post<{ message: ChatMessageDTO; threadId: string }>(
      "/chat/messages",
      body,
    );
    const { threadId } = res.data;
    const hadThread = (
      getState() as { chat: { threads: { id: string }[] } }
    ).chat.threads.some((t) => t.id === threadId);
    if (!hadThread) {
      await dispatch(fetchChatThreads());
    }
    return res.data;
  } catch (e) {
    return rejectWithValue({
      code: "SEND_CHAT_MESSAGE_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const acceptChatThread = createAsyncThunk<
  { threadId: string },
  { threadId: string },
  { rejectValue: ChatError }
>("chat/acceptThread", async ({ threadId }, { rejectWithValue }) => {
  try {
    await api.post(`/chat/threads/${threadId}/accept`);
    return { threadId };
  } catch (e) {
    return rejectWithValue({
      code: "ACCEPT_CHAT_THREAD_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const rejectChatThread = createAsyncThunk<
  { threadId: string },
  { threadId: string },
  { rejectValue: ChatError }
>("chat/rejectThread", async ({ threadId }, { rejectWithValue }) => {
  try {
    await api.post(`/chat/threads/${threadId}/reject`);
    return { threadId };
  } catch (e) {
    return rejectWithValue({
      code: "REJECT_CHAT_THREAD_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const markChatThreadRead = createAsyncThunk<
  { threadId: string },
  { threadId: string },
  { rejectValue: ChatError }
>("chat/markRead", async ({ threadId }, { rejectWithValue }) => {
  try {
    await api.post(`/chat/threads/${threadId}/read`);
    return { threadId };
  } catch (e) {
    return rejectWithValue({
      code: "MARK_CHAT_READ_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const deleteChatThread = createAsyncThunk<
  { threadId: string },
  { threadId: string },
  { rejectValue: ChatError }
>("chat/deleteThread", async ({ threadId }, { rejectWithValue }) => {
  try {
    await api.delete(`/chat/threads/${threadId}`);
    return { threadId };
  } catch (e) {
    return rejectWithValue({
      code: "DELETE_CHAT_THREAD_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const blockPeerFromChat = createAsyncThunk<
  { threadId: string; blockedUserId: string },
  { threadId: string },
  { rejectValue: ChatError }
>("chat/blockPeerFromChat", async ({ threadId }, { rejectWithValue }) => {
  try {
    const res = await api.post<{
      ok: true;
      blockedUserId: string;
    }>(`/chat/threads/${threadId}/block-peer`);
    return {
      threadId,
      blockedUserId: res.data.blockedUserId,
    };
  } catch (e) {
    return rejectWithValue({
      code: "BLOCK_PEER_FROM_CHAT_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const updateChatMessage = createAsyncThunk<
  { message: ChatMessageDTO; threadId: string },
  { messageId: string; content: string },
  { rejectValue: ChatError }
>("chat/updateMessage", async ({ messageId, content }, { rejectWithValue }) => {
  try {
    const res = await api.patch<{
      message: ChatMessageDTO;
      threadId: string;
    }>(`/chat/messages/${messageId}`, { content });
    return res.data;
  } catch (e) {
    return rejectWithValue({
      code: "UPDATE_CHAT_MESSAGE_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const deleteChatMessage = createAsyncThunk<
  { threadId: string; messageId: string },
  { messageId: string },
  { rejectValue: ChatError }
>("chat/deleteMessage", async ({ messageId }, { rejectWithValue }) => {
  try {
    const res = await api.delete<{ ok: true; threadId: string }>(
      `/chat/messages/${messageId}`,
    );
    return { threadId: res.data.threadId, messageId };
  } catch (e) {
    return rejectWithValue({
      code: "DELETE_CHAT_MESSAGE_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

function normalizeChatMessage(m: ChatMessageDTO): ChatMessageDTO {
  return {
    ...m,
    attachment: m.attachment ?? null,
    editedAt: m.editedAt ?? null,
    replyTo: m.replyTo ?? null,
  };
}

function applyMessageUpdate(
  state: ChatState,
  threadId: string,
  message: ChatMessageDTO,
) {
  const bucket = state.messagesByThreadId[threadId] ?? emptyMessages();
  const n = normalizeChatMessage(message);
  const idx = bucket.items.findIndex((x) => x.id === n.id);
  if (idx >= 0) {
    bucket.items[idx] = n;
  } else {
    bucket.items = [...bucket.items, n].sort(
      (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
    );
  }
  state.messagesByThreadId[threadId] = bucket;
}

function applyMessageDelete(
  state: ChatState,
  threadId: string,
  messageId: string,
) {
  const bucket = state.messagesByThreadId[threadId];
  if (!bucket) return;
  bucket.items = bucket.items.filter((x) => x.id !== messageId);
}

function removeThreadFromChatState(state: ChatState, threadId: string) {
  state.threads = state.threads.filter((t) => t.id !== threadId);
  delete state.messagesByThreadId[threadId];
  delete state.requestAcceptedLinesByThreadId[threadId];
  delete state.typingByThreadId[threadId];
  delete state.peerOnlineByThreadId[threadId];
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChat(state) {
      state.threads = [];
      state.threadsStatus = "idle";
      state.threadsError = null;
      state.messagesByThreadId = {};
      state.requestAcceptedLinesByThreadId = {};
      state.unread = null;
      state.unreadStatus = "idle";
      state.typingByThreadId = {};
      state.peerOnlineByThreadId = {};
    },
    chatRequestAcceptedLineReceived(
      state,
      action: PayloadAction<{
        threadId: string;
        eventId: string;
        acceptedAt: string;
        accepterId: string;
        accepterName: string;
      }>,
    ) {
      const { threadId, eventId, acceptedAt, accepterId, accepterName } =
        action.payload;
      const prev = state.requestAcceptedLinesByThreadId[threadId] ?? [];
      if (prev.some((l) => l.eventId === eventId)) return;
      state.requestAcceptedLinesByThreadId[threadId] = [
        ...prev,
        {
          eventId,
          createdAt: acceptedAt,
          accepterId,
          accepterName,
        },
      ];
    },
    chatUnreadReceived(state, action: PayloadAction<ChatUnreadSummaryDTO>) {
      state.unread = action.payload;
    },
    chatThreadSummaryReceived(
      state,
      action: PayloadAction<ChatThreadSummaryDTO>,
    ) {
      state.threads = upsertThread(state.threads, action.payload);
    },
    chatMessageReceived(
      state,
      action: PayloadAction<{
        message: ChatMessageDTO;
        threadSummary?: ChatThreadSummaryDTO | null;
        threadId: string;
      }>,
    ) {
      const { message, threadSummary, threadId } = action.payload;
      if (threadSummary) {
        state.threads = upsertThread(state.threads, threadSummary);
      }
      const bucket =
        state.messagesByThreadId[threadId] ?? emptyMessages();
      const exists = bucket.items.some((m: ChatMessageDTO) => m.id === message.id);
      if (!exists) {
        const normalized = normalizeChatMessage(message);
        bucket.items = [...bucket.items, normalized].sort(
          (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
        );
      }
      state.messagesByThreadId[threadId] = bucket;
      delete state.typingByThreadId[threadId];
    },
    chatThreadStatusReceived(
      state,
      action: PayloadAction<{ threadId: string; status: ChatThreadSummaryDTO["status"] }>,
    ) {
      const t = state.threads.find((x) => x.id === action.payload.threadId);
      if (t) t.status = action.payload.status;
    },
    chatReadReceived(
      state,
      action: PayloadAction<{
        threadId: string;
        messageIds: string[];
        readAt: string;
      }>,
    ) {
      const { threadId, messageIds, readAt } = action.payload;
      const bucket = state.messagesByThreadId[threadId];
      if (!bucket) return;
      const idSet = new Set(messageIds);
      for (const m of bucket.items) {
        if (idSet.has(m.id)) m.readAt = readAt;
      }
    },
    chatTypingReceived(
      state,
      action: PayloadAction<{
        threadId: string;
        userId: string;
        isTyping: boolean;
      }>,
    ) {
      const { threadId, userId, isTyping } = action.payload;
      if (!isTyping) {
        delete state.typingByThreadId[threadId];
        return;
      }
      state.typingByThreadId[threadId] = { userId, isTyping: true };
    },
    chatPresenceReceived(
      state,
      action: PayloadAction<{
        threadId: string;
        userId: string;
        online: boolean;
      }>,
    ) {
      state.peerOnlineByThreadId[action.payload.threadId] =
        action.payload.online;
    },
    chatThreadDeletedReceived(
      state,
      action: PayloadAction<{ threadId: string }>,
    ) {
      removeThreadFromChatState(state, action.payload.threadId);
    },
    chatMessageUpdatedReceived(
      state,
      action: PayloadAction<{
        threadId: string;
        message: ChatMessageDTO;
      }>,
    ) {
      applyMessageUpdate(
        state,
        action.payload.threadId,
        action.payload.message,
      );
    },
    chatMessageDeletedReceived(
      state,
      action: PayloadAction<{ threadId: string; messageId: string }>,
    ) {
      applyMessageDelete(
        state,
        action.payload.threadId,
        action.payload.messageId,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatThreads.pending, (state) => {
        state.threadsStatus = "loading";
        state.threadsError = null;
      })
      .addCase(fetchChatThreads.fulfilled, (state, action) => {
        state.threadsStatus = "idle";
        state.threads = action.payload;
      })
      .addCase(fetchChatThreads.rejected, (state, action) => {
        state.threadsStatus = "failed";
        state.threadsError = (action.payload as ChatError) ?? {
          code: "FETCH_CHAT_THREADS_FAILED",
          message: "Failed to load chats",
        };
      })
      .addCase(fetchChatUnread.pending, (state) => {
        state.unreadStatus = "loading";
      })
      .addCase(fetchChatUnread.fulfilled, (state, action) => {
        state.unreadStatus = "idle";
        state.unread = action.payload;
      })
      .addCase(fetchChatUnread.rejected, (state) => {
        state.unreadStatus = "idle";
      })
      .addCase(fetchChatMessages.pending, (state, action) => {
        const threadId = action.meta.arg.threadId;
        const prev = state.messagesByThreadId[threadId] ?? emptyMessages();
        state.messagesByThreadId[threadId] = { ...prev, status: "loading" };
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { threadId, messages, nextCursor } = action.payload;
        const prev = state.messagesByThreadId[threadId] ?? emptyMessages();
        const isPrepend = !!action.meta.arg.cursor;
        const merged = isPrepend
          ? [...messages, ...prev.items]
          : messages.length
            ? messages
            : prev.items;
        const dedup = [
          ...new Map(
            merged.map((m: ChatMessageDTO) => [m.id, m] as const),
          ).values(),
        ].sort(
          (a: ChatMessageDTO, b: ChatMessageDTO) =>
            Date.parse(a.createdAt) - Date.parse(b.createdAt),
        );
        state.messagesByThreadId[threadId] = {
          items: dedup.map(normalizeChatMessage),
          nextCursor,
          status: "idle",
        };
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        const threadId = action.meta.arg.threadId;
        const prev = state.messagesByThreadId[threadId] ?? emptyMessages();
        state.messagesByThreadId[threadId] = { ...prev, status: "failed" };
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const { message, threadId } = action.payload;
        const bucket = state.messagesByThreadId[threadId] ?? emptyMessages();
        const normalized = normalizeChatMessage(message);
        if (!bucket.items.some((m: ChatMessageDTO) => m.id === message.id)) {
          bucket.items = [...bucket.items, normalized].sort(
            (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
          );
        }
        state.messagesByThreadId[threadId] = bucket;

        const text = normalized.content.trim();
        const preview =
          text.length > 0
            ? text.length > 512
              ? text.slice(0, 512)
              : text
            : normalized.attachment?.fileName
              ? normalized.attachment.fileName.length > 512
                ? normalized.attachment.fileName.slice(0, 512)
                : normalized.attachment.fileName
              : "Attachment";
        const t = state.threads.find((x) => x.id === threadId);
        if (t) {
          t.lastMessageAt = message.createdAt;
          t.lastMessagePreview = preview;
          t.hasUnread = false;
          state.threads = [...state.threads].sort((a, b) => {
            const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
            const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
            return tb - ta;
          });
        }
      })
      .addCase(markChatThreadRead.fulfilled, (state, action) => {
        const { threadId } = action.payload;
        const t = state.threads.find((x) => x.id === threadId);
        if (t) {
          t.hasUnread = false;
          t.pendingIncoming = false;
        }
      })
      .addCase(acceptChatThread.fulfilled, (state, action) => {
        const t = state.threads.find((x) => x.id === action.payload.threadId);
        if (t) {
          t.status = "ACTIVE";
          t.pendingIncoming = false;
        }
      })
      .addCase(rejectChatThread.fulfilled, (state, action) => {
        const t = state.threads.find((x) => x.id === action.payload.threadId);
        if (t) {
          t.status = "REJECTED";
          t.pendingIncoming = false;
        }
      })
      .addCase(deleteChatThread.fulfilled, (state, action) => {
        removeThreadFromChatState(state, action.payload.threadId);
      })
      .addCase(blockPeerFromChat.fulfilled, (state, action) => {
        removeThreadFromChatState(state, action.payload.threadId);
      })
      .addCase(updateChatMessage.fulfilled, (state, action) => {
        applyMessageUpdate(
          state,
          action.payload.threadId,
          action.payload.message,
        );
      })
      .addCase(deleteChatMessage.fulfilled, (state, action) => {
        applyMessageDelete(
          state,
          action.payload.threadId,
          action.payload.messageId,
        );
      })
      .addCase(logout, (state) => {
        state.threads = [];
        state.threadsStatus = "idle";
        state.threadsError = null;
        state.messagesByThreadId = {};
        state.requestAcceptedLinesByThreadId = {};
        state.unread = null;
        state.unreadStatus = "idle";
        state.typingByThreadId = {};
        state.peerOnlineByThreadId = {};
      });
  },
});

export const {
  clearChat,
  chatUnreadReceived,
  chatThreadSummaryReceived,
  chatMessageReceived,
  chatThreadStatusReceived,
  chatReadReceived,
  chatTypingReceived,
  chatPresenceReceived,
  chatRequestAcceptedLineReceived,
  chatThreadDeletedReceived,
  chatMessageUpdatedReceived,
  chatMessageDeletedReceived,
} = chatSlice.actions;

export default chatSlice.reducer;
