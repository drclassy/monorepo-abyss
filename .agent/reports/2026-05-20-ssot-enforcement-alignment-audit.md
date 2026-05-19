# SSOT Enforcement Alignment Audit — 2026-05-20

## Brief

- Tujuan utama: membuat semua agent yang masuk ke monorepo ini menjalani pola
  baca SSOT `.agent/` yang sama sebelum kerja non-trivial.
- Root monorepo: `D:\Devops\abyss-monorepo`.
- SSOT aktif: `.agent/`; public rulebook: `AGENTS.md`.
- Enforcement teknis hidup di layer project `.codex/` dan
  `tooling/governance/agent/`.
- Batasan teknis utama: perubahan kecil, jangan sentuh crown-jewel
  `packages/sentra/**`, jangan pakai command destruktif, verifikasi harus
  sempit dan relevan.
- CI/governance lokal yang relevan: `tooling/governance/agent/healthcheck.js`,
  session lifecycle hooks, dan verifier lokal Codex.

## Best Practice 2026 Yang Dipakai

- `AGENTS.md` harus durable, ringkas, dan berlapis dari global ke project.
- Project `.codex/config.toml` dan `.codex/hooks.json` adalah tempat yang tepat
  untuk enforcement yang konsisten lintas sesi, selama project layer trusted.
- Hook `SessionStart` sebaiknya selalu memuat konteks inti repo saat
  `startup`, `resume`, dan `clear`.
- Hook `PostToolUse` sebaiknya mencakup edit lewat `apply_patch`, bukan hanya
  alias lama `Edit|Write`.
- Workflow yang sudah stabil sebaiknya dijadikan guardrail otomatis, bukan
  hanya instruksi manual di prompt.

## Temuan Akar Masalah

- Repo sudah punya rule SSOT yang benar di `AGENTS.md`, `.agent/README.md`,
  `.agent/HANDOFF.md`, dan `tooling/governance/agent/hooks/session-start.ps1`.
- Tetapi project layer belum eksplisit mengaktifkan `[features].hooks = true`,
  sehingga enforcement bergantung pada default runtime.
- `SessionStart` belum mencakup source `clear`, padahal docs resmi Codex
  menyebut `startup`, `resume`, dan `clear` sebagai source aktif.
- `PostToolUse` hanya match `Edit|Write`, sehingga coverage edit `apply_patch`
  tidak eksplisit.
- `healthcheck.js` belum memvalidasi governance layer `.codex/`, jadi drift di
  hook/config repo bisa lolos tanpa terdeteksi.

## Implementasi Yang Diterapkan

- Menambah `[features].hooks = true` di `D:\Devops\abyss-monorepo\.codex\config.toml`.
- Memperluas `SessionStart` matcher menjadi `startup|resume|clear`.
- Memperjelas `PostToolUse` matcher menjadi `^(apply_patch|Edit|Write)$`.
- Memperjelas output `session-start.ps1` dengan urutan baca SSOT yang wajib:
  `README.md` -> `HANDOFF.md` -> file SSOT lain sesuai risiko/tugas.
- Memperluas `tooling/governance/agent/healthcheck.js` agar ikut memeriksa:
  - root `.codex/config.toml`
  - root `.codex/hooks.json`
  - coverage `SessionStart`
  - coverage `PostToolUse`
  - coverage `Stop`

## Remaining Risks

- `PreToolUse` masih fokus ke command shell destruktif, bukan seluruh bentuk
  perubahan file atau semua tool path.
- Root `.agent/` masih punya jejak file legacy fisik yang bisa membingungkan
  agent tertentu walau shape aktif sudah didokumentasikan.
- Hook repo baru benar-benar terbukti operasional penuh setelah satu siklus
  agent nyata menjalani `startup`/`edit`/`stop` dengan project trusted.
