# Phase 3 — Clinical Patterns Evaluator (70 CP Rules)
_Plan date: 2026-04-22 · Branch: abyss-core · Parent plan: 2026-04-20-symphony-canonicalization.md_
_Status: ✅ COMPLETE — commits `8fb9d1d` + `39db0cb`_

---

## Goal

Port all 70 clinical pattern (CP) rules from the existing `assist-patterns-parity.ts` adapter into a SYMPHONY-native evaluator. The evaluator accepts `SymphonyClinicalSnapshot` (Phase 2 output) and returns `SymphonyAlert[]` — with no Assist runtime participation.

**Release gate (actual):** For each of the 70 CPs, the evaluator alert must deep-equal `adaptAssistPatternToSymphonyAlert` output on stable fields `{ id, severity, title, source, acknowledged }`. Reasoning and triggeredAt differ by design.

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

### Decision 1 — Approach: DRY Converter

`SYMPHONY_CLINICAL_PATTERNS` is derived at module load time by mapping `ASSIST_PATTERN_PARITY_DEFINITIONS` through a `toSymphonyLocalPattern()` converter. No data is duplicated.

```
ASSIST_PATTERN_PARITY_DEFINITIONS (source)
  .map(toSymphonyLocalPattern)
  → SYMPHONY_CLINICAL_PATTERNS (70 SymphonyLocalClinicalPattern[])
```

### Decision 2 — Gate Taxonomy: Local Union + Generic Evaluator

Three Assist gates have no analog in `SymphonySafetyGate`:
- `GATE_ACS` → `GATE_11_ACS`
- `GATE_STROKE` → `GATE_12_STROKE`
- `GATE_ANEMIA_BLEED_CHRONIC` → `GATE_13_ANEMIA_BLEED`

Handled via a **package-internal only** type in `clinical-patterns-definitions.ts`:

```typescript
type SymphonyLocalGate = SymphonySafetyGate
  | 'GATE_11_ACS'
  | 'GATE_12_STROKE'
  | 'GATE_13_ANEMIA_BLEED'
```

The evaluator (`evaluateSymphonyPatterns`) is now generic over `P extends SymphonyEvaluablePattern` — defined in shared-types as `Omit<SymphonyClinicalPattern, 'gate'> & { gate: string }`. This eliminates any `as unknown as` gate-bypass cast at the call site.

`SymphonySafetyGate` itself is NOT modified. Phase 5 owns gate taxonomy reconciliation.

### Decision 3 — Input Contract: SymphonySymptomContext

Tier B/C patterns require boolean symptom flags (e.g. `suspectedInfection`, `dyspnea`). The original `SymphonySymptomSignalResult` only had `signals[]` + `negatedSignals[]`. Phase 3 added `SymphonySymptomContext` (27 boolean flags) to shared-types and widened `SymphonyClinicalSnapshot.symptoms` to:

```typescript
symptoms: SymphonySymptomSignalResult & SymphonySymptomContext
```

Consumers populate boolean flags alongside `signals` for Tier B/C patterns. Tier A (vitals-only) works without flags.

### Gate Mapping Table

| Assist Gate | SYMPHONY Local Gate | CPs |
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
| `packages/sentra/sentra-nada/src/engine/clinical-patterns-definitions.ts` | Converter + `SYMPHONY_CLINICAL_PATTERNS` registry |
| `packages/sentra/sentra-nada/src/engine/clinical-patterns.ts` | `evaluateClinicalPatterns()` evaluator |
| `packages/sentra/sentra-nada/src/__tests__/clinical-patterns.test.ts` | TDD unit tests (85 tests) |
| `packages/sentra/sentra-nada/src/__tests__/clinical-patterns.parity.test.ts` | Parity equivalence tests (72 tests + 2 representative) |

### Modified files

| File | Change |
|---|---|
| `packages/sentra/sentra-nada/src/index.ts` | Export new public API; remove `SymphonyLocalClinicalPattern`; add `SymphonySymptomContext`, `SymphonyEvaluablePattern` |
| `packages/shared/shared-types/src/symphony.ts` | Add `SymphonySymptomContext` (27 flags), `SymphonyEvaluablePattern`; widen `SymphonyClinicalSnapshot.symptoms`; make `SymphonyPatternMatch<P>` generic |
| `packages/sentra/sentra-nada/src/engine/pattern-engine.ts` | Make `evaluateSymphonyPatterns<P>` generic; helpers widened to `SymphonyEvaluablePattern` |

### Not touched

- `packages/sentra/sentra-nada/src/adapters/assist-patterns-parity.ts` — parity reference, read-only
- Any Dashboard or Assist consumer — production import replacement is Phase 5+ only

---

## Final Implementation

### `clinical-patterns-definitions.ts`

- `toSymphonyLocalPattern()` converter maps `AssistPatternParityDefinition` → `SymphonyLocalClinicalPattern`
- `SYMPHONY_CLINICAL_PATTERNS` = `ASSIST_PATTERN_PARITY_DEFINITIONS.map(toSymphonyLocalPattern)`
- 2 `as unknown as` casts remain for Assist criterion type → `SymphonyCriterion` conversion — data transform, not gate bypass
- `SymphonyLocalClinicalPattern` is package-internal only — NOT exported from `index.ts`

### `clinical-patterns.ts`

```typescript
// Final state — no unsafe gate-bypass cast
export function clinicalPatternMatchToSymphonyAlert(
  match: SymphonyPatternMatch<SymphonyEvaluablePattern>,
  triggeredAt?: string
): SymphonyAlert {
  return {
    id: `assist-${match.pattern.id.toLowerCase()}`,
    severity: match.pattern.severity,
    title: match.pattern.title,
    reasoning: [match.pattern.reasoning],   // Confidence% removed — belongs on match.confidence
    source: 'pattern',
    acknowledged: false,
    triggeredAt: triggeredAt ?? new Date().toISOString(),
  }
}

export function evaluateClinicalPatterns(
  snapshot: SymphonyClinicalSnapshot,
  options?: SymphonyPatternEvaluationOptions,
  triggeredAt?: string
): SymphonyAlert[] {
  const matches = evaluateSymphonyPatterns(snapshot, SYMPHONY_CLINICAL_PATTERNS, options)
  return matches.map(match => clinicalPatternMatchToSymphonyAlert(match, triggeredAt))
}
```

---

## Parity Gate (Final)

For each of the 70 CPs, the parity suite:
1. Builds a `SymphonyClinicalSnapshot` that satisfies all pattern criteria
2. Runs `evaluateClinicalPatterns(snapshot, undefined, FIXED_TS)`
3. Runs `adaptAssistPatternToSymphonyAlert(def, { triggeredAt: FIXED_TS })`
4. Deep-equals stable fields: `{ id, severity, title, source, acknowledged }`
5. `reasoning` and `triggeredAt` excluded — different by design (evaluator is SYMPHONY-native, adapter carries Assist metadata)

Result: **208/208 tests — 16 suites, 0 failures**

---

## Contract Version

`SYMPHONY_CONTRACT_VERSION = '0.2.0'` — no bump in Phase 3. Contract types were extended (`SymphonySymptomContext`, `SymphonyEvaluablePattern`, generic `SymphonyPatternMatch<P>`) but the evaluator interface is backwards-compatible.

---

## Cast Audit (Final)

| Location | Cast | Type | Justified |
|---|---|---|---|
| `clinical-patterns-definitions.ts:73` | `def.criteria.required as unknown as SymphonyCriterion[]` | Data transform | ✅ Assist criterion type → SYMPHONY criterion |
| `clinical-patterns-definitions.ts:76` | `def.criteria.scored as unknown as SymphonyCriterion[]` | Data transform | ✅ Same |
| `clinical-patterns.ts` | _(none)_ | — | — |
| `pattern-engine.ts` | _(none)_ | — | — |

**Unsafe gate-bypass cast removed:** `SYMPHONY_CLINICAL_PATTERNS as unknown as readonly SymphonyClinicalPattern[]` — eliminated by `SymphonyEvaluablePattern` generic.

---

## Rollback Strategy

Phase 3 adds new files and extends shared-types with additive types. If rollback needed:
- Delete `clinical-patterns-definitions.ts`, `clinical-patterns.ts`, both test files
- Revert `index.ts` exports
- Revert `shared-types/symphony.ts` additions (`SymphonySymptomContext`, `SymphonyEvaluablePattern`, generic `SymphonyPatternMatch`)
- `assist-patterns-parity.ts` adapter is untouched throughout

---

## Phase 5 Handoff Note

`GATE_11_ACS`, `GATE_12_STROKE`, `GATE_13_ANEMIA_BLEED` must be promoted to `SymphonySafetyGate` in shared-types. Once done, `SymphonyLocalGate` union and `SymphonyLocalClinicalPattern` can be deleted entirely.
