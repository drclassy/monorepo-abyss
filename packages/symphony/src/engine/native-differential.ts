// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  SymphonyClinicalFact,
  SymphonyDiagnosticHypothesis,
} from '../contracts'

import type { SymphonyDiagnosisPack } from './diagnosis-packs'
import type { SymphonySyndromeMatch } from './syndrome-classifier'

export interface SymphonyNativeDifferentialInput {
  facts: readonly SymphonyClinicalFact[]
  syndromes: readonly SymphonySyndromeMatch[]
  packs: readonly SymphonyDiagnosisPack[]
}

export interface SymphonyNativeDifferentialResult {
  hypotheses: SymphonyDiagnosticHypothesis[]
}

type HypothesisCategory = SymphonyDiagnosticHypothesis['category']

function hasFact(facts: readonly SymphonyClinicalFact[], key: string): boolean {
  return facts.some(item => item.key === key)
}

function clampConfidence(raw: number): number {
  if (raw < 0) return 0
  if (raw > 0.95) return 0.95
  return raw
}

function categorize(pack: SymphonyDiagnosisPack, confidence: number): HypothesisCategory {
  if (pack.mustNotMiss && confidence >= 0.45) return 'must_not_miss'
  if (confidence >= 0.58) return 'working'
  if (confidence >= 0.33) return 'review'
  return 'deferred'
}

export function buildSymphonyNativeDifferential(
  input: SymphonyNativeDifferentialInput,
): SymphonyNativeDifferentialResult {
  const matchedSyndromeIds = new Set(input.syndromes.map(item => item.id))

  const hypotheses = input.packs
    .filter(pack => matchedSyndromeIds.has(pack.syndromeFamily))
    .map(pack => {
      const supports = pack.supportKeys.filter(key => hasFact(input.facts, key))
      const weakens = pack.weakenKeys.filter(key => hasFact(input.facts, key))
      const missing = pack.supportKeys.filter(key => !hasFact(input.facts, key))

      const rawScore = 0.35 + supports.length * 0.16 - weakens.length * 0.08
      const confidence = clampConfidence(rawScore)
      const category = categorize(pack, confidence)

      return {
        id: `native-${pack.id}`,
        icd10Code: pack.icd10Code,
        diagnosisName: pack.diagnosisName,
        rank: 0,
        confidence,
        category,
        evidence: {
          supports,
          weakens,
          missing,
          nextBestQuestions: [...pack.nextBestQuestions],
        },
        evidenceRefs: [`pack:${pack.id}`, `syndrome:${pack.syndromeFamily}`],
      } satisfies SymphonyDiagnosticHypothesis
    })
    .sort((left, right) => right.confidence - left.confidence)
    .map((item, index) => ({ ...item, rank: index + 1 }))

  return { hypotheses }
}
