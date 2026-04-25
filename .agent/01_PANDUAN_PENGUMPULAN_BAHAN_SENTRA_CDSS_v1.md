# PANDUAN PENGUMPULAN BAHAN
## Sentra Clinical Reference Database v1 — Diagnostic CDSS untuk 144 Penyakit SKDI 4A

> **Dokumen**: `01_PANDUAN_PENGUMPULAN_BAHAN`
> **Versi**: 1.0
> **Tanggal**: April 2026
> **Owner**: Dr. Ferdi Iskandar (Clinical Steward) + Tim Development Sentra
> **Status**: GO untuk eksekusi
> **Estimasi Durasi**: 4 minggu (paralel dengan persiapan tim klinis validator)

---

## 1. KONTEKS & FILOSOFI PENGUMPULAN

Sebelum melangkah ke teknis, mari kita pegang prinsip yang akan menjadi kompas selama 4 minggu ke depan:

**Prinsip 1: Provenance is Sacred**
Setiap byte data yang masuk ke database Sentra harus bisa ditelusuri kembali ke sumber resmi. Tidak ada data "dari mana saja" — semua harus punya jejak audit yang lengkap (sumber, versi, tanggal akses, hash file).

**Prinsip 2: Legal Before Technical**
Status lisensi setiap sumber harus diverifikasi *sebelum* file di-process. Sumber berbayar (MIMS, ISO) tidak boleh di-redistribute meskipun untuk internal use jika belum ada kontrak yang jelas.

**Prinsip 3: Versioning from Day One**
Setiap file diberi metadata versi. PNPK 2023 berbeda dengan PNPK 2024. Tidak boleh ada ambiguitas tentang versi dokumen yang menjadi sumber data klinis.

**Prinsip 4: Reproducibility**
Jika 6 bulan lagi tim baru bergabung dan harus rebuild database, mereka harus bisa mengikuti panduan ini dan mendapatkan hasil yang identik.

---

## 2. PRIORITISASI 12 SUMBER UNTUK SCOPE V1

Karena prioritas v1 adalah **Diagnostic CDSS untuk 144 penyakit SKDI 4A**, mari kita kelompokkan 12 sumber berdasarkan urgensi:

### 🔴 Tier 1 — WAJIB untuk v1 (Diagnostic Core)
| # | Sumber | Alasan |
|---|---|---|
| 1 | PPK FKTP (PB IDI) | Inti diagnostik primary care |
| 2 | ICD-10 FKTP (BPJS) | Coding standard nasional |
| 3 | PNPK 2023-2024 (Kemenkes) | Panduan nasional penyakit prioritas |
| 10 | Riskesdas (Kemenkes) | Konteks epidemiologi Indonesia |

**Target akuisisi: Minggu 1**

### 🟠 Tier 2 — DIBUTUHKAN untuk v1.5 (Drug Safety Layer)
| # | Sumber | Alasan |
|---|---|---|
| 5 | FORNAS (Kemenkes) | Wajib BPJS prescribing |
| 6 | MIMS Indonesia 2024 | Dosis & detail obat |
| 8 | Pregnancy Categories (FDA/ADEC) | Safety mandatory |
| 9 | MIMS Online (renal/hepatic) | Dose adjustment |

**Target akuisisi: Minggu 2-3** (paralel dengan Tier 1, karena MIMS butuh procurement)

### 🟡 Tier 3 — ENRICHMENT untuk v2 (Specialist & Advanced)
| # | Sumber | Alasan |
|---|---|---|
| 4 | PPK PAPDI 2024 | Specialist-level depth |
| 7 | ISO Farmakoterapi | Brand name enrichment |
| 11 | DrugBank/Medscape | DDI mechanism detail |

**Target akuisisi: Minggu 3-4**

### 🟢 Tier 4 — INTEGRATION (Paralel)
| # | Sumber | Alasan |
|---|---|---|
| 12 | OpenMRS CIEL | Mapping layer untuk interop |

**Target akuisisi: Minggu 4** (atau defer ke fase integration)

---

## 3. TAHAP PERSIAPAN (Minggu 0 — 3 Hari Sebelum Akuisisi)

### 3.1 Setup Workspace Pengumpulan

**Lokasi**: Buat folder dedicated di server tim atau cloud storage yang ter-encrypt.

**Struktur folder yang direkomendasikan**:

```
sentra-clinical-sources/
├── 00_metadata/
│   ├── INVENTORY.md          # Master log semua file
│   ├── LICENSES/              # Salinan lisensi tiap sumber
│   ├── ACQUISITION_LOG.csv    # Log tanggal + downloader + hash
│   └── README.md              # Panduan navigasi folder
├── 01_tier1_diagnostic_core/
│   ├── 01_ppk_fktp_idi/
│   │   ├── original/           # File asli, NEVER MODIFY
│   │   ├── verification/       # Hash file, screenshot bukti download
│   │   └── notes.md            # Catatan akuisisi (URL, tanggal, dll)
│   ├── 02_icd10_fktp_bpjs/
│   ├── 03_pnpk_kemenkes/
│   └── 10_riskesdas/
├── 02_tier2_drug_safety/
│   ├── 05_fornas/
│   ├── 06_mims_indonesia/
│   ├── 08_pregnancy_categories/
│   └── 09_mims_online/
├── 03_tier3_enrichment/
│   ├── 04_ppk_papdi/
│   ├── 07_iso_farmakoterapi/
│   └── 11_drugbank_medscape/
├── 04_tier4_integration/
│   └── 12_openmrs_ciel/
└── 99_archive/                 # Versi lama yang sudah digantikan
```

**Best practice**: Gunakan **immutable folder pattern** — folder `original/` tidak boleh dimodifikasi setelah file di-place. Semua processing (rename, restructure) terjadi di folder terpisah `02_extracted/` yang akan kita buat di Fase 2 (Ekstraksi).

### 3.2 Tools yang Dibutuhkan

| Kategori | Tool | Fungsi | Lisensi |
|---|---|---|---|
| **Storage** | Google Drive / OneDrive (encrypted) atau S3 bucket | Penyimpanan utama dengan backup otomatis | Cloud subscription |
| **Hash verification** | `sha256sum` (Linux/Mac) atau `Get-FileHash` (Windows) | Verifikasi integritas file | Built-in |
| **PDF inspector** | `pdfinfo` (poppler-utils), Adobe Acrobat Reader | Cek metadata PDF | Free |
| **Excel viewer** | LibreOffice Calc atau Microsoft Excel | Inspect file ICD-10 BPJS | Various |
| **Browser** | Chrome/Firefox dengan extension SingleFile | Capture web pages (untuk MIMS Online) | Free |
| **Version control** | Git + Git LFS (untuk file >10MB) | Track perubahan metadata | Free |
| **Documentation** | Markdown editor (Obsidian, VS Code) | Tulis log & notes | Free |
| **Screenshot** | ShareX (Windows), Shottr (Mac) | Bukti akuisisi | Free |

**Setup script untuk hash verification (simpan sebagai `verify.sh`)**:

```bash
#!/bin/bash
# Generate SHA-256 hash untuk file dan tulis ke verification log
FILE="$1"
HASH=$(sha256sum "$FILE" | awk '{print $1}')
SIZE=$(stat -c%s "$FILE")
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "$DATE,$FILE,$SIZE,$HASH" >> verification/hashes.csv
echo "✓ Hash: $HASH"
echo "✓ Logged to verification/hashes.csv"
```

### 3.3 Legal & Compliance Pre-Check

Sebelum download apa pun, lakukan checklist berikut:

- [ ] **Tim legal/compliance Sentra** sudah review rencana pengumpulan ini
- [ ] **Status lisensi** per sumber sudah diklasifikasi:
  - Public domain (FORNAS, PPK FKTP, PNPK, Riskesdas, ICD-10 BPJS): boleh redistribute internal
  - Berbayar dengan EULA (MIMS, ISO): hanya boleh akses by user yang punya lisensi
  - Open source dengan atribusi (OpenMRS CIEL, DrugBank free tier): wajib cantumkan atribusi
- [ ] **Kontrak procurement** untuk sumber berbayar sudah disiapkan (purchase order MIMS Indonesia, ISO)
- [ ] **Email institusional Sentra** sudah dibuat untuk registrasi (`data-acquisition@sentra.id`)
- [ ] **Akun cloud storage** sudah punya backup policy aktif (minimal 2 region)

### 3.4 Naming Convention File

Setiap file yang didapat harus di-rename mengikuti pola:

```
{TIER}_{SOURCE_ID}_{TYPE}_{VERSION}_{ACCESSED_DATE}.{ext}
```

**Contoh**:
- `T1_S01_PPK_FKTP_v2017_acc2026-04-25.pdf`
- `T1_S02_ICD10_FKTP_v2024.07_acc2026-04-25.xlsx`
- `T2_S05_FORNAS_v2024_acc2026-04-26.pdf`

**Mengapa penting**: Saat ada update (PNPK baru, FORNAS baru), kita bisa langsung tahu versi mana yang aktif tanpa harus buka file.

---

## 4. PANDUAN AKUISISI DETAIL — 12 SUMBER

> **Catatan penting**: URL website pemerintah Indonesia kadang berubah tanpa notifikasi. Saya tandai URL yang saya yakin akurat per knowledge cutoff (Januari 2026). Untuk URL yang mungkin berubah, saya tandai dengan ⚠️ — tim harus verifikasi via Google search dengan keyword yang saya berikan.

---

### 🔴 SUMBER #1: PPK FKTP (PB IDI)

**Deskripsi**: Panduan Praktik Klinis untuk dokter di Fasilitas Kesehatan Tingkat Pertama, mencakup 300+ penyakit dengan struktur baku (definisi, anamnesis, pemeriksaan fisik, penunjang, diagnosis, diagnosis banding, tatalaksana, edukasi, prognosis).

**Penerbit**: Pengurus Besar Ikatan Dokter Indonesia (PB IDI)

**Status lisensi**: Public document untuk penggunaan klinis, **bukan** untuk redistribusi komersial. Untuk penggunaan dalam CDSS Sentra, **disarankan koordinasi formal dengan PB IDI** untuk mendapatkan written permission.

**Cara akses**:

1. Kunjungi website resmi: ⚠️ `https://www.idionline.org/` (search: "PPK FKTP IDI download")
2. Alternatif via Kemenkes: ⚠️ `https://yankes.kemkes.go.id/` → Direktorat Yankes Primer → Pedoman
3. Sumber tersier (mirror): cari di Scholar Google dengan query `"Panduan Praktik Klinis Bagi Dokter di Fasilitas Pelayanan Kesehatan Primer" filetype:pdf`

**Versi yang relevan**:
- **PPK FKTP 2017** (revisi II) — versi paling banyak beredar, edisi terbaru yang resmi dirilis sebagai dokumen tunggal
- Cek apakah ada **PPK FKTP edisi 2024/2025** yang mungkin sudah keluar — verifikasi di website PB IDI

**Action steps**:
1. ✅ Download PDF dari sumber resmi
2. ✅ Screenshot halaman download sebagai bukti (simpan di `verification/`)
3. ✅ Generate SHA-256 hash, log ke `verification/hashes.csv`
4. ✅ Cek metadata PDF: `pdfinfo file.pdf` → pastikan author = IDI atau Kemenkes
5. ✅ Rename sesuai konvensi: `T1_S01_PPK_FKTP_v2017_acc2026-04-XX.pdf`
6. ✅ Tulis `notes.md` dengan: URL, tanggal akses, downloader, ukuran file, jumlah halaman, versi
7. ✅ **Kontak resmi PB IDI** untuk request written permission (template surat: lihat Lampiran A)

**Output yang diharapkan**:
- File PDF lengkap (~500-800 halaman, ~30-50 MB)
- Hash file yang ter-log
- Bukti download (screenshot)
- Email/surat permintaan permission sudah terkirim

**Estimasi waktu**: 2 jam (download + dokumentasi) + 1-2 minggu (response IDI)

---

### 🔴 SUMBER #2: ICD-10 FKTP (Kemenkes/BPJS)

**Deskripsi**: Daftar lengkap kode ICD-10 yang berlaku untuk klaim BPJS di FKTP, termasuk diagnosis yang masuk kompetensi dokter umum (SKDI 4A).

**Penerbit**: BPJS Kesehatan + Direktorat Jenderal Pelayanan Kesehatan Kemenkes

**Status lisensi**: Public document untuk penggunaan operasional layanan BPJS.

**Cara akses**:

1. **Sumber utama**: Portal BPJS Kesehatan ⚠️ `https://bpjs-kesehatan.go.id/` → Layanan → e-Klaim → Tabel Referensi
2. **Sumber alternatif**: Aplikasi P-Care BPJS (jika tim punya akses) → Master Data → ICD-10
3. **Sumber tersier**: ⚠️ Search: `"ICD-10 FKTP" site:bpjs-kesehatan.go.id filetype:xlsx`

**Versi yang relevan**:
- **Edisi terbaru** (cek tanggal update di file Excel)
- Format biasanya: `.xlsx` dengan sheet untuk Diagnosis Primer, Diagnosis Sekunder, dan Procedure Codes

**Action steps**:
1. ✅ Download file Excel dari portal BPJS
2. ✅ Screenshot bukti download
3. ✅ Generate hash + log
4. ✅ Buka file dan **catat metadata penting**:
   - Jumlah baris (total kode)
   - Tanggal terakhir update (biasanya tertulis di sheet "Info" atau "Cover")
   - Sheet yang relevan untuk SKDI 4A
5. ✅ Rename: `T1_S02_ICD10_FKTP_v{tanggal_update}_acc2026-04-XX.xlsx`
6. ✅ Tulis `notes.md` dengan struktur kolom Excel (untuk persiapan ekstraksi nanti)

**Output yang diharapkan**:
- File Excel (~5-15 MB)
- Dokumentasi struktur kolom (header mapping)
- Hash + bukti

**Estimasi waktu**: 1-2 jam

---

### 🔴 SUMBER #3: PNPK 2023-2024 (Kemenkes)

**Deskripsi**: Pedoman Nasional Pelayanan Kedokteran — panduan standar nasional untuk penyakit prioritas, dirilis per penyakit oleh Kemenkes melalui Keputusan Menteri Kesehatan (KMK).

**Penerbit**: Kementerian Kesehatan RI

**Status lisensi**: **Public domain** sebagai dokumen pemerintah (UU 14/2008 tentang Keterbukaan Informasi Publik). Boleh redistribute dengan atribusi.

**Cara akses**:

1. **Sumber utama**: Portal Yankes Kemenkes ⚠️ `https://yankes.kemkes.go.id/` → Pedoman → PNPK
2. **Sumber alternatif**: JDIH Kemenkes ⚠️ `https://jdih.kemkes.go.id/` → Search: "PNPK"
3. **Sumber tersier**: Search ⚠️ `"Pedoman Nasional Pelayanan Kedokteran" site:kemkes.go.id filetype:pdf`

**4 file yang dimaksud** (perlu Dr. Ferdi konfirmasi nama spesifik 4 PNPK ini):
- Kemungkinan: PNPK Diabetes Melitus, PNPK Hipertensi, PNPK TB, PNPK COVID-19, atau lainnya
- **Action**: Identifikasi dulu 4 PNPK mana yang dimaksud, sesuaikan dengan 144 SKDI 4A yang menjadi scope v1

**Action steps untuk setiap PNPK**:
1. ✅ Identifikasi nomor KMK (misal: KMK No. HK.01.07/MENKES/XXX/2023)
2. ✅ Download PDF
3. ✅ Verifikasi tanda tangan/cap KMK di halaman pertama (untuk autentikasi)
4. ✅ Hash + log
5. ✅ Rename: `T1_S03_PNPK_{NamaPenyakit}_KMK_{nomor}_acc2026-04-XX.pdf`
6. ✅ Tulis `notes.md` dengan: nomor KMK, tanggal terbit, penyakit yang dibahas

**Output yang diharapkan**:
- 4 file PDF terpisah (atau bundle jika ada)
- Mapping table: PNPK → ICD-10 → SKDI 4A code

**Estimasi waktu**: 4-6 jam (4 file × 1-1.5 jam masing-masing)

---

### 🟡 SUMBER #4: PPK Penyakit Dalam 2024 (PAPDI)

**Deskripsi**: Panduan Praktik Klinis spesialis penyakit dalam dari Perhimpunan Dokter Spesialis Penyakit Dalam Indonesia. Berguna untuk **enrichment data** (dx banding lebih dalam, tatalaksana yang lebih detail untuk kasus kompleks).

**Penerbit**: PB PAPDI

**Status lisensi**: Buku/dokumen profesi medis. **Mungkin perlu pembelian** (cek website PAPDI). Distribusi terbatas anggota PAPDI.

**Cara akses**:

1. **Sumber utama**: Website PAPDI ⚠️ `https://www.pbpapdi.id/` → Publikasi
2. **Alternatif**: Kontak Sekretariat PAPDI untuk request copy untuk research/educational use
3. **Konsekuensi**: Karena status berbayar dan terbatas, ini cocok di Tier 3 (defer ke v2 atau setelah Tier 1 selesai)

**Action steps**:
1. ✅ Cek status ketersediaan publik vs berbayar di website PAPDI
2. ✅ Jika berbayar → submit purchase request via tim procurement Sentra
3. ✅ Jika gratis untuk anggota → koordinasi dengan dokter spesialis advisor (dr. Dibya Arfianda atau dr. Boyong Baskoro per Phase 0 doc) untuk akses
4. ✅ Setelah dapat: hash + log + rename
5. ✅ **Catat batas EULA**: untuk internal reference saja, tidak boleh di-redistribute via NPM package

**Output yang diharapkan**:
- File PDF (jika dapat)
- ATAU dokumentasi alasan tidak bisa diakses di v1 (defer note)

**Estimasi waktu**: 1-2 minggu (procurement / koordinasi)

---

### 🟠 SUMBER #5: FORNAS (Kemenkes)

**Deskripsi**: Formularium Nasional — daftar resmi obat yang ditanggung BPJS, dengan klasifikasi berdasarkan level fasilitas (FKTP/FKRTL), kategori terapi, dan restriksi penggunaan.

**Penerbit**: Kementerian Kesehatan RI

**Status lisensi**: **Public domain** — dokumen pemerintah.

**Cara akses**:

1. **Sumber utama**: ⚠️ `https://farmalkes.kemkes.go.id/` → Formularium Nasional
2. **Sumber alternatif**: JDIH Kemenkes — search "FORNAS"
3. **Versi yang ada**: FORNAS 2023, FORNAS 2024 (jika sudah dirilis)

⚠️ **PENTING**: Brief Dr. Ferdi menyebutkan FORNAS 2023, tapi **per akhir 2024 Kemenkes telah merilis FORNAS 2024** (KMK No. HK.01.07/MENKES/4505/2024 atau sejenisnya). **Verifikasi versi terbaru** sebelum download.

**Action steps**:
1. ✅ Cek versi terbaru di farmalkes.kemkes.go.id
2. ✅ Download PDF (biasanya 2 file: dokumen utama + lampiran)
3. ✅ Hash + log + rename
4. ✅ Tulis `notes.md`: jumlah obat, struktur kategorisasi, fitting dengan 222 obat existing yang sudah ada
5. ✅ **Cek changelog** dari FORNAS lama ke baru — obat apa yang ditambah/dihapus/direvisi

**Output yang diharapkan**:
- File FORNAS PDF terbaru
- Dokumentasi diff dari versi sebelumnya (jika ada)

**Estimasi waktu**: 2-3 jam

---

### 🟠 SUMBER #6: MIMS Indonesia 2024

**Deskripsi**: Database lengkap obat-obatan yang beredar di Indonesia, mencakup nama generik, nama dagang, indikasi, dosis, kontraindikasi, efek samping, mekanisme kerja, peringatan, dan interaksi.

**Penerbit**: MIMS (komersial)

**Status lisensi**: **PROPRIETARY — BERBAYAR**. Tidak boleh di-redistribute. Penggunaan harus sesuai EULA MIMS.

**Cara akses**:

1. **Procurement**: Kontak MIMS Indonesia untuk **enterprise/institutional license**
   - Website: ⚠️ `https://www.mims.com/indonesia/`
   - Email business: cari di "Contact Us" → Enterprise Sales
2. **Format yang biasanya tersedia**:
   - Buku cetak tahunan (MIMS Indonesia Annual Reference)
   - MIMS Online subscription (lebih disarankan untuk integration)
   - API access (untuk enterprise, perlu negosiasi)
3. **Pertanyaan kritis ke MIMS sales**:
   - Apakah ada lisensi untuk *integration into clinical decision support system*?
   - Bagaimana model lisensi: per-user, per-query, atau enterprise unlimited?
   - Apakah boleh menyimpan ekstrak data di internal database?
   - Apakah API tersedia, dan dengan SLA apa?

**Action steps**:
1. ✅ Submit RFP/inquiry ke MIMS Indonesia (template: Lampiran B)
2. ✅ Diskusi terms & pricing — siapkan budget alokasi
3. ✅ Negosiasi kontrak — wajib ada klausul untuk CDSS use case
4. ✅ Setelah kontrak signed → setup akses (akun online atau delivery buku)
5. ✅ Dokumentasikan **batasan lisensi** dalam `LICENSES/06_mims_indonesia_terms.md`

**⚠️ Risiko**:
- MIMS bisa menolak lisensi untuk CDSS jika dianggap kompetitif dengan produk mereka
- Pricing bisa sangat tinggi untuk enterprise license
- **Rencana cadangan**: jika MIMS tidak feasible, kombinasikan FORNAS (untuk FKTP scope) + DrugBank (untuk DDI) + manual curation untuk gap

**Output yang diharapkan**:
- Kontrak MIMS yang signed
- Akses ke data (online portal atau API credentials)
- Dokumentasi terms & restrictions

**Estimasi waktu**: 2-4 minggu (negosiasi + signing)

---

### 🟡 SUMBER #7: ISO Farmakoterapi Indonesia

**Deskripsi**: Informasi Spesialite Obat — daftar nama dagang obat di Indonesia dengan informasi kemasan, harga, dan distributor.

**Penerbit**: Ikatan Sarjana Farmasi Indonesia (ISFI) / Penerbit komersial

**Status lisensi**: **Berbayar**. Buku cetak tahunan.

**Cara akses**:

1. Beli buku cetak ISO Indonesia edisi terbaru (biasanya tersedia di toko buku medis atau langsung ke penerbit)
2. **Konsekuensi**: Format buku → perlu manual entry atau OCR untuk masuk database
3. Cocok di Tier 3 — defer setelah Tier 1 & 2 selesai

**Action steps**:
1. ✅ Beli edisi terbaru via tim procurement
2. ✅ Setelah dapat → scan/digitalize halaman yang relevan (perhatikan copyright!)
3. ✅ Catat: edisi tahun, jumlah obat tercantum, struktur informasi
4. ✅ Untuk v1, **opsional** — bisa di-skip jika MIMS sudah cover nama dagang

**Output yang diharapkan**:
- Buku fisik atau scan halaman relevan (untuk internal reference saja)

**Estimasi waktu**: 1 minggu (procurement + delivery)

---

### 🟠 SUMBER #8: Kategori Kehamilan FDA/ADEC

**Deskripsi**: Klasifikasi keamanan obat untuk ibu hamil — kategori A, B, C, D, X dari FDA (US) atau A, B1, B2, B3, C, D, X dari ADEC (Australia).

**Status lisensi**: **Public domain** (dokumen regulator). Boleh diintegrasikan dengan atribusi.

**Cara akses**:

1. **FDA Pregnancy Categories**: ⚠️ `https://www.fda.gov/` — search "Pregnancy and Lactation Labeling Rule" (FDA telah migrasi dari kategori ABCX ke narrative system sejak 2015 — perlu mapping)
2. **ADEC Categories**: TGA Australia ⚠️ `https://www.tga.gov.au/` → Prescribing medicines in pregnancy database
3. **Sumber tersier untuk mapping cepat**: Drugs.com Pregnancy Category lookup
4. **Alternatif lokal**: Sub-spesialis Maternal-Fetal Medicine Indonesia mungkin punya kompilasi

**Action steps**:
1. ✅ Download dokumen rujukan FDA/ADEC
2. ✅ Cari **mapping table** yang konversi obat → kategori
3. ✅ Cross-reference dengan 222 obat FORNAS yang sudah ada
4. ✅ Catat: 1 obat bisa punya multiple sources (FDA = C, ADEC = B3, dst) — perlu strategi konsolidasi
5. ✅ Hash + log + rename

**Output yang diharapkan**:
- Reference document dari FDA/TGA
- Mapping table draft (akan diperkaya di fase ekstraksi)

**Estimasi waktu**: 1 hari

---

### 🟠 SUMBER #9: MIMS Online (Penyesuaian Dosis Ginjal & Hati)

**Deskripsi**: Data penyesuaian dosis untuk pasien dengan gangguan ginjal (CKD stage 1-5) dan gangguan hati (Child-Pugh A/B/C) — informasi kritis untuk safety prescribing.

**Status lisensi**: Bagian dari MIMS Online subscription (lihat #6).

**Cara akses**:

1. Login ke MIMS Online (setelah lisensi #6 didapat)
2. Akses per obat → tab "Dosing Adjustment"
3. **Tantangan**: data ini biasanya **tidak terstruktur** — harus dilakukan **manual web scraping atau manual entry** per obat
4. Estimasi: 222 obat × ~5 menit/obat = 18 jam manual entry

**Action steps**:
1. ✅ Confirm akses tersedia di lisensi MIMS
2. ✅ Buat **template ekstraksi** (Excel atau Google Sheets) dengan kolom:
   - Nama obat | CrCl >50 | CrCl 30-50 | CrCl 10-30 | CrCl <10 | Hepatic mild | Hepatic mod | Hepatic severe
3. ✅ Prioritas: 30-50 obat paling sering digunakan di FKTP (paretto)
4. ✅ Sisanya: defer ke v1.5
5. ✅ Cek apakah MIMS Online menyediakan **bulk export** atau API — jika ya, ini akan accelerate banyak

**Output yang diharapkan**:
- Spreadsheet penyesuaian dosis untuk top-50 obat FKTP
- Plan untuk sisanya

**Estimasi waktu**: 2-3 minggu (incremental, dilakukan oleh apoteker reviewer)

---

### 🔴 SUMBER #10: Riskesdas (Kemenkes / Litbang)

**Deskripsi**: Riset Kesehatan Dasar — survei nasional epidemiologi yang dilakukan periodik (terakhir 2018, **Riskesdas 2023** dirilis 2024). Berisi prevalensi penyakit, faktor risiko, perilaku kesehatan per provinsi.

**Penerbit**: Badan Kebijakan Pembangunan Kesehatan (BKPK, dulu Litbangkes) Kemenkes

**Status lisensi**: **Public domain**.

**Cara akses**:

1. **Sumber utama**: ⚠️ `https://layanandata.kemkes.go.id/` atau ⚠️ `https://www.kemkes.go.id/` → search "Riskesdas 2023"
2. **Repositori akademik**: ⚠️ `https://repository.litbang.kemkes.go.id/`
3. **Format yang tersedia**:
   - Laporan Nasional (PDF, ~600+ halaman)
   - Laporan per Provinsi (34 file PDF)
   - **Dataset mentah** (jika tersedia, format SPSS atau Excel)

**Action steps**:
1. ✅ Download Laporan Nasional Riskesdas 2023 (versi terbaru)
2. ✅ Download laporan per provinsi yang relevan dengan target deployment Sentra (mulai dari Jawa Timur untuk Puskesmas Balowerti, lalu expand)
3. ✅ Hash + log untuk semua file
4. ✅ Identifikasi tabel/grafik yang relevan untuk 144 SKDI 4A:
   - Prevalensi diabetes, hipertensi, TB, ISPA, dll
   - Faktor risiko per kelompok usia
5. ✅ Tulis `notes.md` dengan **page mapping** untuk akselerasi ekstraksi

**Output yang diharapkan**:
- Laporan Nasional Riskesdas 2023
- 1-3 laporan provinsi prioritas
- Page index untuk data relevan

**Estimasi waktu**: 4-6 jam

---

### 🟡 SUMBER #11: DrugBank / Medscape

**Deskripsi**: Database internasional drug information dengan detail mekanisme molekular, drug-drug interaction (DDI), pharmacokinetics, dan clinical trial data.

**Penerbit**: DrugBank (University of Alberta) / Medscape (WebMD)

**Status lisensi**:
- **DrugBank**: Free academic license tersedia, commercial use perlu lisensi terpisah. ⚠️ `https://go.drugbank.com/releases/latest`
- **Medscape**: Free dengan registrasi, tapi **bukan untuk redistribusi atau bulk extraction**

**Cara akses DrugBank (preferred untuk Sentra)**:

1. Daftar akun di ⚠️ `https://go.drugbank.com/`
2. Submit **academic/research license application** (sebutkan: clinical decision support research di Indonesia)
3. Setelah approved → download database file (XML/CSV format)
4. Untuk **commercial use** (CDSS production): contact DrugBank business team untuk commercial license

**Action steps**:
1. ✅ Submit academic license dulu (untuk development/research phase)
2. ✅ Setelah approved (1-2 minggu) → download dataset
3. ✅ **PARALEL**: inisiasi commercial license discussion untuk production
4. ✅ Hash + log
5. ✅ Cross-reference dengan DDInter 2.0 yang sudah ada (173,071 interaksi) — DrugBank bisa enrich dengan mechanism detail

**Output yang diharapkan**:
- DrugBank academic dataset (XML/CSV)
- Status commercial license discussion

**Estimasi waktu**: 2-3 minggu (license approval + download)

---

### 🟢 SUMBER #12: OpenMRS CIEL Concept Dictionary

**Deskripsi**: Concept Dictionary dari Columbia International eHealth Laboratory — mapping antara berbagai coding system (ICD-10, SNOMED CT, LOINC, RxNorm) untuk interoperability.

**Penerbit**: OpenMRS Community + CIEL

**Status lisensi**: **Open source** (Mozilla Public License 2.0). Free to use & redistribute dengan atribusi.

**Cara akses**:

1. Repositori GitHub OpenMRS: ⚠️ `https://github.com/openmrs/openmrs-module-mks` atau search "OpenMRS CIEL Dictionary download"
2. **OCL (Open Concept Lab)**: ⚠️ `https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/` — registrasi free
3. Format: SQL dump (bisa langsung di-import ke MySQL/PostgreSQL) atau API JSON

**Action steps**:
1. ✅ Daftar akun OCL
2. ✅ Download CIEL dictionary terbaru (snapshot)
3. ✅ Hash + log
4. ✅ Inspect file: jumlah concept, mapping coverage untuk Indonesia (mungkin perlu translate beberapa)
5. ✅ Plan: untuk v1 fokus pada concept yang punya mapping ICD-10 → CIEL Concept ID

**Output yang diharapkan**:
- CIEL dictionary file (SQL/JSON)
- Mapping coverage report untuk 144 SKDI 4A

**Estimasi waktu**: 1 hari

---

## 5. TAHAP VERIFIKASI & AUDIT (Minggu 3, Berkelanjutan)

Setelah semua sumber terkumpul, mari kita pastikan integritas data lewat audit terstruktur.

### 5.1 Master Inventory File

Buat file `00_metadata/INVENTORY.md` dengan format:

```markdown
# Master Inventory — Sentra Clinical Sources

| ID | Sumber | Versi | Format | Size | Hash (SHA-256) | Acquired | Acquired By | License Status | Notes |
|----|--------|-------|--------|------|----------------|----------|-------------|----------------|-------|
| S01 | PPK FKTP | 2017 rev II | PDF | 35 MB | abc123... | 2026-04-25 | Dr. Ferdi | Public, permission requested | 657 hal |
| S02 | ICD-10 FKTP | 2024.07 | XLSX | 8 MB | def456... | 2026-04-25 | Tim Dev | Public | 18,543 codes |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
```

### 5.2 Acquisition Log (CSV untuk audit trail)

File `00_metadata/ACQUISITION_LOG.csv`:

```csv
timestamp_utc,source_id,action,filename,size_bytes,hash_sha256,downloader_email,source_url,notes
2026-04-25T08:30:00Z,S01,download,T1_S01_PPK_FKTP_v2017_acc2026-04-25.pdf,36700160,abc123...,ferdi@sentra.id,https://idionline.org/...,Verified author=PB IDI
2026-04-25T09:15:00Z,S02,download,T1_S02_ICD10_FKTP_v2024.07_acc2026-04-25.xlsx,8388608,def456...,dev@sentra.id,https://bpjs-kesehatan.go.id/...,Sheet: ICD10_FKTP_2024
```

### 5.3 Verification Checklist per Sumber

Untuk setiap sumber, pastikan:

- [ ] File sudah ada di folder yang benar (sesuai tier)
- [ ] Naming convention diikuti
- [ ] Hash SHA-256 ter-generate dan ter-log
- [ ] Bukti download (screenshot URL bar + halaman download) tersimpan di `verification/`
- [ ] `notes.md` per sumber sudah diisi dengan: URL akses, tanggal, downloader, observasi awal
- [ ] Status lisensi terdokumentasi di `LICENSES/`
- [ ] Untuk sumber berbayar: kontrak/PO ter-attach
- [ ] File dapat dibuka dan dibaca (tidak corrupt)

### 5.4 Cross-Verification dengan Independent Source

Untuk sumber kritis (PPK FKTP, PNPK, FORNAS), lakukan **double-check** dengan dokter validator:

> **Dokter Validator**, mohon konfirmasi bahwa file `T1_S01_PPK_FKTP_v2017_acc2026-04-25.pdf` adalah versi resmi yang biasa digunakan di praktik klinis Anda. Buka halaman 1 dan halaman terakhir, foto dan kirim ke tim akuisisi sebagai bukti otentikasi.

Ini menambah lapisan **clinical verification** di atas technical verification.

---

## 6. TAHAP BACKUP & VERSION CONTROL (Berkelanjutan)

### 6.1 Strategi Backup 3-2-1

- **3 copies**: working copy + cloud backup + offline backup
- **2 different media**: cloud (S3/Drive) + external SSD
- **1 offsite**: minimal di region berbeda (untuk cloud)

**Tools**:
- **Primary**: Google Drive Enterprise atau OneDrive for Business (encrypted, dengan retention policy)
- **Secondary**: AWS S3 Glacier (untuk archive, cheap + secure)
- **Tertiary**: External SSD ter-encrypt yang disimpan di lokasi fisik berbeda

### 6.2 Git LFS untuk Tracking Metadata

Folder `00_metadata/` di-track via Git (untuk audit trail), file binary (PDF, XLSX) di-track via Git LFS jika ukurannya kecil. File besar tidak masuk Git — hanya hash-nya yang ter-log di `INVENTORY.md`.

```bash
# Setup awal
git init sentra-clinical-sources
git lfs install
git lfs track "*.pdf" "*.xlsx"
echo "00_metadata/" >> .gitkeep_index
git add 00_metadata/
git commit -m "chore: initial inventory & metadata structure"
```

### 6.3 Retention & Versioning Policy

- **Active sources**: retain forever
- **Superseded versions** (e.g., FORNAS 2023 setelah dapat 2024): pindah ke `99_archive/` dengan timestamp
- **Failed downloads / corrupt files**: pindah ke `99_archive/failed/` dengan note alasan
- **Audit log**: never delete, only append

---

## 7. HANDOFF KE FASE EKSTRAKSI

### 7.1 Definisi "Ready for Extraction"

Suatu sumber dianggap **siap masuk fase ekstraksi** jika:

- ✅ File ada di folder yang benar
- ✅ Hash + log + bukti lengkap
- ✅ Status lisensi clear (boleh diproses)
- ✅ `notes.md` sudah diisi dengan struktur dokumen
- ✅ Dokter validator (untuk Tier 1) sudah konfirmasi otentisitas
- ✅ Approval gate dari Dr. Ferdi (Clinical Steward) sudah granted

### 7.2 Handoff Document

Buat file `HANDOFF_to_Extraction_Phase.md` dengan format Phase 2 governance Sentra:

```markdown
---
title: Handoff — Pengumpulan Bahan ke Ekstraksi Data
phase: data_acquisition_to_extraction
date: 2026-05-XX
clinical_steward: Dr. Ferdi Iskandar
status: GO_PENDING_APPROVAL
---

# Summary
Fase pengumpulan bahan untuk Sentra CDSS v1 telah selesai dengan rincian:
- Total sumber yang berhasil diakuisisi: X / 12
- Sumber Tier 1 (wajib v1): 4/4 ✅
- Sumber Tier 2 (v1.5): X/4
- Sumber Tier 3 (v2): X/3
- Sumber Tier 4 (integration): 1/1

# Deliverables
- INVENTORY.md (master list)
- ACQUISITION_LOG.csv (audit trail)
- 12 folder sumber dengan struktur baku
- LICENSES/ folder dengan dokumen lisensi

# Risks Identified
- [List risiko yang muncul selama akuisisi]

# Approval Gate
- [ ] Chief Clinical Steward (Dr. Ferdi): _____________
- [ ] Tech Lead: _____________
- [ ] Legal/Compliance: _____________
```

---

## 8. CHECKLIST MASTER (Quick Reference)

### Tahap Persiapan (Minggu 0)
- [ ] Workspace folder structure dibuat
- [ ] Tools terinstall (sha256sum, pdfinfo, dll)
- [ ] Cloud storage dengan backup setup
- [ ] Email institusional `data-acquisition@sentra.id` aktif
- [ ] Legal pre-check selesai
- [ ] Team alignment meeting
- [ ] Acquisition log template ready

### Tahap Akuisisi Tier 1 (Minggu 1)
- [ ] PPK FKTP didownload + diverifikasi
- [ ] ICD-10 FKTP didownload + diverifikasi
- [ ] PNPK 2023-2024 (4 file) didownload + diverifikasi
- [ ] Riskesdas 2023 didownload + diverifikasi
- [ ] Permission letter ke PB IDI dikirim

### Tahap Akuisisi Tier 2 (Minggu 2-3)
- [ ] FORNAS terbaru didownload
- [ ] MIMS Indonesia kontrak ditandatangani
- [ ] Pregnancy Category sources dikumpulkan
- [ ] MIMS Online akses aktif

### Tahap Akuisisi Tier 3 (Minggu 3-4)
- [ ] PPK PAPDI procurement (jika feasible)
- [ ] ISO Farmakoterapi dibeli
- [ ] DrugBank academic license aktif

### Tahap Akuisisi Tier 4 (Minggu 4)
- [ ] OpenMRS CIEL didownload

### Tahap Verifikasi (Berkelanjutan)
- [ ] INVENTORY.md komplit
- [ ] ACQUISITION_LOG.csv ter-update
- [ ] Hash semua file ter-verify
- [ ] Dokter validator konfirmasi otentisitas Tier 1

### Tahap Handoff (Akhir Minggu 4)
- [ ] HANDOFF_to_Extraction_Phase.md disiapkan
- [ ] Approval gate ditandatangani
- [ ] Backup 3-2-1 verified
- [ ] Tim ekstraksi briefed

---

## 9. RISIKO & MITIGASI

| # | Risiko | Probabilitas | Dampak | Mitigasi |
|---|--------|--------------|--------|----------|
| R1 | URL pemerintah berubah, file tidak ditemukan | Tinggi | Sedang | Coba multiple sumber (Yankes, JDIH, repository), kontak Kemenkes via email |
| R2 | MIMS license terlalu mahal atau menolak CDSS use | Sedang | Tinggi | Plan B: kombinasi FORNAS + DrugBank + manual curation |
| R3 | PB IDI tidak respon permission request | Tinggi | Sedang | Lanjutkan akuisisi (PPK FKTP public document), eskalasi via dokter advisor yang anggota IDI |
| R4 | File PDF corrupt atau tidak lengkap | Rendah | Tinggi | Hash verification, download dari multiple sumber, validate dengan dokter |
| R5 | Versi dokumen sudah obsolete (FORNAS 2023 vs 2024) | Tinggi | Tinggi | **WAJIB cek versi terbaru sebelum download**, tracking changelog |
| R6 | DrugBank academic license ditolak | Sedang | Sedang | Mulai discussion commercial license paralel sejak awal |
| R7 | Storage compromise (kebocoran lisensi MIMS) | Rendah | Critical | Encrypted storage, access control, audit log |
| R8 | Dokter validator tidak available untuk verifikasi | Sedang | Sedang | Backup validator, asynchronous review process |
| R9 | Lisensi yang berbeda menyulitkan unified database | Sedang | Tinggi | Clear data lineage tagging — setiap field tahu sumbernya |
| R10 | Tim akuisisi miss versi terbaru karena tidak monitoring | Sedang | Sedang | Quarterly review process, subscribe ke newsletter Kemenkes |

---

## 10. LAMPIRAN

### Lampiran A: Template Surat Permission ke PB IDI

```
[Kop surat Sentra Healthcare Solutions]

Nomor: 001/SENTRA/IV/2026
Perihal: Permohonan Izin Penggunaan PPK FKTP untuk Clinical Decision Support System

Kepada Yth.
Pengurus Besar Ikatan Dokter Indonesia (PB IDI)
Di tempat

Dengan hormat,

Sentra Healthcare Solutions adalah platform AI klinis yang dikembangkan untuk
mendukung dokter umum di fasilitas kesehatan tingkat pertama (FKTP) di Indonesia
dalam pengambilan keputusan klinis berbasis bukti.

Sebagai bagian dari komitmen kami terhadap kualitas dan keamanan klinis, kami
ingin menggunakan Panduan Praktik Klinis bagi Dokter di Fasilitas Pelayanan
Kesehatan Primer yang diterbitkan oleh PB IDI sebagai salah satu sumber referensi
utama dalam sistem Clinical Decision Support System (CDSS) kami.

Kami memohon izin tertulis untuk:
1. Menggunakan konten PPK FKTP sebagai basis pengetahuan dalam CDSS Sentra
2. Mencantumkan PB IDI sebagai sumber pada setiap rekomendasi yang merujuk PPK
3. Mendokumentasikan penggunaan ini dalam sistem audit trail kami

Kami berkomitmen untuk:
- Tidak mendistribusikan ulang dokumen PPK secara verbatim
- Menjaga akurasi penggunaan dengan validasi oleh dokter penguji kami
- Memberikan atribusi yang jelas kepada PB IDI

Sebagai informasi tambahan, tim klinis kami diketuai oleh dr. Ferdi Iskandar
selaku Clinical Steward, dengan dukungan dari dokter spesialis [nama] dan [nama]
yang juga merupakan anggota IDI.

Kami terbuka untuk diskusi lebih lanjut, termasuk demo platform dan presentasi
metodologi clinical validation kami.

Hormat kami,

Dr. Ferdi Iskandar
Founder & Clinical Steward
Sentra Healthcare Solutions
```

### Lampiran B: Template RFP ke MIMS Indonesia

```
Subject: Enterprise License Inquiry — MIMS Indonesia Data for Clinical Decision Support

Dear MIMS Indonesia Enterprise Sales Team,

We are Sentra Healthcare Solutions, an Indonesian health-tech company developing
a Clinical Decision Support System (CDSS) for primary care facilities.

We are interested in licensing MIMS Indonesia data for integration into our
platform. Specific use case:

1. Drug information lookup (dosage, contraindications, side effects)
2. Drug-drug interaction checking
3. Renal/hepatic dose adjustment recommendations
4. Pregnancy safety category reference

Scale of deployment (target):
- Year 1: 50 primary care facilities, ~1,500 active users
- Year 2: 200 facilities, ~6,000 users

We would like to discuss:
- Licensing model (per-user, per-query, enterprise unlimited?)
- API availability and SLA
- Data update frequency
- Permitted use within CDSS
- Pricing structure

We are committed to fully respecting MIMS intellectual property and would welcome
the opportunity for a discovery call to discuss our use case in detail.

Please advise on the next steps.

Best regards,
Dr. Ferdi Iskandar
Founder & CEO
Sentra Healthcare Solutions
ferdi@sentra.id
```

### Lampiran C: Daftar Kontak Penting

| Institusi | Email/Kontak | Tujuan |
|-----------|--------------|--------|
| PB IDI | sekretariat@idionline.org (verifikasi) | Permission PPK FKTP |
| Kemenkes Yankes | yankes@kemkes.go.id (verifikasi) | PNPK clarification |
| BPJS Kesehatan | care@bpjs-kesehatan.go.id | ICD-10 FKTP terbaru |
| MIMS Indonesia | (cari di website MIMS) | Enterprise license |
| DrugBank | sales@drugbank.com | Commercial license |
| OpenMRS Community | community@openmrs.org | CIEL dictionary |

---

## 11. PENUTUP & NEXT STEPS

Setelah panduan ini selesai dieksekusi (estimasi 4 minggu), tim Sentra akan memiliki **fondasi data yang ter-audit, ter-verifikasi, dan ter-dokumentasi dengan rapi** — siap untuk masuk ke fase berikutnya:

> **FASE 2 — EKSTRAKSI & KURASI DATA**
>
> Mengubah PDF/Excel mentah menjadi structured data yang siap masuk PostgreSQL + pgvector, dengan validasi klinis oleh dokter penguji.

Panduan untuk Fase 2 akan disusun sebagai dokumen terpisah: `02_PANDUAN_EKSTRAKSI_DATA_SENTRA_CDSS_v1.md`

---

**Dokumen ini adalah living document. Setiap perubahan harus dicatat dengan changelog di bawah.**

## Changelog

| Versi | Tanggal | Author | Perubahan |
|-------|---------|--------|-----------|
| 1.0 | 2026-04-23 | Initial draft | Pembuatan awal panduan untuk 12 sumber |

---

*End of Document — `01_PANDUAN_PENGUMPULAN_BAHAN_SENTRA_CDSS_v1.md`*
