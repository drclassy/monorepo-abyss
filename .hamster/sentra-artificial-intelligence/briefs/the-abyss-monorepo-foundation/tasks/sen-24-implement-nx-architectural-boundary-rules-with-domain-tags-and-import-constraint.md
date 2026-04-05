---
id: "6a6a1202-b677-4516-8844-c027222389f6"
entity_type: "task"
entity_id: "2ed059df-21c6-410e-a017-9f97ee56e858"
title: "Implement Nx architectural boundary rules with domain tags and import constraint matrix - Notes"
status: "todo"
priority: "high"
display_id: "SEN-24"
parent_task_id: "8a613e82-cbcc-45af-b3b8-057235b03249"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:39:24.768231+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Implementasi penegakan batas arsitektur menggunakan ESLint `import/no-restricted-paths` dan `import/no-internal-modules` untuk mencegah cross-domain imports yang tidak sah antara domain Healthcare, Academic, Incubator, Internal, dan Platform — **tanpa Nx**, murni berbasis ESLint.

## Implementation Approach

1. Pastikan `eslint-plugin-import` sudah terinstal (dikelola oleh subtask TypeScript & Code Quality)
2. Tambahkan rule `import/no-restricted-paths` ke root `.eslintrc.json` dengan constraint matrix domain
3. Tambahkan rule `import/no-internal-modules` untuk mencegah deep imports ke internal package
4. Constraint matrix yang harus dikonfigurasi:

- `apps/healthcare/**` hanya boleh import dari `apps/healthcare/**` dan `packages/**`
- `apps/academic/**` hanya boleh import dari `apps/academic/**` dan `packages/**`
- `apps/incubator/**` hanya boleh import dari `apps/incubator/**` dan `packages/**`
- `apps/internal/**` hanya boleh import dari `apps/internal/**` dan `packages/**`
- `packages/**` hanya boleh import dari sesama `packages/**`
- Tidak ada antar-app imports

1. Validasi dengan menambahkan cross-domain import sengaja, konfirmasi error muncul, lalu hapus
2. Dokumentasikan skema boundary di `docs/adr/0005-architectural-boundaries.md`

## Acceptance Criteria

- Cross-domain import yang sengaja dibuat memicu error ESLint `import/no-restricted-paths`
- `pnpm lint` berjalan bersih setelah violation dihapus
- Constraint matrix mencakup semua lima domain dan aturan larangan app-to-app imports
- Rule terdapat di `.eslintrc.json` dalam blok `overrides` khusus file TypeScript
- ADR `docs/adr/0005-architectural-boundaries.md` mendokumentasikan desain boundary
- **Tidak ada ****`nx.json`**** atau ****`project.json`**** Nx yang dibuat** — boundary enforcement murni ESLint

## Technical Constraints

- Gunakan `eslint-plugin-import` (`import/no-restricted-paths`), **bukan** `@nx/enforce-module-boundaries`
- Rule harus berada di `overrides` yang menargetkan `*.ts`/`*.tsx` saja
- Matrix harus exhaustive — tidak ada implicit allow-all fallback
- `packages/**` (platform libs) harus bebas saling import satu sama lain
- **Jangan install atau konfigurasi Nx** — proyek ini menggunakan Turborepo

## Code Patterns to Follow

- Gunakan `eslint-plugin-import` yang sudah terinstal dari subtask TypeScript & Code Quality
- Ikuti pola konfigurasi rule di `overrides` dalam `.eslintrc.json`

## Relevant Files

### Files to Create

- `docs/adr/0005-architectural-boundaries.md` — ADR keputusan desain boundary arsitektur

### Files to Modify

- `.eslintrc.json` — Tambahkan `import/no-restricted-paths` dan `import/no-internal-modules` dengan constraint matrix lengkap## Details

**Scope**: Create nx.json with namedInputs and task configuration, assign domain/type tags to all projects via project.json files, configure @nx/enforce-module-boundaries ESLint rule with the full constraint matrix, install @nx/eslint-plugin, and validate that linting catches a deliberately invalid cross-domain import.

**Out of Scope**: General ESLint rules, TypeScript config, Prettier config (sibling task: TypeScript & Code Quality Standards), GitHub Actions workflow that runs nx lint in CI (sibling task: CI/CD Governance Pipeline), Turborepo pipeline configuration (subtask 1), and remote cache setup (subtask 2).

**Implementation**: 1. Install Nx ESLint plugin: `pnpm add -D @nx/eslint-plugin @nx/devkit nx`.
2. Create root `nx.json` with `namedInputs` (default, production, sharedGlobals) and `defaultBase: "main"`.
3. Create `project.json` in each workspace project directory assigning the correct `tags` array using the dual-axis scheme (`domain:*` + `type:*`).
4. Add the `@nx/enforce-module-boundaries` rule to root `.eslintrc.json` under an override for `*.ts` and `*.tsx` files.
5. Write the constraint matrix as an `allowedExternalImports` + `depConstraints` array covering all domain/type combinations.
6. Test by temporarily adding a cross-domain import (e.g., importing a `domain:healthcare` symbol from a `domain:academic` file) and confirming `pnpm lint` reports the violation.
7. Remove the deliberate violation and confirm `pnpm lint` passes cleanly.
8. Document the tagging scheme and boundary rules in `docs/adr/0003-architectural-boundaries.md`.

**Constraints**: Requires `@nx/eslint-plugin` installed at workspace root — do NOT use the deprecated `@nrwl/eslint-plugin-nx` package., Every workspace project MUST have a `project.json` with at least one `domain:*` tag and one `type:*` tag — projects without tags are exempt from boundary checks and represent an undetected violation risk., The `@nx/enforce-module-boundaries` rule must be in the `overrides` section targeting TypeScript files only, to avoid false positives on plain JS config files., The constraint matrix must be exhaustive — an implicit allow-all is not acceptable. Use `notDependOnLibsWithTags` to deny rather than relying solely on allow-lists., Do NOT block `domain:platform` packages from importing each other — shared utilities must remain freely composable within the platform layer.

**Relevant Files**: create: `nx.json` - Root Nx configuration file registering named inputs, task runner, and default project configuration including tags.; create: `apps/healthcare/project.json` - Nx project configuration for the healthcare domain apps, assigning domain:healthcare and type:app tags.; create: `apps/academic/project.json` - Nx project configuration for the academic domain apps, assigning domain:academic and type:app tags.; create: `apps/incubator/project.json` - Nx project configuration for incubator apps with domain:incubator and type:app tags.; create: `apps/internal/project.json` - Nx project configuration for internal apps with domain:internal and type:app tags.; create: `apps/orchestrator/project.json` - Nx project configuration for the orchestrator app with domain:platform and type:app tags.; create: `.eslintrc.json` - Root ESLint config extended with @nx/enforce-module-boundaries rule containing the full constraint matrix. NOTE: this is a new file at root — TypeScript/ESLint config details live in the TypeScript & Code Quality sibling task; this subtask only adds the boundary rule.

## Acceptance Criteria

- [ ] Running `pnpm lint` with a deliberate cross-domain import (e.g., `domain:academic` importing from `domain:healthcare`) produces an `@nx/enforce-module-boundaries` ESLint error.
- [ ] After removing the deliberate violation, `pnpm lint` passes with zero boundary-related errors across all workspace projects.
- [ ] Every workspace project has a `project.json` file with a `tags` array containing at least one `domain:*` tag and one `type:*` tag.
- [ ] `nx.json` exists at the repository root with `namedInputs` defined and `defaultBase` set to `main`.
- [ ] The constraint matrix in `.eslintrc.json` covers all five domain values and both `type:app` / `type:lib` distinctions.
- [ ] An ADR (`docs/adr/0003-architectural-boundaries.md`) documents the tagging scheme, constraint rationale, and how to add a new domain.

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 7 |

