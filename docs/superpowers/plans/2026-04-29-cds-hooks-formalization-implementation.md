# CDS Hooks Formalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formalize the AADI V2 CDS Hooks surface in `@the-abyss/symphony` so its workflow contract is explicit, test-pinned, PHI-safe, and ready for future boundary decisions without prematurely promoting it into `packages/fhir-engine`.

**Architecture:** Keep `packages/symphony` as the owner of CDS workflow semantics, card ordering, hook-trigger posture, and `SymphonyResult` interpretation. Add a thin internal contract layer around discovery metadata, hook context, prefetch assumptions, and response invariants so the current card adapter stops being a loose stub and becomes a documented, test-backed workflow surface.

**Tech Stack:** TypeScript strict, Vitest, pnpm workspace, HL7 CDS Hooks v2.0.1 contract posture, existing `@the-abyss/symphony` interop layer.

---

## Baseline Documents (MUST READ before implementing)

1. `AGENTS.md`
2. `.agent/CONTEXT.md`
3. `.agent/PROGRESS.md`
4. `.agent/HANDOFF.md`
5. `.agent/LESSONS.md`
6. `.agent/DECISIONS.md`
7. `docs/superpowers/specs/README-aadi-v2.md`
8. `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
9. `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
10. `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
11. `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
12. `packages/symphony/src/interop/symphony-to-cds-hooks.ts`
13. `packages/symphony/src/__tests__/symphony-to-cds-hooks.test.ts`

## Best-Practice Notes

- HL7 CDS Hooks `v2.0.1` remains the current published version and defines a synchronous, workflow-triggered contract around discovery, service invocation, hook context, prefetch, and cards.
  - Source: `https://cds-hooks.hl7.org/`
- Optional JSON fields in CDS Hooks should be omitted when absent rather than emitted as empty placeholders.
  - Source: `https://cds-hooks.hl7.org/`
- FHIR Clinical Reasoning keeps clinical reasoning separate from workflow transport/presentation surfaces.
  - Source: `https://www.hl7.org/fhir/clinicalreasoning-module.html`

Implication:

- formalize the workflow contract first
- keep reasoning semantics in `symphony`
- do not move this lane into `fhir-engine` during this plan

## Non-Negotiable Constraints

- `SYMPHONY` remains the only clinical reasoning authority.
- Do not move `mapSymphonyResultToCdsHooksResponse()` into `packages/fhir-engine` in this plan.
- Do not add CDS Hooks discovery endpoints or network transport code in this plan.
- Do not add consumer-specific hook branching beyond the bounded canonical service contract.
- Do not add SMART launch, suggestion actions, or external links unless the active task explicitly formalizes them and tests them.
- Keep PHI-safe behavior pinned: no `patientRef`, `encounterId`, `chiefComplaint`, or free-text clinical narrative leaks.

## Verification Gate

Before closing any task group in this plan:

- [ ] `corepack pnpm --filter @the-abyss/symphony test`
- [ ] `corepack pnpm --filter @the-abyss/symphony typecheck`

If documentation or package-boundary decisions are updated:

- [ ] `corepack pnpm --filter @the-abyss/fhir-engine test`
- [ ] `corepack pnpm --filter @the-abyss/fhir-engine typecheck`

---

## Current Baseline

At the start of this plan:

- `mapSymphonyResultToCdsHooksResponse()` is a deterministic card emitter in `packages/symphony/src/interop/symphony-to-cds-hooks.ts`
- the adapter emits cards in canonical order:
  - critical alerts
  - must-not-miss hypothesis
  - top working hypothesis
  - `clinicalDisposition === requires_review`
  - `shadowComparison.agreementLevel === low`
- the adapter has PHI-safety and determinism tests
- there is no explicit discovery contract
- there is no explicit hook context contract
- there is no explicit prefetch contract
- there is no explicit response invariant type beyond the current stub shape

This plan formalizes those missing contracts before any promotion discussion resumes.

---

## Task 1: Baseline Freeze and Behavior Pinning

**Purpose:** Lock the current CDS Hooks stub behavior before introducing any internal formalization seam.

**Files:**
- Modify: `packages/symphony/src/__tests__/symphony-to-cds-hooks.test.ts`

- [ ] **Step 1: Add explicit baseline tests for untouched behavior**

Add or refine tests that pin:

- critical alert cards remain one-per-critical-alert
- canonical order remains `critical -> must_not_miss -> top -> disposition -> shadow`
- empty `links` remain omitted or intentionally empty according to current contract decision
- CDS Hooks output remains deterministic for identical input

- [ ] **Step 2: Add a test that freezes current untouched surfaces**

Add a test that ensures:

- `mapSymphonyResultToCdsHooksResponse()` public function name and response top-level shape stay unchanged
- no accidental dependency on `packages/fhir-engine` is introduced

- [ ] **Step 3: Run the focused test file**

```bash
corepack pnpm --filter @the-abyss/symphony test -- src/__tests__/symphony-to-cds-hooks.test.ts
```

Expected:

- PASS with the expanded CDS Hooks baseline still green

- [ ] **Step 4: Commit**

```bash
git add packages/symphony/src/__tests__/symphony-to-cds-hooks.test.ts
git commit -m "test(symphony): freeze cds-hooks adapter baseline behavior"
```

---

## Task 2: Define Canonical CDS Hooks Service Contract Types

**Purpose:** Introduce explicit internal types for discovery notes, hook context, prefetch assumptions, and response invariants without adding transport code.

**Files:**
- Create: `packages/symphony/src/interop/cds-hooks-contract.ts`
- Modify: `packages/symphony/src/interop/index.ts`
- Modify: `packages/symphony/src/index.ts`
- Test: `packages/symphony/src/__tests__/cds-hooks-contract.test.ts`

- [ ] **Step 1: Add internal contract types**

Define bounded types for:

- `SymphonyCdsServiceDefinition`
- `SymphonyCdsHookName`
- `SymphonyCdsHookContextContract`
- `SymphonyCdsPrefetchAssumption`
- `SymphonyCdsResponseInvariant`

Keep them narrow and aligned to the current stub, for example:

```ts
export type SymphonyCdsHookName = 'patient-view'

export interface SymphonyCdsServiceDefinition {
  id: 'aadiv2-symphony-patient-view'
  hook: SymphonyCdsHookName
  title: 'AADI V2 Symphony'
  description: string
  prefetch: SymphonyCdsPrefetchAssumption[]
}
```

- [ ] **Step 2: Add contract tests**

Write tests that pin:

- only approved hook names are allowed
- prefetch assumptions are declared structurally, not inferred dynamically
- response invariants are explicit and deterministic

- [ ] **Step 3: Run focused contract tests**

```bash
corepack pnpm --filter @the-abyss/symphony test -- src/__tests__/cds-hooks-contract.test.ts
```

Expected:

- PASS with contract types pinned

- [ ] **Step 4: Commit**

```bash
git add packages/symphony/src/interop/cds-hooks-contract.ts \
        packages/symphony/src/interop/index.ts \
        packages/symphony/src/index.ts \
        packages/symphony/src/__tests__/cds-hooks-contract.test.ts
git commit -m "feat(symphony): add cds-hooks contract types"
```

---

## Task 3: Add Discovery Notes and Hook Context Metadata

**Purpose:** Formalize the service/discovery posture and bounded hook context assumptions without implementing a network discovery endpoint.

**Files:**
- Create: `packages/symphony/src/interop/cds-hooks-service-definition.ts`
- Modify: `packages/symphony/src/interop/index.ts`
- Modify: `packages/symphony/src/index.ts`
- Test: `packages/symphony/src/__tests__/cds-hooks-service-definition.test.ts`

- [ ] **Step 1: Add a canonical service-definition helper**

Create a helper such as:

```ts
export function getSymphonyCdsServiceDefinition(): SymphonyCdsServiceDefinition {
  return {
    id: 'aadiv2-symphony-patient-view',
    hook: 'patient-view',
    title: 'AADI V2 Symphony',
    description: 'Deterministic CDS Hooks card surface for AADI V2 review signals.',
    prefetch: [
      { key: 'patient', requirement: 'optional' },
      { key: 'encounter', requirement: 'optional' },
    ],
  }
}
```

- [ ] **Step 2: Add tests for service-definition invariants**

Pin:

- stable service id
- stable hook name
- deterministic description/title/source values
- no consumer-specific branching in service metadata

- [ ] **Step 3: Run focused tests**

```bash
corepack pnpm --filter @the-abyss/symphony test -- src/__tests__/cds-hooks-service-definition.test.ts
```

Expected:

- PASS with service-definition invariants locked

- [ ] **Step 4: Commit**

```bash
git add packages/symphony/src/interop/cds-hooks-service-definition.ts \
        packages/symphony/src/interop/index.ts \
        packages/symphony/src/index.ts \
        packages/symphony/src/__tests__/cds-hooks-service-definition.test.ts
git commit -m "feat(symphony): formalize cds-hooks service definition"
```

---

## Task 4: Refactor Card Assembly Behind an Internal Formalization Seam

**Purpose:** Keep public facade unchanged while separating card-emission policy from contract metadata.

**Files:**
- Modify: `packages/symphony/src/interop/symphony-to-cds-hooks.ts`
- Create: `packages/symphony/src/interop/cds-hooks-card-policy.ts`
- Modify: `packages/symphony/src/interop/index.ts`
- Test: `packages/symphony/src/__tests__/symphony-to-cds-hooks.test.ts`
- Test: `packages/symphony/src/__tests__/cds-hooks-card-policy.test.ts`

- [ ] **Step 1: Extract card policy helpers**

Move internal decision helpers into `cds-hooks-card-policy.ts`, such as:

- `buildCriticalAlertCards(...)`
- `buildMustNotMissCards(...)`
- `buildTopHypothesisCards(...)`
- `buildDispositionCards(...)`
- `buildShadowCards(...)`

Keep `mapSymphonyResultToCdsHooksResponse()` as the public facade in `symphony-to-cds-hooks.ts`.

- [ ] **Step 2: Preserve canonical order in one integration path**

Public assembly should still read clearly as:

```ts
return {
  cards: [
    ...buildCriticalAlertCards(result),
    ...buildMustNotMissCards(result),
    ...buildTopHypothesisCards(result),
    ...buildDispositionCards(result),
    ...buildShadowCards(result),
  ],
}
```

- [ ] **Step 3: Add focused policy tests**

Pin:

- must-not-miss card disappears when top hypothesis is not `must_not_miss`
- top hypothesis card is suppressed when the top category is `must_not_miss`
- shadow card emits only for `agreementLevel === 'low'`

- [ ] **Step 4: Verify public parity**

```bash
corepack pnpm --filter @the-abyss/symphony test -- src/__tests__/symphony-to-cds-hooks.test.ts
corepack pnpm --filter @the-abyss/symphony test -- src/__tests__/cds-hooks-card-policy.test.ts
```

Expected:

- PASS with public output unchanged

- [ ] **Step 5: Commit**

```bash
git add packages/symphony/src/interop/symphony-to-cds-hooks.ts \
        packages/symphony/src/interop/cds-hooks-card-policy.ts \
        packages/symphony/src/interop/index.ts \
        packages/symphony/src/__tests__/symphony-to-cds-hooks.test.ts \
        packages/symphony/src/__tests__/cds-hooks-card-policy.test.ts
git commit -m "refactor(symphony): formalize cds-hooks card policy seam"
```

---

## Task 5: Document Prefetch Assumptions and Response Invariants

**Purpose:** Make the CDS Hooks surface explicit and reviewable for downstream consumers without overclaiming transport readiness.

**Files:**
- Create: `docs/superpowers/specs/2026-04-29-aadi-v2-cds-hooks-formalization.md`
- Modify: `docs/superpowers/specs/README-aadi-v2.md`
- Modify: `.agent/sessions/2026-04-29.md`

- [ ] **Step 1: Write the formalization spec**

Document:

- current hook scope: `patient-view` only unless explicitly widened later
- service definition notes
- prefetch assumptions
- card ordering invariants
- PHI-safety invariants
- known non-goals:
  - no discovery endpoint yet
  - no SMART launch
  - no suggestion/action payloads
  - no promotion to `fhir-engine`

- [ ] **Step 2: Update AADI V2 index**

Add the new formalization spec and plan to `docs/superpowers/specs/README-aadi-v2.md` in reading order and document map.

- [ ] **Step 3: Update session log**

Add a concise audit trail entry to `.agent/sessions/2026-04-29.md`.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-04-29-aadi-v2-cds-hooks-formalization.md \
        docs/superpowers/specs/README-aadi-v2.md \
        .agent/sessions/2026-04-29.md
git commit -m "docs(aadi-v2): formalize cds-hooks contract posture"
```

---

## Task 6: Final Verification and Readiness Verdict

**Purpose:** Close the lane with a clear answer about whether promotion is now justified.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-29-aadi-v2-cds-hooks-formalization.md`
- Modify: `.agent/sessions/2026-04-29.md`

- [ ] **Step 1: Run full verification**

```bash
corepack pnpm --filter @the-abyss/symphony test
corepack pnpm --filter @the-abyss/symphony typecheck
corepack pnpm --filter @the-abyss/fhir-engine test
corepack pnpm --filter @the-abyss/fhir-engine typecheck
```

Expected:

- all `symphony` verification green
- `fhir-engine` remains unaffected and green

- [ ] **Step 2: Write readiness verdict**

Close the spec with one of two verdicts:

- `FORMALIZED_BUT_STAYS_IN_SYMPHONY`
- `READY_FOR_SEPARATE_PROMOTION_AUDIT`

Default expectation for this plan:

- `FORMALIZED_BUT_STAYS_IN_SYMPHONY`

unless the implementation unexpectedly reveals a truly structural sub-surface that can move cleanly.

- [ ] **Step 3: Update session log**

Add the final verdict and verification summary to `.agent/sessions/2026-04-29.md`.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-04-29-aadi-v2-cds-hooks-formalization.md \
        .agent/sessions/2026-04-29.md
git commit -m "docs(aadi-v2): close cds-hooks formalization readiness verdict"
```

---

## Exit Criteria

This plan is complete only when:

- CDS Hooks surface has explicit internal contract types
- service-definition and prefetch assumptions are documented
- card policy is separated from public facade without changing public behavior
- PHI-safe and determinism guarantees remain green
- final verdict clearly says whether the lane stays in `symphony` or is ready for a future audit

## Expected Final Position

If executed correctly, the expected end state is:

- `mapSymphonyResultToCdsHooksResponse()` remains in `packages/symphony`
- CDS Hooks stops being a loose stub and becomes a formalized workflow contract
- `fhir-engine` remains out of scope for this lane
- any future promotion discussion starts from a tighter contract and a cleaner risk profile
