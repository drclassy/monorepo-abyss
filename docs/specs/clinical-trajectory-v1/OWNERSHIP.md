# Clinical Trajectory Ownership Decision

Last updated: 2026-05-29
Status: approved decision record
Scope: CT ownership only

## Decision summary

This document records the current ownership decision for Clinical Trajectory
(CT) in ABYSS.

CT v1 is a consumer-safe longitudinal contract and rendering layer. It is not a
new reasoning engine and it must not supersede SYMPHONY.

The long-term authority for trajectory reasoning is:

- `packages/sentra/sentra-nada/src/engine/trajectory.ts`

The authority for the consumer-safe CT v1 contract is:

- `packages/shared/shared-types/src/clinical-trajectory.ts`

The following app-local engines are transitional surfaces, not long-term
reasoning authorities:

- `apps/healthcare/intelligenceboard/src/lib/clinical/**`
- `apps/healthcare/sentra-assist/lib/iskandar-diagnosis-engine/**`

The sanctioned bridge from Intelligenceboard local trajectory output into the
shared CT v1 contract is:

- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts`

The following component is placeholder/demo only and must not be treated as
clinical authority:

- `apps/healthcare/sentra-main/components/ClinicalTrajectory.tsx`

## Authority matrix

| Path | Current role | Recommended ownership | Keep / Adapter / Deprecate / Do not touch | Dependency risk | Boundary risk | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/specs/004-ct-spec-v1.md` | Spec authority for CT framing | Product/spec authority for CT v1 semantics | Keep | None proven | Low | Explicitly states CT v1 is a consumer-safe contract layer and SYMPHONY remains reasoning authority |
| `docs/specs/003-clinical-trajectory-v1.md` | Companion CT specification | Companion authority aligned with the canonical spec | Keep | None proven | Low | Repeats CT as contract/rendering layer and not a replacement engine |
| `docs/specs/clinical-trajectory-v1/**` | Workstream docs | Reference and source appendix for CT workstream | Keep | None proven | Medium | Existing numbered docs describe taxonomy, inputs, and summary modeling assumptions |
| `packages/shared/shared-types/src/clinical-trajectory.ts` | Contract | Consumer-safe CT v1 contract authority | Do not touch | None proven | Low | File exports CT types, envelope, review note, and fixtures without runtime imports |
| `packages/sentra/sentra-nada/src/engine/trajectory.ts` | Canonical engine | Long-term trajectory reasoning authority | Do not touch | No OCR/RAG/DB/external evidence proven in this file | High | Exports `analyzeSymphonyTrajectory`, baseline, treatment-response, and mapping helpers |
| `packages/sentra/sentra-nada/src/engine/clinical-facts.ts` | Canonical engine consumer | Crown-jewel clinical facts consumer of canonical trajectory | Do not touch | No external integration proven in gathered imports | High | Imports `analyzeSymphonyTrajectory` and trajectory mapping helpers into the reasoning pipeline |
| `packages/sentra/sentra-nada/src/engine/assess.ts` | Canonical orchestrator consumer | Crown-jewel orchestration over canonical trajectory | Do not touch | Imports `@the-abyss/clinical-references`; no DB/OCR/RAG proven in gathered scope | High | Builds `SymphonyResult` and injects trajectory summary from canonical engine |
| `apps/healthcare/intelligenceboard/src/lib/clinical/**` | App-local engine | Transitional Intelligenceboard-local trajectory stack | Keep | Includes app service/runtime surfaces; route stack later consumes DB-backed history | Medium | Local analyzer, momentum, prediction, convergence, and alert services remain active in app scope |
| `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts` | Adapter candidate | Sanctioned bridge from local engine to shared CT v1 contract | Adapter | None proven | Medium | `legacyIBToCtV1()` and `legacyIBToCtV1Envelope()` map app-local analysis into `ClinicalTrajectoryV1` |
| `apps/healthcare/intelligenceboard/src/types/abyss/trajectory.ts` | App-local contract | Local route/UI contract only | Keep | None proven | Medium | File comments and exports position it as app-specific contract, not shared global authority |
| `apps/healthcare/intelligenceboard/src/components/features/trajectory/**` | Consumer | Intelligenceboard CT consumer surfaces | Keep | No OCR/RAG/DB proven in CT display components read for this decision | Low-Medium | Components render trajectory data; CT v1 panel consumes shared contract |
| `apps/healthcare/intelligenceboard/src/app/api/patients/[id]/trajectory/route.ts` | Consumer/service facade | App-local API facade, not authority | Keep | Database-read dependency proven through vital history service | Medium | Route exposes trajectory analysis over patient history and should remain app-scoped |
| `apps/healthcare/sentra-assist/lib/iskandar-diagnosis-engine/**` | App-local engine | Transitional Sentra Assist-local trajectory stack | Keep | Browser persistence exists in visit-history store; no server DB authority proven here | Medium-High | Local analyzer remains active and is not the canonical reasoning source |
| `apps/healthcare/sentra-assist/components/clinical/ClinicalTrajectoryV1Card.tsx` | Consumer | Compact CT v1 consumer | Keep | None proven beyond shared contract consumption | Low | Thin card over `ClinicalTrajectoryV1` contract |
| `apps/healthcare/sentra-assist/components/clinical/ClinicalTrajectory.tsx` | Consumer + fallback bridge | Transitional adapter/fallback consumer | Adapter | Bridge client, local analyzer, and extension messaging are all in play | High | Component mixes canonical bridge path and app-local fallback path |
| `apps/healthcare/sentra-main/components/ClinicalTrajectory.tsx` | Placeholder/demo | Demo-only surface, not clinical authority | Deprecate | None proven | Medium | Uses hardcoded demo data and no shared CT contract or canonical engine import |

## What must not be changed without approval

Do not change the following without explicit approval:

- `packages/sentra/sentra-nada/src/engine/trajectory.ts`
- `packages/sentra/sentra-nada/src/engine/clinical-facts.ts`
- `packages/sentra/sentra-nada/src/engine/assess.ts`
- `packages/shared/shared-types/src/clinical-trajectory.ts`
- the ownership boundary stated in this document

Do not reinterpret CT v1 as:

- a replacement for SYMPHONY
- a new diagnosis authority
- a new backend trajectory engine
- a reason to remove transitional app-local engines without a separate owner decision

## Transitional surfaces

The following surfaces remain valid but transitional:

- `apps/healthcare/intelligenceboard/src/lib/clinical/**`
- `apps/healthcare/sentra-assist/lib/iskandar-diagnosis-engine/**`
- `apps/healthcare/sentra-assist/components/clinical/ClinicalTrajectory.tsx`

These surfaces may continue to exist for app-local behavior, legacy continuity,
and consumer adaptation, but they must not be described as the long-term
reasoning authority.

## Adapter candidates

The current sanctioned adapter candidates are:

- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts`
- `apps/healthcare/sentra-assist/components/clinical/ClinicalTrajectory.tsx`

Interpretation:

- Intelligenceboard adapter is the approved bridge from local engine output to
  shared CT v1 contract output.
- Sentra Assist trajectory component is a transitional mixed consumer and may be
  treated as an adapter/fallback surface, not as canonical authority.

## Known risks

- Ownership is clear at the contract and canonical-engine layers, but runtime
  reasoning is not yet fully converged because two app-local engines remain
  active.
- Intelligenceboard route-level trajectory access depends on app-local history
  retrieval and therefore has an app boundary with database-read risk.
- Sentra Assist still mixes canonical bridge behavior and local fallback
  behavior in one consumer surface.
- CT coverage must not be overstated. Existing app-local coverage registries and
  tests prove useful surfaces, but they do not prove total repository-wide
  convergence.
- Sentra Main naming may mislead readers if the placeholder component is read as
  a clinical authority rather than demo/showcase content.

## Non-goals

This decision document does not:

- implement or refactor CT runtime behavior
- delete any local engine
- migrate any app to canonical trajectory logic
- change diagnosis logic
- change OCR, RAG, database, UI, or external integration behavior
- change package build config
- claim full CT feature coverage without separate evidence

## Next allowed work

The next allowed work after this document is ownership-safe and should stay
read-only or explicitly scoped:

1. Review whether each app-local engine is:
   - retained transitional local engine
   - adapter-only surface
   - deprecation candidate
2. Audit whether Intelligenceboard and Sentra Assist consumers can reduce mixed
   authority language without changing runtime behavior.
3. Create narrow follow-up decision records before any runtime convergence work.

No implementation should proceed on CT convergence until the ownership boundary
above remains accepted.
