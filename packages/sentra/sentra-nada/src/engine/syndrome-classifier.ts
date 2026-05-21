// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { SymphonyClinicalFact } from '../contracts'

export type SymphonySyndromeId =
  | 'acute_febrile_syndrome'
  | 'acute_respiratory_syndrome'
  | 'acute_cardiometabolic_syndrome'

export interface SymphonySyndromeMatch {
  id: SymphonySyndromeId
  confidence: number
  reasons: string[]
}

function findFact(
  facts: readonly SymphonyClinicalFact[],
  key: string
): SymphonyClinicalFact | undefined {
  return facts.find((item) => item.key === key)
}

function hasFact(
  facts: readonly SymphonyClinicalFact[],
  key: string,
  predicate?: (value: string | number | boolean) => boolean
): boolean {
  const found = findFact(facts, key)
  if (!found) return false
  return predicate ? predicate(found.value) : true
}

export function classifySymphonySyndromes(
  facts: readonly SymphonyClinicalFact[]
): SymphonySyndromeMatch[] {
  const matches: SymphonySyndromeMatch[] = []

  const fever = hasFact(facts, 'symptom_fever', (value) => value === true)
  const dyspnea = hasFact(facts, 'symptom_dyspnea', (value) => value === true)

  if (fever && dyspnea) {
    matches.push({
      id: 'acute_respiratory_syndrome',
      confidence: 0.76,
      reasons: ['Demam dengan gejala pernapasan akut.'],
    })
  }

  if (fever) {
    matches.push({
      id: 'acute_febrile_syndrome',
      confidence: 0.62,
      reasons: ['Demam aktif terdeteksi.'],
    })
  }

  if (hasFact(facts, 'htn_severity', (value) => value === 'stage2' || value === 'crisis')) {
    matches.push({
      id: 'acute_cardiometabolic_syndrome',
      confidence: 0.71,
      reasons: ['Hipertensi signifikan terdeteksi.'],
    })
  }

  return matches
}
