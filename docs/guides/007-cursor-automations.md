# Cursor Automations — ABYSS Starter Catalog

Last updated: 2026-05-30

Cursor Automations are configured in the **Agents Window** or at
[cursor.com/automations](https://cursor.com/automations). This repo documents
starter recipes only — no secrets or personal tokens belong in Git.

Class C guardrail: automations that push, merge, or change CI require explicit
Chief GO before enabling write actions.

## Prerequisites

- Cursor 3.5+ with Automations in Agents Window
- Repo linked to GitHub (`https://github.com/drclassy/monorepo-abyss`)
- Read [`006-cursor-audit.md`](./006-cursor-audit.md) for operating model

## Automation 1 — PR verify reminder

**Purpose:** Nudge agent to run scoped verification when a PR is opened or updated.

| Field | Value |
| --- | --- |
| Name | `abyss-pr-verify-reminder` |
| Trigger | Git — pull request opened or synchronized |
| Repo | `drclassy/monorepo-abyss` |
| Tools | Shell (read-only), Read |
| Mode | Read-only / no auto-merge |

**Instructions (paste into Automations editor):**

```text
You are the ABYSS PR verify assistant. Read-only.

1. Read the PR diff summary and list changed packages or apps.
2. Propose the smallest verification commands (pnpm --filter ... typecheck/lint/test).
3. If changes touch apps/, remind to run app boundary preflight (apps/_governance/APP_BOUNDARY_PREFLIGHT.md).
4. If changes touch packages/sentra/**, stop and flag crown-jewel review-first — no edits without Chief GO.
5. Output a checklist only. Do not push, merge, or modify CI without explicit human approval.
```

**Finish in editor:** confirm branch filter, notification channel, and run mode.

## Automation 2 — SSOT stale handoff nudge

**Purpose:** Weekly reminder to refresh `.agent/HANDOFF.md` when missions complete.

| Field | Value |
| --- | --- |
| Name | `abyss-ssot-handoff-nudge` |
| Trigger | Cron — weekly (e.g. Monday 09:00 local) |
| Repo | `drclassy/monorepo-abyss` |
| Tools | Read |
| Mode | Read-only |

**Instructions:**

```text
Read .agent/HANDOFF.md and .agent/PROGRESS.md.

If HANDOFF "Last updated" is older than 7 days OR snapshot contradicts recent git log:
- Summarize what looks stale.
- Suggest a minimal HANDOFF update (snapshot, blockers, next action).
- Do not edit files automatically; output a draft snippet for the operator.

If HANDOFF is fresh, reply "HANDOFF current — no action."
```

## Optional — Local `/loop` verify

For local recurring checks (Cursor 3.6 `/loop` skill), example prompt:

```text
/loop every 24h: run git status --short; if dirty tree has non-.agent changes, remind to classify KEEP_AND_COMMIT vs FIX_AND_COMMIT per AGENTS.md orphan rules.
```

## Creating automations

1. Open Agents Window → Automations → Create.
2. Use the tables above for trigger, tools, and instructions.
3. Keep automations read-only until Chief approves write/CI actions.
4. Record activation date in `.agent/sessions/YYYY-MM-DD.md`.

## Related docs

- [`.cursor/README.md`](../../.cursor/README.md) — hooks, skills, MCP policy
- [`006-cursor-audit.md`](./006-cursor-audit.md) — operator audit guide
- [`docs/specs/007-unicom-hub-v1.md`](../specs/007-unicom-hub-v1.md) — UNICOM MCP hub
