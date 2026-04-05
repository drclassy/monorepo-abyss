---
id: "6719db32-c89e-413d-a708-48e0a5f2b74e"
entity_type: "task"
entity_id: "3343d7e1-e19e-4ebe-95ac-adc7874b3c4b"
title: "Establish CODEOWNERS governance and standardized PR template - Notes"
status: "todo"
priority: "high"
display_id: "SEN-19"
parent_task_id: "5a4799f6-2c04-472f-b3b6-e01d48e2b6dd"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:25:52.178981+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Create `.github/CODEOWNERS` and `.github/pull_request_template.md` to enforce domain-ownership-based review requirements and standardize PR metadata for traceability.

## Implementation Approach

1. Create `.github/CODEOWNERS` with entries for all major directories mapped to GitHub team slugs:

- `/.github/`, `/infrastructure/`, `/turbo.json`, `/pnpm-workspace.yaml` → `@sentra-ai/devops-team`
- `/apps/healthcare/`, `/packages/fhir-engine/` → `@sentra-ai/healthcare-team`
- `/apps/academic/` → `@sentra-ai/academic-team`
- `/apps/orchestrator/`, `/packages/ai-core/`, `/.agents/` → `@sentra-ai/platform-team`
- `/packages/ui/` → `@sentra-ai/frontend-team`
- `/packages/database/` → `@sentra-ai/backend-team`
- `/docs/adr/` → `@sentra-ai/architecture-council`

1. Create `.github/pull_request_template.md` with: Description, Related Issue, Type of Change (checkboxes), HANDOFF.md Reference link, Testing section, and merge-readiness Checklist
2. Document branch protection configuration in `docs/dev/branch-protection.md`

## Acceptance Criteria

- `.github/CODEOWNERS` exists covering all major monorepo directories
- A PR to `/apps/healthcare/` automatically requests healthcare team review
- `.github/pull_request_template.md` contains all required sections
- PR template is pre-populated when opening a new PR
- `docs/dev/branch-protection.md` documents required settings for `main` and `develop`
- Branch protection on `main` is confirmed active (requires approval + CI checks)

## Technical Constraints

- GitHub team slugs must match actual org team names — use documented placeholders
- CODEOWNERS: list specific paths before wildcards (last-match-wins evaluation)
- Branch protection settings must be documented separately (not commitable to repo)

## Code Patterns to Follow

- CODEOWNERS uses `@org-name/team-name` format for team slugs
- PR templates auto-populate when placed at `.github/pull_request_template.md`

## Relevant Files

### Files to Create

- `.github/CODEOWNERS` — Directory-to-team ownership mapping
- `.github/pull_request_template.md` — Standardized PR description template
- `docs/dev/branch-protection.md` — Branch protection configuration guide## Details

**Scope**: Create `.github/CODEOWNERS` mapping all major monorepo directories to domain teams; create `.github/pull_request_template.md` with description, type-of-change checklist, HANDOFF.md reference field, and test checklist; document branch protection configuration steps.

**Out of Scope**: GitHub Actions workflow YAML (separate subtasks); GO-Gate CI job (separate subtask); HANDOFF.md template content itself (sibling Directory Structure task); Nx rules or ESLint configuration (sibling tasks).

**Implementation**: 1. Create `.github/CODEOWNERS` with ownership entries for: `/.github/` → `@sentra-ai/devops-team`; `/infrastructure/` → `@sentra-ai/devops-team`; `/turbo.json` and `/pnpm-workspace.yaml` → `@sentra-ai/devops-team`; `/apps/healthcare/` → `@sentra-ai/healthcare-team`; `/apps/academic/` → `@sentra-ai/academic-team`; `/apps/orchestrator/` → `@sentra-ai/platform-team`; `/packages/ui/` → `@sentra-ai/frontend-team`; `/packages/database/` → `@sentra-ai/backend-team`; `/packages/ai-core/` → `@sentra-ai/platform-team`; `/packages/fhir-engine/` → `@sentra-ai/healthcare-team`; `/.agents/` → `@sentra-ai/platform-team`; `/docs/adr/` → `@sentra-ai/architecture-council`. 2. Create `.github/pull_request_template.md` with sections: Description, Related Issue, Type of Change (checkboxes), HANDOFF.md Reference (link field), Testing (checkboxes for unit/manual/coverage), and a Checklist (lint, docs, commit conventions, no console.log). 3. Document branch protection settings in `docs/dev/branch-protection.md`: require PR reviews (1 minimum), require all CI status checks to pass (`quality-checks`, `architecture-validation`, `go-gate-check`), dismiss stale reviews on new commits, include administrators.

**Constraints**: GitHub team slugs must match actual GitHub organization team names — use placeholder slugs that document owners should update, CODEOWNERS entries are evaluated last-match-wins in some GitHub versions; list specific paths before wildcards, Branch protection settings cannot be committed to the repository — they must be configured in GitHub UI or via Terraform/GitHub API and should be documented

**Patterns**: CODEOWNERS uses glob patterns: `path/` for directories, specific files for critical configs, Team slugs follow the pattern `@org-name/team-name` as configured in the GitHub organization, PR templates are picked up automatically by GitHub when placed at `.github/pull_request_template.md`

**Relevant Files**: create: `.github/CODEOWNERS` - Maps directory paths to owning GitHub teams for automatic review assignment; create: `.github/pull_request_template.md` - Standardized PR description template including HANDOFF.md reference and testing checklist

## Acceptance Criteria

- [ ] `.github/CODEOWNERS` exists and covers all major directories: `/.github/`, `/infrastructure/`, `/apps/healthcare/`, `/apps/academic/`, `/apps/orchestrator/`, `/packages/ui/`, `/packages/database/`, `/packages/ai-core/`, `/packages/fhir-engine/`, `/.agents/`, `/docs/adr/`
- [ ] A PR modifying `/apps/healthcare/` automatically requests review from the healthcare team as shown in GitHub's reviewer suggestions
- [ ] `.github/pull_request_template.md` exists and contains sections for: description, related issue, type of change, HANDOFF.md reference link, testing checklist, and a merge-readiness checklist
- [ ] The PR template is visible and pre-populated when a new PR is created against the repository
- [ ] `docs/dev/branch-protection.md` documents the branch protection settings to apply to `main` and `develop`, including required status checks and review counts
- [ ] Branch protection on `main` is confirmed active: PRs cannot be merged without at least one approval and all required CI checks passing

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 3 |

