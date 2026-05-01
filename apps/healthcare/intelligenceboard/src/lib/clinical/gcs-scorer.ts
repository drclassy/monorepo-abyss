import type { ClinicalTrajectoryGCSPoint } from '@the-abyss/shared-types'

export interface GCSEvent {
  id: string
  observedAt: string
  source: 'manual' | 'imported'
  gcsTotal: number
  eyeScore?: number
  verbalScore?: number
  motorScore?: number
}

export type NeurologicDeclineClassification =
  | 'active_decline'
  | 'gradual_decline'
  | 'stable_or_improving'
  | 'insufficient_data'

function gcsInterpretation(
  gcsTotal: number,
): ClinicalTrajectoryGCSPoint['interpretation'] {
  if (gcsTotal >= 13) return 'normal'
  if (gcsTotal >= 9)  return 'mild_impairment'
  if (gcsTotal >= 6)  return 'moderate_impairment'
  return 'severe_impairment'
}

// T-49 formula: GCS_t = GCS_0 + (-1.3) × t (slope in pts/hr, R²=0.97)
// slope ≤ -1.3 → active_decline; slope < 0 → gradual_decline; ≥ 0 → stable_or_improving
export function classifyNeurologicDecline(
  events: GCSEvent[],
): { classification: NeurologicDeclineClassification; slopePerHour?: number } {
  if (events.length < 2) return { classification: 'insufficient_data' }

  const sorted = [...events].sort(
    (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime(),
  )

  const first = sorted[0]
  const last  = sorted[sorted.length - 1]
  const deltaHrs =
    (new Date(last.observedAt).getTime() - new Date(first.observedAt).getTime()) / 3_600_000

  if (deltaHrs === 0) return { classification: 'insufficient_data' }

  const slopePerHour = (last.gcsTotal - first.gcsTotal) / deltaHrs

  let classification: NeurologicDeclineClassification
  if (slopePerHour <= -1.3) classification = 'active_decline'
  else if (slopePerHour < 0) classification = 'gradual_decline'
  else classification = 'stable_or_improving'

  return { classification, slopePerHour }
}

export function buildGCSTimeline(
  events: GCSEvent[],
): ClinicalTrajectoryGCSPoint[] {
  return [...events]
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime())
    .map((ev) => ({
      id: ev.id,
      observedAt: ev.observedAt,
      source: ev.source,
      gcsTotal: ev.gcsTotal,
      eyeScore: ev.eyeScore,
      verbalScore: ev.verbalScore,
      motorScore: ev.motorScore,
      interpretation: gcsInterpretation(ev.gcsTotal),
    }))
}
