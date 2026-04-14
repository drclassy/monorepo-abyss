# HANDOFF.md — sentra-dashboard

<!-- Overwrite at the start of each new session. -->

## Session: 2026-04-13 (OUTCOME)

### Context

Full health verification after backup restoration. Entire sentra-dashboard
directory was copy-pasted from backup after repo corruption. All verification
phases completed.

### Current State

- **tsc --noEmit:** EXIT=0 ✅
- **next lint:** EXIT=0 ✅
- **next build:** Clean ✅
- **Test suite:** 111/111 pass ✅
- **Dev server:** Runs on `http://localhost:7000` (tsx --env-file .env.local
  --conditions react-server server.ts)
- **Database:** Neon PostgreSQL connected and healthy; 3 clinical reports from
  March 2026 intact
- **Auth:** Login confirmed via browser; custom scrypt auth working
- **Git state:** ALL CHANGES STILL UNCOMMITTED — sentra-dashboard/ is entirely
  untracked (`??`) in monorepo git. Git commit is the immediate next step.

### What Was Fixed This Session

1. **Auth-hardening test bug** (`scripts/test-auth-hardening.ts:354`):
   `GEMINI_API_KEY` (undefined variable) → `CANARY_SENTINEL` (correct constant)
2. **CDSS symptoms bug** (`src/app/api/cdss/symptoms/route.ts`): Route read
   `d.gejala` but `penyakit.json` uses `d.gejala_klinis`. Fixed to read
   `d.gejala ?? d.gejala_klinis`. Now returns 341 symptoms.

### Pre-existing Issues — RESOLVED in backup

- `artifactPathUnder` bug: Already resolved in backup, no action needed
- `scripts/reset-crew-password.mjs`: Already deleted in backup, no action needed

### Outstanding Items

1. **Git commit** — IMMEDIATE NEXT STEP:
   `git add apps/healthcare/sentra-dashboard/` + commit with JET trailer
2. **EMR_USERNAME** — not set in `.env.local` (EMR bridge to ePuskesmas will
   fail on login step). Set when available.
3. **SENTRY_DSN + RESEND_API_KEY** — empty (non-critical, optional services)

### Next Steps for Incoming Agent

1. Read this HANDOFF.md + PROGRESS.md
2. Execute git commit:
   ```bash
   git add apps/healthcare/sentra-dashboard/
   git commit -m "feat(sentra-dashboard): restore and verify full app health after backup restoration"
   ```
   Include trailer:
   `Agent: Claude · Phase: Execution · Handoff: Health Verification 2026-04-13`
3. Set `EMR_USERNAME` in `.env.local` for EMR bridge
4. No pending bugs — app is in clean state

### Server State

- Dev server runs on port 7000
- Start: `pnpm --filter @the-abyss/sentra-dashboard dev`
- Or directly:
  `node_modules/.bin/tsx --env-file .env.local --conditions react-server server.ts`
- Stop: `taskkill //F //IM node.exe` or find PID via
  `netstat -ano | findstr :7000`

---

**Status:** ✅ Health verification complete. All layers clean. One action
pending: git commit.

---

## Session: 2026-04-13 (POST-SIMPLIFY QA CORRECTION)

### Current State

- `pnpm run lint` PASS after `pnpm run prisma:generate`.
- `pnpm run build` PASS; one Turbopack NFT warning remains from filesystem
  access in `src/lib/server/crew-access-institutions.ts`.
- `SKIP_AUTH_HARDENING=1 pnpm run test` PASS: 111/111 tests.
- `pnpm run security:catch-scan` PASS.
- `pnpm run security:secret-scan` FAILS on ignored `.env.local`.
- `pnpm run security:audit` FAILS: 89 monorepo vulnerabilities; direct dashboard
  high hits are Prisma transitive `effect` and `defu`.
- Browser login gate rendered once; repeated route smoke caused dev server
  hang/timeouts with `CLOSE_WAIT` sockets.

### Hotfix Applied

- `next.config.ts` — removed invalid dev CSP source `http://192.168.*:*`;
  browser was ignoring it and logging a CSP error.

### Evidence

- Screenshot: `runtime/qa-artifacts/home-login.png`
- Browser login capture: `runtime/qa-artifacts/browser-home.json`
- Route smoke timeout capture: `runtime/qa-artifacts/browser-route-smoke.json`
- Audit JSON: `runtime/qa-artifacts/pnpm-audit.json`

### Open Risks

1. No before/after simplify diff is possible from local Git because
   `sentra-dashboard` is untracked and has no nested `.git`.
2. Auth-hardening was skipped to avoid mutating a prod-like `.env.local`
   database.
3. `pnpm run start` is Windows-broken due to Unix env syntax.
4. Dev-server hang needs separate root-cause work before full browser functional
   coverage can be claimed.

### Recommended Next Session

1. Chief provides clean baseline/commit/backup for forensic simplify diff.
2. Create disposable Postgres/Neon branch for auth-hardening and login browser
   QA.
3. Fix Prisma transitive advisories via safe patch/override and rerun audit.
4. Investigate custom dev server hang with focused instrumentation around
   `server.ts` and Next request handler lifecycle.

---

## Session: 2026-04-13 (POST-SIMPLIFY QA CONTINUATION)

### Current State

- Root cause for the custom dev-server browser issue is now identified and
  fixed: `server.ts` created its HTTP server after `next()`, so Next dev upgrade
  handling was not attached to the custom server used by Socket.IO.
- Hotfix in `server.ts`: create the HTTP server first, pass it into
  `next({ httpServer })`, and register page handling with
  `httpServer.on('request', ...)`.
- Browser proof after hotfix:
  `runtime/qa-artifacts/browser-custom-dev-after.json` shows `[HMR] connected`;
  `runtime/qa-artifacts/browser-route-smoke-after.json` shows 8/8 routes reached
  `domcontentloaded` without timeout.
- TypeScript proof after final edits: `pnpm run lint` PASS.
- Static catch proof after final edits: `pnpm run security:catch-scan` PASS.

### Remaining Risks

1. Build after the exact `/*turbopackIgnore: true*/` annotation is not freshly
   verified. Escalated build was blocked by system usage-limit rejection;
   sandbox build failed with Windows `EPERM` unlink in `.next`.
2. Full test after final edits is not freshly verified. Escalated test was
   blocked by system usage-limit rejection; sandbox test failed with
   `spawn EPERM`.
3. `security:secret-scan` still fails on ignored `.env.local`; use a sanitized
   env or adjust scanner behavior for local-only env files before PR.
4. `security:audit` remains unresolved: Prisma transitive `effect` and `defu`
   advisories need dependency patch/override validation.
5. Local forensic diff remains blocked because this dashboard folder is
   untracked in the monorepo.

### Immediate Next Commands

```powershell
pnpm run build
$env:SKIP_AUTH_HARDENING='1'; pnpm run test
pnpm run security:catch-scan
```

### Recommended Fix Priority

1. Keep and review `server.ts` hotfix; it resolves the custom server HMR
   regression with before/after browser evidence.
2. Re-run build/test outside sandbox after usage limit resets.
3. Patch dependency audit in a separate, narrow change.
4. Add a Windows-safe local production start script only if local production run
   is required.

---

## Session: 2026-04-14 (POST-SIMPLIFY QA CONTINUATION AFTER GO)

### Current State

- `server.ts` custom dev-server hotfix remains the primary functional repair:
  the shared HTTP server is created before `next()`, passed into
  `next({ httpServer })`, and used for both Next request handling and Socket.IO.
- Runtime path fixes were extended to `crew-access-institutions`, EMR session
  storage, env fallback resolution, and LB1 runtime YAML paths to reduce
  Turbopack NFT warnings caused by default `process.cwd()` runtime paths.
- `pnpm run lint` PASS after latest edits.
- `pnpm run security:catch-scan` PASS after latest edits.
- Browser smoke evidence from the successful custom dev-server run remains valid
  for the server hotfix:
  `runtime/qa-artifacts/browser-route-smoke-2026-04-14.json` shows 8/8
  unauthenticated routes reached `domcontentloaded` and HMR connected.

### Verification Blockers

1. `pnpm run build` after the final LB1 runtime-path patch is not refreshed:
   - Escalated execution was rejected by the usage-limit guard.
   - Sandbox execution failed with
     `EPERM: operation not permitted, unlink '.next/app-path-routes-manifest.json'`.
2. `SKIP_AUTH_HARDENING=1 pnpm run test` after the final LB1 runtime-path patch
   is not refreshed:
   - Escalated execution was rejected by the usage-limit guard.
   - Sandbox execution failed with Node `spawn EPERM` across test subprocesses.

### Known Open Risks

- `security:secret-scan` still fails on `.env.local`; do not print or commit
  local secrets.
- `pnpm audit --prod --audit-level=high --json` still fails with monorepo-wide
  vulnerabilities; last metadata count: 7 low, 45 moderate, 35 high, 4 critical.
- Forensic simplify diff remains blocked because
  `apps/healthcare/sentra-dashboard` is untracked from monorepo HEAD
  `b9d5bad2880bcb81bd8077dd77bfcd0fa14b1fec`.
- Auth-hardening still needs a disposable non-production Postgres/Neon database.

### Immediate Next Commands

```powershell
pnpm run build
$env:SKIP_AUTH_HARDENING='1'; pnpm run test
pnpm run security:secret-scan
pnpm audit --prod --audit-level=high --json
```

### Recommended Fix Priority

1. Re-run build/test outside sandbox after usage limits reset; accept or revert
   the LB1 runtime-path patch based on fresh build evidence.
2. Keep `server.ts` hotfix unless a fresh browser run disproves it; current
   browser evidence shows the HMR regression is fixed.
3. Decide whether `.env.local` should be excluded from local secret scan or
   replaced with a sanitized scan fixture for pre-PR checks.
4. Triage dependency audit separately because it is monorepo-wide and may need
   coordinated lockfile changes.
