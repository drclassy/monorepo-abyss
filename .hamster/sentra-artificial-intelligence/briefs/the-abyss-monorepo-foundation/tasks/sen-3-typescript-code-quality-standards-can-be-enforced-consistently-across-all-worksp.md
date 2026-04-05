---
id: "b23db912-0a36-47d5-a501-cd5846d42ecc"
entity_type: "task"
entity_id: "a1813520-d6ac-4847-8d10-7aba7bd3956c"
title: "TypeScript & Code Quality Standards can be enforced consistently across all workspace packages - Notes"
status: "todo"
priority: "high"
display_id: "SEN-3"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:20:16.996998+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## TypeScript strict mode and ESLint rules can be enforced consistently so every package in the monorepo starts with a zero-defect quality baseline.

In a multi-team healthcare monorepo, inconsistent TypeScript strictness and code style lead to `any`-type accumulation, import chaos, and review fatigue. In a clinical context, type-unsafe code can surface as runtime errors that affect patient data. This task establishes a shared quality floor — identical standards applied uniformly from day one.

## Experience

Every developer works with the same TypeScript compiler settings, ESLint rule set, and Prettier formatting. Pre-commit hooks catch violations before they reach the repository. New packages extend centralized configs from `packages/config-typescript/` and `packages/config-eslint/` — consistent quality is the default, not something to configure per-project.

## Interaction

1. Install quality toolchain: `@typescript-eslint`, `eslint-plugin-import`, `eslint-config-prettier`, `typescript`
2. Root `tsconfig.json` is authored with `strict: true` and path aliases (`@the-abyss/*`, `@app/*`)
3. `packages/config-typescript/` is created with `base.json`, `react-app.json`, and `node.json` variants
4. `packages/config-eslint/` is created with shareable rule exports
5. Root `.eslintrc.json` extends the shared configs — `no-explicit-any: error`, `explicit-function-return-types: error`, `import/order: error`
6. `.prettierignore` is added; `pnpm prettier --check .` passes clean
7. Every workspace package's `tsconfig.json` stub is created, extending the shared base
8. A deliberate `any` type in a test file triggers the pre-commit lint hook and blocks the commit — quality is verified end-to-end## Details

**User Capability**: Developers work across any workspace package with identical TypeScript strictness, ESLint rules, and auto-formatting. Running `pnpm lint` or `pnpm format` from root enforces standards across all code. Type errors and style violations are caught before commit via Husky hooks.

**Business Value**: In a monorepo with multiple teams touching different domains, inconsistent code quality standards lead to review friction, latent bugs, and `any`-type accumulation. TypeScript strict mode and unified ESLint rules create a shared quality floor — critical in a healthcare context where type-unsafe code can surface as runtime clinical errors.

**Functional Requirements**:
- Root `tsconfig.json` with `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `declaration: true`, `declarationMap: true`, `sourceMap: true`
- Path aliases configured: `@the-abyss/*` → `packages/*/src`, `@app/*` → `apps/*/src`
- Target ES2020 with ESNext modules, `isolatedModules: true`, `jsx: react-jsx`
- Root `.eslintrc.json` extending `eslint:recommended`, `@typescript-eslint/recommended`, `@typescript-eslint/recommended-requiring-type-checking`, `prettier`
- ESLint rules: `explicit-function-return-types: error`, `no-explicit-any: error`, `no-unused-vars: error` (argsIgnorePattern `^_`), `import/order: error` with group ordering, `no-console: warn` (allowing warn/error)
- Test file overrides: relax `no-explicit-any` in `*.spec.ts` and `*.test.ts`
- Centralized TypeScript configs in `packages/config-typescript/`: base, react-app, and node variants that workspace packages extend
- Centralized ESLint configs in `packages/config-eslint/`: base rules that workspace packages extend
- Root `.prettierignore` excluding node_modules, dist, build, .next, .turbo, lock files
- `lint-staged` in root `package.json`: ESLint for `*.{ts,tsx}`, Prettier for `*.{json,md,yaml}`
- Code quality guide documenting TypeScript strictness, ESLint rules, Prettier standards, and test coverage expectations (`docs/dev/code-quality.md`)

**Data Model & Structure**:
- `packages/config-typescript/`: shared tsconfig variants (base.json, react-app.json, node.json)
- `packages/config-eslint/`: shared ESLint configs (index.js with exported rules)
- Each workspace package's `tsconfig.json` extends from `packages/config-typescript/base.json`
- Path alias `@the-abyss/*` must be consistent between `tsconfig.json` paths and any bundler/module resolution config

**Technical Approach**:
- `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` for TypeScript-aware linting
- `eslint-plugin-import` for import ordering and resolution enforcement
- `eslint-config-prettier` to disable formatting-related ESLint rules (Prettier handles formatting)
- Workspace packages `config-typescript` and `config-eslint` follow the organizational blueprint's 9-package architecture
- TypeScript project references considered for faster incremental compilation in large workspaces

**User Workflows**:
1. Senior Frontend Engineer installs quality toolchain: `pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-import eslint-config-prettier typescript`
2. Engineer authors root `tsconfig.json` with strict options and path aliases
3. Engineer creates `packages/config-typescript/` with base, react-app, and node tsconfig variants
4. Engineer creates `packages/config-eslint/` with exported rule sets
5. Engineer authors root `.eslintrc.json` extending shared configs
6. Engineer adds `.prettierignore` and validates `pnpm prettier --check .` passes
7. Engineer verifies path aliases resolve correctly via `tsc --noEmit`
8. Husky pre-commit hook is verified: a commit with an `any` type triggers ESLint error and blocks commit

**Scope - INCLUDED**:
- Root `tsconfig.json` with strict configuration and path aliases
- Root `.eslintrc.json` with monorepo-wide rules
- `packages/config-typescript/` with shareable tsconfig variants
- `packages/config-eslint/` with shareable ESLint configs
- Root `.prettierignore`
- `lint-staged` integration update in root `package.json`
- Code quality documentation (`docs/dev/code-quality.md`)
- Workspace-specific `tsconfig.json` stubs for all packages/apps extending shared config

**Scope - EXCLUDED**:
- Nx `enforce-module-boundaries` ESLint rule (handled by "Nx Build Pipeline")
- Husky hook initialization (handled by "Repository & pnpm Workspace")
- Vitest/Jest test framework setup (Phase 3 per-app concern)
- Application-level TypeScript configuration beyond extending shared base

**Success Criteria**:
- `pnpm tsc --noEmit` runs without errors from root
- `pnpm eslint . --ext ts,tsx` runs with zero errors and zero warnings
- `pnpm prettier --check .` passes for all tracked files
- Path aliases `@the-abyss/*` and `@app/*` resolve correctly in IDE and compiler
- Introducing `any` type in a `.ts` file causes pre-commit hook to block the commit
- `packages/config-typescript/` and `packages/config-eslint/` are installable as workspace dependencies

**Constraints & Considerations**:
- `strict: true` implies all packages must start without `any` types — critical in healthcare domain
- `isolatedModules: true` is required for compatibility with Nx build tooling
- Path aliases must be consistent with Node module resolution at runtime (may require `tsconfig-paths` plugin)
- Test files require looser ESLint rules — overrides must be scoped precisely to spec/test files

## Context

| Field | Value |
|-------|-------|
| dependencyRationale | Repository & pnpm Workspace can be initialized as the monorepo foundation |
| testStrategy | Run `pnpm eslint . --ext ts,tsx` from root — must return zero errors and zero warnings. Run `pnpm prettier --check .` — must pass for all files. Introduce an `any` type in a non-test file and verify the pre-commit Husky hook blocks the commit. Run `pnpm tsc --noEmit` and verify path aliases (`@the-abyss/*`, `@app/*`) resolve without errors. Verify `packages/config-typescript/` and `packages/config-eslint/` can be referenced as workspace dependencies from another package. |

