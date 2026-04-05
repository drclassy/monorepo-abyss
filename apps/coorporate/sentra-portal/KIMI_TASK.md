# KIMI TASK — Sentra Portal
## Complete Build Instructions for Kimi AI
**Repo:** abyss-v3 · **App:** `app/sentra-portal`
**Issued by:** Chief (Dr. Ferdi Iskandar) via Claudesy
**Date:** 2026-03-16

---

## 1. WHAT IS SENTRA PORTAL?

Sentra Portal is the **internal command center** for Sentra Healthcare AI.
It is NOT a patient-facing app. It is Chief's operational dashboard — a single place to:

- Monitor all Sentra services and apps (primary-healthcare, sentra-assist, referralink, etc.)
- View agent activity logs (Cognitorium logbook)
- Browse and query the local SQLite operational database
- Visualize agent orchestration flows (Flow Canvas)
- Control and manage running services
- Track active projects and their status
- Manage team/agent coordination

Think of it as **Mission Control** for The Abyss monorepo.

---

## 2. CURRENT STATE (What Already Exists)

### Stack
```
Next.js     15.2.6
React       19
TypeScript  strict
Tailwind    v3 (with CSS variables)
shadcn/ui   FULL install (all Radix UI components)
Database    better-sqlite3 (local SQLite — no external DB)
Output      standalone (Railway deploy)
```

### Folder Structure
```
app/sentra-portal/
├── app/                    ← Next.js App Router
│   ├── api/
│   │   ├── database/       ← SQLite API routes (EXISTS)
│   │   ├── health/         ← Health check (EXISTS)
│   │   ├── projects/       ← Projects API (EXISTS)
│   │   └── services/       ← Services API (EXISTS)
│   ├── database/           ← Database page (STUB)
│   ├── emails/             ← Agent Logbooks page (STUB)
│   ├── projects/           ← Projects page (STUB)
│   ├── reports/            ← Active Projects page (STUB)
│   ├── services/           ← Services page (STUB)
│   ├── sources/            ← Cognitorium page (STUB)
│   ├── users/              ← Agent Coordination page (STUB)
│   ├── layout.tsx          ← Root layout with Sidebar (EXISTS ✅)
│   └── page.tsx            ← Dashboard home (EXISTS ✅)
├── components/
│   ├── ui/                 ← shadcn/ui components (EXISTS ✅)
│   ├── sidebar.tsx         ← Main navigation (EXISTS ✅)
│   ├── dashboard-header.tsx    ← Header (EXISTS ✅)
│   ├── metrics-cards.tsx       ← KPI cards (EXISTS ✅)
│   ├── simple-charts-grid.tsx  ← Charts section (EXISTS ✅)
│   ├── recent-data-table.tsx   ← Data table (EXISTS ✅)
│   ├── email-logs-card.tsx     ← Log viewer (EXISTS ✅)
│   ├── flow-canvas.tsx         ← Agent flow visualizer (EXISTS ✅ 39KB!)
│   ├── database-browser.tsx    ← SQLite browser (EXISTS ✅ 15.6KB)
│   ├── server-control-card.tsx ← Service control (EXISTS ✅ 11.9KB)
│   ├── service-card.tsx        ← Service card (EXISTS ✅)
│   └── service-catalog.tsx     ← Service list (EXISTS ✅)
├── .sentra/
│   ├── data/               ← Local operational data
│   ├── logs/               ← Agent log files
│   └── projects/           ← Project state files
```

### Current Navigation (sidebar.tsx)
```
Command Center:
  / .................... Dashboard (page.tsx EXISTS)
  /projects ............ Projects (STUB)
  /services ............ Services (STUB)
  /sources ............. Cognitorium (STUB)
  /database ............ Database (STUB)
  /emails .............. Agent Logbooks (STUB)
  /reports ............. Active Projects (STUB)

System Control:
  /users ............... Agent Coordination (STUB)
  /integrations ........ Memory Nodes (STUB)
  /settings ............ Core Settings (STUB)
```

---

## 3. YOUR TASK — What Kimi Must Build

### Priority 1 (Build these first):

#### A. `/services` page — Service Catalog & Control
Wire up `service-catalog.tsx` and `server-control-card.tsx` into a full page.
- Show all Sentra services: primary-healthcare, sentra-assist, referralink, sentra-portal
- Each service card shows: name, status (online/offline/deploying), URL, last deploy time, health check result
- "Start / Stop / Restart" controls per service
- API: `GET /api/services` → list all services with status
- API: `POST /api/services/[id]/action` → trigger start/stop/restart

#### B. `/database` page — SQLite Browser
Wire up `database-browser.tsx` and `sql-editor.tsx` into a full page.
- List all SQLite tables in `.sentra/data/` directory
- Click table → view rows with pagination
- SQL editor panel: write and run custom queries
- API: `GET /api/database/tables` → list tables
- API: `POST /api/database/query` → run SQL, return results
- Safety: block DROP, DELETE without confirmation modal

#### C. `/projects` page — Project Tracker
- List all active Sentra projects from `.sentra/projects/` directory
- Each project: name, phase (1-7 genesis phases), status, last activity, assigned agents
- Filter by phase, status
- API: `GET /api/projects` → list projects with metadata

#### D. `/sources` page — Cognitorium Viewer
- Read and display logs from `docs/cognitorium/logs/` (relative to monorepo root)
- OR from `.sentra/logs/` for portal-local logs
- List log entries newest-first
- Click entry → full markdown rendered view
- Search/filter by date, phase, agent

### Priority 2 (Build after Priority 1):

#### E. `/emails` page — Agent Logbooks
- Display agent activity log entries
- Filter by agent name (claude-code, cursor, kilocode, taskmaster, jules)
- Timeline view preferred

#### F. `/reports` page — Active Projects Report
- Summary dashboard: how many projects per phase, how many blocked, how many complete
- Simple charts using recharts (already installed)

#### G. `/users` page — Agent Coordination
- Roster of all AI agents (from AGENTS.md)
- Current status, last action, permitted/prohibited operations

#### H. `/settings` page — Core Settings
- Portal configuration (theme, data paths)
- Connection status for external services
- Missing inputs tracker (pulled from `ci/missing-inputs.md`)

---

## 4. SENTRA DESIGN SYSTEM — MANDATORY

### Color Tokens (apply to CSS variables in globals.css)
```css
/* Sentra Design Tokens — Deep Abyss */
--sentra-bg:        #0d0d0d;    /* Deep background */
--sentra-fg:        #b7ab98;    /* Warm foreground */
--sentra-accent:    #eb5939;    /* Sentra red/orange — CTAs, active states */
--sentra-amber:     #C4956A;    /* Audrey amber — secondary highlights */
--sentra-teal:      #6B9B8A;    /* Cognitorium teal — status indicators */
--sentra-muted:     #3d3d3a;    /* Muted surfaces */
--sentra-border:    rgba(183,171,152,0.12); /* Subtle borders */
```

### Typography
```
Primary:   Plus Jakarta Sans (import from Google Fonts)
Secondary: Inter (already in layout)
Mono:      IBM Plex Mono (for code/SQL/logs)
```

### Design Principles
1. **Dark-first** — background is near-black (`#0d0d0d`), not pure black
2. **Warm neutrals** — use `#b7ab98` family, not cold grays
3. **Accent sparingly** — `#eb5939` only for active states, CTAs, critical alerts
4. **Teal for status** — online/active = teal, not generic green
5. **High information density** — this is an ops dashboard, not a marketing page
6. **No rounded pill buttons** — use `rounded-md` max for controls
7. **Monospace for data** — all IDs, hashes, timestamps, SQL use IBM Plex Mono

### Current Tailwind Config Note
Tailwind v3 is installed. Use standard Tailwind utility classes.
The shadcn/ui CSS variables are already in `globals.css` — extend them, don't replace.

---

## 5. TECHNICAL RULES

### Must Follow
1. **TypeScript strict** — no `any`, use proper types
2. **Server Components by default** — only add `'use client'` when needed (interactivity)
3. **API routes in `/app/api/`** — follow existing pattern
4. **SQLite via better-sqlite3** — already installed, use for all local data
5. **No external DB** — this portal is standalone, SQLite only
6. **shadcn/ui components** — use existing `components/ui/` first before writing custom UI
7. **Recharts** for all charts — already installed
8. **Lucide-react** for all icons — already installed

### File Naming
```
app/[route]/page.tsx         ← page component (Server Component)
app/[route]/layout.tsx       ← optional layout
app/api/[route]/route.ts     ← API route handler
components/[name].tsx        ← shared component
```

### Attribution (Mandatory on every new file)
Every new file must contain this attribution in a comment:
```typescript
// Architected and built by Claudesy.
```
For JSON files: `"_attribution": "Architected and built by Claudesy."`

---

## 6. WHAT NOT TO DO

- Do NOT change `layout.tsx` — sidebar and root structure is final
- Do NOT remove any existing component — extend, don't replace
- Do NOT add new npm packages without checking if equivalent exists in `package.json`
- Do NOT use `any` type
- Do NOT create separate CSS files — use Tailwind classes + CSS variables
- Do NOT hardcode URLs — use environment variables or config
- Do NOT expose `.sentra/` data externally — API routes only, no direct file access from client
- Do NOT add authentication — this portal is internal/local only (no public access)

---

## 7. ENVIRONMENT & RUNNING

```bash
# Install dependencies
cd app/sentra-portal
npm install   # or pnpm install

# Run dev server
npm run dev   # runs on localhost:3000

# Build for production
npm run build
npm start

# TypeCheck
npm run typecheck
```

No `.env` required for basic operation — SQLite is file-based.
If connecting to external services, add to `.env.local` (never commit).

---

## 8. ABYSS MONOREPO CONTEXT

This portal (`app/sentra-portal`) lives inside the Abyss monorepo:
```
D:\Devops\abyss-monorepo\
├── app/sentra-portal/    ← YOU ARE HERE
├── app/primary-healthcare/   ← Main clinical app (PKM Dashboard)
├── app/sentra-assist/    ← Chrome Extension (AADI)
├── platform/             ← Shared AI platform modules (stubs)
├── packages/             ← Shared UI, types, utils
├── governance/           ← OPA policies, gates, contracts
└── docs/cognitorium/     ← Knowledge governance logs
```

The portal may need to READ from monorepo-level directories:
- `docs/cognitorium/logs/` — for Cognitorium viewer
- `ci/missing-inputs.md` — for Settings page blockers view
- `genesis/01-oracle-chamber/project_spec_doc.md` — for project context

Use `path.resolve(process.cwd(), '../../docs/cognitorium/logs')` to navigate from portal root to monorepo root.

---

## 9. SUCCESS CRITERIA

Kimi's work is complete when:
- [ ] All 10 navigation routes render without 404 or error
- [ ] `/services` shows real service cards with mock or real status
- [ ] `/database` has working SQLite table browser + SQL editor
- [ ] `/projects` lists projects from `.sentra/projects/` or mock data
- [ ] `/sources` renders Cognitorium log entries
- [ ] All new components use Sentra design tokens (dark theme, warm palette)
- [ ] TypeScript passes `npm run typecheck` with zero errors
- [ ] Every new file has Claudesy attribution comment
- [ ] No `any` types in new code

---

## 10. QUESTIONS / BLOCKERS

If Kimi is blocked on anything, document it in:
`app/sentra-portal/KIMI_BLOCKERS.md`

Format:
```markdown
## [Date] — [Blocker title]
**Issue:** What is blocked
**Attempted:** What was tried
**Needs from Chief:** What decision is needed
```

---

*Architected and built by Claudesy — 2026 · Sentra Healthcare Artificial Intelligence*
*This file is the single source of truth for Kimi's build task on sentra-portal.*
