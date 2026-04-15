# Agent Execution Plan: Direct Task Queue

**Objective:**
Bypass Orchestrator creation for current tasks. Enable Cursor, Codex, and Claude to execute their respective P0, P1, and P2 tasks immediately as defined in their queue files.

**Decisions Logged by Chief:**
1. **[S1] Orchestrator Bypass:** Do NOT build or use the Orchestrator for the current phase.
2. **[S2] Referralink Refactor:** Assigned directly to agents (Cursor, Codex, Claude) to handle instead of utilizing an orchestrator pattern.

**Implementation Steps (to be executed by Agents once Plan Mode is exited):**

1. **Governor Initialization (Jen):**
   - Create the missing `.agent/tasks/TASKS.json` file.
   - Append Chief's decisions regarding S1 and S2 to `.agent/DECISIONS.md`.

2. **Claude Execution:**
   - Execute **[B3-A]** Audit `iskandar-gatekeeper`.
   - Execute **[B1-B]** Review `artifactPathUnder` fix.
   - Execute **[P1-10]** Clean duplicate rows in `CONTEXT.md`.
   - Execute **[P2-10]** Document API surface (post B3-B).

3. **Codex Execution:**
   - Execute **[B1-A]** Fix `artifactPathUnder` undeclared.
   - Execute **[P1-04]** Standardize `.agents/` to `.agent/`.
   - Execute **[P1-07 to P1-09]** Add Vitest coverage for core packages.

4. **Cursor Composer Execution:**
   - Execute **[P1-03]** Stage & commit 187 files from simplify pass.
   - Execute **[P1-11]** Resolve `pnpm-lock.yaml` churn.
   - Execute **[P2-08 & P2-11]** Setup Playwright and smoke tests.

**Verification:**
- `TASKS.json` accurately reflects the completed status of each item.
- `DECISIONS.md` contains the formal record of bypassing the Orchestrator.
- All high-priority (P0) blocking tasks are cleared.