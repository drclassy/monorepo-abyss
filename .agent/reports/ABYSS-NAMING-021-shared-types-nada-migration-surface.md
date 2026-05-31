# ABYSS-NAMING-021 - Shared Types Sentra-nada Migration Surface

Date: 2026-05-31
Branch: `work/abyss-naming-021`
Base: `public/master`
Scope: audit-only for `packages/shared/shared-types/**`

## Objective

Audit shared-types references to legacy `symphony` naming and define a
compatibility-safe migration surface toward `Sentra-nada`.

No source code was modified in this mission. This report is the only intended
change.

## Evidence Commands

```powershell
git fetch public master
git switch -c work/abyss-naming-021 public/master
git status --short
rg -n -i "symphony|sympony|simphony" packages/shared/shared-types
rg -n "symphony|Symphony|SYMPHONY" . --glob "!node_modules/**" --glob "!.next/**" --glob "!dist/**" --glob "!coverage/**"
Get-Content packages/shared/shared-types/src/symphony.ts
Get-Content packages/shared/shared-types/src/clinical-trajectory.ts
Get-Content packages/shared/shared-types/src/index.ts
```

Additional focused consumer searches used `--no-ignore` so local ignored
surfaces such as `packages/sentra/**` and `apps/**` could be inspected without
editing them.

## Shared-types Match Summary

| File | Matches | Category | Notes |
| ---- | ------: | -------- | ----- |
| `packages/shared/shared-types/src/symphony.ts` | 116 | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate`, `breaking-rename-risk`, `historical-ok` | Active public contract file. Contains 57 exported declarations with `Symphony*` or `SYMPHONY_*` names. Rename would break `@sentra/nada` and downstream consumers. |
| `packages/shared/shared-types/src/index.ts` | 1 | `public-api-do-not-rename-yet`, `breaking-rename-risk`, `safe-additive-alias-candidate` | `export * from './symphony'` is the public package barrel path. Do not replace. Additive `./nada` export can be considered later. |
| `packages/shared/shared-types/src/clinical-trajectory.ts` | 2 | `public-api-do-not-rename-yet`, `needs-owner-decision`, `safe-additive-alias-candidate` | `linkedReasoning.authority: 'SYMPHONY'` and `symphonyResultId?: string` are public CT envelope fields. Widening or aliasing needs owner decision. |
| `packages/shared/shared-types/README.md` | 0 for `symphony` | `safe-display-text-update` | README documents package role but omits the current Symphony and ClinicalTrajectory exports. Documentation refresh is safe but should follow alias decision. |
| `packages/shared/shared-types/src/clinical-trajectory.test.ts` | 0 for `symphony` | `historical-ok` | No legacy naming surface in tests except indirect fixture imports. |

No `sympony` matches were found under `packages/shared/shared-types/**`.
No `simphony` matches were found under `packages/shared/shared-types/**`.

## Current Exported API

`packages/shared/shared-types/src/symphony.ts` exports these active public
contract declarations:

### Runtime constant

| Export | Category | Recommended action |
| ------ | -------- | ------------------ |
| `SYMPHONY_CONTRACT_VERSION` | `public-api-do-not-rename-yet`, `breaking-rename-risk`, `safe-additive-alias-candidate` | Preserve. Future mission may add `SENTRA_NADA_CONTRACT_VERSION = SYMPHONY_CONTRACT_VERSION` as an additive alias. |

### Core result and metadata contracts

| Export group | Members | Category | Recommended action |
| ------------ | ------- | -------- | ------------------ |
| Version/status/decision primitives | `SymphonyContractVersion`, `SymphonyEngineStatus`, `SymphonyDecisionCategory`, `SymphonyConfidenceBand` | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve. Add `SentraNada*` type aliases only. |
| Patient/vitals primitives | `SymphonySexAtBirth`, `SymphonyPregnancyStatus`, `SymphonyConsciousnessLevel`, `SymphonyPatientContext`, `SymphonyVitalsInput` | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve. Add aliases only after verifying no duplicate semantic drift. |
| Diagnosis/result contracts | `SymphonyDiagnosisSuggestion`, `SymphonyMetadata`, `SymphonyResult`, `SymphonyClinicalDisposition`, `SymphonyClinicalFact`, `SymphonyReasoningEvidence`, `SymphonyDiagnosticHypothesis`, `SymphonyShadowComparison` | `public-api-do-not-rename-yet`, `breaking-rename-risk`, `safe-additive-alias-candidate` | Preserve existing names. `SymphonyResult` is the highest-risk public contract and should not be renamed in-place. |

### Alert, safety gate, and traffic-light contracts

| Export group | Members | Category | Recommended action |
| ------------ | ------- | -------- | ------------------ |
| Alert primitives | `SymphonyAlertSeverity`, `SymphonyAlertSource`, `SymphonyAlert`, `SymphonySafetyGate` | `public-api-do-not-rename-yet`, `breaking-rename-risk`, `safe-additive-alias-candidate` | Preserve. Add aliases only. Gate literals such as `GATE_9_PE` are runtime contract values and must not be renamed. |
| Action protocols | `SymphonyActionProtocolId`, `SymphonyActionProtocolSectionKey`, `SymphonyReferralUrgency`, `SymphonyActionProtocolSection`, `SymphonyActionProtocolReferral`, `SymphonyActionProtocol` | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve. Add aliases if needed by public consumer code. |
| Traffic light | `SymphonyTrafficLightLevel`, `SymphonyTrafficLightGateResult`, `SymphonyTrafficLightOutput` | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve. Add aliases only if Sentra-nada naming is needed at consumer surface. |
| Trajectory/quality summary | `SymphonyTrajectoryDirection`, `SymphonyTrajectoryMomentum`, `SymphonyTrajectorySummary`, `SymphonyQualitySummary` | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve. Beware name collision with independent `ClinicalTrajectory*` contracts. |

### Pattern engine and clinical snapshot contracts

| Export group | Members | Category | Recommended action |
| ------------ | ------- | -------- | ------------------ |
| Symptom signal contracts | `SymphonySymptomSignal`, `SymphonySymptomSignalInput`, `SymphonySymptomSignalResult`, `SymphonySymptomContext` | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve. Add aliases only; these are imported by `@sentra/nada` engine files. |
| Snapshot contracts | `SymphonyAvpuLevel`, `SymphonyHtnSeverity`, `SymphonyGlucoseCategory`, `SymphonyPhysiologyBand`, `SymphonyParsedVitals`, `SymphonyHistoricalBP`, `SymphonyDerivedValues`, `SymphonyClinicalHistory`, `SymphonySnapshotPatient`, `SymphonyClinicalSnapshot` | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve. `SymphonyClinicalSnapshot` is widely used in pattern-engine tests and runtime. |
| Pattern contracts | `SymphonyCriterionOp`, `SymphonyCriterion`, `SymphonyPatternTier`, `SymphonyPatternSeverity`, `SymphonyScoreResult`, `SymphonyClinicalPattern`, `SymphonyEvaluablePattern`, `SymphonyPatternMatch` | `public-api-do-not-rename-yet`, `breaking-rename-risk`, `safe-additive-alias-candidate` | Preserve. Add aliases only; pattern definitions import these directly from `@the-abyss/shared-types`. |

## File-level Classification

| File | Match | Category | Recommended action |
| ---- | ----- | -------- | ------------------ |
| `src/symphony.ts` | File path `symphony.ts` | `breaking-rename-risk` | Do not rename file. If needed, add `src/nada.ts` as additive alias layer while keeping `src/symphony.ts`. |
| `src/symphony.ts` | `SYMPHONY_CONTRACT_VERSION` | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve constant. Add `SENTRA_NADA_CONTRACT_VERSION` alias in a future additive mission. |
| `src/symphony.ts` | All exported `Symphony*` types/interfaces | `public-api-do-not-rename-yet`, `safe-additive-alias-candidate` | Preserve. Add `SentraNada* = Symphony*` aliases only, no removals. |
| `src/symphony.ts` | Comment: `Promoted from symphony-internal types` | `historical-ok`, `safe-display-text-update` | Safe to clarify in docs/comments later, but not necessary for compatibility. |
| `src/symphony.ts` | Comment path `symphony/src/engine/symptom-signals.ts` | `historical-ok`, `safe-display-text-update` | Historical reference; safe to update after owner confirms naming policy for historical provenance. |
| `src/index.ts` | `export * from './symphony'` | `public-api-do-not-rename-yet`, `breaking-rename-risk` | Keep. Future alias mission can append `export * from './nada'`. |
| `src/clinical-trajectory.ts` | `authority: 'SYMPHONY'` | `public-api-do-not-rename-yet`, `needs-owner-decision`, `safe-additive-alias-candidate` | Do not replace. Future owner-approved additive option: widen to `'SYMPHONY' | 'SENTRA_NADA'`. |
| `src/clinical-trajectory.ts` | `symphonyResultId?: string` | `public-api-do-not-rename-yet`, `needs-owner-decision`, `safe-additive-alias-candidate` | Do not rename. Future additive option: add `sentraNadaResultId?: string` while preserving old field. |

## Consumer References

Focused consumer searches found no tracked public code importing
`@the-abyss/shared-types` and `Symphony*` directly outside the ignored/private
Sentra and app surfaces. However, `--no-ignore` search confirms active local
consumers:

| Consumer | Reference | Risk |
| -------- | --------- | ---- |
| `packages/sentra/sentra-nada/src/contracts/index.ts` | Re-exports `SYMPHONY_CONTRACT_VERSION` and the shared `Symphony*` contract family from `@the-abyss/shared-types`. | High. This is the canonical bridge from shared-types into `@sentra/nada`; renaming shared exports breaks package API. |
| `packages/sentra/sentra-nada/src/index.ts` | Re-exports the same shared `Symphony*` contracts from its public root. | High. Downstream code imports `SymphonyResult`, `SymphonyAlert`, and related names from `@sentra/nada`. |
| `packages/sentra/sentra-nada/src/types/pattern-types.ts` | Compatibility re-export from `@the-abyss/shared-types` for promoted Phase 2 types. | High. This file exists specifically to preserve older internal import paths. |
| `packages/sentra/sentra-nada/src/engine/symptom-signals.ts` | Imports shared `SymphonySymptomSignal*` types. | Medium-high. Runtime engine typing depends on old names. Alias additions are safe; renames are not. |
| `packages/sentra/sentra-nada/src/engine/pattern-engine.ts` | Imports shared `SymphonyClinicalSnapshot`, `SymphonyPatternMatch`, and related types. | High. Pattern evaluator contracts are active runtime type boundaries. |
| `packages/sentra/sentra-nada/src/engine/clinical-patterns.ts` | Imports shared `SymphonyAlert`, `SymphonyClinicalPattern`, `SymphonyClinicalSnapshot`, `SymphonyPatternMatch`. | High. Clinical pattern output contract would break on rename. |
| `packages/sentra/sentra-nada/src/engine/clinical-patterns-definitions.ts` | Direct import of `SymphonyClinicalPattern` and `SymphonyCriterion` from `@the-abyss/shared-types`. | High. Direct consumer of shared public names. |
| `platform/orchestrator/src/sagas/symphony-bridge.ts` | Uses `SymphonyResult`, `SymphonyVitalsInput`, and `mapSymphonyResultToCdssResult` through `@sentra/nada` contract surface. | High. Orchestrator is out-of-scope for this mission but proves public names are live. |
| `platform/orchestrator/src/sagas/diagnosis-flow.saga.ts` | Imports `type SymphonyResult` from `@sentra/nada`; payload field remains `symphony`. | High. Rename would change saga contract and tests. |
| `apps/healthcare/intelligenceboard/src/lib/cdss/symphony-safety-gates.ts` | Imports `SymphonyAlert`, `SymphonyVitalsInput`, and detector types from `@sentra/nada`. | Medium-high. App adapter is out-of-scope but would break if old names disappeared. |
| `apps/healthcare/intelligenceboard/**` | Imports `ClinicalTrajectory*` from `@the-abyss/shared-types`; docs mention Symphony as reasoning authority. | Medium. Mostly CT contract use; `ClinicalTrajectoryEnvelope.linkedReasoning` field changes need care. |
| `apps/healthcare/sentra-assist/**` | Imports `ClinicalTrajectoryV1` and platform API types from `@the-abyss/shared-types`. | Low-medium for Symphony rename; high for CT envelope field changes if consumed later. |
| `docs/**`, `.agent/**` | Historical specs, plans, audits, and migration records with `SYMPHONY`/`Symphony` naming. | Historical-ok. Do not mass update as part of shared-types compatibility work. |

## Safe Migration Candidates

1. Add a compatibility alias module while preserving the old module:

   ```text
   packages/shared/shared-types/src/nada.ts
   ```

   This file can re-export additive aliases such as:

   ```ts
   export { SYMPHONY_CONTRACT_VERSION as SENTRA_NADA_CONTRACT_VERSION } from './symphony'
   export type SentraNadaResult = SymphonyResult
   export type SentraNadaAlert = SymphonyAlert
   export type SentraNadaVitalsInput = SymphonyVitalsInput
   export type SentraNadaSafetyGate = SymphonySafetyGate
   export type SentraNadaClinicalSnapshot = SymphonyClinicalSnapshot
   export type SentraNadaClinicalPattern = SymphonyClinicalPattern
   export type SentraNadaPatternMatch<P extends SymphonyEvaluablePattern = SymphonyClinicalPattern> =
     SymphonyPatternMatch<P>
   ```

   The exact alias set should be generated from current consumer usage, not by
   renaming every export in one pass.

2. Append `export * from './nada'` to `src/index.ts` after `src/nada.ts` exists.
   Keep `export * from './symphony'` unchanged.

3. Optionally add aliases inside `clinical-trajectory.ts` only after owner
   decision:

   - `linkedReasoning.authority: 'SYMPHONY' | 'SENTRA_NADA'`
   - `sentraNadaResultId?: string` next to `symphonyResultId?: string`

   This is additive, but it changes public CT semantics and should not be mixed
   into the first alias mission.

4. Documentation-only cleanup can update README export tables after aliases
   exist. Keep historical specs and `.agent` reports unchanged unless a separate
   archival cleanup mission is approved.

## Unsafe Breaking Changes

| Change | Risk |
| ------ | ---- |
| Rename `packages/shared/shared-types/src/symphony.ts` to `nada.ts` | Breaks `src/index.ts` barrel, historical docs, and any direct path assumptions. |
| Rename `SYMPHONY_CONTRACT_VERSION` in-place | Breaks `@sentra/nada` contract re-export and tests that assert contract version semantics. |
| Rename `SymphonyResult` in-place | Breaks `@sentra/nada`, orchestrator, interop, parity, CDS Hooks, FHIR mapping, and Dashboard adapter code. |
| Rename all `Symphony*` exported types in-place | Breaks active engine contracts and internal compatibility files such as `pattern-types.ts`. |
| Rename `ClinicalTrajectoryEnvelope.linkedReasoning.symphonyResultId` in-place | Breaks serialized payload compatibility and any consumer that persists or reads the old field. |
| Replace `authority: 'SYMPHONY'` with only `'SENTRA_NADA'` | Breaks existing CT envelope literals and any consumer expecting the old authority enum. |
| Rename orchestrator payload fields such as `symphony` | Out-of-scope and breaking for saga output contract. |
| Mass update docs/specs | High noise and low compatibility value; historical references should remain stable unless separately scoped. |

## Recommended Next Implementation Mission

Exactly one next mission:

```text
ABYSS-NAMING-022 - Add Shared Types Sentra-nada Compatibility Aliases
```

Mission scope:

- Create `packages/shared/shared-types/src/nada.ts`.
- Add a narrow additive alias layer for the highest-use public contracts:
  `SENTRA_NADA_CONTRACT_VERSION`, `SentraNadaContractVersion`,
  `SentraNadaResult`, `SentraNadaAlert`, `SentraNadaVitalsInput`,
  `SentraNadaSafetyGate`, `SentraNadaClinicalSnapshot`,
  `SentraNadaClinicalPattern`, `SentraNadaPatternMatch`, and any directly
  required supporting aliases.
- Append `export * from './nada'` in `packages/shared/shared-types/src/index.ts`.
- Do not remove or rename `symphony.ts`, `SYMPHONY_CONTRACT_VERSION`, or any
  `Symphony*` export.
- Do not migrate consumers in the same mission.
- Verify with `pnpm --filter @the-abyss/shared-types typecheck` and
  `pnpm --filter @the-abyss/shared-types lint`.

## Rollback Considerations

- If the alias module is wrong before commit, remove only `src/nada.ts` and the
  additive `export * from './nada'` line.
- Existing `symphony.ts` should remain untouched, so rollback should not affect
  current consumers.
- Do not use force reset. Use path-scoped restore for the alias file and index
  line if needed.
- If CT linked reasoning aliases are later added, rollback must preserve
  serialized compatibility by removing only additive fields and never changing
  the old `symphonyResultId` field in-place.

## Acceptance Recheck

| Criterion | Status |
| --------- | ------ |
| Branch starts from `public/master` | PASS |
| Worktree clean before audit | PASS |
| Shared-types matches classified | PASS |
| Consumer references searched | PASS |
| No source code modified | PASS |
| No `packages/sentra/**` modified | PASS |
| One audit report created | PASS |
| Exactly one next implementation mission recommended | PASS |
| No push | PASS |
