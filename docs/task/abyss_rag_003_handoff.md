---

task\_id: ABYSS-RAG-003 title: "Implement Knowledge Source Registry and Versioning Layer" owner: "@chief" domain: healthcare priority: high created\_at: 2026-04-27T00:00:00Z status: pending\_approval approved\_by: null approved\_at: null depends\_on:

- ABYSS-RAG-001
- ABYSS-RAG-002

---

# ABYSS-RAG-003 — Implement Knowledge Source Registry and Versioning Layer

## 1. Task Description

Implement a local-first Knowledge Source Registry for Sentra RAG.

This task creates a registry layer that records every processed knowledge document from the ABYSS-RAG-002 dry-run pipeline, tracks document versions, prevents accidental duplication, and marks whether a document is eligible for future embedding.

This task must not generate embeddings and must not write to the vector database.

The registry is the control layer between dry-run artifacts and future production knowledge ingestion.

---

## 2. Business Value

ABYSS-RAG-001 created the parser.

ABYSS-RAG-002 created the dry-run artifact workflow.

ABYSS-RAG-003 creates the institutional memory of the knowledge pipeline.

Without a registry, Sentra risks:

- embedding duplicate documents,
- embedding outdated clinical guidelines,
- losing document provenance,
- mixing draft and approved references,
- failing to audit which sources entered AADI’s knowledge base,
- and retrieving obsolete knowledge later.

This task ensures every document has a clear lifecycle before it is allowed into the vector store.

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
- Production deployment.
- Automatic clinical guideline interpretation.

This task only creates registry and versioning control for processed knowledge artifacts.

---

## 4. Intended Workflow

```txt
ABYSS-RAG-002 Artifacts
  ↓
Read ingestion-summary.json
  ↓
Read processed/<source_hash>/canonical.json
  ↓
Create or update Knowledge Source Registry
  ↓
Assign document lifecycle status
  ↓
Detect duplicate / superseded / failed / needs_review documents
  ↓
Generate registry.json + registry-summary.json
  ↓
Prepare eligibility list for future embedding task
```

---

## 5. Target User Command

Preferred command:

```bash
pnpm sentra-rag registry:update --artifacts ./data/knowledge-artifacts --registry ./data/knowledge-registry
```

Optional command:

```bash
pnpm sentra-rag registry:list --registry ./data/knowledge-registry
```

If `sentra-rag` already has a different CLI pattern, adapt to the existing package convention instead of forcing this exact command.

---

## 6. Expected Output Structure

Input from ABYSS-RAG-002:

```txt
data/knowledge-artifacts/
├── processed/
│   └── <source_hash>/
│       ├── canonical.json
│       ├── document.md
│       ├── chunks.json
│       └── quality-report.json
└── ingestion-summary.json
```

Output from ABYSS-RAG-003:

```txt
data/knowledge-registry/
├── registry.json
├── registry-summary.json
├── eligible-for-embedding.json
├── needs-review.json
├── failed.json
└── superseded.json
```

Rules:

- `registry.json` is the source-of-truth registry file.
- `eligible-for-embedding.json` includes only documents that are safe for the future embedding task.
- `needs-review.json` includes documents that require human review before embedding.
- `failed.json` includes failed or unusable documents.
- `superseded.json` includes older document versions replaced by newer approved versions.

---

## 7. Document Lifecycle Status

Every registered document must have one lifecycle status:

```ts
export type KnowledgeSourceStatus =
  | 'ready_for_review'
  | 'approved_for_embedding'
  | 'needs_review'
  | 'failed'
  | 'superseded'
  | 'archived';
```

Default mapping from ABYSS-RAG-002 quality report:

| Quality Report Status | Registry Status    |
| --------------------- | ------------------ |
| `ready`               | `ready_for_review` |
| `needs_review`        | `needs_review`     |
| `failed`              | `failed`           |

Important rule:

```txt
No document may enter `approved_for_embedding` automatically unless explicit approval metadata exists.
```

For v1, approval may be represented by an optional local approval file or registry field update.

---

## 8. Acceptance Criteria

### 8.1 Registry Update Command

-

### 8.2 Registry Entry Model

Each registry entry must include:

-

### 8.3 Deduplication

-

### 8.4 Versioning

-

### 8.5 Embedding Eligibility Export

-

### 8.6 Review Exports

-

### 8.7 Safety / Governance

-

### 8.8 Tests

-

---

## 9. Recommended Implementation Location

Implement inside the existing active RAG package:

```txt
packages/sentra-rag/
```

Suggested structure:

```txt
packages/sentra-rag/
├── src/
│   ├── cli/
│   │   ├── ingest-pdf.ts
│   │   └── registry-update.ts
│   ├── registry/
│   │   ├── knowledge-registry.ts
│   │   ├── registry-types.ts
│   │   ├── registry-reader.ts
│   │   ├── registry-writer.ts
│   │   ├── registry-summary.ts
│   │   ├── eligibility-exporter.ts
│   │   └── supersession.ts
│   └── index.ts
└── tests/
    ├── knowledge-registry.test.ts
    ├── eligibility-exporter.test.ts
    ├── supersession.test.ts
    └── registry-summary.test.ts
```

Do not create a second competing RAG package.

---

## 10. Required Types

Create or adapt internal types as needed:

```ts
export type KnowledgeSourceStatus =
  | 'ready_for_review'
  | 'approved_for_embedding'
  | 'needs_review'
  | 'failed'
  | 'superseded'
  | 'archived';

export interface KnowledgeSourceRegistryEntry {
  source_hash: string;
  document_id: string;
  document_title?: string;
  document_version: string;
  document_type?: string;
  parser_provider: string;
  page_count: number;
  chunk_count: number;
  quality_status: 'ready' | 'needs_review' | 'failed';
  registry_status: KnowledgeSourceStatus;
  created_at: string;
  registered_at: string;
  artifact_paths: {
    canonical_path?: string;
    markdown_path?: string;
    chunks_path?: string;
    quality_report_path?: string;
  };
  warnings: string[];
  supersedes?: string[];
  superseded_by?: string;
}

export interface KnowledgeRegistry {
  schema_version: '1.0.0';
  updated_at: string;
  entries: KnowledgeSourceRegistryEntry[];
}

export interface RegistrySummary {
  run_id: string;
  started_at: string;
  completed_at: string;
  total_entries: number;
  ready_for_review_count: number;
  approved_for_embedding_count: number;
  needs_review_count: number;
  failed_count: number;
  superseded_count: number;
  archived_count: number;
}
```

---

## 11. Core Implementation Details

### 11.1 Registry Reader

Create a function similar to:

```ts
export async function readKnowledgeRegistry(registryDir: string): Promise<KnowledgeRegistry>;
```

Rules:

- If `registry.json` does not exist, return an empty registry.
- Validate schema minimally.
- Never crash on empty registry folder.

---

### 11.2 Registry Writer

Create a function similar to:

```ts
export async function writeKnowledgeRegistry(params: {
  registryDir: string;
  registry: KnowledgeRegistry;
}): Promise<string>;
```

Rules:

- Write JSON with 2-space indentation.
- Use UTF-8 encoding.
- Create registry folder if missing.
- Preserve stable sorted entries by `source_hash`.

---

### 11.3 Registry Update Runner

Create a function similar to:

```ts
export async function updateKnowledgeRegistry(params: {
  artifactsDir: string;
  registryDir: string;
  force?: boolean;
}): Promise<RegistrySummary>;
```

Behavior:

1. Read `ingestion-summary.json` from artifacts folder.
2. Read existing `registry.json` if present.
3. For each processed document:
   - read `canonical.json`, `chunks.json`, and `quality-report.json` where available,
   - create or update registry entry,
   - map quality status to default registry status.
4. Preserve explicit `approved_for_embedding` status if document is unchanged.
5. Do not auto-approve new documents.
6. Write updated `registry.json`.
7. Write `registry-summary.json`.
8. Write review/export files.

---

### 11.4 Eligibility Exporter

Create a function similar to:

```ts
export function createEligibleForEmbeddingExport(registry: KnowledgeRegistry): KnowledgeSourceRegistryEntry[];
```

Rules:

- Include only `approved_for_embedding`.
- Exclude `superseded` and `archived`.
- Exclude entries without `chunks_path`.
- Exclude entries with quality status `failed`.

---

### 11.5 Supersession Logic

Create a utility similar to:

```ts
export function markSuperseded(params: {
  registry: KnowledgeRegistry;
  oldSourceHash: string;
  newSourceHash: string;
}): KnowledgeRegistry;
```

Rules:

- Old document becomes `superseded`.
- Old document gets `superseded_by` set to new source hash.
- New document gets `supersedes` containing old source hash.
- Superseded document is excluded from eligibility export.

Manual supersession may be implemented as an internal function only in v1. CLI exposure is optional.

---

## 12. Testing Plan

### Unit Tests

Create tests for:

1. Registry reader

   - returns empty registry when file does not exist.
   - reads existing registry.

2. Registry writer

   - writes `registry.json`.
   - sorts entries deterministically.

3. Registry update

   - creates entries from ABYSS-RAG-002 artifacts.
   - is idempotent on repeated run.
   - does not duplicate existing source hash.
   - preserves `approved_for_embedding` when source hash is unchanged.

4. Status mapping

   - `ready` maps to `ready_for_review`.
   - `needs_review` maps to `needs_review`.
   - `failed` maps to `failed`.

5. Eligibility export

   - includes only approved documents.
   - excludes failed, needs review, superseded, archived.
   - excludes entries missing chunks path.

6. Supersession

   - marks old document as superseded.
   - links old and new source hashes correctly.
   - excludes old document from eligibility.

### Mocking Rule

Use synthetic artifact JSON only.

Do not require real PDFs or OCR in this task’s unit tests.

---

## 13. Verification Commands

Run package-level verification:

```bash
pnpm --filter @the-abyss/sentra-rag build
pnpm --filter @the-abyss/sentra-rag test
```

If package name differs, use actual `sentra-rag` package name from its `package.json`.

Run registry smoke test using ABYSS-RAG-002 artifacts:

```bash
pnpm sentra-rag registry:update --artifacts ./data/knowledge-artifacts --registry ./data/knowledge-registry
```

Then confirm these files exist:

```txt
data/knowledge-registry/registry.json
data/knowledge-registry/registry-summary.json
data/knowledge-registry/eligible-for-embedding.json
data/knowledge-registry/needs-review.json
data/knowledge-registry/failed.json
data/knowledge-registry/superseded.json
```

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
- All errors must be sanitized before entering summaries.
- Do not auto-approve any document for embedding.

---

## 15. Risks & Mitigation

| Risk                                        | Probability | Impact   | Mitigation                                                          |
| ------------------------------------------- | ----------- | -------- | ------------------------------------------------------------------- |
| Outdated guideline gets embedded later      | Medium      | Critical | Superseded status excludes old versions from eligibility.           |
| New documents become approved automatically | Medium      | High     | Default `ready` maps only to `ready_for_review`.                    |
| Duplicate documents inflate vector DB later | Medium      | Medium   | `source_hash` is primary deduplication key.                         |
| Registry drift from artifacts               | Medium      | Medium   | Registry update reads artifact paths and can be rerun idempotently. |
| Human review is bypassed                    | Medium      | High     | Only `approved_for_embedding` enters eligibility export.            |

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
npx tsx src/cli/registry-update.ts --artifacts ./data/knowledge-artifacts --registry ./data/knowledge-registry
```

### Actual Results

```
Typecheck: PASS (tsc --noEmit, exit 0)
Tests:     PASS 53/53 (9 test files, vitest)
  ✓ tests/supersession.test.ts (4 tests)
  ✓ tests/duplicate-detector.test.ts (5 tests)
  ✓ tests/registry-summary.test.ts (5 tests)
  ✓ tests/ingestion-summary.test.ts (8 tests)
  ✓ tests/knowledge-registry.test.ts (6 tests)
  ✓ tests/pdf-discovery.test.ts (7 tests)
  ✓ tests/artifact-writer.test.ts (6 tests)
  ✓ tests/pdf-batch-runner.test.ts (6 tests)
  ✓ tests/eligibility-exporter.test.ts (6 tests)

Registry update smoke test (from ABYSS-RAG-002 artifact):
  ABYSS-RAG-003 Knowledge Source Registry Update
  Total Entries:          1
  Ready for Review:       1
  Approved for Embedding: 0
  Needs Review:           0
  Failed:                 0
  Superseded:             0
  Archived:               0

Generated files:
  registry.json                (1443 bytes)
  registry-summary.json         (330 bytes)
  eligible-for-embedding.json      (2 bytes — empty, no approved docs yet)
  needs-review.json                (2 bytes — empty)
  failed.json                      (2 bytes — empty)
  superseded.json                  (2 bytes — empty)

Embedding generation: 0 (grep confirmed — no embed/OllamaEmbedder/PgVectorStore in registry/)
Vector DB writes:     0
Cloud OCR calls:      0
SATUSEHAT calls:      0
Auto-approved docs:   0 (default mapping: ready → ready_for_review only)

turbo run: BLOCKED (pre-existing IO error in agent-hermes — unrelated)
```


---

## 18. Commit Convention

Use:

```txt
[ABYSS-RAG-003] [RAG] Add knowledge source registry and versioning layer

Agent: Cursor
Phase: RAGOps
Handoff: docs/tasks/ABYSS-RAG-003_handoff.md
```

---

## 19. Chief Approval

**Status:** PENDING

> Approval String:
>
> `✅ GO ABYSS-RAG-003`

