import {
  CLINICAL_REFERENCES_PROVENANCE,
  type ClinicalReferenceMedicationCandidate,
  type ClinicalReferencePharmacotherapyInput,
  type ClinicalReferencePharmacotherapyResult,
} from './contracts'

function buildPlaceholderCandidate(
  input: ClinicalReferencePharmacotherapyInput
): ClinicalReferenceMedicationCandidate {
  const clinicalGoal =
    input.clinicalGoal?.trim() || input.diagnosisLabel?.trim() || 'unspecified_condition'

  return {
    medicationName: 'pending-reference-selection',
    recommendationStatus: 'placeholder',
    rationale: `Pharmacotherapy reference resolution for ${clinicalGoal} is not configured in scaffold v1.`,
    contraindicationFlags: [],
  }
}

export function resolvePharmacotherapyPlan(
  input: ClinicalReferencePharmacotherapyInput
): ClinicalReferencePharmacotherapyResult {
  return {
    status: 'not_configured',
    candidates: [buildPlaceholderCandidate(input)],
    warnings: ['pharmacotherapy_reference_not_configured'],
    provenance: CLINICAL_REFERENCES_PROVENANCE.pharmacotherapy,
  }
}
