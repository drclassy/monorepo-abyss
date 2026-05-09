# Classy Handbook Launcher

Extension lokal untuk Cursor/VS Code:

- Menambah tombol status bar `Classy Docs`
- Menampilkan pilihan 4 dokumen handbook:
  - `docs/handbook/classy.html`
  - `docs/handbook/classy-commands.html`
  - `docs/handbook/classy-cursor.html`
  - `docs/handbook/classycline-2026.html`
- Membuka dokumen di editor panel menggunakan Simple Browser
- Membutuhkan workspace `abyss-monorepo` terbuka agar path handbook bisa
  di-resolve

## Build VSIX

```powershell
npx @vscode/vsce package
```
