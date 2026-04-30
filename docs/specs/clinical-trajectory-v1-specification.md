---
id: clinical-trajectory-v1
type: specification
status: draft
owner: sentra-engineering
tags: [clinical-trajectory, consumer-layer, aadi]
---

# ClinicalTrajectory v1 specification

**Document ID:** SENTRA-CT-001  
**Version:** 1.0  
**Status:** Draft for GO-Gate Review  
**Domain:** Sentra Healthcare / AADI / SYMPHONY Consumer Layer  
**Primary Consumers:** Intelligenceboard, Sentra Assist  
**Classification:** Internal / Clinical Product Architecture  

---

## Executive summary

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

## Strategic positioning

ClinicalTrajectory v1 follows the same product philosophy as AADI/SYMPHONY:

- AI augments clinicians; it does not replace clinicians.
- Clinical outputs must be transparent, reviewable, and traceable.
- Patient safety is prioritized over model sophistication.
- Clinical reasoning authority must remain stable and clearly bounded.

### Relationship with SYMPHONY

**SYMPHONY remains the reasoning authority.**

SYMPHONY is responsible for diagnostic reasoning, probabilistic synthesis, differential diagnosis support, and structured clinical explanation.

ClinicalTrajectory does not supersede, override, or reinterpret SYMPHONY. Instead, it provides a time-based companion layer that helps clinicians see how the patient’s condition has changed across observations, symptoms, labs, treatments, and derived physiologic signals.

### Relationship with AADI

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

## Core definition

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

## Scope

### In scope

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

### Out of scope

ClinicalTrajectory v1 does not include:

- a new ClinicalTrajectory backend engine
- new diagnostic reasoning authority
- replacement of `SymphonyResult`
- modification of SYMPHONY reasoning contract beyond minimal optional attachment
- FHIR engine changes
- orchestrator or Langflow wiring
- new diagnosis taxonomy
- SATUSEHAT integration
- autonomous treatment recommendation
- autonomous triage decision
- production-grade predictive model training
- ICU-only advanced signal modeling

---

## Design principles

### Longitudinal evidence, not diagnosis

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

### Contract-first

ClinicalTrajectory v1 is implemented as a shared contract before any backend computation layer.

The first implementation should include:

1. specification
2. shared types
3. fixtures/mock data
4. Intelligenceboard surface
5. Sentra Assist compact card

### Raw and derived separation

Raw clinical observations and derived signals must remain separate.

Example:

- `vitalsTimeline[]` stores raw vital observations.
- `derivedTimeline[]` stores NEWS2, shock index, flags, and calculated summaries.

This prevents derived signals from being mistaken as original clinical measurements.

### Quality is first-class

Missingness, sparse sampling, timestamp uncertainty, and conflicting readings must be visible. CT must not interpret absence of data as clinical safety.

### Consumer-safe rendering

The UI must show trend, evidence, and uncertainty without presenting CT as a black-box predictor.

---

## Implementation paths

### Root documentation

```txt
docs/clinical-trajectory/
  CT_SPEC_V1.md
  CT_FIELD_SEMANTICS.md
  CT_CALCULATION_BASIS.md
  CT_RENDERING_GUIDE.md
  CT_NON_GOALS.md
  CT_SHADOW_REVIEW_PROTOCOL.md
```

### Shared types

```txt
packages/shared-types/src/clinical-trajectory/
  clinical-trajectory.types.ts
  clinical-trajectory.fixtures.ts
  clinical-trajectory.calculation-basis.ts
  clinical-trajectory.review.ts
  index.ts
```

Shared export:

```txt
packages/shared-types/src/index.ts
```

### Intelligenceboard consumer

```txt
apps/healthcare/intelligenceboard/src/components/clinical-trajectory/
  ClinicalTrajectoryPanel.tsx
  TrajectorySummaryCard.tsx
  TrajectoryTrendChips.tsx
  InstabilityPatternStrip.tsx
  TreatmentResponseStrip.tsx
  TrajectoryMiniTimeline.tsx
  EvidenceTrailList.tsx
  DataQualityNotice.tsx
```

### Sentra Assist consumer

```txt
apps/healthcare/sentra-assist/src/components/clinical-trajectory/
  CompactClinicalTrajectoryCard.tsx
  TrajectoryWarningBadge.tsx
  TrajectoryQuickRationale.tsx
```

---

## ClinicalTrajectory v1 contract

### Enumerations

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

### Baseline

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

### Encounter context

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

### Vital timeline

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

### Laboratory timeline

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

### Symptom timeline

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

### Treatment timeline

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

### Derived timeline

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

### Response assessment

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

#### Direction semantics

| Value | Meaning |
|---|---|
| `improving` | Observed trend is moving toward clinical stabilization or recovery |
| `stable` | No meaningful worsening or improvement detected |
| `worsening` | Observed trend suggests deterioration |
| `fluctuating` | Signal is unstable or alternating without clear direction |
| `unknown` | Insufficient or unreliable data |

#### Momentum semantics

| Value | Meaning |
|---|---|
| `slow` | Change is gradual |
| `moderate` | Change is clinically noticeable but not abrupt |
| `rapid` | Change is fast enough to require closer review |
| `unknown` | Insufficient or unreliable data |

#### Severity band semantics

| Value | Meaning |
|---|---|
| `low` | No concerning longitudinal signal detected |
| `watch` | Requires observation or routine review |
| `concerning` | Requires clinician attention |
| `critical` | Urgent review or escalation context should be considered |
| `unknown` | Insufficient data or uncertain signal |

#### Confidence semantics

`confidence` reflects confidence in the trajectory assessment based on data completeness, sampling density, consistency, and reliability. It is not a claim of diagnostic certainty.

---

### Quality layer

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

### Root object

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

## Calculation basis

ClinicalTrajectory v1 supports explicit calculation basis metadata.

| Basis | Meaning | Example |
|---|---|---|
| `official_score` | Based on externally recognized clinical score | NEWS2 |
| `standard_formula` | Based on standard arithmetic or physiologic formula | MAP, shock index, pulse pressure |
| `sentra_rule_v1` | Based on transparent Sentra-defined rule | respiratory distress proxy |
| `clinician_entered` | Entered or confirmed by clinician | symptom severity |
| `unknown` | Calculation basis unavailable | imported ambiguous data |

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

## Evidence references

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

## Rendering rules

### Intelligenceboard

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

### Sentra Assist

Sentra Assist renders a compact version.

Required display:

- direction
- momentum
- warning color
- instability pattern
- quick rationale
- limited data warning if quality is poor

Mapping:

| CT Response | Assist Warning |
|---|---|
| worsening + rapid | Red |
| worsening + moderate | Yellow |
| fluctuating + concerning/critical pattern | Yellow |
| improving/stable | Neutral |
| unknown + poor quality | Gray warning |

---

## Safety copy rules

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

## Fixture requirements

Minimum fixtures:

```ts
export const mockImprovingTrajectory: ClinicalTrajectoryV1;
export const mockWorseningRespiratoryTrajectory: ClinicalTrajectoryV1;
export const mockSparseDataTrajectory: ClinicalTrajectoryV1;
```

### mockImprovingTrajectory

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

### mockWorseningRespiratoryTrajectory

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

### mockSparseDataTrajectory

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

## Non-goals

ClinicalTrajectory v1 must not:

- create a new diagnostic engine
- create a new reasoning authority
- replace SYMPHONY
- override AADI output
- produce autonomous treatment recommendations
- create or modify FHIR schema
- call orchestrator or Langflow
- create a new diagnosis taxonomy
- create a backend CT service
- require SATUSEHAT dependency
- hide uncertainty or missingness
- display unsupported confidence as diagnostic certainty

---

## Trial readiness hook

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

## Acceptance criteria

| Area | Acceptance Criteria |
|---|---|
| Spec | `CT_SPEC_V1.md` created and approved |
| Field semantics | All fields documented |
| Contract | `ClinicalTrajectoryV1` exported from shared-types |
| Fixtures | Three mock trajectories created |
| Intelligenceboard | Full CT panel renders without backend dependency |
| Sentra Assist | Compact CT card renders without backend dependency |
| Safety | No autonomous diagnosis/treatment wording |
| Authority | SYMPHONY remains reasoning authority |
| Boundary | No FHIR/orchestrator/taxonomy changes |
| Quality | Missingness and low-confidence states are visible |

---

## Verification commands

Package names must be adjusted to actual repository configuration.

```bash
pnpm --filter @the-abyss/shared-types build
pnpm --filter @the-abyss/shared-types test
pnpm --filter @the-abyss/intelligenceboard build
pnpm --filter @the-abyss/intelligenceboard test
pnpm --filter @the-abyss/sentra-assist build
pnpm --filter @the-abyss/sentra-assist test
pnpm lint
pnpm test
```

Boundary guard:

```bash
grep -R "ClinicalTrajectory" packages/fhir-engine apps/orchestrator flows || true
```

Expected result:

- no required CT implementation in `packages/fhir-engine`
- no CT orchestrator wiring
- no CT Langflow/flows wiring
- no diagnosis taxonomy changes

---

## V2 candidates

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

## Final product decision

ClinicalTrajectory v1 is approved conceptually as a **contract-first, UI-consumer-first longitudinal evidence layer**.

It must be implemented in this order:

1. CT spec finalization
2. shared-types contract
3. fixtures/mock data
4. Intelligenceboard surface
5. Sentra Assist compact card
6. shadow-review readiness hook

It must not expand into FHIR, orchestrator, diagnosis taxonomy, or backend engine work during v1.
