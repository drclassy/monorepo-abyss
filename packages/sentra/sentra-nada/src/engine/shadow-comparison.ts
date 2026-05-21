// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  SymphonyAlert,
  SymphonyClinicalDisposition,
  SymphonyDiagnosisSuggestion,
  SymphonyDiagnosticHypothesis,
  SymphonyShadowComparison,
  SymphonyTrafficLightLevel,
} from '../contracts'

import { determineSymphonyClinicalDisposition } from './confidence-engine'

export interface SymphonyShadowComparisonInput {
  hybridSuggestions: readonly SymphonyDiagnosisSuggestion[]
  nativeHypotheses: readonly SymphonyDiagnosticHypothesis[]
  alerts: readonly SymphonyAlert[]
  oldTrafficLightLevel?: SymphonyTrafficLightLevel
  newTrafficLightLevel?: SymphonyTrafficLightLevel
  newClinicalDisposition: SymphonyClinicalDisposition
  newPathFailed: boolean
}

export function compareSymphonyShadowPaths(
  input: SymphonyShadowComparisonInput
): SymphonyShadowComparison {
  const oldPathAvailable =
    input.hybridSuggestions.length > 0 || input.oldTrafficLightLevel !== undefined
  const newPathAvailable = !input.newPathFailed && input.nativeHypotheses.length > 0

  const oldTopIcd = input.hybridSuggestions[0]?.icd10Code ?? null
  const newTopIcd = input.nativeHypotheses[0]?.icd10Code ?? null
  const topDiagnosisChanged = oldTopIcd !== newTopIcd

  const oldLevel = input.oldTrafficLightLevel ?? null
  const newLevel = input.newTrafficLightLevel ?? null
  const escalationChanged = oldLevel !== newLevel

  const hasCriticalAlert = input.alerts.some((alert) => alert.severity === 'critical')
  const oldArbiterReview = input.hybridSuggestions.some(
    (suggestion) => suggestion.mustNotMiss === true
  )
  const oldClinicalDisposition = determineSymphonyClinicalDisposition({
    nativeHypothesisCount: input.hybridSuggestions.length,
    hasCriticalAlert,
    usedFallback: false,
    arbiterRequiresReview: oldArbiterReview,
  })
  const clinicalDispositionChanged = oldClinicalDisposition !== input.newClinicalDisposition

  let agreementLevel: SymphonyShadowComparison['agreementLevel']
  if (!oldPathAvailable || !newPathAvailable) {
    agreementLevel = 'not_comparable'
  } else {
    const matches =
      (topDiagnosisChanged ? 0 : 1) +
      (escalationChanged ? 0 : 1) +
      (clinicalDispositionChanged ? 0 : 1)
    if (matches === 3) agreementLevel = 'high'
    else if (matches >= 1) agreementLevel = 'partial'
    else agreementLevel = 'low'
  }

  const notes: string[] = [
    `old_path_top:${oldTopIcd ?? 'none'}`,
    `new_path_top:${newTopIcd ?? 'none'}`,
    `old_escalation:${oldLevel ?? 'not_evaluated'}`,
    `new_escalation:${newLevel ?? 'not_evaluated'}`,
    `old_disposition:${oldClinicalDisposition}`,
    `new_disposition:${input.newClinicalDisposition}`,
    `new_path_failed:${input.newPathFailed ? 1 : 0}`,
  ]

  return {
    oldPathAvailable,
    newPathAvailable,
    agreementLevel,
    topDiagnosisChanged,
    escalationChanged,
    clinicalDispositionChanged,
    notes,
  }
}
