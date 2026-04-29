# 1. Perbandingan Saat Ini Vs AADI V2

|Area|Current Symphony|AADI V2 Setelah Selesai|Estimasi Peningkatan|
|---|---|---|---|
|**Safety & triage**|Sudah kuat: NEWS2, vital alerts, screening gates, PE suspect, anaphylaxis, DDI, traffic-light|Tetap dipertahankan, tetapi dimodularisasi dan ditambah golden regression test|**+15–25%**|
|**Native diagnosis reasoning**|Masih bergantung pada `diagnosisCandidates` eksternal|Bisa menghasilkan differential diagnosis sendiri dari clinical facts|**+70–100%**|
|**Confidence logic**|Masih sering `insufficient_data`|Confidence menjadi low / moderate / high sesuai kualitas data|**+50–80%**|
|**Status engine**|Masih eksplisit `degraded` karena partial migration|Status menjadi `ok`, `requires_review`, `insufficient_data`, atau `degraded` secara bermakna|**+60–90%**|
|**Explainability**|Ada alert, tetapi reasoning diagnosis belum lengkap|Ada alasan per diagnosis, missing data, must-not-miss, dan next step|**+60–80%**|
|**Medication safety**|DDI sudah ada jika obat >1|DDI + allergy + pregnancy caution + structured medication issue|**+30–50%**|
|**Indonesia localization**|Belum native|Dengue, TB suspect, preeclampsia, sepsis, NCD, maternal-fetal packs|**+60–90%**|
|**FHIR / interoperability**|Belum menjadi core output|Siap mapping ke FHIR, SATUSEHAT, EMR, ReferraLink|**+50–80%**|
|**Auditability**|Ada arah governance, tetapi belum full clinical inference audit|Setiap inference punya version, ruleset, timestamp, override, shadow comparison|**+50–75%**|
|**Production validation**|Belum ada shadow mode penuh|V1 vs V2 bisa dibandingkan sebelum production|**+70–90%**|

Current Symphony sudah kuat sebagai **safety-first deterministic assessment and escalation engine**, tetapi belum menjadi **native diagnosis-from-scratch engine** karena diagnosis masih hybrid di atas kandidat eksternal, metadata masih `degraded`, dan confidence global masih `insufficient_data`.

---

# 2. Skor Maturity Per Fase

Saya akan pakai skala internal **0–100**, bukan klaim klinis resmi.

|Tahap|Maturity Score|Artinya|
|---|---|---|
|**Current Symphony**|**45–55 / 100**|Safety kuat, diagnosis belum native|
|**AADI V2 Phase 1 selesai**|**70–75 / 100**|Native diagnostic core mulai berjalan|
|**AADI V2 Phase 2 selesai**|**80–88 / 100**|FHIR, evidence layer, shadow mode, evaluation harness|
|**AADI V2 Phase 3 selesai**|**88–92 / 100**|Pilot-ready, offline mode, localization, observability|

Jadi peningkatan dari current ke final Phase 3:

Current: sekitar 50/100
Final: sekitar 90/100

Peningkatan absolut: +40 poin
Peningkatan relatif: sekitar +80%

Namun untuk clinical performance, jangan pakai angka 80%. Itu angka **maturity sistem**, bukan akurasi diagnosis.

---

# 3. Estimasi Peningkatan Klinis Yang Lebih Realistis

## 3.1 Diagnostic Support Quality

|Kondisi|Estimasi|
|---|---|
|Current Symphony|baseline belum stabil karena diagnosis tergantung kandidat eksternal|
|AADI V2 Phase 1|**+15–25%**|
|AADI V2 Phase 2|**+20–35%**|
|AADI V2 Phase 3|**+25–40%**, jika pilot feedback bagus|

Target paling realistis untuk klaim eksternal:

> **AADI V2 menargetkan peningkatan kualitas clinical decision support sebesar 20–35% dibanding current engine setelah validasi shadow mode dan expert review.**

Dokumen Sentra sebelumnya memang menyebut peningkatan diagnostic accuracy sekitar 30% melalui risk scoring dan pengurangan diagnostic errors sekitar 35% melalui early warnings, tetapi angka ini harus dibuktikan ulang spesifik untuk AADI V2.

---

# 4. Bagian Yang Naik Paling Besar

## A. Native Diagnosis Reasoning

Ini peningkatan terbesar.

Current:

Input klinis
→ deterministic alerting
→ diagnosisCandidates dari luar
→ ranking / traffic-light

AADI V2:

Input klinis
→ ClinicalFacts
→ syndrome classification
→ diagnosis pack matching
→ differential diagnosis
→ must-not-miss
→ clinical arbiter

Peningkatan: **sekitar +70–100%** dalam autonomy diagnosis reasoning.

Bukan berarti diagnosis pasti benar 100%, tetapi engine tidak lagi pasif menunggu kandidat dari luar.

---

## B. Explainability

Current output memberi alert dan traffic-light, tetapi belum sepenuhnya menjawab:

- kenapa diagnosis ini muncul
- data apa yang mendukung
- data apa yang melemahkan
- data apa yang kurang
- apa diagnosis yang tidak boleh terlewat

AADI V2 menjawab semuanya.

Peningkatan: **sekitar +60–80%**.

---

## C. Clinical Safety Governance

Current sudah punya safety slices kuat. AADI V2 tidak mengganti safety layer, tetapi membuatnya:

- modular
- testable
- auditable
- protected by golden safety tests
- compatible dengan shadow mode

Peningkatan: **sekitar +15–25%**, karena fondasinya memang sudah kuat.

---

# 5. Bagian Yang Tidak Akan Naik Drastis

## Safety Alerting

Karena current Symphony sudah kuat di sini.

Current sudah punya:

- NEWS2
- vital alerts
- PE suspect
- anaphylaxis
- trajectory
- DDI
- traffic-light safety gate

Maka AADI V2 tidak membuat safety dari 0. Yang meningkat adalah **reliability, modularity, dan testability**, bukan kemampuan dasar safety detection. Current flow memang sudah menempatkan traffic-light sebagai safety gate final di atas alert dan diagnosis suggestion.

Estimasi peningkatan safety layer: **+15–25%**, bukan +80%.

---

# 6. Ringkasan Persentase Paling Aman

|Kategori|Estimasi Peningkatan|
|---|---|
|**Overall system maturity**|**+50–80%**|
|**Clinical diagnostic support quality**|**+20–35%**|
|**Native diagnosis reasoning capability**|**+70–100%**|
|**Explainability**|**+60–80%**|
|**FHIR/interoperability readiness**|**+50–80%**|
|**Safety detection**|**+15–25%**|
|**Medication safety**|**+30–50%**|
|**Indonesia-market fit**|**+60–90%**|
|**Auditability/governance**|**+50–75%**|

---

# 7. Angka Final Yang Saya Rekomendasikan Untuk Dipakai

Untuk internal engineering:

> **AADI V2 = ±80% peningkatan system maturity dibanding current Symphony.**

Untuk clinical/product claim yang aman:

> **AADI V2 menargetkan 20–35% peningkatan kualitas clinical decision support dibanding current engine, dengan validasi melalui golden cases, shadow mode, dan expert review.**

Untuk pitch eksternal:

> **AADI V2 meningkatkan engine dari safety-triage assistant menjadi full diagnostic reasoning copilot yang tetap human-in-the-loop, explainable, FHIR-ready, dan Indonesia-first.**

---

## Kesimpulan

**Current Symphony sudah 50% matang sebagai safety engine.**
**AADI V2 akan membawa sistem ke sekitar 85–90% maturity sebagai diagnostic copilot.**

Jadi jawaban paling jujur:

> **Peningkatan teknis total: sekitar 50–80%.**
> **Peningkatan clinical diagnostic support yang realistis: sekitar 20–35%.**
> **Peningkatan terbesar bukan di safety, tetapi di native diagnosis reasoning, explainability, interoperability, dan auditability.**
