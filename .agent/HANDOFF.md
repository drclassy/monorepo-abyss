# HANDOFF - Current State and Next Action

Update every meaningful session. This is the first active file the next agent
should read after `.agent/README.md`.

Last updated: 2026-05-17

## Snapshot

- Repo: `D:\Devops\abyss-monorepo`
- Branch: `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar`
- HEAD: `3039306`
- Active work: ABYSS monorepo stabilization and SSOT simplification
- Mode: small, scoped changes only
- `.agent/` is the operational SSOT; `AGENTS.md` is the public rulebook.
- `.agent/` has been simplified to knowledge files only. Tooling now belongs in
  `tooling/governance/agent/`.

## Read First

Use the current simplified SSOT order:

1. `.agent/README.md`
2. `.agent/HANDOFF.md`
3. `.agent/CONTEXT.md` when touching repo boundaries or protected areas
4. `.agent/PROGRESS.md` for milestone status
5. `.agent/DECISIONS.md` for durable decisions and lessons

Do not expect the old generated `DIGEST.md`, root `LESSONS.md`, or
`SESSION_STATE.md` files to exist. Their old content was superseded or archived
as part of the SSOT simplification.

## Current Technical State

- Root `pnpm typecheck -- --pretty false` passes.
- Root `pnpm build` passes.
- `pnpm exec eslint --print-config eslint.config.mjs` passes.
- Normal pre-commit hook passed on commit `69168bf`.
- Global verification blockers from the stabilization chain are cleared.

## Completed In This Stabilization Chain

- `apps/academic/academic-solutions` build got past the missing
  `@/hooks/use-mobile` blocker.
- `@the-abyss/orchestrator` got past stale/missing Prisma exports by making
  database Prisma generation explicit before dependent builds.
- `@the-abyss/daf-website` Windows local build got past Next standalone symlink
  EPERM by making standalone output opt-in with `NEXT_STANDALONE=true`.
- `packages/shared/sentra-ui/src/index.ts` export conflicts were fixed by
  keeping local UI exports and changing Radix/Lucide wildcard exports to
  namespace exports.
- `tooling/abyss-cli/src/index.ts` unused `__filename` / `__dirname` setup was
  removed.
- `packages/sentra/sentra-nada/src/engine/early-warning.ts` unused internal
  `input` parameter was removed after explicit approval.
- `packages/sentra/sentra-pustaka/src/embedding/approved-embedding.pipeline.ts`
  unused imports were removed after explicit approval.
- Typecheck fixture and app-local Prisma client typing fixes were completed.
- ESLint and typecheck gates were restored.

## Completed Commits

- `60698fa` `fix(sentra): stabilize typecheck fixtures`
- `0210c86` `fix(intelligenceboard): use app-local prisma client types`
- `b4464bf` `fix(sentra): remove typecheck-blocking unused declarations`
- `69168bf` `fix(tooling): restore eslint and typecheck gates`

## Important Changed Files From This Chain

- `packages/platform/database/package.json`
- `platform/orchestrator/package.json`
- `turbo.json`
- `apps/community/daf-website/next.config.ts`
- `packages/shared/sentra-ui/src/index.ts`
- `tooling/abyss-cli/src/index.ts`
- `packages/sentra/sentra-nada/src/engine/early-warning.ts`
- `packages/sentra/sentra-pustaka/src/embedding/approved-embedding.pipeline.ts`

Note: `apps/community/daf-website/next.config.ts` may not appear in root git
diff because parts of `apps/` are ignored by the current repo rules.

## Remaining Follow-Up

1. `apps/corporate/ferdiiskandar/AGENTS.md`
   - Governance healthcheck still reports stale references.
   - Treat as governance cleanup, not product rewrite.

## Guardrails

- Do not delete, clean, reset, move, or treat `.agent/` as junk.
- Do not touch `packages/sentra/**` automatically.
- Treat `packages/sentra/**` as crown-jewel / review-first territory.
- Diagnose first, report, then wait for Chief approval before crown-jewel edits.
- Do not change schemas, providers, auth behavior, deployment config, or
  architecture unless explicitly scoped.
- Do not run destructive Git commands.
- Keep each fix one file or one issue at a time.
- Do not claim build, typecheck, or tests passed without fresh verification.

## Suggested Next Action

Plan the `.agent/` migration commit with the active SSOT files and their
archive/report/session preservation files together.

Verification before commit planning:

```powershell
pnpm typecheck -- --pretty false
pnpm build
git diff --stat
```
