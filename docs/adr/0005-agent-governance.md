# ADR-0005: AI Agent Governance via .agents/ Hierarchy

**Status:** Accepted
**Date:** 2026-03-30
**Deciders:** Chief (Dr. Ferdi Iskandar)

## Context

Sentra menggunakan AI agents (Claude, Dexton, Atlas, Jen Code, Kimi Code) untuk memperluas kapasitas engineering. Tanpa steering yang jelas, AI agents menghasilkan kode yang melanggar konvensi organisasi.

## Decision

Membuat **`.agents/` governance hierarchy** dengan AGENTS.md global dan domain-specific steering files. Setiap domain punya AGENTS.md yang mengarahkan AI agent tentang conventions, constraints, dan patterns khusus domain tersebut.

## Consequences

**Positif:**
- AI agents mendapat konteks domain-specific tanpa manual briefing
- HANDOFF.md template memastikan setiap perubahan punya execution plan
- MCP-CONFIG.json mengonfigurasi tool access per domain
- Governance scalable — tambah domain = tambah AGENTS.md

**Negatif:**
- Maintenance cost: AGENTS.md harus diupdate saat conventions berubah
- Tidak semua AI tools support .agents/ convention

**Mitigasi:**
- AGENTS.md review di-include dalam PR process
- CLAUDE.md di root sebagai fallback universal
