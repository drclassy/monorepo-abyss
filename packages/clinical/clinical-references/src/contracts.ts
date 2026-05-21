export type ClinicalReferenceStatus = 'configured' | 'not_configured'

export type ClinicalReferenceDomain =
  | 'ddi'
  | 'dosage'
  | 'epidemiology'
  | 'pharmacotherapy'

export interface ClinicalReferenceProvenance {
  domain: ClinicalReferenceDomain
  sourceName: string
  version: string
  licensedForRepoDistribution: boolean
}

export const CLINICAL_REFERENCES_PROVENANCE = {
  ddi: {
    domain: 'ddi',
    sourceName: 'pending-license-review',
    version: 'draft-v1',
    licensedForRepoDistribution: false,
  },
  dosage: {
    domain: 'dosage',
    sourceName: 'pending-license-review',
    version: 'draft-v1',
    licensedForRepoDistribution: false,
  },
  epidemiology: {
    domain: 'epidemiology',
    sourceName: 'pending-license-review',
    version: 'draft-v1',
    licensedForRepoDistribution: false,
  },
  pharmacotherapy: {
    domain: 'pharmacotherapy',
    sourceName: 'pending-license-review',
    version: 'draft-v1',
    licensedForRepoDistribution: false,
  },
} as const satisfies Record<ClinicalReferenceDomain, ClinicalReferenceProvenance>

export type ClinicalReferenceDdiSeverity =
  | 'contraindicated'
  | 'major'
  | 'moderate'
  | 'minor'
  | 'unknown'

export interface ClinicalReferenceDdiPair {
  drugA: string
  drugB: string
  severity: ClinicalReferenceDdiSeverity
  evidenceSummary: string
  referenceId: string
}

export interface ClinicalReferenceDdiCheckInput {
  activeMedications: readonly string[]
}

export interface ClinicalReferenceDdiCheckResult {
  status: ClinicalReferenceStatus
  checkedPairs: readonly string[]
  interactions: readonly ClinicalReferenceDdiPair[]
  warnings: readonly string[]
  provenance: ClinicalReferenceProvenance
}

export interface ClinicalReferenceDosageInput {
  medicationName: string
  ageYears?: number
  weightKg?: number
  indication?: string
  route?: string
}

export interface ClinicalReferenceDosageRecommendation {
  medicationName: string
  population: 'adult' | 'pediatric' | 'pregnancy' | 'unknown'
  recommendation: string
  rationale: string
}

export interface ClinicalReferenceDosageResult {
  status: ClinicalReferenceStatus
  recommendations: readonly ClinicalReferenceDosageRecommendation[]
  warnings: readonly string[]
  provenance: ClinicalReferenceProvenance
}

export interface ClinicalReferenceEpidemiologyContext {
  regionCode: string
  syndrome: string
  ageBand?: 'infant' | 'child' | 'adult' | 'older_adult'
  season?: string
}

export interface ClinicalReferencePriorWeight {
  label: string
  weight: number
  rationale: string
}

export interface ClinicalReferencePriorResult {
  status: ClinicalReferenceStatus
  priors: readonly ClinicalReferencePriorWeight[]
  warnings: readonly string[]
  provenance: ClinicalReferenceProvenance
}

export interface ClinicalReferencePharmacotherapyInput {
  diagnosisLabel?: string
  clinicalGoal?: string
  activeMedications?: readonly string[]
  allergies?: readonly string[]
}

export interface ClinicalReferenceMedicationCandidate {
  medicationName: string
  recommendationStatus: 'placeholder'
  rationale: string
  contraindicationFlags: readonly string[]
}

export interface ClinicalReferencePharmacotherapyResult {
  status: ClinicalReferenceStatus
  candidates: readonly ClinicalReferenceMedicationCandidate[]
  warnings: readonly string[]
  provenance: ClinicalReferenceProvenance
}
