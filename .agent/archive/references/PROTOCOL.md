# PROTOCOL.md — Quick Reference for Agents
<!-- Read this for rapid task classification and workflow selection -->

## ⚡ 30-Second Start

```
1. Baca SESSION_STATE.md → GO sudah granted?
2. Klasifikasikan task → A, B, atau C?
3. Ikuti gate yang sesuai → Execute!
```

---

## Task Classification (Pilih Satu)

### 🔵 Class A — Micro Tasks
**Ciri-ciri:** Hanya membaca, search, atau fix 1-2 baris

| Contoh | Gate |
|--------|------|
| Read file, grep search | Auto-execute |
| Fix typo, rename variable | Auto-execute |
| Check logs, status | Auto-execute |

**Workflow:** J1 → J2 → J3 → J4 → Execute → Log 1 line

---

### 🟡 Class B — Standard Development
**Ciri-ciri:** Menulis code baru, bug fix, refactor (tanpa sentuh DB/infra)

| Contoh | Gate |
|--------|------|
| New component, API endpoint | Check SESSION_STATE.md |
| Bug fix, refactor | Plan in HANDOFF.md |
| Add tests, update docs | Execute → Verify |

**Workflow:** J1 → J2 → J3 → J4 → [Check GO status] → Execute → Verify → Log

---

### 🔴 Class C — High Risk
**Ciri-ciri:** Sentuh database, infrastructure, security, atau PHI

| Contoh | Gate |
|--------|------|
| DB migration, schema change | ⛔ HARD J5 |
| Terraform apply/destroy | Tunggu Chief "GO" |
| Security config changes | Full JET J1-J9 |
| PHI/PII handling | Mandatory dual-write |

**Workflow:** J1 → J2 → J3 → J4 → ⛔ WAIT FOR GO → Execute → Verify → Full docs → Commit

---

## 🚦 GO Status Check

### Sebelum Class B atau C Task:
```markdown
1. Baca `.agent/SESSION_STATE.md`
2. Cek field "Chief GO Status"
3. Jika ✅ GRANTED dan scope mencakup task class → proceed
4. Jika ⛔ PENDING → request GO dari Chief
```

### Request GO Format:
```
"Chief, task ini Class [A/B/C]: [deskripsi singkat]. 
Scope: [yang akan diubah]. 
Request GO untuk execute."
```

---

## 📝 Logging Requirements

| Class | `.agent/sessions/` | `.agent/HANDOFF.md` |
|-------|-------------------|----------------------|
| A | 1 line | Optional |
| B | Summary | Update if plan changed |
| C | Full detail | Update + rollback doc |

---

## 🎯 Quick Decision Tree

```
Task dimulai
    │
    ├── Apakah hanya read/search? ──→ Class A ──→ Execute
    │
    ├── Apakah tulis code normal? ──→ Class B ──→ Check GO ──→ Execute
    │
    └── Apakah sentuh DB/infra/PHI? → Class C ──→ Hard J5 ──→ Wait GO
```

---

## ⚠️ Red Flags (Class C Indicators)

**Stop dan classify as Class C jika task involves:**
- [ ] File `.prisma/schema.prisma` atau folder `migrations/`
- [ ] Folder `infrastructure/` (Terraform)
- [ ] File dengan `@Exclude()` decorator (PHI fields)
- [ ] `docker-compose.yml` changes di production
- [ ] Git operations: `rm -rf`, `reset --hard`, `clean -fd`
- [ ] Commands: `DROP`, `TRUNCATE`, `terraform apply`

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `SESSION_STATE.md` | GO status per session |
| `HANDOFF.md` | Current task plan |
| `CONTEXT.md` | Architecture & stack |
| `LESSONS.md` | Mistakes to avoid |
| `DECISIONS.md` | Prior architectural decisions |

**Full rules:** `AGENTS.md` §2.1 (repository policy authority) plus `.agent/` for operational SSOT.

---

*Keep this reference handy — classify fast, execute safely.*
