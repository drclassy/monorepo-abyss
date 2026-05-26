# AGENTS.md — ABYSS Monorepo

Last updated: 2026-05-26

## Purpose

ABYSS is a production-oriented Sentra monorepo. This file is the root operating
contract. `.agent/` is the active SSOT for continuity, handoff, and current
state.

Use `pnpm`, not `npm` or `yarn`, unless a package explicitly proves otherwise.

## Instruction Authority

Apply instructions in this order:

1. Current user instruction
2. Nearest local `AGENTS.override.md`, if present
3. Nearest local `AGENTS.md`
4. Root `AGENTS.md`
5. Global Codex guidance in `C:\Users\drclassy\.codex\`

Rules:

- Read this file first for repo-wide work.
- Read `.agent/README.md` and `.agent/HANDOFF.md` for active continuity.
- Read `.agent/CONTEXT.md`, `.agent/DECISIONS.md`, and `.agent/PROGRESS.md` as
  needed.
- Do not replace `.agent/` with `AGENTS.md`.
- Do not turn this file into a status report or session ledger.

## Required Workflow

For every real task:

1. Read SSOT.
2. Read the relevant code, docs, tests, and config.
3. Write brief notes before implementation.
4. Make the smallest complete change.
5. Run the smallest relevant verification.
6. Recheck scope and diff.
7. Report only after verification.

Hard gates:

- No SSOT read = do not implement.
- No relevant reference read = do not implement.
- No brief notes = do not implement.
- No verification = do not claim done.
- No unrelated changes.

## Boundary Rules

- Keep changes small, typed, reviewable, and reversible.
- Prefer existing patterns over new abstractions.
- Do not invent APIs, config keys, or project structure.
- Use Context7 only for public framework, library, and API documentation.
- For any work under `apps/`, read `apps/AGENTS.md` and follow
  `apps/_governance/APP_BOUNDARY_PREFLIGHT.md` before implementation.

## Repository Validity and Orphan Rules

Git tracking is not proof of validity. Git records the accepted state after
architecture has been corrected; it is not the authority for whether a file,
folder, app, package, workflow, or infrastructure artifact belongs in ABYSS.

An item is valid only when all of these can be explained:

- Purpose: why it exists now.
- Owner: which app, package, workflow, or governance surface owns it.
- Location: why its path matches the repo taxonomy.
- Workspace status: how it belongs to pnpm, turbo, app/package registry, static
  docs, tooling, or infrastructure.
- Reference: how active build, test, docs, deployment, or workflow surfaces use
  it.
- Boundary safety: why it does not violate crown-jewel isolation, platform
  boundaries, infrastructure separation, or governance rules.
- Verification: which relevant gate proves it does not break the repo.

If any point cannot be proven, classify the item as `ORPHAN_CANDIDATE` or the
nearest explicit risk class such as `STALE_ARTIFACT`,
`ARCHITECTURE_REVIEW_REQUIRED`, or `BOUNDARY_RISK`. Then resolve it with one
final decision: `KEEP_AND_COMMIT`, `FIX_AND_COMMIT`, `MOVE_OUT_OF_REPO`, or
`DELETE_OR_RESTORE`.

Tracked files can still be orphaned, obsolete, misplaced, duplicated, generated,
or harmful. Do not use "tracked by Git" as a reason to keep anything in the
active repo.

## Protected Areas

- `.agent/` is protected SSOT knowledge. Do not delete, clean, reset, or treat
  it as junk.
- `packages/sentra/**` is crown-jewel review-first territory. Diagnose first and
  edit only with explicit approval.
- Do not expose or commit secrets, `.env` values, PHI, or patient data.
- Do not change auth, database schema, migrations, deployment, CI/CD, Docker,
  Terraform, or secret-management without explicit approval.
- For clinical, diagnosis, RAG, OCR, and healthcare workflows, keep human
  review, uncertainty, and auditability visible.

## Git Safety

Allowed inspection:

```powershell
git status --short
git diff --stat
git diff --name-status
git diff
git log --oneline -n 10
```

Do not use broad staging commands such as `git add .` or `git add -A`.

Forbidden unless explicitly requested:

- `git reset`
- `git clean`
- `git push --force`
- deleting untracked user files
- rewriting history
- reverting user changes

## Verification

Prefer the smallest meaningful check first:

1. Direct repro/runtime check
2. Targeted test
3. Behavioral test
4. Focused lint
5. Typecheck
6. Build

For documentation-only changes, verify with:

```powershell
git diff --stat
git diff --name-status
```

For broader repo verification when needed, prefer:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.codex\scripts\verify-local.ps1"
```

Use the safe fallback only when the workspace is incomplete:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.codex\scripts\verify-local-safe.ps1"
```

Do not claim done without fresh verification evidence.

## Final Report

Use this structure:

```text
SSOT Used:
Relevant Reference Used:
Brief Notes:
Files Changed:
Changes Made:
Verification:
Checklist Recheck:
Remaining Risk:
Next Step:
```
