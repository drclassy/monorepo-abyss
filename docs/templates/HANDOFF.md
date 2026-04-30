# Handoff: [task title]

**Status:** Pending / GO  
**Agent:** [agent name]  
**Date:** [ISO date]  
**Phase:** [phase number]

---

## Diagnosis and root cause

[Deep technical analysis of the problem or requested feature]

### Context
- **Problem statement:** [Explain the problem]
- **Impact:** [Explain the consequence if left as-is]
- **Current behavior:** [Describe what happens today]
- **Expected behavior:** [Describe the intended behavior]

### Related issues
- Closes: #[issue-number]
- Related to: #[issue-number]
- Blocks: #[issue-number]

---

## Proposed architecture

### Files to modify
| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `apps/...` | Create/Modify/Delete | [What changes] |
| `packages/...` | Create/Modify/Delete | [What changes] |

### New packages or components
- [ ] `packages/new-package/` - [Description]
- [ ] `apps/new-app/` - [Description]

### Database changes
- [ ] New table: `[table_name]`
- [ ] Modified table: `[table_name]`
- [ ] Migration required: `packages/database/prisma/migrations/`

### API changes
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/...` | POST/GET/PUT/DELETE | New/Modified |

### External dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `package-name` | `^x.x.x` | [Purpose] |

---

## Verification plan

### Unit tests
- [ ] Test: `[test-name]` - [What is tested]
- [ ] Test: `[test-name]` - [What is tested]

### Integration tests
- [ ] Flow: `[flow-name]` - [Flow being tested]

### Security scan
- [ ] OWASP Top 10 check
- [ ] Dependency audit
- [ ] Secret detection

### Performance benchmarks
- [ ] Load time: `< X ms`
- [ ] Memory usage: `< X MB`

---

## Implementation checklist

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

## Chief approval

### Approval string
> **Approval:** GO / REJECTED  
> **Approved by:** [chief name]  
> **Approved at:** [ISO timestamp]  
> **Comments:** [notes or conditions]

### CI/CD gate status
- [ ] HANDOFF.md exists
- [ ] GO approval string present
- [ ] All tests passed
- [ ] Security scan passed

---

## Session log

### Timeline
| Time | Action | Status |
|------|--------|--------|
| [ISO Time] | HANDOFF created | ✅ |
| [ISO Time] | GO approved | ⏳ |
| [ISO Time] | Implementation started | ⏳ |
| [ISO Time] | Tests completed | ⏳ |
| [ISO Time] | PR created | ⏳ |

### Commit trail
```
<commit-hash> - <commit-message> (Agent: <name>, Phase: <number>)
```

---

## Retrospective

### What went well
- [Item 1]
- [Item 2]

### What could be improved
- [Item 1]
- [Item 2]

### Learnings
- [Learning 1]
- [Learning 2]

---

**Handoff created:** [ISO timestamp]  
**Last updated:** [ISO timestamp]  
**Local session notes:** `.agent/sessions/YYYY-MM-DD.md` (local-only, not versioned)

---

© 2026 Sentra Artificial Intelligence
