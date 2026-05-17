import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

import { resolveApiSocketOrigin } from "../../shared/api/client";
import { useAppDispatch } from "../../store/hooks";
import { NotificationMapper } from "./notification.mapper";
import {
  NOTIFICATION_CREATED_EVENT,
  type NotificationListApiItem,
} from "./notification.types";
import { notificationReceived } from "./notification.slice";

/**
 * Subscribes to `notification.created` on the API Socket.IO `/notifications` namespace.
 * Pass `null` for `userId` to disconnect (e.g. logged out).
 */
export function useNotificationsRealtime(userId: string | null) {
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

    const socket = io(`${resolveApiSocketOrigin()}/notifications`, {
      auth: { userId },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on(NOTIFICATION_CREATED_EVENT, (raw: unknown) => {
      if (!raw || typeof raw !== "object") return;
      const row = raw as NotificationListApiItem;
      if (!row.id || !row.type) return;
      try {
        const n = NotificationMapper.fromApi(row);
        dispatch(notificationReceived(n));
      } catch {
        /* ignore malformed payloads */
      }
    });

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [userId, dispatch]);
}
