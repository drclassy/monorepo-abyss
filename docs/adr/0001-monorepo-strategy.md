# ADR-0001: Monorepo Strategy

**Status:** Accepted
**Date:** 2026-03-30
**Deciders:** Chief (Dr. Ferdi Iskandar)

## Context

Sentra AI membangun beberapa produk lintas domain: Healthcare (ReferraLink, AADI), Academic (simulators, evaluation), Internal tools, dan Incubator projects. Kode bisa hidup di polyrepo terpisah atau monorepo terpadu.

## Decision

Menggunakan **monorepo tunggal** (`the-abyss`) dengan pnpm workspaces dan Turborepo. Semua apps, shared packages, tooling, flows, infrastructure, dan docs hidup dalam satu repository.

## Consequences

**Positif:**
- Atomic changes lintas apps dan packages
- Single dependency graph — visible untuk CI/CD dan AI agents
- Shared libraries tanpa publish cycle
- AI agents bisa memahami seluruh konteks dalam satu repo

**Negatif:**
- Repository size bertambah seiring waktu
- CI/CD pipeline lebih kompleks (mitigasi: Turborepo affected detection)
- Perlu architectural boundary enforcement agar domain tidak bocor

**Mitigasi:**
- Turborepo remote caching untuk build performance
- ESLint boundary rules mencegah cross-domain imports
- CODEOWNERS per domain untuk review enforcement
