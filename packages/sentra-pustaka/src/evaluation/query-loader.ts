// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import fs from 'fs'
import type { EvalQuery } from './types.js'

/**
 * Loads and validates the retrieval query set from a JSON file.
 * Returns validated queries and any load errors.
 */
export function loadEvalQueries(queriesPath: string): {
  queries: EvalQuery[]
  error?: string
} {
  if (!fs.existsSync(queriesPath)) {
    return {
      queries: [],
      error: `Queries file not found: ${queriesPath}`,
    }
  }

  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(queriesPath, 'utf-8'))
  } catch {
    return { queries: [], error: `Failed to parse queries file: ${queriesPath}` }
  }

  if (!Array.isArray(raw)) {
    return { queries: [], error: 'Queries file must be a JSON array' }
  }

  const queries: EvalQuery[] = []
  const invalidIds: string[] = []

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const q = item as Record<string, unknown>

    if (typeof q['query_id'] !== 'string' || typeof q['query_text'] !== 'string') {
      invalidIds.push(String(q['query_id'] ?? 'unknown'))
      continue
    }

    queries.push({
      query_id: q['query_id'] as string,
      query_text: q['query_text'] as string,
      top_k: typeof q['top_k'] === 'number' ? (q['top_k'] as number) : undefined,
      min_similarity:
        typeof q['min_similarity'] === 'number' ? (q['min_similarity'] as number) : undefined,
      expected_topics: Array.isArray(q['expected_topics'])
        ? (q['expected_topics'] as string[])
        : undefined,
    })
  }

  if (queries.length === 0 && raw.length > 0) {
    return { queries, error: `All ${raw.length} query entries were invalid (missing query_id or query_text)` }
  }

  return { queries }
}

/**
 * Creates a sample queries file for testing/bootstrapping.
 */
export function createSampleQueriesFile(filePath: string): void {
  const samples: EvalQuery[] = [
    {
      query_id: 'q001',
      query_text: 'What is the first-line antibiotic for community-acquired pneumonia?',
      top_k: 5,
      min_similarity: 0.5,
      expected_topics: ['pneumonia', 'antibiotic'],
    },
    {
      query_id: 'q002',
      query_text: 'How to manage hypertension in diabetic patients?',
      top_k: 5,
      min_similarity: 0.5,
      expected_topics: ['hypertension', 'diabetes'],
    },
    {
      query_id: 'q003',
      query_text: 'What are the diagnostic criteria for sepsis?',
      top_k: 5,
      min_similarity: 0.5,
      expected_topics: ['sepsis', 'diagnosis'],
    },
  ]

  const dir = filePath.split(/[\\/]/).slice(0, -1).join('/')
  if (dir) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(samples, null, 2), 'utf-8')
}
