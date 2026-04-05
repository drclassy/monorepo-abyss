/**
 * PORTAL Sentra — Docker Service Manager
 * Manages Docker containers for development services
 */

import { exec, spawn } from 'child_process'
import { EventEmitter } from 'events'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import type {
  CreateServiceInput,
  ServiceDefinition,
  ServiceInstance,
  ServiceLogEntry,
} from '@/types/services'
import { SERVICE_CATALOG } from '@/types/services'

const execAsync = promisify(exec)

// ============================================================================
// Types
// ============================================================================

interface DockerContainerInfo {
  Id: string
  Names: string[]
  Image: string
  State: string
  Status: string
  Ports: Array<{
    PrivatePort: number
    PublicPort?: number
    Type: string
  }>
  Labels: Record<string, string>
}

interface ServiceManagerEventMap {
  serviceCreated: { serviceId: string; instance: ServiceInstance }
  serviceStarted: { serviceId: string }
  serviceStopped: { serviceId: string }
  serviceError: { serviceId: string; error: string }
  log: { serviceId: string; entry: ServiceLogEntry }
}

// ============================================================================
// Configuration
// ============================================================================

const DATA_DIR = join(process.cwd(), '.sentra', 'services')
const NETWORK_NAME = 'sentra-network'

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// ============================================================================
// Docker Manager Class
// ============================================================================

class DockerManager extends EventEmitter {
  private services = new Map<string, ServiceInstance>()
  private isDockerAvailable = false

  constructor() {
    super()
    this.checkDockerAvailability()
  }

  // -------------------------------------------------------------------------
  // Docker Availability
  // -------------------------------------------------------------------------

  private async checkDockerAvailability(): Promise<void> {
    try {
      await execAsync('docker --version')
      await this.ensureNetwork()
      this.isDockerAvailable = true
      console.log('[DockerManager] Docker is available')
    } catch (error) {
      this.isDockerAvailable = false
      console.error('[DockerManager] Docker not available:', error)
    }
  }

  private async ensureNetwork(): Promise<void> {
    try {
      await execAsync(`docker network inspect ${NETWORK_NAME}`)
    } catch {
      // Network doesn't exist, create it
      await execAsync(`docker network create ${NETWORK_NAME}`)
      console.log(`[DockerManager] Created network: ${NETWORK_NAME}`)
    }
  }

  isAvailable(): boolean {
    return this.isDockerAvailable
  }

  // -------------------------------------------------------------------------
  // Service Lifecycle
  // -------------------------------------------------------------------------

  async createService(input: CreateServiceInput): Promise<ServiceInstance> {
    if (!this.isDockerAvailable) {
      throw new Error('Docker is not available. Please install Docker.')
    }

    const definition = SERVICE_CATALOG.find(s => s.id === input.definitionId)
    if (!definition) {
      throw new Error(`Unknown service type: ${input.definitionId}`)
    }

    const serviceId = `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Generate credentials
    const generatedPassword = this.generatePassword()
    const env = this.buildEnv(definition.docker.env, generatedPassword, input.customEnv)

    // Determine ports
    const ports = this.buildPorts(definition.docker.ports, input.customPort)

    // Create volume directory
    const volumeDir = join(DATA_DIR, serviceId)
    if (!existsSync(volumeDir)) {
      mkdirSync(volumeDir, { recursive: true })
    }

    const instance: ServiceInstance = {
      id: serviceId,
      definitionId: definition.id,
      projectId: input.projectId,
      name: input.name,
      status: 'creating',
      ports,
      env,
      volumes: definition.docker.volumes.map(v => {
        const [name, path] = v.split(':')
        return `${join(volumeDir, name)}:${path}`
      }),
      createdAt: new Date(),
    }

    this.services.set(serviceId, instance)

    // Start the container
    await this.startContainer(instance, definition)

    this.emit('serviceCreated', { serviceId, instance })
    return instance
  }

  async startService(serviceId: string): Promise<void> {
    const instance = this.services.get(serviceId)
    if (!instance) {
      throw new Error(`Service not found: ${serviceId}`)
    }

    const definition = SERVICE_CATALOG.find(s => s.id === instance.definitionId)
    if (!definition) {
      throw new Error(`Service definition not found: ${instance.definitionId}`)
    }

    await this.startContainer(instance, definition)
    this.emit('serviceStarted', { serviceId })
  }

  async stopService(serviceId: string): Promise<void> {
    const instance = this.services.get(serviceId)
    if (!instance || !instance.containerId) {
      throw new Error(`Service not running: ${serviceId}`)
    }

    instance.status = 'stopping'

    try {
      await execAsync(`docker stop ${instance.containerId}`)
      instance.status = 'stopped'
      instance.stoppedAt = new Date()
      this.emit('serviceStopped', { serviceId })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to stop service'
      this.emit('serviceError', { serviceId, error: errorMsg })
      throw error
    }
  }

  async removeService(serviceId: string): Promise<void> {
    const instance = this.services.get(serviceId)
    if (!instance) {
      throw new Error(`Service not found: ${serviceId}`)
    }

    // Stop if running
    if (instance.containerId && instance.status === 'running') {
      try {
        await execAsync(`docker stop ${instance.containerId}`)
        await execAsync(`docker rm ${instance.containerId}`)
      } catch (error) {
        console.error(`[DockerManager] Error removing container:`, error)
      }
    }

    this.services.delete(serviceId)
  }

  // -------------------------------------------------------------------------
  // Container Operations
  // -------------------------------------------------------------------------

  private async startContainer(
    instance: ServiceInstance,
    definition: ServiceDefinition
  ): Promise<void> {
    const image = `${definition.docker.image}:${definition.docker.tag}`

    // Pull image first
    try {
      await execAsync(`docker pull ${image}`)
    } catch (error) {
      console.error(`[DockerManager] Failed to pull image ${image}:`, error)
      throw new Error(`Failed to pull Docker image: ${image}`)
    }

    // Build docker run command
    const args: string[] = [
      'run',
      '-d', // detached
      '--name',
      instance.id,
      '--network',
      NETWORK_NAME,
      '--restart',
      'unless-stopped',
    ]

    // Add environment variables
    Object.entries(instance.env).forEach(([key, value]) => {
      args.push('-e', `${key}=${value}`)
    })

    // Add port mappings
    Object.entries(instance.ports).forEach(([containerPort, hostPort]) => {
      args.push('-p', `${hostPort}:${containerPort}`)
    })

    // Add volumes
    instance.volumes.forEach(volume => {
      args.push('-v', volume)
    })

    // Add labels for identification
    args.push('-l', 'managed-by=portal-sentra')
    args.push('-l', `service-id=${instance.id}`)
    args.push('-l', `service-type=${definition.type}`)
    if (instance.projectId) {
      args.push('-l', `project-id=${instance.projectId}`)
    }

    // Add health check if defined
    if (definition.docker.healthCheck) {
      args.push('--health-cmd', definition.docker.healthCheck.test.join(' '))
      args.push('--health-interval', definition.docker.healthCheck.interval)
      args.push('--health-timeout', definition.docker.healthCheck.timeout)
      args.push('--health-retries', definition.docker.healthCheck.retries.toString())
    }

    // Add image
    args.push(image)

    // Execute docker run
    const { stdout } = await execAsync(`docker ${args.join(' ')}`)
    const containerId = stdout.trim()

    instance.containerId = containerId
    instance.status = 'running'
    instance.startedAt = new Date()

    // Start log streaming
    this.streamLogs(instance.id, containerId)
  }

  private streamLogs(serviceId: string, containerId: string): void {
    const logProcess = spawn('docker', ['logs', '-f', '--tail', '100', containerId])

    logProcess.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          const entry: ServiceLogEntry = {
            timestamp: new Date(),
            source: 'stdout',
            message: line,
          }
          this.emit('log', { serviceId, entry })
        }
      })
    })

    logProcess.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          const entry: ServiceLogEntry = {
            timestamp: new Date(),
            source: 'stderr',
            message: line,
          }
          this.emit('log', { serviceId, entry })
        }
      })
    })

    // Clean up when service is stopped
    this.once(`serviceStopped-${serviceId}`, () => {
      logProcess.kill()
    })
  }

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  getService(serviceId: string): ServiceInstance | undefined {
    return this.services.get(serviceId)
  }

  getAllServices(): ServiceInstance[] {
    return Array.from(this.services.values())
  }

  getServicesByProject(projectId: string): ServiceInstance[] {
    return this.getAllServices().filter(s => s.projectId === projectId)
  }

  getServiceDefinition(serviceId: string): ServiceDefinition | undefined {
    const instance = this.services.get(serviceId)
    if (!instance) return undefined
    return SERVICE_CATALOG.find(s => s.id === instance.definitionId)
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  private buildEnv(
    template: Record<string, string>,
    generatedPassword: string,
    customEnv?: Record<string, string>
  ): Record<string, string> {
    const env: Record<string, string> = {}

    Object.entries(template).forEach(([key, value]) => {
      if (value === '${generated}') {
        env[key] = generatedPassword
      } else {
        env[key] = value
      }
    })

    // Override with custom env
    if (customEnv) {
      Object.assign(env, customEnv)
    }

    return env
  }

  private buildPorts(
    template: Record<string, number>,
    customPort?: number
  ): Record<string, number> {
    const ports: Record<string, number> = {}

    Object.entries(template).forEach(([containerPort, defaultHostPort]) => {
      // If custom port is specified and this is the main port, use it
      if (customPort && defaultHostPort === this.getMainPort(template)) {
        ports[containerPort] = customPort
      } else {
        ports[containerPort] = defaultHostPort
      }
    })

    return ports
  }

  private getMainPort(ports: Record<string, number>): number {
    // Return the first port as main port
    return Object.values(ports)[0]
  }

  // -------------------------------------------------------------------------
  // Discovery (Sync with existing Docker containers)
  // -------------------------------------------------------------------------

  async discoverExistingServices(): Promise<void> {
    try {
      const { stdout } = await execAsync(
        `docker ps -a --filter "label=managed-by=portal-sentra" --format "{{json .}}"`
      )

      const lines = stdout.trim().split('\n')
      for (const line of lines) {
        if (!line) continue

        try {
          const container = JSON.parse(line) as DockerContainerInfo
          const serviceId = container.Labels['service-id']
          const definitionId = container.Labels['service-type']

          if (serviceId && definitionId && !this.services.has(serviceId)) {
            // Recreate instance from container info
            const instance: ServiceInstance = {
              id: serviceId,
              definitionId,
              projectId: container.Labels['project-id'],
              name: container.Names[0]?.replace(/^\//, '') || serviceId,
              status: container.State === 'running' ? 'running' : 'stopped',
              containerId: container.Id,
              ports: {}, // Would need to parse from container info
              env: {},
              volumes: [],
              createdAt: new Date(),
              startedAt: container.State === 'running' ? new Date() : undefined,
            }

            this.services.set(serviceId, instance)
          }
        } catch (parseError) {
          console.error('[DockerManager] Error parsing container:', parseError)
        }
      }
    } catch (error) {
      console.error('[DockerManager] Discovery failed:', error)
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const dockerManager = new DockerManager()

// Auto-discover on startup
dockerManager.discoverExistingServices().catch(console.error)
