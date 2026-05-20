# Sentra Prompt

VS Code extension mandiri untuk mengubah teks bebas menjadi prompt misi
implementasi yang rapi, generik, dan siap dipakai tanpa asumsi struktur repo
tertentu.

## Prasyarat lokal

- VS Code `1.90.0` atau lebih baru
- Node.js `20+`
- `pnpm` `9.15.0`

## Build dan packaging lokal

1. Buka terminal di folder `tooling/prompt-engine`
2. Jalankan `pnpm install`
3. Jalankan `pnpm typecheck`
4. Jalankan `pnpm compile`
5. Jalankan `pnpm package`
6. Buka VS Code → Extensions (`Ctrl+Shift+X`)
7. Klik menu `···` → **Install from VSIX...**
8. Pilih file `dist/sentra-prompt.vsix`
9. Reload VS Code jika diminta

Semua artefak build package ini ditulis ke folder `dist/`.

## Aktivasi

- Setelah VSIX terpasang dan VS Code di-reload, extension aktif otomatis.
- Tombol `$(sparkle) Sentra Prompt` akan muncul di status bar bawah.
- Command `Sentra Prompt: Generate Mission Prompt` juga tersedia di Command
  Palette.

## Penggunaan

1. Pastikan extension sudah terpasang dan aktif
2. Klik tombol `$(sparkle) Sentra Prompt` di status bar bawah
3. Masukkan teks bebas Anda
4. Tekan `Enter`
5. Hasil prompt akan otomatis disalin ke clipboard
6. Paste hasilnya ke Codex atau agent coding lain yang menerima prompt misi

## Command Palette

Alternatif selain tombol status bar:

- Buka Command Palette (`Ctrl+Shift+P`)
- Jalankan `Sentra Prompt: Generate Mission Prompt`

## Output

Extension menghasilkan template misi implementasi generik yang memuat bagian:

- `MISSION_ID`
- `MISSION_TITLE`
- `REQUEST`
- `DELIVERABLE`
- `SCOPE_HINTS`
- `CONSTRAINTS`
- `VERIFICATION`
- `OUTPUT_FORMAT`

## Verification gate scoped package

Verification minimum untuk package ini dijalankan dari folder
`tooling/prompt-engine` saja:

- `pnpm typecheck`
- `pnpm compile`
- `pnpm package`

Target verifikasi hanya folder `tooling/prompt-engine`, bukan build atau test
monorepo penuh.
