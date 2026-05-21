# CURATION_TASKS.md — Clinical Reference Database
<!-- Created: 2026-04-23 · Author: Claude (Sonnet 4.6) -->
<!-- Purpose: Task list untuk kurasi 12 file referensi medis — scalable Primary Care → RSIA → RSU -->

---

## Scope & Tujuan

Build **`@the-abyss/clinical-references`** sebagai single source of truth untuk data medis.
Tahap 1: FKTP scope (Primary Care). Ekspansi ke RSIA → RSU tanpa schema rewrite.

**Data Source #0 (Pre-existing, sudah ada):**
Semua data di `intelligenceboard/`, `sentra-assist/`, `referralink/` sudah mapped di DECISIONS.md.
Ini adalah baseline. Curation tasks di bawah MEMPERKAYA, bukan menggantikan.

**Data Source #1 (NEW — OpenMRS):**
OpenMRS sebagai sistem EMR terstruktur → patient/encounter context → feeds CDSS runtime.

---

## PHASE 0: Foundation (Lakukan sebelum kurasi file manapun)

### T0.1 — Schema JSON v1.0 (Disease Entity)
**Output:** `packages/clinical-references/src/schemas/disease.schema.ts`

```typescript
interface Disease {
  // === CORE (required — semua setting) ===
  icd10Code: string               // "A01.0" format
  icd10BpjsCode?: string          // kode BPJS e-Klaim (bisa berbeda)
  nameId: string                  // nama Indonesia
  nameEn: string                  // nama Inggris/Latin
  definition: string              // definisi singkat 1-2 kalimat

  // === SYMPTOM LAYER ===
  mainSymptoms: string[]          // gejala wajib ada
  additionalSymptoms?: string[]   // gejala pendukung
  redFlags?: string[]             // tanda bahaya / indikasi rujukan segera
  symptomAliases?: string[]       // alias bahasa awam (dari symptom-aliases.ts)

  // === CLINICAL ASSESSMENT ===
  physicalExam?: string[]         // pemeriksaan fisik kunci
  diagnosticTests?: string[]      // penunjang FKTP (darah rutin, rapid test, dll)
  diagnosticCriteria?: string     // kriteria diagnosis formal
  differentialDiagnosis?: string[] // DD utama

  // === TREATMENT (FKTP) ===
  firstLineTherapy?: string[]     // lini pertama, nama generik
  referralCriteria?: string[]     // indikasi rujukan ke FKRTL
  skdiLevel?: '1' | '2' | '3a' | '3b' | '4' // kompetensi dokter umum

  // === SEVERITY & RISK ===
  severityLevels?: SeverityLevel[]
  riskFactors?: string[]
  vulnerableAgeGroups?: AgeGroup[]

  // === EPIDEMIOLOGY (Lokal) ===
  localEpiWeight?: number         // dari epidemiology_weights_v2.json Balowerti
  prevalenceNotes?: string

  // === OPENMRS BRIDGE ===
  openMrsConceptId?: number       // OpenMRS Concept Dictionary ID
  snomedCt?: string               // SNOMED CT code (future)
  loincCode?: string              // LOINC (untuk lab criteria)

  // === METADATA ===
  sources: string[]               // ["PPK_FKTP_2022", "PNPK_2024_HTN"]
  completenessScore?: number      // 0–100, auto-calculated
  level: 'fktp' | 'fkrtl' | 'icu' // scope level — untuk expansion filter
  lastVerified?: string           // ISO date
}

interface SeverityLevel {
  name: string        // "ringan" | "sedang" | "berat"
  criteria: string[]
  management: string
}

type AgeGroup = 'neonatus' | 'bayi' | 'balita' | 'anak' | 'remaja' | 'dewasa' | 'lansia'
```

### T0.2 — Schema JSON v1.0 (Drug Entity)
**Output:** `packages/clinical-references/src/schemas/drug.schema.ts`

```typescript
interface Drug {
  // === CORE ===
  genericName: string             // nama generik INN
  tradeNames?: string[]           // nama dagang di Indonesia
  drugClass: string               // kelas terapi
  subClass?: string

  // === PHARMACOLOGY ===
  mechanism?: string              // mekanisme kerja singkat
  indications: string[]           // indikasi utama (ICD-10 linked jika bisa)
  contraindications?: string[]
  sideEffects?: string[]          // efek samping utama

  // === DOSING ===
  doseAdult?: DoseSpec
  doseChild?: DoseSpec            // per kg BB atau usia
  doseNeonatus?: DoseSpec
  doseElderly?: DoseSpec          // penyesuaian lansia
  routes: string[]                // ["oral", "iv", "im", "topical"]
  frequency?: string              // "2x1", "3x1", dll

  // === INDONESIA REGULATORY ===
  fktpStatus: boolean             // di FORNAS FKTP?
  fkrtlStatus: boolean            // di FORNAS FKRTL?
  doenStatus: boolean             // DOEN 2023?
  fornas2023Ref?: string          // nomor halaman/kode FORNAS

  // === SAFETY ===
  pregnancyCategory?: 'A' | 'B' | 'C' | 'D' | 'X' | 'N' // FDA/Australian
  lactationSafety?: 'safe' | 'caution' | 'avoid' | 'unknown'
  renalDoseAdjustment?: RenalDose
  hepaticDoseAdjustment?: HepaticDose

  // === DDI BRIDGE ===
  ddiCount?: number               // total interaksi diketahui
  majorDdiDrugs?: string[]        // nama generik dengan major DDI
  ddiRef?: string                 // "ddi-clinical.json" pointer

  // === OPENMRS BRIDGE ===
  openMrsConceptId?: number
  rxcui?: string                  // RxNorm (untuk FHIR MedicationRequest)

  // === METADATA ===
  sources: string[]
  completenessScore?: number
  level: 'fktp' | 'fkrtl' | 'icu'
  lastVerified?: string
}

interface DoseSpec {
  amount: string          // "500mg", "10mg/kgBB"
  frequency: string       // "3x/hari"
  maxDose?: string
  duration?: string
  notes?: string
}

interface RenalDose {
  gfr30_60: string        // dose jika GFR 30-60
  gfr_under30: string     // dose jika GFR <30
  dialysis: string        // dose jika HD/PD
}

interface HepaticDose {
  childPughA: string
  childPughB: string
  childPughC: string
}
```

### T0.3 — Expansion Config (FKTP → RSIA → RSU)
**Output:** `packages/clinical-references/src/config/expansion.ts`

```
Level FKTP (v1.0):   26 core fields, skdiLevel required
Level RSIA (v2.0):   + neonatusProtocol, obGynProtocol, birthWeight dosing
Level RSU (v3.0):    + icuProtocol, surgicalIndication, ventilatorSetting
```

Schema menggunakan `level: 'fktp' | 'fkrtl' | 'icu'` per entity untuk filter query.
Tidak perlu schema rewrite saat ekspansi — hanya tambah field optional + level baru.

### T0.4 — OpenMRS Integration (Data Source #1)
**Tujuan:** Jembatan antara clinical reference database ↔ patient encounter data di lapangan.

**Apa yang OpenMRS berikan:**
- ICD-10 Concept IDs yang sudah dipetakan ke SNOMED/LOINC
- FHIR R4 resources: Patient, Encounter, Condition, MedicationRequest, Observation
- SATUSEHAT (Kemenkes) compliance out-of-box
- OMOP CDM export untuk AI/ML training data

**Task T0.4a — Evaluasi OpenMRS Demo:**
```
1. Download OpenMRS Reference Application dari openmrs.org
2. Jalankan Docker local: docker run -p 8080:8080 openmrs/openmrs-reference-application
3. Akses REST API: GET /openmrs/ws/rest/v1/concept?name=hypertension
4. Map 10 sample diseases ke openMrsConceptId
5. Catat pattern mapping untuk automated sync
```

**Task T0.4b — SATUSEHAT Integration Plan:**
```
- OpenMRS sudah punya modul SATUSEHAT (Kemenkes FHIR)
- Endpoint: https://api-satusehat.kemkes.go.id (sandbox dulu)
- Bridge: openMrsConceptId → icd10Code → satusehat DiagnosisCode
- Benefit: legal compliance untuk klaim BPJS + data nasional
```

**Task T0.4c — OMOP CDM untuk AI:**
```
- Install OpenMRS OMOP module
- Export anonymized patient data ke OMOP CDM format
- Use sebagai training data untuk CDSS model improvement
- Standard OHDSI tools (Atlas, ACHILLES) bisa langsung dipakai
```

---

## PHASE 1: Curation Task per File Referensi

### FILE 1 — PPK FKTP (Panduan Praktik Klinis FKTP)
**Sumber:** IDI — PPK FKTP edisi terbaru (Keputusan Konsil Kedokteran Indonesia)
**Target fields:** definisi, gejala utama, gejala tambahan, pemfis, penunjang, dx banding, terapi lini 1, kriteria rujukan
**Format output:** `disease[]` — 13 dari 26 field penyakit
**Estimasi coverage:** ~300-500 penyakit FKTP

**Task steps:**
```
T1.1 — Download PDF PPK FKTP resmi (pastikan binary mode)
T1.2 — Ingest ke Sentra RAG via pipeline.ts (kategori: "ppk")
T1.3 — Extract structured data per penyakit ke JSON template
T1.4 — Validasi: setiap entry harus punya icd10Code + nameId + ≥3 symptom fields
T1.5 — Cross-check ICD-10 code dengan File 2 (ICD-10 FKTP)
T1.6 — Merge ke master disease.json, flag conflict
```

**Validation rules:**
- `icd10Code`: regex `^[A-Z]\d{2}(\.\d{1,2})?$`
- `mainSymptoms`: minimum 2 items
- `skdiLevel`: wajib ada untuk semua FKTP entry
- `sources`: harus include `"PPK_FKTP"`

---

### FILE 2 — ICD-10 FKTP (Daftar ICD-10 Kompetensi FKTP)
**Sumber:** Kemenkes / BPJS — daftar penyakit 144 SKDI FKTP (sudah ada sebagian di `144_penyakit_puskesmas.json`)
**Target fields:** icd10Code, icd10BpjsCode, nameId, nameEn, skdiLevel
**Format output:** lookup table → enriches disease[] entries

**Task steps:**
```
T2.1 — Audit existing 144_penyakit_puskesmas.json — berapa yang sudah punya ICD-10?
T2.2 — Download daftar ICD-10 BPJS e-Klaim terbaru (sudah ada icd10.json = 18,543 kode)
T2.3 — Crosswalk: FKTP penyakit list → ICD-10 BPJS code mapping
T2.4 — Flag penyakit FKTP yang code-nya berbeda antara ICD-10 WHO vs BPJS e-Klaim
T2.5 — Output: disease_icd10_map.json {penyakitName: icd10Code, bpjsCode}
```

**Catatan:** `icd10.json` (18,543 kode) sudah ada di intelligenceboard. Reuse langsung.
Jangan buat duplikat — import dari sumber yang sudah ada.

---

### FILE 3 — PNPK 2023-2024 (4 PDFs — Prioritas Nasional)
**Sumber:** Kemenkes — Pedoman Nasional Pelayanan Kedokteran per penyakit prioritas
**Target fields:** redFlags, diagnosticCriteria, severityLevels, riskFactors, vulnerableAgeGroups
**Format output:** `disease[]` patches — memperkaya entry yang sudah ada dari PPK FKTP

**Daftar PNPK yang paling relevan (pilih 4 berdasarkan prevalensi lokal Balowerti):**
```
Kandidat (urutkan berdasarkan epidemiology_weights_v2.json):
1. PNPK Hipertensi (paling tinggi di Puskesmas) — PAPDI 2023
2. PNPK Diabetes Mellitus Type 2 — PERKENI 2023
3. PNPK Tuberkulosis — Kemenkes 2023
4. PNPK ISPA/Pneumonia — Kemenkes 2024
```

**Task steps:**
```
T3.1 — Download 4 PNPK PDF (binary mode, dari papdi.or.id / kemenkes.go.id)
T3.2 — Ingest ke Sentra RAG (kategori: "pnpk")
T3.3 — Structured extraction per PNPK:
         - Kriteria diagnosis (tabel, algoritma)
         - Stratifikasi keparahan (mild/moderate/severe)
         - Red flags (indikasi rawat inap, ICU, emergensi)
         - Faktor risiko spesifik
         - Kelompok usia rentan
T3.4 — Merge sebagai PATCH ke disease[] entry yang sesuai
T3.5 — Validasi: PNPK entry harus ada redFlags dan severityLevels
```

**Validation rules:**
- `redFlags`: minimum 2 items untuk setiap PNPK disease
- `severityLevels`: wajib punya ≥2 level (ringan + berat minimum)
- PNPK yang tidak ada di FKTP list → flag sebagai FKRTL-only

---

### FILE 4 — PPK PD 2024 (Penyakit Dalam — FKRTL Scope)
**Sumber:** PAPDI — Panduan Praktik Klinis Penyakit Dalam 2024
**Target fields:** severityLevels, diagnosticCriteria, hospitalizationCriteria, specialistTreatment
**Level:** `level: 'fkrtl'` — scope RSIA/RSU, bukan FKTP
**Format output:** disease[] entries baru (tidak ada di PPK FKTP) + patches untuk overlap

**Task steps:**
```
T4.1 — Download PPK PD 2024 PDF (PAPDI)
T4.2 — Identify penyakit yang OVERLAP dengan PPK FKTP vs BARU di PPK PD
T4.3 — Untuk overlap: extract data FKRTL-specific (hospitalization criteria, specialist workup)
T4.4 — Untuk penyakit baru: buat entry penuh dengan level: 'fkrtl'
T4.5 — Flag: penyakit dengan skdiLevel 3b/4 yang butuh SPESIALIS
```

**Catatan:** Ini adalah awal RSIA expansion — tandai semua entry dengan `level: 'fkrtl'`.

---

### FILE 5 — FORNAS 2023 (Formularium Nasional)
**Sumber:** Kemenkes — FORNAS 2023 PDF (sudah ada `obat_data.json` 222 obat sebagai baseline)
**Target fields:** fktpStatus, fkrtlStatus, doenStatus, fornas2023Ref, routes, drugClass, indications
**Format output:** drug[] base records + enrichment existing obat_data.json

**Task steps:**
```
T5.1 — Audit existing obat_data.json (222 obat) — coverage gap?
T5.2 — Download FORNAS 2023 PDF dari farmalkes.kemkes.go.id
T5.3 — Extract semua obat FKTP dari FORNAS (nama generik, kelas, rute, DOEN status)
T5.4 — Merge dengan obat_data.json — update fktpStatus/fkrtlStatus/doenStatus
T5.5 — Flag obat yang di obat_data.json tapi tidak di FORNAS (mungkin sudah dihapus)
T5.6 — Output: drug[].fornas enriched JSON
```

**Validation rules:**
- `fktpStatus`: boolean, wajib ada untuk semua drug FORNAS
- `doenStatus`: boolean, wajib ada
- `routes`: minimum 1 item

---

### FILE 6 — MIMS Indonesia 2024
**Sumber:** MIMS Indonesia edisi terbaru (berbayar — beli fisik atau akses digital)
**Target fields:** tradeName, mechanism, contraindications, sideEffects, doseAdult, doseChild, doseNeonatus, doseElderly
**Format output:** drug[] enrichment — paling banyak menambah data

**Task steps:**
```
T6.1 — [CHIEF ACTION] Akses/scan MIMS Indonesia 2024
T6.2 — Prioritas extraksi: obat yang sudah di FORNAS (overlap dengan T5)
T6.3 — Extract per obat: tradeNames, mechanism (ringkas), KI utama, ES utama, dosis 4 populasi
T6.4 — Khusus dosis: format standar → {amount: "500mg", frequency: "3x/hari", maxDose: "2g/hari"}
T6.5 — Validasi: obat KV/DM/TB harus punya doseElderly
T6.6 — Flag obat pediatrik yang TIDAK ada doseChild/doseNeonatus (ini gap penting)
```

**Catatan:** Ini file dengan dampak terbesar (+8% completeness). Priority HIGH setelah FORNAS.

---

### FILE 7 — ISO Farmakoterapi Indonesia
**Sumber:** ISO Farmakoterapi — referensi obat Indonesia standar apoteker
**Target fields:** tradeNames (tambahan), indications (enrichment), interaksi ringkas
**Format output:** patches ke drug[] dari MIMS

**Task steps:**
```
T7.1 — Prioritaskan obat yang gap di MIMS (mana yang trade name-nya kurang?)
T7.2 — Extract trade name tambahan yang tidak ada di MIMS
T7.3 — Cross-check indications dengan MIMS → flag discrepancy
T7.4 — Merge sebagai additive patches (jangan replace MIMS data)
```

---

### FILE 8 — Kategori Kehamilan
**Sumber:** FDA Pregnancy Category list + Australian ADEC categories (lebih lengkap)
**Target fields:** pregnancyCategory (A/B/C/D/X), lactationSafety
**Format output:** patches ke drug[] — 2 field per obat

**Task steps:**
```
T8.1 — Download FDA pregnancy category list (public domain)
T8.2 — Download Australian ADEC (lebih dipakai di Indonesia — mirip FDA tapi lebih detail)
T8.3 — Map setiap obat di drug[] ke kategori yang sesuai
T8.4 — Untuk obat Indonesia-specific (jamu/herbal): flag sebagai 'N' (not classified)
T8.5 — Untuk obat kritis (antikonvulsan, antikoagulan, antibiotik): wajib ada kategori
T8.6 — lactationSafety: gunakan LactMed (NIH) sebagai referensi utama
```

**Validation rules:**
- Obat yang pregnancyCategory=D/X HARUS punya contraindications entry "kehamilan"
- Antibiotik golongan FKTP semua harus ada pregnancyCategory

---

### FILE 9 — MIMS Online (Penyesuaian Dosis Ginjal & Hati)
**Sumber:** mims.com/indonesia per obat
**Target fields:** renalDoseAdjustment, hepaticDoseAdjustment
**Format output:** patches ke drug[] — 2 complex fields per obat

**Task steps:**
```
T9.1 — Buat priority list: obat mana yang PALING perlu renal/hepatic adjustment?
       → Prioritas: metformin, ACEI, NSAID, aminoglikosida, antikonvulsan
T9.2 — Untuk setiap obat prioritas: akses mims.com/indonesia/{drug-name}
T9.3 — Extract 3 GFR level untuk renal: <30, 30-60, dialysis
T9.4 — Extract 3 Child-Pugh class untuk hepatic: A, B, C
T9.5 — Format standar: {gfr30_60: "reduce 50%", gfr_under30: "contraindicated", dialysis: "avoid"}
T9.6 — Flag: obat yang tidak ada data → renalDoseAdjustment: null (jangan kosong)
```

**Catatan:** Ini paling labor-intensive. Start dengan 30-50 obat kritis, bukan semua sekaligus.
Pakai Sentra RAG untuk query → verify di MIMS Online.

---

### FILE 10 — Riskesdas 2023 (Epidemiologi Nasional)
**Sumber:** litbang.kemkes.go.id — Riskesdas 2023 (download gratis)
**Target fields:** vulnerableAgeGroups, riskFactors (enrichment), prevalenceNotes
**Format output:** patches ke disease[] entries prioritas

**Task steps:**
```
T10.1 — Download Riskesdas 2023 PDF dari litbang.kemkes.go.id (pastikan binary)
T10.2 — Ingest ke Sentra RAG (kategori: "epidemiology")
T10.3 — Extract data per penyakit prioritas nasional: HTN, DM, TB, gizi buruk, dll
T10.4 — Map ke: kelompok usia paling rentan, faktor risiko terbukti, prevalensi per propinsi
T10.5 — Enrich disease[] entries yang punya gap di vulnerableAgeGroups (saat ini 55%)
```

---

### FILE 11 — DrugBank / Medscape (Mekanisme & DDI Lanjutan)
**Sumber:** drugbank.com (freemium) atau medscape.com/drug (free)
**Target fields:** mechanism (enrichment), majorDdiDrugs (top 5 per drug)
**Format output:** patches ke drug[] — untuk obat yang MIMS-nya kurang detail

**Task steps:**
```
T11.1 — Prioritaskan 50 obat paling sering dipakai di FKTP
T11.2 — Untuk setiap obat: query DrugBank API atau Medscape web
T11.3 — Extract mechanism 1-2 kalimat (jika belum ada dari MIMS)
T11.4 — Extract top 5 major DDI (cross-reference dengan ddi-clinical.json yang sudah ada)
T11.5 — ddi-clinical.json (173k interaksi) sudah sangat lengkap — gunakan sebagai primary
       DrugBank hanya untuk gap / validation
```

---

### FILE 12 — OpenMRS Concept Dictionary (Auto-mapping)
**Sumber:** OpenMRS demo instance / CIEL concept dictionary
**Target fields:** openMrsConceptId (semua disease & drug)
**Format output:** lookup table → bridge untuk FHIR integration

**Task steps:**
```
T12.1 — Setup OpenMRS local Docker instance
T12.2 — Import CIEL concept dictionary (Clinical Informatics Enterprise Ltd — ICD-10 mapped)
T12.3 — REST query: GET /openmrs/ws/rest/v1/concept?name={icd10Name}&v=full
T12.4 — Automated script: untuk setiap disease.icd10Code → query → save openMrsConceptId
T12.5 — Untuk drug: GET /openmrs/ws/rest/v1/concept?name={genericName}&conceptClass=Drug
T12.6 — Output: openmrs_concept_map.json {icd10Code: conceptId, rxcui: conceptId}
T12.7 — This enables FHIR Condition.code + MedicationRequest.medication → Sentra clinical refs
```

---

## PHASE 2: Build & Validation Pipeline

### Pipeline Architecture

```
Raw Reference Files (PDFs/Web)
         ↓
Sentra RAG Ingest (pdf_extract.py → chunker → embedder → pgvector)
         ↓
LLM Structured Extraction (gemma2:9b + prompt template per file type)
         ↓
JSON Schema Validation (TypeScript Zod schemas)
         ↓
Master Disease/Drug JSON (packages/clinical-references/data/)
         ↓
Completeness Scoring (auto-calculate per entry, flag gaps)
         ↓
@the-abyss/clinical-references package export
         ↓
Consumers: intelligenceboard CDSS, sentra-assist, Kate agent
```

### Completeness Score Formula
```typescript
function scoreDisease(d: Disease): number {
  const weights = {
    icd10Code: 10, nameId: 5, nameEn: 5, definition: 8,
    mainSymptoms: 10, additionalSymptoms: 5, physicalExam: 8,
    diagnosticTests: 7, differentialDiagnosis: 7, redFlags: 8,
    diagnosticCriteria: 7, severityLevels: 7, riskFactors: 5,
    vulnerableAgeGroups: 5, openMrsConceptId: 3
  }
  // calculate % of weighted fields populated
}
// Target: ≥80% average completeness sebelum publish
```

---

## PHASE 3: Expansion Roadmap

### RSIA Expansion (v2.0)
```
Tambahan data source:
- PNPK Obstetri (Kemenkes/POGI 2023)  → disease[].level = 'fkrtl'
- PNPK Neonatus (IDAI 2023)            → disease[].level = 'fkrtl'
- IDAI Drug Guide (dosis neonatus)     → drug[].doseNeonatus
- WHO antenatal care guidelines        → disease[].obGynProtocol (new field)

Schema additions (non-breaking):
interface Disease {
  ...
  obGynProtocol?: ObGynProtocol     // new optional
  neonatalProtocol?: NeonatalProtocol
}
```

### RSU Expansion (v3.0)
```
Tambahan data source:
- PNPK Bedah (IKABI 2024)             → disease[].level = 'icu'
- Critical Care protocols             → disease[].icuProtocol (new field)
- Ventilator settings (ARDS network)  → drug[].icuDosingProtocol

Schema additions (non-breaking):
interface Disease {
  ...
  icuProtocol?: ICUProtocol           // new optional
  surgicalIndication?: string[]
}
```

**Invariant:** `level` field selalu tersedia. Consumer query filter:
```typescript
// Primary Care view
db.diseases.filter(d => d.level === 'fktp')
// Hospital view — semua
db.diseases.filter(d => ['fktp', 'fkrtl', 'icu'].includes(d.level))
```

---

## Priority Order (Recommended)

| Priority | Task | Dampak | Effort |
|---|---|---|---|
| P0 | T0.1 + T0.2: Schema design | Foundation semua task lain | Low |
| P1 | T5: FORNAS | drug[].fktpStatus semua lengkap | Low |
| P1 | T2: ICD-10 FKTP | disease[].icd10Code clean | Low (sudah ada data) |
| P2 | T1: PPK FKTP | +90% disease[] entries | Medium |
| P2 | T3: PNPK 2023 (4 file) | redFlags + severityLevels | Medium |
| P3 | T6: MIMS Indonesia | +8% completeness overall | High (akses berbayar) |
| P3 | T8: Kategori Kehamilan | pregnancyCategory field | Medium |
| P4 | T12: OpenMRS mapping | FHIR bridge | Medium (Docker setup) |
| P4 | T9: MIMS Online renal/hati | gap terbesar dosis | High (labor-intensive) |
| P5 | T4: PPK PD 2024 | RSIA expansion start | Medium |
| P5 | T10: Riskesdas 2023 | epidemiology gap | Low (free download) |
| P6 | T11: DrugBank/Medscape | DDI enrichment | Medium |
| P6 | T7: ISO Farmakoterapi | trade name enrichment | Low |

---

## Acceptance Criteria (sebelum publish v1.0)

- [ ] Semua disease entries punya: `icd10Code`, `nameId`, `mainSymptoms`, `level`, `sources`
- [ ] Semua drug entries punya: `genericName`, `drugClass`, `indications`, `fktpStatus`, `routes`, `sources`
- [ ] Average completeness score ≥80% (disease) dan ≥75% (drug)
- [ ] Zero entries dengan `pregnancyCategory` kosong untuk obat Category D atau X
- [ ] OpenMRS conceptId tersedia untuk ≥50% entries (Phase 1 target)
- [ ] Semua data di existing intelligenceboard/sentra-assist JSON sudah di-migrate/bridge
- [ ] TypeScript Zod validation PASS untuk seluruh dataset

---

*Last updated: 2026-04-23 · Next review: saat mulai T0.1*
