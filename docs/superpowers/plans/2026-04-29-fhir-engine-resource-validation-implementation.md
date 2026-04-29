# `packages/fhir-engine` Resource Validation Expansion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` or `superpowers:subagent-driven-development` before implementing this plan task-by-task.

**Goal:** Add bounded structural validation for `Condition`, `RiskAssessment`, and `DiagnosticReport` inside `packages/fhir-engine` without moving AADI V2 reasoning or interop mapping authority out of `@the-abyss/symphony`.

**Architecture:** Keep `packages/symphony` as the owner of `SymphonyResult`, diagnosis semantics, traffic-light semantics, and FHIR resource construction intent. Expand `packages/fhir-engine` only as a validator/normalization candidate by adding explicit schemas, validator branches, tests, support-matrix updates, and honest documentation for the three deferred resource families.

**Tech Stack:** TypeScript strict, Vitest, Zod, pnpm workspace, HL7 FHIR R5-target posture with bounded R4-transition slices where needed.

---

## Baseline Documents (MUST READ before implementing)

1. `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
2. `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
3. `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
4. `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
5. `docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md`
6. `docs/superpowers/specs/README-aadi-v2.md`
7. `AGENTS.md`

## Best-Practice Notes

- HL7 `Condition` is for problems/diagnoses/concerns that rise to the level of concern, and it has required `clinicalStatus` and `subject`.
  - Source: `https://www.hl7.org/fhir/R5/Condition.html`
- HL7 `RiskAssessment` is an event resource for assessed likelihood of outcomes, so it should stay as a distinct structural validator, not be conflated with traffic-light or diagnosis reasoning.
  - Source: `https://fhir.hl7.org/fhir/riskassessment-definitions.html`
- HL7 `DiagnosticReport` is also an event resource that carries findings and interpretation context, and it should validate report structure rather than infer report meaning.
  - Source: `https://hl7.org/fhir/DiagnosticReport.html`

Implication:

- validate structure honestly
- do not reconstruct clinical meaning
- keep support bounded and version claims truthful

## Non-Negotiable Constraints

- `SYMPHONY` remains the only clinical reasoning authority.
- Do not move `mapSymphonyResultToFhirBundle()` or `mapSymphonyResultToCdsHooksResponse()` into `packages/fhir-engine`.
- Do not add terminology expansion or profile resolution engines in this plan.
- Do not add fake “semantic validation” that actually reinterprets clinical meaning.
- Do not validate more than the three approved deferred resource families in this plan.
- Keep resource support explicit, type-safe, and test-backed.

## Verification Gate

Before closing any task group in this plan:

- [ ] `pnpm --filter @the-abyss/fhir-engine test`
- [ ] `pnpm --filter @the-abyss/fhir-engine typecheck`
- [ ] `pnpm --filter @the-abyss/fhir-engine lint`

If exports, docs, or support matrix changes alter Phase 2 boundary implications:

- [ ] `pnpm --filter @the-abyss/symphony test`
- [ ] `pnpm --filter @the-abyss/symphony typecheck`

---

## Current Baseline

At the start of this plan:

- Supported resources: `Patient`, `Observation`
- Deferred resources: `Condition`, `RiskAssessment`, `DiagnosticReport`
- `FhirTransformer` is already honest and bounded
- validation hook seam already exists
- modernization baseline is closed

This plan opens only the deferred validation lane.

---

## Task 1: Baseline Gate and Failing Deferred-Resource Tests

**Purpose:** Lock current deferred behavior before support is added.

**Files:**
- Modify/create: `packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts`

- [ ] **Step 1: Add failing-or-baseline tests for current deferred state**

Pin the current behavior:

- `Condition` rejected with deferred pointer
- `RiskAssessment` rejected with deferred pointer
- `DiagnosticReport` rejected with deferred pointer

These tests protect against silent widening before schemas land.

- [ ] **Step 2: Run baseline verification**

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
```

- [ ] **Step 3: Commit baseline tests**

```bash
git add packages/fhir-engine/src/__tests__/deferred-resource-baseline.test.ts
git commit -m "test(fhir-engine): lock deferred resource baseline behavior"
```

---

## Task 2: Add `Condition` Structural Validation

**Purpose:** Promote `Condition` from deferred to supported with bounded structural validation only.

**Files:**
- Modify: `packages/fhir-engine/src/types.ts`
- Modify: `packages/fhir-engine/src/validator.ts`
- Modify/create: `packages/fhir-engine/src/__tests__/validator.test.ts`
- Modify: `packages/fhir-engine/README.md`
- Modify: `packages/fhir-engine/src/index.ts`

- [ ] **Step 1: Add `FhirConditionSchema` and exported type**

Minimum bounded shape should cover:

- `resourceType: 'Condition'`
- `subject.reference`
- `clinicalStatus`
- `code` or another explicit coded diagnostic slot if chosen in bounded shape
- optional `verificationStatus`
- optional `category`
- optional `encounter`

Do not over-model the full resource if not needed for current plan.

- [ ] **Step 2: Add validator branch and support-matrix updates**

Required changes:

- add `Condition` to `SUPPORTED_RESOURCE_TYPES`
- remove `Condition` from `DEFERRED_RESOURCE_TYPES`
- update validator branch
- update README table and exports

- [ ] **Step 3: Add tests**

Tests should cover:

- valid minimal `Condition`
- missing `subject.reference` fails
- missing required status/code path fails honestly
- deferred-pointer behavior no longer used for `Condition`

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
```

```bash
git add packages/fhir-engine/src/types.ts \
        packages/fhir-engine/src/validator.ts \
        packages/fhir-engine/src/__tests__/validator.test.ts \
        packages/fhir-engine/README.md \
        packages/fhir-engine/src/index.ts
git commit -m "feat(fhir-engine): add bounded Condition validation"
```

---

## Task 3: Add `RiskAssessment` Structural Validation

**Purpose:** Promote `RiskAssessment` from deferred to supported without leaking traffic-light semantics into the package.

**Files:**
- Modify: `packages/fhir-engine/src/types.ts`
- Modify: `packages/fhir-engine/src/validator.ts`
- Modify/create: `packages/fhir-engine/src/__tests__/validator.test.ts`
- Modify: `packages/fhir-engine/README.md`
- Modify: `packages/fhir-engine/src/index.ts`

- [ ] **Step 1: Add `FhirRiskAssessmentSchema` and exported type**

Minimum bounded shape should cover:

- `resourceType: 'RiskAssessment'`
- `status`
- `subject.reference`
- at least one prediction entry if prediction is part of the chosen minimal shape

Keep it structural. Do not encode `trafficLight` or `clinicalDisposition` logic here.

- [ ] **Step 2: Promote support honestly**

Required changes:

- add `RiskAssessment` to `SUPPORTED_RESOURCE_TYPES`
- remove from `DEFERRED_RESOURCE_TYPES`
- add validator branch
- update README and exports

- [ ] **Step 3: Add tests**

Tests should cover:

- valid minimal `RiskAssessment`
- missing `status` fails
- missing `subject.reference` fails
- malformed `prediction` fails if modeled

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
```

```bash
git add packages/fhir-engine/src/types.ts \
        packages/fhir-engine/src/validator.ts \
        packages/fhir-engine/src/__tests__/validator.test.ts \
        packages/fhir-engine/README.md \
        packages/fhir-engine/src/index.ts
git commit -m "feat(fhir-engine): add bounded RiskAssessment validation"
```

---

## Task 4: Add `DiagnosticReport` Structural Validation

**Purpose:** Promote `DiagnosticReport` from deferred to supported while keeping the package out of report interpretation semantics.

**Files:**
- Modify: `packages/fhir-engine/src/types.ts`
- Modify: `packages/fhir-engine/src/validator.ts`
- Modify/create: `packages/fhir-engine/src/__tests__/validator.test.ts`
- Modify: `packages/fhir-engine/README.md`
- Modify: `packages/fhir-engine/src/index.ts`

- [ ] **Step 1: Add `FhirDiagnosticReportSchema` and exported type**

Minimum bounded shape should cover:

- `resourceType: 'DiagnosticReport'`
- `status`
- `code`
- optional `subject.reference`
- optional `result[]`
- optional `conclusion`

Keep the shape bounded; do not model every possible attachment/presentation path yet.

- [ ] **Step 2: Promote support honestly**

Required changes:

- add `DiagnosticReport` to `SUPPORTED_RESOURCE_TYPES`
- remove from `DEFERRED_RESOURCE_TYPES`
- add validator branch
- update README and exports

- [ ] **Step 3: Add tests**

Tests should cover:

- valid minimal `DiagnosticReport`
- missing `status` fails
- missing `code` fails
- malformed `result` reference array fails if modeled

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
```

```bash
git add packages/fhir-engine/src/types.ts \
        packages/fhir-engine/src/validator.ts \
        packages/fhir-engine/src/__tests__/validator.test.ts \
        packages/fhir-engine/README.md \
        packages/fhir-engine/src/index.ts
git commit -m "feat(fhir-engine): add bounded DiagnosticReport validation"
```

---

## Task 5: Validation Hook Expansion and Support-Matrix Reconciliation

**Purpose:** Ensure `validation-hooks.ts` and package-level semantics stay aligned after the three promotions.

**Files:**
- Modify: `packages/fhir-engine/src/validation-hooks.ts`
- Modify/create: `packages/fhir-engine/src/__tests__/validation-hooks.test.ts`
- Modify: `packages/fhir-engine/README.md`

- [ ] **Step 1: Reconcile hook seam with new supported resources**

Required outcomes:

- `canValidateResourceType()` reflects all five supported resources
- `validateSupportedResource()` handles the expanded union honestly
- README and package comments match the actual hook seam

- [ ] **Step 2: Add tests**

Tests should cover:

- all five supported types return `true` from `canValidateResourceType()`
- unsupported types still fail honestly
- no new reasoning-specific API enters the seam

- [ ] **Step 3: Verify and commit**

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
```

```bash
git add packages/fhir-engine/src/validation-hooks.ts \
        packages/fhir-engine/src/__tests__/validation-hooks.test.ts \
        packages/fhir-engine/README.md
git commit -m "feat(fhir-engine): reconcile validation seam with expanded support matrix"
```

---

## Task 6: Final Verification and Readiness Verdict

**Purpose:** Close the resource-validation lane with an explicit readiness statement.

**Files:**
- Modify if needed: `docs/superpowers/specs/README-aadi-v2.md`
- Modify if needed: `.agent/sessions/2026-04-29.md`
- Optional: add closeout note to `packages/fhir-engine/README.md`

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

- [ ] **Step 3: Prepare worker-facing report**

Report must include:

- final supported resource matrix
- minimum required fields chosen per new resource
- tests added
- whether package remains promotion-ready without overclaim
- what still remains deferred after this plan

- [ ] **Step 4: Commit closeout artifacts if changed**

```bash
git add docs/superpowers/specs/README-aadi-v2.md .agent/sessions/2026-04-29.md packages/fhir-engine/README.md
git commit -m "docs(fhir-engine): close deferred resource validation expansion"
```

Omit unchanged files from the commit.

---

## Plan Self-Review

### Scope Coverage

- `Condition` support: Task 2
- `RiskAssessment` support: Task 3
- `DiagnosticReport` support: Task 4
- validation hook reconciliation: Task 5
- final readiness verdict: Task 6

### Boundary Coverage

- reasoning authority remains in `packages/symphony`
- interop mapping remains in `packages/symphony`
- `fhir-engine` expands only as structural validator
- no terminology server or profile engine scope creep

### Placeholder Scan

This plan does not allow “partial support” wording without a schema, validator branch, tests, and support-matrix update. If a resource is not fully added in bounded structural form, it must remain deferred explicitly.

---

## Execution Order Recommendation

Recommended sequence:

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6

This order widens support one resource family at a time, minimizing ambiguity and regression risk.
