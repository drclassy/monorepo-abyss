import type {
  SymphonyAlert,
  SymphonyDiagnosisSuggestion,
  SymphonyDiagnosticHypothesis,
  SymphonyVitalsInput,
} from '../contracts'

import { assessSymphonyConsciousnessSeverity, normalizeSymphonyConsciousnessToAvpu } from './classifiers'
import type {
  SymphonyPersonalBaseline,
  SymphonyTreatmentResponse,
} from './trajectory'

export interface SymphonyReasoningArbiterInput {
  nativeHypotheses: readonly SymphonyDiagnosticHypothesis[]
  hybridSuggestions: readonly SymphonyDiagnosisSuggestion[]
  alerts: readonly SymphonyAlert[]
  personalBaseline?: SymphonyPersonalBaseline
  treatmentResponse?: SymphonyTreatmentResponse
  latestVitals?: SymphonyVitalsInput
}

export interface SymphonyReasoningArbiterResult {
  nativeHypotheses: SymphonyDiagnosticHypothesis[]
  alerts: SymphonyAlert[]
  requiresReview: boolean
  arbitrationReasons: string[]
}


export function arbitrateSymphonyReasoning(
  input: SymphonyReasoningArbiterInput,
): SymphonyReasoningArbiterResult {
  const reasons: string[] = []

  const hasCritical = input.alerts.some(alert => alert.severity === 'critical')
  if (hasCritical) reasons.push('safety_critical_alert_present')

  const hasMustNotMiss = input.nativeHypotheses.some(
    item => item.category === 'must_not_miss',
  )
  if (hasMustNotMiss) reasons.push('native_must_not_miss_visible')

  const avpu = normalizeSymphonyConsciousnessToAvpu(input.latestVitals?.consciousness)
  if (avpu !== undefined) {
    const severity = assessSymphonyConsciousnessSeverity(avpu)
    if (severity === 'severe' || severity === 'unresponsive') {
      reasons.push('consciousness_compromised')
    }
  }

  if (input.treatmentResponse?.interpretation === 'worsening') {
    reasons.push('treatment_response_worsening')
  }

  const hasWorking = input.nativeHypotheses.some(
    item => item.category === 'working',
  )
  if (
    input.personalBaseline !== undefined &&
    input.personalBaseline.visitCount < 2 &&
    hasWorking
  ) {
    reasons.push('baseline_thin_with_working_hypothesis')
  }

  return {
    nativeHypotheses: input.nativeHypotheses.map(item => ({ ...item })),
    alerts: input.alerts.map(alert => ({ ...alert })),
    requiresReview: reasons.length > 0,
    arbitrationReasons: reasons,
  }
}
