import type { SymphonyResult } from '../contracts'

export type SymphonyCdsHookCardIndicator = 'info' | 'warning' | 'critical'

export interface SymphonyCdsHookCardLink {
  label: string
  url: string
  type: 'absolute' | 'smart'
}

export interface SymphonyCdsHookCard {
  uuid: string
  summary: string
  indicator: SymphonyCdsHookCardIndicator
  source: { label: 'AADI V2 Symphony' }
  detail?: string
  links: SymphonyCdsHookCardLink[]
}

export interface SymphonyCdsHookResponse {
  cards: SymphonyCdsHookCard[]
}

const CARD_SOURCE: SymphonyCdsHookCard['source'] = { label: 'AADI V2 Symphony' }

function buildUuid(prefix: string, index: number): string {
  return `aadiv2-${prefix}-${index}`
}

export function mapSymphonyResultToCdsHooksResponse(
  result: SymphonyResult,
): SymphonyCdsHookResponse {
  const cards: SymphonyCdsHookCard[] = []

  result.alerts
    .filter(alert => alert.severity === 'critical')
    .forEach((alert, index) => {
      cards.push({
        uuid: buildUuid('critical-alert', index),
        summary: `Critical safety alert: ${alert.id}`,
        indicator: 'critical',
        source: CARD_SOURCE,
        detail: `Source: ${alert.source}. Severity: ${alert.severity}.`,
        links: [],
      })
    })

  const hypotheses = result.nativeHypotheses ?? []
  const mustNotMiss = hypotheses.find(h => h.category === 'must_not_miss')
  if (mustNotMiss) {
    cards.push({
      uuid: buildUuid('must-not-miss', 0),
      summary: `Must-not-miss diagnosis active (ICD-10 ${mustNotMiss.icd10Code})`,
      indicator: 'warning',
      source: CARD_SOURCE,
      detail: `Category: ${mustNotMiss.category}. Confidence: ${mustNotMiss.confidence.toFixed(2)}.`,
      links: [],
    })
  }

  const top = hypotheses[0]
  if (top && top.category !== 'must_not_miss') {
    cards.push({
      uuid: buildUuid('top-hypothesis', 0),
      summary: `Working diagnosis (ICD-10 ${top.icd10Code})`,
      indicator: 'info',
      source: CARD_SOURCE,
      detail: `Category: ${top.category}. Rank: ${top.rank}. Confidence: ${top.confidence.toFixed(2)}.`,
      links: [],
    })
  }

  if (result.clinicalDisposition === 'requires_review') {
    cards.push({
      uuid: buildUuid('disposition-requires-review', 0),
      summary: 'Clinician review required',
      indicator: 'warning',
      source: CARD_SOURCE,
      detail: 'Clinical disposition: requires_review.',
      links: [],
    })
  }

  if (result.shadowComparison && result.shadowComparison.agreementLevel === 'low') {
    cards.push({
      uuid: buildUuid('shadow-low-agreement', 0),
      summary: 'Shadow comparison: low agreement between paths',
      indicator: 'warning',
      source: CARD_SOURCE,
      detail: 'Old hybrid path and new native path disagree across all axes.',
      links: [],
    })
  }

  return { cards }
}
