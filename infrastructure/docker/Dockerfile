# Multi-stage Dockerfile for The Abyss applications
# Usage: docker build -f infrastructure/docker/Dockerfile -t abyss-app:latest --build-arg APP_NAME=referralink-api .

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/**/package.json ./packages/
COPY apps/**/package.json ./apps/
COPY tooling/**/package.json ./tooling/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @the-abyss/${APP_NAME}...

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy source files
COPY . .

# Build arguments
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Build the application
RUN pnpm turbo run build --filter=@the-abyss/${APP_NAME} --no-deps

# ============================================
# Stage 3: Runner
# ============================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=builder /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/${APP_NAME}/server.js"]
