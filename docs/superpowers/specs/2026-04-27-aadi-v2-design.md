# AADI V2 Design Spec

**Date:** 2026-04-27  
**Status:** Draft for Chief review  
**Owner:** Codex/Dexton  
**Branch target:** `abyss-core`  
**Primary package:** `packages/symphony/`  
**Related inputs:** `docs/guides/aadiv2.md`, `.agent/HANDOFF.md`, `docs/adr/0007-pharmacology-locus-decision.md`, `docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`

---

## Context

`AADI V2` is not a greenfield product. It is the next architectural phase of
`@the-abyss/symphony`, which already contains a meaningful deterministic
clinical safety stack:

- NEWS2
- vital alerts
- screening gates
- PE suspect
- anaphylaxis
- early warning patterns
- trajectory
- traffic-light safety gate

Current code confirms that SYMPHONY is still a hybrid engine rather than a
native diagnosis engine:

- `packages/symphony/src/engine/assess.ts` still accepts
  `diagnosisCandidates?: SymphonyHybridDiagnosisCandidate[]`
- `assessSymphonyInput()` still routes diagnosis output through
  `applySymphonyHybridDecisioning()`
- response metadata is still hard-coded to `status: 'degraded'` and
  `confidenceBand: 'insufficient_data'`

This matches the central claim in `docs/guides/aadiv2.md`: current SYMPHONY is
already useful as a safety-first deterministic assessment engine, but it is not
yet a native diagnosis-from-scratch engine.

The Chief constraint is important: this must be executed as a sprint program,
not as an abstract architecture exercise. We are building toward the full AADI
V2 target, but the sequence must maximize near-term demo readiness without
creating throwaway demo-only architecture.

---

## Executive Reading

The correct strategy is:

1. Keep `SYMPHONY` as the only canonical clinical reasoning authority.
2. Preserve the existing safety stack and regression-protect it.
3. Add a new native reasoning spine inside `SYMPHONY`.
4. Deliver that spine in sprints, with each sprint producing stable,
   demo-visible progress.
5. Defer only non-core polish, not the architectural direction.

`AADI V2` therefore means:

- not a rewrite outside SYMPHONY
- not an LLM-first orchestration experiment
- not a demo façade on top of old logic
- but a staged internal evolution of SYMPHONY into a diagnostic reasoning
  copilot

---

## Best-Practice Notes

The following official sources inform this spec. Dates matter because these
standards and guidance surfaces evolve over time.

1. FDA final guidance `Clinical Decision Support Software`, January 2026.  
   Relevance: intended use, role clarity, and safe framing of CDS capabilities.  
   Source: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software

2. FDA `Good Machine Learning Practice for Medical Device Development: Guiding Principles`, page updated December 19, 2025 and referencing the final IMDRF document from January 2025.  
   Relevance: lifecycle governance, monitoring, controlled changes, validation.  
   Source: https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles

3. ONC HTI-1 Decision Support Interventions / Predictive Models transparency material, current public fact sheet surface available in 2026.  
   Relevance: transparency, source attributes, and explainability expectations for predictive decision support.  
   Sources:  
   - https://healthit.gov/resources/decision-support-interventions-dsi-fact-sheet-health-data-technology-and-interoperability-certification-program-updates-algorithm-transparency-and-information-sharing-hti-1-final-rule/  
   - https://www.healthit.gov/topic/laws-regulation-and-policy/health-data-technology-and-interoperability-certification-program

4. HL7 FHIR R5 overview, current published HL7 reference surface.  
   Relevance: future-ready structured outputs and interoperability mapping.  
   Source: https://hl7.org/fhir/overview.html

5. HL7 CDS Hooks v2.0.1, current published version, generated 2025-03-12.  
   Relevance: workflow-triggered CDS integration model for future Assist and EMR surfaces.  
   Source: https://cds-hooks.hl7.org/

6. WHO AI for Health governance material published May 27, 2024.  
   Relevance: human-in-the-loop, safety, accountability, fairness, governance.  
   Source: https://www.who.int/publications/m/item/artificial-intelligence-for-health

Implication for AADI V2:

- reasoning must be explainable
- operational state and clinical state must be separated
- shadow comparison must be first-class
- output must become more structured, not less
- claims for demo/public pitch must stay below what has not yet been validated

---

## Problem Statement

Current SYMPHONY can detect danger well, but its diagnosis layer is still
dependent on externally supplied candidates and post-hoc reranking.

That creates five product problems:

1. The engine is not clinically self-sufficient.
2. Confidence output is operationally useful but not clinically rich enough.
3. Explanation is still uneven between alerts and diagnosis reasoning.
4. Shadow-mode comparison cannot fully evaluate native reasoning because the
   native reasoning spine does not exist yet.
5. Dashboard and Assist still risk being perceived as hosts of intelligence
   rather than consumers of a canonical parent engine.

---

## Goals

### Primary Goals

1. Turn `@the-abyss/symphony` into a native diagnostic reasoning engine without
   weakening its existing safety stack.
2. Preserve the existing deterministic safety slices as canonical and
   regression-protected.
3. Produce structured, explainable diagnostic output suitable for clinician
   review and later interoperability mapping.
4. Support sprint-based delivery so progress is demoable at any point without
   deviating from the end-state architecture.
5. Generate a spec that Claude and Cursor can execute with minimal rediscovery.

### Secondary Goals

1. Improve readiness for future Dashboard and Assist rewiring.
2. Improve auditability and shadow comparison.
3. Create a clean seam for future FHIR/CDS Hooks integration.

---

## Non-Goals

1. Do not move reasoning authority into `sentra-rag` or any
   retrieval package.
2. Do not rewrite the existing safety engines unless a change is required for
   modular integration or regression protection.
3. Do not introduce raw large third-party pharmacology datasets directly into
   `SYMPHONY`.
4. Do not make public clinical performance claims beyond what local validation
   can support.
5. Do not block progress on full AADI V2 while waiting for full FHIR-native
   modeling.

---

## Scope Decisions

### Decision 1: Build Full Direction, Deliver by Sprint

We are not building a fake demo slice. We are building the full AADI V2
architecture in a staged manner.

Implication:

- every sprint lands real architectural assets
- every sprint should improve demo readiness
- no sprint should introduce disposable code that must later be thrown away

### Decision 2: Keep SYMPHONY as Parent Authority

`SYMPHONY -> Dashboard + Assist`

Implication:

- all new reasoning modules live in `packages/symphony`
- Dashboard and Assist remain consumers, explainers, and workflow surfaces
- retrieval packages may ground, score, or enrich, but never become parallel
  clinical engines

### Decision 3: Separate Operational Engine State from Clinical Decision State

Current `SymphonyEngineStatus` is operational:

- `ready`
- `busy`
- `degraded`
- `offline`

But `aadiv2.md` talks about clinical states like:

- `ok`
- `requires_review`
- `insufficient_data`
- `degraded`

These are not the same concept.

Decision:

- keep `SymphonyEngineStatus` as operational state
- add a new clinical output status for the reasoning result

This avoids overloading one field with two different meanings.

### Decision 4: Traffic-Light Stays in SYMPHONY

This is already locked by ADR `0007`, and this spec preserves that lock.

Implication:

- medication/reference knowledge may live in `@the-abyss/clinical-references`
- final escalation posture remains in `SYMPHONY`

### Decision 5: Native Reasoning Must Start Deterministic-First

The first AADI V2 native reasoning spine should be deterministic and
rules-driven, not LLM-primary.

Implication:

- `ClinicalFacts`
- syndrome classification
- diagnosis pack matching
- differential scoring
- must-not-miss surfacing

must all work without requiring an LLM in the critical path.

Optional future LLM use may explain or enrich, but must not become the sole
reasoning authority.

---

## Current-State Findings

### Already Present and Valuable

The following current assets should be treated as reusable strengths:

- `packages/symphony/src/engine/news2.ts`
- `packages/symphony/src/engine/vital-alerts.ts`
- `packages/symphony/src/engine/screening-gates.ts`
- `packages/symphony/src/engine/symptom-signals.ts`
- `packages/symphony/src/engine/pattern-engine.ts`
- `packages/symphony/src/engine/clinical-patterns.ts`
- `packages/symphony/src/engine/clinical-patterns-definitions.ts`
- `packages/symphony/src/engine/pe-suspect.ts`
- `packages/symphony/src/engine/anaphylaxis.ts`
- `packages/symphony/src/engine/early-warning.ts`
- `packages/symphony/src/engine/composite-deterioration.ts`
- `packages/symphony/src/engine/trajectory.ts`
- `packages/symphony/src/engine/classifiers.ts`
- `packages/symphony/src/engine/traffic-light.ts`
- `packages/symphony/src/engine/action-protocols.ts`
- `packages/symphony/src/engine/hybrid-decisioning.ts`
- `packages/symphony/src/engine/parity-fixtures.ts`
- `packages/symphony/src/adapters/assist-patterns-parity.ts`
- `packages/shared-types/src/symphony.ts`
- parity and regression tests already present in `packages/symphony/src/__tests__/`

These are not optional nice-to-haves. They are mandatory foundation assets for
AADI V2.

### Mandatory Reuse Rule

Every clinically relevant feature already built inside `SYMPHONY` must be
either:

1. reused directly,
2. wrapped by a new AADI V2 layer, or
3. explicitly retired with written rationale and parity replacement proof.

Silent bypass is forbidden.

If a new AADI V2 module duplicates existing logic that already exists in
`packages/symphony`, that duplication is a design failure unless the spec is
explicitly amended first.

### Mandatory Existing Feature Reuse Map

| Existing feature | Current files | Required role in AADI V2 | Sprint target | Requirement |
|---|---|---|---|---|
| Assessment orchestrator | `packages/symphony/src/engine/assess.ts` | Remains canonical entrypoint; gains native reasoning path instead of being replaced | Sprint 2 | MUST reuse |
| Shared contracts | `packages/shared-types/src/symphony.ts` | Remains the public package boundary; new AADI V2 contracts append here | Sprint 2 | MUST reuse |
| NEWS2 | `packages/symphony/src/engine/news2.ts` | Continues as canonical deterioration score and safety input | Sprint 1-2 | MUST reuse |
| Vital alerts | `packages/symphony/src/engine/vital-alerts.ts` | Continues as hard-stop bedside alert source | Sprint 1-2 | MUST reuse |
| Screening gates | `packages/symphony/src/engine/screening-gates.ts` | Continues as deterministic immediate screening layer | Sprint 1-2 | MUST reuse |
| Symptom NLP | `packages/symphony/src/engine/symptom-signals.ts` | Becomes one of the first feeders into `ClinicalFacts` and syndrome classification | Sprint 1 | MUST reuse |
| Pattern evaluator | `packages/symphony/src/engine/pattern-engine.ts` | Continues as deterministic criteria engine for diagnosis packs and alert packs where applicable | Sprint 1 | MUST reuse |
| 70 clinical patterns | `packages/symphony/src/engine/clinical-patterns.ts`, `packages/symphony/src/engine/clinical-patterns-definitions.ts` | Continues as canonical disease-pattern and must-not-miss evidence source | Sprint 1-2 | MUST reuse |
| Assist pattern parity definitions | `packages/symphony/src/adapters/assist-patterns-parity.ts` | Remains migration guard and no-regression evidence for Assist-origin features | Sprint 3 | MUST reuse |
| PE suspect | `packages/symphony/src/engine/pe-suspect.ts` | Continues as focused embolic risk detector feeding safety arbiter and differential context | Sprint 1-2 | MUST reuse |
| Anaphylaxis detector | `packages/symphony/src/engine/anaphylaxis.ts` | Continues as high-priority syndrome detector and action trigger | Sprint 1-2 | MUST reuse |
| Early warning patterns | `packages/symphony/src/engine/early-warning.ts` | Continues as disease-specific warning source into facts, safety, and explanation | Sprint 1-2 | MUST reuse |
| Composite deterioration | `packages/symphony/src/engine/composite-deterioration.ts` | Continues as multi-signal deterioration evidence and acute syndrome source | Sprint 1-2 | MUST reuse |
| Trajectory, baseline, momentum, response | `packages/symphony/src/engine/trajectory.ts` | Continues as temporal reasoning layer and explanation input | Sprint 1-2 | MUST reuse |
| HTN/glucose/chronic disease/GCS classifiers | `packages/symphony/src/engine/classifiers.ts` | Continue as canonical physiologic and chronic-context derivation utilities for facts builder | Sprint 1 | MUST reuse |
| Traffic-light safety gate | `packages/symphony/src/engine/traffic-light.ts` | Remains final escalation gate inside SYMPHONY | Sprint 2 | MUST reuse |
| Action protocols | `packages/symphony/src/engine/action-protocols.ts` | Remain canonical action guidance attached to alerts and surfaced in AADI V2 outputs | Sprint 2 | MUST reuse |
| Hybrid decisioning | `packages/symphony/src/engine/hybrid-decisioning.ts` | Remains shadow/fallback/comparison path during migration | Sprint 2-3 | MUST reuse temporarily |
| Parity fixtures | `packages/symphony/src/engine/parity-fixtures.ts` | Remain regression guard against historical route parity loss | Sprint 3 | MUST reuse |

The execution-grade checklist for these features lives in
`docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`.

### Current Gaps

1. No canonical `ClinicalFacts` builder.
2. No syndrome classification layer.
3. No native diagnosis pack registry.
4. No native differential generation layer.
5. No central reasoning arbiter independent of external candidates.
6. No public structured explanation model beyond current suggestion reasoning
   arrays and audit hints.
7. No explicit clinical disposition field.
8. No first-class shadow comparison output contract.

### Controlled Weaknesses Worth Preserving Temporarily

The current hybrid candidate input should not be deleted immediately. It is
useful as a bridge and a shadow baseline while the native reasoner matures.

Decision:

- keep hybrid candidate support during migration
- demote it from primary source to comparison or fallback source over time

---

## Target Architecture

### Overview

The AADI V2 runtime inside `SYMPHONY` should look like this:

```text
Raw clinical input
-> input normalization
-> ClinicalFacts builder
-> syndrome classification
-> diagnosis pack matching
-> native differential scoring
-> must-not-miss surfacing
-> reasoning arbiter
-> safety arbiter
-> explanation composer
-> clinical disposition + confidence engine
-> interoperability/shadow adapters
```

### Layer 1: Input Normalization

Purpose:

- convert raw app input into one consistent internal shape
- preserve source provenance where possible
- reduce downstream branching in reasoning modules

Inputs:

- metadata
- patient context
- vitals
- complaints
- medical history
- allergies
- medications
- chronic disease context

Output:

- normalized assessment input, still compatible with existing
  `SymphonyAssessmentInput`

Notes:

- this layer already partly exists in `assess.ts`
- do not over-engineer this first; normalize only fields used by active logic
- this layer must preserve compatibility with `SymphonyAssessmentInput`
- this layer must feed the already-existing snapshot and derived-type ecosystem
  instead of creating a second competing input vocabulary

### Layer 2: ClinicalFacts Builder

Purpose:

- transform normalized input into explicit clinical facts that downstream
  reasoning can consume

Examples of facts:

- fever present / absent / unknown
- respiratory distress present / absent / unknown
- shock physiology concern
- severe hypertension concern
- hyperglycemia crisis concern
- neurologic focal deficit concern
- acute bleeding concern
- pregnancy-sensitive context
- chronic cardiometabolic context
- medication interaction risk context

Decision:

- facts should be explicit booleans, enums, or bounded score buckets
- facts must preserve unknown state where data is incomplete
- facts must be built on top of existing `SYMPHONY` structures where possible:
  `SymphonyClinicalSnapshot`, `SymphonyDerivedValues`,
  `SymphonyClinicalHistory`, `SymphonySymptomSignalResult`, classifier outputs,
  composite outputs, and trajectory outputs
- this layer must not reimplement symptom NLP, NEWS2, screening-gates,
  trajectory math, or classifier logic from scratch

### Layer 3: Syndrome Classification

Purpose:

- map clinical facts into higher-level syndrome bands without prematurely
  committing to a single diagnosis

Examples:

- acute febrile syndrome
- acute respiratory syndrome
- acute cardiometabolic decompensation
- neurologic acute syndrome
- acute abdominal / GI syndrome
- allergy / anaphylactoid syndrome
- maternal-fetal risk syndrome

Why this layer matters:

- it reduces direct coupling between low-level facts and many diagnoses
- it makes explainability cleaner
- it creates a stable place to add Indonesia-specific packs later
- it gives an explicit place to consume already-existing outputs from:
  `symptom-signals`, `clinical-patterns`, `early-warning`, `classifiers`,
  `composite-deterioration`, and `trajectory`

### Layer 4: Diagnosis Pack Matching

Purpose:

- maintain deterministic diagnosis definitions grouped by syndrome family

Each diagnosis pack should define:

- `id`
- `icd10Code`
- `diagnosisName`
- `syndromeFamily`
- inclusion criteria
- exclusion criteria
- supporting evidence rules
- weakening evidence rules
- must-not-miss flag or escalation hints
- next best questions
- recommended validation steps

Design rule:

- diagnosis packs are not giant narrative objects
- diagnosis packs are concise, testable deterministic definitions
- diagnosis packs must be able to consume pattern evidence from the existing
  `pattern-engine` and `clinical-patterns` layer rather than bypassing it

### Layer 5: Native Differential Scoring

Purpose:

- rank plausible diagnoses from native evidence instead of ranking only
  external candidates

Scoring inputs:

- matched syndrome family
- supporting facts
- conflicting facts
- missing critical facts
- acute danger overlays
- pattern matches
- early warning matches
- trajectory state and momentum
- composite deterioration alerts and watchers
- classifier-derived chronic context
- epidemiology priors from `clinical-references` when approved and available

Scoring output:

- ranked `SymphonyDiagnosticHypothesis[]`
- with explicit confidence contribution reasons

### Layer 6: Must-Not-Miss Surface

Purpose:

- ensure dangerous possibilities stay visible even when they are not the top
  working diagnosis

This is conceptually different from:

- top ranked diagnosis
- traffic-light final escalation

Design rule:

- `mustNotMiss` should be a first-class structured output, not just a boolean
  on one diagnosis suggestion

### Layer 7: Reasoning Arbiter

Purpose:

- reconcile native differential, hybrid candidates if still supplied, and
  deterministic danger signals into one coherent clinical reasoning output

Responsibilities:

- decide top working differential
- decide which diagnoses require review
- decide which are must-not-miss
- decide whether the case is too incomplete to call confidently
- never downgrade hard safety alerts
- preserve or attach action protocols where current alerts already imply them

### Layer 8: Safety Arbiter

Purpose:

- preserve current canonical safety authority
- consume alerts from NEWS2, vitals, patterns, PE suspect, anaphylaxis,
  composite deterioration, and traffic-light
- preserve the existing severity and gate semantics already encoded in
  `SymphonyAlert`, `SymphonySafetyGate`, and action protocol attachment rules

Design rule:

- safety arbiter can escalate the clinical posture
- safety arbiter cannot silently erase native reasoning outputs

### Layer 9: Explainability Composer

Purpose:

- create clinician-readable reasoning without hiding uncertainty

For each hypothesis, explainability should answer:

- why it appears
- what supports it
- what weakens it
- what is still missing
- what not to miss
- what to do next

This layer should also produce structured evidence refs for later audit or UI
rendering.

### Layer 10: Clinical Disposition and Confidence Engine

Purpose:

- produce explicit clinical state separate from operational engine state

New proposed output field:

- `clinicalDisposition: 'ok' | 'requires_review' | 'insufficient_data' | 'degraded'`

Rules:

- `ok`: native reasoning and safety evaluation completed with adequate evidence
- `requires_review`: engine has a coherent output, but uncertainty or risk
  requires clinician verification
- `insufficient_data`: not enough data to support a strong working differential
- `degraded`: technical or migration-path fallback reduced the intended reasoning
  path

### Layer 11: Interoperability and Shadow Adapters

Purpose:

- support future consumer wiring and validation without polluting core logic

Adapters should cover:

- shadow comparison between current hybrid path and AADI V2 native path
- future FHIR-ish mapping surface
- future CDS Hooks service response shaping

---

## Proposed Contract Changes

### Principle

Public types that cross package boundaries belong in
`packages/shared-types/src/symphony.ts`. Internal engines and registries stay in
`packages/symphony/src/`.

### New Shared Types

Append to `packages/shared-types/src/symphony.ts`:

```ts
export type SymphonyClinicalDisposition =
  | 'ok'
  | 'requires_review'
  | 'insufficient_data'
  | 'degraded'

export interface SymphonyClinicalFact {
  key: string
  value: string | number | boolean
  confidence?: number
  sourceRefs: string[]
}

export interface SymphonyReasoningEvidence {
  supports: string[]
  weakens: string[]
  missing: string[]
  nextBestQuestions: string[]
}

export interface SymphonyDiagnosticHypothesis {
  id: string
  icd10Code: string
  diagnosisName: string
  rank: number
  confidence: number
  category: 'working' | 'review' | 'must_not_miss' | 'deferred'
  evidence: SymphonyReasoningEvidence
  evidenceRefs: string[]
}
```

### Existing Type Adjustments

Update `SymphonyResult` to include:

```ts
clinicalDisposition: SymphonyClinicalDisposition
clinicalFacts?: SymphonyClinicalFact[]
nativeHypotheses?: SymphonyDiagnosticHypothesis[]
shadowComparison?: SymphonyShadowComparison
```

### Important Compatibility Rule

Do not remove existing `diagnosisSuggestions` in the first AADI V2 migration
phase. Keep them during transition, but define them as compatibility output
until consumers are fully migrated to the richer native hypothesis model.

Do not remove or downgrade:

- `alerts`
- `trafficLight`
- `trajectory`
- `quality.auditHints`
- action protocol fields already supported by `SymphonyAlert`

---

## Module Layout

### New / Expanded Files in `packages/symphony`

```text
packages/symphony/src/
├── engine/
│   ├── assess.ts
│   ├── clinical-facts.ts
│   ├── syndrome-classifier.ts
│   ├── diagnosis-packs.ts
│   ├── native-differential.ts
│   ├── reasoning-arbiter.ts
│   ├── explainability.ts
│   ├── confidence-engine.ts
│   ├── shadow-compare.ts
│   └── interoperability.ts
├── __tests__/
│   ├── clinical-facts.test.ts
│   ├── syndrome-classifier.test.ts
│   ├── native-differential.test.ts
│   ├── reasoning-arbiter.test.ts
│   ├── confidence-engine.test.ts
│   ├── shadow-compare.test.ts
│   └── aadi-v2.integration.test.ts
└── index.ts
```

### Internal Responsibilities

- `clinical-facts.ts`
  - build canonical facts from normalized input, snapshot, classifier outputs,
    pattern outputs, composite outputs, and trajectory outputs
- `syndrome-classifier.ts`
  - map facts to syndrome families
- `diagnosis-packs.ts`
  - deterministic pack registry and helpers
- `native-differential.ts`
  - rank hypotheses from facts + packs
- `reasoning-arbiter.ts`
  - merge native differential, hybrid fallback, and safety posture
- `explainability.ts`
  - build structured reasoning output
- `confidence-engine.ts`
  - compute confidence + clinical disposition
- `shadow-compare.ts`
  - compare old hybrid path vs new native path, plus parity compatibility
- `interoperability.ts`
  - future FHIR-ish / CDS output mapping helpers

### Shared Package Boundary

`packages/clinical-references` remains:

- reference-heavy
- read-only
- provenance-aware
- optional input provider to SYMPHONY

It does not become the reasoning engine.

---

## Diagnosis Pack Strategy

### Why Packs Instead of Free-Form Rules

Diagnosis packs are the right middle ground because they:

- are testable
- support explainability
- can express inclusion/exclusion logic
- can be versioned
- align with sprint-based expansion

### Initial Pack Families

Sprint-safe initial families:

1. acute respiratory
2. acute cardiometabolic
3. acute neurologic
4. acute febrile / infectious
5. acute allergy / anaphylactoid
6. maternal-fetal risk

These families align with the strongest existing safety coverage and give the
best demo value early.

### Indonesia-First Considerations

The spec explicitly reserves room for:

- dengue
- TB suspect
- sepsis
- hypertensive emergency
- DKA / HHS
- maternal-fetal escalation

But they should be implemented as deterministic packs and facts, not as a loose
country-specific narrative branch.

---

## Shadow Strategy

Shadow mode is mandatory for AADI V2 maturation.

### Required Comparison Axes

1. old hybrid top diagnosis vs native top hypothesis
2. old traffic-light level vs native + safety-arbited level
3. old next-best-question quality vs native explanation quality
4. old confidence posture vs new clinical disposition
5. existing safety-gate emissions vs AADI V2 safety emissions
6. existing action-protocol attachments vs AADI V2 action outputs
7. existing trajectory summary vs AADI V2 reasoning summary
8. Assist pattern parity expectations vs AADI V2 post-integration output

### Shadow Output Contract

Add an internal and later public shape similar to:

```ts
interface SymphonyShadowComparison {
  oldPathAvailable: boolean
  newPathAvailable: boolean
  agreementLevel: 'high' | 'partial' | 'low' | 'not_comparable'
  topDiagnosisChanged: boolean
  escalationChanged: boolean
  notes: string[]
}
```

### Why This Matters

This supports:

- safe rollout
- internal evaluation
- demo storytelling grounded in evidence

---

## Evaluation Strategy

### Golden Cases

Create curated deterministic cases that exercise:

- danger detection
- reasonable differential generation
- must-not-miss surfacing
- uncertainty handling
- explanation quality

Each golden case must assert:

- expected top 1-3 hypotheses
- expected must-not-miss hypotheses
- expected traffic-light level
- expected clinical disposition
- expected next-best-question direction

### Regression Protection

Current safety tests must continue passing unchanged or be carefully widened
only when behavior is intentionally improved.

Mandatory no-regression suites for any AADI V2 milestone:

- existing `packages/symphony/src/__tests__/*`
- `runSymphonyParityFixtures()`
- `runAssistPatternParityFixtures()`
- any new AADI V2 golden-case suite

No sprint is considered complete if the new reasoning path works but these
existing parity surfaces regress.

### No Success Without These Checks

For any sprint that changes reasoning:

```bash
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
pnpm --filter @the-abyss/symphony lint
```

Additional targeted tests should be runnable by file.

---

## Sprint Program

### Sprint 1: Native Facts and Differential Spine

**Goal:** create the first native reasoning path inside SYMPHONY.

Deliverables:

- reuse existing snapshot, symptom, classifier, pattern, composite, and
  trajectory outputs as AADI V2 fact inputs
- `clinical-facts.ts`
- `syndrome-classifier.ts`
- `diagnosis-packs.ts` with a limited initial pack family set
- `native-differential.ts`
- unit tests for all of the above

Exit criteria:

- native hypotheses can be generated without `diagnosisCandidates`
- existing safety stack still passes
- existing symptom, pattern, classifier, composite, and trajectory features are
  demonstrably consumed rather than bypassed
- result can express at least one coherent working differential and one
  must-not-miss output in golden cases

### Sprint 2: Arbiter, Explainability, and Clinical Disposition

**Goal:** turn raw native ranking into clinically usable output.

Deliverables:

- `reasoning-arbiter.ts`
- `explainability.ts`
- `confidence-engine.ts`
- shared-type updates
- `assess.ts` integration
- action protocol preservation in AADI V2 outputs
- traffic-light and safety-arbiter integration without loss of current gates

Exit criteria:

- output contains native hypotheses, reasons, missing data, next-best-questions
- output includes `clinicalDisposition`
- hybrid candidates are optional rather than mandatory
- existing alert, gate, protocol, and trajectory outputs remain available

### Sprint 3: Shadow, Evaluation, and Demo Hardening

**Goal:** make AADI V2 demonstrably safer to show and easier to compare.

Deliverables:

- `shadow-compare.ts`
- golden-case suite
- AADI V2 integration test file
- compatibility output for Dashboard/Assist consumers
- parity fixture enforcement in the sprint verification path

Exit criteria:

- old/new comparison works
- demo cases can be shown with reasoned outputs
- regressions in safety are visible quickly
- `runSymphonyParityFixtures()` and `runAssistPatternParityFixtures()` remain
  green

### Sprint 4: Interoperability and Consumer Bridge

**Goal:** prepare the engine for later production-grade consumer rewiring.

Deliverables:

- `interoperability.ts`
- FHIR-ish mapping helpers
- CDS workflow mapping notes
- consumer integration contracts

Exit criteria:

- output can be shaped toward FHIR-style resources or workflow payloads
- no core reasoning logic leaks into consumer apps

---

## Demo Readiness Principle

This spec is full-direction, but demo readiness still matters.

At any point, the best demo story should be:

- same safety authority
- richer native reasoning
- clearer explanation
- more explicit uncertainty
- stronger audit and shadow readiness

Avoid claiming:

- validated diagnostic accuracy uplift
- production replacement completeness
- FHIR certification readiness

until those are actually supported by local evidence.

---

## Risks

### Risk 1: Overbuilding Before Native Spine Works

Mitigation:

- build facts and differential before broader adapters

### Risk 2: Confusing Operational and Clinical Status

Mitigation:

- keep separate fields

### Risk 3: Consumer Drift

Mitigation:

- consumers stay adapters, not reasoning forks

### Risk 4: Weak Demo Because Reasoning Is Rich but Unclear

Mitigation:

- prioritize explainability in Sprint 2, not as a late afterthought

### Risk 5: Safety Regression While Chasing Diagnosis Richness

Mitigation:

- preserve and extend safety regression tests first

---

## Recommended File Touches for Execution

### Likely Modified

- `packages/symphony/src/engine/assess.ts`
- `packages/symphony/src/index.ts`
- `packages/symphony/src/engine/clinical-patterns.ts`
- `packages/symphony/src/engine/clinical-patterns-definitions.ts`
- `packages/symphony/src/engine/trajectory.ts`
- `packages/symphony/src/engine/composite-deterioration.ts`
- `packages/symphony/src/engine/classifiers.ts`
- `packages/symphony/src/engine/action-protocols.ts`
- `packages/symphony/src/engine/parity-fixtures.ts`
- `packages/shared-types/src/symphony.ts`
- `packages/shared-types/src/index.ts`

### Likely Created

- `packages/symphony/src/engine/clinical-facts.ts`
- `packages/symphony/src/engine/syndrome-classifier.ts`
- `packages/symphony/src/engine/diagnosis-packs.ts`
- `packages/symphony/src/engine/native-differential.ts`
- `packages/symphony/src/engine/reasoning-arbiter.ts`
- `packages/symphony/src/engine/explainability.ts`
- `packages/symphony/src/engine/confidence-engine.ts`
- `packages/symphony/src/engine/shadow-compare.ts`
- `packages/symphony/src/engine/interoperability.ts`
- `packages/symphony/src/__tests__/clinical-facts.test.ts`
- `packages/symphony/src/__tests__/syndrome-classifier.test.ts`
- `packages/symphony/src/__tests__/native-differential.test.ts`
- `packages/symphony/src/__tests__/reasoning-arbiter.test.ts`
- `packages/symphony/src/__tests__/confidence-engine.test.ts`
- `packages/symphony/src/__tests__/shadow-compare.test.ts`
- `packages/symphony/src/__tests__/aadi-v2.integration.test.ts`

---

## Explicit Build Order

Claude and Cursor should implement in this order:

1. contracts and shared types
2. feature-reuse wiring for snapshot, symptom, classifier, pattern, composite,
   trajectory, and safety outputs
3. clinical facts builder
4. syndrome classifier
5. diagnosis pack registry
6. native differential engine
7. reasoning arbiter
8. explainability composer
9. confidence + clinical disposition engine
10. `assess.ts` integration
11. shadow comparison
12. interoperability adapters
13. consumer bridge work later

This order minimizes rework and keeps each sprint vertically meaningful.

---

## Key Design Rules for Implementers

1. Never remove the current safety engines just to simplify the new reasoning
   path.
2. Never make retrieval packages the source of final clinical authority.
3. Keep deterministic logic explicit and testable.
4. Preserve unknown state; do not pretend missing data is normal data.
5. Keep public contracts in `shared-types`, internal engines in `symphony`.
6. Prefer additive migration over sudden replacement.
7. Always distinguish:
   - operational engine health
   - clinical reasoning quality
   - safety escalation posture
8. Existing SYMPHONY clinical features are mandatory foundation assets, not
   optional references.
9. If an existing feature is not reused, the implementation PR must explain why
   and show the replacement parity proof.
10. Pattern, trajectory, composite, classifier, protocol, and parity layers must
    stay alive through AADI V2, not be orphaned by the new native path.

---

## Final Recommendation

This spec should be treated as the canonical design handoff for AADI V2 Phase
Next inside the Abyss monorepo.

The next artifact after approval should be a detailed implementation plan that
breaks this design into sprint-sized execution tasks for Claude and Cursor.


APPROVED - CHIEF
