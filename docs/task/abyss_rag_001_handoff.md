---

## task\_id: ABYSS-RAG-001 title: "Implement Local-First PDF OCR Ingestion Layer with LiteParse" owner: "@chief" domain: healthcare priority: high created\_at: 2026-04-27T00:00:00Z status: pending\_approval approved\_by: null approved\_at: null

# ABYSS-RAG-001 — Implement Local-First PDF OCR Ingestion Layer with LiteParse

## 1. Task Description

Implement a local-first PDF ingestion layer for The Abyss knowledge database using `@llamaindex/liteparse`.

This task creates one new shared package:

```txt
packages/document-ingestion
```

The package must process raw PDF documents into structured, traceable, RAG-ready artifacts:

1. Canonical JSON
2. Markdown
3. OCR quality report
4. Page-level metadata
5. Chunker-compatible output

The primary goal is to prepare raw clinical, legal, regulatory, academic, and internal governance PDF documents into reliable knowledge-base input without requiring SATUSEHAT, Google Document AI, PaddleOCR, or external OCR services.

This is the first version only. Keep the scope small, local-first, testable, and modular.

---

## 2. Business Value

Sentra’s knowledge base will depend on many PDF sources: PNPK, PPK, clinical guidelines, institutional SOPs, regulatory documents, academic references, and internal governance files.

Raw PDF ingestion is risky because:

- Digital PDFs and scanned PDFs behave differently.
- OCR errors may corrupt clinical knowledge.
- Markdown-only extraction is not traceable enough.
- RAG chunks need page-level metadata for auditability.
- Reprocessing duplicate documents wastes compute and embedding cost.

This task creates the foundation for safe RAGOps ingestion by ensuring every document has:

- source traceability,
- parser metadata,
- OCR quality status,
- deterministic hashing,
- chunker-ready structure,
- and an upgrade path to future OCR providers.

---

## 3. Non-Goals

Do not implement the following in this task:

- Google Document AI integration.
- PaddleOCR server integration.
- SATUSEHAT integration.
- Clinical diagnosis logic.
- Embedding generation.
- Vector database write operation.
- UI/dashboard.
- Langflow visual flow editing.
- Production deployment pipeline changes.

This task only prepares parsed output for the existing chunker or ingestion pipeline.

---

## 4. Acceptance Criteria

### 4.1 Package Setup

-

### 4.2 LiteParse Integration

-

### 4.3 PDF Preflight Detector

-

### 4.4 Canonical JSON Output

-

### 4.5 Markdown Output

-

Example page marker:

```md
<!-- source_hash:abc123 page_number:3 parser_provider:liteparse -->
## Page 3
```

### 4.6 OCR Quality Report

-

### 4.7 Chunker Connection

-

### 4.8 Tests

-

### 4.9 Governance

-

---

## 5. Proposed Architecture

```txt
Raw PDF
  ↓
Document Fingerprint
  ↓
PDF Preflight Detector
  ├─ Digital PDF → LiteParse text/spatial parser
  └─ Scanned PDF → LiteParse OCR mode
  ↓
Canonical Document Normalizer
  ↓
OCR Quality Report
  ├─ ready → chunker input
  ├─ needs_review → chunker input with warning metadata
  └─ failed → block from chunker
  ↓
Markdown + JSON Artifacts
  ↓
Existing RAG chunker integration point
```

---

## 6. Target Directory Structure

Create:

```txt
packages/document-ingestion/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── ingest-document.ts
│   ├── providers/
│   │   ├── document-parser-provider.ts
│   │   └── liteparse.provider.ts
│   ├── detection/
│   │   └── pdf-preflight.ts
│   ├── normalization/
│   │   ├── canonical-document.ts
│   │   └── markdown-renderer.ts
│   ├── quality/
│   │   └── ocr-quality-report.ts
│   ├── chunking/
│   │   └── chunker-adapter.ts
│   ├── hashing/
│   │   └── source-hash.ts
│   └── errors/
│       └── ingestion-error.ts
└── tests/
    ├── source-hash.test.ts
    ├── pdf-preflight.test.ts
    ├── ocr-quality-report.test.ts
    ├── markdown-renderer.test.ts
    ├── chunker-adapter.test.ts
    └── fixtures/
        └── README.md
```

---

## 7. Dependencies

Install inside the monorepo:

```bash
pnpm add @llamaindex/liteparse zod -F @the-abyss/document-ingestion
pnpm add -D vitest tsup @types/node -F @the-abyss/document-ingestion
```

If the package does not exist yet, create `packages/document-ingestion/package.json` first.

---

## 8. Core Types

Create `src/types.ts`.

```ts
export type ParserProviderName = 'liteparse';

export type DocumentType =
  | 'digital_pdf'
  | 'scanned_pdf'
  | 'hybrid_pdf'
  | 'unknown';

export type IngestionStatus = 'ready' | 'needs_review' | 'failed';

export interface ParseInput {
  filePath?: string;
  buffer?: Buffer;
  fileName?: string;
  mimeType?: string;
  documentVersion?: string;
  documentTitle?: string;
}

export interface PdfPreflightResult {
  documentType: DocumentType;
  requiresOcr: boolean;
  confidence: number;
  reason: string;
  pageSignals: Array<{
    pageNumber: number;
    hasExtractableText: boolean;
    textDensity: number;
  }>;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
}

export interface CanonicalPage {
  pageNumber: number;
  text: string;
  markdown: string;
  parserProvider: ParserProviderName;
  ocrConfidence: number | null;
  textDensity: number;
  requiresReview: boolean;
  boundingBoxes?: BoundingBox[];
}

export interface OcrQualityReport {
  status: IngestionStatus;
  totalPages: number;
  failedPages: number[];
  lowConfidencePages: number[];
  averageOcrConfidence: number | null;
  documentType: DocumentType;
  requiresReview: boolean;
  warnings: string[];
}

export interface CanonicalDocument {
  documentId: string;
  sourceHash: string;
  documentVersion: string;
  documentTitle?: string;
  parserProvider: ParserProviderName;
  createdAt: string;
  preflight: PdfPreflightResult;
  qualityReport: OcrQualityReport;
  pages: CanonicalPage[];
  metadata: {
    fileName?: string;
    mimeType?: string;
    pageCount: number;
  };
}

export interface ChunkerInput {
  content: string;
  metadata: {
    source_hash: string;
    page_number: number;
    parser_provider: ParserProviderName;
    ocr_confidence: number | null;
    document_version: string;
    document_title?: string;
    ingestion_status: IngestionStatus;
  };
}
```

---

## 9. Implementation Steps

### Step 1 — Create Package

Create `packages/document-ingestion/package.json`.

```json
{
  "name": "@the-abyss/document-ingestion",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src tests --ext .ts"
  },
  "dependencies": {
    "@llamaindex/liteparse": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "tsup": "latest",
    "vitest": "latest"
  }
}
```

Create `tsconfig.json` extending the monorepo TypeScript config if available.

---

### Step 2 — Implement Source Hash

Create `src/hashing/source-hash.ts`.

Requirements:

- Use SHA-256.
- Accept `Buffer`.
- Return lowercase hex string.
- Same file must always produce the same hash.
- Hash is required before parsing.

Expected API:

```ts
export function createSourceHash(buffer: Buffer): string;
```

---

### Step 3 — Implement Parser Provider Interface

Create `src/providers/document-parser-provider.ts`.

```ts
import type { CanonicalDocument, ParseInput } from '../types';

export interface DocumentParserProvider {
  name: 'liteparse';
  parse(input: ParseInput): Promise<CanonicalDocument>;
}
```

Do not expose LiteParse directly outside provider implementation.

---

### Step 4 — Implement LiteParse Provider

Create `src/providers/liteparse.provider.ts`.

Responsibilities:

- Accept file path or buffer.
- Use LiteParse to parse PDF locally.
- Enable OCR only when preflight requires it.
- Normalize LiteParse output into internal page objects.
- Preserve page number.
- Preserve OCR confidence if available.
- Preserve bounding boxes if available.
- Never throw raw LiteParse errors directly; wrap them in `IngestionError`.

Important rule:

```txt
External package output must never leak directly into downstream RAG pipeline.
Always normalize first.
```

Expected class:

```ts
export class LiteParseProvider implements DocumentParserProvider {
  name = 'liteparse' as const;

  async parse(input: ParseInput): Promise<CanonicalDocument> {
    // implementation
  }
}
```

If the LiteParse library API differs from expected usage, inspect installed package types and adapt. Keep all adaptation isolated in this file only.

---

### Step 5 — Implement PDF Preflight Detector

Create `src/detection/pdf-preflight.ts`.

Responsibilities:

- Detect if PDF is digital, scanned, hybrid, or unknown.
- Use text density / extractable text signals.
- Inspect page-level output from LiteParse text mode where possible.
- Do not run full OCR just to classify unless necessary.
- Return `PdfPreflightResult`.

Suggested heuristic:

```txt
digital_pdf:
  majority of pages have extractable text and acceptable text density

scanned_pdf:
  majority of pages have no extractable text or near-zero text density

hybrid_pdf:
  mixed result between digital and scanned pages

unknown:
  parsing failed or page signals insufficient
```

Initial thresholds:

```txt
text_density < 20 characters/page = likely scanned
>= 70% pages extractable = digital_pdf
<= 30% pages extractable = scanned_pdf
otherwise = hybrid_pdf
```

These thresholds may be adjusted later after real document testing.

---

### Step 6 — Implement Canonical Document Normalizer

Create `src/normalization/canonical-document.ts`.

Responsibilities:

- Convert parser output into `CanonicalDocument`.
- Ensure every page has:
  - page number,
  - text,
  - markdown,
  - parser provider,
  - OCR confidence,
  - review flag,
  - text density.
- Generate `documentId`.

Suggested `documentId` format:

```txt
doc_${sourceHash.slice(0, 16)}_${documentVersion}
```

Default `documentVersion`:

```txt
v1
```

---

### Step 7 — Implement Markdown Renderer

Create `src/normalization/markdown-renderer.ts`.

Responsibilities:

- Convert `CanonicalDocument` to deterministic Markdown.
- Add document-level metadata header.
- Add page boundaries.
- Include page number and source hash as HTML comments.

Required format:

```md
---
document_id: doc_xxx
source_hash: xxx
document_version: v1
parser_provider: liteparse
ingestion_status: ready
---

<!-- source_hash:xxx page_number:1 parser_provider:liteparse -->
## Page 1

[page content]
```

---

### Step 8 — Implement OCR Quality Report

Create `src/quality/ocr-quality-report.ts`.

Responsibilities:

- Compute document-level quality status.
- Identify failed pages.
- Identify low confidence pages.
- Produce warnings.
- Block unusable documents from chunking.

Initial rules:

```txt
failed:
  no pages OR all pages empty OR parse error

needs_review:
  any page has OCR confidence < 0.75
  OR scanned PDF with average OCR confidence < 0.85
  OR more than 20% pages are empty

ready:
  all required pages have usable text
```

For pages where OCR confidence is unavailable:

```txt
- digital PDF: allow null OCR confidence
- scanned PDF: mark as needs_review if OCR confidence missing
```

---

### Step 9 — Implement Chunker Adapter

Create `src/chunking/chunker-adapter.ts`.

Responsibilities:

- Convert canonical pages into chunker-ready input.
- Do not embed.
- Do not write to vector database.
- Exclude documents with `qualityReport.status === "failed"`.
- Include required metadata.

Expected API:

```ts
export function toChunkerInput(document: CanonicalDocument): ChunkerInput[];
```

Required metadata:

```ts
{
  source_hash: document.sourceHash,
  page_number: page.pageNumber,
  parser_provider: page.parserProvider,
  ocr_confidence: page.ocrConfidence,
  document_version: document.documentVersion,
  document_title: document.documentTitle,
  ingestion_status: document.qualityReport.status
}
```

---

### Step 10 — Implement Public Entry Point

Create `src/ingest-document.ts`.

Expected API:

```ts
export async function ingestDocument(input: ParseInput): Promise<{
  canonical: CanonicalDocument;
  markdown: string;
  chunks: ChunkerInput[];
}>;
```

Behavior:

1. Load file buffer.
2. Generate `sourceHash`.
3. Run preflight.
4. Parse with LiteParse.
5. Normalize into canonical JSON.
6. Generate quality report.
7. Generate Markdown.
8. Generate chunker input if not failed.
9. Return all artifacts.

Create `src/index.ts`.

```ts
export * from './types';
export * from './ingest-document';
export * from './chunking/chunker-adapter';
export * from './quality/ocr-quality-report';
```

---

## 10. Testing Plan

### Unit Tests

Create tests for:

1. `createSourceHash()`

   - same buffer returns same hash.
   - different buffers return different hashes.

2. `detectPdfPreflight()`

   - digital mock returns `digital_pdf`.
   - scanned mock returns `scanned_pdf`.
   - mixed mock returns `hybrid_pdf`.

3. `createOcrQualityReport()`

   - empty pages return `failed`.
   - low confidence returns `needs_review`.
   - good digital text returns `ready`.

4. `renderMarkdown()`

   - includes frontmatter.
   - includes page markers.
   - deterministic output.

5. `toChunkerInput()`

   - includes required metadata.
   - excludes failed documents.
   - preserves page numbers.

### Test Command

```bash
pnpm --filter @the-abyss/document-ingestion test
```

### Build Command

```bash
pnpm --filter @the-abyss/document-ingestion build
```

### Monorepo Verification

```bash
pnpm turbo run build --filter=@the-abyss/document-ingestion
pnpm turbo run test --filter=@the-abyss/document-ingestion
```

---

## 11. Security & Compliance Requirements

- Do not commit real patient documents.
- Do not commit PHI.
- Do not call external OCR services.
- Do not log raw document text in test output.
- Do not log full extracted clinical content to console.
- Log only:
  - source hash,
  - page count,
  - parser provider,
  - ingestion status,
  - quality warnings.
- Any future cloud OCR fallback must be a separate task and separate GO-Gate approval.

---

## 12. Risks & Mitigation

| Risk                                 | Probability | Impact   | Mitigation                                                          |
| ------------------------------------ | ----------- | -------- | ------------------------------------------------------------------- |
| LiteParse API changes                | Medium      | Medium   | Isolate all usage inside `liteparse.provider.ts`.                   |
| OCR quality too low for scanned PDFs | Medium      | High     | Mark `needs_review`; do not silently treat as ready.                |
| Markdown loses table/layout meaning  | Medium      | Medium   | Preserve page boundaries and bounding box metadata where available. |
| Duplicate processing increases cost  | Medium      | Medium   | Use `source_hash` before parsing and downstream embedding.          |
| Bad OCR enters AADI knowledge base   | Medium      | Critical | Quality gate blocks `failed` and flags `needs_review`.              |
| PHI leakage in logs                  | Low         | Critical | Sanitize logs and prohibit document text logging.                   |

---

## 13. Definition of Done

Task is complete only when:

-

---

## 14. Proof of Verification

After implementation, update this section with actual command outputs.

### Commands to Run

```bash
pnpm install
pnpm --filter @the-abyss/document-ingestion build
pnpm --filter @the-abyss/document-ingestion test
pnpm turbo run build --filter=@the-abyss/document-ingestion
pnpm turbo run test --filter=@the-abyss/document-ingestion
```

### Actual Result (2026-04-27 03:34 GMT+7 — Post-Implementation Verification)

#### pnpm --filter @the-abyss/document-ingestion build
```
PASS
tsup v8.5.1
ESM dist/index.js 12.32 KB · Build success in 24ms
DTS dist/index.d.ts 5.08 KB · Build success in 820ms
Exit code: 0
```

#### pnpm --filter @the-abyss/document-ingestion test
```
PASS
vitest v4.1.5
Test Files  5 passed (5)
     Tests  31 passed (31)
  Start at  03:34:30
  Duration  245ms

  ✓ tests/source-hash.test.ts        (4 tests)
  ✓ tests/pdf-preflight.test.ts      (6 tests)
  ✓ tests/ocr-quality-report.test.ts (7 tests)
  ✓ tests/markdown-renderer.test.ts  (8 tests)
  ✓ tests/chunker-adapter.test.ts    (6 tests)

Exit code: 0
```

#### pnpm turbo run build --filter=@the-abyss/document-ingestion
```
BLOCKED — pre-existing IO error (os error 1920) in
apps/prototype/agent-hermes/.pnpm-store/v10/projects/<hash>
Not related to @the-abyss/document-ingestion. Turbo cannot traverse the workspace
tree due to inaccessible file in vendor store. Direct pnpm commands unaffected.
Exit code: 1 (pre-existing infra issue, not package regression)
```

#### pnpm turbo run test --filter=@the-abyss/document-ingestion
```
BLOCKED — same pre-existing IO error as above.
Exit code: 1 (pre-existing infra issue, not package regression)
```

#### Static Checks
```
@llamaindex/liteparse isolated to:  liteparse.provider.ts ONLY ✓
Google Document AI:                 0 references ✓
PaddleOCR:                          0 references ✓
SATUSEHAT:                          0 references ✓
Embedding generation:               0 references ✓
Vector DB write:                    0 references ✓
CanonicalDocument type:             types.ts ✓
renderMarkdown():                   normalization/markdown-renderer.ts ✓
createOcrQualityReport():           quality/ocr-quality-report.ts ✓
createSourceHash():                 hashing/source-hash.ts ✓
ChunkerInput.metadata fields:       source_hash, page_number, parser_provider,
                                    ocr_confidence, document_version ✓
toChunkerInput():                   chunking/chunker-adapter.ts ✓
toChunkerInput() vector writes:     0 references ✓
```

---

## 15. Commit Convention

Use:

```txt
[ABYSS-RAG-001] [RAG] Implement local-first PDF OCR ingestion layer

Agent: Codex
Phase: RAGOps
Handoff: docs/tasks/ABYSS-RAG-001_handoff.md
```

---

## 16. Chief Approval

**Status:** PENDING

> Approval String:
>
> `✅ GO ABYSS-RAG-001`

