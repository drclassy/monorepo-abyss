// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  SymphonyClinicalDisposition,
  SymphonyResult,
  SymphonyShadowComparison,
  SymphonyTrafficLightLevel,
} from '../contracts'

import { assessSymphonyInput, type SymphonyAssessmentInput } from './assess'

export interface SymphonyAadiV2ParityFixtureCase {
  id: string
  description: string
  input: SymphonyAssessmentInput
}

export interface SymphonyAadiV2ParityObservation {
  id: string
  shadowComparison: SymphonyShadowComparison
  oldTrafficLightLevel: SymphonyTrafficLightLevel | null
  newTrafficLightLevel: SymphonyTrafficLightLevel | null
  oldClinicalDisposition: SymphonyClinicalDisposition | null
  newClinicalDisposition: SymphonyClinicalDisposition
  pipelineFailed: boolean
}

export interface SymphonyAadiV2ParityGate {
  id: string
  description: string
  passed: boolean
  failureDetail: string | null
}

export interface SymphonyAadiV2ParityReport {
  totalFixtures: number
  comparableCount: number
  agreementHistogram: Record<SymphonyShadowComparison['agreementLevel'], number>
  topDiagnosisChangedCount: number
  escalationChangedCount: number
  clinicalDispositionChangedCount: number
  unsafeEscalationDowngrades: number
  unsafeDispositionDowngrades: number
  pipelineFailureCount: number
  observations: SymphonyAadiV2ParityObservation[]
  gates: SymphonyAadiV2ParityGate[]
  verdict: 'pass' | 'fail'
}

const TRAFFIC_LIGHT_RANK: Record<SymphonyTrafficLightLevel, number> = {
  GREEN: 0,
  YELLOW: 1,
  RED: 2,
}

const CLINICAL_DISPOSITION_RANK: Record<SymphonyClinicalDisposition, number> = {
  ok: 0,
  insufficient_data: 1,
  requires_review: 2,
  degraded: 1,
}

function parseNote(notes: readonly string[], prefix: string): string | null {
  const found = notes.find((note) => note.startsWith(prefix))
  if (!found) return null
  return found.slice(prefix.length)
}

function parseTrafficLightLevel(value: string | null): SymphonyTrafficLightLevel | null {
  if (value === 'GREEN' || value === 'YELLOW' || value === 'RED') return value
  return null
}

function parseClinicalDisposition(value: string | null): SymphonyClinicalDisposition | null {
  if (
    value === 'ok' ||
    value === 'requires_review' ||
    value === 'insufficient_data' ||
    value === 'degraded'
  ) {
    return value
  }
  return null
}

export function buildSymphonyAadiV2ParityObservation(
  id: string,
  result: SymphonyResult
): SymphonyAadiV2ParityObservation {
  const shadow = result.shadowComparison ?? {
    oldPathAvailable: false,
    newPathAvailable: false,
    agreementLevel: 'not_comparable' as const,
    topDiagnosisChanged: false,
    escalationChanged: false,
    clinicalDispositionChanged: false,
    notes: [],
  }
  const oldTrafficLightLevel = parseTrafficLightLevel(parseNote(shadow.notes, 'old_escalation:'))
  const newTrafficLightLevel = parseTrafficLightLevel(parseNote(shadow.notes, 'new_escalation:'))
  const oldClinicalDisposition = parseClinicalDisposition(
    parseNote(shadow.notes, 'old_disposition:')
  )
  const pipelineFailed = parseNote(shadow.notes, 'new_path_failed:') === '1'
  return {
    id,
    shadowComparison: shadow,
    oldTrafficLightLevel,
    newTrafficLightLevel,
    oldClinicalDisposition,
    newClinicalDisposition: result.clinicalDisposition ?? 'insufficient_data',
    pipelineFailed,
  }
}

function isUnsafeEscalationDowngrade(observation: SymphonyAadiV2ParityObservation): boolean {
  if (!observation.oldTrafficLightLevel || !observation.newTrafficLightLevel) {
    return false
  }
  return (
    TRAFFIC_LIGHT_RANK[observation.newTrafficLightLevel] <
    TRAFFIC_LIGHT_RANK[observation.oldTrafficLightLevel]
  )
}

function isUnsafeDispositionDowngrade(observation: SymphonyAadiV2ParityObservation): boolean {
  if (observation.oldClinicalDisposition === null) return false
  return (
    CLINICAL_DISPOSITION_RANK[observation.oldClinicalDisposition] === 2 &&
    CLINICAL_DISPOSITION_RANK[observation.newClinicalDisposition] === 0
  )
}

export function verifySymphonyAadiV2Parity(
  fixtures: readonly SymphonyAadiV2ParityFixtureCase[]
): SymphonyAadiV2ParityReport {
  const observations = fixtures.map((fixture) =>
    buildSymphonyAadiV2ParityObservation(fixture.id, assessSymphonyInput(fixture.input))
  )

  const agreementHistogram: SymphonyAadiV2ParityReport['agreementHistogram'] = {
    high: 0,
    partial: 0,
    low: 0,
    not_comparable: 0,
  }
  let topDiagnosisChangedCount = 0
  let escalationChangedCount = 0
  let clinicalDispositionChangedCount = 0
  let unsafeEscalationDowngrades = 0
  let unsafeDispositionDowngrades = 0
  let pipelineFailureCount = 0
  let comparableCount = 0

  observations.forEach((observation) => {
    agreementHistogram[observation.shadowComparison.agreementLevel] += 1
    if (observation.shadowComparison.agreementLevel !== 'not_comparable') {
      comparableCount += 1
    }
    if (observation.shadowComparison.topDiagnosisChanged) topDiagnosisChangedCount += 1
    if (observation.shadowComparison.escalationChanged) escalationChangedCount += 1
    if (observation.shadowComparison.clinicalDispositionChanged) {
      clinicalDispositionChangedCount += 1
    }
    if (isUnsafeEscalationDowngrade(observation)) unsafeEscalationDowngrades += 1
    if (isUnsafeDispositionDowngrade(observation)) unsafeDispositionDowngrades += 1
    if (observation.pipelineFailed) pipelineFailureCount += 1
  })

  const gates: SymphonyAadiV2ParityGate[] = [
    {
      id: 'AADIV2_PARITY_GATE_A_NO_LOW_AGREEMENT',
      description: 'No comparable fixture may produce agreementLevel="low".',
      passed: agreementHistogram.low === 0,
      failureDetail:
        agreementHistogram.low === 0
          ? null
          : `${agreementHistogram.low} fixture(s) produced low agreement`,
    },
    {
      id: 'AADIV2_PARITY_GATE_B_NO_UNSAFE_ESCALATION_DOWNGRADE',
      description:
        'New path traffic-light level must never rank lower than the old path level (no GREEN-after-RED, etc.).',
      passed: unsafeEscalationDowngrades === 0,
      failureDetail:
        unsafeEscalationDowngrades === 0
          ? null
          : `${unsafeEscalationDowngrades} fixture(s) downgraded escalation unsafely`,
    },
    {
      id: 'AADIV2_PARITY_GATE_C_NO_UNSAFE_DISPOSITION_DOWNGRADE',
      description:
        'New path clinical disposition must not silently downgrade requires_review to ok.',
      passed: unsafeDispositionDowngrades === 0,
      failureDetail:
        unsafeDispositionDowngrades === 0
          ? null
          : `${unsafeDispositionDowngrades} fixture(s) downgraded disposition unsafely`,
    },
    {
      id: 'AADIV2_PARITY_GATE_D_NO_PIPELINE_FAILURE',
      description: 'AADI V2 native pipeline must not fail across canonical fixtures.',
      passed: pipelineFailureCount === 0,
      failureDetail:
        pipelineFailureCount === 0
          ? null
          : `${pipelineFailureCount} fixture(s) hit pipeline failure`,
    },
  ]

  const verdict: SymphonyAadiV2ParityReport['verdict'] = gates.every((gate) => gate.passed)
    ? 'pass'
    : 'fail'

  return {
    totalFixtures: fixtures.length,
    comparableCount,
    agreementHistogram,
    topDiagnosisChangedCount,
    escalationChangedCount,
    clinicalDispositionChangedCount,
    unsafeEscalationDowngrades,
    unsafeDispositionDowngrades,
    pipelineFailureCount,
    observations,
    gates,
    verdict,
  }
}

export const SYMPHONY_AADI_V2_PARITY_FIXTURE_CASES: SymphonyAadiV2ParityFixtureCase[] = [
  {
    id: 'baseline-empty-input',
    description:
      'Empty vitals + no chief complaint — both paths produce nothing; expected not_comparable.',
    input: {
      metadata: {
        requestId: 'aadi-v2-parity-empty',
        requestedAt: '2026-04-27T10:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-empty',
        patientRef: 'patient-empty',
        ageYears: 40,
        sexAtBirth: 'female',
      },
      vitals: [],
    },
  },
  {
    id: 'febrile-dyspnea-presentation',
    description:
      'Febrile dyspnea with elevated NEWS2 — exercises pneumonia/sepsis pack against hybrid path.',
    input: {
      metadata: {
        requestId: 'aadi-v2-parity-febrile',
        requestedAt: '2026-04-27T10:05:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-febrile',
        patientRef: 'patient-febrile',
        ageYears: 62,
        sexAtBirth: 'male',
      },
      chiefComplaint: 'demam tinggi dan sesak napas berat sejak kemarin',
      vitals: [
        {
          observedAt: '2026-04-27T09:55:00.000Z',
          heartRate: 122,
          respiratoryRate: 28,
          systolicBp: 102,
          diastolicBp: 64,
          temperatureC: 39.2,
          spo2: 90,
          consciousness: 'alert',
        },
      ],
    },
  },
  {
    id: 'hypertensive-presentation',
    description:
      'Stage-2 hypertension presentation — exercises htn-crisis pack and old/new disposition divergence.',
    input: {
      metadata: {
        requestId: 'aadi-v2-parity-htn',
        requestedAt: '2026-04-27T10:10:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-htn',
        patientRef: 'patient-htn',
        ageYears: 58,
        sexAtBirth: 'male',
      },
      chiefComplaint: 'sakit kepala dan tekanan darah tinggi',
      vitals: [
        {
          observedAt: '2026-04-27T09:50:00.000Z',
          heartRate: 92,
          respiratoryRate: 18,
          systolicBp: 188,
          diastolicBp: 118,
          temperatureC: 36.8,
          spo2: 97,
          consciousness: 'alert',
        },
        {
          observedAt: '2026-04-27T10:00:00.000Z',
          heartRate: 95,
          respiratoryRate: 18,
          systolicBp: 192,
          diastolicBp: 120,
          temperatureC: 36.9,
          spo2: 97,
          consciousness: 'alert',
        },
      ],
    },
  },
  {
    id: 'sepsis-presentation-with-hybrid-candidate',
    description:
      'Sepsis presentation with explicit hybrid diagnosis candidate — exercises agreement pathway when both paths converge.',
    input: {
      metadata: {
        requestId: 'aadi-v2-parity-sepsis',
        requestedAt: '2026-04-27T10:15:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-sepsis',
        patientRef: 'patient-sepsis',
        ageYears: 70,
        sexAtBirth: 'female',
      },
      chiefComplaint: 'demam tinggi dan kelemahan, kemungkinan infeksi',
      vitals: [
        {
          observedAt: '2026-04-27T10:00:00.000Z',
          heartRate: 130,
          respiratoryRate: 26,
          systolicBp: 88,
          diastolicBp: 56,
          temperatureC: 39.4,
          spo2: 92,
          consciousness: 'alert',
        },
      ],
      diagnosisCandidates: [
        {
          icd10Code: 'A41.9',
          diagnosisName: 'Sepsis, unspecified organism',
          confidence: 0.74,
          keyReasons: ['Demam tinggi, takikardia, hipotensi'],
        },
      ],
    },
  },
]

export function runSymphonyAadiV2ParityFixtures(
  fixtures: readonly SymphonyAadiV2ParityFixtureCase[] = SYMPHONY_AADI_V2_PARITY_FIXTURE_CASES
): SymphonyAadiV2ParityReport {
  return verifySymphonyAadiV2Parity(fixtures)
}
