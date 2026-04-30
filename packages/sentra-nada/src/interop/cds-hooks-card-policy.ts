// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { SymphonyDiagnosticHypothesis, SymphonyResult } from '../contracts'

import {
  SYMPHONY_CDS_CARD_SOURCE,
  type SymphonyCdsHookCard,
} from './cds-hooks-contract'

function buildUuid(prefix: string, index: number): string {
  return `aadiv2-${prefix}-${index}`
}

function buildCard(
  uuid: string,
  summary: string,
  indicator: SymphonyCdsHookCard['indicator'],
  detail?: string,
): SymphonyCdsHookCard {
  return {
    uuid,
    summary,
    indicator,
    source: SYMPHONY_CDS_CARD_SOURCE,
    detail,
    links: [],
  }
}

function buildMustNotMissSummary(hypothesis: SymphonyDiagnosticHypothesis): string {
  return `Must-not-miss diagnosis active (ICD-10 ${hypothesis.icd10Code})`
}

function buildTopHypothesisSummary(hypothesis: SymphonyDiagnosticHypothesis): string {
  return `Working diagnosis (ICD-10 ${hypothesis.icd10Code})`
}

export function buildCriticalAlertCards(result: SymphonyResult): SymphonyCdsHookCard[] {
  return result.alerts
    .filter(alert => alert.severity === 'critical')
    .map((alert, index) =>
      buildCard(
        buildUuid('critical-alert', index),
        `Critical safety alert: ${alert.id}`,
        'critical',
        `Source: ${alert.source}. Severity: ${alert.severity}.`,
      ),
    )
}

export function buildMustNotMissCards(result: SymphonyResult): SymphonyCdsHookCard[] {
  const hypothesis = (result.nativeHypotheses ?? []).find(
    candidate => candidate.category === 'must_not_miss',
  )
  if (!hypothesis) {
    return []
  }

  return [
    buildCard(
      buildUuid('must-not-miss', 0),
      buildMustNotMissSummary(hypothesis),
      'warning',
      `Category: ${hypothesis.category}. Confidence: ${hypothesis.confidence.toFixed(2)}.`,
    ),
  ]
}

export function buildTopHypothesisCards(result: SymphonyResult): SymphonyCdsHookCard[] {
  const top = result.nativeHypotheses?.[0]
  if (!top || top.category === 'must_not_miss') {
    return []
  }

  return [
    buildCard(
      buildUuid('top-hypothesis', 0),
      buildTopHypothesisSummary(top),
      'info',
      `Category: ${top.category}. Rank: ${top.rank}. Confidence: ${top.confidence.toFixed(2)}.`,
    ),
  ]
}

export function buildDispositionCards(result: SymphonyResult): SymphonyCdsHookCard[] {
  if (result.clinicalDisposition !== 'requires_review') {
    return []
  }

  return [
    buildCard(
      buildUuid('disposition-requires-review', 0),
      'Clinician review required',
      'warning',
      'Clinical disposition: requires_review.',
    ),
  ]
}

export function buildShadowCards(result: SymphonyResult): SymphonyCdsHookCard[] {
  if (result.shadowComparison?.agreementLevel !== 'low') {
    return []
  }

  return [
    buildCard(
      buildUuid('shadow-low-agreement', 0),
      'Shadow comparison: low agreement between paths',
      'warning',
      'Old hybrid path and new native path disagree across all axes.',
    ),
  ]
}
