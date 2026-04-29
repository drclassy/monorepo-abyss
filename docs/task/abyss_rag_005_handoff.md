# ABYSS-RAG-005 — Retrieval Validation & Evidence Quality Evaluation Pipeline

**Status:** ✅ IMPLEMENTED / VERIFIED — 2026-04-27

**Task:** Implement Retrieval Validation and Evidence Quality Evaluation Pipeline

---

## 1. Strategic Context

ABYSS-RAG-005 adalah tahap validasi akhir sebelum knowledge base siap diintegrasikan ke AADI.

| Phase | Status | Function |
|---|---:|---|
| ABYSS-RAG-001 | DONE | Local-first PDF OCR ingestion layer |
| ABYSS-RAG-002 | DONE | Dry-run artifact pipeline |
| ABYSS-RAG-003 | DONE | Knowledge registry and lifecycle approval |
| ABYSS-RAG-004 | DONE | Approved embedding and vector store write |
| ABYSS-RAG-005 | Current target | Retrieval validation and evidence quality |

Core principle:

```txt
Only safe, traceable, approved evidence reaches AADI.
```

---

## 2. Objective

Implement a retrieval evaluation pipeline in `packages/sentra-rag` that:

1. Loads a query set from `data/eval/retrieval-queries.json`.
2. Queries vector store through `packages/vector-store` only.
3. Validates every retrieved chunk for traceability (source_hash, document_version, page_number, vector_id).
4. Cross-checks every result against `registry.json` for current approval status.
5. Flags or excludes non-approved evidence.
6. Generates an AADI readiness verdict.
7. Emits auditable evaluation artifacts.

---

## 3. Non-Negotiable Safety Gates

### 3.1 Traceability Gate
Every retrieved chunk MUST have:
- `source_hash`
- `document_version`
- `page_number`
- `vector_id`

Chunks missing any field are flagged as `untraceable`.

### 3.2 Approval Gate
Every retrieved chunk MUST have current `registry_status === 'approved_for_embedding'` in the live registry.

Sources with `needs_review`, `failed`, `superseded`, `archived`, or `ready_for_review` are flagged.

No auto-approval. No AADI integration in this task.

---

## 4. Input Structure

```txt
data/
├── knowledge-registry/
│   └── registry.json
├── embedding-artifacts/
│   └── latest-run.json
└── eval/
    └── retrieval-queries.json
```

### Query file schema (`retrieval-queries.json`)

```json
[
  {
    "query_id": "q001",
    "query_text": "What is the first-line treatment for community-acquired pneumonia?",
    "top_k": 5,
    "min_similarity": 0.5,
    "expected_topics": ["pneumonia", "antibiotic"]
  }
]
```

Required fields: `query_id`, `query_text`
Optional: `top_k` (default 5), `min_similarity` (default 0.5), `expected_topics`

---

## 5. Output Structure

```txt
data/retrieval-evaluation/
├── runs/
│   └── <retrieval_eval_run_id>/
│       ├── retrieval-eval-summary.json
│       ├── query-results.jsonl
│       ├── evidence-quality-report.json
│       ├── failed-queries.json
│       └── recommendations.json
└── latest-run.json
```

---

## 6. Command Contract

### Dry-run (default)

```bash
pnpm sentra-rag eval:retrieval \
  --registry ./data/knowledge-registry \
  --embedding-artifacts ./data/embedding-artifacts \
  --queries ./data/eval/retrieval-queries.json \
  --output ./data/retrieval-evaluation \
  --dry-run
```

Validates registry, queries file, and embedding artifacts. Zero vector store queries.

### Full evaluation

```bash
pnpm sentra-rag eval:retrieval \
  --registry ./data/knowledge-registry \
  --embedding-artifacts ./data/embedding-artifacts \
  --queries ./data/eval/retrieval-queries.json \
  --output ./data/retrieval-evaluation
```

Default mode runs full evaluation. Requires `DATABASE_URL` + GCP credentials.

---

## 7. AADI Readiness Verdict

| Verdict | Criteria |
|---|---|
| `ready` | ≥80% queries have ≥1 approved result with similarity ≥ threshold |
| `needs_review` | 50-79% queries pass, or avg similarity borderline |
| `not_ready` | <50% queries pass, or unapproved evidence present |

---

## 8. Output Artifact Specifications

### 8.1 `retrieval-eval-summary.json`
```json
{
  "retrieval_eval_run_id": "eval_20260427_001",
  "started_at": "...",
  "completed_at": "...",
  "total_queries": 10,
  "passed_queries": 9,
  "failed_queries": 1,
  "avg_similarity": 0.87,
  "aadi_readiness": "ready",
  "write_mode": "eval",
  "status": "completed"
}
```

### 8.2 `query-results.jsonl`
One line per query. Contains top-k result metadata. No full chunk text.

### 8.3 `evidence-quality-report.json`
Aggregate quality metrics across all queries.

### 8.4 `failed-queries.json`
Queries that errored out. Sanitized messages only.

### 8.5 `recommendations.json`
Actionable list: INFO, WARNING, or ACTION items.

---

## 9. Implementation Scope

Allowed:
```txt
- Load queries from JSON.
- Query vector store through packages/vector-store only.
- Validate retrieved evidence traceability.
- Cross-check against registry.json.
- Flag non-approved sources.
- Generate AADI readiness verdict.
- Generate all evaluation artifacts.
- Add traceability + approval gate tests.
```

Not allowed:
```txt
- No AADI integration.
- No clinical answer generation.
- No diagnosis generation.
- No new embeddings.
- No vector writes.
- No registry auto-approval.
- No SATUSEHAT.
- No cloud OCR.
- No Google Document AI.
- No PaddleOCR.
- No full chunk/document text in logs.
```

---

## 10. Hard Prohibitions

Same as RAG-001 through RAG-004. Plus:
- No AADI call of any kind.
- No clinical recommendation output.

---

## 11. Acceptance Criteria

| Check | Expected |
|---|---|
| `eval:retrieval` command exists | PASS |
| Default mode runs full eval (not dry-run) | PASS |
| `--dry-run` runs zero vector store queries | PASS |
| Vector search uses `packages/vector-store` only | PASS |
| Evidence includes source_hash, document_version, page_number, vector_id | PASS |
| Non-approved sources flagged | PASS |
| AADI readiness verdict generated | PASS |
| All 5 artifact files generated | PASS |
| Failed queries recorded without stopping batch | PASS |
| No AADI dependency | PASS |
| No clinical answer generation | PASS |
| No full text in logs | PASS |

---

## 12. Proof of Verification

Implementation completed: 2026-04-27 19:46 GMT+7

```txt
Command: pnpm --filter @the-abyss/sentra-rag typecheck
Result: PASS — 0 TypeScript errors

Command: pnpm --filter @the-abyss/sentra-rag test
Result: PASS — 97/97 tests across 15 test files
  ✓ tests/evidence-validator.test.ts (8 tests)
  ✓ tests/quality-scorer.test.ts (6 tests)
  ✓ tests/eval-pipeline.test.ts (6 tests)
  ✓ tests/approved-embedding.pipeline.test.ts (7 tests)
  ✓ tests/registry-gate.test.ts (6 tests)
  ... + 10 prior test files

Command: pnpm sentra-rag eval:retrieval --create-sample-queries
Result: PASS — sample queries created at data/eval/retrieval-queries.json

Command: pnpm sentra-rag eval:retrieval --dry-run
Result: PASS
  Mode       : dry_run
  Total queries: 3
  Failed queries: 0
  Status     : completed
  AADI readiness: not_ready (expected — no data in vector store yet)
  Artifacts generated at: data/retrieval-evaluation/runs/eval_20260427_124603

Command: pnpm sentra-rag eval:retrieval (full eval without DB)
Result: expected to fail with "DATABASE_URL must be set" — correct behavior

Forbidden dependency check:
Result: PASS — No SATUSEHAT, Google Document AI, PaddleOCR, cloud OCR, AADI
  integration, or clinical answer generation found in evaluation modules
```
