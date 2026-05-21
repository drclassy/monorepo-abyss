# AGENT DIGEST — Auto-generated 2026-05-16 18:22
> Compact startup summary. File ini di-generate otomatis oleh session-start.ps1. Jangan edit manual.

## SSOT File Standard
- CONTEXT.md = stable repo context and boundaries.
- SESSION_STATE.md = current GO posture and safety state.
- HANDOFF.md = active continuity file for the next agent.
- PROGRESS.md = current status and milestones.
- DECISIONS.md = durable decisions; append only.
- LESSONS.md = repeated mistakes and guardrails; append only.
- DIGEST.md = generated startup summary from the SSOT files.

## Mandatory Startup Contract
Every agent must verify .agent/ exists before substantive repo work.

- AGENTS.md = public rulebook.
- .agent/ = operational SSOT for continuity, digest, guardrails, handoff records, operational memory, and workflow state.
- Read this digest first when present, then read SESSION_STATE.md, HANDOFF.md, CONTEXT.md, PROGRESS.md, LESSONS.md, and DECISIONS.md as needed.
- Do not delete, move, clean, reset, ignore, or treat .agent/ as cache/junk.
- Do not replace .agent/ with AGENTS.md.

## Detail-On-Demand Rule
Read this digest first. Open full SSOT files only when needed:
- Need repo boundaries: CONTEXT.md
- Need next action: HANDOFF.md
- Need current status: PROGRESS.md
- Need safety posture: SESSION_STATE.md
- Need prior decisions: search DECISIONS.md
- Need repeated mistakes: search LESSONS.md

## Session State Excerpt
# SESSION_STATE.md — Agent Session GO Tracking
<!-- Update this file when Chief grants or revokes GO. Historical GO must not be treated as evergreen. -->
---
## Current Session
| Field | Value |
|-------|-------|
| **Last updated** | 2026-05-07 |
| **Session status** | No fresh GO recorded in this file for the current working session |
| **Default posture** | No carry-forward GO; require explicit fresh instruction for high-risk work |
| **Classes auto-assumed safe** | Class A only |
| **Classes requiring explicit fresh GO** | Class B and Class C when risk is non-trivial or state is ambiguous |
---
## Active Interpretation Rule
- Historical GO entries are archival, not automatically active.
- If Chief has not granted a fresh GO in the current execution context, treat risky work as not appro
...[open full file if needed]

## Active Handoff Excerpt
# HANDOFF.md - The Abyss Monorepo
<!-- Operational SSOT handoff for the next agent/thread. -->
<!-- Last updated: 2026-05-16 - Agent: Codex - Session: monorepo-stabilization-typecheck -->
---
## Authority Reminder
Before any non-trivial repo work, every agent must:
1. Verify `.agent/` exists.
2. Verify critical files exist: `CONTEXT.md`, `PROGRESS.md`, `HANDOFF.md`, `LESSONS.md`, `DECISIONS.md`, `SESSION_STATE.md`.
3. Read `.agent/DIGEST.md` first when present, then read the task-relevant `.agent/` files.
4. Treat `AGENTS.md` as the public rulebook and `.agent/` as the operational SSOT.
Forbidden: deleting, moving, cleaning, resetting, ignoring, or treating `.agent/` as cache/junk.
---
## Quick Orient
**Repo:** `D:\Devops\abyss-monorepo`
**Branch:** `refactor/ABYSS-REPO-STRUCTURE-002-corporate-ferdiiskandar`
**HEAD:** `3039306`
**Working tree:** dirty; existing local edits are active context, not noise.
**Protected SSOT:** `.agent/` exists and must be preserved.
---
## Current Mission State
The stabilization chain has progressed past build blockers.
Verified outcomes:
- `pnpm build` passes in the global verifier.
- `@the-abyss/academic-solutions` build blocker was fixed earlier.
- `@the-abyss/orchestrator` Prisma export/cache blocker was fixed.
- `@the-abyss/daf-website` Windows standalone symlink blocker was fixed by making standalone opt-in.
- Root `pnpm typecheck` now fails only on remaining `packages/sentra/**` crown jewel review items.
---
## Changes Made In This Chain
C
...[open full file if needed]

## Current Progress Excerpt
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
3. Keep startup context aligned with real repo state, curr
...[open full file if needed]

## Recent Lessons Excerpt
### [2026-04-23] PyMuPDF di Windows menulis error ke stdout (fd 1), bukan stderr
**Mistake:** MuPDF C-level error messages tertulis ke stdout saat Python berjalan di Windows. `execFileAsync` capture stdout → error messages ikut ter-embed sebagai chunk content di database.
**New rule:** Selalu tambahkan `fitz.TOOLS.mupdf_display_errors(False)` di awal setiap script PyMuPDF. Jangan assume MuPDF errors pergi ke stderr.
**Trigger:** Setiap script Python yang menggunakan PyMuPDF/fitz.


### [2026-04-23] PDF chunker wajib punya fallback untuk plain-text tanpa markdown headings
**Mistake:** Chunker hanya split by `\n\n+` (double newline). PyMuPDF output pakai `\n` single, sehingga seluruh teks doku
...[open LESSONS.md if needed]
