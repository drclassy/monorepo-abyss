/**
 * PORTAL Sentra — Database Schema API
 * GET /api/database/schema?connectionId=xxx&table=xxx
 */

import { type NextRequest, NextResponse } from 'next/server'
import { databaseManager } from '@/lib/database-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// GET /api/database/schema
// ============================================================================

export async function GET(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      tables?: unknown[]
      columns?: unknown[]
      indexes?: unknown[]
    }>
  >
> {
  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('connectionId')
    const tableName = searchParams.get('table')

    if (!connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Connection ID is required',
        },
        { status: 400 }
      )
    }

    // If table name provided, return schema details
    if (tableName) {
      const schema = await databaseManager.getTableSchema(connectionId, tableName)
      return NextResponse.json({
        success: true,
        data: {
          columns: schema.columns,
          indexes: schema.indexes,
        },
      })
    }

    // Otherwise return list of tables
    const tables = await databaseManager.getTables(connectionId)
    return NextResponse.json({
      success: true,
      data: { tables },
    })
  } catch (error) {
    console.error('Failed to fetch schema:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch schema',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
