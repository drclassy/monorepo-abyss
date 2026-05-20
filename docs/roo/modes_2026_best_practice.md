# RooCode 2026 Best Practice - Mode Playbook (ABYSS)

Dokumen ini melengkapi mode-mode pada [`.roomodes`](../../.roomodes) agar implementasi konsisten, aman, dan terverifikasi di ABYSS.

## Scope

- Berlaku untuk mode:
  - Sentra Rush
  - Sentra Search
  - Sentra Smart
  - Sentra Deep
  - Sentra Review
  - Sentra Librarian
  - Sentra Oracle
- Berlaku untuk alur kerja di monorepo ABYSS.

## Global 2026 Principles (RooCode)

1. **Mode separation is strict**: mode planning tidak langsung implementasi; mode implementasi tidak langsung audit sendiri.
2. **Evidence-first before edit**: lakukan pencarian bukti (paths, references, risks) sebelum perubahan.
3. **Smallest safe diff**: ubah file sesedikit mungkin, satu area masalah per iterasi.
4. **Boundary-aware execution**: patuhi guardrail crown-jewel dan area proteksi.
5. **Verification-gated completion**: pekerjaan selesai hanya bila verifikasi relevan lulus.
6. **Deterministic output contracts**: tiap mode punya format output wajib agar handoff antar mode stabil.

## ABYSS Protected Boundaries

Ikuti [`docs/roo/global_guardrails.md`](./global_guardrails.md) dan [`AGENTS.md`](../../AGENTS.md).

High-protection boundaries:
- `packages/sentra/**`
- clinical decision logic
- diagnosis engine contracts
- `.env*`, secrets, PHI-like data
- database migrations
- lockfiles (kecuali dependency scope disetujui)

## Standard Cross-Mode Handoff Contract

Semua mode wajib menghasilkan 5 blok ringkas:

1. **Scope** (apa yang dikerjakan)
2. **Non-scope** (apa yang tidak disentuh)
3. **Evidence** (file/path/command output)
4. **Risk** (low/medium/high + alasan)
5. **Next action** (mode berikutnya + 1 command aman)

## Mode Catalog (Comprehensive)

### 0) Orchestrator

**Primary objective**
- Mengkoordinasikan workflow multi-step lintas mode dengan gate yang jelas.

**Allowed operations**
- Menentukan urutan mode, dependency, dan handoff criteria.
- Menentukan quality gate per fase.

**Do not**
- Jangan jadi mode implementasi utama; delegasikan implementasi ke Sentra Deep.

**Input template**
```text
Use Orchestrator.
Mission: <ID>
Design end-to-end execution plan with mode sequence, handoff contract, verification gate, and rollback trigger.
```

**Output contract**
- mission card
- ordered mode chain
- gate per step (entry/exit criteria)
- rollback trigger and owner

---

### 1) Sentra Rush

**Primary objective**
- Quick scan, summary, dan low-risk triage.

**Allowed operations**
- Read-only exploration.
- Minor doc note jika diminta eksplisit.

**Do not**
- Jangan melakukan refactor luas atau perubahan multi-package.

**Input template**
```text
Use Sentra Rush.
Scope: <small target>
Return: 5-point summary + 3 key risks + safest next step.
Do not edit unless explicitly approved.
```

**Output contract**
- 5 bullet summary
- top 3 risks
- one recommended next mode

---

### 2) Sentra Search

**Primary objective**
- Evidence collection sebelum perubahan.

**Allowed operations**
- Search references/imports/config/docs.
- Mapping ownership dan blast radius.

**Do not**
- Jangan edit file.

**Input template**
```text
Use Sentra Search.
Mission: <ID>
Analyze: <package/path>
Return: identity, consumers, config refs, docs refs, risk, safe next step.
```

**Output contract**
- evidence table (path, type, confidence)
- orphan/consumer classification
- risk class + mitigation

---

### 3) Sentra Smart

**Primary objective**
- Menerjemahkan evidence menjadi rencana bounded.

**Allowed operations**
- Planning dan decomposition.
- Menetapkan acceptance criteria dan verification plan.

**Do not**
- Jangan implementasi kode kecuali diminta pindah mode.

**Input template**
```text
Use Sentra Smart.
Convert search findings into implementation plan.
Include: scope, non-scope, target files, acceptance criteria, verification commands, rollback.
```

**Output contract**
- plan steps (ordered)
- explicit target files
- go/no-go criteria

---

### 4) Sentra Deep

**Primary objective**
- Implementasi perubahan kecil-menengah sesuai scope approval.

**Allowed operations**
- Edit terbatas pada file target.
- Jalankan verifikasi relevan.

**Do not**
- Jangan menyentuh protected boundaries tanpa approval eksplisit.
- Jangan memperluas scope saat menemukan isu lain.

**Input template**
```text
Use Sentra Deep.
Implement approved plan only.
Target files: <explicit list>
Non-scope: <explicit list>
Run verification and report pass/fail honestly.
```

**Output contract**
- changed files
- exact edits
- verification command + result
- unresolved risks

---

### 5) Sentra Review

**Primary objective**
- Audit independen pasca implementasi sebelum commit/push.

**Allowed operations**
- Diff audit, boundary check, verification coverage check.

**Do not**
- Jangan edit file.

**Input template**
```text
Use Sentra Review.
Audit diff for scope drift, protected path touches, lockfile drift, secrets/PHI risk, and verification quality.
Return PASS/FAIL with blockers.
```

**Output contract**
- PASS/FAIL
- blockers + evidence
- safe next command

---

### 6) Sentra Librarian

**Primary objective**
- Menjaga dokumentasi tetap akurat, singkat, dan sinkron.

**Allowed operations**
- Update README/spec/handoff docs.

**Do not**
- Jangan mengubah source code aplikasi.

**Input template**
```text
Use Sentra Librarian.
Update only required docs to reflect approved changes.
Keep factual and concise.
```

**Output contract**
- docs changed
- sections updated
- traceability to implementation/audit

---

### 7) Sentra Oracle

**Primary objective**
- High-stakes architecture and governance review sebelum perubahan besar.

**Allowed operations**
- Read-only strategic memo.
- Trade-off analysis dan safer alternative.

**Do not**
- Jangan implementasi langsung.

**Input template**
```text
Use Sentra Oracle.
Produce decision memo: decision, rationale, risks, safer alternative, acceptance criteria.
Flag any crown-jewel or boundary risks.
```

**Output contract**
- decision memo
- risk register
- approval gates

## Recommended Default Workflow (2026)

1. Sentra Search -> 2. Sentra Smart -> 3. Sentra Deep -> 4. Sentra Review -> 5. Sentra Librarian

Lihat playbook ringkas di [`docs/roo/abyss_package_cleanup_workflow.md`](./abyss_package_cleanup_workflow.md).

## Verification Baseline

Untuk implementasi (Sentra Deep), baseline verifikasi:

```powershell
pnpm typecheck -- --pretty false
pnpm build
pnpm lint
```

Jika ada test package-spesifik:

```powershell
pnpm --filter <package-name> test
```

Jika verifikasi gagal karena isu di luar scope, **stop** dan laporkan command gagal + akar masalah ringkas.

## Prompt Quality Checklist (All Modes)

Gunakan checklist ini sebelum eksekusi:

- scope eksplisit
- non-scope eksplisit
- target file/path eksplisit
- format output eksplisit
- risk tolerance eksplisit
- verification expectation eksplisit

## Anti-Patterns to Avoid

- Mulai dari implementasi tanpa evidence.
- Menggabungkan planning + coding + review dalam satu mode.
- Mengubah lockfile atau protected paths tanpa approval.
- Menyimpulkan “done” tanpa hasil verifikasi.

## Minimal Task Card Template

```text
Mission: <ID>
Mode: <sentra-...>
Scope: <explicit>
Non-scope: <explicit>
Target files: <explicit>
Output required: <explicit>
Verification: <commands>
```

## Related Documents

- [`docs/roo/global_guardrails.md`](./global_guardrails.md)
- [`docs/roo/model_mapping.md`](./model_mapping.md)
- [`docs/roo/first_task_prompt.md`](./first_task_prompt.md)
- [`docs/roo/abyss_package_cleanup_workflow.md`](./abyss_package_cleanup_workflow.md)
