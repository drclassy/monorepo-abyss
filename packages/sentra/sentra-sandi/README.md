# @the-abyss/fhir-engine

> **Status:** Modernization in progress (R5-target). Bounded
> validation/normalization candidate for AADI V2 Phase 2.

This package is a **bounded structural validator and normalization seam** for
HL7 FHIR resources. It is **not** a clinical reasoning engine, **not** a
terminology server, and **not** the home of AADI V2 interop mapping.

Reasoning authority — diagnosis, traffic-light, disposition, alerts, action
protocols — lives in [`@the-abyss/symphony`](../symphony/README.md). The mapping
helpers `mapSymphonyResultToFhirBundle()` and
`mapSymphonyResultToCdsHooksResponse()` stay there.

---

## What This Package Owns Today

- structural validation of a small, explicit set of FHIR resources
- a thin normalization seam (currently passthrough; honest stub, not fake
  transform)
- bounded AADI V2 FHIR bundle assembly from already-projected resource inputs
- a public surface clearly scoped to its actual capabilities

## What This Package Does Not Own

- clinical reasoning, scoring, or diagnosis reconstruction
- terminology expansion (no internal CodeSystem/ValueSet expansion service)
- mapping from `SymphonyResult` to FHIR bundles
- direct mapping from `SymphonyResult` to FHIR bundles
- multi-version FHIR conversion machinery
- profile registry or full constraint resolution

## Resource Support Matrix

| Resource           | Status                 |
| ------------------ | ---------------------- |
| `Patient`          | Supported (structural) |
| `Observation`      | Supported (structural) |
| `Condition`        | Supported (structural) |
| `RiskAssessment`   | Supported (structural) |
| `DiagnosticReport` | Supported (structural) |

Unsupported resources fail validation with an explicit
`Unsupported resource type: <X>` error. They do not silently pass.

## Version Posture

The package is moving toward **HL7 FHIR R5** as the modernization target.
Current Zod schemas reflect a bounded R4-shape transition slice; they are not a
settled R4 utility and they do not yet cover R5-specific elements. See the
modernization spec for the full version-strategy rationale.

## Install

```bash
pnpm add @the-abyss/fhir-engine
```

## Usage

```typescript
import { FhirValidator, validatePatient } from '@the-abyss/fhir-engine'

const result = validatePatient(rawPatient)
if (!result.valid) {
  console.error(result.errors)
}
```

The `FhirTransformer` class exists as a **modernization placeholder** only. Its
methods are deliberately not used in production paths until the honesty pass
replaces their TODO bodies with explicit semantics. Do not treat its
`toInternal()` / `toFhir()` / `normalize()` as real conversions.

For AADI V2, this package may assemble a FHIR `Bundle` only after another
package has already projected reasoning-owned data into supported FHIR-facing
resource inputs. It does not read `SymphonyResult` directly.

## Exports

| Export                     | Type     | Description                                                                             |
| -------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `FhirValidator`            | class    | Bounded structural validator for the supported resource matrix                          |
| `validatePatient`          | function | Validate a FHIR `Patient` resource (structural only)                                    |
| `validateObservation`      | function | Validate a FHIR `Observation` resource (structural only)                                |
| `validateCondition`        | function | Validate a FHIR `Condition` resource (structural only, bounded R5 slice)                |
| `validateRiskAssessment`   | function | Validate a FHIR `RiskAssessment` resource (structural only, no traffic-light)           |
| `validateDiagnosticReport` | function | Validate a FHIR `DiagnosticReport` resource (structural only, no report interpretation) |
| `FhirTransformer`          | class    | Modernization placeholder — methods are bounded passthrough, not transforms             |
| `FhirResource`             | type     | Union of supported resource shapes plus a generic structural escape hatch               |
| `FhirPatient`              | type     | Inferred from `FhirPatientSchema` (R4-shape transition slice)                           |
| `FhirObservation`          | type     | Inferred from `FhirObservationSchema` (R4-shape transition slice)                       |
| `FhirCondition`            | type     | Inferred from `FhirConditionSchema` (R5-bounded structural slice)                       |
| `FhirRiskAssessment`       | type     | Inferred from `FhirRiskAssessmentSchema` (R5-bounded structural slice)                  |
| `FhirDiagnosticReport`     | type     | Inferred from `FhirDiagnosticReportSchema` (R5-bounded structural slice)                |
| `ValidationResult`         | type     | Validation result shape with `errors` and `warnings`                                    |
| `mapValidatedAadiV2Bundle` | function | Assemble a deterministic FHIR Bundle from pre-projected supported resources             |

## Modernization Roadmap

Tracked in:

- `docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md`
- `docs/guides/implementation-plans/007-2026-04-29-fhir-engine-modernization-implementation.md`

Until that roadmap closes, treat this package as transitional. Promotion of
validation responsibilities from `@the-abyss/symphony/src/interop/` will not
happen inside this package without an explicit follow-up plan.
