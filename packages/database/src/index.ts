// @the-abyss/database - Public API

/** Prisma client class and saga execution status enum — re-exported for type-level usage. */
export { PrismaClient, SagaExecutionStatus } from '@prisma/client'

/** All Prisma model types and the query builder namespace. Import types from here, not directly from @prisma/client. */
export type {
  Prisma,
  User,
  Organization,
  App,
  AiSession,
  AuditLog,
  FlowDefinition,
  FlowExecution,
  Role,
  AiSessionStatus,
  FlowExecutionStatus,
  SagaExecution,
} from '@prisma/client'

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Global Prisma client singleton. Use this in all app code — never instantiate PrismaClient directly.
 * Reuses the same instance across hot reloads in development to prevent connection pool exhaustion.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Explicitly close the Prisma database connection. Call in graceful shutdown handlers. */
export async function disconnectDatabase() {
  await prisma.$disconnect()
}

/** Explicitly open the Prisma database connection. Usually not required — Prisma connects lazily. */
export async function connectDatabase() {
  await prisma.$connect()
}
