/**
 * PORTAL Sentra — Single Service API
 * GET: Get service details
 * DELETE: Remove service
 */

import { type NextRequest, NextResponse } from 'next/server'
import { dockerManager } from '@/lib/docker-manager'
import type { ApiResponse } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// GET /api/services/:id
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ service: unknown }>>> {
  try {
    const { id } = await params
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

    // Get definition for additional info
    const definition = dockerManager.getServiceDefinition(id)

    return NextResponse.json({
      success: true,
      data: {
        service: {
          ...service,
          definition: definition
            ? {
                name: definition.name,
                type: definition.type,
                description: definition.description,
                icon: definition.icon,
                ui: definition.ui,
              }
            : null,
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch service:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch service',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/services/:id
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<void>>> {
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

    // Remove service (will stop container first if running)
    await dockerManager.removeService(id)

    return NextResponse.json({
      success: true,
      data: undefined,
    })
  } catch (error) {
    console.error('Failed to remove service:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove service',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
