# HERMES FEATURE IMPLEMENTATION PLAN

┌───┬──────────────────────┬──────────┬─────────┬──────────────────────────────────────┐
│ # │ FITUR                │ PRIORITAS│ ESTIMASI│ STATUS                               │
├───┼──────────────────────┼──────────┼─────────┼──────────────────────────────────────┤
│ 1 │ PDF Knowledge Upload │ CRITICAL │ Phase 2 │ TBD                                  │
│ 2 │ Model Switch         │ HIGH     │ Phase 3 │ TBD                                  │
│ 3 │ Memory Management    │ HIGH     │ Phase 3 │ TBD                                  │
│ 4 │ Skill Download       │ HIGH     │ Phase 4 │ TBD                                  │
│ 5 │ Knowledge Base (MCP) │ HIGH     │ Phase 4 │ TBD                                  │
│ 6 │ Command Execution    │ MEDIUM   │ Phase 5 │ TBD                                  │
│ 7 │ File Upload          │ MEDIUM   │ Phase 5 │ TBD                                  │
│ 8 │ Agent Status         │ LOW      │ Phase 6 │ TBD                                  │
│ 9 │ Export/Import        │ LOW      │ Phase 6 │ TBD                                  │
└───┴──────────────────────┴──────────┴─────────┴──────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────────────────

PHASE 1: CORE CHAT (DONE ✅)
────────────────────────────────────────────────────────────────────────────────────────
[x] Chat room full-page dengan sidebar navigation
[x] New Chat, Delete Chat, Switch Chat
[x] Chat sessions auto-save ke chat_sessions.json
[x] Persona & Instructions editor di dashboard
[x] File viewer untuk config files
[x] Kimi/Moonshot API integration
[x] Avatar display di sidebar
[x] Decorative text (titles di header + sidebar footer)
[x] Proaktif persona — WAJIB proactive

PHASE 2: PDF KNOWLEDGE UPLOAD — CRITICAL
────────────────────────────────────────────────────────────────────────────────────────
Tujuan: Chief upload PDF kesehatan (jurnal, drug database, clinical guideline, dsb).
        Hermes baca, ekstrak, dan jadikan knowledge base yang bisa di-query saat chat.

DEPENDENCIES (npm packages):
  [ ] pdf-parse — ekstrak teks dari PDF
  [ ] mammoth — ekstrak dari DOCX (opsional)
  [ ] fs/promises — file operations native

ARTEFAK BARU:
  [ ] server/knowledge/ — folder untuk knowledge base PDF
  [ ] server/knowledge/index.json — indeks semua PDF yang diupload
  [ ] server/lib/pdf-extractor.js — modul ekstrak PDF ke teks

API:
  [ ] POST /api/knowledge/upload — upload PDF
       - Multipart/form-data
       - Max 10MB per file
       - Auto-ekstrak teks setelah upload
       - Simpan ke server/knowledge/
  [ ] GET /api/knowledge — list semua knowledge base
  [ ] GET /api/knowledge/:id — detail + preview teks PDF
  [ ] DELETE /api/knowledge/:id — hapus knowledge base
  [ ] GET /api/knowledge/search?q=query — search di semua knowledge

UI (Dashboard Tab):
  [ ] Tab "Knowledge Base" di sidebar dashboard (05 — ganti posisi Chat Room)
  [ ] Upload area drag & drop
  [ ] List knowledge base dengan: nama, ukuran, tanggal, jumlah halaman
  [ ] Preview teks hasil ekstrak
  [ ] Button "Delete" per item + "Clear All"
  [ ] Progress indicator saat upload & extraction

UI (Chat Integration):
  [ ] Saat Hermes menerima pertanyaan, otomatis search knowledge base dulu
  [ ] Inject hasil search ke system prompt sebagai context
  [ ] Indikator "Knowledge used" di chat response

FORMAT KNOWLEDGE INDEX (knowledge/index.json):
  {
    "entries": [
      {
        "id": "kb_1234567890",
        "filename": "pedoman-pemberian-obat-2024.pdf",
        "title": "Pedoman Pemberian Obat 2024",
        "size": 2458624,
        "pages": 45,
        "extractedText": "... teks lengkap dari PDF ...",
        "uploadedAt": "2026-04-09T12:00:00.000Z",
        "enabled": true
      }
    ]
  }

SYSTEM PROMPT INTEGRATION:
  Sebelum kirim ke Kimi API, tambahkan ke system prompt:
  "--- Knowledge Base Context ---
   [Teks dari PDF yang relevan dengan pertanyaan user]
   --- End Context ---"

  Hermes jadi bisa jawab berdasarkan PDF yang Chief upload.

────────────────────────────────────────────────────────────────────────────────────────

PHASE 3: MODEL SWITCH
────────────────────────────────────────────────────────────────────────────────────────
API:
  [ ] GET  /api/models — list available models
  [ ] POST /api/models/switch — ganti model aktif

UI:
  [ ] Dropdown model selector di header chat
  [ ] Indikator model aktif saat ini
  [ ] Toast notification setelah switch berhasil

Models yang didukung:
  - moonshot-v1-8k (default)
  - moonshot-v1-32k
  - moonshot-v1-128k
  - deepseek-chat (fallback)
  - gpt-4o (optional — perlu API key)

PHASE 3: MEMORY MANAGEMENT
────────────────────────────────────────────────────────────────────────────────────────
API:
  [ ] GET  /api/chat/sessions/:id/memory — detail memory per session
  [ ] DELETE /api/chat/sessions/:id/memory — hapus memory session
  [ ] GET  /api/chat/memory/stats — total messages, sessions, disk usage

UI:
  [ ] Tab baru "Memory" di area chat (bukan dashboard)
  [ ] List semua sessions dengan jumlah pesan
  [ ] Button "Clear Memory" per session
  [ ] Button "Clear All" dengan konfirmasi ganda
  [ ] Indikator storage usage

PHASE 4: SKILL DOWNLOAD + KNOWLEDGE BASE (MCP)
────────────────────────────────────────────────────────────────────────────────────────
API:
  [ ] GET  /api/skills — list installed skills
  [ ] POST /api/skills/install — install skill baru
  [ ] DELETE /api/skills/:id — uninstall skill
  [ ] POST /api/mcp/search — query ke Pieces MCP server
  [ ] GET  /api/mcp/materials — list materials dari Pieces OS

UI:
  [ ] Tab "Skills" di sidebar dashboard
  [ ] List skills yang terinstall
  [ ] Search/install skills dari marketplace lokal
  [ ] Knowledge Base viewer — hasil Pieces MCP search
  [ ] Context injection ke system prompt dari MCP

Skill format (JSON):
  {
    "name": "skill-name",
    "version": "1.0.0",
    "description": "What this skill does",
    "instructions": "Prompt template untuk Hermes",
    "triggers": ["keyword1", "keyword2"],
    "enabled": true
  }

PHASE 5: COMMAND EXECUTION + FILE UPLOAD
────────────────────────────────────────────────────────────────────────────────────────
API:
  [ ] POST /api/exec — jalankan shell command (dengan allowlist)
  [ ] GET  /api/exec/:id/output — ambil output command
  [ ] POST /api/upload — upload file ke project
  [ ] GET  /api/files/browse — browse file tree project

UI:
  [ ] Terminal panel di dashboard (sudah ada shell, belum exec endpoint)
  [ ] Command input dengan output viewer
  [ ] File upload drag & drop
  [ ] File browser tree dengan preview
  [ ] Permission warning untuk command execution

Security:
  - Command allowlist (no rm -rf, no sudo, no curl pipe)
  - Timeout 30 detik per command
  - Output max 1000 baris
  - File upload max 10MB
  - File type validation

PHASE 6: AGENT STATUS + EXPORT/IMPORT
────────────────────────────────────────────────────────────────────────────────────────
API:
  [ ] GET  /api/health — full health check (CPU, RAM, disk, models)
  [ ] GET  /api/disk — disk usage breakdown
  [ ] POST /api/export/chat/:id — export chat session ke JSON
  [ ] POST /api/import/chat — import chat session dari JSON
  [ ] POST /api/export/persona — export persona config
  [ ] POST /api/import/persona — import persona config

UI:
  [ ] Health dashboard expanded — disk, model status, API latency
  [ ] Export button per chat session (dropdown menu)
  [ ] Import dialog untuk chat/persona
  [ ] Download JSON file hasil export
  [ ] System status indicator di header

────────────────────────────────────────────────────────────────────────────────────────

REKOMENDASI URUTAN EKSEKUSI:
────────────────────────────────────────────────────────────────────────────────────────

1. PDF Knowledge Upload — CRITICAL. Chief butuh upload PDF kesehatan → Hermes jadi expert
2. Model Switch — fleksibilitas ganti model sesuai kebutuhan
3. Memory Management — maintenance chat data
4. Skill Download — fitur utama yang bedakan Hermes dari chat biasa
5. Knowledge Base MCP — integrasi Pieces untuk context awareness
6. Command Execution — powerful, butuh security
7. File Upload — pelengkap command execution
8. Agent Status — monitoring detail
9. Export/Import — backup/restore data

TOTAL: 8 fitur, 6 phase, estimasi bertahap per phase.
