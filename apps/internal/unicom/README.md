# Sentra UNICOM

**Universal Communication & Coordination subsystem for the Sentra Human-AI
Operating System**

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)](#current-status)
[![Scope](https://img.shields.io/badge/scope-open%20subsystem-blue)](#scope)
[![Repo](https://img.shields.io/badge/standalone%20repo-drclassy%2Funicom-black)](https://github.com/drclassy/unicom)
[![Transport](https://img.shields.io/badge/transport-WebSocket--first-purple)](#realtime-transport-mechanism)
[![Default mode](https://img.shields.io/badge/default-collaborative%20%2B%20approval--gated-green)](#operating-modes)

---

## Overview

<table>
<tr>
<td valign="middle" width="180">
  <img src="https://i.postimg.cc/BZyBKFyT/sentra-unicom.png" alt="Sentra UNICOM" width="160" />
</td>
<td valign="top">

Sentra UNICOM is the realtime communication, coordination, audit trail, and
human-in-the-loop control layer for AI agent systems. It is extracted as a
standalone, self-contained workspace at
**[github.com/drclassy/unicom](https://github.com/drclassy/unicom)** and can be
cloned, installed, and run independently.

Every agent action — proposal, evidence, approval, rejection, warning, handoff,
or human intervention — becomes an immutable event in an append-only log. Room
state is always a deterministic projection of that log. Nothing happens silently
and nothing can be rewritten.

</td>
</tr>
</table>

---

## Quick Start

> **Requirements:** Node.js ≥ 22, pnpm ≥ 9

```bash
# 1. Clone the standalone repo
git clone https://github.com/drclassy/unicom.git
cd unicom

# 2. Install all workspace dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Terminal A — start the UNICOM server (default port 4327)
pnpm dev:server

# 5. Terminal B — start the Chief Cockpit UI (default port 3021)
pnpm dev:app
```

Open **http://localhost:3021** to access the Chief Cockpit.

### Environment variable

| Variable                      | Default                 | Description                            |
| ----------------------------- | ----------------------- | -------------------------------------- |
| `NEXT_PUBLIC_UNICOM_BASE_URL` | `http://127.0.0.1:4327` | UNICOM server URL used by the cockpit. |

Create `apps/internal/unicom/.env.local` to override:

```env
NEXT_PUBLIC_UNICOM_BASE_URL=http://127.0.0.1:4327
```

---

## Connecting an Agent (SDK)

> **Note:** All packages are `private` and not published to npm. The SDK must be
> used **from within the cloned workspace**. Add your agent script inside the
> repo and reference the SDK via the workspace protocol.

### Step 1 — create your agent script inside the repo

Create a file anywhere inside the cloned workspace, e.g. `scripts/my-agent.ts`:

```ts
import { createAgent } from '@the-abyss/unicom-agent-sdk'

const agent = createAgent({
  id: 'my-agent-01',
  displayName: 'My Agent',
  role: 'builder',
  capabilities: ['room-read', 'room-write', 'code-edit'],
  baseUrl: 'http://127.0.0.1:4327',
})

// Join an existing room (get the room ID from the Chief Cockpit)
await agent.join('your-room-id')

// Emit a low-risk proposal — goes straight through in approval-gated mode
await agent.emit({
  type: 'agent.proposal',
  payload: {
    description: 'Refactor utility function',
    scope: ['src/utils.ts'],
  },
  risk: 'low',
  requiresApproval: false,
})

// Always emit evidence before a completion claim
await agent.emit({
  type: 'agent.evidence',
  payload: {
    summary: 'Tests pass, lint clean',
    artifacts: ['test-output.log'],
  },
  risk: 'low',
  requiresApproval: false,
})
```

### Step 2 — run with tsx (already installed in the workspace)

```bash
pnpm dlx tsx scripts/my-agent.ts
```

### How risk gating works

| Risk level | Default behaviour in `approval-gated` mode                 |
| ---------- | ---------------------------------------------------------- |
| `low`      | Appended immediately.                                      |
| `medium`   | Appended immediately.                                      |
| `high`     | Held in pending queue — Chief must approve in the Cockpit. |
| `critical` | Held in pending queue — Chief must approve in the Cockpit. |

### Data persistence note

The server uses an **in-memory store** by default. All rooms and events are
cleared when the server restarts. For durable storage, configure the PostgreSQL
adapter in `packages/unicom/persistence` and point the server to your database
via environment variables.

---

## Package Layout

```text
packages/unicom/core          @the-abyss/unicom-core
packages/unicom/policy        @the-abyss/unicom-policy
packages/unicom/server        @the-abyss/unicom-server
packages/unicom/client        @the-abyss/unicom-client
packages/unicom/agent-sdk     @the-abyss/unicom-agent-sdk
packages/unicom/testkit       @the-abyss/unicom-testkit
packages/unicom/persistence   @the-abyss/unicom-persistence
apps/internal/unicom          Chief Cockpit UI (Next.js)
docs/unicom                   Authoritative specifications
```

| Package              | Role                                                         |
| -------------------- | ------------------------------------------------------------ |
| `unicom-core`        | Event protocol, reducer, domain types.                       |
| `unicom-policy`      | Approval gates, hard blocks, risk evaluation.                |
| `unicom-server`      | Realtime broadcaster, event ingestor, HTTP API.              |
| `unicom-client`      | Library for the cockpit and other subscribers.               |
| `unicom-agent-sdk`   | SDK for agents to join rooms, emit events, claim completion. |
| `unicom-testkit`     | Deterministic test harness for reducer and policy.           |
| `unicom-persistence` | Append-only event store and reducer snapshots (PostgreSQL).  |

---

## Source of truth

| Document                | Path                                    | Authority                                   |
| ----------------------- | --------------------------------------- | ------------------------------------------- |
| Subsystem specification | `docs/unicom/SENTRA_UNICOM_SPEC.md`     | Placement, scope, lifecycle, modes.         |
| Wire protocol           | `docs/unicom/UNICOM_PROTOCOL.md`        | Event envelope, event types, reducer rules. |
| Agent contract          | `docs/unicom/UNICOM_AGENT_CONTRACT.md`  | Responsibilities, roles, completion rules.  |
| Safety boundary         | `docs/unicom/UNICOM_SAFETY_BOUNDARY.md` | Non-negotiable rules, gates, hard blocks.   |

---

## Product goal

UNICOM must enable five capabilities simultaneously. None can be sacrificed for
any of the others.

| #   | Capability                   | Outcome                                                                                  |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Agent-to-agent communication | Agents talk in rooms scoped per task or per project.                                     |
| 2   | Human oversight              | The Chief observes, joins, pauses, and takes over at any time.                           |
| 3   | Auditable decisions          | Proposals, evidence, approvals, rejections, warnings, and handoffs are stored as events. |
| 4   | Policy-gated risk            | High-risk actions are blocked or gated by policy, never executed silently.               |
| 5   | Replayable state             | Room state can be fully reconstructed from the append-only event log.                    |

---

## Scope

### In scope

The event protocol and room state reducer. The policy boundary that decides
allow, block, and approval-required. The agent SDK and the UI client. The
realtime server and the append-only event store. The Chief cockpit that serves
as the human-in-the-loop surface.

### Out of scope

Diagnostic engines, clinical algorithms, the RAG engine, and OCR engines. Hidden
code modification outside the event trail. Uncontrolled agent swarms without
rooms or policy. Final clinical diagnosis without human review.

<img src="https://i.postimg.cc/gjfyb9RQ/Unicom.png" alt="Sentra UNICOM" width="1000" />

---

## Architecture overview

```text
Chief
  └─> apps/internal/unicom          (Chief Cockpit — Next.js, port 3021)
        └─> @the-abyss/unicom-client
              └─> @the-abyss/unicom-server  (HTTP + WebSocket, port 4327)
                    ├─> @the-abyss/unicom-core      (protocol + reducer)
                    ├─> @the-abyss/unicom-policy    (gates + blocks)
                    └─> transport adapter
                          └─> append-only event store
                                └─> @the-abyss/unicom-persistence (PostgreSQL)
```

The transport MVP is **WebSocket-first** but wrapped behind an adapter, so the
wire layer can be replaced without altering the event protocol. Every observable
piece of room state is a deterministic projection of the event log — there is no
state born outside the log.

---

## Core mechanisms

### 1. Event lifecycle mechanism

Every meaningful action in UNICOM becomes an event. The full path from intent to
durable state:

```text
Actor intent
  └─> SDK builds UnicomEvent envelope
        └─> Transport delivers to server
              └─> Server hands event to policy
                    ├─ allow      → append to store → broadcast
                    ├─ block      → emit policy.blocked → broadcast
                    └─ approval   → stage event → emit decision.proposed
                                       └─ on approve  → append original → broadcast
                                       └─ on reject   → emit policy.blocked
```

### 2. Event envelope construction

```ts
type UnicomEvent = {
  id: string // ULID issued by the SDK
  roomId: string // room the event belongs to
  taskId?: string // task context, if any
  type: UnicomEventType // one of the required event types
  actor: UnicomActor // human or agent identity
  payload: unknown // event-specific data
  risk: 'low' | 'medium' | 'high' | 'critical'
  requiresApproval: boolean // SDK declares; policy verifies
  createdAt: string // ISO-8601 timestamp
  correlationId?: string // ties related events together
  parentEventId?: string // used for corrections and reactions
  evidenceIds?: string[] // required for completion claims
}
```

The `risk` and `requiresApproval` fields are declared by the SDK but recomputed
by the policy layer. A mismatch is recorded as `system.error`.

### 3. Reducer mechanism

The reducer is a pure function `reduce(state, event) -> state'`. It is the only
path that produces room state from events. Events are applied in the canonical
order from the store, never by client arrival order.

```text
event log:  [e1, e2, e3, e4, e5]
              │   │   │   │   │
              ▼   ▼   ▼   ▼   ▼
state:      s0→ s1→ s2→ s3→ s4→ s5
```

### 4. Policy evaluation mechanism

Policy runs synchronously on the server before any event is appended.

| Step | Check                                                           | Outcome if matched                  |
| ---- | --------------------------------------------------------------- | ----------------------------------- |
| 1    | Room mode is `freeze`?                                          | block, except `human.intervention`. |
| 2    | Event touches a non-negotiable rule?                            | block.                              |
| 3    | Event is a final clinical diagnosis claim?                      | block.                              |
| 4    | Actor lacks the required capability?                            | block.                              |
| 5    | Event falls under a mandatory approval gate?                    | requires_approval.                  |
| 6    | Computed risk is `high` or `critical` in `approval-gated` mode? | requires_approval.                  |
| 7    | Otherwise.                                                      | allow.                              |

### 5. Approval gate mechanism

```text
agent emits proposal (risk=high)
  └─> policy: requires_approval
        └─> staged in pending queue
        └─> decision.proposed → broadcast
              ├─ Chief approves → decision.approved
              │                    └─> original event appended → broadcast
              └─ Chief rejects  → decision.rejected
                                   └─> policy.blocked → staged event discarded
```

### 6. Completion claim mechanism

An `agent.completion_claim` must include non-empty `evidenceIds`. The policy
layer verifies each id resolves to an `agent.evidence` event in the same room,
is attributable to a logged action, is not older than task creation, and the
claimed scope matches the actual scope touched.

### 7. Human intervention mechanism

| Intervention        | Effect on room                                                    |
| ------------------- | ----------------------------------------------------------------- |
| `pause`             | Room enters paused state; non-human events rejected until resume. |
| `resume`            | Paused state cleared; agents may resume.                          |
| `freeze`            | All non-human events blocked until unfreeze.                      |
| `approve`           | Resolves a pending `decision.proposed`.                           |
| `reject`            | Discards a pending `decision.proposed`.                           |
| `redirect`          | Updates task objective or scope.                                  |
| `remove agent`      | Forces `participant.left` for the named agent.                    |
| `assign agent`      | Forces `participant.joined` for the named agent.                  |
| `force final audit` | Triggers archival path with full audit emission.                  |

### 8. Realtime transport mechanism

```text
client                                 server
  │   subscribe(roomId, sinceEventId)    │
  │ ─────────────────────────────────▶   │
  │   snapshot + tail [e_n+1 … e_now]    │
  │ ◀─────────────────────────────────   │
  │   emit(event)                        │
  │ ─────────────────────────────────▶   │
  │       policy + append (server)       │
  │   broadcast(newEvent, newState)      │
  │ ◀─────────────────────────────────   │
```

### 9. Persistence mechanism

The store is append-only. No destructive operations exist in the application
code path. The only way to alter an earlier event's appearance is to emit a new
event referencing it via `parentEventId` or `correlationId`.

### 10. Agent registration and heartbeat mechanism

```text
agent.registered (identity + capability claim)
  └─> server validates capability against role registry
        ├─ ok       → participant.joined
        └─ refused  → policy.blocked with reason
agent.heartbeat (every N seconds)
  └─> server updates last-seen
        └─ missed K consecutive → agent flagged offline
```

---

## Room model

### Operating modes

| Mode              | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `observe`         | Agents read only; no action events accepted.                |
| `collaborative`   | Agents and Chief discuss freely without hard gates.         |
| `approval-gated`  | High-risk actions wait for explicit Chief approval.         |
| `autonomous-safe` | Agents act within a configured safe envelope.               |
| `clinical-safety` | Clinical boundary enforced; final diagnosis always blocked. |
| `freeze`          | All non-human events blocked until unfreeze.                |

Default for engineering rooms: **`collaborative` + `approval-gated`**.

### Lifecycle states

| State      | Meaning                                                 |
| ---------- | ------------------------------------------------------- |
| `active`   | Room is live and appears on active dashboards.          |
| `archived` | Room is closed but remains readable for audit.          |
| `deleted`  | Room is marked deleted via an event; the trail remains. |

---

## Protocol

### Required event types

| Group            | Events                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Room lifecycle   | `room.created`, `room.archived`, `room.deleted`, `room.paused`, `room.resumed`, `room.frozen`                                                           |
| Participation    | `participant.joined`, `participant.left`, `message.sent`                                                                                                |
| Agent activity   | `agent.registered`, `agent.heartbeat`, `agent.proposal`, `agent.question`, `agent.warning`, `agent.handoff`, `agent.evidence`, `agent.completion_claim` |
| Task lifecycle   | `task.created`, `task.assigned`, `task.blocked`, `task.completed`                                                                                       |
| Decision         | `decision.proposed`, `decision.approved`, `decision.rejected`                                                                                           |
| Human and policy | `human.intervention`, `policy.allowed`, `policy.blocked`, `system.error`                                                                                |

---

## Agent contract

### Supported roles

| Role                       | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `orchestrator`             | Decomposes tasks and coordinates other agents. |
| `builder`                  | Touches code or working artifacts.             |
| `tester`                   | Runs automated verification.                   |
| `quality`                  | Evaluates output quality.                      |
| `git-summarizer`           | Summarises repository changes for audit.       |
| `research`                 | Gathers external context.                      |
| `ui`                       | Works on interface surfaces.                   |
| `clinical-safety-reviewer` | Validates clinical boundaries.                 |
| `documentation`            | Maintains authoritative documents.             |
| `deployment-reviewer`      | Reviews deployment readiness.                  |

### Required capabilities

| Capability          | Meaning                                |
| ------------------- | -------------------------------------- |
| `room-read`         | May read room events.                  |
| `room-write`        | May emit events to a room.             |
| `task-decompose`    | May split a task into sub-tasks.       |
| `code-edit`         | May propose code changes.              |
| `verification-run`  | May run verification.                  |
| `policy-review`     | May evaluate policy hits.              |
| `handoff`           | May hand off a task to another agent.  |
| `approval-request`  | May request Chief approval.            |
| `completion-report` | May submit verified completion claims. |

---

## Safety boundary

### Non-negotiable rules

Final clinical diagnosis from an agent is forbidden. Destructive repository
actions without explicit approval are forbidden. Touching secrets or `.env`
files without approval is forbidden. Falsifying evidence, audit trail, or
completion claims is forbidden. Running risky external API calls silently is
forbidden.

### Hard blocks

| Class                                                      | Reason                             |
| ---------------------------------------------------------- | ---------------------------------- |
| Completion claim without evidence                          | Violates the completion contract.  |
| Final diagnosis claim from an agent                        | Violates the clinical safety rule. |
| Event declaring safe scope while touching a forbidden path | Misrepresentation.                 |
| Action attempting to erase the audit trail                 | Append-only invariant.             |

---

## Current status

| Field           | Value                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------- |
| Standalone repo | [github.com/drclassy/unicom](https://github.com/drclassy/unicom)                         |
| Implementation  | All 7 packages complete and built.                                                       |
| Cockpit UI      | Functional — Chief Cockpit at `apps/internal/unicom`.                                    |
| Server          | Functional — starts on port 4327 via `pnpm dev:server`.                                  |
| Agent SDK       | Functional — `@the-abyss/unicom-agent-sdk` ready for integration.                        |
| Persistence     | In-memory store active by default. PostgreSQL adapter available in `unicom-persistence`. |
| Default mode    | `collaborative` + `approval-gated`.                                                      |

---

## License

**UNLICENSED** — all rights reserved by dr. Ferdi Iskandar / Sentra AI.

---

**Version:** 0.3.0 **Last updated:** 2026-05-28
