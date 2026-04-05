# Project Context: sentra-portal

> Dokumen ini adalah sumber kebenaran utama untuk agent. Jika ada konflik,
ikuti bagian `Agent Contract` dan `Decision Log`.

## 1. Ringkasan Project
- Nama project: sentra-portal
- ID project: sentra-marketing-portal
- Domain: Healthcare AI / Marketing & Public Portal
- Repo: D:\Devops\abyss-monorepo\app\sentra-portal
- Owner: Dr. Ferdi Iskandar (Chief)
- Status: active
- Last updated: 2026-04-01

## 2. Tujuan Utama
- Masalah yang diselesaikan: Kebutuhan akan wajah publik (marketing site) dan pintu masuk utama (portal) bagi ekosistem Sentra Healthcare AI.
- Outcome yang diharapkan: Situs web yang informatif, meyakinkan, dan berestetika tinggi untuk menarik partner dan klien.
- Definisi sukses: Interface yang elegan dengan skor Lighthouse tinggi dan konversi informasi yang efektif.
- Non-goals: Menjadi aplikasi transaksional medis (fokus pada informasi, portal, dan branding).

## 3. Agent Contract
### 3.1 Harus Dilakukan
- Selalu sapa user sebagai Boss atau Chief.
- Gunakan Next.js 15, React 19, dan TypeScript Strict Mode.
- Terapkan "Claudesy Design Philosophy": Premium, elegan, dan informatif.
- Pastikan semua konten publik selaras dengan visi AI Governance dan Privacy Sentra.

### 3.2 Jangan Dilakukan
- Jangan menggunakan asset visual berkualitas rendah atau desain yang "cluttered".
- Jangan mengubah struktur navigasi utama tanpa konfirmasi visual.
- Jangan mengabaikan optimasi SEO dan Metadata (penting untuk marketing).

### 3.3 Gaya Kerja
- Jawaban harus: Estetis, komunikatif, dan teknis (fokus pada frontend excellence).
- Saat ragu, agent harus: Mengacu pada guidelines di `docs/AI_GOVERNANCE.md` dan `docs/PRIVACY.md`.
- Jika ada konflik konteks, agent harus: Mengacu pada `MEMORY.md` dan `PROJECT_CONTEXT.md`.

### 3.4 Escalation Rules
- Escalate jika: Menemukan inkonsistensi pada pesan branding atau isu aksesibilitas.
- Jangan menebak jika: Terkait dengan detail kemitraan bisnis atau pricing (jika ada).
- Minta konfirmasi hanya jika: Melakukan perubahan besar pada Hero section atau skema warna.

## 4. Konteks Bisnis
- User utama: Calon Partner, Investor, Masyarakat Umum, Calon Karyawan.
- Use case utama: Product showcase, AI Governance transparency, Portal login gateway, Recruitment.
- Terminologi domain: Sentra Healthcare AI, AI Governance, Healthcare Ecosystem, Portal.
- Constraint bisnis: Harus menjaga citra profesional dan inovatif Sentra.
- Risiko bisnis: Misinformasi publik atau downtime saat kampanye marketing berjalan.

## 5. Konteks Teknis
- Stack: Next.js 15, React 19, Tailwind CSS, shadcn/ui.
- Arsitektur: Marketing-oriented Web Application.
- Service / module penting: `app/portal`, `components/marketing`, `lib/content`.
- Data flow ringkas: User Access -> Next.js SSR/Static -> Content Display -> Portal Redirect.
- Integrasi eksternal: CRM (optional), Analytics, Vercel/Railway.
- Dependency kritis: `next`, `react`, `framer-motion`, `lucide-react`.

## 6. Struktur Repo
- Folder penting: `app/`, `components/`, `docs/`, `lib/`, `hooks/`, `types/`, `scripts/`.
- File entry point: `app/layout.tsx`, `app/page.tsx`.
- File yang sering disentuh: `app/page.tsx`, `components/marketing/`.
- File yang dilarang diubah sembarangan: `docs/PRIVACY.md`, `next.config.js`.

## 7. Workflow Kerja
### 7.1 Setup
- Install: `pnpm install`
- Env var: `.env.example`
- Command bootstrap: `pnpm --filter sentra-portal dev`

### 7.2 Development
- Run app: `pnpm dev`
- Run tests: [TBD]
- Lint: `pnpm lint`
- Build: `pnpm build`

### 7.3 Release / Deploy
- Proses deploy: Vercel / Railway.
- Approval yang dibutuhkan: Chief (Dr. Ferdi).
- Checklist sebelum release: SEO metadata check, Lighthouse audit.

## 8. Keputusan Penting
- 2026-03-16 - Inisialisasi portal utama sebagai pusat informasi ekosistem Sentra.
- Penggunaan Next.js 15 untuk fitur server actions dan caching yang lebih baik.

## 9. Known Constraints
- Harus mendukung akses cepat (Lighthouse 90+) untuk SEO.
- Desain harus konsisten dengan branding "The Abyss".

## 10. Known Issues / Tech Debt
- Dokumentasi API (`docs/API.md`) masih berupa draf awal.

## 11. Open Questions
- Apakah portal ini akan memiliki fitur login terpadu (SSO) untuk seluruh layanan Sentra?

## 12. Acceptance Criteria
- Output dianggap benar jika: Tampilan visual premium, SEO tervalidasi, dan link navigasi berfungsi.
- Test yang harus lolos: Build success.
- Sinyal selesai: Chief memberikan konfirmasi "Excellency".

## 13. Change Log
- 2026-04-01 - Initial creation of PROJECT_CONTEXT.md.

## 14. JSON Snapshot
```json
{
  "project": {
    "name": "sentra-portal",
    "id": "sentra-marketing-portal",
    "domain": "Healthcare AI / Marketing",
    "repo": "D:\\Devops\\abyss-monorepo\\app\\sentra-portal",
    "owner": "Dr. Ferdi Iskandar (Chief)",
    "status": "active",
    "last_updated": "2026-04-01"
  },
  "objective": {
    "problem": "Need for a public face and main entrance for Sentra Healthcare AI ecosystem.",
    "desired_outcome": "Informative, persuasive, and high-aesthetic marketing portal.",
    "success_definition": "Elegant UI, high Lighthouse scores, and effective information conversion.",
    "non_goals": ["Medical transactional application"]
  },
  "agent_contract": {
    "must_do": [
      "Sapa sebagai Boss/Chief",
      "Next.js 15 / React 19 standards",
      "Claudesy Design Philosophy",
      "Align with AI Governance & Privacy"
    ],
    "must_not_do": [
      "Low quality visual assets",
      "Modify navigation without confirmation",
      "Ignore SEO/Metadata"
    ],
    "working_style": {
      "response_style": "Aesthetic, Communicative, Frontend Excellence",
      "when_unsure": "Consult AI Governance/Privacy docs",
      "conflict_policy": "MEMORY.md + PROJECT_CONTEXT.md"
    },
    "escalation_rules": [
      "Branding inconsistency",
      "Accessibility issues"
    ]
  },
  "business_context": {
    "users": ["Partners", "Investors", "Public"],
    "primary_use_cases": ["Product showcase", "AI Governance transparency", "Portal gateway"],
    "terminology": {
      "Sentra Portal": "Public Marketing Site",
      "AI Governance": "Transparency standards"
    },
    "business_constraints": ["Maintain professional brand image"],
    "business_risks": ["Public misinformation", "Marketing campaign downtime"]
  },
  "technical_context": {
    "stack": ["Next.js 15", "React 19", "Tailwind CSS", "shadcn/ui"],
    "architecture": "Marketing-oriented Web App",
    "core_services": ["Portal Service", "Marketing Content"],
    "data_flow": ["User -> SSR/Static -> Content -> Portal"],
    "external_integrations": ["Analytics", "CRM"],
    "critical_dependencies": ["next", "react", "framer-motion"]
  },
  "repo_map": {
    "important_folders": ["app", "components", "docs", "lib"],
    "entry_points": ["app/layout.tsx", "app/page.tsx"],
    "frequently_changed_files": ["app/page.tsx", "components/marketing/**"],
    "protected_files": ["docs/PRIVACY.md"]
  },
  "workflow": {
    "setup": {
      "install": ["pnpm install"],
      "env_vars": [".env.example"],
      "bootstrap_commands": ["pnpm --filter sentra-portal dev"]
    },
    "development": {
      "run": ["pnpm dev"],
      "lint": ["pnpm lint"],
      "build": ["pnpm build"]
    },
    "release": {
      "deploy_process": ["Vercel / Railway"],
      "required_approvals": ["Chief"],
      "pre_release_checklist": ["SEO audit", "Lighthouse audit"]
    }
  },
  "decisions": [
    {
      "date": "2026-03-16",
      "decision": "Initialization of main portal for Sentra ecosystem"
    }
  ],
  "known_constraints": ["SEO Lighthouse scores", "Abyss branding"],
  "known_issues": ["Draft state for some API docs"],
  "open_questions": ["SSO integration for all services?"],
  "acceptance_criteria": ["Premium visuals", "SEO validated", "Functional navigation"],
  "change_log": [
    {
      "date": "2026-04-01",
      "summary": "Initial creation"
    }
  ]
}
```
