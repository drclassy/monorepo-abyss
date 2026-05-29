# ABYSS-CT-IMPL-005 Ignored Adapter Mapping Artifact

## Status

Captured for owner review.

## Source mission

- Mission: ABYSS-CT-IMPL-005
- Purpose: Add missing CT adapter field mapping
- Implementation status: Behavior verified, Git tracking incomplete
- Tracking audit: ABYSS-CT-AUDIT-006A
- Tracking audit decision: PATCH_CAPTURE_REQUIRED

## Root baseline

| Item | Value |
|---|---|
| Root HEAD | `c7dcfc82` |
| Root status before capture | `(empty)` |
| Target root tracking | `ROOT_UNTRACKED_IGNORED` |
| Ignore rule | `.gitignore:255 apps/*` |
| Nested app repo | `NOT FOUND` |

## Captured source files

| Source file | Snapshot file | Source hash | Snapshot hash | Match |
|---|---|---|---|---|
| `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.ts` | `ct-adapter.ts.snapshot.txt` | `5B0852EEB55067ED11F666A58135B820FC85B11BF0812067280254ACEAACCE18` | `5B0852EEB55067ED11F666A58135B820FC85B11BF0812067280254ACEAACCE18` | YES |
| `apps/healthcare/intelligenceboard/src/lib/clinical/ct-adapter.test.ts` | `ct-adapter.test.ts.snapshot.txt` | `FB8B0F1864F86D16C02B15D0783DE78E876A397F4307E917E638856415B52B97` | `FB8B0F1864F86D16C02B15D0783DE78E876A397F4307E917E638856415B52B97` | YES |

## Implementation features captured

| Feature | Status |
|---|---:|
| `VisitRecord[].keluhan_utama -> symptomsTimeline[]` | CAPTURED |
| `TrajectoryAnalysis.recommendations[] -> next-best response fields` | CAPTURED |
| `TrajectoryAnalysis.visitCount -> quality context` | CAPTURED |
| `confirmed_chronic_diagnoses[] -> baseline.chronicDiseases[] ICD minimum` | CAPTURED |
| blocked local-only fields remain unmapped | CAPTURED |

## Important limitation

This artifact is a snapshot capture, not a true Git diff.

Reason:

- Root Git does not track the target files.
- Root Git ignores `apps/*`.
- No nested app Git repo exists in this workspace.
- Therefore there is no tracked baseline available for `git diff`.

## Governance decision required

Before implementation can be committed or promoted, owner must choose one:

1. Apply this snapshot in the correct private app repo.
2. Create/restore proper nested repo boundary for `apps/healthcare/intelligenceboard`.
3. Force-add selected app files into root repo after explicit approval.
4. Roll back ignored filesystem implementation manually.
5. Keep artifact only and defer implementation.

## Explicitly not approved

- Runtime wiring is not approved.
- Route changes are not approved.
- Hook changes are not approved.
- UI changes are not approved.
- Shared CT v1 contract changes are not approved.
- `packages/sentra/**` changes are not approved.
