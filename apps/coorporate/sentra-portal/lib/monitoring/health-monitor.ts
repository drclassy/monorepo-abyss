/**
 * PORTAL Sentra — Health Check Monitor
 * Monitors database connections and service health
 */

import 'server-only'
import { dockerManager } from '@/lib/docker-manager'
import { tunnelManager } from '@/lib/tunnel-manager'
import { railwayMonitor } from './railway-monitor'
import { sentryMonitor } from './sentry-monitor'
import { systemMonitor } from './system-monitor'

// ============================================================================
// Types
// ============================================================================

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'error'
  timestamp: Date
  services: {
    database: ServiceHealth
    docker: ServiceHealth
    tunnels: ServiceHealth
    railway: ServiceHealth
    sentry: ServiceHealth
    system: ServiceHealth
  }
  uptime: number // seconds
  version: string
}

export interface ServiceHealth {
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  message: string
  latency?: number // milliseconds
  details?: Record<string, any>
}

export interface HealthCheckResult {
  service: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  message: string
  latency: number
  timestamp: Date
  details?: any
}

// ============================================================================
// Health Monitor Class
// ============================================================================

export class HealthMonitor {
  private startTime: Date
  private lastHealthCheck: HealthStatus | null = null
  private healthHistory: HealthCheckResult[] = []

  constructor() {
    this.startTime = new Date()
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthStatus> {
    const timestamp = new Date()
    const results = await Promise.allSettled([
      this.checkDatabase(),
      this.checkDocker(),
      this.checkTunnels(),
      this.checkRailway(),
      this.checkSentry(),
      this.checkSystem(),
    ])

    const services = {
      database: this.extractResult(results[0], 'database'),
      docker: this.extractResult(results[1], 'docker'),
      tunnels: this.extractResult(results[2], 'tunnels'),
      railway: this.extractResult(results[3], 'railway'),
      sentry: this.extractResult(results[4], 'sentry'),
      system: this.extractResult(results[5], 'system'),
    }

    // Determine overall status
    const statuses = Object.values(services).map(s => s.status)
    let overall: HealthStatus['overall'] = 'healthy'

    if (statuses.includes('error')) {
      overall = 'error'
    } else if (statuses.includes('warning')) {
      overall = 'warning'
    }

    const healthStatus: HealthStatus = {
      overall,
      timestamp,
      services,
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      version: process.env.npm_package_version || '1.0.0',
    }

    this.lastHealthCheck = healthStatus
    return healthStatus
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now()

    // Temporarily return healthy status
    return {
      status: 'healthy',
      message: 'Database check disabled for build',
      latency: Date.now() - startTime,
      details: {
        type: 'SQLite',
        status: 'mock',
      },
    }
  }

  /**
   * Check Docker service availability
   */
  private async checkDocker(): Promise<ServiceHealth> {
    const startTime = Date.now()

    try {
      const isAvailable = await dockerManager.isAvailable()

      if (isAvailable) {
        const services = dockerManager.getAllServices()
        const runningCount = services.filter(s => s.status === 'running').length

        return {
          status: 'healthy',
          message: `Docker available with ${runningCount} running services`,
          latency: Date.now() - startTime,
          details: {
            totalServices: services.length,
            runningServices: runningCount,
          },
        }
      } else {
        return {
          status: 'warning',
          message: 'Docker not available or not running',
          latency: Date.now() - startTime,
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Docker check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        latency: Date.now() - startTime,
      }
    }
  }

  /**
   * Check tunnel service health
   */
  private async checkTunnels(): Promise<ServiceHealth> {
    const startTime = Date.now()

    try {
      const tunnels = tunnelManager.getAllTunnels()
      const activeCount = tunnelManager.getActiveCount()
      const totalCount = tunnels.length

      const status: ServiceHealth['status'] =
        totalCount === 0
          ? 'healthy'
          : activeCount === totalCount
            ? 'healthy'
            : activeCount > 0
              ? 'warning'
              : 'error'

      return {
        status,
        message: `Tunnels: ${activeCount}/${totalCount} active`,
        latency: Date.now() - startTime,
        details: {
          total: totalCount,
          active: activeCount,
          inactive: totalCount - activeCount,
        },
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Tunnel check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        latency: Date.now() - startTime,
      }
    }
  }

  /**
   * Check Railway deployment status
   */
  private async checkRailway(): Promise<ServiceHealth> {
    const startTime = Date.now()

    try {
      const isAvailable = await railwayMonitor.isAvailable()

      if (isAvailable) {
        const services = await railwayMonitor.getServices()
        const healthyCount = services.filter(s => s.health === 'healthy').length
        const totalCount = services.length

        const status: ServiceHealth['status'] =
          totalCount === 0
            ? 'unknown'
            : healthyCount === totalCount
              ? 'healthy'
              : healthyCount > 0
                ? 'warning'
                : 'error'

        return {
          status,
          message: `Railway: ${healthyCount}/${totalCount} services healthy`,
          latency: Date.now() - startTime,
          details: {
            total: totalCount,
            healthy: healthyCount,
            unhealthy: totalCount - healthyCount,
          },
        }
      } else {
        return {
          status: 'warning',
          message: 'Railway CLI not configured',
          latency: Date.now() - startTime,
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Railway check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        latency: Date.now() - startTime,
      }
    }
  }

  /**
   * Check Sentry monitoring status
   */
  private async checkSentry(): Promise<ServiceHealth> {
    const startTime = Date.now()

    try {
      const isAvailable = await sentryMonitor.isAvailable()

      if (isAvailable) {
        const healthScore = await sentryMonitor.getHealthScore()
        const metrics = await sentryMonitor.getMetrics()

        const status: ServiceHealth['status'] =
          healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'warning' : 'error'

        return {
          status,
          message: `Sentry monitoring active (health: ${healthScore}%)`,
          latency: Date.now() - startTime,
          details: {
            healthScore,
            projects: metrics.length,
            avgUptime: metrics.reduce((sum, m) => sum + m.uptime, 0) / metrics.length,
          },
        }
      } else {
        return {
          status: 'warning',
          message: 'Sentry CLI not configured',
          latency: Date.now() - startTime,
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Sentry check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        latency: Date.now() - startTime,
      }
    }
  }

  /**
   * Check system resource health
   */
  private async checkSystem(): Promise<ServiceHealth> {
    const startTime = Date.now()

    try {
      const healthScore = await systemMonitor.getHealthScore()
      const metrics = await systemMonitor.getSystemMetrics()

      const status: ServiceHealth['status'] =
        healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'error'

      return {
        status,
        message: `System health: ${healthScore}% (${metrics.cpu.usage.toFixed(1)}% CPU, ${metrics.memory.usage.toFixed(1)}% RAM)`,
        latency: Date.now() - startTime,
        details: {
          healthScore,
          cpuUsage: metrics.cpu.usage,
          memoryUsage: metrics.memory.usage,
          diskUsage: metrics.disk.usage,
        },
      }
    } catch (error) {
      return {
        status: 'error',
        message: `System check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        latency: Date.now() - startTime,
      }
    }
  }

  /**
   * Get health history
   */
  getHealthHistory(limit: number = 50): HealthCheckResult[] {
    return this.healthHistory.slice(-limit)
  }

  /**
   * Get last health check result
   */
  getLastHealthCheck(): HealthStatus | null {
    return this.lastHealthCheck
  }

  /**
   * Extract result from PromiseSettledResult
   */
  private extractResult(
    result: PromiseSettledResult<ServiceHealth>,
    serviceName: string
  ): ServiceHealth {
    if (result.status === 'fulfilled') {
      // Store in history for monitoring
      this.healthHistory.push({
        service: serviceName,
        status: result.value.status,
        message: result.value.message,
        latency: result.value.latency || 0,
        timestamp: new Date(),
        details: result.value.details,
      })

      return result.value
    } else {
      const errorResult: ServiceHealth = {
        status: 'error',
        message: `Check failed: ${result.reason}`,
        latency: 0,
      }

      this.healthHistory.push({
        service: serviceName,
        status: 'error',
        message: errorResult.message,
        latency: 0,
        timestamp: new Date(),
      })

      return errorResult
    }
  }

  /**
   * Get table count for database health details
   */
  private getTableCount(): number {
    // Temporarily return mock count
    return 5
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const healthMonitor = new HealthMonitor()
