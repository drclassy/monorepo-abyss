# `packages/fhir-engine` Modernization Spec

**Date:** 2026-04-29  
**Status:** Draft for Chief review  
**Owner:** Codex/Dexton  
**Primary package:** `packages/fhir-engine/`  
**Related docs:**  
- `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`  
- `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`  
- `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`  
- `packages/fhir-engine/README.md`

---

## Purpose

Dokumen ini mendefinisikan bagaimana `packages/fhir-engine` harus
dimodernisasi sebelum ia boleh menerima responsibility Phase 2 AADI V2.

Spec ini tidak memindahkan reasoning authority.

Tujuannya justru kebalikannya:

- menjaga `SYMPHONY` tetap sebagai engine klinis
- menyiapkan `fhir-engine` sebagai layer validation/normalization yang lebih layak
- menghapus ambiguity lama: R4-only, TODO-heavy transformer, dan package role yang terlalu umum

---

## Best-Practice Notes

Catatan resmi terbaru yang relevan:

1. HL7 FHIR R5 tetap current published version.
   Relevance: modernization harus bergerak ke arah R5-aware, bukan menguatkan R4 sebagai default masa depan.
   Source: https://hl7.org/fhir/versions.html

2. FHIR versioning guidance mengakui coexistence multi-version, tapi tetap menuntut kejelasan version strategy.
   Relevance: package ini tidak boleh kabur antara R4 helper generik dan R5 adapter baru.
   Source: https://fhir.hl7.org/fhir/versioning.html

3. FHIR profiling guidance menegaskan bahwa profile/constraint adalah concern terpisah di atas resource base.
   Relevance: package ini cocok untuk validation/profile layer, bukan untuk clinical reasoning.
   Source: https://hl7.org/fhir/profiling.html

4. FHIR terminology service/module guidance menuntut pemisahan yang jelas antara transformasi resource dan terminology governance.
   Relevance: modernization tidak boleh langsung menjadikan `fhir-engine` sebagai terminology service penuh.
   Sources:
   - https://www.hl7.org/fhir/terminology-service.html
   - https://www.hl7.org/fhir/terminology-module.html

---

## Current State

### What Exists Today

`packages/fhir-engine` saat ini:

- diposisikan sebagai **FHIR R4 validation and transformation layer**
- mengekspor:
  - `FhirValidator`
  - `validatePatient`
  - `validateObservation`
  - `FhirTransformer`
- memiliki test dasar yang mostly memverifikasi shape R4 sederhana

### Current Problems

Ada empat masalah utama:

1. **Role ambiguity**
   - package tampak seperti generic FHIR utility
   - belum jelas apakah dia validator, transformer, compatibility layer, atau semua sekaligus

2. **Version ambiguity**
   - README dan index masih R4-oriented
   - sementara arah AADI V2 Phase 2 sekarang mengarah ke R5-aware interop hardening

3. **Transformer ambiguity**
   - `FhirTransformer` masih TODO-heavy
   - method sekarang belum benar-benar menjadi boundary yang bisa dipercaya

4. **AADI V2 disconnect**
   - package belum terkoneksi secara arsitektural ke output `SymphonyResult`
   - tidak punya role eksplisit dalam pipeline AADI V2

---

## Modernization Goal

Goal package ini **bukan** menjadi “semua hal FHIR”.

Goal yang benar:

> menjadikan `packages/fhir-engine` sebagai **FHIR validation and normalization package** yang siap menerima promotion bertahap dari interop layer AADI V2.

Secara praktis, itu berarti:

- `SYMPHONY` tetap mengeluarkan interop intent / adapter shape
- `fhir-engine` memvalidasi, menormalkan, dan kelak memeriksa profile compatibility

---

## Non-Goals

Package ini **tidak** boleh dimodernisasi menjadi:

1. clinical reasoning engine
2. diagnosis mapper authority
3. terminology server penuh
4. universal all-version transformation engine
5. consumer-specific orchestration package

---

## Target Role After Modernization

Setelah modernization awal selesai, `packages/fhir-engine` seharusnya punya role:

### 1. Validation Layer

- structural validation
- bounded resource validation
- explicit resource support matrix

### 2. Normalization Layer

- normalize resource shape untuk target version yang dipilih
- bukan melakukan inference klinis

### 3. Profile/Constraint Layer

- menampung validasi constraint ringan untuk resource target tertentu
- bertahap, bukan penuh sejak awal

### 4. Future Promotion Target

- menjadi rumah yang lebih benar untuk Phase 2 validation responsibility

---

## Version Strategy

### Recommended Strategy

**R5-primary modernization path**

Artinya:

- arah package ini harus mulai berpindah dari “R4 utility” ke “R5-aware validation package”
- R4 compatibility boleh bertahan sementara, tetapi tidak menjadi arah jangka panjang package

### Rejected Strategy

**Dual universal support from day one**

Ditolak karena:

- terlalu besar untuk sprint modernization awal
- akan memperpanjang ambiguity
- tidak dibutuhkan untuk kebutuhan AADI V2 saat ini

### Practical Rule

Pada tahap awal modernization:

- documentation harus jujur menyebut status transisional
- code tidak boleh mengklaim support R5 penuh sebelum benar
- package bisa mulai dengan “R5-target modernization in progress”

---

## Modernization Stages

### Stage M1 — Role Clarification

Deliverables:

- update README
- update package-level description
- update public API comments

Must clarify:

- what package owns
- what package does not own
- that `SYMPHONY` remains reasoning authority
- that current support is bounded

Exit criteria:

- tidak ada lagi wording yang misleading seperti seolah package ini sudah generic final FHIR platform

### Stage M2 — Transformer Honesty

Deliverables:

- review `FhirTransformer`
- decide per method:
  - real implementation
  - explicit stub
  - removal/deprecation

Rule:

- TODO-heavy methods tidak boleh terus tampil seolah production-ready

Recommended treatment:

- kalau method belum punya semantics yang benar, ubah statusnya jadi explicit placeholder atau deprecate
- jangan biarkan method yang hanya `return resource as T` terlihat seperti transform sungguhan

Exit criteria:

- transformer surface sudah jujur
- tidak ada fake capability yang menyesatkan user package

### Stage M3 — Resource Support Matrix

Deliverables:

- daftar resource yang benar-benar didukung

Recommended initial support matrix:

- `Patient`
- `Observation`

Deferred from this package until explicit need:

- `Condition`
- `RiskAssessment`
- `DiagnosticReport`

Why defer these despite AADI V2 interop using them now:

- current AADI V2 mapping masih shape-layer di `SYMPHONY`
- promotion ke validation package harus bertahap

Exit criteria:

- docs menyebut supported resources secara eksplisit
- unsupported resources fail honestly

### Stage M4 — R5 Target Prep

Deliverables:

- explicit modernization note for R5 target
- decide whether current types remain R4 for one transition step
- define what “R5-ready enough” means for the package

Recommended minimum for “R5-ready enough”:

- no misleading R4-only marketing language
- profile/validation plan exists
- resource strategy documented

### Stage M5 — Validation Hook Readiness

Deliverables:

- package API seam for future validation of AADI V2 promoted resources

Not full implementation yet.

The goal is:

- make later promotion easy
- without forcing AADI V2 adapters to move now

---

## Public API Policy

### Keep

- `FhirValidator`
- `validatePatient`
- `validateObservation`

if they remain honest and tested.

### Review

- `FhirTransformer`

Questions to answer:

- does it have enough real behavior to keep?
- should some methods be deprecated?
- should version-normalization move behind explicit strategy methods?

### Do Not Add Yet

- full AADI V2 Condition validator
- full terminology validation API
- profile registry machinery

Those belong after modernization baseline is stable.

---

## AADI V2 Relationship Rules

`packages/fhir-engine` modernization must obey:

1. `SymphonyResult` remains the source of interop intent
2. `fhir-engine` must not reconstruct diagnosis semantics
3. `fhir-engine` may validate promoted outputs later
4. `fhir-engine` must not become a second reasoning path

---

## Migration Boundaries

### What Stays in `packages/symphony`

- `mapSymphonyResultToFhirBundle()`
- `mapSymphonyResultToCdsHooksResponse()`
- internal code system posture mapping
- reasoning-driven resource population

### What May Move Later

- structural validation of promoted resources
- profile checks
- normalization helpers

### What Must Never Move

- diagnosis ranking logic
- traffic-light logic
- shadow comparison logic
- clinical disposition logic

---

## Verification Gates

Any modernization work touching `packages/fhir-engine` code must run:

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
```

If package consumers or docs imply changed Phase 2 boundary, also verify:

```bash
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
```

Additional expectations:

- no AADI V2 reasoning drift
- no new fake transform behavior
- no docs that overclaim support

---

## Recommended Execution Order

1. README modernization
2. public API honesty pass
3. transformer decision pass
4. support matrix declaration
5. R5-target wording and package role clarification

Do **not** start by adding more code blindly.
Start by making the package honest.

---

## Current Verdict

Per 2026-04-29:

> **`packages/fhir-engine` should be modernized before it is promoted.**

Meaning:

- ready for modernization spec: **YES**
- ready for direct Phase 2 promotion: **NO**

---

## Immediate Next Step

Kalau Chief mau lanjut, step berikut yang paling natural adalah:

1. `GO` untuk implementation plan `packages/fhir-engine modernization`

Itu akan mengubah dokumen ini menjadi task-by-task plan yang bisa dikerjakan Claude/Cursor.

---

## Final Recommendation

Chief sebaiknya treat modernization package ini sebagai:

- **truthfulness cleanup first**
- **role clarity second**
- **promotion prep third**

Urutan itu akan membuat Phase 2 jauh lebih aman dibanding langsung memaksa `fhir-engine` menjadi rumah canonical baru.
