# Sentra CDSS — Master Feature Inventory & Migration Checklist

**Tanggal:** 2026-04-18  
**Tujuan:** Inventarisasi seluruh fitur dari Intelligence Dashboard dan Sentra Assist sebagai checklist Claude Code saat migrasi dan pembangunan flowCDSS terbaik. Tidak satu fitur pun boleh hilang.  
**Status:** CANONICAL — gunakan dokumen ini sebagai referensi tunggal.

---

## BAGIAN 1: INTELLIGENCE DASHBOARD (intelligenceboard)

### 1.1 CDSS Engine V2 (Iskandar Diagnosis Engine V2)
*Lokasi: `src/lib/cdss/`*

- [ ] **engine.ts** — Main LLM-first diagnosis engine
  - [ ] DeepSeek Reasoner sebagai primary LLM (model `deepseek-reasoner`, temp 0.2, max 4096 tokens)
  - [ ] Gemini 2.5 Flash-Lite sebagai fallback (`gemini-2.5-flash-lite`, JSON schema output)
  - [ ] Circuit breaker untuk DeepSeek: threshold 3 kegagalan beruntun, cooldown 5 menit, half-open state setelah cooldown
  - [ ] Hardcoded vital red flags (TIDAK butuh LLM):
    - [ ] Sistolik ≥180 → Hipertensi Krisis (emergency, ICD I10)
    - [ ] Sistolik <90 → Hipotensi/Suspek Syok (emergency)
    - [ ] Diastolik ≥120 → HTN Emergensi (emergency, ICD I10)
    - [ ] SpO2 <90% → Hipoksia Berat (emergency)
    - [ ] HR >140 → Takikardia Berat (urgent)
    - [ ] HR <45 → Bradikardia Berat (urgent)
    - [ ] Suhu ≥40°C → Hiperpireksia (urgent)
    - [ ] Suhu <35°C → Hipotermia (urgent)
    - [ ] RR >30 → Takipnea Berat (urgent)
    - [ ] RR <8 → Bradipnea/Depresi Napas (emergency)
    - [ ] AVPU Unresponsive → Penurunan Kesadaran Berat (emergency)
    - [ ] AVPU Severe (P) → Penurunan Kesadaran Berat (emergency)
    - [ ] AVPU Impaired (V/C) → Penurunan Kesadaran Ringan-Sedang (urgent)
    - [ ] Pain score ≥8/10 → Nyeri Berat (urgent)
    - [ ] GCS label: "terukur" jika GCS asli tersedia, "estimasi dari AVPU" jika tidak
  - [ ] NEWS2 scoring terintegrasi di pipeline
  - [ ] Early Warning Patterns detection terintegrasi di pipeline
  - [ ] Knowledge Base context builder (159 penyakit KKI → pre-filtered per query)
  - [ ] Structured prompt builder dengan blok konteks:
    - [ ] `structuredSignsBlock` (bedside/Assist structured triage signs)
    - [ ] `deteriorationBlock` (composite deterioration summary text)
    - [ ] `trajectoryBlock` (momentum + convergence + baseline context dari trajectory)
    - [ ] `assessmentConclusion` (sintesis asesmen dokter)
  - [ ] Gemini Structured Output Schema (DIAGNOSIS_SCHEMA): suggestions array (2-5 DDx), clinical_red_flags, overall_confidence, data_quality_note
  - [ ] DeepSeek JSON recovery: strip markdown fences + regex fallback jika parse JSON gagal
  - [ ] Merge red flags pipeline: vitals → early warning → NEWS2 → LLM (deduplicate by condition string)
  - [ ] Alert builder: red_flag alerts + low_confidence alert (avg < 0.3) + disclaimer alert
  - [ ] Fallback result builder (ketika tidak ada API key atau semua LLM gagal)
  - [ ] `runDiagnosisEngine(input)` — main export
  - [ ] `getCDSSEngineStatus()` — ready status + KB disease count + model string info

- [ ] **hybrid.ts** — Hybrid decisioning setelah LLM output
  - [ ] `mergeDiseaseCandidates()` — Reciprocal Rank Fusion (RRF, k=60) merge keyword + semantic lists
  - [ ] `buildProblemRepresentation()` — sintesis pasien sebagai satu string untuk LLM context
  - [ ] `applyHybridDecisioning()` — scoring formula per suggestion:
    - [ ] LLM confidence × 0.36
    - [ ] keyword score × 0.36
    - [ ] semantic score × 0.22
    - [ ] Bonus: rag_verified (+0.12), explains_chief_complaint (+0.08), key_reasons ≥2 (+0.03)
    - [ ] Penalty: missing_info ≥2 (-0.08), name_mismatch (-0.18), age_implausible (-0.20), sex_implausible (-0.25), pregnancy_implausible (-0.30), allergy_conflict (-0.15), icd_not_found/missing_icd (-0.45)
  - [ ] Decision status: `recommended` / `review` / `must_not_miss` / `deferred`
    - [ ] `recommended`: rag_verified + score ≥0.58 + tidak danger + tidak impossible context
    - [ ] `must_not_miss`: danger signal + tidak impossible context + score ≥0.34
    - [ ] `review`: score ≥0.28
    - [ ] `deferred`: else
  - [ ] `buildNextBestQuestions()` — maks 5 pertanyaan dari missing_information + default prompts
  - [ ] `buildEmptyValidationSummary()` — fallback empty validation summary

- [ ] **pre-filter.ts** — BM25 keyword pre-filter
  - [ ] Load `penyakit.json` (159 penyakit KKI) dari `public/data/`
  - [ ] Build BM25 index dengan field weights: nama (3x), gejala/gejala_klinis (3x), red_flags (2x), definisi (1x), diagnosis_banding (1x)
  - [ ] `expandQueryWithAliases()` — expand query dengan sinonim medis sebelum tokenisasi
  - [ ] Medical stopwords filter Indonesia (dan, atau, yang, dengan, pada, dari, dst.)
  - [ ] Fallback ke kompetensi 4A jika query tokens kosong
  - [ ] `preFilterDiseases(keluhanUtama, keluhanTambahan, topN=15)` — return FilteredDisease[]
  - [ ] `getKBStats()` — total diseases, withGejala count, withRedFlags count

- [ ] **embedding-filter.ts** — Semantic embedding retrieval
  - [ ] `embeddingFilterDiseases(query, context, topN=15)` — semantic search 15 candidates
  - [ ] `isEmbeddingReady()` — cek apakah embedding vectors sudah tersedia

- [ ] **bm25.ts** — BM25 implementation
  - [ ] `buildBM25Index(documents[])` — bangun inverted index dari dokumen
  - [ ] `scoreBM25(index, queryTokens[])` — score query terhadap index, return sorted id+score

- [ ] **symptom-aliases.ts** — Alias expansion untuk query
  - [ ] `expandQueryWithAliases(query)` — perluas query dengan sinonim/alias medis Indonesia

- [ ] **symptom-suggest.ts** — Autocomplete keluhan dari KB
  - [ ] `suggestSymptoms(query, symptoms[], topN=8)` — autocomplete dari KB symptoms (client-safe, no server-only)

- [ ] **news2.ts** — NEWS2 Scoring Engine (lihat detail section 1.3)

- [ ] **early-warning-patterns.ts** — Disease-specific patterns (lihat detail section 1.4)

- [ ] **validation.ts** — LLM output validation
  - [ ] `validateLLMSuggestions()` — validasi ICD-10 kode, nama diagnosis, plausibility klinis (age/sex/pregnancy/allergy flags)

- [ ] **types.ts** — Core type definitions: CDSSEngineInput, CDSSEngineResult, CDSSAlert, ValidatedSuggestion, VitalSigns

- [ ] **workflow.ts** — CDSS workflow dan quality tracking
  - [ ] `writeCDSSAuditEntry()` — tulis ke CDSSAuditLog (session hash SHA-256, action, latency, model version)
  - [ ] `writeCDSSOutcomeFeedbackEntry()` — tulis ke CDSSOutcomeFeedback (selectedIcd, finalIcd, override reason, doctorUserId)
  - [ ] `getCDSSQualityMetrics(days=14)` — quality metrics dashboard:
    - [ ] total_requests, total_displayed, total_selected
    - [ ] selection_rate, red_flag_trigger_rate
    - [ ] unverified_icd_avg_count, latency_p95_ms
    - [ ] feedback_total, override_rate, concordance_rate
    - [ ] must_not_miss_surfaced_count
  - [ ] `getCDSSEncounterSummaries(encounterIds[])` — per-encounter CDSS summary untuk Intelligence Dashboard
  - [ ] Session ID hashing (SHA-256, anonymous — tidak simpan ID asli)
  - [ ] `shouldUseDatabase()` gate — cek DATABASE_URL tersedia sebelum DB operations

- [ ] **format-adapter.ts** — Format adapter untuk backward compatibility
- [ ] **diagnose-parser.ts** — Input parser untuk /api/cdss/diagnose endpoint

---

### 1.2 Vitals Engine
*Lokasi: `src/lib/vitals/`*

- [ ] **unified-vitals.ts** — Single source of truth untuk vital signs schema
  - [ ] AVPU scale: A (Alert), C (Confusion/new), V (Voice), P (Pain), U (Unresponsive) + avpuLabels Indonesian
  - [ ] GCS schema (Zod): E(1-4) + V(1-5) + M(1-6), `calculateGCSTotal()`
  - [ ] Glucose types enum: GDS, GDP, 2JPP, HbA1c + glucoseSchema dengan validation (HbA1c ≤20%, others ≤999)
  - [ ] Plausibility bounds (sanity check, bukan clinical threshold): sbp(30-350), dbp(20-250), hr(20-250), rr(4-60), temp(25-45), spo2(50-100), painScore(0-10), gestationalWeek(1-45)
  - [ ] `unifiedVitalSignsSchema` (Zod, full validated): core NEWS2 + detail (GCS, painScore, capillaryRefillSec) + metabolic (glucose, weight, height) + context (isPregnant, gestationalWeek, hasCOPD, measurementTime) + DBP ≤ SBP cross-validation
  - [ ] `triageVitalSignsSchema` (Zod, lenient): backward compat dengan older Assist versions (avpu defaults to 'A')
  - [ ] `toCDSSVitalSigns()` — UnifiedVitalSigns → CDSS VitalSigns format (camelCase → snake_case)
  - [ ] `toTrajectoryVitals()` — UnifiedVitalSigns → Trajectory VisitRecord vitals (glucose defaults 0 jika tidak ada)
  - [ ] `fromLegacyCDSSVitals()` — legacy CDSS format → partial Unified (backward compat)
  - [ ] `calculateBMI(weightKg, heightCm)` → number | null
  - [ ] `calculateMAP(sbp, dbp)` → number (formula: dbp + (sbp-dbp)/3)
  - [ ] `calculatePulsePressure(sbp, dbp)` → number (sbp - dbp)

- [ ] **instant-red-alerts.ts** — 8-gate immediate bedside screening
  - [ ] GATE_1_VITALS:
    - [ ] Hipotensi absolut: SBP <90 (critical)
    - [ ] Diastolik rendah: DBP <60 (high)
    - [ ] Hipertensi krisis: SBP ≥180 atau DBP ≥120 (critical) → HTN_EMERGENCY vs HTN_URGENCY via htn-classifier
    - [ ] Hipotermia kritis: temp <35°C (critical)
    - [ ] Suhu subnormal: temp <36°C (high)
    - [ ] Demam tinggi: temp ≥38.3°C (high), ≥40°C (critical)
    - [ ] Bradikardia: HR <50 (high), <45 (critical)
    - [ ] Takikardia: HR >110 (high), ≥130 (critical)
  - [ ] GATE_2_HTN: integrasi htn-classifier dengan HMOD flags (chest pain, pulm edema, neuro deficit, vision changes, severe headache, oliguria, altered mental status)
  - [ ] GATE_3_GLUCOSE: hipoglikemia (GDS <70 high, <54 critical), HHS (≥600 critical), HYPERGLYCEMIC_CRISIS (DKA signs), hiperglikemia (≥200 high) + integrasi glucose-classifier + DKA/HHS flags inference
  - [ ] GATE_4_OCCULT_SHOCK:
    - [ ] MAP <65 (hipoperfusi, critical)
    - [ ] Shock Index (HR/SBP) >1 (high), >1.2 (critical)
    - [ ] Modified Shock Index (HR/MAP) >1.3 (high), >1.4 (critical)
    - [ ] Occult shock via occult-shock-detector (historical BP + symptoms)
    - [ ] Circulatory shock composite: SBP<90 OR MAP<65 OR SI>1 OR CRT>3 (critical)
  - [ ] GATE_5_SEPSIS:
    - [ ] qSOFA positif ≥2/3: RR≥22 + SBP≤100 + GCS<15 (atau AVPU≠A) — critical
    - [ ] SIRS positif ≥2: temp >38 atau <36 + HR>90 + RR>20 — severity tergantung konteks infeksi
  - [ ] GATE_6_RESPIRATORY:
    - [ ] SpO2 <90%: severe hypoxemia (critical)
    - [ ] SpO2 <94%: on O2 = critical; tidak on O2 = high; COPD target adjustment 88-92%
    - [ ] RR >22: tachypnea (high), >30 (critical)
    - [ ] RR <8: respiratory depression (critical)
    - [ ] Respiratory distress signs: keyword teks + structuredSigns (retraksi, otot bantu, sulit bicara, sianosis)
  - [ ] GATE_7_PEDIATRIC (5 age bands dengan specific cutoffs):
    - [ ] Infant <1yr: SBP floor ~70, HR 100-160, RR tachypnea >50
    - [ ] 3-6 bulan: SBP 70, HR 100-150, RR >45
    - [ ] 1-3 tahun: SBP 90, HR 80-125, RR >30
    - [ ] 6-12 tahun: SBP 100, HR 60-100, RR >22
    - [ ] 12-18 tahun: SBP 100, HR 60-100, RR >18
  - [ ] GATE_8_OBSTETRIC:
    - [ ] Pre-eklampsia berat/eklampsia iminen: hamil + SBP≥160 atau DBP≥110 (critical)
    - [ ] Hipotensi kehamilan: hamil + SBP<90 (critical)
    - [ ] Takikardia kehamilan: hamil + HR>120 (high)
  - [ ] Structured triage signs types: RespiratoryDistressSigns, PerfusionShockSigns, HMODRedFlags, DKAHHSRedFlags
  - [ ] `buildImmediateScreeningInputFromEmrPayload()` — normalize EMR payload ke ImmediateScreeningInput
  - [ ] `evaluateImmediateScreeningAlerts()` — main evaluator, returns ScreeningAlert[] sorted by severity
  - [ ] `evaluateScreeningAlertsFromEmrPayload()` — convenience wrapper dari raw EMR payload
  - [ ] `extractOccultShockHistory()` — extract HistoricalBP[] dari visit history JSON
  - [ ] `extractTriageSignalContext()` — extract AVPU, supplementalO2, hasCOPD, isPregnant, gestationalWeek
  - [ ] AVPU inference dari GCS total: GCS≤3→U, ≤8→P, ≤13→V, 14→C, 15→A
  - [ ] `inferHMODFlags()` — infer HMOD dari teks + structured signs + AVPU/GCS
  - [ ] `inferDkaHhsFlags()` — infer DKA/HHS dari teks + structured signs + glucose value
  - [ ] `gateFromPattern()` — map early warning pattern ID ke ScreeningAlertGate
  - [ ] `pushAlert()` — deduplicate alerts by ID, keep highest severity
  - [ ] Integration: `calculateNEWS2()` + `detectEarlyWarningPatterns()` dari cdss/ dijalankan di akhir pipeline

- [ ] **composite-deterioration.ts** — Multi-signal composite syndrome detection
  - [ ] Input: CompositeDeteriorationInput dengan:
    - [ ] current: CompositeVitalSnapshot (semua vitals + AVPU + supplementalO2 + glucose + CRT)
    - [ ] encounterBaseline: window pengukuran 2 jam (array CompositeVitalSnapshot)
    - [ ] personalBaseline: historical weighted baseline dari visit history
    - [ ] Patient context: age, gender, isPregnant, hasCOPD, medicalHistory, structuredSigns
  - [ ] Derived metrics computation:
    - [ ] MAP = dbp + (sbp-dbp)/3
    - [ ] pulsePressure = sbp - dbp
    - [ ] shockIndex = hr/sbp
    - [ ] modifiedShockIndex = hr/MAP
  - [ ] Delta calculations (encounter window vs personal baseline):
    - [ ] HR delta: valueDelta + percentDelta + source ('encounter_window'/'personal_baseline'/'none')
    - [ ] SpO2 delta (paling sensitif: ≥-3% dalam 2 jam)
    - [ ] SBP delta
    - [ ] Pulse pressure delta
  - [ ] Component scores (NEWS2-style per parameter): RR, SpO2 (COPD-aware Scale 2), HR, SBP, Temp, AVPU, shock index
  - [ ] **Composite Alerts (hard evidence, high/critical confidence)**:
    - [ ] `composite-sepsis-shock-pathway`: SI>0.9 + temp>38.1 + RR>20 → critical jika MAP<65/AVPU≠A/CRT>3/perfusion signs; high otherwise
    - [ ] `composite-respiratory-deterioration`: SpO2 delta ≤-3% (encounter window) + RR>24 → critical jika on O2/distress/AVPU≠A
    - [ ] `composite-neuro-intracranial` (Cushing's Triad): SBP>180 + HR<50 + PP>60 → critical jika neuro signs/AVPU≠A
    - [ ] `composite-silent-bleed-occult-shock`: HR delta ≥20% + PP<30 + SBP>100 → critical jika CRT>3/perfusion signs
  - [ ] **Watchers (low confidence, needs more data for confirmation)**:
    - [ ] `watcher-respiratory-deterioration`: RR>24 + (SpO2<94 OR distress) — belum ada 2hr SpO2 baseline
    - [ ] `watcher-silent-bleed-occult-shock`: PP<30 + SBP>100 + perfusion signs — belum ada HR baseline
  - [ ] Hard stop alerts dari instant-red-alerts → dipetakan ke CompositeHardStopAlert format
  - [ ] Data completeness tracking: requiredSignalsPresent[], missingSignals[], encounterTrendAvailable, personalBaselineAvailable
  - [ ] `appendIfUnique()` — deduplicate composite alerts by ID sebelum push
  - [ ] `evaluateCompositeDeterioration(input, immediateInput?)` — main evaluator
  - [ ] `evaluateCompositeDeteriorationFromEmrPayload(data)` — convenience wrapper dari raw EMR payload
  - [ ] `buildPersonalBaselineFromVisits()` — compute personal baseline dari visit history array
  - [ ] `normalizeEncounterBaseline()` — support multiple field name formats (encounterBaseline / encounterMeasurements / recentVitalsWindow)

- [ ] **avpu-gcs-mapper.ts** — AVPU ↔ GCS conversion
  - [ ] `avpuToNEWS2Score(avpu)` — A=0, others=3 per NEWS2 standard (parameter #6)
  - [ ] `assessConsciousnessSeverity(avpu, gcs?)` — unresponsive / severe / impaired / normal
  - [ ] `getBestGCSTotal(avpu, gcs?)` — prefer measured GCS total, fallback ke AVPU-estimated GCS

- [ ] **vital-record-service.ts** — Vital sign record persistence service
- [ ] **vital-record-utils.ts** — Utilities untuk vital record processing

---

### 1.3 NEWS2 Scoring Engine
*Lokasi: `src/lib/cdss/news2.ts`*

- [ ] `scoreRespiratoryRate(rr)` — ≤8=3, 9-11=1, 12-20=0, 21-24=2, ≥25=3
- [ ] `scoreSpO2Scale1(spo2)` — standard (non-COPD target ≥96%): ≤91=3, 92-93=2, 94-95=1, ≥96=0
- [ ] `scoreSpO2Scale2(spo2)` — COPD (hypercapnic target 88-92%): ≤83=3, 84-85=2, 86-87=1, 88-92=0, 93-94=1, 95-96=2, ≥97=3 (O2 berlebih pada COPD berbahaya — menekan hypoxic drive)
- [ ] `scoreSystolic(sbp)` — ≤90=3, 91-100=2, 101-110=1, 111-219=0, ≥220=3
- [ ] `scoreHeartRate(hr)` — ≤40=3, 41-50=1, 51-90=0, 91-110=1, 111-130=2, ≥131=3
- [ ] `scoreTemperature(temp)` — ≤35.0=3, 35.1-36.0=1, 36.1-38.0=0, 38.1-39.0=1, ≥39.1=2
- [ ] `scoreConsciousness(avpu)` — A=0, C/V/P/U=3 (parameter #6 NEWS2, sebelumnya MISSING di versi lama)
- [ ] `scoreSupplementalO2(onO2)` — Yes=+2, No=0 (adds to aggregate, bukan standalone parameter)
- [ ] Risk level determination: low (1-4 tanpa extreme single) / low_medium (extreme single param=3, atau score 1-4 dgn extreme) / medium (5-6) / high (≥7)
- [ ] `hasExtremeSingle` flag — any parameter scored 3 triggers low_medium minimum
- [ ] `calculateNEWS2(input)` — dual overload support:
  - [ ] Legacy: pass VitalSigns directly (5 params, no consciousness)
  - [ ] New format: pass NEWS2Input {vitals, avpu, supplementalO2, hasCOPD} — full 8 params
  - [ ] `isNEWS2Input()` type guard untuk distinguish formats
- [ ] Monitoring recommendation text per risk level
- [ ] Clinical response text per risk level
- [ ] `news2ToRedFlags(result)` — convert ke engine red_flags format (only medium+ risk generates flags)

---

### 1.4 Early Warning Patterns (Disease-Specific Detection)
*Lokasi: `src/lib/cdss/early-warning-patterns.ts`*

- [ ] `checkDengueShockPattern(input, v)`:
  - [ ] DHF_SHOCK_IMMINENT (emergency): konteks dengue (keyword) + defervescence temp 35.5-37.5°C + takikardia HR>100 + (hipotensi SBP<100 ATAU narrow PP ≤20mmHg). Lead time: 2-6 jam.
  - [ ] DHF_WARNING (urgent): konteks dengue + defervescence + takikardia (tanpa hipotensi). Lead time: 6-12 jam.
- [ ] `checkSepsisPattern(input, v, news2)`:
  - [ ] SEPSIS_QSOFA (emergency): qSOFA ≥2/3 — RR≥22 + SBP≤100 + GCS≤14 via AVPU. Lead time: sudah berlangsung.
  - [ ] SEPSIS_SIRS (urgent): SIRS ≥2 (temp>38/<36, HR>90, RR>20) + konteks infeksi keyword. Lead time: 5-48 jam.
  - [ ] SIRS_ELEVATED (warning): SIRS ≥2 + NEWS2 aggregate ≥4 tanpa konteks infeksi jelas.
- [ ] `checkRespiratoryDeterioration(input, v)`:
  - [ ] RESP_FAILURE_IMMINENT (emergency): konteks napas keyword + takipnea RR>24 + SpO2<94% + takikardia HR>100. Lead time: menit-jam.
  - [ ] RESP_DETERIORATION (urgent): konteks napas + 2 dari 3 kriteria (takipnea/SpO2<94/takikardia).
- [ ] `checkCardiovascularPattern(input, v)`:
  - [ ] ACS_SHOCK (emergency): nyeri dada keyword + takikardia + hipotensi. Lead time: menit.
  - [ ] ACS_HYPERTENSIVE (urgent): nyeri dada + SBP≥160 + takikardia.
  - [ ] HF_EXACERBATION (emergency/urgent): gagal jantung keyword + takipnea + takikardia (±SpO2<94 → emergency).
- [ ] `checkHemorrhagicShockPattern(input, v)`:
  - [ ] HEMORRHAGIC_SHOCK (emergency): konteks perdarahan/obstetri + takikardia berat HR>120 + hipotensi SBP<100.
  - [ ] HEMORRHAGIC_COMPENSATED (urgent): konteks perdarahan + takikardia + BELUM hipotensi (early detection — takikardia muncul SEBELUM sistolik turun). Lead time: 30 menit-2 jam.
- [ ] `checkPreeclampsiaPattern(input, v)`:
  - [ ] ECLAMPSIA_IMMINENT (emergency): wanita hamil + SBP≥160 atau DBP≥110 + gejala neurologis (sakit kepala hebat/pandangan kabur/kejang/dll). Lead time: menit-jam.
  - [ ] PREECLAMPSIA_WARNING (urgent): wanita hamil + SBP≥140 atau DBP≥90. Lead time: hari-minggu.
- [ ] `checkMalariaPattern(input, v)`:
  - [ ] MALARIA_SEVERE (emergency): konteks malaria keyword + (hipotermia ATAU takikardia+hipotensi ATAU SpO2<94%). Lead time: jam.
  - [ ] MALARIA_WORSENING (urgent): konteks malaria + demam ≥39°C + takikardia HR>110. Lead time: 6-24 jam.
- [ ] `detectEarlyWarningPatterns(input, news2)` — run semua 7 checkers, sort by severity (emergency → urgent → warning)
- [ ] `earlyWarningsToRedFlags(matches[])` — convert ke engine red_flags format dengan prefix "[Early Detection]"

---

### 1.5 Clinical Intelligence Engine
*Lokasi: `src/lib/clinical/`*

- [ ] **trajectory-analyzer.ts** — Clinical Trajectory Analyzer
  - [ ] 7 vital parameters: sbp, dbp, hr, rr, temp, glucose, spo2 (+AVPU dilacak Phase 1A)
  - [ ] MAX_VISITS = 5, MAX_ETA_HOURS = 168 (7 hari)
  - [ ] Normal ranges per parameter (FKTP 2024 + PERKENI 2024):
    - [ ] sbp: 90-139 mmHg, dbp: 60-89 mmHg
    - [ ] hr: 60-100 bpm, rr: 12-20 /mnt
    - [ ] temp: 36.1-37.5°C, glucose: 70-199 mg/dL, spo2: 96-100%
  - [ ] Critical thresholds: sbp(high 180/low 90), dbp(120/50), hr(140/45), rr(30/8), temp(40/35), glucose(400/54), spo2(low only: 90)
  - [ ] `detectTrend(values, range)` — regression slope + deviation delta scoring → improving/declining/stable/insufficient_data
  - [ ] `assessRisk(key, value)` — per-parameter: low/moderate/high/critical
  - [ ] `calculateDeviationScore(value, range)` — percent deviation dari normal range
  - [ ] `getVitalPriorityWeight(key)` — sbp/dbp/glucose=1.2, hr/rr/spo2=1.0, temp=0.85
  - [ ] `calculateEarlyWarningBurden(visits[])` — breach counting 5 kunjungan:
    - [ ] sbp_ge_160_count, temp_ge_38_5_count, gds_ge_300_count
    - [ ] hr_extreme_count, rr_extreme_count, spo2_lt_94_count
    - [ ] total_breaches_last5, breach_frequency
  - [ ] `calculateTrajectoryVolatility(vitalTrends, overallTrend, burden)`:
    - [ ] Coefficient of variation (CV) per parameter
    - [ ] Sign flips (directional reversals) — penalty 5 per flip
    - [ ] Burden penalty (2 per breach event, max 20)
    - [ ] volatility_index 0-100
    - [ ] stability_label: true_stable / pseudo_stable / unstable
  - [ ] `calculateAcuteAttackRisk24h(latestVisit, vitalTrends, burden)` — 5 syndrome risk scores (0-100):
    - [ ] hypertensive_crisis_risk: berbasis SBP/DBP value + trend + breach count
    - [ ] glycemic_crisis_risk: berbasis glucose value + trend + breach count
    - [ ] sepsis_like_deterioration_risk: temp>38.5 + HR>100 + RR≥22 + SBP≤100
    - [ ] shock_decompensation_risk: SBP<90 + HR>120 + RR extremes + temp<36
    - [ ] stroke_acs_suspicion_risk: SBP/DBP + STROKE_KEYWORDS + ACS_KEYWORDS keyword matching
  - [ ] `estimateTimeToCriticalForVital(visits[], key)` — linear extrapolation dari 2 data poin terakhir
  - [ ] `calculateTimeToCriticalEstimate(visits[])` — return per-parameter hours to critical: sbp/dbp/gds/temp/hr/rr/spo2
  - [ ] `seriesVolatility(values[])` — CV + sign flips per series
  - [ ] `deriveOverallTrend(vitalTrends, visitCount)` — weighted signal scoring (risk × priority × deviation delta)
  - [ ] `deriveOverallRisk(vitalTrends)` — max risk across all parameters
  - [ ] Global deterioration state: improving/stable/deteriorating/critical
  - [ ] Deterioration score formula (0-100): avgVitalRisk×60 + decliningCount×6 - improvingCount×4 + burden×3 + volatility×0.2 + acutePeak×0.15
  - [ ] Mortality proxy: score 0-100 (deteriorationScore×0.35 + acutePeak×0.35 + burden×0.15 + volatility×0.15 + shock/sepsis bonus 10)
  - [ ] Mortality tier: low (<25) / moderate (25-50) / high (50-75) / very_high (≥75)
  - [ ] Clinical urgency: ROUTINE 24H / REVIEW SAME DAY / URGENT <6H / EMERGENCY NOW
  - [ ] ClinicalSafeOutput: risk_tier, confidence (0.1-0.95), drivers (maks 6), missing_data[], recommended_action, review_window
  - [ ] Confidence calculation: vitalCoverage×0.45 + temporalDepth×0.25 + consistency×0.30 - missingPenalty
  - [ ] `extractConfirmedChronicDiagnoses(visits[])` — extract dari diagnoses (2x occurrence OR readable name validation) dengan dedup by disease_type
  - [ ] `analyzeTrajectory(visits[])` — main export, includes momentum via `computeMomentum()`
  - [ ] STROKE_KEYWORDS list + ACS_KEYWORDS list (bahasa Indonesia)

- [ ] **momentum-engine.ts** — Clinical Momentum Engine (velocity + acceleration dynamics)
  - [ ] `computeVelocity(valueBefore, valueAfter, intervalMs)` — delta/day (normalized by actual elapsed time, bukan visit count)
  - [ ] `computeVelocitySeries(visits[], param)` — velocity per interval, skip entries dengan value ≤0
  - [ ] `computeAcceleration(velocitySeries[])` — linear regression slope dari velocity series (null jika <2 data)
  - [ ] Param weights: sbp=1.3, dbp=1.1, hr=1.0, rr=1.0, temp=0.9, glucose=1.2, spo2=1.1
  - [ ] `getMaxExpectedVelocity(param)` — normalisasi: sbp=5, dbp=3, hr=5, rr=2, temp=0.3, glucose=30, spo2=1 units/day
  - [ ] `computeMomentumScore(params, convergenceScore, baselineParams)`:
    - [ ] velScore = min(abs(velocity)/maxExpected, 1.0)
    - [ ] accelBonus = 0.3 jika isAccelerating
    - [ ] devScore = min(abs(zScore)/3, 1.0) dari personal baseline
    - [ ] dirMultiplier = 1.0 jika worsening, 0.2 jika stable, 0 jika improving
    - [ ] convergenceMultiplier = 1 + convergenceScore × 0.25
  - [ ] Momentum levels (7 levels):
    - [ ] INSUFFICIENT_DATA: <2 kunjungan
    - [ ] PRELIMINARY: exactly 2 kunjungan (velocity ada, acceleration belum bisa dihitung)
    - [ ] STABLE: score rendah, tidak ada worsening
    - [ ] DRIFTING: score ≥15 ATAU worseningCount ≥1
    - [ ] ACCELERATING: isAcceleratingWorsening + score ≥20
    - [ ] CONVERGING: convScore ≥2 + accel ATAU convScore ≥3
    - [ ] CRITICAL_MOMENTUM: score ≥70 ATAU (convScore ≥3 + accel)
  - [ ] `buildNarrative(level, params, convergence)` — human-readable Indonesian per level
  - [ ] `computeMomentum(visits[])` — main export, returns MomentumAnalysis: level, score, params[], baseline, convergence, narrative, visitCount, isReliable (n≥3)

- [ ] **prediction-engine.ts** — Predictive Intelligence
  - [ ] Critical thresholds HIGH: sbp=180, dbp=120, hr=140, rr=30, temp=40, glucose=400
  - [ ] Critical thresholds LOW: sbp=90, hr=45, rr=8, temp=35, glucose=54, spo2=90
  - [ ] MAX_PREDICTION_DAYS = 90
  - [ ] `predictTimeToCritical(param)` — dual approach:
    - [ ] Linear: t = (threshold - current) / velocity
    - [ ] Quadratic (acceleration-adjusted): solve 0.5a×t² + v×t - delta = 0, ambil root terkecil positif yang valid
    - [ ] Best estimate: quadratic jika tersedia, else linear
    - [ ] Confidence interval: ±20% base + ×2 jika n<3 (sparse) + 30% jika |accel|>0.1
    - [ ] isReliable = n≥3 AND CI < 60% dari estimate
  - [ ] `detectTreatmentResponse(params[])` — split visits ke first half dan second half:
    - [ ] effective: velocity change ≥50% (berkurang)
    - [ ] partially_effective: 20-50% berkurang
    - [ ] ineffective: -10% to +20% (tidak berubah signifikan)
    - [ ] worsening: velocity meningkat >10% meskipun ada terapi
    - [ ] Minimum 4 kunjungan untuk analisis
  - [ ] `generateAlertDecision(momentumLevel, convergence)` — alert matrix:
    - [ ] DRIFTING: info (conv<2) / warning (conv≥2)
    - [ ] ACCELERATING: warning (conv<2) / urgent (conv≥2)
    - [ ] CONVERGING: urgent (conv<3) / critical (conv≥3)
    - [ ] CRITICAL_MOMENTUM: emergency
    - [ ] Pattern override: cardiovascular pattern → minimal urgent; sepsis_like → minimal urgent
    - [ ] shouldPush = ['urgent','critical','emergency'].includes(level)
    - [ ] cooldownKey = unique per patient + level + pattern (prevents duplicate alerts)
  - [ ] `runPredictionEngine(momentumLevel, params[], convergence)` — main export

- [ ] **convergence-detector.ts** — Multi-parameter simultaneous convergence
  - [ ] DANGER_DIRECTION per param: sbp/dbp/hr/rr/temp/glucose = 'up' (high is dangerous), spo2 = 'down' (low is dangerous)
  - [ ] `detectPattern(worseningSet)` — 6 recognized clinical patterns:
    - [ ] `cardiovascular`: SBP↑ + HR↑ + SpO2↓
    - [ ] `sepsis_like`: Temp↑ + HR↑ + RR↑
    - [ ] `hypertensive_crisis`: SBP↑ + DBP↑
    - [ ] `metabolic_crisis`: Glucose↑ + HR↑
    - [ ] `respiratory`: RR↑ + SpO2↓
    - [ ] `multi_system`: ≥4 parameters worsening simultaneously
  - [ ] shouldAlert trigger: convergenceScore ≥3 OR (score ≥2 AND pattern ≠ none)
  - [ ] `detectConvergence(trends[])` — main export: convergenceScore, worseningParams[], improvingParams[], pattern, narrative, shouldAlert
  - [ ] `isWorsening(param, velocity, threshold=0.1)` — classify direction accounting for inverted spo2

- [ ] **personal-baseline.ts** — Individual normal learning
  - [ ] DECAY_HALF_LIFE_DAYS = 30 — visits 30 hari lalu dapat weight ~0.32; 90 hari lalu ~0.03
  - [ ] `computeRecencyWeight(timestamp, referenceTime)` — exponential decay: weight = e^(-λ×ageDays), λ = ln(10)/30
  - [ ] `weightedMean(observations[])` — reliability weights formula
  - [ ] `weightedStdDev(observations[], mean)` — weighted variance formula
  - [ ] Deviation labels: within_baseline (<1.5σ) / mild_deviation (1.5-2.5σ) / significant_deviation (2.5-3.5σ) / extreme_deviation (>3.5σ)
  - [ ] MIN_VISITS_FOR_BASELINE = 2
  - [ ] `computePersonalBaseline(visits[], currentValues?, referenceTime?)` — main export
  - [ ] `checkBaselineDeviation(baseline, param, currentValue)` — spot check satu parameter

- [ ] **anamnesis-extractor.ts** — AI-powered anamnesis extraction
  - [ ] Extract structured clinical data dari free-text anamnesis pasien
  - [ ] Output menjadi input untuk trajectory context di CDSS engine

- [ ] **chronic-disease-classifier.ts** — ICD-10 code → ChronicDiseaseType mapping
  - [ ] `classifyChronicDisease(icd10)` — return {type, fullName} atau null

- [ ] **trajectory-alert-service.ts** — Alert service untuk trajectory momentum-based alerts
- [ ] **finalization-therapy-engine.ts** — Therapy finalization dan rekomendasi terapi akhir
- [ ] **formulary-resolver.ts** — Resolusi formularium obat dari diagnosis
- [ ] **manual-medication-suggestions.ts** — Manual medication suggestion rules untuk konteks tertentu

---

### 1.6 API Endpoints
*Lokasi: `src/app/api/`*

- [ ] **/api/cdss/diagnose** — Main CDSS diagnosis endpoint (CanonicalTriageRequest → ClinicalEngineOutput)
- [ ] **/api/cdss/autocomplete** — LLM-first symptom/diagnosis autocomplete (Gemini 2.0 Flash + DeepSeek fallback)
- [ ] **/api/cdss/symptoms** — Symptom suggestion (341 symptoms live dari KB)
- [ ] **/api/cdss/outcome-feedback** — Learning loop: dokter confirm/override pilihan diagnosis
- [ ] **/api/cdss/suggestion-selected** — Learning loop: dokter memilih suggestion dari daftar
- [ ] **/api/cdss/red-flag-ack** — Red flag acknowledgment gate
- [ ] **/api/cdss/quality-dashboard** — CDSS quality metrics endpoint
- [ ] **/api/clinical/anamnesis/extract** — AI anamnesis extraction + trajectory + momentum + prediction
- [ ] **/api/clinical/differential/evaluate** — Differential diagnosis evaluation (requires clinical role)
- [ ] **/api/clinical/engine/evaluate** — CanonicalTriageRequest → full ClinicalEngineOutput
- [ ] **/api/vitals/history** — Vital sign history retrieval per patient
- [ ] **/api/icdx/** — ICD-10 search
- [ ] **/api/emr/** — EMR CRUD operations
- [ ] **/api/patients/** — Patient management
- [ ] **/api/doctors/** — Doctor management
- [ ] **/api/institutions/** — Institution management
- [ ] **/api/staff/** — Staff management
- [ ] **/api/auth/** — Authentication (next-auth)
- [ ] **/api/admin/** — Admin operations
- [ ] **/api/consult/** — Consultation management
- [ ] **/api/crew/** — Crew access management
- [ ] **/api/dashboard/** — Dashboard aggregated data
- [ ] **/api/hub/** — Hub operations
- [ ] **/api/news/** — News/announcement feed
- [ ] **/api/notam/** — NOTAM (notices to airmen/medical notices)
- [ ] **/api/perplexity/** — Perplexity AI integration endpoint
- [ ] **/api/report/** — Report generation
- [ ] **/api/telemedicine/** — Telemedicine operations
- [ ] **/api/track-usage/** — Usage analytics tracking
- [ ] **/api/v1/** — V1 backward-compatible API endpoints
- [ ] **/api/voice/** — Voice interface backend
- [ ] **/api/dev-updates/** — Developer updates feed
- [ ] **/api/health/** — Service health check

---

### 1.7 EMR Page & Visualization Components
*Lokasi: `src/app/emr/`*

- [ ] **page.tsx** — Main EMR page
  - [ ] Scroll-driven 3-layer architecture: row1 (Intake), row2 (Review), row3 (Assessment)
  - [x] `activeViewPhase` state controls active layer
  - [x] Active layer: 100% opacity; inactive layers: 35% opacity via CSS
  - [x] **[PHASE C DONE] Emergency Override Layer:**
    - [x] Emergency terdeteksi → force `activeViewPhase = 'row1'`
    - [x] Semua layer non-emergency → class `.emr-phase.is-emergency-dimmed` (opacity 0.15)
    - [x] Visual pulse/glow animation merah di emergency layer
    - [x] Dokter WAJIB acknowledge sebelum override dibersihkan
    - [x] Connect `requiresEmergencyAck` ke override logic
- [ ] **ClinicalPrognosisChart.tsx** — Prognosis chart (5 canvas instances)
- [ ] **ClinicalTrajectoryChart.tsx** — Trajectory trend visualization
- [ ] **TrajectoryPanel.tsx** — Panel dengan momentum + convergence + prediction display
- [ ] **EMRTransferPanel.tsx** — EMR data transfer panel
- [ ] **TrustLayerGhost.tsx** — Trust layer ghost overlay untuk AI transparency

---

### 1.8 Standalone Library Modules
*Lokasi: `src/lib/`*

- [ ] **htn-classifier.ts** — Hypertension classifier (FKTP 2024)
  - [ ] BP_THRESHOLDS: NORMAL/ELEVATED/HTN_STAGE_1/HTN_STAGE_2/CRISIS constants
  - [ ] `classifyHypertension(session, hmodFlags?)` — full classification dengan session BP average
  - [ ] `triageHypertensiveCrisis(bp, hmodFlags)` — HTN_EMERGENCY vs HTN_URGENCY
  - [ ] `getHTNRecommendations(type, bp)` — rekomendasi per tipe krisis
  - [ ] HMODRedFlags interface: chest_pain, pulmonary_edema, neurological_deficit, vision_changes, severe_headache, oliguria, altered_mental_status

- [ ] **glucose-classifier.ts** — Glucose classifier (PERKENI 2024 + ADA 2026)
  - [ ] GLUCOSE_THRESHOLDS constants: EXTREME_HYPERGLYCEMIA(600), CRISIS(400), HYPOGLYCEMIA(70), SEVERE_HYPOGLYCEMIA(54)
  - [ ] `classifyBloodGlucose(data)` — full classification dengan context
  - [ ] `triageHyperglycemia(glucose, dkaHhsFlags)` — NORMAL/PREDIABETES/DIABETES/HYPERGLYCEMIC_CRISIS
  - [ ] DKAHHSRedFlags interface: kussmaul_breathing, acetone_breath, nausea_vomiting, abdominal_pain, altered_mental_status, severe_dehydration, extreme_hyperglycemia, seizures
  - [ ] GlucoseData interface: gds, sample_type, has_classic_symptoms
  - [ ] GlucoseMeasurementType: GDS/GDP/2JPP

- [ ] **occult-shock-detector.ts** — Occult shock detection (pre-hypotension)
  - [ ] Historical BP comparison: last 3 visits
  - [ ] Symptom scoring: dizziness, presyncope, syncope, weakness
  - [ ] `detectOccultShock(input)` — risk_level: LOW/MODERATE/HIGH/CRITICAL + triggers[] + recommendations[]

- [ ] **ttv-inference.ts** — TTV inference utilities
- [ ] **narrative-generator.ts** — Clinical narrative generator (rule-based anamnesis)
- [ ] **assistant-knowledge.ts** — Assistant knowledge base configuration
- [ ] **audrey-persona.ts** — Audrey AI persona definition
- [ ] **crew-access.ts** — Crew access control logic
- [ ] **crew-profile.ts** — Crew profile management
- [ ] **dev-updates.ts** — Developer updates content feed
- [ ] **format.ts** — Formatting utilities (dates, numbers, clinical values)
- [ ] **sanitize-url.ts** — URL sanitization utility
- [ ] **prisma.ts** — Prisma client singleton (with connection pooling)

---

### 1.9 Intelligence & Observability Layer
*Lokasi: `src/lib/intelligence/`*

- [ ] **ai-insights.ts** — AI insights generation
- [ ] **observability.ts** — Observability integration (metrics, traces)
- [ ] **runtime-observability.ts** — Runtime metrics collection
- [ ] **langfuse.config.ts** — Langfuse LLM tracing configuration
- [ ] **sentry.config.ts** — Sentry error tracking configuration
- [ ] **server.ts** — Intelligence server (Socket.IO bridge)
- [ ] **socket-bridge.ts** — Socket bridge untuk real-time updates
- [ ] **socket-payload.ts** — Socket payload types dan validation
- [ ] **disclosure.ts** — AI disclosure/transparency statements
- [ ] **types.ts** — Intelligence type definitions

---

### 1.10 App Routes (Pages)
*Lokasi: `src/app/`*

- [ ] **/** (page.tsx) — Landing/home page
- [ ] **/emr** — EMR main interface (section 1.7)
- [ ] **/dashboard** — Clinical intelligence dashboard
- [ ] **/acars** — ACARS real-time clinical intelligence alerts
- [ ] **/admin** — Admin panel
- [ ] **/audit** — Audit trail viewer
- [ ] **/calculator** — Clinical calculators (BMI, GFR, NEWS2, dll)
- [ ] **/chat** — AI chat interface
- [ ] **/critical-mind** — Critical mind clinical decision support
- [ ] **/hub** — Intelligence hub
- [ ] **/icdx** — ICD-10 search UI
- [ ] **/join** — Onboarding/join flow
- [ ] **/pasien** — Patient management UI
- [ ] **/report** — Report generation UI
- [ ] **/telemedicine** — Telemedicine interface
- [ ] **/voice** — Voice interface
- [ ] **/legal** — Legal/terms pages
- [ ] **layout.tsx** — Root layout
- [ ] **globals.css** — Global styles (termasuk scroll-driven layer classes + emergency override classes)

---

### 1.11 Components
*Lokasi: `src/components/`*

- [ ] **AppNav.tsx** — Navigation bar
- [ ] **AppFooter.tsx** — Footer
- [ ] **CrewAccessGate.tsx** — Role-based access gate component
- [ ] **ThemeProvider.tsx** — Theme provider
- [ ] **clinical/DrugStatusBadge.tsx** — Drug status badge component
- [ ] **features/audrey/** — Audrey AI feature components
- [ ] **features/icd/** — ICD feature components
- [ ] **features/trajectory/** — Trajectory visualization components
- [ ] **calculator/** — Calculator UI components
- [ ] **telemedicine/** — Telemedicine UI components
- [ ] **map/** — Map components
- [ ] **ui/** — Shared UI component library (shadcn-based)

---

### 1.12 Database Schema (Prisma)
*Lokasi: `prisma/`*

- [ ] **CDSSAuditLog** table: id, sessionHash (SHA-256), action, inputHash, outputSummary (JSON), modelVersion, latencyMs, validationStatus, metadata (JSON), timestamp
- [ ] **CDSSOutcomeFeedback** table: sessionHash, selectedIcd, selectedConfidence, finalIcd, outcomeConfirmed (bool|null), followUpNote, doctorUserId, overrideReason, metadata (JSON), timestamp
- [ ] Patient records
- [ ] Encounter records
- [ ] Vital signs records
- [ ] Doctor/staff records
- [ ] Institution records

---

## BAGIAN 2: SENTRA ASSIST (Browser Extension)

### 2.1 Emergency Detector — GATE v2
*Lokasi: `lib/emergency-detector/`*

- [ ] **gate-registry.ts** — 11 Clinical Gate ID constants:
  - [ ] `GATE_SEPSIS_EARLY` — Sepsis early detection
  - [ ] `GATE_SEPTIC_SHOCK_HIGH` — Septic shock high risk
  - [ ] `GATE_SHOCK_INDEX` — Hemodynamic instability
  - [ ] `GATE_RESP_FAILURE` — Respiratory failure
  - [ ] `GATE_PE_SUSPECT` — Pulmonary embolism suspect
  - [ ] `GATE_ACS` — Acute coronary syndrome
  - [ ] `GATE_STROKE` — Cerebrovascular accident
  - [ ] `GATE_ANAPHYLAXIS` — Anaphylaxis
  - [ ] `GATE_DKA_HHS` — DKA/HHS diabetic emergency
  - [ ] `GATE_RESP_ASTHMA_COPD` — Asthma/COPD exacerbation
  - [ ] `GATE_ANEMIA_BLEED_CHRONIC` — Anemia/chronic bleeding

- [ ] **clinical-patterns.ts** — 70 Clinical Patterns (CP-001 hingga CP-070):
  
  **GATE_SEPSIS_EARLY:**
  - [ ] CP-001: qSOFA ≥2 vitals only (RR≥22 + SBP≤100 + AVPU≠A), severity high, tier A, confidenceWeight 0.85
  - [ ] CP-002: qSOFA ≥2 + dugaan infeksi aktif (keyword), severity critical, tier B, PROTO_SEPSIS
  - [ ] CP-003: Demam ≥38 + HR>90 + RR≥20 (infeksi sistemik awal), severity warning, tier A
  - [ ] CP-004: Lansia ≥65 + HR>90 + RR≥22 + temp<38 (afebrile sepsis), severity warning, tier A, PROTO_SEPSIS
  - [ ] CP-005: Hipotermia <35°C + scored vital abnormal (HR>100/RR≥22/SBP≤100), severity high, tier A, PROTO_SEPSIS
  - [ ] CP-033: RR 22-24 + SpO2≥94% (RR meningkat ringan), severity warning, tier A, confidenceWeight 0.6
  - [ ] CP-034: HR 90-110 + SBP≥100 (takikardia ringan), severity warning, tier A, confidenceWeight 0.5
  - [ ] CP-036: AVPU≠A mendadak (KODE MERAH), severity critical, tier A
  - [ ] CP-037: SBP 90-100 + HR 100-110 + scored (SpO2 90-94/lemah/lansia), severity warning, tier A, confidenceWeight 0.6
  - [ ] CP-038: min 3 dari 4: RR≥24/HR≥110/SBP<100/SpO2<94% (deteriorasi progresif), severity warning, tier A, confidenceWeight 0.7
  - [ ] CP-040: Demam + RR<22 + HR<100 + SBP≥100 (infeksi ringan tanpa red flag), severity warning, tier A, confidenceWeight 0.5
  - [ ] CP-041: Demam + RR 20-24 + HR>90 + SBP≥100, severity warning, tier A
  - [ ] CP-044: Lansia + lemah + min 2 dari (HR>90/RR≥20/SBP<110), severity warning, tier B, confidenceWeight 0.6
  - [ ] CP-045: Demam ≥38 + HR>90 (meningitis/ensefalitis context), severity critical, tier A, confidenceWeight 0.65
  - [ ] CP-046: Demam + HR>100 + SBP<100 (sepsis meningokokus/purpura), severity critical, tier A, PROTO_SEPSIS
  - [ ] CP-064: Lansia + bingung/disorientasi (delirium akut, vital hampir normal), severity high, tier B

  **GATE_SEPTIC_SHOCK_HIGH:**
  - [ ] CP-006: RR≥22 (qSOFA) + scored (SBP<90/MAP<65), severity critical, tier A, PROTO_SHOCK
  - [ ] CP-007: Perubahan mental + RR≥22 + HR>100 (sepsis berat), severity critical, tier B, PROTO_SEPSIS
  - [ ] CP-046: (juga di atas — demam + petekie + HR>100 + SBP<100), severity critical, tier A

  **GATE_SHOCK_INDEX:**
  - [ ] CP-008: Shock Index (HR/SBP) 0.9-1.0, severity warning, tier A, confidenceWeight 0.95
  - [ ] CP-009: Shock Index 1.0-1.2, severity high, tier A, PROTO_SHOCK, confidenceWeight 0.95
  - [ ] CP-010: Shock Index ≥1.2, severity critical, tier A, PROTO_SHOCK, confidenceWeight 0.95
  - [ ] CP-011: HR≥120 + SBP 60-100, severity critical, tier A, PROTO_SHOCK
  - [ ] CP-035: HR<50 + scored (pusing/lemas/sinkop/SBP<100), severity high, tier A
  - [ ] CP-047: Dengue berat: demam + HR>100 + perdarahan + scored (SBP<100/RR≥22), severity critical, tier B, PROTO_SHOCK
  - [ ] CP-055: HR>100 + nyeri perut + scored (SBP<100/pucat), severity high, tier B
  - [ ] CP-056: Hamil + nyeri perut + perdarahan (KET/abortus), severity critical, tier B, PROTO_SHOCK
  - [ ] CP-062: HR>120 (thyroid storm context), severity warning, tier A, confidenceWeight 0.5

  **GATE_RESP_FAILURE:**
  - [ ] CP-012: RR≥30 + SpO2<90% + tidak on O2, severity critical, tier A, PROTO_RESP_FAILURE
  - [ ] CP-013: RR≥25 + SpO2<94%, severity high, tier A, PROTO_RESP_FAILURE
  - [ ] CP-014: RR≥25 + scored (sulit bicara/otot bantu/SpO2<92%), severity critical, tier B, PROTO_RESP_FAILURE
  - [ ] CP-015: RR≥24 + SpO2<94% + AVPU≠A (trias 3 jelek), severity critical, tier A, PROTO_CARDIAC_ARREST
  - [ ] CP-043: RR 8-12 + AVPU turun + scored SpO2<94% (depresi napas obat), severity high, tier A, PROTO_RESP_FAILURE
  - [ ] CP-057: Anak + SpO2<94% + retraksi dada, severity critical, tier B, PROTO_RESP_FAILURE
  - [ ] CP-068: RR 8-12 + AVPU turun (overdosis borderline), severity high, tier A, PROTO_RESP_FAILURE
  - [ ] CP-069: Demam + sesak + RR>20 (epiglotitis/obstruksi laring), severity critical, tier B, PROTO_RESP_FAILURE

  **GATE_PE_SUSPECT:**
  - [ ] CP-016: Sesak mendadak + RR>20 + HR>90 + SpO2<94%, severity high, tier B
  - [ ] CP-017: Sesak mendadak + faktor risiko PE + HR>90 + scored (SpO2<94/SBP<90), severity critical, tier B, PROTO_RESP_FAILURE
  - [ ] CP-049: Nyeri dada pleuritik + RR>20 + HR>90 + tidak demam, severity warning, tier B, confidenceWeight 0.6
  - [ ] CP-050: Hamil/postpartum + sesak + scored (nyeri dada/HR>100/RR>20), severity high, tier B

  **GATE_ACS:**
  - [ ] CP-018: Nyeri dada + scored (durasi≥20min/HR>100/SBP<90/diaphoresis/sesak), severity critical, tier B, PROTO_ACS
  - [ ] CP-019: HR>90 + SBP≥160 + nyeri dada (ACS hipertensif), severity high, tier B, PROTO_ACS
  - [ ] CP-020: Nyeri dada atipikal + vital normal, severity warning, tier B, confidenceWeight 0.6
  - [ ] CP-048: AVPU≠A + muntah + scored (HR<60/SBP>160) (TIK meningkat/trauma kepala), severity critical, tier B
  - [ ] CP-060: Kelemahan tungkai + onset mendadak (cauda equina syndrome), severity high, tier B, confidenceWeight 0.5
  - [ ] CP-063: Pusing/mau pingsan + scored (HR>100/nyeri dada/sinkop) (aritmia), severity warning, tier B, confidenceWeight 0.55
  - [ ] CP-065: Usia 10-25yr + sinkop (pingsan saat olahraga — HCM/channelopathy), severity high, tier B
  - [ ] CP-067: Nyeri dada/punggung mendadak + SBP>140 (diseksi aorta), severity critical, tier B, PROTO_ACS

  **GATE_STROKE:**
  - [ ] CP-021: Defisit neurologis fokal + onset mendadak (FAST), severity critical, tier B, PROTO_STROKE
  - [ ] CP-022: Defisit neurologis + SBP>160 (stroke+hipertensi), severity critical, tier B, PROTO_STROKE
  - [ ] CP-023: SBP>140 + muntah + onset mendadak (thunderclap headache/SAH), severity critical, tier B, PROTO_STROKE
  - [ ] CP-048: AVPU≠A + muntah + scored (HR<60/SBP>160) (TIK meningkat)

  **GATE_ANAPHYLAXIS:**
  - [ ] CP-024: Paparan alergen + kulit/mukosa + scored kompromi (sesak/SpO2<94/SBP<90/HR>120), severity critical, tier B, PROTO_ANAPHYLAXIS
  - [ ] CP-025: Paparan alergen + kulit/mukosa TANPA kompromi (watch for escalation), severity warning, tier B, confidenceWeight 0.65

  **GATE_DKA_HHS:**
  - [ ] CP-026: Glucose≥250 + RR≥22 + scored (Kussmaul/GI/HR>100), severity critical, tier B, PROTO_DKA_HHS
  - [ ] CP-027: Glucose≥600 (HHS threshold langsung), severity critical, tier A, PROTO_DKA_HHS
  - [ ] CP-028: Glucose≥200 + min 2 dari (Kussmaul/muntah/poliuria/lemas) — early DKA, severity high, tier B
  - [ ] CP-054: Known DM + Glucose≥250 + Kussmaul, severity critical, tier C, PROTO_DKA_HHS
  - [ ] CP-061: Glucose<70 + AVPU≠A (hipoglikemia berat dengan penurunan kesadaran), severity critical, tier A, PROTO_HYPOGLYCEMIA

  **GATE_RESP_ASTHMA_COPD:**
  - [ ] CP-029: Wheezing + sesak + scored (RR≥24/SpO2<94%), severity high, tier B, PROTO_RESP_FAILURE
  - [ ] CP-030: Sesak + scored (sulit bicara/otot bantu/SpO2<92%) — status asthmaticus/silent chest, severity critical, tier B, PROTO_RESP_FAILURE
  - [ ] CP-052: Known asthma + sesak + RR≥24, severity high, tier C, PROTO_RESP_FAILURE
  - [ ] CP-053: Known COPD + sesak + RR≥24 (target SpO2 88-92%), severity high, tier C, PROTO_RESP_FAILURE
  - [ ] CP-058: Anak/remaja + wheezing + sulit bicara/menangis, severity high, tier B, PROTO_RESP_FAILURE

  **GATE_ANEMIA_BLEED_CHRONIC:**
  - [ ] CP-031: HR>100 + scored (pucat/lemas/riwayat perdarahan), severity warning, tier B
  - [ ] CP-032: HR>110 + SBP<100 + scored anemia signs (anemia berat dengan syok), severity high, tier B, PROTO_SHOCK

  **Tier C patterns (butuh additional UI inputs, belum fully active):**
  - [ ] CP-039: Pneumonia ringan/moderat (demam + RR 20-24 + SpO2≥94%), severity warning
  - [ ] CP-042: Kejang demam (temp≥38.5 + kejang), severity high
  - [ ] CP-051: Sepsis pada DM (known DM + qSOFA partial), severity high, PROTO_SEPSIS
  - [ ] CP-059: Neutropenic sepsis (kanker + temp≥37.8 + lemas), severity high, confidenceWeight 0.55
  - [ ] CP-066: Infeksi jaringan dalam pada DM (luka+DM), severity warning, confidenceWeight 0.6
  - [ ] CP-070: Clinical concern/"gut feeling" klinisi, severity warning, tier C, confidenceWeight 0.7

- [ ] **action-protocols.ts** — 9 ABCDE Emergency Action Protocols:
  - [ ] PROTO_RESP_FAILURE: Gagal Napas Akut
    - [ ] A: jalan napas, head tilt-chin lift, posisi lateral jika muntah
    - [ ] B: semi-fowler, O2 6-10L/menit, nebulizer bronkodilator
    - [ ] C: cek nadi/TD/CRT, aktivasi paket syok jika perlu
    - [ ] other: monitor, panggil dokter, rujuk emergensi IGD
    - [ ] Rujuk jika: SpO2 tetap <90% setelah O2, RR tetap ≥30, silent chest, penurunan kesadaran
  - [ ] PROTO_SHOCK: Syok
    - [ ] A: jalan napas, posisi supinasi + elevasi kaki (kecuali trauma)
    - [ ] B: O2 6-10L/menit
    - [ ] C: Trendelenburg, hentikan perdarahan luar, infus NaCl 0.9%/RL
    - [ ] Rujuk jika: SBP tetap <90, MAP tetap <65, penurunan kesadaran, perdarahan tidak terkontrol
  - [ ] PROTO_SEPSIS: Sepsis Berat/Early
    - [ ] A/B/C/D: jalan napas, O2, cek BP ulang, cek gula darah
    - [ ] other: cairan IV jika hipoperfusi, dokter review, jangan pulangkan
    - [ ] Rujuk jika: SBP ≤100 persisten, AVPU≠A, qSOFA ≥2
  - [ ] PROTO_ANAPHYLAXIS: Anafilaksis
    - [ ] A: nilai jalan napas, posisi duduk tegak jika ada angioedema
    - [ ] B: O2 6-10L/menit
    - [ ] C: Adrenalin IM 0.3-0.5mg (dewasa), infus NaCl/RL
    - [ ] Rujuk SEMUA kasus (risiko biphasic 8-12 jam)
  - [ ] PROTO_ACS: ACS/Infark Miokard
    - [ ] NO berjalan/berdiri, O2 jika SpO2<94%, pantau BP/HR
    - [ ] Aspirin sesuai PPK jika tidak kontraindikasi
    - [ ] Rujuk SEMUA kasus ke RS dengan cath lab
  - [ ] PROTO_STROKE: Stroke
    - [ ] Catat waktu onset (last known well), O2 jika hipoksia
    - [ ] Kepala 30° jika kesadaran turun, NO turunkan BP agresif
    - [ ] Rujuk SEMUA kasus SEGERA (time critical)
  - [ ] PROTO_DKA_HHS: DKA/Hiperosmolar
    - [ ] Cairan NaCl 0.9%, NO insulin mandiri di FKTP
    - [ ] Rujuk SEMUA kasus ke RS dengan ICU
  - [ ] PROTO_HYPOGLYCEMIA: Hipoglikemia Sedang-Berat
    - [ ] Oral glucose jika bisa minum, IV glucose jika tidak
    - [ ] Observasi + ulang gula darah, rujuk jika tidak membaik/penyebab tidak jelas
  - [ ] PROTO_CARDIAC_ARREST: Cardiac Arrest
    - [ ] Aktifkan SPGDT/EMS + AED segera, mulai CPR
    - [ ] Lanjut hingga bantuan datang

- [ ] **pattern-engine.ts** — Pattern evaluator engine
  - [ ] Evaluasi `requiredCriteria[]` (AND logic — semua harus true)
  - [ ] Evaluasi `scoredCriteria[]` (OR-counted — minimal minScore harus true)
  - [ ] Operator support: gte, lte, gt, lt, eq, neq, between, true, false
  - [ ] Field resolver: nested field access (vitals.sbp, derived.map, patient.avpuManual, symptoms.*, history.*)
  - [ ] Derived values computation: shockIndex (HR/SBP), MAP (dbp + (sbp-dbp)/3)
  - [ ] Multi-gate evaluation: return all matching patterns sorted by severity

- [ ] **pattern-types.ts** — TypeScript type definitions: ClinicalPattern, ScoredCriterion, RequiredCriterion, operator types

- [ ] **symptom-signals.ts** — Symptom NLP Indonesia (negation-aware)
  - [ ] Negation handling: "tidak demam", "tidak sesak", "tanpa nyeri", dll
  - [ ] Bahasa Indonesia symptom extraction dari free text anamnesis
  - [ ] Symptom signal mapping ke clinical concepts yang digunakan oleh pattern-engine

- [ ] **clinical-snapshot.ts** — Clinical snapshot builder dari TTV + anamnesis data
- [ ] **htn-classifier.ts** — HTN classifier (shared dengan Dashboard)
- [ ] **glucose-classifier.ts** — Glucose classifier (shared dengan Dashboard)
- [ ] **occult-shock-detector.ts** — Occult shock detector (versi lokal Assist)
- [ ] **ttv-inference.ts** — TTV inference (symptom → estimated vital range estimate)
- [ ] **narrative-generator.ts** — Narrative generator rule-based untuk otomasi anamnesis text

---

### 2.2 Iskandar Diagnosis Engine V1 (LOCAL — STATUS: FROZEN untuk offline fallback saja)
*Lokasi: `lib/iskandar-diagnosis-engine/`*

- [ ] **engine.ts** — V1 engine orchestrator (FROZEN — jangan update lagi)
- [ ] **diagnosis-algorithm.ts** — Core diagnosis algorithm (keyword/IDF-based scoring)
- [ ] **differential-diagnosis.ts** — Differential diagnosis builder lokal
- [ ] **symptom-matcher.ts** — Symptom matching dengan IDF scoring
- [ ] **llm-reasoner.ts** — V1 LLM reasoner (superseded by Dashboard V2)
- [ ] **pharmacotherapy-reasoner.ts** — Drug recommendation engine **[MIGRATE TO DASHBOARD]**
  - [ ] Rekomendasi obat berbasis diagnosis + kontraindikasi pasien
  - [ ] Integration dengan dosage-database.ts
  - [ ] pharmacotherapy-reasoner.test.ts: test suite
- [ ] **ddi-checker.ts** — Drug-Drug Interaction checker **[MIGRATE TO DASHBOARD]**
  - [ ] 173.000 drug interaction pairs
  - [ ] Severity levels: minor / moderate / major / contraindicated
  - [ ] Input: list obat aktif → output: interaction pairs + max severity
- [ ] **epidemiology-weights.ts** — Puskesmas epidemiology priors **[MIGRATE TO DASHBOARD]**
  - [ ] Regional disease prevalence data untuk Indonesia Puskesmas context
  - [ ] Adjust prior probability differential diagnosis berdasarkan epidemiology lokal
- [ ] **red-flags.ts** — Red flag detection V1
- [ ] **traffic-light.ts** — Traffic Light Safety Gate (8 deterministic escalation-only rules)
  - [ ] Rule 1: KB Red Flags → escalate to YELLOW
  - [ ] Rule 2: Rujukan criteria (kompetensi ≠ 4A) → escalate to YELLOW
  - [ ] Rule 3: Low confidence (<30%) → escalate to YELLOW
  - [ ] Rule 4: Extreme age (<2yr atau >70yr) + acute symptoms → escalate to RED
  - [ ] Rule 5: No KB match → escalate to YELLOW
  - [ ] Rule 6: DDI severity major/contraindicated → escalate to RED
  - [ ] Rule 7: Cardiometabolic cluster ≥2 NCD candidates (I10, E11, E10, I25, I50, E78) → escalate to YELLOW
  - [ ] Rule 8: Acute-on-chronic (acute symptoms + known chronic ICD match + red flags) → escalate to RED
  - [ ] Escalation-only principle: GREEN→YELLOW→RED (NEVER downgrades)
  - [ ] Output: TrafficLightOutput {level, reason, gateResults[], overrideApplied}
- [ ] **anonymizer.ts** — **MANDATORY PII strip middleware (TETAP di Assist)**
  - [ ] Strip semua PII (nama, NIK, alamat, tanggal lahir exact) sebelum setiap Dashboard API call
  - [ ] TIDAK BOLEH BYPASS atau dilewati
  - [ ] Harus selalu jadi layer pertama sebelum data keluar ke server
- [ ] **audit-logger.ts** — Audit logging untuk V1 engine operations
- [ ] **chronic-disease-classifier.ts** — (same as Dashboard version)
- [ ] **visit-history-store.ts** — IndexedDB store untuk visit history (browser-side persistence)
- [ ] **get-suggestions-flow.ts** — Complete suggestions flow orchestration dengan error handling
- [ ] **validation/** — Input validation subdirectory
- [ ] **index.ts** — Public module exports

---

### 2.3 Clinical Library
*Lokasi: `lib/clinical/`*

- [ ] **dosage-database.ts** — Dosage Database FKTP **[MIGRATE TO DASHBOARD]**
  - [ ] Formularium FKTP nasional Indonesia
  - [ ] Dosis per obat per kondisi klinis
  - [ ] Integration dengan DosageCalculator.tsx

- [ ] **canonical-triage-builder.ts** — Canonical triage request builder
  - [ ] `buildCanonicalTriageRequest()` — dari raw TTV + anamnesis → CanonicalTriageRequest format
  - [ ] canonical-triage-builder.test.ts

- [ ] **anamnesa-composer.ts** — Anamnesis composition dari input fields terstruktur
  - [ ] anamnesa-composer.test.ts

- [ ] **vital-autocomplete.ts** — Smart autocomplete untuk vital sign input fields
  - [ ] vital-autocomplete.test.ts

- [ ] **vital-screening-thresholds.ts** — Age-based vital screening profiles **[MIGRATE TO DASHBOARD]**
  - [ ] 7 cohorts: infant (<1yr), toddler (1-3yr), preschool (4-5yr), school_age (6-12yr), adolescent (13-17yr), adult (18-64yr), older_adult (≥65yr)
  - [ ] Per cohort: hypotensionSbpFloor, bradycardiaThreshold, tachycardiaThreshold, bradypneaThreshold, tachypneaThreshold, severeHypertensionSbp, severeHypertensionDbp
  - [ ] Pediatric hypotension formula: <1yr=70, 1-10yr=(70+2×age), >10yr=90
  - [ ] Geriatric extras: geriatricSingleFeverThreshold (37.8°C), geriatricRepeatFeverThreshold (37.2°C), temperatureNote, orthostaticNote
  - [ ] `getVitalScreeningProfile(age)` — main export
  - [ ] vital-screening-thresholds.test.ts

- [ ] **autosen-types.ts** — AutoSen type definitions
- [ ] **tenaga-medis.ts** — Healthcare worker type definitions dan utilities
- [ ] **aassist-v2/** — AssistV2 subdirectory

---

### 2.4 UI Components — Clinical
*Lokasi: `components/clinical/`*

- [ ] **BPMeasurementWizard.tsx** — Guided BP measurement UX **[MIGRATE CONCEPT TO DASHBOARD]**
  - [ ] Multi-step wizard untuk pengukuran tekanan darah yang benar
  - [ ] Session averaging (3 measurements recommended → average)
  - [ ] Per-step guidance: istirahat 5 menit, posisi duduk, lengan setara jantung, dll

- [ ] **ClinicalAlert.tsx** — Clinical alert display component
  - [ ] Render ScreeningAlert dengan severity-based styling (critical/high/warning)
  - [ ] Action recommendations expandable display

- [ ] **ClinicalDifferential.tsx** — Differential diagnosis display UI
  - [ ] Ranked DDx list dengan confidence meter per item
  - [ ] ClinicalDifferential.helpers.test.ts

- [ ] **ClinicalTrajectory.tsx** — Trajectory display component
- [ ] **CTHeader.tsx** — Clinical Trajectory header component

- [ ] **DiagnosisSuggestions.tsx** — Diagnosis suggestions list component
  - [ ] DiagnosisSuggestions.test.tsx

- [ ] **DosageCalculator.tsx** — Dosage calculator UI **[MIGRATE TO DASHBOARD]**
  - [ ] Integration dengan dosage-database.ts
  - [ ] Kalkulasi dosis per berat badan (pediatri)
  - [ ] DosageCalculator.test.tsx

- [ ] **HTNCrisisTriage.tsx** — HTN crisis triage display component
  - [ ] HTN_EMERGENCY vs HTN_URGENCY classification display
  - [ ] HTNCrisisTriage.test.tsx

- [ ] **Hypoglycemia1515Timer.tsx** — Hypoglycemia 15-15 rule timer **[MIGRATE TO DASHBOARD]**
  - [ ] Countdown timer 15 menit setelah pemberian 15g fast carbohydrate
  - [ ] Visual guided steps dengan timer display
  - [ ] Re-check blood glucose reminder dengan audio/visual notification

- [ ] **OccultShockDetector.tsx** — Occult shock alert display
- [ ] **PatientHeader.tsx** — Patient demographic information header
- [ ] **ResepForm.tsx** — Digital prescription form **[MIGRATE TO DASHBOARD]**
  - [ ] Drug search dengan autocomplete
  - [ ] Dosis, frekuensi, durasi, rute pemberian
  - [ ] Integration dengan dosage-database.ts + DDI checker sebelum submit

- [ ] **SettingsConsole.tsx** — Extension settings console UI
- [ ] **TTVInferenceUI.tsx** — TTV inference display UI
  - [ ] `buildAlerts()` function — existing GATE_0 through GATE_7 alerts (legacy system, pre-Gate v2)
  - [ ] TTVInferenceUI.test.tsx

- [ ] **Wizard.tsx** — Generic multi-step wizard component
- [ ] **index.ts** — Barrel exports

---

### 2.5 UI Components — CDSS
*Lokasi: `components/cdss/`*

- [ ] **CDSSWidget.tsx** — Main CDSS widget wrapper
- [ ] **CDSSDisclaimer.tsx** — "Ini adalah alat bantu klinis, bukan pengganti keputusan dokter" disclaimer
- [ ] **ConfidenceMeter.tsx** — Visual confidence percentage meter (0-100%)
- [ ] **DiagnosisCard.tsx** — Individual diagnosis suggestion display card
- [ ] **RedFlagAlert.tsx** — Red flag alert display component
- [ ] **index.ts** — Barrel exports

---

### 2.6 Sidepanel Components
*Lokasi: `components/sidepanel/`*

- [ ] **SidePanelHeader.tsx** — Header dengan logo, status, dan connection indicator
- [ ] **SidePanelFooter.tsx** — Footer dengan version dan credits
- [ ] **DashboardView.tsx** — Main dashboard view dalam sidepanel
- [ ] **ConsoleLogin.tsx** — Login screen untuk extension
- [ ] **CreditsView.tsx** — Credits dan about view
- [ ] **PowerButton.tsx** — On/off power toggle untuk extension

---

### 2.7 Extension Architecture (Browser Extension Specific)
*Lokasi: `entrypoints/`*

- [ ] **background.ts** — Service worker (persistent background script)
  - [ ] Message handling antara content scripts, sidepanel, dan popup
  - [ ] chrome.tabs, chrome.runtime event listeners
  - [ ] Communication relay antara DOM layer dan React sidepanel
- [ ] **content.ts** — Content script yang diinjeksi ke halaman aktif
  - [ ] DOM access untuk RME scraping ePuskesmas
  - [ ] Message relay ke background service worker
- [ ] **inject.content.ts** — Inject content script utility
- [ ] **sidepanel/main.tsx** — Sidepanel React app entry point
- [ ] **sidepanel/index.html** — Sidepanel HTML host
- [ ] **login/** — Login flow entrypoint

---

### 2.8 Infrastructure Modules
*Lokasi: `lib/`*

- [ ] **settings-store.ts** — Extension settings store (Zustand/persistent storage)
  - [ ] Dashboard URL configuration
  - [ ] API key management (untuk local mode)
  - [ ] User preferences
- [ ] **store.ts** — Main app state store
  - [ ] TTV current values
  - [ ] Patient data state
  - [ ] Current alerts state
  - [ ] Engine output state
- [ ] **theme-store.ts** — Theme/UI state management
  - [ ] theme-store.test.ts
- [ ] **utils.ts** — General utilities (formatting, parsing, helpers)

---

### 2.9 RME Scraper (Chrome Extension Specific — TETAP di Assist)
*Lokasi: `lib/rme/` + `lib/scraper/`*

- [ ] ePuskesmas SIMRS DOM scraper
  - [ ] Extract patient demographics (nama, tanggal lahir, NIK, JKN number)
  - [ ] Extract visit history (tanggal kunjungan, diagnoses ICD-10, vital signs)
  - [ ] Extract current medications list
  - [ ] Handle berbagai versi SIMRS ePuskesmas yang berbeda
- [ ] Visit history normalizer → format untuk occult shock + trajectory analysis

---

### 2.10 API & Filler
*Lokasi: `lib/api/` + `lib/filler/`*

- [ ] **api/** — API client untuk Dashboard calls **[PHASE 2 — BELUM ADA]**
  - [ ] `dashboard-api-client.ts` — thin client dengan anonymizer middleware
  - [ ] Call `/api/cdss/diagnose`, `/api/clinical/anamnesis/extract`, dll.
- [ ] **filler/** — Form auto-fill utilities untuk ePuskesmas forms

---

### 2.11 Handlers
*Lokasi: `lib/handlers/`*

- [ ] Message handlers untuk browser extension inter-process communication

---

### 2.12 Data Files
*Lokasi: `data/`*

- [ ] Symptom reference data files
- [ ] Local disease reference data (offline subset of KB)

---

## BAGIAN 3: CROSS-APP FEATURE COMPARISON

### 3.1 Features Overlap — Dashboard Superior

| Fitur | Dashboard | Assist | Verdict |
|-------|-----------|--------|---------|
| LLM Diagnosis Engine | V2: DeepSeek Reasoner + Gemini fallback + circuit breaker | V1: older LLM reasoner | DB wins — keep DB version |
| HTN Classifier | FKTP 2024 + HMOD flags + full emergency/urgency triage | FKTP 2024 basic | DB wins |
| Glucose Classifier | PERKENI 2024 + ADA + full DKA/HHS flags | PERKENI 2024 | DB wins |
| Occult Shock | Encounter window HR delta + PP + CRT + structured signs | Historical BP comparison + symptoms | DB wins |
| qSOFA | 3/3 criteria + GCS≤14 Phase 1A fix | 3/3 via avpuManual | Both correct |
| Trajectory Analyzer | 7 vitals + AVPU + EarlyWarningBurden | 5 vitals, basic | DB wins |
| Chronic Disease Classifier | + confirmed 2x occurrence validation | Basic | DB wins |
| Pediatric thresholds | 5 systematic age bands | Individual patterns | DB wins |
| Dengue Shock | Pattern: defervescence + PP narrowing | CP-047 gate | Both excellent |
| Composite Deterioration | 4 syndromes + watchers + encounter window | None | DB unique |
| Personal Baseline | Exponential decay Z-score | None | DB unique |
| Momentum Engine | Velocity + acceleration + convergence | None | DB unique |
| Prediction Engine | Linear + quadratic TTC + treatment response | None | DB unique |
| NEWS2 | Complete 8 params + SpO2 Scale 2 COPD | Not implemented | DB unique |
| Learning Loop | Outcome feedback + concordance tracking | None | DB unique |

### 3.2 Features HANYA di Assist — WAJIB Migrate ke Dashboard

| # | Feature | Source File di Assist | Migration Priority | Status |
|---|---------|----------------------|--------------------|--------|
| 1 | 70 Clinical Patterns GATE v2 | `lib/emergency-detector/clinical-patterns.ts` | CRITICAL | ADAPTER PARITY DONE — `packages/symphony/src/adapters/assist-patterns-parity.ts` |
| 2 | 11 GATE IDs baru | `lib/emergency-detector/gate-registry.ts` | CRITICAL | BELUM |
| 3 | 9 ABCDE Action Protocols | `lib/emergency-detector/action-protocols.ts` | HIGH | BELUM |
| 4 | Symptom NLP Indonesia (negation-aware) | `lib/emergency-detector/symptom-signals.ts` | HIGH | BELUM |
| 5 | Pattern Engine evaluator | `lib/emergency-detector/pattern-engine.ts` | HIGH | BELUM |
| 6 | Dosage Database FKTP | `lib/clinical/dosage-database.ts` | HIGH | BELUM |
| 7 | DDI Checker 173K | `lib/iskandar-diagnosis-engine/ddi-checker.ts` | HIGH | BELUM |
| 8 | Epidemiology Weights Puskesmas | `lib/iskandar-diagnosis-engine/epidemiology-weights.ts` | MEDIUM | BELUM |
| 9 | Pharmacotherapy Reasoner | `lib/iskandar-diagnosis-engine/pharmacotherapy-reasoner.ts` | MEDIUM | BELUM |
| 10 | Traffic Light Safety Gate | `lib/iskandar-diagnosis-engine/traffic-light.ts` | EVALUATE | BELUM |
| 11 | Age-based vital screening (7 cohorts) | `lib/clinical/vital-screening-thresholds.ts` | MEDIUM | BELUM |
| 12 | Hypoglycemia 15-15 Timer UI | `components/clinical/Hypoglycemia1515Timer.tsx` | MEDIUM | BELUM |
| 13 | BP Measurement Wizard UI | `components/clinical/BPMeasurementWizard.tsx` | LOW | BELUM |
| 14 | TTV Inference (symptom→vital estimate) | `lib/emergency-detector/ttv-inference.ts` | EVALUATE | BELUM |
| 15 | ResepForm (digital prescription) | `components/clinical/ResepForm.tsx` | LOW | BELUM |

### 3.3 Features HANYA di Assist — TETAP di Assist

| Feature | File | Alasan Tidak Dipindah |
|---------|------|-----------------------|
| **Anonymizer (PII strip)** | `lib/iskandar-diagnosis-engine/anonymizer.ts` | MANDATORY client-layer middleware sebelum Dashboard API — tidak boleh di server |
| **RME Scraper ePuskesmas** | `lib/rme/` + `lib/scraper/` | Chrome extension DOM — tidak bisa dijalankan dari server |
| **Doctor Picker + Forward** | sidepanel UI | Core Assist thin-client UX flow |
| **TTV Input Form** | sidepanel UI | Keyboard-first vital input optimized untuk Puskesmas setting |
| **Local Engine V1** | `lib/iskandar-diagnosis-engine/engine.ts` | FROZEN — offline fallback only, tidak pernah di-update lagi |
| **Background Service Worker** | `entrypoints/background.ts` | Chrome extension architecture, tidak ada analog di server |
| **Content Script** | `entrypoints/content.ts` | Chrome extension DOM injection, tidak ada analog di server |

---

## BAGIAN 4: CRITICAL GAPS — FITUR YANG BELUM DIIMPLEMENTASI

### 4.1 Emergency Override Layer di Dashboard (Phase C DONE)
*Target files: `src/app/emr/page.tsx` + `src/app/globals.css`*

- [x] Emergency detected dari CDSS/composite engine → trigger override mechanism
- [x] Force `activeViewPhase = 'row1'` (Intake layer) saat emergency ada
- [x] CSS class `.emr-phase.is-emergency-dimmed` di globals.css: opacity 0.15 (bukan 35%)
- [x] CSS animation: visual pulse/glow merah di emergency row
- [x] ACK gate: `requiresEmergencyAck === true` tersambung ke existing ACK system
- [x] Dokter WAJIB acknowledge dulu sebelum override state dibersihkan

### 4.2 Platform Thin Client di Assist (Phase A.3 base client selesai; route replacement pending)
*Canonical target file: `apps/healthcare/sentra-assist/lib/api/platform-api-client.ts` + `pii-guard.ts`. Wording lama `dashboard-api-client.ts` superseded kecuali Chief meminta compatibility alias.*

- [x] Buat `platform-api-client.ts` dengan integrasi `pii-guard.ts` sebagai mandatory middleware
- [ ] Replace emergency-detector local calls → `/api/cdss/diagnose` (8-gate server-side)
- [ ] Replace trajectory analyzer local → `/api/clinical/anamnesis/extract`
- [ ] Replace CDSS V1 keyword autocomplete → `/api/cdss/autocomplete` (LLM-first V2)
- [ ] Graceful error handling + fallback ke local engine jika Dashboard tidak reachable

### 4.3 PE Suspect Gate di Dashboard (Phase A DONE via SYMPHONY safety-gates adapter)
- [x] `GATE_PE_SUSPECT` surfaced via `src/lib/cdss/symphony-safety-gates.ts` and CDSS red-flag merge pipeline
- [x] Tambahkan: sesak mendadak + Wells criteria faktor risiko (imobilisasi, post-op, kanker, DVT/PE history, kehamilan)
- [x] Tambahkan: PE postpartum pattern

### 4.4 Anaphylaxis Gate di Dashboard (Phase A DONE via SYMPHONY safety-gates adapter)
- [x] `GATE_ANAPHYLAXIS` surfaced via `src/lib/cdss/symphony-safety-gates.ts` and CDSS red-flag merge pipeline
- [x] Tambahkan: paparan alergen + kulit/mukosa + kompromi respirasi/kardiovaskular
- [x] Tambahkan: adrenalin protocol recommendation

### 4.5 Aortic Dissection Pattern di Dashboard (GAP — sering miss di primer)
- [ ] CP-067 equivalent belum ada di Dashboard
- [ ] Nyeri dada/punggung mendadak + SBP>140 + sudden onset
- [ ] Rujuk ke RS dengan imaging (CT aorta)

### 4.6 Quality Dashboard UI (Backend sudah ada, UI belum)
- [ ] UI untuk visualisasi CDSSQualityMetrics
- [ ] Charts untuk: selection_rate, concordance_rate, override_rate, latency P95, must_not_miss surfaced count
- [ ] Time range filter (7 days / 14 days / 30 days)

---

## BAGIAN 5: EVIDENCE BASE & CLINICAL GUIDELINES YANG DIIMPLEMENTASIKAN

- [ ] NEWS2 — Royal College of Physicians UK, 2017 (complete 8 parameters)
- [ ] qSOFA — Sepsis-3 (Singer M, et al. JAMA 2016;315:801-810)
- [ ] Surviving Sepsis Campaign 2021
- [ ] FKTP 2024 — Pedoman Tatalaksana Hipertensi di FKTP Indonesia
- [ ] PERKENI 2024 — Konsensus diabetes, hipoglikemia, DKA/HHS
- [ ] ADA Standards of Care 2026 — Glucose management
- [ ] AHA/ACC STEMI & ACS Guidelines 2021
- [ ] AHA/ASA Stroke Guidelines + PERDOSSI
- [ ] WHO Emergency Triage Guidelines
- [ ] WHO Dengue Guidelines 2009 (defervescence phase recognition)
- [ ] WHO Malaria Treatment Guidelines 2022
- [ ] ACOG Guidelines (obstetrics — preeclampsia/eclampsia/obstetric emergencies)
- [ ] POGI Guidelines (Indonesian obstetrics society)
- [ ] GINA Guidelines (asthma management)
- [ ] GOLD Guidelines (COPD management)
- [ ] ATLS Guidelines (hemorrhagic shock)
- [ ] EAACI 2021 (anaphylaxis)
- [ ] IDAI Guidelines (Indonesian pediatric society — febrile seizure, pneumonia)
- [ ] MSF Clinical Guidelines (shock, emergency protocols)
- [ ] PMK 47/2018 (Indonesian emergency protocol regulation)
- [ ] Wells Criteria (pulmonary embolism probability)
- [ ] AHA BLS Guidelines 2020 (cardiac arrest CPR)
- [ ] NICE Neutropenic Sepsis Guidelines
- [ ] Ben Ida et al. "Adaptive vital signs monitoring" (IET Smart Cities, 2021) — NEWS2 validation

---

## QUICK REFERENCE: STATUS KESELURUHAN

### Intelligence Dashboard — Completed Features
- [x] CDSS Engine V2 (DeepSeek Reasoner → Gemini 2.5 Flash-Lite + circuit breaker)
- [x] NEWS2 Complete (8 params + COPD SpO2 Scale 2 + supplemental O2)
- [x] Instant Red Alerts (8 gates: vitals/HTN/glucose/shock/sepsis/resp/pediatric/obstetric)
- [x] Composite Deterioration (4 syndromes: sepsis/resp/Cushing/occult-shock + watchers)
- [x] Trajectory Analyzer (7 vitals + AVPU + EarlyWarningBurden)
- [x] Momentum Engine (velocity + acceleration + 7 levels)
- [x] Prediction Engine (linear + quadratic TTC + treatment response)
- [x] Convergence Detector (6 patterns + shouldAlert)
- [x] Personal Baseline (exponential decay Z-score)
- [x] Learning Loop (outcome feedback + quality dashboard metrics)
- [x] EMR Scroll-Driven 3-Layer UI
- [x] 10 Chart Instances (Prognosis/Trajectory/Vital/Momentum/Risk/Panel)
- [x] Intelligence Layer (Socket.IO + Langfuse + Sentry)
- [x] **Emergency Override Layer — DONE di Dashboard Phase C**
- [x] **PE Suspect Gate — DONE di SYMPHONY/Dashboard Phase A**
- [x] **Anaphylaxis Gate — DONE di SYMPHONY/Dashboard Phase A**
- [x] **70 Clinical Patterns dari Assist — ADAPTER PARITY DONE di SYMPHONY Phase B**

### Sentra Assist — Completed Features
- [x] 70 Clinical Patterns GATE v2 (CP-001 to CP-070)
- [x] 11 Clinical Gate IDs
- [x] 9 ABCDE Action Protocols
- [x] Anonymizer PII Strip (mandatory middleware)
- [x] DDI Checker 173K interactions
- [x] Dosage Database FKTP
- [x] Pharmacotherapy Reasoner
- [x] Traffic Light Safety Gate (8 rules)
- [x] Age-based vital screening (7 cohorts)
- [x] RME Scraper ePuskesmas (DOM)
- [x] Hypoglycemia 15-15 Timer
- [x] BP Measurement Wizard
- [x] ResepForm (digital prescription)
- [x] TTV Inference
- [x] Symptom NLP Indonesia (negation-aware)
- [x] **Platform API Client + PII guard — DONE (Phase A.3; route replacement masih pending)**

---

*Dokumen ini dibuat oleh Sentra21052010 berdasarkan deep-dive code analysis tanggal 2026-04-18.*
*Total features inventoried: ~250+ individual features, functions, dan types across both applications.*
*Ini adalah kerja 11 bulan Chief — jangan pernah kehilangan satu item pun.*
*Sebelum menghapus atau memodifikasi fitur manapun, konfirmasi eksplisit dari Chief terlebih dahulu.*
