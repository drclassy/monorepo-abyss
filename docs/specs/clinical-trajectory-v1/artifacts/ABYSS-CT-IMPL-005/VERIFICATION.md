# Verification — ABYSS-CT-IMPL-005 Artifact Capture

## Commands

| Command | Result | Notes |
|---|---:|---|
| `git rev-parse --short HEAD` | PASS | `c7dcfc82` |
| `git status --short before capture` | PASS | `(empty)` |
| `git status --ignored target files` | PASS | `!! apps/healthcare/` |
| `git ls-files --stage target files` | PASS | `(empty)` |
| `git check-ignore target files` | PASS | `.gitignore:255:apps/* apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts` and `.gitignore:255:apps/* apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts` |
| `source file hash before capture` | PASS | `ct-adapter.ts = DA96976C29F767F76791F5187305B7C10DEDC18A68308FA553C3389DDA7DB372`; `ct-adapter.test.ts = E36014AF6EC650AE806059E60586395982322F72E6E3D059329D98F87324F3E6` |
| `snapshot file hash after capture` | PASS | `ct-adapter.ts.snapshot.txt = DA96976C29F767F76791F5187305B7C10DEDC18A68308FA553C3389DDA7DB372`; `ct-adapter.test.ts.snapshot.txt = E36014AF6EC650AE806059E60586395982322F72E6E3D059329D98F87324F3E6` |
| `source/snapshot hash match` | PASS | Both source/snapshot pairs match exactly |
| `pnpm typecheck` | PASS | Completed successfully from repo root |
| `pnpm lint` | PASS | Completed successfully; non-failing `baseline-browser-mapping` warning present |
| `pnpm build` | PASS | Completed successfully; non-failing Vite chunk-size and Turbopack/NFT warnings present |
| `pnpm test` | PASS | Completed successfully; expected stdout/stderr from failure-path tests present, overall exit code `0` |
| `git status --short after capture` | PASS | `?? docs/specs/clinical-trajectory-v1/artifacts/` |
| `git diff --stat artifact path` | PASS | `(empty)` because artifact files are currently untracked |

## Final verification statement

Artifact capture is valid only if:

- Source and snapshot hashes match.
- App implementation files are unchanged.
- Only artifact files appear in root Git status.
- Typecheck/lint/build/test pass.
