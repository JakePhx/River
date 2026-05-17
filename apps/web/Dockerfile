FROM node:20-alpine AS dependencies-env
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace manifests first to maximize layer cache hits.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile --prod=false

FROM node:20-alpine AS build-env
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY . /app/
COPY --from=dependencies-env /app/node_modules /app/node_modules
RUN pnpm --filter @social/shared build && pnpm --filter @social/web build

FROM node:20-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY --from=dependencies-env /app/node_modules /app/node_modules
COPY packages/shared packages/shared
COPY apps/web apps/web
CMD ["pnpm", "--filter", "@social/web", "dev", "--host", "0.0.0.0", "--port", "5173"]