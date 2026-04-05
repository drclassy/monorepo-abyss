# ADR-0002: pnpm over npm/yarn

**Status:** Accepted
**Date:** 2026-03-30
**Deciders:** Chief (Dr. Ferdi Iskandar)

## Context

Monorepo butuh package manager yang mendukung workspaces secara native. Opsi: npm workspaces, yarn (classic/berry), pnpm.

## Decision

Menggunakan **pnpm** (>=9.x) sebagai satu-satunya package manager.

## Consequences

**Positif:**
- Content-addressable store — disk space efisien, install cepat
- Strict node_modules — tidak ada phantom dependencies
- Native workspace support dengan `pnpm --filter`
- `packageManager` field di package.json memastikan konsistensi

**Negatif:**
- Tim perlu familiar dengan pnpm commands
- Beberapa tools lama tidak support pnpm out-of-the-box

**Mitigasi:**
- `.npmrc` dengan `auto-install-peers=true` mengurangi friction
- Onboarding guide mendokumentasikan pnpm-specific commands
