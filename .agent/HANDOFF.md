# HANDOFF.md — The Abyss (Monorepo Root)
<!-- Overwrite at the start of each new session. Keep it short and operational. -->
<!-- Last updated: 2026-05-07 · Agent: Codex · Session: ssot-governance-reconciliation -->

---

## Authority Reminder

- Read `.codex/PERSONA.md` first.
- Then read `AGENTS.md`.
- Then read `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, `HANDOFF.md`, `.agent/LESSONS.md`, and `.agent/DECISIONS.md`.
- `AGENTS.md` is repository policy authority.
- `.agent/` is the operational SSOT.

---

## Quick Orient

**Branch:** `refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy`
**HEAD:** `aebfc51`
**Branch divergence:** ahead of origin by 18
**Working tree:** dirty; multiple in-progress local edits exist and must be treated as active context, not noise

---

## Active Mission

1. Harden `.agent/` as the operational SSOT.
2. Remove stale and contradictory startup context.
3. Preserve historical records in archives and session logs without letting them masquerade as current state.

---

## Current High-Signal State

- Codex behavior layering is now repo-local under `.codex/`.
- `.codex/PERSONA.md` is the Codex-only behavior layer.
- `AGENTS.md` has been reclassified from SSOT to repository policy authority.
- `.agent/` now needs consistency cleanup so its files can safely function as operational truth.

---

## Constraints

- Do not touch unrelated product code while performing governance cleanup.
- Do not assume blanket GO for risky work from historical session state.
- Do not overwrite append-only records in `LESSONS.md` or `DECISIONS.md`; append corrective entries instead.
- Preserve auditability by keeping archives and session logs intact.

---

## Immediate Next Steps

1. Keep `.agent/CONTEXT.md` factual and architecture-only.
2. Keep `.agent/PROGRESS.md` as current-state summary, not historical ledger.
3. Keep `.agent/HANDOFF.md` limited to active execution context.
4. Treat `.agent/SESSION_STATE.md` as expired by default unless a fresh GO is recorded.
5. Append authority-model correction to `.agent/DECISIONS.md`.

---

## Archive Pointers

- Prior handoff ledger: `.agent/archive/HANDOFF.archive.md`
- Historical progress ledger: `.agent/archive/PROGRESS.archive.md`
- Full session trail: `.agent/sessions/`
- Deep reference docs: `.agent/references/`
