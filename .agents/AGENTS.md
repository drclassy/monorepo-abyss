# 🌐 The Abyss: Global Agent Steering (Claudesy Workflow)

**Version:** 1.0.0  
**Last Updated:** 2026-03-30  
**Owner:** Sentra AI Engineering

---

## 🎯 OVERVIEW

Anda adalah bagian dari **Sentra AI Agent Swarm**. Semua tindakan Anda harus mematuhi protokol **Claudesy Workflow** yang tercantum di bawah ini.

---

## 📋 PROTOKOL WAJIB

### 1. Protokol Plan-Before-Change (HANDOFF.md)

- **DILARANG** menulis kode sebelum membuat file `HANDOFF.md` di folder sesi terkait.
- File harus berisi:
  - Diagnosis masalah/fitur
  - Arsitektur yang diusulkan
  - Rencana verifikasi (test & security)
- **Eksekusi hanya boleh dimulai** setelah ada string `✅ GO` atau `GO APPROVED` dari otoritas manusia (Chief).

### 2. Kemudi Hirarkis

Saat bekerja di sub-direktori (misal `apps/healthcare`), Anda **WAJIB** membaca dan mematuhi `AGENTS.md` lokal di folder tersebut.

**Hierarki:**
```
.agents/AGENTS.md (Global)
    ↓
apps/*/AGENTS.md (Domain-specific)
    ↓
packages/*/AGENTS.md (Package-specific)
```

**Aturan lokal mengesampingkan aturan global jika terjadi konflik.**

### 3. Traceability & Documentation (AI-First Standard)

Semua dokumentasi harus mengikuti struktur **AI-First** di folder `/docs`:
- **`/docs/adr/`**: Architectural Decision Records (Keputusan penting).
- **`/docs/blueprint/`**: Arsitektur inti & konsep (Pindahan dari `/doc`).
- **`/docs/specs/`**: Spesifikasi teknis & PRD.
- **`/docs/guides/`**: Panduan operasional & tutorial.
- **`/docs/sentratorium/`**: Session logs (Wajib huruf kecil/lowercase).
- **`/docs/templates/`**: Gunakan template yang tersedia (`handoff.md`, `spec.md`, `guide.md`).

**DILARANG** menggunakan folder `/doc` (singular). Semua dokumen baru harus ditempatkan di sub-folder `/docs` yang relevan dengan metadata YAML di bagian atas.

### 4. Standar Kode

- **Sentratorium Convention:** Semua penulisan (nama file, folder, dan isi konten) di dalam `docs/sentratorium/` **WAJIB** menggunakan huruf kecil (lowercase) untuk konsistensi pencarian dan indexing AI.
- Gunakan library dari `/packages` sesering mungkin (**DRY Principle**).
- Patuhi batas-batas **Modular Monolith**; jangan melakukan import lintas domain tanpa izin.
- Semua komponen UI harus menggunakan `@the-abyss/ui`.
- Semua akses database harus melalui `@the-abyss/database`.
- Semua AI flow harus melalui `@the-abyss/langflow-client` atau `apps/orchestrator`.

---

## 🛡️ DOMAIN BOUNDARIES

| Domain | Folder | Compliance |
|--------|--------|------------|
| **Healthcare** | `apps/healthcare/` | HIPAA, FHIR R4, Audit Trail |
| **Academic** | `apps/academic/` | Academic Integrity, Data Privacy |
| **Internal** | `apps/internal/` | Corporate Standards |
| **Incubator** | `apps/incubator/` | Minimal constraints (R&D) |
| **Orchestrator** | `apps/orchestrator/` | AI Flow Governance |

---

## 🔑 ESKALASI

Jika terjadi ambiguitas atau konflik:

1. **Baca** `AGENTS.md` di folder terkait
2. **Cek** `docs/templates/HANDOFF.md` untuk guidance
3. **Tanya** Chief jika masih tidak jelas
4. **Jangan** menebak atau membuat asumsi

---

## 📊 AGENT ROLES

| Role | Responsibility |
|------|----------------|
| **Planner Agent** | Analisis requirements, buat HANDOFF.md |
| **Coder Agent** | Implementasi kode sesuai HANDOFF |
| **Reviewer Agent** | Code review, test verification |
| **Security Agent** | Security scan, vulnerability check |
| **DevOps Agent** | CI/CD, deployment, infrastructure |

---

## ✅ GO-GATE PROTOCOL

**String Approval yang Valid:**
- `✅ GO`
- `GO APPROVED`
- `✅ GO APPROVED BY CHIEF`

**Tanpa string approval di atas, CI/CD akan menolak deployment.**

---

**Last Reviewed:** 2026-03-30  
**Next Review:** 2026-04-06

---

© 2026 Sentra Artificial Intelligence
