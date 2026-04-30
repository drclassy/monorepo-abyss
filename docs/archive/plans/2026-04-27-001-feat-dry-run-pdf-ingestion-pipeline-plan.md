---
title: "feat: Add dry-run PDF ingestion artifacts pipeline to sentra-rag"
type: feat
status: active
date: 2026-04-27
origin: docs/archive/task/abyss_rag_002_handoff.md
---

# feat: Add dry-run PDF ingestion artifacts pipeline to sentra-rag

## Overview

Integrate `@the-abyss/document-ingestion` into `packages/sentra-rag` as a local-first, audit-friendly dry-run pipeline. Given a folder of PDF files, the pipeline produces five reviewable knowledge artifacts per document — `canonical.json`, `document.md`, `chunks.json`, `quality-report.json`, and `ingestion-summary.json` — without generating embeddings or writing to the vector database.

This is the operational bridge between raw PDFs and the future Sentra RAG knowledge layer. Human reviewers validate artifacts before any embedding or retrieval step.

---

## Problem Frame

ABYSS-RAG-001 created the document parsing capability (`@the-abyss/document-ingestion`). It is not yet usable as a workflow — there is no batch runner, no output folder management, no deduplication, and no CLI entry point. Clinical guidelines (PNPK/PPK), SOPs, legal documents, and governance PDFs need a controlled human-reviewable checkpoint before they can enter AADI's knowledge layer. A bad OCR parse or malformed chunk silently entering retrieval would degrade clinical decision support quality.

---

## Requirements Trace

- R1. Process a folder of PDFs through `@the-abyss/document-ingestion` without touching embeddings or the vector DB.
- R2. Write five artifacts per document: `canonical.json`, `document.md`, `chunks.json`, `quality-report.json`, `ingestion-summary.json`.
- R3. Output folder keyed by `source_hash` — never by raw document title.
- R4. Detect and skip duplicate documents by default; allow `--force` to override.
- R5. Failed documents must not produce `chunks.json` unless failure occurred after chunk creation.
- R6. Batch runner must continue after individual document failure.
- R7. Provide a CLI entry point compatible with existing `sentra-rag` script conventions.
- R8. All artifacts must be locally auditable; no external network calls, no PHI in fixtures, no document text logged to console.
- R9. Unit tests must mock `@the-abyss/document-ingestion` so no real OCR is required during CI.

---

## Scope Boundaries

- No embedding generation.
- No vector database writes (pgvector or Upstash).
- No Retrieval API.
- No AADI clinical reasoning logic.
- No Google Document AI, PaddleOCR, SATUSEHAT.
- No UI or dashboard.
- No LangFlow visual flow editing.
- No production deployment.
- No second competing RAG package — work stays inside `packages/sentra-rag`.
- LiteParse must remain isolated in `packages/document-ingestion`; do not install it in `sentra-rag`.

### Deferred to Follow-Up Work

- Embedding generation and vector DB writes: separate ABYSS-RAG-003 task.
- CLI `--watch` mode for continuous folder monitoring: future iteration.
- Integration with `intelligenceboard` KnowledgeBase Prisma schema: separate task after AADI V2.

---

## Context & Research

### Relevant Code and Patterns

- `packages/sentra-rag/src/ingestion/pipeline.ts` — existing batch ingestion pattern: discover files, iterate, continue-on-failure, log inline, accumulate stats. New dry-run runner follows this shape without DB/embedding calls.
- `packages/sentra-rag/package.json` — uses `tsx` for direct execution (no tsup build step). CLI scripts follow `"ingest": "npx tsx src/ingestion/pipeline.ts"` pattern. New script must follow the same convention.
- `packages/sentra-rag/src/types.ts` — existing `IngestionResult` is distinct from the new dry-run types; do not modify existing types to avoid breaking the live pipeline.
- `packages/document-ingestion/src/index.ts` — public API: `ingestDocument()`, `CanonicalDocument`, `ChunkerInput`, `OcrQualityReport`, `renderMarkdown`, `toChunkerInput`, `IngestionStatus`.
- `packages/document-ingestion/src/types.ts` — `CanonicalDocument.sourceHash` is the deduplication key. `OcrQualityReport.status` drives quality-gate decisions.

### Institutional Learnings

- `@llamaindex/liteparse` is isolated inside `packages/document-ingestion/src/providers/liteparse.provider.ts`. Do not re-introduce it anywhere in `sentra-rag`.
- `--ignore-scripts` is required for `pnpm add` commands in this monorepo due to a pre-existing vendor `yarn`-dependency issue in `agent-hermes`. Run `pnpm add ... --ignore-scripts`.
- `turbo run` commands for this monorepo may fail with IO errors in unrelated vendor packages (pre-existing infra issue). Verify with `pnpm --filter <package>` directly.

### External References

- None required — local patterns are sufficient and the integration boundary is fully specified in the handoff document.

---

## Key Technical Decisions

- **`tsx` over `tsup` for CLI**: `sentra-rag` has no build step; the new CLI entry follows the same `npx tsx src/cli/ingest-pdf.ts` convention. Adding `tsup` would be out of pattern and unnecessary for a local CLI tool.
- **`source_hash` as output key, post-parse**: v1 duplicate detection happens after parsing (the hash is produced by `ingestDocument()`). Pre-parse hash via raw file bytes is a future optimization. This matches the handoff spec's explicit guidance for v1 behavior.
- **Separate `dry-run-types.ts`**: New types (`DryRunDocumentResult`, `DryRunDocumentStatus`, `IngestionSummary`) go into a dedicated file rather than modifying `src/types.ts`, to avoid breaking the existing live pipeline types.
- **Minimal CLI arg parser**: `process.argv` inline parsing (following existing `pipeline.ts` pattern). No heavy framework (commander/yargs) introduced unless already in the package.
- **Mock `ingestDocument()` in all unit tests**: avoids OCR dependency in CI, consistent with the mocking rule in the handoff.
- **`crypto.randomUUID()` for `runId`**: built-in Node 22, no extra dependency.
- **`vitest.config.ts` required**: `sentra-rag` has vitest in devDeps but no config file; add a minimal one to ensure tests resolve correctly.

---

## Open Questions

### Resolved During Planning

- **Does `sentra-rag` need a build step?** No — existing pattern is `tsx` direct execution. Keep consistent.
- **Where do new types live?** New `src/ingestion/dry-run-types.ts` — isolated from existing `src/types.ts`.
- **Should `ingest:pdf` script use `npx tsx` or `pnpm tsx`?** Existing scripts use `npx tsx` — follow the same convention.
- **Is vitest configured?** No `vitest.config.ts` found. Add a minimal one that mirrors the `document-ingestion` config.

### Deferred to Implementation

- Exact error sanitization strategy for `error` field in `DryRunDocumentResult` — implementer decides which fields to truncate/redact before writing to summary.
- Whether `chunks.json` should be an array of `ChunkerInput` objects directly or wrapped in an envelope — confirm against downstream chunker contract during implementation.

---

## Output Structure

    packages/sentra-rag/
    ├── src/
    │   ├── cli/
    │   │   └── ingest-pdf.ts           ← new CLI entry point
    │   ├── ingestion/
    │   │   ├── dry-run-types.ts        ← new dry-run type definitions
    │   │   ├── pdf-discovery.ts        ← new recursive PDF finder
    │   │   ├── artifact-writer.ts      ← new artifact filesystem writer
    │   │   ├── duplicate-detector.ts   ← new source_hash existence check
    │   │   ├── ingestion-summary.ts    ← new summary builder & writer
    │   │   ├── pdf-batch-runner.ts     ← new orchestrator
    │   │   ├── chunker.ts              ← existing (unchanged)
    │   │   ├── embedder.ts             ← existing (unchanged)
    │   │   ├── pdf_extract.py          ← existing (unchanged)
    │   │   └── pipeline.ts             ← existing (unchanged)
    │   └── index.ts                    ← existing (add dry-run exports)
    ├── tests/
    │   ├── pdf-discovery.test.ts       ← new
    │   ├── artifact-writer.test.ts     ← new
    │   ├── duplicate-detector.test.ts  ← new
    │   ├── ingestion-summary.test.ts   ← new
    │   └── pdf-batch-runner.test.ts    ← new
    ├── vitest.config.ts                ← new
    └── package.json                    ← modified (dep + script)

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
CLI (ingest-pdf.ts)
  --input  --output  --force  --limit
       │
       ▼
pdf-batch-runner.ts :: runPdfDryRunIngestion()
  │
  ├─► pdf-discovery.ts :: discoverPdfFiles()
  │     └─ recursive walk, .pdf only, sorted, limit-aware
  │
  └─► for each PDF:
        │
        ├─► @the-abyss/document-ingestion :: ingestDocument({ filePath })
        │     └─ returns: { canonical, markdown, chunks, qualityReport }
        │
        ├─► duplicate-detector.ts :: isDuplicate()
        │     └─ checks fs: processed/<sourceHash>/ exists?
        │         yes + !force → record skipped_duplicate, continue
        │
        ├─► artifact-writer.ts :: writeKnowledgeArtifacts()
        │     └─ processed/<sourceHash>/
        │           canonical.json
        │           document.md
        │           chunks.json       (skipped if status === 'failed')
        │           quality-report.json
        │
        └─► ingestion-summary.ts :: accumulateResult()
              └─ collect DryRunDocumentResult per PDF

  └─► ingestion-summary.ts :: buildAndWriteSummary()
        └─ ingestion-summary.json (root of outputDir)

CLI prints concise console summary (no document text)
```

---

## Implementation Units

- [ ] U1. **Package setup: dependency, types, vitest config**

**Goal:** Wire `@the-abyss/document-ingestion` as a workspace dependency, add dry-run type definitions, and add a minimal `vitest.config.ts` so tests can run.

**Requirements:** R1, R9

**Dependencies:** None

**Files:**
- Modify: `packages/sentra-rag/package.json`
- Create: `packages/sentra-rag/src/ingestion/dry-run-types.ts`
- Create: `packages/sentra-rag/vitest.config.ts`

**Approach:**
- Add `"@the-abyss/document-ingestion": "workspace:*"` to `dependencies` in `package.json`. Run `pnpm install --ignore-scripts` from monorepo root after.
- `dry-run-types.ts` defines `DryRunDocumentStatus`, `DryRunDocumentResult`, and `IngestionSummary` exactly as specified in handoff §11. These are internal to `sentra-rag` and not exported from the monorepo's `shared-types`.
- `vitest.config.ts` mirrors the minimal `document-ingestion` config: `globals: true`, `environment: 'node'`, no external test runner plugins needed.

**Patterns to follow:**
- `packages/sentra-rag/package.json` — existing dependency style (caret semver, no `latest`)
- `packages/document-ingestion/vitest.config.ts` — minimal config shape

**Test scenarios:**
- Test expectation: none — this unit is pure configuration and type declaration with no runtime behavior to assert.

**Verification:**
- `pnpm install --ignore-scripts` exits 0.
- `pnpm --filter @the-abyss/sentra-rag typecheck` resolves `@the-abyss/document-ingestion` imports without error.

---

- [ ] U2. **PDF Discovery module**

**Goal:** Implement `discoverPdfFiles(inputDir, options?)` — recursively finds all `.pdf` files, returns sorted paths, respects an optional `limit`.

**Requirements:** R1, R6

**Dependencies:** U1

**Files:**
- Create: `packages/sentra-rag/src/ingestion/pdf-discovery.ts`
- Test: `packages/sentra-rag/tests/pdf-discovery.test.ts`

**Approach:**
- Use `fs.readdirSync` with `{ withFileTypes: true }` for recursive traversal, or Node 22 `fs.readdirSync` with `{ recursive: true }` option.
- Filter for `.pdf` extension case-insensitively (`/\.pdf$/i`).
- Sort output lexicographically (stable across runs).
- Apply `limit` after sorting.
- Return `Promise<string[]>` of absolute paths for compatibility with downstream `ingestDocument({ filePath })`.

**Patterns to follow:**
- `packages/sentra-rag/src/ingestion/pipeline.ts` — `fs.readdirSync` usage for existing file discovery.

**Test scenarios:**
- Happy path: directory with 3 PDFs returns sorted array of 3 paths.
- Happy path: subdirectory recursion — PDF nested two levels deep is found.
- Edge case: `limit: 2` on a 5-PDF directory returns exactly 2 paths (first 2 alphabetically).
- Edge case: `.PDF` uppercase extension is included.
- Edge case: `.txt` and `.docx` files are excluded.
- Edge case: empty directory returns empty array.
- Edge case: non-existent `inputDir` throws an error (or returns empty, implementer decides and documents).

**Verification:**
- All test scenarios pass with `pnpm --filter @the-abyss/sentra-rag test`.

---

- [ ] U3. **Artifact writer module**

**Goal:** Implement `writeKnowledgeArtifacts()` — creates the `processed/<source_hash>/` folder and writes `canonical.json`, `document.md`, `quality-report.json`, and optionally `chunks.json`.

**Requirements:** R2, R3, R5

**Dependencies:** U1

**Files:**
- Create: `packages/sentra-rag/src/ingestion/artifact-writer.ts`
- Test: `packages/sentra-rag/tests/artifact-writer.test.ts`

**Approach:**
- Signature matches handoff §10.3: takes `{ outputDir, canonical, markdown, chunks }`, returns paths object.
- Output path: `<outputDir>/processed/<canonical.sourceHash>/`.
- `canonical.json` and `quality-report.json`: `JSON.stringify(data, null, 2)` (2-space indent).
- `document.md`: UTF-8, write `markdown` string directly.
- `chunks.json`: only write if `canonical.qualityReport.status !== 'failed'`. Write `JSON.stringify(chunks, null, 2)`.
- Use `fs.mkdirSync(dir, { recursive: true })` for folder creation.
- Return `{ artifactDir, canonicalPath, markdownPath, chunksPath?, qualityReportPath }`.

**Patterns to follow:**
- Existing `JSON.stringify` with indent used in `packages/sentra-rag` for debug output.

**Test scenarios:**
- Happy path: `status === 'ready'` — all four files written, all paths returned.
- Happy path: `status === 'needs_review'` — `chunks.json` is still written (not failed).
- Edge case: `status === 'failed'` — `chunks.json` is NOT written; `chunksPath` is undefined in return value.
- Happy path: output directory is created if it does not exist (`mkdirSync recursive`).
- Happy path: JSON files contain 2-space indentation (verify with `JSON.parse(readFileSync(...))` round-trip).
- Integration: `artifactDir` path matches `<outputDir>/processed/<sourceHash>`.

**Verification:**
- All test scenarios pass. Filesystem assertions via `fs.existsSync` are acceptable in tests (use `tmp` directories).

---

- [ ] U4. **Duplicate detector module**

**Goal:** Implement `isDuplicate(outputDir, sourceHash, force?)` — returns `true` if `processed/<sourceHash>/` already exists and `force` is falsy.

**Requirements:** R4

**Dependencies:** U1

**Files:**
- Create: `packages/sentra-rag/src/ingestion/duplicate-detector.ts`
- Test: `packages/sentra-rag/tests/duplicate-detector.test.ts`

**Approach:**
- Single function: `isDuplicate(outputDir: string, sourceHash: string, force?: boolean): boolean`.
- Check `fs.existsSync(path.join(outputDir, 'processed', sourceHash))`.
- If exists and `!force` → return `true` (is a duplicate).
- If exists and `force` → return `false` (reprocess).
- If not exists → return `false`.
- Synchronous — no async needed for a simple `existsSync` check.

**Patterns to follow:**
- `packages/sentra-rag/src/ingestion/pipeline.ts` — `store.fileExists(sourceFile)` pattern for skip logic.

**Test scenarios:**
- Happy path: folder does not exist → returns `false`.
- Happy path: folder exists, `force` undefined → returns `true`.
- Happy path: folder exists, `force: false` → returns `true`.
- Happy path: folder exists, `force: true` → returns `false` (force override).
- Edge case: `sourceHash` is an empty string — behavior is implementer's choice; document it.

**Verification:**
- All test scenarios pass without filesystem side effects (use `tmp` directories or mock `fs`).

---

- [ ] U5. **Ingestion summary builder + batch runner**

**Goal:** Implement `buildIngestionSummary()` / `writeIngestionSummary()` helper and the main `runPdfDryRunIngestion()` orchestrator that ties together U2–U4 with `ingestDocument()`.

**Requirements:** R1, R2, R4, R5, R6, R8

**Dependencies:** U2, U3, U4

**Files:**
- Create: `packages/sentra-rag/src/ingestion/ingestion-summary.ts`
- Create: `packages/sentra-rag/src/ingestion/pdf-batch-runner.ts`
- Test: `packages/sentra-rag/tests/ingestion-summary.test.ts`
- Test: `packages/sentra-rag/tests/pdf-batch-runner.test.ts`

**Approach:**

*`ingestion-summary.ts`*:
- `createSummaryHeader(params)` → initializes `IngestionSummary` with `runId` (from `crypto.randomUUID()`), `startedAt`, `inputDir`, `outputDir`, zeros for counts.
- `finalizeSummary(summary, results, completedAt)` → fills `processedCount`, `readyCount`, `needsReviewCount`, `failedCount`, `skippedDuplicateCount` by tallying `results[]`.
- `writeSummary(summary, outputDir)` → writes `<outputDir>/ingestion-summary.json` as 2-space JSON.
- Error sanitization: strip stack traces from `error` field before writing; keep only the first 200 chars of the message.

*`pdf-batch-runner.ts`*:
- `runPdfDryRunIngestion({ inputDir, outputDir, force?, limit? })` → returns `Promise<IngestionSummary>`.
- Steps: discover → for each PDF: ingest → check duplicate → write artifacts → accumulate result → finalize summary → write summary → return.
- `ingestDocument()` failures must be caught per-file with `try/catch`; log filename only (no document content) to `console.error`; record `DryRunDocumentResult` with `status: 'failed'`.
- Write `failed/failures.json` if any failed results exist (array of `DryRunDocumentResult` with `status === 'failed'`).
- Write `skipped/duplicates.json` if any `skipped_duplicate` results exist.

**Patterns to follow:**
- `packages/sentra-rag/src/ingestion/pipeline.ts` — continue-after-failure loop pattern, inline `console.log` progress.

**Test scenarios (ingestion-summary.ts):**
- Happy path: 3 ready, 1 needs_review, 1 failed, 1 skipped → counts match exactly.
- Happy path: `writeIngestionSummary` produces valid JSON at expected path.
- Edge case: all documents skipped → all counts except `skippedDuplicateCount` are 0.
- Happy path: each `DryRunDocumentResult` in summary includes `artifactPaths` when present.
- Happy path: `error` field is sanitized — raw exception stack is not present in written JSON.

**Test scenarios (pdf-batch-runner.test.ts):**
- Happy path: `ingestDocument` called once per discovered PDF (mock `pdf-discovery` returns 3 files).
- Integration: one `ingestDocument` mock throws → that PDF recorded as `failed`, runner continues to next PDF.
- Integration: duplicate detected → `isDuplicate` returns `true` → `writeKnowledgeArtifacts` NOT called for that PDF.
- Happy path: `runPdfDryRunIngestion` returns `IngestionSummary` with correct `inputDir`/`outputDir`.
- Happy path: `ingestion-summary.json` written to `outputDir` root after run completes.

**Verification:**
- All test scenarios pass with mocked `@the-abyss/document-ingestion`.
- `runPdfDryRunIngestion` does not call `embed()`, `store.upsert()`, or any network endpoint.

---

- [ ] U6. **CLI entry point + package script**

**Goal:** Add `src/cli/ingest-pdf.ts` as the user-facing entry point and register `"ingest:pdf"` in `package.json` scripts.

**Requirements:** R7, R8

**Dependencies:** U5

**Files:**
- Create: `packages/sentra-rag/src/cli/ingest-pdf.ts`
- Modify: `packages/sentra-rag/package.json`
- Modify: `packages/sentra-rag/src/index.ts` (add dry-run exports)

**Approach:**
- Parse `--input`, `--output`, `--force`, `--limit` from `process.argv.slice(2)` using a minimal inline parser (loop + startsWith). No commander/yargs.
- Validate that `--input` and `--output` are provided; print usage and `process.exit(1)` if missing.
- Print the console summary format from handoff §10.5: header line, input/output paths, counts, summary file path. Do not print document text or OCR content.
- Call `runPdfDryRunIngestion()` and surface errors via `console.error` + `process.exit(1)`.
- Add to `package.json` scripts: `"ingest:pdf": "npx tsx src/cli/ingest-pdf.ts"`.
- Export dry-run types and `runPdfDryRunIngestion` from `src/index.ts` for programmatic use.

**Patterns to follow:**
- `packages/sentra-rag/src/ingestion/pipeline.ts` — CLI arg parsing at bottom of file (`process.argv.includes('--pha')`); same inline style.
- Console output format from handoff §10.5 verbatim.

**Test scenarios:**
- Test expectation: none — CLI entry is a thin argument-parsing shell over `runPdfDryRunIngestion`. The function itself is tested in U5. Integration smoke test covers the CLI path.

**Verification:**
- `pnpm --filter @the-abyss/sentra-rag typecheck` passes.
- `pnpm sentra-rag ingest:pdf --help` (or missing args) prints usage and exits non-zero.
- Dry-run smoke test with a safe non-PHI synthetic PDF fixture produces expected folder structure and `ingestion-summary.json`.

---

## System-Wide Impact

- **Interaction graph:** No callbacks or middleware affected. `runPdfDryRunIngestion` is a standalone function. Existing `ingestLibrary` and `ingestFile` functions in `pipeline.ts` are not modified.
- **Error propagation:** Per-document failures are caught and recorded in `DryRunDocumentResult`. The batch runner never throws from a single-document failure; only setup-level errors (unreadable `inputDir`) propagate up.
- **State lifecycle risks:** Idempotency depends on `source_hash` folder existence. `--force` clears this safety check — document it clearly in README. No cleanup of partial writes on failure (acceptable for v1 dry-run).
- **API surface parity:** No changes to existing `sentra-rag` exports or types. Dry-run pipeline is additive only.
- **Integration coverage:** The full pipeline (discover → ingest → write → summarize) is exercised by the smoke test with a synthetic PDF. Unit tests use mocks.
- **Unchanged invariants:** `pipeline.ts`, `embedder.ts`, `pgvector.store.ts`, `engine.ts`, and the existing `IngestionResult` type are not modified. The live embedding pipeline continues to work without change.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Bad OCR enters artifacts | Dry-run is human-reviewable; quality report gates status. Embeddings blocked at R1/R5. |
| PHI fixture accidentally committed | Synthetic non-clinical placeholder text only. No real patient documents. |
| `@llamaindex/liteparse` installs inside `sentra-rag` | `package.json` must only add `@the-abyss/document-ingestion`. Review diff before commit. |
| Turbo IO error blocks `pnpm turbo run` | Pre-existing infra issue. Verify with `pnpm --filter` directly, document in Proof of Verification. |
| `pnpm add` fails due to yarn-dependent vendor | Use `--ignore-scripts` flag. |
| Scope creep into vector DB writes | Acceptance criteria in handoff §7 explicitly prohibit it. Grep-verified at commit time. |

---

## Documentation / Operational Notes

- Update `packages/sentra-rag/README.md` (or create if absent) with the `ingest:pdf` command, arguments, and output structure.
- Add a `data/raw-pdf/.gitkeep` and `data/knowledge-artifacts/.gitkeep` to establish the expected working directories, with both in `.gitignore` for actual PDF/artifact files.
- Commit convention from handoff: `[ABYSS-RAG-002] [RAG] Add dry-run PDF ingestion artifacts pipeline`.

---

## Sources & References

- **Origin document:** [docs/archive/task/abyss_rag_002_handoff.md](docs/archive/task/abyss_rag_002_handoff.md)
- Related code: `packages/sentra-rag/src/ingestion/pipeline.ts`
- Related code: `packages/document-ingestion/src/index.ts`
- Related code: `packages/document-ingestion/src/types.ts`
- Upstream task: ABYSS-RAG-001 (commit `7ecd6fa`)
