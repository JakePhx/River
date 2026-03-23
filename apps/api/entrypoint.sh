#!/bin/sh
set -e

echo "[entrypoint] prisma generate"
pnpm --filter @social/api exec prisma generate

echo "[entrypoint] prisma migrate deploy (applies pending migrations)"
pnpm --filter @social/api exec prisma migrate deploy

exec pnpm --filter @social/api start:dev