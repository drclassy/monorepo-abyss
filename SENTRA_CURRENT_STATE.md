# SENTRA Current State

Last updated: 2026-05-20  
Source baseline: `ABYSS_CURRENT_STATUS_REPORT.md`

## Executive snapshot

ABYSS saat ini masih berfungsi sebagai monorepo aktif di level build tooling,
tetapi belum sepenuhnya sinkron di level workspace policy, dokumentasi, dan
boundary arsitektur.

Baseline terverifikasi pada checkout audit ini:

- Root `pnpm typecheck -- --pretty false`: `PASS`
- Root `pnpm build`: `PASS`
- Root `pnpm test`: `FAIL`
  - blocker saat ini: `@the-abyss/unicom` gagal startup test dengan
    `getaddrinfo ENOENT localhost`

Kesimpulan singkat:

- Repo masih buildable dan typecheckable dari root.
- Repo belum berada pada baseline hijau penuh karena root test belum lolos.
- Truth model repo aktif masih terpecah antara build tooling, ignore policy, dan
  docs.

## Current state

Pada audit ini, `pnpm build` melihat 37 package aktif lintas aplikasi, platform
runtimes, package internal Sentra, shared packages, dan tooling internal. Ini
menunjukkan repo masih dipakai sebagai monorepo kerja, bukan sekadar arsip
transisi.

Hal yang sudah terverifikasi:

- Root workspace masih bisa build dan typecheck dari level monorepo.
- Taxonomy utama `packages/sentra`, `packages/platform`, `packages/clinical`,
  `packages/shared`, dan `packages/tooling` ada secara fisik.
- Tidak ditemukan circular dependency internal yang terdeklarasi dari manifest
  package yang diaudit.
- `.agent/` aktif dan berfungsi sebagai SSOT operasional continuity repo.

## Active risks

### 1. Workspace truth belum tunggal

- `.gitignore` masih membawa model polyrepo split untuk mayoritas `apps/`
- `pnpm build` masih membangun banyak package di bawah `apps/`
- `README.md` dan sebagian docs index masih butuh penyelarasan lanjutan

### 2. Integration package sedang drift

- path lama tracked: `packages/integration-bridge/**`
- path baru fisik: `packages/integration/**`
- `pnpm-workspace.yaml` masih menunjuk `packages/integration-bridge`

### 3. Boundary violation potensial

ADR taxonomy aktif menyatakan `packages/platform/*` tidak boleh bergantung ke
`packages/sentra/*`, tetapi `@the-abyss/orchestrator` saat ini bergantung pada
`@sentra/nada`.

### 4. Verification belum full green

Build dan typecheck sudah lulus, tetapi root test masih gagal di
`@the-abyss/unicom`.

## Human confirmations needed

- Apakah repo ini memang harus tetap monorepo aktif, atau sebagian besar `apps/`
  memang mau tetap dianggap hasil polyrepo split?
- Apakah `packages/integration` adalah lokasi final yang disetujui untuk
  `@the-abyss/integration-bridge`?
- Apakah `@the-abyss/orchestrator -> @sentra/nada` adalah pengecualian
  arsitektur yang disetujui?
- Apakah `@the-abyss/puskesmas-website` harus masuk active workspace atau memang
  sengaja dibiarkan di luar?
- Apakah referensi app yang hilang di `README.md` memang stale, atau ada
  relokasi yang belum terdokumentasi?

## Practical summary

Kalau dokumen ini dipakai sebagai baseline engineering hari ini, pernyataan yang
paling aman adalah:

> SENTRA / ABYSS saat ini berada pada fase stabilisasi pasca-blocker. Root build
> dan root typecheck sudah lulus, tetapi root test belum hijau karena blocker di
> `@the-abyss/unicom`. Repo masih aktif dipakai sebagai monorepo kerja, tetapi
> truth model workspace, drift `packages/integration`, dan boundary
> `orchestrator -> sentra` masih perlu keputusan dan penyelarasan eksplisit.
