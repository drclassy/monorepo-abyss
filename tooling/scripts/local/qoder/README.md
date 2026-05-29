# Local Qoder Diagnostics

This folder holds workstation-local Qoder inspection helpers for ABYSS. It is a
tool-specific subfolder under [`tooling/scripts/local`](../README.md).

- Files here are manual diagnostics, not part of repo runtime, build, test, or
  `pnpm` workflows.
- Runnable helpers here stay gitignored by the parent local-tooling surface.
- Prefer naming that describes the inspected surface instead of leaving scratch
  scripts at repo root.
- If a helper becomes shared tooling, move it out of `tooling/scripts/local/`
  first.

## Current script

- `query-rules-db.js`
  - Reads `%APPDATA%\\Qoder\\User\\globalStorage\\state.vscdb`
  - Tries `better-sqlite3` first, then falls back to raw string inspection
  - Helps inspect rule-related and Qoder-related entries manually

## Manual usage

```powershell
node tooling/scripts/local/qoder/query-rules-db.js
```
