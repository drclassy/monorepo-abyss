# HANDOFF - Current State and Next Action

Update every meaningful session. This is the first active file the next agent
should read after `.agent/README.md`.

Last updated: 2026-05-17

## Snapshot

- Repo: `D:\Devops\abyss-monorepo`
- Branch: `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar`
- HEAD: includes `ad42434`
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
- Normal pre-commit hook passed on recent hygiene commits through `ad42434`.
- Global verification blockers from the stabilization chain are cleared.
- Do not push yet. Finish dirty tree classification and app import review first.

## Completed In This Stabilization Chain

- `apps/academic/academic-solutions` build got past the missing
  `@/hooks/use-mobile` blocker.
- `@the-abyss/orchestrator` got past stale/missing Prisma exports by making
  database Prisma generation explicit before dependent builds.
- `@the-abyss/daf-website` Windows local build got past Next standalone symlink
  EPERM by making standalone output opt-in with `NEXT_STANDALONE=true`.
- `packages/shared/sentra-ui/src/index.ts` export conflicts were fixed by
  preserving direct exports and adding namespace aliases.
- `tooling/abyss-cli/src/index.ts` unused `__filename` / `__dirname` setup was
  removed.
- Governance/editor rule updates were committed.
- Workspace/build package config alignment was committed without including the
  lockfile.
- CLI cleanup was committed.
- `sentra-ui` compatibility shim was committed.
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
- `d89e7b8` `docs(agent): simplify SSOT and preserve archives`
- `87c310e` `chore(governance): migrate agent governance tooling`
- `ef5b6e4` `chore(repo): ignore local generated artifacts`
- `2623924` `chore(governance): remove migrated legacy agent rules`
- `39dd191` `docs(agent): add durable agent history`
- `d4a6e05` `docs(agent): add sanitized audit session`
- `379202a` `docs(governance): update editor agent rules`
- `c2ec0e8` `chore(workspace): align build and package config`
- `57079b9` `chore(cli): remove unused esm path helpers`
- `ad42434` `fix(ui): preserve direct exports with namespace aliases`

## Current Dirty Tree Review State

- Ignored/local artifact coverage was added and committed.
- Most generated artifacts were removed. `node_modules.bak-recovered/` still
  physically exists but is ignored and blocked by Windows access denial; do not
  force-delete it in normal review missions.
- Legacy tracked deletions were reviewed and committed as migrated cleanup:
  old `.agents/skills`, root `.clinerules`, and old Kilo plan file.
- Durable `.agent/reports` and `.agent/sessions` history was reviewed and
  committed.
- `.agent/sessions/2026-04-15-audit-scan.md` was sanitized and committed after
  the pre-commit secret and PHI scans passed.
- Remaining `.agent` untracked items are intentionally not committed yet:
  repeated `ssot-daily/*-backup/` folders, later small generated
  `ssot-daily/*.md` runs, `ssot-suggestions/`, and noisy session logs
  `2026-05-16.md` / `2026-05-17.md`.
- `.codex/hooks.json` remains HOLD.
- `.cursor/rules/design.mdc` remains HOLD.
- `apps/corporate/ferdiiskandar/**` app import remains HOLD.
- Untracked noisy `.agent` reports/sessions remain HOLD unless curated.

## Important Changed Files From This Chain

- Governance/editor docs and rules committed in `379202a`.
- Workspace/package config committed in `c2ec0e8`.
- CLI cleanup committed in `57079b9`.
- `sentra-ui` compatibility shim committed in `ad42434`.
- `apps/community/daf-website` dependency alignment was tested locally but is
  not a commit candidate now because the app path is ignored/untracked.
- `packages/sentra/sentra-nada/src/engine/early-warning.ts`
- `packages/sentra/sentra-pustaka/src/embedding/approved-embedding.pipeline.ts`

Note: `apps/community/daf-website/next.config.ts` may not appear in root git
diff because parts of `apps/` are ignored by the current repo rules.

## Remaining Follow-Up

1. `apps/corporate/ferdiiskandar/AGENTS.md`
   - Governance healthcheck still reports stale references.
   - Treat as governance cleanup, not product rewrite.
2. Re-run dirty tree classification after the hygiene commits.
3. Keep `.codex/hooks.json` and `.cursor/rules/design.mdc` on HOLD until
   separate targeted review.
4. Review `apps/corporate/ferdiiskandar/**` app import only after the dirty tree
   classification is refreshed.
5. Keep untracked noisy `.agent` reports/sessions on HOLD unless Chief asks for
   a curated SSOT history commit.

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

Re-run dirty tree classification next, then review the
`apps/corporate/ferdiiskandar/**` app import separately. Keep this read-only
first:

```powershell
git status --short
git diff --stat
git diff --name-status
git ls-files --others --exclude-standard .cursor .codex
```

Do not push yet. Do not touch `apps/corporate/ferdiiskandar/.env.local`,
`node_modules.bak-recovered/**`, `.codex/hooks.json`, or
`.cursor/rules/design.mdc` without a targeted mission.

Verification before any next commit:

```powershell
pnpm typecheck -- --pretty false
pnpm build
git diff --stat
```
