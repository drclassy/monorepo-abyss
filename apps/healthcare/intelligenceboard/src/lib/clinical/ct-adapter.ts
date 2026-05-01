import type { AVPULevel } from '../vitals/unified-vitals'
import type {
  MomentumAnalysis,
  TrajectoryAnalysis,
  VisitRecord,
} from './trajectory-analyzer'
import { computeNEWS2 } from './news2-score'
import type { TreatmentEvent } from './treatment-response-scorer'
import { aggregateResponsiveness, buildTreatmentTimeline } from './treatment-response-scorer'
import type {
  ClinicalConsciousnessLevel,
  ClinicalInstabilityPattern,
  ClinicalTrajectoryBaseline,
  ClinicalTrajectoryConfidence,
  ClinicalTrajectoryDerivedPoint,
  ClinicalTrajectoryDirection,
  ClinicalTrajectoryEncounterContext,
  ClinicalTrajectoryEnvelope,
  ClinicalTrajectoryMomentum,
  ClinicalTrajectoryQuality,
  ClinicalTrajectoryResponseAssessment,
  ClinicalTrajectorySeverityBand,
  ClinicalTrajectoryTreatmentPoint,
  ClinicalTrajectoryV1,
  ClinicalTrajectoryVitalPoint,
  ClinicalTreatmentResponsiveness,
} from '@the-abyss/shared-types'

function mapAVPU(avpu: AVPULevel | undefined): ClinicalConsciousnessLevel {
  switch (avpu) {
    case 'A': return 'alert'
    // ACVPU: 'C' (new Confusion) → 'voice' proxy (conservative — confusion is a red flag)
    case 'C': return 'voice'
    case 'V': return 'voice'
    case 'P': return 'pain'
    case 'U': return 'unresponsive'
    default:  return 'unknown'
  }
}

// Ordered precedence: first match wins.
// Rule: global_deterioration.state='critical' overrides stability_label='pseudo_stable'.
function mapDirection(analysis: TrajectoryAnalysis): ClinicalTrajectoryDirection {
  if (analysis.global_deterioration.state === 'critical') return 'worsening'
  if (analysis.overallTrend === 'insufficient_data') return 'unknown'
  if (analysis.trajectory_volatility.stability_label === 'pseudo_stable') return 'fluctuating'
  if (analysis.global_deterioration.state === 'improving') return 'improving'
  if (analysis.global_deterioration.state === 'deteriorating') return 'worsening'
  return 'stable'
}

function mapMomentum(momentum: MomentumAnalysis): ClinicalTrajectoryMomentum {
  if (!momentum.isReliable) return 'unknown'
  switch (momentum.level) {
    case 'INSUFFICIENT_DATA':
    case 'PRELIMINARY':
      return 'unknown'
    case 'STABLE':
    case 'DRIFTING':
      return 'slow'
    case 'ACCELERATING':
      return 'moderate'
    case 'CONVERGING':
    case 'CRITICAL_MOMENTUM':
      return 'rapid'
    default:
      return 'unknown'
  }
}

// 'allergic' is never produced by this adapter — allergy path requires T-53 (outside canonical 52).
function mapInstabilityPattern(
  pattern: MomentumAnalysis['convergence']['pattern'],
): ClinicalInstabilityPattern {
  switch (pattern) {
    case 'respiratory':        return 'respiratory'
    case 'shock':
    case 'cardiovascular':
    case 'hypertensive_crisis': return 'hemodynamic'
    case 'sepsis_like':        return 'infectious'
    case 'metabolic_crisis':   return 'metabolic'
    case 'multi_system':       return 'mixed'
    default:                   return 'unknown'
  }
}

function mapSeverityBand(analysis: TrajectoryAnalysis): ClinicalTrajectorySeverityBand {
  // global_deterioration.state='critical' is a hard override
  if (analysis.global_deterioration.state === 'critical') return 'critical'
  switch (analysis.mortality_proxy.mortality_proxy_tier) {
    case 'low':      return 'low'
    case 'moderate': return 'watch'
    case 'high':     return 'concerning'
    case 'very_high': return 'critical'
  }
}

function mapConfidence(
  analysis: TrajectoryAnalysis,
  momentum: MomentumAnalysis,
): ClinicalTrajectoryConfidence {
  if (!momentum.isReliable) return 'insufficient_data'
  const c = analysis.clinical_safe_output.confidence
  if (c >= 0.7) return 'high'
  if (c >= 0.4) return 'moderate'
  if (c >= 0.1) return 'low'
  return 'insufficient_data'
}

function buildVitalsTimeline(visits: VisitRecord[]): ClinicalTrajectoryVitalPoint[] {
  return visits.map((v, i) => ({
    id: v.encounter_id ?? `vp-${i}`,
    observedAt: v.timestamp,
    source: v.source === 'scrape' ? 'imported' as const : 'manual' as const,
    sbp: v.vitals.sbp,
    dbp: v.vitals.dbp,
    hr: v.vitals.hr,
    rr: v.vitals.rr,
    temp: v.vitals.temp,
    spo2: v.vitals.spo2,
    glucose: v.vitals.glucose,
    consciousness: mapAVPU(v.vitals.avpu),
    notes: [],
  }))
}

function buildDerivedTimeline(
  analysis: TrajectoryAnalysis,
  visits: VisitRecord[],
  vitalsTimeline: ClinicalTrajectoryVitalPoint[],
): ClinicalTrajectoryDerivedPoint[] {
  const sentraPoints: ClinicalTrajectoryDerivedPoint[] = visits.map(v => ({
    id: `dp-${v.encounter_id}`,
    observedAt: v.timestamp,
    source: 'derived' as const,
    calculationBasis: 'sentra_rule_v1' as const,
    calculationLabel: 'IB Legacy Trajectory Score',
    evidenceRefs: ['FKTP 2024', 'PERKENI 2024'],
    shockIndex: v.vitals.sbp > 0 ? v.vitals.hr / v.vitals.sbp : undefined,
    flags: [],
  }))

  const news2Points: ClinicalTrajectoryDerivedPoint[] = visits.map((v, i) => {
    const vp = vitalsTimeline[i]
    return {
      id: `dp-news2-${v.encounter_id}`,
      observedAt: v.timestamp,
      source: 'derived' as const,
      calculationBasis: 'official_score' as const,
      calculationLabel: 'NEWS2',
      evidenceRefs: [vp?.id ?? `vp-${i}`],
      news2Total: vp ? computeNEWS2(vp) : undefined,
      flags: [],
    }
  })

  const lastVisit = visits[visits.length - 1]
  const aggregateFlags: string[] = [analysis.trajectory_volatility.stability_label]
  if (analysis.momentum.convergence.pattern !== 'none') {
    aggregateFlags.push(`convergence:${analysis.momentum.convergence.pattern}`)
  }
  if (analysis.early_warning_burden.total_breaches_last5 > 0) {
    aggregateFlags.push(`breaches:${analysis.early_warning_burden.total_breaches_last5}`)
  }

  const aggregate: ClinicalTrajectoryDerivedPoint = {
    id: `dp-agg-${lastVisit?.encounter_id ?? 'unknown'}`,
    observedAt: lastVisit?.timestamp ?? new Date().toISOString(),
    source: 'derived' as const,
    calculationBasis: 'sentra_rule_v1' as const,
    calculationLabel: 'IB Legacy Trajectory Score',
    evidenceRefs: ['FKTP 2024', 'PERKENI 2024'],
    flags: aggregateFlags,
    summary: analysis.momentum.narrative,
  }

  // Interleave: sentra_rule_v1 + NEWS2 point per visit, then aggregate
  const perVisitInterleaved = visits.flatMap((_, i) => [sentraPoints[i], news2Points[i]])
  return [...perVisitInterleaved, aggregate]
}

function buildResponse(
  analysis: TrajectoryAnalysis,
  treatmentTimeline: ClinicalTrajectoryTreatmentPoint[],
): ClinicalTrajectoryResponseAssessment {
  const treatmentResponsiveness: ClinicalTreatmentResponsiveness =
    treatmentTimeline.length > 0
      ? aggregateResponsiveness(treatmentTimeline.map(t => t.response))
      : 'unknown'
  return {
    direction: mapDirection(analysis),
    momentum: mapMomentum(analysis.momentum),
    instabilityPattern: mapInstabilityPattern(analysis.momentum.convergence.pattern),
    treatmentResponsiveness,
    severityBand: mapSeverityBand(analysis),
    confidence: mapConfidence(analysis, analysis.momentum),
    summary: analysis.summary,
    evidenceRefs: ['FKTP 2024', 'PERKENI 2024'],
    requiresEscalation:
      analysis.mortality_proxy.clinical_urgency_tier === 'high' ||
      analysis.mortality_proxy.clinical_urgency_tier === 'immediate',
    recommendedMonitoringCadence: analysis.clinical_safe_output.review_window,
  }
}

function buildBaseline(analysis: TrajectoryAnalysis): ClinicalTrajectoryBaseline {
  const { params } = analysis.momentum.baseline
  return {
    usualSbp: params.sbp?.mean,
    usualDbp: params.dbp?.mean,
    usualSpo2: params.spo2?.mean,
    usualGlucose: params.glucose?.mean,
    chronicDiseases: analysis.confirmed_chronic_diagnoses.map(d => d.icd_x),
  }
}

function buildQuality(analysis: TrajectoryAnalysis): ClinicalTrajectoryQuality {
  return {
    completenessScore: analysis.clinical_safe_output.confidence,
    missingFields: analysis.clinical_safe_output.missing_data,
    sparseSamplingFlag: analysis.visitCount < 3,
    notes: [`visitCount: ${analysis.visitCount}`],
  }
}

function buildEncounterContext(
  visits: VisitRecord[],
  patientId: string,
): ClinicalTrajectoryEncounterContext {
  const lastVisit = visits[visits.length - 1]
  return {
    patientId,
    encounterId: lastVisit?.encounter_id,
  }
}

export function legacyIBToCtV1(
  analysis: TrajectoryAnalysis,
  visits: VisitRecord[],
  patientId: string,
  treatments?: TreatmentEvent[],
): ClinicalTrajectoryV1 {
  const vitalsTimeline = buildVitalsTimeline(visits)
  const treatmentTimeline = treatments && treatments.length > 0
    ? buildTreatmentTimeline(treatments, visits)
    : undefined
  return {
    version: 'ct.v1',
    generatedAt: new Date().toISOString(),
    baseline: buildBaseline(analysis),
    encounterContext: buildEncounterContext(visits, patientId),
    vitalsTimeline,
    derivedTimeline: buildDerivedTimeline(analysis, visits, vitalsTimeline),
    treatmentTimeline,
    response: buildResponse(analysis, treatmentTimeline ?? []),
    quality: buildQuality(analysis),
  }
}

export function legacyIBToCtV1Envelope(
  analysis: TrajectoryAnalysis,
  visits: VisitRecord[],
  patientId: string,
): ClinicalTrajectoryEnvelope {
  return {
    trajectory: legacyIBToCtV1(analysis, visits, patientId),
    linkedReasoning: {
      authority: 'SYMPHONY',
    },
  }
}
