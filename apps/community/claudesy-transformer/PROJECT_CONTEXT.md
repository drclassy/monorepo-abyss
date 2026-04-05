# Project Context: claudesy-transformer

> Dokumen ini adalah sumber kebenaran utama untuk agent. Jika ada konflik,
ikuti bagian `Agent Contract` dan `Decision Log`.

## 1. Ringkasan Project
- Nama project: claudesy-transformer (Prompt Transformer)
- ID project: @sentra/claudesy-transformer
- Domain: AI Prompt Engineering & Optimization
- Repo: D:\Devops\abyss-monorepo\app\claudesy-transformer
- Owner: Dr. Ferdi Iskandar (Chief)
- Status: active
- Last updated: 2026-04-01

## 2. Tujuan Utama
- Masalah yang diselesaikan: Inkonsistensi kualitas prompt LLM dan kesulitan manajemen prompt di berbagai provider (OpenAI, Gemini, Anthropic).
- Outcome yang diharapkan: Platform terpusat untuk optimasi, versi, dan pengujian prompt berperforma tinggi.
- Definisi sukses: Peningkatan efisiensi prompt engineering sebesar >50% dan output LLM yang lebih deterministik.
- Non-goals: Menjadi UI chat umum (fokus pada transformasi dan manajemen prompt).

## 3. Agent Contract
### 3.1 Harus Dilakukan
- Selalu sapa user sebagai Boss atau Chief.
- Gunakan Next.js 15 (App Router) dan React 19 standards.
- Terapkan design system "Deep Onyx" (Sentra Design Philosophy).
- Pastikan semua perubahan kompatibel dengan sistem monorepo Abyss.

### 3.2 Jangan Dilakukan
- Jangan menggunakan database selain Prisma/PostgreSQL tanpa izin.
- Jangan mengabaikan setup Sentry untuk error tracking.
- Jangan menyimpan API key LLM dalam kode (gunakan environment variables).

### 3.3 Gaya Kerja
- Jawaban harus: Teknis, elegan, dan mendalam (Expert level).
- Saat ragu, agent harus: Melakukan simulasi atau riset sebelum bertanya ke Boss.
- Jika ada konflik konteks, agent harus: Mengacu pada `CLAUDE.md` dan `PROJECT_CONTEXT.md`.

### 3.4 Escalation Rules
- Escalate jika: Menemukan regresi pada engine transformasi prompt.
- Jangan menebak jika: Terkait dengan middleware keamanan atau autentikasi.
- Minta konfirmasi hanya jika: Mengubah schema database Prisma.

## 4. Konteks Bisnis
- User utama: Prompt Engineers, AI Researchers, Backend Developers.
- Use case utama: Prompt refinement, A/B testing prompt, multi-LLM deployment.
- Terminologi domain: Temperature, Top-P, System Instructions, Few-shot prompting.
- Constraint bisnis: Keamanan data input prompt (No PHI).
- Risiko bisnis: Halusinasi LLM akibat prompt yang tidak teroptimasi.

## 5. Konteks Teknis
- Stack: Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma, Vitest.
- Arsitektur: Modular Monolith (Website, Extension, API).
- Service / module penting: `lib/transformers`, `app/api/transform`, `components/editor`.
- Data flow ringkas: Raw Prompt -> Transformer Engine -> Optimized Prompt -> Provider LLM.
- Integrasi eksternal: OpenAI, Anthropic, Gemini, Mistral APIs.
- Dependency kritis: `next`, `prisma`, `lucide-react`, `vitest`.

## 6. Struktur Repo
- Folder penting: `app/`, `components/`, `lib/`, `prisma/`, `extension/`, `website/`.
- File entry point: `app/page.tsx`, `middleware.ts`.
- File yang sering disentuh: `lib/transformers/`, `app/dashboard/`.
- File yang dilarang diubah sembarangan: `prisma/schema.prisma`, `next.config.mjs`.

## 7. Workflow Kerja
### 7.1 Setup
- Install: `npm install`
- Env var: `.env` (berdasarkan `.env.example`)
- Command bootstrap: `npx prisma generate && npm run dev`

### 7.2 Development
- Run app: `npm run dev`
- Run tests: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format`
- Build: `npm run build`

### 7.3 Release / Deploy
- Proses deploy: GitHub Actions -> Vercel.
- Approval yang dibutuhkan: Chief.
- Checklist sebelum release: Unit tests pass, Prisma migration verified.

## 8. Keputusan Penting
- 2026-04-01 - Implementasi awal dokumen konteks untuk integrasi Agent.

## 9. Known Constraints
- Harus mendukung React 19 Concurrent Features.
- Limitasi rate-limit dari provider LLM eksternal.

## 10. Known Issues / Tech Debt
- Migrasi Vitest untuk beberapa module legacy masih tertunda.

## 11. Open Questions
- Apakah akan mendukung local LLM via Ollama secara native?

## 12. Acceptance Criteria
- Output dianggap benar jika: Prompt berhasil ditransformasi tanpa kehilangan maksud (intent).
- Test yang harus lolos: `npm run test`.
- Sinyal selesai: Dashboard menampilkan hasil transformasi yang valid.

## 13. Change Log
- 2026-04-01 - Initial creation of PROJECT_CONTEXT.md.

## 14. JSON Snapshot
```json
{
  "project": {
    "name": "claudesy-transformer",
    "id": "@sentra/claudesy-transformer",
    "domain": "AI Prompt Engineering",
    "repo": "D:\\Devops\\abyss-monorepo\\app\\claudesy-transformer",
    "owner": "Dr. Ferdi Iskandar (Chief)",
    "status": "active",
    "last_updated": "2026-04-01"
  },
  "objective": {
    "problem": "Inkonsistensi kualitas prompt LLM di berbagai provider.",
    "desired_outcome": "Platform terpusat untuk optimasi prompt.",
    "success_definition": "Peningkatan efisiensi prompt engineering >50%.",
    "non_goals": ["General purpose chat UI"]
  },
  "agent_contract": {
    "must_do": [
      "Sapa sebagai Boss/Chief",
      "Next.js 15 / React 19 standards",
      "Deep Onyx design system",
      "Monorepo compatibility"
    ],
    "must_not_do": [
      "Change DB without permission",
      "Ignore Sentry error tracking",
      "Hardcode API keys"
    ],
    "working_style": {
      "response_style": "Technical, Elegant, Expert",
      "when_unsure": "Research/Simulate before asking",
      "conflict_policy": "PROJECT_CONTEXT.md + CLAUDE.md"
    },
    "escalation_rules": [
      "Engine regressions",
      "Auth/Security issues"
    ]
  },
  "business_context": {
    "users": ["Prompt Engineers", "AI Researchers"],
    "primary_use_cases": ["Prompt refinement", "Multi-LLM testing"],
    "terminology": {
      "Temperature": "LLM creativity control",
      "Deep Onyx": "Visual branding name"
    },
    "business_constraints": ["No PHI in prompts"],
    "business_risks": ["LLM hallucinations"]
  },
  "technical_context": {
    "stack": ["Next.js 15", "React 19", "Prisma", "Vitest"],
    "architecture": "Modular Monolith",
    "core_services": ["Transformer Engine", "API Gateway"],
    "data_flow": ["Raw -> Transform -> Optimize -> Provider"],
    "external_integrations": ["OpenAI", "Anthropic", "Gemini"],
    "critical_dependencies": ["next", "prisma", "vitest"]
  },
  "repo_map": {
    "important_folders": ["app", "lib", "prisma", "extension"],
    "entry_points": ["app/page.tsx", "middleware.ts"],
    "frequently_changed_files": ["lib/transformers/**"],
    "protected_files": ["prisma/schema.prisma"]
  },
  "workflow": {
    "setup": {
      "install": ["npm install"],
      "env_vars": [".env.example"],
      "bootstrap_commands": ["npx prisma generate", "npm run dev"]
    },
    "development": {
      "run": ["npm run dev"],
      "test": ["npm run test"],
      "lint": ["npm run lint"],
      "format": ["npm run format"],
      "build": ["npm run build"]
    },
    "release": {
      "deploy_process": ["GitHub Actions -> Vercel"],
      "required_approvals": ["Chief"],
      "pre_release_checklist": ["Unit tests pass", "DB migration verified"]
    }
  },
  "decisions": [
    {
      "date": "2026-04-01",
      "decision": "Context standardization for Agent integration"
    }
  ],
  "known_constraints": ["React 19 features support", "API rate limits"],
  "known_issues": ["Legacy Vitest migration pending"],
  "open_questions": ["Local LLM/Ollama native support?"],
  "acceptance_criteria": ["Successful transformations", "Passing tests"],
  "change_log": [
    {
      "date": "2026-04-01",
      "summary": "Initial creation"
    }
  ]
}
```
