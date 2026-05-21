import type { ClinicalTrajectoryLabPoint } from '@the-abyss/shared-types'

export interface LabEvent {
  id: string
  observedAt: string
  code: string      // e.g. 'CRP' — matched case-insensitively
  label: string     // human-readable → maps to ClinicalTrajectoryLabPoint.name
  value: number     // numeric for computation; String() on CT v1 output
  unit: string      // e.g. 'mg/L'
  source?: 'manual' | 'device' | 'imported' | 'self_report'
}

export type InfectiousSurgeClassification =
  | 'active_surge'       // CRP slope ≥ T48_ACTIVE_SURGE_SLOPE (37.0 mg/L/hr)
  | 'rising_crp'         // slope > 0 but < threshold
  | 'stable_or_declining'
  | 'insufficient_data'  // < 2 CRP observations or no temporal spread

// T-48 formula: CRP_t = CRP_0 + 37.0 × t — from Feature-Clinical Trajectory spec
const T48_ACTIVE_SURGE_SLOPE = 37.0

function isCRP(event: LabEvent): boolean {
  return event.code.toUpperCase() === 'CRP'
}

function crpInterpretation(
  value: number,
): ClinicalTrajectoryLabPoint['interpretation'] {
  if (value >= 200) return 'critical'
  if (value >= 10)  return 'high'
  if (value >= 0)   return 'normal'
  return 'unknown'
}

export function classifyInfectiousSurge(
  labEvents: LabEvent[],
): InfectiousSurgeClassification {
  const crpEvents = labEvents
    .filter(isCRP)
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime())

  if (crpEvents.length < 2) return 'insufficient_data'

  const earliest = crpEvents[0]
  const latest   = crpEvents[crpEvents.length - 1]
  const deltaMs  = new Date(latest.observedAt).getTime() - new Date(earliest.observedAt).getTime()
  const deltaHrs = deltaMs / (1000 * 60 * 60)

  if (deltaHrs <= 0) return 'insufficient_data'

  const slope = (latest.value - earliest.value) / deltaHrs

  if (slope >= T48_ACTIVE_SURGE_SLOPE) return 'active_surge'
  if (slope > 0)                        return 'rising_crp'
  return 'stable_or_declining'
}

export function buildLabsTimeline(labEvents: LabEvent[]): ClinicalTrajectoryLabPoint[] {
  return labEvents
    .slice()
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime())
    .map(e => ({
      id: e.id,
      observedAt: e.observedAt,
      source: (e.source ?? 'manual') as ClinicalTrajectoryLabPoint['source'],
      name: e.label,
      value: String(e.value),
      unit: e.unit,
      interpretation: isCRP(e) ? crpInterpretation(e.value) : 'unknown',
    }))
}
