# HANDOFF.md — The Abyss (Monorepo Root)
<!-- Overwrite at the start of each new session. -->
<!-- Last updated: 2026-04-29 · Agent: GPT-5.4 · Session: consumer-trial-readiness-reset -->

---

## Authority Reminder
**AGENTS.md is supreme authority.** This file is operational context only.
Before acting: read CONTEXT.md → PROGRESS.md → this file → LESSONS.md → DECISIONS.md.

---

## Quick Orient (for new thread)

**Branch:** `master` · repo topology sudah kembali tunggal, bersih, dan aktif di jalur `master`; engine close-out anchored on `255c50f`
**Working tree:** Classy rebrand in-progress (Chief owns) + misc drift — do NOT touch
**Cursor IDE (2026-04-28):** User-level + profile `Classy` sudah di-hardten per audit plan — Claude Code bypass permission dimatikan, wrapper dihapus, overlap extension dikurangi; detail di `.agent/sessions/2026-04-28.md`.
**Primary mission:**
1. **Consumer Trial Readiness** — move from core-engine completion into operational rollout preparation.
2. **Dashboard / ASSIST readiness** — prepare consumer adoption in the correct order: Dashboard first, ASSIST second.
3. **Shadow telemetry + limited trial** — lock observability and controlled rollout criteria before broader adoption.
4. **Retrieval lane is supporting only** — RAG packages may support grounding/retrieval, but must not become parallel clinical engines.
5. **Legacy lock:** `packages/ai-core` has been retired locally on 2026-04-25; do not recreate or depend on it again.

**Session addendum (2026-04-29):**
- Current working thread is the Google / Vertex / Gemini exit cleanup.
- Keep that effort separated from broader consumer trial readiness work.
- Do not start runtime removal or package rewrites until Chief gives explicit `GO` for the technical cutover.

**Session addendum (2026-04-30):**
- Cursor rules now include an always-on Chief directive bridge at `.cursor/rules/05-chief-directive-mode.mdc`.
- Future Cursor sessions should front-load latest official notes when relevant, respond in Bahasa Indonesia to Chief, and stop for explicit `GO` before implementation.
- AGENTS.md corrected (2026-04-30 19:06) to clarify `packages/database` scope: it is platform-level only; healthcare apps own their databases (see `.agent/DECISIONS.md` 2026-04-27).
- Workspace ghost mitigation applied: `tooling/kilo/worktrees/**` is excluded from discovery so pnpm does not resolve the stale flat-repo snapshot as an active workspace source.
- **Cursor settings (2026-04-30):** `.vscode/settings.json` adds monorepo watcher/search excludes; `docs/cursor/cursor-settings-profiles.md` documents Solo-Dev-Perf vs NonCoder-Simple user JSON blocks, baseline audit of Chief's User settings, and hook cost (keep `autofix-loop`, optional local-disable); `.cursorindexingignore`: typo `apps/coorporate/` fixed earlier; follow-up fix **`apps/orchestrator/` → `platform/orchestrator/`** so indexing exclude matches AGENTS.md layout.

**Session addendum (2026-05-01):**
- Handbook readability: wrapping anti-cutoff diterapkan pada `docs/handbook/classy.html`, `docs/handbook/avcn-commands.html`, dan `docs/handbook/avcn-tips.html` supaya teks turun ke bawah saat kolom dipersempit.
- Handbook index: `docs/handbook/classy.html` ditambah quick links localhost (`127.0.0.1:8765`) untuk buka `avcn-cursor.html`, `avcn-tips.html`, `avcn-commands.html` dalam mode full render.
- Handbook: `docs/handbook/avcn-cursor.html` — ringkasan best practice Cursor 2026 (Rules, Context/ignore, MCP, Skills, Agent, Hooks) + token Sentra; footer `avcn-tips.html` menaut ke halaman ini.
- `ABYSS-REPO-STRUCTURE-001` package taxonomy mission now has Phase 7 artifacts at `docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-EXECUTION-REPORT.md` and `docs/sentratorium/sessions/ABYSS-REPO-STRUCTURE-001-VERIFICATION-REPORT.md`.
- Phase 5 boundary enforcement was implemented in `packages/tooling/config-eslint/base.js`.
- Phase 6 steering/docs were synced across `AGENTS.md`, `README.md`, `.agent/CONTEXT.md`, `.agent/ARCHITECTURE.md`, `docs/templates/001-handoff.md`, and `docs/architecture/sentra-monorepo-diagram.md`.
- Final validation commands were run; `pnpm install` passed, while `build`, `lint`, and `test` remained blocked by local module-resolution instability in the `.pnpm` tree rather than by taxonomy path drift.
- `docs/handbook/avcn-commands.html` selesai diredesign agar patuh Sentra design token: memuat `sentra-tokens.css`, mengganti hardcoded color ke `var(--sentra-*)`, merapikan font Geist Mono lokal, dan menambahkan struktur semantik ringan (`main/section/h1/h2/th scope`).

---

## Active Task

**Consumer Trial Readiness**

`@the-abyss/symphony` is now considered complete for the planned AADI V2 core reasoning scope. The next lane is operational: prepare consumers, validate telemetry posture, and define a controlled limited-trial envelope. Do not reopen foundation-build framing unless Chief explicitly changes scope.

### Closed core deliverables
- Clinical facts, syndrome classification, diagnosis packs, native differential, reasoning arbiter, explainability, and clinical disposition are all closed in `@the-abyss/symphony`.
- `assess.ts` integration, shadow comparison, and parity verification are closed.
- Orchestrator now uses `assessSymphonyInput()` as the platform thin-client path.
- FHIR Bundle interop promotion lane is formalized with `@the-abyss/fhir-engine` as bounded structural validation home.
- CDS Hooks is formalized and intentionally remains in `packages/symphony`.
- Hardening patch `882775a` closed PHI-safe DLQ, removed silent `vertex-rag` fallback behavior, and tightened saga persistence typing.

### Verification baseline
- `@the-abyss/symphony` test → 373/373 PASS
- `@the-abyss/orchestrator` test → 46/46 PASS
- `@the-abyss/orchestrator` typecheck → PASS
- `@the-abyss/fhir-engine` test → 64/64 PASS
- `@the-abyss/vertex-rag` test → 5/5 PASS before retirement

### Priority lanes
1. **Dashboard readiness**
   - define adoption seam over current SYMPHONY outputs
   - confirm no legacy mock reasoning remains in the Dashboard path
   - prepare rollout checklist before turning on broader consumption
2. **ASSIST readiness**
   - start only after Dashboard readiness is explicit
   - treat ASSIST as the second consumer, not the proving ground
3. **Shadow telemetry**
   - define metrics/logs needed to observe parity, traffic-light behavior, alert semantics, and disposition drift
   - require operational visibility before broader rollout claims
4. **Limited trial**
   - define entry criteria, observation window, rollback posture, and success/failure thresholds
   - keep trial narrow and controlled; this is not general availability

---

## Boundary Lock

- `@the-abyss/symphony` remains the only canonical clinical reasoning engine.
- `@the-abyss/fhir-engine` remains the bounded structural validation home and FHIR Bundle assembly lane, not a reasoning package.
- CDS Hooks remains in `packages/symphony` because it is workflow-semantics-bound.
- `@the-abyss/sentra-rag`, `@the-abyss/vector-store`, and `@the-abyss/literature-harvester` stay retrieval-side only.
- Do not reframe rollout work as a reason to rebuild the engine foundation.

---

## Immediate Next Steps

1. Write or refresh the operational checklist for **Dashboard readiness**.
2. Define the **shadow telemetry** set required for consumer rollout confidence.
3. Prepare the **limited trial** envelope and rollback expectations.
4. Only after the first three are explicit, frame **ASSIST readiness** as the next consumer lane.

---

## Known Entanglements (DO NOT TOUCH)

1. **Classy rebrand in working tree** — Chief's in-progress. Do NOT commit rebrand files.
2. **2 pre-existing stashes** — bukan Claude punya. Do NOT `stash pop`.
3. **`packages/symphony/.agent/` misplaced hook session artifact** — historical bug residue. Leave as-is unless Chief explicitly orders archive/removal.
4. **Unrelated working tree drift** — `.env.example`, `.gitignore`, `AGENTS.md`, infra Terraform, dll. Do NOT `git add .` / `-A`.
5. **Push hold active** — Chief belum authorize push ke origin.

---

## Incident Context (active lock)

- **Lock:** `packages/database` bukan healthcare DB migration target.
- **Hierarchy lock:** SYMPHONY parent; Dashboard + Assist = consumers.
- **Operational phase lock:** current lane = consumer trial readiness, not foundation rebuild.
- **sentra-rag DB:** bukan `packages/database` — Neon connection langsung di `.env` lokal.

---

## Next Action Options (Chief choose)

1. **Dashboard readiness** — make the first consumer rollout-ready.
2. **Shadow telemetry definition** — lock the observability surface before rollout claims.
3. **Limited trial gating** — define the narrow operational trial envelope.
4. **ASSIST readiness** — prepare second-consumer adoption only after Dashboard and telemetry are stable.

---

## Do-Not-Touch Contract

- ❌ Tidak commit Classy rebrand working tree (Chief own)
- ❌ Tidak pop stash@{0} atau stash@{1}
- ❌ Tidak push ke remote tanpa Chief explicit GO
- ❌ Tidak touch `packages/database` sebagai healthcare target
- ❌ Tidak `git add .` / `-A`
- ❌ Tidak skip GUARD-1 / JET-5 / JET-7

---

**Fresh thread protocol:** Read CONTEXT → PROGRESS → this file → LESSONS → DECISIONS. Output CONTEXT LOADED confirmation. Wait for Chief instruction.

---

## 2026-05-01 addendum — GitHub Actions (vendor-clean stack)

- Implemented: `reusable-verify.yml` + thin `ci.yml`; `maintenance.yml`; `ai-review.yml` placeholder; hardened `security-scan.yml`; fork-safe `auto-fix.yml`; aligned `generate-documentation.yml` to Node 22 / pnpm 9.15; `doc-guard` / `pr-label` concurrency + read permissions; `auto-merge` default read.
- Verify gate: `pnpm governance:agents-check` + `pnpm --filter @sentra/bentara run start` (replaces removed `@the-abyss/iskandar-gatekeeper`).
- **Chief follow-up:** refresh branch protection required checks to match UI names under **The Abyss CI** and **Security Scan** (see `AGENTS.md` §11).

---
## 2026-04-25 Architecture Alignment Addendum

**New clarity from package review:**

- `@the-abyss/symphony` remains the only canonical clinical reasoning engine.
- `@the-abyss/clinical-references` remains the sibling reference layer.
- `@the-abyss/shared-types` remains the contract backbone.
- `@the-abyss/sentra-rag`, `@the-abyss/vector-store`, and `@the-abyss/literature-harvester` are retrieval-side packages only. They must not evolve into parallel clinical engines.

**Main risk now is not SYMPHONY itself.** Main risk is retrieval-boundary drift:

1. `sentra-rag` already owns local-first ingest/query orchestration.
2. `vector-store` should stay a storage/index abstraction, not another orchestrator.
3. `literature-harvester` stays acquisition-only and feeds corpus readiness, not diagnosis authority.

**Operational consequence for next agent:**

- Do **not** start Dashboard or ASSIST rewiring from any retrieval package.
- The next strategic task is no longer diagnosis-engine framing; it is **consumer trial readiness** on top of the now-closed engine.
- Only after readiness and telemetry are locked should consumer rewiring begin:
  1. Dashboard first
  2. ASSIST second

---

## 2026-05-01 — CT v1 Final State (Claude Opus 4.7)

Commit `2576984` — `feat(ct-v1): land ClinicalTrajectory v1 contract + fixtures`.

**Verified passing (fresh runs, this session):**
- `pnpm --filter @the-abyss/shared-types typecheck` → exit 0.
- `pnpm --filter @the-abyss/shared-types lint` → exit 0.
- `pnpm --dir apps/healthcare/intelligenceboard exec tsx --test ../../../packages/shared/shared-types/src/clinical-trajectory.test.ts` → 6/6 pass, exit 0.
- `pnpm --dir apps/healthcare/intelligenceboard exec tsx --test src/components/features/trajectory/ClinicalTrajectoryV1Panel.test.tsx` → 3/3 pass, exit 0.
- `pnpm --filter @the-abyss/integration-bridge build` → exit 0 (covers `fs-extra → node:fs/promises` swap in `packages/integration-bridge/src/index.ts`).
- Boundary guard: `ClinicalTrajectory|clinical-trajectory|ct.v1` returns 0 matches in `packages/platform/document-ingestion/`, `platform/`, `flows/`.
- Existing trajectory engines (5 files in IB `src/lib/clinical/`, 1 file in Assist `lib/iskandar-diagnosis-engine/`) — `git diff HEAD~1 HEAD` returns 0 lines for those paths in commit `2576984`.

**Pre-existing failure (recorded — NOT in current patch scope):**
- `pnpm --filter @the-abyss/sentra-assist typecheck` → exit 2, 39 errors of type `Property 'toBeInTheDocument' does not exist on type 'Assertion<HTMLElement>'`.
- Erroring files: `components/clinical/DiagnosisSuggestions.test.tsx`, `components/clinical/DosageCalculator.test.tsx`, `components/clinical/HTNCrisisTriage.test.tsx`. Zero overlap with the 5 files in commit `2576984` and zero overlap with the 5 uncommitted lane paths below. Root cause is Vitest+jsdom typing setup (likely missing `'@testing-library/jest-dom/vitest'` in tsconfig types) — repo-wide hygiene issue tracked separately.
- Status tags: **pre-existing**, **CT-unrelated**, **outside current patch scope**. Do NOT claim Assist app-wide green.

**Lane scope (this commit-ready batch):**

Already in `2576984` (reference, verified passing this session):
- `packages/shared/shared-types/src/clinical-trajectory.ts`
- `packages/shared/shared-types/src/clinical-trajectory.test.ts`
- `packages/shared/shared-types/src/index.ts`

Uncommitted lane files (proposed follow-up commit):
- `.agent/PROGRESS.md` — `14:51` timestamp filled + honest Assist-typecheck record (pre-existing, CT-unrelated).
- `.agent/HANDOFF.md` — this final-state refresh.
- `.gitignore` — whitelist `.claude/commands/class-postcode.md`.
- `packages/integration-bridge/src/index.ts` — `fs-extra` → `node:fs/promises` swap.
- `.claude/commands/class-postcode.md` — repo-local post-coding verifier slash command.

Explicit out-of-scope (left dirty in working tree, do NOT touch):
- `pnpm-lock.yaml` (unrelated lockfile drift).
- `docs/cursor/`, `docs/handbook/` (untracked directory drift).
- `packages/integration-bridge/tsconfig.json` (older drift — Chief excluded).

**Working-tree state (intentional, do NOT auto-clean):**
- `stash@{0}` retained (prior unrelated working-tree drift: cursor rules, docs cleanup, PROGRESS auto-hook log entry). Not popped per Chief direction.
- An auto-hook may re-touch `.agent/PROGRESS.md` with timestamp normalisation after session ends — that is the hook's contract, not application drift.

**Out of scope (preserved):** No new engine, no FHIR change, no orchestrator/flows/ingestion wiring, no `wxt.config.ts` change, no new dependency, existing trajectory engines untouched. SYMPHONY remains the reasoning authority.

---

## 2026-05-01 — ClinicalTrajectory focus reset for new Codex threads

This addendum supersedes any casual assumption that "CT v1 is done" means the
full Clinical Trajectory engine or the full 52-trajectory taxonomy is already
implemented in code.

### Canonical source of truth for this lane

Read in this order before proposing any CT architecture or implementation:

1. `docs/specs/clinical-trajectory/001-feature-clinical-trajectory.md`
2. `docs/specs/clinical-trajectory/002-input-for-clinical-trajectory.md`
3. `docs/specs/clinical-trajectory/003-summary-clinical-trajectory.md`
4. `docs/specs/004-ct-spec-v1.md`
5. `docs/specs/003-clinical-trajectory-v1-specification.md`
6. `packages/shared/shared-types/src/clinical-trajectory.ts`
7. `apps/healthcare/intelligenceboard/src/lib/clinical/trajectory-analyzer.ts`
8. `apps/healthcare/intelligenceboard/src/lib/clinical/momentum-engine.ts`
9. `apps/healthcare/intelligenceboard/src/lib/clinical/convergence-detector.ts`
10. `apps/healthcare/intelligenceboard/src/lib/clinical/personal-baseline.ts`
11. `apps/healthcare/sentra-assist/lib/iskandar-diagnosis-engine/trajectory-analyzer.ts`

### What `docs/specs/clinical-trajectory` actually means

- `docs/specs/clinical-trajectory/001-feature-clinical-trajectory.md` is the canonical taxonomy target:
  **52 trajectories / 5 quadrants**.
- `docs/specs/clinical-trajectory/002-input-for-clinical-trajectory.md` is the canonical input-output
  shape target for a future canonical CT engine.
- `docs/specs/clinical-trajectory/003-summary-clinical-trajectory.md` is the canonical modeling
  architecture target: layered models, local fit/validation, no fantasy universal
  coefficients.

### What is actually implemented today

- Commit `2576984` landed **CT v1 shared contract + fixtures**, not the full CT
  engine.
- Current executable trajectory logic still lives in the existing legacy
  analyzers and helpers in Intelligenceboard and Sentra Assist.
- No verified repo surface currently materializes the full **52 trajectories**
  as a canonical executable taxonomy.
- Therefore:
  - **CT v1 complete** = contract-first consumer shell complete
  - **CT engine complete** = false
  - **52 trajectory taxonomy executable in code** = false

### Non-negotiable interpretation

- Do not tell Chief that CT logic/algorithm is "finished" unless the work
  explicitly maps and executes the 52-trajectory taxonomy.
- Do not invent a new engine from scratch while ignoring the existing analyzer /
  momentum / convergence / baseline stack.
- Do not claim that the shared-types contract itself generates trajectories. It
  does not.
- Do not widen into orchestrator, flows, ingestion, or FHIR just because the
  taxonomy is larger.

### Required next analytical task before any new implementation claim

Produce a **coverage map**:

1. `52 trajectory taxonomy from docs/specs/clinical-trajectory`
2. `existing executable engine coverage in Intelligenceboard / Assist`
3. `gap list: covered / partially covered / not represented`
4. `canonicalization plan: how legacy outputs should be transformed into a real
   future CT engine`

### Expected framing for the next thread

Use this exact mental model:

- **SYMPHONY** = reasoning authority
- **CT v1 landed** = shared rendering contract
- **Legacy trajectory analyzers** = current executable behavior
- **52 trajectories** = target taxonomy still requiring coverage mapping and
  canonical engine design

---

## 2026-05-01 — ClinicalTrajectory coverage map and implementation-ready analysis

### Executive truth statement

CT v1 landed as a **contract-first shell** in commit `2576984`, specifically as
shared contract + fixtures under `packages/shared/shared-types/src/`; it did
not land a canonical executable CT engine. Current executable trajectory
behavior still lives in the legacy analyzers and helpers in
`apps/healthcare/intelligenceboard/src/lib/clinical/` and
`apps/healthcare/sentra-assist/lib/iskandar-diagnosis-engine/`.

What is implemented now:

- Shared `ClinicalTrajectoryV1` contract and fixtures exist.
- Intelligenceboard legacy analyzer executes deterministic trajectory scoring
  over the latest 5 visits, including vital trends, early-warning burden,
  volatility, acute-risk heuristics, time-to-critical estimates, a mortality
  proxy, chronic-diagnosis extraction, and momentum/baseline/convergence
  enrichment.
- Sentra Assist still has its own legacy analyzer with a narrower version of
  the same rule family.

What is not implemented now:

- No canonical engine that maps the target taxonomy into explicit executable CT
  trajectory classes.
- No verified repo surface that materializes the canonical **52 trajectories /
  5 quadrants** as first-class executable outputs.
- No treatment-aware response engine, no workflow/operational trajectory
  engine, no lab-rich chronic progression engine, and no local-fit validation
  stack as described in `docs/specs/clinical-trajectory/003-summary-clinical-trajectory.md`.

Bottom line:

- **CT v1 complete** = yes, as shared rendering contract.
- **Canonical CT engine complete** = no.
- **52 trajectories executable today** = no.

### Source reality check on taxonomy

- `docs/specs/clinical-trajectory/001-feature-clinical-trajectory.md` is the canonical target framing:
  **52 trajectories / 5 quadrants**.
- The same file currently contains semantic drift inside the body: after the
  canonical `T-45` to `T-52` range, it continues with extra entries
  (`T-53`..`T-62` plus one unnamed combo row). Treat those as taxonomy drift or
  appendix content, not proof that more than 52 trajectories are executable.

### Coverage map

| Taxonomy item or group | Current engine/file coverage | Status | Semantic mismatch / notes |
| --- | --- | --- | --- |
| Q1 Mortality & EOL overall (`T-01`..`T-12`) | `trajectory-analyzer.ts` exposes `mortality_proxy`, `global_deterioration`, `clinical_safe_output` | partial | Current output is a short-horizon vital-driven proxy, not the canonical mortality/EOL family. No explicit trajectory IDs, no event models, no frailty/ADL/palliative state engine. |
| `T-01` Imminent Mortality 0-72h | `trajectory-analyzer.ts` mortality proxy + acute risk + burden | partial | No lactate input, no NEWS2 implementation, no calibrated 0-72h mortality model. |
| `T-02` 30-Day Mortality | `trajectory-analyzer.ts` mortality proxy | partial | No `NEWS2_peak`, no frailty model, no 30-day horizon semantics. |
| `T-03` Palliative Transition | none beyond generic chronic diagnosis extraction | missing | No ICU-readmission count, organ slope, or palliative transition logic. |
| `T-04` Metabolic Age Acceleration | none | missing | No HbA1c, BMI, CRP, eGFR composite model. |
| Q2 acute deterioration family (`T-13`..`T-24`) | `trajectory-analyzer.ts` + `momentum-engine.ts` + `convergence-detector.ts` + `personal-baseline.ts` | partial | Current engine can detect worsening acute dynamics, but only as generic heuristics and patterns, not as canonical `T-13`..`T-24` outputs. |
| `T-13` Imminent Cardiac Arrest | `convergence-detector.ts` cardiovascular / multi-system patterns, `trajectory-analyzer.ts` `shock_decompensation_risk`, `spo2` trend support | partial | No explicit cardiac-arrest trajectory class, no sub-hour model, no calibrated arrest probability. |
| `T-14` Flash ARDS | `convergence-detector.ts` respiratory pattern, `trajectory-analyzer.ts` RR + SpO2 trend | partial | Missing FiO2, oxygen support slope, PaO2/FiO2 ratio, Berlin semantics. |
| `T-15` Neurological Cascade | `VisitRecord` in IB carries optional `avpu`; CT contract has consciousness field | missing | Current analyzers do not compute GCS/Cushing-style neuro cascade. Assist analyzer has no parallel neuro engine. |
| `T-16` Sepsis No-Return | `trajectory-analyzer.ts` `sepsis_like_deterioration_risk`; `convergence-detector.ts` `sepsis_like` | partial | Missing antibiotic delay, qSOFA/GCS implementation, lactate, and formal no-return flag. |
| Remaining Q2 items `T-17`..`T-24` | none as named outputs | missing | No explicit executable mapping found in the required source set. |
| Q3 chronic / general health (`T-25`..`T-36`) | `trajectory-analyzer.ts` glucose trend + chronic diagnosis extraction; `personal-baseline.ts` personal vital baseline | partial | Only generic baseline and diagnosis heuristics exist. No eGFR/creatinine trajectory, frailty, ADL, WHODAS, or disease-progression classes. |
| `T-25`..`T-28` renal / metabolic progression | glucose handling in `trajectory-analyzer.ts`; no renal lab model | missing | No eGFR slope, creatinine composite, insulin/SGLT2i treatment-adjusted progression. |
| `T-29` Loss of Independence / `T-30` Delirium Risk | none | missing | No ADL/Barthel/frailty longitudinal model; no delirium-specific feature set. |
| Q4 operational authority (`T-37`..`T-44`) | none in required engine files | missing | No workflow-state, readmission, ICU-occupancy, or multi-patient operational trajectory logic in the required CT files. |
| `T-45` Respiratory Worsening | `trajectory-analyzer.ts` RR/SpO2 trends and time-to-critical; `convergence-detector.ts` respiratory pattern; `momentum-engine.ts` supports RR/SpO2 velocity | partial | This is the closest legacy fit, but still lacks NEWS2/oxygen/FiO2 semantics from the target model. |
| `T-46` Hemodynamic Instability | `trajectory-analyzer.ts` SBP/DBP/HR trends, shock risk, time-to-critical; `momentum-engine.ts` baseline deviation and velocity | partial | Current output is hemodynamic worsening support, not a named canonical trajectory with explicit class identity. |
| `T-47` Metabolic Crash | `trajectory-analyzer.ts` glucose trend + glycemic crisis risk; `convergence-detector.ts` metabolic pattern | partial | Missing lactate and broader metabolic organ-dysfunction layer. |
| `T-48` Infectious Surge | `trajectory-analyzer.ts` temp + tachycardia + tachypnea; `convergence-detector.ts` sepsis-like | partial | Missing CRP slope, procalcitonin, culture/treatment context. |
| `T-49` Neurologic Decline | none beyond optional consciousness field in contract / IB record | missing | No GCS slope or neurologic decline trajectory execution. |
| `T-50` Mixed Acute | `trajectory-analyzer.ts` global deterioration + volatility; `convergence-detector.ts` `multi_system`; `momentum-engine.ts` `CONVERGING` / `CRITICAL_MOMENTUM` | partial | Current engine can express mixed worsening, but not as NEWS2 aggregate trajectory class. |
| `T-51` Treatment Response Good | generic improving trend + recommendations | partial | No true treatment timeline or segmented response modeling. Improvement is inferred from raw vital movement, not intervention-linked response. |
| `T-52` Treatment Response Poor | generic worsening/non-resolution via trend + burden + recommendations | partial | Same gap as above: no explicit treatment-response episode model. |
| Extra rows beyond 52 (`T-53`..`T-62` and unnamed appendix entry) | none in required engine files | missing | These rows are outside the canonical 52-count and should not be treated as implemented scope. |

### Canonical model gap analysis

#### 1. Raw inputs

Exists today:

- Serial vitals in both legacy analyzers: `sbp`, `dbp`, `hr`, `rr`, `temp`,
  `glucose`; Intelligenceboard also carries `spo2`.
- Complaint text and optional diagnosis.
- Limited patient identity / encounter reference in legacy visit records.
- CT v1 contract shell for baseline, encounter context, vitals, labs, symptoms,
  treatment, derived, response, and quality.

Missing or materially incomplete today:

- No canonical raw input ingestion path into the executable legacy engines for
  `MAP`, `FiO2`, oxygen supplementation, `GCS`, pain score, capillary refill.
- No executable lab trajectory inputs other than glucose.
- No executable treatment timeline inputs.
- No executable workflow context inputs such as setting, triage acuity,
  referral, transfer, admission/discharge state.
- Baseline modifiers are narrower than target; contract and analyzers do not
  cover the full target baseline set.

#### 2. Derived signals

Exists today:

- Trend direction per vital.
- Volatility / stability label.
- Early-warning burden.
- Acute risk heuristics.
- Time-to-critical estimates.
- Personal baseline deviation via `personal-baseline.ts`.
- Momentum, acceleration, and convergence patterning in Intelligenceboard.

Missing or materially incomplete today:

- No executable NEWS2 total/subscores in the required source set.
- No canonical pulse pressure, MAP, fever burden AUC, formal SpO2 drop-rate,
  FiO2-aware respiratory signal, or calibrated event-risk layer.
- No explicit derived-signal to taxonomy-class mapping.

#### 3. Response assessment

Exists today:

- Legacy analyzers produce `overallTrend`, `overallRisk`, summary text,
  recommendations, urgency/risk tier, confidence score, missing-data list, and
  drivers.
- CT v1 contract can hold `direction`, `momentum`, `instabilityPattern`,
  `treatmentResponsiveness`, `severityBand`, and `confidence`.

Missing or materially incomplete today:

- No canonical executable adapter that transforms legacy outputs into the CT v1
  response shape as the primary source of truth.
- No explicit trajectory-ID classification against the 52-target taxonomy.
- No horizon-specific response semantics aligned to the target docs.

#### 4. Treatment-response

Exists today:

- Only indirect inference from pre/post vital movement and recommendation text.
- CT v1 contract has `treatmentTimeline` and `response` fields ready to receive
  treatment-linked context.

Missing or materially incomplete today:

- No executable treatment-response timeline in either analyzer.
- No dose / route / response-window / repeat-intervention / rescue-med /
  adverse-effect logic.
- No segmented or intervention-aware response model.
- Therefore `T-51` and `T-52` are not truly implemented as treatment-response
  trajectories.

#### 5. Quality / missingness

Exists today:

- `deriveMissingData()` in both legacy analyzers.
- Confidence score derived from coverage, temporal depth, volatility, and
  missingness.
- CT v1 contract includes a first-class `quality` node.

Missing or materially incomplete today:

- No duplicate/conflicting reading detection in executable legacy logic.
- No measurement-quality, timestamp-certainty, device-availability, or source
  weighting model in executable legacy logic.
- No systematic quality gating that feeds trajectory-class eligibility.

### Engine alignment analysis

#### `trajectory-analyzer.ts`

How it relates to target CT:

- It is the current executable core for short-horizon, vitals-led trajectory
  support.
- It already covers several target CT ideas in rough form: direction,
  risk/urgency, missingness, confidence, acute instability, and time-to-critical.

Where it diverges:

- It is rule-based over the latest 5 visits, not a canonical CT engine.
- It does not emit taxonomy IDs or quadrant classes.
- It does not execute the target input model end to end.
- It is thin on labs, treatment, workflow, and quality reliability.
- Its mortality and response outputs are heuristic proxies, not the target model
  families described in the summary doc.

#### `momentum-engine.ts`

How it relates to target CT:

- Best match to the target notion of trajectory velocity, acceleration, and
  multi-parameter worsening.
- Useful future feeder for CT `response.momentum` and instability evidence.

Where it diverges:

- Momentum levels (`STABLE`, `DRIFTING`, `ACCELERATING`, `CONVERGING`,
  `CRITICAL_MOMENTUM`) are internal heuristic states, not canonical CT v1
  enumerations and not taxonomy classes.
- No treatment-awareness, no lab-aware chronic progression, no operational
  pathway semantics.

#### `convergence-detector.ts`

How it relates to target CT:

- Best current executable representation of instability patterning:
  respiratory, metabolic, hypertensive/shock, sepsis-like, multi-system.
- Strong candidate as a source for future CT `instabilityPattern`.

Where it diverges:

- Pattern set is still narrower and differently named than the full target
  taxonomy.
- Some target semantics are approximated only loosely. Example: `shock`,
  `cardiovascular`, and `sepsis_like` patterns are not equivalent to named
  target trajectories such as `T-13`, `T-16`, or operational ICU escalation.

#### `personal-baseline.ts`

How it relates to target CT:

- Directly supports the target requirement to interpret deterioration relative
  to a patient’s own baseline, not only population thresholds.

Where it diverges:

- It is limited to weighted vital baselines.
- It does not cover broader baseline modifiers from the target spec such as
  frailty, medication baseline, immunocompromised state, nutritional context,
  or longitudinal functional status.

#### Assist legacy analyzer

How it relates to target CT:

- Preserves executable trajectory behavior inside Sentra Assist and should be
  treated as a consumer-specific legacy implementation.

Where it diverges:

- Narrower than Intelligenceboard.
- No momentum-engine integration in the required source set.
- No `spo2` lane in the required Assist analyzer file.
- Therefore Assist is even further from the target canonical CT model than
  Intelligenceboard.

### Recommendation — minimal safe path forward

1. Preserve the existing Intelligenceboard analyzer stack as the behavioral
   baseline.
   Do not rewrite `trajectory-analyzer`, `momentum-engine`,
   `convergence-detector`, or `personal-baseline` just to satisfy the new
   contract vocabulary.

2. Introduce a **canonical adapter layer**, not a new fantasy engine.
   First transform current Intelligenceboard outputs into `ClinicalTrajectoryV1`
   consistently:
   - map raw vitals into `vitalsTimeline`
   - map momentum / convergence / burden / acute-risk evidence into
     `derivedTimeline`
   - map trend / severity / escalation / confidence into `response`
   - map `deriveMissingData()` output into `quality`

3. Define an explicit **coverage registry** for the 52-taxonomy.
   This should be a declarative matrix stating, for each target trajectory:
   - backed by current logic
   - partially approximated
   - missing
   No one should claim implementation progress without moving rows in that
   registry.

4. Expand coverage in **legacy-first order**:
   - first: formalize the already-nearby legacy acute family
     (`T-45`..`T-50`, plus partial `T-13`/`T-16`)
   - second: add treatment-linked response execution for `T-51`/`T-52`
   - third: add missing raw inputs and quality fields
   - fourth: only then consider chronic, mortality, and operational families

5. Keep SYMPHONY as reasoning authority.
   CT should remain a longitudinal evidence companion, not a replacement engine
   or diagnosis authority.

6. Do not widen scope.
   No orchestrator, flows, ingestion, FHIR, or new backend service until root +
   Dashboard + Assist canonicalization is complete and the coverage registry is
   honest.

### Immediate implementation framing for the next CT thread

- Truth anchor: `2576984` = contract-first shell only.
- Executable truth: legacy analyzers still own runtime trajectory behavior.
- Safe next build step: canonical adapter + coverage registry.
- Unsafe next build step: claiming that the 52-taxonomy is already executable or
  replacing the legacy engines with an unvalidated new CT engine.

---

## CT Adapter Phase A — 2026-05-01 19:06

### Status: COMPLETE ✅

Three files created. 14/14 tests pass. Legacy engines untouched (git diff = empty).

```
CREATED: apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
CREATED: apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts
CREATED: apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
UNTOUCHED: trajectory-analyzer.ts · momentum-engine.ts · convergence-detector.ts · personal-baseline.ts
```

### Verified

- `tsx --test ct-adapter.test.ts` → 14/14 pass, exit 0
- `tsc --noEmit` on shared-types → exit 0 (unchanged)
- No TypeScript errors from the three new files
- `git diff trajectory-analyzer.ts` → empty (legacy untouched)

### Adapter Contract

`legacyIBToCtV1(analysis, visits, patientId) → ClinicalTrajectoryV1`
`legacyIBToCtV1Envelope(analysis, visits, patientId) → ClinicalTrajectoryEnvelope`

Pure functions. Caller provides already-computed TrajectoryAnalysis.
`treatmentResponsiveness` is ALWAYS `'unknown'` — no treatment data in pipeline.
`linkedReasoning.authority` is ALWAYS `'SYMPHONY'`.

### direction precedence rule (critical)

```
1. global_deterioration.state === 'critical'                  → 'worsening'   // overrides stability_label
2. overallTrend === 'insufficient_data'                       → 'unknown'
3. trajectory_volatility.stability_label === 'pseudo_stable'  → 'fluctuating'
4. global_deterioration.state === 'improving'                 → 'improving'
5. global_deterioration.state === 'deteriorating'             → 'worsening'
6. else                                                       → 'stable'
```

### Coverage registry: 52 entries in TRAJECTORY_REGISTRY

12 partial proxies, 40 missing. 0 fully covered. T-53 to T-62 are outside canonical 52.

### What Phase A does NOT do

- Does NOT call `analyzeTrajectory()` — adapter receives already-computed analysis
- Does NOT produce `instabilityPattern: 'allergic'` — allergy path is T-53 (extended scope)
- Does NOT derive NEWS2 — T-50 remains missing until Phase C
- Does NOT carry treatment data — T-51/T-52 remain missing until Phase B

### Next phases

- **Phase B**: extend ingestion to carry `TreatmentEvent[]` → unlocks T-51, T-52
- **Phase C**: implement `computeNEWS2()` in derivedTimeline → unlocks T-50
- **Phase D**: extend `VisitRecord` or `labsTimeline` with CRP → unlocks T-48

---
## CT Adapter Phase B — 2026-05-01

### What Phase B delivers

Treatment-response scorer wired into CT v1 adapter. T-51 and T-52 promoted from `missing` to `partial`.

**3 new/updated files:**
```
CREATE: apps/healthcare/intelligenceboard/src/lib/clinical/treatment-response-scorer.ts
CREATE: apps/healthcare/intelligenceboard/src/lib/clinical/treatment-response-scorer.test.ts
UPDATE: apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
UPDATE: apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts
UPDATE: apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
```

### TreatmentEvent interface (new public surface)

```typescript
export interface TreatmentEvent {
  id: string
  occurredAt: string   // ISO timestamp
  category: string     // e.g. 'medication', 'procedure', 'oxygen'
  label: string        // human-readable intervention name
  dose?: string
  route?: string
}
```

### Classification logic (classifyTreatmentResponse)

Evidence requirement: ≥1 pre-event visit + ≥1 post-event visit within 24h window.

| Condition | Result |
|---|---|
| No pre-event visit OR no post-event visit within 24h | `'unknown'` |
| HR slope ≤ −7.9 bpm/hr (T-51 formula) | `'responsive'` |
| HR slope ≥ +2.6 bpm/hr AND (SpO2 drops ≥ 2pp OR RR rises ≥ 4/min) | `'worsening'` |
| HR slope ≥ +2.6 bpm/hr | `'non_responsive'` |
| HR slope between −7.9 and +2.6 | `'partially_responsive'` |

### legacyIBToCtV1 signature (updated)

```typescript
export function legacyIBToCtV1(
  analysis: TrajectoryAnalysis,
  visits: VisitRecord[],
  patientId: string,
  treatments?: TreatmentEvent[],   // NEW optional param
): ClinicalTrajectoryV1
```

- `treatmentTimeline` is `undefined` when no treatments provided (backward compat)
- `treatmentResponsiveness` is `'unknown'` when no treatments provided (backward compat)
- Aggregate responsiveness uses worst-case priority: worsening > non_responsive > partially_responsive > responsive > unknown

### Test counts

- `treatment-response-scorer.test.ts`: 23 tests, all pass
- `ct-adapter.test.ts`: 20 tests total (+4 Phase B tests), all pass
- Combined: 43/43 pass

### What Phase B does NOT do

- Does NOT add lab-aware treatment signals (Phase D scope)
- Does NOT guarantee temporal precision <1h (limited by visit cadence)
- T-51/T-52 are `partial` not `covered` — HR slope proxy only, no validated logistic regression

### Next phase

- **Phase D**: extend `VisitRecord` or `labsTimeline` with CRP → unlocks T-48 (Infectious Surge)

---
## CT Adapter Phase C — 2026-05-01 19:18

### Commit
`6bcc405` — feat(ct-v1): Phase C — computeNEWS2, T-50 partial coverage

### What landed
- **NEW** `news2-score.ts`: `computeNEWS2(vital: ClinicalTrajectoryVitalPoint): number | undefined` — RCP NEWS2 2017 Scale 1 implementation. 7 parameters: RR, SpO2 (Scale 1), O2 supplement (always 0), SBP, HR, ACVPU consciousness, Temp. Returns `undefined` if any required vital absent.
- **NEW** `news2-score.test.ts`: 54 tests — all parameter boundary conditions, full-score cases, undefined-vital handling
- **MODIFIED** `ct-adapter.ts`: NEWS2 points added to `derivedTimeline` — one `ClinicalTrajectoryDerivedPoint` per visit with `calculationBasis: 'official_score'` and `news2Total` computed. `derivedTimeline` structure becomes 2N+1 (N sentra_rule_v1 + N NEWS2 per-visit interleaved + 1 aggregate).
- **MODIFIED** `ct-coverage-registry.ts`: T-50 `status: 'missing'` → `status: 'partial'`
- **MODIFIED** `ct-adapter.test.ts`: NEWS2 boundary assertions added

### Test totals (Phase C baseline)
| Suite | Tests | Pass |
|---|---|---|
| news2-score | 54 | 54 |
| ct-adapter | 20 | 20 |
| treatment-response-scorer | 23 | 23 |
| **TOTAL** | **97** | **97** |

### What Phase C does NOT do
- Does NOT implement NEWS2 Scale 2 (COPD/hypercapnic) — no device flag in VisitRecord
- O2 supplement score is always 0 — no supplemental O2 device data
- T-50 is `partial` not `covered`: projection formula (NEWS2_0 + 1.0×t) requires SYMPHONY synthesis
- Does NOT touch `instabilityPattern` or `requiresEscalation`

### Known limitation
NEWS2 for COPD patients (Scale 2: SpO2 target 88–92%) will score higher than clinically appropriate on Scale 1 — potential overcall. No fix until COPD flag added to VisitRecord.

---
## CT Adapter Phase D — 2026-05-01 19:51

### Commit
`6b8e3aa` — feat(ct-v1): land Phase D CRP lab layer + T-48 Infectious Surge partial coverage

### What landed
- **NEW** `lab-event-scorer.ts`: `LabEvent` interface, `classifyInfectiousSurge()` (T-48 spec formula: slope ≥ 37 mg/L/hr → `active_surge`), `buildLabsTimeline()` (numeric → string conversion for CT v1 `value: string` contract)
- **NEW** `lab-event-scorer.test.ts`: 22 tests — all classification paths, edge cases, timeline mapping
- **MODIFIED** `ct-adapter.ts`: `legacyIBToCtV1` accepts optional `labs?: LabEvent[]`; `labsTimeline` emitted when labs provided; T-48 derived point (`calculationBasis: 'standard_formula'`) appended to `derivedTimeline` when labs present
- **MODIFIED** `ct-coverage-registry.ts`: T-48 `status: 'missing'` → `status: 'partial'`; legacyProxy + adapterNote updated
- **MODIFIED** `ct-adapter.test.ts`: 6 Phase D integration tests added

### Test totals
| Suite | Tests | Pass |
|---|---|---|
| lab-event-scorer | 22 | 22 |
| ct-adapter | 26 | 26 |
| treatment-response-scorer | 23 | 23 |
| news2-score | 54 | 54 |
| **TOTAL** | **125** | **125** |

### Conservative design decisions
- `instabilityPattern` NOT overridden in Phase D — CRP surge does NOT force `'infectious'`; SYMPHONY is the synthesis authority
- T-48 is `partial` (not `covered`): missing procalcitonin, WBC series, validated logistic for CRP-to-sepsis probability
- `labsTimeline` only populated when `labs` param provided; `undefined` otherwise (backward compat)
- T-48 derived point added even when classification is `insufficient_data` (signals labs were considered but data sparse)

### Phase D+ open question
Wire `instabilityPattern: 'infectious'` when CRP `active_surge` AND no stronger convergence pattern already set. Requires SYMPHONY sign-off.

### Next phases
- **Phase E** (SYMPHONY wiring): Connect `ClinicalTrajectoryEnvelope` to SYMPHONY LangFlow endpoint
- **Phase F** (T-49 GCS series): Replace AVPU proxy with real GCS when series available
- **Phase G** (T-01 logistic): Replace mortality_proxy with validated logistic regression inputs

### Do not touch
- `trajectory-analyzer.ts` — legacy engine, untouched since Phase A
- `momentum-engine.ts`, `convergence-detector.ts`, `personal-baseline.ts`

---
## CT Consolidation Audit — 2026-05-01 20:00

### Trigger
Manual consolidation requested by Chief after Phases A–D landed. Verify registry, adapter seams, and handoff state are consistent.

### Verified state

**Commits (all on `refactor/ABYSS-REPO-STRUCTURE-001-package-taxonomy`):**
| Phase | Commit | Description |
|---|---|---|
| A | `2576984` | CT v1 contract + fixtures (shared-types); adapter seam + registry |
| C | `6bcc405` | NEWS2 scorer; T-50 → partial |
| B | `ac0487d` | Treatment-response scorer; T-51/T-52 → partial |
| D | `6b8e3aa` | CRP/lab scorer; T-48 → partial |
| Agent docs | `e1f3400` | HANDOFF + PROGRESS Phase D completion |
| Audit fix | (this commit) | Phase C section restored in HANDOFF; test count corrected; consolidation audit added |

Note: B was committed after C chronologically (B = 19:33, C = 19:18). Order of implementation was A → C → B → D.

**Test counts (verified 125/125 pass):**
| Suite | File | Tests |
|---|---|---|
| news2-score | `news2-score.test.ts` | 54 |
| ct-adapter | `ct-adapter.test.ts` | 26 |
| treatment-response-scorer | `treatment-response-scorer.test.ts` | 23 |
| lab-event-scorer | `lab-event-scorer.test.ts` | 22 |
| **TOTAL** | | **125** |

**Registry coverage (verified against source):**
- 16 partial, 36 missing, 0 covered — total 52 canonical trajectories ✓
- T-53 to T-62 are OUTSIDE canonical 52 — not counted

### Governance fix applied in this commit
- Phase C section was MISSING from HANDOFF.md (present in PROGRESS.md commit log only) — **restored**
- Phase D test table had wrong row (`treatment-response-scorer: 43` was combined Phase B total, not per-file) — **corrected to 23**
- Phase D test TOTAL was `145` — **corrected to 125**

### Quality audit — seam strength classification

| Trajectory | Seam Type | Strength | Formula Source | Key Gap |
|---|---|---|---|---|
| T-48 (CRP Surge) | `lab-event-scorer.ts` | **MODERATE** | Spec §T-48 (37 mg/L/hr) | procalcitonin, WBC, validated logistic |
| T-50 (NEWS2) | `news2-score.ts` | **STRONG (Scale 1 only)** | RCP NEWS2 2017 | Scale 2 (COPD), O2 device flag |
| T-51 (Response Good) | `treatment-response-scorer.ts` | **MODERATE** | Spec HR slope ≤-7.9 bpm/hr | No validated logistic; needs TreatmentEvent[] input |
| T-52 (Response Poor) | `treatment-response-scorer.ts` | **MODERATE** | Spec HR slope ≥+2.6 bpm/hr | Same gaps as T-51 |
| T-45 (Respiratory) | convergence.pattern proxy | **WEAK PROXY** | Pattern match only | FiO2, P/F ratio; no actual RR slope formula |
| T-46 (Hemodynamic) | convergence.pattern proxy | **WEAK PROXY** | Pattern match only | MAP missing; no SBP slope formula |
| T-47 (Metabolic) | convergence.pattern proxy | **WEAK PROXY** | Pattern match only | Lactate, pH missing |
| T-49 (Neurologic) | AVPU → consciousness level | **SYMBOLIC** | Not formula-based | GCS series required for T-49; AVPU ≠ GCS |
| T-13 (Cardiac Arrest) | shock_decompensation_risk flag | **FLAG ONLY** | No formula | ECG, troponin missing |
| T-14 (Flash ARDS) | SpO2+RR vitalTrends | **FLAG ONLY** | No formula | FiO2, PaO2/FiO2 missing |
| T-15 (Neurological Cascade) | AVPU | **WEAK PROXY** | No formula | GCS series, focal signs |
| T-16 (Sepsis No-Return) | sepsis_like_deterioration_risk | **FLAG ONLY** | No formula | lactate, WBC, procalcitonin |
| T-01 (Imminent Mortality) | mortality_proxy_tier | **WEAK PROXY** | No formula | No validated logistic, no lab inputs |
| T-25 (DM-ESRD Baseline) | glucose only | **VERY WEAK** | PERKENI thresholds | creatinine, eGFR |
| T-30 (Delirium Risk) | single AVPU point | **SYMBOLIC** | No formula | No delirium trajectory model |
| T-37 (ICU Escalation) | clinical_urgency_tier flag | **FLAG ONLY** | No formula | Different granularity; not an ICU escalation model |

### Overclaim risk areas (DO NOT claim as covered)

1. **T-45/T-46/T-47** — current `instabilityPattern` mapping is a convergence-pattern proxy. The T-45/T-46/T-47 target formulas require FiO2/MAP/Lactate inputs that do not exist in legacy pipeline. Calling these "implemented" would be false.
2. **T-49** — AVPU is NOT GCS. T-49 formula requires GCS series (slope computation). The AVPU → consciousness mapping provides NEWS2 sub-score only, not T-49 trajectory.
3. **T-50** — NEWS2 computation is correct for Scale 1 patients. COPD patients on Scale 2 will get inflated scores. T-50 trajectory projection (NEWS2_0 + 1.0×t) is not yet computed — that requires SYMPHONY.
4. **T-48** — `instabilityPattern` is NOT set to `'infectious'` in Phase D. Only `labsTimeline` + derivedTimeline flag emitted. SYMPHONY synthesis authority.
5. **Any trajectory in Q1/Q2/Q3/Q4 with `status: 'missing'`** — these 36 have zero adapter seam.

### Priority order for next phases

1. **Phase D+ (quickest)**: Wire `instabilityPattern: 'infectious'` when `t48:active_surge` flag set AND no stronger pattern. Additive, low risk. SYMPHONY sign-off. ~1h scope.
2. **Phase F (T-49 GCS input)**: Add `GCSEvent` type alongside `LabEvent` pattern. Additive seam. Requires caller to supply GCS readings.
3. **Phase G (T-01 logistic)**: Replace `mortality_proxy_tier` proxy with validated logistic regression. Requires clinical validation of formula inputs.
4. **Phase E (SYMPHONY wiring)**: Connect `ClinicalTrajectoryEnvelope` to SYMPHONY LangFlow. Blocked by orchestrator Phase B (LangFlow connectivity). Not a clinical module concern — belongs in orchestrator scope.

### Governance constraints (unchanged)
- DO NOT rewrite `trajectory-analyzer.ts` or any legacy engine
- DO NOT change existing legacy scoring behavior
- DO NOT claim `'covered'` without executable formula + validated inputs
- Adapter is ADDITIVE — legacy TrajectoryAnalysis output preserved alongside CT v1 envelope
- SYMPHONY remains reasoning authority — no synthetic clinical judgments from adapter layer

---
## CT Adapter Phase C.2 — 2026-05-01 21:23

### Commit
`fdc4931` — feat(ct-v1): Phase C.2 — NEWS2 Scale 2 (COPD flag) additive support

### What landed
- **MODIFIED** `news2-score.ts`: `scoreSpo2Scale2()` added (RCP NEWS2 2017 Scale 2: ≤83→3, 84–85→2, 86–87→1, ≥88→0 on air); `NEWS2ComputeOptions { spo2Scale?: 1 | 2 }` exported; `computeNEWS2(vital, options?)` accepts optional options param — default Scale 1, fully backward compatible
- **MODIFIED** `ct-adapter.ts`: `CTAdapterOptions { copdScale2?: boolean }` exported; `legacyIBToCtV1` accepts optional 6th param `options?: CTAdapterOptions`; `copdScale2` wired through `buildDerivedTimeline` to `computeNEWS2`; NEWS2 derived points carry `'news2:scale2'` flag when Scale 2 active
- **MODIFIED** `ct-coverage-registry.ts`: T-50 `missingInputs` updated — 'hypercapnic/COPD flag' gap resolved; `legacyProxy` and `adapterNote` reflect dual-scale support
- **MODIFIED** `news2-score.test.ts`: 8 Scale 2 tests added (boundary conditions: 84, 86, 88, 92, 93, 97, backward compat, null guard)
- **MODIFIED** `ct-adapter.test.ts`: 3 Phase C.2 integration tests added (lower score for spo2=93, flag presence, backward compat)

### Test totals
| Suite | Tests | Pass |
|---|---|---|
| news2-score | 62 | 62 |
| ct-adapter | 29 | 29 |
| treatment-response-scorer | 23 | 23 |
| lab-event-scorer | 22 | 22 |
| **TOTAL** | **136** | **136** |

### Backward compatibility guarantee
- `computeNEWS2(vital)` with no options → Scale 1 (unchanged behavior)
- `legacyIBToCtV1(..., undefined, undefined)` with no 6th arg → Scale 1, no `news2:scale2` flag
- All 125 previously passing tests continue to pass unmodified

### What Scale 2 does
For COPD/hypercapnic patients, SpO2 in the 88–92% target range correctly scores 0 instead of 3 (Scale 1). SpO2 93% on air scores 0 instead of 2. This eliminates NEWS2 overcall for COPD patients. The O2-supplement penalty arm of Scale 2 (SpO2 ≥93% on supplemental O2 → 1–3 points) never fires since O2 supplement is always 0 in this pipeline.

### What Phase C.2 does NOT do
- Does NOT auto-detect COPD from `confirmed_chronic_diagnoses` — caller provides flag
- O2 supplement score is still always 0
- T-50 trajectory projection (NEWS2_0 + 1.0×t) still requires SYMPHONY

### Hold: Phase A (T-48 instabilityPattern wire)
Parked per Chief instruction. Requires explicit decision: whether biomarker-driven `instabilityPattern` propagation is permitted at adapter layer or is SYMPHONY-only territory.

### Next phases
- **Phase F** (T-49 GCS seam): Add `GCSEvent` type, additive seam alongside LabEvent pattern
- **Phase G** (T-01 logistic): Replace mortality_proxy with validated logistic inputs
- **Phase E** (SYMPHONY wiring): Blocked by orchestrator LangFlow Phase B

---
## Phase F — T-49 GCS Seam — 2026-05-01

### What was done
Additive GCS seam opened. No legacy engine touched.

**Files created:**
- `apps/healthcare/intelligenceboard/src/lib/clinical/gcs-scorer.ts` — GCSEvent interface, T-49 slope classifier (`classifyNeurologicDecline`), `buildGCSTimeline` (sorts + maps to ClinicalTrajectoryGCSPoint with interpretation thresholds)
- `apps/healthcare/intelligenceboard/src/lib/clinical/gcs-scorer.test.ts` — 22 tests (all pass)

**Files modified:**
- `packages/shared/shared-types/src/clinical-trajectory.ts` — added `ClinicalTrajectoryGCSPoint` interface + `gcsTimeline?: ClinicalTrajectoryGCSPoint[]` to `ClinicalTrajectoryV1`
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts` — added `gcsEvents?: GCSEvent[]` to `CTAdapterOptions`; wired `gcsTimeline` into output; added T-49 derived point in `buildDerivedTimeline` when gcsEvents present
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts` — +5 Phase F integration tests
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-coverage-registry.ts` — T-49 adapterNote updated to document GCS seam

### T-49 formula implemented
```
slopePerHour = (lastGCS - firstGCS) / deltaHours
slope ≤ -1.3  → active_decline
slope < 0     → gradual_decline
slope ≥ 0     → stable_or_improving
< 2 events OR deltaHours=0 → insufficient_data
```

### What Phase F does NOT do
- Does NOT override `instabilityPattern` from AVPU — GCS slope classification is in derivedTimeline only
- T-49 status remains `partial` — caller must supply GCSEvent[] from EMR; adapter cannot source it from VisitRecord
- Does NOT claim T-49 as covered

### Test counts after Phase F
| File | Tests |
|---|---|
| news2-score.test.ts | 62 |
| ct-adapter.test.ts | 34 |
| gcs-scorer.test.ts | 22 |
| treatment-response-scorer.test.ts | 23 |
| lab-event-scorer.test.ts | 22 |
| **TOTAL** | **163** |

### Verification
- `pnpm --filter @the-abyss/shared-types typecheck` → EXIT:0
- `tsx --test` all 5 clinical files → 163/163 pass
- `git diff trajectory-analyzer.ts momentum-engine.ts convergence-detector.ts personal-baseline.ts` → empty

### Hold status unchanged
- Phase A (T-48 instabilityPattern): still parked
- Phase G (T-01 logistic): still on hold — activate after next truth freeze

### Next phases
- **Phase G** (T-01 logistic): Replace mortality_proxy with validated logistic inputs — Chief GO required
- **Phase E** (SYMPHONY wiring): Blocked by orchestrator LangFlow Phase B
