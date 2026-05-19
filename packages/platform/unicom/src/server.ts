import { randomUUID } from 'node:crypto'
import http from 'node:http'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { MessageInbox } from './inbox.js'
import { AgentRegistry } from './registry.js'
import { createAgentsResource } from './resources/agents-resource.js'
import { routeMessage } from './router.js'
import { createTools } from './tools/index.js'

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
  })
}

function setCors(res: http.ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Session-Id')
}

export function createUnicomHttpServer(port: number): http.Server {
  const registry = new AgentRegistry()
  const inbox = new MessageInbox()
  const sessions = new Map<string, StreamableHTTPServerTransport>()

  const evictionTimer = registry.startHeartbeatEviction((id) => inbox.clear(id))

  const httpServer = http.createServer(async (req, res) => {
    setCors(res)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = req.url ?? '/'

    // MCP Streamable HTTP endpoint
    if (url === '/mcp' || url.startsWith('/mcp?')) {
      const body = await readBody(req)
      const parsedBody = body.trim() ? (JSON.parse(body) as Record<string, unknown>) : undefined
      const sessionIdHeader = req.headers['mcp-session-id'] as string | undefined

      if (sessionIdHeader && sessions.has(sessionIdHeader)) {
        const existingTransport = sessions.get(sessionIdHeader)
        if (existingTransport) {
          await existingTransport.handleRequest(req, res, parsedBody)
          return
        }
      }

      const sessionId = randomUUID()
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => sessionId })
      const mcp = new McpServer({ name: 'unicom', version: '0.1.0' })
      createTools(mcp, registry, inbox)
      createAgentsResource(mcp, registry)
      await mcp.connect(transport)

      sessions.set(sessionId, transport)
      transport.onclose = () => sessions.delete(sessionId)

      await transport.handleRequest(req, res, parsedBody)
      return
    }

    // HTTP fallback for Codex CLI
    if (url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', agents: registry.list().length }))
      return
    }

    if (url === '/agents' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(registry.list()))
      return
    }

    if (url === '/send' && req.method === 'POST') {
      const body = await readBody(req)
      try {
        const { from, to, content, replyTo } = JSON.parse(body) as {
          from: string
          to: string
          content: string
          replyTo?: string
        }
        const msg = routeMessage(registry, inbox, from, to, content, replyTo)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(msg))
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON body' }))
      }
      return
    }

    res.writeHead(404)
    res.end()
  })

  httpServer.listen(port)
  httpServer.on('close', () => clearInterval(evictionTimer))
  return httpServer
}
