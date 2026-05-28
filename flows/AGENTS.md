# AGENTS.md — flows

<!-- LangFlow workflow definitions and related assets. -->
<!-- Last updated: 2026-04-12 | Owner: Chief | Projects: Sentra / The Abyss -->

---

## Monorepo root (SSOT)

Read the root [`AGENTS.md`](../AGENTS.md) first. **Root wins** on any conflict.

---

## Scope

`definitions/`, `components/`, and `tests/` hold **LangFlow** (and related) AI
workflow assets. Treat changes as **versioned contracts** for anything consumed
by `apps/*` or `packages/langflow-client` when present.

---

## Conventions

- Prefer **explicit** inputs/outputs and failure semantics; align with
  `packages/shared-types` when flows expose API-shaped payloads.
- Do not embed **API keys** or patient data in flow JSON — use env/secret
  injection at runtime.
- Large or breaking flow edits: follow **JET** and Chief **GO** when required by
  root policy.

---

## Required Workflow (from root)

For every real task: (1) Read SSOT. (2) Read relevant code, docs, tests, config.
(3) Write brief notes before implementation. (4) Make the smallest complete
change. (5) Run the smallest relevant verification. (6) Recheck scope and diff.
(7) Report only after verification.

Hard gates: No SSOT read = do not implement. No verification = do not claim done.

---

## Git Safety (from root)

Allowed: `git status --short`, `git diff --stat`, `git diff`, `git log --oneline -n 10`.
Forbidden unless explicitly requested: `git reset`, `git clean`, `git push --force`, rewriting history.

---

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
