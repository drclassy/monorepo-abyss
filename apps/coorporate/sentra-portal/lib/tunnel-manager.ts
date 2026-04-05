/**
 * PORTAL Sentra — Tunnel Manager
 * Localtunnel integration for exposing local services to public URLs
 */

import 'server-only'

import { type ChildProcess, spawn } from 'child_process'
import { EventEmitter } from 'events'
import type {
  CreateTunnelInput,
  Tunnel,
  TunnelEvent,
  TunnelStatus,
  TunnelTargetType,
} from '@/types/tunnel'

// ============================================================================
// Types
// ============================================================================

interface LocaltunnelProcess {
  process: ChildProcess
  tunnel: Tunnel
  logs: string[]
}

interface PortCheckResult {
  available: boolean
  error?: string
}

// ============================================================================
// Tunnel Manager Class
// ============================================================================

class TunnelManager extends EventEmitter {
  private tunnels = new Map<string, Tunnel>()
  private processes = new Map<string, LocaltunnelProcess>()
  private restartAttempts = new Map<string, number>()
  private readonly maxRestartAttempts = 3
  private readonly restartDelay = 5000 // 5 seconds

  constructor() {
    super()
    this.setupEventHandlers()
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  private setupEventHandlers(): void {
    // Handle process cleanup on exit
    const cleanup = () => this.cleanupAll()
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('exit', cleanup)
  }

  // -------------------------------------------------------------------------
  // Port Validation
  // -------------------------------------------------------------------------

  /**
   * Check if a local port is available
   */
  async checkPortAvailability(port: number, host: string = 'localhost'): Promise<PortCheckResult> {
    return new Promise(resolve => {
      const net = require('net')
      const socket = new net.Socket()

      socket.setTimeout(2000)

      socket.on('connect', () => {
        socket.destroy()
        resolve({ available: true })
      })

      socket.on('error', (err: Error) => {
        if (err.message.includes('ECONNREFUSED')) {
          resolve({
            available: false,
            error: `Port ${port} is not accessible. Make sure your service is running.`,
          })
        } else {
          resolve({
            available: false,
            error: `Cannot connect to ${host}:${port} - ${err.message}`,
          })
        }
      })

      socket.on('timeout', () => {
        socket.destroy()
        resolve({
          available: false,
          error: `Connection to ${host}:${port} timed out`,
        })
      })

      socket.connect(port, host)
    })
  }

  /**
   * Validate subdomain format
   */
  validateSubdomain(subdomain: string): { valid: boolean; error?: string } {
    if (!subdomain) {
      return { valid: true }
    }

    // Check length (localtunnel limit is ~63 chars)
    if (subdomain.length < 4 || subdomain.length > 63) {
      return {
        valid: false,
        error: 'Subdomain must be between 4 and 63 characters',
      }
    }

    // Check valid characters (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
      return {
        valid: false,
        error: 'Subdomain can only contain letters, numbers, and hyphens',
      }
    }

    // Check start/end with hyphen
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      return {
        valid: false,
        error: 'Subdomain cannot start or end with a hyphen',
      }
    }

    return { valid: true }
  }

  // -------------------------------------------------------------------------
  // Tunnel Management
  // -------------------------------------------------------------------------

  /**
   * Get all tunnels
   */
  getAllTunnels(): Tunnel[] {
    return Array.from(this.tunnels.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  /**
   * Get tunnel by ID
   */
  getTunnel(id: string): Tunnel | undefined {
    return this.tunnels.get(id)
  }

  /**
   * Get tunnels by target type and ID
   */
  getTunnelsByTarget(targetType: TunnelTargetType, targetId: string): Tunnel[] {
    return this.getAllTunnels().filter(t => t.targetType === targetType && t.targetId === targetId)
  }

  /**
   * Get active tunnels count
   */
  getActiveCount(): number {
    return Array.from(this.tunnels.values()).filter(t => t.status === 'active').length
  }

  /**
   * Get tunnel logs
   */
  getTunnelLogs(id: string): string[] {
    return this.processes.get(id)?.logs || []
  }

  // -------------------------------------------------------------------------
  // Tunnel Creation & Control
  // -------------------------------------------------------------------------

  /**
   * Create a new tunnel
   */
  async createTunnel(input: CreateTunnelInput): Promise<Tunnel> {
    const id = crypto.randomUUID()
    const name = input.name || `tunnel-${input.localPort}`
    const localHost = input.localHost || 'localhost'

    // Validate subdomain
    if (input.subdomain) {
      const validation = this.validateSubdomain(input.subdomain)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
    }

    // Check port availability
    const portCheck = await this.checkPortAvailability(input.localPort, localHost)
    if (!portCheck.available) {
      throw new Error(portCheck.error)
    }

    const tunnel: Tunnel = {
      id,
      name,
      status: 'creating',
      localPort: input.localPort,
      localHost,
      targetType: input.targetType,
      targetId: input.targetId,
      publicUrl: '',
      subdomain: input.subdomain,
      createdAt: new Date(),
    }

    this.tunnels.set(id, tunnel)
    this.restartAttempts.set(id, 0)

    this.emit('tunnelCreated', {
      type: 'created',
      tunnelId: id,
      timestamp: new Date(),
      data: { tunnel },
    })

    // Start the tunnel immediately
    await this.startTunnel(id, input.subdomain)

    return this.tunnels.get(id)!
  }

  /**
   * Start a tunnel using localtunnel
   */
  async startTunnel(id: string, subdomain?: string): Promise<void> {
    const tunnel = this.tunnels.get(id)
    if (!tunnel) {
      throw new Error(`Tunnel ${id} not found`)
    }

    // Check if already running
    if (this.processes.has(id)) {
      console.log(`[TunnelManager] Tunnel ${id} is already running`)
      return
    }

    // Check port availability before starting
    const portCheck = await this.checkPortAvailability(tunnel.localPort, tunnel.localHost)
    if (!portCheck.available) {
      tunnel.status = 'error'
      tunnel.errorMessage = portCheck.error
      this.emit('tunnelError', {
        type: 'error',
        tunnelId: id,
        timestamp: new Date(),
        data: { error: portCheck.error },
      })
      throw new Error(portCheck.error)
    }

    tunnel.status = 'creating'
    this.emit('tunnelStarting', { type: 'created', tunnelId: id, timestamp: new Date() })

    try {
      // Build localtunnel command
      const args = [
        '--port',
        tunnel.localPort.toString(),
        '--local-host',
        tunnel.localHost,
        '--print-requests', // Log incoming requests
      ]

      if (subdomain) {
        args.push('--subdomain', subdomain)
      }

      // Spawn localtunnel process
      const ltProcess = spawn('npx', ['localtunnel', ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
      })

      const logs: string[] = []
      let publicUrl: string | null = null
      let errorOutput = ''

      // Handle stdout for URL detection and request logging
      ltProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString()
        logs.push(`[${new Date().toISOString()}] ${output.trim()}`)

        // Keep only last 100 log lines
        if (logs.length > 100) {
          logs.shift()
        }

        // Extract public URL from output
        const urlMatch = output.match(/(https?:\/\/[^\s]+\.loca\.lt)/)
        if (urlMatch && !publicUrl) {
          publicUrl = urlMatch[1]
          tunnel.publicUrl = publicUrl
          tunnel.status = 'active'
          tunnel.startedAt = new Date()
          tunnel.errorMessage = undefined
          tunnel.metadata = {
            ...tunnel.metadata,
            tunnelPid: ltProcess.pid || undefined,
          }

          // Reset restart attempts on successful connection
          this.restartAttempts.set(id, 0)
          tunnel.metadata = {
            ...tunnel.metadata,
            restartAttempts: 0,
          }

          this.emit('tunnelStarted', {
            type: 'started',
            tunnelId: id,
            timestamp: new Date(),
            data: { publicUrl },
          })

          console.log(`[TunnelManager] Tunnel ${id} started: ${publicUrl}`)
        }
      })

      // Handle stderr for error detection
      ltProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString()
        errorOutput += output
        logs.push(`[${new Date().toISOString()}] ERROR: ${output.trim()}`)
        console.error(`[Tunnel ${id} Error] ${output.trim()}`)
      })

      // Handle process exit
      ltProcess.on('exit', code => {
        console.log(`[TunnelManager] Tunnel ${id} process exited with code ${code}`)

        this.processes.delete(id)

        if (code !== 0 && tunnel.status !== 'closed') {
          tunnel.status = 'error'
          tunnel.errorMessage = errorOutput || `Process exited with code ${code}`
          this.emit('tunnelError', {
            type: 'error',
            tunnelId: id,
            timestamp: new Date(),
            data: { error: tunnel.errorMessage },
          })

          // Attempt auto-restart
          this.attemptRestart(id, subdomain)
        } else if (tunnel.status !== 'closed') {
          tunnel.status = 'closed'
          tunnel.stoppedAt = new Date()
          this.emit('tunnelClosed', { type: 'closed', tunnelId: id, timestamp: new Date() })
        }
      })

      // Handle process error
      ltProcess.on('error', error => {
        console.error(`[TunnelManager] Tunnel ${id} process error:`, error)
        tunnel.status = 'error'
        tunnel.errorMessage = error.message
        this.processes.delete(id)
        this.emit('tunnelError', {
          type: 'error',
          tunnelId: id,
          timestamp: new Date(),
          data: { error: error.message },
        })

        // Attempt auto-restart
        this.attemptRestart(id, subdomain)
      })

      // Store process reference
      this.processes.set(id, {
        process: ltProcess,
        tunnel,
        logs,
      })

      // Wait for tunnel to be ready (with timeout)
      await this.waitForTunnelReady(id, 30000)
    } catch (error) {
      tunnel.status = 'error'
      tunnel.errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emit('tunnelError', {
        type: 'error',
        tunnelId: id,
        timestamp: new Date(),
        data: { error: tunnel.errorMessage },
      })
      throw error
    }
  }

  /**
   * Attempt to restart a tunnel after failure
   */
  private async attemptRestart(id: string, subdomain?: string): Promise<void> {
    const attempts = this.restartAttempts.get(id) || 0

    if (attempts >= this.maxRestartAttempts) {
      console.log(`[TunnelManager] Max restart attempts reached for tunnel ${id}`)
      const tunnel = this.tunnels.get(id)
      if (tunnel) {
        tunnel.status = 'error'
        tunnel.errorMessage = `Tunnel failed after ${this.maxRestartAttempts} restart attempts`
      }
      return
    }

    const newAttempts = attempts + 1
    this.restartAttempts.set(id, newAttempts)

    // Update tunnel metadata
    const tunnel = this.tunnels.get(id)
    if (tunnel) {
      tunnel.metadata = {
        ...tunnel.metadata,
        restartAttempts: newAttempts,
      }
    }

    console.log(
      `[TunnelManager] Attempting to restart tunnel ${id} (attempt ${newAttempts}/${this.maxRestartAttempts})`
    )

    // Wait before restarting
    await new Promise(resolve => setTimeout(resolve, this.restartDelay))

    try {
      await this.startTunnel(id, subdomain)
    } catch (error) {
      console.error(`[TunnelManager] Restart failed for tunnel ${id}:`, error)
    }
  }

  /**
   * Stop a tunnel
   */
  async stopTunnel(id: string): Promise<void> {
    const tunnel = this.tunnels.get(id)
    if (!tunnel) {
      throw new Error(`Tunnel ${id} not found`)
    }

    const processInfo = this.processes.get(id)
    if (processInfo) {
      console.log(`[TunnelManager] Stopping tunnel ${id}`)

      // Kill the process
      processInfo.process.kill('SIGTERM')

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (!processInfo.process.killed) {
          processInfo.process.kill('SIGKILL')
        }
      }, 5000)

      this.processes.delete(id)
    }

    tunnel.status = 'closed'
    tunnel.stoppedAt = new Date()
    tunnel.errorMessage = undefined
    this.restartAttempts.set(id, 0)

    this.emit('tunnelClosed', { type: 'closed', tunnelId: id, timestamp: new Date() })
  }

  /**
   * Delete a tunnel
   */
  async deleteTunnel(id: string): Promise<void> {
    const tunnel = this.tunnels.get(id)
    if (!tunnel) {
      throw new Error(`Tunnel ${id} not found`)
    }

    // Stop if running
    if (tunnel.status === 'active' || tunnel.status === 'creating') {
      await this.stopTunnel(id)
    }

    this.tunnels.delete(id)
    this.restartAttempts.delete(id)
    this.processes.delete(id)

    this.emit('tunnelDeleted', { type: 'closed', tunnelId: id, timestamp: new Date() })
  }

  /**
   * Start all stopped tunnels
   */
  async startAll(): Promise<void> {
    const stoppedTunnels = this.getAllTunnels().filter(
      t => t.status === 'closed' || t.status === 'error'
    )

    for (const tunnel of stoppedTunnels) {
      try {
        await this.startTunnel(tunnel.id, tunnel.subdomain)
      } catch (error) {
        console.error(`[TunnelManager] Failed to start tunnel ${tunnel.id}:`, error)
      }
    }
  }

  /**
   * Stop all active tunnels
   */
  async stopAll(): Promise<void> {
    const activeTunnels = this.getAllTunnels().filter(
      t => t.status === 'active' || t.status === 'creating'
    )

    for (const tunnel of activeTunnels) {
      try {
        await this.stopTunnel(tunnel.id)
      } catch (error) {
        console.error(`[TunnelManager] Failed to stop tunnel ${tunnel.id}:`, error)
      }
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private async waitForTunnelReady(id: string, timeout: number): Promise<void> {
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const tunnel = this.tunnels.get(id)

        if (!tunnel) {
          clearInterval(checkInterval)
          reject(new Error('Tunnel was deleted'))
          return
        }

        if (tunnel.status === 'active') {
          clearInterval(checkInterval)
          resolve()
          return
        }

        if (tunnel.status === 'error') {
          clearInterval(checkInterval)
          reject(new Error(tunnel.errorMessage || 'Tunnel failed to start'))
          return
        }

        if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval)
          reject(new Error('Tunnel startup timeout'))
        }
      }, 100)
    })
  }

  private cleanupAll(): void {
    console.log('[TunnelManager] Cleaning up all tunnels...')

    for (const [id, processInfo] of this.processes) {
      try {
        processInfo.process.kill('SIGTERM')
      } catch (error) {
        console.error(`[TunnelManager] Error killing tunnel ${id}:`, error)
      }
    }

    this.processes.clear()
  }

  // -------------------------------------------------------------------------
  // Health Check
  // -------------------------------------------------------------------------

  async checkTunnelHealth(id: string): Promise<{ ok: boolean; url?: string; error?: string }> {
    const tunnel = this.tunnels.get(id)
    if (!tunnel) {
      return { ok: false, error: 'Tunnel not found' }
    }

    if (tunnel.status !== 'active') {
      return { ok: false, error: `Tunnel is ${tunnel.status}` }
    }

    // Check if process is still running
    const processInfo = this.processes.get(id)
    if (!processInfo || processInfo.process.killed) {
      tunnel.status = 'error'
      tunnel.errorMessage = 'Process is not running'
      return { ok: false, error: 'Process is not running' }
    }

    return { ok: true, url: tunnel.publicUrl }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const tunnelManager = new TunnelManager()
