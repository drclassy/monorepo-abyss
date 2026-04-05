# ADR-0004: Domain Boundary Enforcement

**Status:** Accepted
**Date:** 2026-03-30
**Deciders:** Chief (Dr. Ferdi Iskandar)

## Context

Monorepo healthcare memerlukan isolasi ketat antar domain. Kode healthcare tidak boleh bocor ke academic, incubator, atau internal. Tanpa enforcement, cross-domain dependencies berkembang secara diam-diam.

## Decision

Menggunakan **ESLint `no-restricted-imports`** rules di `@the-abyss/config-eslint` untuk mencegah cross-domain imports. Ditegakkan di CI sebagai required check.

## Consequences

**Positif:**
- Import healthcare dari domain lain langsung error di editor dan CI
- Enforcement otomatis — tidak bergantung pada code review manual
- Rules didefinisikan di satu tempat (config-eslint/base.js)

**Negatif:**
- Shared logic harus dipindah ke `packages/` — tidak bisa shortcut import lintas apps
- Rule maintenance bertambah saat domain baru ditambahkan

**Mitigasi:**
- Shared packages (`@the-abyss/shared-types`, `@the-abyss/ui`) sebagai jalur berbagi yang sah
- CODEOWNERS memastikan perubahan boundary rules di-review oleh platform team
