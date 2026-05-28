# AGENTS.md — apps/platform/orchestrator

<!-- Cross-tool agent instructions: Claude Code, Cursor, Codex, Windsurf, Copilot -->
<!-- Last updated: 2026-04-12 | Owner: Chief | Projects: Sentra / The Abyss -->

---

## 0. Monorepo root (SSOT)

**Authoritative monorepo rules:** read the root
[`AGENTS.md`](../../../AGENTS.md) first (Required Workflow, Boundary Rules,
Protected Areas, Git Safety, Verification).

This file adds **scoped** instructions for this package only. If anything
conflicts, **root `AGENTS.md` wins**.

**Instruction authority:** Current user → nearest `AGENTS.override.md` → this
file → root `AGENTS.md` → `C:\Users\drclassy\.codex\` global guidance.

**Also:** `packages/shared-types` for shared contracts; **never** run
`terraform apply` / `terraform destroy` (Chief only).

---

## 1. Project introduction

**Orchestrator** (`@the-abyss/orchestrator`) — TypeScript coordination layer
(NestJS-style stack per `package.json`). Public surface changes need review per
monorepo map in root `AGENTS.md`.

---

## 2. Memory protocol

Follow root [`AGENTS.md`](../../../AGENTS.md) §2. If this package has a local
`.agent/` folder, read it after root context; otherwise use root `.agent/` for
handoff when work spans the monorepo.

---

## 3. Required Workflow

Non-trivial tasks follow the **Required Workflow** from root
[`AGENTS.md`](../../../AGENTS.md). No execution before all pre-implementation
gates pass (read SSOT, read relevant code, write brief notes).

---

## 4. Commands (from monorepo root)

```powershell
pnpm install
pnpm --filter @the-abyss/orchestrator dev
pnpm --filter @the-abyss/orchestrator build
pnpm --filter @the-abyss/orchestrator test
pnpm --filter @the-abyss/orchestrator lint
pnpm --filter @the-abyss/orchestrator typecheck
```

---

## 5. Technical conventions

**Always do:** English for code and agent-facing docs; explicit error handling;
Conventional Commits; `pnpm --filter` for this package.

**Never do:** secrets or PII in logs; fabricate test output; silent catch
blocks.

---

## 6. Pre-PR checklist

Align with root [`AGENTS.md`](../../../AGENTS.md): tests, lint, typecheck, no
secrets/PII, `.agent/` updates when applicable, commit trailer when required.

---

## 7. Git Safety

Allowed inspection:

```powershell
git status --short
git diff --stat
git diff --name-status
git diff
git log --oneline -n 10
```

Do not use `git add .` or `git add -A`. Forbidden unless explicitly requested:
`git reset`, `git clean`, `git push --force`, rewriting history.

---

## 8. Verification

Prefer the smallest meaningful check: direct repro → targeted test → lint →
typecheck → build. Do not claim done without fresh verification evidence.

---

## 9. Final Report

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

---

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
