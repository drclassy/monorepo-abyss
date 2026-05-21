# PROGRESS.md - The Abyss (Monorepo Root)
<!-- Agent MUST update this file at meaningful session end or completed JET phase. -->
<!-- Keep this file concise. Move deep history to PROGRESS.archive.md or session logs. -->

---

## Current Status

| Field | Value |
|-------|-------|
| **Last updated** | 2026-05-16 17:06 |
| **Active branch** | `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar` |
| **Branch state** | `HEAD` = `3039306` |
| **Active JET phase** | Governance and SSOT alignment in progress |
| **Primary initiative** | Preserve `.agent/` as mandatory operational SSOT for every agent before technical repo work |
| **Working tree** | Dirty; active local edits exist and must be treated as active context, not noise |

---

## Active Focus

1. Enforce authority hierarchy:
   - `AGENTS.md` = public repository rulebook
   - `.agent/` = operational SSOT
2. Make `.agent/` continuity loading mandatory for every agent session.
3. Keep startup context aligned with real repo state, current GO posture, and active handoff.
4. Resume build-blocker work only after `.agent/` is confirmed safe.

---

## Current Facts

- Root repo path is `D:\Devops\abyss-monorepo`.
- Current checked-out branch is `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar`.
- `.agent/` exists and contains live state, archives, references, sessions, hooks, scripts, reports, and workflows.
- `.agent/` must not be deleted, moved, cleaned, reset, or treated as junk/cache.
- `.agent/DIGEST.md` is generated from the live handoff/progress/lessons state and should be read first when present.

---

## Do Not Assume

- Do not assume old cloud-exit work is still the current session target.
- Do not assume historical GO grants in `SESSION_STATE.md` are still active.
- Do not assume large historical sections in prior `PROGRESS.md` or `HANDOFF.md` reflect current execution state.
- Do not assume `AGENTS.md` replaces `.agent/`.
- Do not continue technical work when `.agent/` integrity is in doubt.

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

- 2026-05-16: `.agent/` was reaffirmed as protected operational SSOT. Agent startup must verify `.agent/`, read the continuity state, and report status before substantial repo work.
- 2026-05-07: `apps/corporate/ferdiiskandar` landed in monorepo. Migrated from `V:\sentra-artificial-intelligence\class-prototype\ferdiiskandar` as `@the-abyss/ferdiiskandar` (Tier 3 Shell). Build/lint/typecheck/test green. Branch: `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar`. Source preserved pending archival sign-off.
- 2026-05-07: Codex repo-local behavior layer established under `.codex/` with startup hooks, persona loading, and MCP cleanup.
- 2026-05-07: `.agent/` root hygiene tightened; historical ledgers moved under `archive/` and non-state documents moved under `references/`.
- 2026-05-06: Prototype migration cleanup and smoke validation completed; see `.agent/archive/PROGRESS.archive.md` and session logs for detail.
- 2026-05-01 to 2026-05-06: Cursor/Codex governance, handbook reshaping, and workspace tooling cleanup continued; detailed ledger preserved in archives and `.agent/sessions/`.
