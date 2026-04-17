### Format:

- Nama GATE
    
- Detector (fungsi)
    
- Trigger (rule logis)
    
- Action (saran tindakan FKTP)

---

## 1. GATE_SEPSIS_EARLY

**Detector**: `detectEarlySepsis()`

**Trigger (adult, FKTP):**

- `SUSPECTED_INFECTION == true` **AND**
    
- (RR ≥ 22 **OR** HR ≥ 90 **OR** Temp ≥ 38.0 **OR** Temp < 36.0) **AND**
    
- (SBP ≤ 100 **OR** MAP < 65 **OR** ΔSBP ≥ 40 dari baseline bila data ada **OR** perubahan mental (AVPU ≠ A))

→ Kombinasi ini sejalan dengan kriteria qSOFA (RR ≥22, SBP ≤100, altered mental status) dan pola vital sign sepsis klinis.msdmanuals+2[youtube](https://www.youtube.com/watch?v=qVy_7shA3RM)

**Action (FKTP):**

- Label: **“Sepsis suspected”**.
    
- Ulang vital sign dalam 15–30 menit.
    
- Pertimbangkan: cairan (bila tidak kontraindikasi), antibiotik awal sesuai protokol bila memang infeksi jelas + rujuk cepat ke RS jika instabilitas atau fasilitas terbatas.aafp+1

---

## 2. GATE_SEPTIC_SHOCK_HIGH

**Detector**: `detectSepticShockHighRisk()`

**Trigger:**

- `GATE_SEPSIS_EARLY == true` **AND**
    
- (SBP < 90 **OR** MAP < 65) **PERSISTEN** setelah intervensi cairan awal **ATAU** ada tanda perfusi buruk (CRT >4 detik, ekstremitas dingin)

→ Ini mengikuti definisi shock (hipotensi persisten + disfungsi perfusi) dan implikasi mortalitas tinggi.emcrit+3

**Action:**

- Label: **“Septic shock suspected – EMERGENCY”**.
    
- Active emergency flow PMK 47/2018: ABCDE, O₂, cairan, rujuk segera ke IGD RS (hubungi PSC/ambulans).emedicine.medscape+2

---

## 3. GATE_SHOCK_INDEX

**Detector**: `detectShockIndexRisk()`

**Shock Index (SI)** = HR / SBP

**Trigger:**

- SI ≥ 0,9–1,0 **atau**
    
- HR ≥ 100 **AND** SBP ≤ 100

→ Shock index tinggi terkait syok hipovolemia, perdarahan, sepsis, dan mortalitas lebih tinggi.journals.plos+2

**Action:**

- Label: **“Hemodynamic risk – possible shock”**.
    
- Cari sumber: trauma, perdarahan GI, dehidrasi, diare berat, demam tinggi.
    
- Ulang vital sign, pertimbangkan cairan & rujuk bila memburuk.aafp+1

---

## 4. GATE_RESP_FAILURE (gagal Napas akut)

**Detector**: `detectRespiratoryFailure()`

**Trigger (dewasa):**

- (RR ≥ 25 **OR** RR ≥ 30) **AND**
    
- SpO₂ < 90–92% (tanpa O₂) **AND/OR**
    
- Kesulitan bicara (hanya bisa ucapkan beberapa kata per napas) **OR** penggunaan otot bantu napas

→ Pola ini match dengan early respiratory failure pada pneumonia, asma/COPD berat, edema paru, atau PE.neteera+3

**Action:**

- Label: **“Acute respiratory failure risk – EMERGENCY”**.
    
- O₂ bila ada, posisi duduk, bronkodilator/nebulizer bila asma/COPD, rujuk segera ke IGD RS.

---

## 5. GATE_PE_SUSPECT

**Detector**: `detectPulmonaryEmbolismSuspect()`

**Trigger:**

- Onset **tiba‑tiba** sesak napas **AND**
    
- RR > 20–24 **AND** HR > 90 **AND** SpO₂ < 94 (atau turun ≥4 poin dari baseline) **AND**
    
- Ada faktor risiko tromboemboli (imobilisasi, pasca operasi, kanker, riwayat DVT/PE, kehamilan/puerperium)

→ Kombinasi ini meningkatkan probabilitas PE menurut guideline klinis.[droracle](https://www.droracle.ai/articles/687836/what-are-the-key-symptoms-and-signs-to-watch)

**Action:**

- Label: **“Pulmonary embolism suspected – urgent referral”**.
    
- Stable vitals → rujuk cepat untuk pemeriksaan lanjutan (RS).
    
- Tidak stabil (hipotensi/SpO₂ sangat turun) → treat sebagai EMERGENCY (aktifkan GATE_RESP_FAILURE/GATE_SHOCK).

---

## 6. GATE_ACS (Acute Coronary Syndrome)

**Detector**: `detectACSsuspect()`

**Trigger:**

- Nyeri dada tipikal ≥20 menit (tekan/berat/substernal, menjalar ke lengan/rahang) **AND**
    
- Setidaknya satu dari:
    
    - HR abnormal (tachy atau brady)
        
    - SBP < 90 **atau** SBP sangat tinggi ≥180
        
    - RR meningkat
        
    - Diaphoresis (keringat dingin), mual, lemas, atau sesak napas

→ Pola vital sign + gejala ini meningkatkan probabilitas ACS/MI yang tidak stabil.nurse+1

**Action:**

- Label: **“ACS / MI suspected – EMERGENCY”**.
    
- O₂ bila saturasi rendah, aspirin sesuai protokol bila tidak kontraindikasi, rujuk segera ke RS dengan fasilitas cath lab bila memungkinkan.

---

## 7. GATE_STROKE

**Detector**: `detectStrokeSuspect()`

**Trigger:**

- Onset tiba‑tiba salah satu:
    
    - kelemahan wajah/anggota gerak satu sisi,
        
    - gangguan bicara (pelo, sulit bicara),
        
    - gangguan penglihatan mendadak
        
- **Dengan atau tanpa**:
    
    - SBP tinggi (sering >140–160),
        
    - perubahan kesadaran (AVPU ≠ A),
        
    - RR meningkat (aspirasi, stroke besar).[droracle](https://www.droracle.ai/articles/633436/what-are-the-signs-and-symptoms-that-require-immediate)

**Action:**

- Label: **“Stroke suspected – time critical”**.
    
- Catat onset waktu gejala.
    
- Rujuk segera (door‑to‑needle/time window).
    
- BP tinggi **bukan alasan menahan rujukan**; penurunan tekanan darah agresif di FKTP tidak direkomendasikan tanpa indikasi spesifik.

---

## 8. GATE_ANAPHYLAXIS

**Detector**: `detectAnaphylaxis()`

**Trigger:**

- Paparan jelas terhadap alergen (makanan, obat, sengatan, dll) **DALAM MENIT – JAM** **AND**
    
- Gejala kulit/mukosa (urtikaria, gatal, bengkak bibir/wajah) **PLUS** salah satu:
    
    - RR meningkat / sesak napas / wheezing / stridor
        
    - SpO₂ < 94
        
    - SBP < 90 atau penurunan SBP ≥40 dari baseline
        
    - HR meningkat signifikan

→ Kombinasi ini sesuai definisi klinis anafilaksis (keterlibatan kulit + respirasi dan/atau hipotensi).emcrit+1

**Action:**

- Label: **“Anaphylaxis – EMERGENCY”**.
    
- Adrenalin IM segera (sesuai pedoman), O₂, posisi trendelenburg jika hipotensi, rujuk emergensi ke RS.

---

## 9. GATE_DKA_HHS

**Detector**: `detectDKA_HHS()`

**Trigger:**

- Diketahui/dugaan DM **AND**
    
- Gejala: poliuria, polidipsia, penurunan BB, mual/muntah, nyeri perut, lemas **AND**
    
- Vital sign:
    
    - RR tinggi dengan pola Kussmaul (napas dalam & cepat)
        
    - HR meningkat
        
    - BP bisa normal atau rendah
        
    - Bisa ada hipotermia ringan

→ Pola ini cocok dengan DKA/HHS.clinicalgate+1

**Action:**

- Label: **“DKA/HHS suspected – urgent/emergency referral”**.
    
- Jangan tunda rujukan; cairan awal bila protokol mengizinkan, rujuk IGD RS.

---

## 10. GATE_RESP_ASTHMA_COPD

**Detector**: `detectAsthmaCOPDexacerbation()`

**Trigger:**

- Riwayat asma/COPD **AND**
    
- Sesak napas memburuk + wheezing **AND**
    
- RR ≥ 24–30 **AND/OR** SpO₂ < 94
    
- Tanda berat: sulit bicara (hanya beberapa kata), penggunaan otot bantu, penurunan wheeze (silent chest).neteera+1

**Action:**

- Label: **“Acute asthma/COPD exacerbation – risk stratified”**.
    
- Ringan/sedang: bronkodilator + observasi + repeat vital sign.
    
- Berat (tanda berat di atas) → treat seperti GATE_RESP_FAILURE (rujuk emergensi).

---

## 11. GATE_ANEMIA_BLEED_CHRONIC

**Detector**: `detectAnemiaOrChronicBleed()`

**Trigger:**

- Keluhan lemas, cepat capek, berdebar saat aktivitas ringan **AND**
    
- HR meningkat (terutama saat berdiri/aktivitas) **AND**
    
- RR sedikit meningkat **AND**
    
- BP normal/rendah, CRT memanjang, pucat
    
- Riwayat perdarahan kronis (haid banyak, BAB hitam, dll)

→ Mengarah ke anemia sedang–berat/perdarahan kronis.journals.plos+1

**Action:**

- Label: **“Suspected moderate/severe anemia – urgent investigation”**.
    
- Tidak selalu emergency, tapi perlu pemeriksaan lab/rujuk rawat jalan yang lebih cepat.

---

Blueprint ini bisa Boss stack di atas GATE 0–7 yang sudah ada (AVPU, hemodinamik, BP, glucose, RR, SpO₂, HR, suhu) sehingga tiap **snapshot vital sign + gejala** akan otomatis “memicu” satu atau lebih GATE penyakit/urgency.msdmanuals+4

---

## 1. Pola “RESPIRATORY FAILURE”

RR tinggi (≥25–30) + SpO₂ rendah (<90–92) ± sulit bicara

**Arah masalah:** gagal napas akut (pneumonia berat, asma/COPD berat, edema paru, PE).nurse+2

**Tindakan emergensi FKTP (perawat):**

- A – Airway
    
    - Nilai jalan napas: pastikan tidak ada sumbatan, posisikan head tilt-chin lift jika tidak ada kecurigaan trauma leher.scribd+1
        
    - Bila muntah/sekret → miringkan kepala, bersihkan jalan napas.
        
- B – Breathing
    
    - Pasien **duduk tegak** (posisi semi‑fowler).
        
    - Berikan **oksigen**: masker/simple mask 6–10 L/menit, kalau ada.eprints.stikes-notokusumo+2
        
    - Jika asma/COPD: mulai **nebulizer bronkodilator** sesuai protokol lokal.
        
- C – Circulation
    
    - Cek nadi, tekanan darah, CRT; bila tanda syok → aktifkan juga paket syok (di bawah).
        
- Lainnya:
    
    - Pasang monitor vital sign sederhana, ulang RR/SpO₂ tiap beberapa menit.
        
    - **Panggil dokter** sesegera mungkin.
        
    - Siapkan **rujuk emergensi ke IGD RS**, hubungi SPGDT/PSC bila tersedia.proemergency+2

---

## 2. Pola “SYOK”

SBP <90–100 atau MAP <65 + HR tinggi + CRT memanjang / kulit dingin

**Arah masalah:** syok hipovolemik (perdarahan/dehidrasi), sepsis, anafilaksis, syok kardiogenik.emedicine.medscape+2

**Tindakan emergensi FKTP:**

- A – Airway
    
    - Pastikan jalan napas terbuka, posisi sesuai (supinasi dengan sedikit elevasi kaki bila bukan gagal napas).
        
- B – Breathing
    
    - Berikan oksigen 6–10 L/menit.static.banyumaskab.go+1
        
- C – Circulation
    
    - Baringkan pasien, **angkat kaki** (Trendelenburg modifikasi) bila tidak dicurigai trauma tulang belakang.
        
    - Hentikan perdarahan luar bila ada (tekan langsung, balut tekan).scribd+1
        
    - **Pasang infus** besar (NaCl 0,9% atau Ringer Laktat) dan mulai cairan sesuai SOP lokal.eprints.stikes-notokusumo+1
        
- Lainnya:
    
    - Pantau vital sign tiap beberapa menit.
        
    - Siapkan dokumen dan komunikasi **rujuk emergensi** ke RS; aktifkan SPGDT.proemergency+2

---

## 3. Pola “SEPSIS BERAT / EARLY SEPSIS”

Demam/hipotermia + HR >90 + RR ≥22 + (SBP ≤100 atau mental status turun)

**Arah masalah:** sepsis/ sepsis berat, risiko septic shock.aafp+2

**Tindakan emergensi FKTP:**

- A & B
    
    - Oksigen bila RR tinggi/SpO₂ turun.
        
- C
    
    - Cek BP berulang, nadi, CRT; bila SBP <90 → ikuti paket syok.
        
- D – Disability
    
    - Cek kesadaran, gula darah (hipo/hiper).
        
- Lainnya:
    
    - Mulai cairan IV bila ada tanda hipoperfusi (tunduk ke panduan lokal).aafp+1
        
    - Segera **dokter review**; jangan pulangkan begitu saja.
        
    - Bila kecurigaan sepsis berat/septic shock kuat → rujuk ke RS secepatnya.

---

## 4. Pola “ANAFILAKSIS”

Paparan alergen + gejala kulit/mukosa + sesak/SpO₂ turun atau SBP turun

**Arah masalah:** anafilaksis, reaksi alergi berat yang mengancam nyawa.emcrit+1

**Tindakan emergensi FKTP:**

- A
    
    - Nilai jalan napas; bila ada pembengkakan lidah/laring, posisi duduk tegak, siapakan jalan napas darurat.
        
- B
    
    - Oksigen 6–10 L/menit.
        
- C
    
    - **Adrenalin IM** (biasanya 0,3–0,5 mg IM dewasa – detail dosis mengacu panduan lokal, tidak ditulis spesifik di panduan umum AI).emedicine.medscape+1
        
    - Pasang infus, mulai cairan (NaCl/RL).
        
- Lainnya:
    
    - Pantau vital sign ketat.
        
    - Rujuk emergensi (IGD) tanpa menunggu lama.
        
    - Dokumentasikan waktu pemberian adrenalin dan respon pasien.

---

## 5. Pola “ACS / INFARK”

Nyeri dada khas + keringat dingin ± HR/BP abnormal

**Arah masalah:** sindrom koroner akut.[droracle](https://www.droracle.ai/articles/633436/what-are-the-signs-and-symptoms-that-require-immediate)

**Tindakan emergensi FKTP:**

- A & B
    
    - Oksigen bila SpO₂ <94%.
        
- C
    
    - Pantau BP, HR, ritme (kalau ada monitor).
        
- Lainnya:
    
    - **Jangan biarkan pasien berjalan/berdiri.**
        
    - Beri obat awal sesuai panduan PPK FKTP (mis: aspirin bila tidak kontraindikasi; detail dosis merujuk PPK resmi, bukan dijabarkan di sini).prescribingcompanion+1
        
    - Rujuk segera ke RS yang punya fasilitas penanganan ACS.

---

## 6. Pola “STROKE”

Defisit neurologis fokal mendadak ± BP tinggi, ± kesadaran menurun

**Arah masalah:** stroke iskemik/hemoragik.[droracle](https://www.droracle.ai/articles/633436/what-are-the-signs-and-symptoms-that-require-immediate)

**Tindakan emergensi FKTP:**

- A & B
    
    - Pastikan jalan napas, berikan oksigen bila ada hipoksia.
        
- C
    
    - Pantau BP, jangan turunkan agresif di FKTP tanpa indikasi khusus.
        
- Lainnya:
    
    - Catat **waktu onset gejala** (last known well).
        
    - Jaga kepala agak tinggi (sekitar 30°) bila kesadaran menurun.
        
    - Rujuk secepat mungkin (time critical).

---

## 7. Pola “DKA / HHS”

Pasien DM + napas cepat/dalam + lemas/mual, vital sign abnormal

**Arah masalah:** dekompensasi metabolik diabetik.[aafp](https://www.aafp.org/pubs/afp/issues/2013/0701/p44.html/1000)

**Tindakan emergensi FKTP:**

- A & B
    
    - Oksigen bila sesak atau SpO₂ turun.
        
- C
    
    - Pasang infus dan mulai cairan (NaCl 0,9% sesuai SOP lokal).[eprints.stikes-notokusumo](http://eprints.stikes-notokusumo.ac.id/1158/9/25.26%20Konsep%20Asuhan%20Kep%20Gawat%20Darurat%20%5BLinda%20Widyarani%5D%20.pdf)
        
- D
    
    - Cek gula darah kapiler.
        
- Lainnya:
    
    - Jangan berikan insulin mandiri di FKTP kecuali ada panduan/kompetensi yang jelas.
        
    - Rujuk emergensi ke RS dengan fasilitas rawat inap/ICU.

---

## 8. Pola “HIPOGLEKEMIA SEDANG–BERAT”

Gula darah rendah + perubahan kesadaran/gelisah/kejang

**Arah masalah:** hipoglikemia berat.

**Tindakan emergensi FKTP:**

- A & B
    
    - Pastikan jalan napas, posisi miring bila muntah, oksigen bila perlu.
        
- C & D
    
    - Cek gula darah.
        
    - Bila pasien masih bisa minum: berikan glukosa oral cepat serap (air gula/juice).
        
    - Bila tidak bisa minum: berikan terapi IV sesuai panduan lokal (misalnya glukosa IV – detail dosis merujuk PPK).puskesmaslabuapi-dikes.lombokbaratkab+1
        
- Lainnya:
    
    - Observasi ketat, ulang gula darah.
        
    - Rujuk bila tidak membaik atau etiologi serius.

---

## 9. Pola “CARDIAC ARREST / NYARIS HENTI”

Tidak respons, tidak napas normal, tidak ada nadi

**Arah masalah:** henti jantung/napas.[eprints.ukh.ac](https://eprints.ukh.ac.id/id/eprint/632/1/MODUL%20PRAKTIKUM%20GADAR.pdf)

**Tindakan emergensi FKTP:**

- A – cek respon & napas; bila tidak ada napas normal →
    
- Aktifkan **SPGDT/EMS** dan minta AED bila ada.eprints.ukh.ac+1
    
- Mulai **RJP (CPR)** sesuai algoritme (kompresi dada, ventilasi jika terlatih & ada alat).
    
- Lanjutkan sampai sistem rujukan tiba/alat lanjutan tersedia.

---

| No  | Pola Vital Sign / Klinis (Frontliner Lihat Apa)                                                                                                                             | Kemungkinan Masalah Utama (Probabilitas Arah)                                                                                                                                                                                | Tindakan Emergensi Awal di FKTP (Perawat/Bidan)                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | RR ≥22–24, SpO₂ normal (≥94), tampak cemas/nyeri/demam                                                                                                                      | Nyeri, cemas, demam ringan; awal infeksi (paru/UTI/abdomen); awal sepsis; awal asidosis metabolik                                                                                                                            | Tenangkan pasien; cari fokus infeksi/nyeri; ulang RR setelah tenang; bila RR tetap tinggi + ada dugaan infeksi → lapor dokter, jangan langsung pulang                                                                                   |
| 2   | RR ≥25–30, SpO₂ <94 (apalagi <90), sulit berbicara, penggunaan otot bantu napas                                                                                             | Distress respirasi: pneumonia, asma/COPD eksaserbasi, edema paru, sepsis berat, PE, ARDS nurse+1                                                                                                                             | Posisi duduk; oksigen 6–10 L/menit; nebulizer bronkodilator bila asma/COPD sesuai SOP; pantau RR/SpO₂; panggil dokter; siapkan rujuk emergensi ke RS                                                                                    |
| 3   | Napas cepat & dalam (Kussmaul), pasien DM, lemas, mual                                                                                                                      | DKA, asidosis metabolik berat lain [aafp](https://www.aafp.org/pubs/afp/issues/2013/0701/p44.html/1000)                                                                                                                      | Cek gula darah segera; O₂ bila sesak; pasang infus & mulai cairan sesuai SOP; rujuk emergensi ke RS (jangan tunda)                                                                                                                      |
| 4   | HR 90–110, BP normal, demam/nyeri                                                                                                                                           | Nyeri, cemas, dehidrasi ringan, infeksi lokal/awal sepsis, anemia sedang msdmanuals+1                                                                                                                                        | Obati nyeri, cairan oral; pantau ulang HR; bila tetap tinggi tanpa jelas penyebab atau disertai RR naik → lapor dokter                                                                                                                  |
| 5   | HR ≥120 + SBP 90–100, CRT memanjang, kulit dingin                                                                                                                           | Syok hipovolemik (perdarahan, diare muntah), sepsis berat, syok kardiogenik emedicine.medscape+1                                                                                                                             | Anggap **syok**: baringkan, angkat kaki (bila aman); O₂; hentikan perdarahan bila ada; pasang infus & mulai cairan sesuai SOP; pantau vital sign; panggil dokter; rujuk emergensi (hubungi PSC/ambulans)                                |
| 6   | HR tinggi + SBP tinggi (≥160–180), dengan nyeri dada/neurologis                                                                                                             | Hipertensi berat/krisis; ACS; stroke [droracle](https://www.droracle.ai/articles/633436/what-are-the-signs-and-symptoms-that-require-immediate)                                                                              | Jangan biarkan pasien berdiri/jalan; O₂ bila SpO₂ rendah; lapor dokter; bila nyeri dada khas/defisit neurologis → rujuk segera sebagai ACS/Stroke                                                                                       |
| 7   | HR <50 (non-atlet), pusing/lemas ± SBP rendah                                                                                                                               | Bradikardia signifikan: blok jantung, efek obat, gangguan konduksi, TIK ↑ clinicalgate+1                                                                                                                                     | Pantau BP, kesadaran; cek riwayat obat; bila ada sinkop/lemas berat → treat sebagai gawat darurat, rujuk segera; O₂ bila perlu                                                                                                          |
| 8   | Demam ≥38 + HR >90 + RR ≥20                                                                                                                                                 | Infeksi sistemik / sepsis awal (paru, UTI, kulit, abdomen) msdmanuals+1                                                                                                                                                      | Cari fokus infeksi; O₂ bila sesak; cairan bila ada tanda dehidrasi; lapor dokter; bila ada SBP ≤100 atau kesadaran turun → curiga sepsis berat dan rujuk                                                                                |
| 9   | Lansia tampak sakit, tidak demam, tapi RR & HR naik                                                                                                                         | Sepsis/infeksi berat pada lansia (sering afebrile) [aafp](https://www.aafp.org/pubs/afp/issues/2013/0701/p44.html/1000)                                                                                                      | Percaya vital sign, jangan tunggu demam; segera lapor dokter; evaluasi infeksi; pertimbangkan rujuk bila ada tanda instabilitas                                                                                                         |
| 10  | Suhu <35, vital sign abnormal                                                                                                                                               | Sepsis berat, paparan dingin, hipotiroid berat, syok aafp+1                                                                                                                                                                  | O₂; hangatkan perlahan; pantau BP/HR/RR; lapor dokter; rujuk emergensi                                                                                                                                                                  |
| 11  | AVPU ≠ A (V/P/U), mendadak                                                                                                                                                  | Hipoglikemia, hipoksia, syok, stroke, trauma kepala, sepsis berat, intoksikasi droracle+1                                                                                                                                    | **Kode MERAH**: cek gula darah & vital sign segera; jaga jalan napas, posisi miring bila risk muntah; O₂; panggil dokter; rujuk emergensi                                                                                               |
| 12  | Bingung/lemah + RR tinggi + HR tinggi                                                                                                                                       | Sepsis berat, syok, hipoksia otak msdmanuals+1                                                                                                                                                                               | Perlakukan sebagai sepsis berat: O₂, cairan bila indikasi, pantau ketat, rujuk segera                                                                                                                                                   |
| 13  | Riwayat asma/COPD + RR ≥24–30 + SpO₂ <94 + sulit bicara                                                                                                                     | Eksaserbasi asma/COPD sedang–berat nurse+1                                                                                                                                                                                   | Posisi duduk; O₂; nebulizer/bronchodilator; pantau; bila tidak membaik atau SpO₂ <92/“silent chest” → treat sebagai gagal napas, rujuk emergensi                                                                                        |
| 14  | Sesak mendadak + RR tinggi + HR tinggi + SpO₂ turun + faktor risiko bekuan darah                                                                                            | Pulmonary embolism (PE) [droracle](https://www.droracle.ai/articles/687836/what-are-the-key-symptoms-and-signs-to-watch)                                                                                                     | O₂; posisi semi‑fowler; pantau vital sign; jangan pulangkan; rujuk segera ke RS dengan fasilitas penunjang                                                                                                                              |
| 15  | Paparan alergen + gatal/bengkak + RR & HR naik + SpO₂ turun atau SBP turun                                                                                                  | Anafilaksis emedicine.medscape+1                                                                                                                                                                                             | Nilai jalan napas; O₂; **adrenalin IM** sesuai panduan; pasang infus & cairan; pantau ketat; rujuk emergensi (IGD)                                                                                                                      |
| 16  | Nyeri dada khas (tekan/substernal, menjalar) ≥20 menit + keringat dingin ± HR/BP abnormal                                                                                   | ACS / MI [droracle](https://www.droracle.ai/articles/633436/what-are-the-signs-and-symptoms-that-require-immediate)                                                                                                          | Pasien tidak boleh jalan; O₂ bila saturasi rendah; lapor dokter segera; obat awal sesuai PPK (misal aspirin bila tak kontraindikasi, detail di SOP); rujuk ke RS (lebih baik yang punya cath lab)                                       |
| 17  | Onset mendadak kelemahan satu sisi / mulut miring / bicara pelo ± BP tinggi                                                                                                 | Stroke iskemik/hemoragik [droracle](https://www.droracle.ai/articles/633436/what-are-the-signs-and-symptoms-that-require-immediate)                                                                                          | Catat waktu onset; jaga jalan napas & posisi kepala ~30° bila kesadaran turun; O₂ bila hipoksia; jangan turunkan BP agresif; rujuk segera (time‑critical)                                                                               |
| 18  | DM + napas cepat/dalam + lemas, mual, dehidrasi                                                                                                                             | DKA / HHS [aafp](https://www.aafp.org/pubs/afp/issues/2013/0701/p44.html/1000)                                                                                                                                               | Cek gula darah; O₂ bila perlu; pasang infus & cairan sesuai SOP; jangan berikan insulin sembarang; rujuk emergensi                                                                                                                      |
| 19  | Gula darah rendah + perubahan kesadaran/kejang/gelisah                                                                                                                      | Hipoglikemia sedang–berat                                                                                                                                                                                                    | Cek gula; bila masih bisa minum → berikan glukosa oral; bila tidak → glukosa IV sesuai PPK; O₂; observasi; rujuk bila tidak membaik atau ada sebab serius                                                                               |
| 20  | HR naik saat aktivitas ringan + pucat + RR agak naik + BP turun saat berdiri                                                                                                | Anemia sedang–berat / perdarahan kronis aafp+1                                                                                                                                                                               | Edukasi; atur rujukan cepat untuk pemeriksaan lab & penanganan lanjutan; bila sangat lemah, sesak, atau ada tanda syok → ikut paket syok & rujuk emergensi                                                                              |
| 21  | RR naik + SpO₂ turun + kesadaran menurun (tiga besar jelek)                                                                                                                 | Deteriorasi berat, risiko gagal napas & henti jantung tinggi (apapun diagnosisnya) rpmleadershipcouncil+2                                                                                                                    | Anggap **gawat darurat tertinggi**: jaga jalan napas, O₂ tinggi, pantau nadi & BP, siapkan RJP bila perlu; panggil dokter; rujuk emergensi secepat mungkin                                                                              |
| 22  | Tidak respons, tidak napas normal, tidak ada nadi                                                                                                                           | Henti jantung/napas [eprints.ukh.ac](https://eprints.ukh.ac.id/id/eprint/632/1/MODUL%20PRAKTIKUM%20GADAR.pdf)                                                                                                                | Aktivasi SPGDT/EMS; mulai RJP (kompresi dada, ventilasi jika mampu & ada alat); gunakan AED bila tersedia; lanjutkan sampai bantuan lanjutan datang                                                                                     |
| No  | Pola Vital Sign / Klinis                                                                                                                                                    | Kemungkinan Masalah Utama                                                                                                                                                                                                    | Tindakan Emergensi Awal di FKTP                                                                                                                                                                                                         |
| 23  | Demam ≥38, RR normal, HR normal, keluhan lokal jelas (nyeri tenggorok, batuk ringan, nyeri BAK ringan), tanpa red flag lain                                                 | Infeksi ringan/terlokalisir (ISPA ringan, infeksi saluran kemih ringan, gastroenteritis ringan)                                                                                                                              | Tidak emergensi; tatalaksana sesuai pedoman FKTP (obat simptomatik, antibiotik bila indikasi); edukasi red flag (“bila sesak, demam tak turun, lemas berat segera kembali”)                                                             |
| 24  | Demam ≥38, RR sedikit naik (20–24), HR >90, tanpa hipotensi/penurunan kesadaran                                                                                             | Infeksi sedang, kemungkinan sepsis awal (terutama bila ada komorbid: lansia, DM, penyakit jantung)                                                                                                                           | O₂ bila sesak; cairan oral/IV bila perlu; lapor dokter; jadwalkan follow-up lebih ketat atau rujuk bila akses RS terbatas dan pasien berisiko tinggi                                                                                    |
| 25  | RR normal, SpO₂ normal, HR tinggi (>110) + keluhan berdebar, cemas, nyeri dada “tajam”, onset saat stres, tanpa red flag vital lain                                         | Serangan panik, kecemasan akut (diagnosis eksklusi)                                                                                                                                                                          | Tetap cek: EKG/rujuk jika mungkin; tenangkan pasien, edukasi napas lambat; **jangan langsung label “psikologis”** sebelum menyingkirkan ACS/PE/tirotoksik; bila keraguan → konsultasi dokter/rujuk                                      |
| 26  | HR >120, RR naik, tremor, berkeringat, berat badan turun, tidak demam, BP bisa tinggi                                                                                       | Hipertiroid/thyroid storm (jika berat)                                                                                                                                                                                       | Tidak selalu emergensi, tapi bila HR sangat tinggi, lemas, atau ada gangguan mental → konsultasi dokter, pertimbangkan rujuk; untuk kasus stabil, atur rujukan cepat ke spesialis                                                       |
| 27  | HR tinggi, RR normal–sedikit naik, suhu normal, nyeri perut hebat, pucat, mungkin hipotensi                                                                                 | Peritonitis, perdarahan intraabdomen, appendisitis/perforasi, kehamilan ektopik terganggu (pada wanita usia subur)                                                                                                           | O₂; pantau BP/HR; jangan berikan analgesik berlebihan sebelum dinilai dokter; rujuk segera ke RS bedah/OBGYN; treat sebagai emergensi abdomen                                                                                           |
| 28  | Wanita hamil, nyeri perut bawah + perdarahan pervaginam + HR naik, RR naik, BP turun/normal-rendah                                                                          | Kehamilan ektopik terganggu, abortus inkomplet/komplet dengan syok                                                                                                                                                           | O₂; pasang infus; pantau tanda vital; segera rujuk ke RS rujukan maternitas; high suspicion walau fasilitas mini                                                                                                                        |
| 29  | Nyeri kepala hebat mendadak (“thunderclap”), muntah, ± penurunan kesadaran, BP tinggi                                                                                       | Perdarahan subaraknoid, stroke hemoragik                                                                                                                                                                                     | O₂; jaga jalan napas; jangan turunkan BP agresif; rujuk emergensi (CT scan/neurologi)                                                                                                                                                   |
| 30  | Demam + nyeri kepala + kaku kuduk ± fotofobia, HR naik, RR naik                                                                                                             | Meningitis/ensefalitis                                                                                                                                                                                                       | O₂; pantau vital sign; hindari pungsi lumbal di FKTP; rujuk emergensi ke RS                                                                                                                                                             |
| 31  | Demam + nyeri perut kanan atas, ikterus, HR naik, RR naik                                                                                                                   | Kolangitis, kolesistitis berat, hepatitis akut berat                                                                                                                                                                         | O₂ bila lemas/hipoksia; cairan; rujuk cepat (butuh penanganan RS)                                                                                                                                                                       |
| 32  | Demam + nyeri perut kanan bawah, HR naik, RR sedikit naik, nyeri lokalisir                                                                                                  | Appendisitis, bisa mengarah ke perforasi bila terlambat                                                                                                                                                                      | Tidak emergensi “ABCD” saat stabil, tapi time‑sensitive; rujuk cepat ke RS bedah; hindari menahan terlalu lama di Puskesmas                                                                                                             |
| 33  | Demam + nyeri BAK, anyang‑anyangan, nyeri pinggang, HR naik, RR sedikit naik ± menggigil                                                                                    | Pielonefritis, UTI atas                                                                                                                                                                                                      | O₂ bila sesak; cairan; antibiotik awal sesuai pedoman jika memungkinkan; rujuk bila tampak toksik/hipotensi/nyeri berat                                                                                                                 |
| 34  | Demam + ruam petekie/purpura, pasien tampak toksik, HR dan RR naik ± BP turun                                                                                               | Sepsis meningokokus / sepsis berat lain                                                                                                                                                                                      | Perlakukan sebagai **sepsis berat**: O₂, cairan, pantau ketat, rujuk emergensi                                                                                                                                                          |
| 35  | Demam + nyeri otot hebat, nyeri sendi, sakit kepala, nyeri perut, perdarahan (mimisan, gusi), petekie, HR naik, RR naik                                                     | Dengue berat / syok dengue                                                                                                                                                                                                   | Pantau ketat HR, BP, CRT; cairan sesuai pedoman dengue bila kompetensi; rujuk emergensi ke RS yang terbiasa menangani dengue                                                                                                            |
| 36  | Tidak demam, nyeri dada pleuritik (tajam saat tarik napas), RR naik, HR naik, SpO₂ normal/ sedikit turun                                                                    | Pneumonia awal, pleuritis, PE kecil                                                                                                                                                                                          | O₂ bila perlu; pantau RR/SpO₂; bila faktor risiko PE kuat atau saturasi turun → rujuk; jika tidak, tatalaksana ISPA/pneumonia sesuai pedoman dan follow‑up ketat                                                                        |
| 37  | Demam + batuk produktif + RR 20–24, SpO₂ normal, HR sedikit naik                                                                                                            | Pneumonia ringan/moderat                                                                                                                                                                                                     | Tidak emergensi; terapi antibiotik sesuai pedoman, edukasi red flag (sesak makin berat, saturasi turun, demam tak membaik); kontrol ulang                                                                                               |
| 38  | Trauma kepala + muntah berulang + sakit kepala berat + penurunan kesadaran/AVPU ≠ A ± bradikardia dan hipertensi                                                            | Cedera kepala berat, peningkatan TIK                                                                                                                                                                                         | ABC stabil; O₂; imobilisasi leher; pantau BP/HR/RR; **jangan** berikan obat penenang sembarangan; rujuk emergensi (neurotrauma)                                                                                                         |
| 39  | Trauma dada + sesak napas + RR naik + SpO₂ turun ± deviasi trakea, suara napas menurun satu sisi                                                                            | Pneumothorax/tension pneumothorax                                                                                                                                                                                            | O₂; posisi semi‑fowler; rujuk emergensi; bila kompetensi & SOP memungkinkan, lakukan dekompresi jarum di RS, bukan di FKTP (tapi sistem harus menganggap ini emergensi tinggi)                                                          |
| 40  | Trauma abdomen + nyeri hebat + distensi, HR tinggi, BP turun/normal‑rendah                                                                                                  | Perdarahan intraabdomen, ruptur organ                                                                                                                                                                                        | ABCD; O₂; pasang infus; pantau; rujuk emergensi ke RS bedah                                                                                                                                                                             |
| 41  | Demam, nyeri tenggorok, air liur menetes, suara serak, RR naik, sulit napas, posisi duduk membungkuk                                                                        | Epiglotitis/laryngeal obstruction (lebih sering pada anak)                                                                                                                                                                   | Jangan memaksa membuka mulut/menekan lidah; O₂; jangan membuat pasien menangis; rujuk emergensi segera (airway risk tinggi)                                                                                                             |
| 42  | Anak: RR tinggi sesuai cutoff usia + retraksi dada + groaning + SpO₂ turun                                                                                                  | Pneumonia berat/bronchiolitis berat                                                                                                                                                                                          | O₂; posisi nyaman; pantau; rujuk emergensi (anak sangat cepat memburuk)                                                                                                                                                                 |
| 43  | Anak: RR tinggi + wheezing + kesulitan bicara/menangis                                                                                                                      | Eksaserbasi asma anak                                                                                                                                                                                                        | Nebulizer; O₂; pantau RR/SpO₂; bila tidak membaik → rujuk                                                                                                                                                                               |
| 44  | Riwayat obat sedatif/opioid + RR rendah (<8–10), SpO₂ turun, kesadaran menurun                                                                                              | Depresi napas akibat obat                                                                                                                                                                                                    | Jaga jalan napas, O₂, posisi miring; panggil dokter; rujuk emergensi; (nantinya di RS pertimbangkan antidotum)                                                                                                                          |
| 45  | Demam atau riwayat infeksi + nyeri punggung hebat lokal + defisit neurologis (+/– retensi/inkontinensia)                                                                    | Spinal epidural abscess, cauda equina (jarang tapi high‑risk)                                                                                                                                                                | Tidak ada intervensi khusus di FKTP selain nyeri dan ABC; rujuk cepat ke RS untuk penanganan bedah/neuro                                                                                                                                |
| 46  | Demam + nyeri sendi banyak + bengkak, HR naik, RR sedikit naik, pasien sangat kesakitan                                                                                     | Septic arthritis, gout berat, flare autoimun                                                                                                                                                                                 | ABC stabil; analgesik; bila curiga septic arthritis → rujuk untuk aspirasi dan antibiotik IV                                                                                                                                            |
| 47  | Demam ringan + rash makulopapular + HR normal/naik, RR normal                                                                                                               | Infeksi virus ringan (campak, rubella, exanthema viral lain)                                                                                                                                                                 | Tidak emergensi; edukasi, terapi suportif; edukasi red flag (sesak, kejang, lemas berat)                                                                                                                                                |
| 48  | Demam tinggi + kejang (tanpa riwayat epilepsi), pasca kejang mengantuk, RR/HR naik                                                                                          | Kejang demam kompleks/kejang akut                                                                                                                                                                                            | ABC stabil; posisi miring; O₂; kontrol suhu; bila kejang lama atau berulang → rujuk emergensi; edukasi orang tua                                                                                                                        |
| 49  | Pasien tampak sangat lemah, RR dan HR naik pelan, BP cenderung turun, tanpa nyeri jelas, terutama lansia/komorbid                                                           | Frailty + infeksi/komorbid dekompensasi (multi‑factor)                                                                                                                                                                       | Anggap high‑risk; jangan pulang cepat; lapor dokter; evaluasi menyeluruh; rujuk bila sulit stabil di FKTP                                                                                                                               |
| 50  | Fluktuasi vital sign besar dalam hitungan jam (misal RR dari 18 → 26 → 30, HR dari 90 → 120, BP turun) meski belum sampai ekstrem                                           | Deteriorasi klinis progresif (apapun diagnosis dasarnya) journals.plos+1                                                                                                                                                     | Algoritme harus anggap ini “warning dinamis”: tingkatkan frekuensi monitoring; panggil dokter; pertimbangkan rujuk meski tiap angka belum ekstrem; tren > titik tunggal                                                                 |
| No  | Pola Klinis & Vital                                                                                                                                                         | Kemungkinan Masalah                                                                                                                                                                                                          | Aksi Cepat FKTP                                                                                                                                                                                                                         |
| 51  | Vital sign masih dalam batas “hampir normal” (misal: SBP 95–100, HR 100–105, SpO₂ 92–94, suhu 37,8–38), tapi pasien tampak sangat lemah / “feeling unwell” secara subjektif | Pasien “borderline” dengan risiko tinggi re‑admission/deteriorasi (terutama lansia/komorbid) – studi tunjukkan SBP ≤97, HR ≥101, SpO₂ ≤92, suhu sedikit naik menggandakan risiko rawat inap dalam 7 hari. pmc.ncbi.nlm.nih+1 | Jangan tertipu angka “masih normal”: dokumentasikan, ulang vital sign, lapor dokter; pertimbangkan observasi lebih lama atau rujuk bila komorbid berat/lansia, jangan buru‑buru pulangkan                                               |
| 52  | Vital sign normal, tapi pasien mengeluh **nyeri dada atipikal** (ketat, tidak jelas, kadang ke punggung/rahang), disertai faktor risiko (DM, hipertensi, riwayat jantung)   | ACS “silent” atau atipikal, terutama pada DM & perempuan; beberapa MI datang dengan vital sign awal normal. [geekymedics](https://geekymedics.com/common-ed-presentations-majors/)                                           | Tetap treat sebagai potensial ACS: istirahat, O₂ bila perlu, EKG/rujuk jika bisa; jangan “dismiss” hanya karena vital sign normal; konsultasi dokter untuk penilaian lebih lanjut                                                       |
| 53  | Vital sign normal atau sedikit abnormal, pasien datang dengan **riwayat bunuh diri (ide, rencana, percobaan)** atau ucapan “ingin mengakhiri hidup”                         | Risiko bunuh diri tinggi; vital sign tidak membantu, tapi ini life‑threatening “abu‑abu” di FKTP. smj.org+1                                                                                                                  | Wajib asesmen risiko bunuh diri (ide, rencana, alat, dukungan sosial); **tidak boleh pulang sendiri** bila risiko tinggi; koordinasi dengan layanan jiwa/IGD; jaga keamanan pasien (jauhkan benda berbahaya)                            |
| 54  | Pasien tampak sangat gelisah/agitatif, mungkin berteriak, tapi vital sign belum ekstrem; bisa ada HR/RR sedikit naik                                                        | Psikosis akut, agitasi berat, intoxikasi; risiko kekerasan & cedera pada pasien/staf. iem-student+1                                                                                                                          | Utamakan **keamanan** (lingkungan, staf, pasien lain); pendekatan de‑eskalasi verbal; cek cepat ABC, gula darah, RR/SpO₂; panggil dokter; bila ada tanda medis (demam, penurunan kesadaran) → treat sebagai medikal emergensi dan rujuk |
| 55  | Riwayat obat sedatif/opioid/alkohol + tampak mengantuk berat, RR 10–12 (batas bawah), SpO₂ 92–94, pupil kecil                                                               | Overdosis/keracunan obat dengan depresi napas awal; vital sign bisa masih borderline sebelum drop. americanaddictioncenters+1                                                                                                | Pantau ketat RR/SpO₂; jangan biarkan sendirian; jaga jalan napas (posisi miring); O₂; lapor dokter; rujuk emergensi sebelum RR turun lebih jauh                                                                                         |
| 56  | Vital sign normal/sedikit abnormal, tapi ada **palpitasi berat**, rasa “mau pingsan”, riwayat jantung/aritmia                                                               | Aritmia parah intermiten (SVT, VT non‑sustained) yang belum tertangkap saat pemeriksaan; risiko sinkop/sudden death. pmc.ncbi.nlm.nih+1                                                                                      | Jangan diabaikan: bila tersedia, lakukan EKG; kalau tidak, rujuk ke RS untuk evaluasi; edukasi pasien untuk segera datang bila terjadi pingsan/nyeri dada/dispnea                                                                       |
| 57  | Gelisah, lemah, pusing, mual, kram otot, tapi vital sign hampir normal; riwayat muntah/diare berkepanjangan, obat diuretik, atau penyakit ginjal                            | Gangguan elektrolit (hipokalemia, hiponatremia, dll) yang bisa berujung aritmia/kejang/sudden death. clevelandclinic+1                                                                                                       | Curiga tinggi bila kombinasi faktor risiko; cek EKG bila bisa; atur rujukan untuk lab dan evaluasi; edukasi red flag: nyeri dada, palpitasi berat, kejang, bingung → segera ke RS                                                       |
| 58  | Vital sign normal/nyaris normal, tapi pasien sangat bingung, disorientasi, atau perilaku berubah (delirium) terutama lansia                                                 | Delirium: tanda gangguan akut otak karena infeksi, obat, elektrolit, hipoksia, dll; mortalitas tinggi. clevelandclinic+1                                                                                                     | Anggap kondisi serius meski vital sign normal; cari pemicu (infeksi, obat, hipoglikemia); lapor dokter; pertimbangkan rujuk untuk evaluasi menyeluruh                                                                                   |
| 59  | Nyeri punggung hebat mendadak, menjalar ke perut/depan dada, pasien tampak gelisah, mungkin BP berbeda antar lengan; vital sign bisa awalnya normal                         | Diseksi aorta torakal/abdominal; sering miss di primer, tapi sangat mematikan. [geekymedics](https://geekymedics.com/common-ed-presentations-majors/)                                                                        | Waspadai pada pasien hipertensi/riwayat penyakit jantung; jangan berikan manipulasi berat; O₂, pain control secukupnya; rujuk emergensi ke RS dengan fasilitas imaging                                                                  |
| 60  | Wanita post-partum (baru melahirkan) dengan sesak, nyeri dada, palpitasi, edema tungkai, vital sign bisa borderline (RR/HR naik ringan)                                     | Emboli paru postpartum, kardiomiopati peripartum                                                                                                                                                                             | Curiga tinggi bila ada sesak/nyeri dada; O₂, pantau vital; rujuk emergensi; jangan anggap “normal pasca melahirkan”                                                                                                                     |
| 61  | Pasien kanker/kemoterapi dengan demam sedikit (37,8–38,3), HR/RR sedikit naik, BP normal                                                                                    | Neutropenic sepsis (sepsis dengan neutrofil rendah) – bisa memburuk sangat cepat meski awal ringan                                                                                                                           | Jangan remehkan demam ringan; dokter harus review; kemungkinan besar perlu rujuk ke RS; edukasi pasien kanker bahwa demam apapun = tanda bahaya                                                                                         |
| 62  | Pasien dengan penyakit psikiatri/OBH/obat sedatif, tampak sangat mengantuk, vital sign borderline; keluarga lapor konsumsi obat berlebih                                    | Overdosis kombinasi obat; risiko gagal napas, aspirasi, aritmia                                                                                                                                                              | Jaga jalan napas, posisi miring; O₂; pantau RR/SpO₂; rujuk emergensi; jangan hanya dilabel “sedang tidur/tenang”                                                                                                                        |
| 63  | Nyeri perut bawah + demam ringan + vital sign hampir normal pada wanita dengan IUD atau riwayat STD                                                                         | PID (pelvic inflammatory disease) – bila terlambat → infertilitas, abses                                                                                                                                                     | Bukan emergensi ABC, tapi “time‑sensitive”; terapi awal sesuai pedoman + rujuk/ follow up ginekologi; edukasi tanda perburukan                                                                                                          |
| 64  | Remaja dengan nyeri dada, palpitasi, pingsan saat olahraga; vital sign bisa normal saat diperiksa                                                                           | Penyakit jantung struktural/aritmia maligna (mis: HCM, channelopathy)                                                                                                                                                        | Red flag besar: rujuk ke kardiolog/RS dengan fasilitas EKG/USG jantung; jangan izinkan aktivitas berat sebelum dinyatakan aman                                                                                                          |
| 65  | Pasien DM dengan luka infeksi di kaki/kulit, demam ringan, vital sign hampir normal, tapi luka tampak dalam/berbau                                                          | Infeksi jaringan dalam, risiko gangren, osteomielitis, sepsis                                                                                                                                                                | Jangan dianggap infeksi kulit biasa; dokter harus review; pertimbangkan rujuk untuk debridement/ rawat inap, terutama bila kontrol gula buruk                                                                                           |
| 66  | Nyeri punggung bawah + retensi BAK atau inkontinensia + kelemahan tungkai, vital sign normal                                                                                | Cauda equina syndrome                                                                                                                                                                                                        | Bukan emergensi ABC, tapi emergensi neurologis/time‑critical; rujuk cepat untuk evaluasi bedah saraf                                                                                                                                    |
| 67  | Pasien tua dengan sering jatuh, pusing saat berdiri, vital sign duduk normal, tapi saat berdiri SBP drop signifikan                                                         | Hipotensi ortostatik → risiko jatuh & trauma kepala                                                                                                                                                                          | Uji ortostatik bila aman; edukasi; review obat; rujuk untuk evaluasi bila jatuh berulang; bukan emergensi, tapi high‑impact untuk pencegahan                                                                                            |
| 68  | Vital sign normal, tapi ada riwayat kejang baru tanpa penyebab jelas                                                                                                        | Epilepsi baru onset, tumor otak, infeksi SSP                                                                                                                                                                                 | ABC stabil; cek gula; rujuk untuk evaluasi neurologi/imaging; edukasi keluarga tentang penanganan kejang bila berulang                                                                                                                  |
| 69  | Vital sign normal, tetapi pasien tampak sangat depresi, menarik diri, menyebut “tidak ada harapan”, pernah coba bunuh diri sebelumnya                                       | Depresi berat dengan risiko bunuh diri tinggi                                                                                                                                                                                | Lakukan skrining bunuh diri; bila ada rencana/jalan jelas → jangan pulang sendiri, rujuk psikiatri/IGD; buat safety plan; libatkan keluarga. smj.org+1                                                                                  |
| 70  | Vital sign hampir normal, tapi ada “gut feeling” perawat/dokter bahwa pasien tampak “lebih sakit dari angka” (warna kulit, cara bicara, gerak)                              | “Sick but not yet abnormal vital signs” – tanda dini deteriorasi yang sulit diobjektifkan; literatur EWS mendukung intuisi klinisi sebagai red flag tambahan journals.plos+1                                                 | Algoritme harus mengakomodasi input “concern klinis”: bila perawat tekan tombol “khawatir”, sistem naikkan level pemantauan/anjurkan review dokter/observasi lebih lama meski skor vital rendah                                         |