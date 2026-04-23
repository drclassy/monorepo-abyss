# Design Doc: Global Rebranding to Avvcenna

## Status
- **Date**: 2026-04-19
- **Topic**: Codebase-wide removal of "Avvcenna" and "Avvcenna"
- **Status**: Draft

## Context
The project is undergoing a total rebranding. All references to the old names "Avvcenna" and "Avvcenna" must be replaced with "Avvcenna".

## Requirements
- Replace all occurrences of:
  - `Avvcenna` -> `Avvcenna`
  - `avvcenna` -> `avvcenna`
  - `Avvcenna` -> `Avvcenna`
  - `Avvcenna` -> `Avvcenna`
  - `avvcenna` -> `avvcenna`
- Update `pnpm-lock.yaml` paths if they point to old folder names.
- Ensure `pyproject.toml` and other package manifests are consistent.
- Update Medium links in `News.tsx`.
- Update GitHub links in `README.md` files.

## Approach
I will use a hybrid approach:
1. **Automated Replacement**: For most text files, I will use a search-and-replace strategy.
2. **Surgical Replacement**: For sensitive files like `pnpm-lock.yaml`, `package.json`, and `pyproject.toml`, I will carefully verify the changes.
3. **Directory Renaming**: I will rename `Avvcenna+_memory` to `avvcenna_memory` in `apps/community/avvcenna-memory/`.

## Affected Files (Priority)
- `apps/community/avvcenna-memory/package.json`
- `apps/community/avvcenna-memory/pyproject.toml`
- `apps/community/avvcenna-memory/README.md`
- `apps/community/avvcenna-transformer/package.json`
- `apps/community/avvcenna-transformer/website/package.json`
- `pnpm-lock.yaml`
- `infrastructure/terraform/modules/security/main.tf`
- `apps/healthcare/sentra-main/components/News.tsx`
- `apps/healthcare/primary-healthcare/website/README.md`
- And many others found via grep.

## Verification Plan
1. Run `grep_search` again to confirm all occurrences are gone.
2. Run `pnpm install` (if possible) or at least check if `pnpm` is happy.
3. Verify that the renamed directory `avvcenna_memory` is correctly referenced.
