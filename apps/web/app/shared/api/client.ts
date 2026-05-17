import axios from "axios";

import { getAccessToken } from "../auth/token-storage";

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.PUBLIC_API_BASE_URL;
  if (fromEnv !== undefined && fromEnv !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  // Dev: Vite proxies /api → API (see vite.config.ts). Prod: set PUBLIC_API_BASE_URL.
  if (import.meta.env.DEV) {
    return "/api";
  }
  return "http://localhost:3000";
}

/**
 * Socket.IO must connect to the API host. A relative `PUBLIC_API_BASE_URL` like `/api`
 * is only for the HTTP proxy; websockets are not proxied the same way.
 */
export function resolveApiSocketOrigin(): string {
  const fromEnv = import.meta.env.PUBLIC_API_BASE_URL;
  if (typeof fromEnv === "string" && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const msg =
      (err.response?.data as any)?.message ??
      err.response?.statusText ??
      err.message;
    if (typeof msg === "string") return msg;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
