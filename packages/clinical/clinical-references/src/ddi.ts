import {
  CLINICAL_REFERENCES_PROVENANCE,
  type ClinicalReferenceDdiCheckInput,
  type ClinicalReferenceDdiCheckResult,
} from './contracts'

function normalizeMedicationName(value: string): string {
  return value.trim().toLowerCase()
}

function buildCheckedPairs(activeMedications: readonly string[]): readonly string[] {
  const normalized = [
    ...new Set(activeMedications.map(normalizeMedicationName).filter(Boolean)),
  ].sort()
  const pairs: string[] = []

  for (let index = 0; index < normalized.length; index += 1) {
    const left = normalized[index]

    for (let pairIndex = index + 1; pairIndex < normalized.length; pairIndex += 1) {
      pairs.push(`${left}__${normalized[pairIndex]}`)
    }
  }

  return pairs
}

export function checkDrugInteractions(
  input: ClinicalReferenceDdiCheckInput
): ClinicalReferenceDdiCheckResult {
  return {
    status: 'not_configured',
    checkedPairs: buildCheckedPairs(input.activeMedications),
    interactions: [],
    warnings: ['ddi_reference_not_configured'],
    provenance: CLINICAL_REFERENCES_PROVENANCE.ddi,
  }
}
