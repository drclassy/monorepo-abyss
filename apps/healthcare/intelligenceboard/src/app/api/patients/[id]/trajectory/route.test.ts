import assert from 'node:assert/strict'
import test from 'node:test'

import type { TrajectoryRouteDeps } from './route'

import type { TrajectoryAnalysis } from '@/lib/clinical/trajectory-analyzer'
import type { VitalHistoryEntry } from '@/lib/vitals/vital-record-service'

async function loadTrajectoryRouteModule() {
  process.env.DATABASE_URL ||=
    'postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder?schema=public'
  process.env.CREW_ACCESS_AUTOMATION_TOKEN = 'trajectory-test-token'
  return await import('./route')
}

function makeHistoryEntry(
  patientIdentifier: string,
  encounterId: string,
  recordedAt: string,
  vitals: {
    sbp: number
    dbp: number
    hr: number
    rr: number
    temp: number
    spo2: number
    glucose: {
      value: number
      type: 'GDS'
    }
  }
): VitalHistoryEntry {
  return {
    id: encounterId,
    patientIdentifier,
    encounterId,
    vitals: {
      ...vitals,
      avpu: 'A',
      supplementalO2: false,
      isPregnant: false,
      hasCOPD: false,
    },
    news2Score: 3,
    news2Risk: 'LOW',
    avpu: 'A',
    flags: [],
    source: 'ASSIST_TRIAGE',
    recordedAt: new Date(recordedAt),
    recordedByUserId: null,
  }
}

test('trajectory route exposes injectable factory while preserving GET export', async () => {
  const routeModule = await loadTrajectoryRouteModule()

  assert.equal(typeof routeModule.createTrajectoryRouteHandler, 'function')
  assert.equal(typeof routeModule.GET, 'function')
  assert.equal(routeModule.runtime, 'nodejs')
})

test('trajectory route success response preserves legacy fields and adds clinicalTrajectory', async () => {
  const routeModule = await loadTrajectoryRouteModule()
  const { NextRequest } = await import('next/server')

  const patientIdentifier = 'a'.repeat(64)
  const stubClinicalTrajectory = {
    schemaVersion: 'clinical-trajectory-v1',
  } as unknown as ReturnType<TrajectoryRouteDeps['legacyIBToCtV1']>
  const analysis = {
    summary: 'Trajectory remains stable',
    visitCount: 3,
  } as TrajectoryAnalysis
  const entries = [
    makeHistoryEntry(patientIdentifier, 'enc-1', '2026-05-29T00:00:00.000Z', {
      sbp: 120,
      dbp: 80,
      hr: 82,
      rr: 18,
      temp: 36.8,
      spo2: 98,
      glucose: { value: 102, type: 'GDS' },
    }),
    makeHistoryEntry(patientIdentifier, 'enc-2', '2026-05-29T06:00:00.000Z', {
      sbp: 118,
      dbp: 78,
      hr: 84,
      rr: 19,
      temp: 36.9,
      spo2: 97,
      glucose: { value: 105, type: 'GDS' },
    }),
    makeHistoryEntry(patientIdentifier, 'enc-3', '2026-05-29T12:00:00.000Z', {
      sbp: 122,
      dbp: 79,
      hr: 80,
      rr: 18,
      temp: 37.0,
      spo2: 98,
      glucose: { value: 101, type: 'GDS' },
    }),
  ]

  const deps: TrajectoryRouteDeps = {
    getPatientVitalHistory: async () => ({
      success: true,
      data: entries,
    }),
    analyzeTrajectory: () => analysis,
    computeMomentum: () =>
      ({
        score: 0.42,
        level: 'DRIFTING',
      }) as ReturnType<TrajectoryRouteDeps['computeMomentum']>,
    legacyIBToCtV1: () => stubClinicalTrajectory,
  }

  const handler = routeModule.createTrajectoryRouteHandler(deps)
  const response = await handler(
    new NextRequest(`http://localhost/api/patients/${patientIdentifier}/trajectory?visits=3`, {
      headers: {
        'x-crew-access-token': 'trajectory-test-token',
      },
    }),
    {
      params: Promise.resolve({ id: patientIdentifier }),
    }
  )
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.success, true)
  assert.ok('data' in body)
  assert.ok('visit_history' in body)
  assert.ok('momentum_history' in body)
  assert.ok('meta' in body)
  assert.ok('clinicalTrajectory' in body)
  assert.ok(body.clinicalTrajectory === null || typeof body.clinicalTrajectory === 'object')
  assert.deepEqual(body.data, analysis)
  assert.equal(body.visit_history.length, 3)
  assert.equal(body.momentum_history.length, 2)
  assert.deepEqual(body.clinicalTrajectory, stubClinicalTrajectory)
  assert.equal(body.meta.visitCount, 3)
  assert.equal(body.meta.patientIdentifier, 'aaaaaaaa…')
  assert.equal(typeof body.meta.analyzedAt, 'string')
})
