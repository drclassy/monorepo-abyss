# =============================================================================
# Base image: NestJS Backend Apps
# Sentra AI — The Abyss Monorepo
# Targets: apps/platform/orchestrator, referralink, sentra-assist, sentra-main
# Usage: docker build -f infrastructure/docker/base/nestjs.Dockerfile \
#          --build-arg APP_NAME=referralink-api -t abyss-nestjs:latest .
# =============================================================================

# --- Stage 1: Dependencies ---
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app
RUN corepack enable pnpm && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY tooling/ ./tooling/
ARG APP_NAME
RUN pnpm install --frozen-lockfile --filter @the-abyss/${APP_NAME}...

# --- Stage 2: Builder ---
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm && corepack prepare pnpm@9.15.0 --activate
COPY --from=deps /app .
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
RUN pnpm turbo run build --filter=@the-abyss/${APP_NAME} --no-deps

# --- Stage 3: Runner (production-hardened) ---
FROM node:22-alpine AS runner
# Security: non-root user + dumb-init for proper signal handling
RUN apk add --no-cache dumb-init && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
WORKDIR /app

ENV NODE_ENV=production
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Copy only the built output — NOT source files
COPY --from=builder --chown=nestjs:nodejs /app/apps/${APP_NAME}/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/${APP_NAME}/package.json ./package.json

USER nestjs
EXPOSE 3001

# dumb-init ensures proper PID 1 behavior + signal forwarding
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
