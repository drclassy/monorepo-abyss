# Cross-Agent SSOT Parity Audit — 2026-05-20

## Scope

Audit dan alignment untuk tiga layer agent non-Codex yang sudah ada di repo:

- Claude Code
- Cursor
- Roo Code

Targetnya bukan menyamakan semua fitur vendor, tetapi menyamakan pola minimum:

1. `AGENTS.md` adalah authority repo
2. `.agent/` adalah operational SSOT
3. urutan baca aktif dimulai dari `README.md` lalu `HANDOFF.md`
4. file legacy `.agent/DIGEST.md`, `.agent/LESSONS.md`, dan `.agent/SESSION_STATE.md` tidak dipakai sebagai active SSOT default

## Temuan Sebelum Alignment

- `CLAUDE.md` masih drift: path lama `V:\...`, urutan baca lama, masih mengandalkan `LESSONS.md`, dan masih menunggu konfirmasi setelah context load.
- `.claude/settings.json` masih mengarah ke hook lama di `.agent/hooks/`, padahal tooling aktif sudah pindah ke `tooling/governance/agent/`.
- Cursor sudah paling dekat ke shape baru, tetapi wording-nya masih mengarah ke root `.agent/` secara umum, belum ke nearest active `.agent/`.
- Roo sudah punya mode dan rule files, tetapi belum mewajibkan baca SSOT aktif sebelum kerja non-trivial.

## Implementasi

- `CLAUDE.md` dirapikan ke shape SSOT aktif dan menghapus drift yang bertentangan.
- `.claude/settings.json` diarahkan ke hook aktif di `tooling/governance/agent/`.
- `.cursor/rules/00-core.mdc` diperjelas untuk nearest active `.agent/` dan legacy-file avoidance.
- `.roo/rules-sentra-*/01-rules.md` diberi context guard yang sama.
- `.roomodes` diberi preamble SSOT guard agar custom mode Roo tetap membawa pola yang sama walau rule file mode tidak terbaca penuh.

## Verification Status

- Codex: runtime proof sudah ada sebelumnya melalui lifecycle `startup -> edit -> stop`.
- Claude Code: static parity aligned; runtime proof belum dijalankan di sesi ini.
- Cursor: static parity aligned; runtime proof belum dijalankan di sesi ini.
- Roo Code: static parity aligned; runtime proof belum dijalankan di sesi ini.

## Residual Risk

- `CLAUDE.md`, Cursor, dan Roo sekarang lebih selaras secara repo state, tetapi saya tidak mengklaim vendor-runtime proof tanpa menjalankan sesi nyata masing-masing tool.
- `.claude/settings.local.json` dan state lokal personal lain tidak saya ubah.
