import assert from 'node:assert/strict'
import test from 'node:test'
import type { ClinicalTrajectoryVitalPoint } from '@the-abyss/shared-types'
import { computeNEWS2 } from './news2-score'

// Minimal vital builder — source is irrelevant for score computation
function vital(
  overrides: Partial<ClinicalTrajectoryVitalPoint>,
): ClinicalTrajectoryVitalPoint {
  return {
    id: 'vp-test',
    observedAt: '2026-05-01T00:00:00.000Z',
    source: 'manual',
    rr: 16,     // normal
    spo2: 97,   // normal
    sbp: 120,   // normal
    hr: 75,     // normal
    temp: 37.0, // normal
    consciousness: 'alert',
    ...overrides,
  }
}

test('healthy vitals → score 0', () => {
  assert.equal(computeNEWS2(vital({})), 0)
})

test('missing rr → undefined', () => {
  assert.equal(computeNEWS2(vital({ rr: null })), undefined)
})

test('missing spo2 → undefined', () => {
  assert.equal(computeNEWS2(vital({ spo2: null })), undefined)
})

test('missing sbp → undefined', () => {
  assert.equal(computeNEWS2(vital({ sbp: null })), undefined)
})

test('missing hr → undefined', () => {
  assert.equal(computeNEWS2(vital({ hr: null })), undefined)
})

test('missing temp → undefined', () => {
  assert.equal(computeNEWS2(vital({ temp: null })), undefined)
})

// ─── RR boundaries ───────────────────────────────────────────────────────────
test('RR ≤8 → 3', () => { assert.equal(computeNEWS2(vital({ rr: 8 })), 3) })
test('RR 9 → 1',  () => { assert.equal(computeNEWS2(vital({ rr: 9 })), 1) })
test('RR 11 → 1', () => { assert.equal(computeNEWS2(vital({ rr: 11 })), 1) })
test('RR 12 → 0', () => { assert.equal(computeNEWS2(vital({ rr: 12 })), 0) })
test('RR 20 → 0', () => { assert.equal(computeNEWS2(vital({ rr: 20 })), 0) })
test('RR 21 → 2', () => { assert.equal(computeNEWS2(vital({ rr: 21 })), 2) })
test('RR 24 → 2', () => { assert.equal(computeNEWS2(vital({ rr: 24 })), 2) })
test('RR 25 → 3', () => { assert.equal(computeNEWS2(vital({ rr: 25 })), 3) })

// ─── SpO2 boundaries (Scale 1) ───────────────────────────────────────────────
test('SpO2 91 → 3', () => { assert.equal(computeNEWS2(vital({ spo2: 91 })), 3) })
test('SpO2 92 → 2', () => { assert.equal(computeNEWS2(vital({ spo2: 92 })), 2) })
test('SpO2 93 → 2', () => { assert.equal(computeNEWS2(vital({ spo2: 93 })), 2) })
test('SpO2 94 → 1', () => { assert.equal(computeNEWS2(vital({ spo2: 94 })), 1) })
test('SpO2 95 → 1', () => { assert.equal(computeNEWS2(vital({ spo2: 95 })), 1) })
test('SpO2 96 → 0', () => { assert.equal(computeNEWS2(vital({ spo2: 96 })), 0) })

// ─── SBP boundaries ──────────────────────────────────────────────────────────
test('SBP 90 → 3',  () => { assert.equal(computeNEWS2(vital({ sbp: 90 })), 3) })
test('SBP 91 → 2',  () => { assert.equal(computeNEWS2(vital({ sbp: 91 })), 2) })
test('SBP 100 → 2', () => { assert.equal(computeNEWS2(vital({ sbp: 100 })), 2) })
test('SBP 101 → 1', () => { assert.equal(computeNEWS2(vital({ sbp: 101 })), 1) })
test('SBP 110 → 1', () => { assert.equal(computeNEWS2(vital({ sbp: 110 })), 1) })
test('SBP 111 → 0', () => { assert.equal(computeNEWS2(vital({ sbp: 111 })), 0) })
test('SBP 219 → 0', () => { assert.equal(computeNEWS2(vital({ sbp: 219 })), 0) })
test('SBP 220 → 3', () => { assert.equal(computeNEWS2(vital({ sbp: 220 })), 3) })

// ─── HR boundaries ───────────────────────────────────────────────────────────
test('HR 40 → 3',  () => { assert.equal(computeNEWS2(vital({ hr: 40 })), 3) })
test('HR 41 → 1',  () => { assert.equal(computeNEWS2(vital({ hr: 41 })), 1) })
test('HR 50 → 1',  () => { assert.equal(computeNEWS2(vital({ hr: 50 })), 1) })
test('HR 51 → 0',  () => { assert.equal(computeNEWS2(vital({ hr: 51 })), 0) })
test('HR 90 → 0',  () => { assert.equal(computeNEWS2(vital({ hr: 90 })), 0) })
test('HR 91 → 1',  () => { assert.equal(computeNEWS2(vital({ hr: 91 })), 1) })
test('HR 110 → 1', () => { assert.equal(computeNEWS2(vital({ hr: 110 })), 1) })
test('HR 111 → 2', () => { assert.equal(computeNEWS2(vital({ hr: 111 })), 2) })
test('HR 130 → 2', () => { assert.equal(computeNEWS2(vital({ hr: 130 })), 2) })
test('HR 131 → 3', () => { assert.equal(computeNEWS2(vital({ hr: 131 })), 3) })

// ─── Temperature boundaries ──────────────────────────────────────────────────
test('Temp 35.0 → 3', () => { assert.equal(computeNEWS2(vital({ temp: 35.0 })), 3) })
test('Temp 35.1 → 1', () => { assert.equal(computeNEWS2(vital({ temp: 35.1 })), 1) })
test('Temp 36.0 → 1', () => { assert.equal(computeNEWS2(vital({ temp: 36.0 })), 1) })
test('Temp 36.1 → 0', () => { assert.equal(computeNEWS2(vital({ temp: 36.1 })), 0) })
test('Temp 38.0 → 0', () => { assert.equal(computeNEWS2(vital({ temp: 38.0 })), 0) })
test('Temp 38.1 → 1', () => { assert.equal(computeNEWS2(vital({ temp: 38.1 })), 1) })
test('Temp 39.0 → 1', () => { assert.equal(computeNEWS2(vital({ temp: 39.0 })), 1) })
test('Temp 39.1 → 2', () => { assert.equal(computeNEWS2(vital({ temp: 39.1 })), 2) })

// ─── Consciousness ───────────────────────────────────────────────────────────
test('consciousness alert → 0',       () => { assert.equal(computeNEWS2(vital({ consciousness: 'alert' })), 0) })
test('consciousness unknown → 0',     () => { assert.equal(computeNEWS2(vital({ consciousness: 'unknown' })), 0) })
test('consciousness undefined → 0',   () => { assert.equal(computeNEWS2(vital({ consciousness: undefined })), 0) })
test('consciousness voice → 3',       () => { assert.equal(computeNEWS2(vital({ consciousness: 'voice' })), 3) })
test('consciousness pain → 3',        () => { assert.equal(computeNEWS2(vital({ consciousness: 'pain' })), 3) })
test('consciousness unresponsive → 3',() => { assert.equal(computeNEWS2(vital({ consciousness: 'unresponsive' })), 3) })

// ─── Real-world scenarios ────────────────────────────────────────────────────
test('critical respiratory failure: spo2=86, rr=32, sbp=160, hr=118, temp=38.3, voice → score ≥9', () => {
  const score = computeNEWS2(vital({ spo2: 86, rr: 32, sbp: 160, hr: 118, temp: 38.3, consciousness: 'voice' }))
  assert.ok(score !== undefined && score >= 9, `expected ≥9, got ${score}`)
  // rr=32→3, spo2=86→3, sbp=160→0, hr=118→2, temp=38.3→1, voice→3 = 12
  assert.equal(score, 12)
})

test('mild deterioration: spo2=94, rr=22, sbp=105, hr=100, temp=37.8, alert → score 5', () => {
  const score = computeNEWS2(vital({ spo2: 94, rr: 22, sbp: 105, hr: 100, temp: 37.8, consciousness: 'alert' }))
  // rr=22→2, spo2=94→1, sbp=105→1, hr=100→1, temp=37.8→0, alert→0 = 5
  assert.equal(score, 5)
})

// ─── SpO2 Scale 2 (COPD/hypercapnic) ────────────────────────────────────────
// Thresholds: ≤83→3, 84-85→2, 86-87→1, ≥88→0 (target range + on air)

test('Scale 2: spo2 84 scores lower than Scale 1 (84-85 → 2, not 3)', () => {
  const s1 = computeNEWS2(vital({ spo2: 84 }))
  const s2 = computeNEWS2(vital({ spo2: 84 }), { spo2Scale: 2 })
  assert.ok((s2 as number) < (s1 as number), `expected Scale 2 < Scale 1, got s1=${s1} s2=${s2}`)
})

test('Scale 2: spo2 86 scores lower than Scale 1 (86-87 → 1, not 3)', () => {
  const s1 = computeNEWS2(vital({ spo2: 86 }))
  const s2 = computeNEWS2(vital({ spo2: 86 }), { spo2Scale: 2 })
  assert.ok((s2 as number) < (s1 as number))
})

test('Scale 2: spo2 88 in COPD target range → SpO2 score 0 (Scale 1 scores 3)', () => {
  const s1 = computeNEWS2(vital({ spo2: 88 }))
  const s2 = computeNEWS2(vital({ spo2: 88 }), { spo2Scale: 2 })
  assert.ok((s2 as number) < (s1 as number))
})

test('Scale 2: spo2 92 at target ceiling → SpO2 score 0 (Scale 1 scores 2)', () => {
  const s1 = computeNEWS2(vital({ spo2: 92 }))
  const s2 = computeNEWS2(vital({ spo2: 92 }), { spo2Scale: 2 })
  assert.ok((s2 as number) < (s1 as number))
})

test('Scale 2: spo2 93 on air → SpO2 score 0 (acceptable; Scale 1 scores 2)', () => {
  const s1 = computeNEWS2(vital({ spo2: 93 }))
  const s2 = computeNEWS2(vital({ spo2: 93 }), { spo2Scale: 2 })
  assert.ok((s2 as number) < (s1 as number))
})

test('Scale 2: spo2 97 fully normal → same score as Scale 1 (both 0)', () => {
  const s1 = computeNEWS2(vital({ spo2: 97 }))
  const s2 = computeNEWS2(vital({ spo2: 97 }), { spo2Scale: 2 })
  assert.equal(s1, s2)
})

test('backward compat: no options equals explicit spo2Scale: 1', () => {
  const implicit = computeNEWS2(vital({ spo2: 92 }))
  const explicit  = computeNEWS2(vital({ spo2: 92 }), { spo2Scale: 1 })
  assert.equal(implicit, explicit)
})

test('Scale 2 with missing spo2 still returns undefined', () => {
  assert.equal(computeNEWS2(vital({ spo2: null }), { spo2Scale: 2 }), undefined)
})
