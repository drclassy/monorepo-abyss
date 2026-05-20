# UNICOM Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@the-abyss/unicom` — a local MCP server hub that lets Claude Code, Roocode, and Codex CLI exchange messages through a shared registry and inbox, enabling Chief-initiated agent-to-agent communication inside Cursor IDE.

**Architecture:** A persistent Node.js HTTP server at `packages/platform/unicom/` exposes a Streamable HTTP MCP endpoint (`POST /mcp`) and three HTTP fallback endpoints (`GET /health`, `GET /agents`, `POST /send`). All agents share one in-memory `AgentRegistry` and `MessageInbox` singleton. MCP tools provide `register_agent`, `update_status`, `send_message`, `broadcast`, `list_agents`, and `receive_messages`. Claude Code and Roocode connect via `"type": "http"` in `.mcp.json`; Codex uses the HTTP fallback via `curl`.

**Tech Stack:** TypeScript · ESM · `@modelcontextprotocol/sdk` (only new dep) · Zod (existing) · Node.js `node:http` (no Express) · tsup build · vitest tests

---

## File Map

| File | Responsibility |
|---|---|
| `src/types.ts` | Zod schemas + inferred types: `AgentEntry`, `UNICOMMessage`, `AgentStatus` |
| `src/registry.ts` | In-memory `Map<id, AgentEntry>` + heartbeat eviction |
| `src/inbox.ts` | Per-agent message queue: enqueue / drain |
| `src/router.ts` | Pure function: create `UNICOMMessage` + distribute to inbox |
| `src/tools/index.ts` | Registers all 6 MCP tools on a given `McpServer` instance |
| `src/tools/register-agent.ts` | Handler for `register_agent` tool |
| `src/tools/update-status.ts` | Handler for `update_status` tool |
| `src/tools/send-message.ts` | Handler for `send_message` tool |
| `src/tools/broadcast.ts` | Handler for `broadcast` tool |
| `src/tools/list-agents.ts` | Handler for `list_agents` tool |
| `src/tools/receive-messages.ts` | Handler for `receive_messages` tool |
| `src/resources/agents-resource.ts` | MCP resource `unicom://agents` — live registry view |
| `src/server.ts` | HTTP server: MCP endpoint + HTTP fallback + session management |
| `src/index.ts` | Public exports |
| `bin/unicom.ts` | CLI entry: `node dist/bin/unicom.js --port 59849` |
| `package.json` | `@the-abyss/unicom` — build scripts, dependencies |
| `tsconfig.json` | Extends `@the-abyss/config-typescript`, outDir `dist` |
| **Modified:** `tsconfig.json` (root) | Add `"@the-abyss/unicom"` path alias |
| **Modified:** `.mcp.json` | Add `"unicom"` HTTP server entry |

---

## Task 1: Scaffold Package Structure

**Files:**
- Create: `packages/platform/unicom/package.json`
- Create: `packages/platform/unicom/tsconfig.json`
- Create: `packages/platform/unicom/src/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@the-abyss/unicom",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "bin": {
    "unicom": "./dist/bin/unicom.js"
  },
  "scripts": {
    "build": "tsup src/index.ts bin/unicom.ts --format esm --dts --no-splitting",
    "dev": "node --enable-source-maps dist/bin/unicom.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src bin --ext .ts",
    "clean": "rm -rf .turbo node_modules dist"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@the-abyss/config-typescript": "workspace:*",
    "@the-abyss/config-eslint": "workspace:*",
    "@types/node": "^25.0.0",
    "tsup": "^8.5.1",
    "vitest": "^4.1.5"
  },
  "sentra:tier": "private-product"
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@the-abyss/config-typescript/tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": ".",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false
  },
  "include": ["src", "bin"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create src/index.ts stub**

```typescript
// packages/platform/unicom/src/index.ts
export type { AgentEntry, UNICOMMessage, AgentStatus } from './types.js'
export { AgentRegistry } from './registry.js'
export { MessageInbox } from './inbox.js'
export { createUnicomHttpServer } from './server.js'
```

- [ ] **Step 4: Create required directories**

```bash
cd packages/platform/unicom
mkdir -p src/tools src/resources bin tests
```

- [ ] **Step 5: Install dependencies**

```bash
pnpm install
```

Expected: `@modelcontextprotocol/sdk` appears in `packages/platform/unicom/node_modules/`.

- [ ] **Step 6: Commit**

```bash
git add packages/platform/unicom/package.json packages/platform/unicom/tsconfig.json packages/platform/unicom/src/index.ts
git commit -m "chore(unicom): scaffold @the-abyss/unicom package"
```

---

## Task 2: Types

**Files:**
- Create: `packages/platform/unicom/src/types.ts`
- Create: `packages/platform/unicom/tests/types.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/platform/unicom/tests/types.test.ts
import { describe, it, expect } from 'vitest'
import { AgentEntrySchema, UNICOMMessageSchema } from '../src/types.js'

describe('AgentEntrySchema', () => {
  it('parses a valid agent entry', () => {
    const result = AgentEntrySchema.safeParse({
      id: 'claude-code',
      displayName: 'Claude Code',
      capabilities: ['review', 'edit'],
      status: 'idle',
      connectedAt: 1000,
      lastSeen: 2000,
    })
    expect(result.success).toBe(true)
  })

  it('rejects unknown status values', () => {
    const result = AgentEntrySchema.safeParse({
      id: 'x', displayName: 'X', capabilities: [],
      status: 'unknown', connectedAt: 0, lastSeen: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('UNICOMMessageSchema', () => {
  it('parses a valid unicast message', () => {
    const result = UNICOMMessageSchema.safeParse({
      id: 'abc', from: 'codex', to: 'claude-code',
      content: 'hello', type: 'message', timestamp: 1000,
    })
    expect(result.success).toBe(true)
  })

  it('parses broadcast target', () => {
    const result = UNICOMMessageSchema.safeParse({
      id: 'abc', from: 'codex', to: 'broadcast',
      content: 'hi all', type: 'message', timestamp: 1000,
    })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: FAIL — `Cannot find module '../src/types.js'`

- [ ] **Step 3: Implement types.ts**

```typescript
// packages/platform/unicom/src/types.ts
import { z } from 'zod'

export const AgentStatusSchema = z.enum(['connected', 'idle', 'streaming', 'busy'])
export type AgentStatus = z.infer<typeof AgentStatusSchema>

export const AgentEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  capabilities: z.array(z.string()),
  status: AgentStatusSchema,
  connectedAt: z.number(),
  lastSeen: z.number(),
})
export type AgentEntry = z.infer<typeof AgentEntrySchema>

export const UNICOMMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  content: z.string(),
  type: z.enum(['message', 'status_update', 'ack']),
  replyTo: z.string().optional(),
  timestamp: z.number(),
})
export type UNICOMMessage = z.infer<typeof UNICOMMessageSchema>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/platform/unicom/src/types.ts packages/platform/unicom/tests/types.test.ts
git commit -m "feat(unicom): add AgentEntry and UNICOMMessage Zod schemas"
```

---

## Task 3: AgentRegistry

**Files:**
- Create: `packages/platform/unicom/src/registry.ts`
- Create: `packages/platform/unicom/tests/registry.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/platform/unicom/tests/registry.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { AgentRegistry } from '../src/registry.js'

describe('AgentRegistry', () => {
  let registry: AgentRegistry
  beforeEach(() => { registry = new AgentRegistry() })

  it('register() creates entry with connected status', () => {
    const entry = registry.register('claude-code', 'Claude Code', ['review'])
    expect(entry.id).toBe('claude-code')
    expect(entry.status).toBe('connected')
    expect(entry.capabilities).toEqual(['review'])
    expect(entry.connectedAt).toBeGreaterThan(0)
  })

  it('list() returns all registered agents', () => {
    registry.register('a', 'A', [])
    registry.register('b', 'B', [])
    expect(registry.list()).toHaveLength(2)
  })

  it('updateStatus() changes agent status', () => {
    registry.register('claude-code', 'Claude Code', [])
    const updated = registry.updateStatus('claude-code', 'streaming')
    expect(updated?.status).toBe('streaming')
  })

  it('updateStatus() returns undefined for unknown agent', () => {
    expect(registry.updateStatus('ghost', 'idle')).toBeUndefined()
  })

  it('remove() deletes agent from registry', () => {
    registry.register('x', 'X', [])
    registry.remove('x')
    expect(registry.list()).toHaveLength(0)
  })

  it('evictStale() removes agents silent > 30s', () => {
    registry.register('old', 'Old', [])
    const entry = registry.list()[0]!
    registry['agents'].set('old', { ...entry, lastSeen: Date.now() - 31_000 })
    const evicted = registry.evictStale()
    expect(evicted).toContain('old')
    expect(registry.list()).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: FAIL — `Cannot find module '../src/registry.js'`

- [ ] **Step 3: Implement registry.ts**

```typescript
// packages/platform/unicom/src/registry.ts
import type { AgentEntry, AgentStatus } from './types.js'

const STALE_THRESHOLD_MS = 30_000

export class AgentRegistry {
  private agents = new Map<string, AgentEntry>()

  register(id: string, displayName: string, capabilities: string[]): AgentEntry {
    const now = Date.now()
    const entry: AgentEntry = {
      id, displayName, capabilities,
      status: 'connected', connectedAt: now, lastSeen: now,
    }
    this.agents.set(id, entry)
    return entry
  }

  updateStatus(id: string, status: AgentStatus): AgentEntry | undefined {
    const entry = this.agents.get(id)
    if (!entry) return undefined
    const updated: AgentEntry = { ...entry, status, lastSeen: Date.now() }
    this.agents.set(id, updated)
    return updated
  }

  heartbeat(id: string): void {
    const entry = this.agents.get(id)
    if (entry) this.agents.set(id, { ...entry, lastSeen: Date.now() })
  }

  remove(id: string): void { this.agents.delete(id) }

  list(): AgentEntry[] { return Array.from(this.agents.values()) }

  evictStale(): string[] {
    const now = Date.now()
    const evicted: string[] = []
    for (const [id, entry] of this.agents) {
      if (now - entry.lastSeen > STALE_THRESHOLD_MS) {
        this.agents.delete(id)
        evicted.push(id)
      }
    }
    return evicted
  }

  startHeartbeatEviction(onEvict: (id: string) => void): NodeJS.Timeout {
    return setInterval(() => {
      for (const id of this.evictStale()) onEvict(id)
    }, 10_000)
  }
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/platform/unicom/src/registry.ts packages/platform/unicom/tests/registry.test.ts
git commit -m "feat(unicom): add AgentRegistry with heartbeat eviction"
```

---

## Task 4: MessageInbox

**Files:**
- Create: `packages/platform/unicom/src/inbox.ts`
- Create: `packages/platform/unicom/tests/inbox.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/platform/unicom/tests/inbox.test.ts
import { describe, it, expect } from 'vitest'
import { MessageInbox } from '../src/inbox.js'
import type { UNICOMMessage } from '../src/types.js'

const makeMsg = (id: string, to: string): UNICOMMessage => ({
  id, from: 'sender', to, content: 'hello', type: 'message', timestamp: Date.now(),
})

describe('MessageInbox', () => {
  it('enqueue() adds message to agent queue', () => {
    const inbox = new MessageInbox()
    inbox.enqueue('claude-code', makeMsg('1', 'claude-code'))
    expect(inbox.drain('claude-code')).toHaveLength(1)
  })

  it('drain() empties the queue after returning messages', () => {
    const inbox = new MessageInbox()
    inbox.enqueue('x', makeMsg('1', 'x'))
    inbox.enqueue('x', makeMsg('2', 'x'))
    expect(inbox.drain('x')).toHaveLength(2)
    expect(inbox.drain('x')).toHaveLength(0)
  })

  it('drain() returns empty array for unknown agent', () => {
    expect(new MessageInbox().drain('ghost')).toEqual([])
  })

  it('clear() removes all messages for an agent', () => {
    const inbox = new MessageInbox()
    inbox.enqueue('y', makeMsg('1', 'y'))
    inbox.clear('y')
    expect(inbox.drain('y')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: FAIL — `Cannot find module '../src/inbox.js'`

- [ ] **Step 3: Implement inbox.ts**

```typescript
// packages/platform/unicom/src/inbox.ts
import type { UNICOMMessage } from './types.js'

export class MessageInbox {
  private queues = new Map<string, UNICOMMessage[]>()

  enqueue(agentId: string, message: UNICOMMessage): void {
    const queue = this.queues.get(agentId) ?? []
    queue.push(message)
    this.queues.set(agentId, queue)
  }

  drain(agentId: string): UNICOMMessage[] {
    const messages = this.queues.get(agentId) ?? []
    this.queues.set(agentId, [])
    return messages
  }

  clear(agentId: string): void { this.queues.delete(agentId) }
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/platform/unicom/src/inbox.ts packages/platform/unicom/tests/inbox.test.ts
git commit -m "feat(unicom): add MessageInbox per-agent queue"
```

---

## Task 5: Router

**Files:**
- Create: `packages/platform/unicom/src/router.ts`
- Create: `packages/platform/unicom/tests/router.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/platform/unicom/tests/router.test.ts
import { describe, it, expect } from 'vitest'
import { routeMessage } from '../src/router.js'
import { AgentRegistry } from '../src/registry.js'
import { MessageInbox } from '../src/inbox.js'

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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: FAIL — `Cannot find module '../src/router.js'`

- [ ] **Step 3: Implement router.ts**

```typescript
// packages/platform/unicom/src/router.ts
import { randomUUID } from 'node:crypto'

import type { AgentRegistry } from './registry.js'
import type { MessageInbox } from './inbox.js'
import type { UNICOMMessage } from './types.js'

export function routeMessage(
  registry: AgentRegistry,
  inbox: MessageInbox,
  from: string,
  to: string,
  content: string,
  replyTo?: string,
  type: UNICOMMessage['type'] = 'message',
): UNICOMMessage {
  const message: UNICOMMessage = {
    id: randomUUID(), from, to, content, type, replyTo, timestamp: Date.now(),
  }
  if (to === 'broadcast') {
    for (const agent of registry.list()) {
      if (agent.id !== from) inbox.enqueue(agent.id, message)
    }
  } else {
    inbox.enqueue(to, message)
  }
  return message
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/platform/unicom/src/router.ts packages/platform/unicom/tests/router.test.ts
git commit -m "feat(unicom): add routeMessage for unicast and broadcast delivery"
```

---

## Task 6: MCP Tool Handlers

**Files:**
- Create: `packages/platform/unicom/src/tools/register-agent.ts`
- Create: `packages/platform/unicom/src/tools/update-status.ts`
- Create: `packages/platform/unicom/src/tools/send-message.ts`
- Create: `packages/platform/unicom/src/tools/broadcast.ts`
- Create: `packages/platform/unicom/src/tools/list-agents.ts`
- Create: `packages/platform/unicom/src/tools/receive-messages.ts`
- Create: `packages/platform/unicom/src/tools/index.ts`
- Create: `packages/platform/unicom/tests/tools.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/platform/unicom/tests/tools.test.ts
import { describe, it, expect } from 'vitest'
import { AgentRegistry } from '../src/registry.js'
import { MessageInbox } from '../src/inbox.js'
import {
  handleRegisterAgent, handleUpdateStatus, handleSendMessage,
  handleBroadcast, handleListAgents, handleReceiveMessages,
} from '../src/tools/index.js'

function setup() {
  return { registry: new AgentRegistry(), inbox: new MessageInbox() }
}

describe('handleRegisterAgent', () => {
  it('registers agent and returns JSON entry', async () => {
    const { registry, inbox } = setup()
    const result = await handleRegisterAgent(registry, inbox,
      { id: 'claude-code', displayName: 'Claude Code', capabilities: ['review'] })
    const entry = JSON.parse(result.content[0].text)
    expect(entry.id).toBe('claude-code')
    expect(entry.status).toBe('connected')
    expect(registry.list()).toHaveLength(1)
  })
})

describe('handleUpdateStatus', () => {
  it('updates status and broadcasts status_update to other agents', async () => {
    const { registry, inbox } = setup()
    registry.register('claude-code', 'C', [])
    registry.register('roocode', 'R', [])
    const result = await handleUpdateStatus(registry, inbox, { id: 'claude-code', status: 'busy' })
    const entry = JSON.parse(result.content[0].text)
    expect(entry.status).toBe('busy')
    const rooMessages = inbox.drain('roocode')
    expect(rooMessages[0]?.type).toBe('status_update')
  })

  it('returns error text for unknown agent', async () => {
    const { registry, inbox } = setup()
    const result = await handleUpdateStatus(registry, inbox, { id: 'ghost', status: 'idle' })
    expect(result.content[0].text).toContain('not found')
  })
})

describe('handleSendMessage', () => {
  it('routes message and delivers to target inbox', async () => {
    const { registry, inbox } = setup()
    registry.register('claude-code', 'C', [])
    const result = await handleSendMessage(registry, inbox,
      { from: 'codex', to: 'claude-code', content: 'review src/foo.ts' })
    const msg = JSON.parse(result.content[0].text)
    expect(msg.from).toBe('codex')
    expect(inbox.drain('claude-code')).toHaveLength(1)
  })
})

describe('handleBroadcast', () => {
  it('delivers to all agents except sender', async () => {
    const { registry, inbox } = setup()
    registry.register('a', 'A', [])
    registry.register('b', 'B', [])
    await handleBroadcast(registry, inbox, { from: 'system', content: 'hello all' })
    expect(inbox.drain('a')).toHaveLength(1)
    expect(inbox.drain('b')).toHaveLength(1)
  })
})

describe('handleListAgents', () => {
  it('returns JSON array of registered agents', async () => {
    const { registry } = setup()
    registry.register('x', 'X', [])
    registry.register('y', 'Y', [])
    const result = await handleListAgents(registry)
    expect(JSON.parse(result.content[0].text)).toHaveLength(2)
  })
})

describe('handleReceiveMessages', () => {
  it('drains inbox and returns messages, then empty on second call', async () => {
    const { registry, inbox } = setup()
    registry.register('claude-code', 'C', [])
    await handleSendMessage(registry, inbox,
      { from: 'codex', to: 'claude-code', content: 'msg1' })
    const result = await handleReceiveMessages(inbox, { agentId: 'claude-code' })
    expect(JSON.parse(result.content[0].text)).toHaveLength(1)
    const result2 = await handleReceiveMessages(inbox, { agentId: 'claude-code' })
    expect(JSON.parse(result2.content[0].text)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: FAIL — `Cannot find module '../src/tools/index.js'`

- [ ] **Step 3: Implement each tool handler file**

```typescript
// packages/platform/unicom/src/tools/register-agent.ts
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'

export async function handleRegisterAgent(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { id: string; displayName: string; capabilities: string[] },
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const entry = registry.register(params.id, params.displayName, params.capabilities)
  inbox.drain(params.id) // ensure queue initialised
  return { content: [{ type: 'text', text: JSON.stringify(entry) }] }
}
```

```typescript
// packages/platform/unicom/src/tools/update-status.ts
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'
import type { AgentStatus } from '../types.js'
import { routeMessage } from '../router.js'

export async function handleUpdateStatus(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { id: string; status: AgentStatus },
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const updated = registry.updateStatus(params.id, params.status)
  if (!updated) {
    return { content: [{ type: 'text', text: `Agent '${params.id}' not found` }] }
  }
  routeMessage(registry, inbox, 'system', 'broadcast',
    `${params.id} status: ${params.status}`, undefined, 'status_update')
  return { content: [{ type: 'text', text: JSON.stringify(updated) }] }
}
```

```typescript
// packages/platform/unicom/src/tools/send-message.ts
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'
import { routeMessage } from '../router.js'

export async function handleSendMessage(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { from: string; to: string; content: string; replyTo?: string },
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const msg = routeMessage(registry, inbox, params.from, params.to, params.content, params.replyTo)
  return { content: [{ type: 'text', text: JSON.stringify(msg) }] }
}
```

```typescript
// packages/platform/unicom/src/tools/broadcast.ts
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'
import { routeMessage } from '../router.js'

export async function handleBroadcast(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { from: string; content: string },
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const msg = routeMessage(registry, inbox, params.from, 'broadcast', params.content)
  return { content: [{ type: 'text', text: JSON.stringify(msg) }] }
}
```

```typescript
// packages/platform/unicom/src/tools/list-agents.ts
import type { AgentRegistry } from '../registry.js'

export async function handleListAgents(
  registry: AgentRegistry,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  return { content: [{ type: 'text', text: JSON.stringify(registry.list()) }] }
}
```

```typescript
// packages/platform/unicom/src/tools/receive-messages.ts
import type { MessageInbox } from '../inbox.js'

export async function handleReceiveMessages(
  inbox: MessageInbox,
  params: { agentId: string },
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  return { content: [{ type: 'text', text: JSON.stringify(inbox.drain(params.agentId)) }] }
}
```

```typescript
// packages/platform/unicom/src/tools/index.ts
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { AgentStatusSchema } from '../types.js'
import type { AgentRegistry } from '../registry.js'
import type { MessageInbox } from '../inbox.js'
import { handleRegisterAgent } from './register-agent.js'
import { handleUpdateStatus } from './update-status.js'
import { handleSendMessage } from './send-message.js'
import { handleBroadcast } from './broadcast.js'
import { handleListAgents } from './list-agents.js'
import { handleReceiveMessages } from './receive-messages.js'

export {
  handleRegisterAgent, handleUpdateStatus, handleSendMessage,
  handleBroadcast, handleListAgents, handleReceiveMessages,
}

export function createTools(mcp: McpServer, registry: AgentRegistry, inbox: MessageInbox): void {
  mcp.tool('register_agent', 'Register this agent with UNICOM Hub', {
    id: z.string().describe('Unique agent id, e.g. "claude-code"'),
    displayName: z.string().describe('Human-readable name'),
    capabilities: z.array(z.string()).describe('Agent capabilities list'),
  }, (p) => handleRegisterAgent(registry, inbox, p))

  mcp.tool('update_status', 'Update status — auto-broadcasts to all agents', {
    id: z.string().describe('Agent id to update'),
    status: AgentStatusSchema.describe('idle | streaming | busy'),
  }, (p) => handleUpdateStatus(registry, inbox, p))

  mcp.tool('send_message', 'Send a message to a specific agent', {
    from: z.string().describe('Sender agent id'),
    to: z.string().describe('Target agent id or "broadcast"'),
    content: z.string().describe('Message body (markdown ok)'),
    replyTo: z.string().optional().describe('Optional: id of message being replied to'),
  }, (p) => handleSendMessage(registry, inbox, p))

  mcp.tool('broadcast', 'Send a message to all connected agents', {
    from: z.string().describe('Sender agent id'),
    content: z.string().describe('Message body'),
  }, (p) => handleBroadcast(registry, inbox, p))

  mcp.tool('list_agents', 'List all agents with live status', {},
    () => handleListAgents(registry))

  mcp.tool('receive_messages', 'Drain and return pending messages for an agent', {
    agentId: z.string().describe('Your agent id'),
  }, (p) => handleReceiveMessages(inbox, p))
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/platform/unicom/src/tools/ packages/platform/unicom/tests/tools.test.ts
git commit -m "feat(unicom): implement all 6 MCP tool handlers"
```

---

## Task 7: MCP Resource

**Files:**
- Create: `packages/platform/unicom/src/resources/agents-resource.ts`

- [ ] **Step 1: Implement agents-resource.ts**

```typescript
// packages/platform/unicom/src/resources/agents-resource.ts
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AgentRegistry } from '../registry.js'

export function createAgentsResource(mcp: McpServer, registry: AgentRegistry): void {
  mcp.resource(
    'agents',
    new ResourceTemplate('unicom://agents', { list: undefined }),
    async (uri) => ({
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(registry.list(), null, 2),
      }],
    }),
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/platform/unicom/src/resources/agents-resource.ts
git commit -m "feat(unicom): add unicom://agents MCP resource"
```

---

## Task 8: HTTP Server

**Files:**
- Create: `packages/platform/unicom/src/server.ts`
- Create: `packages/platform/unicom/tests/server.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/platform/unicom/tests/server.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import http from 'node:http'
import { createUnicomHttpServer } from '../src/server.js'

const PORT = 59850
let server: http.Server

beforeAll(() => { server = createUnicomHttpServer(PORT) })
afterAll(() => { server.close() })

async function get(path: string) {
  return new Promise<{ status: number; body: string }>((resolve) => {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
      let body = ''
      res.on('data', (c: Buffer) => { body += c.toString() })
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body }))
    })
  })
}

async function post(path: string, body: string) {
  return new Promise<{ status: number; body: string }>((resolve) => {
    const req = http.request(
      { hostname: 'localhost', port: PORT, path, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
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

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const { status, body } = await get('/health')
    expect(status).toBe(200)
    expect(JSON.parse(body).status).toBe('ok')
  })
})

describe('GET /agents', () => {
  it('returns 200 with empty array initially', async () => {
    const { status, body } = await get('/agents')
    expect(status).toBe(200)
    expect(JSON.parse(body)).toEqual([])
  })
})

describe('POST /send', () => {
  it('returns 200 and a routed UNICOMMessage', async () => {
    const payload = JSON.stringify({ from: 'test', to: 'broadcast', content: 'hello' })
    const { status, body } = await post('/send', payload)
    expect(status).toBe(200)
    expect(JSON.parse(body).from).toBe('test')
  })

  it('returns 400 for malformed JSON', async () => {
    const { status } = await post('/send', 'not-json')
    expect(status).toBe(400)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: FAIL — `Cannot find module '../src/server.js'`

- [ ] **Step 3: Implement server.ts**

```typescript
// packages/platform/unicom/src/server.ts
import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { AgentRegistry } from './registry.js'
import { MessageInbox } from './inbox.js'
import { routeMessage } from './router.js'
import { createTools } from './tools/index.js'
import { createAgentsResource } from './resources/agents-resource.js'

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
  const sessions = new Map<string, StreamableHTTPServerTransport>()

  const evictionTimer = registry.startHeartbeatEviction((id) => inbox.clear(id))

  const httpServer = http.createServer(async (req, res) => {
    setCors(res)

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

    const url = req.url ?? '/'

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
          from: string; to: string; content: string; replyTo?: string
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
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd packages/platform/unicom && pnpm test
```

Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/platform/unicom/src/server.ts packages/platform/unicom/tests/server.test.ts
git commit -m "feat(unicom): add HTTP server with MCP endpoint and HTTP fallback"
```

---

## Task 9: CLI Entry Point

**Files:**
- Create: `packages/platform/unicom/bin/unicom.ts`

- [ ] **Step 1: Implement bin/unicom.ts**

```typescript
// packages/platform/unicom/bin/unicom.ts
import { createUnicomHttpServer } from '../src/server.js'

function parsePort(args: string[]): number {
  const flagIdx = args.indexOf('--port')
  if (flagIdx !== -1 && args[flagIdx + 1]) return parseInt(args[flagIdx + 1]!, 10)
  const inline = args.find((a) => a.startsWith('--port='))
  if (inline) return parseInt(inline.split('=')[1]!, 10)
  return 59849
}

const port = parsePort(process.argv.slice(2))
createUnicomHttpServer(port)

console.log(`🛰️  UNICOM Hub running on http://localhost:${port}`)
console.log(`   MCP endpoint : http://localhost:${port}/mcp`)
console.log(`   Health check : http://localhost:${port}/health`)
console.log(`   Agent list   : http://localhost:${port}/agents`)
console.log(`   Send (HTTP)  : POST http://localhost:${port}/send`)
console.log(`\nPress Ctrl+C to stop.\n`)

process.on('SIGINT', () => { console.log('\nUNICOM Hub stopped.'); process.exit(0) })
```

- [ ] **Step 2: Build and smoke test the binary**

```bash
cd packages/platform/unicom && pnpm build
node dist/bin/unicom.js --port 59849
```

Expected:
```
🛰️  UNICOM Hub running on http://localhost:59849
   MCP endpoint : http://localhost:59849/mcp
   ...
```

In another terminal:
```bash
curl http://localhost:59849/health
```

Expected: `{"status":"ok","agents":0}`

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add packages/platform/unicom/bin/unicom.ts
git commit -m "feat(unicom): add CLI entry — node dist/bin/unicom.js --port 59849"
```

---

## Task 10: Wire Monorepo

**Files:**
- Modify: `tsconfig.json` (root) — add path alias

- [ ] **Step 1: Add path alias to root tsconfig.json**

In the root `tsconfig.json`, inside the `paths` object, add:

```json
"@the-abyss/unicom": ["./packages/platform/unicom/src"]
```

- [ ] **Step 2: Verify workspace detection**

```bash
pnpm list --filter @the-abyss/unicom
```

Expected: package listed (already covered by `packages/platform/*` glob in `pnpm-workspace.yaml`).

- [ ] **Step 3: Run root typecheck and build**

```bash
pnpm typecheck -- --pretty false 2>&1 | tail -5
pnpm build 2>&1 | tail -5
```

Expected: both pass with no new errors.

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json
git commit -m "chore(unicom): add @the-abyss/unicom path alias to root tsconfig"
```

---

## Task 11: Integration — Claude Code, Roocode, Codex

**Files:**
- Modify: `.mcp.json` (repo root)

- [ ] **Step 1: Start UNICOM Hub**

```bash
node packages/platform/unicom/dist/bin/unicom.js --port 59849
```

Leave running throughout this task.

- [ ] **Step 2: Verify health**

```bash
curl http://localhost:59849/health
```

Expected: `{"status":"ok","agents":0}`

- [ ] **Step 3: Update .mcp.json**

Add the `unicom` entry to the `mcpServers` object:

```json
"unicom": {
  "type": "http",
  "url": "http://localhost:59849/mcp"
}
```

- [ ] **Step 4: Reload Claude Code and verify MCP connection**

In Claude Code: run `/mcp` — `unicom` should appear in the list.

Then call: `Use list_agents` — expected: `[]` (empty registry).

- [ ] **Step 5: Register Claude Code and smoke test round-trip**

In Claude Code, call:
```
Use register_agent with id="claude-code", displayName="Claude Code", capabilities=["review","edit"]
```

Then:
```bash
# Simulate Codex sending a message via HTTP fallback
curl -X POST http://localhost:59849/send \
  -H "Content-Type: application/json" \
  -d '{"from":"codex","to":"claude-code","content":"Review src/server.ts please"}'
```

Then in Claude Code:
```
Use receive_messages with agentId="claude-code"
```

Expected: message from Codex appears in the result.

- [ ] **Step 6: Add Roocode MCP server (in Roocode settings UI)**

In Cursor → Roocode settings → MCP Servers → Add:
- Name: `unicom`
- Type: `http`
- URL: `http://localhost:59849/mcp`

Call `list_agents` from Roocode — should show `claude-code` already registered.

- [ ] **Step 7: Commit**

```bash
git add .mcp.json
git commit -m "feat(unicom): wire UNICOM Hub to .mcp.json for Claude Code integration"
```

---

## Self-Review Notes

- `receive_messages` (6th tool) added beyond spec's 5 — required because `StreamableHTTPServerTransport` has no persistent push channel in Phase 1. Poll-based delivery is intentional and sufficient for POC.
- `from` is explicit on `send_message`/`broadcast` — MCP Streamable HTTP has no implicit caller identity.
- Phase 4 (Abyss service bridge) is intentionally excluded — separate plan when needed.
- SSE push notifications (true streaming delivery) are a Phase 4 upgrade; `receive_messages` polling covers Phase 1–3.
