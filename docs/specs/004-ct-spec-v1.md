# ClinicalTrajectory v1 Specification

> **AGENT EXECUTION CLARIFICATION — READ FIRST**
>
> This document is **not** a request to build a new Clinical Trajectory engine. This document is **not** a claim that ClinicalTrajectory v1 is more advanced than the existing legacy/old system. This document is **not** a replacement for AADI, SYMPHONY, or any existing reasoning layer.
>
> **What we are doing here:**
>
> We are creating a **standardized, consumer-safe contract and rendering layer** so existing or future clinical reasoning outputs can be displayed longitudinally in a consistent way across Intelligenceboard and Sentra Assist.
>
> In simple terms:
>
> - Old / existing systems may already calculate advanced clinical signals.
> - SYMPHONY remains the reasoning authority.
> - ClinicalTrajectory v1 only defines the **shape**, **semantics**, **mock data**, and **UI surface** for rendering longitudinal evidence.
> - Do not compare CT v1 against the old engine as if this is a competing model.
> - Do not build a new model, backend engine, FHIR lane, orchestrator flow, or diagnosis taxonomy.
>
> **Repo reality check:**
>
> The repo already contains an active trajectory stack in:
>
> - `apps/healthcare/intelligenceboard/src/lib/clinical/*`
> - `apps/healthcare/intelligenceboard/src/components/features/trajectory/*`
> - `apps/healthcare/intelligenceboard/src/app/api/patients/[id]/trajectory/route.ts`
> - `apps/healthcare/sentra-assist/components/clinical/ClinicalTrajectory.tsx`
> - `apps/healthcare/sentra-assist/lib/iskandar-diagnosis-engine/trajectory-analyzer.ts`
> - `packages/shared/shared-types`
>
> This specification is therefore a **canonicalization and compatibility spec**, not a blank-slate feature proposal.
>
> **Implementation target for agents:**
>
> 1. First inspect the existing repository structure and follow the current naming/location conventions.
> 2. Do not create a new folder hierarchy just because this specification shows conceptual file groupings.
> 3. Place the CT specification, shared contract, fixtures, and UI components in the nearest existing repo locations that already serve those purposes.
> 4. Create new files only when they fit existing repo conventions.
> 5. Build Intelligenceboard components that render the CT contract.
> 6. Build Sentra Assist compact components that render the same CT contract.
> 7. Do not touch `packages/platform/document-ingestion`, `platform/orchestrator`, `flows/definitions`, diagnosis taxonomy, backend CT service, or existing SYMPHONY authority unless explicitly instructed in a later approved HANDOFF.
>
> **Correct mental model:**
>
> ClinicalTrajectory v1 is a **container and display standard** for longitudinal clinical evidence. It is not the intelligence source itself. The intelligence source can remain SYMPHONY, AADI, legacy trajectory logic, or future validated engines.

---

# ClinicalTrajectory v1 Specification

**Document ID:** SENTRA-CT-001\
**Version:** 1.0\
**Status:** Draft for GO-Gate Review\
**Domain:** Sentra Healthcare / AADI / SYMPHONY Consumer Layer\
**Primary Consumers:** Intelligenceboard, Sentra Assist\
**Classification:** Internal / Clinical Product Architecture

---

## 1. Executive Summary

**ClinicalTrajectory v1** is a longitudinal clinical evidence layer designed to help clinicians understand how a patient’s condition is moving over time.

It does not replace diagnostic reasoning, differential diagnosis, clinical judgment, or treatment decision-making. It exists beside **SYMPHONY** and **AADI** as a structured representation of time-based clinical movement.

The primary function of ClinicalTrajectory is to transform fragmented time-series clinical observations into a clinician-readable view of:

- clinical direction: improving, stable, worsening, fluctuating, unknown
- clinical momentum: slow, moderate, rapid, unknown
- instability pattern: respiratory, hemodynamic, infectious, metabolic, neurologic, allergic, mixed, unknown
- treatment responsiveness: responsive, partially responsive, non-responsive, worsening, unknown
- time-linked evidence trail
- data quality and reliability limitations

ClinicalTrajectory v1 is intentionally scoped as a **consumer-safe contract and rendering layer**, not as a new clinical reasoning engine.

---

## 2. Strategic Positioning

ClinicalTrajectory v1 follows the same product philosophy as AADI/SYMPHONY:

- AI augments clinicians; it does not replace clinicians.
- Clinical outputs must be transparent, reviewable, and traceable.
- Patient safety is prioritized over model sophistication.
- Clinical reasoning authority must remain stable and clearly bounded.

### 2.1 Relationship with SYMPHONY

**SYMPHONY remains the reasoning authority.**

SYMPHONY is responsible for diagnostic reasoning, probabilistic synthesis, differential diagnosis support, and structured clinical explanation.

ClinicalTrajectory does not supersede, override, or reinterpret SYMPHONY. Instead, it provides a time-based companion layer that helps clinicians see how the patient’s condition has changed across observations, symptoms, labs, treatments, and derived physiologic signals.

### 2.2 Relationship with AADI

AADI remains the diagnostic and clinical decision-support copilot.

ClinicalTrajectory may be attached to an AADI output as additional longitudinal context, but it must not become an independent diagnostic decision-maker.

Recommended conceptual relationship:

```ts
export interface AadiClinicalOutput {
  symphonyResult: SymphonyResult;
  clinicalTrajectory?: ClinicalTrajectoryV1;
}
```

Safer envelope form for early implementation:

```ts
export interface ClinicalTrajectoryEnvelope {
  trajectory: ClinicalTrajectoryV1;
  linkedReasoning?: {
    authority: 'SYMPHONY';
    symphonyResultId?: string;
    caseId?: string;
  };
}
```

---

## 3. Core Definition

ClinicalTrajectory v1 is a structured, longitudinal evidence object.

It represents:

1. patient baseline and modifiers
2. encounter/workflow context
3. time-series vital signs
4. laboratory trajectory
5. symptom evolution
6. treatment-response timeline
7. derived physiologic signals
8. response assessment
9. quality and reliability flags

It is designed for UI consumers first:

- **Intelligenceboard:** full clinical review surface
- **Sentra Assist:** compact point-of-care trajectory card

---

## 4. Scope

## 4.1 In Scope

ClinicalTrajectory v1 includes:

- root specification and field semantics
- shared TypeScript contract
- fixture/mock data for UI development
- Intelligenceboard trajectory summary panel
- Sentra Assist compact trajectory card
- evidence trail rendering
- data quality rendering
- advisory clinical language
- shadow-review readiness hook

## 4.2 Out of Scope

ClinicalTrajectory v1 does not include:

- a new ClinicalTrajectory backend engine
- new diagnostic reasoning authority
- replacement of `SymphonyResult`
- modification of SYMPHONY reasoning contract beyond minimal optional attachment
- FHIR engine changes
- `platform/orchestrator` or `flows/definitions` wiring
- new diagnosis taxonomy
- SATUSEHAT integration
- autonomous treatment recommendation
- autonomous triage decision
- production-grade predictive model training
- ICU-only advanced signal modeling

---

## 5. Design Principles

## 5.1 Longitudinal Evidence, Not Diagnosis

ClinicalTrajectory describes observed movement over time. It may identify that a patient is worsening rapidly, but it must not independently declare a diagnosis.

Acceptable wording:

- “Observed trajectory is worsening.”
- “Respiratory instability pattern detected.”
- “Treatment response appears partial based on available observations.”
- “Clinician review recommended.”

Forbidden wording:

- “AI confirms diagnosis.”
- “Patient will deteriorate in X minutes.”
- “Treatment should be changed.”
- “CT overrides SYMPHONY result.”

## 5.2 Contract-First

ClinicalTrajectory v1 is implemented as a shared contract before any backend computation layer.

The first implementation should include:

1. specification
2. shared types
3. fixtures/mock data
4. Intelligenceboard surface
5. Sentra Assist compact card

## 5.3 Raw and Derived Separation

Raw clinical observations and derived signals must remain separate.

Example:

- `vitalsTimeline[]` stores raw vital observations.
- `derivedTimeline[]` stores NEWS2, shock index, flags, and calculated summaries.

This prevents derived signals from being mistaken as original clinical measurements.

## 5.4 Quality Is First-Class

Missingness, sparse sampling, timestamp uncertainty, and conflicting readings must be visible. CT must not interpret absence of data as clinical safety.

## 5.5 Consumer-Safe Rendering

The UI must show trend, evidence, and uncertainty without presenting CT as a black-box predictor.

---

## 6. Implementation Targeting Rules

This specification intentionally does **not** mandate a new repository folderization pattern.

Agents must not blindly create the conceptual folder structure shown in this document. The actual implementation must follow the current monorepo structure.

## 6.1 Required Repo-Discovery Step

Before implementation, the agent must inspect the repository and identify the existing locations for:

- product or clinical specifications
- shared TypeScript contracts
- fixtures/mock data
- Intelligenceboard UI components
- Sentra Assist UI components
- package export barrels
- existing test conventions

The agent must then report the discovered paths before modifying files.

## 6.2 Placement Rules

Use these rules instead of fixed paths:

| Artifact | Placement Rule |
|---|---|
| CT specification | Place in `docs/specs/` beside existing product/spec docs |
| CT field semantics | Keep in the same spec file unless the repo already splits spec appendices |
| CT contract/types | Place inside `packages/shared/shared-types/src/` |
| CT fixtures/mock data | Place beside the shared-types contract or adjacent to existing fixture conventions |
| Intelligenceboard CT surface | Place inside `apps/healthcare/intelligenceboard/src/components/features/trajectory/` and related dashboard entrypoints |
| Sentra Assist compact card | Place inside `apps/healthcare/sentra-assist/components/clinical/` and related clinical entrypoints |
| Exports | Use the existing barrel/export pattern for each package/app |
| Tests | Use the existing test location and naming convention already used by the target package/app |

## 6.3 Do Not Create New High-Level Architecture

Agents must not create new top-level lanes unless the repo already uses that pattern.

Do not create new architectural areas such as:

- new backend CT service
- new orchestrator lane
- new FHIR lane
- new diagnosis taxonomy lane
- new standalone ClinicalTrajectory app
- new engine package

## 6.4 Conceptual Target Map

The following is a conceptual target map only. It is not a mandatory folder structure.

| Conceptual Target | Expected Existing Repo Area |
|---|---|
| CT spec | `docs/specs/` |
| Shared CT contract | `packages/shared/shared-types` |
| Fixtures | shared-types fixtures or adjacent app fixtures |
| Intelligenceboard surface | `apps/healthcare/intelligenceboard` |
| Sentra Assist compact card | `apps/healthcare/sentra-assist` |

If the repo has different actual names, the agent must follow the repo.

## 6.5 Required Pre-Execution Report

Before coding, the agent should produce a short implementation map:

```txt
Discovered CT implementation map:
- Spec target: `docs/specs/004-ct-spec-v1.md`
- Shared contract target: `packages/shared/shared-types/src/`
- Fixture target: shared-types fixture file or the existing app fixture location
- Intelligenceboard target: `apps/healthcare/intelligenceboard/src/components/features/trajectory/`
- Sentra Assist target: `apps/healthcare/sentra-assist/components/clinical/`
- Export target: existing barrel file in the target package/app
- Test target: existing `*.test.ts` / `*.test.tsx` location in the target package/app
```

Execution should proceed only after the map is consistent with the existing repo conventions.

---

## 7. ClinicalTrajectory v1 Contract

## 7.1 Enumerations

```ts
export type ClinicalTrajectoryDirection =
  | 'improving'
  | 'stable'
  | 'worsening'
  | 'fluctuating'
  | 'unknown';

export type ClinicalTrajectoryMomentum =
  | 'slow'
  | 'moderate'
  | 'rapid'
  | 'unknown';

export type ClinicalInstabilityPattern =
  | 'respiratory'
  | 'hemodynamic'
  | 'infectious'
  | 'metabolic'
  | 'neurologic'
  | 'allergic'
  | 'mixed'
  | 'unknown';

export type ClinicalTreatmentResponsiveness =
  | 'responsive'
  | 'partially_responsive'
  | 'non_responsive'
  | 'worsening'
  | 'unknown';

export type ClinicalDataSource =
  | 'manual'
  | 'device'
  | 'imported'
  | 'self_report'
  | 'derived';

export type ClinicalConsciousnessLevel =
  | 'alert'
  | 'voice'
  | 'pain'
  | 'unresponsive'
  | 'unknown';

export type ClinicalTrajectorySeverityBand =
  | 'low'
  | 'watch'
  | 'concerning'
  | 'critical'
  | 'unknown';

export type ClinicalTrajectoryConfidence =
  | 'high'
  | 'moderate'
  | 'low'
  | 'insufficient_data';

export type ClinicalTrajectoryCalculationBasis =
  | 'official_score'
  | 'standard_formula'
  | 'sentra_rule_v1'
  | 'clinician_entered'
  | 'unknown';
```

---

## 7.2 Baseline

```ts
export interface ClinicalTrajectoryBaseline {
  ageYears?: number;
  sexAtBirth?: 'male' | 'female' | 'intersex' | 'unknown';
  pregnancyStatus?: 'pregnant' | 'not_pregnant' | 'unknown' | 'not_applicable';
  chronicDiseases?: string[];
  usualSbp?: number;
  usualDbp?: number;
  usualSpo2?: number;
  usualHeartRate?: number;
  usualRespiratoryRate?: number;
  frailtyFlag?: boolean;
  immunocompromisedFlag?: boolean;
}
```

Baseline exists to differentiate absolute abnormality from patient-relative deterioration.

---

## 7.3 Encounter Context

```ts
export interface ClinicalTrajectoryEncounterContext {
  encounterId?: string;
  setting?: 'home' | 'clinic' | 'puskesmas' | 'ed' | 'ward' | 'icu' | 'unknown';
  encounterStartedAt?: string;
  triageAcuity?: 'low' | 'moderate' | 'high' | 'critical' | 'unknown';
  referralInFlag?: boolean;
  referralOutFlag?: boolean;
  observationWindowMinutes?: number;
}
```

Trajectory without workflow context can be misleading. The same vital pattern may have different operational meaning in home monitoring, puskesmas, ED, ward, or ICU.

---

## 7.4 Vital Timeline

```ts
export interface ClinicalTrajectoryVitalPoint {
  id: string;
  observedAt: string;
  sbp?: number;
  dbp?: number;
  map?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureC?: number;
  spo2?: number;
  oxygenSupplementLitersPerMin?: number;
  fio2Percent?: number;
  consciousness?: ClinicalConsciousnessLevel;
  gcsTotal?: number;
  painScore?: number;
  capillaryRefillSeconds?: number;
  source?: ClinicalDataSource;
  qualityFlags?: string[];
}
```

`vitalsTimeline[]` is mandatory because vital signs are the most practical longitudinal foundation for early CT v1.

---

## 7.5 Laboratory Timeline

```ts
export interface ClinicalTrajectoryLabPoint {
  id: string;
  observedAt: string;
  code: string;
  label: string;
  category?: 'hematology' | 'chemistry' | 'blood_gas' | 'urinalysis' | 'other';
  value?: number | string | boolean;
  unit?: string;
  abnormalFlag?: boolean;
  source?: ClinicalDataSource;
  qualityFlags?: string[];
}
```

Laboratory trajectory helps distinguish transient instability from evolving systemic disease.

Common examples:

- glucose
- Hb/Ht
- WBC/neutrophil/platelet
- creatinine/eGFR
- sodium/potassium
- CRP/procalcitonin
- lactate
- AST/ALT/bilirubin
- urine ketone
- blood gas
- urinalysis summary

---

## 7.6 Symptom Timeline

```ts
export interface ClinicalTrajectorySymptomPoint {
  id: string;
  observedAt: string;
  symptom: string;
  status: 'present' | 'absent' | 'worsening' | 'improving' | 'resolved';
  severity?: 'mild' | 'moderate' | 'severe';
  onsetAt?: string;
  source?: ClinicalDataSource;
}
```

Symptom evolution is important because many primary-care cases worsen first at the symptom layer before objective markers become dramatic.

---

## 7.7 Treatment Timeline

```ts
export interface ClinicalTrajectoryTreatmentPoint {
  id: string;
  occurredAt: string;
  category:
    | 'medication'
    | 'oxygen'
    | 'fluid'
    | 'procedure'
    | 'nebulization'
    | 'antipyretic'
    | 'other';
  label: string;
  dose?: number;
  doseUnit?: string;
  route?: string;
  rate?: number;
  rateUnit?: string;
  responseWindowMinutes?: number;
  source?: ClinicalDataSource;
}
```

Treatment timeline allows CT to support response assessment without claiming treatment recommendation authority.

---

## 7.8 Derived Timeline

```ts
export interface ClinicalTrajectoryDerivedPoint {
  id: string;
  observedAt: string;
  news2Total?: number;
  shockIndex?: number;
  pulsePressure?: number;
  htnSeverity?: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  glucoseCategory?: 'low' | 'normal' | 'prediabetes' | 'high' | 'severe_high';
  respiratoryDistressFlag?: boolean;
  hemodynamicInstabilityFlag?: boolean;
  feverFlag?: boolean;
  consciousnessDeteriorationFlag?: boolean;
  calculationBasis?: ClinicalTrajectoryCalculationBasis;
  calculationLabel?: string;
  source?: 'derived';
  evidenceRefs?: string[];
}
```

Derived signals convert separate clinical numbers into trajectory-relevant signals.

Examples:

- NEWS2 total and component subscores
- shock index
- pulse pressure
- fever burden
- SpO2 drop rate
- respiratory distress proxy
- hemodynamic instability flag
- consciousness deterioration flag
- trend slope per vital
- volatility/variability per vital

---

## 7.9 Response Assessment

```ts
export interface ClinicalTrajectoryResponseAssessment {
  direction: ClinicalTrajectoryDirection;
  momentum: ClinicalTrajectoryMomentum;
  instabilityPattern: ClinicalInstabilityPattern;
  treatmentResponsiveness: ClinicalTreatmentResponsiveness;
  severityBand?: ClinicalTrajectorySeverityBand;
  confidence?: ClinicalTrajectoryConfidence;
  timeToCriticalRiskMinutes?: number;
  requiresEscalation?: boolean;
  mustNotMissSignalCount?: number;
  summary?: string;
  evidenceRefs?: string[];
}
```

`response` is mandatory because it provides the operational summary consumed by Intelligenceboard and Sentra Assist.

### 7.9.1 Direction Semantics

| Value         | Meaning                                                            |
| ------------- | ------------------------------------------------------------------ |
| `improving`   | Observed trend is moving toward clinical stabilization or recovery |
| `stable`      | No meaningful worsening or improvement detected                    |
| `worsening`   | Observed trend suggests deterioration                              |
| `fluctuating` | Signal is unstable or alternating without clear direction          |
| `unknown`     | Insufficient or unreliable data                                    |

### 7.9.2 Momentum Semantics

| Value      | Meaning                                        |
| ---------- | ---------------------------------------------- |
| `slow`     | Change is gradual                              |
| `moderate` | Change is clinically noticeable but not abrupt |
| `rapid`    | Change is fast enough to require closer review |
| `unknown`  | Insufficient or unreliable data                |

### 7.9.3 Severity Band Semantics

| Value        | Meaning                                                  |
| ------------ | -------------------------------------------------------- |
| `low`        | No concerning longitudinal signal detected               |
| `watch`      | Requires observation or routine review                   |
| `concerning` | Requires clinician attention                             |
| `critical`   | Urgent review or escalation context should be considered |
| `unknown`    | Insufficient data or uncertain signal                    |

### 7.9.4 Confidence Semantics

`confidence` reflects confidence in the trajectory assessment based on data completeness, sampling density, consistency, and reliability. It is not a claim of diagnostic certainty.

---

## 7.10 Quality Layer

```ts
export interface ClinicalTrajectoryQuality {
  completenessScore?: number;
  missingFields?: string[];
  duplicateReadingFlag?: boolean;
  conflictingReadingFlag?: boolean;
  sparseSamplingFlag?: boolean;
  timestampIntegrityFlag?: boolean;
  notes?: string[];
}
```

Quality must be visible to consumers. A weak trajectory based on sparse data should be clearly marked as limited.

---

## 7.11 Root Object

```ts
export interface ClinicalTrajectoryV1 {
  version: 'ct.v1';
  generatedAt: string;
  baseline?: ClinicalTrajectoryBaseline;
  encounterContext?: ClinicalTrajectoryEncounterContext;
  vitalsTimeline: ClinicalTrajectoryVitalPoint[];
  labsTimeline?: ClinicalTrajectoryLabPoint[];
  symptomsTimeline?: ClinicalTrajectorySymptomPoint[];
  treatmentTimeline?: ClinicalTrajectoryTreatmentPoint[];
  derivedTimeline?: ClinicalTrajectoryDerivedPoint[];
  response: ClinicalTrajectoryResponseAssessment;
  quality?: ClinicalTrajectoryQuality;
}
```

---

## 8. Calculation Basis

ClinicalTrajectory v1 supports explicit calculation basis metadata.

| Basis               | Meaning                                             | Example                          |
| ------------------- | --------------------------------------------------- | -------------------------------- |
| `official_score`    | Based on externally recognized clinical score       | NEWS2                            |
| `standard_formula`  | Based on standard arithmetic or physiologic formula | MAP, shock index, pulse pressure |
| `sentra_rule_v1`    | Based on transparent Sentra-defined rule            | respiratory distress proxy       |
| `clinician_entered` | Entered or confirmed by clinician                   | symptom severity                 |
| `unknown`           | Calculation basis unavailable                       | imported ambiguous data          |

Examples:

```ts
{
  id: 'derived-001',
  observedAt: '2026-04-29T09:00:00+07:00',
  news2Total: 7,
  calculationBasis: 'official_score',
  calculationLabel: 'NEWS2',
  source: 'derived',
  evidenceRefs: ['vital-001']
}
```

```ts
{
  id: 'derived-002',
  observedAt: '2026-04-29T09:00:00+07:00',
  shockIndex: 1.12,
  calculationBasis: 'standard_formula',
  calculationLabel: 'Shock Index = HR / SBP',
  source: 'derived',
  evidenceRefs: ['vital-001']
}
```

---

## 9. Evidence References

`evidenceRefs` must point to IDs from timeline objects.

Permitted targets:

- `ClinicalTrajectoryVitalPoint.id`
- `ClinicalTrajectoryLabPoint.id`
- `ClinicalTrajectorySymptomPoint.id`
- `ClinicalTrajectoryTreatmentPoint.id`
- `ClinicalTrajectoryDerivedPoint.id`

Example:

```ts
response: {
  direction: 'worsening',
  momentum: 'rapid',
  instabilityPattern: 'respiratory',
  treatmentResponsiveness: 'unknown',
  severityBand: 'concerning',
  confidence: 'moderate',
  summary: 'Respiratory trajectory worsened across the last three observations.',
  evidenceRefs: ['vital-001', 'vital-002', 'derived-003']
}
```

---

## 10. Rendering Rules

## 10.1 Intelligenceboard

Intelligenceboard renders the full CT review surface.

Required components:

- trajectory summary card
- trend chips
- instability pattern strip
- treatment-response strip
- mini timeline
- evidence trail list
- data quality notice

Required fields:

- `response.direction`
- `response.momentum`
- `response.instabilityPattern`
- `response.treatmentResponsiveness`
- `response.severityBand`
- `response.confidence`
- `response.summary`
- `quality`
- timeline evidence referenced by `evidenceRefs`

## 10.2 Sentra Assist

Sentra Assist renders a compact version.

Required display:

- direction
- momentum
- warning color
- instability pattern
- quick rationale
- limited data warning if quality is poor

Mapping:

| CT Response                               | Assist Warning |
| ----------------------------------------- | -------------- |
| worsening + rapid                         | Red            |
| worsening + moderate                      | Yellow         |
| fluctuating + concerning/critical pattern | Yellow         |
| improving/stable                          | Neutral        |
| unknown + poor quality                    | Gray warning   |

---

## 11. Safety Copy Rules

Allowed UI language:

- “Trajectory signal”
- “Observed trend”
- “Evidence suggests”
- “Clinician review recommended”
- “Limited data available”
- “Pattern detected from available observations”

Forbidden UI language:

- “AI confirms”
- “Diagnosis is”
- “Treatment must”
- “Patient will deteriorate”
- “SYMPHONY is wrong”
- “CT overrides diagnosis”

---

## 12. Fixture Requirements

Minimum fixtures:

```ts
export const mockImprovingTrajectory: ClinicalTrajectoryV1;
export const mockWorseningRespiratoryTrajectory: ClinicalTrajectoryV1;
export const mockSparseDataTrajectory: ClinicalTrajectoryV1;
```

## 12.1 mockImprovingTrajectory

Purpose:

- tests green/neutral UI state
- demonstrates improving direction
- shows treatment responsiveness

Expected response:

```ts
response: {
  direction: 'improving',
  momentum: 'moderate',
  instabilityPattern: 'mixed',
  treatmentResponsiveness: 'responsive',
  severityBand: 'watch',
  confidence: 'moderate'
}
```

## 12.2 mockWorseningRespiratoryTrajectory

Purpose:

- tests red/yellow warning UI state
- demonstrates respiratory instability
- validates evidence trail

Expected response:

```ts
response: {
  direction: 'worsening',
  momentum: 'rapid',
  instabilityPattern: 'respiratory',
  treatmentResponsiveness: 'unknown',
  severityBand: 'critical',
  confidence: 'moderate',
  requiresEscalation: true
}
```

## 12.3 mockSparseDataTrajectory

Purpose:

- tests insufficient-data rendering
- validates quality notice

Expected response:

```ts
response: {
  direction: 'unknown',
  momentum: 'unknown',
  instabilityPattern: 'unknown',
  treatmentResponsiveness: 'unknown',
  severityBand: 'unknown',
  confidence: 'insufficient_data'
}
```

---

## 13. Non-Goals

ClinicalTrajectory v1 must not:

- create a new diagnostic engine
- create a new reasoning authority
- replace SYMPHONY
- override AADI output
- produce autonomous treatment recommendations
- create or modify FHIR schema
- call `platform/orchestrator` or `flows/definitions`
- create a new diagnosis taxonomy
- create a backend CT service
- require SATUSEHAT dependency
- hide uncertainty or missingness
- display unsupported confidence as diagnostic certainty

---

## 14. Trial Readiness Hook

ClinicalTrajectory v1 should prepare for later shadow review.

```ts
export interface ClinicalTrajectoryReviewNote {
  trajectoryId: string;
  reviewerRole: 'doctor' | 'nurse' | 'clinical_steward' | 'qa';
  reviewedAt: string;
  agreement:
    | 'agree'
    | 'partially_agree'
    | 'disagree'
    | 'unable_to_assess';
  safetyConcern?: boolean;
  notes?: string;
}
```

This review hook is not a workflow engine. It exists only to support future audit, validation, and shadow-review workflows.

---

## 15. Acceptance Criteria

| Area              | Acceptance Criteria                                |
| ----------------- | -------------------------------------------------- |
| Spec              | `docs/specs/004-ct-spec-v1.md` is canonical; `docs/specs/003-clinical-trajectory-v1.md` is aligned companion reference |
| Field semantics   | All fields documented                              |
| Contract          | `ClinicalTrajectoryV1` exported from `@the-abyss/shared-types` |
| Fixtures          | Three mock trajectories created                    |
| Intelligenceboard | Full CT panel renders without backend dependency   |
| Sentra Assist     | Compact CT card renders without backend dependency |
| Safety            | No autonomous diagnosis/treatment wording          |
| Authority         | SYMPHONY remains reasoning authority               |
| Boundary          | No FHIR/orchestrator/taxonomy changes              |
| Quality           | Missingness and low-confidence states are visible  |

---

## 16. Verification Commands

Package names must be adjusted to actual repository configuration.
Run these after workspace dependencies are installed and package binaries are available.

```bash
pnpm --filter @the-abyss/shared-types typecheck
pnpm --filter @the-abyss/shared-types lint
pnpm --filter @classy/intelligenceboard build
pnpm --filter @classy/intelligenceboard test
pnpm --filter @the-abyss/sentra-assist build
pnpm --filter @the-abyss/sentra-assist test
pnpm lint
pnpm test
```

Boundary guard:

```bash
rg -n "ClinicalTrajectory" packages/platform/document-ingestion platform/orchestrator flows/definitions
```

Expected result:

- no required CT implementation in `packages/platform/document-ingestion`
- no CT orchestrator wiring
- no CT LangFlow/flows wiring
- no diagnosis taxonomy changes

---

## 17. V2 Candidates

These are intentionally excluded from v1:

- `deviceTimeline`
- `fluidBalance`
- `urineOutput`
- `ventilatorSettings`
- `clinicianActionTimeline`
- detailed provenance per point
- kinetic renal function modeling
- ICU-specific ventilatory trajectory
- multi-state admission/discharge trajectory
- backend CT computation engine
- model training pipeline

---

## 18. Final Product Decision

ClinicalTrajectory v1 is approved conceptually as a **contract-first, UI-consumer-first longitudinal evidence layer**.

It must be implemented in this order:

1. CT spec finalization
2. shared-types contract
3. fixtures/mock data
4. Intelligenceboard surface
5. Sentra Assist compact card
6. shadow-review readiness hook

It must not expand into FHIR, orchestrator, diagnosis taxonomy, or backend engine work during v1.

---

## 19. ClinicalTrajectory Advanced V2 Direction

This section defines the intended north star after v1 is stable. It is not a v1 implementation requirement. It is the clearer product meaning behind the trajectory concept and the desired evolution of the Dashboard Intelligence surface.

### 19.1 Purpose

ClinicalTrajectory advanced v2 exists to support **prevention-first clinical care**.

Its job is not just to describe the patient’s current state. Its job is to help clinicians:

- see deterioration earlier
- close incomplete data before it becomes a blind spot
- prioritize the next most important clinical question
- identify must-not-miss signals
- choose the safest monitoring cadence
- intervene before a preventable deterioration becomes an acute event

Primary product statement:

> ClinicalTrajectory advanced v2 is a preventive clinical cockpit that turns intake, anamnesis, vital signs, treatment response, and longitudinal evidence into early warning and next-step guidance for clinicians.

### 19.1.1 Operating Model

The intended operating model is:

| Stage | Actor | Responsibility |
|---|---|---|
| Intake | Nurse / Assist | Capture initial complaint, vital sign, and first-pass context |
| Enrichment | Doctor / Dashboard | Complete anamnesis, exam findings, and clinical interpretation |
| Evaluation | CT advanced v2 | Aggregate longitudinal evidence and determine preventive posture |
| Action | Doctor | Decide diagnosis, treatment, follow-up, and escalation |

### 19.2 Inputs

Advanced v2 consumes the same clinical flow already present in the dashboard stack:

- Assist intake data captured by nurses
- vital signs and screening values
- doctor-completed anamnesis
- exam findings and clinical notes
- treatment events and response signals
- laboratory and derived physiologic signals when available
- personal baseline and encounter context
- data completeness and timestamp quality

The system should treat the Assist-to-Dashboard flow as a staged enrichment pipeline:

1. Assist captures initial data
2. Dashboard enriches with doctor reasoning and deeper context
3. CT advanced v2 evaluates trajectory, risk, and prevention needs

### 19.3 Outputs

Advanced v2 should not output only a summary. It should output a prevention-oriented bundle:

- trajectory direction
- momentum / rate of change
- instability pattern
- severity band
- confidence / data quality
- time-to-critical or review window
- must-not-miss signal count
- evidence trail
- missing data or incomplete fields
- next best clinical question
- next best clinical check
- suggested monitoring cadence
- escalation suggestion when warranted

The output must remain readable by humans and structured enough for UI rendering, alerting, and audit.

### 19.3.1 Output Contract Shape

Conceptually, the v2 output should be understood as:

```ts
interface ClinicalTrajectoryAdvancedV2Output {
  trajectoryState: {
    direction: 'improving' | 'stable' | 'worsening' | 'fluctuating' | 'unknown'
    momentum: 'slow' | 'moderate' | 'rapid' | 'unknown'
    severityBand: 'low' | 'watch' | 'concerning' | 'critical' | 'unknown'
    confidence: 'high' | 'moderate' | 'low' | 'insufficient_data'
  }
  preventionSignals: {
    mustNotMiss: string[]
    missingData: string[]
    timeToCriticalRiskMinutes?: number
    nextBestClinicalQuestion?: string
    nextBestClinicalCheck?: string
    recommendedMonitoringCadence?: string
    escalationSuggested?: boolean
  }
  evidence: {
    references: string[]
    summary: string
  }
}
```

### 19.4 Warning Rules

Warnings should trigger when the trajectory shows one or more of the following:

- rapid worsening across a short observation window
- multiple parameters worsening together
- a must-not-miss physiologic pattern
- poor quality data combined with high clinical uncertainty
- repeated deterioration after short-term improvement
- short time-to-critical window

Warning severity should be driven by clinical consequence, not by model confidence alone.

Suggested warning posture:

- `neutral` when the trajectory is improving or stable and data quality is adequate
- `watch` when the trend is uncertain or early drift is present
- `warn` when worsening or instability is present but not yet critical
- `urgent` when the pattern indicates likely near-term deterioration
- `critical` when immediate clinician attention is required

Warning output should be expressed as:

- a visible state
- a short rationale
- the evidence that triggered it
- the recommended next action
- the confidence / quality qualifier

### 19.5 Prevention Rules

Advanced v2 should bias toward prevention by following these rules:

- surface incomplete history that blocks safe assessment
- ask for the next most useful missing clinical data
- highlight the observation or exam that would most reduce uncertainty
- prefer early review over late rescue when the trend is worsening
- recommend monitoring frequency based on risk trajectory
- make treatment response visible, but do not command treatment
- never hide uncertainty behind a single score

Prevention means the system helps the clinician move earlier, not harder.

### 19.5.1 Prevention Priorities

When the system must choose what to emphasize first, the priority order is:

1. immediate safety threats
2. must-not-miss signals
3. fast deterioration patterns
4. data gaps that materially block safe interpretation
5. monitoring cadence and follow-up urgency
6. routine longitudinal trend context

### 19.6 Doctor vs System Boundaries

The system informs. The doctor decides.

System responsibilities:

- aggregate data
- detect trend and instability
- surface evidence and uncertainty
- propose the next best question or check
- show escalation context when risk is high

Doctor responsibilities:

- interpret the context
- confirm or reject clinical meaning
- complete the anamnesis and examination
- decide diagnosis and treatment
- override or ignore a suggestion when clinically appropriate

Hard boundary:

- the system must not claim to diagnose independently
- the system must not replace clinician judgment
- the system must not issue autonomous treatment orders
- the system must not hide missing data, weak confidence, or ambiguity

### 19.7 Dashboard Intelligence Integration

Advanced v2 belongs inside the existing Dashboard Intelligence flow, not outside it.

Recommended placement:

1. Assist collects intake and vital data.
2. Dashboard opens the patient context and lets the doctor enrich anamnesis and exam details.
3. CT advanced v2 renders inside the Dashboard Intelligence surface as the longitudinal preventive layer.
4. The CT surface should show:
   - the current trajectory state
   - the evidence trail behind that state
   - the missing inputs that limit certainty
   - the next action the doctor should consider

In practical terms, CT advanced v2 should appear as a **decision-support panel inside Dashboard Intelligence**, not as a separate app, not as a backend service, and not as a replacement for the existing trajectory stack.

### 19.8 Existing Stack Reuse

The existing Intelligenceboard trajectory stack is the starting point for this direction, not something to replace.

Reuse targets already present in the repo include:

- `trajectory-analyzer.ts`
- `momentum-engine.ts`
- `convergence-detector.ts`
- `personal-baseline.ts`
- `prediction-engine.ts`
- `trajectory-alert-service.ts`
- `TrajectoryIntelligencePanel`
- `TrajectoryMonitorPanel`

The v2 goal is to evolve these surfaces from trend-display into a preventive cockpit with stronger evidence framing, stronger warning posture, and clearer next-step guidance.
