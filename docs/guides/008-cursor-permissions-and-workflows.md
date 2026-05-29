# Cursor Agent Workflows & Permissions (ABYSS)

Last updated: 2026-05-30

Operator companion to [006-cursor-audit.md](./006-cursor-audit.md) and
[`.cursor/README.md`](../../.cursor/README.md).

## Permissions: repo SSOT vs user file

Cursor 3.6 merges permission files from:

| Source | Path | ABYSS role |
| --- | --- | --- |
| **Repo (team SSOT)** | `.cursor/permissions.json` | Allowlist + healthcare block rules — **authoritative in this monorepo** |
| User (optional) | `~/.cursor/permissions.json` | Machine-local block hints only — **no duplicate allowlist** |
| Admin | Team dashboard / admin file | Overrides if enabled |

### Why Settings UI looks read-only

When a permissions file sets `approvalMode` + `terminalAllowlist`, Cursor shows:

> Run Mode (enforced by …/permissions.json)

The dropdown is **intentionally disabled**. Edit policy in Git (repo file), not
in the UI. That is 2026 best practice for healthcare / team repos.

### Allowlist vs Auto-review dropdown

| Mode | How ABYSS gets it |
| --- | --- |
| **Auto-review** (UI dropdown) | Classifier per shell/MCP action |
| **Allowlist** (permissions file) | Only listed commands auto-run; blocks via `autoRun.block_instructions` |

For ABYSS, **repo Allowlist + block_instructions** is the chosen posture — stricter
and version-controlled. You do **not** need a unlocked Auto-review dropdown if
`.cursor/permissions.json` is present.

### Chief workstation setup (one-time)

1. Slim user file — copy from [`.cursor/permissions.user.example.json`](../../.cursor/permissions.user.example.json) to `~/.cursor/permissions.json`
2. Reload Cursor window (`Developer: Reload Window`)
3. Open ABYSS → **Cursor Settings → Agents → Approvals & Execution**
4. Confirm label references **repo** `.cursor/permissions.json` (not a bloated user allowlist)
5. Command allowlist should match repo file (git, pnpm, rg, verify helpers)

If UI still shows only `~/.cursor/permissions.json`, remove `approvalMode` and
`terminalAllowlist` from the user file and reload.

## 2026 Cursor Agent workflow checklist

### Committed in repo (verify)

| Item | Location | Status |
| --- | --- | --- |
| Four-rule baseline | `.cursor/rules/00–30*.mdc` | Active |
| Always-on index | `.cursor/index.mdc` | Active |
| Hook chain | `.cursor/hooks.json` | afterEdit + stop autofix |
| Repo skills | `.cursor/skills/*/SKILL.md` | verify, handoff, app-boundary |
| Subagents | `.cursor/agents/*.md` | explore, ci-investigator, crown-jewel |
| Sandbox paths | `.cursor/sandbox.json` | Workspace-relative |
| Permissions SSOT | `.cursor/permissions.json` | Allowlist + blocks |
| MCP template | `mcp.json.example` | Stubs only |
| Editor defaults | `.vscode/settings.shared.json` | Shared formatting |
| Automation recipes | `007-cursor-automations.md` | Documented |

### Operator-only (cannot commit)

| Item | Where | Action |
| --- | --- | --- |
| Automations | Agents Window | Create `abyss-pr-verify-reminder`, `abyss-ssot-handoff-nudge` |
| MCP runtime | `.mcp.json` (gitignored) or Marketplace plugins | Wire tokens locally |
| kluster rule | `.cursor/rules/kluster-code-verify.mdc` (gitignored) | Per workstation |
| User permissions | `~/.cursor/permissions.json` | Minimal; see example |

## Two-mode operating model

### Safe-Quick (Class A)

- Read SSOT → answer / audit / map risk
- Delegate to `explore-readonly` subagent when useful
- No file edits without explicit ask

### Safe-Execute (Class B/C)

1. Inspect relevant code + governance docs
2. Brief plan (Bahasa OK for Chief-facing text)
3. Smallest complete diff
4. Run skill `abyss-verify` checks
5. Update `.agent/sessions/YYYY-MM-DD.md` + HANDOFF if state changed
6. Class C → stop for Chief **GO** (auth, schema, deploy, PHI, sentra)

## Cursor 3.x tricks (ABYSS-safe)

| Trick | Use when | Guardrail |
| --- | --- | --- |
| **Plan mode** | Multi-step or ambiguous scope | No implementation until approved |
| **Debug mode** | Test/lint failures | Evidence before fix |
| **Ask mode** | Explaining code | Read-only |
| **`@path` context** | Thin context on large repo | Prefer scoped paths |
| **`/worktree`** | Isolated agent run | Do not mix with dirty main-tree Class C |
| **`/best-of-n`** | High-risk sentra/CT change | Chief GO required |
| **`/multitask`** | Parallel package fixes | One mission per package |
| **`/loop`** | Recurring verify nudge | See 007 automations doc |
| **Subagent delegation** | CI failure, sentra review | Use `.cursor/agents/` profiles |
| **Repo skills** | Done claim, apps work, handoff | Auto-trigger via SKILL.md |

## Hook chain (reminder)

```text
afterFileEdit → after-edit.mjs → post-tool-use.ps1
stop          → autofix-loop.mjs (max 5; skips stale edit-log)
```

Smoke:

```powershell
'{"file_path":".cursor/README.md","edits":[{}]}' | node .cursor/hooks/after-edit.mjs
pwsh -NoProfile -ExecutionPolicy Bypass -File tooling/governance/agent/hooks/post-tool-use.ps1
```

## MCP policy (2026)

- **Context7** — public framework/library docs only (`AGENTS.md`)
- **Marketplace plugins** — Supabase, Prisma, Sentry, etc.; local tokens only
- **No `*:*` MCP allowlist** in repo permissions — approve MCP writes manually
- UNICOM hub — see `docs/specs/007-unicom-hub-v1.md`

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| UI shows user allowlist, not repo | Slim `~/.cursor/permissions.json`; reload window |
| Run Mode dropdown missing | Expected when permissions file active |
| Sandbox unavailable (Windows) | Normal; allowlist still applies |
| Agent asks every shell command | Command not in `terminalAllowlist` — add via PR to repo file |
| Automations missing | Create in Agents Window (not in Git) |

## Related

- [006-cursor-audit.md](./006-cursor-audit.md) — audit severity + rollback
- [007-cursor-automations.md](./007-cursor-automations.md) — automation recipes
- [`.cursor/README.md`](../../.cursor/README.md) — file inventory
