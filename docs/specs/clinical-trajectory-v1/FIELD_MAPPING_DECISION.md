# CT v1 Field Mapping Decision

## Status

Accepted for implementation planning.

## Baseline

- Repo HEAD: `a9675c43`
- Source audit: `ABYSS-CT-AUDIT-003`
- Audit final status: `PASS`
- Audit final decision: `NEEDS_FIELD_MAPPING_DECISION`
- Minimum safe next implementation scope: `ADD_MISSING_FIELD_MAPPING_FIRST`

## Ownership boundary

| Surface | Authority / role | Decision |
|---|---|---|
| `@sentra/nada` | Long-term CT reasoning authority | Do not replace |
| `@the-abyss/shared-types` | CT v1 consumer-safe contract authority | Do not modify in this mission |
| `Intelligenceboard ct-adapter.ts` | Transitional bridge | May receive field mapping implementation later |
| `Intelligenceboard local CT engine` | Transitional/fallback runtime source | Do not refactor in this mission |

## Field mapping decisions

| Local field | Current adapter handling | Decision | CT v1 target / handling | Reason | Risk if ignored |
|---|---|---|---|---|---|
| `VisitRecord[].keluhan_utama` | Not mapped | `MAP_REQUIRED` | `symptomsTimeline[]` | Chief complaint / symptom timeline source | High silent lossiness |
| `TrajectoryAnalysis.recommendations[]` | Not mapped | `MAP_REQUIRED` | `response.nextBestClinicalQuestion` / `response.nextBestClinicalCheck` | Local next-action surface | High silent lossiness |
| `TrajectoryAnalysis.vitalTrends[]` | No explicit target | `OWNER_DECISION_REQUIRED` | Not decided | Human-readable per-vital trend breakdown | High semantic lossiness |
| `TrajectoryAnalysis.acute_attack_risk_24h` | No explicit target | `OWNER_DECISION_REQUIRED` | Not decided | 24h risk horizon not equivalent to direction | High semantic lossiness |
| `TrajectoryAnalysis.time_to_critical_estimate` | No explicit target | `OWNER_DECISION_REQUIRED` | Not decided | Urgency / time-to-critical estimate | High semantic lossiness |
| `TrajectoryAnalysis.visitCount` | Partial quality mapping | `KEEP_AS_QUALITY_CONTEXT` | `quality.sparseSamplingFlag` + `quality.notes`, optionally explicit note | Sampling depth affects confidence | Medium context loss |
| `TrajectoryAnalysis.confirmed_chronic_diagnoses[]` | ICD code only | `MAP_REQUIRED_WITH_SAFE_MINIMUM` | `baseline.chronicDiseases[]`, preserve at least ICD code; name/type require evidence | Chronic baseline context | High downgrade if details silently lost |
| `TrajectoryAnalysis.overallRisk` | Not mapped | `OWNER_DECISION_REQUIRED` | Not decided | Local risk summary may not equal `severityBand` | Medium semantic lossiness |
| `TrajectoryAnalysis.clinical_safe_output.drivers[]` | Not mapped | `OWNER_DECISION_REQUIRED` | Not decided | Local explanation drivers | Medium explainability loss |

## Implementation permission

The next implementation mission may only do additive mapping inside:

- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts`
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts`

The next implementation mission must not:

- wire runtime route/hook,
- change shared CT v1 contract,
- change local reasoning logic,
- change UI,
- change database behavior,
- touch `packages/sentra/**`,
- touch diagnosis/OCR/RAG/external integrations.

## Fields approved for immediate additive mapping

| Field | Approved action |
|---|---|
| `VisitRecord[].keluhan_utama` | Add `symptomsTimeline[]` mapping if contract supports existing shape |
| `TrajectoryAnalysis.recommendations[]` | Add `nextBestClinicalQuestion` / `nextBestClinicalCheck` mapping if deterministic and non-clinical-new |
| `TrajectoryAnalysis.visitCount` | Preserve current `sparseSamplingFlag` behavior; add explicit quality note only if already supported |
| `TrajectoryAnalysis.confirmed_chronic_diagnoses[]` | Preserve current ICD mapping; do not invent missing name/type |

## Fields not approved for immediate mapping

| Field | Reason |
|---|---|
| `TrajectoryAnalysis.vitalTrends[]` | No explicit CT v1 target proven |
| `TrajectoryAnalysis.acute_attack_risk_24h` | No explicit CT v1 target proven |
| `TrajectoryAnalysis.time_to_critical_estimate` | No explicit CT v1 target proven |
| `TrajectoryAnalysis.overallRisk` | No explicit CT v1 target proven |
| `TrajectoryAnalysis.clinical_safe_output.drivers[]` | No explicit CT v1 target proven |

## Next allowed mission

Recommended next mission after this decision record:

`ABYSS-CT-IMPL-005 — Add Missing CT Adapter Field Mapping`

Scope should be limited to:

- `ct-adapter.ts`
- `ct-adapter.test.ts`

No runtime wiring.
No route changes.
No hook changes.
No UI changes.
