# SYMPHONY Canonicalization Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Canonicalize clinical-intelligence features currently owned by Dashboard or Assist into `packages/symphony` per Chief-locked 7-phase order, closing the gaps surfaced in the 2026-04-20 coverage audit while keeping SYMPHONY as canonical parent and Dashboard/Assist as consumers.

**Architecture:** Pure TypeScript, zero runtime deps, vitest for tests, existing SYMPHONY engine pattern (deterministic functions exported from `packages/symphony/src/engine/*.ts`, re-exported via `packages/symphony/src/index.ts`). Every phase produces working-testable-software on its own and may be shipped independently.

**Tech Stack:** TypeScript strict, vitest, pnpm workspace, `@the-abyss/shared-types` for contract types.

---

## Baseline Documents (MUST READ before executing any phase)

1. `.agent/reports/2026-04-20-symphony-alignment.md` — contract alignment baseline (what IS in SYMPHONY, how Dashboard consumes it).
2. `.agent/reports/2026-04-20-symphony-coverage-audit.md` — coverage gap audit (what is NOT yet in SYMPHONY + verdict per gap).
3. `.agent/MASTER_CONTEXT_2026-04-19.md` — monorepo SSOT and architectural direction.
4. `.agent/HANDOFF.md:17` — incident recovery lock and hierarchy reaffirmation.

## Non-Negotiable Constraints (apply to every phase)

- **Hierarchy lock:** `SYMPHONY` = canonical parent, `Dashboard` + `Assist` = consumers. Never regress to Dashboard-first or Assist-first framing.
- **Adapter parity ≠ canonical evaluator.** Phase 3 must produce a *runtime evaluator* inside SYMPHONY, not just adapter-surface parity (which already exists).
- **No Dashboard production import replacement** until Phase E release gate flips (`productionImportReplacementAllowed=true`) and Chief issues explicit GO. Current gate: `chief_go_required_for_production_import_replacement`.
- **No DB / Prisma / SQL / migration** during any phase of this plan.
- **No Assist source search** outside FEATURE.md citation. Assist-originating rules are ported by specification from FEATURE.md + existing SYMPHONY adapter (`packages/symphony/src/adapters/assist-patterns-parity.ts`), not by reading Assist source code.
- **One new file per task maximum** (root CLAUDE.md rule carryover; favour edits over new files).
- **TDD discipline:** write the failing test → run → implement → pass → commit. No batching.
- **Per-phase Chief GO gate:** each phase requires a fresh explicit GO token before `Phase X Execute`. Plan-writing is authorized; execution is not.

## Phase Roster (Chief-locked order)

| # | Phase | Scope | Risk | Status |
|---|---|---|---|---|
| 1 | Symptom Signals NLP | Indonesian symptom extraction + negation handling | Medium (pure TS, testable in isolation) | **Detailed below** |
| 2 | Pattern Engine generic evaluator | Rule evaluator (required + scored criteria, 8 operators, nested field resolver) | Medium | Scaffold only |
| 3 | Clinical Patterns Evaluator (70 CP native SYMPHONY) | Runtime evaluator consuming Phase 1 + Phase 2 to evaluate CP-001..CP-070 | High (adapter parity ≠ evaluator — this is the real migration) | Scaffold only |
| 4 | Action Protocols ABCDE | 9 deterministic clinical response templates (PROTO_*) + attachment to alerts | Medium | Scaffold only |
| 5 | Gate taxonomy reconciliation | Decide mechanism-named vs disease-named + add 3 disease slices (ACS, Stroke, Anemia/Bleed) | Medium (shared-types change; ripple effect) | Scaffold only |
| 6 | Prediction + classifier refinements | `detectTreatmentResponse` + quadratic TTC + HTN/Glucose/Chronic-disease classifier dedup | Low-Medium | Scaffold only |
| 7 | Pharmacology decision surface | Chief-level architectural decision: SYMPHONY proper vs sibling `@the-abyss/clinical-references` | Decision, not code | Scaffold only (decision brief) |

---

## Phase 1 — Symptom Signals NLP (DETAILED)

**Coverage audit reference:** Gap #8, Matrix 3, ❌ NOT in SYMPHONY, grep zero hits.

**Goal:** Port Indonesian symptom-signals NLP (negation-aware) from Assist `lib/emergency-detector/symptom-signals.ts` (per FEATURE.md §2.1) into `packages/symphony/src/engine/symptom-signals.ts` as a pure deterministic evaluator that consumers (Dashboard, later Phase 3 evaluator) can call without browser-extension dependencies.

**Why Phase 1:** Symptom signals are leaf dependencies. The Pattern Engine (Phase 2) and Clinical Patterns Evaluator (Phase 3) both consume extracted symptom signals. No SYMPHONY change depends on this — so it ships first and risk-free.

**Architecture:**
- Pure function module. Inputs: free-text `chiefComplaint` + `additionalComplaint` + optional `medicalHistory`. Output: normalized signal set (typed enum of symptom concepts).
- Negation-aware: "tidak demam", "tanpa nyeri", "tidak ada sesak" must strip the positive signal.
- No regex on free text without explicit matcher entry — every signal has a named matcher with its own test fixture.
- Module has zero runtime deps (pure TS). Uses existing shared-types for `SymphonyVitalsInput` only if needed for co-input shape; likely no type import needed.

**Files:**
- Create: `packages/symphony/src/engine/symptom-signals.ts`
- Create: `packages/symphony/src/__tests__/symptom-signals.test.ts`
- Modify: `packages/symphony/src/index.ts` (add exports)

### Task 1.1 — Type contract for symptom signals

**Files:**
- Create: `packages/symphony/src/engine/symptom-signals.ts` (skeleton only)
- Test: `packages/symphony/src/__tests__/symptom-signals.test.ts` (import + type test)

- [ ] **Step 1: Write failing test for public shape**

```typescript
// packages/symphony/src/__tests__/symptom-signals.test.ts
import { describe, expect, it } from 'vitest'
import {
  detectSymphonySymptomSignals,
  type SymphonySymptomSignalInput,
  type SymphonySymptomSignalResult,
  type SymphonySymptomSignal,
} from '../index'

describe('SYMPHONY symptom signals', () => {
  it('returns empty signal set for empty input', () => {
    const input: SymphonySymptomSignalInput = {
      chiefComplaint: '',
    }
    const result: SymphonySymptomSignalResult = detectSymphonySymptomSignals(input)
    expect(result.signals).toEqual([])
    expect(result.negatedSignals).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @the-abyss/symphony test -- src/__tests__/symptom-signals.test.ts`
Expected: FAIL with "Module has no exported member 'detectSymphonySymptomSignals'".

- [ ] **Step 3: Create minimal skeleton**

```typescript
// packages/symphony/src/engine/symptom-signals.ts
export type SymphonySymptomSignal =
  | 'fever'
  | 'dyspnea'
  | 'chest_pain'
  | 'headache'
  | 'vomit'
  | 'seizure'
  | 'altered_consciousness'
  | 'bleeding'
  | 'pallor'
  | 'weakness'
  | 'dizziness'
  | 'syncope'
  | 'diaphoresis'
  | 'rash_or_angioedema'
  | 'allergen_exposure'
  | 'abdominal_pain'
  | 'kussmaul_breathing'
  | 'polyuria'
  | 'neurologic_focal_deficit'

export interface SymphonySymptomSignalInput {
  chiefComplaint: string
  additionalComplaint?: string
  medicalHistory?: string
}

export interface SymphonySymptomSignalResult {
  signals: SymphonySymptomSignal[]
  negatedSignals: SymphonySymptomSignal[]
}

export function detectSymphonySymptomSignals(
  _input: SymphonySymptomSignalInput
): SymphonySymptomSignalResult {
  return { signals: [], negatedSignals: [] }
}
```

- [ ] **Step 4: Add exports to index.ts**

```typescript
// packages/symphony/src/index.ts — append after vital-alerts export
export {
  detectSymphonySymptomSignals,
  type SymphonySymptomSignal,
  type SymphonySymptomSignalInput,
  type SymphonySymptomSignalResult,
} from './engine/symptom-signals'
```

- [ ] **Step 5: Run test — expect PASS**

Run: `pnpm --filter @the-abyss/symphony test -- src/__tests__/symptom-signals.test.ts`
Expected: PASS 1/1.

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter @the-abyss/symphony typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/symphony/src/engine/symptom-signals.ts \
        packages/symphony/src/__tests__/symptom-signals.test.ts \
        packages/symphony/src/index.ts
git commit -m "$(cat <<'EOF'
feat(symphony): scaffold symptom-signals NLP module

Phase 1 Task 1.1 of SYMPHONY canonicalization plan (2026-04-20).
Pure TS, zero deps. Public API: detectSymphonySymptomSignals.

Agent: Claude
Phase: Execution
Handoff: symphony-canonicalization-phase-1
EOF
)"
```

### Task 1.2 — Fever detection (positive + negation)

**Files:**
- Modify: `packages/symphony/src/engine/symptom-signals.ts`
- Modify: `packages/symphony/src/__tests__/symptom-signals.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// Append to symptom-signals.test.ts
  it('detects fever from positive Indonesian terms', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'demam tinggi sejak kemarin' })
    expect(result.signals).toContain('fever')
    expect(result.negatedSignals).not.toContain('fever')
  })

  it('strips fever when negated with "tidak"', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'tidak demam, cuma lemas' })
    expect(result.signals).not.toContain('fever')
    expect(result.negatedSignals).toContain('fever')
  })

  it('strips fever when negated with "tanpa"', () => {
    const result = detectSymphonySymptomSignals({ chiefComplaint: 'batuk tanpa demam' })
    expect(result.signals).not.toContain('fever')
    expect(result.negatedSignals).toContain('fever')
  })

  it('detects fever from panas and meriang synonyms', () => {
    const resultPanas = detectSymphonySymptomSignals({ chiefComplaint: 'panas badan sejak 2 hari' })
    const resultMeriang = detectSymphonySymptomSignals({ chiefComplaint: 'meriang sepanjang malam' })
    expect(resultPanas.signals).toContain('fever')
    expect(resultMeriang.signals).toContain('fever')
  })
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @the-abyss/symphony test -- src/__tests__/symptom-signals.test.ts`
Expected: FAIL on the four new cases.

- [ ] **Step 3: Implement fever matcher with negation window**

```typescript
// packages/symphony/src/engine/symptom-signals.ts — replace body
const NEGATION_PREFIXES = ['tidak', 'tanpa', 'bukan', 'tidak ada', 'belum']
const NEGATION_WINDOW_TOKENS = 3

interface SignalMatcher {
  signal: SymphonySymptomSignal
  keywords: string[]
}

const MATCHERS: SignalMatcher[] = [
  { signal: 'fever', keywords: ['demam', 'panas badan', 'panas', 'meriang', 'menggigil'] },
]

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
}

function isNegatedAt(tokens: string[], matchIndex: number): boolean {
  const windowStart = Math.max(0, matchIndex - NEGATION_WINDOW_TOKENS)
  const windowTokens = tokens.slice(windowStart, matchIndex)
  const windowText = windowTokens.join(' ')
  return NEGATION_PREFIXES.some(prefix => {
    if (!windowText.includes(prefix)) return false
    const pIdx = windowText.lastIndexOf(prefix)
    return pIdx >= 0 && pIdx + prefix.length <= windowText.length
  })
}

function matchSignal(text: string, matcher: SignalMatcher): { matched: boolean; negated: boolean } {
  const tokens = text.split(' ')
  for (const keyword of matcher.keywords) {
    const keywordTokens = keyword.split(' ')
    for (let i = 0; i <= tokens.length - keywordTokens.length; i += 1) {
      const slice = tokens.slice(i, i + keywordTokens.length).join(' ')
      if (slice === keyword) {
        return { matched: true, negated: isNegatedAt(tokens, i) }
      }
    }
  }
  return { matched: false, negated: false }
}

export function detectSymphonySymptomSignals(
  input: SymphonySymptomSignalInput
): SymphonySymptomSignalResult {
  const joined = [input.chiefComplaint, input.additionalComplaint, input.medicalHistory]
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
    .map(normalize)
    .join(' ')

  const signals: SymphonySymptomSignal[] = []
  const negatedSignals: SymphonySymptomSignal[] = []

  for (const matcher of MATCHERS) {
    const { matched, negated } = matchSignal(joined, matcher)
    if (!matched) continue
    if (negated) {
      if (!negatedSignals.includes(matcher.signal)) negatedSignals.push(matcher.signal)
    } else {
      if (!signals.includes(matcher.signal)) signals.push(matcher.signal)
    }
  }

  return { signals, negatedSignals }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @the-abyss/symphony test -- src/__tests__/symptom-signals.test.ts`
Expected: PASS 5/5.

- [ ] **Step 5: Commit**

```bash
git add packages/symphony/src/engine/symptom-signals.ts \
        packages/symphony/src/__tests__/symptom-signals.test.ts
git commit -m "feat(symphony): fever matcher + negation window for symptom-signals

Phase 1 Task 1.2. Negation window = 3 tokens left.

Agent: Claude
Phase: Execution
Handoff: symphony-canonicalization-phase-1"
```

### Tasks 1.3 through 1.19 — Remaining 18 signal matchers

Each task follows the identical TDD cycle as Task 1.2 (failing test → implement matcher → pass → commit). One matcher per task, one commit per matcher. Fixed list of remaining signals and representative Indonesian keyword set:

| Task | Signal | Positive keywords (primary) | Notes |
|---|---|---|---|
| 1.3 | `dyspnea` | `sesak`, `sesak napas`, `sulit napas`, `susah napas`, `tidak bisa napas` | Last keyword is a double-negative; match BEFORE negation stripping |
| 1.4 | `chest_pain` | `nyeri dada`, `sakit dada`, `dada sakit`, `nyeri dada pleuritik` | Multi-token |
| 1.5 | `headache` | `sakit kepala`, `pusing`, `nyeri kepala`, `kepala sakit`, `thunderclap`, `sakit kepala hebat` | `pusing` ambiguous — see 1.11 dizziness; order matters |
| 1.6 | `vomit` | `muntah`, `mual muntah`, `muntah darah` | |
| 1.7 | `seizure` | `kejang`, `kejang demam` | |
| 1.8 | `altered_consciousness` | `penurunan kesadaran`, `tidak sadar`, `bingung`, `disorientasi`, `delirium`, `mengantuk berat` | NOTE: `tidak sadar` contains `tidak` — negation must NOT strip this; keyword is longer than negation-window check handles. Treat multi-token keywords beginning with `tidak` as a special case |
| 1.9 | `bleeding` | `perdarahan`, `berdarah`, `mimisan`, `BAB hitam`, `hematemesis`, `hematochezia`, `melena` | |
| 1.10 | `pallor` | `pucat`, `pallor`, `anemis` | |
| 1.11 | `weakness` | `lemas`, `lemah`, `letih` | |
| 1.12 | `dizziness` | `pusing berputar`, `vertigo`, `pusing` | `pusing` also maps to headache (1.5). When both apply, signal both (no mutex) |
| 1.13 | `syncope` | `pingsan`, `sinkop`, `mau pingsan`, `mau jatuh` | |
| 1.14 | `diaphoresis` | `keringat dingin`, `berkeringat dingin` | |
| 1.15 | `rash_or_angioedema` | `ruam`, `kulit bentol`, `bengkak muka`, `angioedema`, `urtikaria`, `gatal` (last one noisy — Chief decision whether to include; default YES for phase 1) | |
| 1.16 | `allergen_exposure` | `setelah makan seafood`, `setelah minum obat`, `paparan alergen`, `gigitan serangga`, `tersengat` | |
| 1.17 | `abdominal_pain` | `nyeri perut`, `sakit perut`, `perut sakit`, `kolik` | |
| 1.18 | `kussmaul_breathing` | `Kussmaul`, `napas dalam dan cepat`, `napas cepat dalam` | Case-insensitive (normalized) |
| 1.19 | `polyuria` + `neurologic_focal_deficit` | `polyuria`: `banyak kencing`, `sering kencing`, `poliuria`. `neurologic_focal_deficit`: `lemah sebelah`, `mulut mencong`, `bicara pelo`, `FAST`, `kelemahan tungkai`, `defisit neurologis fokal` | Combined task; both well-scoped |

**Template per task (repeat for each):**

1. Write failing test with 2-3 positive cases + 1 negated case + 1 ambiguity case if relevant.
2. Run test → FAIL.
3. Append matcher to `MATCHERS` array in `symptom-signals.ts`. Do NOT modify the `matchSignal` / `isNegatedAt` helpers — if a matcher needs new negation logic (e.g., Task 1.8 `tidak sadar`), extend `MATCHERS` entry with an optional `negationImmune: true` flag and handle it inside `matchSignal`.
4. Run test → PASS.
5. Run full file test suite: `pnpm --filter @the-abyss/symphony test -- src/__tests__/symptom-signals.test.ts` — confirm no regression.
6. Commit with message `feat(symphony): <signal> matcher for symptom-signals` + trailer.

### Task 1.20 — Full-suite regression + documentation

- [ ] **Step 1: Run full SYMPHONY test suite**

Run: `pnpm --filter @the-abyss/symphony test`
Expected: all previously green tests stay green; new symptom-signals tests GREEN; total count increases by 19–21 tests.

- [ ] **Step 2: Run full typecheck**

Run: `pnpm --filter @the-abyss/symphony typecheck`
Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `pnpm --filter @the-abyss/symphony lint`
Expected: PASS.

- [ ] **Step 4: Update .agent/PROGRESS.md with phase-1 completion**

Append: `- SYMPHONY canonicalization Phase 1 complete: symptom-signals NLP with 19 signals + negation window, 21+ tests green.`

- [ ] **Step 5: Update .agent/sessions/YYYY-MM-DD.md with session log**

Follow template in project `CLAUDE.md` (Goal, Actions Taken, Files Modified, Results, Next Steps, Boundaries Held).

- [ ] **Step 6: Append .agent/DECISIONS.md entry**

```markdown
### [YYYY-MM-DD] Symptom Signals NLP canonicalized into SYMPHONY
**Context:** Coverage audit Gap #8 — Assist `symptom-signals.ts` was a clinical-intelligence evaluator living outside SYMPHONY; Dashboard needed it server-side once Assist calls `/api/cdss/diagnose` with free-text anamnesis.
**Decision:** Ported as `packages/symphony/src/engine/symptom-signals.ts`, pure TS, zero runtime deps, 19 signals, 3-token negation window.
**Consequences:** Phase 2 (pattern-engine) and Phase 3 (clinical-patterns evaluator) can now consume canonical symptom signals without reaching into Assist. Dashboard may optionally switch from local symptom extraction to SYMPHONY's — NOT started in this phase.
**Reviewed by:** Chief (GO granted YYYY-MM-DD).
```

- [ ] **Step 7: Final commit (phase wrap)**

```bash
git add .agent/PROGRESS.md .agent/sessions/YYYY-MM-DD.md .agent/DECISIONS.md
git commit -m "docs(agent): Phase 1 symptom-signals NLP canonicalization complete

Closes Gap #8 from 2026-04-20 coverage audit.
All tests green. No Dashboard imports replaced. Hierarchy preserved.

Agent: Claude
Phase: Handoff
Handoff: symphony-canonicalization-phase-1"
```

### Phase 1 Acceptance Criteria

- [ ] `packages/symphony/src/engine/symptom-signals.ts` exists with 19 signal matchers + negation window.
- [ ] `packages/symphony/src/__tests__/symptom-signals.test.ts` asserts at least 21 behaviors across positive, negated, and multi-token cases.
- [ ] `packages/symphony/src/index.ts` re-exports `detectSymphonySymptomSignals`, `SymphonySymptomSignal`, `SymphonySymptomSignalInput`, `SymphonySymptomSignalResult`.
- [ ] `pnpm --filter @the-abyss/symphony test` GREEN (count ≥ previous count + 21).
- [ ] `pnpm --filter @the-abyss/symphony typecheck` PASS.
- [ ] `pnpm --filter @the-abyss/symphony lint` PASS.
- [ ] Zero Dashboard production imports replaced.
- [ ] Zero DB/Prisma/SQL/migration commands executed.
- [ ] `.agent/PROGRESS.md`, `.agent/sessions/YYYY-MM-DD.md`, `.agent/DECISIONS.md` updated.
- [ ] All commits carry `Agent: Claude · Phase: <Execution|Handoff> · Handoff: symphony-canonicalization-phase-1` trailer.

### Phase 1 Rollback

If any acceptance criterion fails and cannot be fixed within one additional autonomous iteration:

1. `git reset --soft HEAD~N` where N = number of phase-1 commits (**Chief confirmation required per Absolute Prohibition**).
2. Preserve test file as reference; delete new engine file only after Chief confirms.
3. Document failure state in `.agent/HANDOFF.md` under `## Error Recovery`.
4. Wait for Chief decision before attempting re-implementation.

---

## Phase 2 — Pattern Engine generic evaluator (SCAFFOLD)

**Coverage audit reference:** Gap #6, Matrix 3 ❌ NOT in SYMPHONY, grep zero hits for `pattern-engine`.

**Goal:** Port the generic rule evaluator engine from Assist `lib/emergency-detector/pattern-engine.ts` into `packages/symphony/src/engine/pattern-matcher.ts`. Provides reusable AND/OR-counted evaluation with 8 operators and nested field resolution — the infrastructure that Phase 3 will stand on.

**Files (expected):**
- Create: `packages/symphony/src/engine/pattern-matcher.ts`
- Create: `packages/symphony/src/engine/pattern-matcher-types.ts` (or inline in matcher file)
- Create: `packages/symphony/src/__tests__/pattern-matcher.test.ts`
- Modify: `packages/symphony/src/index.ts`

**Public API surface (target):**
```typescript
export interface SymphonyRequiredCriterion { field: string; operator: Operator; value?: unknown }
export interface SymphonyScoredCriterion extends SymphonyRequiredCriterion { /* weight if needed */ }
export type SymphonyPatternOperator = 'gte' | 'lte' | 'gt' | 'lt' | 'eq' | 'neq' | 'between' | 'true' | 'false'
export interface SymphonyPatternDefinition { id: string; requiredCriteria: SymphonyRequiredCriterion[]; scoredCriteria: SymphonyScoredCriterion[]; minScore: number }
export interface SymphonyPatternMatchResult { matched: boolean; matchedCriteria: string[]; score: number }
export function matchSymphonyPattern(definition: SymphonyPatternDefinition, input: unknown): SymphonyPatternMatchResult
```

**Acceptance criteria:**
- 8 operators implemented + tested individually.
- Nested field resolution (e.g., `vitals.sbp`, `derived.map`, `patient.avpuManual`, `symptoms.fever`) via dot-path.
- Derived values computed on demand (shockIndex = HR/SBP, MAP = dbp + (sbp-dbp)/3) — expose as helper API so caller can opt-in.
- Required criteria = AND (all must match). Scored criteria = OR-counted (≥ minScore).
- Pure TS, zero deps.
- Test suite ≥ 20 cases covering operators + field resolution + derived + required/scored interaction.

**Dependencies:** None. Phase 2 can run in parallel with Phase 1 in principle, but Chief-locked order is 1 → 2.

**Risks:** Field resolver on `unknown` input requires careful typing to stay strict without `any`. Consider Zod or a typed schema param if the resolver becomes complex.

**Before executing Phase 2:** Write detailed plan `docs/superpowers/plans/YYYY-MM-DD-symphony-phase-2-pattern-matcher.md` via fresh `/avcn-brainstorm` → `/avcn-write-plan` cycle.

---

## Phase 3 — Clinical Patterns Evaluator (70 CP native SYMPHONY) (SCAFFOLD)

**Coverage audit reference:** Gap #5, Matrix 3 ⚠️ Partial — adapter parity only. **This is the highest-risk phase** because it converts adapter-surface into canonical evaluator.

**Critical distinction (reviewer-confirmed in 2026-04-20 review loop):**
- Adapter parity (existing `packages/symphony/src/adapters/assist-patterns-parity.ts`) maps matched Assist output → canonical alert shape. It does NOT execute pattern matching.
- Canonical evaluator (Phase 3 deliverable) runs the 70 CP rules against raw clinical input (vitals + signals + history) inside SYMPHONY. Output: `SymphonyAlert[]` without any Assist runtime participation.

**Goal:** Produce `packages/symphony/src/engine/clinical-patterns.ts` that consumes Phase 1 (`detectSymphonySymptomSignals`) + Phase 2 (`matchSymphonyPattern`) and evaluates all 70 CP definitions natively.

**Files (expected):**
- Create: `packages/symphony/src/engine/clinical-patterns.ts`
- Create: `packages/symphony/src/engine/clinical-patterns-definitions.ts` (70 CP definitions as data, one-time port from FEATURE.md §2.1 spec — Chief-validated per gate group)
- Create: `packages/symphony/src/__tests__/clinical-patterns.test.ts`
- Modify: `packages/symphony/src/index.ts`
- Modify: `packages/symphony/src/adapters/assist-patterns-parity.ts` (adapter must continue to work; evaluator runs alongside, does not replace adapter until Chief Phase E release gate GO)

**Acceptance criteria:**
- 70 CP definitions (CP-001..CP-070) ported as data structures.
- Evaluator emits `SymphonyAlert[]` with `id: assist-cp-XXX` compatible with existing fixtures `SYMPHONY_PARITY_FIXTURE_CASES`.
- New route-level parity harness variant: SYMPHONY native evaluator output vs existing adapter-parity output → byte-equivalent alert set for all 70 fixtures. **This is the release gate for Phase 3.**
- Dashboard production imports remain unchanged (adapter is still the surface Dashboard consumes).
- Zero DB / Prisma / SQL / production import replacement.

**Risks (high):**
- 70 pattern definitions is significant data volume. Port in gate groups (GATE_SEPSIS_EARLY first, then GATE_SHOCK_INDEX, etc.) with per-group commits.
- Equivalence to existing adapter output is load-bearing. If byte-equivalence fails for any fixture, STOP and document divergence before adjusting.
- Chief-GO gate per gate group recommended (7 gate groups × 10 CPs ≈ 7 checkpoints).

**Before executing Phase 3:** Write detailed plan `docs/superpowers/plans/YYYY-MM-DD-symphony-phase-3-clinical-patterns.md`.

---

## Phase 4 — Action Protocols ABCDE (SCAFFOLD)

**Coverage audit reference:** Gap #7.

**Goal:** Port 9 ABCDE protocols (`PROTO_RESP_FAILURE`, `PROTO_SHOCK`, `PROTO_SEPSIS`, `PROTO_ANAPHYLAXIS`, `PROTO_ACS`, `PROTO_STROKE`, `PROTO_DKA_HHS`, `PROTO_HYPOGLYCEMIA`, `PROTO_CARDIAC_ARREST`) from Assist `action-protocols.ts` into `packages/symphony/src/engine/action-protocols.ts` as canonical decision-support output templates.

**Files (expected):**
- Create: `packages/symphony/src/engine/action-protocols.ts`
- Create: `packages/symphony/src/__tests__/action-protocols.test.ts`
- Modify: `packages/symphony/src/index.ts`
- Consider: extend `SymphonyAlert` shape in shared-types to include optional `actionProtocol?: SymphonyActionProtocolId` (Chief decision; alternative: separate attachment helper).

**Acceptance criteria:**
- 9 protocol definitions ported with full ABCDE steps + referral criteria per FEATURE.md §2.1.
- Helper API `attachActionProtocol(alert, protocolId)` OR definition lookup `getSymphonyActionProtocol(id)`.
- Tests verify all 9 protocols have complete A/B/C/other + referral criteria fields.

**Dependencies:** Optional soft dependency on Phase 3 (CPs reference PROTO_* IDs). Phase 4 can ship before Phase 3 completes if attachment is handled by Phase 3 later.

**Before executing Phase 4:** Write detailed plan via fresh brainstorm cycle.

---

## Phase 5 — Gate taxonomy reconciliation + 3 disease slices (SCAFFOLD)

**Coverage audit reference:** Gap #4 (revised after reviewer correction — taxonomy mismatch, not count gap).

**Chief decision required before planning:**
- Option A: Keep SYMPHONY mechanism-named (`GATE_1..10`), add 3 disease slices as additional entries (e.g., `GATE_11_ACS`, `GATE_12_STROKE`, `GATE_13_ANEMIA_BLEED`).
- Option B: Migrate SYMPHONY to disease-named registry matching Assist convention (ripple effect: rename `GATE_9_PE` → `GATE_PE_SUSPECT`, etc.; consumer migration; contract version bump to `0.2.0`).
- Option C: Dual registry (SYMPHONY keeps `SymphonySafetyGate` mechanism-named for backwards compat; add `SymphonyClinicalGate` disease-named that maps to it).

**Files (expected, per Option A):**
- Modify: `packages/shared-types/src/symphony.ts` (add 3 union members)
- Modify: `packages/symphony/src/engine/clinical-patterns.ts` (if Phase 3 already landed, CPs carrying these gates map correctly)
- Create: new ACS/Stroke/AnemiaBleed detectors in SYMPHONY OR wire existing CPs to emit these gate IDs.

**Acceptance criteria:**
- Contract version bumped per semver rules of this repo.
- `SymphonySafetyGate` union reflects Chief-decided taxonomy.
- Route parity fixtures extended for 3 new disease slices.

**Before executing Phase 5:** Chief decides A/B/C. Write detailed plan.

---

## Phase 6 — Prediction + classifier refinements (IMPLEMENTED 2026-04-22)

**Coverage audit reference:** Gaps #1, #2, #3, #10, #17.

**Implemented scope:**
- Added `detectSymphonyTreatmentResponse()` to `packages/symphony/src/engine/trajectory.ts`, using first-half vs second-half slope comparison on the worst worsening parameter.
- Added quadratic time-to-critical projection alongside linear slope, exposed as `timeToCriticalDetail` while preserving `timeToCriticalEstimate` as the best estimate surface.
- Canonicalized dashboard deterministic helpers into `packages/symphony/src/engine/classifiers.ts`: chronic-disease classifier, hypertension classifier, glucose classifier, and AVPU/GCS mapper helpers.
- Kept Phase 6 within one new source file (`classifiers.ts`) plus additive edits to `trajectory.ts`, per package-session file-creation discipline.

**Files landed:**
- Modified: `packages/symphony/src/engine/trajectory.ts`
- Created: `packages/symphony/src/engine/classifiers.ts`
- Modified: `packages/symphony/src/__tests__/trajectory.test.ts`
- Modified: `packages/symphony/src/index.ts`
- Modified: `packages/shared-types/src/symphony.ts`

**Acceptance criteria status:**
- `detectSymphonyTreatmentResponse()` matches the FEATURE.md split-half heuristic and returns `effective` / `partially_effective` / `ineffective` / `worsening` / `unknown`.
- Quadratic TTC solves `0.5a·t^2 + v·t - delta = 0` and selects the smallest valid positive root.
- Classifiers are deterministic, zero-runtime-dependency helpers exported from SYMPHONY root.
- Verification 2026-04-22: `pnpm --filter @the-abyss/symphony test` PASS 213/213, `typecheck` PASS, `lint` PASS, Dashboard `pnpm run test:symphony:route-parity` PASS 76/76 with gate still `partial`.

**Dependencies:** None hard. Executed after Phases 4 and 5 were complete, but without requiring production import replacement.

**Implementation notes:**
- Contract bumped additively to `0.5.0`.
- `timeToCriticalEstimate` remains backward-compatible best-estimate hours; new detail lives in `timeToCriticalDetail`.
- Classifier public type names were prefixed (`SymphonyHypertension*`, `SymphonyGlucose*`, `SymphonyChronicDisease*`) to avoid collisions with Phase 2 snapshot types.

---

## Phase 7 — Pharmacology decision surface (DECISION BRIEF, not code)

**Coverage audit reference:** Gaps #11, #12, #13, #14, #15 (consolidated after reviewer consolidation suggestion).

**Scope:** Chief architectural decision, not implementation. Questions to answer:

1. **Locus:** Do pharmacology/epidemiology/reference assets live in SYMPHONY proper (clinical reasoning continuum) or a sibling shared package `@the-abyss/clinical-references` (reference data + deterministic rules)?
2. **Assets in scope:** DDI Checker (173K pairs), Dosage Database FKTP, Epidemiology Weights Puskesmas, Pharmacotherapy Reasoner, Traffic-Light Safety Gate.
3. **Carve-out:** Traffic-Light is borderline (decision-safety gate, not pure reference data) — may prefer SYMPHONY proper even if others go to sibling package.
4. **Data-ownership:** Large reference data (DDI 173K) — ship as JSON in repo, hosted fetch, or separate data package?
5. **License / attribution:** FKTP formulary + DDI dataset licensing review before committing data artifacts.

**Deliverable:** `docs/adr/YYYY-MM-DD-pharmacology-locus-decision.md` with Chief's selection + rationale + migration roadmap.

**Acceptance criteria:**
- ADR written and merged.
- If sibling package chosen: separate scaffolding plan (similar structure to this one) for `@the-abyss/clinical-references`.
- If SYMPHONY chosen: append to this plan as Phase 7b with per-module task detail.

**No code execution in Phase 7.** This is a strategy decision with large architectural ripple (dataset size, license, dependency graph). Treat as its own brainstorm cycle when Chief is ready.

---

## Cross-Phase Notes

### Session hygiene between phases

- After each phase completes: update `.agent/PROGRESS.md`, `.agent/HANDOFF.md`, `.agent/DECISIONS.md`, session log.
- Context compaction recommended between phases (root CLAUDE.md §Context Management).
- Phase-complete commit tagged with `Handoff: symphony-canonicalization-phase-N`.

### Test-count trajectory

Baseline (2026-04-20): `pnpm --filter @the-abyss/symphony test` = 11 files / 57 tests GREEN.

| Phase | Expected test-count delta | Running total |
|---|---|---|
| 1 | +21 (symptom-signals) | 78 |
| 2 | +20 (pattern-matcher) | 98 |
| 3 | +70 CP fixtures + ~20 structural | 188 |
| 4 | +18 (9 protocols × 2 assertions) | 206 |
| 5 | +3 gate fixtures × 3 disease slices | 215+ |
| 6 | +15 (treatment-response + quadratic + classifiers) | 230+ |
| 7 | 0 (decision-only) | 230+ |

### Integration with existing SYMPHONY

- `assess.ts` orchestrator (main public entry): no change until Phase 3 completes. After Phase 3, `assessSymphonyInput` may optionally invoke `evaluateClinicalPatterns()` alongside existing evaluators. Gate this behind a Chief-approved flag initially.
- `packages/symphony/src/contracts/index.ts`: no contract surface change in Phase 1 or 2. Phase 3 may introduce `assist-cp-XXX` alert IDs into a canonical alert-id registry. Phase 5 touches contract directly (gate taxonomy). Bump `SYMPHONY_CONTRACT_VERSION` accordingly.

### Hard review gates

- **Between Phase 1 and Phase 2:** dispatch `superpowers:code-reviewer` for Phase 1 completeness.
- **Between Phase 2 and Phase 3:** dispatch reviewer + run full symphony test suite regression.
- **Before Phase 3 merge:** dispatch reviewer with explicit directive to verify *evaluator output equivalence* vs adapter output for all 70 CPs.
- **Before Phase 5 contract bump:** dispatch reviewer with directive to verify no consumer breakage.

### Absolute non-goals (do not drift into)

- ❌ Dashboard production import replacement.
- ❌ Flipping `metadata.status` out of `'degraded'`.
- ❌ Flipping `productionImportReplacementAllowed=true`.
- ❌ Touching `packages/database`.
- ❌ Running Prisma/SQL/migration of any form.
- ❌ Reading Assist source code outside FEATURE.md citation.
- ❌ Adding UI / API routes / persistence services to SYMPHONY.
- ❌ Implementing Phase N when Phase N-1 acceptance criteria are incomplete.

---

## Verification (end-to-end, per phase)

For each phase that completes:

```bash
# 1. Symphony package tests
pnpm --filter @the-abyss/symphony test

# 2. Symphony typecheck
pnpm --filter @the-abyss/symphony typecheck

# 3. Symphony lint
pnpm --filter @the-abyss/symphony lint

# 4. Shared-types typecheck (if Phase touches it, e.g., Phase 5)
pnpm --filter @the-abyss/shared-types typecheck

# 5. Dashboard regression (route parity harness; does NOT replace imports)
cd apps/healthcare/intelligenceboard
pnpm run test:symphony:route-parity
```

All five must GREEN before any phase is called complete.

---

*Plan written: 2026-04-20 · Agent: Claude (claude-opus-4-7) · Author-editor: Chief · Baseline: `.agent/reports/2026-04-20-symphony-alignment.md` + `.agent/reports/2026-04-20-symphony-coverage-audit.md` · JET Protocol: plan-only; each phase requires fresh Chief GO for execution.*
