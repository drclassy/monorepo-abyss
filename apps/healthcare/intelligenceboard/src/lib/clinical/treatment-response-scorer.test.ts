import assert from 'node:assert/strict'
import test from 'node:test'
import type { VisitRecord } from './trajectory-analyzer'
import type { TreatmentEvent } from './treatment-response-scorer'
import {
  aggregateResponsiveness,
  buildTreatmentTimeline,
  classifyTreatmentResponse,
} from './treatment-response-scorer'

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function visit(
  encounterId: string,
  timestamp: string,
  vitals: Partial<VisitRecord['vitals']>,
): VisitRecord {
  return {
    patient_id: 'p-001',
    encounter_id: encounterId,
    timestamp,
    vitals: {
      sbp: 120, dbp: 80, hr: 80, rr: 16, temp: 37.0, glucose: 100, spo2: 97,
      ...vitals,
    },
    keluhan_utama: 'test',
    source: 'scrape',
  }
}

function event(overrides: Partial<TreatmentEvent> = {}): TreatmentEvent {
  return {
    id: 'tx-001',
    occurredAt: '2026-05-01T12:00:00.000Z',
    category: 'medication',
    label: 'Salbutamol',
    ...overrides,
  }
}

// ─── classifyTreatmentResponse ────────────────────────────────────────────────

test('no pre-event visit → unknown', () => {
  const visits = [visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 75 })]
  assert.equal(classifyTreatmentResponse(event(), visits), 'unknown')
})

test('no post-event visit within 24h → unknown', () => {
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 110 }),
    visit('enc-late', '2026-05-02T14:00:00.000Z', { hr: 75 }),  // 26h after event
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'unknown')
})

test('no visits at all → unknown', () => {
  assert.equal(classifyTreatmentResponse(event(), []), 'unknown')
})

test('HR drops ≥7.9 bpm/hr → responsive (T-51)', () => {
  // Event at 12:00, pre-HR=110 at 10:00, post-HR=94 at 14:00
  // slope = (94 - 110) / 2h = -8.0 bpm/hr → ≤ -7.9 → responsive
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 110 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 94 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'responsive')
})

test('HR drops clearly below T-51 threshold → responsive', () => {
  // slope = (84 - 100) / 2h = -8.0 bpm/hr ≤ -7.9 → responsive
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 100 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 84 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'responsive')
})

test('HR rises ≥2.6 bpm/hr, no secondary worsening → non_responsive (T-52)', () => {
  // slope = (91 - 80) / 2 = 5.5 bpm/hr → ≥ 2.6, spo2/rr unchanged → non_responsive
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 80, spo2: 96, rr: 16 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 91, spo2: 96, rr: 16 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'non_responsive')
})

test('HR rises ≥2.6 bpm/hr + SpO2 drops ≥2pp → worsening', () => {
  // slope = 5.5 bpm/hr ≥ T52 AND spo2 drops 3 pp → worsening
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 80, spo2: 96, rr: 16 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 91, spo2: 93, rr: 16 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'worsening')
})

test('HR rises ≥2.6 bpm/hr + RR rises ≥4/min → worsening', () => {
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 80, spo2: 96, rr: 16 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 91, spo2: 96, rr: 21 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'worsening')
})

test('HR slope between −7.9 and +2.6 → partially_responsive', () => {
  // slope = (82 - 80) / 2 = 1.0 bpm/hr → between thresholds
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 80 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 82 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'partially_responsive')
})

test('HR improves but not to T-51 threshold → partially_responsive', () => {
  // slope = (74 - 80) / 2 = -3.0 bpm/hr → between -7.9 and 0 → partially_responsive
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 80 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 74 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'partially_responsive')
})

test('uses closest pre-event visit (last before event)', () => {
  // Two pre-event visits: first at 08:00 (hr=120), last at 11:00 (hr=100)
  // Post at 14:00 (hr=84) → slope from 11:00 = (84-100)/3 = -5.33 → partially_responsive
  // If from 08:00: (84-120)/6 = -6.0 → also partially_responsive
  // Use a case that distinguishes: pre1=hr=120, pre2=hr=90 → post=73 in 1h
  // From pre2: (73-90)/1 = -17 → responsive; from pre1 that would be different time delta
  const visits = [
    visit('enc-pre1', '2026-05-01T08:00:00.000Z', { hr: 60 }),  // very old, if used: (73-60)/6 = 2.17 → partial
    visit('enc-pre2', '2026-05-01T11:00:00.000Z', { hr: 90 }),  // most recent: (73-90)/1 = -17 → responsive
    visit('enc-post', '2026-05-01T13:00:00.000Z', { hr: 73 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'responsive')
})

test('uses first post-event visit within window', () => {
  // Two post-event visits: first at 13:00 (hr=90 → slope +5 → non_resp), second at 16:00 (hr=70 → slope -5 → partial)
  // Should use first → non_responsive
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 80, spo2: 97, rr: 16 }),
    visit('enc-post1', '2026-05-01T13:00:00.000Z', { hr: 90, spo2: 97, rr: 16 }),  // +1h: slope=(90-80)/1=+10 → non_resp
    visit('enc-post2', '2026-05-01T16:00:00.000Z', { hr: 70, spo2: 97, rr: 16 }),
  ]
  assert.equal(classifyTreatmentResponse(event(), visits), 'non_responsive')
})

// ─── aggregateResponsiveness ──────────────────────────────────────────────────

test('empty array → unknown', () => {
  assert.equal(aggregateResponsiveness([]), 'unknown')
})

test('all unknown → unknown', () => {
  assert.equal(aggregateResponsiveness(['unknown', 'unknown']), 'unknown')
})

test('worsening present → worsening (highest priority)', () => {
  assert.equal(aggregateResponsiveness(['responsive', 'worsening', 'non_responsive']), 'worsening')
})

test('non_responsive wins over partially_responsive and responsive', () => {
  assert.equal(aggregateResponsiveness(['responsive', 'partially_responsive', 'non_responsive']), 'non_responsive')
})

test('partially_responsive wins over responsive', () => {
  assert.equal(aggregateResponsiveness(['responsive', 'partially_responsive']), 'partially_responsive')
})

test('all responsive → responsive', () => {
  assert.equal(aggregateResponsiveness(['responsive', 'responsive']), 'responsive')
})

test('mixed unknown and responsive → responsive', () => {
  assert.equal(aggregateResponsiveness(['unknown', 'responsive', 'unknown']), 'responsive')
})

// ─── buildTreatmentTimeline ───────────────────────────────────────────────────

test('maps TreatmentEvent to ClinicalTrajectoryTreatmentPoint shape', () => {
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 110 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 94 }),
  ]
  const events: TreatmentEvent[] = [
    { id: 'tx-001', occurredAt: '2026-05-01T12:00:00.000Z', category: 'medication', label: 'Salbutamol', dose: '2.5mg', route: 'nebulization' },
  ]
  const timeline = buildTreatmentTimeline(events, visits)
  assert.equal(timeline.length, 1)
  assert.equal(timeline[0].id, 'tx-001')
  assert.equal(timeline[0].observedAt, '2026-05-01T12:00:00.000Z')
  assert.equal(timeline[0].source, 'manual')
  assert.equal(timeline[0].intervention, 'Salbutamol 2.5mg (nebulization)')
  assert.equal(timeline[0].response, 'responsive')  // slope = -8.0 bpm/hr
})

test('label without dose produces simple intervention string', () => {
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 80 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 82 }),
  ]
  const events: TreatmentEvent[] = [
    { id: 'tx-002', occurredAt: '2026-05-01T12:00:00.000Z', category: 'procedure', label: 'Repositioning' },
  ]
  const timeline = buildTreatmentTimeline(events, visits)
  assert.equal(timeline[0].intervention, 'Repositioning')
})

test('label with dose but no route omits parenthetical', () => {
  const visits = [
    visit('enc-pre', '2026-05-01T10:00:00.000Z', { hr: 80 }),
    visit('enc-post', '2026-05-01T14:00:00.000Z', { hr: 82 }),
  ]
  const events: TreatmentEvent[] = [
    { id: 'tx-003', occurredAt: '2026-05-01T12:00:00.000Z', category: 'medication', label: 'Furosemide', dose: '40mg' },
  ]
  const timeline = buildTreatmentTimeline(events, visits)
  assert.equal(timeline[0].intervention, 'Furosemide 40mg')
})

test('empty events array returns empty timeline', () => {
  const visits = [visit('enc-1', '2026-05-01T10:00:00.000Z', {})]
  assert.equal(buildTreatmentTimeline([], visits).length, 0)
})
