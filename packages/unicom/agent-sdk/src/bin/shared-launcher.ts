import process from 'node:process'

import type { UnicomEvent } from '@the-abyss/unicom-core'

import type { LaunchClaudeCodeUnicomOptions, LaunchCodexUnicomOptions } from '../index.js'
import type { UnicomAgentRuntimeHandle } from '../launcher.js'
import { buildWakeAcknowledgement, eventMentionsAliases, getMessageBody } from '../monitoring.js'

type LaunchOptions = LaunchCodexUnicomOptions | LaunchClaudeCodeUnicomOptions

type LaunchFunction = (options: LaunchOptions) => Promise<UnicomAgentRuntimeHandle>

export interface AgentLauncherCliDefinition {
  agentLabel: string
  launch: LaunchFunction
  defaultAliases: string[]
  defaultIntroduction: string
}

interface ParsedArgs {
  [key: string]: string | boolean | undefined
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token?.startsWith('--')) {
      continue
    }

    const trimmed = token.slice(2)
    if (trimmed === 'help') {
      parsed.help = true
      continue
    }

    if (trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=')
      parsed[key] = rest.join('=')
      continue
    }

    const nextToken = argv[index + 1]
    if (!nextToken || nextToken.startsWith('--')) {
      parsed[trimmed] = true
      continue
    }

    parsed[trimmed] = nextToken
    index += 1
  }

  return parsed
}

function readStringOption(
  args: ParsedArgs,
  key: string,
  fallback?: string,
  envKey?: string
): string | undefined {
  const argValue = args[key]
  if (typeof argValue === 'string' && argValue.trim()) {
    return argValue.trim()
  }

  const envValue = envKey ? process.env[envKey]?.trim() : undefined
  if (envValue) {
    return envValue
  }

  return fallback
}

function readBooleanOption(args: ParsedArgs, key: string, envKey?: string): boolean {
  const argValue = args[key]
  if (typeof argValue === 'boolean') {
    return argValue
  }

  const envValue = envKey ? process.env[envKey] : undefined
  return envValue === '1' || envValue === 'true'
}

function readNumberOption(
  args: ParsedArgs,
  key: string,
  fallback: number,
  envKey?: string
): number {
  const candidate = readStringOption(args, key, undefined, envKey)
  if (!candidate) {
    return fallback
  }

  const parsed = Number(candidate)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function readAliases(args: ParsedArgs, defaults: string[]): string[] {
  const raw = readStringOption(args, 'aliases', undefined, 'UNICOM_WAKE_ALIASES')
  if (!raw) {
    return defaults
  }

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function printHelp(definition: AgentLauncherCliDefinition): void {
  const aliasText = definition.defaultAliases.join(', ')
  console.log(`${definition.agentLabel} UNICOM launcher`)
  console.log('')
  console.log('Required:')
  console.log('  --room-id <id>              Room id yang akan dimonitor')
  console.log('')
  console.log('Optional:')
  console.log('  --base-url <url>            Default: http://127.0.0.1:4318')
  console.log('  --poll-interval-ms <ms>     Default: 1000')
  console.log(`  --aliases <csv>             Default: ${aliasText}`)
  console.log('  --introduction <text>       Pesan online awal saat join room')
  console.log('  --catch-up                  Proses history saat boot, jangan prime watcher')
  console.log('  --help                      Tampilkan bantuan ini')
  console.log('')
  console.log('Environment fallback:')
  console.log('  UNICOM_ROOM_ID, UNICOM_BASE_URL, UNICOM_POLL_INTERVAL_MS, UNICOM_WAKE_ALIASES')
}

function isWakeEvent(event: UnicomEvent, aliases: string[]): boolean {
  return eventMentionsAliases(event, aliases)
}

export async function runAgentLauncher(definition: AgentLauncherCliDefinition): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp(definition)
    return
  }

  const roomId = readStringOption(args, 'room-id', undefined, 'UNICOM_ROOM_ID')
  if (!roomId) {
    printHelp(definition)
    throw new Error('UNICOM room id is required. Pass --room-id or set UNICOM_ROOM_ID.')
  }

  const baseUrl = readStringOption(args, 'base-url', 'http://127.0.0.1:4318', 'UNICOM_BASE_URL')
  const pollIntervalMs = readNumberOption(args, 'poll-interval-ms', 1000, 'UNICOM_POLL_INTERVAL_MS')
  const aliases = readAliases(args, definition.defaultAliases)
  const introduction = readStringOption(
    args,
    'introduction',
    definition.defaultIntroduction,
    'UNICOM_INTRODUCTION'
  )
  const catchUp = readBooleanOption(args, 'catch-up', 'UNICOM_CATCH_UP')

  const runtime = await definition.launch({
    roomId,
    baseUrl,
    pollIntervalMs,
    introduction,
    primeRoomHistory: !catchUp,
    onEvents: async ({ agent }, events) => {
      for (const event of events) {
        if (!isWakeEvent(event, aliases)) {
          continue
        }

        const body = getMessageBody(event)
        if (!body) {
          continue
        }

        console.log(
          `[${definition.agentLabel}] wake mention detected from ${event.actor.displayName}: ${body}`
        )
        await agent.sendNote(buildWakeAcknowledgement(definition.agentLabel, body), roomId)
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[${definition.agentLabel}] watcher error: ${message}`)
    },
  })

  console.log(
    `[${definition.agentLabel}] monitoring room ${roomId} via ${baseUrl} with aliases: ${aliases.join(', ')}`
  )

  const stop = () => {
    runtime.stop()
    console.log(`[${definition.agentLabel}] stopped.`)
    process.exit(0)
  }

  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)

  await new Promise<void>(() => {})
}
