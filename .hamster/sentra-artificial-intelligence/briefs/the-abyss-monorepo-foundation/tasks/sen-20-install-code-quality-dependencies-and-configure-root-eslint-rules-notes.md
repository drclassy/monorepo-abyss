---
id: "dcce59b0-a269-411c-a4db-5654211a8e82"
entity_type: "task"
entity_id: "bc9561cc-fdf4-435c-81b1-b3828643b46d"
title: "Install code quality dependencies and configure root ESLint rules - Notes"
status: "todo"
priority: "high"
display_id: "SEN-20"
parent_task_id: "a1813520-d6ac-4847-8d10-7aba7bd3956c"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:26:04.189849+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

# Install Code Quality Dependencies and Configure Root ESLint Rules

## Summary

Install TypeScript ESLint plugins and the import ordering plugin, then create the root `.eslintrc.json` that enforces type-checked linting and consistent imports across all workspace packages.

## Implementation Approach

1. Add `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-import`, and `eslint-config-prettier` to root `package.json` devDependencies
2. Run `pnpm install` to resolve new dependencies across the workspace
3. Create `.eslintrc.json` at repo root with `root: true`, TypeScript parser, and `parserOptions.project: "./tsconfig.json"`
4. Set `extends` array ending with `"prettier"` to disable formatting rule conflicts
5. Configure `rules` with explicit-function-return-types, no-explicit-any, no-unused-vars (with `argsIgnorePattern`), import/order with six standard groups, and no-console as warn
6. Add `overrides` block relaxing `no-explicit-any` for test files
7. Verify with `pnpm eslint . --ext ts,tsx` — expect zero configuration errors

## Acceptance Criteria

- `.eslintrc.json` exists at repo root with `root: true` and TypeScript parser
- All required devDependencies are in root `package.json` and resolvable after `pnpm install`
- `pnpm eslint . --ext ts,tsx` exits with code 0 on a clean codebase
- Test file override relaxes `no-explicit-any` for `*.spec.ts` and `*.test.ts`
- `import/order` rule configured with all six standard import groups

## Technical Constraints

- `parserOptions.project` must point to root `tsconfig.json` to enable type-checked rules
- `"prettier"` must be the last entry in `extends` — order is critical
- `root: true` must be set to prevent ESLint from traversing above the repo root
- Use ESLint 8.x (not flat config format) for plugin compatibility

## Relevant Files

### Files to Create

- `.eslintrc.json` — Root ESLint configuration with TypeScript rules, import ordering, and test overrides## Details

**Scope**: Root `.eslintrc.json` file, installation of TypeScript ESLint and import plugin dependencies at workspace root

**Out of Scope**: Architectural boundary ESLint rules (handled by Nx Build Pipeline sibling task), `packages/config-eslint` shareable package (separate subtask), lint-staged configuration (separate subtask), per-package ESLint overrides beyond what the root config handles

**Implementation**: 1. Add `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-import`, and `eslint-config-prettier` to root `package.json` devDependencies. 2. Run `pnpm install` to resolve these new deps across the workspace. 3. Create `.eslintrc.json` at repo root with `root: true`, `parser: "@typescript-eslint/parser"`, and `parserOptions.project: "./tsconfig.json"`. 4. Set `extends` array: `["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:@typescript-eslint/recommended-requiring-type-checking", "prettier"]`. 5. Add `plugins: ["@typescript-eslint", "import"]`. 6. Configure `rules` with the specific entries from the brief (explicit-function-return-types, no-explicit-any, no-unused-vars with argsIgnorePattern, import/no-unresolved, import/order with group ordering, no-console as warn). 7. Add `overrides` block targeting `**/*.spec.ts` and `**/*.test.ts` to set `@typescript-eslint/no-explicit-any: off`. 8. Verify by running `pnpm eslint . --ext ts,tsx` from root — expect no lint errors from configuration files themselves.

**Constraints**: The `parserOptions.project` must point to the root `tsconfig.json` to enable type-checked lint rules like `recommended-requiring-type-checking`, Must include `"prettier"` as the last entry in `extends` to disable all ESLint formatting rules that Prettier manages — order is critical, `root: true` must be set so ESLint does not continue searching for config files above the repo root, ESLint 8.x (as specified in the brief's root `package.json`) must be used, not ESLint 9's flat config format, to avoid compatibility issues with the listed plugins

**Relevant Files**: create: `.eslintrc.json` - Root ESLint configuration with TypeScript-aware rules, import ordering, and test file overrides applied across all workspace packages

## Acceptance Criteria

- [ ] `.eslintrc.json` exists at repo root with `root: true` and `parser: "@typescript-eslint/parser"`
- [ ] All required devDependencies (`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-import`, `eslint-config-prettier`) appear in root `package.json` and are resolvable after `pnpm install`
- [ ] `pnpm eslint . --ext ts,tsx` exits with code 0 on a clean codebase (no errors from configuration itself)
- [ ] Test file override block exists in `.eslintrc.json`, relaxing `no-explicit-any` for `*.spec.ts` and `*.test.ts` patterns
- [ ] `import/order` rule is configured with the six standard groups (builtin, external, internal, parent, sibling, index)

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 4 |

