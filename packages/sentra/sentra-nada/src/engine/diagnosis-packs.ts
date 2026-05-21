// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { SymphonySyndromeId } from './syndrome-classifier'

export interface SymphonyDiagnosisPack {
  id: 'pack-pneumonia' | 'pack-sepsis' | 'pack-htn-crisis'
  icd10Code: string
  diagnosisName: string
  syndromeFamily: SymphonySyndromeId
  supportKeys: readonly string[]
  weakenKeys: readonly string[]
  mustNotMiss: boolean
  nextBestQuestions: readonly string[]
}

const DIAGNOSIS_PACKS: readonly SymphonyDiagnosisPack[] = [
  {
    id: 'pack-pneumonia',
    icd10Code: 'J18.9',
    diagnosisName: 'Pneumonia, unspecified organism',
    syndromeFamily: 'acute_respiratory_syndrome',
    supportKeys: ['symptom_fever', 'symptom_dyspnea', 'news2_risk'],
    weakenKeys: [],
    mustNotMiss: false,
    nextBestQuestions: ['Apakah ada batuk produktif atau ronki?'],
  },
  {
    id: 'pack-sepsis',
    icd10Code: 'A41.9',
    diagnosisName: 'Sepsis, unspecified organism',
    syndromeFamily: 'acute_febrile_syndrome',
    supportKeys: ['symptom_fever', 'screening_gate_count', 'trajectory_direction'],
    weakenKeys: [],
    mustNotMiss: true,
    nextBestQuestions: [
      'Apakah ada sumber infeksi yang jelas atau penurunan perfusi?',
    ],
  },
  {
    id: 'pack-htn-crisis',
    icd10Code: 'I10',
    diagnosisName: 'Hypertensive crisis context',
    syndromeFamily: 'acute_cardiometabolic_syndrome',
    supportKeys: ['htn_severity', 'trajectory_direction'],
    weakenKeys: [],
    mustNotMiss: true,
    nextBestQuestions: [
      'Apakah ada nyeri dada, defisit neurologis, atau gangguan penglihatan?',
    ],
  },
] as const

export function getSymphonyDiagnosisPacks(): readonly SymphonyDiagnosisPack[] {
  return DIAGNOSIS_PACKS
}
