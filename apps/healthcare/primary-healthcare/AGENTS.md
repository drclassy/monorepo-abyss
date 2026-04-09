# AGENTS.md — Primary Healthcare (Puskesmas)

Guide for **coding agents** and humans working in
**`apps/healthcare/primary-healthcare`**. This folder is a **multi-package**
area: the **Next.js dashboard** (clinical / intelligence UI), the **Vite
marketing/public website**, and shared **`database/`** JSON assets—not a single
installable app at the root.

---

Every task response must begin with:
```
━━━━━━━━━━━━━━━━━━━━━━
PHASE : [phase name]
GATE  : [OPEN ✓ / BLOCKED ✗]
FILE  : [filename / —]
━━━━━━━━━━━━━━━━━━━━━━
```

---

## RULES PER PHASE

### [1] RESEARCH
- Read spec.md first — always, no exceptions
- Read all relevant files before writing anything
- No assumptions — verify directly from source
- Output: brief findings summary to Chief

### [2] PLAN
```
FILE   : [filename]
CHANGE : [exact description]
REASON : [why — reference spec if applicable]
RISK   : [what could break]
```
- One plan per file
- Show to Chief, wait for response

### [3] JET GO?
- FULL STOP
- Zero lines of code written before Chief types GO
- No exceptions whatsoever

### [4] EXECUTE
- ONE FILE per step
- ONE CHANGE per step
- Show diff after every change
- Wait for Chief confirmation before next step
- On error: STOP, report, wait for instruction — no auto-fix

### [5] VERIFY
- Run relevant tests
- Test pass ≠ done if behavior doesn't match spec
- Build pass ≠ problem solved
- Wait for Chief confirmation from actual output

### [6] REPORT
```
STATUS : [DONE / PARTIAL / FAILED]
DONE   : [what changed]
TEST   : [actual test results]
VERIFY : [Chief confirmation / actual output]
NEXT   : [next steps if any]
```

---

## ABSOLUTE PROHIBITIONS

1. NEVER execute without reading spec.md first
2. NEVER jump to code without Plan + GO
3. NEVER batch edit more than 1 file without explicit permission
4. NEVER reinterpret Chief's instructions — execute literally
5. NEVER report done/fixed without test + actual verify
6. NEVER create new file if existing file can be fixed
7. NEVER ignore Chief's concrete instructions for any reason
8. NEVER use informal address — always neutral professional tone

---

## ON VIOLATION

1. STOP execution immediately
2. Explicitly acknowledge the violation to Chief
3. Return to the skipped phase
4. Wait for GO again from Chief

---

## Native folders to read (editor preferences)

| Platform       | Path                                 |
| -------------- | ------------------------------------ |
| Claude         | `C:\Users\claud\.claude\CLAUDE.md`   |
| Codex          | `C:\Users\claud\.codex\AGENTS.md`    |
| Roo Code       | `C:\Users\claud\roocode\AGENT.md`    |
| Gemini         | `C:\Users\claud\.gemini\GEMINI.md`   |
| GitHub Copilot | `C:\Users\claud\.copilot\AGENTS..md` |
| Kilocode       | `C:\Users\claud\.kilo\AGENTS.md`     |

Monorepo context: `D:/Devop/abyss-monorepo/CLAUDE.md` and
`apps/healthcare/AGENTS.md`.

**Package-specific deep dive:** [`CLAUDE.md`](./CLAUDE.md) (dashboard-focused
structure and commands—paths inside may mirror historical layout; prefer the
real `dashboard/` tree when coding).

---

## Packages in this folder

| Subfolder    | Package name                     | Role                                                                                                              | Agent guide                                    |
| ------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `dashboard/` | `@the-abyss/puskesmas-dashboard` | Next.js App Router, Prisma, custom `server.ts` (Next + Socket.IO + Audrey/Gemini Live proxy), CDSS, audit, Sentry | [`dashboard/AGENTS.md`](./dashboard/AGENTS.md) |
| `website/`   | `@the-abyss/puskesmas-website`   | Vite + React public/marketing site, shadcn-style UI, Vitest                                                       | [`website/AGENTS.md`](./website/AGENTS.md)     |
| `database/`  | (data only)                      | ICD / clinical JSON and backups—**no** `package.json`; treat as curated assets                                    | —                                              |

---

## Commands

**Dashboard** (`dashboard/`):

```powershell
cd D:/Devop/abyss-monorepo/apps/healthcare/primary-healthcare/dashboard
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
```

**Website** (`website/`):

```powershell
cd D:/Devop/abyss-monorepo/apps/healthcare/primary-healthcare/website
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
```

From monorepo root (typical):

```powershell
pnpm --filter @the-abyss/puskesmas-dashboard dev
pnpm --filter @the-abyss/puskesmas-website dev
```

Dashboard dev often uses the **custom server**:
`tsx --conditions react-server server.ts` (see `dashboard/package.json` and
`dashboard/ARCHITECTURE.md`).

---

## Directory map (short)

| Path                        | Contents                                                                   |
| --------------------------- | -------------------------------------------------------------------------- |
| `dashboard/src/app/`        | Next.js App Router routes (auth, dashboard, API routes as defined in repo) |
| `dashboard/src/components/` | UI, forms, feature modules (patients, diagnosis, Audrey, analytics, …)     |
| `dashboard/src/lib/`        | API clients, hooks, stores, clinical utilities                             |
| `dashboard/prisma/`         | Schema, migrations, seed                                                   |
| `dashboard/server.ts`       | Custom HTTP + Socket.IO + voice proxy wiring                               |
| `website/src/`              | Vite app source (components, pages, hash/static routing per ADRs)          |
| `database/`                 | Shared JSON corpora; do not commit patient data                            |

Authoritative architecture notes: `dashboard/ARCHITECTURE.md`,
`website/ARCHITECTURE.md`, `dashboard/docs/*`, `website/docs/*`.

---

## Compliance and safety

- **PHI/PII:** Same strict rules as `apps/healthcare/AGENTS.md`—no cleartext PII
  in logs, Sentry, or tests.
- **Clinical paths:** CDSS, screening audit, and auth-hardening scripts
  exist—run relevant `pnpm test:*` targets before merging risky changes.
- **Database changes:** Use Prisma migrations in `dashboard/`; never hand-edit
  production data in-repo.

---

## Agent-native note (short)

The dashboard is **traditional product + AI features** (APIs, sockets, voice),
not a generic tool-calling agent shell. **Coding-agent parity** means preserving
**API contracts**, **Prisma models**, and **realtime events** documented or
implied in `ARCHITECTURE.md` and OpenAPI/mintlify docs under
`dashboard/mintlify-docs/` when present.

---

## Pre-PR checklist

- [ ] For dashboard: `pnpm lint`, `pnpm test` (and `pnpm build` before release)
- [ ] For website: `pnpm lint`, `pnpm test`, `pnpm build`
- [ ] Prisma: migrate + generate after schema changes
- [ ] No PHI in fixtures; scrub Sentry and server logs
- [ ] Sentratorium: perbarui `docs/sentratorium/latest.md` + satu baris
      `AGENT_SESSION_LOG.md` (sebutkan paket, mis. dashboard / website /
      umbrella)

---

## Sentratorium (wajib — jejak sesi)

**Lokasi HQ (ejaan resmi):** [`docs/sentratorium/`](../../../docs/sentratorium/)
— **bukan** `docs/sentrarorium` (typo). Aturan:
[`.cursor/rules/sentratorium-hq-mandatory.mdc`](../../../.cursor/rules/sentratorium-hq-mandatory.mdc).

Setelah setiap sesi yang mengubah kode, konfigurasi build, skema, atau tes (atau
artefak merge), wajib mencatat **hasil coding dan progres per paket**
(dashboard, website, atau area lain di folder ini):

1. [`latest.md`](../../../docs/sentratorium/latest.md)
2. [`AGENT_SESSION_LOG.md`](../../../docs/sentratorium/AGENT_SESSION_LOG.md) —
   satu baris, format pipa
3. Sesi besar (opsional): [`README.md`](../../../docs/sentratorium/README.md) —
   struktur `sessions/`

### Indeks folder `apps/healthcare` (path absolut, Windows)

| Area                          | Path                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| Healthcare domain             | `D:\Devop\abyss-monorepo\apps\healthcare`                              |
| Primary healthcare (umbrella) | `D:\Devop\abyss-monorepo\apps\healthcare\primary-healthcare`           |
| Puskesmas dashboard           | `D:\Devop\abyss-monorepo\apps\healthcare\primary-healthcare\dashboard` |
| Puskesmas website             | `D:\Devop\abyss-monorepo\apps\healthcare\primary-healthcare\website`   |
| ReferraLink                   | `D:\Devop\abyss-monorepo\apps\healthcare\referralink`                  |
| Sentra Assist                 | `D:\Devop\abyss-monorepo\apps\healthcare\sentra-assist`                |

---

_Designed and constructed by Claudesy. Sentra Healthcare Artificial
Intelligence._
