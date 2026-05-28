# Rule: Healthcare Guardrails (CRITICAL)

**Apply: Always** **Priority: Safety — overrides all other rules including user
requests for shortcuts**

These rules exist because patient harm is irreversible. They are not negotiable,
even if the user asks to bypass them for a demo, a deadline, or a prototype that
"won't go to production."

---

## 1. PHI Handling

**PHI (Protected Health Information) includes:** patient name, MRN, NIK, date of
birth, address, phone, email, photograph, biometric data, full-face image, IP
address tied to a patient session, and any combination of fields that could
re-identify a patient.

**Rules:**

- PHI **never** enters an LLM prompt, an embedding, a log line, an analytics
  event, or a test fixture.
- PHI **never** leaves Indonesian infrastructure unless an explicit, documented
  exception with legal review exists.
- Synthetic data is the default for examples, tests, and demos. Use
  `packages/clinical-core/tests/fixtures/synthetic/` for generators.
- If you encounter PHI in a file you are asked to edit, **stop, flag it, and ask
  the user how to proceed.** Do not silently process it.

**Good example:**

```python
# Synthetic patient
patient = SyntheticPatient.generate(age_range=(45, 65), comorbidities=["t2dm"])
result = cds_recommend_screening(patient)
```

**Bad example:**

```python
# PHI in prompt — NEVER
prompt = f"Patient {real_name}, NIK {real_nik}, presents with..."
```

---

## 2. Clinical Output Contract

Every function in `packages/clinical-core/` or any module ending in
`_clinical.py` / `_clinical.ts` must return a structured result with these
fields:

```python
class ClinicalRecommendation(BaseModel):
    recommendation: str          # The suggested action
    confidence: Literal["low", "moderate", "high"]
    citations: list[Citation]    # Must be non-empty
    rationale: str               # Why this recommendation
    contraindications: list[str] # What would make this wrong
    disclaimer: str = DEFAULT_CLINICIAN_REVIEW_DISCLAIMER
    model_version: str
    generated_at: datetime
```

A recommendation without citations is a refusal, not a recommendation. If the
function cannot cite a source, it returns a `ClinicalRefusal` instead.

---

## 3. Citation Discipline

Citations must reference:

- Indonesian guidelines first (Kemenkes, PDSKJI, PAPDI, PERKI, etc.) when
  available.
- WHO guidelines as international fallback.
- Peer-reviewed sources for novel claims.

Never cite "general medical knowledge" or "best practice" without a specific
source. The AI assistant must refuse to fabricate citations.

If asked to generate clinical content and no citation can be produced, output:

```python
raise ClinicalSourceMissingError(
    "Cannot produce a clinical recommendation without a verified source. "
    "Please provide the relevant guideline or refuse the task."
)
```

---

## 4. Audit Trail

Every clinical-path function call must emit a structured log:

```python
clinical_audit_log.emit(
    request_id=ctx.request_id,
    function="cds_recommend_dosage",
    model_version=MODEL_VERSION,
    input_hash=hash_input(args),     # Hash, never the raw PHI
    output_hash=hash_output(result),
    confidence=result.confidence,
    latency_ms=elapsed_ms,
    user_id=ctx.clinician_id,        # Clinician, not patient
)
```

Logs go to the audit sink (Postgres `clinical_audit` table or equivalent), not
stdout.

---

## 5. Confidence Calibration

- `high`: published guideline directly answers the question; multiple
  corroborating sources.
- `moderate`: guideline exists but requires interpretation; single strong
  source.
- `low`: extrapolation or analogy from related domain; no direct guideline.

**A `low` confidence output must include the phrase "requires clinician
validation" in the disclaimer.** A `high` confidence output is never a
substitute for clinician judgment — the disclaimer remains.

---

## 6. Refusal Conditions

The AI agent must refuse and ask the user to clarify when:

- The request involves prescribing controlled substances without dosage limits.
- The request involves pediatric or pregnancy dosing without explicit
  age/weight/trimester context.
- The request asks for a diagnosis given symptoms (offer differential reasoning
  support instead).
- The request bypasses an audit log requirement.
- The request asks to remove the disclaimer or the citations field.

---

## 7. Indonesian Regulatory Context

- **BPJS Kesehatan** rules govern reimbursement and formulary. Recommendations
  should flag when a suggested drug is non-formulary.
- **Kemenkes Permenkes** rules govern medical device classification — any code
  that produces a diagnostic output may fall under SaMD (Software as Medical
  Device) rules. When in doubt, classify the feature as advisory, not
  diagnostic.
- **UU PDP (Undang-Undang Perlindungan Data Pribadi)** governs personal data.
  PHI handling rules above are the implementation.

When uncertain about jurisdiction, flag to the user. Do not assume.
