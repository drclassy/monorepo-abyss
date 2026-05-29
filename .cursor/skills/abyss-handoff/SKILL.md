---
name: abyss-handoff
description:
  Update ABYSS SSOT continuity at session end or when handing off to the next
  agent. Use when finishing a mission, recording blockers, or preparing HANDOFF.
---

# ABYSS Handoff

`.agent/` is operational SSOT. Do not delete or reset it.

## Before stopping (if files were edited)

Update at least one active continuity file when mission state changed:

- `.agent/HANDOFF.md` — current state, blockers, next action
- `.agent/PROGRESS.md` — milestone status
- `.agent/DECISIONS.md` — durable decisions only (append-only)

Append session notes to `.agent/sessions/YYYY-MM-DD.md`.

## Read order for next agent

1. `.agent/README.md`
2. `.agent/HANDOFF.md`
3. `.agent/CONTEXT.md` when touching boundaries or protected areas
4. `.agent/PROGRESS.md` for milestone status
5. `.agent/DECISIONS.md` when prior rules matter

Do not use legacy `.agent/DIGEST.md`, `.agent/LESSONS.md`, or
`.agent/SESSION_STATE.md` as active SSOT unless Chief asks for history.

## Handoff snippet (minimal)

```markdown
## Snapshot

- Branch:
- Mission completed:
- Verified:
- Blockers:
- Next action:
```

Keep `HANDOFF.md` short and active. Move long history to `sessions/` or
`archive/`.
