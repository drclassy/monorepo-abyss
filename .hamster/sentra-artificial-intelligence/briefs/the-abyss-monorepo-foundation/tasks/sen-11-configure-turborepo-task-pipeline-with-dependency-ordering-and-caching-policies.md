---
id: "e20640d5-65f5-4b3c-a6e4-bda80c26f02e"
entity_type: "task"
entity_id: "21abd633-0853-4f0f-9bd0-6d9dcb111cb8"
title: "Configure Turborepo task pipeline with dependency ordering and caching policies - Notes"
status: "todo"
priority: "high"
display_id: "SEN-11"
parent_task_id: "8a613e82-cbcc-45af-b3b8-057235b03249"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:25:05.376801+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Create the root `turbo.json` task pipeline configuration that orchestrates build, test, lint, dev, format, and clean tasks across all workspace packages with correct topological dependency ordering and caching policies.

## Implementation Approach

1. Install `turbo@latest` as a root dev dependency via pnpm
2. Create root `turbo.json` with full pipeline definition:

- `build`: `dependsOn: ["^build"]`, `outputs: ["dist/**", ".next/**"]`, `cache: true`
- `test`: `dependsOn: ["build"]`, `outputs: ["coverage/**"]`, `cache: false`
- `lint`: no dependsOn, `outputs: [".eslintcache"]`, `cache: true`
- `dev`: `cache: false`, `persistent: true`
- `format` and `clean`: both `cache: false`

1. Register `globalDependencies: ["**/.env.local", "**/.env"]` and `globalEnv: ["NODE_ENV"]`
2. Update root `package.json` scripts to use `turbo run` commands for all operations
3. Validate with `pnpm turbo verify` and `pnpm turbo run build --dry-run`

## Acceptance Criteria

- `turbo.json` passes `pnpm turbo verify` with no schema errors
- `pnpm turbo run build --dry-run` shows correct topological execution order
- `lint` and `build` run independently of each other
- All six pipeline tasks are defined with correct policies
- Root `package.json` scripts are wired through turbo
- Second run on unchanged workspace reports cache hits for all packages

## Technical Constraints

- Requires `turbo@2.x` or later
- `build` task MUST use `dependsOn: ["^build"]` for correct topological ordering
- `dev` MUST be `persistent: true` and `cache: false`
- Global dependencies must include env files to prevent stale cache hits
- Output globs must be specific to avoid cross-package cache collisions

## Relevant Files

### Files to Create

- `turbo.json` — Root Turborepo pipeline configuration
- `package.json` — Root scripts updated to use turbo run commands## Details

**Scope**: Create root turbo.json with complete task pipeline configuration (build, test, lint, dev, format, clean), define dependency ordering, caching policies, inputs/outputs per task, global dependencies, and update root package.json scripts to use turbo run commands.

**Out of Scope**: Remote cache provider setup (subtask 2), affected detection environment variables for CI (subtask 4), ESLint architectural boundary rules (subtask 3), TypeScript/ESLint configuration generally (sibling task: TypeScript & Code Quality Standards), and GitHub Actions workflow definitions (sibling task: CI/CD Governance Pipeline).

**Implementation**: 1. Install `turbo` as a root dev dependency via pnpm: `pnpm add -D turbo@latest`.
2. Create root `turbo.json` with `$schema`, `globalDependencies`, `globalEnv`, and a `pipeline` object defining all six task types with their `dependsOn`, `outputs`, `inputs`, `cache`, and `persistent` settings.
3. Set `build.dependsOn: ["^build"]`, `build.outputs: ["dist/**", ".next/**", "build/**"]`, `build.cache: true`.
4. Set `test.dependsOn: ["build"]`, `test.outputs: ["coverage/**"]`, `test.cache: false`.
5. Set `lint.outputs: [".eslintcache"]`, `lint.cache: true` (no dependsOn — runs independently).
6. Set `dev.cache: false`, `dev.persistent: true`.
7. Set `format.cache: false`, `clean.cache: false`.
8. Add `globalDependencies: ["**/.env.local", "**/.env"]` and `globalEnv: ["NODE_ENV"]`.
9. Update root `package.json` scripts section to wire `build`, `build:affected`, `test`, `lint`, `dev`, `format`, `clean`, and `turbo:graph` through turbo.
10. Validate with `pnpm turbo verify` and a dry-run `pnpm turbo run build --dry-run`.

**Constraints**: Must use turbo@2.x or later for `$schema` compatibility and modern pipeline API., The `build` task MUST use `dependsOn: ["^build"]` topological ordering — this is required for correct multi-package compilation with shared packages., `dev` task MUST be marked `persistent: true` and `cache: false` to prevent Turborepo from treating long-running dev servers as completable tasks., Global dependencies must include env files to prevent stale cache hits when secrets or environment variables change., All output globs must be specific enough to avoid over-caching (e.g., `dist/**` not `**`) to prevent false cache hits across packages.

**Relevant Files**: create: `turbo.json` - Root Turborepo pipeline configuration defining all task dependencies, caching policies, inputs/outputs, and global environment settings.; create: `package.json` - Root package.json scripts section updated to use turbo run commands as the canonical entry points for all workspace-wide operations.

## Acceptance Criteria

- [ ] `turbo.json` is valid JSON and passes `pnpm turbo verify` with no schema errors.
- [ ] Running `pnpm turbo run build --dry-run` correctly displays the task execution order, showing downstream packages wait for their upstream `build` tasks before executing.
- [ ] `pnpm turbo run lint` and `pnpm turbo run build` execute independently — lint does not block on build completion.
- [ ] All six pipeline tasks (build, test, lint, dev, format, clean) are defined with correct `outputs`, `cache`, and `dependsOn` values.
- [ ] Root `package.json` scripts include `build`, `build:affected`, `test`, `lint`, `dev`, `format`, `clean`, and `turbo:graph` entries that invoke turbo.
- [ ] Running `pnpm build` a second time on an unchanged workspace reports cache hits for all packages, confirming caching is operative.

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 4 |

