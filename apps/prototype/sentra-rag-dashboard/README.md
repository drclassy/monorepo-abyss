# Sentra RAG Dashboard Prototype

Standalone prototype scaffold for the Sentra RAG dashboard under `apps/prototype/sentra-rag-dashboard/`.

## Scope

This folder currently implements Task 1 only:

- verify target folder state
- create baseline standalone files
- copy official Sentra brand assets into local `assets/`
- provide a small mock RAG state for local smoke checks
- document the scaffold and intended boundaries

Task 2 and beyond are intentionally not implemented in this scaffold.

## Structure

```text
apps/prototype/sentra-rag-dashboard/
├── assets/
│   ├── app.js
│   ├── mock-rag-state.json
│   ├── sentra-favicon.svg
│   ├── sentra-logo-horizontal-light.svg
│   └── styles.css
├── index.html
└── README.md
```

## Files

- `index.html` contains the standalone HTML shell for the prototype.
- `assets/styles.css` provides the baseline visual system for the scaffold.
- `assets/app.js` loads and renders the mock RAG state.
- `assets/mock-rag-state.json` stores the local scaffold state used for smoke checks.
- `assets/sentra-logo-horizontal-light.svg` and `assets/sentra-favicon.svg` are copied from the approved Sentra brand asset source.

## Local Use

Open the prototype from a static server so the JSON mock can load normally.

Example with Python:

```powershell
cd D:\Devops\abyss-monorepo\apps\prototype\sentra-rag-dashboard
python -m http.server 4173
```

Then visit `http://localhost:4173`.

If the page is opened directly as `file://`, `app.js` falls back to an inline mock state so the scaffold still renders.

## Notes

- This scaffold is intentionally static and dependency-free.
- No build config, package manifest, or additional tooling is introduced in Task 1.
- README content is derived from the approved Task 1 requirements available in the current workspace context.
