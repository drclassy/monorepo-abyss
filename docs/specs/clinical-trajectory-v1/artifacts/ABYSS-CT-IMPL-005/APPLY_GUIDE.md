# Apply Guide — ABYSS-CT-IMPL-005 Ignored Adapter Mapping

## Purpose

This guide explains how to apply the captured adapter mapping snapshot after owner chooses the correct Git boundary.

## Do not apply until

- Owner approves target Git boundary.
- Owner confirms whether app files should live in:
  - root repo with force-add,
  - nested app repo,
  - private app repo,
  - or another controlled boundary.

## Source snapshots

| Snapshot | Intended destination |
|---|---|
| `ct-adapter.ts.snapshot.txt` | `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts` |
| `ct-adapter.test.ts.snapshot.txt` | `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts` |

## Manual apply method

Only after owner approval:

```powershell
Copy-Item docs/specs/clinical-trajectory-v1/artifacts/ABYSS-CT-IMPL-005/ct-adapter.ts.snapshot.txt apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts
Copy-Item docs/specs/clinical-trajectory-v1/artifacts/ABYSS-CT-IMPL-005/ct-adapter.test.ts.snapshot.txt apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts
```

## Required verification after apply

```powershell
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

## Runtime wiring remains blocked

This artifact does not approve route, hook, UI, or runtime migration.
