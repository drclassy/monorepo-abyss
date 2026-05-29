---
name: abyss-verify
description:
  Run ABYSS verification before claiming work is done. Use when verifying,
  typechecking, linting, testing, or saying a task is complete.
---

# ABYSS Verify

Evidence before assertions. Do not claim done without fresh command output.

## Choose the smallest check

1. **Scoped change** — run the relevant package script:

```powershell
pnpm --filter <package-name> typecheck
pnpm --filter <package-name> lint
pnpm --filter <package-name> test
pnpm --filter <package-name> build
```

2. **Broad or repo-wide change** — run global verifier:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.codex\scripts\verify-local.ps1"
```

3. **Incomplete workspace** — safe fallback:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.codex\scripts\verify-local-safe.ps1"
```

4. **Documentation-only** — sufficient evidence:

```powershell
git diff --stat
git diff --name-status
```

## Report format

```text
Verification:
- Command: <exact command>
- Result: pass | fail
- Evidence: <one-line summary of output>
```

If a check fails, classify: code issue, environment issue, or pre-existing
blocker. Do not fabricate results.
