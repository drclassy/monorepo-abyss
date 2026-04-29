import { describe, expect, it } from 'vitest'

import {
  mapValidatedAadiV2Bundle,
  type AadiV2FhirBundleProjection,
} from '../index'

function baseProjection(
  overrides: Partial<AadiV2FhirBundleProjection> = {},
): AadiV2FhirBundleProjection {
  return {
    contractVersion: '0.8.0',
    generatedAt: '2026-04-29T12:00:00.000Z',
    entries: [],
    ...overrides,
  }
}

describe('mapValidatedAadiV2Bundle', () => {
  it('assembles a deterministic collection bundle from supported AADI V2 resource families', () => {
    const projection = baseProjection({
      entries: [
        {
          resourceType: 'Condition',
          id: 'cond-1',
          code: {
            coding: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10',
                code: 'J18.9',
                display: 'Pneumonia, unspecified organism',
              },
            ],
          },
          category: 'working',
          verificationStatus: 'provisional',
          rank: 1,
          confidence: 0.77,
        },
        {
          resourceType: 'RiskAssessment',
          id: 'risk-traffic-light',
          status: 'final',
          prediction: [
            {
              qualitativeRisk: {
                coding: [{ system: 'urn:symphony:traffic-light', code: 'YELLOW' }],
              },
            },
          ],
        },
        {
          resourceType: 'DiagnosticReport',
          id: 'report-rationale',
          status: 'final',
          conclusion: 'Diagnosis utama saat ini: Pneumonia.',
        },
        {
          resourceType: 'Observation',
          id: 'obs-alert-1',
          status: 'final',
          code: {
            coding: [{ system: 'urn:symphony:alert-severity', code: 'alert-1' }],
          },
          valueString: 'critical',
        },
      ],
    })

    const bundle = mapValidatedAadiV2Bundle(projection)

    expect(bundle.resourceType).toBe('Bundle')
    expect(bundle.type).toBe('collection')
    expect(bundle.entry.map(item => item.resource.resourceType)).toEqual([
      'Condition',
      'RiskAssessment',
      'DiagnosticReport',
      'Observation',
    ])
    expect(bundle.meta.contractVersion).toBe('0.8.0')
    expect(bundle.meta.generatedAt).toBe('2026-04-29T12:00:00.000Z')
  })

  it('preserves contractVersion and generatedAt exactly', () => {
    const bundle = mapValidatedAadiV2Bundle(
      baseProjection({
        contractVersion: '0.9.0',
        generatedAt: '2026-04-29T15:15:00.000Z',
      }),
    )

    expect(bundle.meta).toEqual({
      contractVersion: '0.9.0',
      generatedAt: '2026-04-29T15:15:00.000Z',
    })
  })

  it('fails honestly when a projection entry uses an unsupported resource family', () => {
    expect(() =>
      mapValidatedAadiV2Bundle(
        baseProjection({
          entries: [
            {
              resourceType: 'Bundle',
              id: 'nested-bundle',
            } as never,
          ],
        }),
      ),
    ).toThrow(/Unsupported AADI V2 bundle resource type: Bundle/)
  })

  it('produces deterministic output for identical projection input', () => {
    const input = baseProjection({
      entries: [
        {
          resourceType: 'Condition',
          id: 'cond-1',
          code: {
            coding: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10',
                code: 'J18.9',
              },
            ],
          },
          category: 'working',
          verificationStatus: 'provisional',
          rank: 1,
          confidence: 0.7,
        },
      ],
    })

    expect(mapValidatedAadiV2Bundle(input)).toEqual(mapValidatedAadiV2Bundle(input))
  })
})
