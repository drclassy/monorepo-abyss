// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  getSymphonyCdsHookContextContract,
  getSymphonyCdsServiceDefinition,
  SYMPHONY_CDS_SOURCE_LABEL,
} from '../index'

describe('cds-hooks service definition', () => {
  it('returns a stable service definition', () => {
    expect(getSymphonyCdsServiceDefinition()).toEqual({
      id: 'aadiv2-symphony-patient-view',
      hook: 'patient-view',
      title: SYMPHONY_CDS_SOURCE_LABEL,
      description: 'Deterministic CDS Hooks card surface for AADI V2 review signals.',
      prefetch: [
        { key: 'patient', requirement: 'optional' },
        { key: 'encounter', requirement: 'optional' },
      ],
    })
  })

  it('returns a stable hook context contract', () => {
    expect(getSymphonyCdsHookContextContract()).toEqual({
      hook: 'patient-view',
      requiredFields: [],
      optionalFields: ['patientId', 'encounterId'],
    })
  })
})
