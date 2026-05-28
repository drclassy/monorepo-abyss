# AADI V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve `@sentra/nada` into the AADI V2 native diagnostic reasoning engine while reusing every relevant existing SYMPHONY clinical feature, preserving current safety authority, and keeping Dashboard/Assist as consumers.

**Architecture:** Build AADI V2 additively inside `packages/sentra/sentra-nada` using the existing deterministic stack as foundation. Sprint 1 creates the native reasoning spine from reused snapshot/symptom/pattern/composite/trajectory/classifier outputs. Sprint 2 turns that spine into clinician-usable output through arbiter, explainability, and clinical disposition while preserving alerts, protocols, trajectory, and traffic-light. Sprint 3 adds shadow comparison and regression gates. Sprint 4 adds consumer-facing interoperability adapters without shifting clinical authority out of SYMPHONY.

**Tech Stack:** TypeScript strict, vitest, pnpm workspace, `@the-abyss/shared-types`, existing `packages/sentra/sentra-nada` engine modules, `packages/clinical/clinical-references` as reference-only sibling package.

---

## Baseline Documents (MUST READ before implementing)

1. `docs/specs/aadi-v2/004-2026-04-27-aadi-v2-design.md`
2. `docs/specs/aadi-v2/005-2026-04-27-aadi-v2-feature-coverage-matrix.md`
3. `.agent/archive/references/FEATURE.md`
4. `.agent/HANDOFF.md`
5. `AGENTS.md`

## Non-Negotiable Constraints

- **No feature skip:** every clinically relevant existing SYMPHONY capability must be reused, wrapped, or explicitly replaced with parity proof.
- **Hierarchy lock:** `SYMPHONY` is the parent authority; Dashboard and Assist are consumers.
- **No parallel engine:** do not move reasoning authority into `sentra-rag`, any legacy retrieval package, or consumer apps.
- **No safety regression:** `alerts`, `trafficLight`, `trajectory`, `quality.auditHints`, and action protocols remain available throughout migration.
- **No contract confusion:** operational engine status stays separate from new clinical disposition status.
- **No DB / Prisma work in this plan.**
- **No Assist-only infrastructure migration into SYMPHONY:** anonymizer, scraper, content script, sidepanel infra stay in Assist.

## Mandatory Coverage Gate

Before starting any task in this plan:

- [ ] Open `.agent/archive/references/FEATURE.md`
- [ ] Open `docs/specs/aadi-v2/005-2026-04-27-aadi-v2-feature-coverage-matrix.md`
- [ ] Confirm affected features have mapping rows
- [ ] Update the matrix first if mapping is incomplete

Before closing any task group in this plan:

- [ ] `pnpm --filter @sentra/nada test`
- [ ] `pnpm --filter @sentra/nada typecheck`
- [ ] `pnpm --filter @sentra/nada lint`
- [ ] `runSymphonyParityFixtures()` path still green
- [ ] `runAssistPatternParityFixtures()` path still green

---

## File Structure Lock

This plan assumes the following additions inside `packages/sentra/sentra-nada`:

```text
packages/sentra/sentra-nada/src/
├── engine/
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
```

Shared contracts append inside:

```text
packages/shared/shared-types/src/symphony.ts
packages/shared/shared-types/src/index.ts
```

---

## Task 1: Extend Shared AADI V2 Contracts

**Files:**
- Modify: `packages/shared/shared-types/src/symphony.ts`
- Modify: `packages/shared/shared-types/src/index.ts`
- Modify: `packages/sentra/sentra-nada/src/index.ts`
- Test: `packages/sentra/sentra-nada/src/__tests__/contract.test.ts`

- [ ] **Step 1: Add failing contract tests for new AADI V2 output shape**

```typescript
// Append to packages/sentra/sentra-nada/src/__tests__/contract.test.ts
import { describe, expect, it } from 'vitest'
import type {
  SymphonyClinicalDisposition,
  SymphonyClinicalFact,
  SymphonyDiagnosticHypothesis,
  SymphonyResult,
} from '../index'

describe('AADI V2 contract extensions', () => {
  it('allows clinical disposition values', () => {
    const values: SymphonyClinicalDisposition[] = [
      'ok',
      'requires_review',
      'insufficient_data',
      'degraded',
    ]
    expect(values).toHaveLength(4)
  })

  it('supports native hypothesis and fact arrays on result', () => {
    const facts: SymphonyClinicalFact[] = [
      { key: 'fever', value: true, sourceRefs: ['symptom:chief_complaint'] },
    ]
    const hypotheses: SymphonyDiagnosticHypothesis[] = [
      {
        id: 'native-j18-1',
        icd10Code: 'J18.9',
        diagnosisName: 'Pneumonia, unspecified',
        rank: 1,
        confidence: 0.72,
        category: 'working',
        evidence: {
          supports: ['Demam', 'Batuk', 'Takipnea'],
          weakens: [],
          missing: ['Foto toraks'],
          nextBestQuestions: ['Apakah ada sesak progresif?'],
        },
        evidenceRefs: ['pattern:respiratory', 'news2:medium'],
      },
    ]

    const result = {} as SymphonyResult
    result.clinicalDisposition = 'requires_review'
    result.clinicalFacts = facts
    result.nativeHypotheses = hypotheses

    expect(result.clinicalDisposition).toBe('requires_review')
    expect(result.clinicalFacts?.[0]?.key).toBe('fever')
    expect(result.nativeHypotheses?.[0]?.category).toBe('working')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @sentra/nada test -- src/__tests__/contract.test.ts`
Expected: FAIL because the new shared types do not exist yet.

- [ ] **Step 3: Extend shared types with AADI V2 contracts**

```typescript
// Append to packages/shared/shared-types/src/symphony.ts
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

export interface SymphonyShadowComparison {
  oldPathAvailable: boolean
  newPathAvailable: boolean
  agreementLevel: 'high' | 'partial' | 'low' | 'not_comparable'
  topDiagnosisChanged: boolean
  escalationChanged: boolean
  clinicalDispositionChanged: boolean
  notes: string[]
}
```

- [ ] **Step 4: Extend `SymphonyResult` without removing existing output fields**

```typescript
// Replace the SymphonyResult interface block in packages/shared/shared-types/src/symphony.ts
export interface SymphonyResult {
  metadata: SymphonyMetadata
  clinicalDisposition?: SymphonyClinicalDisposition
  patientContext: SymphonyPatientContext
  latestVitals?: SymphonyVitalsInput
  diagnosisSuggestions: SymphonyDiagnosisSuggestion[]
  nativeHypotheses?: SymphonyDiagnosticHypothesis[]
  clinicalFacts?: SymphonyClinicalFact[]
  alerts: SymphonyAlert[]
  trafficLight?: SymphonyTrafficLightOutput
  trajectory: SymphonyTrajectorySummary
  quality: SymphonyQualitySummary
  shadowComparison?: SymphonyShadowComparison
}
```

- [ ] **Step 5: Re-export the new types**

```typescript
// packages/shared/shared-types/src/index.ts already exports './symphony' — no new line needed if unchanged.
// packages/sentra/sentra-nada/src/index.ts — append in the contract export block
  type SymphonyClinicalDisposition,
  type SymphonyClinicalFact,
  type SymphonyReasoningEvidence,
  type SymphonyDiagnosticHypothesis,
  type SymphonyShadowComparison,
```

- [ ] **Step 6: Run contract tests and typecheck**

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/contract.test.ts`
- `pnpm --filter @sentra/nada typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/shared-types/src/symphony.ts \
        packages/shared/shared-types/src/index.ts \
        packages/sentra/sentra-nada/src/index.ts \
        packages/sentra/sentra-nada/src/__tests__/contract.test.ts
git commit -m "feat(symphony): add AADI V2 shared contracts"
```

---

## Task 2: Build Clinical Facts from Existing Engines and the Existing Snapshot/Pattern Stack

**Files:**
- Create: `packages/sentra/sentra-nada/src/engine/clinical-facts.ts`
- Create: `packages/sentra/sentra-nada/src/__tests__/clinical-facts.test.ts`
- Modify: `packages/sentra/sentra-nada/src/index.ts`

- [ ] **Step 1: Write failing tests for feature reuse in `ClinicalFacts`**

```typescript
// packages/sentra/sentra-nada/src/__tests__/clinical-facts.test.ts
import { describe, expect, it } from 'vitest'
import {
  buildSymphonyClinicalFacts,
  type SymphonyAssessmentInput,
} from '../index'

describe('buildSymphonyClinicalFacts', () => {
  it('reuses symptom, snapshot-pattern, classifier, anaphylaxis, and trajectory signals', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'fact-1',
        requestedAt: '2026-04-27T10:00:00.000Z',
        caller: 'system',
      },
      patientContext: {
        encounterId: 'enc-1',
        patientRef: 'pat-1',
        ageYears: 54,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
      vitals: [
        {
          observedAt: '2026-04-27T09:40:00.000Z',
          systolicBp: 150,
          diastolicBp: 96,
          heartRate: 88,
          respiratoryRate: 18,
          temperatureC: 37.8,
          spo2: 95,
          consciousness: 'alert',
        },
        {
          observedAt: '2026-04-27T10:00:00.000Z',
          systolicBp: 170,
          diastolicBp: 104,
          heartRate: 112,
          respiratoryRate: 24,
          temperatureC: 38.4,
          spo2: 92,
          consciousness: 'alert',
        },
      ],
      chiefComplaint: 'demam dan sesak sejak tadi pagi',
      chronicDiseases: ['I10'],
    }

    const result = buildSymphonyClinicalFacts(input)
    const keys = result.facts.map(item => item.key)

    expect(keys).toContain('symptom_fever')
    expect(keys).toContain('symptom_dyspnea')
    expect(keys).toContain('htn_severity')
    expect(keys).toContain('pattern_alert_count')
    expect(keys).toContain('anaphylaxis_suspect')
    expect(keys).toContain('trajectory_direction')
    expect(result.snapshot.patient.age).toBe(54)
    expect(result.patternAlerts).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @sentra/nada test -- src/__tests__/clinical-facts.test.ts`
Expected: FAIL because `buildSymphonyClinicalFacts` is missing.

- [ ] **Step 3: Create the clinical facts builder using existing SYMPHONY modules**

```typescript
// packages/sentra/sentra-nada/src/engine/clinical-facts.ts
import type {
  SymphonyAlert,
  SymphonyAvpuLevel,
  SymphonyClinicalFact,
  SymphonyClinicalSnapshot,
  SymphonyGlucoseCategory,
  SymphonyHtnSeverity,
  SymphonyVitalsInput,
} from '../contracts'
import type { SymphonyAssessmentInput } from './assess'
import {
  classifySymphonyBloodGlucose,
  classifySymphonyChronicDisease,
  classifySymphonyHypertension,
  finalizeSymphonyBloodPressure,
  getSymphonyHypertensionSeverity,
} from './classifiers'
import { detectSymphonyAnaphylaxis, type SymphonyAnaphylaxisResult } from './anaphylaxis'
import { evaluateSymphonyCompositeDeterioration } from './composite-deterioration'
import { evaluateClinicalPatterns } from './clinical-patterns'
import { detectSymphonyEarlyWarningPatterns } from './early-warning'
import { calculateSymphonyNEWS2 } from './news2'
import { detectSymphonyPeSuspect, type SymphonyPeSuspectResult } from './pe-suspect'
import { evaluateSymphonyInstantScreeningGates } from './screening-gates'
import { detectSymphonySymptomSignals } from './symptom-signals'
import {
  analyzeSymphonyTrajectory,
  trajectoryDirectionFromAnalysis,
  trajectoryMomentumFromAnalysis,
} from './trajectory'

export interface SymphonyClinicalFactsResult {
  facts: SymphonyClinicalFact[]
  snapshot: SymphonyClinicalSnapshot
  screeningAlerts: SymphonyAlert[]
  patternAlerts: SymphonyAlert[]
  peSuspect: SymphonyPeSuspectResult
  anaphylaxis: SymphonyAnaphylaxisResult
  news2: ReturnType<typeof calculateSymphonyNEWS2>
  earlyWarnings: ReturnType<typeof detectSymphonyEarlyWarningPatterns>
  composite: ReturnType<typeof evaluateSymphonyCompositeDeterioration>
  trajectory: ReturnType<typeof analyzeSymphonyTrajectory>
}

function pushFact(
  facts: SymphonyClinicalFact[],
  key: string,
  value: string | number | boolean,
  sourceRefs: string[],
  confidence?: number,
): void {
  facts.push({ key, value, sourceRefs, confidence })
}

function latestVitals(vitals: SymphonyVitalsInput[]): SymphonyVitalsInput | undefined {
  return vitals.at(-1)
}

function toAvpu(consciousness: SymphonyVitalsInput['consciousness']): SymphonyAvpuLevel {
  switch (consciousness) {
    case 'alert':
      return 'A'
    case 'voice':
      return 'V'
    case 'pain':
      return 'P'
    default:
      return 'U'
  }
}

function toSnapshotGlucoseCategory(glucoseMgDl: number | undefined): SymphonyGlucoseCategory | undefined {
  if (glucoseMgDl === undefined) return undefined
  if (glucoseMgDl < 70) return 'hypoglycemic'
  if (glucoseMgDl >= 300) return 'severe_hyperglycemia'
  if (glucoseMgDl >= 200) return 'diabetic'
  if (glucoseMgDl >= 100) return 'prediabetic'
  return 'normal'
}

function toSnapshotHtnSeverity(latest: SymphonyVitalsInput | undefined): SymphonyHtnSeverity | undefined {
  if (latest?.systolicBp === undefined || latest.diastolicBp === undefined) return undefined
  return getSymphonyHypertensionSeverity({
    sbp: latest.systolicBp,
    dbp: latest.diastolicBp,
  })
}

function buildSnapshot(input: SymphonyAssessmentInput): SymphonyClinicalSnapshot {
  const latest = latestVitals(input.vitals)
  const symptoms = detectSymphonySymptomSignals({
    chiefComplaint: input.chiefComplaint ?? '',
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory?.join(' '),
  })
  const chronicClasses = (input.chronicDiseases ?? [])
    .map(code => classifySymphonyChronicDisease(code))
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return {
    vitals: {
      sbp: latest?.systolicBp ?? 120,
      dbp: latest?.diastolicBp ?? 80,
      hr: latest?.heartRate ?? 80,
      rr: latest?.respiratoryRate ?? 16,
      temp: latest?.temperatureC ?? 36.8,
      spo2: latest?.spo2 ?? 98,
      glucose: latest?.glucoseMgDl ?? 0,
    },
    derived: {
      map:
        latest?.systolicBp !== undefined && latest.diastolicBp !== undefined
          ? Math.round(latest.diastolicBp + (latest.systolicBp - latest.diastolicBp) / 3)
          : undefined,
      shockIndex:
        latest?.systolicBp !== undefined &&
        latest.heartRate !== undefined &&
        latest.systolicBp > 0
          ? Number((latest.heartRate / latest.systolicBp).toFixed(2))
          : undefined,
      avpuLevel: toAvpu(latest?.consciousness),
      htnSeverity: toSnapshotHtnSeverity(latest),
      glucoseCategory: toSnapshotGlucoseCategory(latest?.glucoseMgDl),
      hasHypotension: (latest?.systolicBp ?? 999) < 90,
      pulsePressure:
        latest?.systolicBp !== undefined && latest.diastolicBp !== undefined
          ? latest.systolicBp - latest.diastolicBp
          : undefined,
    },
    symptoms: {
      ...symptoms,
      dyspnea: symptoms.signals.includes('dyspnea'),
      chestPain: symptoms.signals.includes('chest_pain'),
      dizziness: symptoms.signals.includes('dizziness'),
      focalNeuroDeficit: symptoms.signals.includes('neurologic_focal_deficit'),
      kussmaulBreathing: symptoms.signals.includes('kussmaul_breathing'),
      polyuria: symptoms.signals.includes('polyuria'),
      seizure: symptoms.signals.includes('seizure'),
      suspectedInfection: symptoms.signals.includes('fever'),
      syncope: symptoms.signals.includes('syncope'),
      weakness: symptoms.signals.includes('weakness'),
    },
    history: {
      bpHistory: input.vitals
        .filter(item => item.systolicBp !== undefined && item.diastolicBp !== undefined)
        .map(item => ({
          sbp: item.systolicBp as number,
          dbp: item.diastolicBp as number,
          timestamp: new Date(item.observedAt).getTime(),
        })),
      knownHTN: chronicClasses.some(item => item.type === 'HT'),
      knownDM: chronicClasses.some(item => item.type === 'DM'),
      knownAsthma: chronicClasses.some(item => item.type === 'ASTHMA'),
      knownCOPD: Boolean(input.hasCOPD) || chronicClasses.some(item => item.type === 'PPOK'),
      pregnancyStatus:
        input.patientContext.pregnancyStatus === 'pregnant'
          ? true
          : input.patientContext.pregnancyStatus === 'not_pregnant' ||
              input.patientContext.pregnancyStatus === 'not_applicable'
            ? false
            : null,
      allergies: input.allergies ?? [],
      chronicDiseases: input.chronicDiseases ?? [],
    },
    patient: {
      age: input.patientContext.ageYears ?? 0,
      physiology:
        (input.patientContext.ageYears ?? 0) >= 65
          ? 'geriatric'
          : (input.patientContext.ageYears ?? 0) >= 18
            ? 'adult'
            : 'child',
      avpuManual: toAvpu(latest?.consciousness) === 'U' && latest?.consciousness === 'unknown' ? 'A' : toAvpu(latest?.consciousness),
      supplementalO2: latest?.oxygenSupplement ?? false,
      painScore: 0,
    },
    timestamp: latest ? new Date(latest.observedAt).getTime() : Date.now(),
  }
}

export function buildSymphonyClinicalFacts(
  input: SymphonyAssessmentInput,
): SymphonyClinicalFactsResult {
  const facts: SymphonyClinicalFact[] = []
  const latest = latestVitals(input.vitals)
  const snapshot = buildSnapshot(input)
  const symptoms = snapshot.symptoms
  const news2 = calculateSymphonyNEWS2({
    vitals: latest,
    hasCOPD: input.hasCOPD,
  })
  const screeningAlerts = evaluateSymphonyInstantScreeningGates({
    latestVitals: latest,
    ageYears: input.patientContext.ageYears,
    sexAtBirth: input.patientContext.sexAtBirth,
    pregnancyStatus: input.patientContext.pregnancyStatus,
    chiefComplaint: input.chiefComplaint,
    medicalHistory: input.medicalHistory,
  })
  const earlyWarnings = detectSymphonyEarlyWarningPatterns({
    latestVitals: latest,
    news2,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    ageYears: input.patientContext.ageYears,
    sexAtBirth: input.patientContext.sexAtBirth,
    pregnancyStatus: input.patientContext.pregnancyStatus,
  })
  const trajectory = analyzeSymphonyTrajectory(input.vitals)
  const pe = detectSymphonyPeSuspect({
    latestVitals: latest,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    pregnancyStatus: input.patientContext.pregnancyStatus,
  })
  const composite = evaluateSymphonyCompositeDeterioration({
    current: latest,
    hasCOPD: input.hasCOPD,
  })
  const anaphylaxis = detectSymphonyAnaphylaxis({
    latestVitals: latest,
    chiefComplaint: input.chiefComplaint,
    additionalComplaint: input.additionalComplaint,
    medicalHistory: input.medicalHistory,
    allergies: input.allergies,
    ageYears: input.patientContext.ageYears,
  })
  const patternAlerts = evaluateClinicalPatterns(
    snapshot,
    undefined,
    latest?.observedAt ?? input.metadata.requestedAt,
  )

  if (symptoms.signals.includes('fever')) {
    pushFact(facts, 'symptom_fever', true, ['symptom-signals'])
  }
  if (symptoms.signals.includes('dyspnea')) {
    pushFact(facts, 'symptom_dyspnea', true, ['symptom-signals'])
  }

  const bpReadings = input.vitals
    .filter(item => item.systolicBp !== undefined && item.diastolicBp !== undefined)
    .slice(-3)
    .map(item => ({
      sbp: item.systolicBp as number,
      dbp: item.diastolicBp as number,
      timestamp: new Date(item.observedAt),
    }))

  if (bpReadings.length >= 2) {
    const hypertension = classifySymphonyHypertension({
      readings: bpReadings,
      finalBp: finalizeSymphonyBloodPressure(bpReadings).finalBp,
      measurementQuality: finalizeSymphonyBloodPressure(bpReadings).measurementQuality,
    })
    pushFact(facts, 'htn_severity', hypertension.severity, ['classifiers'])
  }

  if (latest?.glucoseMgDl) {
    const glucose = classifySymphonyBloodGlucose({
      gds: latest.glucoseMgDl,
      sampleType: 'capillary',
      hasClassicSymptoms:
        symptoms.signals.includes('polyuria') ||
        symptoms.signals.includes('kussmaul_breathing'),
    })
    pushFact(facts, 'glucose_category', glucose.category, ['classifiers'])
  }

  pushFact(
    facts,
    'news2_risk',
    news2.riskLevel,
    ['news2'],
  )
  pushFact(
    facts,
    'screening_gate_count',
    screeningAlerts.length,
    ['screening-gates'],
  )
  pushFact(
    facts,
    'early_warning_count',
    earlyWarnings.length,
    ['early-warning'],
  )
  pushFact(
    facts,
    'pattern_alert_count',
    patternAlerts.length,
    ['clinical-patterns'],
  )
  pushFact(
    facts,
    'trajectory_direction',
    trajectoryDirectionFromAnalysis(trajectory),
    ['trajectory'],
  )
  pushFact(
    facts,
    'trajectory_momentum',
    trajectoryMomentumFromAnalysis(trajectory),
    ['trajectory'],
  )
  pushFact(
    facts,
    'composite_alert_count',
    composite.compositeAlerts.length,
    ['composite-deterioration'],
  )
  pushFact(
    facts,
    'pe_suspect',
    pe.suspect,
    ['pe-suspect'],
  )
  pushFact(
    facts,
    'anaphylaxis_suspect',
    anaphylaxis.suspect,
    ['anaphylaxis'],
  )

  return {
    facts,
    snapshot,
    screeningAlerts,
    patternAlerts,
    peSuspect: pe,
    anaphylaxis,
    news2,
    earlyWarnings,
    composite,
    trajectory,
  }
}
```

- [ ] **Step 4: Export the builder**

```typescript
// packages/sentra/sentra-nada/src/index.ts
export {
  buildSymphonyClinicalFacts,
  type SymphonyClinicalFactsResult,
} from './engine/clinical-facts'
```

- [ ] **Step 5: Run tests and typecheck**

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/clinical-facts.test.ts`
- `pnpm --filter @sentra/nada typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/sentra/sentra-nada/src/engine/clinical-facts.ts \
        packages/sentra/sentra-nada/src/__tests__/clinical-facts.test.ts \
        packages/sentra/sentra-nada/src/index.ts
git commit -m "feat(symphony): add AADI V2 clinical facts builder"
```

---

## Task 3: Add Syndrome Classification on Top of Clinical Facts

**Files:**
- Create: `packages/sentra/sentra-nada/src/engine/syndrome-classifier.ts`
- Create: `packages/sentra/sentra-nada/src/__tests__/syndrome-classifier.test.ts`
- Modify: `packages/sentra/sentra-nada/src/index.ts`

- [ ] **Step 1: Write failing syndrome-classifier tests**

```typescript
// packages/sentra/sentra-nada/src/__tests__/syndrome-classifier.test.ts
import { describe, expect, it } from 'vitest'
import { classifySymphonySyndromes } from '../index'

describe('classifySymphonySyndromes', () => {
  it('maps respiratory infection evidence into acute respiratory syndrome', () => {
    const result = classifySymphonySyndromes([
      { key: 'symptom_fever', value: true, sourceRefs: ['symptom-signals'] },
      { key: 'symptom_dyspnea', value: true, sourceRefs: ['symptom-signals'] },
      { key: 'news2_risk', value: 'medium', sourceRefs: ['news2'] },
    ])

    expect(result.map(item => item.id)).toContain('acute_respiratory_syndrome')
  })

  it('maps severe pressure and chronic context into cardiometabolic syndrome', () => {
    const result = classifySymphonySyndromes([
      { key: 'htn_severity', value: 'crisis', sourceRefs: ['classifiers'] },
      { key: 'trajectory_direction', value: 'worsening', sourceRefs: ['trajectory'] },
    ])

    expect(result.map(item => item.id)).toContain('acute_cardiometabolic_syndrome')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @sentra/nada test -- src/__tests__/syndrome-classifier.test.ts`
Expected: FAIL because `classifySymphonySyndromes` is missing.

- [ ] **Step 3: Implement deterministic syndrome classification**

```typescript
// packages/sentra/sentra-nada/src/engine/syndrome-classifier.ts
import type { SymphonyClinicalFact } from '../contracts'

export interface SymphonySyndromeMatch {
  id:
    | 'acute_febrile_syndrome'
    | 'acute_respiratory_syndrome'
    | 'acute_cardiometabolic_syndrome'
    | 'acute_neurologic_syndrome'
    | 'acute_allergy_syndrome'
    | 'maternal_fetal_risk_syndrome'
  confidence: number
  reasons: string[]
}

function hasFact(
  facts: readonly SymphonyClinicalFact[],
  key: string,
  predicate?: (value: string | number | boolean) => boolean,
): boolean {
  const found = facts.find(item => item.key === key)
  if (!found) return false
  return predicate ? predicate(found.value) : true
}

export function classifySymphonySyndromes(
  facts: readonly SymphonyClinicalFact[],
): SymphonySyndromeMatch[] {
  const matches: SymphonySyndromeMatch[] = []

  if (
    hasFact(facts, 'symptom_fever', value => value === true) &&
    hasFact(facts, 'symptom_dyspnea', value => value === true)
  ) {
    matches.push({
      id: 'acute_respiratory_syndrome',
      confidence: 0.76,
      reasons: ['Demam dengan gejala pernapasan akut.'],
    })
  }

  if (hasFact(facts, 'symptom_fever', value => value === true)) {
    matches.push({
      id: 'acute_febrile_syndrome',
      confidence: 0.62,
      reasons: ['Demam aktif terdeteksi.'],
    })
  }

  if (
    hasFact(facts, 'htn_severity', value => value === 'stage2' || value === 'crisis')
  ) {
    matches.push({
      id: 'acute_cardiometabolic_syndrome',
      confidence: 0.71,
      reasons: ['Hipertensi signifikan terdeteksi.'],
    })
  }

  return matches
}
```

- [ ] **Step 4: Export the classifier**

```typescript
// packages/sentra/sentra-nada/src/index.ts
export {
  classifySymphonySyndromes,
  type SymphonySyndromeMatch,
} from './engine/syndrome-classifier'
```

- [ ] **Step 5: Run tests and commit**

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/syndrome-classifier.test.ts`
- `pnpm --filter @sentra/nada typecheck`

Commit:

```bash
git add packages/sentra/sentra-nada/src/engine/syndrome-classifier.ts \
        packages/sentra/sentra-nada/src/__tests__/syndrome-classifier.test.ts \
        packages/sentra/sentra-nada/src/index.ts
git commit -m "feat(symphony): add AADI V2 syndrome classifier"
```

---

## Task 4: Create Diagnosis Packs and Native Differential

**Files:**
- Create: `packages/sentra/sentra-nada/src/engine/diagnosis-packs.ts`
- Create: `packages/sentra/sentra-nada/src/engine/native-differential.ts`
- Create: `packages/sentra/sentra-nada/src/__tests__/native-differential.test.ts`
- Modify: `packages/sentra/sentra-nada/src/index.ts`

- [ ] **Step 1: Write failing native differential test**

```typescript
// packages/sentra/sentra-nada/src/__tests__/native-differential.test.ts
import { describe, expect, it } from 'vitest'
import {
  buildSymphonyNativeDifferential,
  getSymphonyDiagnosisPacks,
} from '../index'

describe('buildSymphonyNativeDifferential', () => {
  it('ranks respiratory pack above generic febrile pack when dyspnea is present', () => {
    const packs = getSymphonyDiagnosisPacks()
    const result = buildSymphonyNativeDifferential({
      facts: [
        { key: 'symptom_fever', value: true, sourceRefs: ['symptom-signals'] },
        { key: 'symptom_dyspnea', value: true, sourceRefs: ['symptom-signals'] },
        { key: 'news2_risk', value: 'medium', sourceRefs: ['news2'] },
      ],
      syndromes: [
        { id: 'acute_respiratory_syndrome', confidence: 0.76, reasons: ['Respiratory syndrome'] },
        { id: 'acute_febrile_syndrome', confidence: 0.62, reasons: ['Febrile syndrome'] },
      ],
      packs,
    })

    expect(result.hypotheses[0]?.icd10Code).toBe('J18.9')
    expect(result.hypotheses[0]?.category).toBe('working')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @sentra/nada test -- src/__tests__/native-differential.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add deterministic diagnosis packs**

```typescript
// packages/sentra/sentra-nada/src/engine/diagnosis-packs.ts
export interface SymphonyDiagnosisPack {
  id: string
  icd10Code: string
  diagnosisName: string
  syndromeFamily:
    | 'acute_respiratory_syndrome'
    | 'acute_febrile_syndrome'
    | 'acute_cardiometabolic_syndrome'
  supportKeys: string[]
  weakenKeys: string[]
  mustNotMiss: boolean
  nextBestQuestions: string[]
}

const DIAGNOSIS_PACKS: readonly SymphonyDiagnosisPack[] = [
  {
    id: 'pack-pneumonia',
    icd10Code: 'J18.9',
    diagnosisName: 'Pneumonia, unspecified organism',
    syndromeFamily: 'acute_respiratory_syndrome',
    supportKeys: ['symptom_fever', 'symptom_dyspnea', 'news2_risk'],
    weakenKeys: [],
    mustNotMiss: false,
    nextBestQuestions: ['Apakah ada batuk produktif atau ronki?'],
  },
  {
    id: 'pack-sepsis',
    icd10Code: 'A41.9',
    diagnosisName: 'Sepsis, unspecified organism',
    syndromeFamily: 'acute_febrile_syndrome',
    supportKeys: ['symptom_fever', 'screening_gate_count', 'trajectory_direction'],
    weakenKeys: [],
    mustNotMiss: true,
    nextBestQuestions: ['Apakah ada sumber infeksi yang jelas atau penurunan perfusi?'],
  },
  {
    id: 'pack-htn-crisis',
    icd10Code: 'I10',
    diagnosisName: 'Hypertensive crisis context',
    syndromeFamily: 'acute_cardiometabolic_syndrome',
    supportKeys: ['htn_severity', 'trajectory_direction'],
    weakenKeys: [],
    mustNotMiss: true,
    nextBestQuestions: ['Apakah ada nyeri dada, defisit neurologis, atau gangguan penglihatan?'],
  },
] as const

export function getSymphonyDiagnosisPacks(): readonly SymphonyDiagnosisPack[] {
  return DIAGNOSIS_PACKS
}
```

- [ ] **Step 4: Implement native differential scoring**

```typescript
// packages/sentra/sentra-nada/src/engine/native-differential.ts
import type {
  SymphonyClinicalFact,
  SymphonyDiagnosticHypothesis,
} from '../contracts'
import type { SymphonySyndromeMatch } from './syndrome-classifier'
import type { SymphonyDiagnosisPack } from './diagnosis-packs'

export interface SymphonyNativeDifferentialInput {
  facts: readonly SymphonyClinicalFact[]
  syndromes: readonly SymphonySyndromeMatch[]
  packs: readonly SymphonyDiagnosisPack[]
}

export interface SymphonyNativeDifferentialResult {
  hypotheses: SymphonyDiagnosticHypothesis[]
}

function hasFact(facts: readonly SymphonyClinicalFact[], key: string): boolean {
  return facts.some(item => item.key === key)
}

export function buildSymphonyNativeDifferential(
  input: SymphonyNativeDifferentialInput,
): SymphonyNativeDifferentialResult {
  const hypotheses = input.packs
    .filter(pack => input.syndromes.some(item => item.id === pack.syndromeFamily))
    .map(pack => {
      const supportCount = pack.supportKeys.filter(key => hasFact(input.facts, key)).length
      const weakenCount = pack.weakenKeys.filter(key => hasFact(input.facts, key)).length
      const rawScore = 0.35 + supportCount * 0.16 - weakenCount * 0.08
      const confidence = Math.max(0, Math.min(0.95, rawScore))
      const category =
        pack.mustNotMiss && confidence >= 0.45
          ? 'must_not_miss'
          : confidence >= 0.58
            ? 'working'
            : confidence >= 0.33
              ? 'review'
              : 'deferred'

      return {
        id: `native-${pack.id}`,
        icd10Code: pack.icd10Code,
        diagnosisName: pack.diagnosisName,
        rank: 0,
        confidence,
        category,
        evidence: {
          supports: pack.supportKeys.filter(key => hasFact(input.facts, key)),
          weakens: pack.weakenKeys.filter(key => hasFact(input.facts, key)),
          missing: pack.supportKeys.filter(key => !hasFact(input.facts, key)),
          nextBestQuestions: pack.nextBestQuestions,
        },
        evidenceRefs: [`pack:${pack.id}`, `syndrome:${pack.syndromeFamily}`],
      } satisfies SymphonyDiagnosticHypothesis
    })
    .sort((left, right) => right.confidence - left.confidence)
    .map((item, index) => ({ ...item, rank: index + 1 }))

  return { hypotheses }
}
```

- [ ] **Step 5: Export both modules**

```typescript
// packages/sentra/sentra-nada/src/index.ts
export {
  getSymphonyDiagnosisPacks,
  type SymphonyDiagnosisPack,
} from './engine/diagnosis-packs'

export {
  buildSymphonyNativeDifferential,
  type SymphonyNativeDifferentialInput,
  type SymphonyNativeDifferentialResult,
} from './engine/native-differential'
```

- [ ] **Step 6: Run tests and commit**

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/native-differential.test.ts`
- `pnpm --filter @sentra/nada typecheck`

Commit:

```bash
git add packages/sentra/sentra-nada/src/engine/diagnosis-packs.ts \
        packages/sentra/sentra-nada/src/engine/native-differential.ts \
        packages/sentra/sentra-nada/src/__tests__/native-differential.test.ts \
        packages/sentra/sentra-nada/src/index.ts
git commit -m "feat(symphony): add AADI V2 diagnosis packs and native differential"
```

---

## Task 5: Add Reasoning Arbiter and Preserve Action Protocols

**Files:**
- Create: `packages/sentra/sentra-nada/src/engine/reasoning-arbiter.ts`
- Create: `packages/sentra/sentra-nada/src/__tests__/reasoning-arbiter.test.ts`
- Modify: `packages/sentra/sentra-nada/src/index.ts`

- [ ] **Step 1: Write failing arbiter tests**

```typescript
// packages/sentra/sentra-nada/src/__tests__/reasoning-arbiter.test.ts
import { describe, expect, it } from 'vitest'
import { arbitrateSymphonyReasoning } from '../index'

describe('arbitrateSymphonyReasoning', () => {
  it('preserves must-not-miss and alert protocols when acute danger is present', () => {
    const result = arbitrateSymphonyReasoning({
      nativeHypotheses: [
        {
          id: 'native-pack-sepsis',
          icd10Code: 'A41.9',
          diagnosisName: 'Sepsis, unspecified organism',
          rank: 1,
          confidence: 0.67,
          category: 'must_not_miss',
          evidence: {
            supports: ['symptom_fever'],
            weakens: [],
            missing: [],
            nextBestQuestions: [],
          },
          evidenceRefs: ['pack:pack-sepsis'],
        },
      ],
      hybridSuggestions: [],
      alerts: [
        {
          id: 'alert-sepsis',
          severity: 'critical',
          title: 'Sepsis alert',
          reasoning: ['qSOFA positif'],
          source: 'pattern',
          actionProtocolId: 'PROTO_SEPSIS',
          acknowledged: false,
          triggeredAt: '2026-04-27T10:00:00.000Z',
        },
      ],
    })

    expect(result.nativeHypotheses[0]?.category).toBe('must_not_miss')
    expect(result.alerts[0]?.actionProtocolId).toBe('PROTO_SEPSIS')
  })
})
```

- [ ] **Step 2: Implement arbiter**

```typescript
// packages/sentra/sentra-nada/src/engine/reasoning-arbiter.ts
import type {
  SymphonyAlert,
  SymphonyDiagnosisSuggestion,
  SymphonyDiagnosticHypothesis,
} from '../contracts'

export interface SymphonyReasoningArbiterInput {
  nativeHypotheses: readonly SymphonyDiagnosticHypothesis[]
  hybridSuggestions: readonly SymphonyDiagnosisSuggestion[]
  alerts: readonly SymphonyAlert[]
}

export interface SymphonyReasoningArbiterResult {
  nativeHypotheses: SymphonyDiagnosticHypothesis[]
  alerts: SymphonyAlert[]
  requiresReview: boolean
}

export function arbitrateSymphonyReasoning(
  input: SymphonyReasoningArbiterInput,
): SymphonyReasoningArbiterResult {
  const hasCriticalAlert = input.alerts.some(alert => alert.severity === 'critical')
  const nativeHypotheses = input.nativeHypotheses.map(item => {
    if (hasCriticalAlert && item.category === 'working') {
      return { ...item, category: 'review' as const }
    }
    return item
  })

  return {
    nativeHypotheses,
    alerts: [...input.alerts],
    requiresReview:
      hasCriticalAlert ||
      nativeHypotheses.some(item => item.category === 'must_not_miss' || item.category === 'review'),
  }
}
```

- [ ] **Step 3: Export, run tests, commit**

```typescript
// packages/sentra/sentra-nada/src/index.ts
export {
  arbitrateSymphonyReasoning,
  type SymphonyReasoningArbiterInput,
  type SymphonyReasoningArbiterResult,
} from './engine/reasoning-arbiter'
```

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/reasoning-arbiter.test.ts`
- `pnpm --filter @sentra/nada typecheck`

Commit:

```bash
git add packages/sentra/sentra-nada/src/engine/reasoning-arbiter.ts \
        packages/sentra/sentra-nada/src/__tests__/reasoning-arbiter.test.ts \
        packages/sentra/sentra-nada/src/index.ts
git commit -m "feat(symphony): add AADI V2 reasoning arbiter"
```

---

## Task 6: Add Explainability and Clinical Disposition Engine

**Files:**
- Create: `packages/sentra/sentra-nada/src/engine/explainability.ts`
- Create: `packages/sentra/sentra-nada/src/engine/confidence-engine.ts`
- Create: `packages/sentra/sentra-nada/src/__tests__/confidence-engine.test.ts`
- Modify: `packages/sentra/sentra-nada/src/index.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// packages/sentra/sentra-nada/src/__tests__/confidence-engine.test.ts
import { describe, expect, it } from 'vitest'
import {
  composeSymphonyExplainability,
  determineSymphonyClinicalDisposition,
} from '../index'

describe('AADI V2 explainability and clinical disposition', () => {
  it('marks requires_review when critical alerts coexist with coherent hypotheses', () => {
    const disposition = determineSymphonyClinicalDisposition({
      nativeHypothesisCount: 2,
      hasCriticalAlert: true,
      usedFallback: false,
    })
    expect(disposition).toBe('requires_review')
  })

  it('returns clinician-readable reasoning summary', () => {
    const lines = composeSymphonyExplainability({
      topDiagnosisName: 'Pneumonia, unspecified organism',
      supportKeys: ['symptom_fever', 'symptom_dyspnea'],
      missingKeys: ['photo_thorax'],
    })
    expect(lines[0]).toContain('Pneumonia')
    expect(lines.join(' ')).toContain('symptom_fever')
  })
})
```

- [ ] **Step 2: Implement explainability and disposition**

```typescript
// packages/sentra/sentra-nada/src/engine/explainability.ts
export interface SymphonyExplainabilityInput {
  topDiagnosisName: string
  supportKeys: string[]
  missingKeys: string[]
}

export function composeSymphonyExplainability(
  input: SymphonyExplainabilityInput,
): string[] {
  return [
    `Diagnosis utama saat ini: ${input.topDiagnosisName}.`,
    `Faktor pendukung: ${input.supportKeys.join(', ') || 'tidak ada'}.`,
    `Data yang masih dibutuhkan: ${input.missingKeys.join(', ') || 'tidak ada'}.`,
  ]
}
```

```typescript
// packages/sentra/sentra-nada/src/engine/confidence-engine.ts
import type { SymphonyClinicalDisposition } from '../contracts'

export interface SymphonyDispositionInput {
  nativeHypothesisCount: number
  hasCriticalAlert: boolean
  usedFallback: boolean
}

export function determineSymphonyClinicalDisposition(
  input: SymphonyDispositionInput,
): SymphonyClinicalDisposition {
  if (input.usedFallback) return 'degraded'
  if (input.nativeHypothesisCount === 0) return 'insufficient_data'
  if (input.hasCriticalAlert) return 'requires_review'
  return 'ok'
}
```

- [ ] **Step 3: Export, run tests, commit**

```typescript
// packages/sentra/sentra-nada/src/index.ts
export {
  composeSymphonyExplainability,
  type SymphonyExplainabilityInput,
} from './engine/explainability'

export {
  determineSymphonyClinicalDisposition,
  type SymphonyDispositionInput,
} from './engine/confidence-engine'
```

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/confidence-engine.test.ts`
- `pnpm --filter @sentra/nada typecheck`

Commit:

```bash
git add packages/sentra/sentra-nada/src/engine/explainability.ts \
        packages/sentra/sentra-nada/src/engine/confidence-engine.ts \
        packages/sentra/sentra-nada/src/__tests__/confidence-engine.test.ts \
        packages/sentra/sentra-nada/src/index.ts
git commit -m "feat(symphony): add AADI V2 explainability and clinical disposition"
```

---

## Task 7: Integrate AADI V2 into `assess.ts` Without Breaking Existing Outputs

**Files:**
- Modify: `packages/sentra/sentra-nada/src/engine/assess.ts`
- Create: `packages/sentra/sentra-nada/src/__tests__/aadi-v2.integration.test.ts`

- [ ] **Step 1: Write failing integration test**

```typescript
// packages/sentra/sentra-nada/src/__tests__/aadi-v2.integration.test.ts
import { describe, expect, it } from 'vitest'
import { assessSymphonyInput, type SymphonyAssessmentInput } from '../index'

describe('AADI V2 assess integration', () => {
  it('returns native hypotheses while preserving alerts, traffic-light, and trajectory', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'aadi-v2-int-1',
        requestedAt: '2026-04-27T10:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'enc-aadi-1',
        patientRef: 'pat-aadi-1',
        ageYears: 61,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
      vitals: [
        {
          observedAt: '2026-04-27T10:00:00.000Z',
          systolicBp: 175,
          diastolicBp: 106,
          heartRate: 114,
          respiratoryRate: 24,
          temperatureC: 38.6,
          spo2: 92,
          consciousness: 'alert',
        },
      ],
      chiefComplaint: 'demam dan sesak sejak tadi pagi',
      chronicDiseases: ['I10'],
    }

    const result = assessSymphonyInput(input)
    expect(result.nativeHypotheses?.length).toBeGreaterThan(0)
    expect(result.alerts.length).toBeGreaterThan(0)
    expect(result.trafficLight).toBeDefined()
    expect(result.trajectory).toBeDefined()
    expect(result.clinicalDisposition).toBeDefined()
  })
})
```

- [ ] **Step 2: Integrate AADI V2 modules into `assess.ts`**

```typescript
// packages/sentra/sentra-nada/src/engine/assess.ts — add imports
import { buildSymphonyClinicalFacts } from './clinical-facts'
import { determineSymphonyClinicalDisposition } from './confidence-engine'
import { getSymphonyDiagnosisPacks } from './diagnosis-packs'
import { composeSymphonyExplainability } from './explainability'
import { buildSymphonyNativeDifferential } from './native-differential'
import { arbitrateSymphonyReasoning } from './reasoning-arbiter'
import { classifySymphonySyndromes } from './syndrome-classifier'
```

```typescript
// packages/sentra/sentra-nada/src/engine/assess.ts — inside assessSymphonyInput before return
  const clinicalFacts = buildSymphonyClinicalFacts(input)
  const news2 = clinicalFacts.news2
  const peSuspect = clinicalFacts.peSuspect
  const anaphylaxis = clinicalFacts.anaphylaxis
  const trajectoryAnalysis = clinicalFacts.trajectory
  const compositeDeterioration = clinicalFacts.composite
  const compositeAlerts = compositeDeteriorationToSymphonyAlerts(compositeDeterioration)
  const peSuspectAlerts = peSuspectToSymphonyAlerts(
    peSuspect,
    latestVitals?.observedAt ?? input.metadata.requestedAt,
  )
  const anaphylaxisAlerts = anaphylaxisToSymphonyAlerts(
    anaphylaxis,
    latestVitals?.observedAt ?? input.metadata.requestedAt,
  )
  const news2Alerts = news2ToSymphonyAlerts(
    news2,
    latestVitals?.observedAt ?? input.metadata.requestedAt,
  )
  const patternAlerts = [
    ...clinicalFacts.patternAlerts,
    ...earlyWarningsToSymphonyAlerts(
      clinicalFacts.earlyWarnings,
      latestVitals?.observedAt ?? input.metadata.requestedAt,
    ),
  ]
  const alertsBeforeTrafficLight = [
    ...vitalAlerts,
    ...clinicalFacts.screeningAlerts,
    ...peSuspectAlerts,
    ...anaphylaxisAlerts,
    ...compositeAlerts,
    ...news2Alerts,
    ...patternAlerts,
  ]

  const syndromes = classifySymphonySyndromes(clinicalFacts.facts)
  const nativeDifferential = buildSymphonyNativeDifferential({
    facts: clinicalFacts.facts,
    syndromes,
    packs: getSymphonyDiagnosisPacks(),
  })
  const reasoning = arbitrateSymphonyReasoning({
    nativeHypotheses: nativeDifferential.hypotheses,
    hybridSuggestions: hybridDecisioning.suggestions,
    alerts: trafficLightAlert
      ? [...alertsBeforeTrafficLight, trafficLightAlert]
      : alertsBeforeTrafficLight,
  })
  const hasCriticalAlert = reasoning.alerts.some(alert => alert.severity === 'critical')
  const clinicalDisposition = determineSymphonyClinicalDisposition({
    nativeHypothesisCount: reasoning.nativeHypotheses.length,
    hasCriticalAlert,
    usedFallback: false,
  })
  const rationale = reasoning.nativeHypotheses[0]
    ? composeSymphonyExplainability({
        topDiagnosisName: reasoning.nativeHypotheses[0].diagnosisName,
        supportKeys: reasoning.nativeHypotheses[0].evidence.supports,
        missingKeys: reasoning.nativeHypotheses[0].evidence.missing,
      })
    : ['Belum ada hipotesis diagnosis native yang cukup kuat.']
```

```typescript
// packages/sentra/sentra-nada/src/engine/assess.ts — replace return metadata/result sections
    metadata: {
      engineVersion: SYMPHONY_ENGINE_VERSION,
      contractVersion: SYMPHONY_CONTRACT_VERSION,
      generatedAt: input.metadata.requestedAt,
      status: 'ready',
      confidenceBand:
        reasoning.nativeHypotheses[0]?.confidence !== undefined
          ? reasoning.nativeHypotheses[0].confidence >= 0.75
            ? 'high'
            : reasoning.nativeHypotheses[0].confidence >= 0.5
              ? 'moderate'
              : 'low'
          : 'insufficient_data',
      rationale,
    },
    clinicalDisposition,
    patientContext: input.patientContext,
    latestVitals,
    diagnosisSuggestions: hybridDecisioning.suggestions,
    nativeHypotheses: reasoning.nativeHypotheses,
    clinicalFacts: clinicalFacts.facts,
    alerts: reasoning.alerts,
```

- [ ] **Step 3: Run integration and full package verification**

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/aadi-v2.integration.test.ts`
- `pnpm --filter @sentra/nada test`
- `pnpm --filter @sentra/nada typecheck`
- `pnpm --filter @sentra/nada lint`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/sentra/sentra-nada/src/engine/assess.ts \
        packages/sentra/sentra-nada/src/__tests__/aadi-v2.integration.test.ts
git commit -m "feat(symphony): integrate AADI V2 native path into assess"
```

---

## Task 8: Add Shadow Comparison and Keep Hybrid Path Visible

**Files:**
- Create: `packages/sentra/sentra-nada/src/engine/shadow-compare.ts`
- Create: `packages/sentra/sentra-nada/src/__tests__/shadow-compare.test.ts`
- Modify: `packages/sentra/sentra-nada/src/engine/assess.ts`
- Modify: `packages/sentra/sentra-nada/src/index.ts`

- [ ] **Step 1: Write failing shadow comparison test**

```typescript
// packages/sentra/sentra-nada/src/__tests__/shadow-compare.test.ts
import { describe, expect, it } from 'vitest'
import { compareSymphonyShadowPaths } from '../index'

describe('compareSymphonyShadowPaths', () => {
  it('flags top-diagnosis and clinical-disposition changes between old and new paths', () => {
    const result = compareSymphonyShadowPaths({
      oldTopIcd10: 'I10',
      newTopIcd10: 'J18.9',
      oldTrafficLight: 'YELLOW',
      newTrafficLight: 'YELLOW',
      oldRequiresMoreData: true,
      newClinicalDisposition: 'requires_review',
    })

    expect(result.topDiagnosisChanged).toBe(true)
    expect(result.clinicalDispositionChanged).toBe(true)
    expect(result.agreementLevel).toBe('partial')
  })
})
```

- [ ] **Step 2: Implement shadow comparison**

```typescript
// packages/sentra/sentra-nada/src/engine/shadow-compare.ts
import type {
  SymphonyClinicalDisposition,
  SymphonyShadowComparison,
  SymphonyTrafficLightLevel,
} from '../contracts'

export interface SymphonyShadowCompareInput {
  oldTopIcd10?: string
  newTopIcd10?: string
  oldRequiresMoreData?: boolean
  newClinicalDisposition?: SymphonyClinicalDisposition
  oldTrafficLight?: SymphonyTrafficLightLevel
  newTrafficLight?: SymphonyTrafficLightLevel
}

export function compareSymphonyShadowPaths(
  input: SymphonyShadowCompareInput,
): SymphonyShadowComparison {
  const topDiagnosisChanged =
    input.oldTopIcd10 !== undefined &&
    input.newTopIcd10 !== undefined &&
    input.oldTopIcd10 !== input.newTopIcd10

  const escalationChanged =
    input.oldTrafficLight !== undefined &&
    input.newTrafficLight !== undefined &&
    input.oldTrafficLight !== input.newTrafficLight

  const oldClinicalDisposition =
    input.oldRequiresMoreData === undefined
      ? undefined
      : input.oldRequiresMoreData
        ? 'requires_review'
        : 'ok'

  const clinicalDispositionChanged =
    oldClinicalDisposition !== undefined &&
    input.newClinicalDisposition !== undefined &&
    oldClinicalDisposition !== input.newClinicalDisposition

  const agreementLevel =
    !topDiagnosisChanged && !escalationChanged && !clinicalDispositionChanged
      ? 'high'
      : topDiagnosisChanged && escalationChanged && clinicalDispositionChanged
        ? 'low'
        : 'partial'

  return {
    oldPathAvailable: input.oldTopIcd10 !== undefined || input.oldTrafficLight !== undefined,
    newPathAvailable: input.newTopIcd10 !== undefined || input.newTrafficLight !== undefined,
    agreementLevel,
    topDiagnosisChanged,
    escalationChanged,
    clinicalDispositionChanged,
    notes: [
      `old_top:${input.oldTopIcd10 ?? 'none'}`,
      `new_top:${input.newTopIcd10 ?? 'none'}`,
      `old_disposition:${oldClinicalDisposition ?? 'none'}`,
      `new_disposition:${input.newClinicalDisposition ?? 'none'}`,
      `old_tl:${input.oldTrafficLight ?? 'none'}`,
      `new_tl:${input.newTrafficLight ?? 'none'}`,
    ],
  }
}
```

- [ ] **Step 3: Attach shadow comparison to `assess.ts`**

```typescript
// packages/sentra/sentra-nada/src/engine/assess.ts — add import
import { compareSymphonyShadowPaths } from './shadow-compare'
```

```typescript
// packages/sentra/sentra-nada/src/engine/assess.ts — before return
  const shadowComparison = compareSymphonyShadowPaths({
    oldTopIcd10: hybridDecisioning.suggestions[0]?.icd10Code,
    newTopIcd10: reasoning.nativeHypotheses[0]?.icd10Code,
    oldRequiresMoreData: hybridDecisioning.requiresMoreData,
    newClinicalDisposition: clinicalDisposition,
    oldTrafficLight: trafficLight?.level,
    newTrafficLight: trafficLight?.level,
  })
```

```typescript
// packages/sentra/sentra-nada/src/engine/assess.ts — add to return
    shadowComparison,
```

- [ ] **Step 4: Export, verify, and commit**

```typescript
// packages/sentra/sentra-nada/src/index.ts
export {
  compareSymphonyShadowPaths,
  type SymphonyShadowCompareInput,
} from './engine/shadow-compare'
```

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/shadow-compare.test.ts`
- `pnpm --filter @sentra/nada test`
- `pnpm --filter @sentra/nada typecheck`

Commit:

```bash
git add packages/sentra/sentra-nada/src/engine/shadow-compare.ts \
        packages/sentra/sentra-nada/src/__tests__/shadow-compare.test.ts \
        packages/sentra/sentra-nada/src/engine/assess.ts \
        packages/sentra/sentra-nada/src/index.ts
git commit -m "feat(symphony): add AADI V2 shadow comparison"
```

---

## Task 9: Add Verification Gate for Existing Parity Suites

**Files:**
- Modify: `packages/sentra/sentra-nada/src/__tests__/aadi-v2.integration.test.ts`
- Modify: `packages/sentra/sentra-nada/src/engine/parity-fixtures.ts` (only if helper export is needed)

- [ ] **Step 1: Add failing verification smoke test for parity suites**

```typescript
// Append to packages/sentra/sentra-nada/src/__tests__/aadi-v2.integration.test.ts
import {
  runAssistPatternParityFixtures,
  runSymphonyParityFixtures,
} from '../index'

it('keeps existing parity fixtures green', () => {
  const symphonyParity = runSymphonyParityFixtures()
  const assistParity = runAssistPatternParityFixtures()

  expect(symphonyParity.every(item => item.pass)).toBe(true)
  expect(assistParity.every(item => item.pass)).toBe(true)
})
```

- [ ] **Step 2: Run tests, inspect failures, and only fix additive AADI V2 regressions**

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/aadi-v2.integration.test.ts`

Expected: If it fails, only additive AADI V2 regressions should be fixed. Do not loosen parity expectations to make the test pass.

- [ ] **Step 3: Run full verification suite**

Run:
- `pnpm --filter @sentra/nada test`
- `pnpm --filter @sentra/nada typecheck`
- `pnpm --filter @sentra/nada lint`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/sentra/sentra-nada/src/__tests__/aadi-v2.integration.test.ts \
        packages/sentra/sentra-nada/src/engine/parity-fixtures.ts
git commit -m "test(symphony): enforce parity gates for AADI V2 milestones"
```

---

## Task 10: Add Interoperability Adapter Stubs Without Moving Core Logic

**Files:**
- Create: `packages/sentra/sentra-nada/src/engine/interoperability.ts`
- Modify: `packages/sentra/sentra-nada/src/index.ts`

- [ ] **Step 1: Write failing test for FHIR-ish mapping helper**

```typescript
// Append to packages/sentra/sentra-nada/src/__tests__/contract.test.ts
import { mapSymphonyResultToInteroperabilityEnvelope } from '../index'

it('maps result into interoperability envelope without changing core reasoning', () => {
  const envelope = mapSymphonyResultToInteroperabilityEnvelope({
    metadata: {
      engineVersion: '0.0.1',
      contractVersion: '0.6.0',
      generatedAt: '2026-04-27T10:00:00.000Z',
      status: 'ready',
      confidenceBand: 'moderate',
      rationale: ['test'],
    },
    patientContext: {
      encounterId: 'enc-interop-1',
      patientRef: 'pat-interop-1',
    },
    diagnosisSuggestions: [],
    alerts: [],
    trajectory: {
      direction: 'stable',
      momentum: 'flat',
      summary: 'stable',
      evidenceRefs: [],
    },
    quality: {
      completenessScore: 1,
      missingFields: [],
      safetyFlags: [],
      auditHints: [],
    },
  })

  expect(envelope.resourceType).toBe('GuidanceResponse')
})
```

- [ ] **Step 2: Add minimal interoperability adapter**

```typescript
// packages/sentra/sentra-nada/src/engine/interoperability.ts
import type { SymphonyResult } from '../contracts'

export interface SymphonyInteroperabilityEnvelope {
  resourceType: 'GuidanceResponse'
  status: 'success'
  moduleUri: string
  subject: {
    reference: string
  }
  note: string[]
}

export function mapSymphonyResultToInteroperabilityEnvelope(
  result: SymphonyResult,
): SymphonyInteroperabilityEnvelope {
  return {
    resourceType: 'GuidanceResponse',
    status: 'success',
    moduleUri: '@sentra/nada/aadi-v2',
    subject: {
      reference: result.patientContext.patientRef,
    },
    note: result.metadata.rationale,
  }
}
```

- [ ] **Step 3: Export, verify, and commit**

```typescript
// packages/sentra/sentra-nada/src/index.ts
export {
  mapSymphonyResultToInteroperabilityEnvelope,
  type SymphonyInteroperabilityEnvelope,
} from './engine/interoperability'
```

Run:
- `pnpm --filter @sentra/nada test -- src/__tests__/contract.test.ts`
- `pnpm --filter @sentra/nada typecheck`

Commit:

```bash
git add packages/sentra/sentra-nada/src/engine/interoperability.ts \
        packages/sentra/sentra-nada/src/index.ts \
        packages/sentra/sentra-nada/src/__tests__/contract.test.ts
git commit -m "feat(symphony): add AADI V2 interoperability adapter"
```

---

## Plan Self-Review

### Spec Coverage

- Native reasoning spine: covered by Tasks 2, 3, 4
- Reuse of existing SYMPHONY foundation: covered by Tasks 2, 7, 9
- Explainability and clinical disposition: covered by Task 6
- Shadow comparison: covered by Task 8
- Interoperability adapter: covered by Task 10
- No-regression and parity enforcement: covered by Task 9

### Feature Coverage Gate

Every major feature group from `docs/specs/aadi-v2/005-2026-04-27-aadi-v2-feature-coverage-matrix.md` is represented by at least one task:

- `NEWS2`, `vital-alerts`, `screening-gates`: Task 2 and Task 7
- `symptom-signals`, `pattern-engine`, `clinical-patterns`: Task 2, 3, 4
- `trajectory`, `composite-deterioration`, `classifiers`: Task 2 and Task 7
- `action-protocols`, `traffic-light`: Task 5 and Task 7
- `hybrid-decisioning`, parity fixtures: Task 8 and Task 9

### Placeholder Scan

No `TBD`, `TODO`, or deferred code placeholders exist inside implementation
steps. Deferred scope lives only in the coverage matrix and spec, not as
unfinished step text.

---

## Execution Order Recommendation

Recommended execution sequence:

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9
10. Task 10

This sequence preserves TDD order and minimizes churn in `assess.ts`.
