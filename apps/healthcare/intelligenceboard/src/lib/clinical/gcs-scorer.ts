import type { ClinicalTrajectoryGCSPoint } from '@the-abyss/shared-types'

export interface GCSEvent {
  id: string
  observedAt: string
  source: 'manual' | 'imported'
  /** Clinical GCS range: 3 (deep coma) – 15 (fully alert). Values outside this range are accepted but clinically invalid. */
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

// T-49 trend seam — NOT a full neurologic deterioration engine.
// Slope = (lastGCS − firstGCS) / deltaHours  (endpoint arithmetic, not regression).
// Threshold -1.3 pts/hr is from the T-49 feature spec. Classification:
//   slope ≤ -1.3  → active_decline
//   slope <  0    → gradual_decline
//   slope ≥  0    → stable_or_improving
//   < 2 events OR deltaHours = 0 → insufficient_data
// Mid-series fluctuations are not captured; only the overall first-to-last trend is scored.
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
