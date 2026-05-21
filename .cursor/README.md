# Cursor workspace

This folder keeps the shared Cursor configuration for The Abyss monorepo.

## Active files

| Path                             | Purpose                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `.cursor/index.mdc`              | Always-on compact index and precedence reminder.                              |
| `.cursor/rules/00-core.mdc`      | Core operating rule: identity, guard, GO gate, session logging, verification. |
| `.cursor/rules/10-backend.mdc`   | Backend/API/database/NestJS/FHIR/PHI guardrails.                              |
| `.cursor/rules/20-frontend.mdc`  | Frontend/UI/design-token guardrails.                                          |
| `.cursor/rules/30-quality.mdc`   | TypeScript, tests, monorepo conventions, verification, references.            |
| `.cursor/hooks.json`             | Cursor hook entrypoint.                                                       |
| `.cursor/hooks/after-edit.mjs`   | Tracked hook script.                                                          |
| `.cursor/hooks/autofix-loop.mjs` | Tracked hook script.                                                          |
| `.cursor/sandbox.json`           | Cursor Agent read/write path configuration.                                   |

## Rule policy

- `AGENTS.md` is authoritative.
- `.agent/` holds operational state.
- Cursor rules only add IDE-scoped reminders.
- Keep rules small and merged by domain.
- Do not add new `.cursor` files unless the behavior cannot fit the four-rule
  structure.

## Hooks

`hooks.json` calls scripts under `.cursor/hooks/`. Hook logs are ignored by Git.

## Sandbox

`sandbox.json` uses workspace-relative paths so the file stays portable across
machines.

## MCP

Use root `mcp.json.example` as the committed template. Local `.mcp.json` stays
ignored.
