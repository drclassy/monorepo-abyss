import type { UnicomActor, UnicomEvent } from '@the-abyss/unicom-core'

import { createUnicomAgent } from './create-agent.js'
import {
  createHttpUnicomAgentTransport,
  type CreateHttpUnicomAgentTransportOptions,
} from './http-transport.js'
import { watchRoomEvents } from './room-watcher.js'
import type { UnicomReadableAgentTransport } from './transport.js'
import type { CreateUnicomAgentOptions } from './types.js'

type UnicomAgentInstance = ReturnType<typeof createUnicomAgent>

export interface LaunchUnicomAgentOptions
  extends Omit<CreateUnicomAgentOptions, 'transport'>, CreateHttpUnicomAgentTransportOptions {
  roomId: string
  transport?: UnicomReadableAgentTransport
  introduction?: string
  pollIntervalMs?: number
  primeRoomHistory?: boolean
  onEvents?: (runtime: UnicomAgentRuntimeHandle, events: UnicomEvent[]) => void | Promise<void>
  onError?: (error: unknown) => void
}

export interface UnicomAgentRuntimeHandle {
  roomId: string
  actor: UnicomActor
  agent: UnicomAgentInstance
  stop(): void
}

export async function launchUnicomAgent(
  options: LaunchUnicomAgentOptions
): Promise<UnicomAgentRuntimeHandle> {
  const transport =
    options.transport ??
    createHttpUnicomAgentTransport({
      baseUrl: options.baseUrl,
      fetchImpl: options.fetchImpl,
    })
  const agent = createUnicomAgent({
    id: options.id,
    displayName: options.displayName,
    role: options.role,
    capabilities: options.capabilities,
    transport,
    createId: options.createId,
    now: options.now,
  })
  let stopWatching = () => {}
  let stopped = false

  const runtime: UnicomAgentRuntimeHandle = {
    roomId: options.roomId,
    actor: agent.actor,
    agent,
    stop() {
      if (stopped) {
        return
      }

      stopped = true
      stopWatching()
    },
  }

  await agent.register()
  await agent.joinRoom(options.roomId)

  if (options.introduction) {
    await agent.sendNote(options.introduction, options.roomId)
  }

  if (options.onEvents) {
    stopWatching = watchRoomEvents(
      transport,
      options.roomId,
      async (events) => {
        const inboundEvents = events.filter((event) => event.actor.id !== runtime.actor.id)

        if (inboundEvents.length === 0) {
          return
        }

        await options.onEvents?.(runtime, inboundEvents)
      },
      {
        pollIntervalMs: options.pollIntervalMs,
        prime: options.primeRoomHistory,
        onError: options.onError,
      }
    )
  }

  return runtime
}
