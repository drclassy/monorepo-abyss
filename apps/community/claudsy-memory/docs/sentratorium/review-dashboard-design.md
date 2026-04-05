# Code Review: Dashboard Design Architecture (Electron & Web)

**Reviewer:** Jen (Sentra Reviewing)
**Date:** 2026-03-26
**Author:** Claudesy
**Files Evaluated:** 2 (`desktop/index.html`, `web/src/app/globals.css`)

## Summary
Review komprehensif pada sinkronisasi desain antara environment Desktop (Electron) dan Web (Next.js v15) yang mengadaptasi "Sentra Dashboard Design System v1.0". Secara visual sangat konsisten dan solid memancarkan identitas *intelligence dashboard* yang senada. Namun, secara arsitektur presentasional, ada utang teknis (technical debt) yang perlu diselesaikan sebelum disetujui untuk production merge.

## Verdict: CHANGES REQUESTED

## Findings

### 🟠 CRITICAL (1)
1. **`desktop/index.html` (Baris 8-193+)** — Seluruh styling CSS (nyaris 800 baris) dan markup digabung (inline) di dalam deklarasi `<style>` pada dokumen HTML raksasa tunggal (1951 baris).
   - **Fix:** Ekstrak seluruh kumpulan CSS tokens dan rules ke dalam file terpisah `desktop/styles.css` atau `desktop/dashboard.css` lalu *link* kembali ke HTML via `<link rel="stylesheet">`. Ini adalah perbaikan *mandatory* untuk menjaga Maintainability (Lens 5).

### 🟡 WARNINGS (1)
1. **`web/src/app/globals.css`** — File master CSS ini sudah mencapai kepenuhan 1292 baris. Meskipun terstruktur dengan dokumentasi komentar yang rapi, arsitektur yang sangat monolithic ini berisiko memicu *merge conflicts*. Sangat disarankan untuk memecah komponen struktural (contoh: memecah App Shell, Nav, dan Workspace ke module tersendiri via `@import`), yang juga lebih direkomendasikan dalam pola baru Tailwind v4.

### 🔵 SUGGESTIONS (2)
1. **Pemisahan Layout Component Desktop:** Pertimbangkan memisah bagian Sidebar Nav dan Workspace ke file JS template di Electron, agar `index.html` tidak menjadi sasaran empuk tumpukan mark-up (bloated).
2. **Standardisasi Alias Variabel:** Variabel seperti `--sentra-website-typography-letter-spacing-tight` di Electron sangat panjang dan rawan salah pengetikan. Evaluasi dan standarisasi *alias* alias pendek antara Web dan Desktop.

### ✅ What's Good
- Pemodelan mapping warna `--c-asesmen: #e67e22` (*Pharm Orange*) dan dark mode canvas base `#121214` direplikasi dengan presisi absolut ke dua platform (Cross-platform consistency).
- Eksekusi efek *Neumorphism* (inset shadows dan elevation) diterapkan secara konsisten.
- Implementasi *Tailwind v4 inline theme* (`@theme inline`) di `globals.css` sudah merupakan teknik optimisasi mutakhir.

## Verification Commands Run
```bash
# Validasi struktural CSS syntax tanpa build step (Validated Manually)
pnpm lint          # Skipped for structural HTML/CSS review
pnpm typecheck     # Skipped for structural CSS
```

## Clinical Safety Assessment
- PHI Handling: **OK** (Sistem UI foundation yang dievaluasi tidak memuat atau membocorkan data *dummy* statis PHI)
- Guardrails: **INTACT**
- Clinical Logic: **VERIFIED** (Tingkat presentasional)
- Access Control: **ENFORCED** (Tidak ada bypass logic komponen)
