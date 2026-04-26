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

### Outstanding Sprint 1 mappings (carry to next task)

- **Personal baseline / treatment response detection** —
  `buildSymphonyPersonalBaseline()` and `detectSymphonyTreatmentResponse()`
  remain not wired into `ClinicalFacts`. Carry to Task 5 arbiter.
- **AVPU/GCS helpers** — Task 2 uses a local `toAvpu()` for snapshot
  consciousness mapping. Canonical helpers (`symphonyAvpuToNews2Score`,
  `symphonyAvpuToGcsTotal`) remain available; deeper reuse expected when the
  reasoning arbiter (Task 5) needs structured consciousness reasoning.
- **Vital alerts** — Not reused in Task 2 (used in `assess.ts` instead).
  Will be wired through arbiter / assess integration (Task 5 / Task 7).
- **Action protocols, traffic-light, hybrid decisioning** — Sprint 2 targets,
  unchanged.

---

## Next Recommended Step

After Chief review, this matrix should be referenced directly by the upcoming
implementation plan so every task includes:

- feature IDs or groups affected
- explicit reuse expectation
- regression proof required
