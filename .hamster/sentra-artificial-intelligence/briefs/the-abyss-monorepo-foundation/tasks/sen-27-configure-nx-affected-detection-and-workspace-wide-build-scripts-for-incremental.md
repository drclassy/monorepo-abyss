---
id: "5053c84c-dca4-45a9-8f79-fff982a05eae"
entity_type: "task"
entity_id: "fc8358ce-5b2a-4e0e-9bd4-40c3e0a8c0b4"
title: "Configure Nx affected detection and workspace-wide build scripts for incremental execution - Notes"
status: "todo"
priority: "medium"
display_id: "SEN-27"
parent_task_id: "8a613e82-cbcc-45af-b3b8-057235b03249"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:31:12.901027+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Wire up Turborepo `--filter=[HEAD^1]...` as the incremental execution mechanism in root `package.json` scripts so builds, tests, and lint runs only process packages changed relative to the previous commit and their transitive dependents.

## Implementation Approach

1. Confirm `turbo` is installed at workspace root (from subtask SEN-11)
2. Add four affected scripts to root `package.json`:

- `"build:affected": "turbo run build --filter=[HEAD^1]..."`
- `"test:affected": "turbo run test --filter=[HEAD^1]..."`
- `"lint:affected": "turbo run lint --filter=[HEAD^1]..."`
- `"type-check:affected": "turbo run type-check --filter=[HEAD^1]..."`

1. Test `pnpm build:affected` on a branch with a single file change — confirm only the changed package and its dependents are listed
2. Test custom base override: `pnpm turbo run build --filter=[origin/main]...` to verify flexibility
3. Run `pnpm turbo run build --graph=out.html` to generate the HTML dependency graph trace
4. Write `docs/dev/turbo-guide.md` covering: filter syntax explanation, example commands, custom base override, and the `--graph` visualiser

## Acceptance Criteria

- `pnpm build:affected` with a single-package change lists only that package and its dependents
- `--filter=[origin/main]...` override works correctly for custom base comparisons
- Root `package.json` has all four affected scripts using `turbo run --filter`
- `pnpm turbo run build --graph=out.html` generates the dependency graph without errors
- `docs/dev/turbo-guide.md` documents filter detection with command examples and a base override guide

## Technical Constraints

- `turbo` must be installed at workspace root (not globally) for version consistency
- `--filter` flag must accept any valid git ref: branch name, SHA, `HEAD~N`
- At least one git commit must exist before git-based filter expressions are meaningful
- Scripts must work with pnpm's workspace context — do not hard-code absolute paths

## Code Patterns to Follow

- Turborepo filter syntax: `--filter=[HEAD^1]...` (square brackets = git diff, `...` = include dependents)
- `--graph=out.html` outputs the dependency graph as an HTML trace file
- All affected scripts follow `turbo run <target> --filter=<expression>` pattern

## Relevant Files

### Files to Create

- `docs/dev/turbo-guide.md` — Turborepo filter detection workflow and command reference

### Files to Modify

- `package.json` — Add four affected scripts using `turbo run --filter=[HEAD^1]...`## Details

**Scope**: Add nx affected scripts to root package.json, confirm nx.json defaultBase setting, and write developer documentation explaining how affected detection works and how to use it locally.

**Out of Scope**: Setting NX_BASE and NX_HEAD in GitHub Actions (sibling task: CI/CD Governance Pipeline), architectural boundary tag configuration (subtask 3), Turborepo turbo.json pipeline definition (subtask 1), and remote cache provider setup (subtask 2).

**Implementation**: 1. Confirm `nx` is installed at workspace root (from subtask 3 — `@nx/devkit` and `nx` packages).
2. Verify `nx.json` has `"defaultBase": "main"` set.
3. Add the following scripts to root `package.json`:
   - `"build:affected": "nx affected --target=build"`
   - `"test:affected": "nx affected --target=test"`
   - `"lint:affected": "nx affected --target=lint"`
   - `"type-check:affected": "nx affected --target=type-check"`
4. Test `pnpm build:affected` on a branch with a single file change; confirm only the changed project and its dependents are listed.
5. Test `pnpm build:affected --base=origin/main` to verify the base override flag works.
6. Run `nx graph` to generate the interactive project dependency graph and include a screenshot or description in the documentation.
7. Write `docs/dev/turbo-guide.md` covering: affected algorithm explanation, example commands, base branch override, and the project graph visualiser (`pnpm nx graph`).

**Constraints**: Requires `nx` CLI installed at workspace root — not globally — so all developers use the same version., `nx affected` requires at least one commit in the repository to compare against — the initial commit must exist before these commands are meaningful., The `--base` flag must accept any valid git ref (branch name, SHA, `HEAD~N`) for maximum flexibility., Scripts must work with pnpm's workspace context — do not hard-code absolute paths., defaultBase in nx.json must match the protected default branch name (`main`), not `master` or `develop`.

**Relevant Files**: modify: `package.json` - Root package.json updated with affected-specific scripts (build:affected, test:affected, lint:affected, type-check:affected) using nx affected --target.; modify: `nx.json` - Confirm defaultBase is set to 'main' for correct affected comparison baseline.; create: `docs/dev/turbo-guide.md` - Developer guide documenting how nx affected works, how to run affected commands locally, and how to override the base branch.

## Acceptance Criteria

- [ ] Running `pnpm build:affected` on a branch where only one package has changed lists only that package and its dependents as tasks to execute.
- [ ] `pnpm build:affected --base=origin/develop` correctly uses `origin/develop` as the comparison baseline.
- [ ] Root `package.json` contains `build:affected`, `test:affected`, `lint:affected`, and `type-check:affected` scripts.
- [ ] `nx.json` has `"defaultBase": "main"` confirmed.
- [ ] Running `pnpm nx graph` opens the interactive project dependency graph without errors.
- [ ] `docs/dev/turbo-guide.md` explains affected detection, includes example commands, and documents the base override flag.

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 3 |

