---
id: "45d8a623-47ef-445f-bb89-9e0c6d8accb0"
entity_type: "task"
entity_id: "1cf545c9-854e-4b36-9a77-8cb167de5e08"
title: "Create developer onboarding guides covering environment setup, workspace commands, and code quality standards - Notes"
status: "todo"
priority: "high"
display_id: "SEN-16"
parent_task_id: "11a2dca9-4210-4c08-a839-2fc6c4712321"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:25:37.300424+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Create three `docs/dev/` reference guides — `getting-started.md`, `workspace-setup.md`, and `code-quality.md` — that give engineers everything they need to go from zero to first merged PR without tribal knowledge.

## Implementation Approach

1. Draft `getting-started.md` as a timed journey: Environment Setup → First Build → Workspace Overview → First Change → CI/CD Overview → Common Commands cheat sheet.
2. Draft `workspace-setup.md`: pnpm workspace model, adding a new package, Turborepo cache hit/miss annotation, build graph command, remote cache explanation.
3. Draft `code-quality.md`: TypeScript strict mode rules with ✅/❌ code examples, ESLint run commands, testing requirements with test categories, Prettier and pre-commit hook explanation.
4. Cross-link all three guides from the root README and from each other.
5. Verify all commands match actual root package.json scripts.

## Acceptance Criteria

- `docs/dev/getting-started.md` guides a new developer through environment setup, first build, workspace orientation, first change, and PR submission.
- `getting-started.md` includes a common commands cheat sheet covering dev, build, build:affected, test, lint, and format.
- `docs/dev/workspace-setup.md` explains pnpm workspace resolution, how to add a new package, and Turborepo cache hit vs miss with annotated terminal output.
- `docs/dev/code-quality.md` documents TypeScript strict mode with ✅/❌ examples, key ESLint rules, >80% coverage requirement, and Prettier auto-fix behaviour.
- All shell commands in the guides match the actual root package.json scripts.
- A new developer can follow getting-started.md top-to-bottom and submit their first PR without peer assistance.

## Technical Constraints

- All commands must match actual scripts in root package.json.
- TypeScript examples must reflect the strict config from the TypeScript & Code Quality sibling task.
- Guides must assume basic Git/Node.js/TypeScript but no prior monorepo experience.

## Files to Create

- `docs/dev/getting-started.md` — New-developer onboarding walkthrough.
- `docs/dev/workspace-setup.md` — pnpm workspace and Turborepo caching reference.
- `docs/dev/code-quality.md` — TypeScript/ESLint/Prettier/testing standards.## Details

**Scope**: Three developer reference guides: getting-started.md (onboarding walkthrough), workspace-setup.md (pnpm and Turbo reference), code-quality.md (TypeScript/ESLint/Prettier/testing standards documentation).

**Out of Scope**: The actual ESLint, Prettier, and TypeScript configuration files themselves (TypeScript & Code Quality sibling task). CI/CD workflow file authoring (CI/CD sibling task). pnpm-workspace.yaml and turbo.json creation (Repository & pnpm Workspace and Nx Build Pipeline sibling tasks). AGENTS.md and HANDOFF.md templates (Directory Scaffolding sibling task).

**Implementation**: 1. Draft getting-started.md as a timed guide: section 1 Environment Setup (Node.js + pnpm install steps), section 2 First Build (run build and annotate cache output), section 3 Workspace Overview (apps vs packages, import conventions), section 4 First Change (branch → lint → test → HANDOFF.md → commit → PR), section 5 CI/CD Overview, section 6 Common Commands cheat sheet.
2. Draft workspace-setup.md: pnpm workspace model explanation, adding a new package walkthrough, Turborepo cache hit/miss annotation, build graph command, remote cache explanation.
3. Draft code-quality.md: TypeScript strict mode rules with ✅/❌ code examples, ESLint rule list with run commands, testing requirements and test category examples, Prettier invocation and pre-commit auto-fix explanation.
4. Cross-link all three guides from the root README and from each other where relevant.
5. Verify that all commands referenced in the guides match actual root package.json scripts.

**Constraints**: All shell commands must match actual scripts defined in root package.json (e.g., `pnpm lint`, `pnpm test`, `pnpm turbo run build`)., TypeScript examples in code-quality.md must reflect the strict config established by the TypeScript & Code Quality sibling task., Guides must be written at a level appropriate for an engineer with basic Git/Node.js/TypeScript experience — no assumed monorepo familiarity.

**Relevant Files**: create: `docs/dev/getting-started.md` - New-developer onboarding walkthrough from environment setup to first merged PR.; create: `docs/dev/workspace-setup.md` - pnpm workspace and Turborepo caching reference guide.; create: `docs/dev/code-quality.md` - TypeScript strictness, ESLint rules, testing requirements, and Prettier standards.

## Acceptance Criteria

- [ ] docs/dev/getting-started.md exists and guides a new developer through environment setup, first build, workspace orientation, first code change, and PR submission as a sequenced walkthrough.
- [ ] getting-started.md includes a common commands cheat sheet covering dev, build, build:affected, test, lint, and format.
- [ ] docs/dev/workspace-setup.md exists and explains pnpm workspace package resolution, how to add a new package, and Turborepo cache hit vs miss behaviour with annotated terminal output examples.
- [ ] docs/dev/code-quality.md exists and documents TypeScript strict mode requirements with correct and incorrect code examples, key ESLint rules, minimum test coverage (>80%), and Prettier auto-fix behaviour.
- [ ] All shell commands in the three guides match the actual scripts in the root package.json.
- [ ] A new developer can read getting-started.md from top to bottom and successfully submit their first PR without requesting peer assistance.

## Context

| Field | Value |
|-------|-------|
| category | documentation |
| complexity | 4 |

