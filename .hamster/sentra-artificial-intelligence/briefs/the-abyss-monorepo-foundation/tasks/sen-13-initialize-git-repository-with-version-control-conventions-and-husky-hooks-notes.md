---
id: "11d33d0d-5712-423f-8a3b-26751c80dbb1"
entity_type: "task"
entity_id: "67974976-b267-4c81-b2f4-b504136421d8"
title: "Initialize Git repository with version control conventions and Husky hooks - Notes"
status: "todo"
priority: "urgent"
display_id: "SEN-13"
parent_task_id: "ac782654-8b5c-4c56-b3fb-aca81a26ac55"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:25:10.028967+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Initialize the `the-abyss` Git repository with `.gitignore`, `.gitattributes`, and Husky lifecycle hooks that enforce commit and push quality gates.

## Implementation Approach

1. Create the GitHub repository `the-abyss` (private) or run `git init the-abyss` and configure the remote.
2. Create `.gitignore` covering: `node_modules/`, `dist/`, `build/`, `.next/`, `.turbo/`, `.env`, `.env.local`, `.env.*.local`, `coverage/`, `.nyc_output/`, `*.log`, `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `*.swp`.
3. Create `.gitattributes` with `* text=auto` and `eol=lf` overrides for `*.ts`, `*.tsx`, `*.js`, `*.json`, `*.md`.
4. Add `husky` as a dev dependency; add `"prepare": "husky install"` to root `package.json` scripts.
5. Run `npx husky install` to scaffold `.husky/` directory.
6. Register `.husky/pre-commit` → `pnpm lint-staged`.
7. Register `.husky/pre-push` → `bash scripts/ci-validate.sh` (pnpm lint + build + test).
8. Create `docs/dev/git-workflow.md` stub documenting branch naming and `[PHASE] [DOMAIN] Message` commit convention.

## Acceptance Criteria

- Repository initialized; initial commit contains `.gitignore`, `.gitattributes`, and `.husky/` directory
- `.gitignore` prevents staging of all specified artifact categories — verified by `git status` test
- `.gitattributes` enforces `eol=lf` for TS/JS/JSON/MD — verified by `git check-attr eol`
- Husky pre-commit hook runs `lint-staged` successfully on a clean staged commit
- Pre-push hook at `.husky/pre-push` executes validation script without error on a clean workspace
- `docs/dev/git-workflow.md` documents branch naming convention and commit message format

## Technical Constraints

- Node.js >= 22.0.0 required (enforced in `package.json` engines field)
- pnpm >= 9.0.0; Husky prepare script must use `pnpm`
- All hook scripts must be POSIX bash-compatible
- `pnpm-lock.yaml` must NOT be gitignored — lockfile must be committed

## Code Patterns to Follow

- Use `pnpm add -D husky lint-staged` at the workspace root
- Husky v9 uses `husky install` and individual hook files under `.husky/`
- lint-staged configuration lives under `"lint-staged"` key in root `package.json`

## Relevant Files

### Files to Create

- `.gitignore` - Comprehensive exclusion rules for the monorepo
- `.gitattributes` - Line-ending normalization rules
- `.husky/pre-commit` - lint-staged invocation on staged files
- `.husky/pre-push` - Full validation script invocation
- `scripts/ci-validate.sh` - Thin shell wrapper running pnpm lint, build, test
- `docs/dev/git-workflow.md` - Stub branch naming and commit convention guide## Details

**Scope**: Git repository creation; .gitignore with all relevant exclusions; .gitattributes for line-ending normalization; Husky installation and hook registration (pre-commit lint-staged, pre-push validation); stub docs/dev/git-workflow.md documenting branch naming and commit message conventions.

**Out of Scope**: Branch protection rules configuration on GitHub (CI/CD sibling task); CODEOWNERS file (CI/CD sibling task); full developer onboarding documentation (Developer Documentation sibling task); TypeScript/ESLint configuration referenced by lint-staged (TypeScript & Code Quality sibling task); pnpm-workspace.yaml and root package.json (covered in the pnpm workspace subtask).

**Implementation**: 1. Create the GitHub repository `the-abyss` as private, or run `git init the-abyss` locally and set the remote origin.
2. Create `.gitignore` covering all specified categories (dependencies, build outputs, IDE, environment, OS, logs, test coverage).
3. Create `.gitattributes` with `* text=auto` and per-extension `eol=lf` rules for TS, JS, JSON, and Markdown files.
4. Add `husky` as a dev dependency in the root `package.json` (coordinate with pnpm workspace subtask for the package.json baseline) and add a `"prepare": "husky install"` script.
5. Run `npx husky install` to create the `.husky/` directory.
6. Add `.husky/pre-commit` hook: `pnpm lint-staged` — lint-staged config lives in root `package.json`.
7. Add `.husky/pre-push` hook: `bash scripts/ci-validate.sh` (script is a thin wrapper: `pnpm lint && pnpm turbo run build && pnpm turbo run test`).
8. Create `docs/dev/git-workflow.md` as a stub documenting branch naming and commit conventions — mark it as a stub pending the Developer Documentation sibling task.

**Constraints**: Node.js >= 22.0.0 must be available in the environment (enforced via engines field in package.json), pnpm >= 9.0.0 must be used as the package manager — Husky's prepare script must invoke pnpm not npm, All hook scripts must be POSIX-compatible shell (bash) to run on both macOS and Linux CI runners, Line endings must be LF throughout; Windows contributors must have Git configured with core.autocrlf=false or rely on .gitattributes enforcement, .gitignore must NOT exclude pnpm-lock.yaml — the lockfile must be committed to ensure reproducible installs

**Relevant Files**: create: `.gitignore` - Comprehensive exclusion rules covering node_modules, build outputs, env files, OS artifacts, IDE directories, and log files; create: `.gitattributes` - Line-ending normalization: text=auto globally, eol=lf for TS/JS/JSON/MD files; create: `.husky/pre-commit` - Git pre-commit hook that invokes pnpm lint-staged on staged files; create: `.husky/pre-push` - Git pre-push hook that runs the full validation script; create: `scripts/ci-validate.sh` - POSIX shell script running pnpm lint, turbo build, and turbo test sequentially; create: `docs/dev/git-workflow.md` - Stub documentation for branch naming conventions and commit message format

## Acceptance Criteria

- [ ] Repository is initialized and accessible; git log shows an initial commit containing .gitignore, .gitattributes, and .husky/ directory
- [ ] .gitignore prevents staging of node_modules/, .env, .env.local, dist/, build/, .next/, .turbo/, coverage/, *.log, .DS_Store, and IDE directories — verified by running git status after creating files matching these patterns
- [ ] .gitattributes sets * text=auto globally and eol=lf for *.ts, *.tsx, *.js, *.json, and *.md — verified by running git check-attr eol on sample files
- [ ] Husky is installed (`.husky/` directory present, husky script in package.json prepare hook) and pre-commit hook runs lint-staged on staged .ts/.tsx files without errors on a clean commit
- [ ] Pre-push hook exists at .husky/pre-push and executes the validation script; a test push with a clean workspace completes successfully
- [ ] docs/dev/git-workflow.md exists and documents the branch naming convention (feature/*, bugfix/*, chore/*) and commit message format ([PHASE] [DOMAIN] Message)

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 3 |

