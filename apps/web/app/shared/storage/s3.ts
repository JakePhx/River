import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

function requiredEnv(name: keyof ImportMetaEnv): string {
  const v = import.meta.env[name];
  if (typeof v !== "string" || !v) {
    throw new Error(
      `Missing ${String(name)}. Post and chat uploads need PUBLIC_S3_ENDPOINT, PUBLIC_S3_ASSET_BASE_URL, PUBLIC_S3_BUCKET (see apps/web/.env.example).`,
    );
  }
  return v;
}

/** Same-origin paths like `/s3` (Vite proxy) → absolute URL for non-SigV4 uses only. */
function resolveS3Base(raw: string): string {
  if (raw.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${raw}`;
    }
    return raw;
  }
  return raw;
}

const DEFAULT_DEV_DIRECT_S3 = "http://127.0.0.1:4566";

/**
 * The AWS SDK signs the full URL (host + path). A dev proxy that rewrites the path (e.g. Vite
 * `/s3` → LocalStack) breaks SigV4. Same-origin **relative** URLs like `/s3` or `/localstack`
 * therefore fail unless they match the signed path exactly — they usually don't.
 *
 * In dev, force a direct LocalStack origin (host port 4566). Override with PUBLIC_S3_DIRECT_URL
 * (e.g. http://192.168.1.5:4566 when opening the app from another device on LAN).
 */
function effectiveS3Origin(raw: string): string {
  const trimmed = raw.trim();
  if (
    typeof window !== "undefined" &&
    import.meta.env.DEV &&
    trimmed.startsWith("/")
  ) {
    const override = import.meta.env.PUBLIC_S3_DIRECT_URL;
    if (typeof override === "string" && override.trim().length > 0) {
      return override.replace(/\/$/, "");
    }
    return DEFAULT_DEV_DIRECT_S3;
  }
  return resolveS3Base(trimmed).replace(/\/$/, "");
}

function makeClient() {
  const rawEndpoint = requiredEnv("PUBLIC_S3_ENDPOINT");
  const endpoint = effectiveS3Origin(rawEndpoint);
  const region = import.meta.env.PUBLIC_S3_REGION ?? "us-east-1";
  const accessKeyId = import.meta.env.PUBLIC_S3_ACCESS_KEY_ID ?? "test";
  const secretAccessKey = import.meta.env.PUBLIC_S3_SECRET_ACCESS_KEY ?? "test";

  /**
   * Default SDK WHEN_SUPPORTED adds CRC32 on PutObject; LocalStack often mis-handles it.
   */
  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function guessExt(file: File) {
  const parts = file.name.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1] : "";
  return ext ? ext.toLowerCase() : "bin";
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return uuidv4();
}

/**
 * AWS SDK v3 in the browser may treat `Body` as a stream and call `getReader()`.
 * Passing `File`/`Blob` directly can throw (e.g. "readableStream.getReader is not a function").
 */
async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

function publicObjectBase(): string {
  return effectiveS3Origin(requiredEnv("PUBLIC_S3_ASSET_BASE_URL"));
}

export async function uploadAvatar(params: {
  userId: string;
  file: File;
}): Promise<{ key: string; url: string }> {
  const bucket = requiredEnv("PUBLIC_S3_BUCKET");
  const publicBase = publicObjectBase();
  const client = makeClient();

  const ext = guessExt(params.file);
  const key = `avatars/${params.userId}/${randomId()}.${ext}`;
  const body = await fileToUint8Array(params.file);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: params.file.type || undefined,
    }),
  );

  const url = `${publicBase}/${bucket}/${key}`;
  return { key, url };
}

export async function uploadPostMedia(params: {
  userId: string;
  file: File;
}): Promise<{
  key: string;
  url: string;
  byteSize: number;
  contentType: string;
}> {
  const bucket = requiredEnv("PUBLIC_S3_BUCKET");
  const publicBase = publicObjectBase();
  const client = makeClient();

  const ext = guessExt(params.file);
  const key = `posts/${params.userId}/${randomId()}.${ext}`;
  const body = await fileToUint8Array(params.file);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: params.file.type || undefined,
    }),
  );

  const url = `${publicBase}/${bucket}/${key}`;
  return {
    key,
    url,
    byteSize: params.file.size,
    contentType: params.file.type || "application/octet-stream",
  };
}

/** Chat attachments; max size enforced client-side (100 MiB) and again on the API. */
export async function uploadChatAttachment(params: {
  userId: string;
  file: File;
}): Promise<{
  key: string;
  url: string;
  byteSize: number;
  contentType: string;
}> {
  const bucket = requiredEnv("PUBLIC_S3_BUCKET");
  const publicBase = publicObjectBase();
  const client = makeClient();

  const ext = guessExt(params.file);
  const key = `chat/${params.userId}/${randomId()}.${ext}`;
  const body = await fileToUint8Array(params.file);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: params.file.type || undefined,
    }),
  );

  const url = `${publicBase}/${bucket}/${key}`;
  return {
    key,
    url,
    byteSize: params.file.size,
    contentType: params.file.type || "application/octet-stream",
  };
}
