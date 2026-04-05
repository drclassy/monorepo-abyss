/**
 * PORTAL Sentra — Deployment Rollback API
 * POST /api/deployments/{id}/rollback - Rollback to a previous deployment
 */

import { type NextRequest, NextResponse } from 'next/server'
import { deploymentManager } from '@/lib/deployments/deployment-manager'
import type { ApiResponse, Deployment } from '@/types'

// ============================================================================
// POST /api/deployments/{id}/rollback
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ rollback: Deployment; original: Deployment }>>> {
  try {
    const deploymentId = params.id
    const body = await request.json()
    const { targetDeploymentId, reason } = body

    if (!targetDeploymentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target deployment ID required',
          message: 'Please specify which deployment to rollback to',
        },
        { status: 400 }
      )
    }

    // Check if rollback is possible
    const canRollback = await deploymentManager.canRollback(deploymentId)
    if (!canRollback) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rollback not possible',
          message: 'No suitable rollback target found or deployment is not in a rollbackable state',
        },
        { status: 400 }
      )
    }

    // Get the original deployment for response
    const originalDeployment = await deploymentManager.getDeployment(deploymentId)
    if (!originalDeployment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deployment not found',
          message: `Deployment ${deploymentId} not found`,
        },
        { status: 404 }
      )
    }

    // In a real app, you'd validate user permissions here
    const triggeredBy = 'admin' // Mock user

    const rollbackDeployment = await deploymentManager.rollbackDeployment({
      deploymentId,
      targetDeploymentId,
      reason: reason || 'Manual rollback',
      triggeredBy,
    })

    return NextResponse.json({
      success: true,
      data: {
        rollback: rollbackDeployment,
        original: originalDeployment,
      },
    })
  } catch (error) {
    console.error('[API] Failed to rollback deployment:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to rollback deployment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET /api/deployments/{id}/rollback
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<
  NextResponse<
    ApiResponse<{
      canRollback: boolean
      targets: Deployment[]
      current: Deployment | null
    }>
  >
> {
  try {
    const deploymentId = params.id

    const canRollback = await deploymentManager.canRollback(deploymentId)
    const targets = await deploymentManager.getRollbackTargets(deploymentId)
    const current = await deploymentManager.getDeployment(deploymentId)

    return NextResponse.json({
      success: true,
      data: {
        canRollback,
        targets,
        current,
      },
    })
  } catch (error) {
    console.error('[API] Failed to get rollback info:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get rollback information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
