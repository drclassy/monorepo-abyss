export type SymphonyCdsHookName = 'patient-view'

export type SymphonyCdsHookCardIndicator = 'info' | 'warning' | 'critical'

export type SymphonyCdsHookCardPolicyKey =
  | 'critical-alert'
  | 'must-not-miss'
  | 'top-hypothesis'
  | 'disposition-requires-review'
  | 'shadow-low-agreement'

export interface SymphonyCdsHookCardLink {
  label: string
  url: string
  type: 'absolute' | 'smart'
}

export interface SymphonyCdsHookCard {
  uuid: string
  summary: string
  indicator: SymphonyCdsHookCardIndicator
  source: { label: typeof SYMPHONY_CDS_SOURCE_LABEL }
  detail?: string
  links: SymphonyCdsHookCardLink[]
}

export interface SymphonyCdsHookResponse {
  cards: SymphonyCdsHookCard[]
}

export interface SymphonyCdsPrefetchAssumption {
  key: 'patient' | 'encounter'
  requirement: 'optional' | 'required'
}

export interface SymphonyCdsHookContextContract {
  hook: SymphonyCdsHookName
  requiredFields: readonly []
  optionalFields: readonly ['patientId', 'encounterId']
}

export interface SymphonyCdsServiceDefinition {
  id: 'aadiv2-symphony-patient-view'
  hook: SymphonyCdsHookName
  title: typeof SYMPHONY_CDS_SOURCE_LABEL
  description: string
  prefetch: readonly SymphonyCdsPrefetchAssumption[]
}

export interface SymphonyCdsResponseInvariant {
  sourceLabel: typeof SYMPHONY_CDS_SOURCE_LABEL
  cardOrder: readonly SymphonyCdsHookCardPolicyKey[]
  linksPolicy: 'always-empty-array'
  topLevelShape: readonly ['cards']
}

export const SYMPHONY_CDS_SOURCE_LABEL = 'AADI V2 Symphony'

export const SYMPHONY_CDS_CARD_SOURCE: SymphonyCdsHookCard['source'] = {
  label: SYMPHONY_CDS_SOURCE_LABEL,
}

export const SYMPHONY_CDS_HOOK_CONTEXT_CONTRACT: SymphonyCdsHookContextContract = {
  hook: 'patient-view',
  requiredFields: [],
  optionalFields: ['patientId', 'encounterId'],
}

export const SYMPHONY_CDS_PREFETCH_ASSUMPTIONS: readonly SymphonyCdsPrefetchAssumption[] = [
  { key: 'patient', requirement: 'optional' },
  { key: 'encounter', requirement: 'optional' },
]

export const SYMPHONY_CDS_RESPONSE_INVARIANTS: SymphonyCdsResponseInvariant = {
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
}
