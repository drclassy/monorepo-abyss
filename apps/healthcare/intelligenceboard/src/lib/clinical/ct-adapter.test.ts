import assert from 'node:assert/strict'
import test from 'node:test'
import type { TrajectoryAnalysis, VisitRecord } from './trajectory-analyzer'
import { legacyIBToCtV1, legacyIBToCtV1Envelope } from './ct-adapter'

// ─── Fixture data ─────────────────────────────────────────────────────────────

const mockVisits: VisitRecord[] = [
  {
    patient_id: 'patient-test-001',
    encounter_id: 'enc-001',
    timestamp: '2026-05-01T08:00:00.000Z',
    vitals: { sbp: 145, dbp: 92, hr: 98, rr: 22, temp: 37.2, glucose: 145, spo2: 93, avpu: 'A' },
    keluhan_utama: 'sesak napas',
    source: 'scrape',
  },
  {
    patient_id: 'patient-test-001',
    encounter_id: 'enc-002',
    timestamp: '2026-05-01T14:00:00.000Z',
    vitals: { sbp: 152, dbp: 96, hr: 108, rr: 28, temp: 37.8, glucose: 162, spo2: 89, avpu: 'V' },
    keluhan_utama: 'sesak napas memburuk',
    source: 'scrape',
  },
  {
    patient_id: 'patient-test-001',
    encounter_id: 'enc-003',
    timestamp: '2026-05-01T20:00:00.000Z',
    vitals: { sbp: 160, dbp: 100, hr: 118, rr: 32, temp: 38.3, glucose: 188, spo2: 86, avpu: 'V' },
    keluhan_utama: 'sesak napas berat',
    source: 'scrape',
  },
]

const mockAnalysis: TrajectoryAnalysis = {
  overallTrend: 'declining',
  overallRisk: 'high',
  vitalTrends: [],
  recommendations: [],
  summary: 'Patient showing respiratory deterioration with worsening SpO2 and increasing RR.',
  visitCount: 3,
  global_deterioration: { state: 'deteriorating', deterioration_score: 72 },
  acute_attack_risk_24h: {
    hypertensive_crisis_risk: 18,
    glycemic_crisis_risk: 12,
    sepsis_like_deterioration_risk: 22,
    shock_decompensation_risk: 8,
    stroke_acs_suspicion_risk: 5,
  },
  early_warning_burden: {
    total_breaches_last5: 4,
    breach_frequency: 0.8,
    breach_breakdown: {
      sbp_ge_160_count: 1,
      temp_ge_38_5_count: 0,
      gds_ge_300_count: 0,
      hr_extreme_count: 1,
      rr_extreme_count: 2,
      spo2_lt_94_count: 3,
    },
  },
  trajectory_volatility: { volatility_index: 34, stability_label: 'unstable' },
  time_to_critical_estimate: {
    sbp_hours_to_critical: null,
    dbp_hours_to_critical: null,
    gds_hours_to_critical: null,
    temp_hours_to_critical: null,
    hr_hours_to_critical: null,
    rr_hours_to_critical: 8,
    spo2_hours_to_critical: 6,
  },
  mortality_proxy: {
    mortality_proxy_tier: 'high',
    mortality_proxy_score: 68,
    clinical_urgency_tier: 'high',
  },
  clinical_safe_output: {
    risk_tier: 'high',
    confidence: 0.75,
    drivers: ['SpO2 declining', 'RR increasing'],
    missing_data: ['FiO2', 'P/F ratio'],
    recommended_action: 'Urgent respiratory assessment',
    review_window: '24h',
  },
  confirmed_chronic_diagnoses: [],
  momentum: {
    level: 'CONVERGING',
    score: 78,
    params: [],
    baseline: {
      patientId: 'patient-test-001',
      computedAt: '2026-05-01T08:00:00.000Z',
      visitCount: 3,
      params: {},
    },
    convergence: {
      convergenceScore: 0.82,
      worseningParams: [],
      improvingParams: [],
      pattern: 'respiratory',
      narrative: 'Respiratory convergence detected across SpO2 and RR trends.',
      shouldAlert: true,
    },
    narrative: 'Converging toward respiratory crisis. SpO2 declining rapidly.',
    visitCount: 3,
    isReliable: true,
  },
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('output satisfies ClinicalTrajectoryV1 shape', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.version, 'ct.v1')
  assert.ok(typeof result.generatedAt === 'string')
  assert.ok(Array.isArray(result.vitalsTimeline))
  assert.ok(Array.isArray(result.derivedTimeline))
  assert.ok(result.response !== undefined)
  assert.ok(result.quality !== undefined)
})

test('treatmentResponsiveness is always unknown', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.response.treatmentResponsiveness, 'unknown')
})

test('respiratory convergence maps to instabilityPattern respiratory', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.response.instabilityPattern, 'respiratory')
})

test('vitalsTimeline length equals visits count', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.vitalsTimeline.length, mockVisits.length)
})

test('derivedTimeline has N+1 points (per-visit + aggregate)', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.derivedTimeline?.length, mockVisits.length + 1)
})

test('source scrape maps to imported', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.vitalsTimeline[0].source, 'imported')
})

test('AVPU A maps to alert, V maps to voice', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.vitalsTimeline[0].consciousness, 'alert')
  assert.equal(result.vitalsTimeline[1].consciousness, 'voice')
})

test('encounterContext carries patientId and last encounterId', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.encounterContext?.patientId, 'patient-test-001')
  assert.equal(result.encounterContext?.encounterId, 'enc-003')
})

test('requiresEscalation true when clinical_urgency_tier is high', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.response.requiresEscalation, true)
})

test('quality.sparseSamplingFlag false for 3 visits', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.quality?.sparseSamplingFlag, false)
})

test('quality.sparseSamplingFlag true for < 3 visits', () => {
  const sparseAnalysis: TrajectoryAnalysis = { ...mockAnalysis, visitCount: 2 }
  const result = legacyIBToCtV1(sparseAnalysis, mockVisits.slice(0, 2), 'patient-test-001')
  assert.equal(result.quality?.sparseSamplingFlag, true)
})

test('direction: critical state overrides pseudo_stable stability_label', () => {
  const criticalAnalysis: TrajectoryAnalysis = {
    ...mockAnalysis,
    global_deterioration: { state: 'critical', deterioration_score: 95 },
    trajectory_volatility: { volatility_index: 60, stability_label: 'pseudo_stable' },
  }
  const result = legacyIBToCtV1(criticalAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.response.direction, 'worsening')
})

test('envelope: linkedReasoning.authority is SYMPHONY', () => {
  const envelope = legacyIBToCtV1Envelope(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(envelope.linkedReasoning?.authority, 'SYMPHONY')
})

test('envelope: trajectory.version is ct.v1', () => {
  const envelope = legacyIBToCtV1Envelope(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(envelope.trajectory.version, 'ct.v1')
})
