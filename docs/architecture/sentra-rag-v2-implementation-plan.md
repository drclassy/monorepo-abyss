# Sentra RAG V2 Implementation Plan Doc Spec

## 1. Executive summary

Sentra RAG V2 should not copy RAGFlow wholesale. Sentra should focus on
clinical-safe, Indonesia-aware, local-first RAG: small, auditable, typed,
replaceable, and safe for Indonesian healthcare knowledge workflows.

Implementation must be split into small missions. The safest order is:

1. Phase 0 - Stabilization / validation pass.
2. Phase 1 - Grounded Citation Foundation.
3. Phase 2 - Lightweight Hybrid Retrieval.
4. Phase 3 - Parser Gateway Interface.

Current repo state requires validation before implementation. `git status
--short` and `git diff --stat` show a large in-flight working tree across
`.agent/`, docs, package manifests, RAG, ingestion, portal, orchestration, and
tooling. This document is therefore planning-only and does not authorize code,
schema, dependency, or build-tool changes.

## 2. Current repository findings

| Area inspected | Evidence found | Status | Notes |
|---|---|---|---|
| RAG package | `packages/sentra/sentra-pustaka/package.json` declares `@sentra/pustaka` with description "Sentra RAG Engine - Local-first medical knowledge retrieval with pgvector + Ollama"; source folders include `src/retrieval`, `src/ingestion`, `src/embedding`, `src/storage`, `src/evaluation`. | FOUND | This appears to be the active Sentra RAG package after taxonomy migration. Older docs still mention `packages/sentra-rag`; current path is `packages/sentra/sentra-pustaka`. |
| Document ingestion | `packages/platform/document-ingestion/package.json` declares `@the-abyss/document-ingestion`; source includes `src/ingest-document.ts`, `src/types.ts`, `src/providers/liteparse.provider.ts`, `src/chunking/chunker-adapter.ts`. | FOUND | This appears to be the canonical parser/normalization front door. It must remain platform-side and must not import `@sentra/*`. |
| Chunker | `packages/platform/document-ingestion/src/chunking/chunker-adapter.ts` converts `CanonicalDocument` to `ChunkerInput`; `packages/sentra/sentra-pustaka/src/ingestion/chunker.ts` exists; tests include `packages/platform/document-ingestion/tests/chunker-adapter.test.ts`. | FOUND | Chunk metadata already preserves page, source hash, parser provider, document version, document title, OCR confidence, and ingestion status in platform output. |
| Embedding | `packages/sentra/sentra-pustaka/src/embedding/*` exists; `packages/sentra/sentra-pustaka/src/embedding/types.ts` defines embedding run artifacts; `packages/sentra/sentra-cermin/src/embedding-provider.ts` provides local Ollama embedding. | FOUND | Current evidence shows local-first embedding and dry-run/write modes. Build/test status for current dirty tree is NOT VERIFIED. |
| pgvector/vector store | `packages/sentra/sentra-pustaka/src/storage/pgvector.store.ts` creates `medical_chunks` with `embedding vector(768)` and an ivfflat index; `packages/sentra/sentra-cermin/src/store.ts` exposes a caller-owned pgvector store; tests include `packages/sentra/sentra-cermin/src/__tests__/vector-store.test.ts`. | FOUND | Database schema changes are not allowed in this mission. Future hybrid retrieval may require a separately approved migration or storage evolution. |
| Parser/LiteParse | `packages/platform/document-ingestion/src/providers/document-parser-provider.ts` defines a minimal `DocumentParserProvider`; `liteparse.provider.ts` wraps `@llamaindex/liteparse`; `package.json` depends on `@llamaindex/liteparse`. | FOUND | Parser Gateway is partially present, but current provider interface is minimal (`name: 'liteparse'`, `parse`). V2 should plan an explicit provider interface and registry. |
| Citation/source metadata | `CanonicalDocument` has `documentId`, `sourceHash`, `documentVersion`, `documentTitle`, `parserProvider`, and pages; `ChunkerInput` includes `source_hash`, `page_number`, `parser_provider`, `document_version`; `buildChunkId` and `buildVectorId` exist in `packages/sentra/sentra-pustaka/src/embedding/vector-id.ts`. | UNCLEAR | Source metadata exists, but final `CitationMetadata`, `AnswerCitation`, and `GroundedRagAnswer` contracts were not found as active exported contracts. Treat final answer citation behavior as NOT VERIFIED. |
| Tests | RAG tests exist under `packages/sentra/sentra-pustaka/tests`; ingestion tests exist under `packages/platform/document-ingestion/tests`; vector-store tests exist under `packages/sentra/sentra-cermin/src/__tests__`. | FOUND | Current pass/fail status is NOT VERIFIED. Build/typecheck/test were intentionally NOT RUN for this documentation-only mission. |

Required reading status:

| Source | Status | Notes |
|---|---|---|
| `AGENTS.md` | FOUND | Root rulebook read. `.agent/` remains protected operational SSOT. |
| `ABYSS_ENGINEERING_CONTEXT.md` | NOT AVAILABLE | Search by exact file name did not find this file. |
| `ABYSS_ENGINEERING_PROMPTS.md` | NOT AVAILABLE | Search by exact file name did not find this file. |
| `ABYSS_CODEX_MISSION_TEMPLATE.md` | NOT AVAILABLE | Search by exact file name did not find this file. |
| `ABYSS_CURRENT_STATUS_REPORT.md` | NOT AVAILABLE | Search by exact file name did not find this file. |
| `docs/specs/005-sentra_rag_v_2_three_upgrade_specs.md` | FOUND | Primary V2 three-upgrade spec read. |
| `.agent/README.md` and `.agent/HANDOFF.md` | FOUND | Confirmed in-flight state and SSOT rules. |

## 3. Package boundary assessment

Likely ownership:

- RAG contracts likely belong in `packages/sentra/sentra-pustaka` while they are internal to the RAG engine. If future consumers need cross-package response contracts, promote only the minimal public types to `packages/shared/shared-types` after a separate boundary decision.
- Ingestion likely belongs in `packages/platform/document-ingestion`, including parser normalization, source hashing, page metadata, quality reporting, and chunker-ready output.
- Retrieval likely belongs in `packages/sentra/sentra-pustaka/src/retrieval` with vector persistence delegated to `@sentra/cermin` or an injected database/vector adapter.
- Parser provider implementations should stay behind `@the-abyss/document-ingestion`; LiteParse remains the default provider for now.
- Packages that must not be touched by future RAG V2 implementation unless explicitly approved: clinical diagnosis/reasoning surfaces such as `packages/sentra/sentra-nada`, clinical substrate `packages/clinical/clinical-references`, auth packages such as `packages/sentra/sentra-bentara`, deployment/infrastructure, and any database schema/migration path.

Dependency direction:

- `packages/sentra/*` may depend on platform, clinical, and shared packages when needed.
- `packages/platform/*` must not import `@sentra/*`.
- `packages/clinical/*` must not import `@sentra/*`.
- `packages/shared/*` must not import sentra, platform, clinical, apps, or tooling runtime packages.
- Runtime packages must not import tooling packages.

| From | To | Allowed? | Reason |
|---|---|---|---|
| RAG engine | shared contracts | YES | Allowed only for stable, cross-package public contracts. Do not move internal RAG-only types into shared prematurely. |
| ingestion | parser provider | YES | Parser provider is part of the ingestion boundary and already exists under `@the-abyss/document-ingestion`. |
| clinical diagnosis | RAG retrieval | NO | Diagnosis/reasoning must not become dependent on retrieval as a final authority. RAG may provide grounding support only through an explicit consumer boundary. |
| RAG | database | YES | Allowed only via the current local pgvector path or injected caller-owned database/vector client. Schema/migration changes require a separate approval. |
| RAG | OCR | NO | OCR implementation is out of scope. RAG may consume OCR-derived metadata only after Parser Gateway exposes it through a safe provider contract. |

## 4. Implementation phases

### Phase 0 - Stabilization / validation pass

Purpose:

Ensure the working tree, baseline verification state, package names, and current
RAG/ingestion boundaries are known before feature work begins.

Expected checks:

```powershell
git status --short
git diff --stat
pnpm --filter @sentra/pustaka typecheck
pnpm --filter @sentra/pustaka test
pnpm --filter @the-abyss/document-ingestion typecheck
pnpm --filter @the-abyss/document-ingestion test
pnpm --filter @sentra/cermin typecheck
pnpm --filter @sentra/cermin test
pnpm exec eslint --print-config eslint.config.mjs
```

Output:

- Baseline report only.
- No feature implementation.
- No cleanup of unrelated dirty tree.
- No staging or commit unless Chief opens a separate commit mission.

### Phase 1 - Grounded Citation Foundation

Objective:

Make retrieved RAG evidence and final RAG answers traceable to document, page,
chunk, parser, source hash, and document version.

Scope:

- Define citation-aware RAG contracts near the RAG engine.
- Extend retrieval output shape to preserve citation metadata already present in ingestion/vector artifacts.
- Add a citation formatter for final answer surfaces.
- Add prompt/answer contract rules that require insufficient-context behavior.
- Keep backward compatibility for current `RetrievedChunk` consumers where possible.

Non-scope:

- No hybrid keyword/full-text retrieval.
- No database schema or migration.
- No OCR/table extraction.
- No RAGFlow adapter.
- No diagnosis-engine or clinical reasoning changes.
- No SATUSEHAT/BPJS/external API integration.

Likely files/packages:

- `packages/sentra/sentra-pustaka/src/types.ts`
- `packages/sentra/sentra-pustaka/src/retrieval/*`
- `packages/sentra/sentra-pustaka/src/engine.ts`
- `packages/sentra/sentra-pustaka/tests/*`
- Read-only reference: `packages/platform/document-ingestion/src/types.ts`

Data contracts:

- `CitationMetadata`
- `RetrievedChunkWithCitation`
- `AnswerCitation`
- `GroundedRagAnswer`

Tests:

- Contract/type tests for citation metadata shape.
- Formatter tests for deterministic citation IDs and excerpts.
- Retrieval tests that preserve `sourceHash`, `pageNumber`, `parserProvider`, `documentVersion`, `chunkId`, and `chunkIndex` when metadata is present.
- Insufficient-context behavior test at the RAG answer boundary if current answer generation is testable without external services.

Acceptance criteria:

- Every retrieved chunk can expose citation metadata when available.
- Missing legacy metadata is handled as degraded traceability, not silent success.
- Final RAG answer contract includes `citations[]`, `confidence`, and optional `limitations`.
- No final diagnosis claim is added.
- No schema, dependency, or build config change is introduced.

Verification commands:

```powershell
pnpm --filter @sentra/pustaka typecheck
pnpm --filter @sentra/pustaka test
pnpm --filter @sentra/pustaka lint
```

Rollback plan:

- Revert the small citation-contract and formatter changes from `@sentra/pustaka`.
- Keep ingestion artifacts unchanged.
- If backward compatibility breaks, restore the previous `RetrievedChunk` export shape and keep citation types internal until the next mission.

### Phase 2 - Lightweight Hybrid Retrieval

Objective:

Improve clinical retrieval by combining semantic pgvector results with exact
keyword/full-text signals for ICD codes, drugs, lab markers, abbreviations, and
Indonesia-aware clinical terms.

Scope:

- Add `VectorRetriever`, `KeywordRetriever`, `HybridRetriever`, and a simple rule-based reranker.
- Preserve citation metadata from Phase 1 in every retrieval result.
- Add configurable vector/keyword weighting.
- Prefer PostgreSQL-native keyword/full-text search over Elasticsearch or external search services.

Non-scope:

- No Elasticsearch.
- No GraphRAG.
- No LLM reranker.
- No external retrieval service.
- No RAGFlow core dependency.
- No OCR implementation.
- No clinical diagnosis/reasoning changes.

Likely files/packages:

- `packages/sentra/sentra-pustaka/src/retrieval/*`
- `packages/sentra/sentra-pustaka/src/storage/pgvector.store.ts`
- `packages/sentra/sentra-pustaka/src/evaluation/*`
- `packages/sentra/sentra-pustaka/tests/*`

Migration risk if database change is required:

- High. Current `medical_chunks` table is created in code with `embedding vector(768)` and ivfflat index.
- Adding `search_vector tsvector`, GIN indexes, generated columns, or backfill logic is a database/schema change and must be approved in a separate mission.
- If schema change is not approved, Phase 2 should start with query-time keyword matching or an adapter abstraction that can be tested without migration.

Test plan:

- Unit tests for weighting and reranking.
- Tests for exact term prioritization: ICD-like code, lab marker, drug name, uppercase abbreviation, numeric clinical term.
- Tests that duplicate chunks are deduplicated.
- Tests that citation metadata survives vector, keyword, and hybrid paths.
- Evaluation tests for recommendation/readiness outputs if current evaluation pipeline is extended.

Acceptance criteria:

- Existing vector retrieval still works.
- Keyword retrieval works for exact clinical terms in the approved test corpus.
- Hybrid retrieval merges and reranks vector and keyword results deterministically.
- Every result keeps citation metadata.
- No Elasticsearch, GraphRAG, external API, or RAGFlow core dependency is introduced.

Verification commands:

```powershell
pnpm --filter @sentra/pustaka typecheck
pnpm --filter @sentra/pustaka test
pnpm --filter @sentra/pustaka lint
```

If a database migration is explicitly approved later:

```powershell
pnpm --filter @sentra/pustaka test
```

Rollback plan:

- Disable hybrid mode through config and restore vector-only retrieval as default.
- Revert retrieval/reranker files.
- If a migration was approved and applied, run the separately documented rollback migration for search columns/indexes.

### Phase 3 - Parser Gateway Interface

Objective:

Make document ingestion depend on a stable parser provider interface instead
of hardcoding all parsing behavior to LiteParse.

Scope:

- Expand `DocumentParserProvider` to include provider ID, display name, supports check, capabilities, and parse output contract.
- Keep `LiteParseProvider` as the default provider.
- Add a simple parser registry/selector inside `@the-abyss/document-ingestion`.
- Preserve the current `CanonicalDocument` and chunker metadata path unless a small compatibility wrapper is needed.
- Make parser failure explicit and non-silent.

Non-scope:

- No full OCR implementation.
- No full table-aware parser.
- No RAGFlow implementation.
- No cloud parser dependency.
- No medical reasoning.
- No dependency addition unless Chief approves a separate mission.

Likely files/packages:

- `packages/platform/document-ingestion/src/providers/document-parser-provider.ts`
- `packages/platform/document-ingestion/src/providers/liteparse.provider.ts`
- `packages/platform/document-ingestion/src/ingest-document.ts`
- `packages/platform/document-ingestion/src/types.ts`
- `packages/platform/document-ingestion/tests/*`

Provider interface design:

- `id`
- `displayName`
- `supports(input)`
- `parse(input)`
- `capabilities`

LiteParse wrapper plan:

- Keep LiteParse as the default provider.
- Expose capabilities truthfully: text PDF supported; OCR/table/image/layout support should remain limited or NOT VERIFIED unless tested.
- Preserve source hash, page number, parser provider, document version, quality report, and chunker metadata.

OCR/table/RAGFlow adapter as later non-core providers:

- `OcrParserProvider` is later and optional.
- `TableAwareParserProvider` is later and optional.
- `RagflowParserAdapter` is later, optional, benchmark/external mode only, and must not become a core dependency.

Acceptance criteria:

- Ingestion uses provider interface/registry without changing external behavior.
- LiteParse remains default.
- Existing ingestion tests pass.
- Parser failures are explicit.
- Citation-compatible metadata is preserved.
- No external hard dependency is added.

Verification commands:

```powershell
pnpm --filter @the-abyss/document-ingestion typecheck
pnpm --filter @the-abyss/document-ingestion test
pnpm --filter @the-abyss/document-ingestion lint
```

Rollback plan:

- Revert provider interface/registry changes.
- Restore direct LiteParse provider behavior.
- Keep existing `CanonicalDocument` contract as the compatibility anchor.

## 5. Mission split for Codex

| Mission | Objective | Allowed files | Forbidden files | Verification |
|---|---|---|---|---|
| SENTRA-RAG-V2-000 - Stabilization and Baseline Validation | Produce a baseline report before feature work. | Read-only repo inspection; optional new report doc only if Chief asks. | Source files, package manifests, schema/migrations, `.env`, secrets, deployment config, `.agent/` cleanup. | `git status --short`; `git diff --stat`; package typecheck/test commands if safe; boundary config inspection. |
| SENTRA-RAG-V2-001 - Grounded Citation Foundation | Add citation contracts and citation-aware retrieval/answer shape. | `packages/sentra/sentra-pustaka/src/types.ts`; `src/retrieval/*`; `src/engine.ts`; focused tests. | `packages/sentra/sentra-nada`; `packages/clinical/*`; database schema/migrations; OCR/parser implementation; RAGFlow; package manifests. | `pnpm --filter @sentra/pustaka typecheck`; `pnpm --filter @sentra/pustaka test`; `pnpm --filter @sentra/pustaka lint`. |
| SENTRA-RAG-V2-002 - Lightweight Hybrid Retrieval | Add vector + keyword retrieval and deterministic reranker. | `packages/sentra/sentra-pustaka/src/retrieval/*`; `src/storage/pgvector.store.ts` only if no schema change; `src/evaluation/*`; focused tests. | Elasticsearch, GraphRAG, RAGFlow core dependency, external APIs, clinical diagnosis packages, unapproved DB migrations. | `pnpm --filter @sentra/pustaka typecheck`; `pnpm --filter @sentra/pustaka test`; `pnpm --filter @sentra/pustaka lint`. |
| SENTRA-RAG-V2-003 - Parser Gateway Interface | Formalize parser provider interface and keep LiteParse as default. | `packages/platform/document-ingestion/src/providers/*`; `src/ingest-document.ts`; `src/types.ts`; ingestion tests. | `packages/sentra/*`; OCR provider implementation; table parser implementation; RAGFlow adapter implementation; package manifests unless approved. | `pnpm --filter @the-abyss/document-ingestion typecheck`; `pnpm --filter @the-abyss/document-ingestion test`; `pnpm --filter @the-abyss/document-ingestion lint`. |

## 6. Risk matrix

| Risk | Severity | Probability | Mitigation | Rollback |
|---|---|---|---|---|
| Boundary drift | High | Medium | Keep ingestion in platform, RAG in sentra, shared only for stable cross-package contracts, and diagnosis out of RAG. | Revert offending imports/contracts and restore package-local types. |
| Circular dependency | High | Medium | Follow ADR 0008 dependency direction; never let platform/clinical/shared import `@sentra/*`. | Revert import path and move shared-only primitives to the correct owner after review. |
| Database schema drift | High | Medium | Treat full-text columns/indexes as a separate approved mission with explicit migration plan. | Run documented rollback migration or disable hybrid keyword path if no migration landed. |
| Citation metadata mismatch | High | Medium | Start from existing `sourceHash`, `page_number`, `parser_provider`, `document_version`, `chunk_id`, and vector ID evidence; add degraded metadata handling. | Restore previous retrieval shape and keep citation layer behind a compatibility adapter. |
| Parser abstraction overengineering | Medium | Medium | Add only provider ID, capabilities, supports, parse, and registry; keep LiteParse default. | Revert registry/interface expansion and retain direct LiteParse provider. |
| RAGFlow dependency creep | High | Low | Document RAGFlow as optional later adapter/benchmark only; never add it as core dependency. | Remove adapter references and package changes before merge. |
| OCR scope creep | Medium | Medium | Keep OCR as future provider only; preserve OCR metadata already produced but do not implement OCR. | Revert OCR-specific provider code and keep current quality-report behavior. |

## 7. Acceptance criteria for the plan

The plan is complete only if:

- It is based on actual repository evidence.
- It identifies likely affected files/packages.
- It separates planning from implementation.
- It separates Grounded Citation, Hybrid Retrieval, and Parser Gateway.
- It includes explicit non-scope.
- It avoids Elasticsearch, GraphRAG, OCR implementation, RAGFlow core dependency, SATUSEHAT/BPJS, and diagnosis-engine changes.
- It includes verification commands.
- It includes rollback strategy.
- It marks unknowns as NOT VERIFIED.

## 8. Recommended next action

A. Run stabilization first before implementation.

Recommended next mission:

```text
SENTRA-RAG-V2-000 - Stabilization and Baseline Validation
```

Do not implement all three upgrades at once. Proceed to
`SENTRA-RAG-V2-001 - Grounded Citation Foundation` only if the repository
baseline is clean enough and package-focused verification is understood.

## 9. Verification commands for this documentation mission

Run after creating this document:

```powershell
git status --short
git diff --stat
git diff -- docs/architecture/sentra-rag-v2-implementation-plan.md
```

Do not run build/typecheck/test for this documentation-only mission unless Chief
explicitly requests baseline validation.

| Command | Result |
|---|---|
| `pnpm typecheck` | NOT RUN - documentation-only |
| `pnpm build` | NOT RUN - documentation-only |
| `pnpm test` | NOT RUN - documentation-only |

## 10. Final Codex report format

```text
Codex Mission Report - SENTRA-RAG-V2-PLAN-001

Summary

Briefly summarize what was read, what was discovered, and what doc was created.

Files changed

| File | Change type | Reason |
|---|---|---|
| path | Created/Modified | reason |

Repository findings

| Area | Status | Evidence |
|---|---|---|
| RAG package | FOUND/NOT FOUND/UNCLEAR | evidence |
| Ingestion | FOUND/NOT FOUND/UNCLEAR | evidence |
| Retrieval | FOUND/NOT FOUND/UNCLEAR | evidence |
| Parser | FOUND/NOT FOUND/UNCLEAR | evidence |
| Database/vector | FOUND/NOT FOUND/UNCLEAR | evidence |
| Tests | FOUND/NOT FOUND/UNCLEAR | evidence |

Verification results

| Command | Result | Notes |
|---|---|---|
| git status --short | PASS/FAIL | notes |
| git diff --stat | PASS/FAIL | notes |
| git diff -- [doc path] | PASS/FAIL | notes |
| pnpm typecheck | NOT RUN | documentation-only |
| pnpm build | NOT RUN | documentation-only |
| pnpm test | NOT RUN | documentation-only |

Risk notes

List any risks discovered.

Recommended next mission

Recommend exactly one next mission:

SENTRA-RAG-V2-000 - Stabilization and Baseline Validation

or

SENTRA-RAG-V2-001 - Grounded Citation Foundation

Final status

Choose one:

PASS - plan document created and verified.
PARTIAL - plan created but repo evidence incomplete.
HOLD - repo state too unclear; stabilization required before implementation.
FAIL - documentation mission failed.

Final status: [STATUS]
```
