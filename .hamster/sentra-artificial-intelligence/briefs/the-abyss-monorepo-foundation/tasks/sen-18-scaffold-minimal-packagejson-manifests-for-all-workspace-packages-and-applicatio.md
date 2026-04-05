---
id: "290e0a2d-246e-4f0e-ae91-385d6bc2997b"
entity_type: "task"
entity_id: "70608f53-b13d-47ae-a262-1c68b79577a6"
title: "Scaffold minimal package.json manifests for all workspace packages and applications - Notes"
status: "todo"
priority: "high"
display_id: "SEN-18"
parent_task_id: "d542ab02-573d-4839-8b82-827e49146e15"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:40:12.294223+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Author minimal `package.json` yang benar secara struktural untuk semua 10 shared packages dan 7 application directories agar pnpm workspace resolution dan Turbo pipeline definitions berfungsi sejak hari pertama.

## Implementation Approach

1. Untuk setiap direktori di `packages/` (ui, database, ai-core, fhir-engine, shared-types, langflow-client, vector-store, config-typescript, config-eslint, iskandar-gatekeeper): buat `package.json` dengan:

- `name`: `@the-abyss/<dir-name>`
- `version`: `"0.1.0"`
- `private`: `true`
- `main`: `"dist/index.js"`
- `types`: `"dist/index.d.ts"`
- `scripts`: `{ "build": "tsc", "test": "vitest run", "lint": "eslint src", "dev": "tsc --watch", "clean": "rm -rf dist" }`

1. Special case — `config-typescript`: `main` menunjuk ke `tsconfig.base.json`; tidak perlu build script
2. Special case — `config-eslint`: `main` menunjuk ke `index.js` (exported ESLint config object)
3. Special case — `iskandar-gatekeeper`: sertakan field `bin` untuk CLI entry `iskandar-gatekeeper validate-handoff`
4. Untuk setiap application directory: buat `package.json` dengan `name: "@app/<app-name>"`, `version: "0.1.0"`, `private: true`, dan scripts standar yang sama
5. Jalankan `pnpm install` untuk memverifikasi semua packages terdeteksi sebagai workspace members

## Acceptance Criteria

- `pnpm list --depth=0` menampilkan semua 10 packages dan 7 apps sebagai workspace members
- Setiap `package.json` memiliki name, version, private, scripts (build/test/lint/dev/clean), main, dan types
- Penamaan `@the-abyss/*` untuk `packages/` dan `@app/*` untuk `apps/`
- `config-typescript` dan `config-eslint` manifest mengekspor entry point dengan benar
- Tidak ada error `pnpm install` dari workspace member manapun
- **Tidak ada referensi ke Nx ****`project.json`** — project ini menggunakan Turborepo

## Technical Constraints

- Semua nama menggunakan `@the-abyss/*` (packages) dan `@app/*` (apps)
- Scripts adalah stubs di tahap ini — belum ada implementasi build nyata
- `iskandar-gatekeeper` membutuhkan field `bin` untuk CLI di masa depan
- Field `main` pada `config-typescript`/`config-eslint` harus menunjuk ke config output masing-masing
- **Tidak perlu membuat ****`nx.json`**** atau ****`project.json`** — Turborepo hanya memerlukan `package.json` dan `turbo.json`

## Relevant Files

### Files to Create

- `packages/ui/package.json` — Manifest library komponen UI
- `packages/database/package.json` — Manifest Prisma database package
- `packages/ai-core/package.json` — Manifest LLM orchestration package
- `packages/fhir-engine/package.json` — Manifest FHIR processing package
- `packages/shared-types/package.json` — Manifest cross-package TypeScript types
- `packages/langflow-client/package.json` — Manifest Langflow API client
- `packages/vector-store/package.json` — Manifest vector storage abstraction
- `packages/config-typescript/package.json` — Manifest shareable TypeScript config
- `packages/config-eslint/package.json` — Manifest shareable ESLint config
- `packages/iskandar-gatekeeper/package.json` — Manifest governance validation package (dengan bin field)
- `apps/healthcare/referralink-api/package.json` — Manifest Referral API app
- `apps/healthcare/aadi-diagnostic/package.json` — Manifest Diagnostic app
- `apps/academic/clinical-simulator/package.json` — Manifest Clinical simulator
- `apps/incubator/edge-ai-prototype/package.json` — Manifest Edge AI prototype
- `apps/internal/sentratorium-web/package.json` — Manifest Internal web app
- `apps/internal/design-system/package.json` — Manifest Design system app
- `apps/orchestrator/langflow-gateway/package.json` — Manifest Langflow gateway## Details

**Scope**: Writing a minimal package.json (name, version, private, scripts stubs, main/types fields) for each of the 10 shared packages and 7 application directories listed in the brief.

**Out of Scope**: Root package.json (sibling: Repository & pnpm Workspace), tsconfig.json per package (sibling: TypeScript & Code Quality Standards), Nx project.json files (sibling: Nx Build Pipeline), actual runtime/build dependencies and devDependencies beyond structural placeholders, real source code or implementations.

**Constraints**: All package names must use the @the-abyss/* prefix for packages/ and @app/* for apps/, Each package.json must define at minimum: name, version (0.1.0), private (true), main, types, and scripts (build, test, lint, dev, clean), config-typescript package.json must set main to point to the shared tsconfig base file, config-eslint package.json must set main to point to the shared eslint config file, Scripts should be placeholder stubs (e.g. "build": "echo 'build not yet implemented'") so Turbo pipelines resolve without errors

**Patterns**: Packages use @the-abyss/* scoping (e.g. @the-abyss/ui, @the-abyss/database), Applications use @app/* scoping (e.g. @app/referralink-api), iskandar-gatekeeper is the governance validation package used by CI to validate HANDOFF.md structure, config-typescript and config-eslint are shareable config packages extended by all other packages

## Acceptance Criteria

- [ ] Running `pnpm list --depth=0` from the workspace root lists all 10 packages and 7 applications as workspace members after `pnpm install`
- [ ] Each package.json contains name, version, private, scripts (build/test/lint/dev/clean), main, and types fields
- [ ] Package names follow the @the-abyss/* convention for packages/ and @app/* for apps/
- [ ] config-typescript and config-eslint manifests correctly identify their main export entry points
- [ ] No pnpm install errors related to missing or malformed package.json files in any workspace member

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 4 |

