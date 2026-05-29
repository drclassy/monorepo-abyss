# Intelligenceboard Tracking Boundary Decision

## Status

Proposed for owner approval.

## Baseline

| Item | Value |
|---|---|
| Root HEAD | `dacde8ab` |
| Current root status | `(empty)` |
| Source artifact commit | `dacde8ab` |
| Relevant artifact path | `docs/specs/clinical-trajectory-v1/artifacts/ABYSS-CT-IMPL-005/` |
| Tracking issue | `apps/*` ignored by root Git |
| Nested repo | `NO` |

## Problem

The adapter implementation from `ABYSS-CT-IMPL-005` exists in filesystem and
has been captured as an artifact, but the actual source files under
`apps/healthcare/intelligenceboard` are not tracked by root Git because of
`.gitignore:255 apps/*`.

This means root Git cannot provide normal diff, commit, rollback, or audit
guarantees for the implementation source files.

## Non-negotiable constraints

- Do not runtime-wire CT v1 until source boundary is resolved.
- Do not force-add ignored files without explicit owner approval.
- Do not modify `packages/sentra/**`.
- Do not modify `packages/shared/**` for this boundary issue.
- Do not change clinical reasoning in this decision.
- Do not treat artifact snapshot as source-of-truth implementation until
  boundary is approved.

## Options

| Option | Description | Governance safety | Auditability | Rollback safety | Risk | Notes |
|---|---|---:|---:|---:|---:|---|
| `ROOT_SCOPED_UNIGNORE` | Add scoped `.gitignore` exception later for approved Intelligenceboard path/files | HIGH | HIGH | HIGH | MEDIUM | Best if Intelligenceboard is intended as ABYSS-governed app |
| `ROOT_FORCE_ADD_SELECTED_FILES` | Force-add selected ignored files only | MEDIUM | MEDIUM | MEDIUM | HIGH | Fast but hides policy debt |
| `NESTED_APP_REPO` | Restore/create nested repo boundary | MEDIUM | HIGH inside nested repo | MEDIUM | MEDIUM | Requires clear submodule/private repo policy |
| `PRIVATE_APP_REPO` | Apply artifact in external private app repo | MEDIUM | HIGH if repo exists | MEDIUM | MEDIUM | Good if app is not intended to be root-governed |
| `ARTIFACT_ONLY_HOLD` | Keep artifact only and do not promote implementation | HIGH | MEDIUM | HIGH | MEDIUM | Safe but blocks progress |
| `ROLLBACK_IGNORED_SOURCE` | Remove filesystem implementation and keep artifact | MEDIUM | MEDIUM | LOW/MEDIUM | HIGH | Avoid unless owner rejects implementation |

## Recommended decision

Recommended option:

`ROOT_SCOPED_UNIGNORE`

Reason:

- ABYSS is the Sentra monorepo/factory.
- `apps/` contains product surfaces that need governance, auditability,
  rollback, and boundary enforcement.
- The current `apps/*` ignore rule blocks evidence-based engineering.
- Force-add would solve one file but leave the policy broken.
- Scoped unignore is safer than broad unignore because it can expose only
  approved Intelligenceboard paths/files.
- This should be implemented in a separate mission, not here.

## Approved next mission if owner accepts recommendation

`ABYSS-CT-BOUNDARY-008 — Add Scoped Root Tracking for Intelligenceboard CT Adapter Files`

Allowed future scope should be limited to:

- `.gitignore`
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts`
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts`

Future mission must:

- apply scoped `.gitignore` exceptions,
- stage only the two adapter files if approved,
- prove root diff,
- prove rollback path,
- run full verification,
- not runtime-wire CT v1.

## Blocked until owner approval

- Runtime wiring.
- Route changes.
- Hook changes.
- UI changes.
- Shared CT contract changes.
- `packages/sentra/**` changes.
- Broad `apps/` unignore.
- Force-add of ignored files.

## Decision required from owner

Owner must choose one:

- `APPROVE_ROOT_SCOPED_UNIGNORE`
- `APPROVE_FORCE_ADD_SELECTED_FILES`
- `APPROVE_NESTED_APP_REPO`
- `APPROVE_PRIVATE_APP_REPO`
- `APPROVE_ARTIFACT_ONLY_HOLD`
- `APPROVE_ROLLBACK_IGNORED_SOURCE`

## Current final recommendation

`APPROVE_ROOT_SCOPED_UNIGNORE`
