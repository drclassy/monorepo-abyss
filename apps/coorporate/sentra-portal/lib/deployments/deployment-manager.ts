/**
 * PORTAL Sentra — Deployment Manager
 * Manages deployment status tracking and rollback capabilities
 */

import 'server-only'

// ============================================================================
// Types
// ============================================================================

export interface Deployment {
  id: string
  serviceId: string
  serviceName: string
  environment: 'production' | 'staging' | 'development'
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back'
  commitHash?: string
  branch?: string
  triggeredBy?: string
  triggeredAt: Date
  buildStartedAt?: Date
  buildFinishedAt?: Date
  deployStartedAt?: Date
  deployFinishedAt?: Date
  buildTime?: number // milliseconds
  deployTime?: number // milliseconds
  url?: string
  logs?: string
  error?: string
  rollbackTarget?: string // deployment ID to rollback to
  metadata: Record<string, any>
}

export interface DeploymentSummary {
  total: number
  successful: number
  failed: number
  inProgress: number
  byEnvironment: Record<string, number>
  recent: Deployment[]
  averageBuildTime: number
  averageDeployTime: number
}

export interface RollbackOptions {
  deploymentId: string
  targetDeploymentId: string
  reason: string
  triggeredBy?: string
}

// ============================================================================
// Deployment Manager Class
// ============================================================================

export class DeploymentManager {
  private deployments: Map<string, Deployment> = new Map()

  /**
   * Get all deployments
   */
  async getAllDeployments(limit: number = 50): Promise<Deployment[]> {
    // Get Railway deployments
    const railwayDeployments = await railwayMonitor.getDeployments()

    // Convert to our format
    const deployments: Deployment[] = railwayDeployments.map(rd => ({
      id: rd.id,
      serviceId: rd.service,
      serviceName: rd.service,
      environment:
        rd.environment === 'production'
          ? 'production'
          : rd.environment === 'staging'
            ? 'staging'
            : 'development',
      status:
        rd.status === 'success'
          ? 'success'
          : rd.status === 'failed'
            ? 'failed'
            : rd.status === 'building'
              ? 'building'
              : rd.status === 'deploying'
                ? 'deploying'
                : 'pending',
      commitHash: rd.commit,
      branch: rd.branch,
      triggeredAt: rd.createdAt,
      buildTime: rd.buildTime,
      deployTime: rd.deployTime,
      url: rd.url,
      metadata: {},
    }))

    // Add any additional deployments from our internal storage
    const internalDeployments = Array.from(this.deployments.values())
    deployments.push(...internalDeployments)

    // Sort by triggered time, most recent first
    return deployments
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, limit)
  }

  /**
   * Get deployments for a specific service
   */
  async getServiceDeployments(serviceId: string, limit: number = 20): Promise<Deployment[]> {
    const allDeployments = await this.getAllDeployments(1000)
    return allDeployments.filter(d => d.serviceId === serviceId).slice(0, limit)
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<Deployment | null> {
    // Check Railway first
    const railwayDeployments = await railwayMonitor.getDeployments()
    const railwayDeployment = railwayDeployments.find(rd => rd.id === deploymentId)

    if (railwayDeployment) {
      return {
        id: railwayDeployment.id,
        serviceId: railwayDeployment.service,
        serviceName: railwayDeployment.service,
        environment:
          railwayDeployment.environment === 'production'
            ? 'production'
            : railwayDeployment.environment === 'staging'
              ? 'staging'
              : 'development',
        status:
          railwayDeployment.status === 'success'
            ? 'success'
            : railwayDeployment.status === 'failed'
              ? 'failed'
              : railwayDeployment.status === 'building'
                ? 'building'
                : railwayDeployment.status === 'deploying'
                  ? 'deploying'
                  : 'pending',
        commitHash: railwayDeployment.commit,
        branch: railwayDeployment.branch,
        triggeredAt: railwayDeployment.createdAt,
        buildTime: railwayDeployment.buildTime,
        deployTime: railwayDeployment.deployTime,
        url: railwayDeployment.url,
        metadata: {},
      }
    }

    // Check internal storage
    return this.deployments.get(deploymentId) || null
  }

  /**
   * Trigger a new deployment
   */
  async triggerDeployment(
    serviceId: string,
    options: {
      branch?: string
      commit?: string
      environment?: 'production' | 'staging' | 'development'
      triggeredBy?: string
    } = {}
  ): Promise<Deployment> {
    const deployment: Deployment = {
      id: `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceId,
      serviceName: serviceId,
      environment: options.environment || 'production',
      status: 'pending',
      branch: options.branch,
      commitHash: options.commit,
      triggeredBy: options.triggeredBy,
      triggeredAt: new Date(),
      metadata: {},
    }

    // Store in internal map
    this.deployments.set(deployment.id, deployment)

    // Simulate deployment process (in real implementation, this would trigger Railway)
    setTimeout(() => {
      this.updateDeploymentStatus(deployment.id, 'building')
    }, 1000)

    setTimeout(() => {
      this.updateDeploymentStatus(deployment.id, 'deploying')
    }, 10000)

    setTimeout(() => {
      this.updateDeploymentStatus(deployment.id, 'success')
    }, 25000)

    return deployment
  }

  /**
   * Rollback to a previous deployment
   */
  async rollbackDeployment(options: RollbackOptions): Promise<Deployment> {
    const targetDeployment = await this.getDeployment(options.targetDeploymentId)
    if (!targetDeployment) {
      throw new Error(`Target deployment ${options.targetDeploymentId} not found`)
    }

    const rollbackDeployment: Deployment = {
      id: `rollback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceId: targetDeployment.serviceId,
      serviceName: targetDeployment.serviceName,
      environment: targetDeployment.environment,
      status: 'pending',
      commitHash: targetDeployment.commitHash,
      branch: targetDeployment.branch,
      triggeredBy: options.triggeredBy,
      triggeredAt: new Date(),
      rollbackTarget: options.targetDeploymentId,
      metadata: {
        rollbackReason: options.reason,
        originalDeployment: options.deploymentId,
      },
    }

    // Store rollback deployment
    this.deployments.set(rollbackDeployment.id, rollbackDeployment)

    // Simulate rollback process
    setTimeout(() => {
      this.updateDeploymentStatus(rollbackDeployment.id, 'building')
    }, 1000)

    setTimeout(() => {
      this.updateDeploymentStatus(rollbackDeployment.id, 'deploying')
    }, 5000)

    setTimeout(() => {
      this.updateDeploymentStatus(rollbackDeployment.id, 'success')
    }, 15000)

    return rollbackDeployment
  }

  /**
   * Update deployment status (internal method)
   */
  private updateDeploymentStatus(deploymentId: string, status: Deployment['status']): void {
    const deployment = this.deployments.get(deploymentId)
    if (!deployment) return

    deployment.status = status

    const now = new Date()
    switch (status) {
      case 'building':
        deployment.buildStartedAt = now
        break
      case 'deploying':
        deployment.buildFinishedAt = now
        if (deployment.buildStartedAt) {
          deployment.buildTime = now.getTime() - deployment.buildStartedAt.getTime()
        }
        deployment.deployStartedAt = now
        break
      case 'success':
      case 'failed':
        deployment.deployFinishedAt = now
        if (deployment.deployStartedAt) {
          deployment.deployTime = now.getTime() - deployment.deployStartedAt.getTime()
        }
        break
    }
  }

  /**
   * Get deployment summary statistics
   */
  async getDeploymentSummary(): Promise<DeploymentSummary> {
    const deployments = await this.getAllDeployments(1000)

    const total = deployments.length
    const successful = deployments.filter(d => d.status === 'success').length
    const failed = deployments.filter(d => d.status === 'failed').length
    const inProgress = deployments.filter(
      d => d.status === 'pending' || d.status === 'building' || d.status === 'deploying'
    ).length

    const byEnvironment: Record<string, number> = {}
    deployments.forEach(d => {
      byEnvironment[d.environment] = (byEnvironment[d.environment] || 0) + 1
    })

    const recent = deployments.slice(0, 10)

    // Calculate averages
    const completedDeployments = deployments.filter(
      d => d.status === 'success' && d.buildTime && d.deployTime
    )
    const averageBuildTime =
      completedDeployments.length > 0
        ? completedDeployments.reduce((sum, d) => sum + d.buildTime!, 0) /
          completedDeployments.length
        : 0
    const averageDeployTime =
      completedDeployments.length > 0
        ? completedDeployments.reduce((sum, d) => sum + d.deployTime!, 0) /
          completedDeployments.length
        : 0

    return {
      total,
      successful,
      failed,
      inProgress,
      byEnvironment,
      recent,
      averageBuildTime,
      averageDeployTime,
    }
  }

  /**
   * Check if rollback is possible for a deployment
   */
  async canRollback(deploymentId: string): Promise<boolean> {
    const deployment = await this.getDeployment(deploymentId)
    if (!deployment || deployment.status !== 'success') return false

    // Check if there are other successful deployments for this service
    const serviceDeployments = await this.getServiceDeployments(deployment.serviceId, 10)
    const successfulDeployments = serviceDeployments.filter(
      d => d.status === 'success' && d.id !== deploymentId
    )

    return successfulDeployments.length > 0
  }

  /**
   * Get rollback targets for a deployment
   */
  async getRollbackTargets(deploymentId: string): Promise<Deployment[]> {
    const deployment = await this.getDeployment(deploymentId)
    if (!deployment) return []

    const serviceDeployments = await this.getServiceDeployments(deployment.serviceId, 20)
    return serviceDeployments.filter(
      d => d.status === 'success' && d.id !== deploymentId && d.triggeredAt < deployment.triggeredAt
    )
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const deploymentManager = new DeploymentManager()
