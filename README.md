# 🌐 THE ABYSS

**AI-Native Monorepo for Sentra AI Ecosystem**

[![CI](https://img.shields.io/github/actions/workflow/status/Claudesy/abyss-monorepo/ci.yml?branch=main)](https://github.com/Claudesy/abyss-monorepo/actions)
[![License](https://img.shields.io/badge/license-UNLICENSED-red)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-yellow)](https://pnpm.io)

---

## 🎯 OVERVIEW

**The Abyss** adalah monorepo AI-native yang dibangun dengan prinsip:

- **AI-Native** — Terintegrasi dengan Langflow untuk orkestrasi AI
- **Claudesy Workflow** — HANDOFF.md, GO-Gate, Traceability
- **Modular Monolith** — Domain isolation dengan shared packages
- **Production-Ready** — CI/CD GO-Gated, Docker, Kubernetes

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    THE ABYSS MONOREPO                        │
├─────────────────────────────────────────────────────────────┤
│  .agents/          │ AI Steering & Governance               │
│  .github/          │ CI/CD & Automation                      │
│  apps/             │ Deployable Applications                 │
│    ├── healthcare  │ ReferraLink, AADI Service               │
│    ├── academic    │ Clinical Simulator, Evaluation Engine   │
│    ├── internal    │ Admin Dashboard, Design System          │
│    ├── incubator   │ R&D Sandbox                             │
│    └── orchestrator│ Langflow Gateway                        │
│  flows/            │ Langflow Definitions                    │
│  packages/         │ Shared Libraries                        │
│    ├── ui          │ Design System (Shadcn UI)               │
│    ├── database    │ Prisma Schema & Client                  │
│    ├── ai-core     │ Multi-Model Consensus                   │
│    ├── langflow-client │ Langflow SDK                        │
│    ├── fhir-engine │ FHIR R4 Validation                      │
│    ├── vector-store│ RAGOps & Vector Search                  │
│    └── iskandar-gatekeeper │ GO-Gate Validator              │
│  tooling/          │ Developer Tools                         │
│    └── abyss-cli   │ Internal CLI                            │
│  infrastructure/   │ IaC (Terraform, ArgoCD, Docker)         │
│  docs/             │ Documentation & Session Logs            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 QUICK START

### Prerequisites

- **Node.js** >= 22.0.0
- **pnpm** >= 9.0.0
- **Git** >= 2.40.0
- **Docker** (optional, for local development)

### Installation

```bash
# Clone repository
git clone https://github.com/Claudesy/abyss-monorepo.git
cd abyss-monorepo

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Start local development
pnpm dev
```

### Local Development with Docker

```bash
# Start PostgreSQL, Langflow, Redis
cd infrastructure/docker
docker-compose up -d
```

---

## 📦 AVAILABLE COMMANDS

### Root Commands

```bash
pnpm build          # Build all packages and apps
pnpm dev            # Start all apps in development mode
pnpm lint           # Lint all packages and apps
pnpm test           # Run tests
pnpm format         # Format code with Prettier
pnpm typecheck      # TypeScript type checking
pnpm graph          # Generate dependency graph
```

### Abyss CLI

```bash
pnpm abyss init-task "My Task"     # Create new task session
pnpm abyss go <session-path>       # Add GO approval
pnpm abyss sync-flow <flow.json>   # Sync Langflow definition
pnpm abyss create app my-app       # Create new application
pnpm abyss status                  # Check monorepo health
```

### Database Commands

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
```

---

## 🛡️ CLAUDESY WORKFLOW

### 1. HANDOFF FIRST

Dilarang coding tanpa `HANDOFF.md`:

```bash
pnpm abyss init-task "Implement FHIR validation"
```

### 2. GO-GATE

Eksekusi hanya setelah ada `✅ GO`:

```bash
pnpm abyss go .agent/sessions/SESSION-... --by "Chief"
```

### 3. TRACEABILITY

Commit dengan trailer:

```git
feat: implement FHIR validation

- Add FHIR R4 schema validation
- Integrate with referralink-api

Agent: coder-agent
Phase: 3
Handoff: .agent/sessions/SESSION-.../HANDOFF.md
```

---

## 📁 PROJECT STRUCTURE

### Apps (Deployable Applications)

| App | Domain | Description |
|-----|--------|-------------|
| `referralink-api` | Healthcare | Sistem Rujukan AI |
| `aadi-service` | Healthcare | Diagnostic Orchestration |
| `clinical-simulator` | Academic | Simulator Medis |
| `evaluation-engine` | Academic | AI Evaluation |
| `admin-dashboard` | Internal | Admin Panel |
| `orchestrator` | AI | Langflow Gateway |

### Packages (Shared Libraries)

| Package | Description |
|---------|-------------|
| `@the-abyss/ui` | Design System (Shadcn UI) |
| `@the-abyss/database` | Prisma ORM & Schema |
| `@the-abyss/ai-core` | Multi-Model Consensus |
| `@the-abyss/langflow-client` | Langflow SDK |
| `@the-abyss/fhir-engine` | FHIR R4 Validation |
| `@the-abyss/vector-store` | Vector Search (RAG) |
| `@the-abyss/iskandar-gatekeeper` | GO-Gate Validator |
| `@the-abyss/shared-types` | Shared TypeScript Types |

---

## 🔧 TECHNOLOGY STACK

### Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 22.x | Runtime |
| **pnpm** | 9.x | Package Manager |
| **Turborepo** | 2.x | Build System |
| **TypeScript** | 5.7.x | Language |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | Framework |
| **React** | 19.x | UI Library |
| **Tailwind CSS** | 3.4.x | Styling |
| **Shadcn UI** | Latest | Components |

### Backend & AI

| Technology | Version | Purpose |
|------------|---------|---------|
| **Prisma** | 6.x | ORM |
| **Langflow** | Latest | AI Orchestration |
| **PostgreSQL** | 16.x | Database |
| **Redis** | 7.x | Cache |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Terraform** | IaC |
| **ArgoCD** | GitOps |
| **GitHub Actions** | CI/CD |

---

## 📚 DOCUMENTATION

- **[.agent/CONTEXT.md](.agent/CONTEXT.md)** — Agent Context
- **[.agent/PROGRESS.md](.agent/PROGRESS.md)** — Progress Tracking
- **[.agent/HANDOFF.md](.agent/HANDOFF.md)** — Session Handoffs
- **[.agent/DECISIONS.md](.agent/DECISIONS.md)** — Architecture Decisions
- **[.agent/LESSONS.md](.agent/LESSONS.md)** — Lessons Learned
- **[docs/templates/](docs/templates/)** — Document Templates
- **[docs/adr/](docs/adr/)** — Architecture Decision Records
- **[tooling/abyss-cli/](tooling/abyss-cli/)** — CLI Documentation

---

## 🔐 SECURITY

### GO-Gate CI/CD

Semua deployment WAJIB melalui GO-Gate:

1. ✅ HANDOFF.md created
2. ✅ GO approval from Chief
3. ✅ CI/CD tests passed
4. ✅ Security scan passed

### Compliance

- **Healthcare:** HIPAA, FHIR R4
- **Academic:** Data Privacy
- **General:** OWASP Top 10

---

## 🤝 CONTRIBUTING

### For AI Agents

1. Read [.agents/AGENTS.md](.agents/AGENTS.md)
2. Create HANDOFF.md via `pnpm abyss init-task`
3. Wait for GO approval
4. Implement with traceability
5. Run tests and verification

### For Humans

1. Fork repository
2. Create branch (`feature/my-feature`)
3. Make changes with HANDOFF.md
4. Submit Pull Request

---

## 👥 TEAM

- **CEO:** Dr. Ferdi Iskandar (Claudesy)
- **Company:** Sentra Artificial Intelligence
- **Location:** Surabaya, Indonesia (WIB/UTC+7)

---

## 📄 LICENSE

**UNLICENSED** — Proprietary software. All rights reserved.

---

## 🚀 ROADMAP

### Q2 2026

- [ ] ReferraLink API Production Launch
- [ ] Clinical Simulator Beta
- [ ] Multi-Model Consensus Integration
- [ ] RAGOps Pipeline

### Q3 2026

- [ ] Edge AI Prototype
- [ ] Kubernetes Deployment
- [ ] Advanced Monitoring Dashboard
- [ ] Mobile App (React Native)

---

**Last Updated:** 2026-03-30  
**Version:** 0.0.1

---

© 2026 Sentra Artificial Intelligence
