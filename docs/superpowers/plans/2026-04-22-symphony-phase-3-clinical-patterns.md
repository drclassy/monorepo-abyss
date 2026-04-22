# Phase 3 — Clinical Patterns Evaluator (70 CP Rules)
_Plan date: 2026-04-22 · Branch: abyss-core · Parent plan: 2026-04-20-symphony-canonicalization.md_

---

## Goal

Port all 70 clinical pattern (CP) rules from the existing `assist-patterns-parity.ts` adapter into a SYMPHONY-native evaluator. The evaluator accepts `SymphonyClinicalSnapshot` (Phase 2 output) and returns `SymphonyAlert[]` — with no Assist runtime participation.

**Release gate:** SYMPHONY native evaluator output must be equivalent to `adaptAssistPatternToSymphonyAlert` output for all 70 CP definitions (matching alert ID, severity, and title for each pattern).

---

## Context

| Prerequisite | Status |
|---|---|
| Phase 1 — Symptom Signals NLP (19 matchers) | ✅ Done — `a587b41` |
| Phase 2 — Pattern Engine `evaluateSymphonyPatterns` | ✅ Done — `0.2.0` |
| `ASSIST_PATTERN_PARITY_DEFINITIONS` (70 CPs) | ✅ Exists in adapter |
| `SymphonyClinicalSnapshot` contract | ✅ In shared-types `0.2.0` |

---

## Architecture Decisions

### Decision 1 — Approach: DRY Converter (Chief GO 2026-04-22)

**Chosen: Option A — DRY converter via `.map()`**

`SYMPHONY_CLINICAL_PATTERNS` is derived at module load time by mapping `ASSIST_PATTERN_PARITY_DEFINITIONS` through a `toSymphonyLocalPattern()` converter. No data is duplicated. Any future additions to the adapter automatically flow to the evaluator.

```
ASSIST_PATTERN_PARITY_DEFINITIONS (source)
  .map(toSymphonyLocalPattern)
  → SYMPHONY_CLINICAL_PATTERNS (70 SymphonyLocalClinicalPattern[])
```

### Decision 2 — Gate Taxonomy: Local Union (Chief GO 2026-04-22)

**Chosen: Option B — Local/internal gate union, no shared-types change**

Three Assist gates have no analog in `SymphonySafetyGate`:
- `GATE_ACS` (Acute Coronary Syndrome)
- `GATE_STROKE`
- `GATE_ANEMIA_BLEED_CHRONIC`

These are handled via a **package-internal only** type:

```typescript
// Defined ONLY in clinical-patterns-definitions.ts — never exported
type SymphonyLocalGate = SymphonySafetyGate
  | 'GATE_11_ACS'
  | 'GATE_12_STROKE'
  | 'GATE_13_ANEMIA_BLEED'
```

`SymphonySafetyGate` in `@the-abyss/shared-types` is NOT modified. Phase 5 owns gate taxonomy reconciliation.

**Phase 5 handoff note:** `GATE_11_ACS`, `GATE_12_STROKE`, `GATE_13_ANEMIA_BLEED` must be added to `SymphonySafetyGate` and this local union removed.

### Gate Mapping Table

| Assist Gate | SYMPHONY Local Gate | 14 CPs |
|---|---|---|
| GATE_SEPSIS_EARLY | GATE_5_SEPSIS | 20 |
| GATE_SEPTIC_SHOCK_HIGH | GATE_5_SEPSIS | 3 |
| GATE_SHOCK_INDEX | GATE_4_OCCULT_SHOCK | 9 |
| GATE_RESP_FAILURE | GATE_6_RESPIRATORY | 8 |
| GATE_RESP_ASTHMA_COPD | GATE_6_RESPIRATORY | 6 |
| GATE_PE_SUSPECT | GATE_9_PE | 4 |
| GATE_ANAPHYLAXIS | GATE_10_ANAPHYLAXIS | 2 |
| GATE_DKA_HHS | GATE_3_GLUCOSE | 5 |
| GATE_ACS | GATE_11_ACS _(local)_ | 6 |
| GATE_STROKE | GATE_12_STROKE _(local)_ | 5 |
| GATE_ANEMIA_BLEED_CHRONIC | GATE_13_ANEMIA_BLEED _(local)_ | 2 |

---

## Files

### New files

| File | Purpose |
|---|---|
| `packages/symphony/src/engine/clinical-patterns-definitions.ts` | Converter + `SYMPHONY_CLINICAL_PATTERNS` registry |
| `packages/symphony/src/engine/clinical-patterns.ts` | `evaluateClinicalPatterns()` evaluator |
| `packages/symphony/src/__tests__/clinical-patterns.test.ts` | TDD unit tests |
| `packages/symphony/src/__tests__/clinical-patterns.parity.test.ts` | Parity equivalence tests |

### Modified files

| File | Change |
|---|---|
| `packages/symphony/src/index.ts` | Export new public API |

### Not touched

- `packages/shared-types/src/symphony.ts` — no gate taxonomy change
- `packages/symphony/src/adapters/assist-patterns-parity.ts` — must keep working throughout Phase 3
- Any Dashboard or Assist consumer — no production import replacement this phase

---

## Implementation Detail

### `clinical-patterns-definitions.ts`

```typescript
import type { SymphonySafetyGate, SymphonyClinicalPattern, SymphonyCriterion } from '@the-abyss/shared-types'
import type { AssistPatternParityDefinition, AssistPatternParityGate } from '../adapters/assist-patterns-parity'
import { ASSIST_PATTERN_PARITY_DEFINITIONS } from '../adapters/assist-patterns-parity'

// Package-internal only — never exported
type SymphonyLocalGate = SymphonySafetyGate
  | 'GATE_11_ACS'
  | 'GATE_12_STROKE'
  | 'GATE_13_ANEMIA_BLEED'

// Package-internal extended pattern type (gate is wider)
export interface SymphonyLocalClinicalPattern extends Omit<SymphonyClinicalPattern, 'gate'> {
  readonly gate: SymphonyLocalGate
}

const GATE_MAP: Record<AssistPatternParityGate, SymphonyLocalGate> = {
  GATE_SEPSIS_EARLY: 'GATE_5_SEPSIS',
  GATE_SEPTIC_SHOCK_HIGH: 'GATE_5_SEPSIS',
  GATE_SHOCK_INDEX: 'GATE_4_OCCULT_SHOCK',
  GATE_RESP_FAILURE: 'GATE_6_RESPIRATORY',
  GATE_RESP_ASTHMA_COPD: 'GATE_6_RESPIRATORY',
  GATE_PE_SUSPECT: 'GATE_9_PE',
  GATE_ANAPHYLAXIS: 'GATE_10_ANAPHYLAXIS',
  GATE_DKA_HHS: 'GATE_3_GLUCOSE',
  GATE_ACS: 'GATE_11_ACS',
  GATE_STROKE: 'GATE_12_STROKE',
  GATE_ANEMIA_BLEED_CHRONIC: 'GATE_13_ANEMIA_BLEED',
}

function toSymphonyLocalPattern(def: AssistPatternParityDefinition): SymphonyLocalClinicalPattern {
  return {
    id: def.id,
    gate: GATE_MAP[def.gate],
    severity: def.severity,
    tier: def.tier,
    title: def.title,
    reasoning: def.reasoning,
    requiredCriteria: def.criteria.required as SymphonyCriterion[],
    scoredCriteria: def.criteria.scored.length > 0 ? def.criteria.scored as SymphonyCriterion[] : undefined,
    minScore: def.criteria.minScore,
    recommendations: def.recommendations as string[],
    actionProtocolId: def.actionProtocolId,
    requiresVitals: def.requiresVitals as string[] | undefined,
    source: def.source,
    differentials: def.differentials as string[] | undefined,
    supersededBy: def.supersededBy as string[] | undefined,
    confidenceWeight: def.confidenceWeight,
  }
}

export const SYMPHONY_CLINICAL_PATTERNS: readonly SymphonyLocalClinicalPattern[] =
  ASSIST_PATTERN_PARITY_DEFINITIONS.map(toSymphonyLocalPattern)
```

### `clinical-patterns.ts`

```typescript
import type { SymphonyClinicalSnapshot, SymphonyClinicalPattern, SymphonyAlert } from '@the-abyss/shared-types'
import { evaluateSymphonyPatterns, type SymphonyPatternEvaluationOptions, type SymphonyPatternMatch } from './pattern-engine'
import { SYMPHONY_CLINICAL_PATTERNS } from './clinical-patterns-definitions'
import { assistPatternAlertId } from '../adapters/assist-patterns-parity'

export function clinicalPatternMatchToSymphonyAlert(
  match: SymphonyPatternMatch,
  triggeredAt?: string
): SymphonyAlert {
  const pat = match.pattern
  return {
    id: assistPatternAlertId(pat.id as any),  // format: assist-cp-001
    severity: pat.severity,
    title: pat.title,
    reasoning: [pat.reasoning, `Confidence: ${(match.confidence * 100).toFixed(0)}%`],
    source: 'pattern',
    acknowledged: false,
    triggeredAt: triggeredAt ?? new Date().toISOString(),
  }
}

export function evaluateClinicalPatterns(
  snapshot: SymphonyClinicalSnapshot,
  options?: SymphonyPatternEvaluationOptions
): SymphonyAlert[] {
  // Cast is safe: evaluateSymphonyPatterns does not branch on pattern.gate
  const matches = evaluateSymphonyPatterns(
    snapshot,
    SYMPHONY_CLINICAL_PATTERNS as unknown as readonly SymphonyClinicalPattern[],
    options
  )
  return matches.map(match => clinicalPatternMatchToSymphonyAlert(match))
}
```

---

## TDD Steps

1. **Write failing tests** in `clinical-patterns.test.ts` and `clinical-patterns.parity.test.ts`
2. **Run tests** — confirm red (import fails, function undefined)
3. **Create `clinical-patterns-definitions.ts`** with converter
4. **Create `clinical-patterns.ts`** with evaluator
5. **Update `index.ts`** exports
6. **Run tests** — confirm green (all passing)
7. **Commit** with trailer

### Key test cases

| Test | Snapshot input | Expected |
|---|---|---|
| `SYMPHONY_CLINICAL_PATTERNS.length === 70` | — | 70 entries |
| CP-001 fires for qSOFA ≥2 | RR=24, SBP=95, AVPU='V' (2/3) | Alert id=`assist-cp-001`, severity=`high` |
| CP-002 fires for qSOFA ≥2 + infection | RR=24, SBP=95, AVPU='V', suspectedInfection=true | Alert id=`assist-cp-002`, severity=`critical` |
| Normal vitals → no alert | RR=14, SBP=120, AVPU='A' | Empty array |
| Alert IDs match `assist-cp-XXX` format | Any firing snapshot | All IDs start with `assist-cp-` |

---

## Parity Gate (Release Criteria)

For each of the 70 CP definitions, run both:
1. `adaptAssistPatternToSymphonyAlert(def)` — adapter path
2. Snapshot that triggers exactly that CP → `evaluateClinicalPatterns(snapshot)`

Compare: `alert.id === expected`, `alert.severity === expected`, `alert.title === expected`.

No CP fixture may diverge before Phase 3 is merged.

---

## Rollback Strategy

Phase 3 adds new files only. No existing evaluators are modified. If tests fail:
- Delete `clinical-patterns-definitions.ts` and `clinical-patterns.ts`
- Revert `index.ts` exports to previous state
- `assist-patterns-parity.ts` adapter is untouched throughout

---

## What NOT to Touch

- `packages/shared-types/src/symphony.ts` — gate taxonomy frozen until Phase 5
- `packages/symphony/src/adapters/assist-patterns-parity.ts` — parity reference, read-only
- Any app consumer (Dashboard, Assist) — production import replacement is Phase 5+ only
- `SYMPHONY_CONTRACT_VERSION` — no bump in Phase 3 (contract types unchanged)
