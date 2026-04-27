# Orchestrator ↔ SYMPHONY Bridge — Request/Response Boundary

**Sprint 4 / B.10 — `feat(orchestrator): wire DiagnosisFlowSaga to real assessSymphonyInput()`**

Date: 2026-04-27
Contract version: SYMPHONY v0.8.0

---

## Purpose

Replace the mock/TODO CDSS reasoning step in `DiagnosisFlowSaga` with a real
synchronous call to `@the-abyss/symphony`'s `assessSymphonyInput()`. SYMPHONY
remains the only reasoning authority; the orchestrator is a thin caller and
transport layer.

## Architecture

```
Kafka producer → DiagnosisFlowSaga
                    ├── DIAGNOSIS_REQUESTED  (kafka.emit)
                    ├── CDSS_QUERY           (mapDiagnosisInputToSymphonyInput
                    │                         → assessSymphonyInput()
                    │                         → mapSymphonyResultToCdssResult)
                    ├── AI_PROCESSING        (TODO: LangFlow client wiring — Phase B)
                    └── RESPONSE_EMIT        (DiagnosisOutput with SymphonyResult passthrough)
                                              → kafka.emit
```

The saga steps remain orchestration-only:

- No reasoning logic.
- No clinical decisioning.
- No mutation of SYMPHONY output.
- No fabrication of diagnosis values.
- The bridge module (`symphony-bridge.ts`) is pure mapping; it does not
  classify, score, or evaluate clinical signals.

## Request boundary

### `DiagnosisInput` (saga input)

```ts
interface DiagnosisInput {
  patientId: string         // mapped to SymphonyPatientContext.patientRef
  symptoms: string[]        // joined into chiefComplaint
  vitalSigns?: Record<string, number>  // see Vital Mapping below
  organizationId: string    // NOT mapped into Symphony (kept on orchestrator side)
  requestId: string         // mapped to SymphonyMetadata.requestId; also derives encounterId
}
```

### Mapping rules — `DiagnosisInput` → `SymphonyAssessmentInput`

| DiagnosisInput field | SymphonyAssessmentInput field | Mapping rule |
|---|---|---|
| `requestId` | `metadata.requestId` | direct copy |
| `requestId` | `patientContext.encounterId` | derived as `enc-${requestId}` (deterministic synthetic) |
| (none) | `metadata.requestedAt` | `now()` (injectable for tests via second arg) |
| (none) | `metadata.caller` | hardcoded `'system'` |
| `patientId` | `patientContext.patientRef` | direct copy |
| `vitalSigns` | `vitals[0]` | snapshot built from recognized vital keys; see below |
| `symptoms` | `chiefComplaint` | `symptoms.join('; ')` when non-empty; omitted otherwise |
| `organizationId` | (excluded) | NOT mapped — kept on orchestrator side for routing/audit |

### Vital mapping

`vitalSigns: Record<string, number>` is filtered against the closed set:

```ts
const ALLOWED_VITAL_KEYS = [
  'systolicBp',
  'diastolicBp',
  'heartRate',
  'respiratoryRate',
  'temperatureC',
  'spo2',
  'glucoseMgDl',
  'capillaryRefillSec',
] as const
```

- Keys outside that set are dropped.
- Non-finite numbers (NaN, Infinity) are dropped.
- If no recognized vital is present, `vitals` array is emitted as `[]`
  (Symphony tolerates empty vitals; clinical disposition becomes
  `'insufficient_data'`).
- Consciousness level and oxygen supplement flag are NOT mapped from this
  surface (they require typed input; current `DiagnosisInput` carries only
  `Record<string, number>`). A future revision of `DiagnosisInput` may widen
  the vitals shape; the bridge will extend mapping accordingly.

### Excluded fields (PHI-safe perimeter)

The following SymphonyAssessmentInput fields are NOT populated from
DiagnosisInput in this scope:

- `additionalComplaint`
- `medicalHistory`
- `allergies`
- `activeMedications`
- `chronicDiseases`
- `hasCOPD`
- `patientContext.ageYears` / `sexAtBirth` / `pregnancyStatus`
- `diagnosisCandidates`

When the saga input shape grows to carry these, the bridge will extend
mapping. Until then, SYMPHONY operates on a minimal input surface and
surfaces `clinicalDisposition='insufficient_data'` whenever native packs
cannot anchor.

## Response boundary

### `DiagnosisCdssResult` (CDSS_QUERY step output)

```ts
interface DiagnosisCdssResult {
  primaryDiagnosis: string[]   // from nativeHypotheses[0].diagnosisName
  differentials: string[]      // from nativeHypotheses[1..N] excluding 'deferred'
  recommendations: string[]    // from metadata.rationale (explainability lines)
  confidence: number           // from nativeHypotheses[0].confidence (0 if none)
  symphony: SymphonyResult     // FULL passthrough — unchanged
}
```

### `DiagnosisOutput` (saga final output)

```ts
interface DiagnosisOutput {
  requestId: string
  diagnosis: string[]               // from AI_PROCESSING step (post-LangFlow)
  confidence: number                // from AI_PROCESSING step
  cdssRecommendations: string[]     // from AI_PROCESSING step
  aiProcessingId: string            // from AI_PROCESSING step
  completedAt: string               // ISO8601
  symphony: SymphonyResult          // FULL passthrough from CDSS_QUERY → RESPONSE_EMIT
}
```

### Passthrough invariants

- `output.symphony.metadata.contractVersion === '0.8.0'`
- `output.symphony.metadata.status` is runtime-derived (`'ready'` /
  `'degraded'`) per AADI V2 status lift Tahap B.
- `output.symphony.clinicalDisposition` carries the canonical
  insufficient-data / requires-review / ok / degraded signal.
- `output.symphony.alerts`, `trafficLight`, `trajectory`, `shadowComparison`,
  `nativeHypotheses`, `clinicalFacts`, `diagnosisSuggestions` are emitted
  unchanged.

### PHI-safe boundary verification

- `organizationId` does NOT appear anywhere in `DiagnosisOutput.symphony`.
  Verified by `does not leak organizationId into SymphonyResult passthrough`
  saga test and `does not leak organizationId into Symphony input` bridge
  test.
- `chiefComplaint` is mapped into Symphony input but never echoed back
  through the structured FHIR/CDS-Hooks adapters; downstream consumers
  reading `output.symphony` directly do see `chiefComplaint` if Symphony
  emits it in narrative fields. The saga does NOT add additional PHI
  surfaces beyond what Symphony itself emits.

## Determinism

Determinism guarantees apply **only to the CDSS_QUERY bridge/handoff scope**,
not to the full saga:

- `mapDiagnosisInputToSymphonyInput` is a pure function; same input plus
  injected `now` returns identical Symphony input.
- `mapSymphonyResultToCdssResult` is a pure function; same Symphony result
  returns identical CDSS result.
- `assessSymphonyInput` is deterministic (per AADI V2 contract).
- Therefore the CDSS_QUERY step's SYMPHONY passthrough fields
  (`symphony.metadata.contractVersion`, `symphony.clinicalDisposition`,
  `symphony.alerts`, etc.) are reproducible bit-for-bit given a fixed
  request timestamp.

### Non-deterministic surfaces (transport-only, by design)

The following saga-level fields are intentionally non-deterministic and
are not covered by the determinism guarantee:

- `kafka.emit('diagnosis-events', { timestamp })` — wall-clock at emit time
- `aiProcessingId = ai-${requestId}-${Date.now()}` — wall-clock-derived ID
- `output.completedAt` — wall-clock at saga completion
- `RESPONSE_EMIT.timestamp` — wall-clock at emit time

These are transport metadata; making them deterministic requires injecting
a clock/id factory through `BaseSaga`, which is out of scope for B.10. If
end-to-end saga determinism is needed for a future test surface, the
accepted path is to widen `BaseSaga` with a clock/id-factory dependency
and thread it through every step.

The saga test `symphony passthrough is deterministic for identical input
(CDSS_QUERY scope)` pins the narrow guarantee above; it does NOT assert
saga-level transport timestamp equality.

## Failure semantics

`assessSymphonyInput` traps internal AADI V2 pipeline exceptions inside its
own try/catch (Task 7 patch) and surfaces failure via:

- `metadata.status === 'degraded'`
- `metadata.degradedReason === 'aadiv2_pipeline_failure:<error.name>'` (PHI-safe)
- `quality.safetyFlags === ['aadiv2_pipeline_failure:<error.name>']`
- `quality.auditHints` containing `aadiv2_failure_reason:<error.name>`

The saga does NOT add its own retry around `assessSymphonyInput` — Symphony
is deterministic, so retry won't change outcome. If Symphony itself throws
(uncaught), the saga's `BaseSaga.execute()` triggers compensation
(`emitDlq('CDSS_QUERY', requestId, error)`) and the error propagates.

### DLQ payload — PHI-safe envelope

`emitDlq` publishes a strictly minimal envelope to `diagnosis-dlq`:

```ts
{
  step: 'CDSS_QUERY' | 'AI_PROCESSING' | 'RESPONSE_EMIT' | 'DIAGNOSIS_REQUESTED'
  requestId: string                  // synthetic correlation ID, no PHI
  errorType: string                  // error.constructor.name
  errorName: string                  // error.name
  timestamp: string                  // ISO8601 wall-clock
}
```

Explicitly NOT published:

- raw `DiagnosisInput` (no `patientId`, no `symptoms`, no `vitalSigns`,
  no `organizationId`)
- `error.message` (may contain payload-derived text)
- `SymphonyResult` or any clinical payload
- Any free-text narrative fields

Verified by saga test `emitDlq publishes a PHI-safe envelope (no raw input,
no error.message, no clinical payload)`, which forces a kafka emit failure
with a payload-derived error message and asserts the DLQ envelope contains
none of the originating PHI/PII strings.

## Downstream contract friction

Encountered during wiring:

1. **`platform/orchestrator/tsconfig.json` had a stale `extends` path**
   (`../../../packages/config-typescript/tsconfig.json` resolving outside
   the monorepo root). Fixed in this commit to `../../packages/...`. The
   broken path predates this work and was blocking all orchestrator
   typecheck/test runs.
2. **Saga input shape is narrower than Symphony input** — `DiagnosisInput`
   does not carry age, sex, medical history, allergies, active medications,
   chronic diseases, or rich vitals. SYMPHONY tolerates this and emits
   `'insufficient_data'` disposition; Phase B follow-up should widen
   `DiagnosisInput` (see "Excluded fields" above).
3. **Saga `vitalSigns: Record<string, number>` cannot carry consciousness
   level or oxygen supplement flag** — both are typed in
   `SymphonyVitalsInput` but don't fit a numeric record. Bridge drops them
   silently. Future widening of `DiagnosisInput.vitalSigns` to a typed
   shape will unlock these.
4. **AI_PROCESSING step still mocked** — wires through CDSS_QUERY output
   but its LangFlow client integration is Phase B. Out of scope for this
   sprint.
5. **`platform/orchestrator/src/sagas/saga.repository.ts` has Prisma type
   errors** because `prisma generate` had not been run in this session.
   Resolved by running `pnpm --filter @the-abyss/database run db:generate`.
   Not caused by this work but surfaces in pre-existing repository code.

None of the above block the SYMPHONY handoff itself. They are noted for
follow-up planning.

## Verification

| Suite | Pass |
|---|---|
| `symphony-bridge.spec.ts` | 8/8 (all bridge mapping + PHI-safe + determinism cases) |
| `diagnosis-flow.saga.spec.ts` | 6/6 (end-to-end handoff, kafka event order, PHI-safe, insufficient-data path, AADI V2 passthrough, determinism) |
| Existing orchestrator tests | 28/28 (no regression) |
| Total | **42/42 across 8 files** |

SYMPHONY package tests remain at 319/319 (no regression).

## Out of scope (per Chief constraints)

- ❌ Dashboard polyrepo work
- ❌ Parity threshold ramp
- ❌ FHIR-engine package promotion
- ❌ `clinical-facts.ts → toAvpu()` retirement
- ❌ Reasoning logic in orchestrator
- ❌ Modifying `SymphonyResult` contract or AADI V2 outputs
