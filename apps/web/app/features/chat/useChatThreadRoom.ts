import { useEffect } from "react";

import { getChatSocket } from "./chat-socket";

export function useChatThreadRoom(threadId: string | null) {
  useEffect(() => {
    if (!threadId) return;

    const subscribe = () => {
      getChatSocket()?.emit("thread:subscribe", { threadId });
    };
    const unsubscribe = () => {
      getChatSocket()?.emit("thread:unsubscribe", { threadId });
    };

    subscribe();
    const s = getChatSocket();
    s?.on("connect", subscribe);

    return () => {
      s?.off("connect", subscribe);
      unsubscribe();
    };
  }, [threadId]);
}
