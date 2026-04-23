# AGENTS.md — The Abyss Monorepo

# Supreme authority. All local AGENTS.md files defer to this document.

# Last updated: April 2026

---

## §0 — SSOT Declaration

This file is the Single Source of Truth for all agents operating in this
monorepo. Division-level and sub-app-level AGENTS.md files are scoped additions
only — they never duplicate or contradict this document. When conflict exists,
this file wins.

---

## Continual learning (plugin)

- Agent transcripts for this workspace live under `C:\Users\claud\.cursor\projects\d-Devop-abyss-monorepo\agent-transcripts\` (session folders contain `*.jsonl`); newest files are the default Continual Learning mining surface.
- Flow `/continual-learning` plus the `agents-memory-updater` subagent merges durable bullets into this `AGENTS.md` after transcript review.
- Incremental transcript index expected at `.cursor/hooks/state/continual-learning-index.json` is not in the tree yet; add it when the plugin starts recording processed transcript mtimes (otherwise miners only use full directory scans).
- Session transcripts show Chief-facing answers in Bahasa Indonesia with neutral wording and without second-person pronouns (audit crowded subagent lists via `%USERPROFILE%\.cursor\agents` and repo `.cursor\agents\`, matching prior session guidance).
- Recent work in the repo clusters on `packages/symphony/`, `packages/vector-store/`, tracked `.cursor/` rules and hooks, and `mcp.json.example` versus local `.mcp.json`; before push, run `repository/validate.ps1 -path <project-root>` per the compliance section.

---

## §1 — Mandatory Initialization (GUARD 1)

Every agent MUST execute GUARD 1 at session start without exception.

Read in this exact order:

1. `.agent/CONTEXT.md` — Architecture and stack
2. `.agent/PROGRESS.md` — Current state of work
3. `.agent/HANDOFF.md` — Active plan and session instructions
4. `.agent/LESSONS.md` — Previously made mistakes to avoid
5. `.agent/DECISIONS.md` — Prior architectural decisions

After reading, output:

> ✅ CONTEXT LOADED: [architecture state] · PROGRESS: [work state] · ACTIVE
> TASK: [session goal] · KNOWN RISKS: [relevant lessons]

Wait for Chief confirmation before proceeding to J1.

---

## §2 — JET Workflow Protocol (GUARD 2)

Every non-trivial task (2+ steps) follows the JET Protocol without exception.

| Phase | Name          | Action                                                                                | Gate           |
| ----- | ------------- | ------------------------------------------------------------------------------------- | -------------- |
| J1    | **Context**   | Scan `.agent/`, repo, env vars → log confirmation                                     | Auto           |
| J2    | **Validate**  | Check against `.cursor/rules/` + `AGENTS.md` → report discrepancies, halt if critical | Auto           |
| J3    | **Diagnose**  | Identify root issues/needs → document in `HANDOFF.md`                                 | Auto           |
| J4    | **Plan**      | Write step-by-step `HANDOFF.md` + rollback plan                                       | Auto           |
| J5    | **Risk Gate** | Task classification → determine JET depth and GO requirement                          | **Risk-based** |
| J6    | **Execute**   | Implement code changes — diff must be verifiable                                      | Post-planning  |
| J7    | **Verify**    | Run tests → 100% pass or rollback                                                     | Post-execution |
| J8    | **Docs**      | Update `.agent/` (sessions/ + HANDOFF.md)                                             | Post-verify    |
| J9    | **Commit**    | `git commit` with trailer: `Agent: Claude · Phase: Execution · Handoff: [session-id]` | Post-docs      |

### §2.1 — Task Classification & Risk-Based Gates

Not all tasks carry the same risk. Agents MUST classify tasks before execution:

| Class       | Risk Level | Examples                                               | JET Required | GO Gate               |
| ----------- | ---------- | ------------------------------------------------------ | ------------ | --------------------- |
| **Class A** | Minimal    | Read files, grep search, typo fix, rename variable     | J1-J4 only   | Auto-approve          |
| **Class B** | Standard   | New component, API endpoint, bug fix, refactor         | J1-J7        | Checkpoint (self-log) |
| **Class C** | High       | DB migration, terraform, security config, PHI handling | J1-J9 Full   | ⛔ Hard J5            |

**Classification Heuristics:**

- Only reading/searching? → **Class A**
- Writing code in existing patterns? → **Class B**
- Touching infrastructure/database/PHI? → **Class C**

**GO Status Tracking:** Check `.agent/SESSION_STATE.md` before Class B or C
tasks:

- If GO already granted for session scope → proceed
- If Class C and no GO → halt, request Chief "GO"
- If Class B and no GO → log plan, proceed (checkpoint mode)

**Note:** J5 hard gate still applies to Class C tasks regardless of session
state.

---

## §3 — Absolute Prohibitions

The following are forbidden under any circumstance:

- `terraform apply` — Chief execution only, never agent-executed
- PHI/PII in logs, commits, fixtures, or test data — zero tolerance
- `rm -rf`, `git reset --hard`, `git clean` without explicit Chief approval
- Creating a new repository without direct instruction in the current session
- Cross-repository file operations without confirmed source and destination
  paths
- Database migrations, drops, or truncations executed autonomously
- Pushing to any remote branch without explicit approval
- Skipping J5 for Class C tasks

---

## §4 — Monorepo Directory Map

```
D:\Devop\abyss-monorepo\
├── AGENTS.md                    ← this file (supreme authority)
├── CLAUDE.md                    ← Claude Code CLI entry point
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .agent\                      ← agent memory (CONTEXT, PROGRESS, HANDOFF, LESSONS, DECISIONS, sessions/)
├── .claude\                     ← Claude Code config (agents/, commands/, skills/, settings.json)
├── .cursor\                     ← IDE rules, hooks, subagents (tracked — see root .gitignore negations)
├── .mcp.json                    ← MCP server registry (local only; gitignored)
├── mcp.json.example             ← Copy to .mcp.json; committed template (empty servers)
├── apps\
│   ├── platform\
│   │   ├── orchestrator\        ← NestJS Saga Engine (CQRS mandatory)
│   │   └── sentra-portal\       ← Clinical Dashboard
│   ├── healthcare\
│   │   ├── referralink\
│   │   ├── sentra-assist\
│   │   └── sentra-main\
│   ├── academic\
│   ├── community\
│   ├── corporate\
│   └── prototype\
│       └── agent-hermes\        ← Hermes Maximus meta-agent
├── packages\
│   ├── database\                ← Shared DB layer (all apps route through here)
│   ├── ai-core\          ← renamed from artificial-core
│   ├── design-token\
│   ├── literature-harvester\    ← open-access literature search/download
│   └── shared-types\
├── tooling\
│   └── librarian-desktop\       ← Electron console + companion literature worker
├── infrastructure\              ← IaC — Chief-only execution
├── flows\                       ← LangFlow AI workflow definitions
└── docs\
    ├── adr\                     ← Architectural Decision Records
    ├── agent-memory\            ← `.agent/` at root and per-app (context + audit)
    └── specs\phase-4\
```

### §4.1 — Cursor subagents (explicit invoke)

Specialized prompts under `.cursor/agents/` (tracked in Git). Invoke by name when the task matches (not auto-loaded like rules). MCP: use `mcp.json.example` → `.mcp.json` per `.cursor/README.md`.

| Name | Role |
| ---- | ---- |
| `code-reviewer` | Review diffs and changed files for quality, security, reuse, and rule compliance. |
| `test-writer` | Author high-value tests across unit/component/E2E/integration layers. |
| `config-writer` | Decide whether behavior belongs in central config, a rule, a skill, or an agent; then create or update the artifact and cross-references. |

---

## §5 — NestJS Architecture Standards

These rules apply to all NestJS applications in this monorepo.

**Module structure:** Every module must follow the pattern `module/`,
`controller/`, `service/`, `dto/`, `entities/`. No deviations without an ADR
entry.

**Validation:** DTOs must use `class-validator` decorators. Plain interfaces are
not acceptable for request validation.

**Separation of concerns:** Business logic lives in services only. Controllers
handle HTTP concerns exclusively.

**Database access:** All database operations must route through
`packages/database`. No raw queries or direct ORM calls in application code.

**PHI/PII protection:** All PHI/PII fields in healthcare apps must be decorated
with `@Exclude()` from `class-transformer`. This is enforced at the
serialization layer — not optional.

**API documentation:** Every controller endpoint in `apps/healthcare/` requires
a `@ApiOperation` Swagger decorator.

**CQRS:** Mandatory for `apps/platform/orchestrator/`. Commands and Queries are
strictly separated. No mixing.

**Testing:** Every service requires a corresponding `.spec.ts` file. Minimum
coverage threshold: 80% for healthcare apps, 60% for other apps.

---

## §6 — Session Log Protocol (Dual Write)

Every session that modifies code must write to both systems:

1. `.agent/sessions/YYYY-MM-DD.md` — agent memory and audit trail

Log to `.agent/sessions/` at J8 and J9. No external audit system required.

---

## §7 — Technology Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Runtime           | Node ≥22                            |
| Package manager   | pnpm ≥9                             |
| Build system      | Turborepo v2                        |
| Backend framework | NestJS (TypeScript)                 |
| ORM               | Prisma (via packages/database)      |
| Validation        | class-validator + class-transformer |
| API docs          | Swagger / OpenAPI                   |
| AI orchestration  | LangFlow (flows/)                   |
| CI/CD             | GitHub Actions                      |
| IaC               | Terraform (Chief-only)              |
| Container         | Docker + Docker Compose             |

---

## §8 — CI/CD Pipeline

Pipeline sequence: verify → build → test → lint → security → flows

Security scan must pass before any healthcare PR is merged. No exceptions.

---

## §9 — Repository Compliance System

Every agent MUST follow the Repository Compliance System before pushing any project.

**Rules (grounded in real incidents):** [`repository/STANDARD.md`](repository/STANDARD.md)
**Pre-push gate:** [`repository/CHECKLIST.md`](repository/CHECKLIST.md)
**Fix guides:** [`repository/TROUBLESHOOTING.md`](repository/TROUBLESHOOTING.md)
**Automated validator:** [`repository/validate.ps1`](repository/validate.ps1)
**Bootstrap templates:** [`repository/templates/`](repository/templates/)

### Mandatory checks before every `git push`:

1. Run `repository/validate.ps1 -path <project-root>` — must exit 0
2. Verify `pnpm-lock.yaml` overrides match `package.json` pnpm.overrides exactly
3. Confirm `.gitattributes` exists with `* text=auto eol=lf`
4. Confirm `docs/api/` and `dist/` are in `.gitignore`

### Mandatory checks when bootstrapping a new project:

1. Copy `repository/templates/.gitignore` to project root
2. Copy `repository/templates/.gitattributes` to project root
3. Copy `repository/templates/.editorconfig` to project root
4. Run `git add --renormalize .` before first commit

### Key rules (summary — read STANDARD.md for full context):

- Lockfile regeneration must happen in `/tmp/` — never inside the monorepo root
- Auto-generated directories (`dist/`, `.output/`, `docs/api/`) must be in `.gitignore`
  before the first build is ever run
- Agent coordination via `.agent/HANDOFF.md` — read before acting, write before starting

---

_If a local rule contradicts this document, this document wins._ _Append new
decisions to `.agent/DECISIONS.md` and new lessons to `.agent/LESSONS.md`._
