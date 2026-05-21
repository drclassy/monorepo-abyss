# @the-abyss/document-ingestion

Local-first PDF OCR ingestion layer for The Abyss knowledge base.

Converts raw PDF documents into structured, traceable, RAG-ready artifacts:

- Canonical JSON (with page-level metadata)
- Markdown (with frontmatter + page boundary markers)
- OCR quality report (blocks corrupted content from reaching the RAG pipeline)
- Chunker-ready output (metadata-annotated, deduplication-safe)

## Architecture

```
Raw PDF
  ↓
Document Fingerprint (SHA-256 source hash)
  ↓
PDF Preflight Detector
  ├─ Digital PDF → LiteParse text/spatial parser
  └─ Scanned PDF → LiteParse OCR mode
  ↓
Canonical Document Normalizer
  ↓
OCR Quality Report
  ├─ ready       → chunker input
  ├─ needs_review → chunker input with warning metadata
  └─ failed      → blocked from chunker
  ↓
Markdown + JSON Artifacts
  ↓
Existing RAG chunker integration point
```

## Usage

```typescript
import { ingestDocument } from '@the-abyss/document-ingestion'

const { canonical, markdown, chunks } = await ingestDocument({
  filePath: './library/medical/int/hipertensi-2024.pdf',
  documentTitle: 'PNPK Hipertensi 2024',
})

console.log(canonical.qualityReport.status) // 'ready' | 'needs_review' | 'failed'
console.log(chunks.length) // page count
```

## Scope Boundaries

This package:

- **Only** prepares parsed output for the existing chunker or ingestion pipeline
- Does **not** generate embeddings
- Does **not** write to any vector database
- Does **not** call external OCR services (Google Document AI, PaddleOCR,
  SATUSEHAT)
- Does **not** contain clinical diagnosis logic

## Commands

```bash
pnpm --filter @the-abyss/document-ingestion build
pnpm --filter @the-abyss/document-ingestion test
pnpm --filter @the-abyss/document-ingestion typecheck
```

## Security

- Never log raw document text
- Never log PHI
- Only log: source hash, page count, parser provider, ingestion status, quality
  warnings
- Any cloud OCR fallback requires a separate task and separate GO-Gate approval
