# Sentra Prompt

Extension resmi Sentra untuk mengaudit prompt Codex/Cursor agar lebih aman,
lebih bisa diverifikasi, dan lebih selaras dengan praktik prompt agent modern.

## What it does

- Membuka webview `Sentra Prompt Engine` langsung di Cursor atau VS Code
- Membiarkan Chief menulis satu request bebas di textarea besar
- Menyediakan quick mode `Implement`, `Review`, `Debug`, `Plan`, atau `Verify`
- Menambahkan lightweight IDE context seperti repo name, workspace path, active
  file, dan core rule source
- Menyusun final prompt siap pakai langsung dari dalam editor
- Meng-copy hasil prompt dengan satu klik
- Membaca prompt yang sedang dipilih di editor
- Mengaudit prompt terhadap rubric Codex-native
- Menilai instruction hierarchy, task clarity, tool usage, verification, safety,
  dan eval readiness
- Menampilkan `Decision`, `Critical Findings`, `Recommended Actions`, dan
  `Suggested Rewrite`
- Mengizinkan apply rewrite hanya saat prompt memang belum siap

## Commands

- `Sentra Prompt: Open Prompt Engine`
- `Sentra Prompt: Audit Codex Prompt`
- `Sentra Prompt: Generate Mission Prompt (Legacy Alias)`

Command alias lama tetap ada sementara agar workflow existing tidak langsung
putus, tetapi behavior-nya sekarang diarahkan ke audit prompt resmi.

## Local prerequisites

- VS Code `1.90.0` atau lebih baru
- Node.js `20+`
- `pnpm` `9.15.0`

## Package-scoped verification

Jalankan semua verifikasi dari folder `tooling/prompt-engine`:

1. `pnpm typecheck`
2. `pnpm test`
3. `pnpm package`

Target verifikasi package ini hanya `tooling/prompt-engine`, bukan build atau
test monorepo penuh.

## Build and package

1. Buka terminal di folder `tooling/prompt-engine`
2. Jalankan `pnpm install` bila dependency package ini belum siap
3. Jalankan `pnpm typecheck`
4. Jalankan `pnpm test`
5. Jalankan `pnpm package`
6. Ambil file `dist/sentra-prompt.vsix`
7. Install dari VSIX di Cursor atau VS Code

## Manual smoke path for Prompt Engine

1. Jalankan `pnpm typecheck`
2. Jalankan `pnpm test`
3. Jalankan `pnpm package`
4. Install VSIX di Cursor atau VS Code
5. Jalankan `Sentra Prompt: Open Prompt Engine`
6. Pilih mode, tulis request, lalu klik `Compose`
7. Pastikan preview `Final Prompt` terisi
8. Klik `Copy`, lalu paste ke scratch file untuk memastikan clipboard berhasil

## Manual testing

- Checklist: [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)
- Prompt samples: [PROMPT_SAMPLES.md](./PROMPT_SAMPLES.md)

## Notes

- Package ini menggantikan flow lama yang hanya membentuk mission prompt
  generik.
- Source of truth implementasi resmi sekarang hidup di `tooling/prompt-engine`.
- Prototype repo tetap bisa dipakai sebagai lab sementara sampai trial resmi
  selesai.
