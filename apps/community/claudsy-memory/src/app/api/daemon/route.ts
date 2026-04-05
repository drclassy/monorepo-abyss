import { NextRequest, NextResponse } from 'next/server'
import {
  getDaemonStatus,
  startDaemon,
  stopDaemon,
  validateAgentName,
  validateDaemonMode,
  validateIntervalSeconds,
} from '@/lib/engine'

export async function GET() {
  return NextResponse.json({ daemon: getDaemonStatus() })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      agent: string
      mode?: string
      intervalSeconds?: number
    }

    const agent = body.agent
    const mode = body.mode ?? 'full'
    const intervalSeconds = body.intervalSeconds ?? 300

    if (!validateAgentName(agent)) {
      return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
    }

    if (!validateDaemonMode(mode)) {
      return NextResponse.json({ error: 'Invalid daemon mode' }, { status: 400 })
    }

    if (!validateIntervalSeconds(intervalSeconds)) {
      return NextResponse.json({ error: 'Invalid daemon interval' }, { status: 400 })
    }

    const result = await startDaemon(agent, mode, intervalSeconds)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const status = message.includes('already running') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE() {
  try {
    const result = await stopDaemon()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
