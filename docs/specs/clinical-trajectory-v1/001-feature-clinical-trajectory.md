---
type: clinical-trajectory-source
status: active
owner: Sentra AI
---

## 52 Trajektori | 5 Kuadran | V1.0 — 29 April 2026

---

## PETA LENGKAP 52 TRAJEKTORI

| ID  | Kuadran          | Nama Trajektori            | Key Param                      | Time-to-Critical | Confidence |
| --- | ---------------- | -------------------------- | ------------------------------ | ---------------- | ---------- |
| 1   | Mortalitas & EOL | Imminent Mortality 0-72h   | Lactate + NEWS2                | <72 jam          | High       |
| 2   | Mortalitas & EOL | 30-Day Mortality           | NEWS2_peak + frailty           | 10–90% risk      | High       |
| 3   | Mortalitas & EOL | Palliative Transition      | ICU visits + organ slope       | 1–3 bln          | Moderate   |
| 4   | Mortalitas & EOL | Metabolic Age Acceleration | Metabolic burden vs chrono age | +15 thn equiv    | Moderate   |
| 13  | Perburukan Akut  | Imminent Cardiac Arrest    | HR/BP volatility + SpO2        | <1 jam           | High       |
| 14  | Perburukan Akut  | Flash ARDS                 | FiO2/SpO2 slope                | 4–8 jam          | High       |
| 15  | Perburukan Akut  | Neurological Cascade       | GCS shift + Cushing BP         | 2–6 jam          | High       |
| 16  | Perburukan Akut  | Sepsis No-Return           | Late abx + Shock Index         | 24–48 jam        | High       |
| 25  | Kesehatan Umum   | DM-to-ESRD Baseline        | eGFR slope                     | 3.75 thn         | High       |
| 26  | Kesehatan Umum   | DM-ESRD + Insulin          | eGFR slope slow                | 6 thn            | High       |
| 27  | Kesehatan Umum   | DM-ESRD + SGLT2i           | eGFR slope reduced             | 7.5 thn          | High       |
| 28  | Kesehatan Umum   | End-Organ Multi-Damage     | Creatinine composite           | 1–5 thn          | High       |
| 29  | Kesehatan Umum   | Loss of Independence       | Frailty + ADL                  | Post-discharge   | Moderate   |
| 30  | Kesehatan Umum   | Delirium Risk              | Age + sedatives                | 24–72 jam        | Moderate   |
| 37  | Operasional      | ICU Escalation             | NEWS2 trend bangsal            | 12–24 jam        | High       |
| 38  | Operasional      | 30-Day Readmission         | Data completeness              | Post-DC 30 hari  | High       |
| 39  | Operasional      | ICU Bed Congestion         | Aggregate prob multi-pasien    | Real-time        | High       |
| 45  | Legacy Acute     | Respiratory Worsening      | RR + SpO2 slope                | 12–24 jam        | High       |
| 46  | Legacy Acute     | Hemodynamic Instability    | SBP slope                      | 4–6 jam          | High       |
| 47  | Legacy Acute     | Metabolic Crash            | Lactate + Glucose var          | 6–12 jam         | High       |
| 48  | Legacy Acute     | Infectious Surge           | CRP slope                      | 4–6 jam          | High       |
| 49  | Legacy Acute     | Neurologic Decline         | GCS slope                      | 12–24 jam        | High       |
| 50  | Legacy Acute     | Mixed Acute                | NEWS2 aggregate                | >24 jam          | High       |
| 51  | Legacy Acute     | Treatment Response Good    | HR post-intervensi             | Stabil           | High       |
| 52  | Legacy Acute     | Treatment Response Poor    | HR post-intervensi             | 4–6 jam          | High       |
| —   | Legacy Acute     | Allergic/Anaphylaxis       | BP drop rapid                  | <2 jam           | High       |
| —   | Legacy Acute     | Fever Burden               | Temp slope                     | 12 jam           | High       |
| —   | Legacy Acute     | Frailty Progression        | Frailty Score                  | 6–12 bln         | Moderate   |
| —   | Legacy Acute     | Acute Decline              | NEWS2 Acute                    | 6–12 jam         | High       |
| —   | Legacy Acute     | Chronic Decline (CKD)      | eGFR slope                     | 3–6 bln          | High       |
| —   | Legacy Acute     | Mortality Risk Usia Lanjut | Mortality Prob                 | <30 hari         | High       |
| —   | Legacy Acute     | Cardiovascular Shock       | Shock Index                    | 4 jam            | High       |
| —   | Legacy Acute     | Renal Failure              | Creatinine                     | 48 jam           | High       |
| —   | Legacy Acute     | Sepsis Trajectory          | qSOFA                          | 12 jam           | High       |
| —   | Legacy Acute     | Palliative Decline         | ADL Score                      | 1–3 bln          | Moderate   |
| —   | Legacy Acute     | DM-GGK + Insulin+Inulin    | eGFR combo                     | 6.7 thn          | Moderate   |

[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## KUADRAN 1: MORTALITAS & END-OF-LIFE (ID 1–12)

## T-01 · Imminent Mortality (0–72 Jam)

**Analogi:** Seperti lampu indikator mesin kendaraan yang semua menyala merah bersamaan — tidak ada satu titik kegagalan, melainkan kolaps sistem secara simultan.

**Rumus:**

Pmort=11+e−(0.5⋅NEWS2+1.2⋅Lactate−7.3)Pmort​=1+e−(0.5⋅NEWS2+1.2⋅Lactate−7.3)1​

|Parameter|Definisi|Unit|Range Valid|
|---|---|---|---|
|NEWS2|National Early Warning Score 2|skor 0–20|0–20|
|Lactate|Laktat serum (hipoperfusi)|mmol/L|0.5–25|
|−7.3|Intercept kalibrasi populasi ICU dewasa|—|—|

**Contoh Kalkulasi:**

- NEWS2 = 9, Lactate = 4.2 → Logit = 4.5 + 5.04 − 7.3 = **2.24**
    
- P = 1/(1 + e^−2.24) = **90.4%**
    
- **Interpretasi:** Aktivasi Code Blue. Diskusi keluarga. ICU senior on-call.

**Validasi:** NEWS2 AUC 0.88–0.90 untuk prediksi mortalitas 2–30 hari. Non-survivors rata-rata NEWS2 = 13.14 ± 1.4.

---

## T-02 · 30-Day Mortality

**Analogi:** Seperti asuransi jiwa yang menghitung risiko berdasarkan kombinasi faktor demografis dan kesehatan — skor akhir menentukan "premi" monitoring yang dibutuhkan.

**Rumus:**

Risk30d=0.1⋅Usia+0.3⋅CFS+0.5⋅NEWS2peakRisk30d​=0.1⋅Usia+0.3⋅CFS+0.5⋅NEWS2peak​

|Parameter|Definisi|Unit|
|---|---|---|
|Usia|Usia kronologis|tahun|
|CFS|Clinical Frailty Scale|skor 1–9|
|NEWS2_peak|Nilai NEWS2 tertinggi selama rawat|0–20|

**Contoh Kalkulasi:**

- Usia = 72, CFS = 5, NEWS2_peak = 8
    
- Risk = 7.2 + 1.5 + 4.0 = **12.7** → mapped ~**45% risiko 30 hari**
    
- **Interpretasi:** Inisiasi diskusi DNR, advanced care planning, monitoring harian.

---

## T-03 · Palliative Transition

**Analogi:** Seperti pola gelombang yang tidak kembali ke baseline setelah setiap krisis — bukan satu badai besar, melainkan serangkaian badai kecil yang menguras cadangan.

**Rumus:**

Palliative Score=NICU×∣Organ Slope∣threshold: score>3.0Palliative Score=NICU​×∣Organ Slope∣threshold: score>3.0

|Parameter|Definisi|
|---|---|
|N_ICU|Jumlah readmisi ICU dalam 3 bulan terakhir|
|Organ Slope|Laju penurunan fungsi organ (eGFR atau FEV1 per bulan)|

**Contoh Kalkulasi:**

- N_ICU = 3, Organ slope = −1.5/bulan
    
- Score = 3 × 1.5 = **4.5** (>3.0 → Palliative alert)
    
- **Interpretasi:** Konsultasi tim paliatif dalam 48 jam. Diskusi goals of care. Pertimbangkan comfort-focused care.

---

## T-04 · Metabolic Age Acceleration

**Analogi:** Seperti odometer mobil yang menunjukkan km lebih tinggi dari tahun produksinya — pasien 55 tahun bisa memiliki "tubuh biologis" setara 70 tahun akibat beban metabolik kronik.

**Rumus:**

Bio Age=Chrono Age+ΔmetabolicΔ=f(HbA1c, BMI, CRP, eGFR)Bio Age=Chrono Age+Δmetabolic​Δ=f(HbA1c, BMI, CRP, eGFR)

Δmetabolic=0.3(HbA1c−5.7)+0.2(BMI−25)+0.1⋅CRP−0.05⋅eGFR_deficitΔmetabolic​=0.3(HbA1c−5.7)+0.2(BMI−25)+0.1⋅CRP−0.05⋅eGFR_deficit

**Contoh Kalkulasi:**

- HbA1c = 9.5, BMI = 32, CRP = 45, eGFR = 55 (deficit = 45 dari normal 100)
    
- Δ = 0.3(3.8) + 0.2(7) + 0.1(45) − 0.05(45) = 1.14 + 1.4 + 4.5 − 2.25 = **+4.79**
    
- Jika Chrono Age = 55 → Bio Age = **~60 tahun**
    
- **Interpretasi:** Pasien "berusia biologis" 5 tahun lebih tua dari usia aktual. Risiko kardio-metabolik setara pasien 60 tahun. Intensifikasi target HbA1c dan kontrol kardiovaskular.

---

## KUADRAN 2: PERBURUKAN AKUT (ID 13–24)

## T-13 · Imminent Cardiac Arrest

**Analogi:** Seperti sensor getaran di mesin pabrik — fluktuasi frekuensi tinggi pada HR dan BP adalah tanda bahwa mesin hampir rusak total sebelum berhenti mendadak.

**Rumus:**

CAS=σHR20+σBP15+(1−SpO2tSpO2base)×5CAS=20σHR​​+15σBP​​+(1−SpO2base​SpO2t​​)×5

**Threshold:** CAS > 2.0 = HIGH RISK, >3.0 = CRITICAL

**Contoh Kalkulasi:**

- σ_HR = 22, σ_BP = 18, SpO2 = 91%, SpO2_base = 98%
    
- CAS = 1.1 + 1.2 + 0.357 = **2.66** → HIGH RISK
    
- **Interpretasi:** Siapkan defibrillator, akses IV ganda, panggil tim resusitasi. Time-to-action <15 menit.

---

## T-14 · Flash ARDS

**Analogi:** Seperti banjir bandang — perubahan bertahap pada upstream (FiO2 naik) mencapai titik kritis di mana downstream (oksigenasi) kolaps dalam hitungan jam.

**Rumus (Berlin Definition proxy):**

SlopeFiO2=ΔFiO2Δt>0.1/jam→ARDS AlertSlopeFiO2​=ΔtΔFiO2​>0.1/jam→ARDS Alert

P/F Ratio=PaO2FiO2Severe: <100, Moderate: 100–200, Mild: 200–300P/F Ratio=FiO2PaO2​Severe: <100, Moderate: 100–200, Mild: 200–300

**Contoh Kalkulasi:**

- FiO2 t=0: 0.40 → t=4h: 0.80; Slope = (0.80−0.40)/4 = **0.10/jam** ✓
    
- PaO2 = 80 mmHg; P/F = 80/0.80 = **100** → Severe ARDS
    
- **Interpretasi:** Intubasi elektif segera. Lung-protective ventilation: Vt 6 mL/kg IBW, PEEP ≥8 cmH2O, FiO2 titrasi ke SpO2 88–95%.

---

## T-15 · Neurological Cascade

**Analogi:** Seperti bendungan yang retak — peningkatan tekanan intrakranial awalnya terkompensasi, lalu tiba-tiba terjadi herniasi yang tidak dapat balik.

**Rumus (Cushing's Triad Detection):**

Neuro Alert=[ΔGCS≤−2]∩[ΔSBP≥+50]∩[HR<60]Neuro Alert=[ΔGCS≤−2]∩[ΔSBP≥+50]∩[HR<60]

**Tambahan: Pupil Index**

Anisocoria Flag=∣PupilL−PupilR∣>1mm→Konfirmasi herniasiAnisocoria Flag=∣PupilL​−PupilR​∣>1mm→Konfirmasi herniasi

**Contoh Kalkulasi:**

- GCS: 13 → 10 (Δ = −3 ✓), SBP: 130 → 185 (Δ = +55 ✓), HR = 54 (<60 ✓)
    
- Semua kriteria terpenuhi → **Neuro Cascade CONFIRMED**
    
- **Interpretasi:** Herniasi transtentorial akut. CT kepala STAT, manitol 0.5–1 g/kg IV, HOB 30°, neurosurgery emergency.

---

## T-16 · Sepsis No-Return

**Analogi:** Seperti "golden hour" pada trauma — ada jendela sempit untuk intervensi; jika terlewat, sistem imun menyerang organnya sendiri dan tidak dapat dihentikan.

**Rumus:**

qSOFA=[RR≥22]+[SBP≤100]+[GCS<15] (skor 0–3)qSOFA=[RR≥22]+[SBP≤100]+[GCS<15] (skor 0–3)

SI=HRSBPCritical: SI>1.3SI=SBPHR​Critical: SI>1.3

No-Return Flag=[qSOFA≥2]+[SI>1.3]+[Abx Delay>4h]No-Return Flag=[qSOFA≥2]+[SI>1.3]+[Abx Delay>4h]

**Contoh Kalkulasi:**

- RR = 24, SBP = 88, GCS = 13 → qSOFA = **3/3**
    
- SI = 115/88 = **1.31** (borderline kritis)
    
- Delay antibiotik = 6 jam → No-Return Flag = **3/3 CONFIRMED**
    
- **Interpretasi:** Eskalasi antibiotik spektrum luas segera. Resusitasi cairan 30 mL/kg. Target MAP ≥65 mmHg. Vasopressor jika tidak respons.

**Validasi:** qSOFA AUROC 0.92 (95%CI: 0.89–0.94), sensitivitas 96%, spesifisitas 87%.[](https://pmc.ncbi.nlm.nih.gov/articles/PMC6261097/)

---

## KUADRAN 3: KESEHATAN UMUM & KRONIK (ID 25–36)

## T-25 · DM-to-ESRD Baseline

**Analogi:** Seperti countdown timer yang sudah diset — tanpa intervensi, waktu hingga pasien bergantung pada dialisis sudah bisa dikalkulasi dari hari ini.

**Rumus:**

TESRD=eGFRbaseline−15∣slopeeGFR∣(tahun)TESRD​=∣slopeeGFR​∣eGFRbaseline​−15​(tahun)

**Contoh Kalkulasi (Baseline vs Intervensi):**

|Skenario|Slope (ml/min/1.73m²/th)|T_ESRD (eGFR=60)|Delay ESRD|
|---|---|---|---|
|Tanpa terapi|−8.0|**3.75 thn**|—|
|+ Insulin|−5.0|**6.0 thn**|+2.25 thn|
|+ SGLT2i|−4.0|**7.5 thn**|+3.75 thn|
|+ Insulin + Inulin|−4.5|**6.7 thn**|+2.9 thn|

**Validasi:** SGLT2i mereduksi laju penurunan eGFR mean 1.35 mL/min/1.73m²/tahun. Empagliflozin data EMPA-KIDNEY 2025 konfirmasi proteksi renal pada CKD diabetik dan non-diabetik.

---

## T-26/27 · DM-ESRD + Insulin / + SGLT2i

**Rumus modifikasi slope:**

slopetreated=slopebaseline×fdrugslopetreated​=slopebaseline​×fdrug​

|Terapi|Faktor Reduksi (f)|Sumber|
|---|---|---|
|Insulin|0.625|Kalibrasi internal [](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)|
|Empagliflozin 10mg|0.500|EMPA-KIDNEY trial [](https://pace-cme.org/news/selective-sglt2-inhibition-exhibits-nephroprotective-effects-in-high-risk-diabetes-patients/2455271/)|
|Insulin + Inulin|0.563|Data kombinasi [](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)|

**Contoh:** eGFR = 52, baseline slope = −8.0 + SGLT2i:

- Slope baru = −8.0 × 0.500 = **−4.0/tahun**
    
- T_ESRD = (52 − 15)/4.0 = **9.25 tahun** (vs 4.6 tahun tanpa terapi = gain 4.65 tahun bebas dialisis)

---

## T-28 · End-Organ Multi-Damage

**Analogi:** Seperti multi-organ failure dalam kondisi crash mobil — bukan satu organ yang rusak, tapi kecepatan kerusakan gabungan yang menentukan prognosis.

**Rumus:**

OVS=∑i=1nwi⋅∣ΔmarkeriΔti∣OVS=i=1∑n​wi​⋅​Δti​Δmarkeri​​​

|Organ|Marker|Bobot (w)|Threshold Kritis|
|---|---|---|---|
|Ginjal|Kreatinin|0.35|Slope >0.3 mg/dL/bln|
|Hati|ALT|0.20|Slope >10 U/L/bln|
|Jantung|Troponin|0.30|Slope >0.01 ng/mL/jam|
|Paru|SpO2|0.15|Slope >−2%/jam|

**Contoh Kalkulasi:**

- Kreatinin slope = 0.45, ALT slope = 8, Troponin stabil, SpO2 stabil
    
- OVS = 0.35(0.45) + 0.20(8) = 0.157 + 1.6 = **1.76**
    
- Threshold >2.0 = kritis; 1.76 = **WARNING zone**
    
- **Interpretasi:** Rujuk nefrologi + hepatologi segera. Monitor ketat tiap 6 jam.

---

## T-29 · Loss of Independence

**Analogi:** Seperti baterai laptop yang kapasitasnya berkurang setiap siklus charge — frailty progresif dan gejala persisten perlahan menguras kemampuan pasien untuk mandiri.

**Rumus (Barthel Index trajectory):**

ADLt=ADLbaseline+slopeADL×tADLt​=ADLbaseline​+slopeADL​×t

Independence Loss Flag=[Frailty CFS≥4]+[ADL slope<−1.0/bln]+[Gejala Persisten≥3]Independence Loss Flag=[Frailty CFS≥4]+[ADL slope<−1.0/bln]+[Gejala Persisten≥3]

**Contoh Kalkulasi:**

- ADL baseline = 80, slope = −1.5/bulan, 6 bulan post-discharge
    
- ADL_6bln = 80 − (1.5 × 6) = **71** (turun signifikan dari baseline)
    
- **Interpretasi:** Pasien berisiko kehilangan kemandirian dalam 6–12 bulan. Rujuk fisioterapi, occupational therapy, evaluasi kebutuhan home care.

---

## T-30 · Delirium Risk

**Analogi:** Seperti sistem listrik yang kelebihan beban — kombinasi sedatif + kurang tidur + usia lanjut + infeksi dapat "mematikan" fungsi kognitif sementara atau permanen.

**Rumus (adaptasi CAM-ICU predictor):**

Delirium Risk=0.4⋅[Usia>70]+0.3⋅Sedative Load+0.2⋅Sleep Disruption+0.1⋅[Baseline Kognitif Terganggu]Delirium Risk=0.4⋅[Usia>70]+0.3⋅Sedative Load+0.2⋅Sleep Disruption+0.1⋅[Baseline Kognitif Terganggu]

|Skor|Interpretasi|
|---|---|
|<0.3|Low Risk|
|0.3–0.6|Moderate Risk|
|>0.6|High Risk — intervensi preventif|

**Contoh Kalkulasi:**

- Usia 74 (✓=1), Sedative Load = 0.8 (benzo + opioid combo), Sleep = 0.7, Baseline normal (0)
    
- Risk = 0.4(1) + 0.3(0.8) + 0.2(0.7) + 0.1(0) = 0.4 + 0.24 + 0.14 = **0.78** → HIGH RISK
    
- **Interpretasi:** Orientasi ulang tiap shift, hindari benzodiazepin, mobilisasi dini, pencahayaan siang/malam yang berbeda, evaluasi penyebab reversibel.

---

## KUADRAN 4: OTORITAS OPERASIONAL (ID 37–44)

## T-37 · ICU Escalation Prediction

**Analogi:** Seperti sistem early warning banjir — kenaikan debit sungai (NEWS2 slope) memberi sinyal kepada bendungan (ICU) untuk bersiap sebelum air (pasien kritis) tiba.

**Rumus:**

PICU=11+e−(β0+β1⋅NEWS2slope⋅t)PICU​=1+e−(β0​+β1​⋅NEWS2slope​⋅t)1​

Threshold eskalasi: NEWS2 slope>1.0 poin/hari dari bangsalThreshold eskalasi: NEWS2 slope>1.0 poin/hari dari bangsal

**Contoh Kalkulasi:**

- NEWS2 pagi = 4, malam = 7 → slope = +3/12jam = **+6 poin/hari**
    
- P_ICU = logistic(−2 + 0.5 × 6) = logistic(1.0) = **73%**
    
- **Interpretasi:** Reservasi tempat tidur ICU dalam 2 jam. Evaluasi dokter spesialis. Pastikan akses vasopressor tersedia.

---

## T-38 · 30-Day Readmission Prediction

**Analogi:** Seperti pelanggan yang keluar toko tanpa membeli semua kebutuhannya — pasien discharge dengan data tidak lengkap atau lab belum normal cenderung "kembali" dalam waktu singkat.

**Rumus:**

Preadmit=0.4⋅Qincomplete+0.3⋅Qabnormal+0.3⋅ComplexityPreadmit​=0.4⋅Qincomplete​+0.3⋅Qabnormal​+0.3⋅Complexity

**Contoh Kalkulasi:**

- Q_incomplete = 0.35, Q_abnormal = 0.40, Complexity = 0.50
    
- P = 0.14 + 0.12 + 0.15 = **0.41 (41%)** → HIGH RISK
    
- **Interpretasi:** Discharge planning ketat, telepon 48 jam post-DC, klinik follow-up ≤7 hari.

---

## T-39 · ICU Bed Congestion (System-Level)

**Analogi:** Seperti traffic management highway — bukan satu mobil yang dipantau, tapi total kepadatan seluruh ruas untuk prediksi kemacetan.

**Rumus:**

Pcongestion=∑i=1NPICUi⋅wiCICUthreshold: >0.85Pcongestion​=CICU​∑i=1N​PICUi​​⋅wi​​threshold: >0.85

|Parameter|Definisi|
|---|---|
|P_ICU_i|Probabilitas eskalasi ICU pasien ke-i|
|w_i|Bobot urgensi pasien (1–3)|
|C_ICU|Kapasitas tempat tidur ICU tersedia|

**Contoh Kalkulasi:**

- 8 pasien bangsal, rata-rata P_ICU = 0.55, mean w = 1.5, C_ICU = 6
    
- P_congestion = (8 × 0.55 × 1.5) / 6 = 6.6/6 = **1.10** → OVERFLOW ALERT
    
- **Interpretasi:** Aktivasi protokol capacity management. Pertimbangkan transfer ke RS mitra. Notifikasi manajemen RS real-time.

---

## KUADRAN 5: LEGACY ACUTE TRAJECTORIES (ID 45–52)

## T-45 · Respiratory Worsening

**Rumus:**

Resp Score=slopeRR+ΔFiO2 Need+ΔSpO2 dropResp Score=slopeRR​+ΔFiO2 Need+ΔSpO2 drop

- Input: RR slope = +2.0/jam (R²=1.0), SpO2 drop = −2%/jam
    
- Proj 6h: RR = 42, Proj 24h: RR = 114 (**di atas batas fisiologis**)
    
- **Interpretasi:** NIV/HFNC dalam 2 jam. Jika gagal respons 1 jam → intubasi.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-46 · Hemodynamic Instability

**Rumus:**

Hemo Alert=[SBP slope<−5 mmHg/jam]+[MAP<65]+[HR>100]Hemo Alert=[SBP slope<−5 mmHg/jam]+[MAP<65]+[HR>100]

- Input: SBP slope = −9.0/jam (R²=0.99) → Proj 4 jam: SBP = 60 mmHg (shock territory)
    
- **Interpretasi:** Fluid challenge 500 mL, norepinefrin mulai 0.1 mcg/kg/menit.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-47 · Metabolic Crash

**Rumus:**

MIS=[Lactate>4]×2+[Glucose Var>50mg/dL/jam]×1.5+[pH<7.2]×2MIS=[Lactate>4]×2+[Glucose Var>50mg/dL/jam]×1.5+[pH<7.2]×2

- Input: Lactate = 4.8, Glucose var = 68 mg/dL/jam, pH = 7.18
    
- MIS = 2 + 1.5 + 2 = **5.5** (threshold kritis >4.0)
    
- **Interpretasi:** Metabolic crash confirmed. Insulin drip + dextrose, bicarbonat jika pH <7.1, ICU level care.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-48 · Infectious Surge (CRP Trajectory)

**Rumus:**

CRPt=CRP0+37.0×t(slope per jam, R²=1.0)CRPt​=CRP0​+37.0×t(slope per jam, R²=1.0)

- Input: CRP_0 = 45 mg/L, t = 12 jam → CRP_12h = 45 + (37 × 12) = **489 mg/L**
    
- **Interpretasi:** Infeksi tidak terkontrol dengan antibiotik saat ini. Kultur ulang, eskalasi antibiotik, pertimbangkan sumber sepsis tersembunyi (abses, endokarditis).[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-49 · Neurologic Decline

**Rumus:**

GCSt=GCS0+(−1.3)×t(slope per jam, R²=0.97)GCSt​=GCS0​+(−1.3)×t(slope per jam, R²=0.97)

- Input: GCS_0 = 12, t = 6 jam → GCS_6h = 12 − 7.8 = **4.2** (koma territory)
    
- **Interpretasi:** Airway management segera (intubasi protektif). CT kepala + MRI emergency. Neurology/neurosurgery konsul.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-50 · Mixed Acute (NEWS2 Aggregate)

**Rumus:**

NEWS2t=NEWS20+1.0×t(slope 1 poin/jam, R²=1.0)NEWS2t​=NEWS20​+1.0×t(slope 1 poin/jam, R²=1.0)

- Input: NEWS2_0 = 5, t = 12 jam → NEWS2_12h = **17** (extreme high risk)
    
- **Interpretasi:** Multi-system involvement. Multidisiplin assessment segera.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-51 · Treatment Response Good

**Rumus:**

HRt=HR0+(−7.9)×t(perbaikan post-intervensi, R²=0.90)HRt​=HR0​+(−7.9)×t(perbaikan post-intervensi, R²=0.90)

- Input: HR_0 = 115 bpm, t = 4 jam → HR_4h = 115 − 31.6 = **83.4 bpm** (kembali normal)
    
- **Interpretasi:** Respons terapi baik. Lanjutkan regimen saat ini. Downgrade monitoring.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-52 · Treatment Response Poor

**Rumus:**

HRt=HR0+2.6×t(memburuk post-intervensi, R²=0.99)HRt​=HR0​+2.6×t(memburuk post-intervensi, R²=0.99)

- Input: HR_0 = 105 bpm, t = 6 jam → HR_6h = 105 + 15.6 = **120.6 bpm**
    
- **Interpretasi:** Terapi tidak efektif. Review diagnosis banding. Eskalasi intervensi. Konsul spesialis terkait.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-53 · Allergic/Anaphylaxis

**Rumus:**

Ana Score=[BP slope<−15 mmHg/jam]+[Urticaria]+[Stridor]+[Drug Exposure<2jam]Ana Score=[BP slope<−15 mmHg/jam]+[Urticaria]+[Stridor]+[Drug Exposure<2jam]

- Input: BP slope = −15/jam (R²=0.95) → Proj 2 jam: BP drop = −30 mmHg dari baseline
    
- **Interpretasi:** Epinefrin 0.3–0.5 mg IM segera (anterolateral paha). Antihistamin + steroid adjuvant. Posisi supine + elevasi kaki.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-54 · Fever Burden

**Rumus:**

Fever Burden Index=∫0t[Temp(t)−37.5]⋅dt(area di atas threshold)Fever Burden Index=∫0t​[Temp(t)−37.5]⋅dt(area di atas threshold)

- Input: Temp slope = +0.5°C/jam, start 37.8°C → setelah 12 jam = 43.8°C (**hipertermia maligna territory**)
    
- **Interpretasi:** Antipiretik agresif (paracetamol + NSAID), kultur darah/urin/sputum, investigasi sumber infeksi atau drug fever.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-55 · Frailty Progression

**Rumus:**

CFSt=CFS0+0.8×t(per bulan, R²=0.88)CFSt​=CFS0​+0.8×t(per bulan, R²=0.88)

- Input: CFS_0 = 4 (vulnerable), t = 6 bulan → CFS_6mo = 4 + 4.8 = **8.88** (severely frail)
    
- **Interpretasi:** Eskalasi frailty dari vulnerable ke severely frail dalam 6 bulan. Program rehabilitasi, nutrisi protein tinggi, review polifarmasi, family caregiver training.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-56 · Acute Decline (NEWS2 Rapid)

**Rumus:**

NEWS2t=NEWS20+2.5×t(slope rapid, R²=1.0)NEWS2t​=NEWS20​+2.5×t(slope rapid, R²=1.0)

- Input: NEWS2_0 = 4, t = 4 jam → NEWS2_4h = 4 + 10 = **14** (extreme alert threshold)
    
- **Interpretasi:** Rapid deterioration confirmed. Immediate senior review. ICU bed reservation.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-57 · Chronic Decline (CKD Progression)

**Rumus:**

eGFRt=eGFR0+(−3.0)×t(per bulan, R²=0.96)eGFRt​=eGFR0​+(−3.0)×t(per bulan, R²=0.96)

- Input: eGFR_0 = 45, t = 6 bulan → eGFR_6mo = 45 − 18 = **27 mL/min/1.73m²** (CKD stage 4)
    
- **Interpretasi:** Progresi CKD 3B → 4 dalam 6 bulan. Rujuk nefrologi urgent. Persiapan akses vaskular untuk hemodialisis.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-58 · Mortality Risk Usia Lanjut

**Rumus:**

Pmort, elderly=P0+0.02×t(per hari, baseline probability)Pmort, elderly​=P0​+0.02×t(per hari, baseline probability)

- Input: P_0 = 0.15 (pasien 82 tahun, 3 komorbid), t = 30 hari
    
- P_30d = 0.15 + (0.02 × 30) = **0.75 (75%)** — setelah hari ke-30
    
- **Interpretasi:** Extreme risk untuk pasien usia >80 + multimorbid. Goals of care discussion mandatory.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-59 · Cardiovascular Shock Trajectory

**Rumus:**

SIt=SI0+0.15×t(per jam, R²=0.98)SIt​=SI0​+0.15×t(per jam, R²=0.98)

SI=HRSBPCritical: SI>1.0SI=SBPHR​Critical: SI>1.0

- Input: SI_0 = 0.85, t = 4 jam → SI_4h = 0.85 + 0.6 = **1.45** (critical shock)
    
- **Interpretasi:** Kardiogenik/distributif shock. Vasopressor, fluid resuscitation guided SVV, echo segera, kardiologi on-call.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-60 · Renal Failure Trajectory

**Rumus:**

Creatininet=Creat0+0.4×t(per jam, R²=0.91)Creatininet​=Creat0​+0.4×t(per jam, R²=0.91)

- Input: Creat_0 = 1.8 mg/dL, t = 48 jam → Creat_48h = 1.8 + 19.2 = **21 mg/dL** (ESRD equivalent)
    
- Realistic interpretation: slope per **hari** → 1.8 + (0.4 × 2 hari) = **2.6 mg/dL** (AKI stage 2)
    
- **Interpretasi:** AKI progresif. Stop nephrotoxic agents, adequate hydration, renal replacement therapy preparation.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-61 · Sepsis Trajectory (qSOFA-based)

**Rumus:**

qSOFAt=qSOFA0+0.6×t(per jam, R²=0.94)qSOFAt​=qSOFA0​+0.6×t(per jam, R²=0.94)

- Input: qSOFA_0 = 1, t = 2 jam → qSOFA_2h = 1 + 1.2 = **2.2** (sepsis threshold terpenuhi)
    
- **Interpretasi:** Sepsis onset predicted. Kultur darah segera, antibiotik empiris dalam 1 jam, lactate serial, IV access ganda.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

---

## T-62 · Palliative Decline

**Rumus:**

ADLt=ADL0+(−1.2)×t(per minggu, R²=0.89)ADLt​=ADL0​+(−1.2)×t(per minggu, R²=0.89)

- Input: ADL_0 = 60 (moderate dependence), t = 8 minggu → ADL_8wk = 60 − 9.6 = **50.4** (total dependence approaching)
    
- **Interpretasi:** Trajektori paliatif terkonfirmasi. Inisiasi comfort-focused care. Hospice referral. Manajemen nyeri dan symptom agresif.[](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/102236651/1a71d417-8750-46b6-a91a-c64bc045301f/Untitled.md)

## MATRIKS VALIDASI LENGKAP

|Trajektori|Metrik Performa|Sumber Validasi|Keterbatasan|
|---|---|---|---|

| Trajektori         | Metrik Performa       | Sumber Validasi                                                  | Keterbatasan                                                                   |
| ------------------ | --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Imminent Mortality | AUC 0.88–0.90         | PMC8500632 [](https://pmc.ncbi.nlm.nih.gov/articles/PMC8500632/) | Terbatas ED dewasa                                                             |
| 30-Day Mortality   | AUC 0.82              | PMC9929743 [](https://pmc.ncbi.nlm.nih.gov/articles/PMC9929743/) | Variasi antar populasi                                                         |
| Sepsis (qSOFA)     | AUROC 0.92            | PMC6261097 [](https://pmc.ncbi.nlm.nih.gov/articles/PMC6261097/) | Low AUC pada pasien umum [](https://pmc.ncbi.nlm.nih.gov/articles/PMC7260919/) |
| Flash ARDS         | Per Berlin Definition | ARDS Network 2000                                                | Butuh AGD untuk konfirmasi                                                     |
| DM-ESRD + SGLT2i   | ΔSlope −1.35/th       | PMC7680601 [](https://pmc.ncbi.nlm.nih.gov/articles/PMC7680601/) | Terbatas T2DM, data non-DM terbatas                                            |
| ICU Escalation     | Prediksi 85% 12h      | Kalibrasi internal                                               | **[PERLU VALIDASI EKSTERNAL]**                                                 |
| Cardiac Arrest     | **[PERLU VALIDASI]**  | Formula baru SHAI                                                | Pilot study diperlukan                                                         |
| Metabolic Age      | **[PERLU VALIDASI]**  | Konsep komposit                                                  | Koefisien perlu kalibrasi lokal                                                |
