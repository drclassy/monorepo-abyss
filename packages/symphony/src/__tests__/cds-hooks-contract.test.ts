import { describe, expect, it } from 'vitest'

import {
  SYMPHONY_CDS_HOOK_CONTEXT_CONTRACT,
  SYMPHONY_CDS_PREFETCH_ASSUMPTIONS,
  SYMPHONY_CDS_RESPONSE_INVARIANTS,
  SYMPHONY_CDS_SOURCE_LABEL,
} from '../index'

describe('cds-hooks contract', () => {
  it('declares only the approved hook context contract', () => {
    expect(SYMPHONY_CDS_HOOK_CONTEXT_CONTRACT.hook).toBe('patient-view')
    expect(SYMPHONY_CDS_HOOK_CONTEXT_CONTRACT.requiredFields).toEqual([])
    expect(SYMPHONY_CDS_HOOK_CONTEXT_CONTRACT.optionalFields).toEqual([
      'patientId',
      'encounterId',
    ])
  })

  it('declares prefetch assumptions structurally and deterministically', () => {
    expect(SYMPHONY_CDS_PREFETCH_ASSUMPTIONS).toEqual([
      { key: 'patient', requirement: 'optional' },
      { key: 'encounter', requirement: 'optional' },
    ])
  })

  it('declares stable response invariants', () => {
    expect(SYMPHONY_CDS_RESPONSE_INVARIANTS).toEqual({
      sourceLabel: SYMPHONY_CDS_SOURCE_LABEL,
      cardOrder: [
        'critical-alert',
        'must-not-miss',
        'top-hypothesis',
        'disposition-requires-review',
        'shadow-low-agreement',
      ],
      linksPolicy: 'always-empty-array',
      topLevelShape: ['cards'],
    })
  })
})
