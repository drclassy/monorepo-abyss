/**
 * PORTAL Sentra — Server Status API
 * GET /api/projects/:id/server/status
 */

import { type NextRequest, NextResponse } from 'next/server'
import { ProjectRepository } from '@/lib/db'
import { processManager } from '@/lib/process-manager'
import type { ApiResponse } from '@/types'

interface ServerStatusResponse {
  projectId: string
  status: string
  pid: number | null
  port: number
  url: string | null
  uptime: number | null
  processId: string | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ServerStatusResponse>>> {
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

    // Get running process info if available
    const runningProcess = processManager.getProcessByProject(id)

    const uptime = runningProcess ? Date.now() - runningProcess.startTime.getTime() : null

    return NextResponse.json({
      success: true,
      data: {
        projectId: id,
        status: project.status,
        pid: project.pid,
        port: project.port,
        url: project.status === 'running' ? `http://localhost:${project.port}` : null,
        uptime,
        processId: runningProcess?.id || null,
      },
    })
  } catch (error) {
    console.error('Failed to get server status:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get server status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
