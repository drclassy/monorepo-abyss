---
id: "fcdb0e56-45a7-49f6-a6f2-976533773142"
entity_type: "task"
entity_id: "11a2dca9-4210-4c08-a839-2fc6c4712321"
title: "Developer Documentation & Onboarding can guide any engineer from zero to productive in under 30 minutes - Notes"
status: "todo"
priority: "medium"
display_id: "SEN-5"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:21:49.419303+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Developer documentation can guide any new engineer from zero to their first contribution so institutional knowledge is never locked in individuals' heads.

Undocumented monorepo conventions become blockers that multiply with team size. This task ensures every developer — regardless of when they join — can navigate The Abyss independently: clone it, build it, understand its boundaries, and follow its governance conventions without asking "how do I...?" questions.

## Experience

Reading the root README gives a clear mental model of The Abyss in under 5 minutes. The getting-started guide walks through environment setup, the first build, and the first PR — step by step, with real commands. CONTRIBUTING.md aligns exactly with what Husky hooks enforce. Architecture Decision Records give context for every major design choice.

## Interaction

1. Root `README.md` is authored with a verified quick-start (clone → install → build → dev), repository structure overview, and links to further docs
2. `CONTRIBUTING.md` is authored with branch naming (`feature/[domain]/[name]`), commit format (`[PHASE] [DOMAIN] Message`), PR process, and coverage requirements (>80%)
3. `.editorconfig` is created — consistent whitespace without per-developer IDE configuration
4. `docs/dev/getting-started.md` walks through environment setup, first build via Nx, workspace structure, first change lifecycle, and common commands
5. `docs/dev/workspace-setup.md` explains pnpm workspace internals and Nx caching (cache hits, affected builds, project graph)
6. `docs/dev/code-quality.md` documents TypeScript strictness with real code examples, ESLint key rules, and test coverage minimums
7. A new team member completes the getting-started guide end-to-end — any friction encountered is fixed before the task closes## Details

**User Capability**: A new engineer joins the team, reads the root README and getting-started guide, clones the repository, installs dependencies, and completes their first feature contribution — all without asking "how do I..." questions.

**Business Value**: Developer onboarding friction multiplies linearly with team size. In a monorepo with multiple domains and AI agent conventions, undocumented assumptions become blockers. Clear documentation also ensures institutional memory survives team turnover — critical for long-term healthcare platform maintainability.

**Functional Requirements**:
- Root `README.md`: project overview, quick start (prerequisites, clone, install, build), repository structure summary, key concepts (monorepo benefits, governance, architectural boundaries), links to further documentation
- `CONTRIBUTING.md`: branch naming convention (`feature/[domain]/[name]`, `bugfix/[issue-id]/[desc]`), commit message format (`[PHASE] [DOMAIN] Message` with Agent/Phase/Handoff metadata), PR process, testing requirements (>80% coverage), merge strategy (squash and merge)
- `.editorconfig`: root = true, LF line endings, UTF-8, final newline, trim trailing whitespace, 2-space indent for JS/TS/JSON/YAML
- `docs/dev/getting-started.md`: step-by-step environment setup (Node 22, pnpm install), first build walkthrough, workspace structure explanation (`@the-abyss/*` packages, `@app/*` apps), first change workflow (branch → lint/test → HANDOFF.md → commit → PR), common command reference
- `docs/dev/workspace-setup.md`: pnpm workspace internals, how to add a new package, understanding Nx caching (cache hits vs. misses), running affected builds, viewing the project graph
- `docs/dev/code-quality.md`: TypeScript strictness rationale and examples (correct vs. incorrect patterns), ESLint key rules, Prettier usage, testing standards (unit/integration/E2E), coverage minimum (80%)
- `docs/dev/git-workflow.md`: branch strategy, commit convention details, HANDOFF.md requirement for non-trivial changes, PR approval process
- ADR format guide in `docs/adr/README.md` explaining when and how to create ADRs
- `docs/adr/0002-build-system-nx.md` — ADR documenting Nx adoption over Turborepo (may be co-authored with Nx task)

**Technical Approach**:
- All documentation in Markdown, version-controlled alongside code
- Root README follows standard open-source structure: badges (optional), quick start, structure, concepts, contribution
- `.editorconfig` ensures consistent whitespace across VS Code, JetBrains, Vim without per-developer config
- Documentation tested by a real new developer completing the getting-started guide end-to-end

**User Workflows**:
1. Technical Writer + Backend Lead authors root `README.md` with verified quick-start commands
2. Team authors `CONTRIBUTING.md` with branch and commit conventions matching Husky hook enforcement
3. `.editorconfig` is created and validated in VS Code and JetBrains
4. Backend Lead authors `docs/dev/getting-started.md` — a new developer walks through it as acceptance test
5. DevOps Lead authors `docs/dev/workspace-setup.md` referencing actual Nx commands
6. Senior Engineer authors `docs/dev/code-quality.md` with real TypeScript examples
7. All guides are reviewed for accuracy against actual installed tooling
8. New team member completes the getting-started guide from scratch; any blockers are fixed before task closes

**Scope - INCLUDED**:
- Root `README.md`
- `CONTRIBUTING.md`
- `.editorconfig`
- `docs/dev/getting-started.md`
- `docs/dev/workspace-setup.md`
- `docs/dev/code-quality.md`
- `docs/dev/git-workflow.md`
- `docs/adr/README.md` (ADR format guide)
- `docs/adr/0002-build-system-nx.md` (Nx selection ADR, may reference Nx task)

**Scope - EXCLUDED**:
- `docs/adr/0001-monorepo-strategy.md` (handled by "Monorepo Directory Structure & Agent Scaffolding")
- `docs/templates/HANDOFF.md` (handled by "Monorepo Directory Structure & Agent Scaffolding")
- Security policy (`SECURITY.md`) — referenced in brief, scope for a separate security-focused task or Phase 2
- API documentation (Phase 3+ application concern)
- Video walkthroughs (out of scope for Phase 1 text-based docs)

**Success Criteria**:
- Root `README.md` has accurate quick-start commands tested against actual installation
- `CONTRIBUTING.md` branch conventions match Husky hook enforcement
- `.editorconfig` is recognized by VS Code and JetBrains without additional plugins
- A new team member completes getting-started guide in under 30 minutes without external help
- All `docs/dev/` guides reference real commands and real package names (no hypothetical examples)
- `pnpm prettier --check docs/` passes (documentation is formatted)

**Constraints & Considerations**:
- Documentation must stay synchronized with tooling decisions — stale docs are worse than no docs
- Quick-start commands in README must be tested on a clean machine before task is closed
- Getting-started guide should note the HANDOFF.md governance requirement early — new developers must understand the approval workflow before their first PR

## Context

| Field | Value |
|-------|-------|
| dependencyRationale | Repository & pnpm Workspace can be initialized as the monorepo foundation, Nx Build Pipeline can orchestrate incremental builds with remote caching and architectural boundary enforcement, TypeScript & Code Quality Standards can be enforced consistently across all workspace packages |
| testStrategy | A developer who has not previously seen the repository follows the getting-started guide on a clean machine — they must reach a working `pnpm nx run-many --target=build` result in under 30 minutes without external help. Verify `CONTRIBUTING.md` branch and commit conventions are consistent with what Husky hooks enforce. Check `.editorconfig` is recognized in both VS Code and JetBrains. Run `pnpm prettier --check docs/` and verify all documentation files pass formatting checks. |

