import path from "node:path";
import { fileURLToPath } from "node:url";

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Dev: bundle from source so `packages/shared/dist` does not need to exist (Docker / fresh clone). */
const sharedSrc = path.resolve(
  __dirname,
  "../../packages/shared/src/index.ts"
);

/**
 * Where Vite's dev server proxies `/api/*` (server-side only).
 * - Host `pnpm dev`: default reaches API on the same machine.
 * - Docker `web` service: set `API_PROXY_TARGET=http://api:3000` in docker-compose
 *   (`127.0.0.1:3000` inside the web container is the web container itself, not the API.)
 */
const apiProxyTarget =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ||
  "http://127.0.0.1:3000";

/**
 * Optional same-origin proxy for S3-compatible tools that do not use SigV4.
 * Do not set PUBLIC_S3_* to `/s3` when using @aws-sdk/client-s3: path rewrites break the signature.
 */
const s3ProxyTarget =
  process.env.S3_PROXY_TARGET?.replace(/\/$/, "") ||
  "http://127.0.0.1:4566";

/** Same-origin paths the browser uses; targets are server-side only (see docker-compose env). */
const devProxy = {
  "/api": {
    target: apiProxyTarget,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ""),
  },
  "/s3": {
    target: s3ProxyTarget,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/s3/, ""),
  },
} as const;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "@social/shared": sharedSrc,
    },
  },
  server: {
    host: true,
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
    // Browser uses same-origin `/api`; S3 uploads should use a direct LocalStack URL (see .env.example).
    proxy: { ...devProxy },
  },
  preview: {
    proxy: { ...devProxy },
  },
  ssr: {
    noExternal: [
      "@social/shared",
      "reflect-metadata",
      "class-transformer",
      "class-validator",
    ],
  },
});
