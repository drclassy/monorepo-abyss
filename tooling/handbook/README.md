# Classy Handbook Launcher

VS Code extension untuk membuka handbook Classy langsung dari command palette
atau status bar.

## Fitur

- **Status bar button** `$(book) Classy Docs` — selalu terlihat di bawah VS Code
- **Command palette** → `Classy Handbook: Open Palette` — QuickPick dengan semua
  dokumen
- **Dynamic discovery** — otomatis menemukan semua `.html` di `docs/handbook/`
- **Simple Browser** — dokumen terbuka di panel VS Code, tidak di browser
  eksternal

## Instalasi

1. Build VSIX (lihat bagian Build di bawah)
2. Buka VS Code → Extensions (`Ctrl+Shift+X`)
3. Klik ikon `···` → **Install from VSIX...**
4. Pilih `classy-handbook-launcher-0.2.0.vsix`
5. Buka workspace `abyss-monorepo`

## Build

```powershell
cd tooling/handbook
pnpm install
pnpm package
```

Menghasilkan `classy-handbook-launcher-0.2.0.vsix`.

## Penggunaan

- Klik tombol **$(book) Classy Docs** di status bar, atau
- Buka command palette (`Ctrl+Shift+P`) → ketik `Classy Handbook`

## Requirement

- VS Code ^1.90.0
- Workspace `abyss-monorepo` harus terbuka (extension membaca dari
  `docs/handbook/`)
