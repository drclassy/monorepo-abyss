// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import {
  SYMPHONY_CDS_HOOK_CONTEXT_CONTRACT,
  SYMPHONY_CDS_PREFETCH_ASSUMPTIONS,
  SYMPHONY_CDS_SOURCE_LABEL,
  type SymphonyCdsHookContextContract,
  type SymphonyCdsServiceDefinition,
} from './cds-hooks-contract'

const SERVICE_DESCRIPTION =
  'Deterministic CDS Hooks card surface for AADI V2 review signals.'

export function getSymphonyCdsHookContextContract(): SymphonyCdsHookContextContract {
  return {
    hook: SYMPHONY_CDS_HOOK_CONTEXT_CONTRACT.hook,
    requiredFields: [],
    optionalFields: [...SYMPHONY_CDS_HOOK_CONTEXT_CONTRACT.optionalFields] as const,
  }
}

export function getSymphonyCdsServiceDefinition(): SymphonyCdsServiceDefinition {
  return {
    id: 'aadiv2-symphony-patient-view',
    hook: 'patient-view',
    title: SYMPHONY_CDS_SOURCE_LABEL,
    description: SERVICE_DESCRIPTION,
    prefetch: SYMPHONY_CDS_PREFETCH_ASSUMPTIONS.map(assumption => ({ ...assumption })),
  }
}
