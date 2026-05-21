import {
  CLINICAL_REFERENCES_PROVENANCE,
  type ClinicalReferenceEpidemiologyContext,
  type ClinicalReferencePriorResult,
  type ClinicalReferencePriorWeight,
} from './contracts'

const SYNTHETIC_PRIOR_FIXTURES: Record<string, readonly ClinicalReferencePriorWeight[]> = {
  febrile: [
    {
      label: 'viral_fever',
      weight: 0.58,
      rationale: 'Synthetic baseline prior for undifferentiated febrile presentation.',
    },
    {
      label: 'bacterial_infection',
      weight: 0.24,
      rationale: 'Synthetic baseline prior retained for test determinism.',
    },
  ],
  respiratory: [
    {
      label: 'viral_upper_respiratory_infection',
      weight: 0.62,
      rationale: 'Synthetic respiratory prior used to verify normalized output wiring.',
    },
    {
      label: 'community_acquired_pneumonia',
      weight: 0.18,
      rationale: 'Synthetic secondary respiratory prior used for deterministic test coverage.',
    },
  ],
}

export function resolveEpidemiologyPriors(
  context: ClinicalReferenceEpidemiologyContext,
): ClinicalReferencePriorResult {
  const syndrome = context.syndrome.trim().toLowerCase()
  const priors = SYNTHETIC_PRIOR_FIXTURES[syndrome] ?? []

  return {
    status: priors.length > 0 ? 'configured' : 'not_configured',
    priors,
    warnings:
      priors.length > 0 ? [] : ['epidemiology_reference_not_configured_for_requested_syndrome'],
    provenance: CLINICAL_REFERENCES_PROVENANCE.epidemiology,
  }
}
