# Lighthouse / Core Web Vitals — baseline kerja

Environment CI/agent ini tidak memiliki instalasi Chrome untuk `lighthouse` CLI, jadi baseline otomatis tidak dihasilkan sebagai JSON.

## Yang sudah tercatat (build production lokal, Next.js 15.5.15)

Tanggal: 2026-05-14. Perintah: `pnpm build` di `apps/corporate/ferdiiskandar`.

| Route                | First Load JS (bundler report) |
| -------------------- | ------------------------------ |
| `/`                  | ~176 kB                        |
| Shared First Load JS | ~101 kB                        |

Gunakan angka ini sebagai **perbandingan sebelum/sesudah** optimasi bundle/CSS; ini **bukan** pengganti Lighthouse (LCP, CLS, TBT).

## Langkah untuk Chief (staging atau production)

1. Buka situs di Google Chrome.
2. `F12` → tab **Lighthouse**.
3. Mode **Navigation**, device **Mobile** dan ulangi untuk **Desktop**.
4. Centang kategori **Performance** (tambah Accessibility/Best practices jika perlu).
5. **Analyze page load**.
6. Export HTML atau PDF report; simpan ke folder ini sebagai misalnya `lighthouse-staging-mobile.html`.

## Opsional — CLI (mesin dengan Chrome terpasang)

```powershell
cd apps/corporate/ferdiiskandar
pnpm build
pnpm exec next start -p 3999
# terminal lain:
npx lighthouse http://127.0.0.1:3999/ --preset=desktop --output=json --output-path=docs/reports/lighthouse-baseline-local.json
```
