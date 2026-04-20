# SYMPHONY Coverage Gap Audit — 2026-04-20

<!-- Read-only coverage audit. Companion to 2026-04-20-symphony-alignment.md. -->
<!-- Source of truth: D:\Devop\abyss-monorepo\apps\healthcare\intelligenceboard\.agent\FEATURE.md (2026-04-18, 1158 lines). -->
<!-- Cross-reference: packages/symphony/src/** (worktree v:\avcn-sentra\abyss-monorepo). -->

## Scope

Chief's directive (2026-04-20): "pastikan tidak ada satupun feature baik dari Assist dan Dashboard yang belum ada di Symphony."

This audit cross-references `FEATURE.md` (Dashboard + Assist complete inventory) against SYMPHONY's canonical clinical-engine surface. Every feature is classified into one of four verdicts:

- **✅ In SYMPHONY** — canonical implementation exists in `packages/symphony/src/**`.
- **❌ NOT in SYMPHONY, should migrate** — clinical-intelligence feature missing from canonical parent; belongs in SYMPHONY scope.
- **⚠️ Partial / adapter-only** — SYMPHONY has adapter-surface or type-level coverage but the full canonical evaluator/logic lives in Dashboard or Assist.
- **🔵 Not SYMPHONY scope** — UI, persistence, LLM orchestration, browser-DOM, or cross-cutting concerns that correctly live outside SYMPHONY.

**Read-only.** No code changes proposed beyond this document. No DB/Prisma/SQL. No implementation.

## Hierarchy Reaffirmation

```text
SYMPHONY = canonical clinical intelligence parent
Dashboard = consumer / visualization / host surface
Assist = consumer / bedside / browser cockpit
```

Dashboard local clinical logic and Assist local patterns are candidate/evidence material for canonicalization; never canonical owners.

## Method

1. FEATURE.md parsed via Grep (full content too large for single Read).
2. SYMPHONY exports catalogued from `packages/symphony/src/index.ts` (136 lines of re-exports).
3. SYMPHONY engine files enumerated via Glob: 11 engine files + 1 adapter + contracts + shared-types `symphony.ts`.
4. Targeted grep for specific feature keywords across `packages/symphony/src/**`.
5. Every FEATURE.md bullet mapped to a verdict with explicit evidence file + reasoning.

## Executive Summary

| Category | Count | Status |
|---|---|---|
| Dashboard clinical-intelligence features in SYMPHONY | 9 of 10 core engines | Mostly canonical |
| Dashboard prediction-engine subfeature missing | 1 (`detectTreatmentResponse`) | **Gap** |
| Assist features marked for migration in FEATURE.md §3.2 | 15 total | 1 done (adapter parity), 14 pending |
| Assist Emergency Detector subsystem (clinical-patterns evaluator + pattern-engine + symptom-signals + action-protocols) | 4 evaluator subsystems | **Adapter-surface only in SYMPHONY; full evaluators NOT migrated** |
| Gate registry taxonomy delta (SYMPHONY 10 mechanism-named vs Assist 11 disease-named; 3 disease slices without SYMPHONY analog) | 1 reconciliation decision + 3 disease-slice gaps | Taxonomy reconciliation pending |
| Aortic dissection (CP-067) | 1 | Adapter covers it; Dashboard production runtime gap per FEATURE.md §4.5 |
| Assist-owned features (anonymizer, scraper, UI) | 7 | Correctly out of SYMPHONY scope |

**Conclusion (preview):** SYMPHONY has broad canonical coverage for Dashboard's clinical-intelligence pipeline (NEWS2, screening gates, early warning, trajectory, momentum, convergence, personal baseline, time-to-critical, mortality proxy, composite deterioration, hybrid decisioning, PE + Anaphylaxis safety gates, 70 Assist CP adapter parity). **However**, several Assist-originating evaluators remain outside SYMPHONY: the Clinical Patterns *evaluator* itself (the runtime engine that matches 70 patterns against input), the 9 ABCDE action protocols, the symptom-signals NLP (Indonesia, negation-aware), and the pattern-engine field resolver. Adapter parity ≠ canonical evaluator. Additionally, SYMPHONY's `SymphonySafetyGate` (10 mechanism-named) and Assist's `gate-registry` (11 disease-named) present a taxonomy-reconciliation decision plus three Assist disease slices (`GATE_ACS`, `GATE_STROKE`, `GATE_ANEMIA_BLEED_CHRONIC`) without SYMPHONY analog.

---

## Matrix 1 — Dashboard Clinical Intelligence (FEATURE.md §1.1–§1.5)

| FEATURE.md Feature | SYMPHONY Evidence | Verdict |
|---|---|---|
| §1.1 CDSS Engine V2 — DeepSeek Reasoner + Gemini fallback + circuit breaker | No SYMPHONY file; LLM orchestration is Dashboard-owned | 🔵 Not SYMPHONY scope (LLM orchestration is app-level) |
| §1.1 Hardcoded vital red flags (SBP/DBP/SpO2/HR/temp/RR/AVPU/pain) | `packages/symphony/src/engine/vital-alerts.ts` (`evaluateSymphonyVitalAlerts`) | ✅ In SYMPHONY |
| §1.1 NEWS2 integrated in pipeline | `packages/symphony/src/engine/news2.ts` (`calculateSymphonyNEWS2`) | ✅ In SYMPHONY |
| §1.1 Early Warning Patterns detection | `packages/symphony/src/engine/early-warning.ts` (`detectSymphonyEarlyWarningPatterns`) | ✅ In SYMPHONY |
| §1.1 Knowledge Base context builder (159 penyakit KKI) | No SYMPHONY file; KB is Dashboard `public/data/` + pre-filter.ts + embedding-filter.ts | 🔵 Not SYMPHONY scope (data + retrieval belongs to Dashboard app) |
| §1.1 Structured prompt builder (structuredSignsBlock, deteriorationBlock, trajectoryBlock, assessmentConclusion) | No SYMPHONY file | 🔵 Not SYMPHONY scope (LLM prompt assembly is app-level) |
| §1.1 `hybrid.ts` — Reciprocal Rank Fusion + scoring + decision tiers | `packages/symphony/src/engine/hybrid-decisioning.ts` (`applySymphonyHybridDecisioning`, `SymphonyHybridDecisionCounts`, `SymphonyHybridDiagnosisCandidate`, `SymphonyHybridValidationFlag`) | ✅ In SYMPHONY |
| §1.1 `pre-filter.ts` — BM25 keyword pre-filter | No SYMPHONY file; depends on Dashboard-local `public/data/penyakit.json` | 🔵 Not SYMPHONY scope (data-coupled; candidate for future extraction if KB is canonicalized) |
| §1.1 `embedding-filter.ts` — Semantic embedding retrieval | No SYMPHONY file; uses `@the-abyss/vector-store` which is a separate shared package | 🔵 Not SYMPHONY scope (vector-store is a sibling shared package, not SYMPHONY's concern) |
| §1.1 `bm25.ts` / `symptom-aliases.ts` / `symptom-suggest.ts` | No SYMPHONY file | 🔵 Not SYMPHONY scope (KB retrieval utilities) |
| §1.1 `validation.ts` — LLM output validation (ICD-10, age/sex/pregnancy/allergy flags) | No SYMPHONY file (see hybrid-decisioning validation flags for overlap) | ⚠️ Partial — validation flags are modeled in `SymphonyHybridValidationFlag`, but ICD-10 registry + plausibility classifier remains Dashboard-local |
| §1.1 `workflow.ts` — audit logging + quality metrics + session hash | No SYMPHONY file | 🔵 Not SYMPHONY scope (persistence + DB audit is Dashboard app-level) |
| §1.1 `format-adapter.ts` / `diagnose-parser.ts` | No SYMPHONY file | 🔵 Not SYMPHONY scope (transport/HTTP concerns) |
| §1.2 `unified-vitals.ts` — canonical vital signs schema | No SYMPHONY file; `SymphonyVitalsInput` exists in shared-types but is input shape for SYMPHONY detectors, not a canonical schema for Dashboard's EMR persistence | ⚠️ Partial — SYMPHONY defines its own input shape; Dashboard's canonical validated schema (Zod + plausibility bounds + GCS + glucose types) is NOT in SYMPHONY. Candidate for shared-types extraction if Chief wants cross-app schema parity. |
| §1.2 `instant-red-alerts.ts` — 8-gate bedside screening | `packages/symphony/src/engine/screening-gates.ts` (`evaluateSymphonyInstantScreeningGates`) — covers GATE_1..GATE_8 equivalents per earlier parity-fixtures route tests | ✅ In SYMPHONY (subject to route parity fixtures 75/75 passing) |
| §1.2 `composite-deterioration.ts` | `packages/symphony/src/engine/composite-deterioration.ts` (`evaluateSymphonyCompositeDeterioration` + 15 types) | ✅ In SYMPHONY |
| §1.2 `avpu-gcs-mapper.ts` — AVPU↔GCS conversion | `SymphonyConsciousnessLevel` type exists in shared-types; NEWS2 engine consumes AVPU at `news2.ts:104-106`. No `avpuToGcs` / `gcsToAvpu` mapper **function** is exported from SYMPHONY. Dashboard's bidirectional mapping (`avpuToNEWS2Score`, `assessConsciousnessSeverity`, `getBestGCSTotal`) lives only in Dashboard `src/lib/vitals/avpu-gcs-mapper.ts`. | ⚠️ **Partial — type canonical, mapper functions Dashboard-local.** Bidirectional mapper belongs in SYMPHONY if Chief wants shared AVPU/GCS semantics. |
| §1.2 `vital-record-service.ts` / `vital-record-utils.ts` | No SYMPHONY file | 🔵 Not SYMPHONY scope (persistence services) |
| §1.3 NEWS2 Scoring (all 8 parameters, Scale 2 COPD, supplemental O2, risk tiers) | `packages/symphony/src/engine/news2.ts` — full 8-param scoring + risk tier | ✅ In SYMPHONY |
| §1.4 Early Warning Patterns — 7 disease-specific checkers (dengue, sepsis, resp, CV, hemorrhagic, preeclampsia, malaria) | `packages/symphony/src/engine/early-warning.ts` (`detectSymphonyEarlyWarningPatterns`) | ✅ In SYMPHONY |
| §1.5 `trajectory-analyzer.ts` — 7 vitals + early warning burden + deterioration score + mortality tier + clinical urgency | `packages/symphony/src/engine/trajectory.ts` (`analyzeSymphonyTrajectory`, `SymphonyMortalityProxyRisk`, `SymphonyGlobalDeteriorationState`, `SymphonyEarlyWarningBurden`, `SymphonyTrajectoryRiskLevel`, `SymphonyClinicalSafeOutput`) | ✅ In SYMPHONY |
| §1.5 `momentum-engine.ts` — velocity + acceleration + 7 momentum levels | `packages/symphony/src/engine/trajectory.ts` (`SymphonyMomentumAnalysis`, `SymphonyMomentumLevel`, `SymphonyMomentumParam`, `trajectoryMomentumFromAnalysis`) | ✅ In SYMPHONY |
| §1.5 `prediction-engine.ts` — `predictTimeToCritical` (linear + quadratic) + `detectTreatmentResponse` + `generateAlertDecision` | SYMPHONY `trajectory.ts` has `estimateTimeToCritical` (linear only, no quadratic), `SymphonyTimeToCriticalEstimate`, `SymphonyAcuteAttackRisk24h`. Grep for `detectTreatmentResponse` / `TreatmentResponse` returned zero hits in SYMPHONY. | ❌ **Gap** — Treatment Response analysis (`detectTreatmentResponse`: effective/partially_effective/ineffective/worsening classification based on first-half vs second-half velocity) NOT in SYMPHONY. Quadratic prediction formula also not in SYMPHONY — only linear estimation. |
| §1.5 `convergence-detector.ts` — 6 patterns + shouldAlert | `packages/symphony/src/engine/trajectory.ts` (`SymphonyConvergencePattern`, `SymphonyConvergenceResult`, inline `detectConvergence`) | ✅ In SYMPHONY |
| §1.5 `personal-baseline.ts` — exponential decay Z-score | `packages/symphony/src/engine/trajectory.ts` (`buildSymphonyPersonalBaseline`, `SymphonyPersonalBaseline`, `SymphonyPersonalBaselineParam`) | ✅ In SYMPHONY |
| §1.5 `anamnesis-extractor.ts` — AI-powered extraction | No SYMPHONY file (AI extraction is LLM-coupled, app-level) | 🔵 Not SYMPHONY scope |
| §1.5 `chronic-disease-classifier.ts` — ICD-10 → ChronicDiseaseType mapping | No SYMPHONY file | ❌ **Gap** — ICD-10→chronic classification is deterministic clinical logic; candidate for SYMPHONY canonicalization. Currently duplicated between Dashboard and Assist per FEATURE.md. |
| §1.5 `trajectory-alert-service.ts` | No SYMPHONY file (alert service = persistence/notification, app-level) | 🔵 Not SYMPHONY scope |
| §1.5 `finalization-therapy-engine.ts` / `formulary-resolver.ts` / `manual-medication-suggestions.ts` | No SYMPHONY file | 🔵 Not SYMPHONY scope (therapy/medication domain; candidate for future shared package if Chief decides) |

## Matrix 2 — Dashboard API / UI / Infra (FEATURE.md §1.6–§1.12)

All entries here are **🔵 Not SYMPHONY scope** by design (API routes, Next.js pages, Prisma schema, observability). Not audited individually — SYMPHONY canonicalizes clinical intelligence only, not HTTP/UI/persistence.

## Matrix 3 — Assist Emergency Detector (FEATURE.md §2.1)

This is the highest-risk area. Assist's GATE v2 is 70 clinical patterns + 11 gate IDs + 9 action protocols + pattern engine evaluator + symptom NLP. FEATURE.md §3.2 marks most as **BELUM** for Dashboard migration; audit verifies SYMPHONY side.

| Assist Feature | SYMPHONY Evidence | Verdict |
|---|---|---|
| §2.1 `gate-registry.ts` — 11 Assist GATE ID constants (GATE_SEPSIS_EARLY, GATE_SEPTIC_SHOCK_HIGH, GATE_SHOCK_INDEX, GATE_RESP_FAILURE, GATE_PE_SUSPECT, GATE_ACS, GATE_STROKE, GATE_ANAPHYLAXIS, GATE_DKA_HHS, GATE_RESP_ASTHMA_COPD, GATE_ANEMIA_BLEED_CHRONIC) | `packages/shared-types/src/symphony.ts:25-35` union `SymphonySafetyGate` contains 10 numbered gates: `GATE_1_VITALS`, `GATE_2_HTN`, `GATE_3_GLUCOSE`, `GATE_4_OCCULT_SHOCK`, `GATE_5_SEPSIS`, `GATE_6_RESPIRATORY`, `GATE_7_PEDIATRIC`, `GATE_8_OBSTETRIC`, `GATE_9_PE`, `GATE_10_ANAPHYLAXIS`. Taxonomy is mechanism/system-based (SYMPHONY) vs disease-named (Assist). FEATURE.md §3.2 row 2 flags canonicalization status **BELUM**. | ⚠️ **Taxonomy mismatch, not count gap.** SYMPHONY has 10 mechanism-named gates; Assist has 11 disease-named gates. Substantial conceptual overlap (e.g., GATE_5_SEPSIS ⊇ GATE_SEPSIS_EARLY + GATE_SEPTIC_SHOCK_HIGH; GATE_9_PE = GATE_PE_SUSPECT; GATE_10_ANAPHYLAXIS = GATE_ANAPHYLAXIS; GATE_3_GLUCOSE ⊇ GATE_DKA_HHS). Disease-specific concepts with **no direct SYMPHONY gate analog**: `GATE_ACS` (acute coronary), `GATE_STROKE` (cerebrovascular), `GATE_ANEMIA_BLEED_CHRONIC`. Taxonomy reconciliation + three disease-slices missing; adapter parity covers per-pattern output (`assist-cp-XXX`) but not cross-taxonomy gate-ID mapping. |
| §2.1 `clinical-patterns.ts` — 70 CP evaluator logic (pattern matching against vitals + symptoms + history + scored criteria) | `packages/symphony/src/adapters/assist-patterns-parity.ts` — **adapter-surface**, 70 `ASSIST_PATTERN_PARITY_DEFINITIONS`, per-CP fixtures. Actual evaluator (pattern-matching runtime) is NOT in SYMPHONY; adapter converts matched Assist output → canonical SymphonyAlert shape. | ⚠️ **Partial — adapter parity only.** FEATURE.md §3.2 row 1 flags this as "ADAPTER PARITY DONE"; Chief must recognize adapter parity ≠ canonical evaluator in SYMPHONY. If Assist extension is decommissioned, CP evaluation has no SYMPHONY-side replacement. |
| §2.1 `pattern-engine.ts` — generic pattern evaluator (required + scored criteria, 8 operators, nested field resolver, derived value computation) | No SYMPHONY file; grep for `pattern-engine` returned zero hits | ❌ **Gap** — generic rule engine not in SYMPHONY. Candidate for canonicalization if SYMPHONY wants to own pattern evaluation rather than import Assist's pre-matched output. |
| §2.1 `action-protocols.ts` — 9 ABCDE emergency protocols (PROTO_RESP_FAILURE, PROTO_SHOCK, PROTO_SEPSIS, PROTO_ANAPHYLAXIS, PROTO_ACS, PROTO_STROKE, PROTO_DKA_HHS, PROTO_HYPOGLYCEMIA, PROTO_CARDIAC_ARREST) | No SYMPHONY file; grep for `PROTO_` returned zero hits in SYMPHONY | ❌ **Gap** — action protocols are deterministic clinical response templates (ABCDE recommendations + referral criteria). Belong in SYMPHONY as canonical decision support output. FEATURE.md §3.2 row 3 confirms: **BELUM**. |
| §2.1 `symptom-signals.ts` — Indonesian symptom NLP with negation handling ("tidak demam", "tanpa nyeri") | No SYMPHONY file | ❌ **Gap** — symptom extraction is deterministic NLP (rule-based, negation-aware). Currently lives in Assist; needed server-side once Assist calls `/api/cdss/diagnose` with free-text anamnesis. FEATURE.md §3.2 row 4 confirms: **BELUM**. |
| §2.1 `clinical-snapshot.ts` / `pattern-types.ts` | No SYMPHONY file | ❌ **Gap** — supporting types for pattern evaluator; follows pattern-engine migration. |
| §2.1 `htn-classifier.ts` / `glucose-classifier.ts` (shared between Dashboard and Assist) | No SYMPHONY file | ❌ **Gap** — deterministic classifiers currently duplicated. Candidate for SYMPHONY canonicalization. |
| §2.1 `occult-shock-detector.ts` (Assist local version) | No SYMPHONY file; Dashboard version is covered by `composite-deterioration.ts` | ⚠️ Partial — SYMPHONY composite covers Dashboard's version; Assist's historical-BP-only detector not separately canonicalized |
| §2.1 `ttv-inference.ts` — symptom → estimated vital range | No SYMPHONY file | 🔵 Not SYMPHONY scope (optional estimation, marked "EVALUATE" in FEATURE.md §3.2) |
| §2.1 `narrative-generator.ts` | No SYMPHONY file | 🔵 Not SYMPHONY scope (rule-based text for Assist UI) |

## Matrix 4 — Assist Iskandar V1 + Clinical Library (FEATURE.md §2.2–§2.3)

| Assist Feature | SYMPHONY Evidence | Verdict |
|---|---|---|
| §2.2 `engine.ts` / `diagnosis-algorithm.ts` / `differential-diagnosis.ts` / `symptom-matcher.ts` / `llm-reasoner.ts` | FROZEN per FEATURE.md §2.2 (offline fallback only, superseded by Dashboard V2) | 🔵 Not SYMPHONY scope (legacy frozen code) |
| §2.2 `pharmacotherapy-reasoner.ts` — drug recommendation + contraindications | No SYMPHONY file | ❌ **Gap** — FEATURE.md §3.2 row 9 marks [MIGRATE TO DASHBOARD], status **BELUM**. Deterministic drug recommendation belongs in SYMPHONY or a sibling shared `pharmacology` package. |
| §2.2 `ddi-checker.ts` — 173K drug interaction pairs, 4 severity tiers | No SYMPHONY file | ❌ **Gap** — FEATURE.md §3.2 row 7, status **BELUM**. Pure deterministic checker, SYMPHONY candidate. |
| §2.2 `epidemiology-weights.ts` — Puskesmas epidemiology priors | No SYMPHONY file | ❌ **Gap** — FEATURE.md §3.2 row 8, status **BELUM**. Prior adjustment to DDx ranking; belongs in hybrid-decisioning pipeline extension. |
| §2.2 `traffic-light.ts` — 8 deterministic escalation rules (GREEN→YELLOW→RED, never downgrades) | No SYMPHONY file | ❌ **Gap** — FEATURE.md §3.2 row 10 marks "EVALUATE" priority, status **BELUM**. Deterministic safety gate; SYMPHONY candidate pending Chief evaluation. |
| §2.2 `anonymizer.ts` — mandatory PII strip client-side middleware | No SYMPHONY file | 🔵 Not SYMPHONY scope — must stay client-side in Assist per FEATURE.md §3.3 explicit rule. Correctly excluded from SYMPHONY. |
| §2.2 `audit-logger.ts` / `visit-history-store.ts` (IndexedDB) / `get-suggestions-flow.ts` | No SYMPHONY file | 🔵 Not SYMPHONY scope (persistence/orchestration) |
| §2.3 `dosage-database.ts` — Formularium FKTP nasional | No SYMPHONY file | ❌ **Gap** — FEATURE.md §3.2 row 6, status **BELUM**. Deterministic reference data; SYMPHONY or sibling data package candidate. |
| §2.3 `canonical-triage-builder.ts` | No SYMPHONY file; SYMPHONY has `SymphonyAssessmentInput` as canonical input shape | ⚠️ Partial — input shape canonical; builder function Assist-local |
| §2.3 `anamnesa-composer.ts` / `vital-autocomplete.ts` | No SYMPHONY file | 🔵 Not SYMPHONY scope (UI composition / autocomplete) |
| §2.3 `vital-screening-thresholds.ts` — 7 age cohorts (infant→older_adult) + geriatric/pediatric adjustments | No SYMPHONY file | ❌ **Gap** — FEATURE.md §3.2 row 11, status **BELUM**. Age-stratified vital thresholds are deterministic clinical rules; SYMPHONY candidate. |

## Matrix 5 — Assist UI / Infrastructure (FEATURE.md §2.4–§2.12)

All entries **🔵 Not SYMPHONY scope**: React components, Chrome extension entrypoints, RME scraper, message handlers, data files. Correctly excluded. Not audited individually.

## Matrix 6 — FEATURE.md §4 Critical Gaps vs SYMPHONY

| FEATURE.md §4.x Item | SYMPHONY State | Verdict |
|---|---|---|
| §4.1 Emergency Override Layer | Dashboard-side UI feature (`.emr-phase.is-emergency-dimmed`); SYMPHONY emits critical alerts that Dashboard uses to trigger override | ✅ Inputs in SYMPHONY; UI override correctly Dashboard-side |
| §4.2 Platform Thin Client in Assist (Phase A.3) | `platform-api-client.ts` + `pii-guard.ts` — Assist-side per MASTER_CONTEXT §5; canonical contract `PLATFORM_API_BASE_URL` | 🔵 Assist-side transport; not SYMPHONY's concern. Route replacement **pending** per FEATURE.md. |
| §4.3 PE Suspect Gate | `packages/symphony/src/engine/pe-suspect.ts` (`detectSymphonyPeSuspect`, `SYMPHONY_PE_SUSPECT_THRESHOLD`, Wells criteria) + Dashboard adapter `symphony-safety-gates.ts` | ✅ In SYMPHONY, wired to Dashboard |
| §4.4 Anaphylaxis Gate | `packages/symphony/src/engine/anaphylaxis.ts` (`detectSymphonyAnaphylaxis`, WAO 2020 triggers) + Dashboard adapter | ✅ In SYMPHONY, wired to Dashboard |
| §4.5 Aortic Dissection Pattern (CP-067) | Adapter entry exists: `packages/symphony/src/adapters/assist-patterns-parity.ts:3149` (`CP-067`). FEATURE.md §4.5 notes Dashboard runtime still missing. | ⚠️ Partial — CP-067 adapter parity present in SYMPHONY; Dashboard production runtime does NOT yet emit an Aortic Dissection red flag (per FEATURE.md). Not a SYMPHONY gap; it's a Dashboard wiring gap. |
| §4.6 Quality Dashboard UI (backend done, UI pending) | Backend metrics: Dashboard `workflow.ts` (CDSSQualityMetrics); SYMPHONY does not own quality metrics | 🔵 Not SYMPHONY scope |

---

## Consolidated Gap List (❌ items only)

Items that belong in SYMPHONY canonical scope but are NOT yet there:

1. **Prediction Engine — Treatment Response** (`detectTreatmentResponse`) — first-half/second-half velocity analysis classification (effective/partially_effective/ineffective/worsening). Dashboard-local in `src/lib/clinical/prediction-engine.ts`.
2. **Prediction Engine — Quadratic time-to-critical** — acceleration-adjusted root-solving formula. SYMPHONY currently has linear estimation only (`estimateTimeToCritical`).
3. **Chronic Disease Classifier** (`chronic-disease-classifier.ts`) — ICD-10 → ChronicDiseaseType mapping; duplicated between Dashboard and Assist.
4. **Gate taxonomy reconciliation + 3 disease-slice gaps** — SYMPHONY `SymphonySafetyGate` has 10 mechanism-named gates (`GATE_1_VITALS` through `GATE_10_ANAPHYLAXIS`); Assist `gate-registry.ts` has 11 disease-named gates. Most map cleanly (e.g., GATE_9_PE ↔ GATE_PE_SUSPECT), but three Assist concepts have **no SYMPHONY analog**: `GATE_ACS`, `GATE_STROKE`, `GATE_ANEMIA_BLEED_CHRONIC`. This is not a pure count gap — it's a taxonomy decision (mechanism vs disease) plus three missing disease slices. Moved from Hard-risk to Soft/Medium-risk after the reclassification below.
5. **Clinical Patterns Evaluator** (`clinical-patterns.ts` runtime engine) — SYMPHONY has adapter-surface only. Evaluator that matches 70 patterns against input lives in Assist.
6. **Pattern Engine** (`pattern-engine.ts`) — generic rule evaluator with 8 operators + nested field resolver + derived value computation.
7. **Action Protocols** (9 `PROTO_*` ABCDE protocols) — deterministic clinical response templates with referral criteria.
8. **Symptom Signals NLP** (`symptom-signals.ts`) — Indonesian symptom extraction + negation handling.
9. **Clinical Snapshot + Pattern Types** — supporting types for the pattern evaluator (per FEATURE.md §2.1 `clinical-snapshot.ts` + `pattern-types.ts`). Demote status: follow-on to Gaps #5 + #6; promotes automatically if/when pattern-matcher lands in SYMPHONY.
10. **HTN Classifier + Glucose Classifier** — shared deterministic classifiers currently duplicated.
11. **Pharmacotherapy Reasoner** — drug recommendation + contraindications.
12. **DDI Checker** — 173K drug interaction pairs + severity tiers.
13. **Epidemiology Weights Puskesmas** — prior adjustment to DDx ranking.
14. **Traffic Light Safety Gate** — 8 escalation rules (GREEN→YELLOW→RED, never downgrades).
15. **Dosage Database FKTP** — Formularium reference data (may go to sibling data package instead of SYMPHONY proper).
16. **Vital Screening Thresholds** (7 age cohorts + geriatric/pediatric adjustments) — `vital-screening-thresholds.ts`.

## ⚠️ Partial coverage (adapter / type only, evaluator missing)

17. **AVPU ↔ GCS mapper functions** — `SymphonyConsciousnessLevel` type canonical; bidirectional mapper functions (`avpuToNEWS2Score`, `assessConsciousnessSeverity`, `getBestGCSTotal`) remain Dashboard-local.
18. **Unified Vitals Schema** — SYMPHONY input shape exists (`SymphonyVitalsInput`); Dashboard's full Zod-validated schema + plausibility bounds + GCS/glucose types not in shared-types.
19. **Canonical Triage Builder** — input shape canonical; builder function Assist-local.
20. **Validation (ICD-10 registry + plausibility)** — validation flags modeled in `SymphonyHybridValidationFlag`; registry + classifier remain Dashboard-local.

## 🔵 Correctly out of SYMPHONY scope (reaffirmed)

- LLM orchestration (DeepSeek + Gemini + circuit breaker + prompt assembly).
- Knowledge Base (penyakit.json) + BM25 pre-filter + embedding retrieval (vector-store is sibling package).
- API routes, Next.js pages, Prisma schema, EMR UI, charts.
- Assist browser extension: anonymizer, RME scraper, content script, background service worker, sidepanel UI, IndexedDB store.
- Observability layer (Sentry, Langfuse, Socket.IO) — Dashboard-owned.
- Audit logging + session hash + quality metrics backend — Dashboard persistence.

---

## Risk Assessment

**Hard risk (clinical safety if Assist is decommissioned or Dashboard calls fail over):**
- **Gap #5 (Clinical Patterns Evaluator)** is the largest single risk. 70 CP patterns drive Assist's bedside alert logic. SYMPHONY adapter parity proves *shape* compatibility but does not execute pattern matching. If Chief eventually wants Assist thin-client calling SYMPHONY-via-Dashboard, the evaluator must exist server-side.
- **Gap #7 (Action Protocols)** is the second-largest. Without ABCDE protocols, SYMPHONY alerts lack actionable clinical guidance — Dashboard would have to reinvent them.
- **Gap #4 (Gate taxonomy + 3 disease slices)** affects semantic consistency. SYMPHONY enumerates 10 gates by mechanism (vitals/HTN/glucose/shock/sepsis/respiratory/pediatric/obstetric/PE/anaphylaxis); Assist enumerates 11 by disease (sepsis_early/septic_shock/shock_index/resp_failure/PE/ACS/stroke/anaphylaxis/DKA-HHS/asthma-COPD/anemia-bleed). Much of Assist maps onto SYMPHONY mechanisms, but `GATE_ACS`, `GATE_STROKE`, and `GATE_ANEMIA_BLEED_CHRONIC` have no direct SYMPHONY analog. Risk: taxonomy decision deferred + three disease slices unaddressed.

**Soft risk (duplication, drift potential):**
- Gap #3 (Chronic Disease Classifier), Gap #10 (HTN/Glucose Classifier): deterministic rules duplicated → eventual drift between Dashboard and Assist.

**Low risk:**
- Gap #1/#2 (prediction engine enhancements): Dashboard already works; SYMPHONY has linear estimation; quadratic + treatment response are refinements.
- **Gap cluster #11–#15 — pharmacology/epidemiology/references package decision pending.** Gaps #11 (pharmacotherapy reasoner), #12 (DDI checker 173K), #13 (epidemiology weights Puskesmas), #14 (traffic-light safety gate), #15 (dosage database FKTP) share a common architectural question: do they belong in SYMPHONY proper (clinical reasoning), a sibling shared package `@the-abyss/clinical-references` (reference data + deterministic rules), or stay Assist-local until a data-ownership decision is made? This is one Chief decision surface, not five independent gaps. Traffic-light is borderline — it's a decision-safety gate, not reference data — may prefer SYMPHONY proper.

## Reconciliation with Previous Report

The 2026-04-20 alignment report (`.agent/reports/2026-04-20-symphony-alignment.md`) concluded: **"Contract alignment: Confirmed. Dashboard ↔ SYMPHONY alignment: High confidence."**

This coverage audit **does not invalidate** that conclusion. Contract alignment is about what SYMPHONY currently exposes being correctly consumed by Dashboard. Coverage gap is about what SYMPHONY *does not yet expose* that FEATURE.md indicates should eventually be canonical.

Both statements coexist:
- What is in SYMPHONY is correctly wired to Dashboard ✓ (alignment report).
- There is substantial Assist-originating clinical logic NOT yet canonicalized ✓ (this audit).

FEATURE.md §3.2 pre-existing status column already flags 14 of 15 migration items as "BELUM" — this audit is a third-party confirmation plus surface expansion to prediction-engine + shared classifier duplications that FEATURE.md did not flag.

## Constraints Honored

- **Read-only.** Zero code change.
- **No DB/Prisma/SQL.** Zero database touch.
- **No test execution.**
- **No implementation plan.** This audit lists gaps; it does not sequence them. A migration plan requires a separate Chief-approved brainstorming session.
- **D:\Devop\abyss-monorepo\apps\healthcare\intelligenceboard\.agent\FEATURE.md** is the only file read outside the active worktree, and only because Chief explicitly named it. No other path in `D:\Devop` was opened. No source code in Assist (either path) was opened.
- **Assist runtime consumption remains out of scope.** Assist evidence is still adapter-surface only. The Assist entries in this audit are drawn from FEATURE.md (Dashboard's written inventory of Assist), not from Assist source code.

---

## Recommended Next Steps (Chief decision only — not auto-initiated)

If Chief wants to close Gaps #4, #5, #6, #7 (the high-risk cluster), the canonical migration order that makes sense given SYMPHONY architecture:

1. **Gate Registry expansion** — add 9 gate IDs to `SymphonySafetyGate` union in `packages/shared-types/src/symphony.ts` (Class B change, additive).
2. **Symptom Signals NLP** — port `symptom-signals.ts` to SYMPHONY (no external deps; pure TS rule-based).
3. **Pattern Engine** — port `pattern-engine.ts` as `packages/symphony/src/engine/pattern-matcher.ts` (generic evaluator).
4. **Clinical Patterns Evaluator** — convert 70 CP rules into SYMPHONY-native definitions consuming the new pattern-matcher; retain adapter for Assist back-compat.
5. **Action Protocols** — port as `packages/symphony/src/engine/action-protocols.ts`; attach to alert outputs.

Parallel tracks (independent):
- **Prediction Engine refinements** (Gap #1, #2) — small targeted additions to `trajectory.ts`.
- **Shared classifiers** (Gap #3, #10) — dedupe HTN/glucose/chronic-disease by canonicalizing into SYMPHONY.
- **Pharmacology references** (Gap #11–#15) — decide: SYMPHONY vs sibling `@the-abyss/clinical-references` package vs keep Dashboard-local.

**No migration is started without explicit Chief GO per task with scope, class, and acceptance criteria.**

---

*Report written: 2026-04-20 · Agent: Claude (claude-opus-4-7) · Class: A read-only · Companion to: .agent/reports/2026-04-20-symphony-alignment.md*
