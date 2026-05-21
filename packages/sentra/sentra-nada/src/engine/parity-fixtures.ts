// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import {
  adaptAssistPatternToSymphonyAlert,
  assistPatternAlertId,
  ASSIST_PATTERN_PARITY_DEFINITIONS,
  type AssistPatternParityCriterion,
  type AssistPatternParityDefinition,
  type AssistPatternParityId,
} from '../adapters/assist-patterns-parity'
import type {
  SymphonyAlert,
  SymphonyPregnancyStatus,
  SymphonyResult,
  SymphonySexAtBirth,
  SymphonyVitalsInput,
} from '../contracts'

import { assessSymphonyInput, type SymphonyAssessmentInput } from './assess'

export interface SymphonyParitySnapshot {
  news2Score: number | null
  news2Risk: string | null
  alertIds: string[]
  alertSources: string[]
  criticalAlertCount: number
  diagnosisCategories: string[]
  trajectoryDirection: string
  trajectoryMomentum: string
  auditHints: string[]
}

export interface SymphonyParityExpectation {
  news2Score?: number
  news2Risk?: string
  requiredAlertIds?: string[]
  requiredAlertSources?: string[]
  criticalAlertCountAtLeast?: number
  diagnosisCategories?: string[]
  trajectoryDirection?: string
  trajectoryMomentum?: string
  requiredAuditHints?: string[]
}

export interface SymphonyParityFixtureCase {
  id: string
  description: string
  input: SymphonyAssessmentInput
  expected: SymphonyParityExpectation
  assistPatternId?: AssistPatternParityId
}

export interface SymphonyParityFixtureResult {
  id: string
  description: string
  passed: boolean
  mismatches: string[]
  snapshot: SymphonyParitySnapshot
}

function auditValue(result: SymphonyResult, prefix: string): string | null {
  const match = result.quality.auditHints.find((hint) => hint.startsWith(prefix))
  return match?.slice(prefix.length) ?? null
}

function numberAuditValue(result: SymphonyResult, prefix: string): number | null {
  const value = auditValue(result, prefix)
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function snapshotResult(
  result: SymphonyResult,
  additionalAlerts: readonly SymphonyAlert[] = []
): SymphonyParitySnapshot {
  const alerts = [...result.alerts, ...additionalAlerts]

  return {
    news2Score: numberAuditValue(result, 'news2_score:'),
    news2Risk: auditValue(result, 'news2_risk:'),
    alertIds: alerts.map((alert) => alert.id).sort(),
    alertSources: [...new Set(alerts.map((alert) => alert.source))].sort(),
    criticalAlertCount: alerts.filter((alert) => alert.severity === 'critical').length,
    diagnosisCategories: result.diagnosisSuggestions.map(
      (suggestion) => suggestion.decisionCategory
    ),
    trajectoryDirection: result.trajectory.direction,
    trajectoryMomentum: result.trajectory.momentum,
    auditHints: [...result.quality.auditHints].sort(),
  }
}

function includesAll(actual: string[], expected: string[]): string[] {
  return expected.filter((item) => !actual.includes(item))
}

function compareSnapshot(
  snapshot: SymphonyParitySnapshot,
  expected: SymphonyParityExpectation
): string[] {
  const mismatches: string[] = []

  if (expected.news2Score !== undefined && snapshot.news2Score !== expected.news2Score) {
    mismatches.push(`news2Score expected ${expected.news2Score}, received ${snapshot.news2Score}`)
  }

  if (expected.news2Risk !== undefined && snapshot.news2Risk !== expected.news2Risk) {
    mismatches.push(`news2Risk expected ${expected.news2Risk}, received ${snapshot.news2Risk}`)
  }

  for (const alertId of includesAll(snapshot.alertIds, expected.requiredAlertIds ?? [])) {
    mismatches.push(`missing alertId ${alertId}`)
  }

  for (const source of includesAll(snapshot.alertSources, expected.requiredAlertSources ?? [])) {
    mismatches.push(`missing alert source ${source}`)
  }

  if (
    expected.criticalAlertCountAtLeast !== undefined &&
    snapshot.criticalAlertCount < expected.criticalAlertCountAtLeast
  ) {
    mismatches.push(
      `criticalAlertCount expected at least ${expected.criticalAlertCountAtLeast}, received ${snapshot.criticalAlertCount}`
    )
  }

  if (
    expected.diagnosisCategories !== undefined &&
    snapshot.diagnosisCategories.join('|') !== expected.diagnosisCategories.join('|')
  ) {
    mismatches.push(
      `diagnosisCategories expected ${expected.diagnosisCategories.join('|')}, received ${snapshot.diagnosisCategories.join('|')}`
    )
  }

  if (
    expected.trajectoryDirection !== undefined &&
    snapshot.trajectoryDirection !== expected.trajectoryDirection
  ) {
    mismatches.push(
      `trajectoryDirection expected ${expected.trajectoryDirection}, received ${snapshot.trajectoryDirection}`
    )
  }

  if (
    expected.trajectoryMomentum !== undefined &&
    snapshot.trajectoryMomentum !== expected.trajectoryMomentum
  ) {
    mismatches.push(
      `trajectoryMomentum expected ${expected.trajectoryMomentum}, received ${snapshot.trajectoryMomentum}`
    )
  }

  for (const hint of includesAll(snapshot.auditHints, expected.requiredAuditHints ?? [])) {
    mismatches.push(`missing audit hint ${hint}`)
  }

  return mismatches
}

const CP_ROUTE_OBSERVED_AT = '2026-04-19T13:00:00.000Z'

const SYMPTOM_TEXT: Record<string, string> = {
  'history.knownAsthma': 'riwayat asma',
  'history.knownCOPD': 'riwayat PPOK',
  'history.knownDM': 'riwayat diabetes mellitus',
  'history.pregnancyStatus': 'hamil',
  'patient.avpuManual': 'penurunan kesadaran',
  'patient.physiology.isOlderAdult': 'pasien lansia',
  'patient.supplementalO2': 'memakai oksigen tambahan',
  'symptoms.accessoryMuscles': 'penggunaan otot bantu napas',
  'symptoms.allergenExposure': 'paparan alergen makanan atau obat',
  'symptoms.alteredMentalStatus': 'bingung atau penurunan kesadaran',
  'symptoms.bleedingHistory': 'riwayat perdarahan',
  'symptoms.chestPain': 'nyeri dada',
  'symptoms.chestPainDuration20min': 'nyeri dada lebih dari 20 menit',
  'symptoms.clinicalConcern': 'kekhawatiran klinisi tinggi',
  'symptoms.diaphoresis': 'keringat dingin',
  'symptoms.difficultySpeaking': 'sulit berbicara kalimat penuh',
  'symptoms.dizziness': 'pusing berat',
  'symptoms.dyspnea': 'sesak napas',
  'symptoms.fatigue': 'kelelahan berat',
  'symptoms.focalNeuroDeficit': 'kelemahan wajah atau anggota gerak satu sisi',
  'symptoms.giSymptoms': 'mual muntah atau nyeri perut',
  'symptoms.kussmaulBreathing': 'napas kussmaul',
  'symptoms.nausea': 'mual',
  'symptoms.pallor': 'pucat',
  'symptoms.polyuria': 'sering buang air kecil dan haus',
  'symptoms.seizure': 'kejang',
  'symptoms.skinMucosalSymptoms': 'biduran atau bengkak bibir',
  'symptoms.suddenDyspnea': 'sesak napas mendadak',
  'symptoms.suddenOnset': 'onset mendadak',
  'symptoms.suspectedInfection': 'demam atau curiga infeksi',
  'symptoms.syncope': 'pingsan',
  'symptoms.thromboembolismRisk': 'risiko tromboemboli atau tirah baring',
  'symptoms.weakness': 'lemas berat',
  'symptoms.wheezing': 'mengi',
}

function numericCriterionValue(criterion: AssistPatternParityCriterion): number | null {
  if (typeof criterion.value === 'number') {
    if (criterion.op === 'gt') return criterion.value + 1
    if (criterion.op === 'lt') return criterion.value - 1
    return criterion.value
  }

  if (Array.isArray(criterion.value) && criterion.value.length === 2) {
    return (criterion.value[0] + criterion.value[1]) / 2
  }

  return null
}

function applyVitalCriterion(
  vitals: SymphonyVitalsInput,
  criterion: AssistPatternParityCriterion
): void {
  const value = numericCriterionValue(criterion)
  if (value === null) return

  if (criterion.field === 'vitals.rr') vitals.respiratoryRate = value
  if (criterion.field === 'vitals.sbp') vitals.systolicBp = value
  if (criterion.field === 'vitals.hr') vitals.heartRate = value
  if (criterion.field === 'vitals.spo2') vitals.spo2 = value
  if (criterion.field === 'vitals.temp') vitals.temperatureC = value
  if (criterion.field === 'vitals.glucose') vitals.glucoseMgDl = value
  if (criterion.field === 'derived.shockIndex') {
    vitals.heartRate = Math.max(vitals.heartRate ?? 0, Math.ceil(value * 100))
    vitals.systolicBp = 100
  }
  if (criterion.field === 'derived.map') {
    vitals.systolicBp = Math.min(vitals.systolicBp ?? 120, Math.max(80, value + 20))
    vitals.diastolicBp = Math.min(vitals.diastolicBp ?? 70, Math.max(45, value - 5))
  }
}

function buildAssistPatternRouteFixture(
  pattern: AssistPatternParityDefinition,
  _index: number
): SymphonyParityFixtureCase {
  const allCriteria = [...pattern.criteria.required, ...pattern.criteria.scored]
  const vitals: SymphonyVitalsInput = {
    observedAt: CP_ROUTE_OBSERVED_AT,
    systolicBp: 122,
    diastolicBp: 78,
    heartRate: 88,
    respiratoryRate: 18,
    temperatureC: 36.9,
    spo2: 97,
    consciousness: 'alert',
  }
  const complaintParts = new Set<string>(['skenario bedside parity Assist clinical pattern'])
  const medicalHistory = new Set<string>()
  const allergies = new Set<string>()
  let ageYears = 52
  let sexAtBirth: SymphonySexAtBirth = 'male'
  let pregnancyStatus: SymphonyPregnancyStatus = 'not_applicable'
  let hasCOPD = false

  for (const criterion of allCriteria) {
    applyVitalCriterion(vitals, criterion)
    const text = criterion.label ?? SYMPTOM_TEXT[criterion.field]
    if (text) complaintParts.add(text)

    if (criterion.field === 'patient.age') {
      const value = numericCriterionValue(criterion)
      if (value !== null) ageYears = value
    }
    if (criterion.field === 'patient.physiology.isOlderAdult') ageYears = Math.max(ageYears, 72)
    if (criterion.field === 'patient.avpuManual' && criterion.op === 'neq')
      vitals.consciousness = 'voice'
    if (criterion.field === 'patient.supplementalO2') vitals.oxygenSupplement = true
    if (criterion.field === 'history.knownCOPD') {
      hasCOPD = true
      medicalHistory.add('PPOK')
    }
    if (criterion.field === 'history.knownAsthma') medicalHistory.add('Asma')
    if (criterion.field === 'history.knownDM') medicalHistory.add('Diabetes Mellitus')
    if (criterion.field === 'history.pregnancyStatus') {
      sexAtBirth = 'female'
      pregnancyStatus = 'pregnant'
    }
    if (criterion.field === 'symptoms.allergenExposure') allergies.add('alergen tidak spesifik')
  }

  if (pregnancyStatus === 'not_applicable' && sexAtBirth === 'female')
    pregnancyStatus = 'not_pregnant'

  return {
    id: `${pattern.id.toLowerCase()}-route`,
    assistPatternId: pattern.id,
    description: `Assist clinical pattern ${pattern.id} route-level coverage: ${pattern.title}.`,
    input: {
      metadata: {
        requestId: `fixture-${pattern.id.toLowerCase()}-route`,
        requestedAt: CP_ROUTE_OBSERVED_AT,
        caller: 'assist',
      },
      patientContext: {
        encounterId: `fixture-enc-${pattern.id.toLowerCase()}`,
        patientRef: `fixture-patient-${pattern.id.toLowerCase()}`,
        ageYears,
        sexAtBirth,
        pregnancyStatus,
      },
      vitals: [vitals],
      hasCOPD,
      chiefComplaint: [...complaintParts].join('; '),
      additionalComplaint: pattern.reasoning,
      medicalHistory: [...medicalHistory],
      allergies: [...allergies],
    },
    expected: {
      requiredAlertIds: [assistPatternAlertId(pattern.id)],
      requiredAlertSources: ['pattern'],
    },
  }
}

const ASSIST_PATTERN_ROUTE_PARITY_FIXTURE_CASES: SymphonyParityFixtureCase[] =
  ASSIST_PATTERN_PARITY_DEFINITIONS.map(buildAssistPatternRouteFixture)

export const SYMPHONY_PARITY_FIXTURE_CASES: SymphonyParityFixtureCase[] = [
  {
    id: 'adult-sepsis-respiratory-route',
    description:
      'Adult respiratory/sepsis bedside route with qSOFA, NEWS2 high risk, and respiratory gates.',
    input: {
      metadata: {
        requestId: 'fixture-adult-sepsis-respiratory',
        requestedAt: '2026-04-19T08:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'fixture-enc-adult-sepsis',
        patientRef: 'fixture-patient-adult-sepsis',
        ageYears: 52,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
      vitals: [
        {
          observedAt: '2026-04-19T08:00:00.000Z',
          systolicBp: 94,
          diastolicBp: 58,
          heartRate: 130,
          respiratoryRate: 24,
          temperatureC: 39.2,
          spo2: 91,
          oxygenSupplement: true,
          consciousness: 'alert',
        },
      ],
      chiefComplaint: 'Demam tinggi menggigil dan sesak napas',
      additionalComplaint: 'Batuk produktif sejak tiga hari',
    },
    expected: {
      news2Score: 13,
      news2Risk: 'high',
      requiredAlertIds: [
        'symphony-gate-sepsis-qsofa',
        'symphony-gate-respiratory-hypoxemia',
        'symphony-news2-high',
      ],
      requiredAlertSources: ['news2', 'safety_gate'],
      criticalAlertCountAtLeast: 1,
    },
  },
  {
    id: 'obstetric-glucose-route',
    description:
      'Pregnant patient route with severe hypertension, tachycardia, and severe hypoglycemia.',
    input: {
      metadata: {
        requestId: 'fixture-obstetric-glucose',
        requestedAt: '2026-04-19T09:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'fixture-enc-obstetric',
        patientRef: 'fixture-patient-obstetric',
        ageYears: 30,
        sexAtBirth: 'female',
        pregnancyStatus: 'pregnant',
      },
      vitals: [
        {
          observedAt: '2026-04-19T09:00:00.000Z',
          systolicBp: 164,
          diastolicBp: 112,
          heartRate: 126,
          glucoseMgDl: 48,
        },
      ],
      chiefComplaint: 'Hamil dengan nyeri kepala berat dan lemas',
    },
    expected: {
      requiredAlertIds: [
        'symphony-gate-obstetric-severe-hypertension',
        'symphony-gate-obstetric-tachycardia',
        'symphony-gate-glucose-severe-hypoglycemia',
      ],
      requiredAlertSources: ['safety_gate'],
      criticalAlertCountAtLeast: 2,
    },
  },
  {
    id: 'pe-suspect-route',
    description:
      'Adult with sudden pleuritic chest pain, tachycardia, hypoxia, and immobilization history — PE suspect gate (GATE_9_PE) should fire.',
    input: {
      metadata: {
        requestId: 'fixture-pe-suspect',
        requestedAt: '2026-04-19T10:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'fixture-enc-pe-suspect',
        patientRef: 'fixture-patient-pe-suspect',
        ageYears: 58,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
      vitals: [
        {
          observedAt: '2026-04-19T10:00:00.000Z',
          systolicBp: 118,
          diastolicBp: 74,
          heartRate: 118,
          respiratoryRate: 26,
          temperatureC: 37.1,
          spo2: 88,
        },
      ],
      chiefComplaint: 'Nyeri dada pleuritik mendadak disertai sesak napas',
      additionalComplaint:
        'Batuk berdarah dan bengkak tungkai kanan, tirah baring 5 hari pasca operasi',
    },
    expected: {
      requiredAlertIds: ['SYMPHONY_PE_SUSPECT'],
      requiredAlertSources: ['safety_gate'],
      criticalAlertCountAtLeast: 1,
    },
  },
  {
    id: 'anaphylaxis-route',
    description:
      'Adult with rash, swelling, and airway compromise minutes after seafood exposure — anaphylaxis gate (GATE_10_ANAPHYLAXIS) should fire.',
    input: {
      metadata: {
        requestId: 'fixture-anaphylaxis',
        requestedAt: '2026-04-19T11:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'fixture-enc-anaphylaxis',
        patientRef: 'fixture-patient-anaphylaxis',
        ageYears: 32,
        sexAtBirth: 'female',
        pregnancyStatus: 'not_pregnant',
      },
      vitals: [
        {
          observedAt: '2026-04-19T11:00:00.000Z',
          systolicBp: 86,
          diastolicBp: 54,
          heartRate: 122,
          respiratoryRate: 28,
          temperatureC: 36.8,
          spo2: 91,
        },
      ],
      chiefComplaint: 'Bentol gatal seluruh tubuh dan bibir bengkak setelah makan udang',
      additionalComplaint: 'Sesak napas dan pusing berat muncul dalam 15 menit',
      allergies: ['seafood', 'udang'],
    },
    expected: {
      requiredAlertIds: ['SYMPHONY_ANAPHYLAXIS'],
      requiredAlertSources: ['safety_gate'],
      criticalAlertCountAtLeast: 1,
    },
  },
  {
    id: 'trajectory-diagnosis-route',
    description:
      'Multi-visit route with worsening trajectory and grounded hybrid diagnosis suggestions.',
    input: {
      metadata: {
        requestId: 'fixture-trajectory-diagnosis',
        requestedAt: '2026-04-19T12:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'fixture-enc-trajectory',
        patientRef: 'fixture-patient-trajectory',
        ageYears: 46,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
      vitals: [
        {
          observedAt: '2026-04-17T12:00:00.000Z',
          systolicBp: 124,
          diastolicBp: 78,
          heartRate: 88,
          respiratoryRate: 18,
          temperatureC: 37.2,
          spo2: 97,
        },
        {
          observedAt: '2026-04-18T12:00:00.000Z',
          systolicBp: 108,
          diastolicBp: 66,
          heartRate: 104,
          respiratoryRate: 22,
          temperatureC: 38.4,
          spo2: 94,
        },
        {
          observedAt: '2026-04-19T12:00:00.000Z',
          systolicBp: 92,
          diastolicBp: 54,
          heartRate: 126,
          respiratoryRate: 28,
          temperatureC: 39.1,
          spo2: 90,
        },
      ],
      chiefComplaint: 'Batuk demam dan sesak napas semakin berat',
      additionalComplaint: 'Menggigil dan lemah',
      diagnosisCandidates: [
        {
          icd10Code: 'J18.9',
          diagnosisName: 'Pneumonia',
          confidence: 0.72,
          keywordScore: 0.82,
          semanticScore: 0.74,
          ragVerified: true,
          keyReasons: ['Batuk produktif', 'Demam', 'Sesak napas'],
          searchText: 'batuk demam sesak napas pneumonia infeksi paru',
        },
        {
          icd10Code: 'A41.9',
          diagnosisName: 'Sepsis, unspecified organism',
          confidence: 0.48,
          keywordScore: 0.52,
          semanticScore: 0.5,
          ragVerified: true,
          keyReasons: ['Demam', 'Takikardia'],
          missingInformation: ['Apakah ada hipotensi menetap atau perubahan kesadaran?'],
          redFlags: ['Curiga sepsis dengan tanda bahaya sistemik'],
          recommendedActions: ['Rujuk segera bila syok atau penurunan kesadaran muncul'],
          searchText: 'demam takikardia hipotensi sepsis syok infeksi sistemik',
        },
      ],
    },
    expected: {
      requiredAlertSources: ['news2', 'safety_gate', 'pattern'],
      diagnosisCategories: ['recommended', 'must_not_miss'],
      trajectoryDirection: 'worsening',
      trajectoryMomentum: 'rapid',
      requiredAuditHints: ['diagnosis_recommended_count:1', 'diagnosis_must_not_miss_count:1'],
    },
  },
  ...ASSIST_PATTERN_ROUTE_PARITY_FIXTURE_CASES,
]

export function runSymphonyParityFixture(
  fixture: SymphonyParityFixtureCase
): SymphonyParityFixtureResult {
  const result = assessSymphonyInput(fixture.input)
  let additionalAlerts: SymphonyAlert[] = []
  if (fixture.assistPatternId) {
    const patternDefinition = ASSIST_PATTERN_PARITY_DEFINITIONS.find(
      (pattern) => pattern.id === fixture.assistPatternId
    )
    if (!patternDefinition) {
      throw new Error(
        `parity fixture references unknown Assist pattern id: '${fixture.assistPatternId}'`
      )
    }
    additionalAlerts = [
      adaptAssistPatternToSymphonyAlert(patternDefinition, {
        triggeredAt: fixture.input.metadata.requestedAt,
      }),
    ]
  }
  const snapshot = snapshotResult(result, additionalAlerts)
  const mismatches = compareSnapshot(snapshot, fixture.expected)

  return {
    id: fixture.id,
    description: fixture.description,
    passed: mismatches.length === 0,
    mismatches,
    snapshot,
  }
}

export function runSymphonyParityFixtures(
  fixtures: SymphonyParityFixtureCase[] = SYMPHONY_PARITY_FIXTURE_CASES
): SymphonyParityFixtureResult[] {
  return fixtures.map(runSymphonyParityFixture)
}
