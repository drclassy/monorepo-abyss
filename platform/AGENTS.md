# AGENTS.md — apps/platform

<!-- Division bridge: AI coordination & Sentra portal. -->
<!-- Last updated: 2026-04-12 | Owner: Chief | Projects: Sentra / The Abyss -->

---

## Monorepo root (SSOT)

Read the root [`AGENTS.md`](../../AGENTS.md) first. **Root wins** on any
conflict.

---

## Sub-apps

| Package       | Path                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| Orchestrator  | [`orchestrator/AGENTS.md`](./orchestrator/AGENTS.md)                         |
| Sentra Portal | `sentra-portal/` — governed by this file until a scoped `AGENTS.md` is added |

---

## Division scope

Public interfaces for **orchestration** and **portal** — breaking changes in
`orchestrator` exports require review per app `AGENTS.md` and root
contract-first rules.

---

## Required Workflow (from root)

For every real task: (1) Read SSOT. (2) Read relevant code, docs, tests, config.
(3) Write brief notes before implementation. (4) Make the smallest complete
change. (5) Run the smallest relevant verification. (6) Recheck scope and diff.
(7) Report only after verification.

Hard gates: No SSOT read = do not implement. No verification = do not claim
done.

---

## Git Safety (from root)

Allowed: `git status --short`, `git diff --stat`, `git diff`,
`git log --oneline -n 10`. Forbidden unless explicitly requested: `git reset`,
`git clean`, `git push --force`, rewriting history.

---

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
