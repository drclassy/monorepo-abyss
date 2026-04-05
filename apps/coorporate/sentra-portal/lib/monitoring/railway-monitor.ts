/**
 * PORTAL Sentra — Railway Deployment Monitor
 * Monitors Railway deployments for Sentra applications
 */

import 'server-only'
import { execa } from 'execa'

// ============================================================================
// Types
// ============================================================================

export interface RailwayDeployment {
  id: string
  service: string
  environment: string
  status: 'building' | 'deploying' | 'success' | 'failed'
  createdAt: Date
  buildTime?: number
  deployTime?: number
  url?: string
  commit?: string
  branch?: string
}

export interface RailwayService {
  id: string
  name: string
  environment: string
  status: 'active' | 'inactive' | 'building' | 'failed'
  url?: string
  lastDeployed?: Date
  health?: 'healthy' | 'unhealthy' | 'unknown'
}

// ============================================================================
// Railway Monitor Class
// ============================================================================

export class RailwayMonitor {
  private apiToken?: string
  private projectId?: string

  constructor() {
    this.apiToken = process.env.RAILWAY_API_TOKEN
    this.projectId = process.env.RAILWAY_PROJECT_ID
  }

  /**
   * Check if Railway CLI is available and authenticated
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (!this.apiToken) return false

      const result = await execa('railway', ['status'], {
        timeout: 5000,
        reject: false,
      })

      return result.exitCode === 0
    } catch (error) {
      console.warn('[RailwayMonitor] Railway CLI not available:', error)
      return false
    }
  }

  /**
   * Get all services in the project
   */
  async getServices(): Promise<RailwayService[]> {
    try {
      if (!(await this.isAvailable())) {
        return this.getMockServices()
      }

      // Get services using Railway CLI
      const result = await execa('railway', ['service', 'list', '--json'], {
        timeout: 10000,
      })

      const services = JSON.parse(result.stdout)

      return services.map((service: any) => ({
        id: service.id,
        name: service.name,
        environment: service.environment,
        status: this.mapRailwayStatus(service.status),
        url: service.url,
        lastDeployed: service.lastDeployed ? new Date(service.lastDeployed) : undefined,
        health: service.health || 'unknown',
      }))
    } catch (error) {
      console.error('[RailwayMonitor] Failed to get services:', error)
      return this.getMockServices()
    }
  }

  /**
   * Get deployment history for a service
   */
  async getDeployments(serviceId?: string): Promise<RailwayDeployment[]> {
    try {
      if (!(await this.isAvailable())) {
        return this.getMockDeployments()
      }

      const args = ['deployment', 'list', '--json']
      if (serviceId) {
        args.push('--service', serviceId)
      }

      const result = await execa('railway', args, {
        timeout: 10000,
      })

      const deployments = JSON.parse(result.stdout)

      return deployments.slice(0, 10).map((deployment: any) => ({
        id: deployment.id,
        service: deployment.serviceName,
        environment: deployment.environmentName,
        status: this.mapRailwayStatus(deployment.status),
        createdAt: new Date(deployment.createdAt),
        buildTime: deployment.buildTimeMs,
        deployTime: deployment.deployTimeMs,
        url: deployment.url,
        commit: deployment.commitHash,
        branch: deployment.branch,
      }))
    } catch (error) {
      console.error('[RailwayMonitor] Failed to get deployments:', error)
      return this.getMockDeployments()
    }
  }

  /**
   * Get health status for all services
   */
  async getHealthStatus(): Promise<Record<string, 'healthy' | 'unhealthy' | 'unknown'>> {
    const services = await this.getServices()
    const health: Record<string, 'healthy' | 'unhealthy' | 'unknown'> = {}

    for (const service of services) {
      health[service.name] = service.health || 'unknown'
    }

    return health
  }

  /**
   * Map Railway status to our standardized status
   */
  private mapRailwayStatus(status: string): RailwayDeployment['status'] | RailwayService['status'] {
    const statusMap: Record<string, any> = {
      BUILDING: 'building',
      DEPLOYING: 'deploying',
      SUCCESS: 'success',
      FAILED: 'failed',
      CRASHED: 'failed',
      ACTIVE: 'active',
      INACTIVE: 'inactive',
    }

    return statusMap[status.toUpperCase()] || 'unknown'
  }

  /**
   * Mock data for development/testing when Railway is not available
   */
  private getMockServices(): RailwayService[] {
    return [
      {
        id: 'primary-healthcare',
        name: 'primary-healthcare',
        environment: 'production',
        status: 'active',
        url: 'https://primary-healthcare.up.railway.app',
        lastDeployed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        health: 'healthy',
      },
      {
        id: 'sentra-portal',
        name: 'sentra-portal',
        environment: 'production',
        status: 'active',
        url: 'https://sentra-portal.up.railway.app',
        lastDeployed: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        health: 'healthy',
      },
      {
        id: 'academic-solutions',
        name: 'academic-solutions',
        environment: 'staging',
        status: 'active',
        url: 'https://academic-solutions-staging.up.railway.app',
        lastDeployed: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        health: 'healthy',
      },
    ]
  }

  private getMockDeployments(): RailwayDeployment[] {
    return [
      {
        id: 'dep-001',
        service: 'sentra-portal',
        environment: 'production',
        status: 'success',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        buildTime: 45000,
        deployTime: 12000,
        url: 'https://sentra-portal.up.railway.app',
        commit: 'a1b2c3d4',
        branch: 'main',
      },
      {
        id: 'dep-002',
        service: 'primary-healthcare',
        environment: 'production',
        status: 'success',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        buildTime: 52000,
        deployTime: 15000,
        url: 'https://primary-healthcare.up.railway.app',
        commit: 'e5f6g7h8',
        branch: 'main',
      },
    ]
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const railwayMonitor = new RailwayMonitor()
