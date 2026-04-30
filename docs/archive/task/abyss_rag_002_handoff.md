---

task\_id: ABYSS-RAG-002 title: "Integrate Document Ingestion into Sentra RAG Dry-Run Pipeline" owner: "@chief" domain: healthcare priority: high created\_at: 2026-04-27T00:00:00Z status: pending\_approval approved\_by: null approved\_at: null depends\_on:

- ABYSS-RAG-001

---

# ABYSS-RAG-002 — Integrate Document Ingestion into Sentra RAG Dry-Run Pipeline

## 1. Task Description

Integrate the completed `@the-abyss/document-ingestion` package into a safe dry-run RAG ingestion workflow.

This task must process one or more PDF files from an input folder and produce reviewable knowledge artifacts without generating embeddings and without writing to the vector database.

The goal is to create an operational bridge between raw PDFs and the future Sentra RAG knowledge database.

The dry-run pipeline must output:

1. `canonical.json`
2. `document.md`
3. `chunks.json`
4. `quality-report.json`
5. `ingestion-summary.json`

This task must remain local-first and audit-friendly.

---

## 2. Business Value

ABYSS-RAG-001 created the document parser. ABYSS-RAG-002 turns that parser into a usable workflow.

Sentra needs a controlled way to process clinical guidelines, SOPs, legal documents, PNPK/PPK, and internal governance PDFs before they enter AADI’s knowledge layer.

This dry-run stage prevents bad OCR or malformed chunks from silently entering the retrieval system.

This task creates a human-reviewable checkpoint before embedding and retrieval.

---

## 3. Non-Goals

Do not implement the following in this task:

- Embedding generation.
- Vector database writes.
- Retrieval API.
- AADI clinical reasoning logic.
- Google Document AI.
- PaddleOCR.
- SATUSEHAT integration.
- UI/dashboard.
- Langflow visual flow editing.
- Production deployment.

This task only creates local dry-run artifacts.

---

## 4. Intended Workflow

```txt
Input PDF Folder
  ↓
Batch PDF Discovery
  ↓
@the-abyss/document-ingestion
  ↓
Canonical JSON
  ↓
Markdown
  ↓
Chunker Input JSON
  ↓
Quality Report
  ↓
Knowledge Artifacts Folder
  ↓
Ingestion Summary
```

---

## 5. Target User Command

Preferred command:

```bash
pnpm sentra-rag ingest:pdf --input ./data/raw-pdf --output ./data/knowledge-artifacts
```

If `sentra-rag` already has a different CLI pattern, adapt to the existing package convention instead of forcing this exact command.

The final command must be documented in the package README or task proof section.

---

## 6. Expected Output Structure

Given:

```txt
data/raw-pdf/example-guideline.pdf
```

Output should be:

```txt
data/knowledge-artifacts/
├── processed/
│   └── <source_hash>/
│       ├── canonical.json
│       ├── document.md
│       ├── chunks.json
│       └── quality-report.json
├── skipped/
│   └── duplicates.json
├── failed/
│   └── failures.json
└── ingestion-summary.json
```

Rules:

- Use `source_hash` as the primary folder name.
- Never use raw document title as the primary folder name.
- Do not overwrite processed artifacts unless `--force` is explicitly passed.
- Failed documents must not produce `chunks.json` unless the failure happens after chunk creation.
- Duplicate documents must be skipped by default.

---

## 7. Acceptance Criteria

### 7.1 CLI / Script Entry Point

-

### 7.2 Integration with Document Ingestion

-

### 7.3 Batch PDF Processing

-

### 7.4 Artifact Generation

For each successfully processed PDF:

-

### 7.5 Deduplication

-

### 7.6 Quality Gate Behavior

-

### 7.7 Ingestion Summary

`ingestion-summary.json` must include:

-

Per-document result must include:

-

### 7.8 Safety / Governance

-

### 7.9 Tests

-

---

## 8. Recommended Implementation Location

Prefer implementing inside existing RAG package if it exists and is active:

```txt
packages/sentra-rag/
```

Suggested structure:

```txt
packages/sentra-rag/
├── src/
│   ├── cli/
│   │   └── ingest-pdf.ts
│   ├── ingestion/
│   │   ├── pdf-batch-runner.ts
│   │   ├── pdf-discovery.ts
│   │   ├── artifact-writer.ts
│   │   ├── duplicate-detector.ts
│   │   └── ingestion-summary.ts
│   └── index.ts
└── tests/
    ├── pdf-discovery.test.ts
    ├── artifact-writer.test.ts
    ├── duplicate-detector.test.ts
    └── ingestion-summary.test.ts
```

If `packages/sentra-rag` is not configured for CLI usage, create the smallest possible script entry point while respecting existing package conventions.

Do not create a second competing RAG package.

---

## 9. Package Dependency

Add workspace dependency from `packages/sentra-rag` to `packages/document-ingestion`.

Example package dependency:

```json
{
  "dependencies": {
    "@the-abyss/document-ingestion": "workspace:*"
  }
}
```

Do not install LiteParse inside `sentra-rag`.

LiteParse must remain isolated in `packages/document-ingestion`.

---

## 10. Core Implementation Details

### 10.1 PDF Discovery

Create a function similar to:

```ts
export async function discoverPdfFiles(inputDir: string, options?: {
  limit?: number;
}): Promise<string[]>;
```

Rules:

- Recursive search.
- Include only `.pdf` extension case-insensitively.
- Stable sorted output.
- Respect optional `limit`.

---

### 10.2 Duplicate Detection

Duplicate detection should be based on output existence by `source_hash`.

Because `source_hash` is generated by `ingestDocument()`, duplicate detection may happen after parsing in this version.

Acceptable v1 behavior:

1. Parse document.
2. Read `canonical.sourceHash`.
3. If `processed/<source_hash>` exists and `--force` is false, skip artifact write and record duplicate.

Future optimization can compute source hash before parsing.

---

### 10.3 Artifact Writer

Create a function similar to:

```ts
export async function writeKnowledgeArtifacts(params: {
  outputDir: string;
  canonical: CanonicalDocument;
  markdown: string;
  chunks: ChunkerInput[];
}): Promise<{
  artifactDir: string;
  canonicalPath: string;
  markdownPath: string;
  chunksPath?: string;
  qualityReportPath: string;
}>;
```

Rules:

- Create `processed/<source_hash>/`.
- Write JSON with 2-space indentation.
- Write Markdown as UTF-8.
- Do not write `chunks.json` if document status is `failed`.

---

### 10.4 Batch Runner

Create a function similar to:

```ts
export async function runPdfDryRunIngestion(params: {
  inputDir: string;
  outputDir: string;
  force?: boolean;
  limit?: number;
}): Promise<IngestionSummary>;
```

Behavior:

1. Discover PDFs.
2. For each PDF:
   - call `ingestDocument({ filePath })`
   - evaluate `qualityReport.status`
   - write artifacts if appropriate
   - record status
3. Continue after individual failures.
4. Write `ingestion-summary.json` at the end.
5. Return summary.

---

### 10.5 CLI Entry

Create a CLI script that parses:

```txt
--input
--output
--force
--limit
```

Minimal custom argument parser is acceptable. Avoid introducing a heavy CLI framework unless the repo already uses one.

Example behavior:

```bash
pnpm sentra-rag ingest:pdf --input ./data/raw-pdf --output ./data/knowledge-artifacts --limit 5
```

Console output should be concise:

```txt
ABYSS-RAG-002 PDF Dry-Run Ingestion
Input: ./data/raw-pdf
Output: ./data/knowledge-artifacts
Discovered PDFs: 12
Processed: 10
Ready: 8
Needs Review: 2
Failed: 1
Skipped Duplicates: 1
Summary: ./data/knowledge-artifacts/ingestion-summary.json
```

Do not print full document text.

---

## 11. Required Types

Create or adapt internal types as needed:

```ts
export type DryRunDocumentStatus =
  | 'ready'
  | 'needs_review'
  | 'failed'
  | 'skipped_duplicate';

export interface DryRunDocumentResult {
  filePath: string;
  sourceHash?: string;
  documentTitle?: string;
  status: DryRunDocumentStatus;
  artifactPaths?: {
    artifactDir?: string;
    canonicalPath?: string;
    markdownPath?: string;
    chunksPath?: string;
    qualityReportPath?: string;
  };
  warnings: string[];
  error?: string;
}

export interface IngestionSummary {
  runId: string;
  startedAt: string;
  completedAt: string;
  inputDir: string;
  outputDir: string;
  totalDiscoveredPdfs: number;
  processedCount: number;
  readyCount: number;
  needsReviewCount: number;
  failedCount: number;
  skippedDuplicateCount: number;
  results: DryRunDocumentResult[];
}
```

---

## 12. Testing Plan

### Unit Tests

Create tests for:

1. PDF discovery

   - finds PDFs recursively
   - ignores non-PDF files
   - sorts output deterministically
   - respects limit

2. Artifact writer

   - writes expected files
   - writes JSON pretty-printed
   - does not write `chunks.json` for failed document

3. Duplicate detector

   - skips existing `processed/<source_hash>` by default
   - reprocesses when `force` is true

4. Ingestion summary

   - counts ready/needs\_review/failed/skipped correctly
   - includes per-document artifact paths
   - includes warnings and sanitized errors

5. Batch runner

   - continues after one PDF fails
   - calls `ingestDocument()` once per PDF
   - writes final summary

### Mocking Rule

Use mocked `@the-abyss/document-ingestion` for most tests.

Do not require real OCR in unit tests.

---

## 13. Verification Commands

Run package-level verification:

```bash
pnpm --filter @the-abyss/sentra-rag build
pnpm --filter @the-abyss/sentra-rag test
```

If package name differs, use actual `sentra-rag` package name from its `package.json`.

Run a local dry-run smoke test with a safe non-PHI sample PDF:

```bash
pnpm sentra-rag ingest:pdf --input ./data/raw-pdf --output ./data/knowledge-artifacts --limit 1
```

If no safe sample PDF exists, create a minimal synthetic PDF fixture with non-clinical placeholder text only.

---

## 14. Security & Compliance Requirements

- No PHI fixtures.
- No patient document committed.
- No document text logged to console.
- No external network calls.
- No cloud OCR.
- No SATUSEHAT.
- No embedding generation.
- No vector database write.
- All errors must be sanitized before entering summary.

---

## 15. Risks & Mitigation

| Risk                                         | Probability | Impact   | Mitigation                                                          |
| -------------------------------------------- | ----------- | -------- | ------------------------------------------------------------------- |
| Bad OCR enters artifacts                     | Medium      | High     | Keep dry-run human-reviewable; do not embed yet.                    |
| Duplicate documents waste processing         | Medium      | Medium   | Use `source_hash` folder and duplicate skip behavior.               |
| CLI breaks existing `sentra-rag` conventions | Medium      | Medium   | Inspect existing package scripts first and adapt minimally.         |
| Real PHI accidentally committed              | Low         | Critical | Use synthetic fixtures only.                                        |
| Tests become slow due to OCR                 | Medium      | Medium   | Mock `ingestDocument()` in unit tests.                              |
| Scope creep into vector DB                   | Medium      | High     | Explicitly prohibit embedding/vector writes in acceptance criteria. |

---

## 16. Definition of Done

Task is complete only when:

-

---

## 17. Proof of Verification

After implementation, update this section with actual command outputs.

### Commands Run

```bash
pnpm --filter @the-abyss/sentra-rag typecheck
pnpm --filter @the-abyss/sentra-rag test
pnpm --filter @the-abyss/document-ingestion build  # required before smoke test (exports dist/)
npx tsx src/cli/ingest-pdf.ts --input ./data/raw-pdf --output ./data/knowledge-artifacts --limit 1
```

### Actual Results

```
Typecheck: PASS (tsc --noEmit, exit 0)
Tests:     PASS 32/32 (5 test files, vitest v2.1.0)
  ✓ tests/pdf-discovery.test.ts (7 tests)
  ✓ tests/artifact-writer.test.ts (6 tests)
  ✓ tests/duplicate-detector.test.ts (5 tests)
  ✓ tests/ingestion-summary.test.ts (8 tests)
  ✓ tests/pdf-batch-runner.test.ts (6 tests)

Dry-run smoke test: PASS
  ABYSS-RAG-002 PDF Dry-Run Ingestion
  Input:  .../packages/sentra-rag/data/raw-pdf
  Output: .../packages/sentra-rag/data/knowledge-artifacts
  Discovered PDFs:    1
  Processed:          1
  Ready:              1
  Needs Review:       0
  Failed:             0
  Skipped Duplicates: 0
  Summary:            .../data/knowledge-artifacts/ingestion-summary.json

Artifacts generated:
  processed/54ffa384.../canonical.json       (1239 bytes)
  processed/54ffa384.../document.md          (381 bytes)
  processed/54ffa384.../chunks.json          (347 bytes)
  processed/54ffa384.../quality-report.json  (201 bytes)
  ingestion-summary.json                     (1775 bytes)

Embedding generation: 0 (grep confirmed, no embed/upsert/OllamaEmbedder in new files)
Vector DB writes:     0 (grep confirmed, no pgvector/store.upsert in new files)
Cloud OCR calls:      0 (LiteParse isolated in document-ingestion only)
SATUSEHAT calls:      0

turbo run: BLOCKED (pre-existing IO error in agent-hermes vendor pnpm store — unrelated to this task)
```

### Notes

- `@the-abyss/document-ingestion` must be built before smoke test (dist/ required by exports field).
- `document-ingestion/package.json` exports updated with `"default"` condition for tsx/CJS compatibility.
- pnpm install EPERM on `@unrs+resolver-binding-win32-x64-msvc` is a pre-existing Windows file lock — workspace junction created manually.


---

## 18. Commit Convention

Use:

```txt
[ABYSS-RAG-002] [RAG] Add dry-run PDF ingestion artifacts pipeline

Agent: Cursor
Phase: RAGOps
Handoff: docs/archive/task/abyss_rag_002_handoff.md
```

---

## 19. Chief Approval

**Status:** PENDING

> Approval String:
>
> `✅ GO ABYSS-RAG-002`

