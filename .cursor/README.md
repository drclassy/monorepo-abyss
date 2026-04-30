# Cursor workspace (The Abyss monorepo)

## Project Rules (UI: **Cursor → Settings → Project Rules**)

| Location | Role |
|----------|------|
| `.cursor/index.mdc` | Compact **always-on** layer: Sentra identity, precedence vs [`AGENTS.md`](../AGENTS.md), pointer table to scoped rules. |
| `.cursor/rules/00-constitution.mdc` | **Always-on** SSOT reminder: JET Protocol, GUARD 1–3, NestJS enforcement. |
| `.cursor/rules/01-guard-context-init.mdc` | **Always-on** enforcement for the two most skipped steps: read `.agent/` before act, log local session notes after act. |
| `.cursor/rules/02-notebooklm-intelligence.mdc` | NotebookLM integration protocol (globs-based). |
| `.cursor/rules/03-agent-attitude.mdc` | Tone, rigor, and collaboration norms for agent output. |
| `.cursor/rules/04-state-machine-discipline.mdc` | State-machine discipline for workflows and handoffs. |
| `.cursor/rules/05-chief-directive-mode.mdc` | Chief-facing directive mode: Bahasa Indonesia, latest official notes first, concise plan, wait for `GO` before execution. |
| `.cursor/rules/06-handoff-master.mdc` | `.agent/` handoff and session-close discipline. |
| `.cursor/rules/07-monorepo-guard.mdc` | Turborepo / pnpm boundaries and package hygiene. |
| `.cursor/rules/08-session-summarizer.mdc` | Local session summary and PROGRESS logging expectations. |
| `.cursor/rules/10-backend/10-api-routes.mdc` | API / `route.ts` handlers: contract-first, validation, errors, no PHI. |
| `.cursor/rules/10-backend/20-database.mdc` | Prisma / `packages/database`, migrations, generate/migrate commands. |
| `.cursor/rules/10-backend/30-nestjs-cqrs-advanced.mdc` | NestJS CQRS and advanced backend patterns. |
| `.cursor/rules/20-frontend/10-components.mdc` | React / UI components: App Router, Tailwind, shared UI packages. |
| `.cursor/rules/20-frontend/20-nextjs-15-standard.mdc` | Next.js 15 App Router and frontend standards. |
| `.cursor/rules/30-quality/10-testing.mdc` | Tests and configs: honest verification, repo patterns. |
| `.cursor/rules/30-quality/20-general-conventions.mdc` | pnpm/Turborepo, language, commits, do-not rules, `AGENTS.md` hierarchy. |
| `.cursor/rules/30-quality/30-typescript-strict-sentra.mdc` | Strict TypeScript conventions for Sentra code. |
| `.cursor/rules/99-gold-standards.mdc` | Concrete `@file` references to gold-standard code patterns in the monorepo. |

### Rule loading order (numeric prefix)

```
00-  → Core governance (always-on)
01-  → Guard enforcement (always-on)
02-  → Intelligence protocol (globs-based)
05-  → Chief directive mode (always-on)
10-  → Backend rules
20-  → Frontend rules
30-  → Quality / conventions
99-  → Gold-standard references
```

All normative technical detail lives in **[`AGENTS.md`](../AGENTS.md)**; Cursor
rules only **point** to it and add path/glob-scoped guidance. For implementation
work, prefer the **nearest** `AGENTS.md` under `apps/<division>/<app>/`; use
**`@`** to attach that app folder or key files when context feels thin.

After pull, open **Project Rules** and confirm the list matches expectations
(reload window if needed).

## `.cursorignore` (index & retrieval)

**`.cursorignore`** at monorepo root controls **what Cursor does not index** for
AI context (less noise, more relevant retrieval).

**Currently excluded (typical):** `node_modules/`, build outputs (`.next/`,
`dist/`, …), `.git/`, Python caches, large binaries, `.env*`, selected
paths under `infrastructure/` and a few `packages/*` (see the file). **App
trees under `apps/` are indexed** unless a path is added here again.

**If a path is ever excluded again:** remove or comment the line in
`.cursorignore`, reload the window, or use **`@path`** to pull files into chat.

## `.cursorindexingignore` (indexing-only)

**`.cursorindexingignore`** narrows what gets **indexed** for retrieval while
still allowing explicit `@` references. Useful for large `docs/`, lockfiles,
or paths that rarely need ambient context. Keep in sync with team needs: over-
excluding can hide useful docs unless files are attached manually.

## Hooks

`hooks.json` runs scripts under `.cursor/hooks/` (e.g. post-edit logging). Hook
output `hooks/edit-log.txt` is gitignored; the `.mjs` hook scripts are tracked.

## Sandbox

`sandbox.json` expands Agent read/write paths. `additionalReadwritePaths` uses
workspace-relative globs (`**`) so the file is portable across machines (see
[Agent security](https://cursor.com/docs/agent/security.md)).

## MCP (local secrets)

Copy [`mcp.json.example`](../mcp.json.example) to **`.mcp.json`** at the monorepo
root and add servers per [MCP docs](https://cursor.com/docs/mcp.md). **`.mcp.json`
stays gitignored**; only the example is committed.

## 2026+ Best Practices

This workspace follows Cursor 2026+ recommended conventions:

- **`.cursor/rules/`** with multiple `.mdc` files (deprecated single `.cursorrules` replaced).
- **Numeric prefixes** control load order (`00-` → `99-`).
- **Subdirectories** for domain grouping (`10-backend/`, `20-frontend/`, `30-quality/`).
- **Modular scoping** via `globs` + `alwaysApply` — only load relevant rules per file context.
- **Under 500 lines** per rule file — each file stays focused and actionable.
- **`@file` references** in `99-gold-standards.mdc` anchor AI to concrete code examples.
- **Commit to Git** — shared `.cursor/` paths (rules, agents, hooks, index, README,
  sandbox) are tracked via root `.gitignore` negations; local hook log is ignored.

---

© 2026 Sentra Healthcare AI — internal tooling documentation.
