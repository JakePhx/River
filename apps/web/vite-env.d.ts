/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE_URL?: string;
  readonly PUBLIC_S3_ENDPOINT?: string;
  readonly PUBLIC_S3_ASSET_BASE_URL?: string;
  /** Optional override when using `/s3` in dev (default http://127.0.0.1:4566). */
  readonly PUBLIC_S3_DIRECT_URL?: string;
  readonly PUBLIC_S3_REGION?: string;
  readonly PUBLIC_S3_BUCKET?: string;
  readonly PUBLIC_S3_ACCESS_KEY_ID?: string;
  readonly PUBLIC_S3_SECRET_ACCESS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
