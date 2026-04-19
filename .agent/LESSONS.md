# LESSONS.md — The Abyss (Monorepo Root)
<!-- Append-only. Agent MUST read before starting any work. NEVER delete existing entries. -->

---

### [2026-04-10] Root .agent/ had wrong structure
**Mistake:** Root .agent/ contained conductor/, memory/, projects/, rules/, workflows/ instead of the standard 5-file structure.
**New rule:** .agent/ at ANY level = CONTEXT.md, PROGRESS.md, HANDOFF.md, LESSONS.md, DECISIONS.md, sessions/ — nothing else at root level of the folder.
**Trigger:** Any .agent/ initialization or audit.

### [2026-04-10] Session log protocol simplified
**Mistake:** Agent attempted to maintain two parallel log systems (.agent/sessions/ and an external audit folder) causing friction and missed updates.
**New rule:** Every session that changes code MUST update `.agent/sessions/YYYY-MM-DD.md` only. The external audit folder is deprecated.
**Trigger:** Every session end, every JET J9 commit.

### [2026-04-10] AGENTS.md documentation path pointed to wrong location
**Mistake:** AGENTS.md referenced /documentation/ — but the real system was an external audit folder.
**New rule:** All documentation path references must point to `.agent/sessions/` for session logs and `docs/adr/` for architectural decisions.
**Trigger:** Any update to AGENTS.md documentation section.

### [2026-04-13] NestJS business logic placed in controllers
**Mistake:** Business logic and database calls placed directly in NestJS controllers instead of services.
**New rule:** Controllers handle HTTP concerns only (routing, request parsing, response shaping). All business logic lives in services. All database access goes through packages/database.
**Trigger:** Any new NestJS controller creation.

### [2026-04-13] PHI fields not excluded from API responses
**Mistake:** PHI/PII fields returned in API responses without @Exclude() decorator, exposing sensitive patient data.
**New rule:** Every field containing PHI/PII in healthcare apps must be decorated with @Exclude() from class-transformer. Verify at J7 before any healthcare PR.
**Trigger:** Any new entity or DTO creation in apps/healthcare/.

---
<!-- Agent: append new lessons below this line -->

### [2026-04-19] pnpm-workspace.yaml is the real workspace config — not package.json#workspaces
**Mistake:** `apps/**` was never added to `pnpm-workspace.yaml`. pnpm uses THIS file as the workspace source of truth — the `workspaces` field in `package.json` is for npm/yarn compatibility only and is ignored by pnpm.
**New rule:** Always verify `pnpm-workspace.yaml` includes `apps/**`, `packages/**`, and `tooling/*`. Run `pnpm install` after any change to regenerate lockfile.
**Trigger:** Any new app added to `apps/`, any bootstrapping of workspace.

### [2026-04-19] Directory name and package name must be identical from day one
**Mistake:** `packages/artificial-core/` had directory name `artificial-core` but package.json name `@the-abyss/ai-core`. This mismatch caused documentation confusion and agent context errors across all sessions since project start.
**New rule:** When creating a new package, the directory name MUST match the package name suffix. e.g. directory `ai-core` ⇒ package `@the-abyss/ai-core`. Check this before first commit of any new package.
**Trigger:** Any new package creation in `packages/`.

### [2026-04-19] CI glob patterns must be updated when directory structure changes
**Mistake:** `ci.yml` validates `flows/definitions/*.json` (root glob). After reorganizing flows into subdirectories, none of the new flow files would be validated by CI.
**New rule:** When creating subdirectory structures for validated assets (flows, schemas, fixtures), immediately update the corresponding CI glob pattern in the same PR.
**Trigger:** Any restructuring of `flows/`, `repository/templates/`, or other CI-validated directories.

### [2026-04-13] External audit folder deprecated — single audit trail in .agent/
**Mistake:** Maintaining an external audit folder as a separate system created duplicate work, increased friction, and caused agents to miss logging requirements.
**New rule:** Session logs live ONLY in `.agent/sessions/YYYY-MM-DD.md`. There is no external audit system. AGENTS.md and CLAUDE.md are the SSOT for all agent governance.
**Trigger:** Any session that modifies code.
