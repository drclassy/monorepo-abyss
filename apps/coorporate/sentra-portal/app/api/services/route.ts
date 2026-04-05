/**
 * PORTAL Sentra — Services API
 * GET: List all services & catalog
 * POST: Create new service
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { dockerManager } from '@/lib/docker-manager'
import type { ApiResponse, CreateServiceInput } from '@/types'
import { SERVICE_CATALOG } from '@/types/services'

// ============================================================================
// Validation Schema
// ============================================================================

const createServiceSchema = z.object({
  definitionId: z.string().min(1, 'Service type is required'),
  name: z.string().min(1, 'Name is required').max(50),
  projectId: z.string().optional(),
  customPort: z.number().int().min(1024).max(65535).optional(),
  customEnv: z.record(z.string()).optional(),
})

// ============================================================================
// GET /api/services
// ============================================================================

interface GetServicesResponse {
  services: unknown[]
  catalog: unknown[]
  dockerAvailable: boolean
}

export async function GET(): Promise<NextResponse<ApiResponse<GetServicesResponse>>> {
  try {
    // Check Docker availability
    const dockerAvailable = dockerManager.isAvailable()

    // Get all services
    const services = dockerManager.getAllServices()

    return NextResponse.json({
      success: true,
      data: {
        services,
        catalog: SERVICE_CATALOG,
        dockerAvailable,
      },
    })
  } catch (error) {
    console.error('Failed to fetch services:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch services',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/services
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ service: unknown }>>> {
  try {
    // Check Docker availability
    if (!dockerManager.isAvailable()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Docker not available',
          message: 'Docker is not installed or not running. Please install Docker to use services.',
        },
        { status: 503 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = createServiceSchema.safeParse(body)
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

    // Check port availability if custom port specified
    if (input.customPort) {
      const existingService = dockerManager
        .getAllServices()
        .find(s => Object.values(s.ports).includes(input.customPort!))
      if (existingService) {
        return NextResponse.json(
          {
            success: false,
            error: 'Port already in use',
            message: `Port ${input.customPort} is already used by service "${existingService.name}"`,
          },
          { status: 409 }
        )
      }
    }

    // Create service
    const service = await dockerManager.createService(input as CreateServiceInput)

    return NextResponse.json(
      {
        success: true,
        data: { service },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create service:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create service',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
