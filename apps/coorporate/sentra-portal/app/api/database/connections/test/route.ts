/**
 * PORTAL Sentra — Database Connection Test API
 * POST /api/database/connections/test
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { databaseManager } from '@/lib/database-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const testConnectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite']),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  ssl: z.boolean().default(false),
})

// ============================================================================
// POST /api/database/connections/test
// ============================================================================

export async function POST(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      success: boolean
      message: string
      latency?: number
      version?: string
    }>
  >
> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = testConnectionSchema.safeParse(body)
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

    const config = validationResult.data

    // Test connection
    const result = await databaseManager.testConnection(config)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Failed to test connection:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test connection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
