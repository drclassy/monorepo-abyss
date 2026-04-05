# ADR-0003: Turborepo as Build Orchestrator

**Status:** Accepted
**Date:** 2026-03-30
**Deciders:** Chief (Dr. Ferdi Iskandar)

## Context

Monorepo dengan 21+ workspace members butuh build orchestration yang cerdas: parallel execution, caching, dan affected detection. Opsi: Turborepo, Nx, manual scripts.

## Decision

Menggunakan **Turborepo** untuk build orchestration dan caching.

## Consequences

**Positif:**
- Zero-config caching — local dan remote (Vercel Remote Cache)
- Topological task ordering otomatis via `dependsOn: ["^build"]`
- `--filter=[HEAD^1]` untuk incremental execution di CI
- Integrasi native dengan Vercel deployment

**Negatif:**
- Kurang fitur dibanding Nx (tidak ada code generation, graph visualization terbatas)
- Remote cache perlu Vercel account atau self-hosted solution

**Mitigasi:**
- Code generation ditangani oleh AI agents dan templates
- Vercel Remote Cache sudah tersedia di infrastruktur Sentra
