# Rule: Coding Standards

**Apply: Always**

## File size and shape

- Hard ceiling: 400 lines per file. If you exceed it, propose a split.
- One public class or one cohesive set of functions per file. Helpers stay in
  the same file unless reused elsewhere.
- File names: `kebab-case.ts` for TypeScript, `snake_case.py` for Python.

## Functions

- One job per function. If a function has "and" in its name, it has two jobs.
- ≤ 50 lines as a guideline. Long functions need a comment explaining why
  splitting would harm clarity.
- Argument count ≤ 5. Beyond that, accept a typed object / dataclass.
- Pure functions are preferred. Side effects are isolated to dedicated modules
  (I/O, network, DB).

## Naming

- Names describe what something does, not how it's implemented.
  `compute_pediatric_dose` not `helper_for_v2`.
- Boolean flags read like questions: `is_valid`, `has_contraindication`,
  `should_retry`.
- Avoid abbreviations except for well-known ones: `id`, `url`, `http`, `db`,
  `ctx`, `req`, `res`.
- Clinical functions carry a domain prefix: `cds_`, `epi_`, `rag_`, `ocr_`.

## Types and contracts

- Python: every public function has full type hints. `mypy --strict` passes in
  `packages/clinical-core/` and `services/`.
- TypeScript: `strict: true`, `noUncheckedIndexedAccess: true`,
  `noImplicitAny: true`.
- Data crossing a boundary (API, file, agent tool) uses Pydantic (Python) or Zod
  (TS) for validation.
- `any` / `Any` is forbidden in clinical code. In other code, requires a
  `# justified: <reason>` comment.

## Error handling

- Raise specific exception types, never bare `Exception`.
- Catch only what you can recover from. Re-raise the rest.
- Error messages include enough context to debug: input shape, the operation,
  the version.
- Never swallow exceptions in `packages/clinical-core/`, `services/`, or any
  `*_clinical.py`.

```python
# Good
try:
    result = compute_dosage(patient_weight_kg=weight)
except WeightOutOfRangeError as e:
    logger.warning("dosage_skipped_invalid_weight", weight=weight, error=str(e))
    return ClinicalRefusal(reason="weight_out_of_supported_range")

# Bad — silent failure
try:
    result = compute_dosage(weight)
except:
    pass
```

## Logging

- Python: `structlog` with JSON output. No `print` outside `scripts/`.
- TypeScript: `pino` or project logger. No `console.log` outside dev-only paths.
- Log levels:
  - `error`: action required, often paging.
  - `warning`: degraded state, no immediate action needed.
  - `info`: business event (request received, decision made).
  - `debug`: developer detail.
- Never log PHI. Never log secrets. Hash before logging when you need a
  fingerprint.

## Comments and docstrings

- Comments explain **why**, not **what**. The code shows what.
- Every public function has a docstring covering: purpose, args, returns,
  raises, and an example for non-obvious ones.
- TODO comments include an owner and a date:
  `# TODO(initials, 2026-06-01): handle the edge case for X`.

```python
def compute_pediatric_dose(weight_kg: float, drug: Drug) -> Dose:
    """Compute weight-based pediatric dose for a single drug.

    Uses the per-kg dosing from Kemenkes Formularium Nasional 2024.
    For drugs with both per-kg and fixed pediatric doses, the lower of the
    two is returned to err on the side of safety.

    Args:
        weight_kg: Patient weight in kilograms, must be > 0.
        drug: A Drug instance with `pediatric_dose_per_kg_mg` set.

    Returns:
        A Dose with the computed amount, route, and frequency.

    Raises:
        WeightOutOfRangeError: weight is non-positive or above pediatric range.
        DrugMissingPediatricDoseError: drug lacks pediatric dosing data.
    """
```

## Imports

- Group: stdlib, third-party, first-party, relative. Blank line between groups.
- Absolute imports for first-party packages:
  `from sentra.clinical_core import ...`.
- No wildcard imports: never `from x import *`.

## Dead code

- Remove commented-out code. Git remembers.
- Remove unused imports, variables, functions before committing.

## Dependencies

- Adding a dependency requires naming the alternative considered and the reason
  for choosing this one.
- Prefer the standard library when reasonable.
- Pin major versions in production packages. Allow patch updates.
