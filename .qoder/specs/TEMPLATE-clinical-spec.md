# Clinical Spec: <Feature Title>

**Status:** draft **Author:** <name> **Date:** <YYYY-MM-DD> **Clinical
reviewer:** <required: clinician name> **Engineering reviewer:** <required>
**Estimated effort:** small | medium | large

---

## 1. Clinical problem

<Who is the clinician user? What decision are they making? What does the current
workflow look like, and where does it fail or take too long?>

## 2. Clinical goals (testable)

- [ ] <Clinician-facing outcome 1>
- [ ] <Clinician-facing outcome 2>

## 3. Non-goals (explicit boundaries)

- This feature is **advisory**, not diagnostic.
- This feature does **not** auto-execute orders or modify the patient record.
- <Other explicit out-of-scope items>

## 4. Clinical evidence base

| Source                               | Type       | Used for          |
| ------------------------------------ | ---------- | ----------------- |
| <Kemenkes Formularium Nasional 2024> | guideline  | <which decision>  |
| <WHO ICD-11>                         | reference  | <which lookup>    |
| <Peer-reviewed paper, DOI: ...>      | validation | <which threshold> |

**Required:** at least one Indonesian source when one exists for the clinical
domain. International sources only as fallback or supporting evidence.

## 5. Safety constraints (MANDATORY)

- [ ] Returns `ClinicalRecommendation | ClinicalRefusal` — never plain values.
- [ ] Output includes: `confidence`, `citations`, `rationale`,
      `contraindications`, `disclaimer`, `model_version`.
- [ ] Refusal path implemented for: <list expected refusal conditions>.
- [ ] No PHI in prompts, logs, embeddings, or fixtures.
- [ ] Audit log emitted on every return path.
- [ ] Synthetic test data only.
- [ ] Pediatric / pregnancy / elderly edge cases explicitly handled or refused.
- [ ] BPJS formulary status surfaced when recommending a drug.
- [ ] SaMD classification considered: <advisory only / decision-support /
      diagnostic — usually advisory>.

## 6. Confidence calibration

| Confidence | Criteria                                         | Example trigger                                  |
| ---------- | ------------------------------------------------ | ------------------------------------------------ |
| `high`     | Direct guideline match, no interpretation needed | Drug listed in Formularium with exact indication |
| `moderate` | Guideline exists, requires interpretation        | Off-label use supported by a strong paper        |
| `low`      | Extrapolation from related domain                | No guideline for this exact subpopulation        |

A `low` confidence output must include "requires clinician validation" in the
disclaimer.

## 7. Proposed approach

<Plain-language description of the clinical logic.>

```python
def cds_<verb>_<noun>(
    *,
    patient: PatientContext,
    ctx: ClinicalContext,
) -> ClinicalRecommendation | ClinicalRefusal:
    """<One-line purpose>.

    Source: <citation>
    """
```

## 8. Data model

```python
class <NewModel>(BaseModel):
    field: type
    ...
```

## 9. Validation plan

- [ ] **Unit tests:** ≥ 90% line coverage, ≥ 85% branch coverage.
- [ ] **Property tests:** invariants for any numeric computation.
- [ ] **Refusal tests:** at least one test per refusal condition.
- [ ] **Citation tests:** assert that every recommendation includes ≥ 1
      citation.
- [ ] **Audit tests:** assert that audit log is emitted on every path.
- [ ] **Synthetic cohort review:** clinical reviewer walks through 10 synthetic
      cases and signs off on the outputs.

## 10. Rollout plan

| Phase      | Who            | Duration | Exit criteria                                     |
| ---------- | -------------- | -------- | ------------------------------------------------- |
| Internal   | dev team       | 1 week   | All synthetic cases pass clinical review          |
| Pilot      | 1 partner site | 2 weeks  | < 5% clinician override rate, no safety incidents |
| Production | all sites      | rolling  | Pilot metrics held for 30 days                    |

## 11. Rollback

- **Trigger conditions:** <safety incident, clinician override rate > X%, etc.>
- **Mechanism:** feature flag toggled off via `infra/feature-flags/`.
- **Recovery:** <how clinicians continue without this feature>.

## 12. Open clinical questions

- [ ] <Question requiring clinical decision-maker input>
- [ ] <Question 2>

## 13. Implementation steps (for Quest Mode)

1. Add data model in
   `packages/clinical-core/src/sentra_clinical/<domain>/models.py`.
2. Add reference table in `data/formulary/<domain>.json` with citation.
3. Implement function with refusal path in
   `packages/clinical-core/src/sentra_clinical/<domain>/<feature>.py`.
4. Implement audit logging.
5. Write unit tests (happy, edge, refusal).
6. Write property tests for numeric logic.
7. Generate synthetic test cases and run clinical reviewer agent.
8. Document in `packages/clinical-core/docs/<feature>.md`.

## 14. Sign-off

- [ ] Clinical reviewer: \_\_\_
- [ ] Engineering reviewer: \_\_\_
- [ ] Date: \_\_\_
