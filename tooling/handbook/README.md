# Classy Handbook Launcher

Extension lokal untuk Cursor/VS Code:

- Menambah tombol status bar `Classy Docs` dengan ikon buku `(book)`
- Menampilkan **QuickPick palette** yang **otomatis mendeteksi semua file
  `.html` di `docs/handbook/`**
- Tidak ada daftar hardcoded — file baru otomatis muncul di palette
- Membuka dokumen di editor panel menggunakan Simple Browser
- Membutuhkan workspace `abyss-monorepo` terbuka agar path handbook bisa
  di-resolve

## Command Baru

| Command                        | Fungsi                                          |
| ------------------------------ | ----------------------------------------------- |
| `classyHandbook.openPalette`   | Buka QuickPick semua dokumen handbook (default) |
| `classyHandbook.openClassy`    | Buka `classy.html` langsung                     |
| `classyHandbook.openCommands`  | Buka `classy-commands.html` langsung            |
| `classyHandbook.openCursor`    | Buka `classy-cursor.html` langsung              |
| `classyHandbook.openCline2026` | Buka `classycline-2026.html` langsung           |

## Installasi

1. Buka Extensions panel di VS Code / Cursor
2. Klik `...` → **Install from VSIX...**
3. Pilih file `classy-handbook-launcher-0.1.0.vsix`
4. Reload window

## Build VSIX

```powershell
cd tooling\handbook
node build_vsix.js
```

Hasil: `classy-handbook-launcher-0.1.0.vsix`
