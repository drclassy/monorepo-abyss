---
id: "681f20c1-80ad-4f51-a498-f8e82c2eefed"
entity_type: "task"
entity_id: "66a86085-1c76-4a0c-9d9e-3efc31d88b9c"
title: "Create the shareable TypeScript config package and per-package tsconfig extends - Notes"
status: "todo"
priority: "high"
display_id: "SEN-15"
parent_task_id: "a1813520-d6ac-4847-8d10-7aba7bd3956c"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:25:31.752647+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

# Create the Shareable TypeScript Config Package and Per-Package tsconfig Extends

## Summary

Create `packages/config-typescript` as a shareable package providing base, react, and node TypeScript presets, and wire each workspace app/package to extend the appropriate preset.

## Implementation Approach

1. Create `packages/config-typescript/package.json` with `name: "@the-abyss/config-typescript"`, `version: "0.0.1"`, `private: true`, and `exports` map for `./base`, `./react`, `./node`
2. Create `base.json` extending `../../tsconfig.json` with `rootDir: "src"`, `outDir: "dist"`
3. Create `react.json` extending `./base.json`, adding `jsx: "react-jsx"` and DOM lib
4. Create `node.json` extending `./base.json`, setting Node-only lib and types
5. For each directory in `packages/` and `apps/`, create a `tsconfig.json` extending the appropriate `@the-abyss/config-typescript` preset
6. Set `include: ["src/**/*"]` and `exclude: ["node_modules", "dist"]` in each per-package config

## Acceptance Criteria

- `packages/config-typescript` contains `package.json`, `base.json`, `react.json`, and `node.json`
- Every workspace package and app has a `tsconfig.json` extending one of the three presets
- `tsc --noEmit` from any package with source files resolves the extends chain without errors
- `@the-abyss/config-typescript` is resolvable via pnpm workspace after install
- Frontend packages extend react preset; API/backend extend node preset; utilities extend base

## Technical Constraints

- `packages/config-typescript` must be in pnpm workspace before other packages can extend it
- Per-package tsconfigs must reference by package name, not relative paths
- Each per-package tsconfig must specify `rootDir: src` and `outDir: dist`
- Avoid `composite: true` unless explicitly required by project references

## Relevant Files

### Files to Create

- `packages/config-typescript/package.json` — Package manifest for shareable TypeScript configs
- `packages/config-typescript/base.json` — Base preset for library/utility packages
- `packages/config-typescript/react.json` — React preset with JSX and DOM lib
- `packages/config-typescript/node.json` — Node.js preset with Node types only## Details

**Scope**: The `packages/config-typescript` shareable package with base/react/node preset configs, and one minimal `tsconfig.json` per workspace app and package directory that extends the appropriate preset

**Out of Scope**: Root tsconfig.json (previous subtask), ESLint configuration, any actual TypeScript source code inside packages, runtime dependency installation beyond what the config-typescript package itself needs

**Implementation**: 1. Create `packages/config-typescript/package.json` with `name: "@the-abyss/config-typescript"`, `version: "0.0.1"`, `private: true`, and an `exports` map pointing `./base` → `./base.json`, `./react` → `./react.json`, `./node` → `./node.json`. 2. Create `packages/config-typescript/base.json` that extends `../../tsconfig.json` (root) and adds `rootDir: "src"`, `outDir: "dist"`. 3. Create `packages/config-typescript/react.json` extending `./base.json`, overriding `jsx: "react-jsx"` and lib to include `DOM`. 4. Create `packages/config-typescript/node.json` extending `./base.json`, setting `lib: ["ES2020"]` and `types: ["node"]` only. 5. For each directory in `packages/` and `apps/`, create a `tsconfig.json` that extends the appropriate `@the-abyss/config-typescript` preset (react for frontend apps/ui package, node for backend/API apps, base for utility packages). 6. Set `include: ["src/**/*"]` and `exclude: ["node_modules", "dist"]` in each per-package config.

**Constraints**: The `packages/config-typescript` package must be listed in pnpm workspace and have a valid package.json before other packages can extend from it, Per-package tsconfigs must use the package name reference (`@the-abyss/config-typescript/react`) not relative paths, so the config resolves consistently regardless of nesting depth, Each per-package tsconfig must specify `rootDir: src` and `outDir: dist` so tsc outputs to the expected location for the build pipeline, Do not set `composite: true` unless Nx/Turbo project references are required — keep project references opt-in to avoid complicating the initial setup

**Relevant Files**: create: `packages/config-typescript/package.json` - Package manifest for the shareable TypeScript config package, exporting base, react, and node config presets as @the-abyss/config-typescript; create: `packages/config-typescript/base.json` - Base TypeScript config preset for library packages, extending root tsconfig.json; create: `packages/config-typescript/react.json` - React-specific TypeScript config preset adding jsx: react-jsx and browser lib targets; create: `packages/config-typescript/node.json` - Node.js-specific TypeScript config preset with node types and no DOM lib

## Acceptance Criteria

- [ ] The `packages/config-typescript` directory contains `package.json`, `base.json`, `react.json`, and `node.json`
- [ ] Each workspace package and application directory has its own `tsconfig.json` that extends one of the three presets via `@the-abyss/config-typescript`
- [ ] Running `tsc --noEmit` from any package with source files resolves the extends chain without errors
- [ ] The `@the-abyss/config-typescript` package is resolvable via pnpm workspace after `pnpm install`
- [ ] Frontend packages (ui, healthcare apps) extend the react preset; API/backend packages extend the node preset; utility libraries extend base

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 4 |

