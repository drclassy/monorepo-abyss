/**
 * PORTAL Sentra — Server Start API
 * POST /api/projects/:id/server/start
 */

import { type NextRequest, NextResponse } from 'next/server'
import { ProjectRepository } from '@/lib/db'
import { processManager } from '@/lib/process-manager'
import type { ApiResponse } from '@/types'

interface StartServerResponse {
  processId: string
  pid: number
  port: number
  status: string
  url: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<StartServerResponse>>> {
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

    // Check if already running
    if (project.status === 'running') {
      return NextResponse.json(
        {
          success: false,
          error: 'Server already running',
          message: `Server is already running on port ${project.port}`,
        },
        { status: 409 }
      )
    }

    // Start the server
    const result = await processManager.startServer(id, {
      command: project.startCommand,
      cwd: project.path,
      env: project.envVars,
      port: project.port,
    })

    if (!result.success || !result.process) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to start server',
          message: result.error || 'Unknown error',
        },
        { status: 500 }
      )
    }

    const process = result.process

    return NextResponse.json({
      success: true,
      data: {
        processId: process.id,
        pid: process.pid,
        port: process.port,
        status: process.status,
        url: `http://localhost:${process.port}`,
      },
    })
  } catch (error) {
    console.error('Failed to start server:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start server',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
