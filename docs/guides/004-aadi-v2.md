---
id: aadi-v2-guide
type: guide
status: active
owner: sentra-engineering
tags: [aadi, symphony, clinical]
---

# Current Symphony vs AADI V2

| Area | Current Symphony | AADI V2 After Completion | Estimated Improvement |
|---|---|---|---|
| **Safety & triage** | Already strong: NEWS2, vital alerts, screening gates, PE suspect, anaphylaxis, DDI, traffic-light | Preserved but modularized and augmented with golden regression tests | **+15–25%** |
| **Native diagnosis reasoning** | Still depends on external `diagnosisCandidates` | Can generate differential diagnosis independently from clinical facts | **+70–100%** |
| **Confidence logic** | Often `insufficient_data` | Confidence becomes low / moderate / high based on data quality | **+50–80%** |
| **Status engine** | Still explicitly `degraded` due to partial migration | Status becomes `ok`, `requires_review`, `insufficient_data`, or `degraded` meaningfully | **+60–90%** |
| **Explainability** | Has alerts, but diagnosis reasoning is incomplete | Has rationale per diagnosis, missing data, must-not-miss, and next steps | **+60–80%** |
| **Medication safety** | DDI present if medication count >1 | DDI + allergy + pregnancy caution + structured medication issue | **+30–50%** |
| **Indonesia localization** | Not native | Dengue, TB suspect, preeclampsia, sepsis, NCD, maternal-fetal packs | **+60–90%** |
| **FHIR / interoperability** | Not yet a core output | Ready for mapping to FHIR, SATUSEHAT, EMR, ReferraLink | **+50–80%** |
| **Auditability** | Has governance direction, but no full clinical inference audit | Every inference has version, ruleset, timestamp, override, shadow comparison | **+50–75%** |
| **Production validation** | No full shadow mode yet | V1 vs V2 can be compared before production | **+70–90%** |

Current Symphony is already strong as a **safety-first deterministic assessment and escalation engine**, but is not yet a **native diagnosis-from-scratch engine** because diagnosis is still hybrid over external candidates, metadata is still `degraded`, and global confidence is still `insufficient_data`.

---

## Maturity score by phase

Using an internal scale of **0–100**, not an official clinical claim.

| Phase | Maturity Score | Meaning |
|---|---|---|
| **Current Symphony** | **45–55 / 100** | Safety is strong; diagnosis is not yet native |
| **AADI V2 Phase 1 complete** | **70–75 / 100** | Native diagnostic core beginning to operate |
| **AADI V2 Phase 2 complete** | **80–88 / 100** | FHIR, evidence layer, shadow mode, evaluation harness |
| **AADI V2 Phase 3 complete** | **88–92 / 100** | Pilot-ready, offline mode, localization, observability |

Improvement from current to final Phase 3:

Current: approximately 50/100
Final: approximately 90/100

Absolute improvement: +40 points
Relative improvement: approximately +80%

For clinical performance, the 80% figure should not be used. It reflects **system maturity**, not diagnostic accuracy.

---

## More realistic estimate of clinical improvement

### Diagnostic support quality

| Condition | Estimate |
|---|---|
| Current Symphony | Baseline is unstable because diagnosis depends on external candidates |
| AADI V2 Phase 1 | **+15–25%** |
| AADI V2 Phase 2 | **+20–35%** |
| AADI V2 Phase 3 | **+25–40%**, with good pilot feedback |

Most realistic target for external claims:

> **AADI V2 targets a 20–35% improvement in clinical decision support quality over the current engine, validated through shadow mode and expert review.**

Earlier Sentra documents cited approximately 30% improvement in diagnostic accuracy through risk scoring, and approximately 35% reduction in diagnostic errors through early warnings — but these figures must be re-validated specifically for AADI V2.

---

## Areas with the largest gains

### Native diagnosis reasoning

This is the largest improvement.

Current:

```
Clinical input
→ deterministic alerting
→ diagnosisCandidates from external source
→ ranking / traffic-light
```

AADI V2:

```
Clinical input
→ ClinicalFacts
→ syndrome classification
→ diagnosis pack matching
→ differential diagnosis
→ must-not-miss
→ clinical arbiter
```

Improvement: **approximately +70–100%** in diagnosis reasoning autonomy.

This does not mean diagnosis is 100% correct — it means the engine no longer passively waits for candidates from an external source.

---

### Explainability

Current output provides alerts and a traffic-light, but does not fully answer:

- why this diagnosis appeared
- what evidence supports it
- what evidence weakens it
- what data is missing
- what diagnoses must not be missed

AADI V2 answers all of these.

Improvement: **approximately +60–80%**.

---

### Clinical safety governance

Current already has strong safety slices. AADI V2 does not replace the safety layer — it makes it:

- modular
- testable
- auditable
- protected by golden safety tests
- compatible with shadow mode

Improvement: **approximately +15–25%**, because the foundation is already strong.

---

## Areas with smaller gains

### Safety alerting

Current Symphony is already strong here.

Current already has:

- NEWS2
- vital alerts
- PE suspect
- anaphylaxis
- trajectory
- DDI
- traffic-light safety gate

AADI V2 does not build safety from zero. What improves is **reliability, modularity, and testability**, not the baseline safety detection capability. Current flow already positions the traffic-light as a final safety gate above alerts and diagnosis suggestions.

Estimated safety layer improvement: **+15–25%**, not +80%.

---

## Safe summary percentages

| Category | Estimated Improvement |
|---|---|
| **Overall system maturity** | **+50–80%** |
| **Clinical diagnostic support quality** | **+20–35%** |
| **Native diagnosis reasoning capability** | **+70–100%** |
| **Explainability** | **+60–80%** |
| **FHIR/interoperability readiness** | **+50–80%** |
| **Safety detection** | **+15–25%** |
| **Medication safety** | **+30–50%** |
| **Indonesia-market fit** | **+60–90%** |
| **Auditability/governance** | **+50–75%** |

---

## Recommended final figures

For internal engineering:

> **AADI V2 = approximately +80% system maturity improvement over current Symphony.**

For safe clinical/product claims:

> **AADI V2 targets a 20–35% improvement in clinical decision support quality over the current engine, validated through golden cases, shadow mode, and expert review.**

For external pitch:

> **AADI V2 elevates the engine from a safety-triage assistant to a full diagnostic reasoning copilot that remains human-in-the-loop, explainable, FHIR-ready, and Indonesia-first.**

---

## Conclusion

**Current Symphony is already 50% mature as a safety engine.**
**AADI V2 will bring the system to approximately 85–90% maturity as a diagnostic copilot.**

The most honest answer:

> **Total technical improvement: approximately 50–80%.**
> **Realistic improvement in clinical diagnostic support: approximately 20–35%.**
> **The largest gains are not in safety, but in native diagnosis reasoning, explainability, interoperability, and auditability.**
