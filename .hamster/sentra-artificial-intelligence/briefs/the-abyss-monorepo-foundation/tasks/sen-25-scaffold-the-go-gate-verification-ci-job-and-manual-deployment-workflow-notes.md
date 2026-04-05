---
id: "bd6c88ff-2f6d-43a9-a6c8-2b8beac4f05f"
entity_type: "task"
entity_id: "86416b54-fe7e-49ed-99bf-92404f630e74"
title: "Scaffold the GO-Gate verification CI job and manual deployment workflow - Notes"
status: "todo"
priority: "medium"
display_id: "SEN-25"
parent_task_id: "5a4799f6-2c04-472f-b3b6-e01d48e2b6dd"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:30:50.579575+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Configure ESLint `import/no-restricted-paths` rules in root `.eslintrc.json` to enforce domain boundary isolation across all four strategic concentrations (Healthcare, Academic, Incubator, Internal).

## Implementation Approach

1. Ensure `eslint-plugin-import` is installed at the workspace root (aligns with SEN-20 which installs base ESLint deps)
2. Add `import/no-restricted-paths` to root `.eslintrc.json` with zones for each domain:

- `apps/healthcare/**` → restricted from importing any `apps/academic/**`, `apps/incubator/**`, `apps/internal/**`
- `apps/academic/**` → restricted from importing any `apps/healthcare/**`, `apps/incubator/**`, `apps/internal/**`
- `apps/incubator/**` → restricted from importing any `apps/healthcare/**`, `apps/academic/**`, `apps/internal/**`
- `apps/internal/**` → restricted from importing any `apps/healthcare/**`, `apps/academic/**`, `apps/incubator/**`
- `packages/**` → restricted from importing any `apps/**`

1. Add `import/no-internal-modules` rule to enforce public API boundaries within packages
2. Add a dedicated `lint:arch` script to root `package.json` (`eslint . --ext .ts,.tsx --rule "import/no-restricted-paths: error"`) for targeted boundary validation
3. Validate with a deliberate violation (e.g., import from `apps/healthcare/` in `apps/academic/`) — must produce an ESLint error
4. Confirm `pnpm turbo run lint` catches violations before they reach CI

## Acceptance Criteria

- Root `.eslintrc.json` contains `import/no-restricted-paths` with all four domain boundary zones
- `pnpm lint:arch` exits with code 0 on a clean workspace
- Introducing a deliberate cross-domain import causes `pnpm lint:arch` to exit with code 1 and a descriptive error message
- `packages/**` cannot import from `apps/**` — validated by test
- `import/no-internal-modules` prevents deep imports into package internals
- Rules apply to all TypeScript files via the correct ESLint `overrides` block

## Technical Constraints

- `eslint-plugin-import` must be installed at workspace root
- Zones must match the exact directory paths used in `pnpm-workspace.yaml`
- Rules must be wired into the standard `lint` target so Turborepo caches them correctly
- Must not conflict with TypeScript path alias resolution (`@the-abyss/*`)

## Code Patterns to Follow

- `import/no-restricted-paths` configured under `rules` in root `.eslintrc.json`
- `lint:arch` script uses `eslint .` with `--ext .ts,.tsx` for TypeScript coverage
- Override blocks target `**/*.ts` and `**/*.tsx` patterns specifically

## Relevant Files

### Files to Modify

- `package.json` — Add `lint:arch` script for targeted boundary validation## Details

**Scope**: Create `.github/workflows/go-gate.yml` with a HANDOFF.md presence and approval-string check (Phase 1 scaffold, warns rather than hard-fails if absent); create `scripts/go-gate-check.sh` implementing the Phase 1 check logic; create `.github/workflows/deploy.yml` as a manual-dispatch stub.

**Out of Scope**: Full `iskandar-gatekeeper` CLI implementation (Phase 2/3); actual deployment scripts or infrastructure provisioning (Phase 7); Nx boundary rules (sibling task); core lint/build/test CI jobs (separate subtask).

**Implementation**: 1. Create `.github/workflows/go-gate.yml` triggered on `pull_request` with paths filter `['apps/**', 'packages/**', 'docs/tasks/**', '.agents/**']`. 2. Add a `go-gate-check` job that checks out with `fetch-depth: 0`. 3. Identify changed files with `git diff --name-only origin/main...HEAD`. 4. Call `scripts/go-gate-check.sh` passing the list of changed files. 5. In `scripts/go-gate-check.sh`: search changed files for any `*HANDOFF*.md`; if found, grep for `## Plan Approved By Chief` and a non-empty approval date; if approval string is missing, print a warning and exit 1; if no HANDOFF.md is present at all, print an informational warning and exit 0 (Phase 1 leniency). 6. Add a workflow summary step writing the result to `$GITHUB_STEP_SUMMARY`. 7. Create `.github/workflows/deploy.yml` with `workflow_dispatch` trigger, `environment` input (choice: staging/production), standard setup steps (Node 22, pnpm 9, `pnpm install --frozen-lockfile`), a `pnpm turbo run build` step, and a placeholder deploy step that echoes the target environment.

**Constraints**: Phase 1 GO-Gate check must NOT hard-fail if no HANDOFF.md is present — exit 0 with informational warning to avoid blocking normal fix-up commits, If a HANDOFF.md IS present but lacks the approval string, the check MUST exit 1 to block merge, The `go-gate-check` job must be registered as a required status check in branch protection so Phase 2 can harden it without changing protection rules, Deploy workflow must use GitHub `environment` contexts (staging/production) to support future environment secrets and deployment rules, No real deployment commands or secrets should be added in Phase 1

**Patterns**: GO-Gate enforcement workflow triggers on `pull_request` with `paths` filter covering `apps/**`, `packages/**`, `docs/tasks/**`, `.agents/**`, HANDOFF.md validation extracts task ID from changed files and checks for approval string using grep, Deploy workflow uses `workflow_dispatch` with `environment` input and `type: choice` options `[staging, production]`, Phase 3 docs show `pnpm iskandar-gatekeeper validate-handoff` as the full validator — Phase 1 uses a shell script placeholder

**Relevant Files**: create: `.github/workflows/go-gate.yml` - Standalone GO-Gate verification workflow that checks for HANDOFF.md approval on every PR; create: `.github/workflows/deploy.yml` - Manual-trigger deployment workflow stub for staging and production environments; create: `scripts/go-gate-check.sh` - Shell script that implements the Phase 1 HANDOFF.md presence and approval string check

## Acceptance Criteria

- [ ] `.github/workflows/go-gate.yml` exists, triggers on pull requests touching `apps/**`, `packages/**`, or `.agents/**`, and runs a `go-gate-check` job
- [ ] `scripts/go-gate-check.sh` exists, is executable, and exits 0 (with warning) when no HANDOFF.md is present in the PR's changed files
- [ ] `scripts/go-gate-check.sh` exits 1 when a HANDOFF.md is present but does not contain the `## Plan Approved By Chief` approval string
- [ ] The `go-gate-check` job writes a pass/fail summary to `$GITHUB_STEP_SUMMARY`
- [ ] `.github/workflows/deploy.yml` exists with a `workflow_dispatch` trigger, environment choice input (staging/production), full build step, and a placeholder deploy echo
- [ ] The deploy workflow can be triggered manually from the GitHub Actions UI with either environment option
- [ ] Both new workflow files are valid YAML and pass `actionlint` or equivalent schema validation

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 4 |

