/**
 * PORTAL Sentra — Deployments API
 * GET /api/deployments - Get deployment history and status
 * POST /api/deployments - Trigger new deployment
 */

import { type NextRequest, NextResponse } from 'next/server'
import { deploymentManager } from '@/lib/deployments/deployment-manager'
import type { ApiResponse, Deployment } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

interface CreateDeploymentInput {
  serviceId: string
  branch?: string
  commit?: string
  environment?: 'production' | 'staging' | 'development'
}

// ============================================================================
// GET /api/deployments
// ============================================================================

export async function GET(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      deployments: Deployment[]
      summary: any
      recent: Deployment[]
    }>
  >
> {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const includeSummary = searchParams.get('summary') === 'true'

    let deployments: Deployment[]

    if (serviceId) {
      deployments = await deploymentManager.getServiceDeployments(serviceId, limit)
    } else {
      deployments = await deploymentManager.getAllDeployments(limit)
    }

    const response: any = {
      deployments,
      recent: deployments.slice(0, 5),
    }

    if (includeSummary) {
      response.summary = await deploymentManager.getDeploymentSummary()
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('[API] Failed to get deployments:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get deployments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/deployments
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ deployment: Deployment }>>> {
  try {
    const body = await request.json()
    const { serviceId, branch, commit, environment } = body as CreateDeploymentInput

    if (!serviceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service ID required',
          message: 'Please specify which service to deploy',
        },
        { status: 400 }
      )
    }

    // In a real app, you'd validate user permissions here
    const triggeredBy = 'admin' // Mock user

    const deployment = await deploymentManager.triggerDeployment(serviceId, {
      branch,
      commit,
      environment,
      triggeredBy,
    })

    return NextResponse.json(
      {
        success: true,
        data: { deployment },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API] Failed to trigger deployment:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger deployment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
