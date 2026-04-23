import type {
  ClinicalReferenceDdiCheckResult,
  ClinicalReferenceDdiSeverity,
} from '@the-abyss/clinical-references'

import type {
  SymphonyAlert,
  SymphonyDiagnosisSuggestion,
  SymphonyTrafficLightGateResult,
  SymphonyTrafficLightLevel,
  SymphonyTrafficLightOutput,
} from '../contracts'

import { getSymphonyActionProtocol } from './action-protocols'
import { classifySymphonyChronicDisease } from './classifiers'

export interface SymphonyTrafficLightInput {
  alerts: readonly SymphonyAlert[]
  diagnosisSuggestions: readonly SymphonyDiagnosisSuggestion[]
  patientAge?: number
  chronicDiseases?: readonly string[]
  ddiResult?: ClinicalReferenceDdiCheckResult
}

const LEVEL_ORDER: Record<SymphonyTrafficLightLevel, number> = {
  GREEN: 0,
  YELLOW: 1,
  RED: 2,
}

const DDI_ORDER: Record<ClinicalReferenceDdiSeverity, number> = {
  unknown: 0,
  minor: 1,
  moderate: 2,
  major: 3,
  contraindicated: 4,
}

const CARDIOMETABOLIC_TYPES = new Set(['HT', 'DM', 'HF', 'CHD', 'STROKE'])

function escalate(
  current: SymphonyTrafficLightLevel,
  target: SymphonyTrafficLightLevel,
): SymphonyTrafficLightLevel {
  return LEVEL_ORDER[target] > LEVEL_ORDER[current] ? target : current
}

function getReferralRequired(alert: SymphonyAlert): boolean {
  if (alert.actionProtocol?.referral.required) return true

  if (!alert.actionProtocolId) return false

  return getSymphonyActionProtocol(alert.actionProtocolId)?.referral.required === true
}

function getAcutePresentationSignal(
  alerts: readonly SymphonyAlert[],
  diagnosisSuggestions: readonly SymphonyDiagnosisSuggestion[],
): boolean {
  const hasAcuteAlert = alerts.some(
    alert => alert.severity === 'critical' || alert.severity === 'high',
  )
  const hasMustNotMiss = diagnosisSuggestions.some(suggestion => suggestion.mustNotMiss)

  return hasAcuteAlert || hasMustNotMiss
}

function getMaxDdiSeverity(
  ddiResult: ClinicalReferenceDdiCheckResult | undefined,
): ClinicalReferenceDdiSeverity | null {
  if (!ddiResult || ddiResult.interactions.length === 0) return null

  return ddiResult.interactions.reduce<ClinicalReferenceDdiSeverity>((current, interaction) => {
    return DDI_ORDER[interaction.severity] > DDI_ORDER[current]
      ? interaction.severity
      : current
  }, 'unknown')
}

function normalizeIcdPrefix(value: string): string | null {
  const normalized = value.trim().toUpperCase()
  if (!normalized) return null

  const matched = normalized.match(/^[A-Z][0-9][0-9]/)
  return matched?.[0] ?? null
}

export function classifySymphonyTrafficLight(
  input: SymphonyTrafficLightInput,
): SymphonyTrafficLightOutput {
  let level: SymphonyTrafficLightLevel = 'GREEN'
  const reasons: string[] = []
  const gateResults: SymphonyTrafficLightGateResult[] = []
  let overrideApplied = false

  const topSuggestion = input.diagnosisSuggestions[0]
  const acutePresentation = getAcutePresentationSignal(input.alerts, input.diagnosisSuggestions)
  const maxDdiSeverity = getMaxDdiSeverity(input.ddiResult)

  const hasKnowledgeBaseRedFlags = input.alerts.some(
    alert => alert.source === 'pattern' || alert.source === 'safety_gate' || alert.source === 'composite',
  )
  if (hasKnowledgeBaseRedFlags) {
    level = escalate(level, 'YELLOW')
    overrideApplied = true
    reasons.push('Alert klinis deterministik terdeteksi dari engine knowledge base.')
  }
  gateResults.push({
    rule: 'Rule 1: KB Red Flags',
    triggered: hasKnowledgeBaseRedFlags,
    detail: hasKnowledgeBaseRedFlags
      ? 'Pattern/safety/composite alerts detected'
      : 'No deterministic KB red-flag alert detected',
  })

  const hasReferralCriteria =
    input.alerts.some(getReferralRequired) ||
    input.diagnosisSuggestions.some(suggestion => suggestion.mustNotMiss)
  if (hasReferralCriteria) {
    level = escalate(level, 'YELLOW')
    overrideApplied = true
    reasons.push('Kriteria rujukan atau diagnosis must-not-miss terdeteksi.')
  }
  gateResults.push({
    rule: 'Rule 2: Referral Criteria',
    triggered: hasReferralCriteria,
    detail: hasReferralCriteria
      ? 'Referral-required protocol or must-not-miss diagnosis detected'
      : 'No referral criteria triggered',
  })

  const isLowConfidence = topSuggestion !== undefined && topSuggestion.confidence < 0.3
  if (isLowConfidence) {
    level = escalate(level, 'YELLOW')
    overrideApplied = true
    reasons.push(`Low confidence: ${Math.round(topSuggestion.confidence * 100)}%.`)
  }
  gateResults.push({
    rule: 'Rule 3: Low Confidence',
    triggered: isLowConfidence,
    detail: isLowConfidence
      ? `Top diagnosis confidence ${Math.round((topSuggestion?.confidence ?? 0) * 100)}%`
      : 'Confidence threshold not breached',
  })

  const hasExtremeAge =
    input.patientAge !== undefined && (input.patientAge < 2 || input.patientAge > 70)
  const extremeAgeAcute = hasExtremeAge && acutePresentation
  if (extremeAgeAcute) {
    level = escalate(level, 'RED')
    overrideApplied = true
    reasons.push(`Usia ekstrem (${input.patientAge}) dengan presentasi akut.`)
  }
  gateResults.push({
    rule: 'Rule 4: Extreme Age + Acute',
    triggered: extremeAgeAcute,
    detail: extremeAgeAcute
      ? 'Extreme age combined with acute presentation'
      : 'No extreme-age acute escalation',
  })

  const noMatch = input.diagnosisSuggestions.length === 0
  if (noMatch) {
    level = escalate(level, 'YELLOW')
    overrideApplied = true
    reasons.push('Belum ada diagnosis kerja yang grounded.')
  }
  gateResults.push({
    rule: 'Rule 5: No KB Match',
    triggered: noMatch,
    detail: noMatch
      ? 'No diagnosis suggestion available'
      : `${input.diagnosisSuggestions.length} diagnosis suggestion(s) available`,
  })

  const ddiCritical = maxDdiSeverity === 'major' || maxDdiSeverity === 'contraindicated'
  if (ddiCritical) {
    level = escalate(level, 'RED')
    overrideApplied = true
    reasons.push(`DDI severity ${maxDdiSeverity} terdeteksi.`)
  }
  gateResults.push({
    rule: 'Rule 6: DDI Severity',
    triggered: ddiCritical,
    detail: maxDdiSeverity ? `Maximum DDI severity: ${maxDdiSeverity}` : 'No DDI interaction supplied',
  })

  const cardiometabolicCluster = new Set(
    input.diagnosisSuggestions
      .map(suggestion => classifySymphonyChronicDisease(suggestion.icd10Code))
      .filter(
        (classification): classification is NonNullable<typeof classification> =>
          classification !== null && CARDIOMETABOLIC_TYPES.has(classification.type),
      )
      .map(classification => classification.type),
  )
  const hasCardiometabolicCluster = cardiometabolicCluster.size >= 2
  if (hasCardiometabolicCluster) {
    level = escalate(level, 'YELLOW')
    overrideApplied = true
    reasons.push(
      `Cluster kardiometabolik: ${[...cardiometabolicCluster].join(', ')}.`,
    )
  }
  gateResults.push({
    rule: 'Rule 7: Cardiometabolic Cluster',
    triggered: hasCardiometabolicCluster,
    detail: hasCardiometabolicCluster
      ? `${cardiometabolicCluster.size} cardiometabolic diagnoses detected`
      : 'No cardiometabolic cluster',
  })

  const chronicPrefixes = new Set(
    (input.chronicDiseases ?? [])
      .map(normalizeIcdPrefix)
      .filter((value): value is string => value !== null),
  )
  const acuteOnChronic =
    chronicPrefixes.size > 0 &&
    input.diagnosisSuggestions.some(suggestion => {
      const prefix = normalizeIcdPrefix(suggestion.icd10Code)
      return prefix !== null && chronicPrefixes.has(prefix)
    }) &&
    acutePresentation
  if (acuteOnChronic) {
    level = escalate(level, 'RED')
    overrideApplied = true
    reasons.push('Pola acute-on-chronic terdeteksi.')
  }
  gateResults.push({
    rule: 'Rule 8: Acute-on-Chronic',
    triggered: acuteOnChronic,
    detail: acuteOnChronic
      ? 'Chronic ICD prefix overlaps with acute presentation'
      : 'No acute-on-chronic escalation',
  })

  return {
    level,
    reason: reasons.length > 0 ? reasons.join(' | ') : 'No safety concerns detected',
    gateResults,
    overrideApplied,
  }
}

export function trafficLightToSymphonyAlert(
  trafficLight: SymphonyTrafficLightOutput,
  triggeredAt = new Date().toISOString(),
): SymphonyAlert | null {
  if (trafficLight.level === 'GREEN') return null

  return {
    id: `symphony-traffic-light-${trafficLight.level.toLowerCase()}`,
    severity: trafficLight.level === 'RED' ? 'critical' : 'warning',
    title:
      trafficLight.level === 'RED'
        ? 'Traffic Light RED — rujukan dan stabilisasi segera'
        : 'Traffic Light YELLOW — monitor ketat dan review klinis',
    reasoning: [
      trafficLight.reason,
      ...trafficLight.gateResults
        .filter(result => result.triggered)
        .map(result => `${result.rule}: ${result.detail}`),
    ],
    source: 'safety_gate',
    acknowledged: false,
    triggeredAt,
  }
}
