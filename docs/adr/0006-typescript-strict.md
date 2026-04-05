# ADR-0006: TypeScript Strict Mode as Non-Negotiable

**Status:** Accepted
**Date:** 2026-03-30
**Deciders:** Chief (Dr. Ferdi Iskandar)

## Context

Healthcare AI memerlukan tingkat keamanan tipe yang tinggi. `any` type dalam kode klinis bisa menyebabkan runtime errors yang berdampak pada keselamatan pasien. Tim perlu standar konsisten di seluruh monorepo.

## Decision

**TypeScript strict mode** diaktifkan di root tsconfig.json dan ditegakkan secara universal. Tidak ada pengecualian. `noExplicitAny` di ESLint sebagai enforcement tambahan.

## Consequences

**Positif:**
- Null safety, strict function types, dan type narrowing otomatis
- `noUnusedLocals` dan `noUnusedParameters` menjaga kebersihan kode
- `noUncheckedIndexedAccess` mencegah undefined access
- CI typecheck (`tsc --noEmit`) sebagai gate wajib

**Negatif:**
- Boilerplate type annotations lebih banyak
- Third-party libraries tanpa types perlu `@types/*` atau declaration files
- Migration cost untuk kode legacy yang sebelumnya loose-typed

**Mitigasi:**
- `@the-abyss/config-typescript` menyediakan presets (base, react, node) yang sudah strict
- `skipLibCheck: true` untuk menghindari errors dari library types yang tidak sempurna
