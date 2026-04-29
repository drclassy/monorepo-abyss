# AADI V2 CDS Hooks Formalization

**Date:** 2026-04-29  
**Status:** Formalized for internal consumer use  
**Owner:** Codex/Dexton  
**Primary scope:** `packages/symphony/src/interop/`  
**Related docs:**  
- `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`  
- `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`  
- `docs/superpowers/plans/2026-04-29-cds-hooks-formalization-implementation.md`  

---

## Purpose

Dokumen ini memformalkan lane CDS Hooks AADI V2 agar surface yang sebelumnya
berupa adapter stub deterministik sekarang punya contract yang eksplisit,
test-backed, dan aman untuk consumer internal.

Dokumen ini **tidak** mempromosikan CDS Hooks ke `packages/fhir-engine`.

Tujuan utamanya:

- mengunci service definition notes
- mengunci hook context contract
- mengunci prefetch assumptions
- mengunci response invariants
- menjaga workflow semantics tetap tinggal di `packages/symphony`

---

## Best-Practice Notes

1. HL7 CDS Hooks `v2.0.1` tetap current published version.
   Relevance: contract formal harus memikirkan discovery, hook context,
   prefetch, dan cards bersama-sama, bukan hanya response body.
   Source: https://cds-hooks.hl7.org/

2. Optional fields di CDS Hooks sebaiknya di-omit bila belum dipakai.
   Relevance: lane ini sengaja tidak menambah `suggestions`, external `links`,
   atau SMART launch data palsu.
   Source: https://cds-hooks.hl7.org/

3. FHIR Clinical Reasoning memisahkan reasoning dari workflow presentation.
   Relevance: CDS workflow contract boleh dirapikan, tetapi reasoning authority
   tetap di `SYMPHONY`.
   Source: https://www.hl7.org/fhir/clinicalreasoning-module.html

---

## Current Scope

Lane ini hanya memformalkan:

- satu service posture bounded
- satu hook bounded
- deterministic cards
- PHI-safe output

Lane ini belum menambahkan:

- discovery endpoint jaringan
- SMART launch
- action/suggestion payload
- external link registry
- consumer-specific hook branching

---

## Canonical Service Posture

### Hook Scope

Current canonical hook scope:

- `patient-view`

Belum ada hook lain yang dianggap canonical pada lane ini.

### Service Definition

Canonical service identity:

- `id`: `aadiv2-symphony-patient-view`
- `hook`: `patient-view`
- `title`: `AADI V2 Symphony`
- `description`: `Deterministic CDS Hooks card surface for AADI V2 review signals.`

Maknanya:

- service ini bukan diagnosis engine kedua
- service ini adalah workflow-facing projection dari result `SYMPHONY`
- service ini belum menjadi universal CDS layer untuk semua consumer

---

## Hook Context Contract

Current bounded hook context contract:

- `hook`: `patient-view`
- `requiredFields`: none
- `optionalFields`:
  - `patientId`
  - `encounterId`

Interpretasi:

- adapter saat ini tidak bergantung pada context runtime yang besar
- patient/encounter identifiers belum dipantulkan kembali ke response cards
- context tetap dianggap surface workflow, bukan data yang boleh keluar ke card

---

## Prefetch Assumptions

Current bounded prefetch assumptions:

- `patient` → `optional`
- `encounter` → `optional`

Interpretasi:

- lane ini belum mengikat prefetch query shape formal
- consumer boleh menyediakan patient/encounter context,
  tetapi current card emission tidak mengharuskannya
- evolusi ke prefetch contract yang lebih kaya harus diperlakukan sebagai
  lane terpisah

---

## Response Invariants

Canonical response invariants saat ini:

- top-level shape:
  - `{ cards: [...] }`
- source label:
  - `AADI V2 Symphony`
- card order:
  1. critical alert
  2. must-not-miss
  3. top hypothesis
  4. disposition requires review
  5. low shadow agreement
- links policy:
  - `links: []` untuk seluruh card saat ini

### Trigger Rules

Current trigger rules tetap:

- satu critical card per `alert.severity === 'critical'`
- satu must-not-miss card bila ada `nativeHypothesis.category === 'must_not_miss'`
- satu top-hypothesis info card bila top hypothesis ada dan bukan `must_not_miss`
- satu warning card bila `clinicalDisposition === 'requires_review'`
- satu warning card bila `shadowComparison.agreementLevel === 'low'`

### PHI-Safe Invariants

Tidak boleh keluar ke cards:

- `patientRef`
- `encounterId`
- `chiefComplaint`
- free-text narasi klinis dari input patient

---

## Internal Structure After Formalization

Current internal split:

- `cds-hooks-contract.ts`
  - contract types
  - source label
  - prefetch assumptions
  - response invariants
- `cds-hooks-service-definition.ts`
  - service definition helper
  - hook context helper
- `cds-hooks-card-policy.ts`
  - internal card emission policy helpers
- `symphony-to-cds-hooks.ts`
  - public facade

Makna split ini:

- public API tetap kecil
- policy logic bisa diuji tanpa mengubah public shape
- future review untuk promotion bisa menilai bagian mana yang structural vs
  workflow-specific dengan lebih jernih

---

## Non-Goals

Lane ini secara eksplisit **tidak** melakukan:

- promosi ke `packages/fhir-engine`
- formal discovery HTTP endpoint
- SMART launch support
- CDS Hooks `suggestions`
- external `links` population
- hook branching per consumer

---

## Boundary Decision

### What Stays In `packages/symphony`

- `SymphonyResult` interpretation
- card ordering policy
- must-not-miss visibility policy
- review/disposition signaling
- low-agreement shadow signaling
- PHI-safe CDS card shaping

### What Does Not Move To `packages/fhir-engine`

- CDS hook workflow semantics
- service-definition semantics
- card ordering policy
- hook context ownership

Rationale:

- ini bukan resource-family assembly seperti FHIR Bundle
- semantics CDS saat ini terlalu workflow-specific
- promotion prematur akan memindahkan concern ke rumah yang salah

---

## Readiness Verdict

Verdict lane ini:

- `FORMALIZED_BUT_STAYS_IN_SYMPHONY`

Artinya:

- CDS Hooks sekarang cukup formal untuk consumer internal
- tetapi belum siap dipromosikan ke `packages/fhir-engine`
- lane promotion baru boleh dibuka lagi bila ada alasan kuat bahwa sub-surface
  yang tersisa benar-benar structural dan tidak lagi memegang workflow policy

---

## Next Valid Follow-Ups

Follow-up yang sah setelah lane ini:

1. formal CDS discovery transport di consumer/platform layer
2. bounded prefetch schema formalization
3. suggestion/action model discussion bila consumer sudah butuh
4. fresh promotion audit jika di masa depan ada seam structural yang bersih
