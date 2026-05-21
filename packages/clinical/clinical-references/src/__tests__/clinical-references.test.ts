import { describe, expect, it } from 'vitest'

import * as clinicalReferences from '../index'

describe('@the-abyss/clinical-references scaffold', () => {
  it('exports the expected public stub surface', () => {
    expect(clinicalReferences.CLINICAL_REFERENCES_PROVENANCE.ddi.sourceName).toBe(
      'pending-license-review'
    )
    expect(typeof clinicalReferences.checkDrugInteractions).toBe('function')
    expect(typeof clinicalReferences.resolveDosageRecommendation).toBe('function')
    expect(typeof clinicalReferences.resolveEpidemiologyPriors).toBe('function')
    expect(typeof clinicalReferences.resolvePharmacotherapyPlan).toBe('function')
  })

  it('returns a deterministic DDI shape for active medications', () => {
    const result = clinicalReferences.checkDrugInteractions({
      activeMedications: ['Captopril', 'Aspirin', 'captopril'],
    })

    expect(result.status).toBe('not_configured')
    expect(result.checkedPairs).toEqual(['aspirin__captopril'])
    expect(result.interactions).toEqual([])
    expect(result.warnings).toContain('ddi_reference_not_configured')
    expect(result.provenance.domain).toBe('ddi')
  })

  it('returns an explicit dosage warning when references are not configured', () => {
    const result = clinicalReferences.resolveDosageRecommendation({
      medicationName: 'Amoxicillin',
      ageYears: 6,
      weightKg: 20,
    })

    expect(result.status).toBe('not_configured')
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toMatchObject({
      medicationName: 'amoxicillin',
      population: 'pediatric',
      recommendation: 'reference_pending',
    })
    expect(result.warnings).toContain('dosage_reference_not_configured')
  })

  it('returns deterministic epidemiology priors from synthetic fixtures', () => {
    const result = clinicalReferences.resolveEpidemiologyPriors({
      regionCode: 'ID-JK',
      syndrome: 'respiratory',
    })

    expect(result.status).toBe('configured')
    expect(result.priors).toEqual([
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
    ])
    expect(result.warnings).toEqual([])
  })

  it('returns a pharmacotherapy candidate shell with warnings', () => {
    const result = clinicalReferences.resolvePharmacotherapyPlan({
      diagnosisLabel: 'community acquired pneumonia',
      clinicalGoal: 'empiric treatment',
    })

    expect(result.status).toBe('not_configured')
    expect(result.candidates).toEqual([
      {
        medicationName: 'pending-reference-selection',
        recommendationStatus: 'placeholder',
        rationale:
          'Pharmacotherapy reference resolution for empiric treatment is not configured in scaffold v1.',
        contraindicationFlags: [],
      },
    ])
    expect(result.warnings).toContain('pharmacotherapy_reference_not_configured')
    expect(result.provenance.domain).toBe('pharmacotherapy')
  })
})
