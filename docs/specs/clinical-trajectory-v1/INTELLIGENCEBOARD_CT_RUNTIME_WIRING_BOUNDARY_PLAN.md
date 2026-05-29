# Intelligenceboard CT Runtime Wiring Boundary Plan

## 1. Purpose

Dokumen ini merencanakan runtime wiring untuk Intelligenceboard CT adapter saja.
Dokumen ini tidak mengimplementasikan wiring.

Tujuan utamanya adalah menentukan boundary wiring minimal yang aman, bisa diaudit,
dan tidak menggeser authority klinis dari boundary yang sudah disetujui.

## 2. Current verified state

- Latest commit inspected: `8b2f6254`
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts` sudah tracked
  di root Git boundary yang disetujui.
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts` sudah
  tracked di root Git boundary yang disetujui.
- `ABYSS-CT-AUDIT-009`: `PASS`
- Root tracking boundary tetap aman:
  - `apps/healthcare/intelligenceboard/.agent/**` tetap ignored
  - `apps/healthcare/intelligenceboard/.env.example` tetap ignored
  - tidak ada app internals lain yang ikut terbuka
- Latest verified repo-wide checks sebelum mission plan ini:
  - `pnpm typecheck`: `PASS`
  - `pnpm lint`: `PASS`
  - `pnpm build`: `PASS`
  - `pnpm test`: `PASS`

## 3. Ownership boundary

- `@sentra/nada` adalah long-term trajectory reasoning authority.
- `@the-abyss/shared-types` adalah CT v1 consumer-safe contract authority.
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts` adalah
  bridge transitional yang disetujui dari local Intelligenceboard trajectory
  output menuju shared CT v1 contract.
- Local app engine Intelligenceboard tetap fallback/transitional only. Ia bukan
  canonical CT authority dan tidak boleh dipromosikan menjadi authority lewat
  runtime wiring.

Implikasi boundary:

- Future wiring boleh mengonsumsi hasil engine lokal sebagai transitional input.
- Future wiring tidak boleh mengubah local engine menjadi source of truth jangka
  panjang.
- Future wiring tidak boleh menggeser ownership contract dari
  `@the-abyss/shared-types`.
- Future wiring tidak boleh mendeskripsikan Intelligenceboard adapter sebagai
  reasoning authority.

## 4. Candidate runtime entrypoints inspected

| Candidate file/path | Current role | Wiring suitability | Risk | Decision |
|---|---|---|---|---|
| `apps/healthcare/intelligenceboard/src/app/api/patients/[id]/trajectory/route.ts` | Server API facade yang membaca visit history, memetakan ke `VisitRecord[]`, menjalankan `analyzeTrajectory()`, lalu mengembalikan app-local trajectory payload | `APPROVED_CANDIDATE` | Medium: route ini sudah menjadi consumer boundary aktif, tetapi menyentuh DB read facade dan existing API contract | Future minimal wiring sebaiknya dimulai di file ini secara additive, bukan dengan rewrite |
| `apps/healthcare/intelligenceboard/src/hooks/useTrajectoryAnalysis.ts` | Client hook yang fetch route trajectory dan mengonsumsi payload app-local | `REJECTED` | Medium: wiring pertama di hook akan mendorong contract churn ke client/UI layer | Tetap jadikan downstream consumer saja, bukan origin wiring |
| `apps/healthcare/intelligenceboard/src/components/features/trajectory/TrajectoryIntelligencePanel.tsx` | Container UI yang mengonsumsi hook trajectory dan sudah punya seam `clinicalTrajectory?: ClinicalTrajectoryV1 \| null` | `NEEDS_FOLLOW_UP` | Medium: seam ini berguna untuk konsumsi CT v1, tetapi tetap UI-layer dan bukan boundary server utama | Boleh jadi consumer seam lanjutan hanya jika route wiring minimal sudah ada |
| `apps/healthcare/intelligenceboard/src/components/features/trajectory/ClinicalTrajectoryV1Panel.tsx` | Pure display panel untuk output `ClinicalTrajectoryV1` | `REJECTED` | Low: aman sebagai consumer, tetapi bukan tempat asal wiring | Jangan jadikan entrypoint wiring; pertahankan sebagai presentation boundary |
| `apps/healthcare/intelligenceboard/src/app/emr/TrajectoryPanel.tsx` | Client panel yang masih memanggil `analyzeTrajectory()` langsung di UI | `REJECTED` | High: mixed-authority UI surface, rawan mencampur reasoning lokal dan wiring baru di client | Jangan disentuh dalam minimal wiring mission |
| `apps/healthcare/intelligenceboard/src/lib/clinical/trajectory-analyzer.ts` | Local transitional trajectory reasoning engine | `REJECTED` | High: engine lokal bukan authority jangka panjang dan tidak boleh diubah scope-nya lewat wiring mission | Jangan jadikan wiring entrypoint; konsumsi output-nya saja bila perlu |
| `apps/healthcare/intelligenceboard/src/types/abyss/trajectory.ts` | App-local route/UI contract dan schema untuk payload trajectory yang sekarang | `REJECTED` | Medium: mengubah type layer di sini berisiko memperluas scope ke contract churn | Hindari perubahan kecuali mission masa depan benar-benar memerlukan adaptasi terpisah |

## 5. Recommended wiring boundary

Exact recommended file/path untuk future wiring:

- `apps/healthcare/intelligenceboard/src/app/api/patients/[id]/trajectory/route.ts`

Alasan boundary ini direkomendasikan:

- Sudah menjadi runtime server entrypoint yang sah untuk trajectory read path.
- Sudah memiliki dua input utama yang dibutuhkan adapter:
  - hasil local transitional engine `TrajectoryAnalysis`
  - `VisitRecord[]`
- Sudah berada di consumer/API facade boundary, bukan di shared package atau
  canonical reasoning package.
- Mengizinkan wiring additive tanpa harus langsung mengubah UI, hook, atau
  authority reasoning.

File tersebut pada future mission boleh mengimpor:

- `@/lib/clinical/ct-adapter`
- local types/functions yang sudah dipakai route sekarang untuk mendapatkan
  `VisitRecord[]` dan `TrajectoryAnalysis`
- `@the-abyss/shared-types` types jika dibutuhkan untuk response typing yang
  tetap consumer-safe

File tersebut pada future mission tidak boleh mengimpor:

- source authority baru dari luar boundary yang menggeser `@sentra/nada`
- route/page/component/hook lain sebagai tempat origin reasoning
- `packages/sentra/**` source internal secara ad hoc untuk menjadikan route ini
  authority reasoning baru
- external integration, OCR, RAG, diagnosis engine lain, atau database write
  layer baru

Data yang boleh mengalir masuk ke adapter:

- local transitional `TrajectoryAnalysis`
- `VisitRecord[]`
- `patientId`
- optional `TreatmentEvent[]`, `LabEvent[]`, atau adapter options hanya bila
  data tersebut sudah tersedia secara sah di route boundary dan tidak memperluas
  scope secara tersembunyi

Data yang boleh mengalir keluar dari adapter:

- CT v1 consumer-safe output
- optional CT v1 envelope bila future mission memilih surface yang membutuhkan
  linked reasoning metadata

Data yang tidak boleh mengalir keluar dari adapter sebagai wiring side effect:

- database write command
- external API payload
- new authority claim
- hidden local-only fields yang tidak termasuk shared CT v1 contract

## 6. Proposed data flow

```text
Local transitional CT analysis result
→ ct-adapter.ts
→ CT v1 consumer-safe output
→ UI/API consumer boundary
```

Minimal route-oriented interpretation:

```text
DB-backed visit history read
→ route-local VisitRecord mapping
→ local transitional analyzeTrajectory()
→ ct-adapter.ts
→ additive CT v1 field in route response
→ existing or future consumer seam
```

Guardrail penting:

- Existing app-local trajectory payload sebaiknya tetap dipertahankan secara
  additive pada wiring minimal pertama, agar future mission tidak sekaligus
  menjadi route contract rewrite.
- Consumer UI harus mengonsumsi output CT v1 sebagai derived boundary output,
  bukan sebagai alasan untuk menobatkan engine lokal menjadi authority.

## 7. Explicit non-goals

- no canonical CT authority change
- no database write
- no external integration
- no OCR/RAG/diagnosis mixing
- no route/UI rewrite
- no shared-types change unless future mission explicitly requires it
- no adapter implementation rewrite
- no local engine authority promotion

## 8. Future implementation mission scope

Future mission `ABYSS-CT-WIRING-011` sebaiknya dibatasi ketat pada:

- `apps/healthcare/intelligenceboard/src/app/api/patients/[id]/trajectory/route.ts`
  sebagai primary wiring entrypoint
- optional satu consumer seam downstream hanya jika benar-benar diperlukan untuk
  expose hasil CT v1 secara minimal dan tidak memicu rewrite UI

Future mission tidak boleh mengubah:

- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts`
- `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts`
- `apps/healthcare/intelligenceboard/src/lib/clinical/trajectory-analyzer.ts`
- route/page/component/hook yang tidak diperlukan langsung oleh minimal wiring
- `packages/sentra/**`
- `packages/shared/**`
- database schema, write path, external integration, dependency graph, atau
  build config

## 9. Future implementation acceptance criteria

Future wiring mission sebaiknya dinyatakan `PASS` hanya jika semua ini terpenuhi:

- wiring terjadi hanya pada approved route boundary atau consumer seam yang
  secara eksplisit disetujui
- adapter dipanggil dari `ct-adapter.ts` yang sudah tracked
- adapter menerima transitional local engine output tanpa mengubah authority
  ownership
- output CT v1 ditambahkan secara consumer-safe dan audit-friendly
- tidak ada database write, external integration, OCR/RAG, atau diagnosis engine
  mixing
- tidak ada route/UI rewrite luas
- tidak ada perubahan ke shared types kecuali mission terpisah secara eksplisit
  menyetujuinya
- `pnpm typecheck`, `pnpm lint`, `pnpm build`, dan `pnpm test` tetap `PASS`
- diff tetap kecil, reviewable, dan reversible

Future wiring mission sebaiknya dinyatakan `FAIL` jika salah satu kondisi ini
terjadi:

- wiring menjadikan Intelligenceboard local engine tampak sebagai canonical CT
  authority
- route contract diubah secara breaking tanpa approval terpisah
- UI/hook menjadi origin reasoning baru
- forbidden package/domain ikut tersentuh
- verification gagal karena perubahan wiring

## 10. Rollback strategy for future wiring

Jika future wiring minimal perlu di-revert:

1. Revert file wiring entrypoint terlebih dahulu, terutama
   `src/app/api/patients/[id]/trajectory/route.ts`.
2. Revert hanya consumer seam tambahan yang memang ikut berubah.
3. Jangan revert adapter tracked files kecuali future mission ternyata
   mengubahnya secara eksplisit.
4. Jalankan ulang verifikasi minimal:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm build`
   - `pnpm test`
5. Pastikan working tree kembali clean dan route response kembali ke baseline
   yang diketahui aman.

Prinsip rollback:

- rollback harus menghapus wiring, bukan menghapus tracked adapter boundary
- rollback harus mengembalikan behavior ke pre-wiring state yang terverifikasi
- rollback tidak boleh memperluas dampak ke shared package, DB layer, atau UI
  rewrite

## 11. Recommended next mission

`ABYSS-CT-WIRING-011 — Implement Minimal Intelligenceboard CT Adapter Runtime Wiring`
