# Sentra Prompt Manual Test Checklist

Checklist ini dipakai untuk membuktikan package resmi bekerja end-to-end di
monorepo.

## Preconditions

- Working directory: `D:\Devops\abyss-monorepo\tooling\prompt-engine`
- `pnpm typecheck` lulus
- `pnpm test` lulus
- Cursor atau VS Code tersedia untuk install VSIX

## Test 1: Package Verification

1. Jalankan `pnpm typecheck`
2. Jalankan `pnpm test`
3. Expected:
   - semua command exit `0`
   - audit engine test `3/3` pass

Pass criteria:

- contract package resmi stabil

## Test 2: VSIX Packaging

1. Jalankan `pnpm package`
2. Expected:
   - file `dist/sentra-prompt.vsix` terbentuk
   - packaging selesai tanpa error

Pass criteria:

- package siap di-install manual

## Test 3: Install in Cursor or VS Code

1. Buka Cursor atau VS Code
2. Jalankan `Extensions: Install from VSIX...`
3. Pilih `dist/sentra-prompt.vsix`
4. Expected:
   - extension terpasang
   - command `Sentra Prompt: Audit Codex Prompt` muncul

Pass criteria:

- extension aktif dan command utama ditemukan

## Test 4: Ready Prompt

1. Paste `Sample A` dari `PROMPT_SAMPLES.md` ke file teks
2. Select seluruh prompt
3. Jalankan `Sentra Prompt: Audit Codex Prompt`
4. Expected:
   - decision `Ready`
   - tidak ada rewrite besar
   - score tinggi

Pass criteria:

- prompt yang sudah baik tidak dipaksa menjadi template baru

## Test 5: Needs Work Prompt

1. Gunakan `Sample B`
2. Jalankan audit
3. Expected:
   - decision `Needs Work`
   - finding forced chain-of-thought muncul
   - finding missing verification muncul
   - suggested rewrite tersedia

Pass criteria:

- prompt lemah diberi temuan spesifik dan rewrite yang bisa dipakai

## Test 6: Unsafe Prompt

1. Gunakan `Sample C`
2. Jalankan audit
3. Expected:
   - decision `Unsafe`
   - finding severity tinggi muncul
   - untrusted input atau unsafe tool usage ditandai

Pass criteria:

- prompt berisiko diblokir dengan jelas

## Test 7: Apply Suggested Rewrite

1. Audit `Sample B`
2. Klik `Apply Suggested Rewrite`
3. Expected:
   - selection terganti dengan rewrite
   - tidak ada crash

Pass criteria:

- rewrite hanya diterapkan saat memang tersedia

## Test 8: Official Sentra Trial

1. Audit minimal 2 prompt resmi Sentra nyata
2. Catat:
   - decision
   - 3 finding utama
   - apakah rewrite membantu atau terlalu generik
3. Expected:
   - hasil audit terasa relevan
   - minimal satu prompt bisa mencapai `Ready` setelah revisi ringan

Pass criteria:

- package berguna pada prompt nyata, bukan hanya fixture sintetis
