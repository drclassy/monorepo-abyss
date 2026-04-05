/**
 * PORTAL Sentra — Service Start API
 * POST /api/services/:id/start
 */

import { type NextRequest, NextResponse } from 'next/server'
import { dockerManager } from '@/lib/docker-manager'
import type { ApiResponse } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ service: unknown }>>> {
  try {
    const { id } = await params

    // Check if service exists
    const service = dockerManager.getService(id)
    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service not found',
        },
        { status: 404 }
      )
    }

    // Check if already running
    if (service.status === 'running') {
      return NextResponse.json(
        {
          success: false,
          error: 'Service already running',
          message: `Service "${service.name}" is already running`,
        },
        { status: 409 }
      )
    }

    // Start service
    await dockerManager.startService(id)

    // Get updated service
    const updatedService = dockerManager.getService(id)

    return NextResponse.json({
      success: true,
      data: { service: updatedService },
    })
  } catch (error) {
    console.error('Failed to start service:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start service',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
