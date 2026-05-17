import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { api, getApiErrorMessage } from "../../shared/api/client";
import { logout } from "../auth/auth.slice";
import { fetchUserById } from "../user/user.slice";
import { NotificationMapper } from "./notification.mapper";
import type {
  Notification,
  NotificationError,
  NotificationListApiItem,
} from "./notification.types";

type NotificationState = {
  items: Notification[];
  status: "idle" | "loading" | "failed";
  error: NotificationError | null;
};

const initialState: NotificationState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchNotifications = createAsyncThunk<Notification[]>(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<NotificationListApiItem[]>("/notifications");
      const rows = Array.isArray(res.data) ? res.data : [];
      return rows.map((row) => NotificationMapper.fromApi(row));
    } catch (e) {
      return rejectWithValue({
        code: "FETCH_NOTIFICATIONS_FAILED",
        message: getApiErrorMessage(e),
      });
    }
  }
);

export const markNotificationRead = createAsyncThunk<
  { id: string },
  { id: string }
>("notifications/markRead", async ({ id }, { rejectWithValue }) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return { id };
  } catch (e) {
    return rejectWithValue({
      code: "MARK_NOTIFICATION_READ_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

/** Load author profiles for notifications that reference a user id. */
export const prefetchNotificationAuthors = createAsyncThunk<
  void,
  { authorIds: string[] }
>("notifications/prefetchAuthors", async ({ authorIds }, { dispatch }) => {
  const unique = [...new Set(authorIds.filter(Boolean))];
  await Promise.all(
    unique.map((userId) => dispatch(fetchUserById({ userId })).unwrap())
  );
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
    notificationReceived(state, action: PayloadAction<Notification>) {
      const incoming = action.payload;
      const idx = state.items.findIndex((n) => n.id === incoming.id);
      if (idx >= 0) {
        state.items[idx] = incoming;
        return;
      }
      state.items = [incoming, ...state.items];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as NotificationError) ?? {
          code: "FETCH_NOTIFICATIONS_FAILED",
          message: "Failed to load notifications",
        };
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const { id } = action.payload;
        const n = state.items.find((item) => item.id === id);
        if (n) n.isRead = true;
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { clearNotifications, notificationReceived } =
  notificationSlice.actions;
export default notificationSlice.reducer;
