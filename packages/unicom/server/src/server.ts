import { randomUUID } from 'node:crypto'
import http from 'node:http'

import { UnicomEventSchema, type UnicomActor } from '@the-abyss/unicom-core'

import { SocketIoTransportAdapter } from './realtime/socket-io-transport.js'
import { UnicomService } from './service/unicom-service.js'
import { decisionListFromState, evidenceListFromState, interventionListFromState } from './types.js'

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk: string) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function setCors(res: http.ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
}

function json(res: http.ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

function notFound(res: http.ServerResponse): void {
  res.writeHead(404)
  res.end()
}

function normalizeActor(input: Record<string, unknown>): UnicomActor {
  return {
    type: (input.type as UnicomActor['type']) ?? 'human',
    id: String(input.id ?? 'chief'),
    displayName: String(input.displayName ?? input.id ?? 'Chief'),
    role: typeof input.role === 'string' ? input.role : undefined,
    capabilities: Array.isArray(input.capabilities)
      ? input.capabilities.filter((value): value is string => typeof value === 'string')
      : [],
  }
}

export function createUnicomHttpServer(options: {
  port: number
  socketPath?: string
  seedDemo?: boolean
}): http.Server {
  const transport = new SocketIoTransportAdapter({ path: options.socketPath })
  const service = new UnicomService({ transport, seedDemo: options.seedDemo })

  const server = http.createServer(async (req, res) => {
    setCors(res)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const pathname = url.pathname
    const roomIdMatch = pathname.match(/^\/rooms\/([^/]+)$/)
    const roomEventsMatch = pathname.match(/^\/rooms\/([^/]+)\/events$/)
    const roomMessagesMatch = pathname.match(/^\/rooms\/([^/]+)\/messages$/)
    const roomPauseMatch = pathname.match(
      /^\/rooms\/([^/]+)\/interventions\/(pause|resume|freeze)$/
    )
    const roomDecisionMatch = pathname.match(
      /^\/rooms\/([^/]+)\/decisions\/([^/]+)\/(approve|reject)$/
    )

    try {
      if (pathname === '/health' && req.method === 'GET') {
        json(res, 200, {
          status: 'ok',
          rooms: (await service.listRooms()).length,
          agents: service.listRegisteredAgents().length,
        })
        return
      }

      if (pathname === '/agents' && req.method === 'GET') {
        json(res, 200, service.listRegisteredAgents())
        return
      }

      if (pathname === '/agents/events' && req.method === 'GET') {
        json(res, 200, await service.listAgentRegistrationEvents())
        return
      }

      if (pathname === '/agents/register' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as Record<string, unknown>
        const registered = await service.registerAgent({
          id: String(body.id),
          displayName: String(body.displayName ?? body.id),
          role: typeof body.role === 'string' ? body.role : undefined,
          capabilities: Array.isArray(body.capabilities)
            ? body.capabilities.filter((value): value is string => typeof value === 'string')
            : [],
        })
        json(res, 200, registered)
        return
      }

      if (pathname === '/rooms' && req.method === 'GET') {
        json(res, 200, await service.listRooms())
        return
      }

      if (pathname === '/rooms' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as Record<string, unknown>
        const actor = normalizeActor((body.actor as Record<string, unknown>) ?? {})
        const state = await service.createRoom({
          slug: String(body.slug ?? randomUUID()),
          title: String(body.title ?? 'New UNICOM Room'),
          description: typeof body.description === 'string' ? body.description : undefined,
          objective: typeof body.objective === 'string' ? body.objective : undefined,
          mode: body.mode as
            | 'observe'
            | 'collaborative'
            | 'approval-gated'
            | 'autonomous-safe'
            | 'clinical-safety'
            | 'freeze'
            | undefined,
          risk: body.risk as 'low' | 'medium' | 'high' | 'critical' | undefined,
          allowedPaths: Array.isArray(body.allowedPaths)
            ? body.allowedPaths.filter((value): value is string => typeof value === 'string')
            : [],
          forbiddenPaths: Array.isArray(body.forbiddenPaths)
            ? body.forbiddenPaths.filter((value): value is string => typeof value === 'string')
            : [],
          actor,
        })
        json(res, 200, state)
        return
      }

      if (roomIdMatch && req.method === 'GET') {
        const state = await service.getRoomState(roomIdMatch[1] ?? '')
        if (!state) {
          notFound(res)
          return
        }
        json(res, 200, {
          ...state,
          decisionsList: decisionListFromState(state),
          evidenceList: evidenceListFromState(state),
          interventionsList: interventionListFromState(state),
        })
        return
      }

      if (roomEventsMatch && req.method === 'GET') {
        json(res, 200, await service.getRoomEvents(roomEventsMatch[1] ?? ''))
        return
      }

      if (roomEventsMatch && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as { event: unknown }
        const event = UnicomEventSchema.parse(body.event)
        json(res, 200, await service.publishEvent(event))
        return
      }

      if (roomMessagesMatch && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as Record<string, unknown>
        const actor = normalizeActor((body.actor as Record<string, unknown>) ?? {})
        json(
          res,
          200,
          await service.sendMessage({
            roomId: roomMessagesMatch[1] ?? '',
            actor,
            body: String(body.body ?? ''),
            kind: body.kind as 'note' | 'question' | 'proposal' | 'warning' | undefined,
          })
        )
        return
      }

      if (roomPauseMatch && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as Record<string, unknown>
        const actor = normalizeActor((body.actor as Record<string, unknown>) ?? {})
        const type =
          roomPauseMatch[2] === 'pause'
            ? 'pause-room'
            : roomPauseMatch[2] === 'resume'
              ? 'resume-room'
              : 'freeze-room'
        json(
          res,
          200,
          await service.issueIntervention(type, {
            roomId: roomPauseMatch[1] ?? '',
            actor,
            note: typeof body.note === 'string' ? body.note : undefined,
          })
        )
        return
      }

      if (roomDecisionMatch && req.method === 'POST') {
        const body = JSON.parse(await readBody(req)) as Record<string, unknown>
        const actor = normalizeActor((body.actor as Record<string, unknown>) ?? {})
        const input = {
          roomId: roomDecisionMatch[1] ?? '',
          decisionId: roomDecisionMatch[2] ?? '',
          actor,
          targetEventId: typeof body.targetEventId === 'string' ? body.targetEventId : undefined,
          note: typeof body.note === 'string' ? body.note : undefined,
        }
        const result =
          roomDecisionMatch[3] === 'approve'
            ? await service.approveDecision(input)
            : await service.rejectDecision(input)
        json(res, 200, result)
        return
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected UNICOM server error'
      json(res, 400, { error: message })
      return
    }

    notFound(res)
  })

  transport.attach(server)
  server.listen(options.port)
  server.on('close', () => {
    void transport.dispose()
  })
  return server
}
