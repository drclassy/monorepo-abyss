# DECISIONS.md — the-abyss (monorepo root)
<!-- Append-only. NEVER delete or edit existing entries. -->

---

### [2026-04-10] AGENTS.md as cross-tool source of truth
**Context:** Multiple AI tools (Claude Code, Cursor, Codex, Windsurf) need consistent instructions
**Decision:** AGENTS.md at root = single source of truth. Division AGENTS.md = scoped additions only. Sub-app AGENTS.md = thin bridge.
**Rejected alternatives:** CLAUDE.md only, .cursor/rules/ only
**Rationale:** AGENTS.md is Linux Foundation standard; widest tool support; prevents rule duplication
**Consequences:** Root AGENTS.md must stay lean; division files add domain rules only; never duplicate root content

### [2026-04-10] Single session log protocol
**Context:** Two parallel session log systems existed (.agent/sessions/ and external docs/) with no bridge
**Decision:** .agent/sessions/ is the single source of truth for agent memory and audit trail.
**Rationale:** One unified log location eliminates duplication and keeps session history discoverable.
**Consequences:** Every coding session must update .agent/sessions/YYYY-MM-DD.md. HANDOFF.md explicitly states this requirement.

### [2026-04-10] .claude/ folder at monorepo root
**Context:** Claude Code settings.json, subagents, commands, and skills need a home
**Decision:** `.claude/` at monorepo root with agents/, commands/, skills/ subdirectories
**Rationale:** Claude Code reads .claude/ from project root; enables subagent delegation and custom commands
**Consequences:** settings.json needed; subagent definitions in agents/*.md; slash commands in commands/*.md

### [2026-04-10] Root .agent/ replaces wrong structure
**Context:** Root .agent/ had conductor/, memory/, projects/, rules/, workflows/ — wrong pattern
**Decision:** Replace with standard 5-file structure: CONTEXT, PROGRESS, HANDOFF, LESSONS, DECISIONS, sessions/
**Consequences:** Old structure folders preserved but ignored by agents; new structure is authoritative

---
<!-- Agent: append new decisions below this line -->
