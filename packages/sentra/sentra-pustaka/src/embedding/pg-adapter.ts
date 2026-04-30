// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { Pool, PoolClient } from 'pg'
import type { VectorStoreDatabaseClient } from '@sentra/cermin'

/**
 * Adapts a `pg` Pool to the VectorStoreDatabaseClient interface expected by
 * @sentra/cermin. Allows sentra-rag to use the vector-store abstraction
 * without importing Prisma.
 */
export class PgPoolVectorAdapter implements VectorStoreDatabaseClient {
  constructor(private readonly pool: Pool) {}

  async $executeRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T> {
    const client: PoolClient = await this.pool.connect()
    try {
      await client.query(query, values as unknown[])
      return undefined as T
    } finally {
      client.release()
    }
  }

  async $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T> {
    const client: PoolClient = await this.pool.connect()
    try {
      const result = await client.query(query, values as unknown[])
      return result.rows as T
    } finally {
      client.release()
    }
  }
}
