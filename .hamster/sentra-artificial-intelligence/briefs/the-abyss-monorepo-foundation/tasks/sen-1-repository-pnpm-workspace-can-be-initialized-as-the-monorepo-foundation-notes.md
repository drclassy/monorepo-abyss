---
id: "e866e0b0-1038-4847-a771-b44c4eb6d534"
entity_type: "task"
entity_id: "ac782654-8b5c-4c56-b3fb-aca81a26ac55"
title: "Repository & pnpm Workspace can be initialized as the monorepo foundation - Notes"
status: "todo"
priority: "urgent"
display_id: "SEN-1"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:18:49.741784+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Developers can clone and install the monorepo so they can start contributing within minutes.

Setting up a polyrepo environment breeds dependency drift, diverging tooling, and fragmented context for both engineers and AI agents. This task establishes the single source of truth: one Git repository with a `pnpm` workspace that unifies every application, package, and tool in The Abyss.

## Experience

Developers clone `the-abyss`, run `pnpm install`, and have all workspace packages wired up and ready in under 2 minutes. Commit hooks automatically enforce code quality before anything reaches the remote. Branch conventions are documented and enforced from day one.

## Interaction

1. DevOps Lead creates the private `the-abyss` GitHub repository and enables branch protection on `main` and `develop`
2. Engineer initializes the repository locally, configures `.gitignore` and `.gitattributes`
3. `pnpm-workspace.yaml` is created, declaring all workspace scopes (`packages/*`, `apps/*`, `flows`, `tooling/*`, `infrastructure`)
4. Root `package.json` is authored with engine constraints (Node ≥22, pnpm ≥9), shared scripts, and `packageManager` field
5. `.npmrc` is configured for consistent pnpm behavior across machines
6. Root `.prettierrc` establishes formatting standards for all tracked files
7. Husky is installed; `pre-commit` (lint-staged) and `pre-push` (pnpm test) hooks are wired up
8. A new developer clones the repo, runs `pnpm install`, and verifies all packages resolve — the golden path is confirmed## Details

**User Capability**: Developers can clone a single repository, run `pnpm install`, and have all workspace packages resolve correctly within 2 minutes.

**Business Value**: Eliminates polyrepo fragmentation — the root cause of context fragmentation for both human developers and AI agents. Without a unified workspace, dependency drift, duplicated tooling, and cross-domain leakage become inevitable.

**Functional Requirements**:
- A private GitHub repository named `the-abyss` with branch protection on `main` and `develop`
- Comprehensive `.gitignore` covering node_modules, dist, .env, .turbo, .next, OS and IDE artifacts
- `.gitattributes` enforcing LF line endings across all platforms
- `pnpm-workspace.yaml` defining all workspace scopes: `packages/*`, `apps/*`, `flows`, `tooling/*`, `infrastructure`
- Root `package.json` with `"private": true`, `packageManager: pnpm@9.0.0`, Node >=22 engine constraint, and shared scripts (`dev`, `build`, `test`, `lint`, `format`, `clean`)
- `.npmrc` with `shamefully-hoist=true`, `strict-peer-dependencies=false`, `auto-install-peers=true`
- Root `.prettierrc` with project-wide formatting standards (semi, trailingComma: es5, singleQuote, printWidth: 100)
- Husky installation with `pre-commit` (pnpm lint-staged) and `pre-push` (pnpm test) hooks
- Branch naming and commit message conventions documented: format `[PHASE] [DOMAIN] Message`
- `lint-staged` configuration in root `package.json` for ts/tsx (ESLint) and json/md/yaml (Prettier)

**Data Model & Structure**:
- Workspace packages defined in `pnpm-workspace.yaml` scopes matching the full monorepo topology
- All workspace packages require a minimal `package.json` with `name`, `version`, and `scripts`
- Package naming convention: `@the-abyss/[package-name]` for shared packages; `@app/[app-name]` for applications

**Technical Approach**:
- pnpm v9 as the singular package manager (content-addressable storage, strict symlinking, no phantom dependencies)
- Husky v9 for Git hooks lifecycle management
- lint-staged for pre-commit scope-limited linting
- Branch strategy: `main` (protected, production), `develop` (integration), `feature/[domain]/[name]`

**User Workflows**:
1. DevOps Lead creates GitHub repository, configures branch protection rules
2. Engineer runs `git init`, configures `.gitignore`, `.gitattributes`, creates initial commit
3. Engineer installs pnpm globally, creates `pnpm-workspace.yaml` and root `package.json`
4. Engineer runs `pnpm install` — all workspace packages resolve correctly
5. Husky hooks are initialized and verified by triggering a test commit

**Scope - INCLUDED**:
- Git repository initialization and GitHub setup
- Branch protection rules on `main` and `develop`
- pnpm workspace configuration (`pnpm-workspace.yaml`, root `package.json`, `.npmrc`)
- Root Prettier configuration (`.prettierrc`)
- Husky and lint-staged initialization
- Commit convention documentation (`docs/dev/git-workflow.md`)
- Workspace onboarding guide (`docs/dev/workspace-setup.md`)

**Scope - EXCLUDED**:
- Directory scaffolding beyond root config files (handled by "Monorepo Directory Structure & Agent Scaffolding")
- TypeScript and ESLint configuration (handled by "Code Quality & TypeScript Standards")
- Nx/Turborepo build pipeline (handled by "Nx Build Pipeline & Architectural Boundaries")
- CI/CD workflows (handled by "CI/CD Governance Pipeline")

**Success Criteria**:
- `pnpm install` completes in under 2 minutes with zero errors
- `pnpm list --depth=0` shows all workspace packages
- Branch protection is active and enforced on `main`
- Husky pre-commit hook triggers lint-staged automatically
- A new developer can clone and install without configuration questions

## Context

| Field | Value |
|-------|-------|
| testStrategy | A net-new developer (or a clean machine) clones the repository and runs `pnpm install`. Verify: install completes in under 2 minutes with zero errors; `pnpm list --depth=0` lists all workspace packages; a test commit triggers the lint-staged pre-commit hook; a test push triggers the pre-push test hook; branch protection blocks a direct push to `main`. |

