# `fhir-engine` Modernization Instructions For Claude

Dokumen ini adalah instruksi kerja khusus untuk Claude saat mengerjakan
modernization `packages/fhir-engine`.

Dokumen ini tidak menggantikan `AGENTS.md`, `.agent/*`, atau `CLAUDE.md` root.
Dokumen ini adalah handoff task-specific untuk lane Phase 2
`fhir-engine modernization`.

---

## External Notes

Catatan best practice resmi terbaru yang relevan:

- Anthropic `Claude Code best practices` tetap menekankan:
  - explore first, then plan, then code
  - give Claude a way to verify its work
  - jaga context tetap ramping
  - gunakan docs/context yang spesifik, bukan panjang tapi kabur
  - Sumber: `https://code.claude.com/docs/en/best-practices`
- Anthropic `Claude Code overview` tetap menekankan bahwa Claude paling efektif saat diberi repo context, constraints, dan goal yang jelas.
  - Sumber: `https://code.claude.com/docs`
- HL7 FHIR R5 masih current published version, jadi modernization package harus bergerak ke arah `R5-target`, bukan menguatkan framing R4-only.
  - Sumber: `https://hl7.org/fhir/versions.html`

Implikasinya untuk instruksi ini:

- mulai dari dokumen yang tepat
- jangan bloat context dengan scope yang tidak relevan
- verifikasi harus eksplisit
- jangan overclaim capability package

---

## Mission

Modernize `packages/fhir-engine` menjadi package yang:

- jujur tentang kemampuan yang benar-benar ada hari ini
- bounded sebagai validation/normalization candidate
- siap untuk promotion bertahap di Phase 2
- tidak mengambil reasoning authority dari `@the-abyss/symphony`

`SYMPHONY` tetap sumber canonical untuk:

- clinical reasoning
- diagnosis semantics
- interop intent
- AADI V2 mapping authority

---

## First Read

Sebelum mengubah kode apa pun, baca dalam urutan ini:

1. `AGENTS.md`
2. `.agent/CONTEXT.md`
3. `.agent/PROGRESS.md`
4. `.agent/HANDOFF.md`
5. `.agent/LESSONS.md`
6. `.agent/DECISIONS.md`
7. `docs/superpowers/specs/README-aadi-v2.md`
8. `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
9. `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
10. `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
11. `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
12. `docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md`

Kalau belum membaca semuanya, jangan mulai implementasi.

---

## Canonical Truth

Untuk pekerjaan modernization `fhir-engine`, anggap ini sebagai truth
hierarchy:

1. `AGENTS.md`
2. `.agent/*`
3. `docs/superpowers/specs/README-aadi-v2.md`
4. `docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md`
5. `docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md`
6. `docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md`
7. `docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md`
8. `docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md`

Kalau ada implementasi lama yang bertentangan dengan hierarchy ini, jangan
improvisasi diam-diam. Selaraskan dulu dengan urutan di atas.

---

## Non-Negotiable Rules

1. `SYMPHONY` tetap satu-satunya clinical reasoning authority.
2. Jangan pindahkan:
   - `mapSymphonyResultToFhirBundle()`
   - `mapSymphonyResultToCdsHooksResponse()`
   keluar dari `packages/symphony` dalam workstream ini.
3. Jangan ubah `packages/fhir-engine` menjadi:
   - terminology server
   - diagnosis mapper authority
   - profile registry penuh
   - second reasoning path
4. Jangan mengklaim dukungan `R5` yang belum ada di code dan test.
5. Jangan membiarkan method TODO-heavy tampil seolah production-ready.
6. Jangan menambah dukungan resource baru di luar task yang disetujui plan.
7. Semua perubahan harus additive, type-safe, dan bounded.

---

## Package Boundary Rule

Yang tetap tinggal di `packages/symphony`:

- reasoning-driven resource population
- `SymphonyResult` semantics
- AADI V2 interop adapters
- diagnosis ranking
- traffic-light semantics
- clinical disposition semantics

Yang boleh dimodernisasi di `packages/fhir-engine`:

- bounded structural validation
- bounded normalization seam
- support matrix declaration
- future validation hook seam
- R5-target documentation posture

Yang tidak boleh dimasukkan ke `packages/fhir-engine` saat ini:

- `Condition`/`RiskAssessment`/`DiagnosticReport` validation penuh tanpa task resmi
- terminology expansion service
- profile resolution engine penuh
- mapping dari `SymphonyResult` ke resource FHIR

---

## Execution Rule

Gunakan implementation plan sebagai urutan kerja resmi:

- `docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md`

Jangan loncat task sembarangan kecuali ada alasan teknis yang jelas.

Urutan default:

1. Task 1 — baseline audit + failing honesty tests
2. Task 2 — README and role clarification
3. Task 3 — transformer honesty pass
4. Task 4 — resource support matrix declaration
5. Task 5 — R5 target prep
6. Task 6 — validation hook readiness
7. Task 7 — final verification + handoff

---

## Code Discipline

Saat implementasi:

- utamakan honesty over convenience
- lebih baik explicit unsupported daripada fake transform
- jangan gunakan `any`
- jangan broad catch atau silent fallback
- jangan memperluas type union kalau validator nyata belum mendukungnya
- jangan menulis README/example yang lebih maju dari code aktual
- jangan mengimpor logika klinis dari `packages/symphony` ke `packages/fhir-engine`

Kalau ada konflik antara backward compatibility dan truthfulness:

- utamakan truthfulness
- preserve compile compatibility bila masih aman
- dokumentasikan perubahan semantik secara eksplisit

---

## Verification Gate

Sebelum menutup task atau batch task:

```bash
pnpm --filter @the-abyss/fhir-engine test
pnpm --filter @the-abyss/fhir-engine typecheck
pnpm --filter @the-abyss/fhir-engine lint
```

Kalau docs, exports, atau boundary wording menyentuh implikasi AADI V2:

```bash
pnpm --filter @the-abyss/symphony test
pnpm --filter @the-abyss/symphony typecheck
```

Kalau package tampak “lebih rapi” tapi masih overclaim capability, task belum
selesai.

---

## What To Report

Setelah selesai satu task, laporan harus menyebut:

- task mana yang selesai
- file apa saja yang diubah
- honesty decision yang diambil
- resource support matrix yang aktif setelah perubahan
- test apa yang dijalankan
- apakah verifikasi `fhir-engine` hijau
- apakah verifikasi `symphony` perlu dijalankan dan hasilnya apa
- deferred item apa yang dibawa ke task berikutnya

Jangan lapor “done” tanpa menyebut verification dan boundary impact.

---

## What Not To Do

Jangan:

- memindahkan interop mapping authority keluar dari `packages/symphony`
- mengubah `fhir-engine` menjadi “general FHIR platform” secara prematur
- membiarkan `toInternal()` / `toFhir()` tetap cast-only tanpa honesty decision
- mengklaim dukungan `Condition`, `RiskAssessment`, atau `DiagnosticReport` jika validator belum benar-benar mendukung
- memasukkan terminology governance ad-hoc langsung ke transformer

---

## Short Prompt For Claude

Kalau butuh prompt singkat siap pakai, gunakan ini:

```text
You are modernizing `packages/fhir-engine` for AADI V2 Phase 2 preparation.

Read first:
1. AGENTS.md
2. .agent/CONTEXT.md
3. .agent/PROGRESS.md
4. .agent/HANDOFF.md
5. .agent/LESSONS.md
6. .agent/DECISIONS.md
7. docs/superpowers/specs/README-aadi-v2.md
8. docs/superpowers/specs/2026-04-29-aadi-v2-phase-2-readiness-gate.md
9. docs/superpowers/specs/2026-04-29-aadi-v2-terminology-mapping.md
10. docs/superpowers/specs/2026-04-29-aadi-v2-fhir-promotion-plan.md
11. docs/superpowers/specs/2026-04-29-fhir-engine-modernization-spec.md
12. docs/superpowers/plans/2026-04-29-fhir-engine-modernization-implementation.md

Rules:
- SYMPHONY remains the only clinical reasoning authority.
- Do not move interop mapping functions out of `packages/symphony`.
- Do not add a terminology server, diagnosis reconstruction logic, or a second reasoning path.
- Make `packages/fhir-engine` honest first: role clarity, transformer honesty, support matrix, R5-target wording, validation hook seam.
- Do not claim R5 or broader resource support without code and tests proving it.
- Run `pnpm --filter @the-abyss/fhir-engine test`, `typecheck`, and `lint` before closing each task.
- Run `pnpm --filter @the-abyss/symphony test` and `typecheck` whenever package boundary or AADI V2 implications change.

Execute tasks in the implementation plan order unless a concrete technical blocker requires a controlled deviation.
```

---

## Final Intent

Instruksi ini dibuat agar Claude:

- tidak mengulang discovery dari nol
- tidak overbuild `fhir-engine`
- tidak mencampur validation lane dengan reasoning lane
- bisa mengeksekusi modernization package ini secara aman, jujur, dan siap
  untuk promotion bertahap berikutnya
