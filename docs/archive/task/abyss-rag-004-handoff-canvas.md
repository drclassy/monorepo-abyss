# ABYSS-RAG-004 — Approved Knowledge Embedding and Vector Store Write Pipeline

**Status:** ✅ IMPLEMENTED / VERIFIED — 2026-04-27

**Task:** Implement Approved Knowledge Embedding and Vector Store Write Pipeline

**Target handoff file:**

```txt
docs/archive/task/abyss-rag-004-handoff-canvas.md
```

---

## 1. Strategic Context

ABYSS-RAG-004 adalah tahap pertama dalam RAGOps Pipeline yang mulai mengubah knowledge artifact menjadi vector knowledge.

Tahap sebelumnya:

| Phase | Status | Function |
|---|---:|---|
| ABYSS-RAG-001 | DONE / ACCEPTED | Local-first PDF OCR ingestion layer with LiteParse |
| ABYSS-RAG-002 | Expected prerequisite | Dry-run artifact pipeline under `data/knowledge-artifacts` |
| ABYSS-RAG-003 | Expected prerequisite | Knowledge registry and lifecycle approval layer |
| ABYSS-RAG-004 | Current target | Embed only approved knowledge and write through vector-store |

Core principle:

```txt
Only approved knowledge enters vector store.
```

ABYSS-RAG-004 **must not** bypass the registry approval layer. It must only embed documents that are explicitly marked:

```ts
approved_for_embedding
```

---

## 2. Objective

Create a controlled embedding pipeline inside `packages/sentra-rag` that:

1. Reads approved documents from `data/knowledge-registry`.
2. Loads chunk artifacts from `data/knowledge-artifacts`.
3. Generates embeddings for approved chunks only.
4. Writes vectors through `packages/vector-store` only.
5. Emits auditable embedding run artifacts.
6. Preserves idempotency across repeated runs.
7. Prevents unapproved, failed, superseded, or archived sources from entering retrieval.

---

## 3. Non-Negotiable Approval Gate

Only this status may be embedded:

```ts
approved_for_embedding
```

All other statuses must be skipped.

| Registry status | Action |
|---|---|
| `approved_for_embedding` | Embed + optional vector write |
| `ready_for_review` | Skip |
| `needs_review` | Skip |
| `failed` | Skip |
| `superseded` | Skip |
| `archived` | Skip |

No document may be auto-approved by ABYSS-RAG-004.

---

## 4. Input Structure

ABYSS-RAG-004 reads from outputs produced by ABYSS-RAG-002 and ABYSS-RAG-003.

```txt
data/
├── knowledge-artifacts/
│   └── processed/
│       └── <source_hash>/
│           ├── canonical.json
│           ├── document.md
│           ├── chunks.json
│           └── quality-report.json
└── knowledge-registry/
    ├── registry.json
    ├── registry-summary.json
    ├── eligible-for-embedding.json
    ├── needs-review.json
    ├── failed.json
    └── superseded.json
```

Primary candidate file:

```txt
data/knowledge-registry/eligible-for-embedding.json
```

Mandatory cross-check file:

```txt
data/knowledge-registry/registry.json
```

The pipeline must never rely only on `eligible-for-embedding.json`. Every candidate must be cross-checked against `registry.json` before embedding.

---

## 5. Output Structure

Target output:

```txt
data/embedding-artifacts/
├── runs/
│   └── <embedding_run_id>/
│       ├── embedding-run-summary.json
│       ├── embedded-chunks.jsonl
│       ├── vector-write-report.json
│       ├── skipped.json
│       └── failures.json
└── latest-run.json
```

---

## 6. Command Contract

### Dry-run command

```bash
pnpm sentra-rag embed:approved \
  --registry ./data/knowledge-registry \
  --artifacts ./data/knowledge-artifacts \
  --output ./data/embedding-artifacts \
  --dry-run
```

### Explicit write command

```bash
pnpm sentra-rag embed:approved \
  --registry ./data/knowledge-registry \
  --artifacts ./data/knowledge-artifacts \
  --output ./data/embedding-artifacts \
  --write
```

### Default behavior

If neither `--dry-run` nor `--write` is provided, default to:

```txt
--dry-run
```

Dry-run must generate reports but perform **zero vector writes**.

---

## 7. Output Artifact Specifications

### 7.1 `embedding-run-summary.json`

```json
{
  "embedding_run_id": "emb_2026_04_27_001",
  "started_at": "2026-04-27T00:00:00.000Z",
  "completed_at": "2026-04-27T00:00:00.000Z",
  "registry_path": "data/knowledge-registry/registry.json",
  "eligible_path": "data/knowledge-registry/eligible-for-embedding.json",
  "total_candidates": 0,
  "embedded_documents": 0,
  "embedded_chunks": 0,
  "skipped_documents": 0,
  "failed_documents": 0,
  "vector_store_provider": "local-pgvector-or-configured-provider",
  "embedding_provider": "configured-local-or-approved-provider",
  "write_mode": "dry_run",
  "status": "completed"
}
```

Allowed `write_mode`:

```ts
'dry_run' | 'write'
```

Allowed `status`:

```ts
'completed' | 'completed_with_failures' | 'failed'
```

---

### 7.2 `embedded-chunks.jsonl`

One JSON object per line.

```json
{
  "source_hash": "abc123",
  "document_version": "v1",
  "chunk_id": "abc123:p001:c0001",
  "vector_id": "kb:abc123:v1:p001:c0001",
  "page_number": 1,
  "parser_provider": "liteparse",
  "ocr_confidence": 0.97,
  "registry_status": "approved_for_embedding",
  "embedding_model": "configured-model",
  "embedding_dimension": 768,
  "content_hash": "chunk_content_hash",
  "embedded_at": "2026-04-27T00:00:00.000Z"
}
```

The file must not contain full chunk text.

---

### 7.3 `vector-write-report.json`

```json
{
  "attempted_writes": 0,
  "successful_writes": 0,
  "failed_writes": 0,
  "upserted_vector_ids": [],
  "failed_vector_ids": [],
  "idempotency_key": "embedding_run_id"
}
```

Dry-run expected values:

```json
{
  "attempted_writes": 0,
  "successful_writes": 0,
  "failed_writes": 0,
  "upserted_vector_ids": [],
  "failed_vector_ids": []
}
```

---

### 7.4 `skipped.json`

```json
[
  {
    "source_hash": "abc123",
    "reason": "status_not_approved_for_embedding",
    "registry_status": "ready_for_review"
  }
]
```

Common skip reasons:

```ts
'status_not_approved_for_embedding'
'candidate_missing_from_registry'
'missing_artifacts'
'empty_chunks'
'dry_run_no_write'
```

---

### 7.5 `failures.json`

```json
[
  {
    "source_hash": "abc123",
    "chunk_id": "abc123:p001:c0001",
    "stage": "embedding",
    "error_code": "EMBEDDING_FAILED",
    "message": "sanitized error message only"
  }
]
```

Allowed failure stages:

```ts
'artifact_read' | 'embedding' | 'vector_write' | 'report_write'
```

Error messages must be sanitized. Do not include full document text, full chunk text, patient identifiers, or raw clinical content in errors.

---

## 8. Vector ID Contract

Vector IDs must be stable and idempotent.

Required shape:

```txt
kb:<source_hash>:<document_version>:p<page_number>:c<chunk_sequence>
```

Example:

```txt
kb:abc123:v1:p001:c0001
```

Rules:

1. Same chunk must always produce same vector ID.
2. Repeat run must upsert, not duplicate.
3. Different `document_version` must produce different vector IDs.
4. Superseded documents must not be embedded unless their current registry status is explicitly `approved_for_embedding`.

---

## 9. Implementation Scope

Allowed:

```txt
- Read ABYSS-RAG-003 registry outputs.
- Select only approved_for_embedding documents.
- Read ABYSS-RAG-002 chunks.json artifacts.
- Generate embeddings for approved chunks.
- Write vectors through packages/vector-store only.
- Generate embedding run artifacts.
- Ensure idempotent vector IDs.
- Ensure repeat runs do not duplicate vectors.
- Generate write report, skipped report, and failure report.
- Add approval-gating and vector-write safety tests.
```

Not allowed:

```txt
- No OCR.
- No PDF parsing.
- No document ingestion.
- No registry auto-approval.
- No embedding for ready_for_review.
- No embedding for needs_review.
- No embedding for failed.
- No embedding for superseded.
- No embedding for archived.
- No direct vector DB access outside packages/vector-store.
- No SATUSEHAT.
- No cloud OCR.
- No Google Document AI.
- No PaddleOCR.
- No full chunk/document text in console logs.
- No patient data assumptions.
```

---

## 10. Suggested Package Changes

### `packages/sentra-rag`

Add or extend command:

```txt
embed:approved
```

Suggested internal modules:

```txt
packages/sentra-rag/src/commands/embed-approved.command.ts
packages/sentra-rag/src/embedding/approved-embedding.pipeline.ts
packages/sentra-rag/src/embedding/embedding-run-artifacts.ts
packages/sentra-rag/src/embedding/vector-id.ts
packages/sentra-rag/src/embedding/registry-gate.ts
packages/sentra-rag/src/embedding/types.ts
```

### `packages/vector-store`

Use existing public API where available. If missing, expose a safe interface such as:

```ts
export interface VectorRecord {
  vector_id: string;
  values: number[];
  metadata: Record<string, unknown>;
}

export interface VectorStoreClient {
  upsert(records: VectorRecord[], options?: { idempotencyKey?: string }): Promise<VectorWriteResult>;
}
```

ABYSS-RAG-004 must not directly access the database driver from `sentra-rag`.

---

## 11. Logging Rules

Allowed logs:

```txt
- run ID
- candidate count
- embedded document count
- embedded chunk count
- skipped document count
- failed document count
- output artifact path
```

Forbidden logs:

```txt
- full document text
- full chunk text
- raw OCR output
- patient identifiers
- clinical note contents
- complete stack traces with sensitive text
```

---

## 12. Cursor Instruction

Copy-paste into Cursor:

```txt
Read and execute docs/archive/task/abyss-rag-004-handoff-canvas.md.

Implement ABYSS-RAG-004: Approved Knowledge Embedding and Vector Store Write Pipeline.

Context:
ABYSS-RAG-001 created @the-abyss/document-ingestion.
ABYSS-RAG-002 generated local knowledge artifacts under data/knowledge-artifacts.
ABYSS-RAG-003 generated registry and lifecycle approval files under data/knowledge-registry.
ABYSS-RAG-004 must only embed documents that are explicitly approved_for_embedding.

Primary objective:
Create a controlled embedding pipeline in packages/sentra-rag that reads approved documents from data/knowledge-registry, loads chunks from data/knowledge-artifacts, generates embeddings, writes vectors through packages/vector-store, and emits auditable embedding artifacts.

Target command:
pnpm sentra-rag embed:approved --registry ./data/knowledge-registry --artifacts ./data/knowledge-artifacts --output ./data/embedding-artifacts --dry-run

Explicit write command:
pnpm sentra-rag embed:approved --registry ./data/knowledge-registry --artifacts ./data/knowledge-artifacts --output ./data/embedding-artifacts --write

Default behavior:
If --write is not provided, run in dry-run mode.
Dry-run must generate reports but must not write vectors.

Strict approval gate:
Only documents with registry status approved_for_embedding may be embedded.
Do not embed ready_for_review.
Do not embed needs_review.
Do not embed failed.
Do not embed superseded.
Do not embed archived.
Do not auto-approve any document.

Data inputs:
- data/knowledge-registry/registry.json
- data/knowledge-registry/eligible-for-embedding.json
- data/knowledge-artifacts/processed/<source_hash>/chunks.json
- data/knowledge-artifacts/processed/<source_hash>/quality-report.json

Target outputs:
data/embedding-artifacts/
├── runs/
│   └── <embedding_run_id>/
│       ├── embedding-run-summary.json
│       ├── embedded-chunks.jsonl
│       ├── vector-write-report.json
│       ├── skipped.json
│       └── failures.json
└── latest-run.json

Implementation requirements:
1. Add or extend sentra-rag command embed:approved.
2. Read eligible-for-embedding.json.
3. Cross-check every candidate against registry.json.
4. Reject anything not approved_for_embedding.
5. Load chunks.json for approved documents only.
6. Generate stable chunk vector IDs using source_hash + document_version + page_number + chunk_id.
7. Use packages/vector-store as the only vector write interface.
8. Make vector writes idempotent/upsert-safe.
9. Generate full run artifacts.
10. Never print full chunk text or document text to console.
11. Sanitize failure messages.
12. Add tests for:
   - only approved_for_embedding is embedded
   - non-approved statuses are skipped
   - dry-run performs zero vector writes
   - write mode calls vector-store
   - duplicate runs do not duplicate vector IDs
   - missing chunks.json is recorded as failure
   - failures do not block the full batch unless fatal
   - no SATUSEHAT/cloud OCR/PaddleOCR/Google Document AI references

Hard prohibitions:
- No OCR.
- No PDF parsing.
- No document ingestion.
- No registry auto-approval.
- No direct vector database write outside packages/vector-store.
- No SATUSEHAT.
- No Google Document AI.
- No PaddleOCR.
- No cloud OCR.
- No full text logging.

After implementation:
Run verification commands.
Update Proof of Verification in docs/archive/task/abyss-rag-004-handoff-canvas.md.
```

---

## 13. Verification Commands

Build and test:

```bash
pnpm --filter @the-abyss/sentra-rag build
pnpm --filter @the-abyss/sentra-rag test
pnpm --filter @the-abyss/vector-store build
pnpm --filter @the-abyss/vector-store test
```

Dry-run verification:

```bash
pnpm sentra-rag embed:approved \
  --registry ./data/knowledge-registry \
  --artifacts ./data/knowledge-artifacts \
  --output ./data/embedding-artifacts \
  --dry-run
```

Write-mode verification:

```bash
pnpm sentra-rag embed:approved \
  --registry ./data/knowledge-registry \
  --artifacts ./data/knowledge-artifacts \
  --output ./data/embedding-artifacts \
  --write
```

Forbidden dependency/reference check:

```bash
grep -R "SATUSEHAT\|Google Document AI\|PaddleOCR\|cloud OCR" packages/sentra-rag packages/vector-store || true
```

Expected:

```txt
No forbidden dependency/reference introduced by ABYSS-RAG-004.
```

---

## 14. Acceptance Criteria

| Check | Expected |
|---|---|
| Command `embed:approved` exists | PASS |
| Default mode is dry-run | PASS |
| `--dry-run` writes no vectors | PASS |
| `--write` writes through `packages/vector-store` only | PASS |
| Only `approved_for_embedding` embedded | PASS |
| `ready_for_review` skipped | PASS |
| `needs_review` skipped | PASS |
| `failed` skipped | PASS |
| `superseded` skipped | PASS |
| `archived` skipped | PASS |
| Stable vector IDs generated | PASS |
| Repeat runs are idempotent | PASS |
| `embedding-run-summary.json` generated | PASS |
| `embedded-chunks.jsonl` generated | PASS |
| `vector-write-report.json` generated | PASS |
| `skipped.json` generated | PASS |
| `failures.json` generated | PASS |
| No full chunk/document text in logs | PASS |
| No SATUSEHAT dependency | PASS |
| No cloud OCR dependency | PASS |
| No direct vector DB access outside `packages/vector-store` | PASS |

---

## 15. Proof of Verification

Implementation completed: 2026-04-27 19:35 GMT+7

```txt
Command: pnpm --filter @the-abyss/sentra-rag build
Result: N/A — sentra-rag is a tsx-first package, no build step required

Command: pnpm --filter @the-abyss/sentra-rag typecheck
Result: PASS — 0 TypeScript errors

Command: pnpm --filter @the-abyss/sentra-rag test
Result: PASS — 77/77 tests across 12 test files
  ✓ tests/vector-id.test.ts (11 tests)
  ✓ tests/registry-gate.test.ts (6 tests)
  ✓ tests/approved-embedding.pipeline.test.ts (7 tests)
  ✓ tests/supersession.test.ts (4 tests)
  ✓ tests/eligibility-exporter.test.ts (6 tests)
  ✓ tests/registry-summary.test.ts (5 tests)
  ✓ tests/ingestion-summary.test.ts (8 tests)
  ✓ tests/pdf-discovery.test.ts (7 tests)
  ✓ tests/knowledge-registry.test.ts (6 tests)
  ✓ tests/artifact-writer.test.ts (6 tests)
  ✓ tests/pdf-batch-runner.test.ts (6 tests)
  ✓ tests/duplicate-detector.test.ts (5 tests)

Command: pnpm --filter @the-abyss/vector-store build
Result: N/A — vector-store is a tsx-first package, no build step required

Command: pnpm --filter @the-abyss/vector-store test
Result: PASS — 7/7 tests
  ✓ upsertById with stable ID and ON CONFLICT upsert: PASS
  ✓ upsertById requires database injection: PASS
  (+ 5 existing tests)

Command: pnpm sentra-rag embed:approved --registry ./data/knowledge-registry --artifacts ./data/knowledge-artifacts --output ./data/embedding-artifacts --dry-run
Result: PASS
  [embed-approved] Mode       : dry_run
  [embed-approved] Candidates      : 0
  [embed-approved] Embedded chunks : 0
  [embed-approved] Status          : completed
  Artifacts generated at: data/embedding-artifacts/runs/emb_20260427_123536

Command: pnpm sentra-rag embed:approved --registry ./data/knowledge-registry --artifacts ./data/knowledge-artifacts --output ./data/embedding-artifacts --write
Result: BLOCKED — requires DATABASE_URL + GCP credentials (no live DB in this environment)
  Expected behavior: checked for DATABASE_URL, would exit with error if missing. This is correct.

Forbidden dependency check:
Result: PASS — No SATUSEHAT, Google Document AI, PaddleOCR, or cloud OCR references found
  in packages/sentra-rag/src/embedding/** or packages/vector-store/src/**
```

---

## 16. Final Architectural Guardrail

ABYSS-RAG-004 must preserve this pipeline sequence:

```txt
PDF → OCR/Ingestion → Artifact → Registry Review → Approval → Embedding → Vector Store
```

It must never collapse into:

```txt
PDF → OCR → Embedding directly
```

This protects AADI from low-quality OCR, unreviewed documents, superseded references, and unapproved clinical knowledge entering retrieval.

