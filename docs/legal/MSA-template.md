# Master Service Agreement (MSA) — Template
**Sentra / PT [Nama Badan Hukum Sentra]**  
**Versi:** 1.0 · **Tanggal:** [TANGGAL]

> Dokumen ini adalah template. Harus ditinjau dan ditandatangani oleh kuasa hukum
> sebelum digunakan dalam perjanjian nyata.

---

## Pihak-Pihak

**Penyedia Layanan:**  
Sentra / Dr. Ferdi Iskandar  
Email: ferdi@sentrahai.com  
(selanjutnya disebut "Sentra")

**Klien:**  
[Nama Instansi Pemerintah]  
[Alamat Resmi]  
[Nomor NPWP / Identitas Hukum]  
(selanjutnya disebut "Klien")

---

## 1. Lingkup Layanan

Sentra menyediakan akses ke platform kesehatan berbasis AI ("Platform") kepada Klien,
yang mencakup:
- Antarmuka pengguna (UI) sesuai paket yang disepakati
- Akses API dalam batas rate limit dan scope yang ditentukan
- Data milik Klien yang tersimpan dalam sistem Sentra
- Dukungan teknis sesuai SLA

**Yang tidak termasuk dalam layanan ini:**
- Source code Platform, termasuk engine AI, sistem reasoning, pipeline RAG, dan komponen
  internal Sentra lainnya
- Akses ke infrastruktur atau server Sentra
- Hak untuk memodifikasi, mendistribusikan, atau menyalin Platform

---

## 2. Kepemilikan Kekayaan Intelektual

2.1 Seluruh engine AI, sistem reasoning klinis, pipeline RAG, logika evaluasi, safety heuristic,
prompt system, model embedding, definisi alur kerja (flow definitions), dan kekayaan intelektual
terkait ("Engine Sentra") adalah milik eksklusif Sentra dan/atau Dr. Ferdi Iskandar.

2.2 Perjanjian ini tidak memberikan kepada Klien hak apapun atas Engine Sentra selain hak
untuk menggunakan output-nya melalui antarmuka yang disediakan.

2.3 Data yang dimasukkan oleh Klien ke dalam Platform tetap menjadi milik Klien. Sentra tidak
akan menggunakan data Klien untuk melatih model AI atau tujuan lain tanpa persetujuan tertulis.

2.4 Klien tidak boleh melakukan reverse engineering, decompiling, disassembling, atau upaya
apapun untuk mereproduksi Engine Sentra.

---

## 3. Kerahasiaan

3.1 Kedua pihak setuju untuk menjaga kerahasiaan informasi yang diterima dari pihak lain.

3.2 "Informasi Rahasia Sentra" mencakup: arsitektur Engine, kode sumber, logika klinis,
konfigurasi deployment, dan informasi bisnis internal.

3.3 "Informasi Rahasia Klien" mencakup: data pasien, data operasional pemerintah, dan
informasi kebijakan yang belum dipublikasikan.

3.4 Kewajiban kerahasiaan berlaku selama perjanjian ini aktif dan [3] tahun setelah berakhir.

---

## 4. SLA dan Ketersediaan Layanan

| Metrik | Target |
|---|---|
| Uptime bulanan | ≥ 99.5% |
| Response time API (P95) | ≤ 500ms |
| Waktu respons dukungan (Prioritas Tinggi) | ≤ 4 jam kerja |
| Pemulihan insiden kritis | ≤ 24 jam |

---

## 5. Harga dan Pembayaran

- Biaya langganan: [NOMINAL] per [bulan/tahun]
- Termin pembayaran: [NET 30 / bulanan di muka / tahunan di muka]
- Kenaikan harga: pemberitahuan minimum 30 hari sebelumnya

---

## 6. Jangka Waktu dan Pengakhiran

6.1 Perjanjian ini berlaku selama [12] bulan sejak tanggal penandatanganan.

6.2 Perpanjangan otomatis [Ya/Tidak] dengan periode [12] bulan kecuali ada pemberitahuan
pengakhiran 30 hari sebelum berakhir.

6.3 Sentra berhak mengakhiri perjanjian dengan pemberitahuan tertulis jika Klien melanggar
ketentuan kepemilikan IP atau kerahasiaan.

---

## 7. Batasan Tanggung Jawab

Sentra tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data, atau keputusan
klinis yang diambil berdasarkan output Platform. Platform adalah alat bantu — keputusan akhir
tetap di tangan tenaga medis berlisensi.

---

## 8. Hukum yang Berlaku

Perjanjian ini tunduk pada hukum Republik Indonesia. Sengketa diselesaikan melalui
musyawarah, dan jika tidak tercapai, melalui Pengadilan Negeri [KOTA].

---

## Tanda Tangan

| Sentra | Klien |
|---|---|
| Dr. Ferdi Iskandar | [Nama Pejabat Berwenang] |
| Direktur / Pendiri | [Jabatan] |
| Tanggal: _______ | Tanggal: _______ |
| Tanda tangan: _______ | Tanda tangan: _______ |
