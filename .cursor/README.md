# Cursor workspace (The Abyss monorepo)

## Project Rules (UI: **Cursor → Settings → Project Rules**)

| Lokasi                | Isi                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `.cursor/index.mdc`   | Lapisan **ringkas** selalu aktif: identitas Sentra, **precedence** vs `AGENTS.md`, prinsip inti, rujukan ke rules lain.                         |
| `.cursor/rules/*.mdc` | Aturan bertarget (globs / `alwaysApply` di frontmatter): workflows, policy, stack, Langflow/phase, front-end, isolasi skill, Sentratorium, dll. |

Semua file aturan yang dipakai Cursor untuk proyek ini berada di
**`index.mdc`** + **`rules/*.mdc`**. Setelah pull, buka **Project Rules** dan
pastikan daftar sesuai ekspektasi (reload window jika perlu).

## `.cursorignore` (indeks & retrieval)

File **`.cursorignore`** di root monorepo mengatur **apa yang tidak diindeks**
untuk konteks AI (lebih sedikit noise, retrieval lebih relevan).

**Dampak:** path yang tercantum di sana — termasuk **seluruh folder app** yang
sengaja dikecualikan (mis. `apps/academic/`, `apps/community/`, …) — **tidak**
menjadi bagian konteks indeks Cursor seperti halnya sumber di luar ignore. Jika
Chief bekerja pada app yang di-ignore:

1. Sementara **hapus atau komentari** baris yang relevan di `.cursorignore`,
   atau
2. Buka **worktree/branch** dengan penyesuaian ignore khusus tim, atau
3. Gunakan **@path** ke file secara eksplisit (perilaku tergantung versi Cursor;
   mengurangi ignore lebih andal).

**Area healthcare aktif** (mis. `apps/healthcare/`) **tidak** dicantumkan
sebagai exclude di ignore default — tetap terindeks saat root workspace adalah
monorepo.

## Hooks

`hooks.json` memanggil skrip di `.cursor/hooks/` (mis. log setelah edit).
Artefak log lokal diabaikan Git — lihat `.gitignore` root.

## Sandbox

`sandbox.json` memperluas path read/write untuk Agent ke monorepo.

---

© 2026 Sentra Healthcare AI — dokumentasi internal tooling.
