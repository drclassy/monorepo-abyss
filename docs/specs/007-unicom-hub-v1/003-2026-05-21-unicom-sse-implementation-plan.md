# UNICOM Hub v2 — SSE Real-time Discussion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace UNICOM's poll-based inbox delivery with SSE push so agents receive messages instantly without Chief acting as relay.

**Architecture:** Add `SseManager` that tracks live SSE connections per agent. Update `routeMessage` to push via SSE when the target is connected, falling back to inbox otherwise. Add `GET /subscribe/:agentId` HTTP endpoint. Thread `SseManager` through MCP tool handlers so both HTTP and MCP sends use the same delivery path.

**Tech Stack:** TypeScript · ESM · `node:http` (no new deps) · Vitest

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/sse-manager.ts` | Manage live SSE connections, push events, keepalive |
| Create | `tests/sse-manager.test.ts` | Unit tests for SseManager |
| Create | `tests/server-sse.test.ts` | Integration test for GET /subscribe/:agentId |
| Modify | `src/router.ts` | Add optional `sseManager` param, dual-path delivery |
| Modify | `tests/router.test.ts` | Add SSE delivery test with mock SseManager |
| Modify | `src/tools/send-message.ts` | Thread sseManager to routeMessage |
| Modify | `src/tools/broadcast.ts` | Thread sseManager to routeMessage |
| Modify | `src/tools/update-status.ts` | Thread sseManager to routeMessage |
| Modify | `src/tools/index.ts` | Add optional sseManager param to createTools |
| Modify | `src/server.ts` | Add GET /subscribe, inject sseManager everywhere |
| Modify | `src/index.ts` | Export SseManager and createSseManager |

---

## Task 1: SseManager

**Files:**
- Create: `packages/platform/unicom/src/sse-manager.ts`
- Create: `packages/platform/unicom/tests/sse-manager.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/platform/unicom/tests/sse-manager.test.ts`:

```typescript
import http from 'node:http'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SseManager } from '../src/sse-manager.js'

function makeMockRes() {
  const written: string[] = []
  return {
    writeHead: vi.fn(),
    write: vi.fn((chunk: string) => { written.push(chunk); return true }),
    end: vi.fn(),
    on: vi.fn(),
    writableEnded: false,
    headersSent: false,
    _written: written,
  } as unknown as http.ServerResponse & { _written: string[] }
}

describe('SseManager', () => {
  let manager: SseManager

  beforeEach(() => {
    manager = new SseManager()
  })

  afterEach(() => {
    manager.dispose()
  })

  it('isConnected() returns false when no agent is registered', () => {
    expect(manager.isConnected('claude-code')).toBe(false)
  })

  it('connect() sets headers and marks agent as connected', () => {
    const res = makeMockRes()
    manager.connect('claude-code', res)
    expect(manager.isConnected('claude-code')).toBe(true)
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
      'Content-Type': 'text/event-stream',
    }))
  })

  it('push() writes SSE event to response', () => {
    const res = makeMockRes()
    manager.connect('claude-code', res)
    const pushed = manager.push('claude-code', 'message', { content: 'hello' })
    expect(pushed).toBe(true)
    const written = res._written.join('')
    expect(written).toContain('event: message')
    expect(written).toContain('"content":"hello"')
  })

  it('push() returns false when agent is not connected', () => {
    const pushed = manager.push('ghost', 'message', { content: 'hello' })
    expect(pushed).toBe(false)
  })

  it('broadcast() pushes to all connected agents except excludeId', () => {
    const resA = makeMockRes()
    const resB = makeMockRes()
    const resC = makeMockRes()
    manager.connect('a', resA)
    manager.connect('b', resB)
    manager.connect('c', resC)
    manager.broadcast('message', { content: 'hi all' }, 'a')
    expect(resA._written).toHaveLength(0)
    expect(resB._written.join('')).toContain('hi all')
    expect(resC._written.join('')).toContain('hi all')
  })

  it('disconnect() removes agent and returns false on subsequent push', () => {
    const res = makeMockRes()
    manager.connect('claude-code', res)
    manager.disconnect('claude-code')
    expect(manager.isConnected('claude-code')).toBe(false)
    expect(manager.push('claude-code', 'msg', {})).toBe(false)
  })

  it('connecting the same agentId twice closes the first connection', () => {
    const res1 = makeMockRes()
    const res2 = makeMockRes()
    manager.connect('claude-code', res1)
    manager.connect('claude-code', res2)
    expect(res1.end).toHaveBeenCalled()
    expect(manager.isConnected('claude-code')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/platform/unicom && pnpm test sse-manager
```

Expected: FAIL — `Cannot find module '../src/sse-manager.js'`

- [ ] **Step 3: Implement `src/sse-manager.ts`**

Create `packages/platform/unicom/src/sse-manager.ts`:

```typescript
import http from 'node:http'

const KEEPALIVE_INTERVAL_MS = 15_000

export class SseManager {
  private connections = new Map<string, http.ServerResponse>()
  private keepaliveTimer: NodeJS.Timeout

  constructor() {
    this.keepaliveTimer = setInterval(() => {
      for (const [, res] of this.connections) {
        res.write('event: ping\ndata: {}\n\n')
      }
    }, KEEPALIVE_INTERVAL_MS)
  }

  connect(agentId: string, res: http.ServerResponse): void {
    const existing = this.connections.get(agentId)
    if (existing) {
      existing.end()
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })

    this.connections.set(agentId, res)

    res.on('close', () => {
      if (this.connections.get(agentId) === res) {
        this.connections.delete(agentId)
      }
    })
  }

  disconnect(agentId: string): void {
    const res = this.connections.get(agentId)
    if (res) {
      res.end()
      this.connections.delete(agentId)
    }
  }

  push(agentId: string, event: string, data: unknown): boolean {
    const res = this.connections.get(agentId)
    if (!res || res.writableEnded) return false
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    return true
  }

  broadcast(event: string, data: unknown, excludeId?: string): void {
    for (const [agentId] of this.connections) {
      if (agentId !== excludeId) {
        this.push(agentId, event, data)
      }
    }
  }

  isConnected(agentId: string): boolean {
    const res = this.connections.get(agentId)
    return res !== undefined && !res.writableEnded
  }

  dispose(): void {
    clearInterval(this.keepaliveTimer)
    for (const [, res] of this.connections) {
      res.end()
    }
    this.connections.clear()
  }
}

export function createSseManager(): SseManager {
  return new SseManager()
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd packages/platform/unicom && pnpm test sse-manager
```

Expected: PASS — 7 tests pass.

- [ ] **Step 5: Typecheck**

```bash
cd packages/platform/unicom && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/platform/unicom/src/sse-manager.ts packages/platform/unicom/tests/sse-manager.test.ts
git commit -m "feat(unicom): add SseManager for live SSE connection tracking"
```

---

## Task 2: Update `routeMessage` for dual-path delivery

**Files:**
- Modify: `packages/platform/unicom/src/router.ts`
- Modify: `packages/platform/unicom/tests/router.test.ts`

- [ ] **Step 1: Replace `tests/router.test.ts` with full updated content**

Replace the entire content of `packages/platform/unicom/tests/router.test.ts`:

```typescript
import { describe, expect, it, vi } from 'vitest'

import { MessageInbox } from '../src/inbox.js'
import { AgentRegistry } from '../src/registry.js'
import { routeMessage } from '../src/router.js'
import type { SseManager } from '../src/sse-manager.js'

describe('routeMessage', () => {
  it('delivers unicast message to target inbox', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('claude-code', 'Claude Code', [])
    const msg = routeMessage(registry, inbox, 'codex', 'claude-code', 'review this')
    expect(msg.from).toBe('codex')
    expect(msg.to).toBe('claude-code')
    expect(msg.content).toBe('review this')
    expect(msg.id).toBeTruthy()
    expect(inbox.drain('claude-code')).toHaveLength(1)
  })

  it('broadcast delivers to all agents except sender', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('agent-a', 'A', [])
    registry.register('agent-b', 'B', [])
    registry.register('sender', 'Sender', [])
    routeMessage(registry, inbox, 'sender', 'broadcast', 'hi everyone')
    expect(inbox.drain('agent-a')).toHaveLength(1)
    expect(inbox.drain('agent-b')).toHaveLength(1)
    expect(inbox.drain('sender')).toHaveLength(0)
  })

  it('sets replyTo when provided', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('b', 'B', [])
    const msg = routeMessage(registry, inbox, 'a', 'b', 'reply', 'orig-id')
    expect(msg.replyTo).toBe('orig-id')
  })

  it('status_update type is preserved', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('b', 'B', [])
    const msg = routeMessage(registry, inbox, 'system', 'b', 'online', undefined, 'status_update')
    expect(msg.type).toBe('status_update')
  })
})

describe('routeMessage with SseManager', () => {
  function makeMockSse(connectedIds: string[]): SseManager {
    return {
      isConnected: vi.fn((id: string) => connectedIds.includes(id)),
      push: vi.fn(() => true),
      broadcast: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
    } as unknown as SseManager
  }

  it('pushes via SSE when target is connected, skips inbox', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    const sse = makeMockSse(['claude-code'])
    registry.register('claude-code', 'C', [])
    routeMessage(registry, inbox, 'codex', 'claude-code', 'hi', undefined, 'message', sse)
    expect(sse.push).toHaveBeenCalledWith('claude-code', 'message', expect.objectContaining({ content: 'hi' }))
    expect(inbox.drain('claude-code')).toHaveLength(0)
  })

  it('falls back to inbox when target has no SSE connection', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    const sse = makeMockSse([])
    registry.register('claude-code', 'C', [])
    routeMessage(registry, inbox, 'codex', 'claude-code', 'hi', undefined, 'message', sse)
    expect(sse.push).not.toHaveBeenCalled()
    expect(inbox.drain('claude-code')).toHaveLength(1)
  })

  it('broadcast pushes via SSE to connected agents and inbox to offline agents', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    const sse = makeMockSse(['agent-a'])
    registry.register('agent-a', 'A', [])
    registry.register('agent-b', 'B', [])
    registry.register('sender', 'S', [])
    routeMessage(registry, inbox, 'sender', 'broadcast', 'hello', undefined, 'message', sse)
    expect(sse.push).toHaveBeenCalledWith('agent-a', 'message', expect.any(Object))
    expect(inbox.drain('agent-b')).toHaveLength(1)
    expect(inbox.drain('agent-a')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run new tests — verify they fail**

```bash
cd packages/platform/unicom && pnpm test router
```

Expected: FAIL — `routeMessage` doesn't accept `sseManager` param yet.

- [ ] **Step 3: Update `src/router.ts`**

Replace the entire content of `packages/platform/unicom/src/router.ts`:

```typescript
import { randomUUID } from 'node:crypto'

import type { MessageInbox } from './inbox.js'
import type { AgentRegistry } from './registry.js'
import type { SseManager } from './sse-manager.js'
import type { UNICOMMessage } from './types.js'

export function routeMessage(
  registry: AgentRegistry,
  inbox: MessageInbox,
  from: string,
  to: string,
  content: string,
  replyTo?: string,
  type: UNICOMMessage['type'] = 'message',
  sseManager?: SseManager,
): UNICOMMessage {
  const message: UNICOMMessage = {
    id: randomUUID(),
    from,
    to,
    content,
    type,
    replyTo,
    timestamp: Date.now(),
  }

  if (to === 'broadcast') {
    for (const agent of registry.list()) {
      if (agent.id === from) continue
      if (sseManager?.isConnected(agent.id)) {
        sseManager.push(agent.id, type, message)
      } else {
        inbox.enqueue(agent.id, message)
      }
    }
  } else {
    if (sseManager?.isConnected(to)) {
      sseManager.push(to, type, message)
    } else {
      inbox.enqueue(to, message)
    }
  }

  return message
}
```

- [ ] **Step 4: Run all tests — verify all pass**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — all 29 existing tests + 3 new router tests = 32 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/platform/unicom/src/router.ts packages/platform/unicom/tests/router.test.ts
git commit -m "feat(unicom): update routeMessage for dual-path SSE/inbox delivery"
```

---

## Task 3: Thread SseManager through MCP tool handlers

**Files:**
- Modify: `packages/platform/unicom/src/tools/send-message.ts`
- Modify: `packages/platform/unicom/src/tools/broadcast.ts`
- Modify: `packages/platform/unicom/src/tools/update-status.ts`
- Modify: `packages/platform/unicom/src/tools/index.ts`

- [ ] **Step 1: Update `src/tools/send-message.ts`**

Replace entire file:

```typescript
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'
import type { SseManager } from '../sse-manager.js'
import { routeMessage } from '../router.js'

export async function handleSendMessage(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { from: string; to: string; content: string; replyTo?: string },
  sseManager?: SseManager,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const msg = routeMessage(registry, inbox, params.from, params.to, params.content, params.replyTo, 'message', sseManager)
  return { content: [{ type: 'text', text: JSON.stringify(msg) }] }
}
```

- [ ] **Step 2: Update `src/tools/broadcast.ts`**

Replace entire file:

```typescript
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'
import type { SseManager } from '../sse-manager.js'
import { routeMessage } from '../router.js'

export async function handleBroadcast(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { from: string; content: string },
  sseManager?: SseManager,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const msg = routeMessage(registry, inbox, params.from, 'broadcast', params.content, undefined, 'message', sseManager)
  return { content: [{ type: 'text', text: JSON.stringify(msg) }] }
}
```

- [ ] **Step 3: Update `src/tools/update-status.ts`**

Replace entire file:

```typescript
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'
import type { SseManager } from '../sse-manager.js'
import type { AgentStatus } from '../types.js'
import { routeMessage } from '../router.js'

export async function handleUpdateStatus(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { id: string; status: AgentStatus },
  sseManager?: SseManager,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const updated = registry.updateStatus(params.id, params.status)
  if (!updated) {
    return { content: [{ type: 'text', text: `Agent '${params.id}' not found` }] }
  }
  routeMessage(registry, inbox, 'system', 'broadcast', `${params.id} status: ${params.status}`, undefined, 'status_update', sseManager)
  return { content: [{ type: 'text', text: JSON.stringify(updated) }] }
}
```

- [ ] **Step 4: Update `src/tools/index.ts`**

Replace entire file:

```typescript
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { AgentStatusSchema } from '../types.js'
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'
import type { SseManager } from '../sse-manager.js'
import { handleRegisterAgent } from './register-agent.js'
import { handleUpdateStatus } from './update-status.js'
import { handleSendMessage } from './send-message.js'
import { handleBroadcast } from './broadcast.js'
import { handleListAgents } from './list-agents.js'
import { handleReceiveMessages } from './receive-messages.js'

export {
  handleRegisterAgent,
  handleUpdateStatus,
  handleSendMessage,
  handleBroadcast,
  handleListAgents,
  handleReceiveMessages,
}

export function createTools(
  mcp: McpServer,
  registry: AgentRegistry,
  inbox: MessageInbox,
  sseManager?: SseManager,
): void {
  mcp.tool('register_agent', 'Register this agent with UNICOM Hub', {
    id: z.string().describe('Unique agent id, e.g. "claude-code"'),
    displayName: z.string().describe('Human-readable name'),
    capabilities: z.array(z.string()).describe('Agent capabilities list'),
  }, (p) => handleRegisterAgent(registry, inbox, p))

  mcp.tool('update_status', 'Update status — auto-broadcasts to all agents', {
    id: z.string().describe('Agent id to update'),
    status: AgentStatusSchema.describe('idle | streaming | busy'),
  }, (p) => handleUpdateStatus(registry, inbox, p, sseManager))

  mcp.tool('send_message', 'Send a message to a specific agent', {
    from: z.string().describe('Sender agent id'),
    to: z.string().describe('Target agent id or "broadcast"'),
    content: z.string().describe('Message body (markdown ok)'),
    replyTo: z.string().optional().describe('Optional: id of message being replied to'),
  }, (p) => handleSendMessage(registry, inbox, p, sseManager))

  mcp.tool('broadcast', 'Send a message to all connected agents', {
    from: z.string().describe('Sender agent id'),
    content: z.string().describe('Message body'),
  }, (p) => handleBroadcast(registry, inbox, p, sseManager))

  mcp.tool('list_agents', 'List all agents with live status', {},
    () => handleListAgents(registry))

  mcp.tool('receive_messages', 'Drain pending messages for an agent (fallback for offline agents)', {
    agentId: z.string().describe('Your agent id'),
  }, (p) => handleReceiveMessages(inbox, p))
}
```

- [ ] **Step 5: Run all tests — verify all pass**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — all tests pass (tools.test.ts doesn't pass sseManager, so it tests inbox fallback path).

- [ ] **Step 6: Typecheck**

```bash
cd packages/platform/unicom && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/platform/unicom/src/tools/
git commit -m "feat(unicom): thread SseManager through MCP tool handlers"
```

---

## Task 4: Add `GET /subscribe/:agentId` to server + SSE integration test

**Files:**
- Modify: `packages/platform/unicom/src/server.ts`
- Create: `packages/platform/unicom/tests/server-sse.test.ts`

- [ ] **Step 1: Write failing SSE integration test**

Create `packages/platform/unicom/tests/server-sse.test.ts`:

```typescript
import http from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createUnicomHttpServer } from '../src/server.js'

const PORT = 59851
let server: http.Server

beforeAll(() => {
  server = createUnicomHttpServer(PORT)
})
afterAll(() => {
  server.close()
})

function subscribeAgent(agentId: string): Promise<{
  events: Array<{ event: string; data: unknown }>
  close: () => void
}> {
  return new Promise((resolve, reject) => {
    const events: Array<{ event: string; data: unknown }> = []
    const req = http.get(
      `http://localhost:${PORT}/subscribe/${agentId}`,
      { headers: { Accept: 'text/event-stream' } },
      (res) => {
        expect(res.statusCode).toBe(200)
        expect(res.headers['content-type']).toContain('text/event-stream')

        let buffer = ''
        let currentEvent = 'message'

        res.on('data', (chunk: Buffer) => {
          buffer += chunk.toString()
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              try {
                events.push({ event: currentEvent, data: JSON.parse(line.slice(6)) })
              } catch {
                events.push({ event: currentEvent, data: line.slice(6) })
              }
              currentEvent = 'message'
            }
          }
        })

        resolve({ events, close: () => req.destroy() })
      },
    )
    req.on('error', reject)
  })
}

async function post(path: string, body: string) {
  return new Promise<{ status: number; body: string }>((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let rb = ''
        res.on('data', (c: Buffer) => { rb += c.toString() })
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: rb }))
      },
    )
    req.write(body)
    req.end()
  })
}

describe('GET /subscribe/:agentId', () => {
  it('opens an SSE stream with correct headers', async () => {
    const { close } = await subscribeAgent('test-agent-headers')
    close()
  })

  it('delivers message in real-time to subscribed agent', async () => {
    const { events, close } = await subscribeAgent('agent-recv')

    await post('/send', JSON.stringify({ from: 'sender', to: 'agent-recv', content: 'hello via sse' }))
    await new Promise((r) => setTimeout(r, 50))

    close()
    const msgEvent = events.find((e) => e.event === 'message')
    expect(msgEvent).toBeDefined()
    expect((msgEvent!.data as { content: string }).content).toBe('hello via sse')
  })

  it('offline agent still receives message via inbox fallback', async () => {
    await post('/send', JSON.stringify({ from: 'x', to: 'offline-agent', content: 'queued' }))
    const { body } = await post('/receive', JSON.stringify({ agentId: 'offline-agent' }))
    const msgs = JSON.parse(body)
    expect(msgs).toHaveLength(1)
    expect(msgs[0].content).toBe('queued')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/platform/unicom && pnpm test server-sse
```

Expected: FAIL — `/subscribe` returns 404, `/receive` route doesn't exist yet.

- [ ] **Step 3: Update `src/server.ts`**

Replace entire content of `packages/platform/unicom/src/server.ts`:

```typescript
import { randomUUID } from 'node:crypto'
import http from 'node:http'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { MessageInbox } from './inbox.js'
import { AgentRegistry } from './registry.js'
import { createAgentsResource } from './resources/agents-resource.js'
import { routeMessage } from './router.js'
import { SseManager } from './sse-manager.js'
import { createTools } from './tools/index.js'

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
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
  const sseManager = new SseManager()
  const sessions = new Map<string, StreamableHTTPServerTransport>()

  const evictionTimer = registry.startHeartbeatEviction((id) => {
    inbox.clear(id)
    sseManager.disconnect(id)
  })

  const httpServer = http.createServer(async (req, res) => {
    setCors(res)

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

    const url = req.url ?? '/'

    // SSE subscribe endpoint
    if (req.method === 'GET' && url.startsWith('/subscribe/')) {
      const agentId = url.slice('/subscribe/'.length)
      if (!agentId) { res.writeHead(400); res.end(); return }
      sseManager.connect(agentId, res)
      return
    }

    // MCP Streamable HTTP endpoint
    if (url === '/mcp' || url.startsWith('/mcp?')) {
      const body = await readBody(req)
      const parsedBody = body.trim() ? (JSON.parse(body) as Record<string, unknown>) : undefined
      const sessionIdHeader = req.headers['mcp-session-id'] as string | undefined

      if (sessionIdHeader && sessions.has(sessionIdHeader)) {
        await sessions.get(sessionIdHeader)!.handleRequest(req, res, parsedBody)
        return
      }

      const sessionId = randomUUID()
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => sessionId })
      const mcp = new McpServer({ name: 'unicom', version: '0.1.0' })
      createTools(mcp, registry, inbox, sseManager)
      createAgentsResource(mcp, registry)
      await mcp.connect(transport)

      sessions.set(sessionId, transport)
      transport.onclose = () => sessions.delete(sessionId)

      await transport.handleRequest(req, res, parsedBody)
      return
    }

    // HTTP fallback endpoints
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
          from: string; to: string; content: string; replyTo?: string
        }
        const msg = routeMessage(registry, inbox, from, to, content, replyTo, 'message', sseManager)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(msg))
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON body' }))
      }
      return
    }

    // HTTP fallback for offline agent inbox drain
    if (url === '/receive' && req.method === 'POST') {
      const body = await readBody(req)
      try {
        const { agentId } = JSON.parse(body) as { agentId: string }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(inbox.drain(agentId)))
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
  httpServer.on('close', () => {
    clearInterval(evictionTimer)
    sseManager.dispose()
  })
  return httpServer
}
```

- [ ] **Step 4: Run all tests — verify all pass**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — all 32 tests + 3 new SSE integration tests = 35 tests pass.

- [ ] **Step 5: Typecheck**

```bash
cd packages/platform/unicom && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/platform/unicom/src/server.ts packages/platform/unicom/tests/server-sse.test.ts
git commit -m "feat(unicom): add GET /subscribe/:agentId SSE endpoint and POST /receive fallback"
```

---

## Task 5: Export SseManager from public index + rebuild

**Files:**
- Modify: `packages/platform/unicom/src/index.ts`

- [ ] **Step 1: Update `src/index.ts`**

Replace entire content:

```typescript
// packages/platform/unicom/src/index.ts
export type { AgentEntry, UNICOMMessage, AgentStatus } from './types.js'
export { AgentRegistry } from './registry.js'
export { MessageInbox } from './inbox.js'
export { routeMessage } from './router.js'
export { createUnicomHttpServer } from './server.js'
export { SseManager, createSseManager } from './sse-manager.js'
```

- [ ] **Step 2: Run all tests**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — all 35 tests pass.

- [ ] **Step 3: Build**

```bash
cd packages/platform/unicom && pnpm build
```

Expected: build success, no warnings.

- [ ] **Step 4: Smoke test binary with SSE**

Terminal 1:
```bash
node packages/platform/unicom/dist/bin/unicom.js --port 59849
```

Terminal 2 (listen via SSE):
```bash
curl -N -H "Accept: text/event-stream" http://localhost:59849/subscribe/codex
```

Terminal 3 (send a message):
```bash
curl -X POST http://localhost:59849/send \
  -H "Content-Type: application/json" \
  -d '{"from":"claude-code","to":"codex","content":"Halo Codex, ini diskusi langsung!"}'
```

Expected: Terminal 2 menerima event secara langsung:
```
event: message
data: {"id":"...","from":"claude-code","to":"codex","content":"Halo Codex, ini diskusi langsung!","type":"message","timestamp":...}
```

Stop server dengan Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add packages/platform/unicom/src/index.ts
git commit -m "feat(unicom): export SseManager from public index; v2 SSE real-time complete"
```

---

## Verification Summary

```bash
# 1. All tests pass
cd packages/platform/unicom && pnpm test

# 2. Typecheck clean
pnpm typecheck

# 3. Build clean
pnpm build

# 4. Live SSE smoke test (lihat Step 4 Task 5)
node dist/bin/unicom.js --port 59849
```

Expected final state: **35 tests pass**, build clean, SSE push verified live.
