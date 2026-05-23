import type {
  ClinicalTrajectoryTreatmentPoint,
  ClinicalTreatmentResponsiveness,
} from '@the-abyss/shared-types'

import type { VisitRecord } from './trajectory-analyzer'

export interface TreatmentEvent {
  id: string
  occurredAt: string
  category: string
  label: string
  dose?: string
  route?: string
}

const RESPONSE_WINDOW_MS = 24 * 60 * 60 * 1000

// T-51: HR_t = HR_0 + (−7.9)×t → responsive when observed slope ≤ −7.9 bpm/hr
const T51_HR_SLOPE = -7.9
// T-52: HR_t = HR_0 + 2.6×t → non_responsive when observed slope ≥ +2.6 bpm/hr
const T52_HR_SLOPE = 2.6
// Secondary worsening signals (multi-parameter confirmation required for 'worsening' tier)
const WORSENING_SPO2_DROP = 2  // ≥ 2 percentage points
const WORSENING_RR_RISE = 4    // ≥ 4 breaths/min

function hrSlopeBpmPerHour(
  hrPre: number,
  hrPost: number,
  eventMs: number,
  postMs: number,
): number {
  const hours = (postMs - eventMs) / 3_600_000
  return hours > 0 ? (hrPost - hrPre) / hours : 0
}

export function classifyTreatmentResponse(
  event: TreatmentEvent,
  visits: VisitRecord[],
): ClinicalTreatmentResponsiveness {
  const eventTime = new Date(event.occurredAt).getTime()

  const sorted = [...visits].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  const preVisit = sorted.filter(v => new Date(v.timestamp).getTime() < eventTime).at(-1)
  if (!preVisit) return 'unknown'

  const postVisit = sorted.find(v => {
    const t = new Date(v.timestamp).getTime()
    return t > eventTime && t <= eventTime + RESPONSE_WINDOW_MS
  })
  if (!postVisit) return 'unknown'

  const postTime = new Date(postVisit.timestamp).getTime()
  const slope = hrSlopeBpmPerHour(preVisit.vitals.hr, postVisit.vitals.hr, eventTime, postTime)

  if (slope <= T51_HR_SLOPE) return 'responsive'

  if (slope >= T52_HR_SLOPE) {
    const spo2Drop = preVisit.vitals.spo2 - postVisit.vitals.spo2
    const rrRise = postVisit.vitals.rr - preVisit.vitals.rr
    if (spo2Drop >= WORSENING_SPO2_DROP || rrRise >= WORSENING_RR_RISE) return 'worsening'
    return 'non_responsive'
  }

  return 'partially_responsive'
}

export function aggregateResponsiveness(
  responses: (ClinicalTreatmentResponsiveness | undefined)[],
): ClinicalTreatmentResponsiveness {
  const known = responses.filter((r): r is ClinicalTreatmentResponsiveness => r != null && r !== 'unknown')
  if (known.length === 0) return 'unknown'
  const priority: ClinicalTreatmentResponsiveness[] = ['worsening', 'non_responsive', 'partially_responsive', 'responsive']
  for (const p of priority) {
    if (known.includes(p)) return p
  }
  return 'unknown'
}

export function buildTreatmentTimeline(
  events: TreatmentEvent[],
  visits: VisitRecord[],
): ClinicalTrajectoryTreatmentPoint[] {
  return events.map(event => {
    const intervention = event.dose
      ? `${event.label} ${event.dose}${event.route ? ` (${event.route})` : ''}`
      : event.label
    return {
      id: event.id,
      observedAt: event.occurredAt,
      source: 'manual' as const,
      intervention,
      response: classifyTreatmentResponse(event, visits),
    }
  })
}
