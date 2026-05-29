# Cursor AI Enhancement Audit (ABYSS)

Last updated: 2026-05-30

## Scope

Audit and hardening for:

- Cursor setup (rules, hooks, skills, subagents, MCP, automations)
- Cross-tool SSOT parity with Codex / Claude Code
- Workflow discipline, verification, rollback, and cognitive load

This guide is the operator reference for the shared `.cursor/` configuration.

## Current Rule Layout (2026-05-30)

| File | alwaysApply | Scope |
| --- | --- | --- |
| `.cursor/index.mdc` | yes | Pointer + authority order |
| `.cursor/rules/00-core.mdc` | yes | Identity, SSOT guard, task class, GO gate |
| `.cursor/rules/10-backend.mdc` | no | API, Prisma, NestJS, FHIR, PHI |
| `.cursor/rules/20-frontend.mdc` | no | React, Next.js, UI, design tokens |
| `.cursor/rules/30-quality.mdc` | no | TS, tests, pnpm, verification |

Retired rules (`04-state-machine-discipline`, `06-handoff-master`,
`08-session-summarizer`) were merged into `00-core` and `.agent/` SSOT. Do not
restore them unless a targeted mission requires always-on process layers again.

### kluster (local workstation)

`.cursor/rules/kluster-code-verify.mdc` is **gitignored** (see `.gitignore`).
Install via kluster plugin or local copy per machine. It is not part of the
shared four-rule baseline.

## Severity Findings (historical + residual)

### Critical (mitigated)

1. **Multi-authority overlap** — Mitigated by AGENTS-first hierarchy and lean
   always-on rules. Residual risk: handbook exports outside repo still drift.
2. **Codex persona drift** — Repo-local `.codex/**` deprecated; use global Codex +
   `AGENTS.md` + `.agent/`.

### High (mitigated 2026-05-30)

1. **Hooks unwired** — Fixed: `after-edit.mjs` + `post-tool-use.ps1` chain +
   `stop` → `autofix-loop.mjs`.
2. **Empty skills/agents/MCP** — Fixed: repo skills, subagents, `mcp.json.example`
   stubs, automation catalog.

### Medium (ongoing)

1. **Autofix loop latency** — `autofix-loop.mjs` skips when no recent edits
   (`edit-log.txt` age > 30 min). Doc-only sessions stay light.
2. **Cursor Agent CLI** — Headless parity blocked on auth per `.agent/HANDOFF.md`.

## Target Operating Model

### Single control-plane

- Policy authority: `AGENTS.md`
- Operational state: `.agent/*`
- Cursor adapter: `.cursor/` (rules, hooks, skills, agents — supplementary only)
- Codex: global runtime + repo `AGENTS.md` and `.agent/**`

### Two-mode UX

1. **Safe-Quick** (Class A)
   - Read-only inspect, planning, docs, risk map
   - Short structured outputs
   - Delegate to `explore-readonly` subagent when useful

2. **Safe-Execute** (Class B/C)
   - Explicit implementation request
   - Sequence: inspect → plan → minimal diff → verify → rollback note
   - Class C stops for Chief GO (auth, schema, deploy, PHI, crown-jewel)

## Cursor 3.x Features Map for ABYSS

| Feature | ABYSS use |
| --- | --- |
| Agents Window | Primary agent surface; parallel missions |
| Plan / Debug / Ask mode | Align with Class A/B/C in `00-core.mdc` |
| `/worktree` | Isolated agent runs without dirtying main tree |
| `/best-of-n` | Optional for high-risk crown-jewel or CT changes |
| `/multitask` | Dirty-tree classification, multi-package fixes |
| `/loop` | Local recurring verify (see `007-cursor-automations.md`) |
| Auto-review run mode | Prefer repo **Allowlist** via `.cursor/permissions.json` (UI locked — by design) |
| Automations | PR verify reminder, SSOT handoff nudge (Agents Window) |
| Marketplace MCP plugins | Context7, Supabase, Prisma, Sentry — local `.mcp.json` |
| Repo skills / subagents | `.cursor/skills/`, `.cursor/agents/` |

## Hook Chain (active)

```text
afterFileEdit → after-edit.mjs (edit-log.txt)
             → post-tool-use.ps1 (.agent/sessions/YYYY-MM-DD.md)

stop → autofix-loop.mjs (lint + typecheck if recent edits; max 5 loops)
```

Smoke test:

```powershell
'{"file_path":".cursor/README.md","edits":[{}]}' | node .cursor/hooks/after-edit.mjs
pwsh -NoProfile -ExecutionPolicy Bypass -File tooling/governance/agent/hooks/post-tool-use.ps1
Get-Content .cursor/hooks/edit-log.txt -Tail 3
Get-Content .agent/sessions/$(Get-Date -Format yyyy-MM-dd).md -Tail 5
```

## Rollback Map

Revert by file if hardening causes problems:

| Change | Rollback |
| --- | --- |
| `.cursor/hooks.json` | Remove `after-edit.mjs` and `stop` entries; keep `post-tool-use.ps1` only |
| `.cursor/hooks/autofix-loop.mjs` | Remove `stop` hook from `hooks.json` |
| `.cursor/skills/` | Delete directory; remove gitignore negations |
| `.cursor/agents/` | Delete agent `.md` files |
| `mcp.json.example` | Restore `{}` |
| `.vscode/settings.shared.json` | Delete file |
| `docs/guides/007-cursor-automations.md` | Delete if automations not adopted |

## Verification Checklist (Operator)

For each implementation task:

1. Scope (what will and will not change)
2. Risk level (low/medium/high)
3. Verification command (smallest relevant)
4. Rollback path (table above)
5. Done criteria

## Pilot Protocol

Run one **Safe-Quick** then one **Safe-Execute** task and compare:

- response clarity
- time-to-result
- unnecessary file touches

Record outcomes in `.agent/sessions/YYYY-MM-DD.md`.

## Permissions & Run Mode (Cursor 3.6+)

ABYSS uses **repo Allowlist** in [`.cursor/permissions.json`](../../.cursor/permissions.json),
not an unlocked Settings dropdown. See
[`008-cursor-permissions-and-workflows.md`](./008-cursor-permissions-and-workflows.md).

Quick operator steps:

1. Slim `~/.cursor/permissions.json` from [`.cursor/permissions.user.example.json`](../../.cursor/permissions.user.example.json)
2. Reload Cursor window
3. Confirm **Approvals & Execution** shows repo-enforced allowlist
4. Change policy via PR to `.cursor/permissions.json` only

Do **not** use Run Everything / YOLO. Do **not** duplicate allowlists in the user file.
