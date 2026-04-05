---
id: "a4fe60b5-1180-46ae-9673-db3b40a7ccf9"
entity_type: "task"
entity_id: "0720debf-eedf-43fd-b85b-4694cff35bbb"
title: "Configure architectural boundary enforcement as a dedicated CI job - Notes"
status: "todo"
priority: "high"
display_id: "SEN-14"
parent_task_id: "5a4799f6-2c04-472f-b3b6-e01d48e2b6dd"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:30:09.044196+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Add an `architecture-validation` job to the CI pipeline that runs ESLint boundary rules across all packages and blocks PR merges on any cross-domain import violation.

## Implementation Approach

1. Add an `architecture-validation` job to `.github/workflows/ci.yml` (runs in parallel with `quality-checks`)
2. Use identical setup steps: Node 22, pnpm 9, `pnpm install --frozen-lockfile`
3. Execute `pnpm turbo run lint:arch` (or `pnpm eslint . --rule "import/no-restricted-paths: error"`) against the full workspace
4. Pipe output to `arch-violations.txt`
5. Upload `arch-violations.txt` as a workflow artifact via `actions/upload-artifact@v4` (7-day retention)
6. Write violation count to `$GITHUB_STEP_SUMMARY` for inline PR feedback
7. Ensure non-zero exit on any violation to block PR merges

## Acceptance Criteria

- `architecture-validation` job exists in `ci.yml` and runs on every pull request
- Executes boundary lint against ALL packages (not just changed ones)
- Exits with code 1 and blocks PR when any violation is detected
- Violation report uploaded as a GitHub Actions artifact (7-day retention)
- Step summary written to `$GITHUB_STEP_SUMMARY` with pass/fail count
- Runs in parallel with `quality-checks`, not sequentially
- A PR with a deliberate violation fails; a clean PR passes

## Technical Constraints

- Must target all packages — boundary rules are global constraints, not incremental
- Parallel execution with `quality-checks` to avoid adding to total CI time
- Non-zero exit on violation is mandatory to block merges
- Artifact retention capped at 7 days to limit storage usage
- Actual ESLint boundary rule definitions are owned by the Turborepo Build Pipeline sibling task

## Code Patterns to Follow

- Boundary linting invoked via `pnpm turbo run lint:arch` or equivalent ESLint workspace-wide command
- Artifacts uploaded via `actions/upload-artifact@v4`
- Step summaries written to `$GITHUB_STEP_SUMMARY`

## Relevant Files

### Files to Modify

- `.github/workflows/ci.yml` — Add `architecture-validation` job alongside existing `quality-checks`## Details

**Scope**: Add an `architecture-validation` job to `.github/workflows/ci.yml` that executes the Nx boundary lint target across all packages, fails on violations, and uploads a violations artifact.

**Out of Scope**: Defining the actual Nx boundary rules, tags, or `@nx/enforce-module-boundaries` ESLint config (owned by sibling Nx Build Pipeline task); core lint/build/test CI jobs (previous subtask); CODEOWNERS and PR governance (separate subtask).

**Implementation**: 1. Add an `architecture-validation` job to `.github/workflows/ci.yml` that runs in parallel with `quality-checks`. 2. Use the same setup steps (Node 22, pnpm 9, pnpm install --frozen-lockfile). 3. Run `pnpm nx run-many --target=lint --all -- --rule "@nx/enforce-module-boundaries: error"` or invoke the dedicated `lint:arch` script defined by the Nx task. 4. Pipe stdout/stderr to `arch-violations.txt`. 5. Use `actions/upload-artifact@v4` to upload `arch-violations.txt` as a workflow artifact (retained 7 days) so developers can inspect boundary failures. 6. Ensure the step returns a non-zero exit code on violations so the job fails and blocks PR merges. 7. Add a summary step that prints violation count to the GitHub Actions step summary using `>> $GITHUB_STEP_SUMMARY`.

**Constraints**: Must run against ALL packages, not just affected ones, because boundary rules are global constraints, Job should not share the same runner as the quality-checks job to allow parallel execution, Non-zero exit code on any boundary violation is mandatory — the job must block PR merges when violations are detected, Artifact retention should be set to 7 days to avoid storage accumulation

**Patterns**: Architectural boundary linting is invoked via `pnpm nx run-many --target=lint:arch --all`, Nx enforce-module-boundaries rule is configured in the sibling Nx Build Pipeline task, Violation artifacts are uploaded via `actions/upload-artifact@v4` so they appear on the workflow summary

**Relevant Files**: modify: `.github/workflows/ci.yml` - Add the `architecture-validation` job alongside the existing quality-checks job

## Acceptance Criteria

- [ ] An `architecture-validation` job exists in `.github/workflows/ci.yml` and runs on every pull request
- [ ] The job executes the Nx boundary lint target across all workspace packages (not just affected)
- [ ] The job exits with code 1 and blocks the PR when any cross-domain import violation is detected
- [ ] A violation report is uploaded as a GitHub Actions artifact and retained for 7 days
- [ ] A step summary is written to `$GITHUB_STEP_SUMMARY` with the violation count or a pass message
- [ ] The job runs in parallel with the `quality-checks` job, not sequentially after it
- [ ] A PR introducing a deliberate boundary violation fails this job while a clean PR passes it

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 4 |

