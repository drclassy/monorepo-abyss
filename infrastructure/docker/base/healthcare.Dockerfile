# =============================================================================
# Base image: Healthcare PHI-Safe NestJS
# Sentra AI — The Abyss Monorepo
# Targets: apps/healthcare/** — any app processing PHI/PII data
# Additional hardening vs nestjs.Dockerfile:
#   - No shell in runner stage (no /bin/sh attack surface)
#   - Read-only filesystem at runtime
#   - Explicit memory limit via NODE_OPTIONS
#   - PHI_MODE env flag triggers class-transformer @Exclude() serialization
# Usage: docker build -f infrastructure/docker/base/healthcare.Dockerfile \
#          --build-arg APP_NAME=sentra-main -t abyss-healthcare:latest .
# =============================================================================

# --- Stage 1: Dependencies ---
FROM node:22-alpine@sha256:8ea2348b068a9544dae7317b4f3aafcdc032df1647bb7d768a05a5cad1a7683f AS deps
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
FROM node:22-alpine@sha256:8ea2348b068a9544dae7317b4f3aafcdc032df1647bb7d768a05a5cad1a7683f AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm && corepack prepare pnpm@9.15.0 --activate
COPY --from=deps /app .
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
RUN pnpm turbo run build --filter=@the-abyss/${APP_NAME} --no-deps

# --- Stage 3: Runner (PHI-hardened, no shell) ---
FROM node:22-alpine@sha256:8ea2348b068a9544dae7317b4f3aafcdc032df1647bb7d768a05a5cad1a7683f AS runner
# CRITICAL: No shell in final image — reduces attack surface for PHI containers
RUN apk add --no-cache dumb-init && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs && \
    rm -rf /bin/sh /bin/ash /usr/bin/wget /usr/bin/curl || true
WORKDIR /app

# PHI compliance env flags
ENV NODE_ENV=production
ENV PHI_MODE=true
ENV NODE_OPTIONS="--max-old-space-size=512"
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

COPY --from=builder --chown=nestjs:nodejs /app/apps/${APP_NAME}/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/${APP_NAME}/package.json ./package.json

USER nestjs
EXPOSE 3001

# Read-only filesystem — uncomment in k8s deployment manifest:
# securityContext:
#   readOnlyRootFilesystem: true

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
