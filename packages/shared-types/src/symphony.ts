export const SYMPHONY_CONTRACT_VERSION = '0.1.2' as const

export type SymphonyContractVersion = typeof SYMPHONY_CONTRACT_VERSION

export type SymphonyEngineStatus = 'ready' | 'busy' | 'degraded' | 'offline'

export type SymphonyDecisionCategory =
  | 'recommended'
  | 'review'
  | 'must_not_miss'
  | 'deferred'

export type SymphonyAlertSeverity = 'critical' | 'high' | 'warning' | 'info'

export type SymphonyAlertSource =
  | 'vitals'
  | 'trajectory'
  | 'news2'
  | 'pattern'
  | 'composite'
  | 'llm'
  | 'safety_gate'
  | 'fallback'

export type SymphonySafetyGate =
  | 'GATE_1_VITALS'
  | 'GATE_2_HTN'
  | 'GATE_3_GLUCOSE'
  | 'GATE_4_OCCULT_SHOCK'
  | 'GATE_5_SEPSIS'
  | 'GATE_6_RESPIRATORY'
  | 'GATE_7_PEDIATRIC'
  | 'GATE_8_OBSTETRIC'

export type SymphonyConfidenceBand = 'high' | 'moderate' | 'low' | 'insufficient_data'

export type SymphonySexAtBirth = 'female' | 'male' | 'intersex' | 'unknown'

export type SymphonyPregnancyStatus =
  | 'pregnant'
  | 'not_pregnant'
  | 'unknown'
  | 'not_applicable'

export type SymphonyConsciousnessLevel =
  | 'alert'
  | 'voice'
  | 'pain'
  | 'unresponsive'
  | 'unknown'

export type SymphonyTrajectoryDirection = 'improving' | 'stable' | 'worsening' | 'unknown'

export type SymphonyTrajectoryMomentum = 'rapid' | 'gradual' | 'flat' | 'insufficient_data'

export interface SymphonyMetadata {
  engineVersion: string
  contractVersion: SymphonyContractVersion
  generatedAt: string
  status: SymphonyEngineStatus
  confidenceBand: SymphonyConfidenceBand
  rationale: string[]
  latencyMs?: number
  degradedReason?: string
}

export interface SymphonyPatientContext {
  encounterId: string
  patientRef: string
  ageYears?: number
  sexAtBirth?: SymphonySexAtBirth
  pregnancyStatus?: SymphonyPregnancyStatus
}

export interface SymphonyVitalsInput {
  observedAt: string
  systolicBp?: number
  diastolicBp?: number
  heartRate?: number
  respiratoryRate?: number
  temperatureC?: number
  spo2?: number
  glucoseMgDl?: number
  capillaryRefillSec?: number
  oxygenSupplement?: boolean
  consciousness?: SymphonyConsciousnessLevel
}

export interface SymphonyDiagnosisSuggestion {
  id: string
  icd10Code: string
  diagnosisName: string
  confidence: number
  decisionCategory: SymphonyDecisionCategory
  reasoning: string[]
  evidenceRefs: string[]
  mustNotMiss: boolean
}

export interface SymphonyAlert {
  id: string
  severity: SymphonyAlertSeverity
  title: string
  reasoning: string[]
  source: SymphonyAlertSource
  gate?: SymphonySafetyGate
  acknowledged: boolean
  triggeredAt: string
}

export interface SymphonyTrajectorySummary {
  direction: SymphonyTrajectoryDirection
  momentum: SymphonyTrajectoryMomentum
  summary: string
  evidenceRefs: string[]
}

export interface SymphonyQualitySummary {
  completenessScore: number
  missingFields: string[]
  safetyFlags: string[]
  auditHints: string[]
}

export interface SymphonyResult {
  metadata: SymphonyMetadata
  patientContext: SymphonyPatientContext
  latestVitals?: SymphonyVitalsInput
  diagnosisSuggestions: SymphonyDiagnosisSuggestion[]
  alerts: SymphonyAlert[]
  trajectory: SymphonyTrajectorySummary
  quality: SymphonyQualitySummary
}
