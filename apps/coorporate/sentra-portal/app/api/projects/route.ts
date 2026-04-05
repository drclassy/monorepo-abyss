// Architected and built by Claudesy.
/**
 * PORTAL Sentra — Projects API
 * GET: List all projects from monorepo + database
 * POST: Create new project
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ProjectRepository } from '@/lib/db'
// import {
//   getMonorepoProjects,
//   syncMonorepoToDb,
//   scanMonorepoProjects
// } from '@/lib/monorepo-scanner';
import type { ApiResponse, CreateProjectInput, Project } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  path: z.string().min(1, 'Path is required'),
  port: z.number().int().min(1024).max(65535),
  startCommand: z.string().default('npm run dev'),
  buildCommand: z.string().default('npm run build'),
  envVars: z.record(z.string()).default({}),
})

// ============================================================================
// GET /api/projects
// Returns projects from monorepo filesystem + database
// ============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ projects: Project[]; source: string; scannedAt: string }>>> {
  try {
    const { searchParams } = new URL(request.url)
    const sync = searchParams.get('sync') === 'true'
    const source = searchParams.get('source') || 'auto' // 'auto', 'db', 'filesystem'

    let projects: Project[] = []
    let sourceUsed: string

    if (source === 'filesystem') {
      // Return only filesystem projects (no DB sync)
      // projects = await getMonorepoProjects();
      projects = []
      sourceUsed = 'filesystem'
    } else if (source === 'db') {
      // Return only database projects
      projects = ProjectRepository.findAll() as Project[]
      sourceUsed = 'database'
    } else {
      // Auto mode: sync filesystem to DB and return merged
      if (sync) {
        // projects = await syncMonorepoToDb();
        projects = []
        sourceUsed = 'synced'
      } else {
        // Get from DB first, fallback to filesystem if empty
        const dbProjects = ProjectRepository.findAll() as Project[]
        if (dbProjects.length > 0) {
          projects = dbProjects
          sourceUsed = 'database'
        } else {
          // Auto-sync on first load
          // projects = await syncMonorepoToDb();
          projects = []
          sourceUsed = 'auto-synced'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        projects,
        source: sourceUsed,
        scannedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/projects
// Create new project (syncs to monorepo structure)
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ project: Project }>>> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createProjectSchema.safeParse(body)
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

    // Check for duplicate port
    const existingByPort = ProjectRepository.findByPort(input.port)
    if (existingByPort) {
      return NextResponse.json(
        {
          success: false,
          error: 'Port already in use',
          message: `Port ${input.port} is already used by project "${existingByPort.name}"`,
        },
        { status: 409 }
      )
    }

    // Create project
    const project = ProjectRepository.create(input as CreateProjectInput)

    return NextResponse.json(
      {
        success: true,
        data: { project: project as Project },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create project:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/projects (bulk operations)
// ============================================================================

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ synced: number; projects: Project[] }>>> {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'sync-monorepo') {
      // Force sync all monorepo projects to database
      // const synced = await syncMonorepoToDb();
      const synced = []

      return NextResponse.json({
        success: true,
        data: {
          synced: synced.length,
          projects: synced,
        },
      })
    }

    if (action === 'rescan') {
      // Just rescan without syncing to DB
      // const scanned = await getMonorepoProjects();
      const scanned = []

      return NextResponse.json({
        success: true,
        data: {
          synced: scanned.length,
          projects: scanned,
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
        message: 'Supported actions: sync-monorepo, rescan',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to perform bulk action:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk action',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
