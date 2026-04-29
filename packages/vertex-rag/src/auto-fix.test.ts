import { describe, expect, it } from 'vitest'

import {
  extractCorpusId,
  parseRagCorporaResponse,
  shouldIgnoreRagConfigError,
} from './auto-fix'

describe('vertex rag auto-fix helpers', () => {
  it('parses a valid ragCorpora response', () => {
    expect(
      parseRagCorporaResponse({
        ragCorpora: [{ name: 'projects/p/locations/l/ragCorpora/corpus-123', displayName: 'Main' }],
      })
    ).toEqual({
      ragCorpora: [{ name: 'projects/p/locations/l/ragCorpora/corpus-123', displayName: 'Main' }],
    })
  })

  it('throws when ragCorpora response shape is invalid', () => {
    expect(() => parseRagCorporaResponse({ nope: [] })).toThrow(
      'Vertex RAG response did not include ragCorpora'
    )
  })

  it('extracts the terminal corpus id from a corpus name', () => {
    expect(extractCorpusId({ name: 'projects/p/locations/l/ragCorpora/corpus-123' })).toBe(
      'corpus-123'
    )
  })

  it('only ignores known benign RAG config errors', () => {
    expect(shouldIgnoreRagConfigError(new Error('ALREADY_EXISTS'))).toBe(true)
    expect(shouldIgnoreRagConfigError(new Error('already configured for this project'))).toBe(
      true
    )
    expect(shouldIgnoreRagConfigError(new Error('permission denied'))).toBe(false)
  })
})
