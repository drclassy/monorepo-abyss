// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { RAGQueryResult } from '../types.js'

import { formatGroundedCitations } from './formatter.js'

export function attachGroundedCitations(result: RAGQueryResult): RAGQueryResult {
  if (result.chunks.length === 0) {
    return result
  }

  return {
    ...result,
    citations: formatGroundedCitations(result.chunks),
  }
}
