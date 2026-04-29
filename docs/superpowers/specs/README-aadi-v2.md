# AADI V2 Document Index

Dokumen ini adalah pintu masuk tunggal untuk seluruh materi `AADI V2` di repo ini.

Tujuannya:
- memudahkan Chief membuka seluruh konteks dari satu file
- memastikan Claude dan Cursor mulai dari dokumen yang benar
- mencegah drift antara guide, spec, matrix, dan implementation plan

---

## Status

- Status program: active design-to-implementation handoff
- Parent authority: `@the-abyss/symphony`
- Consumer surfaces: Dashboard dan Assist
- Rule terpenting: feature klinis existing tidak boleh hilang diam-diam

---

## Reading Order

Urutan baca yang direkomendasikan:

1. `docs/guides/aadiv2.md`
2. `docs/superpowers/specs/2026-04-27-aadi-v2-design.md`
3. `docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`
4. `docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md`
5. `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
6. `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
7. `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
8. `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
9. `docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md`
10. `docs/superpowers/specs/2026-04-29-fhir-engine-claude-instructions.md`
11. `docs/superpowers/plans/2026-04-29-fhir-engine-resource-validation-implementation.md`
12. `docs/superpowers/specs/2026-04-29-fhir-engine-resource-validation-claude-instructions.md`
13. `docs/superpowers/specs/2026-04-29-aadi-v2-cds-hooks-formalization.md`
14. `docs/superpowers/plans/2026-04-29-cds-hooks-formalization-implementation.md`
15. `.agent/FEATURE.md`

Kalau hanya butuh ringkasannya:

1. baca file ini
2. buka design spec
3. buka implementation plan

---

## Document Map

### 1. Source Guide

- File: `docs/guides/aadiv2.md`
- Fungsi:
  - dokumen proposal awal dari advisor
  - menjelaskan lompatan dari `Current Symphony` ke `AADI V2`
  - menjadi landasan alignment strategi
- Bukan untuk:
  - langsung dijadikan task implementasi tanpa turunan spec

### 2. Canonical Design Spec

- File: `docs/superpowers/specs/2026-04-27-aadi-v2-design.md`
- Fungsi:
  - spec arsitektur formal AADI V2
  - menjelaskan target layer:
    - `ClinicalFacts`
    - syndrome classification
    - diagnosis packs
    - native differential
    - reasoning arbiter
    - explainability
    - clinical disposition
    - shadow comparison
    - interoperability
  - mengunci bahwa `SYMPHONY` tetap parent authority
- Pakai file ini bila:
  - ingin memahami arsitektur target
  - ingin mengecek boundary sistem
  - ingin menilai apakah implementasi masih sesuai arah

### 3. Feature Coverage Matrix

- File: `docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`
- Fungsi:
  - guardrail operasional agar feature existing tidak ter-skip
  - memetakan feature -> decision -> target module -> sprint -> proof -> status
  - membedakan:
    - `MUST reuse`
    - `CONSUMER_ONLY`
    - `KEEP_IN_ASSIST`
    - `OUT_OF_SCOPE_NOW`
- Pakai file ini bila:
  - Claude atau Cursor akan mulai coding
  - ingin review apakah suatu sprint sudah reuse feature yang ada
  - ingin audit risiko regression

### 4. Implementation Plan

- File: `docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md`
- Fungsi:
  - panduan eksekusi task-by-task
  - sudah dipecah menjadi urutan implementasi per task
  - sudah diarahkan untuk reuse API existing `packages/symphony`
- Pakai file ini bila:
  - agent akan mulai implementasi
  - ingin kerja sprint-by-sprint
  - ingin tahu file mana yang disentuh dan test mana yang harus dijalankan

### 5. Phase 2 Readiness Gate

- File: `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
- Fungsi:
  - mengunci syarat masuk Phase 2
  - membedakan interop stub vs terminology-aware/validation-aware phase
  - menjelaskan kenapa `packages/fhir-engine` belum boleh dipromosikan otomatis
- Pakai file ini bila:
  - ingin memulai Phase 2
  - ingin menentukan apakah repo sudah siap untuk terminology/FHIR hardening
  - ingin menghindari Phase 2 dimulai terlalu cepat

### 6. Claude Instructions

- File: `docs/superpowers/specs/2026-04-27-aadi-v2-claude-instructions.md`
- Fungsi:
  - handoff khusus untuk Claude
  - menjelaskan urutan baca, aturan reuse, boundary, verification gate, dan
    short prompt siap pakai
- Pakai file ini bila:
  - Claude akan mulai mengerjakan AADI V2
  - Chief ingin memberi briefing yang konsisten lintas sesi
  - dibutuhkan prompt ringkas yang tetap patuh pada spec dan matrix

### 7. Terminology Mapping Spec

- File: `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
- Fungsi:
  - mengunci starter set terminology untuk Phase 2A
  - memisahkan terminology wajib sekarang vs yang ditunda
  - menentukan policy URI external dan internal
- Pakai file ini bila:
  - ingin mulai Phase 2A
  - ingin menentukan apakah ICD-10 sudah cukup atau belum
  - ingin mencegah SNOMED/LOINC/RxNorm masuk terlalu cepat

### 8. FHIR Promotion Plan

- File: `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
- Fungsi:
  - menentukan apakah interop tetap di `packages/symphony` atau mulai dipromosikan
  - menetapkan urutan promosi yang aman
  - menegaskan bahwa `packages/fhir-engine` masih candidate, belum canonical target
- Pakai file ini bila:
  - ingin mulai package promotion discussion
  - ingin memisahkan adapter shape dari validation role
  - ingin menghindari promosi penuh terlalu dini

### 9. `fhir-engine` Modernization Spec

- File: `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
- Fungsi:
  - menentukan bagaimana `packages/fhir-engine` dibersihkan sebelum promotion
  - mengunci role package sebagai validation/normalization candidate
  - mencegah package ini overclaim atau menjadi reasoning layer
- Pakai file ini bila:
  - ingin mulai modernization `packages/fhir-engine`
  - ingin mempersiapkan Phase 2 promotion secara bertahap
  - ingin mengubah spec ini menjadi implementation plan berikutnya

### 10. `fhir-engine` Modernization Implementation Plan

- File: `docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md`
- Fungsi:
  - menurunkan modernization spec menjadi task-by-task execution plan
  - memberi urutan kerja yang aman untuk Claude dan Cursor
  - mengunci modernization agar dimulai dari honesty pass, bukan feature creep
- Pakai file ini bila:
  - Claude atau Cursor akan mulai mengerjakan `packages/fhir-engine`
  - ingin tahu task, file, dan verification gate modernization
  - ingin menjaga boundary `packages/symphony` vs `packages/fhir-engine`

### 11. `fhir-engine` Claude Instructions

- File: `docs/superpowers/specs/2026-04-29-fhir-engine-claude-instructions.md`
- Fungsi:
  - briefing khusus untuk Claude saat mengerjakan modernization `packages/fhir-engine`
  - mengunci reading order, boundary, verification, dan no-drift rules
  - memberi short prompt siap pakai untuk memulai eksekusi plan
- Pakai file ini bila:
  - Chief ingin briefing cepat tapi konsisten untuk Claude
  - Claude akan mulai task modernization `fhir-engine`
  - ingin mencegah Claude mencampur validation lane dengan reasoning lane

### 12. `fhir-engine` Resource Validation Implementation Plan

- File: `docs/superpowers/plans/2026-04-29-fhir-engine-resource-validation-implementation.md`
- Fungsi:
  - membuka lane baru untuk `Condition`, `RiskAssessment`, dan `DiagnosticReport`
    validation
  - memperluas support matrix satu resource family per task
  - menjaga ekspansi tetap structural-only dan tidak menyentuh reasoning authority
- Pakai file ini bila:
  - Chief memberi GO untuk validasi tiga resource family deferred
  - Claude/Cursor akan memperluas validator `fhir-engine`
  - ingin menjaga ekspansi support matrix tetap aman dan test-backed

### 13. `fhir-engine` Resource Validation Claude Instructions

- File: `docs/superpowers/specs/2026-04-29-fhir-engine-resource-validation-claude-instructions.md`
- Fungsi:
  - briefing khusus untuk Claude saat mengerjakan lane validasi `Condition`,
    `RiskAssessment`, dan `DiagnosticReport`
  - mengunci task order, bounded-shape discipline, dan verification rules
  - memberi short prompt siap pakai untuk eksekusi lane ini
- Pakai file ini bila:
  - Chief ingin briefing cepat untuk Claude pada lane resource validation
  - Claude akan mulai eksekusi plan validasi tiga resource family deferred
- ingin mencegah lane ini drift ke terminology atau reasoning scope

### 14. CDS Hooks Formalization Spec

- File: `docs/superpowers/specs/2026-04-29-aadi-v2-cds-hooks-formalization.md`
- Fungsi:
  - memformalkan contract CDS Hooks AADI V2
  - mengunci service definition, hook context, prefetch assumptions, dan response invariants
  - menegaskan bahwa lane ini tetap tinggal di `packages/symphony`
- Pakai file ini bila:
  - ingin memahami contract CDS Hooks yang sekarang dianggap canonical
  - ingin audit PHI-safety dan card-order invariants
  - ingin memutuskan apakah promotion baru pantas dibahas atau belum

### 15. CDS Hooks Formalization Implementation Plan

- File: `docs/superpowers/plans/2026-04-29-cds-hooks-formalization-implementation.md`
- Fungsi:
  - memformalkan surface CDS Hooks AADI V2 sebelum ada keputusan promotion baru
  - mengunci service definition, hook context, prefetch assumptions, dan response invariants
  - menjaga CDS workflow semantics tetap tinggal di `packages/symphony`
- Pakai file ini bila:
  - Chief memberi GO untuk audit/rapikan lane CDS Hooks
  - Claude/Cursor akan menata adapter CDS Hooks tanpa memindahkannya ke `fhir-engine`
  - ingin menghindari promotion yang salah rumah untuk workflow-specific contract

### 16. Master Inventory

- File: `.agent/FEATURE.md`
- Fungsi:
  - inventaris feature existing dari Dashboard dan Assist
  - sumber utama untuk memastikan tidak ada capability lama yang hilang
- Pakai file ini bila:
  - ada pertanyaan “feature ini sudah ada atau belum?”
  - ingin memverifikasi apakah sesuatu harus reuse, migrate, atau tetap di Assist

---

## What Is Canonical

Yang canonical untuk AADI V2 saat ini:

- reasoning authority: `packages/symphony`
- reference sibling: `packages/clinical-references`
- shared contracts: `packages/shared-types`
- feature coverage gate: `docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`
- execution handoff: `docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md`
- phase 2 gate: `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
- terminology phase 2 gate: `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
- fhir promotion plan: `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
- `fhir-engine` modernization spec: `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
- `fhir-engine` modernization implementation plan: `docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md`
- `fhir-engine` Claude instructions: `docs/superpowers/specs/2026-04-29-fhir-engine-claude-instructions.md`
- `fhir-engine` resource validation implementation plan: `docs/superpowers/plans/2026-04-29-fhir-engine-resource-validation-implementation.md`
- `fhir-engine` resource validation Claude instructions: `docs/superpowers/specs/2026-04-29-fhir-engine-resource-validation-claude-instructions.md`
- CDS Hooks formalization spec: `docs/superpowers/specs/2026-04-29-aadi-v2-cds-hooks-formalization.md`
- CDS Hooks formalization implementation plan: `docs/superpowers/plans/2026-04-29-cds-hooks-formalization-implementation.md`

Yang tidak boleh menjadi canonical clinical engine:

- `packages/sentra-rag`
- `packages/vertex-rag`
- Dashboard local logic
- Assist local logic

---

## Rules For Agents

Sebelum implementasi:

1. baca `docs/superpowers/specs/2026-04-27-aadi-v2-design.md`
2. baca `docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`
3. cek `.agent/FEATURE.md`
4. baru buka `docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md`

Saat implementasi:

1. jangan bypass feature existing yang relevan
2. jangan pindahkan authority keluar dari `SYMPHONY`
3. jangan korbankan `alerts`, `trafficLight`, `trajectory`, `quality.auditHints`, atau action protocols
4. treat `diagnosisSuggestions` lama sebagai bridge/fallback, bukan pusat masa depan
5. jangan mulai Phase 2 implementation sebelum gate readiness-nya eksplisit lolos

Sebelum task dianggap selesai:

1. update mapping yang relevan di feature coverage matrix
2. jalankan suite verifikasi yang diwajibkan di plan
3. pastikan parity existing tetap hijau

---

## Sprint Intent

Framing sprint yang dipakai:

- Sprint 1:
  - facts spine
  - snapshot/pattern reuse
  - syndrome classification
  - diagnosis packs
  - native differential
- Sprint 2:
  - reasoning arbiter
  - explainability
  - clinical disposition
  - `assess.ts` integration
- Sprint 3:
  - shadow comparison
  - parity enforcement
  - demo hardening
- Sprint 4:
  - interoperability helpers
  - consumer bridge preparation
- Sprint 5:
  - AVPU canonicalization
  - consciousness mapping cleanup
  - classifier coverage hardening

---

## Latest External Notes

Referensi resmi yang dipakai saat menyusun dokumen-dokumen ini:

- FDA `Clinical Decision Support Software` final guidance, January 2026
  - https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- FDA `Good Machine Learning Practice` page, content current as of December 19, 2025
  - https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles
- HL7 FHIR R5 overview / versions / terminology
  - https://hl7.org/fhir/overview.html
  - https://hl7.org/fhir/versions.html
  - https://www.hl7.org/fhir/terminology-service.html
- HL7 CDS Hooks v2.0.1
  - https://cds-hooks.hl7.org/

Implikasi praktis yang dipakai:

- explainability harus jelas
- intended use harus eksplisit
- shadow comparison harus first-class
- interoperability helper boleh bertahap, tapi arahnya harus jelas
- terminology dan validation tidak boleh ditanam ad-hoc di mapper

---

## Recommended Starting Points

Untuk Chief:

- mulai dari `docs/superpowers/specs/2026-04-27-aadi-v2-design.md`
- lalu cek `docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md`
- jika ingin masuk Phase 2, baca `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
- jika ingin masuk Phase 2A terminology, lanjutkan ke `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
- jika ingin masuk package promotion discussion, lanjutkan ke `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
- jika ingin mulai modernization `packages/fhir-engine`, lanjutkan ke `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
- jika ingin mulai eksekusi modernization `packages/fhir-engine`, lanjutkan ke `docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md`
- jika ingin briefing Claude untuk modernization `packages/fhir-engine`, lanjutkan ke `docs/superpowers/specs/2026-04-29-fhir-engine-claude-instructions.md`
- jika ingin membuka lane validasi `Condition` / `RiskAssessment` / `DiagnosticReport`, lanjutkan ke `docs/superpowers/plans/2026-04-29-fhir-engine-resource-validation-implementation.md`
- jika ingin briefing Claude untuk lane validasi tiga resource family itu, lanjutkan ke `docs/superpowers/specs/2026-04-29-fhir-engine-resource-validation-claude-instructions.md`
- jika ingin memahami contract CDS Hooks canonical yang sudah diformalkan, lanjutkan ke `docs/superpowers/specs/2026-04-29-aadi-v2-cds-hooks-formalization.md`
- jika ingin memformalkan lane CDS Hooks tanpa promotion prematur, lanjutkan ke `docs/superpowers/plans/2026-04-29-cds-hooks-formalization-implementation.md`

Untuk Claude/Cursor:

- mulai dari file ini
- lalu buka matrix coverage
- lalu jalankan implementation plan dari task yang sedang aktif

Untuk reviewer:

- mulai dari matrix coverage
- lalu cek apakah implementasi masih sesuai design spec
- jika Phase 2 mulai dibahas, cek readiness gate dulu

---

## One-Line Summary

`AADI V2` di repo ini adalah evolusi `SYMPHONY` menjadi native diagnostic reasoning engine yang tetap safety-first, tetap explainable, dan wajib me-reuse seluruh fondasi klinis yang sudah dibangun, dengan Phase 2 hanya boleh dimulai setelah terminology dan validation boundary dikunci dengan benar.
