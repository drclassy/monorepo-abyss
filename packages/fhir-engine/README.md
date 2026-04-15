# @the-abyss/fhir-engine

FHIR R4 validation and transformation layer for the Abyss healthcare stack. Used
by `sentra-dashboard` and `sentra-assist` to validate and normalize clinical
data before storage or CDSS processing.

## Install

```bash
pnpm add @the-abyss/fhir-engine
```

## Usage

```typescript
import { validatePatient, FhirTransformer } from '@the-abyss/fhir-engine'

const result = validatePatient(rawPatient)
if (!result.valid) {
  console.error(result.errors)
}

const internal = FhirTransformer.toInternal(rawFhirPatient)
```

## Exports

| Export                | Type     | Description                                             |
| --------------------- | -------- | ------------------------------------------------------- |
| `FhirValidator`       | class    | FHIR R4 resource validator                              |
| `validatePatient`     | function | Validate a FHIR Patient resource                        |
| `validateObservation` | function | Validate a FHIR Observation resource                    |
| `FhirTransformer`     | class    | Transform FHIR resources to/from internal domain models |
| `FhirResource`        | type     | Base FHIR resource contract                             |
| `FhirPatient`         | type     | FHIR R4 Patient type                                    |
| `FhirObservation`     | type     | FHIR R4 Observation type                                |
| `ValidationResult`    | type     | Validation result shape with errors array               |
