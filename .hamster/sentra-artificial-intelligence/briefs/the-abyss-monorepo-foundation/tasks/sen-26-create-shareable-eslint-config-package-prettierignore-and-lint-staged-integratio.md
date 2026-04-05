---
id: "24fcc4ad-7348-467d-9737-c9ea10a21585"
entity_type: "task"
entity_id: "934b393a-593c-44ff-9dc8-687ede2662f5"
title: "Create shareable ESLint config package, .prettierignore, and lint-staged integration - Notes"
status: "todo"
priority: "medium"
display_id: "SEN-26"
parent_task_id: "a1813520-d6ac-4847-8d10-7aba7bd3956c"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:26:42.18058+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

# Create Shareable ESLint Config Package, .prettierignore, and Lint-Staged Integration

## Summary

Create the `packages/config-eslint` shareable ESLint package, the `.prettierignore` file, and the lint-staged configuration in root `package.json` so pre-commit hooks automatically enforce quality on staged files.

## Implementation Approach

1. Create `packages/config-eslint/package.json` with `name: "@the-abyss/config-eslint"`, peer deps listing ESLint and TypeScript plugins
2. Create `packages/config-eslint/index.js` exporting the shared rules object (without `root: true`)
3. Update root `.eslintrc.json` to extend `"@the-abyss/config-eslint"` as primary rule source
4. Create `.prettierignore` listing `node_modules/`, `dist/`, `build/`, `.next/`, `.turbo/`, lock files, and logs
5. Add `lint-staged` block to root `package.json` mapping `*.{ts,tsx}` → `eslint --fix` and `*.{json,md,yaml}` → `prettier --write`
6. Confirm `lint-staged` is in root devDependencies
7. Validate with `pnpm lint-staged --dry-run`

## Acceptance Criteria

- `packages/config-eslint` contains `package.json` and `index.js`, resolvable as `@the-abyss/config-eslint` via pnpm workspace
- `.prettierignore` exists with `node_modules/`, `dist/`, `.turbo/`, and `pnpm-lock.yaml` entries
- Root `package.json` contains a `lint-staged` key with correct file-to-command mappings
- `pnpm lint-staged --dry-run` exits without configuration errors
- Any package can consume the config via `extends: ["@the-abyss/config-eslint"]`

## Technical Constraints

- `packages/config-eslint/index.js` must NOT set `root: true`
- Peer dependency versions must match root-installed plugin versions
- `lint-staged` must only target staged files, not all files
- `.prettierignore` must cover `.turbo/` to protect Turborepo cache

## Relevant Files

### Files to Create

- `packages/config-eslint/package.json` — Package manifest for shareable ESLint config
- `packages/config-eslint/index.js` — Exported ESLint rules object for workspace consumption
- `.prettierignore` — Prettier exclusion list for generated and vendored files## Details

**Scope**: `packages/config-eslint` package (manifest + exported config), `.prettierignore` file, `lint-staged` configuration block in root `package.json`

**Out of Scope**: Husky pre-commit hook installation (belongs to Repository & pnpm Workspace sibling task), `.prettierrc` file (already created in pnpm workspace sibling task), `lint-staged` package installation if already declared in root devDependencies, per-package ESLint override files

**Implementation**: 1. Create `packages/config-eslint/package.json` with `name: "@the-abyss/config-eslint"`, `version: "0.0.1"`, `private: true`, `main: "index.js"`, and `peerDependencies` listing `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, and `eslint-plugin-import`. 2. Create `packages/config-eslint/index.js` that exports a config object mirroring the root `.eslintrc.json` rules (without `root: true`), so it can be consumed by any workspace package. 3. Update root `.eslintrc.json` to extend `"@the-abyss/config-eslint"` as its primary rule source, keeping direct rule entries in root config only for monorepo-root-specific overrides. 4. Create `.prettierignore` at repo root listing `node_modules/`, `dist/`, `build/`, `.next/`, `.turbo/`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `*.log`, `.DS_Store`. 5. Add `lint-staged` configuration block to root `package.json`: `{"*.{ts,tsx}": "eslint --fix", "*.{json,md,yaml}": "prettier --write"}`. 6. Confirm `lint-staged` is in root devDependencies (add it if not already present). 7. Run a manual lint-staged dry run (`pnpm lint-staged --dry-run`) to confirm config is valid.

**Constraints**: The `packages/config-eslint/index.js` must NOT set `root: true` so it can be safely extended by nested package configs, Peer dependencies in `packages/config-eslint/package.json` must match the actual plugin versions installed at root to avoid version conflict warnings, `lint-staged` must target only staged files — do not configure it to run on all files as that defeats the purpose of incremental pre-commit checks, The `.prettierignore` patterns must cover `.turbo/` to prevent Prettier from touching Turborepo's internal cache directory

**Relevant Files**: create: `packages/config-eslint/package.json` - Package manifest for the shareable ESLint config package, named @the-abyss/config-eslint; create: `packages/config-eslint/index.js` - Exported ESLint config object that workspace packages can extend to inherit all shared linting rules; create: `.prettierignore` - Prettier ignore file listing directories and file patterns that should not be auto-formatted

## Acceptance Criteria

- [ ] `packages/config-eslint` directory contains `package.json` and `index.js`, and the package is resolvable as `@the-abyss/config-eslint` via pnpm workspace
- [ ] `.prettierignore` exists at repo root and includes `node_modules/`, `dist/`, `.turbo/`, and `pnpm-lock.yaml` entries
- [ ] Root `package.json` contains a `lint-staged` key with rules mapping `*.{ts,tsx}` to eslint fix and `*.{json,md,yaml}` to prettier write
- [ ] Running `pnpm lint-staged --dry-run` on a clean staged change exits without configuration errors
- [ ] The shareable config can be consumed by creating a minimal `.eslintrc.json` with `extends: ["@the-abyss/config-eslint"]` in any package directory

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 3 |

