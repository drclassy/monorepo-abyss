# Rule: Testing and Quality

**Apply: Model Decision — when generating tests, refactoring, or proposing
quality changes**

## Test pyramid

```
        ▲
  E2E   │  5%    Playwright, full user journeys
        │
  Integ │  20%   Real DB, real HTTP, mocked external APIs
        │
  Unit  │  75%   Pure logic, no I/O
        ▼
```

If a test requires Docker to run, it is integration. Unit tests run in
milliseconds.

## What deserves a test

Always test:

- Clinical computation (dosage, scoring, thresholds).
- Anything in `packages/clinical-core/`.
- Agent tools (each tool gets unit tests; each agent gets a scripted integration
  test).
- API endpoints (contract tests).
- Data parsers (OCR, document ingestion).
- Authorization logic.

Skip tests for:

- Pure presentational components with no logic.
- Trivial getters/setters.
- Generated code.

## Test naming

Test names describe behavior in business terms:

```python
# Good
def test_pediatric_dose_clamps_to_adult_max_when_weight_exceeds_threshold(): ...
def test_returns_refusal_when_drug_lacks_pediatric_dosing_data(): ...

# Bad
def test_pediatric_dose_1(): ...
def test_dose_works(): ...
```

## Fixtures

- Use `pytest.fixture` for reusable setup.
- Synthetic data only. Never copy production records.
- Factories with sensible defaults: `make_patient(age=50)` overrides defaults.

```python
@pytest.fixture
def patient_factory():
    def _make(**overrides) -> PatientContext:
        return PatientContext(
            age_years=overrides.get("age_years", 50),
            weight_kg=overrides.get("weight_kg", 70.0),
            sex=overrides.get("sex", "male"),
            comorbidities=overrides.get("comorbidities", []),
        )
    return _make
```

## Property-based testing

For clinical math, use `hypothesis`:

```python
from hypothesis import given, strategies as st

@given(weight_kg=st.floats(min_value=3.0, max_value=80.0))
def test_pediatric_dose_never_exceeds_adult_max(weight_kg, paracetamol):
    dose = cds_pediatric_dose(weight_kg=weight_kg, drug=paracetamol)
    assert dose.mg <= paracetamol.adult_max_mg
```

## Mocking

- Mock at the boundary: HTTP clients, DB connections, LLM calls.
- Never mock the function you are testing.
- Prefer fakes (in-memory implementations) over mocks where possible — they
  catch interface drift.

## Coverage targets

| Path                      | Line | Branch |
| ------------------------- | ---- | ------ |
| `packages/clinical-core/` | 90%  | 85%    |
| `packages/agents/`        | 85%  | 80%    |
| `services/`               | 80%  | 75%    |
| `apps/`                   | 70%  | —      |
| `prototypes/`             | —    | —      |

Coverage gates run in CI. Drops are blocked.

## Performance tests

- Latency budgets are declared per endpoint in `docs/perf-budgets.md`.
- Tests assert P95 latency on a representative dataset.
- Regression > 20% blocks merge until justified.

## CI gates (must pass before merge)

1. Lint (`ruff check`, `eslint`).
2. Format check (`ruff format --check`, `prettier --check`).
3. Type check (`mypy`, `tsc --noEmit`).
4. Unit tests.
5. Integration tests (run in Docker on CI).
6. Coverage thresholds.
7. Secret scan (`gitleaks`).
8. Dependency audit (`pnpm audit`, `pip-audit`).
9. License check (no GPL in dependencies).

A failing gate blocks merge. No exceptions.

## When the AI agent writes tests

- Propose the test **before** the implementation when refactoring or building
  new clinical logic.
- Generate one happy-path test, one edge-case test, one refusal-path test as a
  baseline.
- For property tests, name the invariant being verified in a comment.
- Do not write tests that mirror the implementation — they catch nothing.
