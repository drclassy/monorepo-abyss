# PROGRESS.md — The Abyss (Monorepo Root)
<!-- Agent MUST update this file at meaningful session end or completed JET phase. -->
<!-- Keep this file concise. Move deep history to PROGRESS.archive.md or session logs. -->

---

## Current Status

| Field | Value |
|-------|-------|
| **Last updated** | 2026-05-07 |
| **Active branch** | `refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy` |
| **Branch state** | `HEAD` = `aebfc51` · ahead of origin by 18 |
| **Active JET phase** | Governance and SSOT alignment in progress |
| **Primary initiative** | Monorepo operating-model cleanup: Codex persona layer, authority reconciliation, and `.agent/` operational SSOT hardening |
| **Working tree** | Dirty; active local edits across `.agent/`, `.cursor/`, `docs/handbook/`, `AGENTS.md`, `CLAUDE.md`, `package.json`, `pnpm-lock.yaml`, `tooling/governance/validate.ps1`, and new `.husky/` |

---

## Active Focus

1. Reconcile authority hierarchy:
   - `.codex/PERSONA.md` = Codex-only behavior layer
   - `AGENTS.md` = repository policy authority
   - `.agent/` = operational SSOT
2. Reduce stale or contradictory startup context in `.agent/`.
3. Keep monorepo workflow aligned with real repo state, especially branch, GO posture, and active handoff.

---

## Current Facts

- Root repo path is `V:\sentra-artificial-intelligence\abyss-monorepo`.
- Current checked-out branch is `refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy`.
- The old assumption that `master` is the active branch is stale.
- `.agent/` contains legacy material that is still valuable historically, but not all of it is safe to treat as current state without refresh.

---

## Do Not Assume

- Do not assume old cloud-exit work is still the current session target.
- Do not assume historical GO grants in `SESSION_STATE.md` are still active.
- Do not assume large historical sections in prior `PROGRESS.md` or `HANDOFF.md` reflect current execution state.

---

## Canonical References

- Architecture and stack: `.agent/CONTEXT.md`
- Active operating instructions: `.agent/HANDOFF.md`
- Persistent mistakes to avoid: `.agent/LESSONS.md`
- Durable architectural choices: `.agent/DECISIONS.md`
- Historical progress ledger: `.agent/archive/PROGRESS.archive.md`
- Session-by-session logs: `.agent/sessions/`
- Deep reference docs: `.agent/references/`

---

## Recent Milestones

- 2026-05-07: Codex repo-local behavior layer established under `.codex/` with startup hooks, persona loading, and MCP cleanup.
- 2026-05-07: `.agent/` root hygiene tightened; historical ledgers moved under `archive/` and non-state documents moved under `references/`.
- 2026-05-06: Prototype migration cleanup and smoke validation completed; see `.agent/archive/PROGRESS.archive.md` and session logs for detail.
- 2026-05-01 to 2026-05-06: Cursor/Codex governance, handbook reshaping, and workspace tooling cleanup continued; detailed ledger preserved in archives and `.agent/sessions/`.
