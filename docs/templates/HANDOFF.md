# 📝 HANDOFF: [Judul Tugas]

**Status:** 🛑 PENDING / ✅ GO  
**Agent:** [Nama Agent]  
**Date:** [ISO Date]  
**Phase:** [Fase Number]

---

## 🔍 1. Diagnosis & Root Cause

[Analisis teknis mendalam tentang masalah atau fitur yang diminta]

### Context
- **Problem Statement:** [Jelaskan masalah]
- **Impact:** [Dampak jika tidak diperbaiki]
- **Current Behavior:** [Apa yang terjadi sekarang]
- **Expected Behavior:** [Apa yang seharusnya terjadi]

### Related Issues
- Closes: #[issue-number]
- Related to: #[issue-number]
- Blocks: #[issue-number]

---

## 🏗️ 2. Proposed Architecture

### Files to Modify
| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `apps/...` | Create/Modify/Delete | [Apa yang diubah] |
| `packages/...` | Create/Modify/Delete | [Apa yang diubah] |

### New Packages/Components
- [ ] `packages/new-package/` - [Deskripsi]
- [ ] `apps/new-app/` - [Deskripsi]

### Database Changes
- [ ] New table: `[table_name]`
- [ ] Modified table: `[table_name]`
- [ ] Migration required: `packages/database/prisma/migrations/`

### API Changes
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/...` | POST/GET/PUT/DELETE | New/Modified |

### External Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `package-name` | `^x.x.x` | [Kegunaan] |

---

## 🛡️ 3. Proof-of-Verification Plan

### Unit Tests
- [ ] Test: `[test-name]` - [Apa yang ditest]
- [ ] Test: `[test-name]` - [Apa yang ditest]

### Integration Tests
- [ ] Flow: `[flow-name]` - [Alur yang diuji]

### Security Scan
- [ ] OWASP Top 10 check
- [ ] Dependency audit
- [ ] Secret detection

### Performance Benchmarks
- [ ] Load time: `< X ms`
- [ ] Memory usage: `< X MB`

---

## 📋 4. Implementation Checklist

- [ ] Create HANDOFF.md (this file)
- [ ] Write code changes
- [ ] Add/update tests
- [ ] Update documentation
- [ ] Run linter
- [ ] Run typecheck
- [ ] Run tests
- [ ] Security scan passed
- [ ] Update CHANGELOG.md (if applicable)

---

## 🔑 5. Chief Approval (GO-Gate)

### Approval String
> **Approval:** ✅ GO / 🛑 REJECTED  
> **Approved By:** [Chief Name]  
> **Approved At:** [ISO Timestamp]  
> **Comments:** [Any notes or conditions]

### CI/CD Gate Status
- [ ] HANDOFF.md exists
- [ ] GO approval string present
- [ ] All tests passed
- [ ] Security scan passed

---

## 📊 6. Session Log

### Timeline
| Time | Action | Status |
|------|--------|--------|
| [ISO Time] | HANDOFF created | ✅ |
| [ISO Time] | GO approved | ⏳ |
| [ISO Time] | Implementation started | ⏳ |
| [ISO Time] | Tests completed | ⏳ |
| [ISO Time] | PR created | ⏳ |

### Commit Trail
```
<commit-hash> - <commit-message> (Agent: <name>, Phase: <number>)
```

---

## 📝 7. Retrospective

### What Went Well
- [Item 1]
- [Item 2]

### What Could Be Improved
- [Item 1]
- [Item 2]

### Learnings
- [Learning 1]
- [Learning 2]

---

**Handoff Created:** [ISO Timestamp]  
**Last Updated:** [ISO Timestamp]  
**Session Path:** `docs/sentratorium/sessions/SESSION-[DATE]-[SLUG]/`

---

© 2026 Sentra Artificial Intelligence
