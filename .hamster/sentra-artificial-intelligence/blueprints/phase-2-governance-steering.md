---
id: "c30e0ead-0f81-4b14-ac58-80feb5d1dcc8"
entity_type: "blueprint"
entity_id: "c30e0ead-0f81-4b14-ac58-80feb5d1dcc8"
title: "Phase 2: Governance & Steering"
status: ""
priority: ""
updated_at: "2026-03-31T05:21:07.402901+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Deskripsi Proyek

**Phase 2: Governance & Steering** membangun sistem governance otomatis yang memastikan setiap task pengembangan melewati perencanaan eksplisit, persetujuan dari Chief Engineer, dan audit trail yang tak terhapuskan. Fase ini mengimplementasikan **Claudesy Workflow** — protokol pengembangan berbasis AI yang menggabungkan kontrol manusia dengan akselerasi AI.

Tanpa governance yang kuat, sistem AI dapat menjadi black box yang tidak dapat diaudit. Phase 2 memastikan bahwa setiap keputusan, setiap kode, setiap eksekusi model tercatat dan dapat dilacak untuk compliance (terutama HIPAA untuk healthcare domain).

---

## Tujuan Utama

### 1. Implementasi Claudesy Workflow (HANDOFF.md + GO-Gate)

Membangun protokol standar dimana setiap task dimulai dengan dokumen `HANDOFF.md` yang berisi perencanaan, acceptance criteria, dan risiko. Sebelum eksekusi, Chief/Lead Engineer memberikan approval eksplisit via GO-Gate mechanism. Ini menciptakan checkpoint manusia yang intentional tanpa menghambat developer velocity.

### 2. Hierarchical Agent Steering via AGENTS.md

Mendefinisikan aturan perilaku untuk AI agents pada 4 level hierarki: global (`.agents/AGENTS.md`), domain-specific (`apps/healthcare/AGENTS.md`), dan project-level. Ini memungkinkan kontrol granular — healthcare domain dapat memiliki rules yang lebih strict (HIPAA compliance) dibanding incubator domain (rapid prototyping).

### 3. Automated Governance Enforcement (iskandar-gatekeeper)

Membangun package TypeScript yang otomatis memvalidasi:

- Struktur HANDOFF.md sebelum merge
- AGENTS.md compliance (tidak ada rule conflicts)
- Boundary violations (healthcare code tidak boleh import dari incubator packages)
- Approval signatures sebelum production deployment

### 4. Session Logging & Immutable Audit Trails (Sentratorium)

Membangun sistem centralized logging untuk semua AI agent executions:

- Input prompt, model used, output, approval status
- Terenkripsi di-rest dan in-transit (HIPAA requirement)
- Immutable (append-only, tidak ada deletion)
- Retention policy: 7 tahun untuk healthcare, 1 tahun untuk domain lain

### 5. Developer Enablement via abyss-cli

Membangun CLI tools yang membuat governance frictionless:

- `abyss init-task` — Auto-generate HANDOFF.md template
- `abyss go` — Chief approval stamping
- `abyss validate` — Run governance checks
- `abyss session` — Query Sentratorium logs

### 6. Real-time Monitoring Dashboard (Sentratorium Web)

Membangun Next.js dashboard yang menyediakan:

- Session explorer dengan filtering dan export
- Real-time monitoring metrics (token usage, latency)
- Violations tracker (boundary violations, unapproved sessions)
- Analytics (approval rates, model performance)

---

## Scope & Deliverables

**Phase 2 Duration:** 4-5 minggu (28-35 hari kalender)

**Deliverables Utama:**

- Dokumentasi Claudesy Workflow lengkap (CLAUDESY_PROTOCOL.md, GO_GATE_RULES.md)
- Template HANDOFF.md dan SESSION_LOG.md production-ready
- Global AGENTS.md + 3 domain-specific AGENTS.md (healthcare, academic, incubator)
- Package `iskandar-gatekeeper` dengan validators dan CLI integration
- Extended Prisma schema dengan session logging models
- abyss-cli commands (init-task, go, validate, session)
- GitHub Actions workflows untuk GO-Gate enforcement
- Sentratorium Web Dashboard (Next.js application)
- Complete audit trail infrastructure dengan retention policies
- Pre-commit hooks dan CI/CD enforcement

---

## Phase 2 Sub-Tasks Breakdown

### Sub-Task 2.1: Claudesy Workflow Foundation & Documentation

**Owner:** Tech Lead / Governance Specialist  
**Duration:** 2-3 hari  
**Status:** Scheduled

#### Objective

Dokumentasikan protokol governance lengkap dan template standar yang akan digunakan oleh semua developer dan AI agents.

#### Detailed Steps

1. Buat `docs/governance/CLAUDESY_PROTOCOL.md`:

```markdown
# Claudesy Workflow Protocol

## 4 Phases of Task Execution

### Phase 1: Task Initiation (Planning)
1. Developer atau AI agent membuat issue dengan context
2. Jalankan: `abyss init-task "Task Title"`
3. CLI auto-generate: `docs/tasks/ABYSS-XXX_handoff.md`

### Phase 2: Planning & Review (Internal)
1. Fill task description, acceptance criteria, approach
2. Identify risks dan mitigation strategies
3. Push ke feature branch, trigger pre-commit hooks

### Phase 3: GO-Gate Approval (Human Approval)
1. Chief/Lead Engineer review HANDOFF.md
2. Approve: `abyss go ABYSS-XXX --approve`
3. CI/CD unblocks merge jika approved_by populated

### Phase 4: Execution & Logging (With Audit Trail)
1. Developer/AI agent execute task
2. All sessions auto-log ke Sentratorium database
3. Upload proof-of-verification (test reports, screenshots)
4. Task marked complete dengan evidence attached

## Design Principles

- **Human Control + AI Acceleration:** AI can plan faster, humans approve intentionally
- **Audit Trail First:** Every decision is logged and immutable
- **Compliance-Ready:** HIPAA, SOC2, GDPR aligned from day one
- **Frictionless:** Tools make governance automatic, not punitive
```

1. Buat `docs/governance/GO_GATE_RULES.md`:

```markdown
# GO-Gate Approval Rules

## Approval Criteria

### For Healthcare Domain (Strict)
- ✅ FHIR validation passed
- ✅ Security review completed
- ✅ HIPAA audit trail configured
- ✅ Test coverage ≥ 90%

### For Academic Domain (Moderate)
- ✅ Functional requirements met
- ✅ Test coverage ≥ 80%
- ✅ No security vulnerabilities (OWASP)

### For Incubator Domain (Relaxed)
- ✅ Code compiles
- ✅ Basic tests pass
- ✅ Documentation exists

## Rejection Criteria

- ❌ No HANDOFF.md or incomplete sections
- ❌ AGENTS.md rules violated
- ❌ Cross-domain boundaries broken
- ❌ No test coverage provided
- ❌ Security issues unfixed
```

1. Buat template `docs/templates/HANDOFF.md`:

```markdown
---
task_id: ABYSS-001
title: "Task Title Here"
owner: "@developer-name"
domain: healthcare  # healthcare | academic | incubator | internal
priority: high      # high | medium | low
created_at: 2025-01-15T10:00:00Z
status: pending_approval  # pending_approval | approved | in_progress | completed
approved_by: null
approved_at: null
---

# Task Description
[Detailed description of what this task accomplishes]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Approach
[Architecture, design patterns, technology choices]

## Risks & Mitigation
- **Risk 1:** [Description] → **Mitigation:** [Strategy]
- **Risk 2:** [Description] → **Mitigation:** [Strategy]

## Estimated Effort
[X days]

## Dependencies
- Depends on: [Task IDs if applicable]
- Blocks: [Task IDs if applicable]

---

## GO-GATE APPROVAL

### Chief Review
- [ ] Architecture aligns with standards
- [ ] Security implications reviewed
- [ ] Compliance verified (domain-specific)
- [ ] Test coverage adequate

**Approver Signature:**
> Name: _____________
> Date: _____________
> Decision: [ ] GO / [ ] NO-GO / [ ] REVISE

---

## Execution Log
[Auto-populated during execution]

## Proof of Verification
[Test reports, screenshots, deployment logs]
```

1. Buat template `docs/templates/SESSION_LOG.md` untuk AI session tracking
2. Setup `.github/` hooks untuk enforce HANDOFF.md presence pada PR

#### Success Criteria

- [ ] CLAUDESY_PROTOCOL.md complete dan understandable
- [ ] GO_GATE_RULES.md dengan clear approval/rejection criteria
- [ ] HANDOFF.md template tersedia dan easy to use
- [ ] SESSION_LOG.md template dengan section yang jelas
- [ ] Pre-commit hooks block merge tanpa valid HANDOFF.md

#### Deliverables

- docs/governance/ directory dengan protokol lengkap
- Standar template di docs/templates/
- Pre-commit hook configuration

---

### Sub-Task 2.2: Hierarchical AGENTS.md & Agent Steering Rules

**Owner:** AI/ML Lead  
**Duration:** 3-4 hari  
**Status:** Scheduled

#### Objective

Mendefinisikan hirarki aturan untuk AI agents pada 4 level: global, domain-specific, project-level, dan skill-specific. Ini memungkinkan steering yang fine-grained sambil mempertahankan compliance rules yang strict di healthcare.

#### Detailed Steps

1. Buat `.agents/AGENTS.md` (Global Rules):

```markdown
# Global Agent Steering Rules

## 1. Universal Principles
- **Safety First:** Healthcare data protected under HIPAA
- **Transparency:** All decisions must be auditable
- **Consistency:** Follow established patterns from packages/*
- **Bounded Autonomy:** AI can plan, humans must approve risky tasks

## 2. Domain-Based Routing
- Healthcare requests → apps/healthcare/AGENTS.md (strict)
- Academic requests → apps/academic/AGENTS.md (moderate)
- Experimental → apps/incubator/AGENTS.md (relaxed)
- Internal tools → apps/internal/AGENTS.md (moderate)

## 3. Prohibited Actions (All Domains)
- ❌ Never modify domain-specific code without domain AGENTS.md approval
- ❌ Never bypass GO-Gate for production deployments
- ❌ Never create circular dependencies
- ❌ Never log sensitive data in plain text

## 4. Required Validations
- ✅ All code must pass iskandar-gatekeeper checks
- ✅ Healthcare code requires FHIR validation
- ✅ All sessions must log to Sentratorium
- ✅ All PRs need HANDOFF.md with approval

## 5. Model Selection Rules
- **Healthcare:** gpt-4-turbo, claude-3.5-sonnet (low hallucination risk)
- **Academic:** gpt-4, claude-3-opus
- **Incubator:** Any model (A/B testing allowed)
- **Internal:** Efficient models (gpt-3.5-turbo, claude-3-haiku)
```

1. Buat `apps/healthcare/AGENTS.md` (Healthcare Domain - Strict):

```markdown
# Healthcare Domain Agent Steering Rules 🔴 STRICT

## 1. HIPAA Compliance Requirements
- All patient data must be de-identified
- No logging of medical records in plain text
- Encryption at-rest and in-transit required
- 7-year retention policy mandatory

## 2. FHIR Validation
- All data structures must pass FHIR R4 validation
- No custom fields outside FHIR extensions
- Terminology must use SNOMED CT, LOINC, or HL7 standards

## 3. Prohibited Actions (Healthcare Specific)
- ❌ Never generate diagnoses (requires physician review)
- ❌ Never bypass code review for API changes
- ❌ Never use experimental models for patient-facing features
- ❌ Never modify audit logs

## 4. Approval Requirements
- All changes require HANDOFF.md with Security review
- FHIR validation must pass pre-commit
- Unit test coverage minimum 90%
- Chief approval mandatory before merge to main
```

1. Buat `apps/academic/AGENTS.md` (Academic Domain - Moderate):

```markdown
# Academic Domain Agent Steering Rules 🟡 MODERATE

## 1. Simulation Standards
- All simulations must be based on real clinical data (anonymized)
- Accuracy metrics must be documented
- Model performance baseline required

## 2. Approval Requirements
- HANDOFF.md dengan test coverage ≥80%
- Code review dari academic lead required
- No GO-Gate required untuk non-critical features
```

1. Buat `apps/incubator/AGENTS.md` (Incubator Domain - Relaxed):

```markdown
# Incubator Domain Agent Steering Rules 🟢 RELAXED

## 1. Rapid Prototyping
- Minimal documentation required
- Fast iteration encouraged
- A/B testing allowed without approval

## 2. Approval Requirements
- HANDOFF.md dapat simple/concise
- Basic code review sufficient
- Can merge to develop branch without Chief approval
- Main branch still requires approval
```

1. Buat `.agents/skills/` directory dengan skill definitions:

```
.agents/skills/
├── code-generation.md
├── fhir-validation.md
├── security-audit.md
├── test-generation.md
└── documentation.md
```

1. Configure `.agents/mcp/config.json` untuk Model Context Protocol:

```json
{
  "mcpServers": {
    "fhir-validator": {
      "command": "node",
      "args": ["packages/fhir-engine/mcp-server.js"],
      "env": {
        "FHIR_VERSION": "R4"
      }
    },
    "boundary-checker": {
      "command": "node",
      "args": ["packages/iskandar-gatekeeper/mcp-server.js"]
    }
  }
}
```

#### Success Criteria

- [ ] `.agents/AGENTS.md` dengan 5 sections minimum
- [ ] 3 domain-specific AGENTS.md files (healthcare, academic, incubator)
- [ ] Hirarki rules clear dan tidak ada ambiguitas
- [ ] Healthcare rules reference HIPAA dan FHIR standards
- [ ] MCP configuration valid dan loadable

#### Deliverables

- Global dan domain-specific AGENTS.md files
- `.agents/skills/` dengan 5+ skill definitions
- `.agents/mcp/config.json` dengan server configurations
- README.md explaining agent steering hierarchy

---

### Sub-Task 2.3: iskandar-gatekeeper Package Implementation

**Owner:** DevOps Engineer / Build System Lead  
**Duration:** 5-6 hari  
**Status:** Scheduled

#### Objective

Membangun TypeScript package yang otomatis memvalidasi HANDOFF.md, AGENTS.md compliance, dan boundary violations. Package ini diintegrasikan ke pre-commit hooks dan CI/CD pipeline.

#### Detailed Steps

1. Initialize `packages/iskandar-gatekeeper/`:

```
packages/iskandar-gatekeeper/
├── src/
│   ├── validators/
│   │   ├── handoff-validator.ts      # YAML frontmatter + markdown sections
│   │   ├── agents-validator.ts       # AGENTS.md compliance checking
│   │   ├── boundary-validator.ts     # Cross-domain import checks
│   │   └── approval-validator.ts     # GO-Gate signature validation
│   ├── parsers/
│   │   ├── yaml-parser.ts
│   │   └── markdown-parser.ts
│   ├── reporters/
│   │   └── violation-reporter.ts     # Generate violation reports
│   ├── cli.ts                        # CLI entry point
│   └── index.ts                       # Main API export
├── tests/
│   ├── validators.test.ts
│   └── integration.test.ts
├── package.json
└── README.md
```

1. Implementasi `handoff-validator.ts`:

```typescript
export class HandoffValidator {
  async validate(filePath: string): Promise<ValidationResult> {
    // 1. Parse YAML frontmatter
    // 2. Check required fields: task_id, title, owner, domain, status
    // 3. Validate domain is one of: healthcare|academic|incubator|internal
    // 4. Check markdown sections exist: Description, Acceptance Criteria, Technical Approach, Risks
    // 5. For healthcare domain, additionally check: FHIR validation, HIPAA compliance
    // 6. Return: { passed: boolean, errors: string[], warnings: string[] }
  }
}
```

1. Implementasi `boundary-validator.ts`:

```typescript
export class BoundaryValidator {
  async checkCrossDomainImports(sourceFile: string): Promise<BoundaryViolation[]> {
    // 1. Parse imports dari sourceFile
    // 2. Determine source domain (apps/healthcare/ → healthcare)
    // 3. For each import, check if crosses to stricter domain
    // 4. Example violations:
    //    - apps/healthcare/ importing from apps/incubator/ ❌
    //    - apps/academic/ importing from apps/incubator/ ❌
    // 5. Return violations dengan suggestions
  }
}
```

1. Implementasi CLI commands:

```bash
# Validate HANDOFF.md
pnpm iskandar validate-handoff docs/tasks/ABYSS-001.md

# Check boundary violations untuk file
pnpm iskandar validate-boundaries apps/healthcare/src/api.ts

# Check approval status
pnpm iskandar validate-approval docs/tasks/ABYSS-001.md --require-approval

# Full validation suite
pnpm iskandar validate-all
```

1. Setup pre-commit hooks di `.husky/pre-commit`:

```bash
#!/bin/sh

# Validate any modified HANDOFF.md files
git diff --cached --name-only | grep -E "docs/tasks/.*\.md$" | while read file; do
  pnpm iskandar validate-handoff "$file" || exit 1
done

# Check for boundary violations
git diff --cached --name-only | grep -E "\.ts$" | while read file; do
  pnpm iskandar validate-boundaries "$file" || exit 1
done
```

1. Integrate ke GitHub Actions (`.github/workflows/governance-check.yml`):

```yaml
name: Governance Validation

on:
  pull_request:
    paths:
      - 'docs/tasks/**/*.md'
      - 'apps/**'
      - '.agents/**'

jobs:
  governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22.0.0'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm iskandar validate-all
```

#### Success Criteria

- [ ] `HandoffValidator` detects missing fields dan sections
- [ ] `BoundaryValidator` prevents cross-domain violations
- [ ] `ApprovalValidator` blocks merge tanpa GO-Gate signature
- [ ] CLI commands executable via `pnpm iskandar [command]`
- [ ] Pre-commit hooks functional dan blocking invalid commits
- [ ] GitHub Actions integration working
- [ ] Unit tests dengan 85%+ coverage

#### Deliverables

- Complete `packages/iskandar-gatekeeper/` package
- CLI commands dengan documentation
- Pre-commit hook configuration
- GitHub Actions workflow
- Comprehensive test suite

---

### Sub-Task 2.4: Sentratorium Session Logging & Database Schema

**Owner:** Backend Lead / Database Engineer  
**Duration:** 4-5 hari  
**Status:** Scheduled

#### Objective

Extend database schema dengan models untuk tracking HANDOFF tasks, AI sessions, dan compliance logs. Implementasi immutable logging dengan retention policies untuk HIPAA compliance.

#### Detailed Steps

1. Extend `packages/database/prisma/schema.prisma`:

```prisma
// HANDOFF Task Tracking
model HandoffTask {
  id          String   @id @default(cuid())
  taskId      String   @unique  // ABYSS-001, ABYSS-002, etc
  title       String
  owner       String
  domain      String   // healthcare | academic | incubator | internal
  description String   @db.Text
  
  status      String   @default("pending_approval")  // pending_approval | approved | in_progress | completed
  
  acceptanceCriteria String @db.Text
  technicalApproach  String @db.Text
  risks              String @db.Text
  estimatedDays      Int?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // GO-Gate approval
  approvals   HandoffApproval[]
  
  // Execution sessions
  sessions    AiSession[]
  
  @@index([domain, status])
  @@index([createdAt])
}

// Approval tracking
model HandoffApproval {
  id          String   @id @default(cuid())
  handoffId   String
  handoff     HandoffTask @relation(fields: [handoffId], references: [id], onDelete: Cascade)
  
  approverName String
  approverEmail String
  decision    String   // "approved" | "rejected" | "revision_requested"
  comment     String?  @db.Text
  
  decidedAt   DateTime @default(now())
  
  @@unique([handoffId, approverEmail])  // One approval per approver
}

// AI Session Logging
model AiSession {
  id          String   @id @default(cuid())
  sessionId   String   @unique
  
  taskId      String?  // Link to HANDOFF task
  task        HandoffTask? @relation(fields: [taskId], references: [id])
  
  agentType   String   // code-gen | fhir-validator | orchestrator | etc
  domain      String   // healthcare | academic | incubator | internal
  
  // Request Context
  userId      String?
  inputPrompt String   @db.Text
  
  // Execution Details
  modelUsed   String   // gpt-4, claude-3.5-sonnet, etc
  tokenUsed   Int
  latencyMs   Int
  
  // Output
  output      String   @db.Text
  approved    Boolean  @default(false)
  approvedBy  String?
  
  // Compliance
  isEncrypted Boolean  @default(true)
  retentionUntil DateTime  // For HIPAA 7-year rule
  
  // Immutable log
  createdAt   DateTime @default(now())
  metadata    Json?
  
  @@index([domain, createdAt])
  @@index([taskId])
  @@index([userId])
}

// Compliance & Audit Log
model ComplianceLog {
  id          String   @id @default(cuid())
  eventType   String   // boundary_violation | unapproved_deploy | fhir_failure | etc
  severity    String   // critical | high | medium | low
  
  relatedSessionId String?
  relatedTaskId    String?
  
  description String   @db.Text
  evidence    Json?    // Violation details
  
  resolvedAt  DateTime?
  resolvedBy  String?
  
  createdAt   DateTime @default(now())
  
  @@index([severity, createdAt])
  @@index([eventType])
}
```

1. Implementasi `SessionLogger` class:

```typescript
export class SessionLogger {
  async logSession(data: AiSessionInput): Promise<AiSession> {
    // 1. Validate input (model, domain, tokens)
    // 2. Encrypt sensitive fields if healthcare domain
    // 3. Calculate retentionUntil (7 years untuk healthcare)
    // 4. Create AiSession record
    // 5. Return session untuk integration dengan Langflow
  }
  
  async approveSession(sessionId: string, approver: string): Promise<void> {
    // 1. Fetch session
    // 2. Update approved=true, approvedBy=approver
    // 3. Log to ComplianceLog
  }
  
  async cleanupExpiredSessions(): Promise<number> {
    // 1. Find sessions dengan retentionUntil < now
    // 2. Encrypt atau delete based on retention policy
    // 3. Log cleanup action
  }
}
```

1. Setup Langflow custom component untuk auto-logging:

```python
# flows/components/session-logger/langflow_logger.py
from langflow.custom import Component

class SentratorialLogger(Component):
    def run(self, input_data: dict, flow_id: str, model: str) -> dict:
        session = {
            "session_id": generate_id(),
            "flow_id": flow_id,
            "input": input_data,
            "model": model,
            "timestamp": datetime.now()
        }
        # Send to database via packages/database API
        await log_session(session)
        return input_data
```

1. Setup cleanup cron job di `infrastructure/`:

```typescript
// infrastructure/jobs/session-cleanup.ts
import cron from 'node-cron';
import { SessionLogger } from '@the-abyss/database';

// Run daily cleanup di 2 AM UTC
cron.schedule('0 2 * * *', async () => {
  const logger = new SessionLogger();
  const cleanedCount = await logger.cleanupExpiredSessions();
  console.log(`Cleaned up ${cleanedCount} expired sessions`);
});
```

1. Setup directory untuk Sentratorium logs:

```
docs/sentratorium/
├── sessions/
│   ├── 2025-01/
│   │   ├── healthcare/
│   │   │   ├── session-001-fhir-validation.md
│   │   │   └── session-002-api-generation.md
│   │   └── academic/
│   │       └── session-003-simulator-design.md
│   └── 2025-02/
├── analytics/
│   ├── token-usage-report.md
│   └── model-performance.md
└── violations/
    └── boundary-violations-2025-01.md
```

#### Success Criteria

- [ ] Prisma schema migration runs successfully
- [ ] `SessionLogger` class fully functional dengan encryption
- [ ] Langflow component logging auto-triggered
- [ ] Cleanup job tested dan scheduled
- [ ] Healthcare sessions retained minimum 7 years
- [ ] All sensitive data encrypted at-rest

#### Deliverables

- Extended Prisma schema (schema.prisma)
- `SessionLogger` class implementation
- Langflow custom component
- Cleanup cron job
- docs/sentratorium/ directory structure

---

### Sub-Task 2.5: abyss-cli Governance Commands

**Owner:** DevOps Engineer / CLI Developer  
**Duration:** 3-4 hari  
**Status:** Scheduled

#### Objective

Extend `tooling/abyss-cli/` dengan governance commands yang membuat Claudesy Workflow frictionless untuk developers.

#### Detailed Steps

1. Implement `abyss init-task [title]` command:

```bash
$ pnpm abyss init-task "Implement FHIR validation middleware"

✅ HANDOFF created: docs/tasks/ABYSS-042_handoff.md

---
task_id: ABYSS-042
title: "Implement FHIR validation middleware"
owner: @dev-name (auto-detected from git config)
domain: [Select: healthcare | academic | incubator | internal]
priority: medium
created_at: 2025-01-15T14:30:00Z
status: pending_approval
---

Next steps:
1. Edit docs/tasks/ABYSS-042_handoff.md
2. Fill Acceptance Criteria, Technical Approach, Risks
3. git push origin branch-name
4. Chief reviews via: pnpm abyss go ABYSS-042 --approve
```

1. Implement `abyss go [task-id] --approve/--reject` command:

```bash
# Chief approving task
$ pnpm abyss go ABYSS-042 --approve

✅ Task ABYSS-042 approved by @chief-engineer
   Timestamp: 2025-01-15T15:00:00Z
   Signature: signed by GPG key 0x12345678

HANDOFF updated:
   approved_by: @chief-engineer
   approved_at: 2025-01-15T15:00:00Z
   status: approved

CI/CD check passed. Ready to merge! 🚀

# Chief rejecting task
$ pnpm abyss go ABYSS-042 --reject "Security review needed. Review HIPAA implications."

❌ Task ABYSS-042 rejected
   Reason: Security review needed...
   Decision date: 2025-01-15T15:05:00Z

Please address feedback in HANDOFF.md and resubmit.
```

1. Implement `abyss validate` command:

```bash
$ pnpm abyss validate

🔍 Validating monorepo governance...

✅ docs/tasks/ABYSS-042_handoff.md
   - YAML frontmatter: PASSED
   - Required sections: PASSED
   - Approval signature: PENDING (expected for newly created task)

✅ apps/healthcare/src/api.ts
   - Boundary check: PASSED (no violations)
   - FHIR compliance: PASSED

⚠️  docs/tasks/ABYSS-040_handoff.md
   - Status: in_progress (not marked complete)
   - Last update: 5 days ago

❌ apps/incubator/src/index.ts
   - BOUNDARY VIOLATION: importing from apps/healthcare/lib
   - Fix: Remove cross-domain import or move to packages/

Validation complete: 3 passed, 0 critical, 1 warning, 1 error
```

1. Implement `abyss session [session-id]` command:

```bash
$ pnpm abyss session sess_abc123xyz

📋 AI Session Log
   Session ID: sess_abc123xyz
   Agent Type: code-generation
   Domain: healthcare
   Model: gpt-4-turbo
   Tokens Used: 2,450
   Latency: 1.82s

💬 Input Prompt:
   "Generate FHIR validation middleware for Patient resource"

✅ Output:
   [TypeScript code snippet]

🔐 Approval Status: ✅ APPROVED
   Approved by: @chief-engineer
   Approval date: 2025-01-15T15:30:00Z

📊 Related Task: ABYSS-042
```

1. CLI struktur untuk `tooling/abyss-cli/`:

```typescript
// tooling/abyss-cli/src/index.ts
import { Command } from 'commander';
import { initTaskCommand } from './commands/init-task';
import { goCommand } from './commands/go';
import { validateCommand } from './commands/validate';
import { sessionCommand } from './commands/session';

const program = new Command();

program
  .command('init-task <title>')
  .description('Initialize new HANDOFF.md task')
  .action(initTaskCommand);

program
  .command('go <taskId>')
  .option('--approve', 'Approve task (Chief only)')
  .option('--reject <reason>', 'Reject task with reason')
  .action(goCommand);

program
  .command('validate')
  .description('Run full governance validation')
  .option('--strict', 'Strict mode (fail on warnings)')
  .action(validateCommand);

program
  .command('session <sessionId>')
  .description('Fetch session from Sentratorium')
  .option('--export <format>', 'Export format: json|markdown|csv')
  .action(sessionCommand);

program.parse();
```

#### Success Criteria

- [ ] `abyss init-task` auto-generates valid HANDOFF.md
- [ ] `abyss go` updates YAML frontmatter dengan approval signature
- [ ] `abyss validate` catches all violations
- [ ] `abyss session` queries Sentratorium correctly
- [ ] All commands have help text dan examples
- [ ] CLI installable via `pnpm install -g tooling/abyss-cli`

#### Deliverables

- Extended abyss-cli dengan 4 governance commands
- Complete command implementations
- Help documentation dan examples
- Integration tests untuk each command

---

### Sub-Task 2.6: GitHub Actions GO-Gate Enforcement

**Owner:** DevOps Engineer / CI/CD Specialist  
**Duration:** 3-4 hari  
**Status:** Scheduled

#### Objective

Konfigurasi GitHub Actions workflows untuk enforce GO-Gate approval sebelum merge ke main branch dan auto-upload proof-of-verification.

#### Detailed Steps

1. Buat `.github/workflows/go-gate-enforcement.yml`:

```yaml
name: GO-Gate Enforcement

on:
  pull_request:
    branches: [main, develop]
    paths:
      - 'docs/tasks/**/*.md'
      - 'apps/**'
      - '.agents/**'

jobs:
  check-approval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Check GO-Gate Approval
        run: |
          # Find HANDOFF.md files in PR
          CHANGED_TASKS=$(git diff --name-only origin/main...HEAD | grep "docs/tasks/.*\.md$")
          
          for task_file in $CHANGED_TASKS; do
            echo "Checking $task_file for GO-Gate approval..."
            
            # Extract approved_by field from YAML frontmatter
            APPROVED_BY=$(grep "^approved_by:" "$task_file" | cut -d: -f2 | xargs)
            
            if [ -z "$APPROVED_BY" ] || [ "$APPROVED_BY" = "null" ]; then
              echo "❌ FAILED: $task_file requires GO-Gate approval"
              echo "   Run: pnpm abyss go $(basename $task_file .md) --approve"
              exit 1
            fi
            
            echo "✅ PASSED: $task_file approved by $APPROVED_BY"
          done
  
  governance-validation:
    runs-on: ubuntu-latest
    needs: check-approval
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22.0.0'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm iskandar validate-all
      
      - name: Report violations
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "🚨 Governance violation in PR #${{ github.event.pull_request.number }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Governance Check Failed*\nRun `pnpm iskandar validate-all` locally to see details."
                  }
                }
              ]
            }
```

1. Buat `.github/workflows/sentratorium-proof-upload.yml`:

```yaml
name: Upload Proof-of-Verification to Sentratorium

on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  upload-proof:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22.0.0'
          cache: 'pnpm'
      
      - run: pnpm install
      
      - name: Collect test reports
        run: |
          mkdir -p ./proof-of-verification
          cp -r coverage/ ./proof-of-verification/coverage || true
          cp junit.xml ./proof-of-verification/ || true
      
      - name: Upload to Sentratorium
        run: |
          # Extract task_id dari PR title atau merged HANDOFF.md
          TASK_ID=$(grep "^task_id:" docs/tasks/*.md | head -1 | cut -d: -f2 | xargs)
          
          pnpm abyss session upload \
            --task-id "$TASK_ID" \
            --proof-dir ./proof-of-verification \
            --status "completed"
      
      - name: Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Task ${{ env.TASK_ID }} completed and verified",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Task Completed*\nTask: ${{ env.TASK_ID }}\nProof uploaded to Sentratorium"
                  }
                }
              ]
            }
```

1. Setup CODEOWNERS untuk domain protection:

```
# .github/CODEOWNERS

# Global
/ @tech-lead @devops-engineer

# Healthcare domain (strict review)
/apps/healthcare/ @healthcare-team @chief-engineer
/packages/fhir-engine/ @healthcare-team @compliance-officer
/.agents/AGENTS.md @tech-lead

# Academic domain
/apps/academic/ @academic-team @tech-lead

# Incubator (relaxed)
/apps/incubator/ @incubator-team

# Governance & Steering
/docs/governance/ @tech-lead @compliance-officer
/packages/iskandar-gatekeeper/ @devops-engineer
```

1. Update branch protection rules di main branch:

```
✅ Require pull request reviews before merging: 1
✅ Require status checks to pass before merging:
   - check-approval (GO-Gate Enforcement)
   - governance-validation (Iskandar Gatekeeper)
   - build (from Phase 1 CI/CD)
   - test (from Phase 1 CI/CD)
✅ Require branches to be up to date before merging
✅ Require signed commits
✅ Allow force pushes: No
✅ Allow deletions: No
```

#### Success Criteria

- [ ] GO-Gate enforcement blocks merge jika `approved_by: null`
- [ ] Governance validation catches violations
- [ ] Slack notifications terkirim ke channel governance
- [ ] Proof-of-verification auto-uploaded ke Sentratorium
- [ ] CODEOWNERS enforced untuk healthcare domain
- [ ] Branch protection rules enforced

#### Deliverables

- `.github/workflows/go-gate-enforcement.yml`
- `.github/workflows/sentratorium-proof-upload.yml`
- `.github/CODEOWNERS` configuration
- Branch protection rule documentation

---

### Sub-Task 2.7: Sentratorium Web Dashboard Implementation

**Owner:** Frontend Lead / Full-Stack Engineer  
**Duration:** 5-7 hari  
**Status:** Scheduled

#### Objective

Membangun Next.js application untuk real-time monitoring AI sessions, compliance tracking, dan analytics dashboard untuk stakeholders.

#### Detailed Steps

1. Initialize `apps/internal/sentratorium-web/` (Next.js):

```bash
$ cd apps/internal
$ pnpm create next-app sentratorium-web --typescript --tailwind --app-router

# Setup dependencies
$ cd sentratorium-web
$ pnpm add -D @tanstack/react-table recharts date-fns next-auth
$ pnpm add @the-abyss/database @the-abyss/ui
```

1. Implementasi 4 main views:

**a) Session Explorer:**

```typescript
// apps/internal/sentratorium-web/app/sessions/page.tsx
export default function SessionExplorer() {
  return (
    <div className="p-6">
      <h1>Session Explorer</h1>
      
      {/* Filters */}
      <Filters
        domains={['healthcare', 'academic', 'incubator']}
        dateRange={[startDate, endDate]}
        models={['gpt-4', 'claude-3.5-sonnet']}
        onFilterChange={handleFilter}
      />
      
      {/* Table */}
      <DataTable
        columns={[
          { accessorKey: 'sessionId', header: 'Session ID' },
          { accessorKey: 'agentType', header: 'Agent Type' },
          { accessorKey: 'domain', header: 'Domain' },
          { accessorKey: 'tokenUsed', header: 'Tokens' },
          { accessorKey: 'latencyMs', header: 'Latency (ms)' },
          { accessorKey: 'approved', header: 'Status' }
        ]}
        data={sessions}
      />
      
      {/* Export button */}
      <ExportButton format="csv" data={sessions} />
    </div>
  );
}
```

**b) Real-time Monitoring Dashboard:**

```typescript
// apps/internal/sentratorium-web/app/monitoring/page.tsx
export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState({
    totalTokensToday: 0,
    activeSessionsNow: 0,
    avgLatencyMs: 0,
    approvalRate: 0
  });
  
  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      <MetricCard 
        title="Tokens (Today)" 
        value={metrics.totalTokensToday} 
        trend="+12%" 
      />
      <MetricCard 
        title="Active Sessions" 
        value={metrics.activeSessionsNow} 
        isLive={true}
      />
      <MetricCard 
        title="Avg Latency" 
        value={`${metrics.avgLatencyMs}ms`} 
      />
      <MetricCard 
        title="Approval Rate" 
        value={`${metrics.approvalRate}%`} 
      />
      
      {/* Charts */}
      <LineChart 
        title="Token Usage Trend (7 days)" 
        data={tokenTrend}
      />
      <BarChart 
        title="Sessions by Domain" 
        data={sessionsByDomain}
      />
    </div>
  );
}
```

**c) Violations Tracker:**

```typescript
// apps/internal/sentratorium-web/app/violations/page.tsx
export default function ViolationsTracker() {
  return (
    <div className="p-6">
      <h1>Violations & Alerts</h1>
      
      {/* Severity filters */}
      <SeverityFilter selected={severities} onChange={setSeverities} />
      
      {/* Violations table */}
      <ViolationsTable
        violations={[
          {
            id: 'v-001',
            type: 'BOUNDARY_VIOLATION',
            severity: 'critical',
            description: 'apps/incubator importing from apps/healthcare',
            file: 'apps/incubator/src/index.ts',
            timestamp: '2025-01-15T14:30:00Z',
            resolved: false
          }
        ]}
      />
    </div>
  );
}
```

**d) Analytics Dashboard:**

```typescript
// apps/internal/sentratorium-web/app/analytics/page.tsx
export default function AnalyticsDashboard() {
  return (
    <div className="p-6">
      <h1>Analytics</h1>
      
      {/* Model Performance Comparison */}
      <ComparisonChart
        title="Model Performance (token/latency ratio)"
        models={['gpt-4', 'claude-3.5-sonnet', 'gpt-3.5-turbo']}
      />
      
      {/* Cost Analysis */}
      <CostAnalysis
        title="Token Cost Analysis"
        data={costData}
      />
      
      {/* Approval Rates by Domain */}
      <DonutChart
        title="Task Approval Rates"
        data={[
          { name: 'healthcare', value: 98, color: 'red' },
          { name: 'academic', value: 85, color: 'yellow' },
          { name: 'incubator', value: 75, color: 'green' }
        ]}
      />
    </div>
  );
}
```

1. Implementasi RBAC (Role-Based Access Control):

```typescript
// apps/internal/sentratorium-web/lib/auth.ts
import { getServerSession } from 'next-auth';

export const roles = {
  admin: ['view_all', 'export', 'approve', 'delete'],
  chief: ['view_all', 'export', 'approve'],
  lead: ['view_domain', 'export'],
  developer: ['view_own_sessions']
};

export async function checkPermission(requiredPermission: string) {
  const session = await getServerSession();
  const userRole = session?.user?.role;
  
  return roles[userRole]?.includes(requiredPermission) ?? false;
}
```

1. Setup real-time updates menggunakan WebSocket:

```typescript
// apps/internal/sentratorium-web/lib/realtime.ts
import { useEffect, useState } from 'react';

export function useRealtimeSessions(domain: string) {
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/sessions?domain=${domain}`
    );
    
    ws.onmessage = (event) => {
      const newSession = JSON.parse(event.data);
      setSessions(prev => [newSession, ...prev]);
    };
    
    return () => ws.close();
  }, [domain]);
  
  return sessions;
}
```

1. Styling menggunakan Tailwind 4 + Shadcn UI:

```typescript
// apps/internal/sentratorium-web/components/MetricCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@the-abyss/ui';

export function MetricCard({ title, value, trend }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-gray-500">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

1. API routes untuk data fetching:

```typescript
// apps/internal/sentratorium-web/app/api/sessions/route.ts
import { prisma } from '@the-abyss/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  
  const sessions = await prisma.aiSession.findMany({
    where: {
      domain: domain || undefined,
      createdAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  
  return Response.json(sessions);
}
```

#### Success Criteria

- [ ] Sentratorium Web accessible at `/internal/sentratorium`
- [ ] Session Explorer dengan filtering dan export
- [ ] Real-time monitoring dashboard dengan live metrics
- [ ] Violations tracker menampilkan semua boundary violations
- [ ] Analytics dashboard dengan model performance comparison
- [ ] RBAC enforcement (healthcare leads hanya lihat healthcare data)
- [ ] WebSocket integration untuk real-time updates
- [ ] Dark mode support dan mobile responsive
- [ ] Performance optimized (lazy loading, caching)

#### Deliverables

- Complete Next.js application di `apps/internal/sentratorium-web/`
- 4 main views dengan functional UI components
- Real-time WebSocket integration
- RBAC authentication & authorization
- API routes untuk data fetching
- Comprehensive documentation dan screenshots

---

## Implementation Timeline

| Minggu | Sub-Tasks | Milestones |
| --- | --- | --- |
| **Minggu 1** | 2.1, 2.2 | Governance documentation + AGENTS.md complete |
| **Minggu 2** | 2.3, 2.4 | iskandar-gatekeeper + Session logging implemented |
| **Minggu 3** | 2.5, 2.6 | abyss-cli commands + GitHub Actions live |
| **Minggu 4-5** | 2.7 | Sentratorium Web Dashboard deployed |

---

## Success Metrics & Verification Checklist

### Technical Metrics

- [ ] `pnpm iskandar validate-all` passes untuk entire repository
- [ ] HANDOFF.md YAML parsing 100% accurate (no schema violations)
- [ ] Boundary validator detects all cross-domain imports
- [ ] `abyss init-task` generates valid markdown setiap waktu
- [ ] Sentratorium database queries return <100ms latency
- [ ] WebSocket connections stable untuk real-time monitoring
- [ ] Pre-commit hooks block invalid commits 100% of the time

### Process Metrics

- [ ] All Phase 2 sub-tasks completed on schedule
- [ ] Healthcare domain AGENTS.md reviewed by compliance officer
- [ ] Zero governance violations in Phase 2 execution
- [ ] All CLI commands documented dengan examples
- [ ] Sentratorium dashboard accessible by all team members
- [ ] GO-Gate approval workflow tested end-to-end

### Compliance Metrics

- [ ] Healthcare sessions encrypted at-rest and in-transit
- [ ] 7-year retention policy enforced untuk healthcare logs
- [ ] HIPAA audit trail complete (immutable, append-only)
- [ ] GDPR cleanup cron job running successfully
- [ ] All sensitive data de-identified dalam session logs
- [ ] Compliance violations logged dan tracked dalam ComplianceLog

---

## Risks & Mitigation Strategies

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| **Complex YAML frontmatter parsing** | Medium | Medium | Unit tests untuk edge cases; use established YAML libraries |
| **Database performance under high session volume** | Medium | High | Add database indexes; implement pagination; use connection pooling |
| **Team resistance to stricter governance** | High | Medium | Invest time di education; show time savings from automation |
| **WebSocket connection stability** | Low | Medium | Implement reconnection logic; add fallback to polling |
| **HIPAA compliance gaps** | Low | Critical | Early security audit; consult dengan compliance officer |
| **Cross-domain import enforcement false positives** | Medium | Low | Whitelist exceptions untuk legitimate cases; thorough testing |

---

## Dependencies & Assumptions

### External Dependencies

- PostgreSQL database (dari Phase 1)
- Node.js 22.0.0+
- GitHub organization dengan branch protection capabilities
- Slack workspace untuk notifications (optional)
- Auth0 atau similar untuk RBAC (optional)

### Assumptions

- Team familiar dengan governance protocols (trained di kickoff)
- Database backups running (untuk HIPAA compliance)
- Network infrastructure supports WebSocket connections
- Development machines dapat run full validation suite (<30 seconds)

---

## Next Phase Preview

Setelah Phase 2 selesai, team segera transition ke **Phase 3: Reusable Substrate**, yang membangun shared libraries ecosystem:

- **packages/ui** — Design system (Tailwind 4 + Shadcn UI)
- **packages/database** — Prisma ORM + migrations
- **packages/ai-core** — Multi-model LLM orchestration
- **packages/vector-store** — RAGOps interface (Pinecone/Weaviate/Chroma)
- **packages/langflow-client** — SDK untuk Langflow integration
- **packages/fhir-engine** — HL7 FHIR R4 validation engine
- **packages/shared-types** — Global TypeScript contracts

Phase 3 depends on Phase 2 completion dan tidak dapat proceed tanpa governance infrastructure sudah live.