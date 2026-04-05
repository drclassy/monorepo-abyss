---
id: "f159d039-d08a-47c8-a64b-e64e4a084c32"
entity_type: "task"
entity_id: "8a613e82-cbcc-45af-b3b8-057235b03249"
title: "Nx Build Pipeline can orchestrate incremental builds with remote caching and architectural boundary enforcement - Notes"
status: "todo"
priority: "urgent"
display_id: "SEN-2"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:29:30.945578+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## The Turborepo build pipeline can orchestrate builds so developers only rebuild what changed and architectural boundaries are automatically enforced.

Without intelligent build orchestration, CI rebuilds everything on every push — and without boundary enforcement, healthcare logic can silently leak into non-clinical apps, creating HIPAA risk. **Turborepo** is the chosen build orchestrator for The Abyss, providing content-hash-based caching, topological task ordering, and remote artifact sharing across local machines and CI runners.

## Experience

Running `pnpm turbo run build` compiles only the packages affected by recent changes. Turborepo remote caching means CI and local machines share build artifacts — cache hits make incremental builds complete in under 30 seconds. Any attempt to import healthcare logic from a non-healthcare package causes an ESLint boundary violation that blocks the PR.

## Interaction

1. Engineer installs `turbo` and initialises `turbo.json` with full pipeline configuration and caching policies
2. Remote cache provider (Vercel Remote Cache or self-hosted) is connected and validated — second run shows cache hits
3. ESLint `import/no-restricted-paths` and `import/no-internal-modules` rules are configured with domain constraints: Healthcare, Academic, Incubator, Internal
4. Root `package.json` scripts are updated to use `turbo run` commands (`turbo run build`, `turbo run test --filter=[HEAD^1]`)
5. `docs/adr/0002-build-system-turborepo.md` records the Turborepo selection rationale
6. Build performance benchmarks are documented in `docs/dev/turbo-build-guide.md`## Details

**User Capability**: Developers run `pnpm turbo run build` and only affected packages rebuild; architectural boundary violations are caught at lint time. CI build time for incremental changes drops below 30 seconds.

**Business Value**: Without intelligent build orchestration, every CI run rebuilds everything — wasting minutes on unchanged packages. Equally critical, without enforced architectural boundaries, healthcare logic can leak into non-clinical applications, creating HIPAA compliance risk.

**Functional Requirements**:
- Turborepo installed as the root-level build orchestrator
- `turbo.json` configured with full task pipeline: build, test, lint, dev, format, clean
- `build.dependsOn: ["^build"]` topological ordering; `test.dependsOn: ["build"]`
- Turborepo remote caching configured (Vercel Remote Cache or self-hosted) — shared between local dev and CI runners
- ESLint `import/no-restricted-paths` rules encoding the domain boundary matrix
- Root `package.json` scripts updated to use `turbo run` commands
- Build performance benchmarks documented: incremental change <30s, full build <5min, remote cache hit rate target >90%
- ADR documenting the Turborepo selection rationale (`docs/adr/0002-build-system-turborepo.md`)

**Scope - INCLUDED**:
- Turborepo installation and `turbo.json` configuration
- Remote caching setup (Vercel Remote Cache or self-hosted)
- ESLint import boundary rules with domain constraints
- Root scripts updated to `turbo run` commands
- ADR documenting Turborepo selection
- Build performance documentation (`docs/dev/turbo-build-guide.md`)

**Scope - EXCLUDED**:
- TypeScript compiler and ESLint base rules (handled by TypeScript & Code Quality Standards)
- CI/CD GitHub Actions workflows (handled by CI/CD Governance Pipeline)
- Application-level package.json configuration (Phase 3 per-app setup)

**Success Criteria**:
- `turbo.json` is valid and `pnpm turbo run build --dry-run` shows correct execution order
- `pnpm turbo run build` shows cache hits for unchanged packages on second run
- ESLint reports zero boundary violations with domain constraints in place
- Incremental builds complete in under 30 seconds for single-package changes
- Remote cache is operational and shared between CI and local dev
- `docs/adr/0002-build-system-turborepo.md` documents the decision rationale

