# Abyss "God Mode" Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengoptimalkan performa Cursor, kedisiplinan dokumentasi, keamanan monorepo, dan sistem memori jangka panjang melalui 4 pilar optimasi.

**Architecture:** Menggunakan sistem modular `.mdc` untuk aturan otomatis, `.cursorignore` untuk performa indexing, dan struktur `.agent/` yang diperluas untuk manajemen sesi.

---

### Task 1: Optimasi Performance (.cursorignore)
**Files:**
- Create/Modify: `.cursorignore`

- [ ] **Step 1: Inisialisasi/Update .cursorignore dengan daftar blacklist sampah**
```text
# Dependencies & Build Outputs
node_modules/
dist/
build/
.next/
out/
.turbo/

# Caches & Temp Files
.cache/
.npm/
.pnpm-store/
*.log
.eslintcache
.stylelintcache

# OS Files
.DS_Store
Thumbs.db

# Large Assets (Optional, adjust if needed)
*.mp4
*.zip
*.tar.gz

# AI Memory & Sessions (Keep these indexed but ignore large raw logs if any)
.agent/sessions/*.raw.log
```

---

### Task 2: Auto-Documenter & Handoff Master
**Files:**
- Create: `.cursor/rules/06-handoff-master.mdc`

- [ ] **Step 1: Buat aturan MDC untuk mewajibkan update HANDOFF.md**
```markdown
---
description: Memastikan AI selalu mengupdate .agent/HANDOFF.md sebelum sesi berakhir atau tugas besar selesai.
globs: **/*
alwaysApply: true
---
# Handoff Master Protocol

Setiap kali tugas besar selesai, atau saat Chief memberikan sinyal "Wrap up" / "Selesai untuk hari ini":
1. AI WAJIB mengupdate `.agent/HANDOFF.md`.
2. Struktur Handoff harus mencakup:
   - **Status Saat Ini**: Apa yang baru saja diselesaikan.
   - **Pekerjaan Tertunda**: Apa yang belum selesai.
   - **Next Steps**: Instruksi spesifik untuk sesi berikutnya.
   - **Konteks Teknis**: Perubahan arsitektur atau keputusan penting yang diambil.
```

---

### Task 3: Monorepo Dependency Guard
**Files:**
- Create: `.cursor/rules/07-monorepo-guard.mdc`

- [ ] **Step 1: Buat aturan MDC untuk mencegah Circular Dependency dan menjaga struktur Monorepo**
```markdown
---
description: Menjaga integritas arsitektur monorepo dan mencegah Circular Dependencies antar packages.
globs: "packages/**/*, apps/**/*"
alwaysApply: false
---
# Monorepo Dependency Guard

Saat memodifikasi `package.json` atau melakukan import antar package:
1. Pastikan tidak ada Circular Dependency (misal: `fhir-engine` -> `symphony` -> `fhir-engine`).
2. Gunakan workspace protocol `workspace:*` untuk dependensi internal monorepo.
3. Selalu cek apakah kode baru seharusnya masuk ke `shared-types` jika digunakan di lebih dari satu package.
```

---

### Task 4: Session Summarizer (Long-term Wisdom)
**Files:**
- Create: `.cursor/rules/08-session-summarizer.mdc`
- Create directory: `.agent/sessions/`

- [ ] **Step 1: Pastikan folder sessions ada**
Run: `mkdir -p .agent/sessions`

- [ ] **Step 2: Buat aturan MDC untuk rangkuman sesi otomatis**
```markdown
---
description: Mengarsip ringkasan diskusi teknis ke dalam folder .agent/sessions/ untuk referensi masa depan.
globs: **/*
alwaysApply: true
---
# Session Summarizer

Setiap kali ada keputusan teknis besar (memilih library, mengubah pola arsitektur, fix bug kritikal):
1. Buat catatan singkat di `.agent/sessions/YYYY-MM-DD-session-summary.md`.
2. Isi catatan:
   - **Problem**: Masalah yang dihadapi.
   - **Solution**: Solusi yang diterapkan.
   - **Rationale**: Mengapa cara ini yang dipilih (Decision Wisdom).
```

---

### Task 5: Validation & Cleanup
- [ ] **Step 1: Jalankan final check untuk memastikan semua rule terbaca oleh Cursor.**
- [ ] **Step 2: Commit semua perubahan ke branch abyss-core.**
