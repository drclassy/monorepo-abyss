# Cursor workspace

This folder keeps the shared Cursor configuration for The Abyss monorepo.

Operator guide:
[`docs/guides/006-cursor-audit.md`](../docs/guides/006-cursor-audit.md)
Automation catalog:
[`docs/guides/007-cursor-automations.md`](../docs/guides/007-cursor-automations.md)

## Active files

| Path                             | Purpose                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `.cursor/index.mdc`              | Always-on compact index and precedence reminder.                              |
| `.cursor/rules/00-core.mdc`      | Core operating rule: identity, guard, GO gate, session logging, verification. |
| `.cursor/rules/10-backend.mdc`   | Backend/API/database/NestJS/FHIR/PHI guardrails.                              |
| `.cursor/rules/20-frontend.mdc`  | Frontend/UI/design-token guardrails.                                          |
| `.cursor/rules/30-quality.mdc`   | TypeScript, tests, monorepo conventions, verification, references.            |
| `.cursor/hooks.json`             | Cursor hook entrypoint (afterFileEdit chain + stop autofix).                  |
| `.cursor/hooks/after-edit.mjs`   | Logs edited files to `.cursor/hooks/edit-log.txt`.                            |
| `.cursor/hooks/autofix-loop.mjs` | Stop hook: lint/typecheck follow-up when recent edits exist.                  |
| `.cursor/skills/`                | Repo-scoped ABYSS workflow skills (`SKILL.md` per skill).                     |
| `.cursor/agents/`                | Repo-scoped subagent profiles for delegation.                                 |
| `.cursor/sandbox.json`           | Cursor Agent read/write path configuration.                                   |
| `.cursor/permissions.json`       | Shell/MCP allowlist + classifier block instructions (healthcare guardrails).  |

## Rule policy

- `AGENTS.md` is authoritative.
- `.agent/` holds operational state.
- Cursor rules only add IDE-scoped reminders.
- Keep rules small and merged by domain.
- Do not add new `.cursor` files unless the behavior cannot fit the four-rule
  structure plus skills/agents/hooks documented here.

### Third-party review rules (local only)

`.cursor/rules/kluster-code-verify.mdc` is **gitignored** and installed per
workstation (kluster plugin or local copy). It is not part of the shared
four-rule team baseline. Teammates without kluster are unaffected.

## Hooks

`hooks.json` runs hooks in order:

| Event           | Script                                | Purpose                                                          |
| --------------- | ------------------------------------- | ---------------------------------------------------------------- |
| `afterFileEdit` | `node .cursor/hooks/after-edit.mjs`   | Append edit trail for autofix guard                              |
| `afterFileEdit` | `post-tool-use.ps1`                   | Append `.agent/sessions/YYYY-MM-DD.md` + SSOT reminder           |
| `stop`          | `node .cursor/hooks/autofix-loop.mjs` | Lint/typecheck follow-up (max 5 loops; skips if no recent edits) |

Hook logs (`.cursor/hooks/edit-log.txt`, `session-log.txt`) are ignored by Git.

Manual smoke test:

```powershell
'{"file_path":".cursor/README.md","edits":[{}]}' | node .cursor/hooks/after-edit.mjs
pwsh -NoProfile -ExecutionPolicy Bypass -File tooling/governance/agent/hooks/post-tool-use.ps1
```

## Skills

Repo skills live in `.cursor/skills/<name>/SKILL.md`. They supplement — not
replace — root `AGENTS.md`. Cursor loads them when triggers match.

| Skill                    | Use when                                              |
| ------------------------ | ----------------------------------------------------- |
| `abyss-verify`           | Claiming done, typecheck, lint, or broad verification |
| `abyss-handoff`          | Session end, handoff, continuity updates              |
| `app-boundary-preflight` | Any work under `apps/`                                |

## Subagents

Repo subagents live in `.cursor/agents/*.md` (root level only — no subdirs).

| Agent                  | Use when                                                 |
| ---------------------- | -------------------------------------------------------- |
| `explore-readonly`     | Class A read-only audit or search                        |
| `ci-investigator`      | PR or CI check failures                                  |
| `crown-jewel-reviewer` | `packages/sentra/**` — diagnose only, no edit without GO |

## Sandbox

`sandbox.json` uses workspace-relative paths so the file stays portable across
machines. Legacy paths (`.codex/**`, `.agents/**`) were removed in the
2026-05-30 hardening pass.

## MCP policy

- **Committed template:** root [`mcp.json.example`](../mcp.json.example) — stubs
  and setup notes only, no secrets.
- **Local runtime:** `.mcp.json` stays gitignored; each developer wires tokens
  locally or via Cursor Marketplace plugins (Context7, Supabase, Prisma, Sentry,
  etc.).
- **UNICOM hub:** see
  [`docs/specs/007-unicom-hub-v1.md`](../docs/specs/007-unicom-hub-v1.md) for
  agent communication MCP wiring.

Per `AGENTS.md`, use Context7 for public framework/library documentation only.

## Run Mode (Auto-review)

Configure in **Cursor Settings → Agents → Run Mode → Auto-review** (Cursor
3.6+). This uses a classifier for Shell, MCP, and Fetch calls:
allowlisted/sandboxed actions run automatically; sensitive actions require
approval.

Recommended for ABYSS:

1. Enable **Auto-review** (not Full auto / YOLO).
2. Enable **Sandbox** when available for agent file/shell isolation.
3. Keep [`.cursor/permissions.json`](permissions.json) tracked — block
   instructions steer the classifier for healthcare/repo guardrails.
4. Optional: add custom classifier instructions in Run Mode settings:

```text
Healthcare monorepo (ABYSS). Block auto-approval for: git push/reset/clean,
terraform apply, DB migrations, auth changes, .env/secrets access, MCP writes
to production, and any edit under packages/sentra/** without explicit GO.
Prefer scoped pnpm --filter verification over root-wide commands when possible.
```

User-level `~/.cursor/permissions.json` may add personal allowlist entries; repo
policy in `.cursor/permissions.json` takes precedence for this workspace.

## Automations

Cursor Automations are configured in the **Agents Window** (or
cursor.com/automations). Starter recipes are documented in
[`docs/guides/007-cursor-automations.md`](../docs/guides/007-cursor-automations.md).
Automations that touch Git write or CI are Class C — require explicit Chief GO.
