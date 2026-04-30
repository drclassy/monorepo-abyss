# Sentra RAG Database Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Sentra RAG stack so PDF ingestion, chunking, retrieval, and database writes form a safer, more testable, and more scalable pipeline without breaking the existing retrieval boundary.

**Architecture:** Keep `@the-abyss/document-ingestion` as the canonical PDF parsing and normalization front door. Make `@the-abyss/sentra-rag` consume canonical artifacts instead of duplicating parsing logic, then harden retrieval and database writes through a clearer repository abstraction, configurable model/runtime defaults, and stronger evaluation coverage. Preserve the existing local-first / PHI-safe boundary and avoid moving healthcare data into `packages/database`.

**Tech Stack:** TypeScript, Vitest, PostgreSQL + pgvector, Ollama, LiteParse, `@the-abyss/document-ingestion`, `@the-abyss/vector-store`, existing Sentra registry and evaluation artifacts.

---

## Scope Check

This plan covers one connected subsystem: the RAG ingestion-to-database path. It intentionally does **not** expand into clinical reasoning, Dashboard wiring, or Assist wiring. If future work wants hybrid retrieval, reranking, and semantic chunking at larger depth, those can be sequenced after this hardening pass.

## Recommended Approach

1. **Preferred path:** consolidate ingestion around `document-ingestion`, then harden retrieval and DB persistence in `sentra-rag`.
2. **Alternative path:** keep the current direct extraction path but add stronger abstractions around storage and ranking.
3. **Fallback path:** move only the dry-run / registry pipeline first, then stage the runtime ingestion cutover later.

**Recommendation:** use path 1. It removes duplicated PDF parsing logic, keeps artifact generation auditable, and gives us the cleanest surface for retrieval upgrades.

---

### Task 1: Lock the ingestion contract

**Files:**
- Modify: `packages/document-ingestion/src/ingest-document.ts`
- Modify: `packages/document-ingestion/src/types.ts`
- Modify: `packages/document-ingestion/src/index.ts`
- Test: `packages/document-ingestion/tests/ingest-document.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/providers/liteparse.provider', () => {
  const canonical = {
    documentId: 'doc_abc_v1',
    sourceHash: 'a'.repeat(64),
    documentVersion: 'v1',
    parserProvider: 'liteparse',
    createdAt: '2026-04-30T00:00:00.000Z',
    preflight: {
      documentType: 'digital_pdf',
      requiresOcr: false,
      confidence: 1,
      reason: 'mocked',
      pageSignals: [],
    },
    qualityReport: {
      status: 'ready',
      totalPages: 1,
      failedPages: [],
      lowConfidencePages: [],
      averageOcrConfidence: null,
      documentType: 'digital_pdf',
      requiresReview: false,
      warnings: [],
    },
    pages: [
      {
        pageNumber: 1,
        text: 'Clinical guideline text',
        markdown: 'Clinical guideline text',
        parserProvider: 'liteparse',
        ocrConfidence: null,
        textDensity: 24,
        requiresReview: false,
      },
    ],
    metadata: { pageCount: 1 },
  }

  return {
    LiteParseProvider: vi.fn().mockImplementation(() => ({
      parse: vi.fn().mockResolvedValue(canonical),
    })),
  }
})

import { ingestDocument } from '../src/ingest-document'
import { toChunkerInput } from '../src/chunking/chunker-adapter'

describe('document ingestion contract', () => {
  it('returns canonical document, markdown, and chunker input with stable metadata', async () => {
    const result = await ingestDocument({ buffer: Buffer.from('%PDF-1.4 mocked') })

    expect(result.canonical.sourceHash).toMatch(/^[a-f0-9]{64}$/)
    expect(result.markdown).toContain('document_id:')
    expect(result.chunks[0].metadata).toMatchObject({
      source_hash: result.canonical.sourceHash,
      ingestion_status: result.canonical.qualityReport.status,
    })
  })

  it('blocks failed documents from chunker output', async () => {
    const failed = {
      sourceHash: 'a'.repeat(64),
      documentVersion: 'v1',
      qualityReport: { status: 'failed' },
      pages: [],
    } as unknown as Parameters<typeof toChunkerInput>[0]

    expect(toChunkerInput(failed)).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @the-abyss/document-ingestion test -- --runInBand`
Expected: the contract test fails if any metadata or blocking behavior is missing.

- [ ] **Step 3: Write minimal implementation**

```ts
// Keep ingestDocument as the only public canonicalization entrypoint.
// Preserve PHI-safe logging only and ensure chunk metadata stays stable.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @the-abyss/document-ingestion test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/document-ingestion/src packages/document-ingestion/tests
git commit -m "test(document-ingestion): lock canonical PDF contract"
```

---

### Task 2: Replace direct PDF extraction with canonical artifact consumption

**Files:**
- Modify: `packages/sentra-rag/src/ingestion/pipeline.ts`
- Modify: `packages/sentra-rag/src/ingestion/pdf-batch-runner.ts`
- Modify: `packages/sentra-rag/src/ingestion/artifact-writer.ts`
- Modify: `packages/sentra-rag/src/ingestion/chunker.ts`
- Modify: `packages/sentra-rag/src/cli/ingest-pdf.ts`
- Test: `packages/sentra-rag/tests/pdf-batch-runner.test.ts`
- Test: `packages/sentra-rag/tests/artifact-writer.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest'
import { ingestFile } from '../src/ingestion/pipeline'

vi.mock('@the-abyss/document-ingestion', () => ({
  ingestDocument: vi.fn().mockResolvedValue({
    canonical: {
      sourceHash: 'abc123'.padEnd(64, '0'),
      documentVersion: 'v1',
      documentTitle: 'Mocked Document',
      qualityReport: { status: 'ready', warnings: [] },
      pages: [],
    },
    markdown: '# doc',
    chunks: [
      {
        content: 'chunk text',
        metadata: {
          source_hash: 'abc123'.padEnd(64, '0'),
          page_number: 1,
          parser_provider: 'liteparse',
          ocr_confidence: null,
          document_version: 'v1',
          document_title: 'Mocked Document',
          ingestion_status: 'ready',
        },
      },
    ],
  }),
}))

describe('ingestFile', () => {
  it('uses canonical ingestion output instead of raw PDF extraction', async () => {
    const mockStore = {
      fileExists: vi.fn().mockResolvedValue(false),
      upsert: vi.fn().mockResolvedValue(undefined),
    }
    const mockEmbedder = {
      embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    }

    const result = await ingestFile('./any.pdf', mockStore as never, mockEmbedder as never)
    expect(result.chunks).toBe(1)
    expect(result.stored).toBe(1)
    expect(mockStore.upsert).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @the-abyss/sentra-rag test -- --runInBand`
Expected: the ingestion test fails until `sentra-rag` consumes canonical output.

- [ ] **Step 3: Write minimal implementation**

```ts
// Replace raw python extraction with ingestDocument() output.
// Remove the direct python/PyMuPDF branch once the canonical path is stable.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @the-abyss/sentra-rag test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/sentra-rag/src/ingestion packages/sentra-rag/src/cli packages/sentra-rag/tests
git commit -m "feat(sentra-rag): consume canonical PDF artifacts"
```

---

### Task 3: Add a repository layer for vector writes

**Files:**
- Modify: `packages/vector-store/src/store.ts`
- Modify: `packages/vector-store/src/index.ts`
- Modify: `packages/sentra-rag/src/storage/pgvector.store.ts`
- Modify: `packages/sentra-rag/src/embedding/pg-adapter.ts`
- Test: `packages/vector-store/src/__tests__/store.test.ts`
- Test: `packages/sentra-rag/tests/approved-embedding.pipeline.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest'
import { createVectorStore } from '@the-abyss/vector-store'

describe('vector store repository', () => {
  it('upserts by stable vector id with metadata payload', async () => {
    const mockDatabase = {
      $queryRawUnsafe: vi.fn(),
      $executeRawUnsafe: vi.fn(),
    }
    const store = createVectorStore({ database: mockDatabase as never })
    await store.upsertById('vec_1', 'chunk text', { source_hash: 'abc' })
    expect(mockDatabase.$queryRawUnsafe).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @the-abyss/vector-store test`
Expected: fail until the repository abstraction is explicit and covered.

- [ ] **Step 3: Write minimal implementation**

```ts
// Centralize upsert/query logic in vector-store.
// Keep raw SQL in one place only and expose a narrow repository API.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @the-abyss/vector-store test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vector-store/src packages/sentra-rag/src/storage packages/sentra-rag/src/embedding
git commit -m "feat(vector-store): harden pgvector repository abstraction"
```

---

### Task 4: Make retrieval configurable and layered

**Files:**
- Modify: `packages/sentra-rag/src/engine.ts`
- Modify: `packages/sentra-rag/src/assessment/gemma.ts`
- Modify: `packages/sentra-rag/src/ingestion/embedder.ts`
- Modify: `packages/sentra-rag/src/retrieval/local.engine.ts`
- Modify: `packages/sentra-rag/src/retrieval/hybrid.engine.ts`
- Modify: `packages/sentra-rag/src/types.ts`
- Test: `packages/sentra-rag/tests/runtime-config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'

describe('runtime config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('resolves Ollama base URL at construction time instead of module load time', async () => {
    const { OllamaEmbedder } = await import('../src/ingestion/embedder')
    vi.stubEnv('OLLAMA_BASE_URL', 'http://127.0.0.1:11435')

    const embedder = new OllamaEmbedder()
    expect((embedder as unknown as { baseUrl: string }).baseUrl).toBe('http://127.0.0.1:11435')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @the-abyss/sentra-rag test`
Expected: fail until the config surface is cleaned up and consistently used.

- [ ] **Step 3: Write minimal implementation**

```ts
// Keep defaults, but always allow config/env override.
// Keep cloud fallback removed unless Chief explicitly reopens it.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @the-abyss/sentra-rag test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/sentra-rag/src
git commit -m "feat(sentra-rag): make runtime models configurable"
```

---

### Task 5: Upgrade retrieval quality before adding more data

**Files:**
- Modify: `packages/sentra-rag/src/retrieval/*.ts`
- Modify: `packages/sentra-rag/src/evaluation/*.ts`
- Modify: `packages/sentra-rag/src/cli/eval-retrieval.ts`
- Test: `packages/sentra-rag/tests/quality-scorer.test.ts`
- Test: `packages/sentra-rag/tests/eval-pipeline.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { generateRecommendations } from '../src/evaluation/recommendations'

describe('retrieval recommendations', () => {
  it('flags low recall, no hybrid retrieval, no reranker, and no MMR as action items', () => {
    const recs = generateRecommendations({
      recall: 0.4,
      precision: 0.7,
      hasHybridRetrieval: false,
      hasReranker: false,
      hasMMR: false,
    })

    expect(recs.some((r) => r.type === 'ACTION')).toBe(true)
    expect(recs.some((r) => /hybrid|reranker|MMR/i.test(r.title))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @the-abyss/sentra-rag test`
Expected: fail until the retrieval evaluator recognizes the new quality targets.

- [ ] **Step 3: Write minimal implementation**

```ts
// Add hybrid retrieval support first, then reranker hooks, then MMR.
// Keep evaluation output deterministic and PHI-safe.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @the-abyss/sentra-rag test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/sentra-rag/src/evaluation packages/sentra-rag/src/retrieval packages/sentra-rag/tests
git commit -m "feat(sentra-rag): improve retrieval quality controls"
```

---

### Task 6: Close the loop with database-safe verification

**Files:**
- Modify: `packages/sentra-rag/tests/pipeline-safety.test.ts`
- Modify: `packages/document-ingestion/tests/ingest-document.test.ts`
- Modify: `packages/vector-store/src/__tests__/store.test.ts`
- Modify: `packages/sentra-rag/README.md`
- Modify: `packages/document-ingestion/README.md`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/providers/liteparse.provider', () => ({
  LiteParseProvider: vi.fn().mockImplementation(() => ({
    parse: vi.fn().mockResolvedValue({
      documentId: 'doc_safe_v1',
      sourceHash: 'b'.repeat(64),
      documentVersion: 'v1',
      parserProvider: 'liteparse',
      createdAt: '2026-04-30T00:00:00.000Z',
      preflight: {
        documentType: 'digital_pdf',
        requiresOcr: false,
        confidence: 1,
        reason: 'mocked',
        pageSignals: [],
      },
      qualityReport: {
        status: 'ready',
        totalPages: 1,
        failedPages: [],
        lowConfidencePages: [],
        averageOcrConfidence: null,
        documentType: 'digital_pdf',
        requiresReview: false,
        warnings: [],
      },
      pages: [
        {
          pageNumber: 1,
          text: 'NIK 1234567890123456, patient name, phone 08123456789',
          markdown: 'NIK 1234567890123456, patient name, phone 08123456789',
          parserProvider: 'liteparse',
          ocrConfidence: null,
          textDensity: 44,
          requiresReview: false,
        },
      ],
      metadata: { pageCount: 1 },
    }),
  })),
}))

import { ingestDocument } from '../src/ingest-document'

describe('pipeline safety', () => {
  it('never writes document text to logs and keeps logging structural only', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await ingestDocument({ buffer: Buffer.from('%PDF-1.4 mocked') })

    const logText = logSpy.mock.calls.flat().join(' ')
    expect(logText).not.toContain('08123456789')
    expect(logText).not.toContain('1234567890123456')
    expect(logText).toContain('source_hash=')
    logSpy.mockRestore()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @the-abyss/sentra-rag test`
Expected: fail until safety assertions are specific and enforced.

- [ ] **Step 3: Write minimal implementation**

```ts
// Update docs and tests to prove the new contract:
// ingestion -> canonical artifacts -> vector repository -> retrieval/eval.
```

- [ ] **Step 4: Run test to verify it passes**

Run:
`pnpm --filter @the-abyss/document-ingestion test`
`pnpm --filter @the-abyss/vector-store test`
`pnpm --filter @the-abyss/sentra-rag test`

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add packages/document-ingestion packages/vector-store packages/sentra-rag
git commit -m "docs(sentra-rag): close the database-safe RAG contract"
```

---

## Rollout Order

1. Lock the ingestion contract.
2. Route Sentra RAG through canonical PDF artifacts.
3. Harden vector store access behind a repository abstraction.
4. Make runtime model defaults configurable.
5. Upgrade retrieval quality with hybrid search, reranking, and diversity.
6. Finish with PHI-safe verification and docs sync.

## Success Criteria

- PDF ingestion produces canonical, traceable artifacts every time.
- `sentra-rag` no longer depends on raw PDF extraction as its primary path.
- Vector writes are centralized and easier to test.
- Model choice is configurable without code edits.
- Retrieval quality work is staged in a way that does not destabilize the database path.
- Tests pass for ingestion, vector storage, and retrieval evaluation.

## Risks and Guardrails

- Do not move healthcare data into `packages/database`.
- Do not reintroduce cloud fallback as an accidental default.
- Do not let retrieval changes bypass the registry or quality gates.
- Do not add semantic chunking before the canonical artifact path is stable.
- Keep all logging PHI-safe and structural only.
