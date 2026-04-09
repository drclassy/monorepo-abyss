# CLAUDE.md — Primary Healthcare (PKM Dashboard)

> **App:** Puskesmas Intelligence Dashboard
> **Repo:** Claudesy/intelligence-dashboard
> **Parent Monorepo:** abyss-monorepo (read root `CLAUDE.md` for full context)
> **Status:** Active development — Beta trial phase
> **Deploy:** Railway (production) + Vercel (preview)

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

## What This App Does

AI-powered dashboard for Puskesmas (Indonesian community health centers). Provides clinical decision support, patient management, analytics, and intelligent workflows for frontline healthcare workers — doctors, nurses, registrars, and administrators.

**Users:** Puskesmas staff with varying tech literacy, potentially older hardware, and intermittent internet connectivity.

---

## App-Specific Stack Additions

| Addition | Purpose |
|---|---|
| Audrey Voice Hook | STT anamnesis (speech-to-text for patient interviews) |
| ICD-10 e-klaim | Diagnosis coding integration for Indonesian health insurance claims |
| Clinical autocomplete | Diagnosis/medication search with alias support |

---

## Current Priorities (Check Sentratorium for Latest)

1. **ICD-10 e-klaim integration** — diagnosis coding for insurance claims
2. **Audrey Voice Hook** — STT anamnesis feature
3. **Autocomplete bug fix** — non-alias words not completing correctly
4. **Dashboard analytics** — patient flow metrics and insights

---

## App Structure

```
app/primary-healthcare/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes
│   │   ├── (dashboard)/        # Main dashboard routes
│   │   │   ├── patients/       # Patient management
│   │   │   ├── appointments/   # Scheduling
│   │   │   ├── diagnosis/      # Clinical diagnosis support
│   │   │   ├── referrals/      # Referral management
│   │   │   └── analytics/      # Dashboard analytics
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # App-specific UI extensions
│   │   ├── forms/              # Clinical forms
│   │   ├── features/           # Feature components
│   │   │   ├── patient/        # Patient-related components
│   │   │   ├── diagnosis/      # Diagnosis components
│   │   │   ├── audrey/         # Voice AI components
│   │   │   └── analytics/      # Dashboard components
│   │   └── layouts/
│   ├── lib/
│   │   ├── api/                # API client
│   │   ├── hooks/              # Custom hooks (useAudrey, useICD10, etc.)
│   │   ├── stores/             # Zustand stores
│   │   └── utils/              # Clinical utilities
│   ├── types/                  # App-specific types
│   └── env.mjs                 # Zod-validated env vars
├── prisma/                     # Database schema
├── tests/
└── public/
```

---

## Commands

```bash
# From monorepo root:
pnpm dev --filter=primary-healthcare
pnpm build --filter=primary-healthcare
pnpm test --filter=primary-healthcare
pnpm typecheck --filter=primary-healthcare

# Database (if app has local Prisma):
pnpm --filter=primary-healthcare db:generate
pnpm --filter=primary-healthcare db:migrate --name={description}
```

---

## Clinical-Specific Rules for This App

1. **ICD-10 codes must map to official WHO ICD-10 2019 revision.** Never fabricate codes.
2. **e-klaim integration** must follow BPJS Kesehatan format specifications.
3. **Audrey STT** transcripts are treated as clinical data — same PHI protections apply.
4. **Autocomplete suggestions** must be medically accurate. Don't suggest random completions for diagnosis fields.
5. **Patient data is always confidential.** Even in dashboards, aggregate when possible. Never display patient lists without auth.
6. **Offline capability** — design for intermittent connectivity. Cache critical data. Queue mutations for sync.

---

## Known Technical Debt

- Autocomplete uses a custom implementation; evaluate switching to Cmdk or similar
- Some components still use hardcoded colors instead of design tokens
- Test coverage for clinical logic modules needs improvement (target: 95%)
- Audrey voice integration is POC stage — needs production hardening

---

## Integration Points

- **@repo/types** — Patient, Diagnosis, Appointment, Referral schemas
- **@repo/ui** — Shared design system components
- **platform/clinical/** — ICD-10 lookup, drug interaction checks
- **platform/audrey/** — Voice AI / STT service
- **platform/guardrails/** — Clinical safety validation layer

---

## Read Root CLAUDE.md

This file supplements the root monorepo `CLAUDE.md`. All core rules (Sentratorium protocol, code standards, governance gates, design tokens, prohibitions) are defined there and apply here.
