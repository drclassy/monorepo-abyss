# Local Tooling Surface

`tooling/scripts/local/` is the ABYSS workspace surface for workstation-local
helpers.

## Rules

- Put manual diagnostics, scratch inspectors, and machine-specific helper
  scripts here.
- Runnable files in this subtree are gitignored by default.
- Keep a `README.md` at the surface root and in any named subfolder that needs
  human explanation.
- If a helper becomes shared team tooling, move it out of
  `tooling/scripts/local/` before treating it as supported runtime, build, test,
  or `pnpm` infrastructure.

## Current subfolders

- [`qoder`](./qoder/README.md) - local Qoder inspection helpers
