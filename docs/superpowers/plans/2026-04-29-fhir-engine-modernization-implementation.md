# `packages/fhir-engine` Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` or `superpowers:subagent-driven-development` before implementing this plan task-by-task.

**Goal:** Modernize `packages/fhir-engine` into an honest, bounded, R5-target validation and normalization candidate for AADI V2 Phase 2, without moving reasoning authority out of `@the-abyss/symphony`.

**Architecture:** Keep all reasoning-driven mapping and interop intent in `packages/symphony`. Modernize `packages/fhir-engine` in place so it becomes truthful about what it supports today, explicit about what it does not support yet, and structurally ready for later promotion of validation/profile responsibilities.

**Tech Stack:** TypeScript strict, Vitest, Zod, pnpm workspace, `@the-abyss/symphony` as canonical reasoning package, HL7 FHIR R5-target documentation posture, bounded R4/R5 transition language.

---

## Baseline Documents (MUST READ before implementing)

1. `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
2. `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
3. `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
4. `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
5. `docs/superpowers/specs/README-aadi-v2.md`
6. `AGENTS.md`

## Non-Negotiable Constraints

- `SYMPHONY` remains the only clinical reasoning authority.
- Do not move `mapSymphonyResultToFhirBundle()` or `mapSymphonyResultToCdsHooksResponse()` into `packages/fhir-engine` in this plan.
- Do not add a terminology server, clinical inference, or diagnosis reconstruction logic.
- Do not claim R5 support that does not exist in code and tests.
- Do not leave TODO-heavy production-looking methods in place without an explicit honesty decision.
- Do not expand resource support beyond what the task explicitly approves.
- Keep changes additive and type-safe; no `any`, no fake transformation behavior, no silent fallbacks.

## Verification Gate

Before closing any task group in this plan:

- [ ] `pnpm --filter @the-abyss/fhir-engine test`
- [ ] `pnpm --filter @the-abyss/fhir-engine typecheck`
- [ ] `pnpm --filter @the-abyss/fhir-engine lint`

If docs or exports imply changed AADI V2 boundary:

- [ ] `pnpm --filter @the-abyss/symphony test`
- [ ] `pnpm --filter @the-abyss/symphony typecheck`

---

## Current Surface Lock

This plan assumes `packages/fhir-engine` currently contains:

```text
packages/fhir-engine/
├── README.md
├── package.json
└── src/
    ├── index.ts
    ├── types.ts
    ├── validator.ts
    ├── transformer.ts
    └── __tests__/
```

Modernization must stay within this package unless a task explicitly says otherwise.

---

## Task 1: Baseline Audit and Failing Honesty Tests

**Purpose:** Lock the current package behavior in tests before changing wording or API posture.

**Files:**
- Create/modify: `packages/fhir-engine/src/__tests__/modernization-baseline.test.ts`

- [ ] **Step 1: Add failing tests that expose current ambiguity**

Write tests that assert:

- package should not present transformer methods as real transforms when they only cast
- unsupported resource handling stays explicit
- current validator support is bounded to `Patient` and `Observation`

Example targets:

```typescript
import { describe, expect, it } from 'vitest'
import { FhirTransformer, FhirValidator } from '../index'

describe('fhir-engine modernization baseline', () => {
  it('keeps unsupported resources explicit', () => {
    const validator = new FhirValidator()
    const result = validator.validate({
      resourceType: 'Condition',
      id: 'cond-1',
    } as never)

    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unsupported resource type')
  })

  it('does not silently pretend cast-only transforms are real transformations', () => {
    const transformer = new FhirTransformer()
    const observation = {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{ system: 'urn:test', code: 'abc', display: 'abc' }],
      },
    }

    const normalized = transformer.normalize(observation)
    expect(normalized).toEqual(observation)
  })
})
```

- [ ] **Step 2: Run tests to capture baseline**

Run:

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
```

Expected:
- baseline tests may pass or partially fail depending on current ambiguity
- failures should guide the honesty pass, not be patched away loosely

- [ ] **Step 3: Commit baseline-only test changes**

```bash
git add packages/fhir-engine/src/__tests__/modernization-baseline.test.ts
git commit -m "test(fhir-engine): lock modernization baseline expectations"
```

---

## Task 2: README and Package Role Clarification

**Purpose:** Make the package honest before touching deeper implementation.

**Files:**
- Modify: `packages/fhir-engine/README.md`
- Modify: `packages/fhir-engine/src/index.ts`

- [ ] **Step 1: Rewrite package description and usage language**

Required README changes:

- replace `FHIR R4 validation and transformation layer` language with bounded modernization wording
- explicitly say package is a validation/normalization candidate, not a reasoning engine
- explicitly say current supported resources are only `Patient` and `Observation`
- explicitly say AADI V2 interop mapping authority remains in `packages/symphony`
- remove or rewrite usage examples that imply real transformation where none exists

- [ ] **Step 2: Update public export comments in `src/index.ts`**

Required comment changes:

- remove misleading `FHIR R4 Validation & Processing` header
- describe current package as transitional and bounded
- make `FhirTransformer` comments explicit about present behavior and modernization status

- [ ] **Step 3: Verify docs match actual package behavior**

Run:

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
```

- [ ] **Step 4: Commit role-clarity pass**

```bash
git add packages/fhir-engine/README.md packages/fhir-engine/src/index.ts
git commit -m "docs(fhir-engine): clarify bounded modernization role"
```

---

## Task 3: Transformer Honesty Pass

**Purpose:** Remove fake capability from `FhirTransformer`.

**Files:**
- Modify: `packages/fhir-engine/src/transformer.ts`
- Modify/create: `packages/fhir-engine/src/__tests__/transformer.test.ts`
- Modify: `packages/fhir-engine/src/index.ts` if export comments need to change further

- [ ] **Step 1: Decide per method, explicitly**

Each transformer method must end in one of these states:

- real bounded implementation
- explicit unsupported/error
- deprecation with honest semantics

Required review targets:

- `toInternal()`
- `toFhir()`
- `normalize()`

- [ ] **Step 2: Apply the honesty rule**

Preferred direction:

- if `toInternal()` and `toFhir()` have no truthful semantics yet, do **not** keep them as cast-only fake transforms
- replace with one of:
  - explicit throw with clear message
  - rename/reframe toward `passthrough`/`unsupported`
  - deprecate while preserving compile compatibility

- [ ] **Step 3: Add tests that pin the honesty decision**

Test examples:

- unsupported transformation path throws clearly
- `normalize()` remains deterministic and bounded
- no method silently claims to perform conversion it does not implement

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
```

Commit:

```bash
git add packages/fhir-engine/src/transformer.ts \
        packages/fhir-engine/src/__tests__/transformer.test.ts \
        packages/fhir-engine/src/index.ts
git commit -m "refactor(fhir-engine): make transformer surface honest"
```

---

## Task 4: Resource Support Matrix Declaration

**Purpose:** Make support boundaries explicit in code and docs.

**Files:**
- Modify: `packages/fhir-engine/README.md`
- Modify: `packages/fhir-engine/src/types.ts`
- Modify: `packages/fhir-engine/src/validator.ts`
- Modify/create: `packages/fhir-engine/src/__tests__/validator.test.ts`

- [ ] **Step 1: Declare the supported resource matrix**

Approved support in this task:

- `Patient`
- `Observation`

Explicitly unsupported for now:

- `Condition`
- `RiskAssessment`
- `DiagnosticReport`

- [ ] **Step 2: Reflect support matrix in code-level types and validator behavior**

Requirements:

- validator must fail honestly for unsupported resource types
- type-level contracts should not imply broader support than validator actually handles
- README table must match the code exactly

- [ ] **Step 3: Add tests for explicit unsupported resources**

Tests should pin:

- `Condition` rejected honestly
- `RiskAssessment` rejected honestly
- `DiagnosticReport` rejected honestly
- `Patient` and `Observation` still pass valid examples

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
```

Commit:

```bash
git add packages/fhir-engine/README.md \
        packages/fhir-engine/src/types.ts \
        packages/fhir-engine/src/validator.ts \
        packages/fhir-engine/src/__tests__/validator.test.ts
git commit -m "feat(fhir-engine): declare bounded resource support matrix"
```

---

## Task 5: R5 Target Prep and Version Strategy Wording

**Purpose:** Shift package posture from misleading R4-default language to an honest R5-target modernization path.

**Files:**
- Modify: `packages/fhir-engine/README.md`
- Modify: `packages/fhir-engine/src/index.ts`
- Optionally add: `packages/fhir-engine/src/version-strategy.ts`
- Modify/create tests only if new code seams are introduced

- [ ] **Step 1: Replace R4-default marketing language**

Required wording outcomes:

- package is no longer described as a settled R4 utility
- package is described as `R5-target modernization in progress`
- docs state clearly that current resource validation remains bounded during transition

- [ ] **Step 2: If a version seam is added, keep it minimal**

Allowed:

- a small explicit type or helper for version strategy metadata
- comments or constants that express target direction

Not allowed:

- full multi-version conversion framework
- speculative R5 resource models with no real validation path

- [ ] **Step 3: Verify and commit**

Run:

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
```

Commit:

```bash
git add packages/fhir-engine/README.md packages/fhir-engine/src/index.ts packages/fhir-engine/src/version-strategy.ts
git commit -m "docs(fhir-engine): align package wording with R5-target path"
```

If no `version-strategy.ts` is created, omit it from the commit.

---

## Task 6: Validation Hook Readiness

**Purpose:** Prepare a clean seam for future promotion from `packages/symphony/src/interop/` without moving mapping authority now.

**Files:**
- Create: `packages/fhir-engine/src/validation-hooks.ts`
- Modify: `packages/fhir-engine/src/index.ts`
- Create: `packages/fhir-engine/src/__tests__/validation-hooks.test.ts`

- [ ] **Step 1: Add a minimal validation seam**

The seam should express future intent such as:

- validate already-mapped resource payloads
- accept resource type + payload
- return bounded validation result

It must **not**:

- build FHIR resources from `SymphonyResult`
- perform terminology expansion
- re-score or reinterpret clinical meaning

- [ ] **Step 2: Keep the seam thin and honest**

Good examples:

- `validateSupportedResource(resource: FhirResource)`
- `canValidateResourceType(resourceType: string)`

Bad examples:

- `mapSymphonyResultToCondition()`
- `normalizeClinicalDiagnosis()`

- [ ] **Step 3: Add tests for seam behavior**

Tests should pin:

- supported resources pass through validator path
- unsupported resources fail honestly
- no reasoning-specific API enters this package

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
```

Commit:

```bash
git add packages/fhir-engine/src/validation-hooks.ts \
        packages/fhir-engine/src/index.ts \
        packages/fhir-engine/src/__tests__/validation-hooks.test.ts
git commit -m "feat(fhir-engine): add validation hook seam for future promotion"
```

---

## Task 7: Final Verification, README Sync, and Handoff

**Purpose:** Close the modernization baseline cleanly for Claude/Cursor handoff.

**Files:**
- Modify if needed: `docs/superpowers/specs/README-aadi-v2.md`
- Modify if needed: `.agent/sessions/YYYY-MM-DD.md`
- Optional: add a short package-level modernization note in `packages/fhir-engine/README.md`

- [ ] **Step 1: Run final verification**

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
```

- [ ] **Step 2: Reconcile the plan**

Mark each task as:

- Done
- Blocked with one concrete reason
- Cancelled with one concrete reason

Do not leave ambiguous in-progress items in the handoff.

- [ ] **Step 3: Prepare worker-facing report**

Claude/Cursor report must include:

- exact honesty decision for each transformer method
- final support matrix
- current package role
- what still remains deferred
- whether `packages/fhir-engine` is now ready for the next promotion step

- [ ] **Step 4: Commit closeout artifacts if changed**

```bash
git add docs/superpowers/specs/README-aadi-v2.md .agent/sessions/2026-04-29.md packages/fhir-engine/README.md
git commit -m "docs(fhir-engine): close modernization baseline handoff"
```

Omit unchanged files from the commit.

---

## Plan Self-Review

### Spec Coverage

- M1 Role Clarification: covered by Tasks 2 and 5
- M2 Transformer Honesty: covered by Task 3
- M3 Resource Support Matrix: covered by Task 4
- M4 R5 Target Prep: covered by Task 5
- M5 Validation Hook Readiness: covered by Task 6

### Boundary Coverage

- `SYMPHONY` remains reasoning authority: preserved throughout
- interop mapping stays in `packages/symphony`: preserved throughout
- `fhir-engine` becomes validation/normalization candidate only: enforced throughout

### Placeholder Scan

No task in this plan allows leaving TODO-heavy code surfaces as if they were production-ready. Any remaining deferred capability must be explicitly documented as unsupported or out of scope.

---

## Execution Order Recommendation

Recommended sequence:

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7

This order keeps the package honest first, then bounded, then promotion-ready.
