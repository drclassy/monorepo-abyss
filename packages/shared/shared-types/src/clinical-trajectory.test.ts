import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mockImprovingTrajectory,
  mockSparseDataTrajectory,
  mockWorseningRespiratoryTrajectory,
} from './clinical-trajectory'
import type { ClinicalTrajectoryV1 } from './clinical-trajectory'

test('ClinicalTrajectory fixtures expose the expected response states', () => {
  assert.equal(mockImprovingTrajectory.version, 'ct.v1')
  assert.equal(mockImprovingTrajectory.response.direction, 'improving')
  assert.equal(mockWorseningRespiratoryTrajectory.response.direction, 'worsening')
  assert.equal(mockSparseDataTrajectory.response.confidence, 'insufficient_data')
})

test('ClinicalTrajectory fixtures keep raw and derived timelines separate', () => {
  assert.ok(mockImprovingTrajectory.vitalsTimeline.length > 0)
  assert.ok((mockImprovingTrajectory.derivedTimeline?.length ?? 0) > 0)
  assert.equal(mockImprovingTrajectory.derivedTimeline?.[0]?.source, 'derived')
})

test('ClinicalTrajectory worsening fixture surfaces escalation context', () => {
  assert.equal(mockWorseningRespiratoryTrajectory.response.requiresEscalation, true)
  assert.equal(mockWorseningRespiratoryTrajectory.response.severityBand, 'critical')
  assert.equal(mockWorseningRespiratoryTrajectory.response.instabilityPattern, 'respiratory')
  assert.equal(mockWorseningRespiratoryTrajectory.response.momentum, 'rapid')
})

test('ClinicalTrajectory sparse fixture flags missingness without false confidence', () => {
  assert.equal(mockSparseDataTrajectory.response.direction, 'unknown')
  assert.equal(mockSparseDataTrajectory.response.severityBand, 'unknown')
  assert.equal(mockSparseDataTrajectory.quality?.sparseSamplingFlag, true)
  assert.ok((mockSparseDataTrajectory.quality?.missingFields?.length ?? 0) > 0)
  assert.notEqual(
    mockSparseDataTrajectory.response.requiresEscalation,
    true,
    'sparse-data fixture must not synthesise an escalation surface'
  )
})

test('ClinicalTrajectory fixtures are JSON serialisation-safe', () => {
  for (const fixture of [
    mockImprovingTrajectory,
    mockWorseningRespiratoryTrajectory,
    mockSparseDataTrajectory,
  ]) {
    const round: ClinicalTrajectoryV1 = JSON.parse(JSON.stringify(fixture))
    assert.equal(round.version, 'ct.v1')
    assert.equal(round.response.direction, fixture.response.direction)
    assert.equal(round.response.confidence, fixture.response.confidence)
    assert.deepEqual(round.response.evidenceRefs, fixture.response.evidenceRefs)
  }
})

test('ClinicalTrajectory contract excludes diagnostic and treatment-order surfaces', () => {
  for (const fixture of [
    mockImprovingTrajectory,
    mockWorseningRespiratoryTrajectory,
    mockSparseDataTrajectory,
  ]) {
    const summary = fixture.response.summary.toLowerCase()
    assert.ok(!summary.includes('diagnosis confirmed'), 'no autonomous diagnosis copy')
    assert.ok(!summary.includes('order '), 'no treatment-order copy')
  }
})
