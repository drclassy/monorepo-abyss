---
id: "6683d9c7-7e1e-4306-97b2-61285c39fb01"
entity_type: "task"
entity_id: "ee5f35a2-1bdb-4353-b2a9-1a112d07c515"
title: "Configure pnpm workspace with root package.json, workspace manifest, and npm settings - Notes"
status: "todo"
priority: "urgent"
display_id: "SEN-21"
parent_task_id: "ac782654-8b5c-4c56-b3fb-aca81a26ac55"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:26:04.461352+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Create `pnpm-workspace.yaml`, root `package.json`, and `.npmrc` to unify all workspace members under a single pnpm dependency graph.

## Implementation Approach

1. Install pnpm 9.x globally; verify with `pnpm --version`.
2. Create `pnpm-workspace.yaml` declaring globs: `packages/*`, `apps/*`, `flows`, `tooling/*`, `infrastructure`.
3. Create root `package.json` with `private: true`, `packageManager: "pnpm@9.x.x"`, `engines`, shared devDependencies, workspace-wide scripts, and `lint-staged` config block.
4. Create `.npmrc` with `shamefully-hoist=true`, `strict-peer-dependencies=false`, `auto-install-peers=true`.
5. Create minimal placeholder `package.json` stubs for each workspace member (name, version, private:true).
6. Run `pnpm install`; verify with `pnpm list --depth=0`.

## Acceptance Criteria

- `pnpm install` completes without errors in under 2 minutes from a cold start
- `pnpm list --depth=0` shows all workspace members recognized with correct `@the-abyss/*` / `@app/*` names
- Root `package.json` contains `private:true`, `packageManager`, `engines`, `lint-staged`, and all workspace scripts
- `.npmrc` present and `pnpm config list` confirms all three settings
- Every member directory has a valid `package.json` with a unique scoped name — verified by `pnpm ls --recursive`
- `pnpm-lock.yaml` present in repository root after install (not gitignored)

## Technical Constraints

- pnpm 9.x required; enforced via `packageManager` field (Corepack) and `engines`
- Node.js >= 22.0.0 required in `engines` and on all machines/CI runners
- `shamefully-hoist=true` required for Next.js and native addon compatibility
- Package names must align with TypeScript `@the-abyss/*` / `@app/*` path aliases (TypeScript & Code Quality sibling task)
- Root `package.json` must be `private: true`
- `pnpm-lock.yaml` must be committed

## Code Patterns to Follow

- `pnpm-workspace.yaml` uses YAML list syntax under a `packages:` key
- Placeholder stubs follow the pattern: `{ "name": "@the-abyss/<name>", "version": "0.1.0", "private": true }`
- `lint-staged` config lives under `"lint-staged"` key in root `package.json`, not a separate `.lintstagedrc` file

## Relevant Files

### Files to Create

- `pnpm-workspace.yaml` - Workspace glob declarations
- `package.json` - Root workspace manifest (private, packageManager, engines, scripts, lint-staged)
- `.npmrc` - pnpm resolution behavior settings
- `packages/*/package.json` - Placeholder stubs for all shared packages
- `apps/*/package.json` - Placeholder stubs for all application directories## Details

**Scope**: pnpm-workspace.yaml with workspace glob patterns; root package.json (private, packageManager, engines, shared devDependencies, root scripts, lint-staged config); .npmrc (shamefully-hoist, strict-peer-dependencies, auto-install-peers); minimal placeholder package.json stubs for each workspace member so pnpm recognizes them as valid packages.

**Out of Scope**: turbo.json and Turborepo pipeline configuration (Nx Build Pipeline sibling task); tsconfig.json, .eslintrc, .prettierrc (TypeScript & Code Quality sibling task); full directory creation and .gitkeep scaffolding (Monorepo Directory Structure sibling task); root README.md and developer documentation (Developer Documentation sibling task); GitHub Actions workflows (CI/CD sibling task).

**Implementation**: 1. Install pnpm globally if not present: `npm install -g pnpm@latest`; verify with `pnpm --version` (must be 9.x).
2. Create `pnpm-workspace.yaml` at repository root listing globs: `packages/*`, `apps/*`, `flows`, `tooling/*`, `infrastructure`.
3. Create root `package.json` with: `"name": "the-abyss"`, `"private": true`, `"packageManager": "pnpm@9.x.x"`, `"engines": { "node": ">=22.0.0", "pnpm": ">=9.0.0" }`, shared devDependencies (`prettier`, `eslint`, `@types/node`, `husky`, `lint-staged`), workspace-wide scripts (`dev`, `build`, `test`, `lint`, `format`, `clean`), and `"lint-staged"` configuration block.
4. Create `.npmrc` with `shamefully-hoist=true`, `strict-peer-dependencies=false`, `auto-install-peers=true`.
5. For each directory declared in `pnpm-workspace.yaml` that has a corresponding package, create a minimal `package.json` stub: `{ "name": "@the-abyss/<package>", "version": "0.1.0", "private": true }` for shared packages and `{ "name": "@app/<app>", "version": "0.1.0", "private": true }` for applications.
6. Run `pnpm install` from the repository root and confirm it completes without errors.
7. Verify workspace recognition with `pnpm list --depth=0` — all member packages must appear.

**Constraints**: pnpm version must be 9.x (specified via packageManager field for Corepack enforcement), Node.js >= 22.0.0 is required — this must be encoded in the engines field and matched on all developer machines and CI runners, shamefully-hoist=true is required for compatibility with Next.js and packages that expect flat node_modules resolution; this is a deliberate trade-off documented in .npmrc, All workspace package names must follow the @the-abyss/* namespace for shared packages and @app/* for applications to align with TypeScript path aliases configured in the TypeScript & Code Quality sibling task, Root package.json must be private:true to prevent accidental npm publish of the workspace root, pnpm-lock.yaml generated by pnpm install must be committed — do not add it to .gitignore

**Relevant Files**: create: `pnpm-workspace.yaml` - Workspace glob patterns declaring all member package directories: packages/*, apps/*, flows, tooling/*, infrastructure; create: `package.json` - Root workspace package.json: private:true, packageManager field, engines constraints, shared devDependencies, root scripts, lint-staged config; create: `.npmrc` - pnpm behavior settings: shamefully-hoist, strict-peer-dependencies, auto-install-peers; create: `packages/*/package.json` - Minimal placeholder package.json stubs for each shared package under packages/ — name, version, private:true; create: `apps/*/package.json` - Minimal placeholder package.json stubs for each application under apps/ — name, version, private:true

## Acceptance Criteria

- [ ] pnpm install completes without errors from a cold start (no prior node_modules) in under 2 minutes on standard hardware
- [ ] pnpm list --depth=0 shows all workspace member packages (packages/*, apps/*, flows, tooling/*) recognized correctly with their declared @the-abyss/* and @app/* names
- [ ] Root package.json contains private:true, packageManager field (pnpm@9.x.x), engines block (node>=22, pnpm>=9), lint-staged configuration, and all workspace-wide scripts (dev, build, test, lint, format, clean)
- [ ] .npmrc is present and pnpm config list confirms shamefully-hoist=true, strict-peer-dependencies=false, auto-install-peers=true
- [ ] Every workspace member directory (packages/*, apps/*, flows, tooling/*) contains a valid package.json with a unique @the-abyss/* or @app/* name — verified by pnpm ls --recursive
- [ ] pnpm-lock.yaml is present in the repository root (not gitignored) after running pnpm install

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 4 |

