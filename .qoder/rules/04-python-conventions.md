# Rule: Python Conventions

**Apply: Specific Files — `*.py`, `pyproject.toml`, `requirements*.txt`**

## Python version

- Python 3.11 minimum. 3.12 preferred. No `from __future__ import annotations`
  needed.
- We use `uv` for dependency management. Not `pip` directly, not `poetry`, not
  `conda`.

## Project structure

Every Python package follows:

```
packages/<name>/
├── pyproject.toml
├── src/<name>/__init__.py
├── src/<name>/py.typed       # PEP 561 marker
└── tests/
```

`src/` layout is mandatory. No flat layout. This prevents accidentally importing
the test directory.

## Type hints

- Every public function has full type hints.
- `from typing import ...` for `Literal`, `TypedDict`, `Protocol`.
- Use `X | None` over `Optional[X]`.
- Use `list[X]` over `List[X]` (3.9+ syntax).
- For data crossing boundaries, use Pydantic v2 `BaseModel`, never plain dicts.

```python
from pydantic import BaseModel, Field

class PatientContext(BaseModel):
    age_years: int = Field(ge=0, le=120)
    weight_kg: float = Field(gt=0, le=300)
    sex: Literal["male", "female"]
    comorbidities: list[str] = Field(default_factory=list)
```

## Async vs sync

- I/O-bound (HTTP, DB, file): `async def`.
- CPU-bound (math, parsing): `def`. Push to a worker if heavy.
- Don't mix: an async function calling blocking I/O is a bug. Use
  `asyncio.to_thread` if you must bridge.

## Formatting and linting

- Format: `ruff format` (Black-compatible).
- Lint: `ruff check` with strict rules — see `pyproject.toml`.
- Types: `mypy --strict` in `packages/clinical-core/`, `services/`.

Suggested `pyproject.toml` snippet:

```toml
[tool.ruff]
target-version = "py311"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "N", "S", "ANN", "PT", "RET", "SIM"]
ignore = ["ANN101", "ANN102"]  # self, cls annotations

[tool.mypy]
strict = true
warn_redundant_casts = true
warn_unused_ignores = true
disallow_any_generics = true
```

## Logging

```python
import structlog
log = structlog.get_logger(__name__)

# Good
log.info("dosage_computed", drug=drug.code, confidence=result.confidence)

# Bad
log.info(f"Computed {result.confidence} dosage for {drug.code}")
```

## Exceptions

Define a hierarchy per package:

```python
# packages/clinical-core/src/sentra_clinical/errors.py
class SentraClinicalError(Exception):
    """Base for all clinical-core errors."""

class WeightOutOfRangeError(SentraClinicalError): ...
class DrugMissingPediatricDoseError(SentraClinicalError): ...
class ClinicalSourceMissingError(SentraClinicalError): ...
```

Never raise `Exception` directly in library code. Catch only specific types.

## Tests

- Framework: `pytest`.
- File naming: `test_<module>.py` or `<module>_test.py`. Pick one per package
  and stick to it.
- Test names describe the behavior, not the function:
  `test_pediatric_dose_returns_lower_when_both_per_kg_and_fixed_apply`.
- Use `pytest.fixture` for setup. Use `hypothesis` for property tests on
  clinical math.

## Forbidden

- `print` outside `scripts/` and tests.
- `eval`, `exec` — no exceptions.
- `pickle` for untrusted input.
- Bare `except:`.
- Module-level side effects (DB connections, file reads, HTTP calls at import
  time).
- `import *`.
