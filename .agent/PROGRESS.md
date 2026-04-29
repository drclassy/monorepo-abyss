# PROGRESS.md — The Abyss (Monorepo Root)
<!-- Agent MUST update at every session end or completed JET phase. -->
<!-- Last updated: 2026-04-28 -->

---

## Current Status

|Field|Value|
|-------|-------|
| **Last updated** | 2026-04-28 |
| **Active branch** | `abyss-core` → `origin` (Avvicenna GitHub, PRIVATE) |
| **Active JET phase** | GO granted — Chief authorized all classes (A/B/C) |
| **Next major initiative** | Frame the new SYMPHONY diagnosis engine, then verify readiness and re-wire Dashboard followed by ASSIST |
| **Recent tooling** | Cursor IDE audit executed locally (see `.agent/sessions/2026-04-28.md`): Claude Code permission posture tightened, wrapper removed, overlapping extensions trimmed |

---

## ✅ Done (cumulative)

### Recent completed foundation work
- [x] **Quality Expansion:** Added PABI (General Surgery), ESC 2024 (Cardiology Gold Standard), and SPP (Anatomical Pathology).
- [x] **Avvcenna Medical Library (AML) Scaffold:** Created root directory `V:\avcn-sentra\avvcenna-med-lib\` with 36 specialty folders.
- [x] **Kemenkes Ingestion (Massive Batch 1-7):** ~58 PNPK documents (2017-2026) downloaded and categorized.
- [x] **Integrity Check:** Audited 51 files; fixed corruptions using User-Agent rotation.
- [x] **Professional Org Scouting (Batch 1):** Filled niche categories:
    *   `tcv/`: PPK HBTKVI (Thoracic & Cardiovascular).
    *   `psu/`: Pedoman Bedah Anak (Unair) + PNPK Hirschprung.
    *   `ven/`: PPK PERDOSKI (Venereology).
    *   `eme/`: PNPK Trauma 2017 (Emergency).
    *   `rad/`: Modul Pengantar Radiologi (Uhamka).
    *   `kkp/`: PPK Fasyankes Primer IDI 2017 (Mega-reference).
- [x] **Sentra RAG Engine:** Scaffolded `packages/sentra-rag/`, 3,306 chunks ingested.

---

## 🔄 In Progress (active sprint)

### SYMPHONY first
- [ ] Frame the new diagnosis engine inside `@the-abyss/symphony`.
- [ ] Reconfirm release gates before any production import replacement.
- [ ] Re-wire Dashboard to SYMPHONY only after the diagnosis-engine direction is locked.
- [ ] Re-wire ASSIST only after Dashboard integration is stable.

### Supporting cleanup
- [ ] Keep retrieval packages in a support-only role: acquisition, indexing, retrieval, grounding.
- [ ] Continue consolidating deterministic references into `@the-abyss/clinical-references` without moving diagnosis authority out of SYMPHONY.

## 🚫 Blockers

- Production import replacement remains blocked until parity and readiness gates are explicitly cleared.
- Retrieval packages still need boundary discipline so they do not drift into parallel reasoning.
## 2026-04-25 — `ai-core` retired from active workspace

**Event:** Chief authorized full staged removal of legacy `packages/ai-core`, confirmed as baggage from a cancelled chatbot/AI experiment.

- **Detached consumers:** removed workspace dependency/path-alias usage from `platform/orchestrator`, `apps/academic/evaluation-engine`, `apps/prototype/edge-ai-prototype`, and `apps/healthcare/aby-dashboard`.
- **Runtime rehoming:** `apps/healthcare/aby-dashboard/src/app/api/aby/analyze/route.ts` now owns its local Aby/Ollama request logic; `apps/healthcare/sentra-main/app/api/melinda/chat/route.ts` now owns a local schedule responder instead of reading `packages/ai-core`.
- **Docs/governance sync:** active references removed from root docs (`AGENTS.md`, `README.md`, `ONBOARDING.md`, `.agent/CONTEXT.md`, `.agent/ARCHITECTURE.md`), package/app docs, CODEOWNERS, and `conductor/agent-registry.yaml`.
- **Purge:** `packages/ai-core/` deleted fully; lockfile refreshed with `pnpm install --lockfile-only --ignore-scripts`.
- **Verification status:** route-level consumers detached cleanly; root install succeeded with `--ignore-scripts`. Targeted package checks exposed pre-existing workspace issues unrelated to `ai-core` (`orchestrator` Prisma/config drift, `evaluation-engine` transitive package errors, `aby-dashboard` missing `@assistant-ui/*` deps).
- **Strategic lock:** `ai-core` is no longer part of the active architecture. Canonical clinical engine remains `@the-abyss/symphony`; next product-critical focus stays on SYMPHONY readiness and downstream rewiring.

## 2026-04-24 02:53 — `57c3bad` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(tooling): add guardian console and literature harvest stack
- **Files changed**: 27 file(s)

```
AGENTS.md
packages/literature-harvester/README.md
packages/literature-harvester/library/literature-harvests/(repo-anchor-check staging artifacts)
packages/literature-harvester/package.json
packages/literature-harvester/src/__tests__/harvester.test.ts
packages/literature-harvester/src/cli.ts
packages/literature-harvester/src/connectors.ts
packages/literature-harvester/src/harvester.ts
packages/literature-harvester/src/index.ts
packages/literature-harvester/src/types.ts
packages/literature-harvester/src/utils.ts
packages/literature-harvester/tsconfig.json
pnpm-lock.yaml
tooling/librarian-desktop/START_AVVCENNA_CONSOLE.bat
tooling/librarian-desktop/index.html
tooling/librarian-desktop/literature-worker/README.md
tooling/librarian-desktop/literature-worker/package.json
tooling/librarian-desktop/literature-worker/src/__tests__/server.test.ts
```

---
## 2026-04-24 02:54 — `7e10c12` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: test(literature-harvester): avoid committing anchor fixtures
- **Files changed**: 4 file(s)

```
packages/literature-harvester/library/literature-harvests/(repo-anchor-check staging artifacts)
packages/literature-harvester/src/__tests__/harvester.test.ts
```

---
## 2026-04-24 02:58 — `3826a79` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(console): differentiate guardian and sentinel reply colors
- **Files changed**: 1 file(s)

```
tooling/librarian-desktop/index.html
```

---
## 2026-04-25 15:07 — `085a6b6` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(repo): retire legacy ai-core package
- **Files changed**: 17 file(s)

```
.agent/ARCHITECTURE.md
.agent/CONTEXT.md
.github/CODEOWNERS
CHANGELOG.md
ONBOARDING.md
README.md
docs/blueprint/infrastructure.md
docs/blueprint/instruction.md
packages/AGENTS.md
packages/ai-core/README.md
packages/ai-core/package.json
packages/ai-core/src/__tests__/artificial-core.test.ts
packages/ai-core/src/client.ts
packages/ai-core/src/index.ts
packages/ai-core/src/prompt-manager.ts
packages/ai-core/src/types.ts
tsconfig.json
```

---
## 2026-04-25 15:08 — `240b1d1` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(agent): sync memory backlog
- **Files changed**: 5 file(s)

```
.agent/DECISIONS.md
.agent/PROGRESS.md
.agent/sessions/2026-04-23.md
.agent/sessions/2026-04-24.md
.agent/sessions/2026-04-25.md
```

---
## 2026-04-25 15:12 — `a411856` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(repo): consolidate governance and retire legacy docs
- **Files changed**: 38 file(s)

```
.agent/HANDOFF.md
.agent/LESSONS.md
.agent/PROGRESS.md
.agent/sessions/2026-04-20.md
.env.example
.github/workflows/reusable-ai-agent.yml
.gitignore
AGENTS.md
ORCHESTRATOR.md
conductor/ORCHESTRATOR.md
conductor/agent-registry.yaml
docs/claude-handbook/index.html
docs/cursor-qrh/.vscodeignore
docs/cursor-qrh/cursor-handbook-1.0.0.vsix
docs/cursor-qrh/docs/superpowers/plans/2026-04-11-cursor-handbook-vsix.md
docs/cursor-qrh/docs/superpowers/specs/2026-04-11-cursor-handbook-design.md
docs/cursor-qrh/media/handbook.html
docs/cursor-qrh/media/icon.svg
docs/cursor-qrh/package.json
docs/cursor-qrh/pnpm-lock.yaml
```

---
## 2026-04-25 15:12 — `9545f12` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(platform): add orchestrator and sentra portal workspaces
- **Files changed**: 140 file(s)

```
platform/orchestrator/.agent/CONTEXT.md
platform/orchestrator/.agent/DECISIONS.md
platform/orchestrator/.agent/HANDOFF.md
platform/orchestrator/.agent/LESSONS.md
platform/orchestrator/.agent/PROGRESS.md
platform/orchestrator/.agent/sessions/2026-04-15.md
platform/orchestrator/AGENTS.md
platform/orchestrator/Dockerfile
platform/orchestrator/ORCHESTRATOR.md
platform/orchestrator/package.json
platform/orchestrator/src/app.module.ts
platform/orchestrator/src/commands/index.ts
platform/orchestrator/src/commands/run-flow.command.ts
platform/orchestrator/src/common/dto/flow-execution.dto.ts
platform/orchestrator/src/common/guards/api-key.guard.ts
platform/orchestrator/src/common/interceptors/shadow-mode.interceptor.ts
platform/orchestrator/src/flows/flows.controller.spec.ts
platform/orchestrator/src/flows/flows.controller.ts
platform/orchestrator/src/flows/flows.gateway.ts
platform/orchestrator/src/flows/flows.module.ts
```

---
## 2026-04-25 15:12 — `d9f65db` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(rag): add vertex rag package
- **Files changed**: 24 file(s)

```
packages/vertex-rag/.env.example
packages/vertex-rag/package.json
packages/vertex-rag/src/auto-fix.ts
packages/vertex-rag/src/bulk-upload.ts
packages/vertex-rag/src/check-indexing.ts
packages/vertex-rag/src/connector.ts
packages/vertex-rag/src/create-corpus.ts
packages/vertex-rag/src/detective.ts
packages/vertex-rag/src/final-uploader.ts
packages/vertex-rag/src/index.ts
packages/vertex-rag/src/ingest-public-data.ts
packages/vertex-rag/src/initialize-search.ts
packages/vertex-rag/src/intelligence.ts
packages/vertex-rag/src/internal/assessment/gemma.engine.ts
packages/vertex-rag/src/internal/brain/vertex.engine.ts
packages/vertex-rag/src/internal/compliance/guard.engine.ts
packages/vertex-rag/src/internal/medical-knowledge-map.test.ts
packages/vertex-rag/src/internal/medical-knowledge-map.ts
packages/vertex-rag/src/investigate.ts
packages/vertex-rag/src/official-uploader.ts
```

---
## 2026-04-25 15:13 — `808d632` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(agent): add clinical curation dossiers
- **Files changed**: 6 file(s)

```
.agent/01_PANDUAN_PENGUMPULAN_BAHAN_SENTRA_CDSS_v1.md
.agent/CURATION_TASKS.md
.agent/FEATURE.md
.agent/MASTER_SITREP.md
check-docs.ts
platform/AGENTS.md
```

---
## 2026-04-25 15:14 — `8a3fb47` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(library): add medical corpus snapshot
- **Files changed**: 110 file(s)

```
library/medical/INVENTORY.md
library/medical/LIBRARIAN_PROTOCOL.md
library/medical/README.md
library/medical/aer/FAA_Guide_Aviation_Medical_Examiners.pdf
library/medical/aer/ICAO_Manual_Civil_Aviation_Medicine_2024.pdf
library/medical/ane/PNPK_2022_-_Tata_Laksana_Anestesiologi_dan_Terapi_Intensif.pdf
library/medical/apa/Buku_Pendidikan_Berkesinambungan_Patologi_Klinik_Anatomik_Unair.pdf
library/medical/apa/Standar_Pelayanan_Patologi_Anatomik_Ref.pdf
library/medical/car/ESC_Guideline_CCS_2024_Official.pdf
library/medical/car/ESC_Guideline_CVD_in_Diabetes_2023.pdf
library/medical/car/ESC_Guideline_Chronic_Coronary_Syndromes_2024.pdf
library/medical/car/PNPK_2021_-_Tata_Laksana_Gagal_Jantung.pdf
library/medical/car/PNPK_2023_-_Tata_Laksana_Angina_Pectoris_Stabil.pdf
library/medical/cpa/Peran_Patologi_Klinik_Aryati_Unair.pdf
library/medical/cpa/Standar_Pelayanan_Patologi_Klinik_KMK_2022.pdf
library/medical/der/PNPK_2019_-_Tata_Laksana_Dermatitis_Seboroik.pdf
library/medical/der/PPK_PERDOSKI_Full_2017.pdf
library/medical/eme/PNPK_2017_-_Tata_Laksana_Trauma.pdf
library/medical/ent/PNPK_2018_-_Tata_Laksana_Otitis_Media_Supuratif_Kronik.pdf
library/medical/ent/PNPK_2018_-_Tata_Laksana_Tonsilitis.pdf
```

---
## 2026-04-25 15:14 — `2b6cb2e` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(workspace): refresh root lockfile and progress
- **Files changed**: 2 file(s)

```
.agent/PROGRESS.md
pnpm-lock.yaml
```

---
## 2026-04-25 15:15 — `a6f6b0a` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(agent): capture residual session logs
- **Files changed**: 2 file(s)

```
.agent/PROGRESS.md
packages/symphony/.agent/(misplaced hook session artifact)
```

---


---
## 2026-04-25 20:10 - architecture review (not yet committed)

- **Scope**: reviewed `V:\avcn-sentra\abyss-monorepo\packages` against current monorepo best practice and the Chief-locked direction that SYMPHONY remains the canonical parent.
- **Boundary map confirmed**:
  - clinical core = `shared-types`, `symphony`, `clinical-references`, `fhir-engine`
  - retrieval stack = `sentra-rag`, `vector-store`, `vertex-rag`, `literature-harvester`
  - infra/integration = `database`, `integration-bridge`, `langflow-client`, `iskandar-gatekeeper`
  - shared UI/config = `ui`, `design-token`, `config-eslint`, `config-typescript`
- **Main risk found**: retrieval packages have overlapping ingest/query roles, while `vertex-rag` is still an outlier (`private` mismatch, `1.0.0`, thinner governance surface).
- **Primary alignment locked**: SYMPHONY owns clinical reasoning; RAG owns acquisition, indexing, retrieval, and grounding only.
- **Readiness conclusion**: the package graph is now clear enough to move focus back to the main mission:
  1. define the new SYMPHONY diagnosis engine,
  2. verify readiness,
  3. re-wire Dashboard,
  4. then re-wire ASSIST.
- **Next recommended action**: write the diagnosis-engine design frame first; do not start Dashboard/ASSIST rewiring before that design is locked.
## 2026-04-26 00:14 — `c7ed75a` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(repo): tighten vertex-rag boundary and prune orphan refs
- **Files changed**: 8 file(s)

```
.agent/HANDOFF.md
.agent/PROGRESS.md
docs/specs/phase-4/4.3-4.4-orchestrator-shadow-mode.md
docs/superpowers/plans/2026-04-20-symphony-canonicalization.md
packages/vertex-rag/package.json
pnpm-lock.yaml
tooling/scripts/rag/medical-search.ts
tooling/scripts/rag/trigger-import.ts
```

---
## 2026-04-26 00:16 — `b3715f5` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(agent): sync architecture lock and progress log
- **Files changed**: 2 file(s)

```
.agent/DECISIONS.md
.agent/PROGRESS.md
```

---
## 2026-04-27 03:16 — `fcf395c` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(aadi-v2): add two-layer WBS with Claude/Codex allocation
- **Files changed**: 1 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-wbs.md
```

---
## 2026-04-27 03:37 — `31b0ab7` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add AADI V2 shared contracts
- **Files changed**: 4 file(s)

```
packages/shared-types/src/symphony.ts
packages/symphony/src/__tests__/contract.test.ts
packages/symphony/src/contracts/index.ts
packages/symphony/src/index.ts
```

---
## 2026-04-27 03:44 — `7ecd6fa` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-RAG-001] [RAG] Implement local-first PDF OCR ingestion layer
- **Files changed**: 28 file(s)

```
.agent/sessions/2026-04-27.md
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
docs/task/abyss_rag_001_handoff.md
packages/document-ingestion/README.md
packages/document-ingestion/package.json
packages/document-ingestion/src/chunking/chunker-adapter.ts
packages/document-ingestion/src/detection/pdf-preflight.ts
packages/document-ingestion/src/errors/ingestion-error.ts
packages/document-ingestion/src/hashing/source-hash.ts
packages/document-ingestion/src/index.ts
packages/document-ingestion/src/ingest-document.ts
packages/document-ingestion/src/normalization/canonical-document.ts
packages/document-ingestion/src/normalization/markdown-renderer.ts
packages/document-ingestion/src/providers/document-parser-provider.ts
packages/document-ingestion/src/providers/liteparse.provider.ts
packages/document-ingestion/src/quality/ocr-quality-report.ts
packages/document-ingestion/src/types.ts
packages/document-ingestion/tests/chunker-adapter.test.ts
packages/document-ingestion/tests/fixtures/README.md
packages/document-ingestion/tests/markdown-renderer.test.ts
```

---
## 2026-04-27 03:56 — `24d9fc1` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add AADI V2 syndrome classifier
- **Files changed**: 4 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/syndrome-classifier.test.ts
packages/symphony/src/engine/syndrome-classifier.ts
packages/symphony/src/index.ts
```

---
## 2026-04-27 04:06 — `958120c` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add AADI V2 diagnosis packs and native differential
- **Files changed**: 5 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/native-differential.test.ts
packages/symphony/src/engine/diagnosis-packs.ts
packages/symphony/src/engine/native-differential.ts
packages/symphony/src/index.ts
```

---
## 2026-04-27 04:16 — `cd3d2e3` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-RAG-002] [RAG] Add dry-run PDF ingestion artifacts pipeline
- **Files changed**: 21 file(s)

```
docs/plans/2026-04-27-001-feat-dry-run-pdf-ingestion-pipeline-plan.md
docs/task/abyss_rag_002_handoff.md
packages/document-ingestion/package.json
packages/sentra-rag/.gitignore
packages/sentra-rag/data/knowledge-artifacts/.gitkeep
packages/sentra-rag/data/raw-pdf/.gitkeep
packages/sentra-rag/package.json
packages/sentra-rag/src/cli/ingest-pdf.ts
packages/sentra-rag/src/index.ts
packages/sentra-rag/src/ingestion/artifact-writer.ts
packages/sentra-rag/src/ingestion/dry-run-types.ts
packages/sentra-rag/src/ingestion/duplicate-detector.ts
packages/sentra-rag/src/ingestion/ingestion-summary.ts
packages/sentra-rag/src/ingestion/pdf-batch-runner.ts
packages/sentra-rag/src/ingestion/pdf-discovery.ts
packages/sentra-rag/tests/artifact-writer.test.ts
packages/sentra-rag/tests/duplicate-detector.test.ts
packages/sentra-rag/tests/ingestion-summary.test.ts
packages/sentra-rag/tests/pdf-batch-runner.test.ts
packages/sentra-rag/tests/pdf-discovery.test.ts
```

---
## 2026-04-27 04:17 — `988dfd0` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-RAG-003] [RAG] Add knowledge source registry and versioning layer
- **Files changed**: 15 file(s)

```
.agent/sessions/2026-04-27.md
docs/task/abyss_rag_003_handoff.md
packages/sentra-rag/data/knowledge-registry/.gitkeep
packages/sentra-rag/src/cli/registry-update.ts
packages/sentra-rag/src/registry/eligibility-exporter.ts
packages/sentra-rag/src/registry/knowledge-registry.ts
packages/sentra-rag/src/registry/registry-reader.ts
packages/sentra-rag/src/registry/registry-summary.ts
packages/sentra-rag/src/registry/registry-types.ts
packages/sentra-rag/src/registry/registry-writer.ts
packages/sentra-rag/src/registry/supersession.ts
packages/sentra-rag/tests/eligibility-exporter.test.ts
packages/sentra-rag/tests/knowledge-registry.test.ts
packages/sentra-rag/tests/registry-summary.test.ts
packages/sentra-rag/tests/supersession.test.ts
```

---
## 2026-04-27 04:29 — `22565b7` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(gcp): standardize GCP env vars across vertex-rag and sentra-rag
- **Files changed**: 7 file(s)

```
.agent/sessions/2026-04-27.md
packages/sentra-rag/.env.example
packages/vertex-rag/.env.example
packages/vertex-rag/src/connector.ts
packages/vertex-rag/src/ingest-public-data.ts
packages/vertex-rag/src/internal/brain/vertex.engine.ts
packages/vertex-rag/src/search-connector.ts
```

---
## 2026-04-27 19:23 — `efe8359` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add AADI V2 reasoning arbiter with safety dominance
- **Files changed**: 4 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/reasoning-arbiter.test.ts
packages/symphony/src/engine/reasoning-arbiter.ts
packages/symphony/src/index.ts
```

---
## 2026-04-27 19:30 — `bc19a24` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add AADI V2 explainability and clinical disposition
- **Files changed**: 5 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/confidence-engine.test.ts
packages/symphony/src/engine/confidence-engine.ts
packages/symphony/src/engine/explainability.ts
packages/symphony/src/index.ts
```

---
## 2026-04-27 19:41 — `f730478` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): wire AADI V2 native pipeline into assess.ts
- **Files changed**: 3 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/aadi-v2.integration.test.ts
packages/symphony/src/engine/assess.ts
```

---
## 2026-04-27 21:05 — `0184a6d` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: fix(symphony): observable AADI V2 fallback + native→trafficLight bridge
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/aadi-v2.integration.test.ts
packages/symphony/src/engine/assess.ts
```

---
## 2026-04-27 21:13 — `0a211a8` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add AADI V2 shadow comparison engine
- **Files changed**: 6 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/aadi-v2.integration.test.ts
packages/symphony/src/__tests__/shadow-comparison.test.ts
packages/symphony/src/engine/assess.ts
packages/symphony/src/engine/shadow-comparison.ts
packages/symphony/src/index.ts
```

---
## 2026-04-27 21:19 — `16c5546` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add AADI V2 parity verification engine
- **Files changed**: 4 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/parity-verification.test.ts
packages/symphony/src/engine/parity-verification.ts
packages/symphony/src/index.ts
```

---
## 2026-04-27 21:42 — `62759d7` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): add AADI V2 interoperability stubs
- **Files changed**: 7 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/symphony-to-cds-hooks.test.ts
packages/symphony/src/__tests__/symphony-to-fhir.test.ts
packages/symphony/src/index.ts
packages/symphony/src/interop/index.ts
packages/symphony/src/interop/symphony-to-cds-hooks.ts
packages/symphony/src/interop/symphony-to-fhir.ts
```

---
## 2026-04-27 21:52 — `63fee04` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: fix(symphony): widen shadow old-path availability + document status transition rule
- **Files changed**: 3 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/shadow-comparison.test.ts
packages/symphony/src/engine/shadow-comparison.ts
```

---
## 2026-04-27 22:06 — `5d97a85` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(symphony): formal-defer Sprint 4+ items + record Tahap A status lift readiness
- **Files changed**: 1 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
```

---
## 2026-04-27 22:17 — `885ecce` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): lift metadata.status to runtime-derived contract v0.8.0
- **Files changed**: 9 file(s)

```
docs/superpowers/plans/2026-04-20-symphony-canonicalization.md
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/shared-types/src/symphony.ts
packages/symphony/src/__tests__/aadi-v2.integration.test.ts
packages/symphony/src/__tests__/contract.test.ts
packages/symphony/src/__tests__/parity-verification.test.ts
packages/symphony/src/__tests__/symphony-to-cds-hooks.test.ts
packages/symphony/src/__tests__/symphony-to-fhir.test.ts
packages/symphony/src/engine/assess.ts
```

---
## 2026-04-27 23:30 — `e2dd48a` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(orchestrator): wire DiagnosisFlowSaga to real assessSymphonyInput()
- **Files changed**: 8 file(s)

```
docs/specs/2026-04-27-orchestrator-symphony-bridge.md
platform/orchestrator/package.json
platform/orchestrator/src/sagas/diagnosis-flow.saga.spec.ts
platform/orchestrator/src/sagas/diagnosis-flow.saga.ts
platform/orchestrator/src/sagas/symphony-bridge.spec.ts
platform/orchestrator/src/sagas/symphony-bridge.ts
platform/orchestrator/tsconfig.json
pnpm-lock.yaml
```

---
## 2026-04-27 23:41 — `002f8e5` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: fix(orchestrator): PHI-safe DLQ + remove any + narrow determinism claim
- **Files changed**: 3 file(s)

```
docs/specs/2026-04-27-orchestrator-symphony-bridge.md
platform/orchestrator/src/sagas/diagnosis-flow.saga.spec.ts
platform/orchestrator/src/sagas/diagnosis-flow.saga.ts
```

---
## 2026-04-28 08:13 — `97a9861` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): canonical AVPU mapper — retire toAvpu() and consciousnessToAvpu()
- **Files changed**: 5 file(s)

```
packages/symphony/src/__tests__/avpu-mapper.test.ts
packages/symphony/src/engine/classifiers.ts
packages/symphony/src/engine/clinical-facts.ts
packages/symphony/src/engine/reasoning-arbiter.ts
packages/symphony/src/index.ts
```

---
## 2026-04-28 08:27 — `e81a7e6` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(symphony): preserve 'unknown' consciousness in snapshot.patient.avpuManual
- **Files changed**: 3 file(s)

```
packages/shared-types/src/symphony.ts
packages/symphony/src/__tests__/clinical-facts.test.ts
packages/symphony/src/engine/clinical-facts.ts
```

---
## 2026-04-28 08:51 — `31e3683` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: test(symphony): complete classifier function coverage — AVPU/GCS/NEWS2 scoring
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/classifiers.test.ts
packages/symphony/src/__tests__/news2.test.ts
```

---
## 2026-04-29 00:47 — `f338b3f` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: test(fhir-engine): lock modernization baseline expectations
- **Files changed**: 1 file(s)

```
packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
```

---
## 2026-04-29 00:48 — `4bd0dd6` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(fhir-engine): clarify bounded modernization role
- **Files changed**: 2 file(s)

```
packages/fhir-engine/README.md
packages/fhir-engine/src/index.ts
```

---
## 2026-04-29 00:50 — `7a394ac` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: refactor(fhir-engine): make transformer surface honest
- **Files changed**: 4 file(s)

```
packages/fhir-engine/src/__tests__/fhir-engine.test.ts
packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
packages/fhir-engine/src/__tests__/transformer.test.ts
packages/fhir-engine/src/transformer.ts
```

---
## 2026-04-29 00:52 — `136dfae` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(fhir-engine): declare bounded resource support matrix
- **Files changed**: 4 file(s)

```
packages/fhir-engine/src/__tests__/validator.test.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/types.ts
packages/fhir-engine/src/validator.ts
```

---
## 2026-04-29 00:53 — `1924f75` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(fhir-engine): align package wording with R5-target path
- **Files changed**: 3 file(s)

```
packages/fhir-engine/src/__tests__/version-strategy.test.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/version-strategy.ts
```

---
## 2026-04-29 00:55 — `3e43c8d` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(fhir-engine): add validation hook seam for future promotion
- **Files changed**: 3 file(s)

```
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/validation-hooks.ts
```

---
## 2026-04-29 00:57 — `c3842b1` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(fhir-engine): close modernization baseline handoff
- **Files changed**: 2 file(s)

```
.agent/sessions/2026-04-29.md
packages/fhir-engine/src/__tests__/fhir-engine.test.ts
```

---
## 2026-04-29 01:04 — `e603d1d` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: chore(fhir-engine): add scoped tsconfig.json — close typecheck noise
- **Files changed**: 1 file(s)

```
packages/fhir-engine/tsconfig.json
```

---
## 2026-04-29 01:20 — `ba21f35` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: test(fhir-engine): lock deferred resource baseline behavior
- **Files changed**: 1 file(s)

```
packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts
```

---
## 2026-04-29 01:25 — `b61eabe` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(fhir-engine): add bounded Condition validation
- **Files changed**: 8 file(s)

```
packages/fhir-engine/README.md
packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts
packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/__tests__/validator.test.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/types.ts
packages/fhir-engine/src/validator.ts
```

---
## 2026-04-29 01:28 — `d7fcc07` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(fhir-engine): add bounded RiskAssessment validation
- **Files changed**: 8 file(s)

```
packages/fhir-engine/README.md
packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts
packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/__tests__/validator.test.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/types.ts
packages/fhir-engine/src/validator.ts
```

---
## 2026-04-29 01:32 — `47d677f` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(fhir-engine): add bounded DiagnosticReport validation
- **Files changed**: 8 file(s)

```
packages/fhir-engine/README.md
packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts
packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/__tests__/validator.test.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/types.ts
packages/fhir-engine/src/validator.ts
```

---
## 2026-04-29 01:33 — `a964e47` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: feat(fhir-engine): reconcile validation seam with expanded support matrix
- **Files changed**: 2 file(s)

```
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/validation-hooks.ts
```

---
## 2026-04-29 01:35 — `0cde716` — abyss-core

- **Agent**: Avvcenna+
- **Commit**: docs(fhir-engine): close deferred resource validation expansion
- **Files changed**: 1 file(s)

```
.agent/sessions/2026-04-29.md
```

---
