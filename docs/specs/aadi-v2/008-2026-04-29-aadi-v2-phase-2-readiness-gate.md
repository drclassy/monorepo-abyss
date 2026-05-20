# AADI V2 Phase 2 Readiness Gate Spec

**Date:** 2026-04-29  
**Status:** Draft for Chief review  
**Owner:** Codex/Dexton  
**Primary scope:** `packages/sentra/sentra-nada/`, `packages/sentra/sentra-sandi/`, consumer bridge boundary  
**Related docs:**  
- `docs/specs/aadi-v2/004-2026-04-27-aadi-v2-design.md`  
- `docs/specs/aadi-v2/005-2026-04-27-aadi-v2-feature-coverage-matrix.md`  
- `docs/specs/001-symphony-bridge-v1.md`  
- `packages/sentra/sentra-sandi/README.md`

---

## Purpose

Dokumen ini mengunci satu hal:

> **Phase 2 AADI V2 tidak boleh dimulai hanya karena interop stub sudah ada.**

Phase 2 adalah fase ketika output AADI V2 mulai bergerak dari:

- deterministic internal reasoning output
- ke arah structured interoperability yang lebih formal
- dengan terminology discipline
- dan validation boundary yang bisa dipertanggungjawabkan

Karena itu, repo ini butuh readiness gate yang eksplisit sebelum:

1. adapter `FHIR-ish` di `packages/sentra/sentra-nada/src/interop/` dipromosikan
2. `packages/sentra/sentra-sandi` ikut masuk sebagai dependency arsitektur Phase 2
3. terminology mapping menjadi requirement build, bukan hanya catatan

---

## Best-Practice Notes

Catatan ini memakai referensi resmi terbaru yang relevan untuk arah Phase 2:

1. HL7 FHIR R5 version management page masih menyatakan R5 sebagai current
   published version.
   Relevance: target interoperability default kita harus R5-aware, bukan
   menambah surface baru di atas asumsi R4 lama.
   Source: https://hl7.org/fhir/versions.html

2. HL7 FHIR terminology service guidance tetap memisahkan tanggung jawab
   `CodeSystem`, `ValueSet`, validation, expansion, dan lookup.
   Relevance: terminology mapping tidak boleh ditanam acak di mapper output.
   Source: https://www.hl7.org/fhir/terminology-service.html

3. HL7 terminology module tetap menegaskan terminology sebagai module
   tersendiri, bukan aksesori kecil dari resource transformation.
   Relevance: `packages/sentra/sentra-sandi` promotion butuh terminology plan,
   bukan sekadar serializer baru.
   Source: https://www.hl7.org/fhir/terminology-module.html

4. CDS Hooks v2.0.1 tetap current published version.
   Relevance: response card adapter kita valid sebagai stub, tetapi Phase 2
   harus mulai memikirkan hook context, prefetch contract, dan service
   discovery boundary.
   Source: https://cds-hooks.hl7.org/

Implikasi untuk repo ini:

- FHIR mapping tidak cukup hanya "shape mirip resource"
- terminology mapping harus explicit
- validation scope harus dipisah dari reasoning scope
- `SYMPHONY` tetap reasoning authority; Phase 2 hanya menambah
  interoperability discipline di sekitar output

---

## Current State

### What We Already Have

Saat ini repo sudah memiliki Phase 1 / Sprint 1-5 foundation yang kuat:

- native AADI V2 reasoning di `packages/sentra/sentra-nada`
- shadow comparison
- parity verification
- interop stubs di `packages/sentra/sentra-nada/src/interop/`
  - `mapSymphonyResultToFhirBundle()`
  - `mapSymphonyResultToCdsHooksResponse()`
- orchestrator thin-client handoff ke `assessSymphonyInput()`

### What Is Still Only a Stub

Interop sekarang masih stub, bukan production-grade Phase 2 layer:

- belum ada terminology validation
- belum ada `CodeSystem` / `ValueSet` governance
- belum ada formal profile binding
- belum ada R5 validation engine
- belum ada consumer contract yang mengikat prefetch / hook payload / service metadata

### Important Package Reality

`packages/sentra/sentra-sandi` saat ini masih berorientasi **FHIR R4**:

- README menyebut "FHIR R4 validation and transformation layer"
- index dan validator surface juga masih R4
- transformer masih banyak TODO

Artinya:

- package itu **belum** bisa diangkat begitu saja menjadi rumah Phase 2
- promotion ke sana butuh gate tambahan
- jangan salah mengira bahwa keberadaan `packages/sentra/sentra-sandi` berarti Phase 2 sudah siap

---

## Core Principle

Phase 2 hanya boleh dimulai bila tiga hal benar secara bersamaan:

1. **Reasoning core sudah cukup stabil**
2. **Interop target sudah cukup jelas**
3. **Terminology/validation boundary sudah cukup eksplisit**

Kalau salah satu belum ada, yang terjadi biasanya:

- mapper makin banyak
- semantics makin kabur
- consumer mulai branch sendiri
- `SYMPHONY` tetap benar secara klinis, tapi interoperability layer jadi rapuh

---

## Phase 2 Definition

Dalam repo ini, **Phase 2** berarti:

- promotion dari interop stub ke interop layer yang lebih formal
- terminology-aware mapping
- validation-aware output shaping
- CDS workflow contract yang lebih eksplisit
- tanpa memindahkan reasoning authority keluar dari `SYMPHONY`

Phase 2 **bukan**:

- rewrite `SYMPHONY`
- FHIR-native reasoning engine
- certification claim
- full EHR integration project
- direct Dashboard/Assist feature sprint

---

## Entry Criteria

Semua item di bawah harus terpenuhi sebelum implementation Phase 2 boleh dimulai.

### Gate A — Engine Stability

1. `packages/sentra/sentra-nada` test suite hijau penuh pada baseline target branch.
2. Parity suites hijau:
   - `runSymphonyParityFixtures()`
   - `runAssistPatternParityFixtures()`
   - AADI V2 parity verification
3. `clinicalDisposition`, `metadata.status`, `shadowComparison`, dan
   interoperability adapters sudah tidak lagi berada dalam status semantics
   yang ambigu.
4. Sprint 5 core cleanup yang tersisa untuk consciousness mapping sudah selesai
   atau secara formal ditutup.

### Gate B — Authority and Boundary Lock

1. `SYMPHONY` tetap satu-satunya reasoning authority.
2. `packages/sentra/sentra-nada/src/interop/` tetap read-only terhadap `SymphonyResult`.
3. Consumer apps tidak boleh mulai melakukan recalculate / rescore / remap
   diagnosis authority sendiri.
4. Orchestrator tetap thin client dan tidak menambah reasoning logic baru.

### Gate C — Interop Scope Clarity

1. Harus ada keputusan eksplisit apakah target awal Phase 2 adalah:
   - `FHIR Bundle shaping only`, atau
   - `FHIR validation-aware shaping`, atau
   - `CDS Hooks service contract formalization`, atau
   - kombinasi kecil yang jelas
2. Resource target awal harus dibatasi.
   Rekomendasi awal:
   - `Condition`
   - `RiskAssessment`
   - `DiagnosticReport`
   - `Observation`
   - CDS Hooks `cards`
3. Harus ada daftar resource yang **belum** ikut masuk.
   Contoh:
   - `GuidanceResponse`
   - `DetectedIssue`
   - `ServiceRequest`
   - `CarePlan`

### Gate D — Terminology Scope Clarity

1. Harus ada keputusan code system mana yang canonical lebih dulu.
2. Minimal starter set harus dikunci.
   Rekomendasi:
   - ICD-10 untuk diagnosis hypotheses
   - internal code system untuk traffic-light
   - internal code system untuk alert severity
3. Harus ada keputusan apa yang **belum** diwajibkan di Phase 2 awal.
   Rekomendasi defer:
   - SNOMED CT diagnosis remap
   - LOINC mapping penuh untuk all observations
   - RxNorm medication terminology
4. Terminology lookup tidak boleh dibangun implisit di mapper.

### Gate E — Validation Scope Clarity

1. Harus ada keputusan apakah validation dilakukan:
   - inline di `packages/sentra/sentra-nada`
   - di package sibling
   - atau di consumer boundary
2. Rekomendasi: validation **tidak** ditanam di `SYMPHONY` core.
3. Kalau `packages/sentra/sentra-sandi` akan dipromosikan, harus ada keputusan eksplisit:
   - upgrade R4 -> R5
   - compatibility strategy
   - ownership
   - TODO debt yang masih boleh hidup

---

## No-Go Conditions

Phase 2 harus ditahan jika salah satu kondisi ini masih benar:

1. `packages/sentra/sentra-sandi` masih dianggap canonical hanya karena namanya cocok,
   padahal surface-nya masih R4/TODO-heavy.
2. Consumer meminta "FHIR output" tetapi belum bisa menyebut resource boundary
   mana yang dibutuhkan.
3. Terminology mapping diminta tetapi belum ada keputusan code system prioritas.
4. Interop layer mulai menambah clinical interpretation baru di luar
   `SymphonyResult`.
5. CDS Hooks adapter mulai mengandung workflow-specific branching yang tidak
   terikat ke hook contract formal.
6. Team ingin memulai SNOMED/LOINC/RxNorm sekaligus tanpa bounded scope.
7. Dashboard/Assist mencoba menjadi tempat validasi klinis akhir.

---

## Required Deliverables Before Phase 2 Execution

Sebelum coding Phase 2, minimal harus ada tiga artefak berikut:

### 1. Phase 2 Readiness Gate Spec

Dokumen ini sendiri.

### 2. Terminology Mapping Spec

Harus menjawab:

- code system mana yang masuk dulu
- mana yang internal
- mana yang external standard
- resource field mana yang wajib coded
- mana yang masih boleh plain text

### 3. FHIR Promotion Plan

Harus menjawab:

- apakah `packages/sentra/sentra-sandi` dipakai atau tidak
- kalau dipakai, bagaimana upgrade path-nya
- kalau tidak, apakah dibuat package baru atau tetap di `packages/sentra/sentra-nada/src/interop/`

---

## Recommended Phase 2 Sequence

Urutan yang saya rekomendasikan:

### Phase 2A — Specification Lock

Target:

- terminology mapping spec
- resource boundary spec
- validation boundary spec
- package promotion decision

Exit criteria:

- tidak ada lagi ambiguity soal R4 vs R5
- tidak ada lagi ambiguity soal code system starter set
- tidak ada lagi ambiguity soal rumah validation

### Phase 2B — Terminology-Aware Adapter Hardening

Target:

- rapikan interop adapters existing
- tambahkan explicit code system metadata
- tambahkan deterministic mapping guards
- tambahkan PHI-safe contract assertions

Exit criteria:

- adapter masih additive
- tidak ada reasoning drift
- test coverage bertambah tanpa memperbesar scope klinis

### Phase 2C — Validation / Package Promotion

Target:

- promote validation layer ke package yang benar
- upgrade atau refactor `packages/sentra/sentra-sandi` bila memang dipilih
- tambah validation-aware tests

Exit criteria:

- validation boundary jelas
- tidak memaksa `SYMPHONY` core memikul responsibility yang salah

### Phase 2D — CDS Workflow Formalization

Target:

- service discovery notes
- hook context contract
- prefetch assumptions
- response invariants

Exit criteria:

- adapter CDS Hooks tidak lagi hanya stub shape, tetapi punya service contract yang jelas

---

## Package Decision Rules

### Rule 1 — `packages/sentra/sentra-nada`

Tetap memiliki:

- reasoning authority
- canonical result surface
- additive interop stubs selama belum dipromosikan

Tidak boleh memiliki:

- heavy terminology validation engine
- external workflow orchestration semantics
- consumer-specific hook branching yang besar

### Rule 2 — `packages/sentra/sentra-sandi`

Boleh dipromosikan hanya jika:

1. scope R5 sudah jelas
2. TODO debt transformer tidak lagi dominan
3. validasi resource boundary memang dibutuhkan oleh consumer nyata
4. ownership package jelas

Kalau syarat itu belum terpenuhi:

- tetap treat `packages/sentra/sentra-sandi` sebagai candidate, bukan canonical target

### Rule 3 — Consumer Apps

Dashboard, Assist, dan orchestrator:

- boleh membaca output interop
- boleh membungkus transport
- tidak boleh menentukan ulang semantics diagnosis/alert/escalation

---

## Verification Gates for Phase 2 Work

Setiap milestone Phase 2 nanti harus lolos minimal:

```bash
pnpm --filter @sentra/nada test
pnpm --filter @sentra/nada typecheck
pnpm --filter @the-abyss/orchestrator test
```

Dan bila `packages/sentra/sentra-sandi` disentuh:

```bash
pnpm --filter @sentra/sandi test
pnpm --filter @sentra/sandi typecheck
```

Tambahan mandatory checks:

- parity suites tetap hijau
- adapter PHI-safety tests tetap hijau
- no contract drift on `SymphonyResult`
- no new reasoning logic in consumer bridge

---

## Readiness Verdict Model

Gunakan model sederhana ini:

### `NOT_READY`

Dipakai bila:

- terminology scope belum dikunci
- package promotion target belum diputuskan
- target resource boundary masih kabur

### `READY_FOR_SPEC_ONLY`

Dipakai bila:

- readiness gate ini sudah ada
- tetapi terminology spec / promotion plan belum ada

### `READY_FOR_PHASE_2A`

Dipakai bila:

- readiness gate ini ada
- Chief menyetujui penyusunan terminology mapping spec
- Chief menyetujui penyusunan FHIR promotion plan

### `READY_FOR_PHASE_2_IMPLEMENTATION`

Dipakai bila:

- Phase 2A artefak sudah lengkap
- package decision sudah final
- verification boundary sudah disepakati

---

## Current Verdict

Per 2026-04-29, verdict saya:

> **`READY_FOR_SPEC_ONLY`**

Alasannya:

- AADI V2 core reasoning sudah cukup matang
- interop stub sudah ada dan stabil
- orchestrator bridge sudah ada
- tetapi terminology scope belum dikunci
- package promotion decision untuk `packages/sentra/sentra-sandi` belum final
- validation boundary belum final

Jadi:

- Phase 2 **belum** siap untuk implementation langsung
- tetapi **sudah siap** untuk specification work yang formal

---

## Immediate Recommended Next Step

Langkah berikut yang paling tepat:

1. tulis `Terminology Mapping Spec`
2. tulis `FHIR Promotion Plan`
3. baru setelah itu minta GO untuk `Phase 2A implementation`

---

## Final Recommendation

Chief sebaiknya memperlakukan Phase 2 sebagai:

- **interop hardening phase**
- bukan **reasoning expansion phase**

Kuncinya:

- `SYMPHONY` tetap engine
- terminology jadi layer formal
- validation jadi responsibility yang ditempatkan dengan benar
- consumer tetap consumer

Kalau aturan ini dijaga, Phase 2 akan memperkuat AADI V2. Kalau tidak,
Phase 2 justru berisiko mencampur reasoning, serialization, terminology, dan
workflow menjadi satu lapisan yang sulit dirawat.
