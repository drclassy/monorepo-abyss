import assert from 'node:assert/strict'
import test from 'node:test'

import type { LabEvent } from './lab-event-scorer'
import {
  buildLabsTimeline,
  classifyInfectiousSurge,
} from './lab-event-scorer'

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function crp(id: string, timestamp: string, value: number): LabEvent {
  return {
    id,
    observedAt: timestamp,
    code: 'CRP',
    label: 'C-Reactive Protein',
    value,
    unit: 'mg/L',
    source: 'manual',
  }
}

// ─── classifyInfectiousSurge ──────────────────────────────────────────────────

test('no lab events → insufficient_data', () => {
  assert.equal(classifyInfectiousSurge([]), 'insufficient_data')
})

test('only 1 CRP observation → insufficient_data', () => {
  assert.equal(
    classifyInfectiousSurge([crp('l1', '2026-05-01T08:00:00.000Z', 45)]),
    'insufficient_data',
  )
})

test('no CRP events (other codes only) → insufficient_data', () => {
  const wbc: LabEvent = {
    id: 'l1', observedAt: '2026-05-01T08:00:00.000Z',
    code: 'WBC', label: 'White Blood Cell', value: 12, unit: 'x10^9/L',
  }
  assert.equal(classifyInfectiousSurge([wbc]), 'insufficient_data')
})

test('two CRP same timestamp → insufficient_data (zero time spread)', () => {
  const ts = '2026-05-01T08:00:00.000Z'
  assert.equal(
    classifyInfectiousSurge([crp('l1', ts, 45), crp('l2', ts, 90)]),
    'insufficient_data',
  )
})

test('CRP slope ≥ 37 mg/L/hr → active_surge (T-48)', () => {
  // CRP_0=45 at 08:00, CRP_1=82 at 09:00 → delta=37, hours=1 → slope=37 ≥ 37
  assert.equal(
    classifyInfectiousSurge([
      crp('l1', '2026-05-01T08:00:00.000Z', 45),
      crp('l2', '2026-05-01T09:00:00.000Z', 82),
    ]),
    'active_surge',
  )
})

test('CRP slope clearly above 37 → active_surge', () => {
  // CRP_0=45, CRP_1=120 in 1h → slope=75 ≥ 37
  assert.equal(
    classifyInfectiousSurge([
      crp('l1', '2026-05-01T08:00:00.000Z', 45),
      crp('l2', '2026-05-01T09:00:00.000Z', 120),
    ]),
    'active_surge',
  )
})

test('CRP slope > 0 but < 37 → rising_crp', () => {
  // CRP_0=45, CRP_1=60 in 1h → slope=15 → rising_crp
  assert.equal(
    classifyInfectiousSurge([
      crp('l1', '2026-05-01T08:00:00.000Z', 45),
      crp('l2', '2026-05-01T09:00:00.000Z', 60),
    ]),
    'rising_crp',
  )
})

test('CRP slope exactly 0 (flat) → stable_or_declining', () => {
  assert.equal(
    classifyInfectiousSurge([
      crp('l1', '2026-05-01T08:00:00.000Z', 50),
      crp('l2', '2026-05-01T10:00:00.000Z', 50),
    ]),
    'stable_or_declining',
  )
})

test('CRP declining → stable_or_declining', () => {
  // CRP falls from 80 to 50 → slope negative
  assert.equal(
    classifyInfectiousSurge([
      crp('l1', '2026-05-01T08:00:00.000Z', 80),
      crp('l2', '2026-05-01T10:00:00.000Z', 50),
    ]),
    'stable_or_declining',
  )
})

test('uses earliest and latest CRP when 3+ events present', () => {
  // earliest=08:00 CRP=45, middle=09:00 CRP=70, latest=10:00 CRP=119
  // slope from 08:00 to 10:00: (119-45)/2 = 37 → active_surge
  assert.equal(
    classifyInfectiousSurge([
      crp('l1', '2026-05-01T08:00:00.000Z', 45),
      crp('l2', '2026-05-01T09:00:00.000Z', 70),
      crp('l3', '2026-05-01T10:00:00.000Z', 119),
    ]),
    'active_surge',
  )
})

test('CRP code matching is case-insensitive', () => {
  const events: LabEvent[] = [
    { id: 'l1', observedAt: '2026-05-01T08:00:00.000Z', code: 'crp', label: 'CRP', value: 45, unit: 'mg/L' },
    { id: 'l2', observedAt: '2026-05-01T09:00:00.000Z', code: 'Crp', label: 'CRP', value: 82, unit: 'mg/L' },
  ]
  assert.equal(classifyInfectiousSurge(events), 'active_surge')
})

test('non-CRP events are ignored for classification, CRP events still classify', () => {
  const events: LabEvent[] = [
    { id: 'w1', observedAt: '2026-05-01T07:00:00.000Z', code: 'WBC', label: 'WBC', value: 15, unit: 'x10^9/L' },
    crp('l1', '2026-05-01T08:00:00.000Z', 45),
    crp('l2', '2026-05-01T09:00:00.000Z', 60),
  ]
  assert.equal(classifyInfectiousSurge(events), 'rising_crp')
})

// ─── buildLabsTimeline ────────────────────────────────────────────────────────

test('empty events → empty timeline', () => {
  assert.equal(buildLabsTimeline([]).length, 0)
})

test('maps LabEvent to ClinicalTrajectoryLabPoint shape', () => {
  const events = [crp('l1', '2026-05-01T08:00:00.000Z', 45)]
  const timeline = buildLabsTimeline(events)
  assert.equal(timeline.length, 1)
  assert.equal(timeline[0].id, 'l1')
  assert.equal(timeline[0].observedAt, '2026-05-01T08:00:00.000Z')
  assert.equal(timeline[0].name, 'C-Reactive Protein')
  assert.equal(timeline[0].source, 'manual')
  assert.equal(timeline[0].unit, 'mg/L')
})

test('value is converted to string in CT v1 output', () => {
  const timeline = buildLabsTimeline([crp('l1', '2026-05-01T08:00:00.000Z', 45)])
  assert.equal(typeof timeline[0].value, 'string')
  assert.equal(timeline[0].value, '45')
})

test('CRP ≥ 200 → interpretation critical', () => {
  const timeline = buildLabsTimeline([crp('l1', '2026-05-01T08:00:00.000Z', 200)])
  assert.equal(timeline[0].interpretation, 'critical')
})

test('CRP ≥ 10 and < 200 → interpretation high', () => {
  const timeline = buildLabsTimeline([crp('l1', '2026-05-01T08:00:00.000Z', 45)])
  assert.equal(timeline[0].interpretation, 'high')
})

test('CRP ≥ 0 and < 10 → interpretation normal', () => {
  const timeline = buildLabsTimeline([crp('l1', '2026-05-01T08:00:00.000Z', 5)])
  assert.equal(timeline[0].interpretation, 'normal')
})

test('non-CRP events get interpretation unknown', () => {
  const wbc: LabEvent = {
    id: 'w1', observedAt: '2026-05-01T08:00:00.000Z',
    code: 'WBC', label: 'White Blood Cell', value: 15, unit: 'x10^9/L',
  }
  const timeline = buildLabsTimeline([wbc])
  assert.equal(timeline[0].interpretation, 'unknown')
})

test('output is sorted by timestamp ascending', () => {
  const events = [
    crp('l3', '2026-05-01T12:00:00.000Z', 80),
    crp('l1', '2026-05-01T08:00:00.000Z', 45),
    crp('l2', '2026-05-01T10:00:00.000Z', 60),
  ]
  const timeline = buildLabsTimeline(events)
  assert.equal(timeline[0].id, 'l1')
  assert.equal(timeline[1].id, 'l2')
  assert.equal(timeline[2].id, 'l3')
})

test('source defaults to manual when absent on LabEvent', () => {
  const e: LabEvent = {
    id: 'l1', observedAt: '2026-05-01T08:00:00.000Z',
    code: 'CRP', label: 'CRP', value: 45, unit: 'mg/L',
    // source intentionally omitted
  }
  const timeline = buildLabsTimeline([e])
  assert.equal(timeline[0].source, 'manual')
})

test('imported source is preserved', () => {
  const e: LabEvent = {
    id: 'l1', observedAt: '2026-05-01T08:00:00.000Z',
    code: 'CRP', label: 'CRP', value: 45, unit: 'mg/L',
    source: 'imported',
  }
  const timeline = buildLabsTimeline([e])
  assert.equal(timeline[0].source, 'imported')
})
