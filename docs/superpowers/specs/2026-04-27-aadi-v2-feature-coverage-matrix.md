# AADI V2 Feature Coverage Matrix

**Date:** 2026-04-27  
**Status:** Draft working matrix for sprint execution  
**Owner:** Codex/Dexton  
**Primary source of truth:** `.agent/FEATURE.md`  
**Companion spec:** `docs/superpowers/specs/2026-04-27-aadi-v2-design.md`

---

## Purpose

This document operationalizes the principle:

> **NON EXISTING FEATURE skip is forbidden.**

In practice, that means:

- no clinically relevant existing feature may disappear silently
- no new AADI V2 module may be implemented without mapping the existing
  feature(s) it reuses
- no sprint may close while affected features remain unmapped

`FEATURE.md` remains the master inventory. This matrix is the execution gate
used by Claude and Cursor during sprint work.

---

## How To Use This Matrix

For every feature touched by an AADI V2 sprint, the agent must assign:

1. `Decision`
2. `Target module`
3. `Sprint target`
4. `Proof`
5. `Status`

If any one of those fields is missing for an affected feature, the task is not
done.

---

## Decision Legend

| Decision | Meaning |
|---|---|
| `REUSE_DIRECT` | Use the existing implementation directly |
| `WRAP_AND_REUSE` | Keep the existing implementation, but consume it through a new AADI V2 layer |
| `REPLACE_WITH_PARITY_PROOF` | Replace the implementation only if parity proof is shown |
| `KEEP_IN_ASSIST` | Remains in Assist by architecture, not in SYMPHONY |
| `CONSUMER_ONLY` | Belongs to Dashboard/Assist/consumer layer, not SYMPHONY core |
| `OUT_OF_SCOPE_NOW` | Known feature, intentionally deferred from the current sprint but kept visible |

---

## Status Legend

| Status | Meaning |
|---|---|
| `LOCKED` | Architecturally decided and must be preserved |
| `PLANNED` | Assigned to a future sprint/module |
| `PARTIAL` | Some migration or parity exists, but not final |
| `DONE` | Reuse/migration completed and verified |
| `DEFERRED` | Explicitly delayed, still tracked |
| `BLOCKED` | Cannot proceed without a decision or dependency |

---

## Mandatory Gate Rules

1. If a feature is clinically relevant and not marked `KEEP_IN_ASSIST` or
   `CONSUMER_ONLY`, it must have a reuse path into AADI V2.
2. `REPLACE_WITH_PARITY_PROOF` is invalid without:
   - code proof
   - test proof
   - parity or equivalent regression proof
3. A sprint is not complete if any feature targeted by that sprint is still
   `unmapped`.
4. Existing parity suites remain mandatory:
   - `runSymphonyParityFixtures()`
   - `runAssistPatternParityFixtures()`
5. If a feature is intentionally skipped for a sprint, mark it `DEFERRED` with
   an explicit next sprint target. Silent skip is forbidden.

---

## Proof Types

Use one or more of the following in the `Proof` column:

- `code:` concrete file path where reuse happens
- `test:` concrete test file or command
- `parity:` parity suite or fixture name
- `spec:` design/spec reference if not yet implemented

Example:

`code: packages/symphony/src/engine/clinical-facts.ts; test: packages/symphony/src/__tests__/clinical-facts.test.ts; parity: runAssistPatternParityFixtures()`

---

## Section A — Canonical SYMPHONY Foundation

These are existing `SYMPHONY` assets that AADI V2 must build on top of.

| Feature group | Current location | AADI V2 role | Decision | Target module | Sprint | Proof | Status |
|---|---|---|---|---|---|---|---|
| Assessment orchestrator | `packages/symphony/src/engine/assess.ts` | Canonical entrypoint for AADI V2 orchestration | `WRAP_AND_REUSE` | `packages/symphony/src/engine/assess.ts` | Sprint 2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Shared SYMPHONY contracts | `packages/shared-types/src/symphony.ts` | Public contract surface for all new AADI V2 outputs | `WRAP_AND_REUSE` | `packages/shared-types/src/symphony.ts` | Sprint 2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| NEWS2 | `packages/symphony/src/engine/news2.ts` | Safety input, severity input, explanation input | `REUSE_DIRECT` | `clinical-facts.ts`, `confidence-engine.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Vital alerts | `packages/symphony/src/engine/vital-alerts.ts` | Hard bedside alert source | `REUSE_DIRECT` | `assess.ts`, `safety arbiter` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Screening gates | `packages/symphony/src/engine/screening-gates.ts` | Deterministic immediate risk screen | `REUSE_DIRECT` | `clinical-facts.ts`, `assess.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Symptom NLP Indonesia | `packages/symphony/src/engine/symptom-signals.ts` | Primary symptom signal feed into `ClinicalFacts` | `REUSE_DIRECT` | `clinical-facts.ts` | Sprint 1 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Pattern engine | `packages/symphony/src/engine/pattern-engine.ts` | Deterministic evaluator for patterns and future diagnosis-pack criteria | `REUSE_DIRECT` | `diagnosis-packs.ts`, `native-differential.ts` | Sprint 1 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| 70 clinical patterns | `packages/symphony/src/engine/clinical-patterns.ts`, `packages/symphony/src/engine/clinical-patterns-definitions.ts` | Existing disease-pattern evidence and must-not-miss source | `WRAP_AND_REUSE` | `clinical-facts.ts`, `reasoning-arbiter.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| PE suspect gate | `packages/symphony/src/engine/pe-suspect.ts` | Specialized embolic-risk detector and must-not-miss signal | `REUSE_DIRECT` | `clinical-facts.ts`, `safety arbiter` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Anaphylaxis gate | `packages/symphony/src/engine/anaphylaxis.ts` | Specialized allergy emergency detector and action trigger | `REUSE_DIRECT` | `clinical-facts.ts`, `safety arbiter` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Early warning patterns | `packages/symphony/src/engine/early-warning.ts` | Disease-specific warning evidence | `REUSE_DIRECT` | `clinical-facts.ts`, `reasoning-arbiter.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Composite deterioration | `packages/symphony/src/engine/composite-deterioration.ts` | Multi-signal deterioration evidence and acute syndrome source | `REUSE_DIRECT` | `clinical-facts.ts`, `reasoning-arbiter.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Trajectory analyzer | `packages/symphony/src/engine/trajectory.ts` | Temporal reasoning and deterioration narrative source | `REUSE_DIRECT` | `clinical-facts.ts`, `explainability.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Personal baseline | `packages/symphony/src/engine/trajectory.ts` | Baseline-aware context for risk and differential weighting | `REUSE_DIRECT` | `clinical-facts.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Momentum engine | `packages/symphony/src/engine/trajectory.ts` | Dynamic change signal for urgency and explanation | `REUSE_DIRECT` | `clinical-facts.ts`, `explainability.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Prediction / time-to-critical | `packages/symphony/src/engine/trajectory.ts` | Predictive urgency and reasoning context | `REUSE_DIRECT` | `reasoning-arbiter.ts`, `explainability.ts` | Sprint 2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Treatment response detection | `packages/symphony/src/engine/trajectory.ts` | Interpretation of improvement / failure to improve | `REUSE_DIRECT` | `clinical-facts.ts`, `reasoning-arbiter.ts` | Sprint 2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| HTN classifier | `packages/symphony/src/engine/classifiers.ts` | Canonical HTN severity / urgency fact source | `REUSE_DIRECT` | `clinical-facts.ts` | Sprint 1 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Glucose classifier | `packages/symphony/src/engine/classifiers.ts` | Canonical DKA/HHS / hypoglycemia / hyperglycemia fact source | `REUSE_DIRECT` | `clinical-facts.ts` | Sprint 1 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Chronic disease classifier | `packages/symphony/src/engine/classifiers.ts` | Canonical chronic-context derivation | `REUSE_DIRECT` | `clinical-facts.ts`, `reasoning-arbiter.ts` | Sprint 1-2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| AVPU/GCS helpers | `packages/symphony/src/engine/classifiers.ts` | Consciousness severity and NEWS2 support | `REUSE_DIRECT` | `clinical-facts.ts` | Sprint 1 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Action protocols | `packages/symphony/src/engine/action-protocols.ts` | Canonical ABCDE guidance output attached to alerts | `REUSE_DIRECT` | `reasoning-arbiter.ts`, `assess.ts` | Sprint 2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Traffic-light safety gate | `packages/symphony/src/engine/traffic-light.ts` | Final escalation authority inside SYMPHONY | `REUSE_DIRECT` | `assess.ts`, `safety arbiter` | Sprint 2 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Hybrid decisioning | `packages/symphony/src/engine/hybrid-decisioning.ts` | Transitional fallback and shadow-comparison path | `WRAP_AND_REUSE` | `shadow-compare.ts`, `assess.ts` | Sprint 2-3 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| SYMPHONY parity fixtures | `packages/symphony/src/engine/parity-fixtures.ts` | Historical no-regression gate | `REUSE_DIRECT` | verification pipeline | Sprint 3 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |
| Assist pattern parity fixtures | `packages/symphony/src/adapters/assist-patterns-parity.ts` | Assist-origin no-regression gate | `REUSE_DIRECT` | verification pipeline | Sprint 3 | `spec: 2026-04-27-aadi-v2-design.md` | `LOCKED` |

---

## Section B — Dashboard-Origin Features That Must Feed AADI V2

These are not all inside `packages/symphony` yet, but they are existing product
features that must be honored when AADI V2 is implemented.

| Feature group | Current source | AADI V2 expectation | Decision | Target module | Sprint | Proof | Status |
|---|---|---|---|---|---|---|---|
| CDSS Engine V2 orchestration | `.agent/FEATURE.md` section 1.1 | Keep as consumer/orchestration context, but native core authority shifts into SYMPHONY | `CONSUMER_ONLY` | Dashboard integration layer | Sprint 4 | `spec: FEATURE.md` | `PLANNED` |
| Knowledge base context builder | `.agent/FEATURE.md` section 1.1 | May remain consumer-side retrieval/context helper, but cannot become final reasoning authority | `CONSUMER_ONLY` | Dashboard bridge | Sprint 4 | `spec: FEATURE.md` | `PLANNED` |
| Learning loop / quality metrics | `.agent/FEATURE.md:1116` | Preserve as downstream observability and feedback surface | `CONSUMER_ONLY` | Dashboard/observability | Sprint 4 | `spec: FEATURE.md` | `PLANNED` |
| Emergency override layer | `.agent/FEATURE.md:1130` | Keep working at host/UI layer; AADI V2 must continue emitting signals needed to trigger it | `CONSUMER_ONLY` | Dashboard UI bridge | Sprint 4 | `spec: FEATURE.md` | `LOCKED` |
| Intelligence layer (Socket.IO / Langfuse / Sentry) | `.agent/FEATURE.md:1129` | Preserve as infrastructure around SYMPHONY outputs | `CONSUMER_ONLY` | Dashboard instrumentation | Sprint 4 | `spec: FEATURE.md` | `PLANNED` |
| EMR visualization / chart layer | `.agent/FEATURE.md` sections 1.7, 1.11 | Continue consuming AADI V2 outputs, not replaced by core logic work | `CONSUMER_ONLY` | Dashboard UI bridge | Sprint 4 | `spec: FEATURE.md` | `PLANNED` |

---

## Section C — Assist-Origin Features That Must Migrate or Be Represented

These are the most important “do not skip” items from `FEATURE.md` section 3.2.

| Feature group | Assist source | AADI V2 treatment | Decision | Target module | Sprint | Proof | Status |
|---|---|---|---|---|---|---|---|
| 70 Clinical Patterns GATE v2 | `lib/emergency-detector/clinical-patterns.ts` | Use existing SYMPHONY parity + native pattern consumption | `WRAP_AND_REUSE` | `clinical-patterns.ts`, `reasoning-arbiter.ts` | Sprint 1-2 | `parity: runAssistPatternParityFixtures()` | `PARTIAL` |
| 11 Clinical Gate IDs | `lib/emergency-detector/gate-registry.ts` | Must be represented in canonical gate semantics and alert mapping | `REPLACE_WITH_PARITY_PROOF` | `shared-types/src/symphony.ts`, `screening-gates.ts`, `clinical-patterns.ts` | Sprint 2 | `spec: FEATURE.md` | `PLANNED` |
| 9 ABCDE Action Protocols | `lib/emergency-detector/action-protocols.ts` | Must surface through existing SYMPHONY action protocol registry | `WRAP_AND_REUSE` | `action-protocols.ts`, `assess.ts` | Sprint 2 | `code: packages/symphony/src/engine/action-protocols.ts` | `PARTIAL` |
| Symptom NLP Indonesia | `lib/emergency-detector/symptom-signals.ts` | Use current SYMPHONY implementation as fact feeder | `WRAP_AND_REUSE` | `clinical-facts.ts` | Sprint 1 | `code: packages/symphony/src/engine/symptom-signals.ts` | `PARTIAL` |
| Pattern engine evaluator | `lib/emergency-detector/pattern-engine.ts` | Use current SYMPHONY implementation as deterministic rule engine | `WRAP_AND_REUSE` | `diagnosis-packs.ts`, `native-differential.ts` | Sprint 1 | `code: packages/symphony/src/engine/pattern-engine.ts` | `PARTIAL` |
| Dosage database FKTP | `lib/clinical/dosage-database.ts` | Migrate as reference asset, not SYMPHONY core logic | `OUT_OF_SCOPE_NOW` | `packages/clinical-references` | Sprint 4+ | `spec: ADR 0007` | `DEFERRED` |
| DDI checker 173K | `lib/iskandar-diagnosis-engine/ddi-checker.ts` | Migrate as reference layer feeding traffic-light and medication reasoning | `WRAP_AND_REUSE` | `packages/clinical-references` | Sprint 3-4 | `code: packages/clinical-references` | `PARTIAL` |
| Epidemiology priors | `lib/iskandar-diagnosis-engine/epidemiology-weights.ts` | Optional deterministic prior input into native differential | `OUT_OF_SCOPE_NOW` | `packages/clinical-references` | Sprint 4+ | `spec: ADR 0007` | `DEFERRED` |
| Pharmacotherapy reasoner | `lib/iskandar-diagnosis-engine/pharmacotherapy-reasoner.ts` | Reference-heavy downstream recommendation layer, not core diagnosis spine | `OUT_OF_SCOPE_NOW` | `packages/clinical-references` | Sprint 4+ | `spec: ADR 0007` | `DEFERRED` |
| Traffic-light safety gate | `lib/iskandar-diagnosis-engine/traffic-light.ts` | Use canonical SYMPHONY traffic-light, not parallel Assist logic | `REPLACE_WITH_PARITY_PROOF` | `packages/symphony/src/engine/traffic-light.ts` | Sprint 2-3 | `parity: runSymphonyParityFixtures()` | `PARTIAL` |
| Age-based vital screening | `lib/clinical/vital-screening-thresholds.ts` | Preserve pediatric / age-sensitive coverage through current screening/classifier path; expand if missing | `REPLACE_WITH_PARITY_PROOF` | `screening-gates.ts`, `classifiers.ts` | Sprint 2 | `spec: FEATURE.md` | `PLANNED` |
| TTV inference | `lib/emergency-detector/ttv-inference.ts` | Not part of core diagnostic authority; evaluate later as consumer or helper | `OUT_OF_SCOPE_NOW` | consumer-side support | Sprint 4+ | `spec: FEATURE.md` | `DEFERRED` |

---

## Section D — Features That Must Remain in Assist

These features are not skipped. They are intentionally retained in Assist.

| Feature group | Current source | Why not in SYMPHONY | Decision | AADI V2 dependency | Status |
|---|---|---|---|---|---|
| Anonymizer PII strip | `lib/iskandar-diagnosis-engine/anonymizer.ts` | Client-side PHI/PII protection before API calls | `KEEP_IN_ASSIST` | AADI V2 consumer contract must remain anonymizer-compatible | `LOCKED` |
| RME scraper | `lib/rme/`, `lib/scraper/` | Browser DOM concern, not server/core logic | `KEEP_IN_ASSIST` | Must continue feeding clean structured input to AADI V2 | `LOCKED` |
| Doctor Picker + Forward | Assist sidepanel flow | UX flow, not core reasoning | `KEEP_IN_ASSIST` | Must accept richer AADI V2 outputs | `LOCKED` |
| TTV input form | Assist sidepanel UI | Host-side entry UX, not reasoning core | `KEEP_IN_ASSIST` | Must continue producing valid `SymphonyAssessmentInput` | `LOCKED` |
| Local engine V1 | Assist offline fallback | Offline-only fallback, frozen | `KEEP_IN_ASSIST` | May stay as emergency/offline fallback outside AADI V2 core | `LOCKED` |
| Background service worker | `entrypoints/background.ts` | Browser extension infrastructure | `KEEP_IN_ASSIST` | None | `LOCKED` |
| Content script | `entrypoints/content.ts` | Browser extension DOM injection | `KEEP_IN_ASSIST` | None | `LOCKED` |

---

## Section E — Consumer/UI Features That Must Not Be Lost

These do not belong in `SYMPHONY`, but AADI V2 output design must not make them
impossible to support.

| Feature group | Current source | Required compatibility expectation | Decision | Status |
|---|---|---|---|---|
| Clinical differential UI | Assist / Dashboard components | AADI V2 must still provide ranked hypotheses and reasoning suitable for list/card rendering | `CONSUMER_ONLY` | `PLANNED` |
| Clinical alerts UI | Assist / Dashboard components | AADI V2 must preserve alert severity, titles, reasoning, and action guidance | `CONSUMER_ONLY` | `PLANNED` |
| HTN crisis triage UI | Assist component | AADI V2 must preserve classifier-backed crisis semantics | `CONSUMER_ONLY` | `PLANNED` |
| Hypoglycemia 15-15 timer | Assist component | AADI V2 must emit enough context for downstream UI guidance when relevant | `CONSUMER_ONLY` | `DEFERRED` |
| BP measurement wizard | Assist component | No core migration required, but input expectations must remain compatible | `CONSUMER_ONLY` | `DEFERRED` |
| Resep form / medication workflow | Assist component | Future medication reasoning must remain consumable by prescription UI | `CONSUMER_ONLY` | `DEFERRED` |
| Dashboard EMR intelligence UI | Dashboard pages and charts | AADI V2 must preserve trajectory, alert, and risk semantics needed by visualization | `CONSUMER_ONLY` | `PLANNED` |

---

## Section F — Critical Gaps That Must Stay Visible

These are known unfinished items from `FEATURE.md` Bagian 4 and must remain on
the board even if not all enter the next sprint.

| Feature gap | Current note | AADI V2 relation | Decision | Sprint | Status |
|---|---|---|---|---|---|
| Emergency override layer | Done in Dashboard | Preserve signal compatibility | `CONSUMER_ONLY` | Sprint 4 | `LOCKED` |
| Platform thin client route replacement | Base client done, route replacement pending | Important for real consumer adoption | `CONSUMER_ONLY` | Sprint 4 | `PLANNED` |
| Aortic dissection pattern | Known clinical gap | Candidate future diagnosis pack / pattern extension | `OUT_OF_SCOPE_NOW` | Sprint 4+ | `DEFERRED` |
| Quality dashboard UI | Backend exists, UI pending | Important for demo/ops but not core reasoning spine | `CONSUMER_ONLY` | Sprint 4 | `PLANNED` |

---

## Sprint Coverage Checklist

This checklist must be copied into every implementation plan and sprint closeout.

### Before Starting a Sprint

- [ ] Identify all affected features from `.agent/FEATURE.md`
- [ ] Map each affected feature in this matrix
- [ ] Assign `Decision`, `Target module`, `Sprint`, `Status`
- [ ] Confirm no clinically relevant feature is left unmapped

### Before Closing a Sprint

- [ ] All targeted features have `Proof`
- [ ] No targeted feature remains silent/unmapped
- [ ] Existing SYMPHONY tests still pass
- [ ] `runSymphonyParityFixtures()` still passes
- [ ] `runAssistPatternParityFixtures()` still passes
- [ ] New AADI V2 tests pass
- [ ] Deferred features are explicitly carried forward to the next sprint

---

## Practical Rule for Claude and Cursor

When implementing any AADI V2 task:

1. open `.agent/FEATURE.md`
2. locate the affected feature group
3. update this matrix first if the mapping is incomplete
4. only then write or change code

If code changes land without a matching matrix update, the work is incomplete.

---

## Sprint 1 Execution Proof (rolling)

Each entry below upgrades the row's `Proof` from `spec:` to concrete `code:` and
`test:` evidence as work lands. Reuse confirmation lives here so individual
table rows do not need rewriting per commit.

### Task 1 — `feat(symphony): add AADI V2 shared contracts` (commit `31b0ab7`)

| Section A row | Concrete proof |
|---|---|
| Shared SYMPHONY contracts | `code: packages/shared-types/src/symphony.ts (v0.7.0)`; `test: packages/symphony/src/__tests__/contract.test.ts` |

Notes:
- Added 5 additive types: `SymphonyClinicalDisposition`, `SymphonyClinicalFact`,
  `SymphonyReasoningEvidence`, `SymphonyDiagnosticHypothesis`,
  `SymphonyShadowComparison`.
- Extended `SymphonyResult` with 4 optional fields. No existing field removed
  or renamed. Status remains `LOCKED`.

### Task 2 — `feat(symphony): add AADI V2 clinical facts builder` (this commit)

All reuse happens inside `packages/symphony/src/engine/clinical-facts.ts` via
`buildSymphonyClinicalFacts()`. The builder is verified by
`packages/symphony/src/__tests__/clinical-facts.test.ts` and full parity suite
(`runSymphonyParityFixtures()`, `runAssistPatternParityFixtures()`,
`clinical-patterns.parity.test.ts`).

| Section A row | Concrete proof |
|---|---|
| NEWS2 | `code: clinical-facts.ts → calculateSymphonyNEWS2()`; `test: clinical-facts.test.ts` |
| Screening gates | `code: clinical-facts.ts → evaluateSymphonyInstantScreeningGates()`; `test: clinical-facts.test.ts` |
| Symptom NLP Indonesia | `code: clinical-facts.ts → detectSymphonySymptomSignals()`; `test: clinical-facts.test.ts` |
| 70 clinical patterns | `code: clinical-facts.ts → evaluateClinicalPatterns()`; `test: clinical-facts.test.ts` |
| PE suspect gate | `code: clinical-facts.ts → detectSymphonyPeSuspect()`; `test: clinical-facts.test.ts` |
| Anaphylaxis gate | `code: clinical-facts.ts → detectSymphonyAnaphylaxis()`; `test: clinical-facts.test.ts` |
| Early warning patterns | `code: clinical-facts.ts → detectSymphonyEarlyWarningPatterns()`; `test: clinical-facts.test.ts` |
| Composite deterioration | `code: clinical-facts.ts → evaluateSymphonyCompositeDeterioration()`; `test: clinical-facts.test.ts` |
| Trajectory analyzer | `code: clinical-facts.ts → analyzeSymphonyTrajectory()`; `test: clinical-facts.test.ts` |
| Momentum engine | `code: clinical-facts.ts → trajectoryMomentumFromAnalysis()`; `test: clinical-facts.test.ts` |
| HTN classifier | `code: clinical-facts.ts → classifySymphonyHypertension(), getSymphonyHypertensionSeverity(), finalizeSymphonyBloodPressure()`; `test: clinical-facts.test.ts` |
| Glucose classifier | `code: clinical-facts.ts → classifySymphonyBloodGlucose()`; `test: clinical-facts.test.ts` |
| Chronic disease classifier | `code: clinical-facts.ts → classifySymphonyChronicDisease()`; `test: clinical-facts.test.ts` |

| Section C row | Concrete proof |
|---|---|
| Symptom NLP Indonesia (Assist-origin) | Reused via SYMPHONY parity path; `parity: runAssistPatternParityFixtures()` green |
| Pattern engine evaluator (Assist-origin) | Reused via SYMPHONY pattern engine; `parity: runAssistPatternParityFixtures()` green |
| 70 Clinical Patterns GATE v2 (Assist-origin) | Reused via SYMPHONY clinical-patterns; `parity: runAssistPatternParityFixtures()` green |

### Task 3 — `feat(symphony): add AADI V2 syndrome classifier` (this commit)

Sprint 1 finale. Adds deterministic `classifySymphonySyndromes()` in
`packages/symphony/src/engine/syndrome-classifier.ts`, consuming
`SymphonyClinicalFact[]` produced by Task 2. Initial taxonomy is restricted to
canonical Phase 1 families per Chief constraint (no expansion to neurologic /
allergy / maternal-fetal yet — those land with Sprint 2 packs and arbiter).

| Section A / B row | Concrete proof |
|---|---|
| Syndrome taxonomy (Phase 1 canonical) | `code: syndrome-classifier.ts → classifySymphonySyndromes()`; `test: syndrome-classifier.test.ts` |
| Clinical-fact → syndrome mapping (deterministic) | `code: syndrome-classifier.ts → hasFact() predicate gates`; `test: syndrome-classifier.test.ts (5 cases)` |

Taxonomy emitted (closed union `SymphonySyndromeId`):

- `acute_febrile_syndrome` — fact `symptom_fever === true`
- `acute_respiratory_syndrome` — facts `symptom_fever === true && symptom_dyspnea === true`
- `acute_cardiometabolic_syndrome` — fact `htn_severity ∈ {stage2, crisis}`

Notes:
- No Indonesia diagnosis pack wiring in this task — packs (`pack-pneumonia`,
  `pack-sepsis`, `pack-htn-crisis`) land in Task 4 differential engine.
- Local `toAvpu()` bridge in `clinical-facts.ts` remains explicitly temporary.
  Canonical AVPU/GCS helper deepening still deferred to Task 5 arbiter.
- Output is deterministic: identical fact array yields identical match array
  (verified by test case "produces deterministic output").

### Task 4 — `feat(symphony): add AADI V2 diagnosis packs and native differential` (this commit)

Sprint 2 opener. Introduces canonical Phase 1 diagnosis packs and a
deterministic native differential engine that consumes `SymphonyClinicalFact[]`
and `SymphonySyndromeMatch[]` from Tasks 2–3 to produce
`SymphonyDiagnosticHypothesis[]`. No replacement of `diagnosisSuggestions`
output — additive only per Chief constraint.

| Section A / B row | Concrete proof |
|---|---|
| Native differential engine (no external candidate dependency) | `code: native-differential.ts → buildSymphonyNativeDifferential()`; `test: native-differential.test.ts (8 cases)` |
| Phase 1 diagnosis pack registry | `code: diagnosis-packs.ts → getSymphonyDiagnosisPacks()`; `test: native-differential.test.ts (canonical-set, no Indonesia packs)` |
| Evidence shape (supports/weakens/missing/nextBestQuestions) | `code: native-differential.ts → buildSymphonyNativeDifferential()`; `test: native-differential.test.ts (full evidence shape case)` |
| Must-not-miss support | `code: diagnosis-packs.ts (mustNotMiss flag)`, `native-differential.ts (categorize threshold 0.45)`; `test: native-differential.test.ts (sepsis must_not_miss, htn-crisis must_not_miss)` |

Packs implemented (closed `pack-*` ID union):

- `pack-pneumonia` → `J18.9` Pneumonia, family `acute_respiratory_syndrome`,
  supportKeys `[symptom_fever, symptom_dyspnea, news2_risk]`, mustNotMiss=false.
- `pack-sepsis` → `A41.9` Sepsis, family `acute_febrile_syndrome`,
  supportKeys `[symptom_fever, screening_gate_count, trajectory_direction]`,
  mustNotMiss=true.
- `pack-htn-crisis` → `I10` Hypertensive crisis context, family
  `acute_cardiometabolic_syndrome`, supportKeys
  `[htn_severity, trajectory_direction]`, mustNotMiss=true.

Confidence calibration (no high-confidence default):

- `rawScore = 0.35 + supports * 0.16 - weakens * 0.08`
- Capped to `[0, 0.95]` — single full-support pack maxes out at ~0.83.
- Category derivation: `must_not_miss` if `pack.mustNotMiss && conf ≥ 0.45`,
  else `working` ≥ 0.58, else `review` ≥ 0.33, else `deferred`.

Notes:

- No Indonesia-specific packs (no dengue / TB / preeclampsia) per constraint.
- Syndrome taxonomy not expanded — packs filter by Task 3 closed union.
- Output deterministic and additive: existing `diagnosisSuggestions` flow is
  untouched; native hypotheses are produced as separate `SymphonyResult`
  field for downstream arbiter (Task 5).
- Empty `syndromes[]` produces empty `hypotheses[]` (no fallback inflation).

### Task 5 — `feat(symphony): add AADI V2 reasoning arbiter with safety dominance` (this commit)

Sprint 2 mid-task. Adds deterministic `arbitrateSymphonyReasoning()` in
`packages/symphony/src/engine/reasoning-arbiter.ts` reconciling
`SymphonyDiagnosticHypothesis[]` (Task 4) with existing safety alerts and
protocols. Arbiter is **additive only** per Chief constraint #6 — never
recomputes traffic-light, never downgrades severity, never strips action
protocol references.

| Section A / B row | Concrete proof |
|---|---|
| Safety dominance over native reasoning | `code: reasoning-arbiter.ts → arbitrateSymphonyReasoning()`; `test: reasoning-arbiter.test.ts (canonical case + rule A + severity preservation)` |
| Action protocol semantic preservation | `code: reasoning-arbiter.ts (alerts deep-copy preserves actionProtocolId)`; `test: reasoning-arbiter.test.ts (action protocol pass-through across multiple alerts)` |
| Native must-not-miss visibility | `code: reasoning-arbiter.ts (rule B + rank preservation)`; `test: reasoning-arbiter.test.ts (rule B isolation + rank preservation)` |
| Personal baseline consumption | `code: reasoning-arbiter.ts (rule E)`; `test: reasoning-arbiter.test.ts (rule E thin baseline)` — reuses `SymphonyPersonalBaseline` from `engine/trajectory.ts` |
| Treatment response consumption | `code: reasoning-arbiter.ts (rule D)`; `test: reasoning-arbiter.test.ts (rule D worsening)` — reuses `SymphonyTreatmentResponse` from `engine/trajectory.ts` |
| Canonical AVPU/GCS helper reuse | `code: reasoning-arbiter.ts (rule C → assessSymphonyConsciousnessSeverity)`; `test: reasoning-arbiter.test.ts (rule C consciousness=pain)` |

Five deterministic arbitration rules (OR-combined into `requiresReview`):

- **A** `safety_critical_alert_present` — any `alert.severity === 'critical'`
- **B** `native_must_not_miss_visible` — any hypothesis with
  `category === 'must_not_miss'`
- **C** `consciousness_compromised` — `latestVitals.consciousness` mapped
  to AVPU and resolved via `assessSymphonyConsciousnessSeverity()` to
  `'severe'` or `'unresponsive'`
- **D** `treatment_response_worsening` —
  `treatmentResponse.interpretation === 'worsening'`
- **E** `baseline_thin_with_working_hypothesis` —
  `personalBaseline.visitCount < 2` AND any `working` hypothesis present

Safety dominance enforcement:

- Critical alerts copied through unchanged (severity, `actionProtocolId`,
  `actionProtocol`, `triggeredAt`, `reasoning[]` all preserved).
- Native hypothesis rank order from Task 4 differential preserved.
- Empty input → `requiresReview = false` and empty arrays — no
  high-confidence default behavior.
- Output shape: `{ nativeHypotheses, alerts, requiresReview, arbitrationReasons }`.

Notes:

- Traffic-light authority remains in `engine/traffic-light.ts` per Chief
  constraint #5; arbiter does NOT call `classifySymphonyTrafficLight()`.
- `hybridSuggestions` accepted in input but not transformed in this task;
  Task 7 will wire reconciliation at `assess.ts` level.
- 11 test cases verify rules in isolation, action protocol pass-through,
  rank preservation, severity preservation, empty-input safety, determinism.

### Task 6 — `feat(symphony): add AADI V2 explainability and clinical disposition` (this commit)

Sprint 2 explainability layer. Adds two pure deterministic engines:
`composeSymphonyExplainability()` in
`packages/symphony/src/engine/explainability.ts` (clinician-readable
narrative lines) and `determineSymphonyClinicalDisposition()` in
`packages/symphony/src/engine/confidence-engine.ts` (clinical
disposition status). Both engines are **evidence-backed only** — no
fabrication, no LLM call, no invented certainty per Chief constraint #1.

| Section A / B row | Concrete proof |
|---|---|
| Per-diagnosis rationale (supports / weakens / missing / NBQ) | `code: explainability.ts → composeSymphonyExplainability()`; `test: confidence-engine.test.ts (10 explainability cases)` |
| Arbiter narrative surfacing (constraint #2) | `code: explainability.ts (ARBITER_REASON_NARRATIVE map + describeReasons)`; `test: confidence-engine.test.ts (arbitration reasons honestly surfaced)` |
| Clinical disposition (separate from engine status, constraint #3) | `code: confidence-engine.ts → determineSymphonyClinicalDisposition()`; `test: confidence-engine.test.ts (5 disposition rule cases)` |
| Evidence-backed only / no fabrication | `code: explainability.ts (all lines derived from input fields, "tidak ada" fallback only)`; `test: confidence-engine.test.ts (no fabrication empty-input case)` |

Explainability fields produced (deterministic order):

1. `Diagnosis utama saat ini: ${topDiagnosisName}.`
2. `Faktor pendukung: ${supportKeys.join(', ')}` or `tidak ada`
3. `Faktor pelemah: ...` (optional — only if `weakenKeys` non-empty)
4. `Data yang masih dibutuhkan: ${missingKeys.join(', ')}` or `tidak ada`
5. `Pertanyaan klinis lanjutan: ...` (optional — only if `nextBestQuestions` non-empty)
6. `Catatan arbiter: ...` (optional — only if `arbitrationReasons` non-empty;
   each key translated via `ARBITER_REASON_NARRATIVE` map covering all 5
   Task 5 narrative keys)

Clinical disposition rules (precedence top-to-bottom):

1. `usedFallback === true` → `'degraded'`
2. `nativeHypothesisCount === 0` → `'insufficient_data'`
3. `hasCriticalAlert === true` OR `arbiterRequiresReview === true` →
   `'requires_review'`
4. else → `'ok'`

Notes:

- `SymphonyClinicalDisposition` type stays distinct from
  `SymphonyEngineStatus` per Chief constraint #3 (operational status vs
  clinical posture remain decoupled).
- No safety alert mutation — explainability returns `string[]` and
  disposition returns string union; neither touches `SymphonyAlert[]`.
- `diagnosisSuggestions` flow untouched per Chief constraint #6.
- Output shape is plain `string[]` and `SymphonyClinicalDisposition` —
  Task 7 can wire directly into `SymphonyResult.clinicalDisposition` and
  `SymphonyDiagnosticHypothesis.evidence` slot without further adapters.
- 17 test cases verify all 4 disposition rule branches, all 6 line
  emission paths (including non-emission of optional lines), arbiter
  narrative translation, determinism, and no-fabrication contract.

### Task 7 — `feat(symphony): wire AADI V2 native pipeline into assess.ts` (this commit)

Sprint 2 closer. Wires the full AADI V2 native diagnostic pipeline into
`packages/symphony/src/engine/assess.ts` **additively** — without
introducing any feature flag and without altering existing safety stack
semantics. Per Chief Task 7 corrections: no `featureFlags.aadiv2` rollout
mechanism, only existing canonical surfaces consumed.

| Section A / B row | Concrete proof |
|---|---|
| Assessment orchestrator (Section A row "Assessment orchestrator") | `code: assess.ts (try/catch around AADI V2 stage, additive integration after alertsBeforeTrafficLight)`; `test: aadi-v2.integration.test.ts (10 cases)` |
| Clinical facts builder reuse | `code: assess.ts → buildSymphonyClinicalFacts(input)` |
| Syndrome classifier reuse | `code: assess.ts → classifySymphonySyndromes(clinicalFactsResult.facts)` |
| Diagnosis packs reuse | `code: assess.ts → getSymphonyDiagnosisPacks()` |
| Native differential reuse | `code: assess.ts → buildSymphonyNativeDifferential({facts, syndromes, packs})` |
| Personal baseline reuse (Section A row "Trajectory and momentum") | `code: assess.ts → buildSymphonyPersonalBaseline(input.vitals, input.metadata.requestedAt)` |
| Treatment response reuse (Section A row "Treatment response detection") | `code: assess.ts → detectSymphonyTreatmentResponse(trajectoryAnalysis.momentum.params)` |
| Reasoning arbiter reuse | `code: assess.ts → arbitrateSymphonyReasoning({nativeHypotheses, hybridSuggestions, alerts, personalBaseline, treatmentResponse, latestVitals})` |
| Explainability into `metadata.rationale` | `code: assess.ts (composeSymphonyExplainability output spread into rationale)`; `test: aadi-v2.integration.test.ts (rationale contains "Diagnosis utama")` |
| Disposition into `clinicalDisposition` | `code: assess.ts → determineSymphonyClinicalDisposition(...)`; `test: aadi-v2.integration.test.ts (insufficient_data + requires_review cases)` |
| Hybrid decisioning preserved as compatibility path | `code: assess.ts (hybridDecisioning.suggestions still drives diagnosisSuggestions, also passed to arbiter as hybridSuggestions input)`; `test: aadi-v2.integration.test.ts (diagnosisSuggestions compatibility flow)` |
| Safety dominance preserved (alerts, trafficLight, trajectory unchanged) | `code: assess.ts (alertsBeforeTrafficLight unchanged, traffic-light gating logic unchanged)`; `test: aadi-v2.integration.test.ts (alert severity preserved through arbiter)` |
| AADI V2 telemetry audit hints | `code: assess.ts (clinical_facts_count, native_hypothesis_count, clinical_disposition, arbiter_requires_review, aadiv2_pipeline_failed)`; `test: aadi-v2.integration.test.ts (audit hints case)` |
| Failure-safe degraded fallback | `code: assess.ts (try/catch sets clinicalDisposition='degraded' and pushes 'aadiv2_pipeline_failure' safety flag)` |

assess.ts final flow (post-Task 7):

1. Existing safety stack — NEWS2, vital alerts, screening gates,
   composite, PE suspect, anaphylaxis, trajectory, early warnings,
   patterns, hybrid decisioning, alert aggregation. **Unchanged.**
2. AADI V2 native stage (try/catch wrapped):
   - `buildSymphonyClinicalFacts(input)` →
     `classifySymphonySyndromes(facts)` →
     `getSymphonyDiagnosisPacks()` →
     `buildSymphonyNativeDifferential({facts, syndromes, packs})`
   - `buildSymphonyPersonalBaseline(vitals, requestedAt)` +
     `detectSymphonyTreatmentResponse(trajectory.momentum.params)`
   - `arbitrateSymphonyReasoning({nativeHypotheses, hybridSuggestions:
     hybridDecisioning.suggestions, alerts: alertsBeforeTrafficLight,
     personalBaseline, treatmentResponse, latestVitals})`
   - `composeSymphonyExplainability({topDiagnosisName, supportKeys,
     missingKeys, weakenKeys, nextBestQuestions, arbitrationReasons})`
     when a top hypothesis exists (else empty array — no fabrication)
   - `determineSymphonyClinicalDisposition({nativeHypothesisCount,
     hasCriticalAlert, usedFallback: false, arbiterRequiresReview})`
3. Existing traffic-light gating — `classifySymphonyTrafficLight` and
   `trafficLightToSymphonyAlert`. **Unchanged.**
4. Result assembly — populates new canonical surfaces:
   `clinicalDisposition`, `nativeHypotheses` (only when non-empty),
   `clinicalFacts` (only when non-empty), explainability lines spread
   into `metadata.rationale`. Preserves `diagnosisSuggestions`,
   `alerts`, `trafficLight`, `trajectory`, `quality.auditHints`.

Notes:

- **No `featureFlags.aadiv2` introduced.** Per Chief Task 7 correction
  #1, integration is additive only — no rollout flag, V1 path is
  preserved structurally because all existing engines still execute.
- **No new SymphonyResult fields invented.** Per Chief Task 7
  correction #2, only existing canonical surfaces are populated:
  `metadata.rationale`, `clinicalDisposition`, `nativeHypotheses`,
  `clinicalFacts`, plus extension of `quality.auditHints`. No
  `evidence.summary` or `SymphonyResult.reasoning` fabrication.
- `metadata.status` remains `'degraded'` and `degradedReason` remains
  `'symphony_engine_partial_migration'` — operational engine status
  stays decoupled from `clinicalDisposition` per Task 6 constraint #3.
- `diagnosisSuggestions` continues to receive `hybridDecisioning.suggestions`
  output unchanged (Chief Task 7 constraint: "preserve diagnosisSuggestions
  compatibility").
- `hybridDecisioning.suggestions` are also passed into the arbiter as
  `hybridSuggestions` input (forward-compat shadow path; arbiter still
  does not transform them in Task 7).
- AADI V2 stage failure isolation — the try/catch ensures any exception
  in the native pipeline cannot corrupt `alerts`, `trafficLight`,
  `trajectory`, or `diagnosisSuggestions`. On failure: disposition
  becomes `'degraded'`, safety flag `'aadiv2_pipeline_failure'` is
  pushed, and audit hint `aadiv2_pipeline_failed:1` is emitted.
- `clinical-facts.ts → toAvpu()` local bridge **NOT retired** in Task 7.
  Chief constraint: "retire only if the canonical helper replacement is
  clean and verified." Replacement requires a canonical AVPU mapper
  beyond `assessSymphonyConsciousnessSeverity()` (which produces
  severity, not AVPU level), and `toAvpu()` carries an `'unknown' → 'A'`
  defensive override at line 174 that is not yet expressible through a
  canonical helper. Defer to a follow-up task with a dedicated
  canonical AVPU mapper.

### Task 8 — `feat(symphony): add AADI V2 shadow comparison engine` (this commit)

Sprint 3 opener. Adds deterministic `compareSymphonyShadowPaths()` in
`packages/symphony/src/engine/shadow-comparison.ts` that compares the
real legacy hybrid path vs the real new AADI V2 native path and emits
the canonical `SymphonyShadowComparison` shape (no second taxonomy).

| Section A / B row | Concrete proof |
|---|---|
| Shadow comparison engine (canonical contract) | `code: shadow-comparison.ts → compareSymphonyShadowPaths()`; `test: shadow-comparison.test.ts (12 cases)` |
| Old path = real hybrid output (Chief constraint #1, #2) | `code: shadow-comparison.ts (hybridSuggestions input is the new-path source; nativeHypotheses is the new-path source — never the native-compat traffic-light bridge)`; `test: shadow-comparison.test.ts (does not confuse native compatibility suggestions with new-path source)` |
| Old escalation = re-evaluated traffic-light with hybrid-only suggestions | `code: assess.ts → oldPathTrafficLight via classifySymphonyTrafficLight({diagnosisSuggestions: hybridDecisioning.suggestions, ...})` |
| New escalation = current trafficLight (merged hybrid + native compat input) | `code: assess.ts → trafficLight (existing)` |
| Old disposition = `determineSymphonyClinicalDisposition()` re-applied to hybrid signals | `code: shadow-comparison.ts (uses confidence-engine.ts authority — no second disposition taxonomy)` |
| Canonical agreementLevel union (`high \| partial \| low \| not_comparable`) | `code: shadow-comparison.ts (counts matches across topDiagnosisChanged, escalationChanged, clinicalDispositionChanged)`; `test: shadow-comparison.test.ts (high/partial/low/not_comparable cases)` |
| `oldPathAvailable` / `newPathAvailable` semantics | `oldPathAvailable = hybridSuggestions.length > 0`; `newPathAvailable = !newPathFailed && nativeHypotheses.length > 0`; `test: shadow-comparison.test.ts (only-old, only-new, both-empty, new-failed cases)` |
| Side-by-side audit notes (deterministic) | `code: shadow-comparison.ts (notes array: old_path_top, new_path_top, old_escalation, new_escalation, old_disposition, new_disposition, new_path_failed)`; `test: shadow-comparison.test.ts (deterministic notes case)` |
| Wired into `SymphonyResult.shadowComparison` (canonical contract surface) | `code: assess.ts (return { ..., shadowComparison })`; `test: aadi-v2.integration.test.ts (attaches shadowComparison through canonical contract)` |
| Telemetry audit hints | `code: assess.ts (shadow_agreement, shadow_top_changed, shadow_escalation_changed, shadow_disposition_changed)`; `test: aadi-v2.integration.test.ts (shadow audit hints case)` |
| Determinism | `test: shadow-comparison.test.ts (deterministic output for identical input)` |

Comparison inputs (exactly):

- `hybridSuggestions` ← `hybridDecisioning.suggestions` (legacy hybrid
  path output — **NOT** the native compatibility suggestions used by the
  traffic-light bridge from Task 7 patch)
- `nativeHypotheses` ← `aadiv2.nativeHypotheses` (post-arbitration native
  diagnostic output)
- `alerts` ← `alertsBeforeTrafficLight` (used only to derive
  `hasCriticalAlert` for old-path disposition reconstruction)
- `oldTrafficLightLevel` ← `oldPathTrafficLight?.level` where
  `oldPathTrafficLight` is `classifySymphonyTrafficLight()` re-evaluated
  with hybrid-only suggestions
- `newTrafficLightLevel` ← `trafficLight?.level` (the existing final
  traffic-light using merged hybrid + native compat input)
- `newClinicalDisposition` ← `aadiv2.clinicalDisposition`
- `newPathFailed` ← `aadiv2.pipelineFailed`

Old path vs new path definitions:

| Dimension | Old path | New path |
|---|---|---|
| Top diagnosis | `hybridSuggestions[0].icd10Code` | `nativeHypotheses[0].icd10Code` |
| Escalation | `classifySymphonyTrafficLight()` with hybrid-only suggestions | Existing `trafficLight` (merged input) |
| Clinical disposition | `determineSymphonyClinicalDisposition()` re-applied with `nativeHypothesisCount = hybridSuggestions.length`, `arbiterRequiresReview = hybridSuggestions.some(mustNotMiss)` | `aadiv2.clinicalDisposition` (from Task 6 engine) |

agreementLevel rules (deterministic):

1. If either `oldPathAvailable === false` OR `newPathAvailable === false`
   → `'not_comparable'`
2. Else count matches across (topDiagnosisChanged, escalationChanged,
   clinicalDispositionChanged):
   - 3 matches → `'high'`
   - 1–2 matches → `'partial'`
   - 0 matches → `'low'`

Notes:

- **No second shadow taxonomy** (Chief constraint #5). All disposition
  derivation reuses `determineSymphonyClinicalDisposition()` from
  Task 6; agreementLevel uses the canonical
  `SymphonyShadowComparison['agreementLevel']` union from Task 1.
- **Native compatibility suggestions never enter as the new-path
  source** (Chief constraint #2). Bridge from Task 7 patch remains
  scoped to traffic-light input only. A dedicated regression test
  verifies that even if a `'native:'`-prefixed suggestion is passed as
  `hybridSuggestions`, the shadow comparison treats it as old path
  input (it does not "leak back" into the new-path source).
- **No safety alert mutation** — `compareSymphonyShadowPaths()` reads
  alerts but never returns or transforms them.
- **No contract drift** — only existing
  `SymphonyResult.shadowComparison` field populated, no new fields
  added to any contract type.
- **Additive only** — pipeline failure already isolates new-path source
  via `aadiv2.pipelineFailed`; shadow comparison correctly handles by
  setting `newPathAvailable = false` and `agreementLevel = 'not_comparable'`.

### Task 9 — `feat(symphony): add AADI V2 parity verification engine` (this commit)

Sprint 3 mid-task. Codifies parity gates atop the shadow comparison
signal from Task 8. Adds standalone audit tool
`verifySymphonyAadiV2Parity()` plus canonical AADI V2 parity fixtures
(`SYMPHONY_AADI_V2_PARITY_FIXTURE_CASES`, 4 cases) in
`packages/symphony/src/engine/parity-verification.ts`. Engine is
**not** wired into `assess.ts` runtime — it is a CI/test-time audit
tool that runs each fixture through `assessSymphonyInput()` and
emits a `SymphonyAadiV2ParityReport` with deterministic gates.

| Section A / B row | Concrete proof |
|---|---|
| AADI V2 parity verification engine | `code: parity-verification.ts → verifySymphonyAadiV2Parity()`; `test: parity-verification.test.ts (9 cases)` |
| Canonical AADI V2 parity fixtures | `code: parity-verification.ts → SYMPHONY_AADI_V2_PARITY_FIXTURE_CASES (baseline-empty-input, febrile-dyspnea-presentation, hypertensive-presentation, sepsis-presentation-with-hybrid-candidate)` |
| Observation builder (parses old/new traffic-light + disposition from shadowComparison.notes) | `code: parity-verification.ts → buildSymphonyAadiV2ParityObservation()`; `test: parity-verification.test.ts (parses old/new escalation and disposition from notes)` |
| Gate A — no `agreementLevel="low"` among comparable | `code: parity-verification.ts (AADIV2_PARITY_GATE_A_NO_LOW_AGREEMENT)` |
| Gate B — no unsafe escalation downgrade (new < old in TRAFFIC_LIGHT_RANK) | `code: parity-verification.ts (AADIV2_PARITY_GATE_B_NO_UNSAFE_ESCALATION_DOWNGRADE, isUnsafeEscalationDowngrade())` |
| Gate C — no unsafe disposition downgrade (`requires_review` → `ok`) | `code: parity-verification.ts (AADIV2_PARITY_GATE_C_NO_UNSAFE_DISPOSITION_DOWNGRADE, isUnsafeDispositionDowngrade())` |
| Gate D — no AADI V2 pipeline failure across canonical fixtures | `code: parity-verification.ts (AADIV2_PARITY_GATE_D_NO_PIPELINE_FAILURE)` |
| Verdict aggregation | `code: parity-verification.ts (verdict = gates.every(passed) ? 'pass' : 'fail')`; `test: parity-verification.test.ts (canonical fixtures pass)` |
| Determinism | `test: parity-verification.test.ts (deterministic report for identical fixtures)` |
| Empty fixtures handled safely | `test: parity-verification.test.ts (all-empty fixtures pass with not_comparable everywhere)` |

Parity gates (canonical, deterministic):

| Gate ID | Description | Failure semantics |
|---|---|---|
| AADIV2_PARITY_GATE_A_NO_LOW_AGREEMENT | No comparable fixture may produce `agreementLevel="low"`. | `agreementHistogram.low > 0` |
| AADIV2_PARITY_GATE_B_NO_UNSAFE_ESCALATION_DOWNGRADE | New path traffic-light level must never rank lower than old path level. | `unsafeEscalationDowngrades > 0` (new RANK < old RANK; GREEN=0/YELLOW=1/RED=2) |
| AADIV2_PARITY_GATE_C_NO_UNSAFE_DISPOSITION_DOWNGRADE | New path clinical disposition must not silently downgrade `requires_review` → `ok`. | `unsafeDispositionDowngrades > 0` |
| AADIV2_PARITY_GATE_D_NO_PIPELINE_FAILURE | AADI V2 native pipeline must not fail across canonical fixtures. | `pipelineFailureCount > 0` |

Notes:

- **Audit tool only — not a runtime gate.** Engine is invoked by tests
  / CI; assess.ts is unchanged in Task 9. Runtime safety dominance
  remains owned by traffic-light + arbiter.
- **No second taxonomy.** Reuses `SymphonyShadowComparison` directly
  (Task 1 contract) and parses notes for old-path observation fields
  (no new contract drift in Task 8 shape).
- **Reuses existing engines.** No reimplementation of disposition
  derivation, no reimplementation of traffic-light level — observation
  fields are derived from `result.shadowComparison.notes` deterministically.
- **Forward-compat with future fixtures.** Public API
  `verifySymphonyAadiV2Parity(fixtures)` accepts arbitrary fixture
  arrays; canonical fixtures are exported but not hardcoded into the
  verification path.
- **Test coverage:** 9 cases including canonical-pass verdict, agreement
  histogram conservation, all 4 gate IDs deterministic, all-empty pass,
  pipeline failure counter, determinism, observation parse correctness,
  safe-default fallback when shadowComparison missing, downgrade
  detection synthetic case.

### Task 10 — `feat(symphony): add AADI V2 interoperability stubs` (this commit)

Sprint 3 close. Adds thin, deterministic, additive adapter layer in
`packages/symphony/src/interop/` that maps `SymphonyResult` into:

1. FHIR R5-shaped Bundle via `mapSymphonyResultToFhirBundle()`
2. CDS Hooks-style response via `mapSymphonyResultToCdsHooksResponse()`

Both adapters are pure functions with no external dependency, no
input mutation, no `SymphonyResult` contract drift, and **PHI-safe
by design** — only structured codes (ICD-10), levels (traffic-light),
action-protocol IDs, and disposition values cross the seam.

| Section A / B row | Concrete proof |
|---|---|
| FHIR bundle adapter (Layer 11 stub) | `code: interop/symphony-to-fhir.ts → mapSymphonyResultToFhirBundle()`; `test: symphony-to-fhir.test.ts (10 cases)` |
| Native hypothesis → FHIR Condition mapping (ICD-10 coding) | `code: interop/symphony-to-fhir.ts → hypothesisToCondition()`; `test: symphony-to-fhir.test.ts (single + multi + must_not_miss cases)` |
| Traffic-light → FHIR RiskAssessment | `code: interop/symphony-to-fhir.ts → trafficLightToRiskAssessment()`; `test: symphony-to-fhir.test.ts (RED → qualitativeRisk RED case)` |
| Rationale → FHIR DiagnosticReport | `code: interop/symphony-to-fhir.ts → rationaleToDiagnosticReport()`; `test: symphony-to-fhir.test.ts (rationale conclusion case)` |
| Critical/high alerts → FHIR Observation | `code: interop/symphony-to-fhir.ts → alertToObservation()`; `test: symphony-to-fhir.test.ts (critical alerts → Observations)` |
| CDS Hooks card adapter (Layer 11 stub) | `code: interop/symphony-to-cds-hooks.ts → mapSymphonyResultToCdsHooksResponse()`; `test: symphony-to-cds-hooks.test.ts (10 cases)` |
| Card emission canonical order | `code: interop/symphony-to-cds-hooks.ts (critical → must_not_miss → top → disposition → shadow)`; `test: symphony-to-cds-hooks.test.ts (canonical order case)` |
| PHI-safe by design (chiefComplaint, additionalComplaint, patientRef, encounterId never escape) | `test: symphony-to-fhir.test.ts (does NOT leak chiefComplaint/patientRef cases)`; `test: symphony-to-cds-hooks.test.ts (does NOT leak chiefComplaint/patientRef cases)` |
| Determinism | `test: symphony-to-fhir.test.ts (deterministic bundle case)`; `test: symphony-to-cds-hooks.test.ts (deterministic cards case)` |
| Pure / additive — no SymphonyResult contract drift | `code: interop/* (read-only consumers of SymphonyResult; no field added to contracts.ts/shared-types)` |

Notes:

- **Stubs only — not full FHIR engine.** Output uses minimal canonical
  FHIR R5 shapes (Bundle/Condition/RiskAssessment/DiagnosticReport/
  Observation) hand-written as plain TS interfaces. No `fhir` package
  dependency, no terminology validation (SNOMED/LOINC/RxNorm), no
  HTTP service runtime. Promotion to a dedicated `packages/fhir-engine`
  per AADI V2 spec §P2.1 deferred to Phase 2.
- **PHI-safe perimeter.** `chiefComplaint`, `additionalComplaint`,
  `patientRef`, `encounterId`, individual vital values are NOT mapped
  into output. Only structured codes (ICD-10, traffic-light level,
  alert IDs, severity strings) and the rationale array (which is
  composed inside SYMPHONY from explainability templates and never
  embeds free-text patient narrative) cross the seam.
- **No reasoning authority migration.** Adapters only translate shape;
  never re-classify, re-score, re-evaluate alerts, or recompute
  traffic-light. All reasoning still owned by the engine modules
  (Tasks 4–8) and disposition by Task 6.
- **Layer 11 (interop) decoupled from Layer 0–10 (engines).** Adapters
  in `interop/` import only types from `../contracts`; no engine
  imports, no circular dependency.

### Task 10 corrective patch — `fix(symphony): widen shadow old-path availability + document status transition rule`

Two-part corrective follow-up to Task 10. Sprint 3 functionally complete;
operationally `metadata.status` remains intentionally transitional pending
controlled lift.

| Section A / B row | Concrete proof |
|---|---|
| Shadow comparison old-path availability widened to canonical comparable signals | `code: engine/shadow-comparison.ts → oldPathAvailable = hybridSuggestions.length > 0 \|\| oldTrafficLightLevel !== undefined`; `test: shadow-comparison.test.ts ('treats old path as available when only an old traffic-light evaluation is present')`; `test: shadow-comparison.test.ts ('keeps old path unavailable when no hybrid suggestions and no old traffic-light evaluation')` |
| PHI-safe AADI V2 fallback observability preserved | `code: engine/assess.ts → classifyAadiV2FailureReason() (error.name only)`; `audit-hint: aadiv2_failure_reason:<name> always emitted`; no regression vs Task 7 patch |
| `metadata.status='degraded'` kept intentionally transitional | `code: engine/assess.ts → status: 'degraded'`, `degradedReason: 'symphony_engine_partial_migration'` unchanged; documented readiness rule below for controlled lift |

#### Shadow availability rule change (exact)

Before (Task 8):

```ts
const oldPathAvailable = input.hybridSuggestions.length > 0
```

After (Task 10 patch):

```ts
const oldPathAvailable =
  input.hybridSuggestions.length > 0 ||
  input.oldTrafficLightLevel !== undefined
```

Rationale: old path is "available" for shadow comparison whenever it
produced any canonical comparable output. Hybrid suggestions and the
old traffic-light evaluation are both canonical comparable signals
emitted by the legacy hybrid path. Restricting availability to
`hybridSuggestions.length > 0` understated the comparable surface and
caused `agreementLevel='not_comparable'` to incorrectly fire when the
old path had a real traffic-light verdict but no hypothesis output.

The canonical `SymphonyShadowComparison` contract is unchanged. Only
the deterministic availability detection rule widened. Existing tests
remain green; two new tests pin the new rule.

#### `metadata.status` transition decision

Decision: **keep transitional (Option A)**.

Sprint 3 is functionally complete (Tasks 1–10 plus this patch land the
full AADI V2 native pipeline + interop stubs end-to-end), but
operationally `metadata.status: 'degraded'` with `degradedReason:
'symphony_engine_partial_migration'` is **not yet ready for unilateral
lift**. The hardcoded value is a deliberate operational signal that
SYMPHONY remains in a partial-migration posture until Sprint 4+ items
land.

Proposed readiness rule for the controlled lift (NOT applied in this
patch — separate follow-up after Sprint 4):

```ts
const status: SymphonyEngineStatus =
  aadiv2.pipelineFailed
    ? 'degraded'
    : aadiv2.clinicalDisposition === 'degraded'
      ? 'degraded'
      : 'ready'
```

Preconditions for applying that rule:

1. Sprint 4+ deferred items resolved or formally deprioritized:
   - `clinical-facts.ts → toAvpu()` local bridge retired (canonical AVPU
     mapper landed)
   - Parity gate threshold ramp informed by field telemetry
   - `packages/fhir-engine` promotion (or explicit deferral statement)
2. The `'symphony_engine_partial_migration'` `safetyFlag` and
   `degradedReason` removed from `assess.ts`.
3. Downstream consumers (Dashboard, Sentra-Assist, observability) audited
   for `status === 'degraded'` branching that currently assumes the
   transitional posture.

Until Chief explicitly GOes the lift, this patch keeps:

- `metadata.status: 'degraded'` (hardcoded)
- `degradedReason: 'symphony_engine_partial_migration'`
- `quality.safetyFlags` prefixed with `'symphony_engine_partial_migration'`

so that no downstream consumer accidentally interprets Sprint 3 close
as engine-ready before the readiness contract is satisfied.

### Outstanding Sprint 4+ mappings (formally deferred at Tahap A audit, 2026-04-27)

Three items below are **formally deferred to Sprint 5+** and explicitly do NOT
block the `metadata.status` lift readiness gate. Each carries a deterministic
unblock criterion so the future controlled lift can proceed without re-opening
this list:

- **`clinical-facts.ts → toAvpu()` local bridge retirement** — `DEFERRED`.
  Current bridge produces deterministic AVPU strings from severity heuristics
  with explicit `'unknown' → 'A'` fallback. Output is internally consumed by
  the syndrome classifier only; not exposed across canonical contract. **Unblock
  criterion:** dedicated canonical AVPU mapper landed (e.g., from clinical
  references package). **Status lift impact:** none — bridge does not affect
  `metadata.status` or `degradedReason` semantics.
- **Parity gate threshold ramp** — `DEFERRED`. Current gates A/B/C/D enforce
  zero-tolerance for hard safety violations (no_low_agreement,
  no_unsafe_escalation_downgrade, no_unsafe_disposition_downgrade,
  no_pipeline_failure). Soft thresholds (e.g., minimum `high+partial` ratio)
  deferred until field telemetry informs reasonable bounds. **Unblock criterion:**
  3+ months of production-grade shadow comparison telemetry from real consumers.
  **Status lift impact:** none — gates remain operational under zero-tolerance
  semantics; threshold ramp is observability tightening, not safety relaxation.
- **Full `packages/fhir-engine` package** — `DEFERRED`. Current interop stubs
  in `packages/symphony/src/interop/` provide deterministic FHIR R5-shaped and
  CDS Hooks-shaped output sufficient for Phase 1 consumer integration.
  **Unblock criterion:** Phase 2 FHIR R5 validation requirement (SNOMED CT,
  LOINC, RxNorm terminology mapping) becomes a binding consumer requirement.
  **Status lift impact:** none — interop is Layer 11, decoupled from engine
  status emission.

### `metadata.status` lift readiness checklist (Tahap A → Tahap B)

Lift preconditions revised after Tahap A audit:

| # | Precondition | State (2026-04-27) | Blocker for lift? |
|---|---|---|---|
| 1 | Phase E parity gate green | ✅ 76/76 fixtures pass, 0 hard failures (`runtime/symphony-route-parity-status.json` 2026-04-27T15:04:49Z); `routeParityStatus='partial'` and `productionImportReplacementAllowed=false` are Chief-gated literals, not failure signals | No (functionally green) |
| 2 | Sprint 4+ items resolved or formally deferred | ✅ All 3 items formally deferred above with explicit unblock criteria | No |
| 3 | In-repo observability audit (no `metadata.status` value branching) | ✅ Zero runtime branches on `metadata.status`, `degradedReason`, `safetyFlags` value across `apps/`, `platform/`, `packages/`. Sentry + Langfuse Dashboard configs do not consume those fields. | No |
| 4 | Out-of-repo observability audit (Sentry/Langfuse dashboards, alerting rules, external monitors) | ⚠️ **Cannot be audited from repo.** Out-of-band confirmation required from operations owner before lift. | Operational confirmation only — no in-repo blocker found |
| 5 | Dashboard team `.agent/` operational guardrails update plan | ⚠️ Pending — `apps/healthcare/intelligenceboard/.agent/HANDOFF.md`, `PROGRESS.md`, `MASTER_CONTEXT_2026-04-19.md` reference `metadata.status === 'degraded'` as release-gate signal in 14+ locations; need synchronized update at Tahap B commit | Documentation sync only — not a runtime blocker |
| 6 | Explicit Chief GO with accepted operational risk | ⏳ Pending Chief decision | Hard gate |

**Tahap A conclusion:** technical preconditions met. Lift no longer blocked by
Sprint 4+ items or unknown downstream consumers. Remaining gates are
operational (out-of-band Sentry/Langfuse confirmation + Dashboard `.agent/`
docs sync at commit time + Chief GO).

---

## Next Recommended Step

After Chief review, this matrix should be referenced directly by the upcoming
implementation plan so every task includes:

- feature IDs or groups affected
- explicit reuse expectation
- regression proof required
