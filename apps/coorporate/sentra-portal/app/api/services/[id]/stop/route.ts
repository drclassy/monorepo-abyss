/**
 * PORTAL Sentra — Service Stop API
 * POST /api/services/:id/stop
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

    // Check if running
    if (service.status !== 'running') {
      return NextResponse.json(
        {
          success: false,
          error: 'Service not running',
          message: `Service "${service.name}" is not running (status: ${service.status})`,
        },
        { status: 409 }
      )
    }

    // Stop service
    await dockerManager.stopService(id)

    // Get updated service
    const updatedService = dockerManager.getService(id)

    return NextResponse.json({
      success: true,
      data: { service: updatedService },
    })
  } catch (error) {
    console.error('Failed to stop service:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to stop service',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
