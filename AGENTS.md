# AGENTS.md - ABYSS Monorepo

Repository-wide instructions for Codex, Cursor agents, Claude, and other AI
coding tools.

## Purpose

This is the production-oriented Sentra / ABYSS engineering monorepo. Work here
must stay safe, small, typed, and reviewable. Use `pnpm`, not npm or yarn,
unless a package explicitly proves otherwise.

## Operational SSOT

`AGENTS.md` is the public rulebook. `.agent/` is the operational SSOT.

Before any non-trivial repo work, agents must:

1. Verify `.agent/` exists.
2. Read `.agent/README.md`.
3. Read `.agent/HANDOFF.md`, then `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and
   `.agent/DECISIONS.md` as needed.
4. Report `.agent/` status before continuing when continuity, handoff, or
   protected-state risk is involved.

Do not delete, move, clean, reset, ignore, or treat `.agent/` as cache/junk. Do
not replace `.agent/` with `AGENTS.md`.

## Operating Style

- Understand the relevant files before editing.
- Summarize the exact plan before changes.
- Make the smallest safe change that solves the task.
- Prefer existing project patterns over new abstractions.
- Keep boundaries clean between product logic, UI, infrastructure, database,
  OCR/RAG, diagnosis/CDS, and external integrations.
- Explain decisions briefly in Bahasa Indonesia unless code, logs, or comments
  require English.
- Do not rewrite, rename, move, delete, or restructure unrelated files.
- Do not add dependencies, change build config, touch auth, database schema,
  deployment config, or secrets without explicit approval.

## Documentation Lookup

Use Context7 only for framework, library, and API documentation lookup. Do not
send any of the following to Context7 or any external lookup tool:

- secrets, `.env` values, tokens, keys, credentials
- private code
- patient data or PHI
- proprietary architecture details
- internal business plans

For security-sensitive changes, verify locally before editing auth, database,
deployment, or secret-handling code.

## Boundaries

Allowed by default:

- Small code fixes
- Typed refactors within one clear area
- Test, typecheck, lint, and verification improvements
- Documentation updates that clarify current behavior
- Local scripts that do not add production dependencies

Ask first:

- New package dependencies
- New production services or paid cloud services
- Auth changes
- Database schema or migration changes
- Deployment, CI/CD, Terraform, Docker, or secret-management changes
- SATUSEHAT, BPJS, external API, or third-party integration assumptions
- Folder moves, renames, deletions, or large restructuring

Forbidden:

- Exposing or modifying secrets
- Reading, printing, copying, or transmitting `.env` values
- Committing credentials, PHI, or private patient data
- Reverting user changes unless explicitly asked
- Hiding verification failures
- Claiming completion when build, typecheck, or tests fail

## Repository Shape

Keep new work within the existing structure:

- `apps/` - applications
- `packages/sentra/` - proprietary Sentra capabilities
- `packages/platform/` - runtime infrastructure and platform services
- `packages/clinical/` - clinical knowledge and safety substrate
- `packages/shared/` - reusable shared primitives
- `packages/tooling/` - developer and build tooling
- `platform/` - platform applications and orchestrators
- `infrastructure/` - Docker, ArgoCD, Terraform, and deployment assets
- `flows/` - LangFlow definitions
- `docs/` - human-readable project documentation
- `.agent/` - operational SSOT knowledge and handoff state
- `tooling/governance/agent/` - agent hooks, scripts, and workflows
- `C:\Users\drclassy\.codex\` - global Codex config, scripts, and skills for
  this workstation

Do not create a new top-level domain or package location unless Chief approves
it.

## Verification Gate

Before completing any coding task, run:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.codex\scripts\verify-local.ps1"
```

The global Codex verification script runs:

```powershell
pnpm build
pnpm typecheck
pnpm test
git diff --stat
```

A task is done only when:

- build passes
- typecheck passes
- tests pass
- `git diff --stat` shows only intended files
- no unrelated files changed
- no forbidden dependency or boundary violation was introduced

If verification fails:

- Stop.
- Report the failing command.
- Summarize the root cause.
- Propose the smallest safe fix.
- Do not bypass verification unless Chief explicitly authorizes it.

Use this fallback only when the workspace is incomplete or a package does not
yet define all scripts:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.codex\scripts\verify-local-safe.ps1"
```

## Definition Of Done

Work is complete when:

- The requested behavior is implemented.
- Changes are minimal and scoped.
- No secrets or PHI were exposed.
- Relevant tests or checks were run.
- Global Codex verification passes, or the blocker is clearly reported.
- The final response includes what changed, how it was verified, risks, rollback
  note, and next step.

## Final Response Format

Use this structure:

- Summary of what you found
- Plan
- Files changed
- Changes made
- Verification commands
- Risks / rollback note
- Next step

## Primary stack:

- Windows 11, PowerShell 7
- Node.js 22+
- pnpm 9.15.0
- TypeScript
- Turborepo
- React / Next.js / Vite where applicable

Last updated: 2026-05-16
