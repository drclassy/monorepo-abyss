# 🦇⚔️ SENTRA AI HYBRID MASTER PLAN — Battle-Ready Execution & Governance

**Tanggal:** 2026-04-14
**Penulis:** Manus AI

Dokumen ini menyajikan **Hybrid Master Plan** untuk tim AI Agent di monorepo Sentra Artificial Intelligence. Rencana ini mengintegrasikan ketajaman eksekusi teknis dan pembagian peran yang jelas dari instruksi Manus, dengan sistem tata kelola, manajemen tugas, dan disiplin logging yang terstruktur dari instruksi Claude.ai. Tujuannya adalah untuk memastikan eksekusi yang efisien, transparan, dan sesuai standar tertinggi Sentra Healthcare Solutions.

---

## 1. 🌟 Prinsip & Tata Kelola Umum

### 1.1. Filosofi Sentra AI
*   **Visi:** Sentra Healthcare AI — target 236K lives/month, 99% diagnostic accuracy.
*   **Mantra:** "Setiap Nyawa Berharga."
*   **Chief's Law:** Absolute Zero Tolerance for Fabrication. Semua hasil kerja harus akurat, terverifikasi, dan dapat dipertanggungjawabkan.

### 1.2. Protokol & Disiplin
*   **JET Protocol (J1-J4):** Semua agent harus mematuhi protokol pengembangan JET. Gemini sebagai Supervisor akan memastikan kepatuhan, terutama pada gate J5.
*   **Compound Learning:** Setiap sesi pengerjaan harus dicatat di `.agent/sessions/YYYY-MM-DD.md` untuk akumulasi pengetahuan dan pembelajaran berkelanjutan.
*   **SSOT (Single Source of Truth):** `AGENTS.md` di root monorepo adalah sumber kebenaran tunggal untuk definisi agent dan aturan umum.

---

## 2. 🤖 Peran & Tanggung Jawab Agent

Setiap agent memiliki peran spesifik yang dirancang untuk memaksimalkan efisiensi dan keahlian dalam monorepo.

### 2.1. Claude Code (Coding Master — The Architect & Lead Fixer)
**Fokus:** Deep context, judgment, analysis, code review, audit, dokumentasi teknis, dan architectural decisions.

**Tugas Utama:**
*   **Perbaikan Struktural:** Menangani bug kritis yang mempengaruhi arsitektur atau fungsionalitas inti.
*   **Audit Keamanan:** Memastikan tidak ada celah keamanan, terutama terkait secret management.
*   **Desain Sistem:** Memastikan implementasi sesuai dengan pola desain yang ditetapkan (misalnya CQRS).
*   **Dokumentasi Arsitektur:** Mengupdate dan membuat dokumentasi teknis yang relevan.

### 2.2. Kilo Code (Coding Master — The Data & Infrastructure Specialist)
**Fokus:** Implementation, bugfix, testing, code generation berkualitas tinggi dengan TypeScript strict, proper error handling, dan test coverage. Spesialis manajemen data, infrastruktur AI, dan optimasi performa.

**Tugas Utama:**
*   **Implementasi Fitur:** Mengembangkan fitur baru dengan standar kualitas kode yang tinggi.
*   **Perbaikan Bug:** Memperbaiki bug yang teridentifikasi dengan solusi yang robust.
*   **Manajemen Data:** Mengelola aset data, memastikan integritas, dan ketersediaan.
*   **Infrastruktur AI:** Mengimplementasikan dan mengelola komponen infrastruktur AI (misalnya LangFlow).
*   **Optimasi:** Meningkatkan performa dan efisiensi kode serta sistem.

### 2.3. Cursor Agent (Coding Master — The UI/UX & Feature Developer)
**Fokus:** Scaffolding, file operations, refactoring, dan infrastruktur yang lebih cepat dan aman dikerjakan langsung di IDE dengan full file system access. Ahli di: folder structure, git operations, config files, dan build tooling.

**Tugas Utama:**
*   **Pengembangan Frontend:** Membangun dan memperbaiki antarmuka pengguna.
*   **Refactoring Kode:** Merestrukturisasi kode untuk meningkatkan keterbacaan dan maintainability.
*   **Standarisasi Proyek:** Memastikan konsistensi dalam struktur folder, penamaan, dan konfigurasi.
*   **Operasi File System:** Melakukan operasi file seperti rename, move, delete dengan hati-hati.

### 2.4. Gemini (Supervisor — The Quality Assurance & Compliance)
**Fokus:** Auditor hasil kerja, verifikator instruksi, dan penjaga kepatuhan protokol.

**Tugas Utama:**
*   **Verifikasi Kepatuhan:** Memastikan semua agent mematuhi JET Protocol dan standar kode.
*   **Audit Hasil:** Memverifikasi setiap perbaikan bug dan implementasi fitur.
*   **Konsistensi:** Memantau konsistensi penamaan, struktur, dan dokumentasi.
*   **Pelaporan:** Memberikan ringkasan progres dan temuan kepada Chief.

---

## 3. ⚙️ Standard Operating Procedures (SOP)

Semua agent harus mengikuti SOP ini untuk memastikan alur kerja yang terstruktur dan transparan.

### 3.1. Manajemen Task Queue
*   **Lokasi Task:** Setiap agent memiliki file task queue di `.agent/tasks/AGENT-TASKS.md` (misalnya, `.agent/tasks/CLAUDE-TASKS.md`).
*   **Prioritas:** Kerjakan task dari atas ke bawah. Prioritaskan P0, lalu P1, dan P2 jika ada waktu.
*   **Tracking Progres:** Setelah task selesai, update `status` dan `completed_at` di `.agent/tasks/TASKS.json`.

### 3.2. Sebelum Memulai Task
*   **Baca Referensi:** Selalu baca file yang direferensikan dalam task.
*   **Pahami Konteks:** Pahami konteks dari `AGENTS.md` terdekat atau dokumentasi terkait.
*   **Cek Blocker:** Jika task BLOCKED, skip dan lanjut ke task berikutnya yang tidak memiliki blocker.
*   **Verifikasi Path:** Untuk operasi file, verifikasi path yang disebutkan benar-benar ada.
*   **Preview Destructive Ops:** Untuk operasi destruktif (delete, rename, move), selalu lakukan preview sebelum eksekusi.

### 3.3. Output Standar per Task
*   **Audit/Review:** Tulis temuan di `AUDIT.md` atau langsung di `.agent/sessions/YYYY-MM-DD.md`.
*   **Dokumentasi:** Update file dokumentasi langsung, commit dengan message konvensional.
*   **Review Kode:** Berikan assessment, daftar isu, dan rekomendasi konkret.
*   **Scaffold:** Buat struktur minimal viable, tambahkan `index.ts` di folder baru, dan placeholder comment `// TODO: implement [TaskID]`.

### 3.4. Setelah Task Selesai
*   **Update `TASKS.json`:**
    ```json
    "status": "done",
    "completed_at": "YYYY-MM-DD"
    ```
*   **Log Session:** Tulis ringkasan di `.agent/sessions/YYYY-MM-DD.md`:
    ```markdown
    ## [Task ID] — [Task Title]
    - Status: done
    - Findings: [ringkasan temuan]
    - Files changed: [list file]
    ```

### 3.5. Disiplin Git & Commit Message
*   **Atomic Commits:** Satu logical change per commit. Jangan campur refactor dengan bugfix.
*   **`.gitignore` Hygiene:** Selalu verifikasi `.gitignore` sebelum commit file baru.
*   **Commit Message Format:**
    ```
    type(scope): description

    fix(sentra-dashboard): declare artifactPathUnder in clinical-report-store
    feat(orchestrator): implement diagnosis-flow saga with Kafka integration
    test(fhir-engine): add vitest unit tests for transformer and validator
    chore(sentra-assist): merge .agents/ into .agent/ per LESSONS.md standard
    ```
    *   `fix`: untuk perbaikan bug/typo.
    *   `feat`: untuk fitur baru.
    *   `chore`: untuk cleanup, config, atau tugas rutin.
    *   `refactor`: untuk rename, restructure, atau perubahan kode tanpa mengubah fungsionalitas.
    *   `test`: untuk penambahan atau modifikasi test.

### 3.6. Aturan Tambahan
*   **Fokus Scope:** Jangan modifikasi file di luar scope task yang diberikan.
*   **No Unasked Refactor:** Jangan refactor hal yang tidak diminta; fokus pada scope task.
*   **Bug Discovery:** Jika menemukan isu baru saat mengerjakan task, catat di `TASKS.json` sebagai task baru, jangan langsung diperbaiki.
*   **Test Green:** Test harus berjalan hijau sebelum commit.
*   **Ambiguitas:** Jika ada ambiguitas, tulis asumsi di session log sebelum melanjutkan.
*   **Nested `.git`:** Hindari nested `.git` folder; selalu verifikasi sebelum operasi git.

---

## 4. 🎯 Priority Queue & Instruksi Spesifik per Agent

Berikut adalah daftar prioritas dan instruksi spesifik untuk setiap agent, yang harus diintegrasikan ke dalam file task queue masing-masing agent (`.agent/tasks/AGENT-TASKS.md`).

### 4.1. Claude Code (Architect & Lead Fixer)
**Priority Queue Hari Ini:**
1.  **B3-A — Audit `iskandar-gatekeeper`:** Lakukan audit menyeluruh pada `packages/iskandar-gatekeeper`. Implementasikan fungsionalitas auth/security yang seharusnya ada di `index.ts` sesuai standar JET Protocol. (No blocker, kerjakan sekarang).
2.  **B1-B — Review fix `artifactPathUnder`:** Setelah Kilo Code menyelesaikan B1-A, lakukan review terhadap perbaikan `artifactPathUnder` di `sentra-dashboard`. Pastikan tidak ada regresi dan logic pelaporan klinis berjalan 100%. (Tunggu Kilo Code B1-A selesai).
3.  **P1-10 — Fix `CONTEXT.md` duplicate rows:** Perbaiki baris duplikat di `CONTEXT.md` (quick win, 5 menit).

**Instruksi Tambahan:**
*   **Strategic Execution:** Siapkan transisi **ORCHESTRATOR Phase A/B/C** (Database → Langflow → Staging).
*   **Konsolidasi `.agent/` extras:** Lakukan konsolidasi `.agent/` extras di seluruh aplikasi agar sesuai dengan root `LESSONS.md`.

### 4.2. Kilo Code (Data & Infrastructure Specialist)
**Priority Queue Hari Ini:**
1.  **B1-A — Fix `artifactPathUnder`:** Perbaiki variabel `artifactPathUnder` yang tidak terdeklarasi di `apps/healthcare/sentra-dashboard/src/stores/clinical-report-store.ts` pada baris 131, 405, 424, 431, dan 463. **PALING URGENT.**
2.  **P1-01 — Delete `reset-crew-password.mjs`:** Hapus file dead code `scripts/reset-crew-password.mjs` di `sentra-dashboard` (quick win, 2 menit).
3.  **P1-04 — Resolve `.agent/` vs `.agents/` conflict:** Selesaikan kebingungan folder `.agent/` vs `.agents/` di `sentra-assist`. Pilih satu standar (disarankan `.agent/`) dan lakukan merge/rename.

**Instruksi Tambahan:**
*   **Infrastructure Gap (B5):** Isi folder `flows/` di `apps/infrastructure`. Tentukan strategi **LangFlow** (definitions, components, tests) untuk mendukung pilot orchestration.
*   **Data Centralization (S7):** Ekstrak `144_penyakit_puskesmas.json` dan `icd10.json` dari folder lokal ke `packages/` untuk meningkatkan reusability antar aplikasi.
*   **Monorepo Hygiene:** Bersihkan `pnpm-lock.yaml` residual churn dan hapus BOM characters di `config-typescript` dan `integration-bridge` `package.json`.
*   **Data Integrity:** Pastikan sinkronisasi database antara `primary-healthcare` (Master) dengan mirror di `sentra-dashboard` dan `sentra-assist` tetap terjaga.

### 4.3. Cursor Agent (UI/UX & Feature Developer)
**Priority Queue Hari Ini:**
1.  **B4-A — Scaffold CQRS folders di orchestrator:** Buat struktur folder `commands/` dan `queries/` di `apps/healthcare/orchestrator` sesuai mandat `AGENTS.md`. (No blocker — KERJAKAN PERTAMA).
2.  **P1-05 + P1-06 — Fix BOM characters:** Hapus BOM characters di `config-typescript` dan `integration-bridge` `package.json` (batch satu commit).
3.  **P1-11 — Clean `pnpm-lock.yaml`:** Lakukan `pnpm dedupe` atau tindakan lain untuk membersihkan `pnpm-lock.yaml` residual churn.
4.  **P1-02 — Add `.semgrep-out.json` ke `.gitignore`:** Pastikan `.semgrep-out.json` ditambahkan ke `.gitignore` di `sentra-dashboard`.

**Instruksi Tambahan:**
*   **Dashboard Refinement:** Selesaikan staging review untuk 187 files hasil *simplify pass* di `sentra-dashboard`. Sinkronisasi penamaan: Putuskan antara folder `sentra-dashboard` atau package `@the-abyss/puskesmas-dashboard`.
*   **Project Standardization (Referralink):** Lakukan refactor `App.tsx` (25KB) menjadi struktur modular modern atau siapkan untuk di-archive jika diperintahkan Chief.
*   **UI Hygiene:** Perbaiki typo `coorporate` menjadi `corporate` di seluruh codebase. Update `PROGRESS.md` timestamp di seluruh sub-apps agar tidak stale.

### 4.4. Gemini (Supervisor — The Quality Assurance & Compliance)
**Priority Queue Hari Ini:**
1.  **Verifikasi B2 (`.env.production`):** Jalankan `git ls-files | grep .env.production` di folder `referralink`. Jika ada output, segera laporkan ke Chief untuk revoke secrets, rotate, dan fix `.gitignore`.
2.  **Pengawasan B1-A:** Pastikan Kilo Code berhasil memperbaiki bug `artifactPathUnder` tanpa regresi.
3.  **Review B3-A:** Setelah Claude Code selesai, review audit dan implementasi `iskandar-gatekeeper`.

**Tugas Pengawasan Berkelanjutan:**
*   **Instruction Compliance:** Verifikasi setiap commit dari Claude, Kilo, dan Cursor. Pastikan mereka mengikuti **JET Protocol (J1-J4)** dan tidak melakukan bypass pada gate J5.
*   **Verification of Fixes:** Pastikan semua bug P0 dan P1 benar-benar hilang dan tidak menimbulkan regresi.
*   **Consistency Check:** Pantau konsistensi penamaan folder vs package, serta pastikan `.agent/sessions/` selalu terupdate.
*   **Reporting to Chief:** Berikan ringkasan harian (Daily Standup) kepada Boss mengenai status P0 Blocking dan progres Strategic Decisions.

---

## 5. 👑 Chief's Decision Matrix

Beberapa keputusan strategis memerlukan input langsung dari Chief. Agent harus merujuk ke sini dan menunggu keputusan sebelum melanjutkan task yang relevan.

### 5.1. Decision Queue — Kerjakan Sebelum Sprint Dimulai
**Hari Ini (Urgent):**
*   **B2 — Verifikasi `.env.production`:** Jalankan `git ls-files | grep .env.production` di folder `referralink`. Jika ada output: revoke secrets, rotate, fix gitignore SEKARANG.

**Minggu Ini (P0 Strategic):**
*   **S1 — GO untuk ORCHESTRATOR Phase A/B/C:** Berikan GO ke Jen untuk memulai ORCHESTRATOR Phase A/B/C (Database → Langflow → Staging).
*   **S2 — `referralink`: refactor atau archive?** Putuskan apakah `referralink` akan direfactor ke pola modern atau di-archive.
*   **S7 — Extract `144_penyakit` + `icd10` ke `packages/`?** Putuskan apakah aset data ini akan diekstrak ke `packages/`.

**Bisa Pending (Tapi Catat di `DECISIONS.md`):**
*   **S3 — `clinical-simulator` + `evaluation-engine` timeline:** Tentukan timeline untuk `clinical-simulator` dan `evaluation-engine`.
*   **S4 — `edge-ai-prototype`: scaffold atau archive?** Putuskan apakah `edge-ai-prototype` akan di-scaffold atau di-archive.
*   **S5 — `agent-hermes` Phase 3-8 roadmap:** Tentukan roadmap untuk `agent-hermes` Phase 3-8.
*   **B5 — LangFlow strategy:** Finalisasi strategi LangFlow untuk `infrastructure/flows/`.

### 5.2. Template Catat Keputusan
Setelah Chief membuat keputusan, catat di `DECISIONS.md` dengan format:
```markdown
## [ID] — [Judul Keputusan]
**Tanggal:** YYYY-MM-DD
**Keputusan:** [Opsi yang dipilih]
**Alasan:** [Singkat, 1-2 kalimat]
**Action:** [Assign ke siapa, kapan]
```

---

## 🚀 Kesimpulan

"Delivery is not negotiable. Results are not optional. Execution is the only measure that matters."
**Build or become obsolete. Ship or be unheard. Execute or exit the game.**

Dengan **Hybrid Master Plan** ini, tim AI Agent Sentra Healthcare Solutions siap untuk menghadapi tantangan dan mencapai tujuan yang ambisius. Setiap agent memiliki kejelasan peran, prioritas, dan SOP yang harus diikuti, dengan Gemini sebagai pengawas kualitas untuk memastikan semua berjalan sesuai standar.

— **Sentra Artificial Intelligence Command Center**
