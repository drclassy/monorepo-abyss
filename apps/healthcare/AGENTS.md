# Healthcare Domain Steering

**Domain:** Clinical Systems and Patient Data **Compliance Level:** STRICT
(HIPAA/GDPR) **Revision:** 2026.04.06

Every task response must begin with:

```
━━━━━━━━━━━━━━━━━━━━━━
PHASE : [phase name]
GATE  : [OPEN ✓ / BLOCKED ✗]
FILE  : [filename / —]
━━━━━━━━━━━━━━━━━━━━━━
```

---

## Precedence (aturan Cursor vs domain)

**Urutan mengikat** bila ada tumpang-tindih antara **Project Rules** Cursor
(`.cursor/index.mdc`, `.cursor/rules/*.mdc`) dan dokumen ini / paket:

1. **Keselamatan pasien & PHI / HIPAA** — tidak boleh dilonggarkan.
2. **`AGENTS.md` per-paket** di bawah `apps/healthcare/*` — stack, kontrak,
   checklist (mis. `ProtocolMap` di Sentra Assist).
3. **File ini (`apps/healthcare/AGENTS.md`)** — header fase, **JET GO**,
   larangan batch multi-file tanpa izin, format REPORT/Sentratorium.
4. **`.cursor/index.mdc`** — identitas Sentra, precedence, prinsip inti; detail
   workflow ada di `.cursor/rules/` (mis. `020-sentra-standard-workflows.mdc`).

**GO:** Sebelum perubahan kode/konfigurasi bermakna, tunggu **GO** eksplisit
Chief jika dokumen yang berlaku mewajibkannya — **terapkan aturan yang paling
ketat** pada konteks tugas.

---

## RULES PER PHASE

### [1] RESEARCH

- Read spec.md first — always, no exceptions
- Read all relevant files before writing anything
- No assumptions — verify directly from source
- Output: brief findings summary to Chief

### [2] PLAN

```
FILE   : [filename]
CHANGE : [exact description]
REASON : [why — reference spec if applicable]
RISK   : [what could break]
```

- One plan per file
- Show to Chief, wait for response

### [3] JET GO?

- FULL STOP
- Zero lines of code written before Chief types GO
- No exceptions whatsoever

### [4] EXECUTE

- ONE FILE per step
- ONE CHANGE per step
- Show diff after every change
- Wait for Chief confirmation before next step
- On error: STOP, report, wait for instruction — no auto-fix

### [5] VERIFY

- Run relevant tests
- Test pass ≠ done if behavior doesn't match spec
- Build pass ≠ problem solved
- Wait for Chief confirmation from actual output

### [6] REPORT

```
STATUS : [DONE / PARTIAL / FAILED]
DONE   : [what changed]
TEST   : [actual test results]
VERIFY : [Chief confirmation / actual output]
NEXT   : [next steps if any]
```

---

## ABSOLUTE PROHIBITIONS

1. NEVER execute without reading spec.md first
2. NEVER jump to code without Plan + GO
3. NEVER batch edit more than 1 file without explicit permission
4. NEVER reinterpret Chief's instructions — execute literally
5. NEVER report done/fixed without test + actual verify
6. NEVER create new file if existing file can be fixed
7. NEVER ignore Chief's concrete instructions for any reason
8. NEVER use informal address — always neutral professional tone

---

## ON VIOLATION

1. STOP execution immediately
2. Explicitly acknowledge the violation to Chief
3. Return to the skipped phase
4. Wait for GO again from Chief

## Domain Overview

The Healthcare domain handles all mission-critical clinical applications that
interact with patient health information (PHI) and clinical decision workflows.

### Applications

- `primary-healthcare`: Community health center (Puskesmas) dashboard.
- `sentra-assist`: Browser-integrated clinical decision support.
- `referralink`: AI-powered medical referral systems.

### Package-specific agent guides

| Package                                         | AGENTS.md                                                                                                                                                                                                             |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sentra Assist (WXT extension)                   | [`sentra-assist/AGENTS.md`](./sentra-assist/AGENTS.md) — typed messaging protocol, stack, agent-native audit, PR checklist                                                                                            |
| ReferraLink (Vite + serverless API)             | [`referralink/AGENTS.md`](./referralink/AGENTS.md) — `api/`, services, env, clinical docs                                                                                                                             |
| Primary Healthcare (dashboard + website + data) | [`primary-healthcare/AGENTS.md`](./primary-healthcare/AGENTS.md) — umbrella; detail: [`dashboard/AGENTS.md`](./primary-healthcare/dashboard/AGENTS.md), [`website/AGENTS.md`](./primary-healthcare/website/AGENTS.md) |

## Compliance and Security

### HIPAA Protocols

- Personally Identifiable Information (PII) must never be logged in cleartext.
- All PHI data must be encrypted at rest and in transit.
- Audit logging is mandatory for every read/write operation on patient data.

### Interoperability

- All clinical data schemas must align with the FHIR R4 standard via
  @the-abyss/fhir-engine.

### Mandatory to read native folder

Claude native folder "C:\Users\claud\.claude\CLAUDE.md" Codex native folder
"C:\Users\claud\.codex\AGENTS.md" Rocode native folder
"C:\Users\claud\roocode\AGENT.md" Jen Gemini native folder
"C:\Users\claud\.gemini\GEMINI.md" Github Copilot native folder
"C:\Users\claud\.copilot\AGENTS..md" Kilocode native folder
"C:\Users\claud\.kilo\AGENTS.md"

## Technical Standards

### Architecture

- Must utilize Server-Side Rendering (SSR) for sensitive data presentation.
- Validation: Zod for all API input/output.
- Error Handling: Global Sentry integration with PII scrubbing.

### Testing Strategy

| Test Type       | Target Coverage | Requirement |
| --------------- | --------------- | ----------- |
| Unit Tests      | 85%             | Required    |
| Security Audits | OWASP Top 10    | Required    |
| E2E Tests       | Patient Safety  | Required    |

---

## Sentratorium (wajib — jejak sesi)

**Lokasi HQ (ejaan resmi):** folder
[`docs/sentratorium/`](../../docs/sentratorium/) di root monorepo. **Bukan**
`docs/sentrarorium` (typo). Aturan teknis:
[`.cursor/rules/sentratorium-hq-mandatory.mdc`](../../.cursor/rules/sentratorium-hq-mandatory.mdc).

Setelah setiap sesi yang mengubah kode, konfigurasi build, skema, atau tes (atau
menghasilkan artefak merge), wajib mencatat **hasil coding dan progres per
paket** di Sentratorium:

1. Perbarui [`latest.md`](../../docs/sentratorium/latest.md) — nyatakan paket
   atau area yang disentuh
2. Tambah satu baris ke
   [`AGENT_SESSION_LOG.md`](../../docs/sentratorium/AGENT_SESSION_LOG.md)
   (format pipa, lihat header file)
3. Sesi besar (opsional):
   `docs/sentratorium/sessions/SESSION-YYYY-MM-DD-SLUG/HANDOFF.md` — lihat
   [`README.md`](../../docs/sentratorium/README.md)

Sebelum menutup sesi coding, pastikan kedua langkah di atas sudah dilakukan.

### Indeks folder `apps/healthcare` (path absolut, Windows)

| Area                          | Path                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| Healthcare domain             | `D:\Devop\abyss-monorepo\apps\healthcare`                              |
| Primary healthcare (umbrella) | `D:\Devop\abyss-monorepo\apps\healthcare\primary-healthcare`           |
| Puskesmas dashboard           | `D:\Devop\abyss-monorepo\apps\healthcare\primary-healthcare\dashboard` |
| Puskesmas website             | `D:\Devop\abyss-monorepo\apps\healthcare\primary-healthcare\website`   |
| ReferraLink                   | `D:\Devop\abyss-monorepo\apps\healthcare\referralink`                  |
| Sentra Assist                 | `D:\Devop\abyss-monorepo\apps\healthcare\sentra-assist`                |

---

© 2026 Sentra Healthcare AI
