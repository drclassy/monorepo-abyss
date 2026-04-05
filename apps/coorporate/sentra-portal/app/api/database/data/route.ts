/**
 * PORTAL Sentra — Database Data API
 * GET /api/database/data?connectionId=xxx&table=xxx&limit=xxx&offset=xxx
 */

import { type NextRequest, NextResponse } from 'next/server'
import { databaseManager } from '@/lib/database-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// GET /api/database/data
// ============================================================================

export async function GET(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      result: unknown
    }>
  >
> {
  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('connectionId')
    const tableName = searchParams.get('table')
    const limit = Number.parseInt(searchParams.get('limit') || '100', 10)
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10)
    const orderBy = searchParams.get('orderBy') || undefined
    const orderDirection = (searchParams.get('orderDirection') || 'asc') as 'asc' | 'desc'
    const where = searchParams.get('where') || undefined

    if (!connectionId || !tableName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Connection ID and table name are required',
        },
        { status: 400 }
      )
    }

    const result = await databaseManager.getTableData(connectionId, tableName, {
      limit,
      offset,
      orderBy,
      orderDirection,
      where,
    })

    return NextResponse.json({
      success: true,
      data: { result },
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
