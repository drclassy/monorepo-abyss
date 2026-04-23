import {
  CLINICAL_REFERENCES_PROVENANCE,
  type ClinicalReferenceDosageInput,
  type ClinicalReferenceDosageResult,
} from './contracts'

function inferPopulation(input: ClinicalReferenceDosageInput): 'adult' | 'pediatric' | 'unknown' {
  if (typeof input.ageYears !== 'number') {
    return 'unknown'
  }

  return input.ageYears < 18 ? 'pediatric' : 'adult'
}

export function resolveDosageRecommendation(
  input: ClinicalReferenceDosageInput,
): ClinicalReferenceDosageResult {
  const medicationName = input.medicationName.trim().toLowerCase()
  const population = inferPopulation(input)

  return {
    status: 'not_configured',
    recommendations: medicationName
      ? [
          {
            medicationName,
            population,
            recommendation: 'reference_pending',
            rationale: 'Dosage references are not configured in scaffold v1.',
          },
        ]
      : [],
    warnings: ['dosage_reference_not_configured'],
    provenance: CLINICAL_REFERENCES_PROVENANCE.dosage,
  }
}
