# Sentra — Monorepo Architecture Reference
**Owner:** Dr. Ferdi Iskandar (Classy)  
**Updated:** 2026-04-30  
**Status:** Pegangan Chief — dokumen referensi lengkap

---

## 1. BIG PICTURE — Apa Itu Monorepo Ini?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ABYSS-MONOREPO                                    │
│                                                                      │
│  Satu repo, banyak aplikasi dan library yang saling terhubung.       │
│  Dikelola dengan Turborepo — build system untuk monorepo.            │
│                                                                      │
│  Analoginya: gedung kantor satu atap dengan banyak divisi.           │
│  Setiap divisi (app/package) punya tugasnya sendiri,                 │
│  tapi berbagi infrastruktur yang sama.                               │
└─────────────────────────────────────────────────────────────────────┘
```

**Kenapa monorepo?**
- Satu perintah build untuk semua
- Packages saling share tanpa publish ke npm publik
- Perubahan satu package langsung terasa di semua yang pakai
- Satu tempat untuk governance, rules, dan standards

---

## 2. STRUKTUR FOLDER UTAMA

```
abyss-monorepo/
│
├── apps/                    ← Aplikasi yang bisa diakses user
│   ├── healthcare/          ← Semua app klinis
│   │   ├── intelligenceboard/   Dashboard dokter & CDSS
│   │   ├── sentra-assist/       Browser extension untuk EMR
│   │   ├── referralink/         Jaringan rujukan AI
│   │   ├── sentra-main/         Website + gateway platform
│   │   └── primary-healthcare/  Suite puskesmas
│   │
│   ├── platform/            ← Infrastruktur platform
│   │   ├── orchestrator/        Otak koordinasi semua sistem
│   │   └── sentra-portal/       Portal akses partner & pemerintah
│   │
│   ├── academic/            ← Pendidikan & pelatihan
│   │   ├── clinical-simulator/  Simulasi kasus klinis
│   │   ├── evaluation-engine/   Penilaian kompetensi
│   │   └── academic-solutions/  UI akademik
│   │
│   ├── community/           ← Inovasi & R&D
│   │   ├── classy-memory/       AI memory persistence
│   │   └── classy-transformer/  Multi-LLM platform
│   │
│   ├── corporate/           ← Brand
│   │   ├── sentra-main/         Marketing website
│   │   └── ferdiiskandar/       Personal brand
│   │
│   └── prototype/           ← Eksperimen
│       └── agent-hermes/        Meta-agent R&D
│
├── packages/                ← Library shared (dipakai banyak app)
│   │
│   ├── [CROWN JEWEL — Sentra-Core]
│   ├── symphony/            → sentra-nada    (CDSS Engine)
│   ├── sentra-rag/          → sentra-pustaka (RAG Pipeline)
│   ├── fhir-engine/         → sentra-sandi   (FHIR Compliance)
│   ├── iskandar-gatekeeper/ → sentra-bentara (Access Control)
│   └── vector-store/        → sentra-cermin  (Embedding)
│   │
│   ├── [PRIVATE PRODUCT]
│   ├── database/            Schema & Prisma client (DB access layer)
│   ├── clinical-references/ Data klinis terstruktur
│   ├── document-ingestion/  Parser PDF & dokumen
│   ├── langflow-client/     Client ke LangFlow API
│   └── literature-harvester/ Harvesting literatur medis
│   │
│   └── [SHELL — Aman dibuka]
│       ├── shared-types/    TypeScript contracts
│       ├── sentra-ui/       Component library
│       ├── design-token/    Design system (warna, tipografi)
│       ├── config-eslint/   Shared linting rules
│       └── config-typescript/ Shared TS config
│
├── flows/                   ← LangFlow AI workflow definitions
│   └── definitions/
│       ├── healthcare/      [CROWN JEWEL] Alur AI klinis
│       └── platform/        [CROWN JEWEL] Alur platform
│
├── docs/                    ← Dokumentasi
│   ├── architecture/        Diagram & referensi arsitektur
│   ├── legal/               Template kontrak pemerintah
│   └── guides/              Panduan teknis
│
├── .agent/                  ← Memori & state agent (tidak di-commit)
│   ├── CONTEXT.md           Arsitektur & stack
│   ├── PROGRESS.md          Progress kerja
│   ├── HANDOFF.md           Rencana sesi aktif
│   ├── LESSONS.md           Kesalahan yang sudah dipelajari
│   └── DECISIONS.md         Keputusan arsitektur (append-only)
│
├── .cursor/                 ← Rules & agents untuk AI coding
├── tooling/                 ← Governance scripts
├── AGENTS.md                ← Dokumen otoritas tertinggi
├── CLAUDE.md                ← Instruksi untuk Claude Code
└── package.json             ← Root manifest (UNLICENSED, private:true)
```

---

## 3. CROWN JEWEL — MOTHER-OF-SENTRA

Kelima engine ini adalah inti kekayaan intelektual Sentra.
Akan dipindahkan ke repo terpisah: `drclassy/mother-of-sentra`.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOTHER-OF-SENTRA                              │
│              github.com/drclassy/mother-of-sentra               │
│                   [PRIVATE — Chief Only]                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  sentra-nada  (symphony)                                 │   │
│  │  Clinical Reasoning Engine / CDSS                        │   │
│  │                                                          │   │
│  │  Yang dilakukan:                                         │   │
│  │  • Terima data vital, gejala, riwayat pasien             │   │
│  │  • Jalankan 30+ engine klinis (NEWS2, pattern, dll)      │   │
│  │  • Hasilkan: diagnosis diferensial, confidence score,    │   │
│  │    traffic light (hijau/kuning/merah), trajectory,       │   │
│  │    rekomendasi tindakan                                   │   │
│  │  • Export ke FHIR & CDS Hooks standard                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │ pakai                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  sentra-pustaka  (sentra-rag)                            │   │
│  │  RAG Pipeline — Knowledge Retrieval                      │   │
│  │                                                          │   │
│  │  Yang dilakukan:                                         │   │
│  │  • Ingest PDF klinis & literatur medis                   │   │
│  │  • Chunk, embed, simpan ke pgvector                      │   │
│  │  • Saat query: retrieve konteks relevan                  │   │
│  │  • Evaluasi kualitas retrieval                           │   │
│  │  • Registry untuk track semua dokumen                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │ encode ke                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  sentra-sandi  (fhir-engine)                             │   │
│  │  FHIR Compliance Layer                                   │   │
│  │                                                          │   │
│  │  Yang dilakukan:                                         │   │
│  │  • Transform data internal ke format FHIR R4            │   │
│  │  • Validasi resource (Patient, Condition, Observation)   │   │
│  │  • Generate FHIR Bundle untuk export                     │   │
│  │  • Interoperability dengan SatuSehat, BPJS               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │ dijaga oleh                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  sentra-bentara  (iskandar-gatekeeper)                   │   │
│  │  Access Control & Authorization                          │   │
│  │                                                          │   │
│  │  Yang dilakukan:                                         │   │
│  │  • Verifikasi siapa yang boleh akses apa                 │   │
│  │  • Enforce tenant isolation (Kediri vs Surabaya)         │   │
│  │  • Rate limiting per tenant                              │   │
│  │  • Audit log semua request                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │ lihat ke                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  sentra-cermin  (vector-store)                           │   │
│  │  Embedding & Semantic Search                             │   │
│  │                                                          │   │
│  │  Yang dilakukan:                                         │   │
│  │  • Generate embedding via Ollama (lokal, tanpa GCP)      │   │
│  │  • Simpan vector ke pgvector (PostgreSQL)                │   │
│  │  • Semantic search: cari dokumen yang "mirip makna"      │   │
│  │  • Support sentra-pustaka untuk retrieval                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

   "Nada calls Pustaka.
    Pustaka speaks in Sandi.
    Sandi is guarded by Bentara.
    Bentara looks into Cermin."
```

---

## 4. ALUR DATA — Dari Dokter ke AI ke Output

```
DOKTER / PERAWAT
       │
       │ Input: vital signs, gejala, riwayat
       ▼
┌─────────────────────┐
│  intelligenceboard  │  ← UI yang dipakai dokter (Next.js dashboard)
│  atau sentra-assist │  ← Browser extension di atas EMR
└─────────────────────┘
       │ API call
       ▼
┌─────────────────────┐
│  sentra-bentara     │  ← "Siapa kamu? Dari tenant mana?"
│  (gatekeeper)       │     Cek auth, scope, rate limit
└─────────────────────┘
       │ jika diizinkan
       ▼
┌─────────────────────┐
│  orchestrator       │  ← Koordinator: tahu harus panggil apa
│  (CQRS + Saga)      │     Pakai Kafka + Socket.IO
└─────────────────────┘
       │
       ├──────────────────────────────────┐
       ▼                                  ▼
┌─────────────────┐            ┌──────────────────────┐
│  sentra-nada    │            │  sentra-pustaka       │
│  (CDSS engine)  │            │  (RAG retrieval)      │
│                 │            │                       │
│  Proses vitals, │            │  Cari konteks dari    │
│  jalankan       │            │  literatur & dokumen  │
│  clinical logic │            │  klinis yang relevan  │
└─────────────────┘            └──────────────────────┘
       │                                  │
       │                                  │ pakai
       │                         ┌──────────────────────┐
       │                         │  sentra-cermin        │
       │                         │  (vector search)      │
       │                         └──────────────────────┘
       │                                  │
       └──────────────┬───────────────────┘
                      ▼
             ┌─────────────────┐
             │  sentra-sandi   │  ← Encode hasil ke FHIR format
             │  (FHIR engine)  │     untuk interop SatuSehat
             └─────────────────┘
                      │
                      ▼
              OUTPUT KE DOKTER:
              • Traffic light (🔴🟡🟢)
              • Diagnosis diferensial + confidence %
              • Rekomendasi tindakan
              • Alert vital kritis
              • FHIR Bundle untuk rekam medis
```

---

## 5. MODEL B2G — Pemerintah Sebagai Tenant

```
PEMERINTAH KEDIRI              PEMERINTAH SURABAYA
(tenant: pemkot-kediri)        (tenant: pemkot-surabaya)
        │                               │
        │ login + API key               │ login + API key
        ▼                               ▼
┌───────────────────────────────────────────────────────┐
│                 sentra-bentara                         │
│  • Verifikasi tenant ID                                │
│  • Data Kediri TIDAK bisa dilihat Surabaya            │
│  • Feature flags per tenant (apa yang boleh diakses)  │
│  • Audit log semua aksi                               │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                 Platform Sentra                        │
│  (sentra-nada, sentra-pustaka, dll)                   │
│                                                        │
│  Pemerintah HANYA lihat OUTPUT — bukan source code    │
│  Pemerintah TIDAK tahu nama engine-nya                │
│  Pemerintah TIDAK bisa akses engine langsung          │
└───────────────────────────────────────────────────────┘

Yang pemerintah DAPAT:          Yang pemerintah TIDAK PERNAH lihat:
✓ UI dashboard                  ✗ Source code engine
✓ API responses                 ✗ Arsitektur internal
✓ Data milik mereka             ✗ Data tenant lain
✓ SLA & support                 ✗ Prompt system
✓ Laporan & audit trail         ✗ Model embedding
                                ✗ Logic klinis internal
```

---

## 6. ARSITEKTUR REPO — Sekarang vs Nanti

```
SEKARANG (2026-04-30):
══════════════════════════════════════════════════
github.com/drclassy/abyss-monorepo  [PRIVATE]
  ├── apps/ (semua aplikasi)
  ├── packages/sentra/sentra-nada/      ← crown jewel taxonomy live
  ├── packages/sentra/sentra-pustaka/   ← crown jewel taxonomy live
  ├── packages/sentra/sentra-sandi/     ← crown jewel taxonomy live
  ├── packages/sentra/sentra-bentara/   ← crown jewel taxonomy live
  └── packages/sentra/sentra-cermin/    ← crown jewel taxonomy live

Risiko: kalau repo bocor, semua engine terekspos.


NANTI (setelah Mother-of-Sentra):
══════════════════════════════════════════════════
github.com/drclassy/mother-of-sentra  [PRIVATE — Chief Only]
  └── packages/
      ├── sentra-nada/    (ex-symphony)
      ├── sentra-pustaka/ (ex-sentra-rag)
      ├── sentra-sandi/   (ex-fhir-engine)
      ├── sentra-bentara/ (ex-iskandar-gatekeeper)
      └── sentra-cermin/  (ex-vector-store)

github.com/drclassy/abyss-monorepo  [PRIVATE — tim bisa akses]
  ├── apps/ (semua aplikasi — sama seperti sekarang)
  └── packages/
      ├── database/
      ├── shared-types/        ← tidak ada lagi crown jewel di sini
      ├── sentra-ui/
      └── ... (non-crown jewel saja)
      
      package.json dependencies:
        "@sentra/nada": "1.0.0"      ← dari private registry
        "@sentra/pustaka": "1.0.0"   ← bukan workspace lagi
        "@sentra/sandi": "1.0.0"
        "@sentra/bentara": "1.0.0"
        "@sentra/cermin": "1.0.0"
```

---

## 7. LAPISAN PERLINDUNGAN IP (Defense in Depth)

```
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1 — LEGAL                                              │
│  • LICENSE: Proprietary, All Rights Reserved                  │
│  • Copyright 2026 Sentra pada setiap source file crown jewel │
│  • MSA + NDA + ToS template untuk kontrak pemerintah         │
│  • Klausul eksplisit: engine IP tetap milik Sentra           │
├──────────────────────────────────────────────────────────────┤
│  LAYER 2 — ARSITEKTUR                                         │
│  • Three-tier: Crown Jewel / Private Product / Shell          │
│  • sentra:tier tag di setiap package.json                     │
│  • API-first boundary: client hanya lihat output             │
│  • Crown jewel di repo terpisah (mother-of-sentra)           │
├──────────────────────────────────────────────────────────────┤
│  LAYER 3 — RUNTIME                                            │
│  • Engine TIDAK PERNAH deploy ke infra pemerintah/client     │
│  • Selalu jalan di Sentra private infrastructure             │
│  • Multi-tenant RBAC: isolasi data per pemerintah daerah     │
├──────────────────────────────────────────────────────────────┤
│  LAYER 4 — NAMING (baru)                                      │
│  • Nama engine tidak mengungkapkan fungsinya                 │
│  • "sentra-nada" tidak terlihat seperti CDSS engine          │
│  • mother-of-sentra tidak terlihat seperti AI core repo      │
├──────────────────────────────────────────────────────────────┤
│  LAYER 5 — ESCROW (jika diperlukan audit pemerintah)         │
│  • Source disimpan di third-party escrow                     │
│  • Pemerintah tahu source ada, tapi tidak bisa akses         │
│  • Rilis hanya jika: court order / Sentra tutup bisnis       │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. STACK TEKNOLOGI

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind v4 |
| **Backend** | NestJS 11, TypeScript |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **Vector DB** | pgvector extension di PostgreSQL |
| **Embedding** | Ollama (lokal) — model: nomic-embed-text, 768 dims |
| **Event/Queue** | Kafka, Socket.IO |
| **Orchestration** | CQRS + Saga pattern (NestJS) |
| **AI Flows** | LangFlow (self-hosted) |
| **Build System** | Turborepo + pnpm workspaces |
| **Deployment** | Railway (production) |
| **CI/CD** | GitHub Actions |
| **Interop** | FHIR R4, CDS Hooks, SatuSehat API |

---

## 9. SIAPA AKSES APA

| Siapa | Akses ke |
|---|---|
| **Chief (Ferdi)** | Semua — monorepo + mother-of-sentra |
| **Developer tim** | abyss-monorepo saja (tidak ke mother-of-sentra) |
| **Pemerintah / klien** | UI + API output saja (tidak ke repo apapun) |
| **Auditor BSSN/Kominfo** | Source escrow (kondisi terbatas) |
| **Publik** | Tidak ada (semua private) |

---

## 10. LANGKAH BERIKUTNYA

- [ ] Tentukan nama final engine (sudah: Nada, Pustaka, Sandi, Bentara, Cermin)
- [ ] Rename packages di monorepo + update semua imports
- [ ] Clone → filter-repo → buat mother-of-sentra lokal
- [ ] Push ke GitHub repo baru `drclassy/mother-of-sentra`
- [ ] Setup GitHub Packages sebagai private npm registry
- [ ] Publish @sentra/* packages
- [ ] Update monorepo: workspace deps → versioned deps
- [ ] Hapus source crown jewel dari monorepo
- [ ] Setup akses: Chief only di mother-of-sentra

---

*"Five facilities, built alone over 11 months. Now, they have names that live."*  
*— Dr. Ferdi Iskandar (Classy)*
