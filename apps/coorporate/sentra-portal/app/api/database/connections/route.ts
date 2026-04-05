/**
 * PORTAL Sentra — Database Connections API
 * GET: List all connections
 * POST: Create new connection
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { databaseManager } from '@/lib/database-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const createConnectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite']),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  ssl: z.boolean().default(false),
  serviceId: z.string().optional(),
  projectId: z.string().optional(),
})

// ============================================================================
// GET /api/database/connections
// ============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ connections: unknown[] }>>> {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const serviceId = searchParams.get('serviceId')

    let connections = databaseManager.getAllConnections()

    if (projectId) {
      connections = connections.filter(c => c.projectId === projectId)
    }
    if (serviceId) {
      connections = connections.filter(c => c.serviceId === serviceId)
    }

    // Remove password from response
    const safeConnections = connections.map(c => ({
      ...c,
      password: undefined,
    }))

    return NextResponse.json({
      success: true,
      data: { connections: safeConnections },
    })
  } catch (error) {
    console.error('Failed to fetch connections:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch connections',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/database/connections
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ connection: unknown }>>> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createConnectionSchema.safeParse(body)
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

    const input = validationResult.data

    // Test connection first
    const testResult = await databaseManager.testConnection(input)
    if (!testResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Connection test failed',
          message: testResult.message,
        },
        { status: 400 }
      )
    }

    // Create connection
    const connection = await databaseManager.createConnection(input)

    return NextResponse.json(
      {
        success: true,
        data: {
          connection: {
            ...connection,
            password: undefined, // Never return password
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create connection:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create connection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
