# AADI V2 Terminology Mapping Spec

**Date:** 2026-04-29  
**Status:** Draft for Chief review  
**Owner:** Codex/Dexton  
**Primary scope:** `packages/sentra/sentra-nada/src/interop/`, future `packages/sentra/sentra-sandi` promotion boundary  
**Related docs:**  
- `docs/specs/aadi-v2/008-2026-04-29-aadi-v2-phase-2-readiness-gate.md`  
- `docs/specs/aadi-v2/004-2026-04-27-aadi-v2-design.md`  
- `docs/specs/aadi-v2/005-2026-04-27-aadi-v2-feature-coverage-matrix.md`  
- `packages/sentra/sentra-nada/src/interop/symphony-to-fhir.ts`  
- `packages/sentra/sentra-nada/src/interop/symphony-to-cds-hooks.ts`

---

## Purpose

Dokumen ini mengunci boundary terminology untuk AADI V2 Phase 2.

Tujuannya:

- mencegah mapper interop menanam code system secara acak
- menentukan starter set terminology yang realistis
- memisahkan apa yang wajib sekarang vs apa yang ditunda
- memberi dasar formal sebelum `packages/sentra/sentra-sandi` dipromosikan

Prinsip utamanya:

> **Terminology mapping adalah layer formal, bukan detail kecil di serializer.**

---

## Best-Practice Notes

Referensi resmi terbaru yang dipakai:

1. HL7 FHIR R5 terminology service guidance tetap memisahkan
   `CodeSystem`, `ValueSet`, `lookup`, `validate-code`, dan `expand`.
   Relevance: mapper output tidak boleh sekaligus berpura-pura menjadi
   terminology service.
   Source: https://www.hl7.org/fhir/terminology-service.html

2. HL7 terminology module tetap menempatkan terminology sebagai module
   tersendiri untuk coded data governance.
   Relevance: terminology policy harus eksplisit sebelum validation-aware
   Phase 2 dimulai.
   Source: https://www.hl7.org/fhir/terminology-module.html

3. HL7 external code systems guidance tetap mengarahkan penggunaan URI
   yang benar untuk external systems.
   Relevance: URI code system tidak boleh dikarang bebas.
   Source: https://www.hl7.org/fhir/terminologies-systems.html

4. SNOMED CT official/NLM overview tetap menempatkan SNOMED CT sebagai
   comprehensive clinical terminology, cocok untuk problem/clinical concept,
   tetapi jauh lebih berat daripada kebutuhan starter AADI V2.
   Source:
   - https://www.nlm.nih.gov/healthit/snomedct/snomed_overview.html
   - https://docs.snomed.org/snomed-ct-specifications/snomed-ct-editorial-guide/readme/snomed-ct-introduction

5. RxNorm official NLM overview tetap relevan untuk normalized clinical drug
   terminology, tetapi dominannya US-centric.
   Relevance: jangan diwajibkan terlalu awal untuk repo ini.
   Source:
   - https://www.nlm.nih.gov/research/umls/rxnorm/index.html
   - https://www.nlm.nih.gov/research/umls/rxnorm/overview.html

Implikasinya untuk repo ini:

- ICD-10 cukup sebagai diagnosis code starter
- internal code systems tetap boleh untuk posture yang memang internal
- SNOMED / LOINC / RxNorm jangan dipaksa masuk semua di Phase 2A
- terminology validation harus datang setelah mapping scope dikunci

---

## Current Reality

Saat ini `packages/sentra/sentra-nada/src/interop/symphony-to-fhir.ts` sudah memakai:

- ICD-10 URI untuk `Condition.code`
- internal URI untuk traffic-light
- internal URI untuk alert severity

Ini adalah langkah yang benar untuk stub deterministic.

Tetapi repo belum punya:

- central terminology registry
- `ValueSet` policy
- mapping ownership table
- formal rule kapan field harus coded vs boleh text-only
- validation engine yang memeriksa code membership

Jadi terminology sekarang **cukup untuk stub**, tapi **belum cukup untuk Phase 2 hardening tanpa spec**.

---

## Core Principles

### 1. Reasoning Codes Follow Clinical Output, Not the Reverse

Terminology layer tidak menentukan reasoning.

Yang benar:

- `SYMPHONY` menghasilkan reasoning
- terminology layer memberi coded representation yang stabil

Yang salah:

- terminology choice ikut mengubah diagnosis ranking atau alert semantics

### 2. Use the Smallest Safe Starter Set

Phase 2A harus mulai dari terminology yang sudah benar-benar kita pakai.

Jangan memulai dari target yang terlalu luas seperti:

- SNOMED CT untuk semua diagnosis
- LOINC untuk semua signals
- RxNorm untuk semua medication semantics

kalau consumer nyata belum membutuhkan itu.

### 3. Internal Posture Can Use Internal Code Systems

Tidak semua field harus dipaksa memakai external standard.

Untuk AADI V2 awal:

- diagnosis hypotheses → external standard preferred
- traffic-light posture → internal system acceptable
- alert severity → internal system acceptable
- shadow agreement → internal system acceptable

### 4. ValueSet Policy Must Be Explicit

Kalau sebuah coded field hanya boleh mengambil subset tertentu, subset itu
harus dinyatakan sebagai policy, bukan hanya asumsi di code.

---

## Terminology Scope for Phase 2A

### In Scope

1. Diagnosis coding for `nativeHypotheses`
2. Traffic-light code system policy
3. Alert severity code system policy
4. Minimal policy for clinical disposition coding
5. URI governance for interop outputs

### Out of Scope

1. Full SNOMED CT remap for diagnosis concepts
2. Full LOINC coverage for all observation/fact outputs
3. RxNorm-based medication normalization
4. Terminology server integration
5. Crosswalk maintenance automation
6. National/local terminology extension package

---

## Canonical Starter Set

### Starter Set A — Diagnosis Hypotheses

**Canonical code system:** ICD-10

Why:

- `SymphonyDiagnosticHypothesis` already carries `icd10Code`
- current pack registry and native differential already reason in ICD-10-compatible space
- current FHIR stub already uses `http://hl7.org/fhir/sid/icd-10`
- this avoids artificial dual-coding too early

**Policy:**

- `nativeHypotheses[*].icd10Code` is the canonical coded diagnosis output
- if `diagnosisName` exists without `icd10Code`, resource is not terminology-ready
- `diagnosisName` remains display text, not canonical code source

### Starter Set B — Traffic-Light Escalation

**Canonical code system:** internal

**Proposed URI:** `urn:symphony:traffic-light`

Allowed codes:

- `GREEN`
- `YELLOW`
- `RED`

Why:

- this is an internal posture system, not a diagnosis terminology
- forcing an external code system here would add complexity without clear gain

### Starter Set C — Alert Severity

**Canonical code system:** internal

**Proposed URI:** `urn:symphony:alert-severity`

Allowed codes:

- `critical`
- `high`
- `warning`
- `info`

Why:

- alert severity is a SYMPHONY safety posture, not a universal diagnosis vocabulary
- semantics are tightly coupled to current engine behavior

### Starter Set D — Clinical Disposition

**Canonical code system:** internal

**Proposed URI:** `urn:symphony:clinical-disposition`

Allowed codes:

- `ok`
- `requires_review`
- `insufficient_data`
- `degraded`

Why:

- this is product-specific and already separated from operational engine status
- external standardization is not required at this stage

### Starter Set E — Shadow Agreement

**Canonical code system:** internal

**Proposed URI:** `urn:symphony:shadow-agreement`

Allowed codes:

- `high`
- `partial`
- `low`
- `not_comparable`

Why:

- purely internal evaluation posture
- no benefit to external standardization at this time

---

## Deferred Terminology Set

### Deferred A — SNOMED CT

Use later when:

- a consumer truly needs concept-normalized diagnosis semantics
- ICD-10 alone is no longer sufficient
- licensing / distribution / operational policy are clear

Do not require in Phase 2A.

### Deferred B — LOINC

Use later when:

- `Observation` mapping becomes more granular and resource-complete
- vital/lab outputs need standard observation codes
- validation-aware Observation profiling becomes a real requirement

Do not require in Phase 2A.

### Deferred C — RxNorm

Use later when:

- medication normalization becomes a formal output requirement
- DDI/pharmacology data needs external medication coding interoperability
- US-centric tradeoff is accepted or alternative drug terminology is chosen

Do not require in Phase 2A.

---

## Field-by-Field Policy

### `Condition.code`

- must use ICD-10 URI
- must contain `code`
- may contain `display`
- `display` is descriptive only

### `RiskAssessment.prediction[*].qualitativeRisk`

- uses `urn:symphony:traffic-light`
- values restricted to `GREEN|YELLOW|RED`

### `Observation.code` for alert observations

- current Phase 2A policy: internal alert identifier under `urn:symphony:alert-severity`
- note: this is still pragmatic/stub-friendly, not final semantic modeling

### `DiagnosticReport.conclusion`

- plain text still allowed
- not a terminology-bound field in Phase 2A

### CDS Hooks cards

- summary/detail may stay text
- coded source semantics remain behind `SymphonyResult`, not inside card wording

---

## URI Governance Rules

### External

Use authoritative URIs only.

For current starter set:

- ICD-10: `http://hl7.org/fhir/sid/icd-10`

Do not invent alternative ICD-10 URIs.

### Internal

Internal systems must:

- use stable URI format
- be documented in spec
- remain deterministic
- not masquerade as external standards

Approved internal starter URIs:

- `urn:symphony:traffic-light`
- `urn:symphony:alert-severity`
- `urn:symphony:clinical-disposition`
- `urn:symphony:shadow-agreement`

---

## Validation Policy

Phase 2A terminology spec does **not** require full runtime terminology validation yet.

What is required:

1. explicit URI policy
2. explicit allowed-code policy for internal systems
3. explicit requirement that coded fields not be emitted with blank code values

What is deferred:

1. `validate-code` against terminology service
2. `ValueSet` expansion runtime checks
3. package-level terminology server integration
4. external terminology package distribution

---

## Package Placement Policy

### `packages/sentra/sentra-nada`

May continue to host:

- deterministic mapping functions
- code system URI constants
- internal allowed-code guards

Must not become:

- full terminology service
- full concept validation engine

### Future `packages/sentra/sentra-sandi` promotion

Only after:

1. R5 direction is explicit
2. terminology policy from this doc is accepted
3. promotion plan is written

---

## Verification Gates

Phase 2A terminology work must verify:

```bash
pnpm --filter @sentra/nada test
pnpm --filter @sentra/nada typecheck
```

And if terminology logic is moved or promoted:

```bash
pnpm --filter @sentra/sandi test
pnpm --filter @sentra/sandi typecheck
```

Additional mandatory checks:

- no contract drift in `SymphonyResult`
- no reasoning drift in `nativeHypotheses`
- PHI-safety tests remain green
- parity suites remain green

---

## Ready / Not Ready Rules

### `NOT_READY`

If:

- team wants to start SNOMED/LOINC/RxNorm immediately
- no agreement on starter set
- URI policy is still ad-hoc

### `READY_FOR_PHASE_2A`

If:

- Chief accepts ICD-10 + internal code system starter set
- SNOMED/LOINC/RxNorm are explicitly deferred
- terminology policy stays additive and bounded

---

## Current Recommendation

Per 2026-04-29, rekomendasi saya:

> **Use ICD-10 + internal posture systems as the only mandatory Phase 2A starter terminology set.**

That means:

- start narrow
- keep deterministic mapping
- avoid premature external terminology explosion
- promote stronger validation only after package/ownership boundary is clear

---

## Immediate Next Step

Setelah spec ini, artefak berikut yang paling tepat adalah:

1. `FHIR Promotion Plan`

Karena setelah terminology scope dikunci, pertanyaan terbesarnya tinggal:

- apakah Phase 2 tetap harden di `packages/sentra/sentra-nada/src/interop/`
- atau mulai promosi sebagian ke `packages/sentra/sentra-sandi`

---

## Final Recommendation

Chief sebaiknya treat terminology Phase 2 sebagai:

- **bounded interoperability discipline**
- bukan **terminology expansion project**

Kalau kita tetap disiplin:

- diagnosis tetap ICD-10 dulu
- posture internal tetap internal
- validation datang setelah boundary siap

maka Phase 2 akan bergerak cepat tanpa mengorbankan clarity arsitektur.
