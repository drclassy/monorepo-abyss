# Sentra Portal - Project Memory

**Last Updated:** 2026-03-16
**Status:** 4 Sprints Complete, Dark Theme Applied

---

## ✅ COMPLETED SPRINTS

### Sprint A: Service Manager ✅

- Docker lifecycle management (`lib/docker-manager.ts`)
- 6 one-click services (PostgreSQL, MySQL, Redis, MongoDB, Mailpit, RabbitMQ)
- REST API + SSE logs streaming (`/api/services/*`)
- ServiceCard + ServiceCatalog UI components
- Auto-generated credentials with random passwords
- Health checks and admin UI links

**Files:**

- `lib/docker-manager.ts`
- `app/api/services/*`
- `components/service-card.tsx`
- `components/service-catalog.tsx`

---

### Sprint B: Database GUI ✅

- SQL Editor with query execution
- Database Browser with table/schema navigation
- Connection manager (pg/mysql2/mongodb drivers)
- Export functionality (CSV/JSON)
- API routes: `/api/database/connections/*`, `/query`, `/schema`, `/data`, `/export`

**Files:**

- `lib/connection-manager.ts`
- `lib/database-manager.ts`
- `components/sql-editor.tsx`
- `components/database-browser.tsx`
- `app/database/*`
- `types/database.ts`

---

### Sprint C: Tunnel Plugin ✅

- Localtunnel integration for public URLs
- Auto-restart on disconnect (max 3 attempts)
- Port availability validation
- Real-time logs viewer
- Bulk operations (start/stop/delete)
- API routes: `/api/tunnels/*`, `/validate`, `/bulk`, `/:id/logs`

**Files:**

- `lib/tunnel-manager.ts`
- `components/tunnel-card.tsx`
- `components/tunnel-logs-modal.tsx`
- `app/tunnels/*`
- `types/tunnel.ts`

---

### Sprint D: Environment Vault ✅

- AES-256-GCM encryption for secrets
- PBKDF2 key derivation (100k iterations)
- Project-based env management
- Master password protection
- Import/Export functionality
- API routes: `/api/vault/*`

**Files:**

- `lib/encryption-manager.ts`
- `lib/env-vault-manager.ts`
- `components/env-variable-card.tsx`
- `components/vault-unlock-dialog.tsx`
- `app/vault/*`
- `types/vault.ts`

---

## 🎨 DESIGN SYSTEM - DARK THEME

### Color Palette (Ghost-Extract Tokens from diagnostics/ghost-extract-test/assets)

```
Page Background:    bg-surface-page       (--surface-page #1e1e21, matches ghost-extract body)
Card/Panel/Input:  bg-surface-primary   (--surface-primary #1a1b1c)
Card Background:    bg-surface-secondary  (--surface-secondary #22222a)
Card Border:        border-sentra-border-medium
Hover State:        hover:bg-surface-hover
Primary Text:       text-sentra-text-primary   (#f8f4e8)
Secondary Text:     text-sentra-text-secondary (#b8b8be)
Muted Text:         text-sentra-text-muted    (#5a5a62)
Accent:             sentra-accent (#ff4500)
```

### Component Styles

```
Buttons:    bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary
Inputs:     bg-surface-primary border-sentra-border-medium text-sentra-text-primary
Badges:     bg-surface-tertiary text-sentra-text-secondary border-sentra-border-strong
Cards:      bg-surface-secondary border-sentra-border-medium shadow-none
```

### Applied To All Pages:

- ✅ Dashboard (`app/page.tsx`)
- ✅ Projects (`app/projects/page.tsx`)
- ✅ Services (`app/services/page.tsx`)
- ✅ Database (`app/database/*`)
- ✅ Tunnels (`app/tunnels/*`)
- ✅ Vault (`app/vault/*`)
- ✅ Settings (`app/settings/page.tsx`)
- ✅ Layout (`app/layout.tsx`)
- ✅ Sidebar (`components/sidebar.tsx`)

---

## 📁 PROJECT STRUCTURE

```
app/sentra-portal/
├── app/
│   ├── api/
│   │   ├── database/*      # Database connections, query, schema
│   │   ├── projects/*      # Project CRUD
│   │   ├── services/*      # Docker services
│   │   ├── tunnels/*       # Tunnel management
│   │   └── vault/*         # Environment vault
│   ├── database/           # Database GUI page
│   ├── projects/           # Projects management
│   ├── services/           # Services catalog
│   ├── tunnels/            # Tunnel management
│   ├── vault/              # Environment vault
│   ├── settings/           # Settings page
│   ├── layout.tsx          # Root layout (dark theme)
│   └── page.tsx            # Dashboard (w/ 2 charts)
├── components/
│   ├── ui/*                # shadcn/ui components
│   ├── sidebar.tsx         # Navigation sidebar (dark)
│   ├── database-browser.tsx
│   ├── sql-editor.tsx
│   ├── service-card.tsx
│   ├── service-catalog.tsx
│   ├── tunnel-card.tsx
│   ├── tunnel-logs-modal.tsx
│   ├── env-variable-card.tsx
│   ├── vault-unlock-dialog.tsx
│   └── server-control-card.tsx
├── lib/
│   ├── db.ts               # SQLite database
│   ├── docker-manager.ts   # Docker integration
│   ├── connection-manager.ts
│   ├── database-manager.ts
│   ├── tunnel-manager.ts   # Localtunnel integration
│   ├── encryption-manager.ts
│   ├── env-vault-manager.ts
│   └── process-manager.ts
├── types/
│   ├── index.ts
│   ├── services.ts
│   ├── database.ts
│   ├── tunnel.ts
│   └── vault.ts
└── .sentra/                # Local data directory
    ├── data/
    ├── logs/
    └── projects/
```

---

## 🚀 HOW TO RUN

```bash
cd app/sentra-portal
npm install
npm run dev
```

Access at: http://localhost:3000

---

## 📊 DASHBOARD FEATURES

### Metrics Cards (Real-time)

- Total Projects (with active count)
- Docker Services (with running count)
- Active Tunnels (with total count)
- Environment Vault status

### Charts

1. **Activity Overview** - AreaChart (24h activity)
2. **Resources Distribution** - BarChart (Projects/Services/Tunnels)

### Sections

- Recent Projects list (5 items)
- Quick Actions panel
- System Status

---

## ⚠️ KNOWN ISSUES

1. **Windows Build:** EPERM on 'Application Data' junction points
   - **Workaround:** Use `npm run dev` (dev mode works fine)
   - **Production:** Use WSL2 or Docker

2. **Context Window:** Monitor usage during development

---

## 🔌 API ENDPOINTS

### Projects

- `GET/POST /api/projects`
- `GET/DELETE /api/projects/:id`
- `POST /api/projects/:id/server/start`
- `POST /api/projects/:id/server/stop`

### Services

- `GET /api/services`
- `POST /api/services`
- `POST /api/services/:id/start`
- `POST /api/services/:id/stop`
- `DELETE /api/services/:id`
- `GET /api/services/:id/logs`

### Database

- `GET/POST /api/database/connections`
- `POST /api/database/connections/test`
- `POST /api/database/query`
- `GET /api/database/schema`
- `GET /api/database/data`

### Tunnels

- `GET/POST /api/tunnels`
- `PATCH/DELETE /api/tunnels/:id`
- `POST /api/tunnels/validate`
- `POST /api/tunnels/bulk`
- `GET /api/tunnels/:id/logs`

### Vault

- `GET /api/vault/status`
- `POST /api/vault/unlock`
- `GET/POST /api/vault/projects/:id/env`
- `GET/DELETE /api/vault/env/:id`
- `POST /api/vault/projects/:id/env/import`
- `GET /api/vault/projects/:id/env/export`

---

## 🎯 NEXT STEPS (For Claude)

1. **Wire up remaining stub pages:**
   - `/sources` (Cognitorium log viewer)
   - `/emails` (Agent logbooks)
   - `/reports` (Project charts)
   - `/users` (Agent coordination)

2. **Enhance existing features:**
   - Add more chart types to Dashboard
   - Implement search/filter functionality
   - Add pagination for large lists

3. **Polish:**
   - Add loading skeletons
   - Error boundaries
   - Toast notifications

---

_Architected and built by Claudesy — Sentra Healthcare AI_
