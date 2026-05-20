# `fhir-engine` Resource Validation Instructions For Claude

Dokumen ini adalah instruksi kerja khusus untuk Claude saat mengerjakan lane
validasi resource `Condition`, `RiskAssessment`, dan `DiagnosticReport` di
`packages/sentra/sentra-sandi`.

Dokumen ini tidak menggantikan `AGENTS.md`, `.agent/*`, atau `CLAUDE.md` root.
Dokumen ini adalah handoff task-specific untuk lane follow-up setelah
modernization baseline `fhir-engine` selesai.

---

## External Notes

Catatan best practice resmi terbaru yang relevan:

- Anthropic `Claude Code best practices` tetap menekankan:
  - explore first, then plan, then code
  - context harus spesifik dan ramping
  - verification harus eksplisit
  - jangan biarkan model menebak scope yang tidak tertulis
  - Sumber: `https://code.claude.com/docs/en/best-practices`
- Anthropic `system prompts` guidance tetap mendukung role + constraints yang jelas untuk menjaga perilaku tetap konsisten.
  - Sumber: `https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts`
- HL7 R5 menempatkan:
  - `Condition` sebagai resource masalah/diagnosis/concern
  - `RiskAssessment` sebagai event resource penilaian risiko
  - `DiagnosticReport` sebagai event resource hasil dan interpretasi report
  sehingga ketiganya harus divalidasi secara structural, bukan diisi ulang
  dengan reasoning semantics.
  - Sumber:
    - `https://www.hl7.org/fhir/R5/Condition.html`
    - `https://fhir.hl7.org/fhir/riskassessment-definitions.html`
    - `https://hl7.org/fhir/DiagnosticReport.html`

Implikasinya untuk instruksi ini:

- perlu task order yang ketat
- perlu boundary yang jelas antara structural validation dan clinical meaning
- perlu report yang jujur soal minimum bounded shape

---

## Mission

Perluas `packages/sentra/sentra-sandi` agar dapat memvalidasi secara bounded:

- `Condition`
- `RiskAssessment`
- `DiagnosticReport`

tanpa:

- memindahkan mapping authority dari `@sentra/nada`
- menambahkan reasoning semantics
- membangun terminology/profile engine

Tujuan lane ini adalah:

- memperluas support matrix validator
- menjaga package tetap jujur dan bounded
- mempersiapkan promotion bertahap berikutnya tanpa scope creep

---

## First Read

Sebelum mengubah kode apa pun, baca dalam urutan ini:

1. `AGENTS.md`
2. `.agent/README.md`
3. `.agent/HANDOFF.md`
4. `.agent/CONTEXT.md`
5. `.agent/PROGRESS.md`
6. `.agent/DECISIONS.md`
7. `docs/specs/aadi-v2/README.md`
8. `docs/specs/aadi-v2/008-2026-04-29-aadi-v2-phase-2-readiness-gate.md`
9. `docs/specs/aadi-v2/009-2026-04-29-aadi-v2-terminology-mapping.md`
10. `docs/specs/aadi-v2/010-2026-04-29-aadi-v2-fhir-promotion-plan.md`
11. `docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md`
12. `docs/guides/implementation-plans/007-2026-04-29-fhir-engine-modernization-implementation.md`
13. `docs/guides/implementation-plans/008-2026-04-29-fhir-engine-resource-validation-implementation.md`

Kalau belum membaca semuanya, jangan mulai implementasi.

---

## Canonical Truth

Untuk lane validasi resource ini, anggap ini sebagai truth hierarchy:

1. `AGENTS.md`
2. `.agent/*`
3. `docs/specs/aadi-v2/README.md`
4. `docs/specs/aadi-v2/008-2026-04-29-aadi-v2-phase-2-readiness-gate.md`
5. `docs/specs/aadi-v2/010-2026-04-29-aadi-v2-fhir-promotion-plan.md`
6. `docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md`
7. `docs/guides/implementation-plans/007-2026-04-29-fhir-engine-modernization-implementation.md`
8. `docs/guides/implementation-plans/008-2026-04-29-fhir-engine-resource-validation-implementation.md`

Kalau ada implementasi lama yang terasa lebih luas dari hierarchy ini, jangan
diam-diam mengikuti implementasi lama. Selaraskan dulu dengan hierarchy di atas.

---

## Non-Negotiable Rules

1. `SYMPHONY` tetap satu-satunya clinical reasoning authority.
2. Jangan pindahkan:
   - `mapSymphonyResultToFhirBundle()`
   - `mapSymphonyResultToCdsHooksResponse()`
   keluar dari `packages/sentra/sentra-nada`.
3. Jangan menambahkan:
   - terminology expansion
   - profile registry penuh
   - diagnosis reconstruction
   - semantic validation yang menafsir ulang clinical meaning
4. Jangan menambah resource lain di luar:
   - `Condition`
   - `RiskAssessment`
   - `DiagnosticReport`
5. Jangan over-model resource penuh bila bounded shape sudah cukup untuk task.
6. Jangan mengklaim support sebelum ada:
   - schema
   - validator branch
   - test
   - README/support-matrix update

---

## Boundary Rule

Yang tetap tinggal di `packages/sentra/sentra-nada`:

- diagnosis semantics
- traffic-light semantics
- clinical disposition
- alerting semantics
- AADI V2 interop mapping
- resource construction dari `SymphonyResult`

Yang boleh ditambahkan di `packages/sentra/sentra-sandi`:

- bounded Zod schema
- bounded exported resource type
- validator branch
- support-matrix update
- validation-hook reconciliation

Yang tidak boleh dilakukan di lane ini:

- mengubah `FhirTransformer` jadi mapper
- menambah logic yang membaca `SymphonyResult`
- mengisi resource dengan derived reasoning

---

## Execution Rule

Gunakan implementation plan sebagai urutan kerja resmi:

- `docs/guides/implementation-plans/008-2026-04-29-fhir-engine-resource-validation-implementation.md`

Urutan default:

1. Task 1 — baseline deferred-resource tests
2. Task 2 — bounded `Condition` validation
3. Task 3 — bounded `RiskAssessment` validation
4. Task 4 — bounded `DiagnosticReport` validation
5. Task 5 — validation hook + support-matrix reconciliation
6. Task 6 — final verification + readiness verdict

Jangan loncat task kecuali ada blocker teknis yang jelas.

---

## Code Discipline

Saat implementasi:

- lebih baik bounded daripada berlebihan
- lebih baik explicit unsupported daripada pseudo-support
- jangan gunakan `any`
- jangan broad catch
- jangan menambah fallback diam-diam
- jangan menambah requirement field yang tidak konsisten dengan bounded plan
- jangan membuat README/table lebih luas dari validator aktual

Untuk tiap resource family:

- pilih minimum structural slice yang masuk akal
- validasikan field inti saja
- dokumentasikan apa yang belum dimodelkan

---

## Verification Gate

Sebelum menutup task atau batch task:

```bash
pnpm --filter @sentra/sandi test
pnpm --filter @sentra/sandi typecheck
pnpm --filter @sentra/sandi lint
```

Karena support matrix dan package boundary berubah, jalankan juga:

```bash
pnpm --filter @sentra/nada test
pnpm --filter @sentra/nada typecheck
```

Kalau support matrix bertambah tapi README, exports, atau validation hook belum
sinkron, task belum selesai.

---

## What To Report

Setelah selesai satu task, laporan harus menyebut:

- task mana yang selesai
- resource family mana yang dipromosikan dari deferred ke supported
- minimum required fields yang dipilih
- file apa saja yang diubah
- tests apa yang ditambah/diubah
- hasil verifikasi `fhir-engine`
- hasil verifikasi `symphony`
- apa yang masih deferred setelah task itu

Jangan lapor “done” tanpa menjelaskan bounded shape yang dipilih.

---

## What Not To Do

Jangan:

- memindahkan authority dari `packages/sentra/sentra-nada`
- menjadikan validasi structural sebagai semantic reasoning
- menambah `Bundle`, `GuidanceResponse`, atau resource lain di luar plan ini
- menggabungkan tiga resource family sekaligus tanpa task split yang jelas
- memperlakukan error validator sebagai clinical interpretation engine

---

## Short Prompt For Claude

Kalau butuh prompt singkat siap pakai, gunakan ini:

```text
You are expanding `packages/sentra/sentra-sandi` validation support for three deferred FHIR resource families:
- Condition
- RiskAssessment
- DiagnosticReport

Read first:
1. AGENTS.md
2. .agent/README.md
3. .agent/HANDOFF.md
4. .agent/CONTEXT.md
5. .agent/PROGRESS.md
6. .agent/DECISIONS.md
7. docs/specs/aadi-v2/README.md
8. docs/specs/aadi-v2/008-2026-04-29-aadi-v2-phase-2-readiness-gate.md
9. docs/specs/aadi-v2/010-2026-04-29-aadi-v2-fhir-promotion-plan.md
10. docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md
11. docs/guides/implementation-plans/007-2026-04-29-fhir-engine-modernization-implementation.md
12. docs/guides/implementation-plans/008-2026-04-29-fhir-engine-resource-validation-implementation.md

Rules:
- SYMPHONY remains the only clinical reasoning authority.
- Do not move interop mapping functions out of `packages/sentra/sentra-nada`.
- Add only bounded structural validation.
- Do not add terminology expansion, semantic diagnosis logic, or profile-engine scope.
- A resource is not supported until it has schema + validator branch + tests + support-matrix update.
- Run `pnpm --filter @sentra/sandi test`, `typecheck`, and `lint` before closing each task.
- Run `pnpm --filter @sentra/nada test` and `typecheck` as part of this lane because package boundary/support matrix changes are in scope.

Execute tasks in the implementation plan order unless a concrete technical blocker requires a controlled deviation.
```

---

## Final Intent

Instruksi ini dibuat agar Claude:

- tidak mengulang discovery dari nol
- tidak mencampur validation lane dengan reasoning lane
- menambah support matrix secara aman dan test-backed
- tetap menjaga `packages/sentra/sentra-sandi` sebagai bounded validator, bukan FHIR
  platform penuh
