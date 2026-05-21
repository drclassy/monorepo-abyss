// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { SymphonyClinicalDisposition } from '../contracts'

export interface SymphonyDispositionInput {
  nativeHypothesisCount: number
  hasCriticalAlert: boolean
  usedFallback: boolean
  arbiterRequiresReview?: boolean
}

export function determineSymphonyClinicalDisposition(
  input: SymphonyDispositionInput,
): SymphonyClinicalDisposition {
  if (input.usedFallback) return 'degraded'
  if (input.nativeHypothesisCount === 0) return 'insufficient_data'
  if (input.hasCriticalAlert || input.arbiterRequiresReview === true) {
    return 'requires_review'
  }
  return 'ok'
}
