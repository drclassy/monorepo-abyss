# Project Context: claudsy-memory

> Dokumen ini adalah sumber kebenaran utama untuk agent. Jika ada konflik,
ikuti bagian `Agent Contract` dan `Decision Log`.

## 1. Ringkasan Project
- Nama project: claudsy-memory
- ID project: claudesy-memory-engine
- Domain: AI Memory Management & Persistence
- Repo: D:\Devops\abyss-monorepo\app\claudsy-memory
- Owner: Dr. Ferdi Iskandar (Chief)
- Status: active
- Last updated: 2026-04-01

## 2. Tujuan Utama
- Masalah yang diselesaikan: Keterbatasan konteks (context window) LLM dan hilangnya memori antar sesi percakapan.
- Outcome yang diharapkan: Sistem memori persisten yang memungkinkan agent AI mengingat preferensi user, fakta, dan konteks jangka panjang secara cerdas.
- Definisi sukses: Pengambilan informasi (retrieval) yang relevan dengan akurasi tinggi dan latensi rendah.
- Non-goals: Menjadi database umum (fokus pada data kontekstual Agent).

## 3. Agent Contract
### 3.1 Harus Dilakukan
- Selalu sapa user sebagai Boss atau Chief.
- Gunakan Python 3.8+ untuk engine inti dan Node.js 20+ untuk dashboard.
- Implementasikan mekanisme Ebbinghaus decay untuk manajemen prioritas informasi.
- Pastikan isolasi memori antar agent tetap terjaga.

### 3.2 Jangan Dilakukan
- Jangan menghapus database memori (`sqlite`) tanpa backup otomatis.
- Jangan menggunakan model LLM yang terlalu berat untuk ekstraksi memori (gunakan nuextract/llama3.1).
- Jangan menyimpan data sensitif (secrets) ke dalam memori agent.

### 3.3 Gaya Kerja
- Jawaban harus: Berbasis data, logis, dan analitis.
- Saat ragu, agent harus: Melakukan verifikasi silang (cross-check) dengan data memori yang ada.
- Jika ada konflik konteks, agent harus: Memprioritaskan data terbaru namun tetap mempertimbangkan konsolidasi memori.

### 3.4 Escalation Rules
- Escalate jika: Terjadi korupsi database memori atau kegagalan konsolidasi.
- Jangan menebak jika: Terkait dengan identitas user atau preferensi krusial.
- Minta konfirmasi hanya jika: Melakukan penghapusan memori permanen (forgetting).

## 4. Konteks Bisnis
- User utama: Agent AI (Internal), Power Users, Developers.
- Use case utama: Long-term context retrieval, user preference learning, factual recall.
- Terminologi domain: Ebbinghaus Decay, Memory Extraction, Consolidation, Retainment.
- Constraint bisnis: Kecepatan akses memori tidak boleh menghambat respons agent.
- Risiko bisnis: Kebocoran informasi antar konteks agent yang berbeda.

## 5. Konteks Teknis
- Stack: Python (Core), SQLite (WAL mode), Next.js (Dashboard), Ollama (AI).
- Arsitektur: Modular Agentic Memory (Extractor, Consolidator, Storage).
- Service / module penting: `ClaudesyEngine`, `MemoryExtractor`, `MemoryConsolidator`.
- Data flow ringkas: Raw Input -> Extractor -> Storage -> Consolidator -> Retrieval.
- Integrasi eksternal: Ollama API, LangChain (optional).
- Dependency kritis: `sqlite3`, `ollama`, `next`.

## 6. Struktur Repo
- Folder penting: `claudesy_memory/`, `src/`, `public/`, `docs/`, `site-concept/`.
- File entry point: `claudesy_memory/engine.py`, `src/app/page.tsx`.
- File yang sering disentuh: `claudesy_memory/extractor.py`, `claudesy_memory/storage.py`.
- File yang dilarang diubah sembarangan: `pyproject.toml`, `package.json`.

## 7. Workflow Kerja
### 7.1 Setup
- Install: `pip install -e .` dan `npm install`
- Env var: `.env` (berdasarkan `.env.example`)
- Command bootstrap: `python -m claudesy_memory.setup`

### 7.2 Development
- Run app: `npm run dev` (Dashboard) & `python main.py` (Engine)
- Run tests: `pytest` & `npm test`
- Lint: `ruff check` & `eslint`
- Format: `black` & `prettier`
- Build: `npm run build`

### 7.3 Release / Deploy
- Proses deploy: Docker / Manual VPS setup.
- Approval yang dibutuhkan: Chief.
- Checklist sebelum release: DB migration scripts verified, memory extraction accuracy tested.

## 8. Keputusan Penting
- 2026-04-01 - Standarisasi konteks untuk sinkronisasi Agent.
- Menggunakan SQLite WAL mode untuk mendukung konkurensi tinggi.

## 9. Known Constraints
- Latensi Ollama pada hardware terbatas.
- SQLite tidak cocok untuk volume data memori skala enterprise (petabytes).

## 10. Known Issues / Tech Debt
- Mekanisme decay perlu fine-tuning lebih lanjut untuk data non-faktual.

## 11. Open Questions
- Apakah perlu sinkronisasi memori via cloud (Vector DB)?

## 12. Acceptance Criteria
- Output dianggap benar jika: Informasi yang ditarik relevan dengan query user.
- Test yang harus lolos: `test_claudesy_engine.py`.
- Sinyal selesai: Agent berhasil menjawab pertanyaan berdasarkan memori sesi sebelumnya.

## 13. Change Log
- 2026-04-01 - Initial creation of PROJECT_CONTEXT.md.

## 14. JSON Snapshot
```json
{
  "project": {
    "name": "claudsy-memory",
    "id": "claudesy-memory-engine",
    "domain": "AI Memory Management",
    "repo": "D:\\Devops\\abyss-monorepo\\app\\claudsy-memory",
    "owner": "Dr. Ferdi Iskandar (Chief)",
    "status": "active",
    "last_updated": "2026-04-01"
  },
  "objective": {
    "problem": "Context window limits and cross-session memory loss in LLMs.",
    "desired_outcome": "Persistent and intelligent AI memory system.",
    "success_definition": "High accuracy retrieval with low latency.",
    "non_goals": ["General purpose database"]
  },
  "agent_contract": {
    "must_do": [
      "Sapa sebagai Boss/Chief",
      "Python 3.8+ / Node 20+",
      "Ebbinghaus decay implementation",
      "Memory isolation"
    ],
    "must_not_do": [
      "Delete DB without backup",
      "Use heavy LLMs for extraction",
      "Store secrets in memory"
    ],
    "working_style": {
      "response_style": "Data-driven, Logical, Analytical",
      "when_unsure": "Cross-check with memory",
      "conflict_policy": "Prioritize latest but consolidate"
    },
    "escalation_rules": [
      "DB corruption",
      "Consolidation failure"
    ]
  },
  "business_context": {
    "users": ["AI Agents", "Power Users"],
    "primary_use_cases": ["Context retrieval", "User preference learning"],
    "terminology": {
      "Ebbinghaus Decay": "Information priority management",
      "Consolidation": "Memory summarization process"
    },
    "business_constraints": ["Access speed priority"],
    "business_risks": ["Cross-context leakage"]
  },
  "technical_context": {
    "stack": ["Python", "SQLite", "Next.js", "Ollama"],
    "architecture": "Agentic Memory Architecture",
    "core_services": ["Extractor", "Consolidator", "Storage"],
    "data_flow": ["Input -> Extract -> Store -> Consolidate -> Retrieve"],
    "external_integrations": ["Ollama API"],
    "critical_dependencies": ["sqlite3", "ollama"]
  },
  "repo_map": {
    "important_folders": ["claudesy_memory", "src", "docs"],
    "entry_points": ["claudesy_memory/engine.py", "src/app/page.tsx"],
    "frequently_changed_files": ["claudesy_memory/extractor.py"],
    "protected_files": ["pyproject.toml", "package.json"]
  },
  "workflow": {
    "setup": {
      "install": ["pip install -e .", "npm install"],
      "env_vars": [".env.example"],
      "bootstrap_commands": ["python -m claudesy_memory.setup"]
    },
    "development": {
      "run": ["npm run dev", "python main.py"],
      "test": ["pytest", "npm test"],
      "lint": ["ruff check", "eslint"],
      "format": ["black", "prettier"],
      "build": ["npm run build"]
    },
    "release": {
      "deploy_process": ["Docker / Manual VPS"],
      "required_approvals": ["Chief"],
      "pre_release_checklist": ["Migration scripts verified", "Extraction accuracy tested"]
    }
  },
  "decisions": [
    {
      "date": "2026-04-01",
      "decision": "Context standardization for AI sync"
    }
  ],
  "known_constraints": ["Ollama latency", "SQLite scalability"],
  "known_issues": ["Decay mechanism fine-tuning required"],
  "open_questions": ["Cloud/Vector DB sync?"],
  "acceptance_criteria": ["Relevant retrieval", "Passing test_claudesy_engine.py"],
  "change_log": [
    {
      "date": "2026-04-01",
      "summary": "Initial creation"
    }
  ]
}
```
