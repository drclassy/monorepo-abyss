
> Historical note: blueprint ini tetap dipertahankan sebagai referensi bentuk infrastruktur, tetapi nama package di bawah sudah dinormalisasi ke taxonomy repo aktif per Mei 2026.

```
├── the-abyss/
├── ├── .agents/ # 🧠 STRATUM AGEN (Hierarchical Steering)
├── │ ├── skills/ # Skill modular (e.g., db-migration, fhir-validator)
├── │ ├── prompts/ # Library System Prompts untuk Swarm (Planner, Reviewer)
├── │ ├── AGENTS.md # Global Router & Aturan Classy Workflow
├── │ └── MCP-CONFIG.json # Konfigurasi Model Context Protocol untuk Nx/Turbo
├── │
├── ├── .github/ # 🛡️ GOVERNANCE & AUTOMATION
├── │ ├── workflows/ # CI/CD (Turbo affected, GO-Gated verification)
├── │ └── CODEOWNERS # Kontrol akses domain-specific
├── │
├── ├── apps/ # 🚀 DEPLOYABLE APPLICATIONS (Modular Monoliths)
├── │ ├── 🏥 healthcare/ # Konsentrasi Layanan Kesehatan (Strict Compliance)
├── │ │   ├── referralink-api/ # Backend NestJS/Python
├── │ │   ├── aadi-service/ # Diagnostic Orchestration Engine
├── │ │   └── AGENTS.md # Aturan lokal: HIPAA, FHIR R4, Audit Trail
├── │ ├── 🎓 academic/ # Konsentrasi Edukasi & Simulasi
├── │ │   ├── clinical-simulator/ # Frontend (Next.js)
├── │ │   └── evaluation-engine/ # AI untuk penilaian jalur klinis
├── │ ├── 🧪 incubator/ # Sandbox R&D (High Velocity)
├── │ │   ├── edge-ai-prototype/ # Contoh/proposal incubator; tidak terkonfirmasi di checkout aktif
├── │ │   └── AGENTS.md # Aturan lokal: Minimal testing, rapid prototyping
├── │ ├── 🛠️ internal/ # Corporate & Operational Tools
├── │ │   ├── agent-sessions-web/ # NEW Dashboard Monitoring Agent Swarm & Logs
├── │ │   └── design-system-docs/ # Dokumentasi UI/UX (Storybook/Astro)
├── │ └── 🌊 orchestrator/ # NEW Langflow API Gateway & Shadow Mode
├── │
├── ├── flows/ # 🎨 LANGFLOW ORCHESTRATION CENTER
├── │ ├── definitions/ # File JSON hasil ekspor Langflow (Version Controlled)
├── │ │   ├── diagnosis-flow.json
├── │ │   └── rag-ingestion.json
├── │ ├── components/ # Custom Python/JS Nodes untuk Langflow
├── │ └── tests/ # Evaluasi akurasi Flow AI (Promptfoo/Ragas)
├── │
├── ├── packages/ # 🏗️ THE REUSABLE SUBSTRATE (Shared Libraries)
├── │ ├── shared/sentra-ui/ # Design System (Tailwind 4, Shadcn UI)
├── │ ├── sentra/sentra-nada/ # Canonical clinical engine & safety orchestration
├── │ ├── platform/langflow-client/ # SDK internal untuk integrasi apps -> Langflow
├── │ ├── platform/database/ # Prisma/Drizzle schemas & persistence substrate
├── │ ├── sentra/sentra-sandi/ # Logika validasi data medis HL7 FHIR
├── │ ├── library/iskandar-gatekeeper/ # Automated governance & GO-Gate validator
├── │ ├── sentra/sentra-cermin/ # RAGOps vector index & embedding management
├── │ └── shared/shared-types/ # Definisi TypeScript global (contract-first)
├── │
├── ├── infrastructure/ # ☁️ INFRASTRUCTURE AS CODE (IaC)
├── │ ├── terraform/ # Cloud Provisioning (GPU Clusters, DBs)
├── │ ├── argocd/ # GitOps: Kubernetes manifests (Base, Staging, Prod)
├── │ └── docker/ # Standardized Multi-stage Dockerfiles
├── │
├── ├── tooling/ # 🔧 DEVELOPER EXPERIENCE & AUTOMATION
├── │ ├── abyss-cli/ # NEW CLI Internal: abyss handoff, abyss sync-flow
├── │ └── generators/ # Plop/Hygen templates untuk app/package baru
├── │
├── ├── docs/ # 📚 KNOWLEDGE BASE & AUDIT TRAIL
├── │ ├── adr/ # Architecture Decision Records
├── │ └── .agent/ # Governance state and optional local agent session notes
├── │
├── ├── turbo.json # Konfigurasi Pipelines & Remote Caching
├── ├── pnpm-workspace.yaml # Definisi Workspace pnpm
├── ├── package.json # Root Dependencies & Scripts
└── └── README.md # Pintu gerbang dokumentasi "The Abyss"
```

```
The Abyss (Monorepo = Pabrik Digital)
├── Admin Dashboard (Chief memonitor semua)
│ ├── Project scaffolding
│ ├── Server monitoring
│ └── Regulations & governance
│
├── Product: Healthcare Solution → punya dashboard user sendiri
├── Product: Academic Solutions → punya dashboard user sendiri
├── Product: Mitra Design → punya dashboard user sendiri
└── Future products... → masing-masing independen
```

```
the-abyss/
├── .agents/ # AI Steering (Sesuai Blueprint PDF)
│ ├── AGENTS.md # Global Router (Classy Workflow & GO-Gate)
│ └── prompts/ # Koleksi System Prompts untuk Agent Swarm
│
├── .github/ # CI/CD & Governance
│ └── workflows/ # Turbo affected pipelines (Build, Test, Deploy)
│
├── apps/ # Deployable Services (Modular Monoliths)
│ ├── abyss-api/ # Backend utama (Node.js/Bun/Python)
│ ├── portal-web/ # Frontend (Next.js + Tailwind 4)
│ └── orchestrator/ # Langflow Deployment & Custom API Wrapper
│
├── flows/ # NEW Langflow Orchestration Center
│ ├── definitions/ # File JSON hasil ekspor dari Langflow
│ │   ├── clinical-diag.json # Alur diagnosa klinis
│ │   └── data-ingestion.json # Alur RAG & ingestion
│ ├── components/ # Custom Python/JS components untuk Langflow
│ └── scripts/ # Script untuk sinkronisasi flow via Langflow API
│
├── packages/ # The Reusable Substrate (Shared Packages)
│ ├── ui/ # Design System (Shadcn + Tailwind 4)
│ ├── langflow-client/ # SDK/Wrapper internal untuk panggil Langflow API
│ ├── database/ # Prisma/Drizzle schemas & migrations
│ ├── fhir-engine/ # Logika validasi data HL7 FHIR (Sesuai PDF)
│ ├── config-typescript/ # Shared TSConfig
│ └── config-eslint/ # Shared Linting (Strict boundary enforcement)
│
├── infrastructure/ # Infrastructure as Code (IaC)
│ ├── terraform/ # Provisioning GPU/Server untuk Langflow & App
│ ├── argocd/ # GitOps manifests (Base & Overlays)
│ └── docker/ # Multi-stage Dockerfiles (Context: Root)
│
├── tooling/ # Custom Scripts & Generators
│ └── handoff-validator/ # Script untuk validasi status HANDOFF.md
│
├── turbo.json # Konfigurasi Turborepo (Pipeline & Caching)
├── pnpm-workspace.yaml # Definisi workspace pnpm
├── pnpm-lock.yaml # Lockfile tunggal (Content-addressable)
└── package.json # Root scripts & devDependencies
```


```
the-abyss/
├── apps/
│ ├── 🏥 healthcare/ # Konsentrasi Layanan Kesehatan
│ │   ├── referralink-api/ # Proyek A: Sistem Rujukan AI
│ │   ├── aadi-service/ # Proyek B: Diagnosa Klinis
│ │   └── AGENTS.md # Aturan AI khusus domain medis (HIPAA, FHIR)
│ │
│ ├── 🎓 academic/ # Konsentrasi Edukasi/Akademik
│ │   ├── clinical-simulator/ # Proyek C: Simulator Medis
│ │   └── evaluation-engine/ # Proyek D: Analisis performa siswa
│ │
│ ├── 🛠️ internal/ # Proyek Internal & Tools Perusahaan
│ │   ├── admin-dashboard/ # Panel kontrol internal
│ │   └── design-system-docs/ # Dokumentasi UI/UX
│ │
│ └── 🧪 incubator/ # Tempat untuk R&D atau Proyek Baru (Sandbox)
│ ├── edge-ai-prototype/ # Contoh/proposal incubator untuk eksperimen AI lokal
│ └── AGENTS.md # Aturan AI yang lebih santai untuk eksperimen

```
