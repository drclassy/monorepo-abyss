---
id: "abfac59c-c2b2-43ae-ba7e-d7437d573ceb"
entity_type: "task"
entity_id: "d2086067-a5da-488a-88fa-0c0df722e2f6"
title: "Configure root TypeScript with strict mode and workspace path aliases - Notes"
status: "todo"
priority: "high"
display_id: "SEN-9"
parent_task_id: "a1813520-d6ac-4847-8d10-7aba7bd3956c"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:24:53.644546+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

# Configure Root TypeScript with Strict Mode and Workspace Path Aliases

## Summary

Create the root `tsconfig.json` as the authoritative TypeScript configuration baseline for the entire monorepo, enabling strict mode, ES2020 target, and monorepo-wide path aliases.

## Implementation Approach

1. Create `tsconfig.json` at the repository root with `compilerOptions` targeting ES2020, module ESNext, `strict: true`, and additional strictness flags
2. Add `baseUrl: "."` and `paths` mapping `@the-abyss/*` to `packages/*/src` and `@app/*` to `apps/*/src`
3. Set `declaration: true`, `declarationMap: true`, `sourceMap: true`, `isolatedModules: true`, `jsx: "react-jsx"`
4. Include `resolveJsonModule: true`, `esModuleInterop: true`, `allowSyntheticDefaultImports: true`, `skipLibCheck: true`
5. Add `types: ["node", "vitest/globals"]`
6. Set `exclude` to `["node_modules", "dist", ".turbo", "build"]`
7. Omit `files` / `include` array — per-package configs will extend this via `"extends": "../../tsconfig.json"`

## Acceptance Criteria

- Root `tsconfig.json` exists with `strict: true` and all four additional strict flags enabled
- Path aliases `@the-abyss/*` and `@app/*` are defined with `baseUrl: "."`
- Running `tsc --noEmit -p tsconfig.json` from root produces no errors
- `isolatedModules: true` is set, confirming bundler compatibility
- `declaration: true` and `declarationMap: true` are enabled

## Technical Constraints

- Must target ES2020 for Node.js 22 and modern browser environments
- Must include `vitest/globals` in types array for test file global resolution
- Must NOT include `files` or `include` — root tsconfig is a shared base, not a compilation entry point
- `skipLibCheck: true` required to avoid errors from third-party packages with incorrect types

## Relevant Files

### Files to Create

- `tsconfig.json` — Root TypeScript configuration with strict mode, ES2020 target, path aliases, and shared compiler options## Details

**Scope**: Root tsconfig.json file only — compiler options, strict flags, path aliases, lib targets, and exclude patterns

**Out of Scope**: Per-package tsconfig.json files (separate subtask), packages/config-typescript shareable package (separate subtask), ESLint configuration, Prettier configuration, and dependency installation

**Implementation**: 1. Create `tsconfig.json` at the repository root with `compilerOptions` targeting ES2020, module ESNext, strict: true, and all additional strictness flags listed in the brief. 2. Add `baseUrl: "."` and `paths` mapping `@the-abyss/*` to `packages/*/src` and `@app/*` to `apps/*/src`. 3. Set `declaration: true`, `declarationMap: true`, `sourceMap: true`, `isolatedModules: true`, `jsx: "react-jsx"`. 4. Include `resolveJsonModule: true`, `esModuleInterop: true`, `allowSyntheticDefaultImports: true`, `skipLibCheck: true`. 5. Add `types: ["node", "vitest/globals"]`. 6. Set `exclude` to `["node_modules", "dist", ".turbo", "build"]`. 7. Do NOT include a `files` or `include` array — per-package configs will reference this via `extends`.

**Constraints**: Must target ES2020 to support Node.js 22 and modern browser environments, Must include `vitest/globals` in types array for test files to resolve Vitest globals without explicit imports, Must NOT include a `files` or `include` array — the root tsconfig is a shared base, not a compilation entry point, Must set `skipLibCheck: true` to avoid type errors from third-party packages that ship incorrect types

**Relevant Files**: create: `tsconfig.json` - Root TypeScript configuration with strict mode, ES2020 target, path aliases, and shared compiler options for all workspace packages to extend

## Acceptance Criteria

- [ ] Root tsconfig.json exists at repository root with `strict: true` and all four additional strict flags (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`) set to true
- [ ] Path aliases `@the-abyss/*` and `@app/*` are defined in `compilerOptions.paths` with `baseUrl` set to `.`
- [ ] Running `tsc --noEmit -p tsconfig.json` from the root produces no errors (even with an empty include set)
- [ ] `isolatedModules: true` is set, confirming bundler compatibility
- [ ] `declaration: true` and `declarationMap: true` are enabled, confirming exportable package type output

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 3 |

