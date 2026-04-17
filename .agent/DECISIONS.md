# DECISIONS.md — The Abyss (Monorepo Root)
<!-- Append-only. NEVER delete or edit existing entries. -->

---

### [2026-04-10] AGENTS.md as cross-tool source of truth
**Context:** Multiple AI tools (Claude Code, Cursor, Codex, Windsurf) need consistent instructions.
**Decision:** AGENTS.md at root = single source of truth. Division AGENTS.md = scoped additions only. Sub-app AGENTS.md = thin bridge.
**Rejected alternatives:** CLAUDE.md only, .cursor/rules/ only.
**Rationale:** AGENTS.md is Linux Foundation standard; widest tool support; prevents rule duplication.
**Consequences:** Root AGENTS.md must stay lean; division files add domain rules only; never duplicate root content.

### [2026-04-10] Single session log protocol
**Context:** Two parallel session log systems existed (.agent/sessions/ and an external audit folder) with no bridge.
**Decision:** `.agent/sessions/` is the single source of truth for agent session logs. The external audit folder has been deprecated.
**Rationale:** One system is simpler and less error-prone. `.agent/sessions/` serves both context recovery and lightweight audit needs.
**Consequences:** Every coding session updates `.agent/sessions/YYYY-MM-DD.md` only.

### [2026-04-10] .claude/ folder at monorepo root
**Context:** Claude Code settings.json, subagents, commands, and skills need a home.
**Decision:** .claude/ at monorepo root with agents/, commands/, skills/ subdirectories.
**Rationale:** Claude Code reads .claude/ from project root; enables subagent delegation and custom commands.
**Consequences:** settings.json needed; subagent definitions in agents/*.md; slash commands in commands/*.md.

### [2026-04-13] Three-layer enforcement architecture
**Context:** Single CLAUDE.md or single .cursor/rules file insufficient to enforce agent behavior across all tools.
**Decision:** Three-layer system — Level 1: .cursor/rules/00-constitution.mdc (IDE gate), Level 2: CLAUDE.md (CLI gate), Level 3: AGENTS.md (supreme authority).
**Rationale:** Each tool has a different entry point; all three must enforce identical JET Protocol and GUARD 1 to prevent any bypass path.
**Consequences:** All three files must be kept in sync when JET Protocol or GUARD 1 is updated.

### [2026-04-13] CQRS mandatory for orchestrator only
**Context:** CQRS adds complexity — applying it universally would slow development across all apps.
**Decision:** CQRS pattern is mandatory only for apps/platform/orchestrator/ (Saga Engine). Other NestJS apps use standard REST pattern.
**Rationale:** Orchestrator manages complex sagas and event sourcing — CQRS is architecturally necessary. Healthcare apps are CRUD-heavy and do not benefit from the overhead.
**Consequences:** orchestrator/ must have Commands/, Queries/, and Events/ directories. Other apps are exempt.

### [2026-04-13] packages/database as exclusive DB access layer
**Context:** Individual apps were making direct Prisma/ORM calls, causing schema drift and duplicated query logic.
**Decision:** All database operations must route through packages/database. No direct ORM calls in application code.
**Rationale:** Centralizes schema management, enables shared query optimization, enforces PHI/PII handling at a single layer.
**Consequences:** packages/database must expose typed repository interfaces; apps import from @abyss/database only.

---
<!-- Agent: append new decisions below this line -->

### [2026-04-13] Progressive Risk-Based Governance
**Context:** J5 "WAIT FOR GO" hard gate for all tasks created excessive friction. Agents were blocked on trivial tasks like typo fixes and file reads, overwhelming Chief with approval requests.
**Decision:** Implement Task Classification (Class A/B/C) with differentiated gates: Class A auto-approves, Class B uses checkpoint self-logging, Class C retains hard J5 protection.
**Rationale:** Not all tasks carry equal risk. Micro tasks should not require manual approval, but high-risk operations (DB, infrastructure, PHI) must remain strictly gated.
**Consequences:** AGENTS.md §2.1 now defines classification heuristics. `.agent/SESSION_STATE.md` tracks per-session GO status. Agent velocity increases while safety controls are preserved for critical operations.

### [2026-04-14] S1 & S2 — Bypass Orchestrator & Direct Agent Execution
**Tanggal:** 2026-04-14
**Keputusan:** Tidak menggunakan Orchestrator untuk tugas saat ini. Pekerjaan (termasuk referralink) langsung diserahkan ke Cursor, Codex, dan Claude.
**Alasan:** Sesuai instruksi Chief, eksekusi difokuskan langsung ke agent spesifik tanpa overhead Orchestrator untuk fase ini.
**Action:** Jen (Governor) membuat TASKS.json. Cursor, Codex, dan Claude diizinkan memulai eksekusi task P0 mereka.
