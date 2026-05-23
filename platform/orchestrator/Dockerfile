# Abyss Orchestrator - Production Dockerfile
# Optimized for Node 22 and PNPM Workspaces

FROM node:22-alpine@sha256:8ea2348b068a9544dae7317b4f3aafcdc032df1647bb7d768a05a5cad1a7683f AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app

# 1. Copy root config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. Copy package.json of all required packages (to optimize cache)
COPY apps/platform/orchestrator/package.json ./apps/platform/orchestrator/
COPY packages/database/package.json ./packages/database/
COPY packages/artificial-core/package.json ./packages/artificial-core/
COPY packages/langflow-client/package.json ./packages/langflow-client/
COPY packages/shared-types/package.json ./packages/shared-types/
# Copy configs for building
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY packages/config-eslint/package.json ./packages/config-eslint/

# 3. Install dependencies
RUN pnpm install --frozen-lockfile

# 4. Copy source code
COPY . .

# 5. Build dependencies and the orchestrator
RUN pnpm --filter "@the-abyss/shared-types" build || true
RUN pnpm --filter "@the-abyss/orchestrator" build

# 6. Deploy for production
RUN pnpm --filter "@the-abyss/orchestrator" deploy --prod /app/out

FROM base AS runner
WORKDIR /app

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3001
ENV KAFKA_BROKER=kafka:9092

# Copy the deployed bundle
COPY --from=builder /app/out ./

EXPOSE 3001

# Jalankan service-nya!
CMD ["node", "dist/main.js"]
