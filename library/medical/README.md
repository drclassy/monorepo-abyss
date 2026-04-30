# Classy Medical Library (AML) — The Penthouse
<!-- Single Source of Truth for Clinical References & Medical Literature -->
<!-- Last Updated: 2026-04-23 -->

## §0 — Mission
**"Setiap Nyawa Berharga"**
Library ini adalah repositori pusat untuk seluruh literatur medis, pedoman praktik klinis (PPK), dan data farmakologi yang digunakan oleh ekosistem **Classy** dan **Sentra Healthcare Solutions**. Data di sini menjadi "otak" bagi `SentraRAGEngine` dan asisten klinis Kate Voss.

## §1 — Directory Structure (36 Pillars)
Setiap folder menggunakan kode 3-huruf sebagai standar pengelompokan disiplin ilmu kedokteran spesialisik:

| Code | Specialty | Field |
|---|---|---|
| `int` | Internal Medicine | Ilmu Penyakit Dalam |
| `ped` | Pediatrics | Ilmu Kesehatan Anak |
| `sur` | General Surgery | Ilmu Bedah Umum |
| `obg` | Obstetrics & Gynecology | Kebidanan & Kandungan |
| `neu` | Neurology | Ilmu Penyakit Saraf |
| `psy` | Psychiatry | Ilmu Kesehatan Jiwa |
| `car` | Cardiology | Jantung & Pembuluh Darah |
| `pul` | Pulmonology | Pulmonologi & Kedokteran Respirasi |
| `oph` | Ophthalmology | Ilmu Penyakit Mata |
| `ent` | ENT (Ear, Nose, Throat) | THT-KL |
| `der` | Dermatology | Ilmu Kesehatan Kulit & Kelamin |
| `ane` | Anesthesiology | Anestesiologi & Terapi Intensif |
| `rad` | Radiology | Radiologi |
| `cpa` | Clinical Pathology | Patologi Klinik |
| `apa` | Anatomical Pathology | Patologi Anatomi |
| `for` | Forensics | Kedokteran Forensik & Medikolegal |
| `pmr` | Physiatry (PMR) | Kedokteran Fisik & Rehabilitasi |
| `nsu` | Neurosurgery | Bedah Saraf |
| `ort` | Orthopedics | Bedah Ortopedi & Traumatologi |
| `uro` | Urology | Bedah Urologi |
| `pla` | Plastic Surgery | Bedah Plastik Rekonstruksi & Estetik |
| `tcv` | Thoracic & Cardiovasc | Bedah Toraks, Kardiak & Vaskular |
| `psu` | Pediatric Surgery | Bedah Anak |
| `nut` | Clinical Nutrition | Gizi Klinik |
| `occ` | Occupational Medicine | Kedokteran Okupasi |
| `spo` | Sports Medicine | Kedokteran Olahraga |
| `nuc` | Nuclear Medicine | Kedokteran Nuklir |
| `mic` | Clinical Microbiology | Mikrobiologi Klinik |
| `pha` | Clinical Pharmacology | Farmakologi Klinik |
| `kkp` | Primary Care | Kedokteran Keluarga Layanan Primer |
| `ron` | Radiation Oncology | Onkologi Radiasi |
| `eme` | Emergency Medicine | Kedokteran Emergensi |
| `ger` | Geriatrics | Kedokteran Geriatri |
| `par` | Clinical Parasitology | Parasitologi Klinik |
| `aer` | Aerospace Medicine | Kedokteran Penerbangan |
| `ven` | Venerology | Venereologi (Pelengkap `der`) |

## §2 — Data Governance
1. **AI Supports, Human Decides:** Konten di sini digunakan untuk augmentasi keputusan klinis, bukan pengganti lisensi dokter.
2. **Provenance:** Seluruh dokumen wajib memiliki sumber yang jelas (KMK, PMK, Pedoman Organisasi Profesi, atau Medical Journal).
3. **Integrity:** Folder `archive/` digunakan untuk pedoman yang sudah superceded (kadaluwarsa).

## §3 — Engineering Note (RAG Pipeline)
Pipeline `SentraRAGEngine` melakukan scanning rekursif terhadap folder ini.
- **Extractor:** PyMuPDF (fitz)
- **Model:** text-embedding-004 (Vertex AI) / Nomic-Embed (Local)
- **Store:** Neon PostgreSQL (pgvector)

---
**Chief:** Dr. Ferdi Iskandar (Classy)
**Representative:** Kate Voss
