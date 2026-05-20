# Abyss-Core Tooling/Docs Bucket Audit — 2026-04-23

## Scope

Audit ini memisahkan bucket non-runtime yang berisi rebrand/tooling/docs dari
bucket RAG dan file global mixed lain di `abyss-core`.

## Ready To Separate Now

Subset berikut dinilai cukup murni sebagai bucket tooling/docs dan siap
dipisahkan dengan explicit file list:

- `.clinerules`
- `.cursor/`
- `.cursorignore`
- `.cursorindexingignore`
- `ONBOARDING.md`
- `docs/cursor/`
- `docs/handbook/`
- `docs/research/`
- `docs/guides/implementation-plans/001-2026-04-20-clear-cursor-history.md`
- `docs/guides/implementation-plans/002-2026-04-20-cursor-cleanup.md`
- `docs/guides/implementation-plans/003-2026-04-20-god-mode-optimization.md`
- `docs/specs/aadi-v2/001-2026-04-19-classy-rebranding-design.md`
- `docs/specs/aadi-v2/002-2026-04-20-cursor-cleanup-design.md`
- `mcp.json.example`
- `tooling/governance/`
- `tooling/scripts/run-autoskills.ps1`

## Held Back As Mixed / Not Ready

Path berikut sengaja ditahan di luar bucket ini karena masih bercampur dengan
renames/deletes lama atau punya implikasi repo-level yang lebih luas:

- `AGENTS.md`
- `.github/workflows/reusable-ai-agent.yml`
- `infrastructure/terraform/modules/security/main.tf`
- `ORCHESTRATOR.md`
- `conductor/ORCHESTRATOR.md`
- `packages/notebooklm/`
- `docs/cursor-qrh/`
- `docs/design/sentra-ui/`
- `repository/`

## Notes

- Bucket ini mayoritas additive/untracked, sehingga cocok untuk commit isolasi
  tanpa membawa delete/rename lama yang belum diputuskan.
- Fokus bucket ini adalah governance, onboarding, Cursor workspace, handbook,
  dan tooling docs — bukan runtime package atau infra execution.
- File global mixed seperti `pnpm-lock.yaml`, `pnpm-workspace.yaml`,
  `.env.example`, dan `.agent/*` tetap ditangani di pass terpisah.
