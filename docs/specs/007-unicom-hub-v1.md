# 007 — UNICOM Hub v1

> **Status:** Approved · Ready for implementation
> **Version:** v1.0
> **Date:** 2026-05-20
> **Author:** Chief (Dr. Ferdi Iskandar)

---

## Context

The Abyss monorepo runs three AI coding assistant extensions inside Cursor IDE:
- **OpenAI Codex CLI** — general-purpose code agent
- **Claude Code** — Anthropic's coding assistant (MCP-native)
- **Roocode** — open-source coding assistant (MCP-native)

Currently these agents operate in isolation — there is no mechanism for one agent to
instruct, delegate to, or receive results from another. Every cross-agent task requires
the Chief to manually relay output between extensions.

**Agent UNICOM** solves this by providing a lightweight MCP-based Hub that acts as a
message router, presence registry, and streaming relay — enabling direct, Chief-initiated
agent-to-agent communication inside Cursor IDE.

**Design constraints:**
- Development/POC phase only (not production-grade initially)
- Human-in-the-loop: Chief explicitly initiates every inter-agent communication
- No autonomous agent spawning or self-propagating behavior
- Single new production dependency: `@modelcontextprotocol/sdk`

---

## 1. Architecture

```
Chief (explicit instruction)
    ↓
Cursor IDE — Extension Host
  ┌──────────────────────────────────────────────┐
  │  Codex CLI  │   Claude Code   │   Roocode    │
  │  MCP client │   MCP client    │  MCP client  │
  │  (or HTTP)  │   ✅ native     │  ✅ native   │
  └──────┬──────┴────────┬────────┴──────┬───────┘
         └───────────────┼───────────────┘
                ↕ JSON-RPC 2.0 + SSE transport
         ┌──────────────▼──────────────┐
         │      🛰️  UNICOM Hub         │
         │  (@the-abyss/unicom)        │
         │  packages/platform/unicom/  │
         │                             │
         │  register_agent()           │
         │  update_status()            │
         │  send_message()             │
         │  broadcast()                │
         │  list_agents()              │
         └─────────────────────────────┘
              ↕ (Phase 4 — optional)
         Abyss microservices via HTTP/Kafka
         (orchestrator, sentra-assist, sentra-pustaka)
```

**Topology:** Hub & Spoke — all communication flows through UNICOM Hub.
**Transport:** MCP over SSE (Server-Sent Events) for real-time push delivery.
**Fallback:** HTTP REST endpoints (`POST /send`, `GET /agents`) for non-MCP clients (Codex).

---

## 2. Protocol Design

### 2.1 Agent Status Lifecycle

```
disconnected → connected → idle ⇄ streaming ⇄ busy
```

Status changes are automatically broadcast as `status_update` messages to all
connected agents.

### 2.2 TypeScript Types

```typescript
// Agent presence entry — stored in Hub's in-memory registry
interface AgentEntry {
  id: string              // "claude-code" | "roocode" | "codex"
  displayName: string     // e.g. "Claude Code 1.x"
  capabilities: string[]  // ["code-review", "file-edit", "search"]
  status: "connected" | "idle" | "streaming" | "busy"
  connectedAt: number     // unix timestamp ms
  lastSeen: number        // heartbeat timestamp ms
}

// Every message routed through the Hub
interface UNICOMMessage {
  id: string                        // crypto.randomUUID()
  from: string                      // sender agent id
  to: string | "broadcast"          // target agent id or all
  content: string                   // message body (markdown supported)
  type: "message" | "status_update" | "ack"
  replyTo?: string                  // thread reference (optional)
  timestamp: number
}
```

### 2.3 MCP Tools (5 tools exposed by Hub)

| Tool | Signature | Behavior |
|---|---|---|
| `register_agent` | `(id, displayName, capabilities[]) → AgentEntry` | Register agent in Hub registry, broadcast `connected` status |
| `update_status` | `(id, status) → void` | Update agent status, broadcast `status_update` to all |
| `send_message` | `(to, content, replyTo?) → UNICOMMessage` | Route message to target via SSE push |
| `broadcast` | `(content) → UNICOMMessage` | Push message to all connected agents |
| `list_agents` | `() → AgentEntry[]` | Return current registry with live status |

### 2.4 MCP Resources

| URI | Content |
|---|---|
| `unicom://agents` | Live JSON view of all registered agents with current status |

### 2.5 HTTP Fallback (for Codex CLI)

```
POST /send
  Body: { from: string, to: string, content: string }
  Response: UNICOMMessage

GET /agents
  Response: AgentEntry[]

GET /health
  Response: { status: "ok", agents: number }
```

---

## 3. File Structure

```
packages/platform/unicom/
├── package.json                  # @the-abyss/unicom · version 0.1.0
├── tsconfig.json                 # extends monorepo base
├── src/
│   ├── server.ts                 # MCP server entry point, SSE transport setup
│   ├── registry.ts               # in-memory Map<id, AgentEntry> + heartbeat
│   ├── router.ts                 # message routing: unicast + broadcast
│   ├── types.ts                  # AgentEntry, UNICOMMessage (Zod schemas)
│   ├── http-fallback.ts          # REST endpoints for non-MCP clients (Codex)
│   ├── tools/
│   │   ├── register-agent.ts
│   │   ├── update-status.ts
│   │   ├── send-message.ts
│   │   ├── broadcast.ts
│   │   └── list-agents.ts
│   └── resources/
│       └── agents-resource.ts    # unicom://agents live view
├── bin/
│   └── unicom.ts                 # CLI: npx unicom start --port 59849
└── README.md
```

**Single new production dependency:** `@modelcontextprotocol/sdk`
**Reused from monorepo:** `zod`, `typescript`, `tsconfig` base

---

## 4. Integration Per Agent

### 4.1 Claude Code — Native MCP (`.mcp.json`)

```json
{
  "mcpServers": {
    "unicom": {
      "command": "node",
      "args": ["packages/platform/unicom/dist/bin/unicom.js", "--port", "59849"]
    }
  }
}
```

Claude Code loads MCP servers automatically at session start. No code changes needed.

### 4.2 Roocode — Native MCP (Roocode Settings)

```json
{
  "roocode.mcp.servers": [
    {
      "name": "unicom",
      "command": "node",
      "args": ["packages/platform/unicom/dist/bin/unicom.js", "--port", "59849"]
    }
  ]
}
```

### 4.3 Codex CLI — HTTP Fallback (if MCP not supported natively)

```bash
# Codex CLI generates and runs:
curl -X POST http://localhost:59849/send \
  -H "Content-Type: application/json" \
  -d '{"from":"codex","to":"claude-code","content":"Review src/foo.ts"}'
```

If Codex CLI confirms MCP support: same `.mcp.json` config applies.

### 4.4 Starting the Hub

```bash
# From monorepo root:
pnpm --filter @the-abyss/unicom dev

# or directly:
node packages/platform/unicom/dist/bin/unicom.js --port 59849
```

---

## 5. Example Flow

```
Scenario: Chief → Codex → UNICOM → Claude Code

1. Chief  →  Codex:       "Ask Claude Code to review src/foo.ts"
2. Codex  →  UNICOM:      send_message({ to: "claude-code", content: "Review src/foo.ts" })
3. UNICOM →  Claude Code: SSE push — message delivered real-time
             [Claude Code status: idle → streaming]
4. Claude Code processes, then:
             send_message({ to: "codex", content: "LGTM. Suggest: add null check line 42" })
             [Claude Code status: streaming → idle]
5. UNICOM →  Codex:       SSE push — response delivered
6. Codex  →  Chief:       "Claude Code says: LGTM. Suggest: add null check line 42"
```

---

## 6. Implementation Phases

### Phase 1 — Core Hub (POC) · ~2–3 days

- [ ] Scaffold `packages/platform/unicom/` package
- [ ] Implement `registry.ts` (in-memory Map + heartbeat eviction)
- [ ] Implement `router.ts` (unicast + broadcast)
- [ ] Implement 5 MCP tools in `tools/`
- [ ] Implement `server.ts` with MCP SDK + SSE transport
- [ ] Add `unicom://agents` resource
- [ ] Build `bin/unicom.ts` CLI entry
- [ ] Wire `pnpm build` + `tsconfig`

### Phase 2 — Integration · ~1 day

- [ ] Add UNICOM to `.mcp.json` (Claude Code)
- [ ] Document Roocode MCP settings
- [ ] Test HTTP fallback endpoints for Codex CLI
- [ ] Verify Codex CLI MCP support (MCP native or HTTP fallback)

### Phase 3 — Status Indicators · ~0.5 day

- [ ] Implement `update_status()` with SSE broadcast
- [ ] Implement heartbeat (evict agents silent > 30s → `disconnected`)
- [ ] Verify `list_agents()` shows live status

### Phase 4 — Abyss Service Bridge (optional, future)

- [ ] Add HTTP/Kafka bridge to orchestrator
- [ ] Allow UNICOM messages to trigger Abyss sagas

---

## 7. Difficulty & Success Probability

| Component | Difficulty | Success |
|---|---|---|
| MCP Server core | 2/10 | — |
| In-memory registry | 1/10 | — |
| Claude Code integration | 1/10 (config only) | 95% |
| Roocode integration | 2/10 (config only) | 85% |
| SSE streaming + status push | 5/10 | 85% |
| Codex CLI via MCP | 6/10 | 60% ⚠️ |
| Codex CLI via HTTP fallback | 2/10 | 90% |
| **OVERALL POC** | **4/10 Medium-Low** | **~85%** |

**Primary risk:** Codex CLI MCP support is unconfirmed.
**Mitigation:** HTTP REST fallback covers 100% of Codex use cases regardless of MCP support.

---

## 8. Verification

```bash
# 1. Start Hub
node packages/platform/unicom/dist/bin/unicom.js --port 59849

# 2. Health check
curl http://localhost:59849/health

# 3. Send test broadcast
curl -X POST http://localhost:59849/send \
  -H "Content-Type: application/json" \
  -d '{"from":"test","to":"broadcast","content":"UNICOM online"}'

# 4. List agents
curl http://localhost:59849/agents

# 5. In Claude Code — verify MCP tools:
#    list_agents() → should return registered agents with status

# 6. End-to-end:
#    Codex → send_message(to:"claude-code") → Claude Code receives → responds
```

---

## 9. Out of Scope (v1)

- Persistent message history (messages are ephemeral in-memory)
- Authentication / API keys between agents (development only)
- Multi-machine / remote UNICOM (localhost only in v1)
- Autonomous agent chaining without Chief instruction
- Grounded Citation integration (separate roadmap item)
