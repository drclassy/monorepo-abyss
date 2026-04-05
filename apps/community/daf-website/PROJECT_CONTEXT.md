# Project Context: daf-website

> Dokumen ini adalah sumber kebenaran utama untuk agent. Jika ada konflik,
ikuti bagian `Agent Contract` dan `Decision Log`.

## 1. Ringkasan Project
- Nama project: daf-website
- ID project: dr-dibya-arfianda-website
- Domain: Medical Healthcare (Obstetrics & Gynecology)
- Repo: D:\Devops\abyss-monorepo\app\daf-website
- Owner: Dr. Dibya Arfianda / Dr. Ferdi Iskandar
- Status: active
- Last updated: 2026-04-01

## 2. Tujuan Utama
- Masalah yang diselesaikan: Kebutuhan akan kehadiran digital profesional dan manajemen konsultasi pasien bagi Dr. Dibya Arfianda.
- Outcome yang diharapkan: Website yang elegan, informatif, dan fungsional untuk pasien obgyn.
- Definisi sukses: Interface yang mudah digunakan oleh pasien dan integrasi jadwal konsultasi yang akurat.
- Non-goals: Menjadi platform e-commerce produk umum.

## 3. Agent Contract
### 3.1 Harus Dilakukan
- Selalu sapa user sebagai Boss atau Chief.
- Gunakan Next.js 15.1.0 (App Router) dengan React 19.
- Terapkan design system premium: Cream (#FDFBF7), Charcoal (#121212), Gold (#B5A48B).
- Gunakan Typography: Cormorant Garamond (Serif) dan Inter (Sans).

### 3.2 Jangan Dilakukan
- Jangan menggunakan asset gambar berkualitas rendah (kindergarten design).
- Jangan memodifikasi schema Prisma tanpa verifikasi impact pada data pasien.
- Jangan mengabaikan optimasi SEO dan Metadata (penting untuk visibilitas dokter).

### 3.3 Gaya Kerja
- Jawaban harus: Sopan, profesional, dan berestetika tinggi.
- Saat ragu, agent harus: Mempertimbangkan aspek privasi pasien dan citra profesional dokter.
- Jika ada konflik konteks, agent harus: Mengikuti `MEMORY_AUDREY_CONTEXT.md` (jika tersedia) dan `PROJECT_CONTEXT.md`.

### 3.4 Escalation Rules
- Escalate jika: Menemukan isu pada alur booking pasien atau keamanan data medis.
- Jangan menebak jika: Terkait dengan jadwal praktik atau informasi medis sensitif.
- Minta konfirmasi hanya jika: Mengubah elemen visual kunci (Header/Hero section).

## 4. Konteks Bisnis
- User utama: Pasien (Ibu hamil/wanita), Staf Klinik, Dr. Dibya.
- Use case utama: Booking konsultasi, Edukasi kesehatan obgyn, Profil dokter.
- Terminologi domain: OBGYN, Antenatal Care, USG, Konsultasi.
- Constraint bisnis: Kepercayaan pasien dan kemudahan navigasi bagi pengguna mobile.
- Risiko bisnis: Kesalahan jadwal praktik yang mengakibatkan ketidakpuasan pasien.

## 5. Konteks Teknis
- Stack: Next.js 15, Tailwind CSS, Prisma 6.0, PostgreSQL, Zod, Sonner.
- Arsitektur: Modern Web / App Router.
- Service / module penting: `app/booking`, `components/sections`, `lib/prisma`.
- Data flow ringkas: Pasien -> Website -> Booking Form -> Database -> Notifikasi.
- Integrasi eksternal: WhatsApp API (untuk notifikasi), Google Maps.
- Dependency kritis: `next`, `prisma`, `lucide-react`, `framer-motion`.

## 6. Struktur Repo
- Folder penting: `app/`, `components/`, `lib/`, `prisma/`, `public/`, `types/`.
- File entry point: `app/layout.tsx`, `app/page.tsx`.
- File yang sering disentuh: `app/page.tsx`, `components/sections/`.
- File yang dilarang diubah sembarangan: `next.config.ts`, `tailwind.config.ts`.

## 7. Workflow Kerja
### 7.1 Setup
- Install: `npm install`
- Env var: `.env` (berdasarkan `.env.example`)
- Command bootstrap: `npx prisma generate && npm run dev`

### 7.2 Development
- Run app: `npm run dev`
- Run tests: [TBD]
- Lint: `npm run lint`
- Format: `npm run format`
- Build: `npm run build`

### 7.3 Release / Deploy
- Proses deploy: Vercel.
- Approval yang dibutuhkan: Chief (Dr. Ferdi).
- Checklist sebelum release: Responsive check (Mobile/Desktop), Metadata SEO verified.

## 8. Keputusan Penting
- 2026-04-01 - Standarisasi konteks untuk Agent 'Audrey' dan lainnya.
- Penggunaan Prisma 6.0 untuk performa database optimal.

## 9. Known Constraints
- Harus mematuhi standar estetika premium (No kindergarten design).
- Batasan pada integrasi API pihak ketiga untuk notifikasi.

## 10. Known Issues / Tech Debt
- Beberapa komponen UI perlu optimasi loading state (skeleton screens).

## 11. Open Questions
- Apakah akan ada fitur rekam medis pasien di dalam website ini?

## 12. Acceptance Criteria
- Output dianggap benar jika: Visual sesuai dengan brand guidelines dan form booking berfungsi.
- Test yang harus lolos: Build success.
- Sinyal selesai: Website dapat diakses dan booking tes berhasil disimpan di DB.

## 13. Change Log
- 2026-04-01 - Initial creation of PROJECT_CONTEXT.md.

## 14. JSON Snapshot
```json
{
  "project": {
    "name": "daf-website",
    "id": "dr-dibya-arfianda-website",
    "domain": "Medical Healthcare",
    "repo": "D:\\Devops\\abyss-monorepo\\app\\daf-website",
    "owner": "Dr. Dibya Arfianda",
    "status": "active",
    "last_updated": "2026-04-01"
  },
  "objective": {
    "problem": "Digital presence and patient consultation management for Obgyn specialist.",
    "desired_outcome": "Elegant and functional professional website.",
    "success_definition": "User-friendly interface and accurate booking integration.",
    "non_goals": ["General e-commerce platform"]
  },
  "agent_contract": {
    "must_do": [
      "Sapa sebagai Boss/Chief",
      "Next.js 15 / React 19",
      "Premium design system (Cream, Charcoal, Gold)",
      "Typography: Cormorant Garamond & Inter"
    ],
    "must_not_do": [
      "Low quality assets",
      "Unverified Prisma schema changes",
      "Ignore SEO/Metadata"
    ],
    "working_style": {
      "response_style": "Polite, Professional, Aesthetic",
      "when_unsure": "Consider patient privacy & doctor's image",
      "conflict_policy": "PROJECT_CONTEXT.md is truth"
    },
    "escalation_rules": [
      "Booking flow issues",
      "Medical data security"
    ]
  },
  "business_context": {
    "users": ["Patients", "Clinic Staff", "Dr. Dibya"],
    "primary_use_cases": ["Consultation booking", "Medical education"],
    "terminology": {
      "OBGYN": "Obstetrics & Gynecology",
      "ANC": "Antenatal Care"
    },
    "business_constraints": ["Patient trust priority"],
    "business_risks": ["Scheduling errors"]
  },
  "technical_context": {
    "stack": ["Next.js 15", "Tailwind CSS", "Prisma 6.0"],
    "architecture": "App Router Architecture",
    "core_services": ["Booking Service", "Notification Service"],
    "data_flow": ["Patient -> Web -> DB -> Notification"],
    "external_integrations": ["WhatsApp API", "Google Maps"],
    "critical_dependencies": ["next", "prisma", "framer-motion"]
  },
  "repo_map": {
    "important_folders": ["app", "components", "prisma"],
    "entry_points": ["app/layout.tsx"],
    "frequently_changed_files": ["app/page.tsx"],
    "protected_files": ["next.config.ts"]
  },
  "workflow": {
    "setup": {
      "install": ["npm install"],
      "env_vars": [".env.example"],
      "bootstrap_commands": ["npx prisma generate", "npm run dev"]
    },
    "development": {
      "run": ["npm run dev"],
      "test": [],
      "lint": ["npm run lint"],
      "format": ["npm run format"],
      "build": ["npm run build"]
    },
    "release": {
      "deploy_process": ["Vercel"],
      "required_approvals": ["Chief"],
      "pre_release_checklist": ["Responsive check", "SEO metadata check"]
    }
  },
  "decisions": [
    {
      "date": "2026-04-01",
      "decision": "Standardization for 'Audrey' agent integration"
    }
  ],
  "known_constraints": ["Premium aesthetic standards", "API rate limits"],
  "known_issues": ["UI loading states need optimization"],
  "open_questions": ["In-app Medical Records?"],
  "acceptance_criteria": ["Visual brand alignment", "Functional booking form"],
  "change_log": [
    {
      "date": "2026-04-01",
      "summary": "Initial creation"
    }
  ]
}
```
