# AADI V2 FHIR Promotion Plan

**Date:** 2026-04-29  
**Status:** Draft for Chief review  
**Owner:** Codex/Dexton  
**Primary scope:** `packages/sentra/sentra-nada/src/interop/`, `packages/sentra/sentra-sandi/`  
**Related docs:**  
- `docs/specs/aadi-v2/008-2026-04-29-aadi-v2-phase-2-readiness-gate.md`  
- `docs/specs/aadi-v2/009-2026-04-29-aadi-v2-terminology-mapping.md`  
- `docs/specs/aadi-v2/004-2026-04-27-aadi-v2-design.md`  
- `packages/sentra/sentra-sandi/README.md`

---

## Purpose

Dokumen ini menjawab pertanyaan yang paling penting untuk Phase 2:

> **Apakah interoperability AADI V2 tetap di `packages/sentra/sentra-nada/src/interop/`, atau mulai dipromosikan ke `packages/sentra/sentra-sandi`?**

Jawaban pendeknya:

> **Ya, promosi boleh terjadi, tetapi bertahap dan tidak sekarang secara penuh.**

Plan ini dibuat supaya:

- package boundary tetap bersih
- `SYMPHONY` tidak dipaksa jadi validation engine
- `packages/sentra/sentra-sandi` tidak diangkat prematur padahal masih R4/TODO-heavy
- promosi Phase 2 tetap additive dan reversible

---

## Current State

### What `packages/sentra/sentra-nada` Already Has

Saat ini `packages/sentra/sentra-nada/src/interop/` sudah menyediakan:

- `mapSymphonyResultToFhirBundle()`
- `mapSymphonyResultToCdsHooksResponse()`

Karakter layer ini saat ini:

- deterministic
- additive
- PHI-aware
- read-only terhadap `SymphonyResult`
- cukup untuk demo dan consumer bridge

### What `packages/sentra/sentra-sandi` Currently Is

`packages/sentra/sentra-sandi` saat ini:

- mendeklarasikan diri sebagai **FHIR R4 validation and transformation layer**
- punya validator minimal untuk `Patient` dan `Observation`
- punya `FhirTransformer` yang masih TODO-heavy
- belum R5-oriented
- belum punya contract yang nyambung langsung ke AADI V2 interop outputs sekarang

Artinya:

- package ini belum layak menjadi destination penuh untuk Phase 2 hari ini
- tapi cukup masuk akal sebagai candidate rumah validation/promotion nanti

---

## Core Decision

### Decision

**Promotion path yang direkomendasikan adalah staged hybrid promotion.**

Artinya:

1. `packages/sentra/sentra-nada/src/interop/` tetap menjadi rumah adapter shape-only saat ini
2. `packages/sentra/sentra-sandi` dipersiapkan sebagai rumah validation/profile/normalization layer berikutnya
3. mapping authority tetap berasal dari `SymphonyResult`, bukan dari `fhir-engine`

### Rejected Alternatives

#### Alternative A — Move everything into `packages/sentra/sentra-sandi` now

Ditolak karena:

- package masih R4-first
- transformer masih TODO-heavy
- akan mencampur promotion dengan cleanup besar sekaligus
- berisiko memindahkan terlalu banyak responsibility sekaligus

#### Alternative B — Keep everything forever inside `packages/sentra/sentra-nada`

Ditolak sebagai end-state karena:

- `SYMPHONY` adalah reasoning engine, bukan interop/validation platform
- terminology/validation layer akan makin berat seiring Phase 2 berkembang
- package boundary akan kabur

---

## Promotion Model

### Layer 1 — Reasoning Authority

Tetap di:

- `packages/sentra/sentra-nada`

Responsibility:

- clinical reasoning
- alerts
- traffic-light
- clinical disposition
- shadow comparison
- canonical `SymphonyResult`

### Layer 2 — Interop Shape Adapter

Tetap dulu di:

- `packages/sentra/sentra-nada/src/interop/`

Responsibility:

- deterministic shape adapters
- no external validation
- no profile enforcement
- no terminology server behavior

### Layer 3 — Validation / Profile / Normalization

Target promotion berikutnya:

- `packages/sentra/sentra-sandi`

Responsibility:

- resource validation
- profile-aware transformation
- version-aware normalization
- later terminology-aware checks

Ini berarti:

- mapping boleh tetap dimulai di `SYMPHONY`
- validation dan promotion logic nanti pindah ke `fhir-engine`

---

## Recommended Promotion Stages

### Stage P0 — Stay In Place

State:

- current state
- adapters tetap di `packages/sentra/sentra-nada/src/interop/`

Allowed work:

- tighten typings
- tighten URI constants
- add PHI-safety assertions
- add deterministic guardrails

Not allowed:

- heavy validation logic
- profile branching
- terminology lookup engine

### Stage P1 — Shared Contract Extraction

Goal:

- extract interop-facing shared helper contracts without moving full adapter ownership

Possible outputs:

- common FHIR-ish type aliases
- internal code system constants
- lightweight mapping utility contracts

Recommended location:

- still inside `packages/sentra/sentra-nada` or `shared-types`

Why:

- minimal churn
- no forced promotion before `fhir-engine` is ready

### Stage P2 — Prepare `packages/sentra/sentra-sandi` for R5-Aware Role

Goal:

- make `packages/sentra/sentra-sandi` promotion-worthy

Required changes before promotion:

1. clarify R4 vs R5 strategy
2. reduce or remove TODO-heavy transformer behavior
3. define target resources explicitly
4. define validation ownership

Expected output:

- `fhir-engine` no longer described as generic R4-only helper
- package has explicit AADI V2 Phase 2 role

### Stage P3 — Partial Promotion

Goal:

- move validation/profile responsibility first, not raw mapping authority

What moves:

- validators
- normalizers
- profile checks
- later terminology-aware validation hooks

What stays in `SYMPHONY`:

- `SymphonyResult -> canonical interop intent`
- reasoning semantics
- internal posture determination

### Stage P4 — Mature Split

End-state target:

- `SYMPHONY` emits canonical reasoning result
- `fhir-engine` validates and normalizes FHIR-facing projections
- consumer apps consume validated outputs without redefining semantics

---

## Promotion Gates

### Gate 1 — Terminology Policy Accepted

Promotion cannot start unless:

- `docs/specs/aadi-v2/009-2026-04-29-aadi-v2-terminology-mapping.md`
  is accepted as policy baseline

### Gate 2 — R5 Direction Locked

Promotion cannot start unless:

- package owner agrees whether `fhir-engine` becomes:
  - R5-primary
  - dual-support
  - or R5-adapter-over-R4-core temporarily

Recommended:

- do **not** attempt dual universal support first
- choose explicit R5-primary trajectory for AADI V2 Phase 2

### Gate 3 — Resource Scope Locked

Promotion cannot start unless the first promoted resource set is bounded.

Recommended first promoted set:

- `Condition`
- `RiskAssessment`
- `DiagnosticReport`
- `Observation`

Not first:

- `Patient`
- `MedicationRequest`
- `DetectedIssue`
- `GuidanceResponse`

### Gate 4 — Validation Role Locked

Promotion cannot start unless we know exactly what `fhir-engine` must do:

- structural validation only
- profile-aware validation
- terminology-aware validation

Recommended first step:

- structural + bounded profile-aware validation only

### Gate 5 — Consumer Need Is Real

Promotion should not happen only because package cleanup feels nice.

Need at least one real consumer requirement such as:

- orchestrator needs validated FHIR bundle handoff
- Dashboard/Assist need profile-stable resource surface
- external integration requires R5-aware validation

---

## What Should Move First

### Move First

1. validation helpers
2. normalization helpers
3. resource profile policy checks
4. later terminology validation hooks

### Do Not Move First

1. `SymphonyResult` semantics
2. diagnosis ranking
3. traffic-light logic
4. alert severity logic
5. shadow comparison logic

If those move, authority drift starts.

---

## Package Ownership Policy

### `packages/sentra/sentra-nada`

Owns:

- reasoning truth
- result truth
- additive interop intent

Does not own:

- full FHIR validation stack
- profile registry
- terminology-service-like behavior

### `packages/sentra/sentra-sandi`

Should own later:

- validation logic
- normalization logic
- profile compatibility logic

Must not own:

- diagnosis truth
- escalation truth
- safety truth

---

## Recommended Path

Rekomendasi saya:

> **Do not promote the adapters yet. Promote the validation role first, later.**

Dalam bahasa praktis:

1. biarkan `packages/sentra/sentra-nada/src/interop/` tetap hidup sebagai adapter deterministic
2. siapkan `packages/sentra/sentra-sandi` supaya layak menerima responsibility validation
3. setelah itu baru lakukan partial promotion

Ini paling aman karena:

- tidak mengganggu demo-capable interop yang sudah ada
- tidak memaksa refactor besar saat `fhir-engine` belum siap
- menjaga authority boundary tetap bersih

---

## Implementation Sequence Recommendation

### Step 1

Accept:

- `Phase 2 Readiness Gate Spec`
- `Terminology Mapping Spec`

### Step 2

Write a focused modernization spec for `packages/sentra/sentra-sandi`:

- R4 -> R5 direction
- which validators stay
- which transformers are real vs placeholder
- what gets removed

### Step 3

Do small prep work in `fhir-engine` only:

- remove obvious TODO ambiguity
- rename docs if needed
- make package role explicit

### Step 4

Only then start partial promotion work.

---

## No-Go Warnings

Stop promotion if:

1. package upgrade starts pulling reasoning helpers into `fhir-engine`
2. adapter behavior diverges from `SymphonyResult`
3. `fhir-engine` tries to become both serializer and clinical policy layer
4. team begins validating concepts that are not yet in the accepted starter terminology set

---

## Verification Gates

If promotion prep touches only docs/spec:

- no runtime verification needed

If promotion prep touches `packages/sentra/sentra-sandi` code:

```bash
pnpm --filter @sentra/sandi test
pnpm --filter @sentra/sandi typecheck
```

If interop adapters in `packages/sentra/sentra-nada` are changed:

```bash
pnpm --filter @sentra/nada test
pnpm --filter @sentra/nada typecheck
```

And always preserve:

- parity suites
- PHI-safety tests
- no `SymphonyResult` drift

---

## Current Verdict

Per 2026-04-29:

> **`packages/sentra/sentra-sandi` is a candidate target, not the current canonical home of AADI V2 interop.**

So:

- immediate full promotion: **NO**
- staged promotion after modernization + policy lock: **YES**

---

## Immediate Next Step

Kalau Chief mau lanjut secara rapi, next artifact sesudah ini adalah:

1. `packages/sentra/sentra-sandi modernization spec`

Itu akan jadi jembatan antara policy Phase 2 dengan perubahan code nyata.

---

## Final Recommendation

Chief sebaiknya mengambil jalur ini:

- keep current adapters in `SYMPHONY`
- modernize `fhir-engine`
- promote validation role first
- never move reasoning authority

Dengan urutan itu, Phase 2 tetap cepat maju tanpa mencampur engine klinis dan engine interoperabilitas menjadi satu.
