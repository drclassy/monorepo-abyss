# HANDOFF.md — The Abyss (Monorepo Root)
<!-- Overwrite at the start of each new session. -->
<!-- Last updated: 2026-04-23 · Agent: Claude (Sonnet 4.6) · Session: sentra-rag-ingest -->

---

## Authority Reminder
**AGENTS.md is supreme authority.** This file is operational context only.
Before acting: read CONTEXT.md → PROGRESS.md → this file → LESSONS.md → DECISIONS.md.

---

## Quick Orient (for new thread)

**Branch:** `abyss-core` · Sentra RAG Engine built + medical library ingested · **NOT PUSHED**
**Working tree:** Avvcenna rebrand in-progress (Chief owns) + misc drift — do NOT touch
**Primary missions (dual-track):**
1. **SYMPHONY track** — `@the-abyss/clinical-references` scaffold committed (`01a71d3`) + Phase 7c traffic-light committed (`8c820e6`)
2. **Sentra RAG track** — wire `SentraRAGEngine` ke intelligenceboard CDSS / Kate agent
3. **Legacy lock:** `packages/ai-core` has been retired locally on 2026-04-25; do not recreate or depend on it again

---

## Track A: SYMPHONY Canonicalization

**All 7 phases COMPLETE.** Post-Phase-7 work now landed: scaffold `@the-abyss/clinical-references` + Phase 7c traffic-light canonicalization. Next = controlled consumer adoption and later route-level follow-up if Chief directs.

| # | Scope | Status |
|---|---|---|
| 1 | Symptom Signals NLP | ✅ `a587b41` |
| 2 | Pattern Engine generic evaluator | ✅ `0a471bb` (contract v0.2.0) |
| 3 | Clinical Patterns Evaluator (70 CP) | ✅ `8fb9d1d` + `39db0cb` |
| 4 | Action Protocols (ABCDE) | ✅ `466ec4b` (contract v0.3.0) |
| 5 | Gate taxonomy reconciliation | ✅ `0df24cf` (contract v0.4.0) |
| 6 | Prediction + classifier refinements | ✅ `3398ce7` (contract v0.5.0) |
| 7 | Pharmacology decision (ADR `0007`) | ✅ `3e97eeb` |

**Contract version:** `SYMPHONY_CONTRACT_VERSION = '0.6.0'`

---

## Track B: Sentra RAG Engine

**Package:** `packages/sentra-rag/` — local-first medical RAG, self-contained.

**Stack:**
- Embedding: Ollama `nomic-embed-text` (768-dim, lokal)
- Generation: Ollama `gemma2:9b`
- Vector store: Neon PostgreSQL + pgvector (tabel `medical_chunks`)
- PDF extractor: PyMuPDF via `src/ingestion/pdf_extract.py` (suppress errors: `fitz.TOOLS.mupdf_display_errors(False)`)
- PHI guard: GuardEngine (NIK, HP, email redaction)

**Library state** (`V:/avcn-sentra/abyss-monorepo/library/medical/`):
| Kategori | Files | Chunks | Status |
|---|---|---|---|
| `pha/` Pharmacology | 7/7 | 2,010 | DONE |
| `ped/` Pediatrics | 6/6 | 551 | DONE |
| `obg/` Obstetrics | 4/4 | 745 | DONE |
| `int/` Internal Med | 0/0 | 0 | EMPTY — corrupt PDF dihapus |
| `gen/` General Med | 0/0 | 0 | EMPTY — corrupt PDF dihapus |
| `bas/` Basic Sciences | 0/0 | 0 | EMPTY — image-based PDF dihapus |
| **TOTAL** | **17/17** | **3,306** | 100% indexed |

**DB:** Neon PostgreSQL — `medical_chunks`, 3,306 chunks, 768-dim pgvector.
**Env:** `packages/sentra-rag/.env` (lokal, tidak di-commit).

**Pending — Sentra RAG:**
- [ ] Re-download PDF bersih untuk `int/`: hipertensi 2024, GERD 2024, dispepsia, gagal jantung (dari PAPDI/Kemenkes — binary download)
- [ ] Wire `SentraRAGEngine` ke intelligenceboard CDSS endpoint
- [ ] Wire `SentraRAGEngine` ke Kate agent query pipeline

**Operational scripts:** `V:/avcn-sentra/abyss-monorepo/tooling/scripts/rag/`
**Batch TUI:** `V:/avcn-sentra/abyss-monorepo/tooling/scripts/rag/ingest-menu.bat`

---

## Perubahan Hari Ini (2026-04-23, belum di-commit)

- `packages/sentra-rag/src/ingestion/chunker.ts` — line-grouping fallback untuk plain-text PDF
- `packages/sentra-rag/src/ingestion/pdf_extract.py` — suppress MuPDF stdout errors
- `packages/sentra-rag/src/ingestion/pipeline.ts` — switch extractor ke PyMuPDF
- `library/medical/` — cleanup 101 PDF corrupt/gagal
- `packages/clinical-references/` — scaffold package baru (contracts + deterministic stubs + tests)
- `pnpm-lock.yaml` — importer/update workspace setelah `pnpm install`
- `.agent/` — session log + dokumentasi

---

## Known Entanglements (DO NOT TOUCH)

1. **Avvcenna rebrand in working tree** — Chief's in-progress. Do NOT commit rebrand files.
2. **2 pre-existing stashes** — bukan Claude punya. Do NOT `stash pop`.
3. **`packages/symphony/.agent/sessions/2026-04-20.md`** — hook bug artifact. Leave as-is.
4. **Unrelated working tree drift** — `.env.example`, `.gitignore`, `AGENTS.md`, infra Terraform, dll. Do NOT `git add .` / `-A`.
5. **Push hold active** — Chief belum authorize push ke origin.

---

## Incident Context (active lock)

- **Lock:** `packages/database` bukan healthcare DB migration target.
- **Hierarchy lock:** SYMPHONY parent; Dashboard + Assist = consumers.
- **sentra-rag DB:** bukan `packages/database` — Neon connection langsung di `.env` lokal.

---

## Medical Data Inventory (2026-04-23 audit)

Data medis tersebar di 3 app, belum ada single source of truth:

| Data | Lokasi | Records |
|---|---|---|
| Penyakit (172 + 144 SKDI) | intelligenceboard/public/data/ | ~316 penyakit |
| ICD-10 BPJS | intelligenceboard/database/ | 18,543 kode |
| Obat Fornas + stok | intelligenceboard/public/data/ | 222 + 277 item |
| **DDI (173k interaksi)** | **sentra-assist/data/ddi-clinical.json** | **1,785 obat** |
| Epidemiologi lokal | sentra-assist/public/data/ | 1,930 kode, 45k kasus |
| Dosis per usia/berat | sentra-assist/lib/clinical/dosage-database.ts | per populasi |
| Clinical chains + patches | intelligenceboard/database/ | 150+ penyakit |
| Med database | referralink/public/data/ | ~100+ kondisi |

Kandidat konsolidasi ke `@the-abyss/clinical-references` — detail di DECISIONS.md.

---

## Next Action Options (Chief choose)

1. **Re-download int/ PDFs** — hipertensi 2024, GERD, dispepsia, gagal jantung dari PAPDI/Kemenkes
2. **Wire Sentra RAG ke intelligenceboard** — tambah RAG query endpoint
3. **Commit scaffold `@the-abyss/clinical-references`** — package sudah hijau lokal; stage explicit file list saja
4. **Commit sentra-rag package** — stage explicit file list dari `packages/sentra-rag/`

---

## Do-Not-Touch Contract

- ❌ Tidak commit Avvcenna rebrand working tree (Chief own)
- ❌ Tidak pop stash@{0} atau stash@{1}
- ❌ Tidak push ke remote tanpa Chief explicit GO
- ❌ Tidak touch `packages/database` sebagai healthcare target
- ❌ Tidak `git add .` / `-A`
- ❌ Tidak skip GUARD-1 / JET-5 / JET-7

---

**Fresh thread protocol:** Read CONTEXT → PROGRESS → this file → LESSONS → DECISIONS. Output CONTEXT LOADED confirmation. Wait for Chief instruction.
