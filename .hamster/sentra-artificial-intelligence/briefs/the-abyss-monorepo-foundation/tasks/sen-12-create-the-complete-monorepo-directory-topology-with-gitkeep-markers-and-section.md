---
id: "774f288c-39db-4a11-a41c-e399205df911"
entity_type: "task"
entity_id: "b3869d99-838c-44e0-a950-29406277603d"
title: "Create the complete monorepo directory topology with .gitkeep markers and section-level READMEs - Notes"
status: "todo"
priority: "high"
display_id: "SEN-12"
parent_task_id: "d542ab02-573d-4839-8b82-827e49146e15"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:25:07.252795+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Create every directory in the monorepo topology, add `.gitkeep` markers to preserve empty directories in Git, and write section-level README files for each major folder group.

## Implementation Approach

1. Write `scripts/setup/scaffold-dirs.sh` containing all `mkdir -p` commands for the full directory tree as specified in the brief
2. Execute the script to materialise all directories
3. Run `find . -type d -empty -not -path "./.git/*" -exec touch {}/.gitkeep \;` to place `.gitkeep` files
4. Author `apps/README.md` — lists all five domain sub-directories and their responsibilities
5. Author `apps/healthcare/README.md` — notes HIPAA compliance boundary, lists referralink-api, aadi-diagnostic
6. Author `packages/README.md` — lists all packages with their `@the-abyss/*` import names
7. Author `infrastructure/README.md` — notes that Docker builds run from repo root; lists docker, terraform, kubernetes, argocd with brief purpose of each
8. Author `flows/README.md` — explains definitions, components, and tests folders
9. Author `tooling/README.md` — explains abyss-cli and generators
10. Commit the entire scaffold as a single atomic commit

## Acceptance Criteria

- Every directory in the brief's tree exists, confirmed by `find . -type d`
- All empty directories contain `.gitkeep` and survive a round-trip `git clone`
- README.md files exist for apps/, apps/healthcare/, packages/, infrastructure/, flows/, and tooling/
- `git status` after initial commit shows all files as tracked
- Nested healthcare and orchestrator sub-directories are present

## Technical Constraints

- Directory names must exactly match brief specification
- Use `scripts/setup/scaffold-dirs.sh` to codify mkdir commands reproducibly
- All paths relative to repository root
- README.md files: purpose statement + sub-directory list + usage note
- `.gitkeep` files must be zero-byte

## Code Patterns to Follow

- `infrastructure/argocd/` should follow Kustomize pattern: `base/`, `overlays/staging/`, `overlays/production/`
- `infrastructure/docker/README.md` must note that Docker builds run from repo root
- `apps/healthcare/README.md` should note fhir-engine dependency convention

## Relevant Files

### Files to Create

- `scripts/setup/scaffold-dirs.sh` — Reproducible shell script containing all mkdir commands
- `apps/README.md` — Domain applications section overview
- `apps/healthcare/README.md` — Healthcare domain README with HIPAA boundary note
- `packages/README.md` — Shared packages listing with @the-abyss/* import names
- `infrastructure/README.md` — Infrastructure section with Docker-from-root constraint note
- `flows/README.md` — Langflow definitions, components, and tests overview
- `tooling/README.md` — Internal tooling section overview## Details

**Scope**: Creating all directories via mkdir -p, placing .gitkeep files in empty directories, and writing section-level README.md files for major directory groups (apps, packages, infrastructure, flows, tooling).

**Out of Scope**: pnpm workspace YAML and root package.json (sibling: Repository & pnpm Workspace), package-level package.json manifests (separate subtask), .agents/ AGENTS.md and governance files (separate subtask), root README.md and developer guides (sibling: Developer Documentation & Onboarding), tsconfig/eslint files (sibling: TypeScript & Code Quality Standards), GitHub Actions workflows (sibling: CI/CD Governance Pipeline).

**Constraints**: Directory names must exactly match the project brief specification — no renaming or restructuring, Use a single shell script (scripts/setup/scaffold-dirs.sh) to codify the mkdir commands so the scaffold is reproducible, All paths must be relative to the repository root, README.md files should be minimal but meaningful — purpose statement, sub-directory list, and import/usage note, .gitkeep files must be exactly empty (zero bytes) to follow convention

**Patterns**: Infrastructure follows Kustomize pattern: base/ + overlays/staging/ + overlays/production/ under infrastructure/argocd/, Docker builds must run from repository root (not app directory) due to cross-package imports — document this in infrastructure/docker/README.md, All app directories under apps/healthcare/ are expected to import from packages/fhir-engine/ — README should note this dependency convention

## Acceptance Criteria

- [ ] Every directory listed in the project brief's directory tree exists in the repository and is confirmed by `find . -type d` output matching the specification
- [ ] All empty directories contain a `.gitkeep` file so they are tracked by Git and survive a `git clone` round-trip
- [ ] README.md files exist for apps/, apps/healthcare/, packages/, infrastructure/, flows/, and tooling/ sections — each explaining the section's purpose, sub-directory listing, and usage conventions
- [ ] `git status` after the initial commit shows all directories and .gitkeep files as tracked (nothing unintentionally ignored)
- [ ] The nested healthcare app directories (referralink-api, aadi-diagnostic) and orchestrator (langflow-gateway) are present as defined in the brief

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 4 |

