import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyNeurologicDecline, buildGCSTimeline } from './gcs-scorer'
import type { GCSEvent } from './gcs-scorer'

function makeEvent(
  id: string,
  hoursOffset: number,
  gcsTotal: number,
  extra?: Partial<GCSEvent>,
): GCSEvent {
  const base = new Date('2026-05-01T00:00:00.000Z')
  base.setTime(base.getTime() + hoursOffset * 3_600_000)
  return {
    id,
    observedAt: base.toISOString(),
    source: 'manual',
    gcsTotal,
    ...extra,
  }
}

// ─── classifyNeurologicDecline ────────────────────────────────────────────────

test('insufficient_data: 0 events', () => {
  const r = classifyNeurologicDecline([])
  assert.equal(r.classification, 'insufficient_data')
  assert.equal(r.slopePerHour, undefined)
})

test('insufficient_data: 1 event', () => {
  const r = classifyNeurologicDecline([makeEvent('e1', 0, 14)])
  assert.equal(r.classification, 'insufficient_data')
})

test('insufficient_data: 2 events same timestamp', () => {
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0, 15),
    makeEvent('e2', 0, 13),
  ])
  assert.equal(r.classification, 'insufficient_data')
})

test('active_decline: slope exactly -1.3 pts/hr (boundary)', () => {
  // GCS 15 → 2 over 10 hours: (2-15)/10 = -1.3 pts/hr — exactly on threshold → active_decline
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0,  15),
    makeEvent('e2', 10, 2),
  ])
  assert.equal(r.classification, 'active_decline')
  assert.ok(r.slopePerHour !== undefined && Math.abs(r.slopePerHour - (-1.3)) < 0.0001)
})

test('gradual_decline: slope -1.2 pts/hr (just outside boundary)', () => {
  // GCS 15 → 3 over 10 hours: (3-15)/10 = -1.2 pts/hr — just above threshold → gradual_decline
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0,  15),
    makeEvent('e2', 10, 3),
  ])
  assert.equal(r.classification, 'gradual_decline')
})

test('active_decline: slope -2 pts/hr (severe)', () => {
  // GCS drops from 14 to 12 over 1 hour = -2 pts/hr
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0, 14),
    makeEvent('e2', 1, 12),
  ])
  assert.equal(r.classification, 'active_decline')
  assert.ok(r.slopePerHour !== undefined && Math.abs(r.slopePerHour - (-2)) < 0.001)
})

test('active_decline: slope -1.5 pts/hr over 2 hours', () => {
  // GCS 15 → 12 over 2 hours = slope -1.5
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0, 15),
    makeEvent('e2', 2, 12),
  ])
  assert.equal(r.classification, 'active_decline')
  assert.ok(r.slopePerHour !== undefined && Math.abs(r.slopePerHour - (-1.5)) < 0.001)
})

test('gradual_decline: slope -0.5 pts/hr', () => {
  // GCS 14 → 13 over 2 hours = -0.5 pts/hr
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0, 14),
    makeEvent('e2', 2, 13),
  ])
  assert.equal(r.classification, 'gradual_decline')
  assert.ok(r.slopePerHour !== undefined && r.slopePerHour < 0)
})

test('stable_or_improving: slope 0 (same GCS)', () => {
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0, 13),
    makeEvent('e2', 3, 13),
  ])
  assert.equal(r.classification, 'stable_or_improving')
  assert.ok(r.slopePerHour !== undefined && r.slopePerHour === 0)
})

test('stable_or_improving: GCS improving (slope +1 pts/hr)', () => {
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0, 12),
    makeEvent('e2', 2, 14),
  ])
  assert.equal(r.classification, 'stable_or_improving')
  assert.ok(r.slopePerHour !== undefined && r.slopePerHour > 0)
})

test('uses first-to-last regardless of input order', () => {
  // Unsorted input: t=2 first, t=0 last
  const r = classifyNeurologicDecline([
    makeEvent('e2', 2, 12),
    makeEvent('e1', 0, 14),
  ])
  // slope = (12 - 14) / 2 = -1.0 → gradual_decline
  assert.equal(r.classification, 'gradual_decline')
})

// ─── buildGCSTimeline ─────────────────────────────────────────────────────────

test('buildGCSTimeline: empty input → empty array', () => {
  assert.deepEqual(buildGCSTimeline([]), [])
})

test('buildGCSTimeline: single event → correct shape', () => {
  const result = buildGCSTimeline([makeEvent('e1', 0, 15)])
  assert.equal(result.length, 1)
  assert.equal(result[0].gcsTotal, 15)
  assert.equal(result[0].interpretation, 'normal')
  assert.equal(result[0].id, 'e1')
})

test('buildGCSTimeline: sorts by observedAt ascending', () => {
  const result = buildGCSTimeline([
    makeEvent('e3', 4, 11),
    makeEvent('e1', 0, 15),
    makeEvent('e2', 2, 13),
  ])
  assert.equal(result[0].id, 'e1')
  assert.equal(result[1].id, 'e2')
  assert.equal(result[2].id, 'e3')
})

// ─── interpretation thresholds ───────────────────────────────────────────────

test('interpretation: GCS 15 → normal', () => {
  const [p] = buildGCSTimeline([makeEvent('e1', 0, 15)])
  assert.equal(p.interpretation, 'normal')
})

test('interpretation: GCS 13 → normal', () => {
  const [p] = buildGCSTimeline([makeEvent('e1', 0, 13)])
  assert.equal(p.interpretation, 'normal')
})

test('interpretation: GCS 12 → mild_impairment', () => {
  const [p] = buildGCSTimeline([makeEvent('e1', 0, 12)])
  assert.equal(p.interpretation, 'mild_impairment')
})

test('interpretation: GCS 9 → mild_impairment', () => {
  const [p] = buildGCSTimeline([makeEvent('e1', 0, 9)])
  assert.equal(p.interpretation, 'mild_impairment')
})

test('interpretation: GCS 8 → moderate_impairment', () => {
  const [p] = buildGCSTimeline([makeEvent('e1', 0, 8)])
  assert.equal(p.interpretation, 'moderate_impairment')
})

test('interpretation: GCS 6 → moderate_impairment', () => {
  const [p] = buildGCSTimeline([makeEvent('e1', 0, 6)])
  assert.equal(p.interpretation, 'moderate_impairment')
})

test('interpretation: GCS 5 → severe_impairment', () => {
  const [p] = buildGCSTimeline([makeEvent('e1', 0, 5)])
  assert.equal(p.interpretation, 'severe_impairment')
})

test('interpretation: GCS 3 → severe_impairment', () => {
  const [p] = buildGCSTimeline([makeEvent('e1', 0, 3)])
  assert.equal(p.interpretation, 'severe_impairment')
})

test('buildGCSTimeline: preserves sub-scores and source', () => {
  const result = buildGCSTimeline([
    makeEvent('e1', 0, 10, { eyeScore: 3, verbalScore: 3, motorScore: 4, source: 'imported' }),
  ])
  assert.equal(result[0].eyeScore, 3)
  assert.equal(result[0].verbalScore, 3)
  assert.equal(result[0].motorScore, 4)
  assert.equal(result[0].source, 'imported')
})

// ─── 3+ event series — first-to-last endpoint behavior documented ─────────────
// This scorer is a TREND SEAM, not a regression engine.
// Mid-series fluctuations are NOT captured — only first-to-last slope is scored.

test('3 events: mid-crash ignored — first-to-last slope determines classification', () => {
  // GCS: 15 (t=0) → 10 (t=1, mid-crash) → 14 (t=4)
  // Endpoint slope: (14-15)/4 = -0.25 → gradual_decline
  // A regression over all 3 points would capture the crash and produce a steeper slope,
  // but this seam intentionally uses endpoint arithmetic only.
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0, 15),
    makeEvent('e2', 1, 10),
    makeEvent('e3', 4, 14),
  ])
  assert.equal(r.classification, 'gradual_decline')
  assert.ok(r.slopePerHour !== undefined && Math.abs(r.slopePerHour - (-0.25)) < 0.0001)
})

test('3 events: monotone decline — endpoint slope matches active_decline', () => {
  // GCS: 15 (t=0) → 12 (t=1) → 9 (t=2)
  // Endpoint slope: (9-15)/2 = -3.0 → active_decline
  const r = classifyNeurologicDecline([
    makeEvent('e1', 0, 15),
    makeEvent('e2', 1, 12),
    makeEvent('e3', 2,  9),
  ])
  assert.equal(r.classification, 'active_decline')
  assert.ok(r.slopePerHour !== undefined && Math.abs(r.slopePerHour - (-3.0)) < 0.0001)
})

test('4 events unsorted input: classification uses chronological first and last', () => {
  // Input in arbitrary order; first-to-last after sorting: GCS 14 (t=0) → GCS 8 (t=4)
  // Endpoint slope: (8-14)/4 = -1.5 → active_decline
  const r = classifyNeurologicDecline([
    makeEvent('e3', 3, 11),
    makeEvent('e1', 0, 14),
    makeEvent('e4', 4,  8),
    makeEvent('e2', 1, 13),
  ])
  assert.equal(r.classification, 'active_decline')
  assert.ok(r.slopePerHour !== undefined && Math.abs(r.slopePerHour - (-1.5)) < 0.0001)
})
