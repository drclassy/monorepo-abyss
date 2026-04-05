---
id: "e19b2955-ecb7-49fa-8b43-f12999bf03cd"
entity_type: "task"
entity_id: "5a4799f6-2c04-472f-b3b6-e01d48e2b6dd"
title: "CI/CD Governance Pipeline can automatically validate code quality, architectural boundaries, and GO-Gate approval on every pull request - Notes"
status: "todo"
priority: "high"
display_id: "SEN-6"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:39:48.348887+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## CI/CD pipeline dapat otomatis memvalidasi setiap pull request sehingga architectural boundaries, kualitas kode, dan persyaratan governance ditegakkan tanpa overhead review manual.

Code review manual tidak dapat berskala untuk mendeteksi setiap pelanggaran arsitektur, penggunaan `any`, atau HANDOFF.md yang belum disetujui. Task ini mengkonfigurasi GitHub Actions sebagai layer penegakan otomatis — setiap PR menerima feedback paralel untuk lint, build, test, dan boundary validation dalam 20 menit. Placeholder GO-Gate verification disiapkan sekarang, siap untuk diaktifkan oleh Claudesy Workflow di Phase 2.

## Experience

Developer melakukan push branch dan membuka PR. Dalam beberapa menit, tiga CI job paralel melaporkan: kualitas kode (lint, type-check, test), validasi architectural boundary, dan status GO-Gate. CODEOWNERS memastikan tim healthcare mereview setiap perubahan pada kode klinis. PR template mengingatkan kontributor untuk melampirkan HANDOFF.md. Branch protection memastikan tidak ada yang masuk ke `main` tanpa melewati semua pengecekan.

## Interaction

1. `.github/workflows/ci.yml` dibuat dengan tiga job paralel: lint/build/test (**Turborepo affected**), architecture-validation (ESLint dengan boundary rules), dan go-gate-verification (placeholder khusus PR)
2. `.github/workflows/deploy.yml` dibuat dengan trigger manual `workflow_dispatch` dan placeholder deploy script
3. `.github/workflows/dependency-check.yml` menjalankan `pnpm audit` harian — membuat GitHub issue jika ada temuan high-severity
4. `.github/CODEOWNERS` memetakan setiap domain directory ke tim pemiliknya (`@healthcare-team`, `@platform-team`, dst.)
5. `.github/pull_request_template.md` meminta referensi HANDOFF.md dan checklist testing
6. `.github/dependabot.yml` mengonfigurasi grouped dependency updates untuk mengurangi noise PR
7. Branch protection dikonfigurasi pada `main` dan `develop` — status checks wajib, 1+ reviewer, stale reviews dismissed
8. `scripts/ci-validate.sh` dibuat untuk validasi pre-push lokal; Husky pre-push hook diperbarui untuk menjalankannya
9. Test PR dibuka, semua CI job selesai dengan sukses, dan CODEOWNERS blocking diverifikasi end-to-end

## Catatan Teknis

- **Gunakan Turborepo** `--filter=[HEAD^1]...` untuk affected detection — **bukan** `nx affected`
- `actions/checkout@v4` dengan `fetch-depth: 0` diperlukan untuk Turborepo change detection
- GO-Gate job harus ada tetapi **TIDAK boleh hard-fail** di Phase 1
- `pnpm install --frozen-lockfile` wajib digunakan di CI## Details

**User Capability**: Every pull request automatically receives CI feedback within 20 minutes — linting, type checking, affected builds, and tests all run in parallel. Unauthorized changes to critical paths (healthcare domain, infrastructure, `.agents/`) are blocked unless the designated code owner reviews. A GO-Gate verification placeholder is present, ready for Phase 2 iskandar-gatekeeper integration.

**Business Value**: Manual code review alone cannot scale to enforce architectural boundaries, code quality standards, and governance compliance simultaneously. Automated CI/CD is the enforcement layer that makes Phase 1 standards self-maintaining — and the governance placeholder ensures Phase 2 can activate with zero CI/CD rework.

**Functional Requirements**:
- `.github/workflows/ci.yml`: triggered on push to `main`/`develop` and PRs targeting those branches
  - Steps: checkout (full history for Nx affected), setup Node 22, setup pnpm 9, `pnpm install --frozen-lockfile`, `nx affected --target=lint`, `nx affected --target=build`, `nx affected --target=test`, upload coverage to Codecov
  - Timeout: 20 minutes max
- `.github/workflows/ci.yml` — separate `architecture-validation` job: runs `nx lint` with `enforce-module-boundaries` check
- `.github/workflows/ci.yml` — separate `go-gate-verification` job: runs only on PRs; checks for HANDOFF.md presence and approval string (Phase 1 placeholder — logs message, does not hard-fail; Phase 2 will activate enforcement)
- `.github/workflows/deploy.yml`: manual `workflow_dispatch` trigger with `environment` input (staging/production); deploys via placeholder script (`echo "Deploying to $DEPLOY_ENV..."` — actual logic Phase 7)
- `.github/workflows/dependency-check.yml`: scheduled daily (`cron: '0 6 * * *'`); runs `pnpm audit --audit-level=high`; creates GitHub issue on failure (per organizational blueprint)
- `.github/workflows/documentation.yml`: generates architecture diagrams from Nx graph; deploys to GitHub Pages (per organizational blueprint)
- `.github/CODEOWNERS`: root `.github/` and `turbo.json`/`nx.json` owned by `@devops-team`; `infrastructure/` by `@devops-team`; `apps/healthcare/` by `@healthcare-team`; `apps/academic/` by `@academic-team`; `apps/orchestrator/` by `@platform-team`; `packages/ui/` by `@frontend-team`; `packages/database/` and `packages/ai-core/` by `@backend-team`; `packages/fhir-engine/` by `@healthcare-team`; `.agents/` and `docs/adr/` by `@platform-team`/`@architecture-council`
- `.github/pull_request_template.md`: Description, Related Issue, Type of Change (bugfix/feature/breaking/docs), HANDOFF.md reference, Testing checklist, Code quality checklist
- Branch protection rules on `main` and `develop`: require status checks, require 1+ reviewer, dismiss stale approvals, include admins
- `scripts/ci-validate.sh`: local pre-push validation script (lint → build → test) with emoji progress output
- Husky pre-push hook updated to run `bash scripts/ci-validate.sh`
- Dependabot configuration (`.github/dependabot.yml`) with grouped updates per organizational blueprint

**Technical Approach**:
- Nx `affected` command using `--base=origin/develop` for PRs and `--base=HEAD~1` for direct pushes
- `actions/checkout@v4` with `fetch-depth: 0` for full git history (required by Nx affected detection)
- `pnpm/action-setup@v2` with pinned version `9.0.0`
- `codecov/codecov-action@v3` for coverage upload
- Jobs parallelized: lint, build, test, architecture-validation run concurrently where dependencies allow
- GO-gate job uses `if: github.event_name == 'pull_request'` condition

**User Workflows**:
1. DevOps Lead creates `.github/workflows/ci.yml` with all three jobs (lint/build/test, architecture-validation, go-gate-verification)
2. DevOps Lead creates `.github/workflows/deploy.yml` with manual dispatch
3. DevOps Lead creates `.github/workflows/dependency-check.yml` on daily schedule
4. DevOps Lead creates `.github/CODEOWNERS` mapping domains to GitHub teams
5. DevOps Lead creates `.github/pull_request_template.md`
6. DevOps Lead configures branch protection on `main` and `develop` via GitHub UI
7. Engineer creates `scripts/ci-validate.sh` and updates Husky pre-push hook
8. Team opens a test PR and verifies all three CI jobs complete successfully within 20 minutes
9. Team verifies CODEOWNERS blocks a PR to `apps/healthcare/` without `@healthcare-team` approval

**Scope - INCLUDED**:
- `.github/workflows/ci.yml` (lint, build, test, architecture-validation, go-gate placeholder jobs)
- `.github/workflows/deploy.yml` (manual dispatch, placeholder deploy)
- `.github/workflows/dependency-check.yml` (daily audit)
- `.github/workflows/documentation.yml` (Nx graph → GitHub Pages)
- `.github/CODEOWNERS`
- `.github/pull_request_template.md`
- `.github/dependabot.yml`
- Branch protection rules on `main` and `develop`
- `scripts/ci-validate.sh` + Husky pre-push hook

**Scope - EXCLUDED**:
- Full GO-Gate enforcement with iskandar-gatekeeper (Phase 2)
- Actual deployment logic beyond placeholder (Phase 7)
- Self-hosted runner setup (optional, documented as future enhancement)
- Matrix build configuration for multi-version testing (future enhancement)

**Success Criteria**:
- A test PR triggers all CI jobs; lint, build, test complete within 20 minutes
- Architecture validation job fails when a deliberate boundary violation is introduced
- GO-Gate job runs on PRs and outputs placeholder message without hard-failing
- CODEOWNERS blocks changes to `apps/healthcare/` without `@healthcare-team` review
- PR template is visible when creating new PRs in GitHub
- Dependency-check workflow runs on schedule without configuration errors
- `scripts/ci-validate.sh` completes successfully locally before push

**Constraints & Considerations**:
- Full git history (`fetch-depth: 0`) is required for Nx affected detection — do not use `fetch-depth: 1`
- GO-Gate job must be present but must NOT hard-fail in Phase 1 (enforcement activates in Phase 2)
- CODEOWNERS team names must match actual GitHub organization team slugs
- `pnpm install --frozen-lockfile` must be used in CI to ensure deterministic installs
- Dependabot grouped updates prevent excessive PR noise while maintaining security

## Context

| Field | Value |
|-------|-------|
| dependencyRationale | Nx Build Pipeline can orchestrate incremental builds with remote caching and architectural boundary enforcement, TypeScript & Code Quality Standards can be enforced consistently across all workspace packages |
| testStrategy | Open a test PR — verify all three CI jobs (lint/build/test, architecture-validation, go-gate-verification) complete within 20 minutes. Introduce a deliberate cross-domain boundary violation and confirm architecture-validation job fails with a clear error. Verify CODEOWNERS blocks a change to `apps/healthcare/` without `@healthcare-team` approval. Confirm PR template is shown when creating a new PR. Run `scripts/ci-validate.sh` locally and confirm it passes cleanly. Verify dependency-check workflow triggers on schedule and completes without configuration errors. |

