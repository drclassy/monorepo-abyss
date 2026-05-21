# Design Doc: Global Rebranding to Classy

## Status
- **Date**: 2026-04-19
- **Topic**: Codebase-wide removal of "Classy" and "Classy"
- **Status**: Draft

## Context
The project is undergoing a total rebranding. All references to the old names "Classy" and "Classy" must be replaced with "Classy".

## Requirements
- Replace all occurrences of:
  - `Classy` -> `Classy`
  - `classy` -> `classy`
  - `Classy` -> `Classy`
  - `Classy` -> `Classy`
  - `classy` -> `classy`
- Update `pnpm-lock.yaml` paths if they point to old folder names.
- Ensure `pyproject.toml` and other package manifests are consistent.
- Update Medium links in `News.tsx`.
- Update GitHub links in `README.md` files.

## Approach
I will use a hybrid approach:
1. **Automated Replacement**: For most text files, I will use a search-and-replace strategy.
2. **Surgical Replacement**: For sensitive files like `pnpm-lock.yaml`, `package.json`, and `pyproject.toml`, I will carefully verify the changes.
3. **Directory Renaming**: I will rename `Classy_memory` to `classy_memory` in `apps/community/classy-memory/`.

## Affected Files (Priority)
- `apps/community/classy-memory/package.json`
- `apps/community/classy-memory/pyproject.toml`
- `apps/community/classy-memory/README.md`
- `apps/community/classy-transformer/package.json`
- `apps/community/classy-transformer/website/package.json`
- `pnpm-lock.yaml`
- `infrastructure/terraform/modules/security/main.tf`
- `apps/healthcare/sentra-main/components/News.tsx`
- `apps/healthcare/primary-healthcare/website/README.md`
- And many others found via grep.

## Verification Plan
1. Run `grep_search` again to confirm all occurrences are gone.
2. Run `pnpm install` (if possible) or at least check if `pnpm` is happy.
3. Verify that the renamed directory `classy_memory` is correctly referenced.
