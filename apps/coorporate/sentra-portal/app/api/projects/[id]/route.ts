/**
 * PORTAL Sentra — Single Project API
 * GET: Get project by ID
 * PATCH: Update project
 * DELETE: Delete project
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { LogRepository, ProjectRepository } from '@/lib/db'
import type { ApiResponse, UpdateProjectInput } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  path: z.string().min(1).optional(),
  port: z.number().int().min(1024).max(65535).optional(),
  startCommand: z.string().optional(),
  buildCommand: z.string().optional(),
  envVars: z.record(z.string()).optional(),
})

// ============================================================================
// GET /api/projects/:id
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: unknown }>>> {
  try {
    const { id } = await params
    const project = ProjectRepository.findById(id)

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { project },
    })
  } catch (error) {
    console.error('Failed to fetch project:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/projects/:id
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: unknown }>>> {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if project exists
    const existing = ProjectRepository.findById(id)
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      )
    }

    // Cannot modify if running
    if (existing.status === 'running') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot modify running project',
          message: 'Please stop the server before making changes',
        },
        { status: 409 }
      )
    }

    // Validate input
    const validationResult = updateProjectSchema.safeParse(body)
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

    // Check for port conflict if changing port
    if (input.port && input.port !== existing.port) {
      const existingByPort = ProjectRepository.findByPort(input.port)
      if (existingByPort && existingByPort.id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Port already in use',
            message: `Port ${input.port} is already used by project "${existingByPort.name}"`,
          },
          { status: 409 }
        )
      }
    }

    // Update project
    const project = ProjectRepository.update(id, input as UpdateProjectInput)

    return NextResponse.json({
      success: true,
      data: { project },
    })
  } catch (error) {
    console.error('Failed to update project:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/projects/:id
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id } = await params

    // Check if project exists
    const existing = ProjectRepository.findById(id)
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      )
    }

    // Cannot delete if running
    if (existing.status === 'running') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete running project',
          message: 'Please stop the server before deleting',
        },
        { status: 409 }
      )
    }

    // Delete logs first (due to foreign key)
    LogRepository.clearByProject(id)

    // Delete project
    ProjectRepository.delete(id)

    return NextResponse.json({
      success: true,
      data: undefined,
    })
  } catch (error) {
    console.error('Failed to delete project:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
