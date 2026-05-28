# Rule: Clinical Strict Mode

**Apply: Specific Files —
`packages/clinical-core/**`, `**/clinical/**`, `_\_clinical.py`, `_\_clinical.ts`\*\*

These rules layer on top of the universal rules and the healthcare guardrails.
They apply to any code that touches clinical reasoning.

## Test coverage gate

- Line coverage: **≥ 90%**.
- Branch coverage: **≥ 85%**.
- All public functions have a corresponding test file.
- Property-based tests (`hypothesis`) for any numeric clinical computation.

## Mandatory function shape

Every public clinical function follows this pattern:

```python
def cds_<verb>_<noun>(
    *,                                  # keyword-only arguments
    patient: PatientContext,            # validated input
    ctx: ClinicalContext,               # request_id, clinician_id, model_version
) -> ClinicalRecommendation | ClinicalRefusal:
    """One-line purpose.

    Source: <Kemenkes / WHO / Peer-reviewed citation>
    """
    # 1. Validate
    # 2. Compute
    # 3. Audit log
    # 4. Return structured result
```

- Keyword-only arguments prevent positional mistakes.
- Return type is always a union with `ClinicalRefusal` — refusal is a
  first-class outcome, not an exception.
- The docstring's `Source:` line is required and must reference a real
  guideline.

## Decision functions return data, not actions

A clinical function returns a recommendation object. It does **not** send a
notification, write to the patient record, or execute an order. Side effects are
the caller's responsibility, and they happen behind explicit clinician
confirmation.

## No machine learning without validation

If you propose a model-driven decision:

1. Cite the validation study (internal or external).
2. Report the validation metrics (sensitivity, specificity, calibration) in the
   docstring.
3. Specify the cohort the model was validated on. Indonesian cohort preferred.
   International cohorts must be flagged.
4. Include a fallback path when the model cannot produce a confident prediction.

If no validation exists, the function returns
`ClinicalRefusal(reason="model_not_validated")`.

## Forbidden patterns

- `if confidence > 0.5: return recommendation` — calibration thresholds must
  come from a documented validation, not a guess.
- Hardcoded drug dosages in code. Dosing tables live in `data/formulary/` as
  versioned JSON or CSV.
- Silent unit conversions. Always require typed quantities
  (`Quantity(150, "mg")` not `150`).
- Returning `None` from a clinical function. Return an explicit
  `ClinicalRefusal`.
- Reading patient data from anywhere other than the validated input model.

## Versioning

Every clinical module declares a `MODEL_VERSION` constant. It is bumped when:

- The decision logic changes.
- A reference table changes.
- A validation cohort changes.

The version flows into the audit log and the API response, so a clinician can
later identify which version produced a given recommendation.

```python
MODEL_VERSION = "cds-pediatric-paracetamol-2026.05.27"
```

## Review checklist (AI agent applies before declaring done)

- [ ] Citation present and verifiable.
- [ ] Refusal path tested.
- [ ] Audit log emitted in all return paths.
- [ ] No PHI in logs, prompts, or test fixtures.
- [ ] Synthetic data used in tests.
- [ ] Confidence reported and aligned with documented criteria.
- [ ] Disclaimer included in the output.
- [ ] Model version constant defined and current.
- [ ] Type checking (`mypy --strict`) passes.
- [ ] Coverage ≥ 90%.

If any item fails, the AI agent stops and reports the gap. It does not silently
produce code that violates this checklist.
