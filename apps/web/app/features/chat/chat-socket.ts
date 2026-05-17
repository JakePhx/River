import type { Socket } from "socket.io-client";

let chatSocket: Socket | null = null;

export function setChatSocket(socket: Socket | null) {
  chatSocket = socket;
}

export function getChatSocket(): Socket | null {
  return chatSocket;
}
