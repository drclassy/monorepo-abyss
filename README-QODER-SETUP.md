# Sentra Qoder Setup — Panduan Instalasi

Konfigurasi Qoder IDE lengkap untuk monorepo Sentra Artificial Intelligence.
Setup ini telah disesuaikan dengan profil teknis dan operasional Sentra:
healthcare AI, monorepo Python + TypeScript, environment Windows 11 + PowerShell
7, dan prioritas safety-first untuk produk klinis.

---

## Isi Paket

| Kategori                   | File                                     | Tujuan                                                                                         |
| -------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Cross-tool config**      | `AGENTS.md`                              | Universal config (dipakai Qoder, Cursor, Claude Code, Codex)                                   |
| **Index protection**       | `.qoderignore`                           | Mencegah PHI dan secrets masuk ke index Qoder                                                  |
| **Rules (always-apply)**   | `.qoder/rules/00-03`                     | Konteks proyek, safety, coding standards, struktur monorepo                                    |
| **Rules (file-specific)**  | `.qoder/rules/04-07`                     | Python, TypeScript, clinical strict mode, agent orchestration                                  |
| **Rules (model-decision)** | `.qoder/rules/08-09`                     | Testing, git workflow                                                                          |
| **Sub-agents**             | `.qoder/agents/*.md`                     | 5 spesialis: clinical-reviewer, security-auditor, test-writer, spec-writer, refactor-architect |
| **Spec templates**         | `.qoder/specs/TEMPLATE-*.md`             | Template Quest Mode untuk fitur biasa dan fitur klinis                                         |
| **MCP servers**            | `.qoder/mcp.json`                        | Konfigurasi MCP (filesystem, fetch, git, github, postgres, dll)                                |
| **Nested rules**           | `packages/*/AGENTS.md`, `apps/AGENTS.md` | Rules khusus per direktori                                                                     |
| **Bootstrap**              | `scripts/setup-qoder.ps1`                | Installer PowerShell untuk Windows 11                                                          |

---

## Cara Pasang

### Opsi 1: Install ke repo yang sudah ada

```powershell
# Dari folder hasil ekstrak ZIP ini:
cd C:\path\to\sentra-qoder-setup

# Pasang ke repo target:
.\scripts\setup-qoder.ps1 -TargetRepo C:\dev\sentra

# Jika file sudah ada dan ingin menimpa:
.\scripts\setup-qoder.ps1 -TargetRepo C:\dev\sentra -Force
```

### Opsi 2: Copy manual

Jika tidak ingin menjalankan script, copy folder dan file ini ke root repo
target:

- `AGENTS.md`
- `.qoderignore`
- `.qoder/` (seluruh folder)
- `packages/clinical-core/AGENTS.md` (hanya jika folder package sudah ada)
- `packages/agents/AGENTS.md` (idem)
- `packages/ui-brand/AGENTS.md` (idem)
- `apps/AGENTS.md` (idem)

### Opsi 3: Pakai di Qoder CLI

Qoder CLI membaca `AGENTS.md` dan `.qoder/rules/` secara otomatis. Tidak ada
langkah tambahan setelah file disalin ke repo.

---

## Verifikasi Instalasi

Setelah pasang, buka Qoder IDE dan periksa:

1. **Rules termuat.** Klik avatar di pojok kanan atas → `Qoder Settings` →
   `Rules`. Harus muncul 10 rule files.
2. **Total karakter di bawah batas.** Qoder membatasi 100.000 karakter total
   untuk semua rule files aktif. Script `setup-qoder.ps1` mencetak laporan
   budget di akhir instalasi.
3. **MCP servers terdeteksi.** `Qoder Settings` → `MCP`. Beberapa server
   (filesystem, fetch, git) aktif default. Lainnya butuh enable manual.
4. **AGENTS.md dikenali.** Buka panel chat dan tanya: "Apa rules klinis utama
   untuk repo ini?" — Qoder harus menjawab dengan referensi ke healthcare
   guardrails.

---

## Cara Pakai

### Untuk pekerjaan harian (Agent Mode)

Cukup buka chat Qoder dan minta sesuatu. Rules dan `AGENTS.md` di-inject
otomatis ke setiap prompt. Tidak perlu menyebut "ikuti AGENTS.md" — Qoder sudah
membaca.

**Contoh prompt yang sudah ter-leverage rules:**

```
Tolong implementasikan fungsi cds_calculate_pediatric_paracetamol_dose
di packages/clinical-core. Sumber dosis: Formularium Nasional 2024.
```

Qoder akan otomatis:

- Membuat fungsi dengan signature keyword-only (dari rule 02 + 06).
- Menyertakan `Source:` di docstring (dari rule 01 + 06).
- Return `ClinicalRecommendation | ClinicalRefusal` (dari rule 06).
- Menyertakan audit log dan disclaimer (dari rule 01).
- Mengusulkan test file dengan happy/edge/refusal path (dari rule 08).

### Untuk pekerjaan kompleks (Quest Mode)

Quest Mode adalah spec-driven development. Workflow:

1. **Tulis spec.** Copy `.qoder/specs/TEMPLATE-standard-spec.md` →
   `.qoder/specs/<tanggal>-<nama-fitur>.md`. Isi semua section. Untuk fitur
   klinis, pakai `TEMPLATE-clinical-spec.md`.
2. **Atau minta spec-writer agent menulis spec.** Buka chat, tag `@spec-writer`,
   deskripsikan fitur secara bebas. Agent akan menghasilkan spec terstruktur.
3. **Review spec.** Pastikan semua section terisi, section "Open questions"
   sudah dijawab.
4. **Jalankan Quest Mode.** Klik Quest Mode di panel chat → pilih spec file →
   eksekusi. Qoder akan membaca spec, menyusun todo list, dan mengeksekusi
   langkah demi langkah.
5. **Review hasil.** Qoder berhenti di tiap milestone untuk konfirmasi.

### Untuk review (Sub-agents)

Sub-agents dijalankan dengan menyebut nama di chat:

```
@clinical-reviewer review PR ini dan tampilkan finding.
@security-auditor scan folder services/api-gateway untuk secret leakage.
@test-writer generate test untuk file packages/clinical-core/src/sentra_clinical/dosage/pediatric.py.
@refactor-architect rancang plan untuk memindahkan OCR dari prototypes/ ke packages/.
```

---

## Memahami Struktur Rules

Qoder mendukung 4 jenis rule:

| Jenis              | Kapan dipakai                                    | File contoh di setup ini                                                                                                                |
| ------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Always Apply**   | Inject ke setiap prompt                          | `00-project-overview`, `01-healthcare-guardrails`, `02-coding-standards`, `03-monorepo-structure`                                       |
| **Specific Files** | Inject jika file editing match pattern           | `04-python-conventions` (`*.py`), `05-typescript-conventions` (`*.ts`/`*.tsx`), `06-clinical-strict-mode` (`packages/clinical-core/**`) |
| **Model Decision** | AI memutuskan kapan inject berdasarkan deskripsi | `08-testing-quality`, `09-git-workflow`                                                                                                 |
| **Apply Manually** | Inject hanya jika di-tag `@rule-name`            | (belum dipakai di setup ini)                                                                                                            |

**Konfigurasi tipe rule:** Buka Qoder Settings → Rules → edit setiap rule → set
tipe. Setup ini sudah memberi panduan tipe di baris pertama setiap file
(`**Apply: ...**`), Qoder akan otomatis mengusulkan tipe yang benar.

---

## Cara Modifikasi

### Menambah rule baru

1. Buat file `.qoder/rules/10-nama-rule.md` (gunakan nomor urut).
2. Mulai dengan header
   `**Apply: Always | Specific Files | Model Decision | Apply Manually**`.
3. Tulis dalam bahasa Inggris (LLM lebih efisien dengan token bahasa Inggris).
4. Jaga total karakter di bawah 100.000.

### Menambah sub-agent baru

1. Buat file `.qoder/agents/nama-agent.md`.
2. Mulai dengan YAML frontmatter (lihat agent yang sudah ada sebagai template).
3. Tentukan `allowed_tools`, `forbidden_tools`, `max_steps`.
4. Tulis instruksi peran yang jelas: apa yang dilakukan, apa yang tidak, output
   format apa.

### Menyesuaikan untuk domain non-healthcare

Jika repo ini bukan untuk healthcare:

- Hapus `.qoder/rules/01-healthcare-guardrails.md`.
- Hapus `.qoder/rules/06-clinical-strict-mode.md`.
- Hapus `.qoder/agents/clinical-reviewer.md`.
- Hapus `.qoder/specs/TEMPLATE-clinical-spec.md`.
- Edit `AGENTS.md` root: hapus section "Critical Safety Rules" terkait clinical.
- Edit `00-project-overview.md` sesuai konteks proyek baru.

---

## Compatibility dengan AI Tool Lain

`AGENTS.md` di root adalah **open standard** yang dibaca oleh:

- **Qoder** (otomatis, dengan precedence ke rules `.qoder/rules/`).
- **Cursor** (otomatis).
- **Claude Code** (otomatis sebagai pengganti `CLAUDE.md`).
- **GitHub Copilot** (otomatis).
- **OpenAI Codex CLI** (otomatis).
- **Gemini CLI** (otomatis).
- **Aider** (perlu flag `--read AGENTS.md`).

Artinya, setup ini bisa dipakai paralel dengan tool lain tanpa duplikasi
konfigurasi.

---

## Troubleshooting

| Masalah                                     | Penyebab                      | Solusi                                                                                      |
| ------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| Rules tidak muat                            | Rule type tidak diset         | Buka Qoder Settings → Rules → klik tiap rule → set type sesuai header file                  |
| Total karakter overflow                     | Banyak rule custom            | Jalankan ulang `setup-qoder.ps1`, lihat laporan budget di akhir. Pangkas rule yang panjang. |
| MCP server gagal                            | Node.js tidak terpasang       | Install Node.js 20+ via `winget install OpenJS.NodeJS.LTS`                                  |
| Qoder mengabaikan rules klinis              | File ada di `.qoderignore`    | Cek path file. `.qoderignore` mem-blokir indexing, bukan rules. Rules tetap aktif.          |
| Quest Mode menghasilkan kode tanpa citation | Rules tidak terbaca           | Verifikasi `.qoder/rules/01-healthcare-guardrails.md` ada dan type-nya "Always Apply"       |
| Pre-commit hook menolak commit valid        | False positive pada nama file | Cek pattern di `scripts/setup-qoder.ps1`. Sesuaikan jika perlu.                             |

---

## Catatan Penting

1. **Rules vs AGENTS.md:** Jika ada konflik, **rules content menang**. Letakkan
   aturan paling spesifik di `.qoder/rules/`, aturan umum di `AGENTS.md`.
2. **Character limit:** Maksimum total 100.000 karakter di semua rule aktif.
   Setup ini sekitar 45.000 karakter — masih ada ruang untuk rule tambahan.
3. **PHI protection:** `.qoderignore` adalah baris pertahanan terhadap PHI masuk
   ke index Qoder. Jangan dihapus. Jika menambah folder baru yang berisi data
   sensitif, tambahkan ke `.qoderignore` segera.
4. **Sub-agents bukan magic:** Mereka adalah prompt terstruktur. Kualitas output
   tergantung pada kualitas instruksi di file agent. Iterasi dan tuning normal.
5. **Spec-driven development butuh latihan:** Quest Mode menjadi sangat efektif
   setelah tim terbiasa menulis spec yang baik. Mulai dari fitur kecil sebelum
   memakainya untuk refactor besar.

---

## Pemeliharaan

- **Tinjau rules tiap kuartal.** Apa yang berubah dalam workflow? Apa yang tidak
  lagi relevan?
- **Audit `.qoderignore` tiap rilis.** Folder baru yang mungkin berisi PHI sudah
  masuk?
- **Update sub-agents berdasarkan retrospective.** Jika `clinical-reviewer`
  melewatkan kelas bug tertentu, tambahkan ke checklist-nya.
- **Bagi rules baru ke tim.** File `.qoder/rules/` di-commit ke git, jadi
  seluruh tim otomatis dapat update.

---

## Kontak

Pertanyaan tentang setup ini diarahkan ke tim platform internal Sentra. Untuk
pertanyaan tentang Qoder sendiri:

- Dokumentasi resmi: https://docs.qoder.com
- Community: https://github.com/Qoder-AI

---

**Selamat membangun dengan aman.**
