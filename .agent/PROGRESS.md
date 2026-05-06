# PROGRESS.md — The Abyss (Monorepo Root)
<!-- Agent MUST update at every session end or completed JET phase. -->
<!-- Last updated: 2026-05-01 -->

---

## Current Status

|Field|Value|
|-------|-------|
| **Last updated** | 2026-05-01 |
| **Active branch** | `master` |
| **Active JET phase** | GO granted — Chief authorized all classes (A/B/C) |
| **Next major initiative** | Consumer Trial Readiness: Dashboard/ASSIST readiness, shadow telemetry, and limited trial gating |
| **CI (2026-05-01)** | GitHub Actions refactored to vendor-clean reusable stack (`reusable-verify.yml`, maintenance, security hardening, fork-safe auto-fix); Chief to align branch protection required checks |
| **Recent tooling** | Cursor IDE audit executed locally (see `.agent/sessions/2026-04-28.md`): Claude Code permission posture tightened, wrapper removed, overlapping extensions trimmed; 2026-04-30 added always-on Chief directive bridge for Cursor rule flow and reclassified the root `docs/` surface into active vs archive buckets; 2026-04-30 excluded `tooling/kilo/worktrees/**` from workspace discovery to prevent ghost package duplicates; 2026-04-30 landed workspace `.vscode/settings.json` (watcher/search exclude), fixed `.cursorindexingignore` corporate path typo + follow-up **`platform/orchestrator/`** indexing path (was incorrect `apps/orchestrator/`), and added `docs/cursor/cursor-settings-profiles.md` (solo vs non-coder templates + hooks eval) |

---

## 2026-05-01 — Handbook wrap text (no clipping)

- **What:** `index.html`, `avcn-commands.html`, dan `avcn-tips.html` diubah agar teks membungkus ke baris berikutnya pada viewport sempit (menghapus pola no-wrap clipping, menambah overflow-wrap/word-break).  
- **Files changed:** `docs/handbook/index.html`, `docs/handbook/avcn-commands.html`, `docs/handbook/avcn-tips.html`, `.agent/sessions/2026-05-01.md`

---

## 2026-05-01 — Index font +1px dan layout normal

- **What:** `docs/handbook/index.html` dinormalisasi ke format satu kolom (tanpa sidebar fixed) dan font dasar dinaikkan +1px (`--sz`) supaya keterbacaan dan susunan menyerupai halaman handbook lain.  
- **Files changed:** `docs/handbook/index.html`, `.agent/sessions/2026-05-01.md`

---

## 2026-05-01 — Index handbook quick links localhost

- **What:** Menambahkan quick-links panel di `docs/handbook/index.html` untuk akses langsung full-view ke `avcn-cursor.html`, `avcn-tips.html`, dan `avcn-commands.html` via `http://127.0.0.1:8765/docs/handbook/...`.  
- **Files changed:** `docs/handbook/index.html`, `.agent/sessions/2026-05-01.md`

---

## 2026-05-01 — Handbook `avcn-cursor.html` (Cursor best practices)

- **What:** Halaman statis baru `docs/handbook/avcn-cursor.html` (tab Rules, Context, MCP, Skills, Agent, Hooks, Rujukan) berbasis ringkasan dokumentasi resmi Cursor; token Sentra; `switchTab` via `data-tab`. Footer `avcn-tips.html` menaut ke halaman ini.  
- **Files changed:** `docs/handbook/avcn-cursor.html`, `docs/handbook/avcn-tips.html`, `.agent/sessions/2026-05-01.md`, `.agent/HANDOFF.md`, `.agent/PROGRESS.md`

---

## 2026-05-01 18:51 — QRH handbook redesign patuh Sentra token

- **Agent:** Codex (session)  
- **What:** Redesign `docs/handbook/avcn-commands.html` untuk compliance token Sentra: menautkan `packages/shared/design-token/packages/design-tokens/sentra-tokens.css`, menghapus hardcoded warna pada stylesheet lokal, memperbaiki path font handbook ke `docs/handbook/fonts/geistmono/*`, menambahkan struktur semantik ringan dan focus-visible token.  
- **Files changed:** `docs/handbook/avcn-commands.html`, `.agent/HANDOFF.md`, `.agent/PROGRESS.md`, `.agent/sessions/2026-05-01.md`

---

## 2026-04-30 19:06 — AGENTS.md correction

- **Agent:** automated (session)  
- **What:** Corrected `AGENTS.md` to clarify that `packages/database` is scoped to platform apps only and that healthcare apps own their databases (see `.agent/DECISIONS.md` 2026-04-27).  
- **Files changed:** `AGENTS.md`, `.agent/HANDOFF.md`, `.agent/PROGRESS.md`, `.agent/sessions/2026-04-30.md`

---

## ✅ Done (cumulative)

### SYMPHONY core engine closed
- [x] **Clinical reasoning foundation complete:** clinical facts, syndrome classification, diagnosis packs, native differential, reasoning arbiter, explainability, and clinical disposition are now closed inside `@the-abyss/symphony`.
- [x] **Native runtime integration complete:** `assess.ts` now runs the AADI V2 native path, including shadow comparison and parity verification.
- [x] **Interop boundary complete for current scope:** FHIR Bundle interop lane is formalized with `@the-abyss/fhir-engine` as bounded structural validation home, while CDS Hooks remains formalized in `@the-abyss/symphony`.
- [x] **Platform adoption baseline complete:** orchestrator now calls `assessSymphonyInput()` as a thin-client route instead of mock reasoning.
- [x] **Hardening patch complete:** PHI-safe referral DLQ, removal of silent `vertex-rag` fallback behavior, and tighter saga persistence typing landed in `882775a`.
- [x] **Verification green on current close-out:** `@the-abyss/symphony` 373/373 PASS, `@the-abyss/orchestrator` 46/46 PASS + typecheck PASS, `@the-abyss/fhir-engine` 64/64 PASS, `@the-abyss/vertex-rag` 5/5 PASS.
- [x] **Repository posture restored:** temporary worktree released, local `abyss-core` branch removed, and the repo returned to a single active `master` line; the engine close-out was anchored on `255c50f` and hardening on `882775a`.

---

## 🔄 In Progress (active sprint)

### Consumer Trial Readiness
- [ ] Prepare **Dashboard readiness** against the now-closed SYMPHONY core surface.
- [ ] Prepare **ASSIST readiness** after Dashboard readiness criteria are explicit and stable.
- [ ] Define and wire **shadow telemetry** needed for rollout confidence, parity monitoring, and alert/disposition observation.
- [ ] Shape a **limited trial** gate with explicit entry criteria, observability expectations, and rollback posture.

### Boundary discipline
- [ ] Keep retrieval packages in a support-only role: acquisition, indexing, retrieval, and grounding only.
- [ ] Treat interoperability expansion as demand-driven follow-up, not as an excuse to reopen foundation work in SYMPHONY.

## 🚫 Blockers

- Broad consumer rollout remains blocked until Dashboard/ASSIST readiness and shadow telemetry gates are explicitly defined.
- Limited trial should not start until operational monitoring, fallback handling, and rollback expectations are locked.
- Retrieval packages still need boundary discipline so they do not drift into parallel reasoning or shadow-clinical authority.

---

## 2026-05-01 — ClinicalTrajectory coverage truth locked

- **What:** Completed the required CT coverage-map analysis against the exact
  canonical source set and wrote the implementation-ready truth map into
  `.agent/HANDOFF.md`.
- **Truth locked:** `2576984` landed only the CT v1 shared contract + fixtures.
  The canonical **52 trajectories / 5 quadrants** taxonomy is still a target,
  not an executable engine. Current executable trajectory behavior remains in
  legacy Intelligenceboard / Assist analyzers.
- **Main analytical outcome:** current coverage is strongest only around the
  legacy acute vital-based family; mortality/EOL, chronic progression,
  treatment-linked response, and operational quadrants are mostly partial or
  missing.
- **Next safe path:** preserve current legacy behavior first, then add a
  canonical adapter from legacy outputs into `ClinicalTrajectoryV1`, plus an
  explicit coverage registry for the 52-taxonomy before claiming any engine
  completion.

## 2026-04-25 — `ai-core` retired from active workspace

**Event:** Chief authorized full staged removal of legacy `packages/ai-core`, confirmed as baggage from a cancelled chatbot/AI experiment.

- **Detached consumers:** removed workspace dependency/path-alias usage from `platform/orchestrator`, `apps/academic/evaluation-engine`, `apps/prototype/edge-ai-prototype`, and `apps/healthcare/aby-dashboard`.
- **Runtime rehoming:** `apps/healthcare/aby-dashboard/src/app/api/aby/analyze/route.ts` now owns its local Aby/Ollama request logic; `apps/healthcare/sentra-main/app/api/melinda/chat/route.ts` now owns a local schedule responder instead of reading `packages/ai-core`.
- **Docs/governance sync:** active references removed from root docs (`AGENTS.md`, `README.md`, `ONBOARDING.md`, `.agent/CONTEXT.md`, `.agent/ARCHITECTURE.md`), package/app docs, CODEOWNERS, and `conductor/agent-registry.yaml`.
- **Purge:** `packages/ai-core/` deleted fully; lockfile refreshed with `pnpm install --lockfile-only --ignore-scripts`.
- **Verification status:** route-level consumers detached cleanly; root install succeeded with `--ignore-scripts`. Targeted package checks exposed pre-existing workspace issues unrelated to `ai-core` (`orchestrator` Prisma/config drift, `evaluation-engine` transitive package errors, `aby-dashboard` missing `@assistant-ui/*` deps).
- **Strategic lock:** `ai-core` is no longer part of the active architecture. Canonical clinical engine remains `@the-abyss/symphony`; next product-critical focus stays on SYMPHONY readiness and downstream rewiring.

## 2026-04-24 02:53 — `57c3bad` — abyss-core

- **Agent**: Classy
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
tooling/librarian-desktop/START_CLASSY_CONSOLE.bat
tooling/librarian-desktop/index.html
tooling/librarian-desktop/literature-worker/README.md
tooling/librarian-desktop/literature-worker/package.json
tooling/librarian-desktop/literature-worker/src/__tests__/server.test.ts
```

---
## 2026-04-24 02:54 — `7e10c12` — abyss-core

- **Agent**: Classy
- **Commit**: test(literature-harvester): avoid committing anchor fixtures
- **Files changed**: 4 file(s)

```
packages/literature-harvester/library/literature-harvests/(repo-anchor-check staging artifacts)
packages/literature-harvester/src/__tests__/harvester.test.ts
```

---
## 2026-04-24 02:58 — `3826a79` — abyss-core

- **Agent**: Classy
- **Commit**: feat(console): differentiate guardian and sentinel reply colors
- **Files changed**: 1 file(s)

```
tooling/librarian-desktop/index.html
```

---
## 2026-04-25 15:07 — `085a6b6` — abyss-core

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
- **Commit**: chore(workspace): refresh root lockfile and progress
- **Files changed**: 2 file(s)

```
.agent/PROGRESS.md
pnpm-lock.yaml
```

---
## 2026-04-25 15:15 — `a6f6b0a` — abyss-core

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
- **Commit**: docs(agent): sync architecture lock and progress log
- **Files changed**: 2 file(s)

```
.agent/DECISIONS.md
.agent/PROGRESS.md
```

---
## 2026-04-27 03:16 — `fcf395c` — abyss-core

- **Agent**: Classy
- **Commit**: docs(aadi-v2): add two-layer WBS with Claude/Codex allocation
- **Files changed**: 1 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-wbs.md
```

---
## 2026-04-27 03:37 — `31b0ab7` — abyss-core

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
- **Commit**: feat(symphony): wire AADI V2 native pipeline into assess.ts
- **Files changed**: 3 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/aadi-v2.integration.test.ts
packages/symphony/src/engine/assess.ts
```

---
## 2026-04-27 21:05 — `0184a6d` — abyss-core

- **Agent**: Classy
- **Commit**: fix(symphony): observable AADI V2 fallback + native→trafficLight bridge
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/aadi-v2.integration.test.ts
packages/symphony/src/engine/assess.ts
```

---
## 2026-04-27 21:13 — `0a211a8` — abyss-core

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
- **Commit**: fix(symphony): widen shadow old-path availability + document status transition rule
- **Files changed**: 3 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
packages/symphony/src/__tests__/shadow-comparison.test.ts
packages/symphony/src/engine/shadow-comparison.ts
```

---
## 2026-04-27 22:06 — `5d97a85` — abyss-core

- **Agent**: Classy
- **Commit**: docs(symphony): formal-defer Sprint 4+ items + record Tahap A status lift readiness
- **Files changed**: 1 file(s)

```
docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
```

---
## 2026-04-27 22:17 — `885ecce` — abyss-core

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
- **Commit**: fix(orchestrator): PHI-safe DLQ + remove any + narrow determinism claim
- **Files changed**: 3 file(s)

```
docs/specs/2026-04-27-orchestrator-symphony-bridge.md
platform/orchestrator/src/sagas/diagnosis-flow.saga.spec.ts
platform/orchestrator/src/sagas/diagnosis-flow.saga.ts
```

---
## 2026-04-28 08:13 — `97a9861` — abyss-core

- **Agent**: Classy
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

- **Agent**: Classy
- **Commit**: feat(symphony): preserve 'unknown' consciousness in snapshot.patient.avpuManual
- **Files changed**: 3 file(s)

```
packages/shared-types/src/symphony.ts
packages/symphony/src/__tests__/clinical-facts.test.ts
packages/symphony/src/engine/clinical-facts.ts
```

---
## 2026-04-28 08:51 — `31e3683` — abyss-core

- **Agent**: Classy
- **Commit**: test(symphony): complete classifier function coverage — AVPU/GCS/NEWS2 scoring
- **Files changed**: 2 file(s)

```
packages/symphony/src/__tests__/classifiers.test.ts
packages/symphony/src/__tests__/news2.test.ts
```

---
## 2026-04-29 00:47 — `f338b3f` — abyss-core

- **Agent**: Classy
- **Commit**: test(fhir-engine): lock modernization baseline expectations
- **Files changed**: 1 file(s)

```
packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
```

---
## 2026-04-29 00:48 — `4bd0dd6` — abyss-core

- **Agent**: Classy
- **Commit**: docs(fhir-engine): clarify bounded modernization role
- **Files changed**: 2 file(s)

```
packages/fhir-engine/README.md
packages/fhir-engine/src/index.ts
```

---
## 2026-04-29 00:50 — `7a394ac` — abyss-core

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
- **Commit**: docs(fhir-engine): align package wording with R5-target path
- **Files changed**: 3 file(s)

```
packages/fhir-engine/src/__tests__/version-strategy.test.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/version-strategy.ts
```

---
## 2026-04-29 00:55 — `3e43c8d` — abyss-core

- **Agent**: Classy
- **Commit**: feat(fhir-engine): add validation hook seam for future promotion
- **Files changed**: 3 file(s)

```
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/validation-hooks.ts
```

---
## 2026-04-29 00:57 — `c3842b1` — abyss-core

- **Agent**: Classy
- **Commit**: docs(fhir-engine): close modernization baseline handoff
- **Files changed**: 2 file(s)

```
.agent/sessions/2026-04-29.md
packages/fhir-engine/src/__tests__/fhir-engine.test.ts
```

---
## 2026-04-29 01:04 — `e603d1d` — abyss-core

- **Agent**: Classy
- **Commit**: chore(fhir-engine): add scoped tsconfig.json — close typecheck noise
- **Files changed**: 1 file(s)

```
packages/fhir-engine/tsconfig.json
```

---
## 2026-04-29 01:20 — `ba21f35` — abyss-core

- **Agent**: Classy
- **Commit**: test(fhir-engine): lock deferred resource baseline behavior
- **Files changed**: 1 file(s)

```
packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts
```

---
## 2026-04-29 01:25 — `b61eabe` — abyss-core

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
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

- **Agent**: Classy
- **Commit**: feat(fhir-engine): reconcile validation seam with expanded support matrix
- **Files changed**: 2 file(s)

```
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/validation-hooks.ts
```

---
## 2026-04-29 01:35 — `0cde716` — abyss-core

- **Agent**: Classy
- **Commit**: docs(fhir-engine): close deferred resource validation expansion
- **Files changed**: 1 file(s)

```
.agent/sessions/2026-04-29.md
```

---
## 2026-04-29 12:01 — `8cf17a5` — abyss-core

- **Agent**: Classy
- **Commit**: chore(repo): sync completed AADI V2 and RAG workstreams
- **Files changed**: 134 file(s)

```
.agent/01_PANDUAN_PENGUMPULAN_BAHAN_SENTRA_CDSS_v1.md
.agent/ARCHITECTURE.md
.agent/DECISIONS.md
.agent/HANDOFF.md
.agent/PROGRESS.md
.agent/sessions/2026-04-27.md
.agent/sessions/2026-04-28.md
.agent/sessions/2026-04-29.md
.clinerules
.cursor/rules/04-state-machine-discipline.mdc
.env.example
.obsidian/app.json
.obsidian/appearance.json
.obsidian/core-plugins.json
.obsidian/workspace.json
GEMINI.md
check-docs.ts
conductor/agent-registry.yaml
docs/GEMINI.md
docs/guides/aadiv2.md
```

---
## 2026-04-29 12:20 — `882775a` — master

- **Agent**: Classy
- **Commit**: fix(orchestrator): harden saga DLQ and persistence typing
- **Files changed**: 7 file(s)

```
.agent/sessions/2026-04-29.md
packages/vertex-rag/src/auto-fix.test.ts
packages/vertex-rag/src/auto-fix.ts
platform/orchestrator/src/sagas/referral-flow.saga.spec.ts
platform/orchestrator/src/sagas/referral-flow.saga.ts
platform/orchestrator/src/sagas/saga.repository.spec.ts
platform/orchestrator/src/sagas/saga.repository.ts
```

---
## 2026-04-29 12:35 — `9270e83` — master

- **Agent**: Classy
- **Commit**: docs(agent): record SYMPHONY core completion state
- **Files changed**: 2 file(s)

```
.agent/DECISIONS.md
.agent/sessions/2026-04-29.md
```

---

## 2026-04-29 — Google exit historical cleanup + `vertex-rag` retirement

**Event:** Active historical references to Google / Vertex / Gemini were cleaned
from requested repo surfaces, and `packages/vertex-rag/` was removed fully from
the repository tree.

- **Prototype/spec cleanup:** `apps/prototype/ghost-protocols/` now uses
  provider-neutral or local-first wording for hosting, LLM provider, storage,
  and monitoring assumptions.
- **Meta-doc cleanup:** stale Google / Vertex / Gemini wording removed from
  active `README.md`, `AGENTS.md`, and `CHANGELOG.md` surfaces including
  `apps/healthcare/sentra-assist/`, `apps/academic/clinical-simulator/`, root
  `AGENTS.md`, and active AADI V2 specs/plans.
- **Archive purge:** `packages/vertex-rag/` deleted fully from disk. Workspace
  config and active docs/tooling were updated first so no live source path still
  points to the package.
- **Guide cleanup:** obsolete Google-specific repo guides
  `docs/guides/github-actions-gcp-wif-checklist-2026-04-26.md`,
  `docs/guides/project-id-audit-2026-04-26.json`, and legacy
  `tooling/scripts/check-docs.ts` were removed.
- **Verification status:** targeted grep confirms no active `vertex-rag` path
  remains outside historical `.agent/` logs, `Test-Path packages/vertex-rag`
  returns `False`, and `pnpm --filter @the-abyss/sentra-assist typecheck`
  passes.
- **Second-pass repo cleanup:** active product/docs surfaces were further
  neutralized across `sentra-main`, `intelligenceboard`, `sentra-assist`,
  `referralink`, `classy-transformer`, root `README.md`, and
  `ONBOARDING.md`, so the remaining hits are now limited to ADR/history,
  spelling dictionaries, generic templates, or evaluation artifacts.
- **Second-pass verification:** `pnpm --filter @the-abyss/sentra-assist
  typecheck` passed, `pnpm --filter @the-abyss/sentra-main build` passed, and
  targeted grep over active non-audit surfaces now only returns a generic GCP
  example in a template, one cspell dictionary token, and one historical ADR
  note.
- **Final residue cleanup:** the remaining non-runtime residue was cleared from
  the generic template example, the `cspell` dictionary, and the historical ADR
  phrasing, leaving the targeted active scope grep-clean.
## 2026-04-30 16:53 — `211fc48` — master

- **Agent**: Classy
- **Commit**: chore(repo): sync GCP exit, doc normalization, and repo cleanup
- **Files changed**: 134 file(s)

```
.agent/CONTEXT.md
.agent/DECISIONS.md
.agent/HANDOFF.md
.agent/PROGRESS.md
.agent/sessions/2026-04-29.md
.cursor/README.md
.cursor/index.mdc
.cursor/rules/04-state-machine-discipline.mdc
.env.example
AGENTS.md
ONBOARDING.md
README.md
docs/GEMINI.md
docs/cursor/.vscodeignore
docs/cursor/cursor-handbook-1.0.0.vsix
docs/cursor/docs/superpowers/plans/2026-04-11-cursor-handbook-vsix.md
docs/cursor/docs/superpowers/specs/2026-04-11-cursor-handbook-design.md
docs/cursor/media/handbook.html
docs/cursor/media/icon.svg
docs/cursor/package.json
```

---
## 2026-04-30 17:04 — `ada5d8a` — master

- **Agent**: Classy
- **Commit**: docs(governance): finalize cursor and docs archive follow-up
- **Files changed**: 53 file(s)

```
.agent/PROGRESS.md
.agent/sessions/2026-04-30.md
.cursor/rules/05-chief-directive-mode.mdc
docs/README.md
docs/archive/README.md
docs/archive/cursor-handbook/.vscodeignore
docs/archive/cursor-handbook/cursor-handbook-1.0.0.vsix
docs/archive/cursor-handbook/docs/superpowers/plans/2026-04-11-cursor-handbook-vsix.md
docs/archive/cursor-handbook/docs/superpowers/specs/2026-04-11-cursor-handbook-design.md
docs/archive/cursor-handbook/media/handbook.html
docs/archive/cursor-handbook/media/icon.svg
docs/archive/cursor-handbook/package.json
docs/archive/cursor-handbook/pnpm-lock.yaml
docs/archive/cursor-handbook/src/extension.ts
docs/archive/cursor-handbook/tsconfig.json
docs/archive/handbook/avcn-commands.html
docs/archive/handbook/avcn-tips.html
docs/archive/handbook/fonts/geistmono/GeistMono-Black.woff2
docs/archive/handbook/fonts/geistmono/GeistMono-BlackItalic.woff2
docs/archive/handbook/fonts/geistmono/GeistMono-Bold.woff2
```

---
## 2026-04-30 17:26 — `a2bb24b` — master

- **Agent**: Classy
- **Commit**: chore(governance): untrack local ai artifacts
- **Files changed**: 129 file(s)

```
.agent/01_PANDUAN_PENGUMPULAN_BAHAN_SENTRA_CDSS_v1.md
.agent/CURATION_TASKS.md
.agent/MASTER_CONTEXT_2026-04-19.md
.agent/MASTER_SITREP.md
.agent/PROGRESS.archive.md
.agent/reports/2026-04-20-symphony-alignment.md
.agent/reports/2026-04-20-symphony-coverage-audit.md
.agent/reports/2026-04-23-abyss-core-rag-bucket-audit.md
.agent/reports/2026-04-23-abyss-core-runtime-rag-bucket-audit.md
.agent/reports/2026-04-23-abyss-core-tooling-docs-bucket-audit.md
.agent/reports/2026-04-23-rag-bucket-status.txt
.agent/reports/2026-04-23-rag-bucket.pathspec
.agent/reports/2026-04-23-runtime-rag-bucket-status.txt
.agent/reports/2026-04-23-runtime-rag-bucket.pathspec
.agent/reports/2026-04-23-tooling-docs-bucket-status.txt
.agent/reports/2026-04-23-tooling-docs-bucket.pathspec
.agent/sessions/2026-04-13.md
.agent/sessions/2026-04-14.md
.agent/sessions/2026-04-15-audit-clearance.md
.agent/sessions/2026-04-15-audit-gitignore-patches.md
```

---
## 2026-04-30 17:51 — `bfd7e3c` — master

- **Agent**: Classy
- **Commit**: chore(branding): refresh repo and portal avatar
- **Files changed**: 4 file(s)

```
.github/abyss.png
platform/sentra-portal/components/kokonutui/profile-01.tsx
platform/sentra-portal/components/kokonutui/top-nav.tsx
platform/sentra-portal/public/avatars/abyss-doctor.png
```

---
## 2026-04-30 19:03 — `8fd1956` — master

- **Agent**: Avvcenna+
- **Commit**: chore(rebrand): rename Avvcenna to Classy
- **Files changed**: 59 file(s)

```
.agent/ARCHITECTURE.md
.agent/CONTEXT.md
.agent/HANDOFF.md
.agent/PROGRESS.md
.github/Avvcenna+.png
.github/CODEOWNERS
.github/Classy.png
.github/PULL_REQUEST_TEMPLATE.md
.github/workflows/auto-fix.yml
.github/workflows/doc-guard.yml
AGENTS.md
CHANGELOG.md
CLAUDE.md
CONTRIBUTING.md
LICENSE
ONBOARDING.md
README.md
conductor/ORCHESTRATOR.md
docs/adr/README.md
docs/blueprint/infrastructure.md
```

---
## 2026-04-30 19:29 — `056229a` — master

- **Agent**: Avvcenna+
- **Commit**: docs(readme): expand AI inventory and capability map
- **Files changed**: 1 file(s)

```
README.md
```

---
## 2026-04-30 20:17 — `dcfd55c` — master

- **Agent**: Avvcenna+
- **Commit**: chore(legal): establish B2G IP protection architecture
- **Files changed**: 157 file(s)

```
AGENTS.md
LICENSE
docs/legal/MSA-template.md
docs/legal/NDA-template.md
docs/legal/ToS-template.md
packages/clinical-references/package.json
packages/config-eslint/package.json
packages/config-typescript/package.json
packages/database/package.json
packages/design-token/package.json
packages/document-ingestion/package.json
packages/fhir-engine/package.json
packages/fhir-engine/src/__tests__/aadi-v2-fhir-bundle.test.ts
packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts
packages/fhir-engine/src/__tests__/fhir-engine.test.ts
packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
packages/fhir-engine/src/__tests__/transformer.test.ts
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/__tests__/validator.test.ts
packages/fhir-engine/src/__tests__/version-strategy.test.ts
```

---
## 2026-04-30 20:37 — `9693b19` — master

- **Agent**: Avvcenna+
- **Commit**: docs(architecture): add complete monorepo reference diagram
- **Files changed**: 1 file(s)

```
docs/architecture/sentra-monorepo-diagram.md
```

---
## 2026-04-30 21:11 — `d5fc2d3` — master

- **Agent**: Avvcenna+
- **Commit**: chore(rename): crown jewel packages → Sentra identity names
- **Files changed**: 389 file(s)

```
AGENTS.md
flows/definitions/healthcare/assist-flow.json
flows/definitions/healthcare/referral-flow.json
packages/fhir-engine/README.md
packages/fhir-engine/package.json
packages/fhir-engine/src/__tests__/aadi-v2-fhir-bundle.test.ts
packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts
packages/fhir-engine/src/__tests__/fhir-engine.test.ts
packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
packages/fhir-engine/src/__tests__/transformer.test.ts
packages/fhir-engine/src/__tests__/validation-hooks.test.ts
packages/fhir-engine/src/__tests__/validator.test.ts
packages/fhir-engine/src/__tests__/version-strategy.test.ts
packages/fhir-engine/src/aadi-v2-fhir-bundle.ts
packages/fhir-engine/src/index.ts
packages/fhir-engine/src/transformer.ts
packages/fhir-engine/src/types.ts
packages/fhir-engine/src/validation-hooks.ts
packages/fhir-engine/src/validator.ts
packages/fhir-engine/src/version-strategy.ts
```

---
## 2026-04-30 21:37 — `97e669c` — master

- **Agent**: Avvcenna+
- **Commit**: chore(cleanup): remove rogue Gemini artifacts and Obsidian config
- **Files changed**: 9 file(s)

```
.gitignore
.obsidian/app.json
.obsidian/appearance.json
.obsidian/core-plugins.json
.obsidian/workspace.json
conductor/ORCHESTRATOR.md
conductor/agent-execution.md
conductor/agent-registry.yaml
conductor/handoff-schema.ts
```

---
## 2026-04-30 22:50 — `8143709` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] fix: repair stale tsconfig paths from prior rename
- **Files changed**: 1 file(s)

```
tsconfig.json
```

---
## 2026-04-30 22:52 — `fa0103c` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] docs: add package taxonomy handoff and ADR 0008
- **Files changed**: 2 file(s)

```
docs/adr/0008-package-taxonomy-and-boundary-model.md
docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-HANDOFF.md
```

---
## 2026-04-30 22:53 — `d38e869` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] refactor: move packages into taxonomy folders (git mv)
- **Files changed**: 544 file(s)

```
packages/clinical-references/README.md
packages/clinical-references/package.json
packages/clinical-references/src/__tests__/clinical-references.test.ts
packages/clinical-references/src/contracts.ts
packages/clinical-references/src/ddi.ts
packages/clinical-references/src/dosage.ts
packages/clinical-references/src/epidemiology.ts
packages/clinical-references/src/index.ts
packages/clinical-references/src/pharmacotherapy.ts
packages/clinical/clinical-references/README.md
packages/clinical/clinical-references/package.json
packages/clinical/clinical-references/src/__tests__/clinical-references.test.ts
packages/clinical/clinical-references/src/contracts.ts
packages/clinical/clinical-references/src/ddi.ts
packages/clinical/clinical-references/src/dosage.ts
packages/clinical/clinical-references/src/epidemiology.ts
packages/clinical/clinical-references/src/index.ts
packages/clinical/clinical-references/src/pharmacotherapy.ts
packages/config-eslint/.eslintrc.json
packages/config-eslint/README.md
```

---
## 2026-04-30 22:55 — `2f925e0` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] chore: update workspace and build configuration
- **Files changed**: 4 file(s)

```
.github/CODEOWNERS
platform/orchestrator/tsconfig.json
pnpm-workspace.yaml
tsconfig.json
```

---
## 2026-05-01 — ABYSS-REPO-STRUCTURE-001 phase close-out (working tree)

- **Agent:** Codex
- **What:** Closed the remaining governance/doc/report phases for the package taxonomy migration by adding package-boundary ESLint restrictions, syncing active taxonomy references in steering docs, and writing final execution + verification reports.
- **Validation:** `pnpm install` PASS; `pnpm turbo run build`, `pnpm turbo run lint`, and `pnpm turbo run test` all executed and failed on local module-resolution / `.pnpm` instability rather than package-path drift.
- **Artifacts:** `docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-EXECUTION-REPORT.md`, `docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-VERIFICATION-REPORT.md`

---
## 2026-05-01 01:49 — `4a903fa` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] fix: complete phase 3 path follow-ups
- **Files changed**: 6 file(s)

```
packages/platform/literature-harvester/tsconfig.json
packages/sentra/sentra-nada/src/interop/fhir-bundle-projection.ts
packages/sentra/sentra-nada/src/interop/symphony-to-fhir.ts
pnpm-lock.yaml
pnpm-workspace.yaml
tsconfig.json
```

---
## 2026-05-01 01:49 — `118a049` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] feat: enforce package taxonomy boundaries
- **Files changed**: 1 file(s)

```
packages/tooling/config-eslint/base.js
```

---
## 2026-05-01 01:49 — `ea3f9b1` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] docs: update agent steering and architecture
- **Files changed**: 7 file(s)

```
.agent/ARCHITECTURE.md
.agent/CONTEXT.md
AGENTS.md
README.md
docs/architecture/sentra-monorepo-diagram.md
docs/guides/package-taxonomy-migration.md
docs/templates/HANDOFF.md
```

---
## 2026-05-01 01:50 — `2d5ee85` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] docs: add execution and verification reports
- **Files changed**: 5 file(s)

```
.agent/HANDOFF.md
.agent/PROGRESS.md
docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-EXECUTION-REPORT.md
docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-HANDOFF.md
docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-VERIFICATION-REPORT.md
```

---
## 2026-05-01 01:50 — `dc5a51f` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: chore(rename-cleanup): finish symphony→nada / sentra-rag→pustaka consumer updates
- **Files changed**: 5 file(s)

```
platform/orchestrator/package.json
platform/orchestrator/src/sagas/diagnosis-flow.saga.ts
platform/orchestrator/src/sagas/symphony-bridge.spec.ts
platform/orchestrator/src/sagas/symphony-bridge.ts
tooling/scripts/rag/medical-search.ts
```

---
## 2026-05-01 02:04 — `356f62e` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: [ABYSS-REPO-STRUCTURE-001] fix: restore tailwindcss hoisting workaround for @the-abyss/ui
- **Files changed**: 2 file(s)

```
package.json
pnpm-lock.yaml
```

---
## 2026-05-01 11:50 — `5bc3ad9` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: docs(spec): align clinical trajectory specs with prevention-first direction
- **Files changed**: 2 file(s)

```
docs/specs/clinical-trajectory-v1-specification.md
docs/specs/ct_spec_v_1.md
```

---

## 2026-05-01 14:21 — CT v1 implementation prep

- **Agent**: Codex
- **What**: Strengthened the ClinicalTrajectory v1 implementation brief for Claude Code, with explicit reuse rules, scope boundaries, file targets, and verification gates.
- **Files changed**: `.agent/HANDOFF.md`, `.agent/PROGRESS.md`, `.agent/sessions/2026-05-01.md`

---

## 2026-05-01 14:38 — CT v1 Chief decisions locked

- **Agent**: Codex
- **What**: Locked the 2 open CT v1 decisions into `.agent/HANDOFF.md`: fixtures-only data source for v1, augment Intelligenceboard, and new independent `ClinicalTrajectoryV1Card.tsx` for Sentra Assist.
- **Operational rule**: `.agent/` remains the mandatory working handoff surface; no external handoff artifact is used for CT v1.

---

## 2026-05-01 14:51 — `/class-postcode` slash command added

- **Agent**: Codex
- **What**: Added a repo-local Claude slash command for post-coding verification on changed files only, with mandatory static/test/security/compatibility gates and a final GO/NO-GO outcome.
- **Files changed**: `.claude/commands/class-postcode.md`, `.agent/sessions/2026-05-01.md`, `.agent/PROGRESS.md`

---

## 2026-05-01 14:55 — CT v1 contract + consumer rendering landed

- **Agent**: Claude (Opus 4.7)
- **What**: Landed ClinicalTrajectory v1 as a contract-first consumer-rendering layer. Single shared-types contract (`packages/shared/shared-types/src/clinical-trajectory.ts`, 474 lines, 9 discriminator unions, 7 interfaces, envelope linked to SYMPHONY, review-note hook, 3 fixtures). Extended shared-types tests from 2 → 6 cases (response states, raw/derived split, escalation, sparse-data missingness, JSON round-trip, advisory-only copy). Polished sparse fixture: vitals `0` → `null` to honor missingness rule.
- **Verification**: shared-types `typecheck` ✅. shared-types tests via tsx (workspace fallback) **6/6 ✅**. IB `ClinicalTrajectoryV1Panel.test.tsx` **3/3 ✅**. Assist app-wide `typecheck` ❌ with pre-existing CT-unrelated Vitest matcher typing errors in `DiagnosisSuggestions.test.tsx`, `DosageCalculator.test.tsx`, and `HTNCrisisTriage.test.tsx`. Boundary guard grep returns **0 matches** in `packages/platform/document-ingestion/`, `platform/`, `flows/`.
- **Decisions locked (also recorded in `.agent/DECISIONS.md`)**: D1 fixtures-only · D2 new file `ClinicalTrajectoryV1Card.tsx` for Assist · D3 single contract file · D4 augment IB panel via optional prop + conditional mount · D5 existing engines untouched.
- **Files added**: `packages/shared/shared-types/src/clinical-trajectory.ts`, `packages/shared/shared-types/src/clinical-trajectory.test.ts`.
- **Files modified**: `packages/shared/shared-types/src/index.ts` (barrel export added).
- **Files unchanged but verified in HEAD**: IB `ClinicalTrajectoryV1Panel.tsx`, IB `ClinicalTrajectoryV1Panel.test.tsx`, IB `TrajectoryIntelligencePanel.tsx` (mount), IB `index.ts`, Assist `ClinicalTrajectoryV1Card.tsx`, Assist `ClinicalTrajectory.tsx` (mount), Assist `index.ts`.
- **Out of scope (preserved)**: no FHIR change, no orchestrator/flows/ingestion wiring, no diagnosis-engine surface, no `wxt.config.ts` change, no new dependency.
- **Follow-up**: shared-types lacks a native `test` script; node:test resolves `'./clinical-trajectory'` only with explicit `.ts` extension or via tsx. Workaround: invoke IB's `tsx` from shared-types. Adding a `test` script to `packages/shared/shared-types/package.json` deferred to a separate commit to keep this change additive only.

---

## 2026-05-01 18:05 — ClinicalTrajectory scope clarified for future threads

- **Agent**: Codex
- **What**: Added a focused `.agent/HANDOFF.md` reset so future Codex threads do
  not confuse the landed CT v1 contract with the unimplemented 52-trajectory
  engine target defined in `docs/task/`.
- **Canonical clarification**:
  - `docs/task/Feature-Clinical Trajectory.md` = target **52 trajectories / 5 quadrants** taxonomy
  - `docs/task/Input for Clinical Trajectory.md` = target CT input-output shape
  - `docs/task/Summary Clinical Trajectory.md` = target modeling architecture and validation posture
  - commit `2576984` = **contract-first CT v1 shell only**, not full engine logic
  - executable logic still lives in existing trajectory analyzers / momentum / convergence / baseline helpers
- **Next required analytical step**: build a coverage map from `docs/task` 52-taxonomy
  to the existing executable engine surfaces before making any claim that CT logic
  or algorithms are complete.

---

[2026-05-01 19:06] CT Adapter Phase A complete — 14/14 tests pass. Files: ct-adapter.ts (new), ct-coverage-registry.ts (new, 52 entries), ct-adapter.test.ts (new). Coverage: 0/52 executable, 12 partial, 40 missing. Legacy engines untouched. treatmentResponsiveness='unknown' always. linkedReasoning.authority='SYMPHONY' always. Next: Phase B (treatment layer, T-51/T-52), Phase C (NEWS2, T-50), Phase D (CRP lab, T-48).
## 2026-05-01 19:09 — `6aa81c2` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: docs(agent): CT Adapter Phase A complete — 14/14 tests pass
- **Files changed**: 2 file(s)

```
.agent/HANDOFF.md
.agent/PROGRESS.md
```

---
## 2026-05-01 19:11 — `9a3c549` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: feat(ct-v1): Phase A — adapter, coverage registry, and tests
- **Files changed**: 3 file(s)

```
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts
```

---
## 2026-05-01 19:18 — `6bcc405` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: feat(ct-v1): Phase C — computeNEWS2, T-50 partial coverage
- **Files changed**: 5 file(s)

```
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts
apps/healthcare/intelligenceboard/src/lib/clinical/news2-score.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/news2-score.ts
```

---
[2026-05-01 19:30] CT Adapter Phase B complete — treatment-response scorer implemented. T-51/T-52 promoted from missing to partial. TreatmentEvent interface, classifyTreatmentResponse (HR slope thresholds T-51/T-52), aggregateResponsiveness, buildTreatmentTimeline. legacyIBToCtV1 accepts optional treatments param. 43/43 tests pass (treatment-response-scorer: 23, ct-adapter: 20). Shared-types typecheck clean. Files: treatment-response-scorer.ts (new), treatment-response-scorer.test.ts (new), ct-adapter.ts (updated), ct-coverage-registry.ts (updated), ct-adapter.test.ts (updated). Next: Phase D (CRP/lab extension for T-48).
## 2026-05-01 19:33 — `ac0487d` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: feat(ct-v1): Phase B — treatment-response scorer, T-51/T-52 partial
- **Files changed**: 7 file(s)

```
.agent/HANDOFF.md
.agent/PROGRESS.md
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts
apps/healthcare/intelligenceboard/src/lib/clinical/treatment-response-scorer.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/treatment-response-scorer.ts
```

---
## 2026-05-01 19:51 — `6b8e3aa` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: feat(ct-v1): land Phase D CRP lab layer + T-48 Infectious Surge partial coverage
- **Files changed**: 5 file(s)

```
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts
apps/healthcare/intelligenceboard/src/lib/clinical/lab-event-scorer.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/lab-event-scorer.ts
```

---

[2026-05-01 19:51] Phase D complete — CRP lab layer landed. LabEvent interface + classifyInfectiousSurge() (T-48 formula: slope ≥ 37 mg/L/hr). T-48 promoted from missing→partial in registry. labsTimeline + T-48 derived point wired into legacyIBToCtV1. 125/125 tests pass. Commit: 6b8e3aa. instabilityPattern override deferred to Phase D+ (SYMPHONY).
[2026-05-01 20:00] CT Consolidation Audit complete — state verified across registry, adapter seams, HANDOFF.md, PROGRESS.md. Registry: 16 partial / 36 missing / 0 covered = 52 canonical ✓. Governance fixes: (1) Phase C section restored in HANDOFF.md (was missing; commit was in PROGRESS only); (2) Phase D test table corrected (treatment-response-scorer 43→23, TOTAL 145→125). Quality audit documented: T-50/NEWS2 is strongest seam (STRONG Scale 1); T-48/T-51/T-52 are MODERATE (formula-based but require caller inputs); T-45/T-46/T-47/T-49 are WEAK PROXY or SYMBOLIC (convergence pattern mapping, not spec formulas). Priority: Phase D+ (instabilityPattern wire for T-48) → Phase F (T-49 GCS) → Phase G (T-01 logistic) → Phase E (SYMPHONY, blocked by orchestrator).
[2026-05-01 21:23] Phase C.2 complete — NEWS2 Scale 2 (COPD flag) additive support. computeNEWS2() accepts NEWS2ComputeOptions { spo2Scale?: 1|2 }; CTAdapterOptions { copdScale2?: boolean } wired through legacyIBToCtV1 → buildDerivedTimeline → computeNEWS2; news2:scale2 flag in derivedTimeline when Scale 2 active. T-50 registry updated (COPD flag gap resolved). 136/136 tests pass. 125 existing tests unmodified. Commit: fdc4931. Phase A (T-48 instabilityPattern) parked — awaiting Chief decision on biomarker-driven instabilityPattern at adapter layer.
## 2026-05-01 19:54 — `e1f3400` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: chore(agent): update HANDOFF + PROGRESS for Phase D CRP lab layer completion
- **Files changed**: 2 file(s)

```
.agent/HANDOFF.md
.agent/PROGRESS.md
```

---
## 2026-05-01 20:25 — `783653b` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: chore(agent): CT consolidation audit — restore Phase C docs, fix test count, add quality audit
- **Files changed**: 2 file(s)

```
.agent/HANDOFF.md
.agent/PROGRESS.md
```

---
## 2026-05-01 21:23 — `fdc4931` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: feat(ct-v1): Phase C.2 — NEWS2 Scale 2 (COPD flag) additive support
- **Files changed**: 5 file(s)

```
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts
apps/healthcare/intelligenceboard/src/lib/clinical/news2-score.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/news2-score.ts
```

---
## 2026-05-01 21:35 — `f3fc004` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: chore(agent): update HANDOFF + PROGRESS for Phase C.2 (NEWS2 Scale 2)
- **Files changed**: 2 file(s)

```
.agent/HANDOFF.md
.agent/PROGRESS.md
```

---

[2026-05-01 23:48] Phase F (T-49 GCS seam) complete — additive seam only, legacy engines untouched. New: gcs-scorer.ts (22 tests), shared-types ClinicalTrajectoryGCSPoint + gcsTimeline, CTAdapterOptions.gcsEvents wired. 163/163 pass. T-49 status: partial (caller must supply GCSEvent[]). Typecheck: EXIT:0.
## 2026-05-02 01:11 — `72ed862` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: feat(ct-v1): Phase F — T-49 GCS seam additive support
- **Files changed**: 6 file(s)

```
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts
apps/healthcare/intelligenceboard/src/lib/clinical/gcs-scorer.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/gcs-scorer.ts
packages/shared/shared-types/src/clinical-trajectory.ts
```

---
## 2026-05-02 01:11 — `6acb6df` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: chore(agent): update HANDOFF + PROGRESS for Phase F (GCS seam)
- **Files changed**: 2 file(s)

```
.agent/HANDOFF.md
.agent/PROGRESS.md
```

---
## 2026-05-02 01:50 — `fd21473` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Avvcenna+
- **Commit**: fix(ct-v1): Phase F review fixes — GCS seam clarity + timestamp honesty
- **Files changed**: 4 file(s)

```
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
apps/healthcare/intelligenceboard/src/lib/clinical/gcs-scorer.test.ts
apps/healthcare/intelligenceboard/src/lib/clinical/gcs-scorer.ts
```

---
## 2026-05-06 12:06 — `e130591` — refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy

- **Agent**: Classy+
- **Commit**: chore: snapshot in-progress refactor + governance updates
- **Files changed**: 63 file(s)

```
.agent/DECISIONS.md
.agent/PROGRESS.md
.github/commands/gemini-invoke.toml
.github/commands/gemini-plan-execute.toml
.github/commands/gemini-review.toml
.github/commands/gemini-scheduled-triage.toml
.github/commands/gemini-triage.toml
.github/workflows/ai-review.yml
.github/workflows/auto-fix.yml
.github/workflows/auto-merge.yml
.github/workflows/ci.yml
.github/workflows/doc-guard.yml
.github/workflows/gemini-dispatch.yml
.github/workflows/gemini-invoke.yml
.github/workflows/gemini-plan-execute.yml
.github/workflows/gemini-review.yml
.github/workflows/gemini-scheduled-triage.yml
.github/workflows/gemini-triage.yml
.github/workflows/generate-documentation.yml
.github/workflows/maintenance.yml
```

---
