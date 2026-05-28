# Spec: <Feature Title>

**Status:** draft **Author:** <name> **Date:** <YYYY-MM-DD> **Reviewers:**
<names> **Estimated effort:** small (≤ 2h) | medium (½–1 day) | large (≥ 1 day)

---

## 1. Problem

<One paragraph. Who has this problem, when, and what is the current workaround.>

## 2. Goals (testable)

- [ ] <Specific outcome 1>
- [ ] <Specific outcome 2>

## 3. Non-goals

- <What this spec explicitly does NOT cover>

## 4. Constraints

- **Safety:** <PHI handling, clinical disclaimer if applicable>
- **Performance:** <latency budget, throughput target>
- **Compatibility:** <existing APIs that must not break>
- **Regulatory:** <if applicable — BPJS, Kemenkes, UU PDP>

## 5. Proposed approach

<Plain-language description. Code snippets only where they clarify the contract.>

## 6. File changes

| File                                   | Change | Rationale |
| -------------------------------------- | ------ | --------- |
| `packages/<pkg>/src/.../foo.py`        | new    | <why>     |
| `packages/<pkg>/tests/.../test_foo.py` | new    | <why>     |
| `apps/<app>/...`                       | modify | <why>     |

## 7. Public API changes

<None | Signatures>

```python
def cds_<verb>_<noun>(
    *,
    patient: PatientContext,
    ctx: ClinicalContext,
) -> ClinicalRecommendation | ClinicalRefusal:
    ...
```

## 8. Data model changes

<None | Schema diffs, migration plan>

## 9. Test plan

- **Unit:** <coverage target, key behaviors>
- **Integration:** <flows to verify>
- **Manual verification:** <steps a human walks through>

## 10. Risks and rollback

| Risk     | Likelihood | Impact | Mitigation |
| -------- | ---------- | ------ | ---------- |
| <Risk 1> | low        | high   | <plan>     |

**Rollback:** <how to revert if this ships and breaks>

## 11. Open questions

- [ ] <Question that needs human input>
- [ ] <Question 2>

## 12. Implementation steps (for Quest Mode)

1. <Atomic step with a verifiable outcome>
2. <Atomic step>
3. <Atomic step>

> Each step should produce a file, a passing test, or a visible log entry. If
> you have more than 20 steps, split this spec into multiple specs.
