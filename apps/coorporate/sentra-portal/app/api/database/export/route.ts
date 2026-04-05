/**
 * PORTAL Sentra — Database Export API
 * POST /api/database/export
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { databaseManager } from '@/lib/database-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const exportSchema = z.object({
  connectionId: z.string().min(1, 'Connection ID is required'),
  tableName: z.string().min(1, 'Table name is required'),
  format: z.enum(['csv', 'json', 'sql']),
})

// ============================================================================
// POST /api/database/export
// ============================================================================

export async function POST(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      data: string
      filename: string
      mimeType: string
    }>
  >
> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = exportSchema.safeParse(body)
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

    const { connectionId, tableName, format } = validationResult.data

    // Export data
    const data = await databaseManager.exportTable(connectionId, tableName, format)

    // Determine filename and mime type
    const filename = `${tableName}_export_${new Date().toISOString().split('T')[0]}.${format}`
    const mimeTypes: Record<string, string> = {
      csv: 'text/csv',
      json: 'application/json',
      sql: 'application/sql',
    }

    return NextResponse.json({
      success: true,
      data: {
        data,
        filename,
        mimeType: mimeTypes[format],
      },
    })
  } catch (error) {
    console.error('Failed to export data:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
