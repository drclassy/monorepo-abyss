import { spawn, type ChildProcess, type SpawnOptions } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

import type { AgentMonitorId, AgentMonitorState } from '../types.js'

type ManagedMonitorStatus = 'running' | 'stopped' | 'error'

interface MonitorPreset {
  id: AgentMonitorId
  label: string
  scriptName: string
  distRelativePath: string
  aliases: string[]
  buildWakeMessage(actorName: string): string
}

interface ManagedMonitorRecord {
  roomId: string
  monitorId: AgentMonitorId
  child: ChildProcess
  status: ManagedMonitorStatus
  pid?: number
  startedAt: string
  stoppedAt?: string
  lastError?: string
}

export interface AgentMonitorController {
  listRoomMonitors(roomId: string): AgentMonitorState[]
  startRoomMonitor(roomId: string, monitorId: AgentMonitorId): Promise<AgentMonitorState>
  stopRoomMonitor(roomId: string, monitorId: AgentMonitorId): Promise<AgentMonitorState>
  buildWakeMessage(monitorId: AgentMonitorId, actorName: string): string
  dispose(): Promise<void>
}

function now(): string {
  return new Date().toISOString()
}

const MONITOR_PRESETS: Record<AgentMonitorId, MonitorPreset> = {
  codex: {
    id: 'codex',
    label: 'Codex',
    scriptName: 'codex-unicom-launcher',
    distRelativePath: path.join(
      'packages',
      'unicom',
      'agent-sdk',
      'dist',
      'bin',
      'codex-unicom-launcher.js'
    ),
    aliases: ['@codex', 'codex', 'codex-agent'],
    buildWakeMessage(actorName) {
      return `${actorName}: @codex mohon monitor UNICOM room ini dan standby.`
    },
  },
  'claude-code': {
    id: 'claude-code',
    label: 'Claude Code',
    scriptName: 'claude-code-unicom-launcher',
    distRelativePath: path.join(
      'packages',
      'unicom',
      'agent-sdk',
      'dist',
      'bin',
      'claude-code-unicom-launcher.js'
    ),
    aliases: ['@claude', '@claude-code', 'claude code', 'claude-code-agent'],
    buildWakeMessage(actorName) {
      return `${actorName}: @claude tolong bangun dan monitor UNICOM room ini juga.`
    },
  },
}

function normalizeMonitorId(value: string): AgentMonitorId {
  if (value === 'codex' || value === 'claude-code') {
    return value
  }

  throw new Error(`Unknown UNICOM monitor id: ${value}`)
}

function monitorKey(roomId: string, monitorId: AgentMonitorId): string {
  return `${roomId}:${monitorId}`
}

function pnpmCommand(): string {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
}

function pnpmSpawnOptions(repoRoot: string) {
  const options: SpawnOptions = {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    shell: process.platform === 'win32',
  }
  return options
}

function snapshotState(
  roomId: string,
  preset: MonitorPreset,
  record?: ManagedMonitorRecord
): AgentMonitorState {
  return {
    id: preset.id,
    label: preset.label,
    roomId,
    status: record?.status ?? 'stopped',
    pid: record?.pid,
    startedAt: record?.startedAt,
    stoppedAt: record?.stoppedAt,
    lastError: record?.lastError,
    aliases: preset.aliases,
  }
}

export class LocalAgentMonitorController implements AgentMonitorController {
  private readonly repoRoot: string
  private readonly getBaseUrl: () => string
  private readonly monitors = new Map<string, ManagedMonitorRecord>()

  constructor(options: { repoRoot?: string; getBaseUrl: () => string }) {
    this.repoRoot = options.repoRoot ?? process.cwd()
    this.getBaseUrl = options.getBaseUrl
  }

  listRoomMonitors(roomId: string): AgentMonitorState[] {
    return Object.values(MONITOR_PRESETS).map((preset) =>
      snapshotState(roomId, preset, this.monitors.get(monitorKey(roomId, preset.id)))
    )
  }

  async startRoomMonitor(roomId: string, rawMonitorId: AgentMonitorId): Promise<AgentMonitorState> {
    const monitorId = normalizeMonitorId(rawMonitorId)
    const preset = MONITOR_PRESETS[monitorId]
    const key = monitorKey(roomId, monitorId)
    const current = this.monitors.get(key)

    if (current && current.status === 'running' && current.child.exitCode === null) {
      return snapshotState(roomId, preset, current)
    }

    if (current) {
      this.monitors.delete(key)
    }

    await this.ensureLauncherBuild(preset)

    const child = spawn(
      pnpmCommand(),
      [
        '--filter',
        '@the-abyss/unicom-agent-sdk',
        preset.scriptName,
        '--',
        '--room-id',
        roomId,
        '--base-url',
        this.getBaseUrl(),
      ],
      pnpmSpawnOptions(this.repoRoot)
    )

    const record: ManagedMonitorRecord = {
      roomId,
      monitorId,
      child,
      status: 'running',
      pid: child.pid,
      startedAt: now(),
    }

    child.stdout?.on('data', () => {
      // Keep pipe drained; UI currently does not surface stdout.
    })
    child.stderr?.on('data', (chunk: Buffer | string) => {
      const text = chunk.toString().trim()
      if (text) {
        record.lastError = text
      }
    })
    child.on('error', (error: Error) => {
      record.status = 'error'
      record.lastError = error.message
      record.stoppedAt = now()
    })
    child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      if (record.status === 'running') {
        record.status = code === 0 || signal === 'SIGTERM' ? 'stopped' : 'error'
      }
      record.stoppedAt = now()
      if (!record.lastError && code && code !== 0) {
        record.lastError = `Launcher exited with code ${code}.`
      }
    })

    this.monitors.set(key, record)
    return snapshotState(roomId, preset, record)
  }

  async stopRoomMonitor(roomId: string, rawMonitorId: AgentMonitorId): Promise<AgentMonitorState> {
    const monitorId = normalizeMonitorId(rawMonitorId)
    const preset = MONITOR_PRESETS[monitorId]
    const key = monitorKey(roomId, monitorId)
    const current = this.monitors.get(key)

    if (!current) {
      return snapshotState(roomId, preset)
    }

    if (current.child.exitCode === null) {
      current.child.kill('SIGTERM')
    }

    current.status = 'stopped'
    current.stoppedAt = now()

    return snapshotState(roomId, preset, current)
  }

  buildWakeMessage(rawMonitorId: AgentMonitorId, actorName: string): string {
    const monitorId = normalizeMonitorId(rawMonitorId)
    return MONITOR_PRESETS[monitorId].buildWakeMessage(actorName)
  }

  async dispose(): Promise<void> {
    for (const record of this.monitors.values()) {
      if (record.child.exitCode === null) {
        record.child.kill('SIGTERM')
      }
      record.status = 'stopped'
      record.stoppedAt = now()
    }
  }

  private async ensureLauncherBuild(preset: MonitorPreset): Promise<void> {
    const distPath = path.join(this.repoRoot, preset.distRelativePath)
    if (existsSync(distPath)) {
      return
    }

    await new Promise<void>((resolve, reject) => {
      const build = spawn(
        pnpmCommand(),
        ['--filter', '@the-abyss/unicom-agent-sdk', 'build'],
        pnpmSpawnOptions(this.repoRoot)
      )

      let errorOutput = ''
      build.stderr?.on('data', (chunk: Buffer | string) => {
        errorOutput += chunk.toString()
      })

      build.on('error', reject)
      build.on('exit', (code) => {
        if (code === 0) {
          resolve()
          return
        }

        reject(new Error(errorOutput.trim() || `Failed to build ${preset.label} launcher.`))
      })
    })
  }
}
