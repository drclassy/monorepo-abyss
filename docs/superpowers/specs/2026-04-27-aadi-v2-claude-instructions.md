# AADI V2 Instructions For Claude

Dokumen ini adalah instruksi kerja khusus untuk Claude saat mengerjakan
`AADI V2` di monorepo ini.

Tujuannya:
- membuat Claude mulai dari konteks yang benar
- mencegah Claude membangun jalur reasoning paralel
- memastikan feature klinis existing tetap dipakai seluruhnya
- membuat eksekusi tetap konsisten dengan spec, matrix, dan implementation plan

Dokumen ini tidak menggantikan `AGENTS.md`, `.agent/*`, atau `CLAUDE.md` root.
Dokumen ini adalah handoff task-specific untuk program `AADI V2`.

---

## External Notes

Catatan best practice resmi terbaru yang relevan:

- Anthropic memindahkan `Claude Code best practices` ke docs yang terus diperbarui pada 26 Januari 2026, dan tetap menekankan pentingnya `CLAUDE.md`, context discipline, dan tool/permission hygiene.
  - https://code.claude.com/docs/en/best-practices
  - Mirror announcement:
    https://www.anthropic.com/engineering/claude-code-best-practices
- Anthropic `Claude Code overview` tetap menekankan bahwa Claude bekerja paling baik saat diberi repo context, constraints, dan target hasil yang jelas.
  - https://docs.anthropic.com/en/docs/claude-code/overview
- Anthropic `system prompts` guidance tetap mendukung role prompting dan constraint clarity untuk perilaku yang konsisten.
  - https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts

Implikasi untuk instruksi ini:

- instruksi harus jelas, konkret, dan task-scoped
- context window harus dijaga ketat
- Claude harus diarahkan ke entry point dokumen yang spesifik
- aturan reuse dan verification harus ditulis eksplisit, bukan implisit

---

## Mission

Bangun `AADI V2` di dalam `@the-abyss/symphony` sebagai native diagnostic
reasoning engine yang:

- tetap safety-first
- tetap menjaga `traffic-light`, `alerts`, `trajectory`, `quality.auditHints`,
  dan action protocols
- me-reuse seluruh fondasi klinis existing yang relevan
- tidak memindahkan authority keluar dari `SYMPHONY`

Dashboard dan Assist adalah consumer, bukan reasoning authority.

---

## First Read

Sebelum menulis atau mengubah kode apa pun, baca dalam urutan ini:

1. `AGENTS.md`
2. `.agent/CONTEXT.md`
3. `.agent/PROGRESS.md`
4. `.agent/HANDOFF.md`
5. `.agent/LESSONS.md`
6. `.agent/DECISIONS.md`
7. `docs/superpowers/specs/README-aadi-v2.md`
8. `docs/superpowers/specs/2026-04-27-aadi-v2-design.md`
9. `docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`
10. `docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md`
11. `.agent/FEATURE.md`

Kalau belum membaca semuanya, jangan mulai implementasi.

---

## Canonical Truth

Untuk pekerjaan AADI V2, anggap ini sebagai truth hierarchy:

1. `AGENTS.md`
2. `.agent/*`
3. `docs/superpowers/specs/2026-04-27-aadi-v2-design.md`
4. `docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`
5. `docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md`
6. `.agent/FEATURE.md`

Kalau ada implementasi lokal yang tampak bertentangan dengan arah AADI V2,
jangan berimprovisasi diam-diam. Cocokkan dulu dengan hierarchy di atas.

---

## Non-Negotiable Rules

1. `SYMPHONY` adalah satu-satunya canonical clinical reasoning engine.
2. Jangan pindahkan diagnosis authority ke:
   - `sentra-rag`
   - `vertex-rag`
   - Dashboard local logic
   - Assist local logic
3. Jangan skip feature klinis existing yang relevan.
4. Jangan menghapus output existing ini selama migrasi:
   - `diagnosisSuggestions`
   - `alerts`
   - `trafficLight`
   - `trajectory`
   - `quality.auditHints`
   - action protocol attachment pada alert
5. Jangan mencampur:
   - operational engine status
   - clinical disposition
6. Treat `diagnosisSuggestions` lama sebagai bridge/fallback/shadow baseline,
   bukan pusat masa depan.
7. Setiap perubahan AADI V2 harus additive-first, bukan rewrite-first.

---

## Feature Reuse Rule

Untuk setiap task yang dikerjakan:

- feature klinis existing harus masuk salah satu kategori:
  - `REUSE_DIRECT`
  - `WRAP_AND_REUSE`
  - `REPLACE_WITH_PARITY_PROOF`
  - `KEEP_IN_ASSIST`
  - `CONSUMER_ONLY`
  - `OUT_OF_SCOPE_NOW`

Kalau status feature belum jelas, update dulu
`docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md`
sebelum coding.

Silent bypass dilarang.

Kalau membuat modul baru tanpa menyebut reuse feature existing yang relevan,
pekerjaan dianggap belum selesai.

---

## Mandatory Reuse Targets

Minimal reuse target yang wajib tetap hidup selama implementasi:

- `packages/symphony/src/engine/assess.ts`
- `packages/shared-types/src/symphony.ts`
- `packages/symphony/src/engine/news2.ts`
- `packages/symphony/src/engine/vital-alerts.ts`
- `packages/symphony/src/engine/screening-gates.ts`
- `packages/symphony/src/engine/symptom-signals.ts`
- `packages/symphony/src/engine/pattern-engine.ts`
- `packages/symphony/src/engine/clinical-patterns.ts`
- `packages/symphony/src/engine/clinical-patterns-definitions.ts`
- `packages/symphony/src/engine/anaphylaxis.ts`
- `packages/symphony/src/engine/pe-suspect.ts`
- `packages/symphony/src/engine/early-warning.ts`
- `packages/symphony/src/engine/composite-deterioration.ts`
- `packages/symphony/src/engine/trajectory.ts`
- `packages/symphony/src/engine/classifiers.ts`
- `packages/symphony/src/engine/action-protocols.ts`
- `packages/symphony/src/engine/traffic-light.ts`
- `packages/symphony/src/engine/hybrid-decisioning.ts`
- `packages/symphony/src/engine/parity-fixtures.ts`
- `packages/symphony/src/adapters/assist-patterns-parity.ts`

Khusus Sprint 1, reuse wajib paling cepat harus terlihat pada:

- `SymphonyClinicalSnapshot`
- `detectSymphonySymptomSignals()`
- `evaluateClinicalPatterns()`
- `detectSymphonyAnaphylaxis()`
- `detectSymphonyPeSuspect()`
- `calculateSymphonyNEWS2()`
- `evaluateSymphonyCompositeDeterioration()`
- `analyzeSymphonyTrajectory()`
- classifier HTN/glucose/chronic disease yang existing

---

## Execution Rule

Gunakan implementation plan sebagai urutan kerja resmi:

- file: `docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md`

Jangan loncat task sembarangan kecuali ada alasan teknis yang jelas.

Urutan default:

1. Task 1 — contracts
2. Task 2 — clinical facts + snapshot/pattern reuse
3. Task 3 — syndrome classifier
4. Task 4 — diagnosis packs + native differential
5. Task 5 — reasoning arbiter
6. Task 6 — explainability + clinical disposition
7. Task 7 — `assess.ts` integration
8. Task 8 — shadow comparison
9. Task 9 — parity gates
10. Task 10 — interoperability helpers

---

## Code Discipline

Saat implementasi:

- ikuti pattern existing repo
- jangan membuat helper baru kalau helper equivalent sudah ada
- jangan menyalin perilaku existing sebagai logic baru jika bisa wrap/reuse
- jangan broad catch atau silent fallback
- jangan downgrade hard safety alerts demi reasoning yang tampak lebih “cerdas”
- jangan menulis claim performa klinis yang belum tervalidasi

Kalau ada konflik antara code lama dan target AADI V2:

- utamakan preservation of safety
- utamakan explicit reasoning
- utamakan parity proof

---

## Verification Gate

Sebelum menutup task atau batch task:

1. update matrix coverage bila ada feature yang terdampak
2. jalankan verifikasi wajib
3. pastikan parity lama tetap hijau

Minimal verifikasi:

```bash
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
pnpm --filter @the-abyss/symphony lint
```

Wajib juga:

- `runSymphonyParityFixtures()`
- `runAssistPatternParityFixtures()`

Kalau AADI V2 path bekerja tapi parity lama rusak, task belum selesai.

---

## What To Report

Setelah selesai satu task, laporan harus menyebut:

- task mana yang selesai
- feature existing mana yang direuse
- file apa saja yang diubah
- test apa yang dijalankan
- apakah parity suite tetap hijau
- apakah ada deferred item yang perlu dibawa ke task berikutnya

Jangan lapor “done” tanpa bukti reuse dan verifikasi.

---

## What Not To Do

Jangan:

- membangun engine diagnosis baru di luar `packages/symphony`
- memotong `traffic-light` dari alur utama
- mengganti `diagnosisSuggestions` lama terlalu cepat
- menghapus protocol attachment dari alert
- menurunkan kualitas `trajectory` atau `quality.auditHints`
- mengubah boundary sehingga Assist atau Dashboard kembali menjadi host reasoning

---

## Short Prompt For Claude

Kalau butuh prompt singkat siap pakai, gunakan ini:

```text
You are implementing AADI V2 inside @the-abyss/symphony.

Read first:
1. AGENTS.md
2. .agent/CONTEXT.md
3. .agent/PROGRESS.md
4. .agent/HANDOFF.md
5. .agent/LESSONS.md
6. .agent/DECISIONS.md
7. docs/superpowers/specs/README-aadi-v2.md
8. docs/superpowers/specs/2026-04-27-aadi-v2-design.md
9. docs/superpowers/specs/2026-04-27-aadi-v2-feature-coverage-matrix.md
10. docs/superpowers/plans/2026-04-27-aadi-v2-implementation.md
11. .agent/FEATURE.md

Rules:
- SYMPHONY is the only canonical reasoning engine.
- Dashboard and Assist are consumers only.
- Do not skip clinically relevant existing features.
- Reuse or wrap existing SYMPHONY modules before creating new logic.
- Preserve alerts, trafficLight, trajectory, quality.auditHints, action protocols, and diagnosisSuggestions during migration.
- Update the feature coverage matrix before coding if affected mappings are incomplete.
- Run test, typecheck, lint, runSymphonyParityFixtures(), and runAssistPatternParityFixtures() before closing any task.

Execute tasks in the implementation plan order unless a concrete technical blocker requires a controlled deviation.
```

---

## Final Intent

Instruksi ini dibuat agar Claude tidak perlu rediscover arah AADI V2 dari nol.

Hasil yang diharapkan:

- lebih disiplin terhadap boundary
- lebih patuh pada reuse feature existing
- lebih aman terhadap regression
- lebih cepat bergerak di sprint tanpa kehilangan arah arsitektur
