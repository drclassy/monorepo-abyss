import assert from 'node:assert/strict'
import test from 'node:test'
import { legacyIBToCtV1, legacyIBToCtV1Envelope } from './ct-adapter'
import type { GCSEvent } from './gcs-scorer'
import type { LabEvent } from './lab-event-scorer'
import type { TrajectoryAnalysis, VisitRecord } from './trajectory-analyzer'
import type { TreatmentEvent } from './treatment-response-scorer'

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

test('derivedTimeline has 2N+1 points (sentra + NEWS2 per visit, plus aggregate)', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.derivedTimeline?.length, mockVisits.length * 2 + 1)
})

test('derivedTimeline NEWS2 points have calculationBasis official_score', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  const news2Points = result.derivedTimeline?.filter(d => d.calculationBasis === 'official_score')
  assert.equal(news2Points?.length, mockVisits.length)
  assert.ok(news2Points?.every(d => d.news2Total !== undefined))
})

test('NEWS2 score for critical respiratory visit is ≥9', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  const lastNews2 = result.derivedTimeline?.find(d => d.id === 'dp-news2-enc-003')
  assert.ok(lastNews2?.news2Total !== undefined && lastNews2.news2Total >= 9,
    `expected ≥9 for critical visit, got ${lastNews2?.news2Total}`)
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

// ─── Phase B: Treatment-response layer ───────────────────────────────────────

const mockTreatments: TreatmentEvent[] = [
  {
    id: 'tx-001',
    occurredAt: '2026-05-01T11:00:00.000Z',  // between enc-001 (08:00) and enc-002 (14:00)
    category: 'medication',
    label: 'Salbutamol',
    dose: '2.5mg',
    route: 'nebulization',
  },
]

test('treatmentTimeline undefined when no treatments provided', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.treatmentTimeline, undefined)
})

test('treatmentTimeline populated when treatments provided', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', mockTreatments)
  assert.ok(Array.isArray(result.treatmentTimeline))
  assert.equal(result.treatmentTimeline?.length, 1)
  assert.equal(result.treatmentTimeline?.[0].id, 'tx-001')
  assert.equal(result.treatmentTimeline?.[0].intervention, 'Salbutamol 2.5mg (nebulization)')
  assert.equal(result.treatmentTimeline?.[0].source, 'manual')
})

test('treatmentResponsiveness is unknown when no treatments provided (backward compat)', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.response.treatmentResponsiveness, 'unknown')
})

test('treatmentResponsiveness reflects HR slope when treatments provided', () => {
  // enc-001 (08:00): hr=98, enc-002 (14:00): hr=108, tx-001 at 11:00
  // HR pre (08:00)=98, HR post (14:00)=108, delta=3h → slope=(108-98)/3=+3.33 bpm/hr ≥ T52=+2.6
  // spo2 08:00=93, spo2 14:00=89 → drop=4pp ≥ 2pp → worsening
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', mockTreatments)
  assert.ok(
    result.response.treatmentResponsiveness !== 'unknown',
    'expected treatmentResponsiveness to be classified when events are provided',
  )
  assert.equal(result.response.treatmentResponsiveness, 'worsening')
})

// ─── Phase D: Lab / CRP layer ─────────────────────────────────────────────────

const mockLabEvents: LabEvent[] = [
  {
    id: 'lab-001',
    observedAt: '2026-05-01T08:00:00.000Z',  // enc-001
    code: 'CRP',
    label: 'C-Reactive Protein',
    value: 45,
    unit: 'mg/L',
    source: 'manual',
  },
  {
    id: 'lab-002',
    observedAt: '2026-05-01T09:00:00.000Z',  // 1h later → slope=(82-45)/1=37 → active_surge
    code: 'CRP',
    label: 'C-Reactive Protein',
    value: 82,
    unit: 'mg/L',
    source: 'manual',
  },
]

test('labsTimeline undefined when no labs provided', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.labsTimeline, undefined)
})

test('labsTimeline populated when labs provided', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, mockLabEvents)
  assert.ok(Array.isArray(result.labsTimeline))
  assert.equal(result.labsTimeline?.length, 2)
  assert.equal(result.labsTimeline?.[0].id, 'lab-001')
  assert.equal(result.labsTimeline?.[0].name, 'C-Reactive Protein')
  assert.equal(result.labsTimeline?.[0].value, '45')  // string in CT v1 contract
})

test('T-48 derived point appended to derivedTimeline when labs provided', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, mockLabEvents)
  const t48Point = result.derivedTimeline?.find(d => d.calculationBasis === 'standard_formula')
  assert.ok(t48Point !== undefined, 'expected T-48 derived point')
  assert.ok(t48Point?.id.startsWith('dp-t48-'))
  assert.equal(t48Point?.calculationLabel, 'T-48 Infectious Surge (CRP Slope)')
})

test('T-48 derived point carries active_surge flag for CRP slope ≥ 37', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, mockLabEvents)
  const t48Point = result.derivedTimeline?.find(d => d.calculationBasis === 'standard_formula')
  assert.ok(t48Point?.flags?.includes('t48:active_surge'), `expected t48:active_surge, got ${JSON.stringify(t48Point?.flags)}`)
})

test('no T-48 derived point when no labs provided', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  const t48Point = result.derivedTimeline?.find(d => d.calculationBasis === 'standard_formula')
  assert.equal(t48Point, undefined)
})

test('derivedTimeline length is 2N+2 when labs provided (2N+1 existing + T-48 point)', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, mockLabEvents)
  assert.equal(result.derivedTimeline?.length, mockVisits.length * 2 + 2)
})

// ─── Phase C: NEWS2 Scale 2 / COPD flag ──────────────────────────────────────

test('copdScale2: enc-001 (spo2=93) scores lower on Scale 2 than Scale 1', () => {
  // enc-001: spo2=93. Scale 1: 93→2 (+2 to total). Scale 2: 93 on air→0 (no penalty).
  const s1Result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  const s2Result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, undefined, { copdScale2: true })
  const s1Point = s1Result.derivedTimeline?.find(d => d.id === 'dp-news2-enc-001')
  const s2Point = s2Result.derivedTimeline?.find(d => d.id === 'dp-news2-enc-001')
  assert.ok(
    (s2Point?.news2Total ?? Infinity) < (s1Point?.news2Total ?? 0),
    `expected Scale 2 < Scale 1, got s1=${s1Point?.news2Total} s2=${s2Point?.news2Total}`,
  )
})

test('copdScale2: all NEWS2 derived points carry news2:scale2 flag', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, undefined, { copdScale2: true })
  const news2Points = result.derivedTimeline?.filter(d => d.calculationBasis === 'official_score')
  assert.ok(news2Points?.every(d => d.flags?.includes('news2:scale2')),
    'all NEWS2 points must carry news2:scale2 flag when copdScale2=true')
})

test('backward compat: no options → NEWS2 points do not carry news2:scale2 flag', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  const news2Points = result.derivedTimeline?.filter(d => d.calculationBasis === 'official_score')
  assert.ok(news2Points?.every(d => !d.flags?.includes('news2:scale2')),
    'Scale 2 flag must not appear when copdScale2 not set')
})

// ─── Phase F: T-49 GCS seam ───────────────────────────────────────────────────

const mockGCSEvents: GCSEvent[] = [
  { id: 'gcs-1', observedAt: '2026-05-01T08:00:00.000Z', source: 'manual', gcsTotal: 15 },
  { id: 'gcs-2', observedAt: '2026-05-01T10:00:00.000Z', source: 'manual', gcsTotal: 12 },
]

test('Phase F: gcsTimeline is populated when gcsEvents supplied', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, undefined, { gcsEvents: mockGCSEvents })
  assert.ok(result.gcsTimeline !== undefined, 'gcsTimeline should be present')
  assert.equal(result.gcsTimeline?.length, 2)
  assert.equal(result.gcsTimeline?.[0].id, 'gcs-1')
  assert.equal(result.gcsTimeline?.[0].interpretation, 'normal')
  assert.equal(result.gcsTimeline?.[1].interpretation, 'mild_impairment')
})

test('Phase F: gcsTimeline is absent when no gcsEvents', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  assert.equal(result.gcsTimeline, undefined)
})

test('Phase F: T-49 derived point added with classification flag when gcsEvents supplied', () => {
  // GCS: 15 → 12 over 2 hours = slope -1.5 pts/hr → active_decline (≤ -1.3)
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, undefined, { gcsEvents: mockGCSEvents })
  const t49 = result.derivedTimeline?.find(d => d.id?.startsWith('dp-t49-'))
  assert.ok(t49 !== undefined, 'T-49 derived point must be present')
  assert.equal(t49?.calculationLabel, 'T-49 Neurologic Decline (GCS Slope)')
  assert.ok(t49?.flags?.some(f => f === 't49:active_decline'), `expected t49:active_decline, got ${JSON.stringify(t49?.flags)}`)
})

test('Phase F: T-49 derived point absent when no gcsEvents', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001')
  const t49 = result.derivedTimeline?.find(d => d.id?.startsWith('dp-t49-'))
  assert.equal(t49, undefined)
})

test('Phase F: backward compat — copdScale2 still works alongside gcsEvents', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, undefined, { copdScale2: true, gcsEvents: mockGCSEvents })
  const news2Points = result.derivedTimeline?.filter(d => d.calculationBasis === 'official_score')
  assert.ok(news2Points?.every(d => d.flags?.includes('news2:scale2')), 'news2:scale2 flag must still be present')
  assert.ok(result.gcsTimeline !== undefined, 'gcsTimeline must also be present')
})

test('Phase F: derivedTimeline length is 2N+2 when gcsEvents supplied (2N+1 base + T-49 point)', () => {
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, undefined, { gcsEvents: mockGCSEvents })
  assert.equal(result.derivedTimeline?.length, mockVisits.length * 2 + 2)
})

test('Phase F: T-49 observedAt matches last GCS event timestamp, not last visit timestamp', () => {
  // mockGCSEvents last event is at 10:00; mockVisits last visit is at 20:00 — must be GCS timestamp
  const result = legacyIBToCtV1(mockAnalysis, mockVisits, 'patient-test-001', undefined, undefined, { gcsEvents: mockGCSEvents })
  const t49 = result.derivedTimeline?.find(d => d.id?.startsWith('dp-t49-'))
  const lastGcsObservedAt = '2026-05-01T10:00:00.000Z'
  const lastVisitTimestamp = '2026-05-01T20:00:00.000Z'
  assert.equal(t49?.observedAt, lastGcsObservedAt, `T-49 observedAt must be GCS lane timestamp, not ${lastVisitTimestamp}`)
})
