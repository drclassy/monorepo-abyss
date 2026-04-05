/**
 * PORTAL Sentra — Database Query API
 * POST /api/database/query
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { databaseManager } from '@/lib/database-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const executeQuerySchema = z.object({
  connectionId: z.string().min(1, 'Connection ID is required'),
  query: z.string().min(1, 'Query is required'),
  params: z.array(z.unknown()).optional(),
})

// ============================================================================
// POST /api/database/query
// ============================================================================

export async function POST(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      result: unknown
    }>
  >
> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = executeQuerySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: validationResult.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    const { connectionId, query, params } = validationResult.data

    // Execute query
    const result = await databaseManager.executeQuery(connectionId, query, params)

    return NextResponse.json({
      success: true,
      data: { result },
    })
  } catch (error) {
    console.error('Failed to execute query:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute query',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
