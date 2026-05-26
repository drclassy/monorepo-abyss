# UNICOM Protocol

Last updated: 2026-05-27

## Core Entities

- `UnicomActor`
- `UnicomRoom`
- `UnicomTask`
- `UnicomMessage`
- `UnicomEvidence`
- `UnicomDecision`
- `UnicomIntervention`
- `UnicomEvent`

## Event Envelope

Setiap event wajib memuat metadata audit berikut:

```ts
type UnicomEvent = {
  id: string
  roomId: string
  taskId?: string
  type: UnicomEventType
  actor: UnicomActor
  payload: unknown
  risk: "low" | "medium" | "high" | "critical"
  requiresApproval: boolean
  createdAt: string
  correlationId?: string
  parentEventId?: string
  evidenceIds?: string[]
}
```

## Required Event Types

```text
room.created
room.paused
room.resumed
room.frozen
participant.joined
participant.left
message.sent
agent.registered
agent.heartbeat
agent.proposal
agent.question
agent.warning
agent.handoff
agent.evidence
agent.completion_claim
task.created
task.assigned
task.blocked
task.completed
decision.proposed
decision.approved
decision.rejected
human.intervention
policy.allowed
policy.blocked
system.error
```

## Reducer Rules

- Room state direkonstruksi hanya dari urutan event append-only.
- Event lama tidak dimutasi.
- Koreksi dilakukan dengan event baru yang menunjuk `parentEventId` atau
  `correlationId`.
- Completion claim tidak valid bila `evidenceIds` kosong.

## Realtime Contract

- Client subscribe ke room-scoped stream.
- Server menyiarkan event baru dan snapshot state tereduksi.
- Transport implementation boleh berganti, tetapi payload event dan room state
  tetap stabil.
