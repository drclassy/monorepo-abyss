import type { UnicomEvent, RiskLevel } from './schemas.js'

export { RiskLevelSchema } from './schemas.js'
export type { RiskLevel } from './schemas.js'

const HIGH_RISK_TYPES = new Set<UnicomEvent['type']>([
  'agent.proposal',
  'agent.warning',
  'human.intervention',
  'room.paused',
  'room.frozen',
])

const CRITICAL_RISK_HINTS = ['packages/sentra/', '.env', 'clinical', 'diagnosis']

export function classifyEventRisk(
  event: Pick<UnicomEvent, 'type' | 'risk' | 'payload'>
): RiskLevel {
  if (event.risk === 'critical') {
    return 'critical'
  }
  if (event.risk === 'high') {
    return 'high'
  }
  const payloadText = JSON.stringify(event.payload)
  if (CRITICAL_RISK_HINTS.some((hint) => payloadText.includes(hint))) {
    return 'critical'
  }
  if (HIGH_RISK_TYPES.has(event.type)) {
    return 'high'
  }
  return event.risk
}
