/**
 * PORTAL Sentra — Process Manager
 * Manages local server processes using Node.js child_process
 * Single Developer Workstation Edition
 */

import 'server-only'

import { type ChildProcess, spawn } from 'child_process'
import { EventEmitter } from 'events'
import { existsSync, statSync } from 'fs'
import { normalize, resolve } from 'path'
import type { LogEntry, ProcessStatus, ServerConfig, ServerProcess } from '@/types'
import { LogRepository, ProjectRepository } from './db'

// ============================================================================
// Path Validation Utility
// ============================================================================

interface PathValidationResult {
  valid: boolean
  error?: string
  resolvedPath?: string
}

// ============================================================================
// Safe Logging Helper
// ============================================================================

function safeLogPersist(projectId: string, type: LogEntry['type'], message: string): void {
  try {
    LogRepository.create(projectId, type, message)
  } catch (error) {
    // Log to stderr as fallback - don't throw to avoid breaking process management
    console.error(`[ProcessManager] Failed to persist log to database:`, {
      projectId,
      type,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

function validateProjectPath(inputPath: string): PathValidationResult {
  try {
    const resolved = resolve(inputPath)

    // Ensure path exists
    if (!existsSync(resolved)) {
      return { valid: false, error: 'Project path does not exist' }
    }

    // Ensure it's a directory
    const stats = statSync(resolved)
    if (!stats.isDirectory()) {
      return { valid: false, error: 'Project path is not a directory' }
    }

    // Security: ensure path is within project or monorepo (avoid homedir() during build)
    const cwd = process.cwd()
    const normalizedResolved = normalize(resolved)
    const normalizedCwd = normalize(cwd)
    const monorepoMatch = normalizedCwd.match(/^(.+?)[/\\]app[/\\]sentra-portal/i)
    const monorepoRoot = monorepoMatch ? monorepoMatch[1] : normalizedCwd

    if (
      !normalizedResolved.startsWith(normalizedCwd) &&
      !normalizedResolved.startsWith(monorepoRoot)
    ) {
      return { valid: false, error: 'Project path must be within workspace' }
    }

    return { valid: true, resolvedPath: resolved }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid path',
    }
  }
}

// ============================================================================
// Types
// ============================================================================

interface ManagedProcess extends ServerProcess {
  process: ChildProcess
  stdoutBuffer: string
  stderrBuffer: string
}

interface ProcessStartResult {
  success: boolean
  process?: ManagedProcess
  error?: string
}

// ============================================================================
// Process Manager Class
// ============================================================================

class ProcessManager extends EventEmitter {
  private processes = new Map<string, ManagedProcess>()
  private projectProcessMap = new Map<string, string>() // projectId -> processId

  // -------------------------------------------------------------------------
  // Core Operations
  // -------------------------------------------------------------------------

  async startServer(projectId: string, config: ServerConfig): Promise<ProcessStartResult> {
    // Validate project path (security)
    const pathValidation = validateProjectPath(config.cwd)
    if (!pathValidation.valid) {
      return {
        success: false,
        error: pathValidation.error || 'Invalid project path',
      }
    }

    // Check if project already has a running process
    const existingProcessId = this.projectProcessMap.get(projectId)
    if (existingProcessId) {
      const existing = this.processes.get(existingProcessId)
      if (existing && existing.status === 'running') {
        return {
          success: false,
          error: 'Server is already running for this project',
        }
      }
    }

    // Check port availability
    const portAvailable = await this.isPortAvailable(config.port)
    if (!portAvailable) {
      return { success: false, error: `Port ${config.port} is already in use` }
    }

    try {
      const processId = `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Update project status to starting
      ProjectRepository.updateStatus(projectId, 'starting')
      this.emit('statusChange', { projectId, status: 'starting' as const })

      // Spawn the process
      const childProcess = spawn(config.command, {
        cwd: config.cwd,
        env: { ...process.env, ...config.env, PORT: config.port.toString() },
        shell: true,
        detached: false,
        windowsHide: true, // Hide console window on Windows
      })

      const managedProcess: ManagedProcess = {
        id: processId,
        projectId,
        pid: childProcess.pid!,
        port: config.port,
        status: 'starting',
        startTime: new Date(),
        logs: [],
        process: childProcess,
        stdoutBuffer: '',
        stderrBuffer: '',
      }

      this.setupProcessHandlers(managedProcess)
      this.processes.set(processId, managedProcess)
      this.projectProcessMap.set(projectId, processId)

      // Wait for server to be ready
      const ready = await this.waitForServerReady(config.port, 30000)

      if (ready) {
        managedProcess.status = 'running'
        ProjectRepository.updateStatus(projectId, 'running', childProcess.pid!)
        this.emit('statusChange', {
          projectId,
          status: 'running' as const,
          processId,
        })

        return { success: true, process: managedProcess }
      } else {
        // Server didn't become ready in time
        this.killProcess(processId, 'SIGTERM')
        return {
          success: false,
          error: `Server failed to start on port ${config.port} within 30 seconds`,
        }
      }
    } catch (error) {
      ProjectRepository.updateStatus(projectId, 'error')
      this.emit('statusChange', { projectId, status: 'error' as const })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start server',
      }
    }
  }

  stopServer(projectId: string, signal: NodeJS.Signals = 'SIGTERM'): boolean {
    const processId = this.projectProcessMap.get(projectId)
    if (!processId) {
      return false
    }

    const managedProcess = this.processes.get(processId)
    if (!managedProcess) {
      return false
    }

    managedProcess.status = 'stopping'
    ProjectRepository.updateStatus(projectId, 'stopping')
    this.emit('statusChange', { projectId, status: 'stopping' as const })

    return this.killProcess(processId, signal)
  }

  private killProcess(processId: string, signal: NodeJS.Signals): boolean {
    const managedProcess = this.processes.get(processId)
    if (!managedProcess) return false

    const { process, projectId } = managedProcess

    // Try graceful shutdown first
    process.kill(signal)

    // Force kill after timeout
    setTimeout(() => {
      if (!process.killed) {
        process.kill('SIGKILL')
      }
    }, 5000)

    return true
  }

  // -------------------------------------------------------------------------
  // Process Handlers
  // -------------------------------------------------------------------------

  private setupProcessHandlers(managedProcess: ManagedProcess): void {
    const { process, projectId, id: processId } = managedProcess

    // stdout handler
    process.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString()
      managedProcess.stdoutBuffer += chunk

      // Process complete lines
      const lines = managedProcess.stdoutBuffer.split('\n')
      managedProcess.stdoutBuffer = lines.pop() || '' // Keep incomplete line

      for (const line of lines) {
        if (line.trim()) {
          const logEntry: LogEntry = {
            projectId,
            type: 'stdout',
            message: line,
            timestamp: new Date(),
          }
          managedProcess.logs.push(logEntry)

          // Persist to database (fire and forget)
          safeLogPersist(projectId, 'stdout', line)

          // Emit for real-time updates
          this.emit('log', {
            processId,
            projectId,
            log: line,
            type: 'stdout' as const,
          })
        }
      }
    })

    // stderr handler
    process.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString()
      managedProcess.stderrBuffer += chunk

      const lines = managedProcess.stderrBuffer.split('\n')
      managedProcess.stderrBuffer = lines.pop() || ''

      for (const line of lines) {
        if (line.trim()) {
          const logEntry: LogEntry = {
            projectId,
            type: 'stderr',
            message: line,
            timestamp: new Date(),
          }
          managedProcess.logs.push(logEntry)

          safeLogPersist(projectId, 'stderr', line)

          this.emit('log', {
            processId,
            projectId,
            log: line,
            type: 'stderr' as const,
          })
        }
      }
    })

    // exit handler
    process.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      managedProcess.status = code === 0 ? 'stopped' : 'error'

      // Flush remaining buffer
      if (managedProcess.stdoutBuffer.trim()) {
        safeLogPersist(projectId, 'stdout', managedProcess.stdoutBuffer)
      }
      if (managedProcess.stderrBuffer.trim()) {
        safeLogPersist(projectId, 'stderr', managedProcess.stderrBuffer)
      }

      // Update database
      ProjectRepository.updateStatus(projectId, managedProcess.status, null)

      // Cleanup
      this.processes.delete(processId)
      this.projectProcessMap.delete(projectId)

      // Emit events
      this.emit('statusChange', { projectId, status: managedProcess.status })
      this.emit('exit', { processId, projectId, code, signal })
    })

    // error handler
    process.on('error', (error: Error) => {
      managedProcess.status = 'error'
      ProjectRepository.updateStatus(projectId, 'error')

      const errorMessage = `Process error: ${error.message}`
      safeLogPersist(projectId, 'system', errorMessage)

      this.emit('error', { processId, projectId, error: errorMessage })
    })
  }

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  getProcessById(processId: string): ServerProcess | undefined {
    const managed = this.processes.get(processId)
    if (!managed) return undefined

    const { process, stdoutBuffer, stderrBuffer, ...serverProcess } = managed
    return serverProcess
  }

  getProcessByProject(projectId: string): ServerProcess | undefined {
    const processId = this.projectProcessMap.get(projectId)
    if (!processId) return undefined
    return this.getProcessById(processId)
  }

  getAllRunning(): ServerProcess[] {
    return Array.from(this.processes.values())
      .filter(p => p.status === 'running')
      .map(({ process, stdoutBuffer, stderrBuffer, ...serverProcess }) => serverProcess)
  }

  getRecentLogs(projectId: string, limit: number = 100): string[] {
    const processId = this.projectProcessMap.get(projectId)
    if (!processId) return []

    const managedProcess = this.processes.get(processId)
    if (!managedProcess) return []

    return managedProcess.logs.slice(-limit).map(log => log.message)
  }

  // -------------------------------------------------------------------------
  // Health Checks
  // -------------------------------------------------------------------------

  private async isPortAvailable(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        signal: AbortSignal.timeout(500),
      })
      return !response.ok // If we get a response, port is in use
    } catch {
      return true // No response means port is available
    }
  }

  private async waitForServerReady(port: number, timeoutMs: number): Promise<boolean> {
    const startTime = Date.now()
    const checkInterval = 500

    while (Date.now() - startTime < timeoutMs) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 1000)

        const response = await fetch(`http://localhost:${port}/health`, {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          return true
        }
      } catch {
        // Server not ready yet, continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval))
    }

    return false
  }

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  async shutdownAll(): Promise<void> {
    const stopPromises = Array.from(this.processes.entries()).map(([processId, managedProcess]) => {
      return new Promise<void>(resolve => {
        const timeout = setTimeout(() => {
          // Force kill if graceful shutdown fails
          managedProcess.process.kill('SIGKILL')
          resolve()
        }, 10000)

        managedProcess.process.once('exit', () => {
          clearTimeout(timeout)
          resolve()
        })

        managedProcess.process.kill('SIGTERM')
      })
    })

    await Promise.all(stopPromises)
    this.processes.clear()
    this.projectProcessMap.clear()
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const processManager = new ProcessManager()

// Handle process exit - cleanup all child processes
process.on('exit', () => {
  processManager.shutdownAll()
})

process.on('SIGINT', async () => {
  await processManager.shutdownAll()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await processManager.shutdownAll()
  process.exit(0)
})
