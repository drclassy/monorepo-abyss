// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  applySymphonyHybridDecisioning,
  assessSymphonyInput,
  classifySymphonyTrafficLight,
  type SymphonyAssessmentInput,
  type SymphonyHybridDiagnosisCandidate,
} from '../index'

const baseCandidates: SymphonyHybridDiagnosisCandidate[] = [
  {
    icd10Code: 'J18.9',
    diagnosisName: 'Pneumonia',
    confidence: 0.7,
    keywordScore: 0.8,
    semanticScore: 0.7,
    ragVerified: true,
    keyReasons: ['Batuk produktif', 'Demam'],
    missingInformation: [],
    redFlags: [],
    recommendedActions: ['Evaluasi klinis dan terapi sesuai pedoman'],
    searchText: 'batuk demam sesak napas ronki pneumonia infeksi paru',
  },
  {
    icd10Code: 'A41.9',
    diagnosisName: 'Sepsis, unspecified organism',
    confidence: 0.45,
    keywordScore: 0.5,
    semanticScore: 0.5,
    ragVerified: true,
    keyReasons: ['Demam', 'Takikardia'],
    missingInformation: ['Apakah ada tekanan darah turun atau perubahan kesadaran?'],
    redFlags: ['Curiga sepsis dengan tanda bahaya sistemik'],
    recommendedActions: ['Rujuk segera bila tanda syok atau penurunan kesadaran muncul'],
    searchText: 'demam menggigil takikardia hipotensi sepsis syok infeksi sistemik',
  },
  {
    icd10Code: 'O14.9',
    diagnosisName: 'Pre-eclampsia, unspecified',
    confidence: 0.65,
    keywordScore: 0.7,
    semanticScore: 0.6,
    ragVerified: true,
    keyReasons: ['Hipertensi', 'Nyeri kepala'],
    missingInformation: [],
    redFlags: ['Kehamilan dengan hipertensi berat'],
    recommendedActions: ['Rujuk segera bila hamil dengan tekanan darah berat'],
    validationFlags: [{ type: 'pregnancy_implausible', message: 'Pasien tidak hamil' }],
  },
]

describe('SYMPHONY hybrid CDSS decisioning', () => {
  it('ranks grounded non-danger diagnoses as recommended with deterministic score evidence', () => {
    const result = applySymphonyHybridDecisioning({
      chiefComplaint: 'Batuk demam sejak tiga hari',
      candidates: baseCandidates,
      patientContext: {
        encounterId: 'enc-hybrid-1',
        patientRef: 'patient-hybrid-1',
        ageYears: 33,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
    })

    expect(result.counts.recommended).toBe(1)
    expect(result.suggestions[0]).toMatchObject({
      icd10Code: 'J18.9',
      decisionCategory: 'recommended',
      mustNotMiss: false,
    })
    expect(result.suggestions[0]?.confidence).toBeGreaterThanOrEqual(0.9)
    expect(result.suggestions[0]?.evidenceRefs).toContain('rank_source:hybrid')
  })

  it('surfaces danger diagnoses as must-not-miss unless context is impossible', () => {
    const result = applySymphonyHybridDecisioning({
      chiefComplaint: 'Demam tinggi menggigil pasien tampak lemah',
      candidates: baseCandidates,
      patientContext: {
        encounterId: 'enc-hybrid-2',
        patientRef: 'patient-hybrid-2',
        ageYears: 33,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
    })

    const sepsis = result.suggestions.find((suggestion) => suggestion.icd10Code === 'A41.9')
    const preeclampsia = result.suggestions.find((suggestion) => suggestion.icd10Code === 'O14.9')

    expect(result.counts.mustNotMiss).toBe(1)
    expect(sepsis?.decisionCategory).toBe('must_not_miss')
    expect(sepsis?.mustNotMiss).toBe(true)
    expect(preeclampsia?.decisionCategory).not.toBe('must_not_miss')
  })

  it('builds next-best questions from missing information and encounter gaps', () => {
    const result = applySymphonyHybridDecisioning({
      chiefComplaint: 'Demam menggigil',
      candidates: baseCandidates,
      patientContext: {
        encounterId: 'enc-hybrid-3',
        patientRef: 'patient-hybrid-3',
        ageYears: 24,
        sexAtBirth: 'female',
        pregnancyStatus: 'unknown',
      },
    })

    expect(result.requiresMoreData).toBe(true)
    expect(result.nextBestQuestions).toContain(
      'Apakah ada tekanan darah turun atau perubahan kesadaran?'
    )
    expect(result.nextBestQuestions).toContain(
      'Mohon lengkapi tanda vital utama untuk memperkuat differential diagnosis.'
    )
    expect(result.nextBestQuestions).toContain(
      'Pastikan status kehamilan dan tanggal haid terakhir bila keluhan mendukung konteks obstetri.'
    )
  })

  it('injects hybrid diagnosis suggestions into assessment output', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-hybrid-assess',
        requestedAt: '2026-04-19T12:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'enc-hybrid-4',
        patientRef: 'patient-hybrid-4',
        ageYears: 33,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
      vitals: [
        {
          observedAt: '2026-04-19T12:00:00.000Z',
          heartRate: 108,
          respiratoryRate: 22,
          temperatureC: 38.2,
          systolicBp: 112,
          diastolicBp: 70,
          spo2: 95,
        },
      ],
      chiefComplaint: 'Batuk demam sejak tiga hari',
      diagnosisCandidates: baseCandidates,
    }

    const result = assessSymphonyInput(input)

    expect(result.diagnosisSuggestions).toHaveLength(3)
    expect(result.diagnosisSuggestions[0]?.decisionCategory).toBe('recommended')
    expect(result.quality.auditHints).toContain('diagnosis_recommended_count:1')
    expect(result.quality.auditHints).toContain('diagnosis_must_not_miss_count:1')
  })

  it('classifies RED traffic-light when acute-on-chronic and severe DDI coexist', () => {
    const decisioning = applySymphonyHybridDecisioning({
      chiefComplaint: 'Sesak napas dan nyeri dada memberat',
      candidates: [
        {
          icd10Code: 'I10',
          diagnosisName: 'Hipertensi esensial',
          confidence: 0.62,
          keywordScore: 0.63,
          semanticScore: 0.61,
          ragVerified: true,
          keyReasons: ['Riwayat hipertensi lama'],
          redFlags: [],
          recommendedActions: ['Kontrol tekanan darah dan evaluasi ulang'],
        },
        {
          icd10Code: 'I50.9',
          diagnosisName: 'Heart failure, unspecified',
          confidence: 0.58,
          keywordScore: 0.6,
          semanticScore: 0.57,
          ragVerified: true,
          keyReasons: ['Sesak memberat'],
          redFlags: ['Perlu evaluasi gagal jantung akut'],
          recommendedActions: ['Rujuk segera bila ada dekompensasi'],
        },
      ],
      patientContext: {
        encounterId: 'enc-hybrid-5',
        patientRef: 'patient-hybrid-5',
        ageYears: 74,
        sexAtBirth: 'female',
        pregnancyStatus: 'not_applicable',
      },
    })

    const trafficLight = classifySymphonyTrafficLight({
      alerts: [
        {
          id: 'alert-critical',
          severity: 'high',
          title: 'Dekompensasi akut',
          reasoning: ['Sesak napas memberat'],
          source: 'pattern',
          acknowledged: false,
          triggeredAt: '2026-04-23T12:00:00.000Z',
        },
      ],
      diagnosisSuggestions: decisioning.suggestions,
      patientAge: 74,
      chronicDiseases: ['I10.0'],
      ddiResult: {
        status: 'configured',
        checkedPairs: ['warfarin__clarithromycin'],
        interactions: [
          {
            drugA: 'warfarin',
            drugB: 'clarithromycin',
            severity: 'major',
            evidenceSummary: 'Synthetic interaction for traffic-light gate verification.',
            referenceId: 'synthetic-ddi-1',
          },
        ],
        warnings: [],
        provenance: {
          domain: 'ddi',
          sourceName: 'synthetic-test',
          version: 'v1',
          licensedForRepoDistribution: false,
        },
      },
    })

    expect(trafficLight.level).toBe('RED')
    expect(trafficLight.overrideApplied).toBe(true)
    expect(
      trafficLight.gateResults.find((result) => result.rule === 'Rule 6: DDI Severity')?.triggered
    ).toBe(true)
    expect(
      trafficLight.gateResults.find((result) => result.rule === 'Rule 8: Acute-on-Chronic')
        ?.triggered
    ).toBe(true)
  })

  it('injects traffic-light output into assessment when diagnosis context is present', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-traffic-light-assess',
        requestedAt: '2026-04-23T12:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'enc-hybrid-6',
        patientRef: 'patient-hybrid-6',
        ageYears: 76,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
      vitals: [
        {
          observedAt: '2026-04-23T12:00:00.000Z',
          heartRate: 112,
          respiratoryRate: 24,
          temperatureC: 38.1,
          systolicBp: 108,
          diastolicBp: 68,
          spo2: 94,
        },
      ],
      chiefComplaint: 'Sesak napas memberat sejak pagi',
      diagnosisCandidates: baseCandidates,
      chronicDiseases: ['E11.9', 'I10.0'],
    }

    const result = assessSymphonyInput(input)

    expect(result.trafficLight?.level).toBe('RED')
    expect(result.alerts.some((alert) => alert.title.startsWith('Traffic Light'))).toBe(true)
    expect(result.quality.auditHints).toContain('traffic_light:RED')
  })
})
