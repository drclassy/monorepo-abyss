# SYMPHONY Phase 2 — Pattern Engine (Generic Evaluator) Design

**Date:** 2026-04-20
**Status:** Approved (Chief, 2026-04-20)
**Owner:** Claude (claude-opus-4-7)
**Branch target:** `abyss-core`
**Baseline:** `.agent/reports/2026-04-20-symphony-coverage-audit.md` (Gap #6) · `docs/guides/implementation-plans/004-2026-04-20-symphony-canonicalization.md` (Phase 2 scaffold)

---

## Context

Phase 1 (Symptom Signals NLP) shipped canonical Indonesian symptom extraction into `packages/sentra/sentra-nada/src/engine/symptom-signals.ts` (commit `a587b41`). Phase 2 introduces the generic pattern-matching evaluator that Phase 3 (70 Clinical Patterns native SYMPHONY) will consume. This unblocks a clinical-rule evaluation path inside SYMPHONY that no longer depends on Assist's browser-bound runtime.

Chief's directive from coverage audit: "pastikan tidak ada satupun feature baik dari Assist dan Dashboard yang belum ada di Symphony." Gap #6 (Pattern Engine) is a HIGH-risk adapter-parity gap — SYMPHONY currently has *shape* compatibility via `assist-patterns-parity.ts` but no *runtime* evaluator.

---

## Scope Decisions (Chief-approved 2026-04-20)

| Question | Chief Answer | Impact |
|---|---|---|
| Scope vs Phase 3 | **B** — engine + 2-3 non-clinical test fixtures | Integration test real; 70 CP data stays for Phase 3 |
| Evidence source | **C Hybrid** — FEATURE.md baseline + Assist source only for 5 ambiguity points (cited) | Design-level port; zero full code copy |
| Fidelity | **C** — 10 operators + resolver + derived + criteria + severity sort + confidence + tier filter + requiresVitals | Template resolution + `supersededBy` dedup = consumer concerns, excluded |
| Input shape | **B** — port `ClinicalSnapshot` 1:1 minus Assist imports; swap symptoms to `SymphonySymptomSignalResult`; inline literal unions | Phase 3 CP port lossless, SYMPHONY owns clinical types |

---

## Ambiguity Resolutions (from Assist source, cited per point)

Source root: `D:/Devop/abyss-monorepo/apps/healthcare/sentra-assist/lib/emergency-detector/`

1. **TS shapes** — `pattern-types.ts:39-46` (Criterion), `:76-137` (ClinicalPattern, 19 fields), `:140-168` (PatternMatch + ScoreResult).
2. **`between` operator** — `[number, number]` tuple in `Criterion.value`; inclusive bounds evaluation (`pattern-types.ts:43`, `pattern-engine.ts:95-97`).
3. **Missing field** — Dot-path resolver returns `undefined` on broken path (`pattern-engine.ts:70-74`); criterion evaluator returns `false` on undefined/null (`pattern-engine.ts:82`). No throw, no skip.
4. **Severity sort** — `{ critical: 0, high: 1, warning: 2 }` ascending primary; tie-break by confidence descending (`pattern-engine.ts:38-42, 272-275`).
5. **Input shape** — `ClinicalSnapshot = { vitals, derived, symptoms, history, patient, timestamp }` (`clinical-snapshot.ts:93-100`).

**Bonus finding:** Assist has **10 operators** (FEATURE.md§737 listed 9). 10th is `'in'` — comma-separated string membership (`pattern-types.ts:29`, `pattern-engine.ts:100-102`). SYMPHONY Phase 2 includes all 10.

---

## Architecture

### Module layout

```
packages/sentra/sentra-nada/src/
├── engine/
│   └── pattern-engine.ts            # evaluator + resolver + derived + confidence
├── types/
│   └── pattern-types.ts             # Criterion, ClinicalPattern, ClinicalSnapshot, PatternMatch
├── __tests__/
│   ├── pattern-engine.test.ts       # unit: per-operator + resolver + severity sort
│   └── pattern-engine.integration.test.ts  # 2-3 synthetic fixtures end-to-end
└── index.ts                          # add exports
```

**Rationale:** Engine and types separated to match Assist's split (review-friendly). `types/` subdir is new — SYMPHONY currently has types colocated in engine files. Introducing a types subdir is Phase 2's one structural addition; justified because pattern-types are cross-consumed by engine + Phase 3 clinical-patterns + any future consumer.

**Alternative considered & rejected:** 1-file `pattern-engine.ts` with inline types. Rejected because the file would exceed 400 lines and violate SYMPHONY's "one concern per engine file" convention.

### Type placement — shared-types vs symphony-internal

**Decision: split.** Contract types (crossing package boundaries) → `packages/shared/shared-types/src/symphony.ts`. Pattern-definition types (SYMPHONY-owned data shapes) → `packages/sentra/sentra-nada/src/types/pattern-types.ts`.

**Why:** `shared-types/src/symphony.ts` currently holds cross-package contract types. Consumers (Dashboard/Assist) pass a `ClinicalSnapshot` in and receive `PatternMatch[]` out — both are contracts. `ClinicalPattern` + `Criterion` are *pattern definition data*, not contract; consumers don't construct patterns.

**Concrete split:**
- `packages/shared/shared-types/src/symphony.ts` (append):
  - `SymphonyClinicalSnapshot` (input contract)
  - `SymphonyPatternMatch` (output contract)
  - `SymphonyScoreResult`
  - `SymphonyAlertSeverity = 'critical' | 'high' | 'warning'`
  - `SymphonyPatternTier = 'A' | 'B' | 'C'`
- `packages/sentra/sentra-nada/src/types/pattern-types.ts`:
  - `SymphonyCriterionOp` (10 operators)
  - `SymphonyCriterion`
  - `SymphonyClinicalPattern`
  - Internal helpers (`SymphonyPatternEvaluationOptions`)

### Public API

```typescript
// from @sentra/nada
export function evaluateSymphonyPatterns(
  snapshot: SymphonyClinicalSnapshot,
  patterns: readonly SymphonyClinicalPattern[],
  options?: SymphonyPatternEvaluationOptions
): SymphonyPatternMatch[]

export interface SymphonyPatternEvaluationOptions {
  tierFilter?: SymphonyPatternTier[]   // default: all tiers
}

// plus all types re-exported from index.ts
```

**Naming convention:** `evaluateSymphony*` matches existing SYMPHONY engine exports (`detectSymphonyPeSuspect`, `evaluateSymphonyInstantScreeningGates`, etc.). No deviation.

**Excluded from public API (per fidelity C):**
- `patternMatchesToAlerts()` converter → stays in consumer (Assist/Dashboard own alert shape)
- `resolveTemplate()` → consumer-layer
- `existingAlertIds` parameter + `supersededBy` check → consumer dedup responsibility
- `clinicalData` snapshot in match output → consumer decides what to surface

### `SymphonyClinicalSnapshot` shape (port of Assist's ClinicalSnapshot)

```typescript
interface SymphonyClinicalSnapshot {
  vitals: SymphonyParsedVitals
  derived: SymphonyDerivedValues
  symptoms: SymphonySymptomSignalResult         // Phase 1 type
  history: SymphonyClinicalHistory
  patient: SymphonyPatientContext
  timestamp: number                             // Date.now() at build time
}

interface SymphonyParsedVitals {
  sbp: number; dbp: number; hr: number; rr: number
  temp: number; spo2: number; glucose: number   // 0 = not entered
}

interface SymphonyDerivedValues {
  map: number | undefined                       // (sbp + 2*dbp) / 3
  shockIndex: number | undefined                // hr / sbp
  avpuLevel: SymphonyAvpuLevel
  htnSeverity: SymphonyHtnSeverity | undefined
  glucoseCategory: SymphonyGlucoseCategory | undefined
  hasHypotension: boolean
  pulsePressure: number | undefined             // sbp - dbp
}

interface SymphonyClinicalHistory {
  bpHistory: SymphonyHistoricalBP[]             // { sbp, dbp, timestamp }
  knownHTN: boolean
  knownDM: boolean
  knownAsthma: boolean
  knownCOPD: boolean
  pregnancyStatus: boolean | null
  allergies: string[]
  chronicDiseases: string[]
}

interface SymphonyPatientContext {
  age: number
  physiology: SymphonyPhysiologyBand
  avpuManual: 'A' | 'C' | 'V' | 'P' | 'U'
  supplementalO2: boolean
  painScore: number
}

// Inline literal unions (swap Assist-imported types):
type SymphonyAvpuLevel = 'A' | 'V' | 'P' | 'U'
type SymphonyHtnSeverity = 'normal' | 'prehypertension' | 'stage1' | 'stage2' | 'crisis'
type SymphonyGlucoseCategory = 'hypoglycemic' | 'normal' | 'prediabetic' | 'diabetic' | 'severe_hyperglycemia'
type SymphonyPhysiologyBand = 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly' | 'geriatric'
```

**Builder out of scope:** `buildSymphonyClinicalSnapshot()` is NOT included in Phase 2. Consumers build their own snapshot; engine evaluates. Phase 3 or a later phase may canonicalize the builder.

### Confidence formula (port from Assist `pattern-engine.ts:185-205`)

```
base = { A: 0.9, B: 0.7, C: 0.5 }[tier]
weighted = pattern.confidenceWeight != null ? base × confidenceWeight : base
if (scoredCriteria total > 0):
  ratio = achieved / total
  final = weighted × (0.8 + 0.2 × ratio)    // 0.8×..1.0× adjustment
else:
  final = weighted
clamp final to [0.0, 1.0]
```

No SYMPHONY-specific tweaks. Exact port preserves adapter parity semantics for Phase 3.

### Evaluation flow (per pattern)

1. **Tier filter** — if `options.tierFilter` set and `pattern.tier` not in filter → skip.
2. **Required vitals check** — if any field in `pattern.requiresVitals` resolves to `0` or non-number → skip.
3. **Required criteria** — all must pass (AND). Any fail → skip.
4. **Scored criteria** — if any, count passes; if `achieved < (minScore ?? total)` → skip.
5. **Build `SymphonyPatternMatch`** — matched criteria, score result, confidence, pattern ref.
6. **Sort** — severity asc primary, confidence desc tiebreak.

**Excluded from flow:** `supersededBy` dedup step (consumer responsibility, per fidelity C).

### Operator semantics (10 operators, exact port)

| Op | Value type | Semantics |
|---|---|---|
| `gte` | number | `field >= value` (numeric only) |
| `lte` | number | `field <= value` (numeric only) |
| `gt` | number | `field > value` (numeric only) |
| `lt` | number | `field < value` (numeric only) |
| `eq` | primitive | `field === value` (strict) |
| `neq` | primitive | `field !== value` (strict) |
| `true` | boolean | `field === true` |
| `false` | boolean | `field === false` |
| `between` | `[min, max]` | `field >= min && field <= max` (numeric, inclusive) |
| `in` | string (CSV) | `value.split(',').includes(String(field))` |

For numeric operators, non-number `field` → `false`. For `between`, non-number `field` or non-array `value` → `false`.

---

## Test Strategy

**TDD, one test per commit, per existing SYMPHONY discipline.**

### Unit tests (`pattern-engine.test.ts`)

1. **Operators (10 tests)** — one per operator with pass + fail cases.
2. **Field resolver (3 tests)** — top-level, nested 2-deep (`vitals.sbp`), nested 3-deep with missing-path returning `undefined`.
3. **Derived values (2 tests)** — `shockIndex = hr/sbp`, `MAP = dbp + (sbp-dbp)/3`.
4. **Required criteria AND logic (2 tests)** — all pass → match; one fail → no match.
5. **Scored criteria OR-count logic (3 tests)** — `achieved >= minScore` → match; `achieved < minScore` → skip; `minScore` undefined defaults to `scoredCriteria.length`.
6. **Tier filter (2 tests)** — filter present (skip excluded); filter absent (evaluate all).
7. **requiresVitals guard (2 tests)** — zero vital → skip pattern; all present → proceed.
8. **Severity sort (2 tests)** — critical before high before warning; confidence tiebreak within same severity.
9. **Confidence calculation (4 tests)** — tier A base 0.9, weighted (×0.5 → 0.45), scored boost (ratio 1.0 → 1.0× final), clamp upper bound to 1.0.

**Estimated count: ~30 unit tests.**

### Integration tests (`pattern-engine.integration.test.ts`)

Three **non-clinical synthetic fixtures** (engineer-invented, not from 70 CP). Purpose: verify engine end-to-end with realistic snapshot + multi-criterion patterns. Fixtures stored inline in test file, each ≤ 20 lines.

1. **`FIXTURE_ALPHA`** — Required-only pattern, tier A, no weight. 2 required criteria both pass → match with confidence 0.9.
2. **`FIXTURE_BETA`** — Scored criteria only, tier A. 3 scored criteria, `minScore=2`, 2 pass → match with confidence 0.9 × (0.8 + 0.2 × 2/3) = 0.84.
3. **`FIXTURE_GAMMA`** — Required + scored + requiresVitals + tier C + `confidenceWeight=0.5`. All gates pass → match with confidence adjusted.

Additional: **multi-pattern evaluation** — all three fixtures against one snapshot, result sorted by severity, asserting order.

**Estimated count: ~8 integration tests.**

### Verification commands

```bash
pnpm --filter @sentra/nada test
pnpm --filter @sentra/nada typecheck
pnpm --filter @sentra/nada lint
```

All must PASS green before Phase 2 ships. Existing 84/84 tests must continue passing (no regression).

---

## Files Changed (estimate)

| File | Action | Est. LOC |
|---|---|---|
| `packages/sentra/sentra-nada/src/types/pattern-types.ts` | Create | ~120 |
| `packages/sentra/sentra-nada/src/engine/pattern-engine.ts` | Create | ~200 |
| `packages/sentra/sentra-nada/src/__tests__/pattern-engine.test.ts` | Create | ~300 |
| `packages/sentra/sentra-nada/src/__tests__/pattern-engine.integration.test.ts` | Create | ~150 |
| `packages/sentra/sentra-nada/src/index.ts` | Modify (exports) | +15 |
| `packages/shared/shared-types/src/symphony.ts` | Modify (append contract types) | +40 |
| `packages/shared/shared-types/src/index.ts` | Modify (re-export if needed) | +5 |

**No modifications to:** Dashboard imports, Assist imports, `packages/platform/database/**`, any Prisma schema, CI config, adapter `assist-patterns-parity.ts`.

---

## Constraints (hard locks)

- ❌ **No 70 CP port** — Phase 3 territory
- ❌ **No Dashboard production import replacement** — gate `chief_go_required_for_production_import_replacement` still active
- ❌ **No DB / Prisma / SQL / migration** — Phase 2 is pure TS
- ❌ **No template resolution** (`{sbp}`, `{map}`, etc.) — consumer concern
- ❌ **No `supersededBy` dedup** in engine — consumer concern
- ❌ **No `patternMatchesToAlerts` converter** — consumer concern
- ❌ **No Assist source read** beyond the 5 ambiguity points (cited above)
- ❌ **No new runtime deps** — pure TS + vitest only
- ❌ **No AGENTS.md, `.cursor/rules/`, or hook modification**
- ❌ **No Classy rebrand working-tree touch** — Chief owns
- ✅ TDD discipline: test → fail → implement → pass → commit, one concern per commit
- ✅ Explicit file staging only (`git add <file>`, never `git add -A`)

---

## Commit Strategy (10 commits, TDD boundaries)

1. `feat(symphony): scaffold pattern-engine types + skeleton`
2. `feat(symphony): implement dot-path field resolver`
3. `feat(symphony): implement derived values (shockIndex + MAP)`
4. `feat(symphony): implement criterion evaluator — 10 operators`
5. `feat(symphony): implement required + scored criteria evaluation`
6. `feat(symphony): implement tier filter + requiresVitals guard`
7. `feat(symphony): implement confidence calculation + severity sort`
8. `feat(symphony): add integration fixtures + end-to-end tests`
9. `feat(shared-types): append SymphonyClinicalSnapshot + SymphonyPatternMatch`
10. `chore(symphony): bump contract version to 0.2.0` (additive API)

Each commit green-test before next starts. Rollback = `git revert <sha>` at any commit granularity.

---

## Next Steps After This Spec

1. Invoke `superpowers:writing-plans` to expand this spec into step-by-step `.agent/HANDOFF.md` with per-task commit boundaries and acceptance tests.
2. Wait for fresh Chief GO before JET-6 execution.
3. Execute TDD task-by-task per writing-plans output.
4. Phase 2 close: update `.agent/PROGRESS.md`, `.agent/HANDOFF.md`, `.agent/DECISIONS.md` with Phase 2 completion ADR.

---

## Risks Acknowledged

1. **ClinicalSnapshot shape drift** — if Assist later evolves `ClinicalSnapshot`, SYMPHONY's port becomes stale. Mitigation: reverse-check Assist shape at Phase 3 start.
2. **10-vs-9 operator discrepancy in FEATURE.md** — FEATURE.md§737 lists 9 operators; Assist implementation has 10 (`'in'` added). FEATURE.md patch is out of Phase 2 scope; flagged for Chief.
3. **Confidence formula opacity** — tier base × weight × ratio is empirical Assist-origin; SYMPHONY adopting verbatim without clinical validation. Chief may later want principled recalibration.
4. **No builder included** — consumers must construct `SymphonyClinicalSnapshot` themselves. Creates short-term friction; canonicalization of builder is a later-phase decision.

---

**End of Phase 2 design.**
