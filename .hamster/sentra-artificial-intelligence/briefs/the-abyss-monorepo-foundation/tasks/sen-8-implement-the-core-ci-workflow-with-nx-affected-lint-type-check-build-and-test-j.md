---
id: "00d8f623-494b-4d6a-b656-9045ae1415a0"
entity_type: "task"
entity_id: "129f85ad-3fbe-411f-aae9-c37b8e87165a"
title: "Implement the core CI workflow with Nx-affected lint, type-check, build, and test jobs - Notes"
status: "todo"
priority: "high"
display_id: "SEN-8"
parent_task_id: "5a4799f6-2c04-472f-b3b6-e01d48e2b6dd"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:29:51.583894+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Create `.github/workflows/ci.yml` — the primary CI workflow that runs lint, type-check, build, and test using Turborepo `--filter` on every pull request and push to protected branches.

## Implementation Approach

1. Create `.github/workflows/ci.yml` triggered on `pull_request` (main, develop) and `push` (main, develop)
2. Add a `quality-checks` job on `ubuntu-latest` with `timeout-minutes: 20`
3. Checkout with `fetch-depth: 0` (full history required for accurate git-based filtering)
4. Set up Node.js 22 and pnpm 9; cache pnpm store keyed on lockfile hash; cache Turborepo cache directory
5. Run `pnpm install --frozen-lockfile`
6. Execute `pnpm turbo run lint --filter=[HEAD^1]...`
7. Execute `pnpm turbo run type-check --filter=[HEAD^1]...`
8. Execute `pnpm turbo run build --filter=[HEAD^1]...`
9. Execute `pnpm turbo run test --filter=[HEAD^1]...`
10. Upload coverage via `codecov/codecov-action@v3`
11. Create `scripts/ci-validate.sh` and wire it as the Husky pre-push hook

## Acceptance Criteria

- `.github/workflows/ci.yml` exists and is valid YAML
- Triggers on `pull_request` and `push` to `main` and `develop`
- All four quality gates use `turbo run --filter=[HEAD^1]...` for incremental execution
- pnpm store and Turborepo cache are cached between runs
- Coverage reports are uploaded to Codecov after the test step
- Workflow completes in under 20 minutes on incremental changes
- `scripts/ci-validate.sh` exists, is executable, and mirrors CI gates
- Husky pre-push hook references `scripts/ci-validate.sh`

## Technical Constraints

- Must use Node.js 22 and pnpm 9 to match `engines` in root `package.json`
- `fetch-depth: 0` is required for accurate git diff in Turborepo filter expressions
- `--frozen-lockfile` prevents accidental lockfile mutations in CI
- Turborepo remote cache token must be injected via secrets, not hardcoded
- Use `GITHUB_TOKEN` for Codecov; no hardcoded personal tokens

## Code Patterns to Follow

- GitHub Actions workflows live in `.github/workflows/` as `.yml` files
- pnpm installed with `pnpm/action-setup@v2`, Node via `actions/setup-node@v4`
- Turborepo filter syntax: `--filter=[HEAD^1]...` targets packages changed since last commit and their dependents
- Coverage upload targets `coverage/coverage-final.json`

## Relevant Files

### Files to Create

- `.github/workflows/ci.yml` — Primary CI workflow with all quality gate jobs
- `scripts/ci-validate.sh` — Local pre-push validation script mirroring CI## Details

**Scope**: Create `.github/workflows/ci.yml` with jobs for lint, type-check, build, and test using Nx affected detection; pnpm/Node setup steps; dependency caching; Codecov coverage upload; and `scripts/ci-validate.sh` local validation script.

**Out of Scope**: Architectural boundary enforcement job (separate subtask); GO-Gate verification job (separate subtask); deployment workflow (separate subtask); CODEOWNERS and branch protection (separate subtask); Nx configuration itself (sibling task: Nx Build Pipeline).

**Implementation**: 1. Create `.github/workflows/ci.yml` triggered on `pull_request` (target: main, develop) and `push` (main, develop). 2. Add a `quality-checks` job on `ubuntu-latest` with `timeout-minutes: 20`. 3. Checkout with `fetch-depth: 0` to give Nx full git history for affected detection. 4. Add setup steps: `actions/setup-node@v4` (node 22), `pnpm/action-setup@v2` (pnpm 9), pnpm store cache via `actions/cache@v4`. 5. Run `pnpm install --frozen-lockfile`. 6. Run `pnpm nx affected --target=lint --base=origin/main --head=HEAD`. 7. Run `pnpm nx affected --target=type-check --base=origin/main --head=HEAD`. 8. Run `pnpm nx affected --target=build --base=origin/main --head=HEAD`. 9. Run `pnpm nx affected --target=test --base=origin/main --head=HEAD`. 10. Upload coverage via `codecov/codecov-action@v3`. 11. Create `scripts/ci-validate.sh` as a bash script that sequentially runs lint, build, and test locally. 12. Wire the script as the Husky pre-push hook.

**Constraints**: Must use Node.js 22 and pnpm 9 to match `engines` field in root package.json, Checkout must use `fetch-depth: 0` — shallow clones break Nx affected detection, Dependencies must install with `--frozen-lockfile` to prevent accidental lockfile mutations in CI, Nx affected base SHA must reference `origin/main` on PRs and `HEAD~1` on direct pushes, Workflow must not hardcode personal tokens — use `GITHUB_TOKEN` for Codecov and cache actions

**Patterns**: GitHub Actions workflows live in `.github/workflows/` with `.yml` extension, pnpm workspace dependencies installed with `pnpm install --frozen-lockfile` in all CI contexts, Nx affected detection requires full git history (`fetch-depth: 0`), Coverage upload uses `codecov/codecov-action@v3` pointing to `coverage/coverage-final.json`

**Relevant Files**: create: `.github/workflows/ci.yml` - Primary CI workflow: lint, type-check, build, test jobs with Nx affected detection; create: `scripts/ci-validate.sh` - Local pre-push validation script mirroring CI quality gates

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` exists and is valid YAML that passes `actionlint` or equivalent schema check
- [ ] The workflow triggers on `pull_request` to `main` and `develop` and on `push` to `main` and `develop`
- [ ] All four quality gates (lint, type-check, build, test) execute using `nx affected` with correct base/head SHAs
- [ ] pnpm store is cached between runs so dependency installation is fast (cache key includes lockfile hash)
- [ ] Coverage reports are uploaded to Codecov after the test step
- [ ] The workflow completes in under 20 minutes on an incremental change to a single package
- [ ] `scripts/ci-validate.sh` exists, is executable, and runs the same lint → build → test sequence locally
- [ ] Husky pre-push hook references `scripts/ci-validate.sh` so developers receive identical feedback before pushing

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 5 |

