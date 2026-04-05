/**
 * PORTAL Sentra — Server Stop API
 * POST /api/projects/:id/server/stop
 */

import { type NextRequest, NextResponse } from 'next/server'
import { ProjectRepository } from '@/lib/db'
import { processManager } from '@/lib/process-manager'
import type { ApiResponse } from '@/types'

interface StopServerResponse {
  projectId: string
  status: string
  message: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<StopServerResponse>>> {
  try {
    const { id } = await params

    // Find project
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

    // Check if running
    if (project.status !== 'running' && project.status !== 'starting') {
      return NextResponse.json(
        {
          success: false,
          error: 'Server not running',
          message: `Server is currently ${project.status}`,
        },
        { status: 409 }
      )
    }

    // Stop the server
    const stopped = processManager.stopServer(id, 'SIGTERM')

    if (!stopped) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to stop server',
          message: 'Server process not found',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        projectId: id,
        status: 'stopping',
        message: 'Server is being stopped gracefully',
      },
    })
  } catch (error) {
    console.error('Failed to stop server:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to stop server',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
