# Codex Mission Report — ABYSS-NAMING-018

## Summary

Audit-only mission completed.

- Branch saat audit: `work/abyss-postmerge-017`
- Worktree awal: bersih (`git status --short` kosong)
- Search dijalankan dengan `rg -n -i --hidden` agar `.agent/**` ikut tercakup
- Tidak ada rename massal
- Tidak ada edit source/package/config
- Tidak ada perubahan pada `packages/sentra/**`
- File yang dibuat hanya report ini

Temuan diringkas sebagai **177 unique file+term pairs** **sebelum** report ini dibuat
(report ini sengaja tidak dihitung ke corpus audit agar hasil tidak self-inflated):

- `active-runtime-risk`: 11
- `docs-migration-needed`: 20
- `historical-ok`: 78
- `ignore-generated`: 63
- `needs-owner-decision`: 5

Catatan cepat:

- `sympony` tidak ditemukan.
- `simphony` hanya muncul pada satu dokumen historis/spec.
- Risiko aktif paling jelas ada pada vocabulary `Symphony*` yang masih hidup di shared contract dan orchestrator, plus metadata portal yang masih memakai `sentra-rag` dan `symphony`.

## Search terms

- `symphony`
- `sympony`
- `simphony`
- `sentra-rag`
- `fhir-engine`
- `iskandar-gatekeeper`
- `vector-store`

## Match classification

| File | Term | Category | Recommended action |
| ---- | ---- | -------- | ------------------ |
| `.cursorindexingignore` | `iskandar-gatekeeper` | `active-runtime-risk` | Sinkronkan exclude path dengan nama/folder resmi saat migration package diputuskan. |
| `.github/workflows/ci.yml` | `iskandar-gatekeeper` | `active-runtime-risk` | Audit dependency CI sebelum rename package/path agar gate tidak putus. |
| `packages/shared/shared-types/src/clinical-trajectory.ts` | `symphony` | `active-runtime-risk` | Ubah hanya lewat migration kontrak terkoordinasi karena menyentuh payload `authority` dan `symphonyResultId`. |
| `packages/shared/shared-types/src/index.ts` | `symphony` | `active-runtime-risk` | Re-export `./symphony` menunjukkan surface kontrak lama masih aktif; butuh migration terencana. |
| `packages/shared/shared-types/src/symphony.ts` | `symphony` | `active-runtime-risk` | Ini pusat kontrak aktif `Symphony*`; jangan rename parsial tanpa owner decision pada public contract. |
| `platform/orchestrator/src/sagas/diagnosis-flow.saga.ts` | `symphony` | `active-runtime-risk` | Import sudah `@sentra/nada`, tetapi payload/property masih `symphony`; ini naming drift runtime yang nyata. |
| `platform/orchestrator/src/sagas/diagnosis-flow.saga.spec.ts` | `symphony` | `active-runtime-risk` | Test menjaga vocabulary lama tetap hidup; ubah hanya bersama perubahan runtime yang dibuktikan. |
| `platform/orchestrator/src/sagas/symphony-bridge.ts` | `symphony` | `active-runtime-risk` | File name, function name, type name, dan passthrough field masih lama; perlu migration scoped. |
| `platform/orchestrator/src/sagas/symphony-bridge.spec.ts` | `symphony` | `active-runtime-risk` | Companion test ikut mengunci naming lama; migrasikan bersama bridge file. |
| `platform/sentra-portal/src/data/monorepo-features.json` | `sentra-rag` | `active-runtime-risk` | Metadata runtime/user-facing masih memakai id lama; validasi consumer sebelum rename id. |
| `platform/sentra-portal/src/data/monorepo-features.json` | `symphony` | `active-runtime-risk` | Metadata runtime/user-facing masih memakai nama/id lama; cocok untuk migration kecil terpisah. |
| `.agent/reports/README.md` | `symphony` | `docs-migration-needed` | Update index/report catalog ke nama resmi tanpa mengubah report historisnya. |
| `.env.example` | `vector-store` | `docs-migration-needed` | Match saat ini ada di komentar/header; update istilah dokumentatif saja. |
| `docs/blueprint/001-infrastructure.md` | `fhir-engine`, `iskandar-gatekeeper` | `docs-migration-needed` | Blueprint aktif perlu diselaraskan ke nama resmi. |
| `docs/blueprint/002-instruction.md` | `fhir-engine`, `iskandar-gatekeeper` | `docs-migration-needed` | Update terminology aktif; jangan ubah scope arsitektur. |
| `docs/blueprint/003-scaffold.md` | `iskandar-gatekeeper` | `docs-migration-needed` | Update naming aktif di scaffold guide. |
| `docs/guides/004-aadi-v2.md` | `symphony` | `docs-migration-needed` | Guide aktif masih menyebut nama lama; aman dibersihkan setelah kontrak diputuskan. |
| `docs/guides/005-taxonomy-migration-v1.md` | `fhir-engine`, `iskandar-gatekeeper`, `vector-store` | `docs-migration-needed` | Masih aktif sebagai guide migration; update wording tanpa menghapus konteks mapping. |
| `docs/guides/implementation-plans/README.md` | `fhir-engine`, `sentra-rag`, `symphony` | `docs-migration-needed` | README index aktif perlu diselaraskan; rencana dated di bawahnya boleh tetap historis. |
| `docs/specs/README.md` | `symphony` | `docs-migration-needed` | Index spec aktif sebaiknya pakai nama resmi. |
| `docs/specs/aadi-v2/README.md` | `fhir-engine`, `symphony` | `docs-migration-needed` | README index aktif; update istilah, bukan isi sejarah file dated. |
| `packages/clinical/clinical-references/README.md` | `symphony` | `docs-migration-needed` | README aktif masih menulis engine lama sebagai canonical name. |
| `packages/shared/shared-types/src/index.ts` | `iskandar-gatekeeper` | `docs-migration-needed` | Match hanya di komentar source; update ketika istilah resmi package diputuskan. |
| `tooling/scripts/rag/trigger-import.ts` | `sentra-rag` | `docs-migration-needed` | Match ada di pesan operator; update setelah path/package target resmi dikonfirmasi. |
| `.agent/DECISIONS.md` | `symphony` | `needs-owner-decision` | Ini SSOT aktif. Perlu keputusan apakah dibiarkan historis dengan mapping note atau ditulis ulang sebagai keputusan baru. |
| `.gitignore` | `vector-store` | `needs-owner-decision` | Ignore rule menyentuh path aktif; ubah hanya setelah owner memastikan path pengganti. |
| `packages/AGENTS.md` | `fhir-engine`, `iskandar-gatekeeper`, `vector-store` | `needs-owner-decision` | Ini instruction file aktif berbasis folder aktual; update harus sinkron dengan taxonomi workspace yang benar. |

## Runtime/code risks

1. `packages/shared/shared-types/src/symphony.ts:1` masih menjadi pusat kontrak publik `Symphony*`.
2. `packages/shared/shared-types/src/index.ts:5` masih me-re-export `./symphony`.
3. `packages/shared/shared-types/src/clinical-trajectory.ts:176-177` masih mengekspos `authority: 'SYMPHONY'` dan `symphonyResultId`.
4. `platform/orchestrator/src/sagas/diagnosis-flow.saga.ts:2,89-104,146-154` sudah import `@sentra/nada`, tetapi vocabulary payload masih `symphony`.
5. `platform/orchestrator/src/sagas/symphony-bridge.ts:2-83` dan `platform/orchestrator/src/sagas/symphony-bridge.spec.ts` masih memakai naming lama di file name, function name, types, dan passthrough field.
6. `platform/sentra-portal/src/data/monorepo-features.json:59,65-66` masih memakai id runtime `sentra-rag` dan `symphony`.
7. `.github/workflows/ci.yml:48` dan `.cursorindexingignore:44` masih merujuk `iskandar-gatekeeper`.

## Docs cleanup candidates

File aktif yang paling layak dibersihkan tanpa menyentuh source runtime:

- `.agent/reports/README.md`
- `.env.example`
- `docs/blueprint/001-infrastructure.md`
- `docs/blueprint/002-instruction.md`
- `docs/blueprint/003-scaffold.md`
- `docs/guides/004-aadi-v2.md`
- `docs/guides/005-taxonomy-migration-v1.md`
- `docs/guides/implementation-plans/README.md`
- `docs/specs/README.md`
- `docs/specs/aadi-v2/README.md`
- `packages/clinical/clinical-references/README.md`
- `tooling/scripts/rag/trigger-import.ts`

## Historical references safe to keep

Semua item di bawah diklasifikasikan `historical-ok` karena berupa handoff, session log, dated audit, ADR, atau dated plan/spec. Jika nanti ingin normalisasi istilah, perlakukan sebagai pekerjaan dokumentasi historis terpisah, bukan rename massal sekarang.

- `.agent/HANDOFF.md` (`sentra-rag`)
- `.agent/reports/2026-04-20-symphony-alignment.md` (`symphony`)
- `.agent/reports/2026-04-20-symphony-coverage-audit.md` (`symphony`, `vector-store`)
- `.agent/reports/2026-04-23-abyss-core-rag-bucket-audit.md` (`sentra-rag`, `vector-store`)
- `.agent/reports/2026-04-23-abyss-core-runtime-rag-bucket-audit.md` (`sentra-rag`, `vector-store`)
- `.agent/reports/2026-04-23-rag-bucket-status.txt` (`sentra-rag`, `vector-store`)
- `.agent/reports/2026-04-23-runtime-rag-bucket-status.txt` (`sentra-rag`, `vector-store`)
- `.agent/sessions/2026-04-13.md` (`iskandar-gatekeeper`)
- `.agent/sessions/2026-04-14.md` (`fhir-engine`, `iskandar-gatekeeper`, `vector-store`)
- `.agent/sessions/2026-04-15-audit-gitignore-patches.md` (`vector-store`)
- `.agent/sessions/2026-04-15.md` (`fhir-engine`, `iskandar-gatekeeper`, `vector-store`)
- `.agent/sessions/2026-04-20.md` (`symphony`, `vector-store`)
- `.agent/sessions/2026-04-22.md` (`symphony`)
- `.agent/sessions/2026-04-23.md` (`sentra-rag`, `symphony`)
- `.agent/sessions/2026-04-25.md` (`symphony`)
- `.agent/sessions/2026-04-27.md` (`sentra-rag`, `symphony`, `vector-store`)
- `.agent/sessions/2026-04-29.md` (`fhir-engine`, `iskandar-gatekeeper`, `sentra-rag`, `symphony`, `vector-store`)
- `.agent/sessions/2026-05-01-session-summary.md` (`iskandar-gatekeeper`)
- `.agent/sessions/2026-05-01.md` (`iskandar-gatekeeper`, `symphony`)
- `docs/adr/0007-pharmacology-locus-decision.md` (`symphony`)
- `docs/guides/implementation-plans/003-2026-04-20-god-mode-optimization.md` (`fhir-engine`, `symphony`)
- `docs/guides/implementation-plans/004-2026-04-20-symphony-canonicalization.md` (`symphony`)
- `docs/guides/implementation-plans/005-2026-04-22-symphony-phase-3-clinical-patterns.md` (`symphony`)
- `docs/guides/implementation-plans/006-2026-04-27-aadi-v2-implementation.md` (`sentra-rag`, `symphony`)
- `docs/guides/implementation-plans/007-2026-04-29-fhir-engine-modernization-implementation.md` (`fhir-engine`, `symphony`)
- `docs/guides/implementation-plans/008-2026-04-29-fhir-engine-resource-validation-implementation.md` (`fhir-engine`, `symphony`)
- `docs/guides/implementation-plans/009-2026-04-29-cds-hooks-formalization-implementation.md` (`fhir-engine`, `symphony`)
- `docs/guides/implementation-plans/012-2026-05-19-context-capsule-implementation.md` (`fhir-engine`)
- `docs/specs/001-symphony-bridge-v1.md` (`fhir-engine`, `symphony`)
- `docs/specs/002-aadi-v2.md` (`symphony`)
- `docs/specs/003-clinical-trajectory-v1.md` (`symphony`)
- `docs/specs/004-ct-spec-v1.md` (`symphony`)
- `docs/specs/005-sentra_rag_v_2_three_upgrade_specs.md` (`sentra-rag`)
- `docs/specs/aadi-v2/003-2026-04-20-symphony-phase-2-pattern-engine-design.md` (`symphony`)
- `docs/specs/aadi-v2/004-2026-04-27-aadi-v2-design.md` (`sentra-rag`, `symphony`)
- `docs/specs/aadi-v2/005-2026-04-27-aadi-v2-feature-coverage-matrix.md` (`symphony`)
- `docs/specs/aadi-v2/006-2026-04-27-aadi-v2-wbs.md` (`sentra-rag`, `symphony`)
- `docs/specs/aadi-v2/007-2026-04-27-aadi-v2-claude-instructions.md` (`sentra-rag`, `symphony`)
- `docs/specs/aadi-v2/008-2026-04-29-aadi-v2-phase-2-readiness-gate.md` (`symphony`)
- `docs/specs/aadi-v2/009-2026-04-29-aadi-v2-terminology-mapping.md` (`symphony`)
- `docs/specs/aadi-v2/010-2026-04-29-aadi-v2-fhir-promotion-plan.md` (`fhir-engine`, `symphony`)
- `docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md` (`fhir-engine`, `symphony`)
- `docs/specs/aadi-v2/012-2026-04-29-fhir-engine-claude-instructions.md` (`fhir-engine`, `symphony`)
- `docs/specs/aadi-v2/013-2026-04-29-fhir-engine-resource-validation-claude-instructions.md` (`fhir-engine`, `symphony`)
- `docs/specs/aadi-v2/014-2026-04-29-aadi-v2-cds-hooks-formalization.md` (`symphony`)
- `docs/specs/clinical-trajectory-v1/CT_DASHBOARD_CONSUMPTION_PLAN.md` (`simphony`, `symphony`)

## Generated/ignored matches

Semua match di bawah diklasifikasikan `ignore-generated` dan tidak layak dijadikan target migration:

- `.git/lost-found/other/*`
  - Mengandung kombinasi `fhir-engine`, `iskandar-gatekeeper`, `sentra-rag`, `symphony`, `vector-store`
  - Ini artifact Git internal, bukan source of truth produk
- `.git/rr-cache/*/{preimage,preimage.1,postimage}`
  - Mengandung kombinasi `fhir-engine`, `iskandar-gatekeeper`, `sentra-rag`, `symphony`, `vector-store`
  - Ini artifact conflict-resolution Git, bukan target rename

## Verification results

| Command | Result | Notes |
| ------- | -----: | ----- |
| `git branch --show-current` | PASS | `work/abyss-postmerge-017` |
| `git status --short` | PASS | Awal audit bersih; setelah report dibuat, hanya report ini yang muncul sebagai file baru. |
| `rg -n -i --hidden "symphony|sympony|simphony|sentra-rag|fhir-engine|iskandar-gatekeeper|vector-store" .` | PASS | Search utama dijalankan sebelum report dibuat agar hasil tidak menghitung self-reference report ini; command juga mencakup hidden paths seperti `.agent/**` dan `.git/**`. |
| `git diff --name-status` | PASS | Tidak ada tracked source/config/package mutation; file baru untracked diverifikasi via `git status --short`. |
| `git diff --stat` | PASS | Kosong, konsisten dengan hanya adanya file report baru yang belum di-track. |
| `git diff -- .agent/reports/ABYSS-NAMING-018-deprecated-naming-audit.md` | PASS | Untuk file baru yang masih untracked, Git tidak menampilkan patch; keberadaan file dibuktikan lewat `git status --short`. |

## Recommended next mission

Satu mission kecil yang paling aman dan bernilai:

`ABYSS-NAMING-019 — migrate runtime-facing package catalog names di platform/sentra-portal/src/data/monorepo-features.json dari sentra-rag/symphony ke sentra-pustaka/sentra-nada, lalu verifikasi tidak ada consumer UI yang bergantung pada id lama.`

## Final status

PASS
