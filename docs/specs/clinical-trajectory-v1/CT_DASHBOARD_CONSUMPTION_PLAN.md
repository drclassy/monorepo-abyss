# CT Dashboard Consumption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Intelligenceboard Clinical Trajectory Monitor consume the additive `clinicalTrajectory` route field without changing route behavior, CT adapter behavior, or clinical authority.

**Architecture:** The route is already the approved server facade and already returns `clinicalTrajectory` additively. The next implementation should only extend the existing client hook-to-panel seam so the already-built `ClinicalTrajectoryV1Panel` can render the shared CT v1 contract from the route response. Intelligenceboard remains a consumer surface, while CT v1 contract authority stays in `@the-abyss/shared-types` and long-term trajectory reasoning authority stays outside the app.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Node `node:test`, `pnpm`, Turborepo.

---

## 1. Current Confirmed State

CT adapter runtime wiring is complete and must not be reopened in this mission.

Confirmed from SSOT and closure records:

- `apps/healthcare/intelligenceboard/src/app/api/patients/[id]/trajectory/route.ts` is the active trajectory route.
- The route preserves legacy fields: `success`, `data`, `visit_history`, `momentum_history`, and `meta`.
- The route now adds `clinicalTrajectory`.
- The route contract test already covers additive `clinicalTrajectory` plus preserved legacy fields.
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts` is the sanctioned transitional bridge from local Intelligenceboard trajectory output into `ClinicalTrajectoryV1`.
- `apps/healthcare/intelligenceboard/src/components/features/trajectory/ClinicalTrajectoryV1Panel.tsx` already renders `ClinicalTrajectoryV1`.
- `apps/healthcare/intelligenceboard/src/components/features/trajectory/TrajectoryIntelligencePanel.tsx` already accepts a `clinicalTrajectory?: ClinicalTrajectoryV1 | null` prop and renders `ClinicalTrajectoryV1Panel` when the prop is provided.
- `apps/healthcare/intelligenceboard/src/hooks/useTrajectoryAnalysis.ts` fetches `/api/patients/[id]/trajectory`, but currently reads only `data`, `visit_history`, and `momentum_history`.
- No current Dashboard consumer was found that reads `clinicalTrajectory` from the route response.

Baseline audit immediately before this planning mission reported root `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`, and `pnpm governance:agents-check` as PASS, with a clean working tree.

## 2. Existing Route Response Shape

The existing route success payload is:

```ts
{
  success: true,
  data: TrajectoryAnalysis,
  visit_history: VitalSnapshot[],
  momentum_history: MomentumSnapshot[],
  clinicalTrajectory: ClinicalTrajectoryV1 | null,
  meta: {
    patientIdentifier: string,
    visitCount: number,
    analyzedAt: string,
  },
}
```

Important behavior:

- `clinicalTrajectory` may be `null` if adapter conversion fails.
- Adapter conversion failure is logged server-side with a truncated patient hash and does not fail the legacy trajectory route response.
- Client consumption must preserve this fallback behavior. A missing or `null` `clinicalTrajectory` must not hide legacy `data`, `visit_history`, or `momentum_history`.
- Error payload remains `{ success: false, error: string }`.

## 3. App Boundary Preflight

| Field | Value |
| --- | --- |
| Target path | `apps/healthcare/intelligenceboard` |
| Target app | `@classy/intelligenceboard` |
| Domain | `healthcare` |
| Product classification | `internal-operator-app` |
| Future standalone repo | `No / not now` |
| Crown-jewel access tier | `CJ-4 internal-core-access controlled` |
| Crown-jewel access mode | `approved-internal-core-or-service-facade` |
| Owns crown-jewel logic? | No |
| Allowed imports | App-local imports, `@the-abyss/shared-types`, approved internal/service facade surfaces already present |
| Forbidden imports | Sibling apps, new `packages/sentra/**` internal imports, copied algorithms, core-to-app reverse imports |
| Verification command | `pnpm --filter @classy/intelligenceboard run test -- --filter intelligence-route`, then root checks if requested |

Evidence:

- `apps/_governance/OWNER_DECISION_MATRIX.md` classifies `intelligenceboard` as a monorepo-bound jewel surface with controlled `CJ-4` access.
- `apps/healthcare/intelligenceboard/package.json` package name is `@classy/intelligenceboard`.
- Existing app dependency on `@sentra/nada` is present, but this plan does not add dependencies or new crown-jewel imports.
- Search found no new core package import of `apps/healthcare/intelligenceboard`.
- Existing trajectory route performs database reads through app-local vital history service; this plan does not add database writes.

## 4. Dashboard Consumer Candidates

| Candidate | Current role | Consumption suitability | Decision |
| --- | --- | --- | --- |
| `src/hooks/useTrajectoryAnalysis.ts` | Fetches trajectory route and owns client-side response parsing | Best narrow seam because it already parses route response and returns `visitHistory` / `momentumHistory` | Use in first implementation |
| `src/components/features/trajectory/TrajectoryIntelligencePanel.tsx` | Main CT dashboard container; already renders legacy CME panels | Good consumer because it already has `clinicalTrajectory` prop and renders `ClinicalTrajectoryV1Panel` conditionally | Use in first implementation |
| `src/components/features/trajectory/ClinicalTrajectoryV1Panel.tsx` | Pure CT v1 display component | Already fit for purpose and tested with shared CT mocks | Do not change unless a failing test proves a display bug |
| `src/app/dashboard/intelligence/TrajectoryMonitorPanel.tsx` | Patient hash entry surface for Dashboard CT monitor | Should remain URL/hash controller only | Avoid for first implementation unless hook signature forces a trivial pass-through |
| `src/types/abyss/trajectory.ts` | App-local legacy trajectory route/UI types | May define local response helper types if needed | Avoid unless TypeScript needs a local route response type |
| `packages/shared/shared-types/src/platform-api.ts` | Cross-app platform API contract for Assist and other clients | Currently lacks `clinicalTrajectory` in `PlatformTrajectorySuccessResponse` | Do not change in first Dashboard UI mission; plan separate cross-app contract mission if Assist must consume CT v1 |

## 5. Recommended First UI Consumption Target

Exactly one recommended first implementation target:

**Wire `clinicalTrajectory` through the existing Intelligenceboard Clinical Trajectory Monitor hook-to-panel seam.**

Concrete meaning:

- Parse `clinicalTrajectory?: ClinicalTrajectoryV1 | null` in `src/hooks/useTrajectoryAnalysis.ts`.
- Return it from `useTrajectoryAnalysis()`.
- In `src/components/features/trajectory/TrajectoryIntelligencePanel.tsx`, destructure `clinicalTrajectory` from the hook result and pass it to the existing `ClinicalTrajectoryV1Panel`.
- Do not create a new UI surface.
- Do not change `TrajectoryMonitorPanel` unless a type-only pass-through is unavoidable.
- Do not change route behavior or CT adapter behavior.

This target is safest because the route and display panel already exist. The current gap is only that the hook does not carry the additive field to the existing panel.

## 6. Data Contract Assumptions

Use a local client-side response shape for the next implementation:

```ts
import type { ClinicalTrajectoryV1 } from '@the-abyss/shared-types'
import type { TrajectoryAnalysis, VitalSnapshot, MomentumSnapshot } from '@/types/abyss/trajectory'

type TrajectoryApiSuccessResponse = {
  success: true
  data: TrajectoryAnalysis
  visit_history?: VitalSnapshot[]
  momentum_history?: MomentumSnapshot[]
  clinicalTrajectory?: ClinicalTrajectoryV1 | null
  meta?: {
    patientIdentifier: string
    visitCount: number
    analyzedAt: string
  }
}

type TrajectoryApiErrorResponse = {
  success: false
  error?: string
}
```

Rules:

- Treat `clinicalTrajectory` as optional and nullable for backward compatibility.
- Never require `clinicalTrajectory` for the legacy panels to render.
- Keep `TrajectoryAnalysis` as the source for existing CME panels.
- Keep `ClinicalTrajectoryV1` as the source for the CT v1 summary panel only.
- Do not reinterpret `clinicalTrajectory.response.requiresEscalation` as an autonomous command; it is decision support only.

## 7. Boundary Rules

- Intelligenceboard is a consumer and controlled app surface, not CT reasoning authority.
- `ct-adapter.ts` remains a transitional bridge, not a diagnosis engine.
- CT v1 is a consumer-safe longitudinal contract and rendering layer.
- SYMPHONY remains diagnosis / clinical reasoning authority; this mission must not start Simphony/SYMPHONY work.
- `packages/sentra/**` remains crown-jewel review-first territory and must not be touched.
- Legacy route fields must remain compatible.
- No database write, migration, auth change, OCR, RAG, external API, dependency, package rename, or route behavior change belongs in the first implementation mission.
- If `clinicalTrajectory` is `null`, render only the existing legacy trajectory panels and avoid alarming the user.
- UI copy must keep human review visible.

## 8. Non-Goals

- No Dashboard UI redesign.
- No new trajectory route.
- No route response rewrite.
- No CT adapter rewrite.
- No shared CT v1 contract change.
- No `PlatformTrajectoryResponse` update in the first Dashboard UI consumption mission.
- No Sentra Assist integration.
- No Simphony/SYMPHONY implementation.
- No canonical 52-trajectory engine work.
- No database schema or write path change.
- No external integration.
- No dependency addition.

## 9. Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Hook treats `clinicalTrajectory` as required and breaks legacy responses | Medium | High | Type it as optional/null and keep legacy `data` as the render gate |
| UI implies autonomous clinical action | Medium | High | Preserve existing decision-support language and avoid imperative clinical commands |
| First mission drifts into route/adapter/shared-types changes | Medium | High | Limit changed runtime files to hook + panel + focused tests |
| Shared `PlatformTrajectoryResponse` remains stale for Assist | High | Medium | Record as separate follow-up, not first Dashboard UI mission |
| Existing `TrajectoryIntelligencePanel` already has prop seam, but hook wiring may lack direct behavioral coverage | Medium | Medium | Add a small parser-focused unit test for preserving `clinicalTrajectory` |
| Build warnings distract from scope | Medium | Low | Report existing non-blocking warnings; do not fix warning noise in implementation mission |

## 10. Implementation Sequence For Next Mission

### Task 1: Add response parsing coverage

**Files:**

- Modify: `apps/healthcare/intelligenceboard/src/hooks/useTrajectoryAnalysis.ts`
- Create: `apps/healthcare/intelligenceboard/src/hooks/useTrajectoryAnalysis.test.ts`
- Optional modify: `apps/healthcare/intelligenceboard/scripts/test-suite.ts` only if the new hook test must be included in the `intelligence-route` suite.

- [ ] **Step 1: Add a pure parser seam in the hook file**

Add an exported helper that converts the raw route JSON into the hook state shape. Keep it small and deterministic.

```ts
export function normalizeTrajectoryApiResponse(json: TrajectoryApiResponse): {
  data: TrajectoryAnalysis
  visitHistory: VitalSnapshot[]
  momentumHistory: MomentumSnapshot[]
  clinicalTrajectory: ClinicalTrajectoryV1 | null
} {
  if (!json.success || !json.data) {
    throw new Error(json.error ?? 'Trajectory analysis unavailable')
  }

  return {
    data: json.data,
    visitHistory: json.visit_history ?? [],
    momentumHistory: json.momentum_history ?? [],
    clinicalTrajectory: json.clinicalTrajectory ?? null,
  }
}
```

- [ ] **Step 2: Write the failing parser test**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

import { mockImprovingTrajectory } from '@the-abyss/shared-types'

import { normalizeTrajectoryApiResponse } from './useTrajectoryAnalysis'

test('normalizeTrajectoryApiResponse preserves additive clinicalTrajectory', () => {
  const analysis = { summary: 'stable', visitCount: 3 } as never

  const normalized = normalizeTrajectoryApiResponse({
    success: true,
    data: analysis,
    visit_history: [],
    momentum_history: [],
    clinicalTrajectory: mockImprovingTrajectory,
    meta: {
      patientIdentifier: 'aaaaaaaa...',
      visitCount: 3,
      analyzedAt: '2026-05-30T00:00:00.000Z',
    },
  })

  assert.equal(normalized.data, analysis)
  assert.equal(normalized.clinicalTrajectory, mockImprovingTrajectory)
})

test('normalizeTrajectoryApiResponse keeps backward compatibility when clinicalTrajectory is absent', () => {
  const analysis = { summary: 'legacy only', visitCount: 3 } as never

  const normalized = normalizeTrajectoryApiResponse({
    success: true,
    data: analysis,
  })

  assert.equal(normalized.data, analysis)
  assert.equal(normalized.clinicalTrajectory, null)
  assert.deepEqual(normalized.visitHistory, [])
  assert.deepEqual(normalized.momentumHistory, [])
})
```

- [ ] **Step 3: Run targeted test and confirm it fails before parser implementation**

Run:

```powershell
pnpm --filter @classy/intelligenceboard exec tsx --test src/hooks/useTrajectoryAnalysis.test.ts
```

Expected before implementation:

```text
ERR_MODULE_NOT_FOUND or SyntaxError/TypeError for missing normalizeTrajectoryApiResponse export
```

- [ ] **Step 4: Wire the helper into `useTrajectoryAnalysis()`**

Replace the inline JSON handling with the helper and add `clinicalTrajectory` state:

```ts
const [clinicalTrajectory, setClinicalTrajectory] = useState<ClinicalTrajectoryV1 | null>(null)
```

On invalid patient or fetch failure, reset:

```ts
setClinicalTrajectory(null)
```

On success:

```ts
const normalized = normalizeTrajectoryApiResponse(json)
setData(normalized.data)
setVisitHistory(normalized.visitHistory)
setMomentumHistory(normalized.momentumHistory)
setClinicalTrajectory(normalized.clinicalTrajectory)
```

Return:

```ts
return { data, visitHistory, momentumHistory, clinicalTrajectory, isLoading, error }
```

- [ ] **Step 5: Run targeted test and confirm it passes**

Run:

```powershell
pnpm --filter @classy/intelligenceboard exec tsx --test src/hooks/useTrajectoryAnalysis.test.ts
```

Expected:

```text
# pass 2
# fail 0
```

### Task 2: Pass `clinicalTrajectory` into the existing panel

**Files:**

- Modify: `apps/healthcare/intelligenceboard/src/components/features/trajectory/TrajectoryIntelligencePanel.tsx`
- Test: `apps/healthcare/intelligenceboard/src/components/features/trajectory/ClinicalTrajectoryV1Panel.test.tsx`
- Test: `apps/healthcare/intelligenceboard/src/app/api/patients/[id]/trajectory/route.test.ts`

- [ ] **Step 1: Destructure the hook field**

```ts
const {
  data,
  visitHistory,
  momentumHistory,
  clinicalTrajectory: fetchedClinicalTrajectory,
  isLoading,
  error,
} = useTrajectoryAnalysis(patientIdentifier, visitCount)
```

- [ ] **Step 2: Preserve the existing prop override seam**

```ts
const renderedClinicalTrajectory = clinicalTrajectory ?? fetchedClinicalTrajectory
```

- [ ] **Step 3: Feed the existing CT v1 panel**

```tsx
{renderedClinicalTrajectory ? (
  <ClinicalTrajectoryV1Panel trajectory={renderedClinicalTrajectory} />
) : null}
```

- [ ] **Step 4: Run existing CT panel and route contract tests**

Run:

```powershell
pnpm --filter @classy/intelligenceboard exec tsx --test src/components/features/trajectory/ClinicalTrajectoryV1Panel.test.tsx src/app/api/patients/[id]/trajectory/route.test.ts
```

Expected:

```text
# fail 0
```

### Task 3: Run focused app verification

**Files:**

- No additional files expected.

- [ ] **Step 1: Run Intelligenceboard route/dashboard suite**

Run:

```powershell
pnpm --filter @classy/intelligenceboard run test -- --filter intelligence-route
```

Expected:

```text
All selected intelligence-route tests pass.
```

- [ ] **Step 2: Run app typecheck**

Run:

```powershell
pnpm --filter @classy/intelligenceboard lint
```

Expected:

```text
tsc --noEmit --incremental false exits 0
```

### Task 4: Run root verification

**Files:**

- No additional files expected.

- [ ] **Step 1: Run root verification**

Run:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Expected:

```text
All commands exit 0.
```

- [ ] **Step 2: Recheck diff**

Run:

```powershell
git status --short
git diff --stat
git diff --name-status
```

Expected changed files for first implementation mission:

```text
apps/healthcare/intelligenceboard/src/hooks/useTrajectoryAnalysis.ts
apps/healthcare/intelligenceboard/src/hooks/useTrajectoryAnalysis.test.ts
apps/healthcare/intelligenceboard/src/components/features/trajectory/TrajectoryIntelligencePanel.tsx
apps/healthcare/intelligenceboard/scripts/test-suite.ts
```

`scripts/test-suite.ts` is expected only if the new hook test is registered in the existing app suite.

## 11. Acceptance Criteria For Next Implementation Mission

- SSOT and this plan were read.
- The route behavior was not changed.
- The CT adapter was not changed.
- `clinicalTrajectory` is parsed as optional/null from the existing route response.
- Existing legacy `data`, `visit_history`, and `momentum_history` rendering remains intact.
- Existing `ClinicalTrajectoryV1Panel` is reused.
- Exactly one first UI target is implemented: the Clinical Trajectory Monitor hook-to-panel seam.
- No new UI component is created.
- No dependency is added.
- No package/config file is changed.
- No shared package contract is changed in the first implementation mission.
- No Simphony/SYMPHONY, Sentra Assist, OCR, RAG, database write, or external integration work is mixed in.
- Focused app verification passes.
- Root verification passes or any blocker is reported honestly.

## 12. Verification Commands For Next Mission

Run from monorepo root:

```powershell
git status --short
git diff --stat
pnpm --filter @classy/intelligenceboard exec tsx --test src/hooks/useTrajectoryAnalysis.test.ts
pnpm --filter @classy/intelligenceboard exec tsx --test src/components/features/trajectory/ClinicalTrajectoryV1Panel.test.tsx src/app/api/patients/[id]/trajectory/route.test.ts
pnpm --filter @classy/intelligenceboard run test -- --filter intelligence-route
pnpm --filter @classy/intelligenceboard lint
pnpm typecheck
pnpm lint
pnpm test
pnpm build
git status --short
git diff --stat
git diff --name-status
```

If root `pnpm build` is skipped, the implementation report must explain why. For this first UI consumption seam, build is reasonable and should normally run.

## 13. Rollback Rule

Rollback is file-scoped:

```powershell
git restore apps/healthcare/intelligenceboard/src/hooks/useTrajectoryAnalysis.ts
git restore apps/healthcare/intelligenceboard/src/components/features/trajectory/TrajectoryIntelligencePanel.tsx
git restore apps/healthcare/intelligenceboard/scripts/test-suite.ts
git restore apps/healthcare/intelligenceboard/src/hooks/useTrajectoryAnalysis.test.ts
```

Only restore `scripts/test-suite.ts` if it was modified. If the hook test file is untracked, remove it only after reporting it as the implementation-created test file.

Rollback is required if any of these occur:

- Route behavior changes.
- CT adapter changes.
- New UI surface is added.
- Dependency or package config changes.
- Shared package contract changes without explicit scope.
- Database write path, external API, OCR, RAG, Simphony/SYMPHONY, or Sentra Assist work is touched.
- Legacy trajectory panels stop rendering when `clinicalTrajectory` is absent.

## 14. Required Follow-Up After This First Target

After the hook-to-panel seam is verified, open a separate mission for cross-app contract alignment if Assist or another client must consume `clinicalTrajectory`.

That future mission should inspect and update `packages/shared/shared-types/src/platform-api.ts` separately. It must not be bundled into the first Dashboard UI consumption implementation.

