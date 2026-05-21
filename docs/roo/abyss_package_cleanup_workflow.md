# ABYSS Package Cleanup Workflow

## Phase 1 — Search

Mode: `Sentra Search`

Task:
```text
Analyze package cleanup readiness for one package only. Do not edit. Find imports, workspace references, package.json identity, README/docs references, tests, build scripts, and risk.
```

Output:
- package identity
- consumers
- config references
- docs references
- risk classification
- safe next step

## Phase 2 — Smart Plan

Mode: `Sentra Smart`

Task:
```text
Convert the search result into a bounded cleanup plan. Include scope, non-scope, file targets, acceptance criteria, and verification commands.
```

## Phase 3 — Deep Implementation

Mode: `Sentra Deep`

Task:
```text
Implement only the approved cleanup plan. Do not touch crown-jewel packages, clinical logic, env files, or lockfiles unless explicitly approved.
```

## Phase 4 — Review

Mode: `Sentra Review`

Task:
```text
Audit the diff. Check scope drift, crown-jewel paths, lockfile drift, secrets/PHI risk, package boundaries, and verification result. Return PASS/FAIL.
```

## Phase 5 — Librarian

Mode: `Sentra Librarian`

Task:
```text
Update only necessary docs to reflect the approved package cleanup. Keep it short and factual.
```
