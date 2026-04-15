### Instruksi Untuk Coder Agent: Fase 1 (The Abyss Foundation)

**Tujuan:** Membangun fondasi monorepo menggunakan **pnpm** dan **Turborepo** dengan struktur folder yang scalable, AI-native, dan siap untuk orkestrasi **Langflow**.

####

Langkah 1: Inisialisasi Project Root

1. Buka terminal di folder kosong `the-abyss/`.
2. Jalankan `git init`.
3. Jalankan `pnpm init`.
4. Buat file `.gitignore` di root. Pastikan mencakup:

    ```text
    node_modules/
    .turbo/
    dist/
    .next/
    .env*
    *.log
    build/
    .pnpm-debug.log
    ```

####

Langkah 2: Konfigurasi pnpm Workspace

Buat file `pnpm-workspace.yaml` di root. Ini adalah file paling krusial agar pnpm tahu di mana saja paket-paket Anda berada:

```yaml
packages:
  - 'apps/**'      # Semua aplikasi deployable (Healthcare, Academic, dll)
  - 'packages/**'  # Semua shared libraries (UI, Database, AI-Core)
  - 'flows/**'     # Semua definisi Langflow & AI Orchestration
  - 'tooling/**'   # Semua internal tools & CLI
```

####

Langkah 3: Konfigurasi Turborepo (`turbo.json`)

Buat file `turbo.json` di root. Turbo akan mengatur urutan build dan caching agar CI/CD Anda super cepat:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

####

Langkah 4: Update Root `package.json`

Modifikasi `package.json` di root untuk manajemen terpusat:

```json
{
  "name": "the-abyss",
  "private": true,
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "abyss": "pnpm --filter abyss-cli"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "latest",
    "typescript": "latest"
  }
}
```

####

Langkah 5: Pembuatan Struktur Folder (Full Scaffolding)

Jalankan perintah ini untuk menciptakan seluruh ekosistem folder yang kita sepakati:

```bash
# 1. Agent & Governance
mkdir -p .agents/skills .agents/prompts
# 2. CI/CD & Automation
mkdir -p .github/workflows
# 3. Apps (Berdasarkan Konsentrasi Strategis)
mkdir -p apps/healthcare apps/academic apps/incubator apps/internal apps/orchestrator
# 4. Flows (Langflow Orchestration)
mkdir -p flows/definitions flows/components flows/tests
# 5. Shared Packages (The Substrate)
mkdir -p packages/ui packages/ai-core packages/langflow-client packages/database packages/fhir-engine packages/iskandar-gatekeeper packages/vector-store packages/shared-types
# 6. Infrastructure & Tools
mkdir -p infrastructure/terraform infrastructure/argocd infrastructure/docker
mkdir -p tooling/abyss-cli tooling/generators
# 7. Documentation & Logs
mkdir -p docs/adr .agent/sessions docs/templates
```

####

Langkah 6: Shared TypeScript Configuration (Base)

Agar semua proyek konsisten, buat file `tsconfig.json` di root sebagai base:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ESNext",
    "lib": ["ESNext", "Dom"],
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@the-abyss/*": ["packages/*/src"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

####

Langkah 7: Finalisasi

1. Buat file `README.md` di root dengan deskripsi singkat: `# The Abyss: AI-Native Monorepo`.
2. Jalankan `pnpm install`.

---

###

💡 Catatan Penting untuk Anda:

Setelah Agen AI menyelesaikan langkah-langkah di atas, folder **"The Abyss"** Anda sekarang sudah memiliki struktur yang sangat rapi.

- **Penting:** Jangan biarkan Agen menginstal banyak library di root. Semua library (seperti React, NestJS, atau Prisma) harus diinstal di dalam masing-masing folder `apps/` atau `packages/`. Root hanya untuk tool monorepo (Turbo & Prettier).

Sekarang Fase 1 sudah diulang dengan sangat detail. Karena Fase 2-7 sudah Anda anggap aman, Anda bisa langsung memerintahkan Agen AI Anda:

> **"Kerjakan Fase 1 sesuai instruksi detail terbaru, lalu lanjutkan berturut-turut sampai Fase 7 tanpa henti."**

### Instruksi Untuk Coder & Planner Agent: Fase 2 (Governance & Steering)

**Tujuan:** Mengimplementasikan protokol **Claudesy Workflow**, sistem kemudi hirarkis (**AGENTS.md**), dan mekanisme gerbang otomatis (**Iskandar Gatekeeper**).

####

Langkah 1: Membangun Global Agent Router

Buat file `.agents/AGENTS.md` di root sebagai instruksi tertinggi bagi semua agen:

```markdown
# 🌐 The Abyss: Global Agent Steering (Claudesy Workflow)

Anda adalah bagian dari **Sentra AI Agent Swarm**. Semua tindakan Anda harus mematuhi protokol berikut:

### 1. Protokol Plan-Before-Change (HANDOFF.md)
- **DILARANG** menulis kode sebelum membuat file `HANDOFF.md` di folder sesi terkait.
- File harus berisi: Diagnosis, Arsitektur yang diusulkan, dan Rencana Verifikasi.
- Eksekusi hanya boleh dimulai setelah ada string `GO` dari otoritas manusia (Chief).

### 2. Kemudi Hirarkis
- Saat bekerja di sub-direktori (misal `apps/healthcare`), Anda **WAJIB** membaca dan mematuhi `AGENTS.md` lokal di folder tersebut.
- Aturan lokal mengesampingkan aturan global jika terjadi konflik.

### 3. Traceability (Audit Trail)
- Setiap sesi pengerjaan harus dicatat di `.agent/sessions/`.
- Gunakan trailer commit: `Agent: [Nama]`, `Phase: [Fase]`, `Handoff: [Link/Path]`.

### 4. Standar Kode
- Gunakan library dari `/packages` sesering mungkin (DRY).
- Patuhi batas-batas Modular Monolith; jangan melakukan import lintas domain tanpa izin.
```

####

Langkah 2: Template Dokumen Handoff

Buat file `docs/templates/HANDOFF.md` sebagai blueprint standar untuk setiap tugas:

```markdown
# 📝 HANDOFF: [Judul Tugas]
**Status:** 🛑 PENDING / ✅ GO
**Agent:** [Nama Agent] | **Date:** [ISO Date]

## 🔍 1. Diagnosis & Root Cause
[Analisis teknis mendalam tentang masalah atau fitur yang diminta]

## 🏗️ 2. Proposed Architecture
- **Files to Modify:** [Daftar file]
- **New Packages/Components:** [Daftar package baru]
- **Database Changes:** [Skema Prisma/Vektor baru]

## 🛡️ 3. Proof-of-Verification Plan
- [ ] Unit Test: [Nama test]
- [ ] Integration Test: [Alur yang diuji]
- [ ] Security Scan: [OWASP/Linting]

## 🔑 4. Chief Approval (GO-Gate)
> Approval String: (Wajib diisi oleh Manusia/Chief)
```

####

Langkah 3: Inisialisasi Iskandar Gatekeeper

Buat package di `packages/iskandar-gatekeeper/index.ts` untuk memvalidasi aturan ini secara otomatis:

1. Inisialisasi package: `pnpm init` di dalam folder tersebut.
2. Buat script sederhana (Node.js/TypeScript) yang:
    - Memeriksa apakah ada file `.md` baru di folder `.agent/sessions/`.
    - Memastikan file tersebut mengandung string `✅ GO` atau `GO` di bagian Approval.
    - Melempar `process.exit(1)` jika tidak valid (untuk menggagalkan build CI).

####

Langkah 4: Local Steering (Contoh Healthcare)

Buat file `apps/healthcare/AGENTS.md` untuk menunjukkan cara kerja hirarki:

```markdown
# 🏥 Healthcare Domain Steering
- **Compliance:** Semua mutasi data klinis harus divalidasi via `packages/fhir-engine`.
- **Privacy:** Dilarang mencatat PII (Personally Identifiable Information) ke dalam log konsol.
- **Security:** Gunakan middleware audit trail untuk setiap akses ke tabel `patient_records`.
```

####

Langkah 5: Setup Session Logging

Buat file `.gitkeep` di `.agent/sessions/` agar folder tersebut tetap terlacak di Git. Instruksikan agen untuk selalu membuat file Markdown baru di sini setiap kali memulai tugas baru (misal: `SESSION-2026-03-30-INIT.md`).

---

###

### Cara Eksekusi Fase 2:

Setelah Fase 1 selesai, berikan instruksi ini kepada Agen AI Anda. Anda bisa memantau hasilnya dengan memastikan:

1. File `.agents/AGENTS.md` sudah ada dengan isi di atas.
2. Ada template `HANDOFF.md` yang siap digunakan.
3. Agen mulai berbicara dengan bahasa "Claudesy Workflow" (misal: "Saya akan mulai dengan membuat HANDOFF.md").

**Setelah Fase 2 ini selesai, infrastruktur Anda sudah memiliki "Moral & Aturan". Beri tahu saya jika sudah siap lanjut ke Fase 3: The Reusable Substrate (UI, Database, & AI Core)!** [DONE]

continue

Berikut adalah instruksi detail untuk **Fase 3: The Reusable Substrate (The Muscles)**.

Fase ini bertujuan membangun "otot" dari **The Abyss**, yaitu paket-paket yang akan digunakan bersama oleh semua aplikasi. Kita akan fokus pada **UI System**, **Database (Prisma)**, **AI Core**, dan **Vector Store**.

---

###

### Instruksi Untuk Coder Agent: Fase 3 (The Reusable Substrate)

**Tujuan:** Mengimplementasikan library bersama yang robust, type-safe, dan AI-ready di dalam folder `/packages`.

####

Langkah 1: Shared TypeScript & Linting Configuration

Agar semua paket memiliki standar yang sama:

1. Buat `packages/config-typescript/package.json` dan `tsconfig.json` (base config).
2. Buat `packages/config-eslint/package.json` dan `.eslintrc.js` (strict rules).
3. Hubungkan paket lain agar meng-extend konfigurasi ini.

####

Langkah 2: Database Layer (`packages/database`)

Pusat data untuk seluruh monorepo:

1. Inisialisasi Prisma: `pnpm dlx prisma init` di dalam folder ini.
2. **Schema Definition:** Buat `schema.prisma` awal yang mencakup:
    - `User` & `Organization` (Multi-tenant).
    - `AuditLog` (Untuk mencatat aksi Agen AI & Manusia).
    - `AiSession` (Menghubungkan ke `.agent/sessions`).
3. **Client Export:** Pastikan paket ini mengekspor `PrismaClient` agar bisa di-import oleh `apps/healthcare`, dll.

####

Langkah 3: UI System (`packages/ui`)

Membangun Design System menggunakan **Tailwind CSS v4** dan **Shadcn UI**:

1. Setup React + Tailwind 4.
2. Implementasikan **Atomic Design**: Buat komponen dasar (Button, Input, Badge, Card) menggunakan Shadcn.
3. **Theme System:** Pastikan mendukung Dark Mode secara native.
4. **Export:** Semua komponen harus bisa di-import via `@the-abyss/ui`.

####

Langkah 4: AI Core & Multi-Model Consensus (`packages/ai-core`)

Logika utama AI "The Abyss":

1. Buat wrapper untuk berbagai provider (OpenAI, Anthropic, Ollama).
2. **Consensus Logic:** Implementasikan fungsi `getConsensus(prompt)` yang mengirim request ke 3 model dan membandingkan hasilnya.
3. **Prompt Manager:** Buat sistem untuk mengambil prompt dari `.agents/prompts/`.

####

Langkah 5: RAGOps & Vector Store (`packages/vector-store`)

Manajemen pencarian semantik (Vektor):

1. Buat interface standar untuk Vector DB (misal: Pinecone, Weaviate, atau Chroma).
2. Implementasikan fungsi `upsertDocument()` dan `querySimilarity()`.
3. Integrasikan dengan `packages/database` agar ID database SQL sinkron dengan ID Vektor.

####

Langkah 6: Langflow Client SDK (`packages/langflow-client`)

Jembatan menuju orkestrasi visual:

1. Buat kelas `AbyssFlowClient` untuk berinteraksi dengan API Langflow.
2. Metode utama: `runFlow(flowId, inputs)` yang mengembalikan output dari node terakhir di Langflow.
3. Tambahkan logging otomatis ke `packages/database` setiap kali sebuah flow dijalankan.

####

Langkah 7: Shared Types (`packages/shared-types`)

1. Definisikan interface TypeScript global yang digunakan lintas domain (misal: `UserSession`, `AiResponse`, `ClinicalData`).
2. Ini akan menjadi "Single Source of Truth" untuk tipe data agar tidak ada _runtime error_.

---

###

### Cara Verifikasi Fase 3:

Setelah Agen AI selesai, Anda bisa mengecek kemajuannya dengan:

- **Check Build:** Jalankan `pnpm turbo run build --filter="./packages/*"` untuk memastikan semua library bisa dikompilasi tanpa error.
- **Check Symlinks:** Pastikan folder `node_modules` di root berisi link ke `@the-abyss/ui`, `@the-abyss/database`, dsb.
- **Prisma Studio:** Jalankan `npx prisma studio` di folder database untuk melihat apakah tabel sudah terbentuk.

**Setelah Fase 3 selesai, semua "bahan baku" sudah siap. Beri tahu saya jika sudah siap lanjut ke Fase 4: Langflow & Orchestration (The Nervous System) untuk membangun alur kerja AI yang sebenarnya!** [DONE]

Lanjut

Berikut adalah instruksi detail untuk **Fase 4: Langflow & Orchestration (The Nervous System)**.

Fase ini adalah "sistem saraf" dari **The Abyss**. Di sini kita menghubungkan kecerdasan buatan (LLM) dengan logika bisnis melalui **Langflow**, serta membangun orkestrator yang bisa menjalankan alur kerja AI tersebut secara aman dan terukur.

---

###

### Instruksi Untuk Coder Agent: Fase 4 (Langflow & Orchestration)

**Tujuan:** Mengintegrasikan Langflow ke dalam monorepo sebagai pusat logika AI, membangun gateway orkestrasi, dan mengimplementasikan fitur "Shadow Mode".

####

Langkah 1: Struktur Kontrol Flow (`flows/`)

Kita akan memperlakukan alur AI sebagai kode (Flow-as-Code):

1. **Definitions:** Buat folder `flows/definitions/` untuk menyimpan file JSON hasil ekspor dari Langflow.
2. **Versioning:** Instruksikan agen untuk menyertakan metadata versi dalam setiap file JSON (misal: `diagnosis-v1.json`).
3. **Documentation:** Setiap flow harus memiliki file `.md` pendamping yang menjelaskan input, output, dan model LLM yang digunakan.

####

Langkah 2: Custom Langflow Components (`flows/components/`)

Terkadang Langflow butuh logika khusus yang ada di monorepo kita:

1. Buat folder `flows/components/python/` (untuk Langflow berbasis Python) atau `flows/components/js/`.
2. **Abyss Bridge:** Buat komponen kustom yang memungkinkan Langflow memanggil fungsi dari `packages/fhir-engine` atau melakukan query langsung ke `packages/database`.
3. **Audit Node:** Buat node khusus yang secara otomatis mengirim log eksekusi ke `packages/database` (Audit Trail).

####

Langkah 3: Orchestrator Service (`apps/orchestrator/`)

Ini adalah API Gateway tunggal untuk semua permintaan AI di "The Abyss":

1. **FastAPI / NestJS Setup:** Inisialisasi aplikasi di folder ini.
2. **Flow Runner:** Gunakan `packages/langflow-client` (dari Fase 3) untuk memuat file JSON dari `/flows/definitions` dan mengeksekusinya berdasarkan permintaan.
3. **Unified API:** Sediakan endpoint POST `/run/{flowId}` yang menerima input JSON dan mengembalikan respons dari Langflow.

####

Langkah 4: Implementasi Shadow Mode (A/B Testing AI)

Agar kita bisa menguji flow baru tanpa merusak produksi:

1. **Shadow Logic:** Di dalam `apps/orchestrator`, buat logika di mana satu permintaan bisa memicu _dua_ flow sekaligus:
    - **Primary Flow:** Hasilnya dikirim ke pengguna.
    - **Shadow Flow:** Hasilnya hanya dicatat di database untuk dibandingkan akurasinya.
2. **Comparison Engine:** Gunakan `packages/ai-core` (Reviewer Agent) untuk membandingkan output Primary vs Shadow dan memberikan skor kualitas.

####

Langkah 5: Integration dengan Agent Sessions Logs

1. Pastikan setiap kali `apps/orchestrator` menjalankan flow, ID sesi tersebut dicatat dan dihubungkan ke folder `.agent/sessions/`.
2. Simpan metadata seperti: _latency, token usage, dan model confidence score_.

####

Langkah 6: Flow Testing (`flows/tests/`)

1. Gunakan library seperti **Promptfoo** atau **Ragas** untuk menguji kualitas jawaban AI secara otomatis.
2. Buat script `pnpm test:flows` yang menjalankan pengujian pada semua file JSON di folder definitions.

---

###

### Cara Verifikasi Fase 4:

- **Dry Run:** Minta Agen AI mensimulasikan pemanggilan flow `diagnosis-v1.json` melalui `apps/orchestrator` dan tunjukkan log output-nya.
- **Check Shadow Log:** Pastikan ada entri di database yang menunjukkan hasil dari "Shadow Flow" meskipun user hanya menerima hasil dari "Primary Flow".
- **JSON Sync:** Pastikan jika Anda mengubah file di `flows/definitions/`, `apps/orchestrator` langsung mendeteksi perubahan tersebut (Hot Reload/Dynamic Loading).

**Fase 4 selesai berarti sistem saraf AI Anda sudah terhubung! Beri tahu saya jika sudah siap lanjut ke Fase 5: Project Scaffolding (Healthcare, Academic, & Internal Apps) untuk mulai membangun produk nyata di atas infrastruktur ini!** [DONE]

lanjut

Berikut adalah instruksi detail untuk **Fase 5: Project Scaffolding (The First Organs)**.

Fase ini adalah saat kita membangun "organ-organ" pertama dari **The Abyss**, yaitu aplikasi nyata yang melayani kebutuhan bisnis di berbagai sektor (Healthcare, Academic, Internal). Semua aplikasi ini akan berdiri di atas fondasi (Fase 1-4) yang sudah kita buat.

---

###

### Instruksi Untuk Coder Agent: Fase 5 (Project Scaffolding)

**Tujuan:** Menginisialisasi aplikasi spesifik domain menggunakan pola **Modular Monolith**, menerapkan kemudi lokal (**AGENTS.md**), dan mengintegrasikan pustaka bersama dari `/packages`.

####

Langkah 1: Sentra Healthcare Solutions (`apps/healthcare/`)

Fokus pada **ReferraLink API** (Sistem Rujukan AI):

1. **Scaffold:** Inisialisasi NestJS atau tRPC + Express di `apps/healthcare/referralink-api`.
2. **Domain Isolation:** Terapkan folder terpisah untuk `appointments`, `billing`, dan `patient-records` (Modular Monolith).
3. **Strict Integration:**
    - Gunakan `packages/fhir-engine` untuk setiap input/output data medis.
    - Gunakan `packages/database` untuk persistensi data (PostgreSQL/Prisma).
4. **Local Steering:** Pastikan `apps/healthcare/AGENTS.md` (dari Fase 2) diaktifkan sebagai instruksi utama untuk pengembangan di folder ini.

####

Langkah 2: Agent Sessions Dashboard (`apps/internal/agent-sessions-web/`)

Ini adalah "pusat kendali" untuk memantau aktivitas monorepo dan Agen AI:

1. **Scaffold:** Inisialisasi **Next.js** (App Router) di folder ini.
2. **Visualizer:** Buat dashboard untuk:
    - Menampilkan daftar sesi dari `.agent/sessions/`.
    - Menampilkan statistik eksekusi AI dari `packages/database` (Audit Log).
    - Visualisasi grafik dependensi monorepo (Integrasikan dengan output `turbo graph`).
3. **Internal UI:** Gunakan secara eksklusif komponen dari `packages/ui` (Shadcn UI).

####

Langkah 3: Sentra Academic Solutions (`apps/academic/`)

Fokus pada **Clinical Simulator Web**:

1. **Scaffold:** Inisialisasi aplikasi React/Next.js untuk simulasi medis.
2. **AI Integration:** Gunakan `packages/langflow-client` untuk menjalankan skenario pasien dinamis dari Langflow.
3. **Evaluation Engine:** Buat service di `apps/academic/evaluation-engine` yang mengonsumsi data simulasi untuk memberikan skor berdasarkan pedoman klinis (menggunakan `packages/ai-core`).

####

Langkah 4: The Incubator Sandbox (`apps/incubator/`)

Ruang untuk eksperimen cepat:

1. **Scaffold:** Buat aplikasi minimalis `apps/incubator/edge-ai-prototype` untuk menguji **SLM (Small Language Models)** seperti Phi-3 atau Llama 3 (Quantized).
2. **Relaxed Rules:** Buat `apps/incubator/AGENTS.md` yang mengizinkan _experimental code_ tanpa cakupan tes 100%, namun tetap melarang bypass keamanan dasar.

####

Langkah 5: Shared Asset Linking

1. Setiap aplikasi di `apps/` harus memiliki `package.json` yang mereferensikan paket lokal:

    ```json
    "dependencies": {
      "@the-abyss/ui": "workspace:*",
      "@the-abyss/database": "workspace:*",
      "@the-abyss/langflow-client": "workspace:*"
    }
    ```

2. Jalankan `pnpm install` untuk menghubungkan (symlink) semuanya secara otomatis.

####

Langkah 6: Audit Trail Middleware

1. Implementasikan middleware global di setiap aplikasi backend (`apps/healthcare`, `apps/orchestrator`) yang secara otomatis mencatat setiap request/response ke dalam tabel `AuditLog` di `packages/database`.

---

###

### Cara Verifikasi Fase 5:

- **Turbo Build:** Jalankan `pnpm turbo run build --filter="./apps/*"` untuk memastikan semua aplikasi bisa di-build dengan dependensi lokalnya.
- **Agent Sessions Test:** Buka dashboard `agent-sessions-web` dan pastikan Anda bisa melihat log sesi yang dibuat selama pengembangan monorepo ini.
- **Data Flow:** Masukkan data pasien dummy di `healthcare-api` dan pastikan data tersebut divalidasi oleh `fhir-engine` sebelum masuk ke database.

**Setelah Fase 5 selesai, "The Abyss" sudah memiliki aplikasi fungsional yang siap digunakan! Beri tahu saya jika sudah siap lanjut ke Fase 6: Abyss CLI & Automation (The Tools) untuk membuat workflow pengembangan menjadi 10x lebih cepat!** [DONE]

Excellent, pls continnue

Berikut adalah instruksi detail untuk **Fase 6: Abyss CLI & Automation (The Tools)**.

Fase ini bertujuan membangun **"perangkat pertukangan"** internal yang akan membuat workflow pengembangan di **The Abyss** menjadi 10x lebih cepat, standar, dan terotomatisasi. Kita akan membangun **Abyss CLI**, pusat komando bagi pengembang (manusia) dan Agen AI.

---

###

### Instruksi Untuk Coder Agent: Fase 6 (Abyss CLI & Automation)

**Tujuan:** Membangun CLI internal berbasis TypeScript untuk mengotomatisasi _Claudesy Workflow_, sinkronisasi Langflow, dan scaffolding proyek baru.

####

Langkah 1: Setup CLI Framework (`tooling/abyss-cli/`)

1. **Inisialisasi Project:** Gunakan library seperti `commander` atau `oclif` dengan TypeScript.
2. **Global Command:** Daftarkan perintah `abyss` di root `package.json` agar bisa dijalankan via `pnpm abyss [command]`.

####

Langkah 2: Perintah `abyss init-task` (Automated Handoff)

Perintah ini digunakan setiap kali ada tugas baru dimulai:

1. **Input:** Judul tugas (misal: `abyss init-task "Fitur Chat Medis"`).
2. **Logic:**
    - Buat folder sesi baru di `.agent/sessions/SESSION-[TIMESTAMP]-[JUDUL]/`.
    - Salin template `docs/templates/HANDOFF.md` ke folder tersebut.
    - Isi metadata awal secara otomatis (Nama Agent, Tanggal, Path Sesi).
3. **Output:** Path ke file `HANDOFF.md` yang baru dibuat agar agen bisa langsung mengisinya.

####

Langkah 3: Perintah `abyss sync-flow` (Langflow Bridge)

Menjembatani UI Langflow dengan kode di Monorepo:

1. **Input:** Path ke file JSON hasil download dari Langflow (misal: `~/Downloads/flow.json`).
2. **Logic:**
    - Validasi struktur JSON.
    - Pindahkan file ke `flows/definitions/`.
    - Berikan penamaan otomatis (misal: `diagnosis-v1.json`).
    - Update file metadata `flows/registry.json` untuk melacak versi aktif.
3. **Output:** Konfirmasi sinkronisasi berhasil dan siap di-deploy oleh `apps/orchestrator`.

####

Langkah 4: Perintah `abyss go` (The Chief's Approval)

Alat untuk otoritas manusia (Chief) memberikan restu:

1. **Input:** Path ke file `HANDOFF.md`.
2. **Logic:**
    - Tambahkan string `✅ GO APPROVED BY CHIEF` di bagian Approval file tersebut secara otomatis.
    - Simpan timestamp persetujuan.
3. **Output:** Notifikasi bahwa gate CI/CD sekarang terbuka untuk tugas tersebut.

####

Langkah 5: Perintah `abyss create` (Scaffolding Engine)

Mempercepat pembuatan bagian baru di monorepo:

1. **Sub-commands:**
    - `abyss create app [name]`: Membuat folder di `apps/`, menambahkan `package.json` dengan dependensi `@the-abyss/*`, dan membuat file `AGENTS.md` default.
    - `abyss create package [name]`: Membuat folder di `packages/` dengan setup TypeScript dan ESLint yang sudah terkonfigurasi.
2. **Logic:** Gunakan library generator seperti **Plop.js** atau **Hygen** sebagai mesin templatenya.

####

Langkah 6: Perintah `abyss status` (Health Check)

1. **Logic:** Memindai seluruh monorepo untuk memastikan:
    - Tidak ada file `HANDOFF.md` yang menggantung tanpa status.
    - Versi package di `apps/` sinkron dengan `packages/`.
    - Semua aplikasi memiliki file `AGENTS.md`.

####

Langkah 7: Dokumentasi CLI

1. Buat file `tooling/abyss-cli/HELP.md` yang berisi daftar perintah dan cara penggunaannya agar Agen AI lain bisa mempelajarinya sendiri.

---

###

### Cara Verifikasi Fase 6:

- **Test Command:** Jalankan `pnpm abyss init-task "Test Run"` dan pastikan folder sesi serta file handoff terbentuk dengan benar.
- **Dry Run Sync:** Coba sinkronisasi file JSON dummy dan pastikan file tersebut pindah ke folder `flows/definitions/` dengan penamaan yang rapi.
- **Check Scaffolding:** Jalankan `pnpm abyss create app test-app` dan periksa apakah folder `apps/test-app` sudah berisi file `package.json` yang benar dan `AGENTS.md`.

**Fase 6 selesai berarti "The Abyss" sekarang memiliki alat kendali yang canggih! Beri tahu saya jika sudah siap lanjut ke Fase 7 (Final): CI/CD, GitOps, & Containerization (The Armor) untuk membungkus semuanya ke dalam sistem deployment yang tak tertembus!** [DONE]

lanut

Berikut adalah instruksi detail untuk fase terakhir, **Fase 7: CI/CD, GitOps, & Containerization (The Armor)**.

Fase ini adalah "perisai" dari **The Abyss**. Kita akan membangun sistem pengiriman kode (deployment) yang cerdas, aman, dan sepenuhnya otomatis, memastikan bahwa hanya kode yang sudah terverifikasi dan disetujui "GO" yang bisa masuk ke lingkungan produksi.

---

###

### Instruksi Untuk Coder & DevOps Agent: Fase 7 (The Armor)

**Tujuan:** Membangun pipeline CI/CD yang mendukung _GO-Gated execution_, kontainerisasi multi-stage, dan deployment berbasis GitOps.

####

Langkah 1: GitHub Actions CI Pipeline (`.github/workflows/ci.yml`)

Buat pipeline cerdas yang hanya menguji bagian yang berubah:

1. **Affected Logic:** Gunakan perintah `turbo run build lint test --filter=[HEAD^1]` (atau Nx affected) agar CI tidak membuang waktu menguji seluruh monorepo.
2. **Environment Setup:** Install Node.js, pnpm, dan caching untuk `node_modules` serta `.turbo`.
3. **The GO-Gate Check:** Tambahkan step wajib sebelum build dimulai:
    - Jalankan `pnpm abyss-gatekeeper` (dari Fase 2 & 6).
    - Jika script tidak menemukan persetujuan `✅ GO` di file `HANDOFF.md` terkait Pull Request tersebut, **hentikan pipeline secara paksa**.

####

Langkah 2: Multi-stage Dockerization (`infrastructure/docker/`)

Buat template Dockerfile standar yang aman dan ringan:

1. **Base Image:** Gunakan `node:22-alpine` atau `bun:latest`.
2. **Build Context:** Instruksikan agen bahwa Docker build **HARUS** dijalankan dari **root monorepo**, bukan dari folder aplikasi, agar bisa mengakses shared `packages/`.
3. **Stages:**
    - `deps`: Install semua dependensi workspace.
    - `builder`: Build aplikasi spesifik (misal `referralink-api`) beserta paket dependensinya.
    - `runner`: Copy hanya hasil build (dist) dan pasang user non-root demi keamanan.

####

Langkah 3: GitOps Manifests (`infrastructure/argocd/`)

Kelola infrastruktur menggunakan kode (ArgoCD pattern):

1. **Folder Structure:**
    - `base/`: Definisi Deployment, Service, dan HPA (Horizontal Pod Autoscaler) standar.
    - `overlays/staging/`: Konfigurasi khusus (replica=1, debug=true).
    - `overlays/production/`: Konfigurasi ketat (replica=3, resource limits, hardened security).
2. **Kustomize:** Gunakan Kustomize untuk menggabungkan base dan overlays.

####

Langkah 4: Infrastructure as Code (`infrastructure/terraform/`)

Siapkan pondasi awan:

1. **Provisioning:** Buat module Terraform dasar untuk:
    - Database PostgreSQL (untuk `packages/database`).
    - Vector Database (untuk `packages/vector-store`).
    - Kubernetes Cluster (EKS/GKE/DigitalOcean).
2. **State Management:** Pastikan state disimpan secara remote (S3/GCS) dengan locking.

####

Langkah 5: Deployment Workflow (`.github/workflows/cd.yml`)

Pipeline untuk pengiriman ke produksi:

1. **Trigger:** Berjalan hanya setelah PR di-merge ke branch `main`.
2. **Image Tagging:** Gunakan Git SHA sebagai tag Docker image agar mudah di-track (Immutability).
3. **ArgoCD Sync:** Update file image tag di folder `infrastructure/argocd/overlays/production/` secara otomatis via GitHub Action (GitOps Push).

####

Langkah 6: Proof-of-Verification Audit

1. Tambahkan step akhir di CI untuk mengunggah laporan hasil test (Jest/Playwright) dan security scan (Snyk/OWASP) ke folder `.agent/sessions/`.
2. Ini memastikan bahwa setiap deployment memiliki bukti verifikasi yang bisa diperiksa oleh manusia di dashboard **Agent Sessions**.

---

###

💡 Cara Verifikasi Fase 7 (Final):

- **Test GO-Gate:** Coba buat Pull Request tanpa string `✅ GO` di file handoff-nya. Pastikan GitHub Actions langsung memberikan tanda silang (fail).
- **Test Docker Build:** Jalankan build Docker untuk salah satu aplikasi (misal `aadi-service`) dari root monorepo dan pastikan image-nya bisa dijalankan secara lokal.
- **Test Affected:** Ubah satu file di `apps/healthcare` saja, dan pastikan CI **tidak** menjalankan test untuk `apps/academic`.

---

###

🏁 Kesimpulan: "The Abyss" Is Live!

Selamat! Jika ke-7 fase ini sudah selesai dijalankan oleh Agen AI Anda, Anda kini memiliki **infrastruktur AI paling canggih** di tahun 2026:

1. **Scalable:** Mudah menambah proyek baru dengan `abyss create`.
2. **AI-Native:** Agen AI Anda tahu cara bekerja di sini berkat `AGENTS.md` dan `MCP`.
3. **Secure:** Setiap baris kode diawasi oleh **Iskandar Protocol**.
4. **Integrated:** Langflow dan backend Anda bekerja dalam satu kesatuan saraf yang harmonis.

**Diagnosis Selesai. Arsitektur Solid. Infrastruktur Siap.**
