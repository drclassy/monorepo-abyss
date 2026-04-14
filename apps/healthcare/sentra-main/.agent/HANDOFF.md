# HANDOFF.md — sentra-main
<!-- Overwrite at the start of each new session. -->

## Session: 2026-04-12

### Context
Chief moved Sentra Main from `apps/coorporate/sentra-main` to `apps/healthcare/sentra-main`, then confirmed the move is final and asked to remove/untrack the legacy path.

### Current State
Brand website is active under healthcare. pnpm workspace discovery resolves `@the-abyss/sentra-main` only to `apps/healthcare/sentra-main`. Legacy `apps/coorporate/sentra-main` is staged as a deleted gitlink and the folder no longer exists. Default dev/build scripts use webpack, with Turbopack retained as `dev:turbo`.

### Verification Completed
1. `pnpm list -r --depth -1 --filter @the-abyss/sentra-main`
2. `pnpm --filter @the-abyss/sentra-main install --frozen-lockfile --ignore-scripts`
3. `pnpm --filter @the-abyss/sentra-main lint`
4. `pnpm --filter @the-abyss/sentra-main build`
5. `pnpm test`

### Next Steps for Incoming Agent
1. Review staging carefully before commit because the repo has many unrelated dirty files.
2. Treat `pnpm-lock.yaml` as a separate review item: scoped frozen install passes, but the diff includes unrelated workspace importer churn.
3. Do not restore `apps/coorporate/sentra-main` unless Chief reverses the final relocation decision.
4. Never touch `next.config.mjs` or brand assets without Chief instruction.

### Rollback Plan
1. Recreate or restore the `apps/coorporate/sentra-main` gitlink only if Chief explicitly reverses the relocation.
2. If lockfile scope is rejected, regenerate or hand-edit only after deciding which workspace changes belong in the commit.
3. Re-run the five verification commands listed above.

---
**Status:** Cleanup complete — ready for staging review
