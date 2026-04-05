# 📚 Sentratorium — AI Session Logs

**Purpose:** Audit trail untuk semua interaksi Agen AI & Manusia

---

## 📁 STRUCTURE

```
sessions/
├── SESSION-2026-03-30-INIT/
│   └── HANDOFF.md
├── SESSION-2026-03-30-FHIR-VALIDATION/
│   └── HANDOFF.md
└── SESSION-YYYY-MM-DD-[SLUG]/
    └── HANDOFF.md
```

---

## 📋 SESSION NAMING

Format: `SESSION-[YYYY-MM-DD]-[SLUG]/`

Examples:
- `SESSION-2026-03-30-INIT`
- `SESSION-2026-03-30-FHIR-VALIDATION`
- `SESSION-2026-03-31-ORCHESTRATOR-SETUP`

---

## 🔍 HANDOFF.md REQUIREMENTS

Setiap sesi WAJIB memiliki `HANDOFF.md` dengan:
1. Diagnosis & Root Cause
2. Proposed Architecture
3. Proof-of-Verification Plan
4. Chief Approval (GO-Gate)

---

## 📊 SESSION STATUS

| Status | Description |
|--------|-------------|
| 🛑 PENDING | Menunggu GO approval |
| ✅ GO | Approved, ready to execute |
| 🔄 IN PROGRESS | Sedang dikerjakan |
| ✅ COMPLETED | Selesai & verified |
| ❌ FAILED | Gagal atau rejected |

---

## 🔗 INTEGRATIONS

- Linked ke commit trailers
- Referenced di CI/CD logs
- Tracked di dashboard `apps/internal/sentratorium-web`

---

© 2026 Sentra Artificial Intelligence
