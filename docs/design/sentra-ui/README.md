# Sentra UI — HTML Artefact

Design reference HTML untuk Sentra AI, menggunakan Geist font yang di-load secara lokal dari dalam Cursor IDE.

---

## Setup Font (Wajib)

### Opsi A — Variable Font (Recommended, 1 file saja)

1. Download dari: https://github.com/vercel/geist-font/releases/latest
2. Download file `Geist-variable.zip` dan `GeistMono-variable.zip`
3. Extract ke folder `./fonts/`:
   ```
   docs/design/sentra-ui/
   ├── index.html
   └── fonts/
       ├── GeistVF.woff2        ← Variable font semua weight (100-900)
       └── GeistMonoVF.woff2    ← Variable mono font
   ```

### Opsi B — Static Fonts (individual per weight)

Jika tidak ada variable font, extract file-file berikut ke `./fonts/`:
```
fonts/
├── Geist-Regular.woff2
├── Geist-Medium.woff2
├── Geist-SemiBold.woff2
├── Geist-Bold.woff2
└── GeistMono-Regular.woff2
```

---

## Membuka di Cursor

Buka file `index.html` langsung di browser, atau gunakan Live Server extension di Cursor:

```
Klik kanan index.html → Open with Live Server
```

Font Geist akan ter-load dari path relative `./fonts/` secara otomatis.
Jika font belum ter-install, browser akan fallback ke system sans-serif.

---

## Struktur File

```
sentra-ui/
├── index.html    ← Main HTML (self-contained, no external CSS/JS dependencies)
├── fonts/        ← Local Geist fonts (buat folder ini, download font)
└── README.md     ← File ini
```

---

## Design Tokens

Semua design tokens ada di CSS `:root` di dalam `<style>` tag di `index.html`:

- Base font size: **13px**
- Font family: **Geist** (sans) + **Geist Mono** (monospace)
- Color palette: dark clinical — `#000000` void, `#0a0a0a` surface, `#111111` elevated
- Accent: `#5b8dee` (clinical blue)
- Status colors: critical `#ff4444`, urgent `#ff8c00`, warning `#f5c542`, normal `#22c55e`

---

*Generated: 2026-04-18 · Sentra AI Design Reference*
