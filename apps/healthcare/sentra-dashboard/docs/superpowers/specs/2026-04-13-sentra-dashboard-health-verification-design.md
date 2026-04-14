# Design: Sentra Dashboard — Full Health Verification After Backup Restoration

**Date:** 2026-04-13 **Author:** Claude (Brainstorming Session) **Status:**
Approved for Implementation

---

## Context

After a repository corruption incident, the `apps/healthcare/sentra-dashboard`
directory was restored via copy-paste from a backup. The backup is 100%
identical to the last pushed state. Key findings from initial exploration:

- **Git state:** Entire `sentra-dashboard/` folder shows as `??` (untracked) in
  the monorepo git — needs to be tracked and committed.
- **Environment:** `.env.local` does not exist — must be created before any
  runtime features can be tested.
- **Database:** Reset and restored; the user's account (Chief) is intact and
  accessible.
- **Code state:** From prior `.agent/HANDOFF.md`, tsc was clean (EXIT=0) before
  backup. One pre-existing bug (`artifactPathUnder`) and one dead code file
  (`scripts/reset-crew-password.mjs`) are pending cleanup.
- **~187 files** from previous `/simplify` session are part of the backup —
  these need to be committed as part of the restoration commit.

## Goal

Restore full operational confidence in the sentra-dashboard after backup
restoration by:

1. Setting up the environment
2. Verifying static correctness (types, lint, build)
3. Verifying the test suite passes
4. Verifying all major runtime features work end-to-end
5. Cleaning up known pending issues
6. Committing everything to the monorepo git with a proper audit trail

## Approach: Sequential Layer-by-Layer Verification

Work from the bottom up — each layer must be clean before moving to the next.
Fix issues at the layer where they're found.

---

## Phase 1 — Environment & Git Setup

**Goal:** App can start and connect to all required services.

**Actions:**

1. Generate `.env.local` from `.env.example` — Boss fills in all values.
2. Verify required env groups are all set:
   - `DATABASE_URL` (Neon PostgreSQL)
   - `CREW_ACCESS_*` (auth secret, session TTL)
   - `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`
   - `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini)
   - `DEEPSEEK_API_KEY`
   - `EMR_USERNAME`, `EMR_PASSWORD`, `EMR_BASE_URL`
   - `LB1_*` pipeline vars
   - `MONAI_*` vision service
   - `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
   - `RESEND_API_KEY`
   - `WHATSAPP_*` Cloud API
3. Run `pnpm install` if node_modules are stale.

**Success criteria:** `.env.local` exists and all critical vars are non-empty.

---

## Phase 2 — Static Verification (TypeScript + Lint)

**Goal:** Zero type errors, zero lint violations.

**Commands:**

```bash
pnpm --filter @the-abyss/sentra-dashboard exec tsc --noEmit
pnpm --filter @the-abyss/sentra-dashboard lint
```

**Pending fix:** `artifactPathUnder` bug (pre-existing, noted in HANDOFF.md) —
locate and fix during this phase.

**Fix strategy:** Error-by-error. Re-run after each fix. Target: EXIT=0 for both
commands.

**Success criteria:** `tsc --noEmit` exits 0, `next lint` reports no errors.

---

## Phase 3 — Production Build Verification

**Goal:** `next build` completes without error.

**Command:**

```bash
pnpm --filter @the-abyss/sentra-dashboard build
```

Validates: server components, static page generation, API route compilation,
bundle chunks.

**Fix strategy:** Address any build errors before proceeding. Common issues:
missing env vars treated as required by static analysis, dynamic import
failures, missing exports.

**Success criteria:** Build completes, outputs `dist/` or `.next/` without
error.

---

## Phase 4 — Test Suite

**Goal:** All tests pass.

**Commands:**

```bash
pnpm --filter @the-abyss/sentra-dashboard test
# Individual suites if needed:
pnpm --filter @the-abyss/sentra-dashboard run test:cdss
pnpm --filter @the-abyss/sentra-dashboard run test:auth-hardening
pnpm --filter @the-abyss/sentra-dashboard run test:news2-early-warning
pnpm --filter @the-abyss/sentra-dashboard run test:screening-audit
```

**Test coverage includes:**

- CDSS engine (diagnosis + symptom autocomplete)
- NEWS2 early warning scoring
- Auth hardening (scrypt hashing, rate limiting, session validation)
- Screening audit trail
- Trajectory analysis (`useTrajectoryAnalysis`)
- Momentum engine
- API route handlers

**Cleanup:** Delete `scripts/reset-crew-password.mjs` (dead code from prior
session, noted in HANDOFF.md).

**Fix strategy:** Per-failing-test diagnosis. Do not mark passing if any test
fails.

**Success criteria:** All 30+ test files pass with 0 failures.

---

## Phase 5 — Runtime Feature Verification

**Goal:** Every major user-facing feature works end-to-end.

**Setup:**

```bash
pnpm --filter @the-abyss/sentra-dashboard dev
# Server starts on localhost:7000
```

### Feature Checklist

| Feature                           | Path / Endpoint                     | Verification                                              |
| --------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| **Login / Session**               | `POST /api/auth/login`              | Returns session cookie, subsequent requests authenticated |
| **Dashboard Home**                | `/dashboard/intelligence`           | Page renders, no console errors                           |
| **Profile**                       | `GET /api/auth/profile`             | Returns correct user data                                 |
| **EMR Page**                      | `/emr`                              | Page renders with patient list                            |
| **EMR Bridge**                    | `POST /api/emr/bridge`              | Playwright automation triggers correctly                  |
| **CDSS Diagnose**                 | `POST /api/cdss/diagnose`           | Returns differential diagnosis                            |
| **CDSS Autocomplete**             | `GET /api/cdss/symptoms`            | Returns symptom suggestions                               |
| **Intelligence Dashboard Socket** | `/intelligence` namespace           | Socket connects, receives real-time events                |
| **Telemedicine Doctor Status**    | `GET /api/telemedicine/doctors`     | Returns doctor list with status                           |
| **Clinical Report Create**        | `POST /api/report/clinical`         | Creates report record                                     |
| **Clinical Report PDF**           | `GET /api/report/clinical/[id]/pdf` | Returns PDF stream via Playwright                         |
| **Admin User Flows**              | `/admin`                            | Admin command center renders                              |
| **Charts / Trajectory**           | `/emr` prognosis section            | Chart.js charts render with data                          |

**Fix strategy:** For each failing feature, trace from API route → service → lib
→ database. Fix root cause.

**Success criteria:** All 13 features verified working. No 500 errors, no
uncaught exceptions, no blank pages.

---

## Phase 6 — Pending Cleanup (from HANDOFF.md)

1. **Delete dead code:** `scripts/reset-crew-password.mjs` — confirmed dead, no
   references.
2. **Fix `artifactPathUnder` bug:** Locate in codebase, apply minimal fix (if
   not already resolved in Phase 2).
3. **Update `.agent/`:**
   - `PROGRESS.md` — update with verification results
   - `sessions/2026-04-13.md` — write session summary
   - `HANDOFF.md` — clear pending items, note new state

---

## Phase 7 — Git Commit

**Goal:** Track all restored files in monorepo git with proper audit trail.

```bash
git add apps/healthcare/sentra-dashboard/
git commit -m "feat(sentra-dashboard): restore and verify full app health after backup restoration

- Restored from backup: all files re-tracked in monorepo git
- Environment configured and verified
- tsc clean, lint clean, build clean
- All 30+ tests pass
- All 13 major runtime features verified
- Dead code removed (reset-crew-password.mjs)
- artifactPathUnder bug resolved

Agent: Claude · Phase: Execution · Handoff: Health Verification 2026-04-13"
```

**Note:** `.env.local` must NOT be committed (already in `.gitignore`).

---

## Verification Summary

| Gate           | Command                     | Pass Condition                  |
| -------------- | --------------------------- | ------------------------------- |
| TypeScript     | `tsc --noEmit`              | EXIT=0                          |
| Lint           | `next lint`                 | No errors                       |
| Build          | `next build`                | No errors                       |
| Test Suite     | `tsx scripts/test-suite.ts` | All pass                        |
| Runtime Auth   | POST /api/auth/login        | 200 + cookie                    |
| Runtime Socket | Socket.io connect           | `connect` event fires           |
| Runtime PDF    | GET /api/report/.../pdf     | Content-Type: application/pdf   |
| Git            | `git status`                | sentra-dashboard tracked, clean |

---

## Files to Modify

| File                              | Phase     | Action                      |
| --------------------------------- | --------- | --------------------------- |
| `.env.local`                      | Phase 1   | Create from `.env.example`  |
| `scripts/reset-crew-password.mjs` | Phase 4/6 | Delete (dead code)          |
| TBD (artifactPathUnder)           | Phase 2   | Fix bug                     |
| `.agent/PROGRESS.md`              | Phase 6   | Update status               |
| `.agent/sessions/2026-04-13.md`   | Phase 6   | Write session log           |
| `.agent/HANDOFF.md`               | Phase 6   | Clear pending, update state |

---

## Key Dependencies (No New Files)

Reuse all existing implementations:

- `src/lib/server/crew-access-auth.ts` — auth system
- `src/lib/emr/` — EMR bridge
- `src/lib/cdss/` — CDSS engine
- `src/lib/intelligence/` — Intelligence dashboard
- `server.ts` — Socket.io server
- `src/lib/report/` — Clinical report + PDF
- `scripts/test-suite.ts` — Test runner
