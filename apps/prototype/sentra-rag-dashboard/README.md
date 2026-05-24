# Sentra RAG Dashboard Prototype

Standalone prototype dashboard for the Sentra medical library RAG flow.

## Purpose
- show `library/medical` readiness in simple operator language
- validate dashboard UX before building a real app

## Brand Source
- token source: `<brand-assets-root>/sentra-brand-tokens.json`
- tailwind mapping: `<brand-assets-root>/sentra-tailwind-theme.ts`
- logo assets: `<brand-assets-root>/sentra-logo-horizontal-light.svg` and `assets/sentra-favicon.svg`

## Preview
Open `index.html` directly in a browser. Prototype ini punya fallback data inline, jadi tetap bisa dibuka tanpa local server.

Kalau Chief ingin preview via HTTP server, bisa juga jalankan:

```powershell
cd apps/prototype/sentra-rag-dashboard
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## What to validate

- dashboard reads as an operator control room, not a dev console
- source of truth is clearly `library/medical`
- the four top metrics are readable on desktop and mobile
- queue tabs switch between `Baru`, `Siap`, and `Perlu Perhatian`
- ask preview looks like a product capability, not a raw log
