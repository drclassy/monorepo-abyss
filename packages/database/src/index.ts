// @the-abyss/database - Public API
export { PrismaClient } from '@prisma/client'
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
  FlowExecutionStatus
} from '@prisma/client'

// Re-export prisma client singleton
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper functions
export async function disconnectDatabase() {
  await prisma.$disconnect()
}

export async function connectDatabase() {
  await prisma.$connect()
}
