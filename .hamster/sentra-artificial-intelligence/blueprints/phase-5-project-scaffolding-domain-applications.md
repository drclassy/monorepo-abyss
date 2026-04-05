---
id: "84f5d512-c295-4bf5-bbac-10affef7c6cc"
entity_type: "blueprint"
entity_id: "84f5d512-c295-4bf5-bbac-10affef7c6cc"
title: "Phase 5: Project Scaffolding - Domain Applications"
status: ""
priority: ""
updated_at: "2026-03-31T10:34:11.753943+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Project Description

**Phase 5: Project Scaffolding** builds the "organs" of The Abyss—domain-specific applications that leverage the monorepo foundation, governance protocols, reusable libraries, and Langflow orchestration established in Phases 1-4.

During Phase 5, the team will:

- Initialize **`apps/healthcare/referralink-api`** — A HIPAA-compliant NestJS API for clinical referral management with full FHIR R4 support and audit trail logging
- Initialize **`apps/academic/clinical-simulator`** — A Next.js frontend and Python evaluation engine for medical education and AI performance assessment
- Initialize **`apps/incubator/edge-ai-prototype`** — A lightweight experimental environment for rapid small language model (SLM) testing and iteration
- Initialize **`apps/internal/sentratorium-web`** — A Next.js dashboard for real-time monitoring of AI sessions, token usage, costs, and monorepo health
- Integrate **Shared Substrate** — Verify all apps consume `@the-abyss/ui`, `@the-abyss/database`, `@the-abyss/ai-core`, `@the-abyss/langflow-client` via workspace dependencies
- Establish **Domain-Specific Governance** — Create local `AGENTS.md` files enforcing healthcare HIPAA rules, academic compliance, and incubator relaxed policies
- Execute **End-to-End Testing** — Playwright integration tests validating cross-app workflows (e.g., healthcare referral → academic simulator → Sentratorium logging)

Without Phase 5, the monorepo would be incomplete infrastructure with no user-facing applications. These four applications represent the "proof of concept" for The Abyss architecture, demonstrating how governance, orchestration, and shared substrate work in practice.

---

## Primary Objectives

### 1. Healthcare Application (Referralink) - HIPAA-Compliant Referral API

Initialize a production-ready NestJS API for clinical referral management with strict HIPAA compliance, FHIR R4 resource validation, and immutable audit logging.

**Success Indicator:** Healthcare app deploys to staging with zero HIPAA violations; all patient data operations logged to AuditLog table; FHIR validation passes HL7 test suite.

### 2. Academic Application (Clinical Simulator) - Medical Education Platform

Initialize a Next.js frontend with integrated Python evaluation engine for simulating clinical scenarios, assessing AI performance, and generating performance reports.

**Success Indicator:** Simulator loads with <3 second TTL; simulation workflow completes in <10 seconds; performance reports include accuracy, latency, and cost metrics.

### 3. Incubator Application (Edge AI Prototype) - Rapid SLM Experimentation

Initialize a lightweight experimental environment for testing small language models (SLMs) at the edge with minimal governance overhead, enabling rapid iteration.

**Success Indicator:** SLM model loads successfully; inference latency <500ms on edge device; can swap models without redeployment.

### 4. Internal Application (Sentratorium Web) - AI Session Monitoring

Initialize a comprehensive Next.js dashboard for real-time monitoring of all AI agent sessions, token usage, costs, performance metrics, and governance violations.

**Success Indicator:** Dashboard loads <3 seconds; displays live data with <5 second latency; operators can filter sessions by domain, date range, and status.

### 5. Integrate Shared Substrate Across All Applications

Verify that all four applications correctly consume shared libraries (`@the-abyss/ui`, `@the-abyss/database`, `@the-abyss/ai-core`, `@the-abyss/langflow-client`) using workspace dependencies.

**Success Indicator:** All apps build successfully with `pnpm turbo run build`; no dependency conflicts or circular dependencies detected; shared package updates propagate to all apps automatically.

### 6. Establish Domain-Specific Governance

Create local `AGENTS.md` files and governance rules for each domain, enforcing healthcare HIPAA requirements, academic compliance standards, and incubator rapid-iteration practices.

**Success Indicator:** Healthcare commits blocked by CI if FHIR validation fails; incubator allows experimental code with warning labels; all governance rules documented and tested.

### 7. Execute End-to-End Integration Testing

Develop Playwright E2E tests validating complete workflows across applications (e.g., healthcare referral creation → simulation execution → Sentratorium logging).

**Success Indicator:** E2E tests pass 100%; cross-app workflows execute without errors; integration test suite runs in <5 minutes.

---

## Scope & Deliverables

**Phase 5 Duration:** 5-6 weeks (35-42 calendar days)

**Key Deliverables:**

- **`apps/healthcare/referralink-api/`** — Fully scaffolded NestJS project with:
- `/referrals` CRUD endpoints with FHIR validation
- HIPAA audit trail middleware
- Swagger/OpenAPI documentation
- Database migrations for referral schema
- Docker multi-stage build and K8s manifests

- **`apps/academic/clinical-simulator/`** — Fully scaffolded Next.js + Python project with:
- Simulation UI built with `@the-abyss/ui` components
- Python evaluation engine for model benchmarking
- Integration with Orchestrator for flow execution
- Performance report generation (PDF export)
- Deployment manifests

- **`apps/incubator/edge-ai-prototype/`** — Lightweight scaffolding with:
- Model management interface (load/unload SLMs)
- Inference API with minimal validation
- Relaxed governance rules (`AGENTS.md` permissive)
- Docker setup for edge deployment
- Placeholder for future extensions

- **`apps/internal/sentratorium-web/`** — Next.js dashboard with:
- Real-time session explorer with filtering
- Token usage and cost tracking visualizations
- Domain-specific performance analytics
- Governance violation tracker
- Dark mode theme using `@the-abyss/ui`

- **Local Governance Files** — Domain-specific rules:
- `apps/healthcare/AGENTS.md` (strict HIPAA rules)
- `apps/academic/AGENTS.md` (educational compliance)
- `apps/incubator/AGENTS.md` (relaxed experimental rules)
- `apps/internal/AGENTS.md` (operational oversight)

- **E2E Test Suite** — Playwright tests validating:
- Healthcare referral creation → storage → audit log
- Academic simulation execution → performance report
- Sentratorium session tracking and filtering
- Cross-app workflow integrity

- **Complete Documentation:**
- Application architecture diagrams for each app
- Domain-specific governance rules documentation
- Deployment runbooks (staging and production)
- Developer onboarding guide for each application

---

## Phase 5 Sub-Tasks Breakdown

### Sub-Task 5.1: Healthcare Application Scaffolding (Referralink API)

**Owner:** Senior Backend Engineer / Healthcare Domain Lead  
**Duration:** 5-6 days  
**Status:** Scheduled

#### Objective

Initialize a HIPAA-compliant NestJS API for clinical referral management, integrating FHIR R4 validation, audit logging, and Orchestrator for AI-powered workflows.

#### Detailed Steps

1. Initialize NestJS project structure:

```bash
cd apps/healthcare
pnpm create-app referralink-api --template nestjs
cd referralink-api
pnpm add @nestjs/common @nestjs/core @nestjs/typeorm @nestjs/swagger \
  @the-abyss/database @the-abyss/shared-types @the-abyss/ai-core \
  @the-abyss/langflow-client @the-abyss/fhir-engine \
  class-validator class-transformer uuid
```

1. Create core application structure:

```
apps/healthcare/referralink-api/
├── src/
│   ├── main.ts                    # NestJS entry point
│   ├── app.module.ts              # Root module
│   ├── referrals/
│   │   ├── referrals.controller.ts
│   │   ├── referrals.service.ts
│   │   ├── dto/
│   │   │   ├── create-referral.dto.ts
│   │   │   └── referral-response.dto.ts
│   │   └── referrals.module.ts
│   ├── practitioners/
│   │   ├── practitioners.controller.ts
│   │   ├── practitioners.service.ts
│   │   └── practitioners.module.ts
│   ├── middleware/
│   │   ├── audit-logger.middleware.ts
│   │   ├── hipaa-validator.middleware.ts
│   │   └── fhir-interceptor.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── fhir.config.ts
│   └── common/
│       ├── guards/
│       │   └── auth.guard.ts
│       └── filters/
│           └── hipaa-error.filter.ts
├── prisma/
│   ├── schema.prisma              # Healthcare-specific schema
│   └── migrations/                # Database migrations
├── test/
│   ├── referrals.e2e.spec.ts
│   └── fhir-validation.spec.ts
├── docker/
│   └── Dockerfile                 # Multi-stage build
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── package.json
├── tsconfig.json                  # Extends @the-abyss/config-typescript
├── .eslintrc.js                   # Extends @the-abyss/config-eslint/healthcare
└── AGENTS.md                      # Healthcare governance rules
```

1. Initialize Prisma schema with healthcare entities:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Referral {
  id            String   @id @default(cuid())
  organizationId String
  
  // Referral Details
  referralId    String   @unique // FHIR Referral.id equivalent
  status        ReferralStatus
  subject       String   // Patient FHIR ID
  requester     String   // Practitioner FHIR ID
  recipient     String   // Recipient Practitioner FHIR ID
  
  // Clinical Context
  reason        String?  @db.Text
  specialty     String   // SNOMED CT code
  priority      String   // routine | urgent | asap | stat
  
  // FHIR Resource
  fhirResource  Json     // Full FHIR Referral resource
  
  // Audit Trail
  createdAt     DateTime @default(now())
  createdBy     String   // Practitioner user ID
  updatedAt     DateTime @updatedAt
  
  auditLogs     AuditLog[]
  
  @@index([organizationId, createdAt])
}

enum ReferralStatus {
  DRAFT
  PENDING_REVIEW
  ACCEPTED
  REJECTED
  CANCELLED
}

model Practitioner {
  id            String   @id @default(cuid())
  organizationId String
  
  // FHIR Practitioner data
  npiNumber     String   @unique
  fhirId        String   @unique
  name          String
  specialty     String   // SNOMED CT code
  email         String
  
  // System metadata
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  
  @@index([organizationId])
}
```

1. Create FHIR validation middleware:

```typescript
// src/middleware/fhir-interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, BadRequestException } from '@nestjs/common';
import { FHIRValidator } from '@the-abyss/fhir-engine';
import { createAuditLog } from '@the-abyss/database';

@Injectable()
export class FHIRInterceptor implements NestInterceptor {
  constructor(private fhirValidator: FHIRValidator) {}

  async intercept(context: ExecutionContext, next) {
    const request = context.switchToHttp().getRequest();
    const { body } = request;

    // Validate FHIR resource if present
    if (body.fhirResource) {
      const validation = this.fhirValidator.validate(body.fhirResource);
      
      if (!validation.valid) {
        // Log validation failure to audit trail
        await createAuditLog({
          organizationId: request.organizationId,
          action: 'validation_failed',
          resource: 'Referral',
          metadata: {
            errors: validation.errors,
            resourceType: body.fhirResource.resourceType,
          },
        });

        throw new BadRequestException({
          message: 'FHIR validation failed',
          errors: validation.errors,
        });
      }

      // Attach validated resource
      request.validatedFHIR = body.fhirResource;
    }

    return next.handle();
  }
}
```

1. Create Referral service with Orchestrator integration:

```typescript
// src/referrals/referrals.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@the-abyss/database';
import { LangflowClient } from '@the-abyss/langflow-client';
import { FHIRValidator } from '@the-abyss/fhir-engine';
import { createAuditLog } from '@the-abyss/database';

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaClient,
    private langflowClient: LangflowClient,
    private fhirValidator: FHIRValidator,
  ) {}

  async createReferral(params: {
    organizationId: string;
    userId: string;
    subject: string;
    requester: string;
    recipient: string;
    specialty: string;
    reason?: string;
  }) {
    // Build FHIR Referral resource
    const referralResource = {
      resourceType: 'Referral',
      id: `referral-${Date.now()}`,
      status: 'draft',
      subject: { reference: `Patient/${params.subject}` },
      requester: { reference: `Practitioner/${params.requester}` },
      recipient: [{ reference: `Practitioner/${params.recipient}` }],
      specialty: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: params.specialty,
          },
        ],
      },
      reasonCode: params.reason ? [{ text: params.reason }] : undefined,
    };

    // Validate FHIR resource
    const validation = this.fhirValidator.validate('Referral', referralResource);
    if (!validation.valid) {
      throw new Error(`FHIR validation failed: ${JSON.stringify(validation.errors)}`);
    }

    // Create referral in database
    const referral = await this.prisma.referral.create({
      data: {
        organizationId: params.organizationId,
        referralId: referralResource.id,
        status: 'DRAFT',
        subject: params.subject,
        requester: params.requester,
        recipient: params.recipient,
        specialty: params.specialty,
        reason: params.reason,
        fhirResource: referralResource,
        createdBy: params.userId,
      },
    });

    // Log to audit trail
    await createAuditLog({
      organizationId: params.organizationId,
      userId: params.userId,
      action: 'created',
      resource: 'Referral',
      resourceId: referral.id,
      metadata: {
        fhirId: referralResource.id,
        specialty: params.specialty,
      },
    });

    // Trigger AI analysis via Orchestrator
    const aiAnalysis = await this.langflowClient.executeFlow({
      flowId: 'referral-analysis-v1',
      input: {
        referral: referralResource,
        patientId: params.subject,
      },
      sessionId: `sess_ref_${referral.id}`,
    });

    return {
      ...referral,
      aiInsights: aiAnalysis.output,
    };
  }

  async getReferral(id: string, organizationId: string) {
    // Log access for HIPAA audit trail
    await createAuditLog({
      organizationId,
      action: 'accessed',
      resource: 'Referral',
      resourceId: id,
    });

    return this.prisma.referral.findUnique({
      where: { id },
    });
  }
}
```

1. Create Referrals controller with Swagger documentation:

```typescript
// src/referrals/referrals.controller.ts
import { Controller, Post, Get, Param, Body, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { FHIRInterceptor } from '../middleware/fhir-interceptor';

@ApiTags('Referrals')
@Controller('referrals')
@UseInterceptors(FHIRInterceptor)
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new clinical referral' })
  @ApiResponse({ status: 201, description: 'Referral created successfully' })
  async create(@Body() createReferralDto: CreateReferralDto) {
    return this.referralsService.createReferral(createReferralDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a referral by ID' })
  async get(@Param('id') id: string) {
    return this.referralsService.getReferral(id, 'org-123'); // From auth context
  }
}
```

1. Create healthcare-specific AGENTS.md:

```markdown
# Healthcare Domain Governance Rules

## Core Principles

### HIPAA Compliance
- **Never** log or expose Protected Health Information (PHI) in plain text
- All patient data access must be logged to AuditLog table
- Encryption required for all data in transit (TLS 1.3+) and at rest

### FHIR R4 Standards
- All clinical resources must validate against FHIR R4 schema
- Use standard SNOMED CT codes for medical terminology
- Bundle transactions for atomic database operations

### Audit Trail
- Every CRUD operation on Patient, Practitioner, Referral must log to AuditLog
- Immutable logs: append-only, never delete or modify audit entries
- Retention: minimum 7 years for healthcare records

## Prohibited Actions
- ❌ No console.log() for any PHI data (enforced by ESLint)
- ❌ No experimental AI models for clinical decision support
- ❌ No direct incubator package imports (use strict AI consensus)
- ❌ No database queries bypassing ORM (always use Prisma)

## Required Validations
- ✅ All referral endpoints require FHIR validation
- ✅ All practitioner updates require NPI verification
- ✅ All clinical actions trigger Orchestrator flows for consistency
- ✅ All responses must include audit context

## Role-Based Access Control
- **ADMIN**: Full access to all referrals and audit logs
- **CLINICIAN**: Access to assigned referrals only
- **VIEWER**: Read-only access to performance dashboards
```

1. Create Docker multi-stage build:

```dockerfile
# docker/Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm turbo run build --filter="healthcare"

# Production stage
FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/healthcare/referralink-api/dist ./dist
COPY --from=builder /app/apps/healthcare/referralink-api/package.json .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

#### Success Criteria

- NestJS application bootstraps with zero errors
- PostgreSQL connects successfully (via Prisma)
- All FHIR validation tests pass (against HL7 test suite)
- Swagger documentation auto-generated and accessible at `/api/docs`
- HIPAA audit middleware logs all PHI access
- Healthcare-specific ESLint rules enforced (`no-console`, `require-jsdoc`)
- Docker build completes in <5 minutes; image size <200MB
- K8s manifests deploy successfully to staging cluster

#### Deliverables

- Fully scaffolded NestJS project with modular structure
- Prisma schema with healthcare entities (Referral, Practitioner)
- FHIR validation middleware and interceptors
- Referral CRUD service with Orchestrator integration
- Swagger OpenAPI documentation
- Healthcare-specific AGENTS.md governance file
- Docker multi-stage Dockerfile
- Kubernetes deployment and service manifests

---

### Sub-Task 5.2: Academic Application Scaffolding (Clinical Simulator)

**Owner:** Full-Stack Engineer / Academic Domain Lead  
**Duration:** 5-6 days  
**Status:** Scheduled

#### Objective

Initialize a Next.js frontend with integrated Python evaluation engine for simulating clinical scenarios, assessing AI performance, and generating performance reports.

#### Detailed Steps

1. Initialize Next.js 14 project with TypeScript:

```bash
cd apps/academic
pnpm create-app clinical-simulator --template nextjs
cd clinical-simulator
pnpm add @the-abyss/ui @the-abyss/shared-types @the-abyss/langflow-client \
  next-themes axios react-query @tanstack/react-query tailwindcss \
  recharts date-fns
```

1. Create project structure:

```
apps/academic/clinical-simulator/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with theme
│   │   ├── page.tsx               # Home page
│   │   ├── simulations/
│   │   │   ├── page.tsx           # Simulation list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx       # Simulation detail
│   │   │   └── new/
│   │   │       └── page.tsx       # Create simulation
│   │   ├── scenarios/
│   │   │   ├── page.tsx           # Scenario library
│   │   │   └── [id]/page.tsx      # Scenario detail
│   │   └── reports/
│   │       ├── page.tsx           # Performance reports
│   │       └── [id]/page.tsx      # Report detail
│   ├── components/
│   │   ├── simulation/
│   │   │   ├── SimulationCard.tsx
│   │   │   ├── SimulationRunner.tsx
│   │   │   └── PerformanceChart.tsx
│   │   ├── scenarios/
│   │   │   ├── ScenarioSelector.tsx
│   │   │   └── ScenarioDetail.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── api-client.ts          # Axios instance
│   │   ├── orchestrator.ts        # Langflow integration
│   │   └── simulation-utils.ts    # Utility functions
│   └── hooks/
│       ├── useSimulation.ts
│       └── useScenario.ts
├── python/                        # Python evaluation engine
│   ├── main.py                    # FastAPI server
│   ├── evaluator.py               # Evaluation logic
│   ├── models.py                  # Pydantic models
│   └── requirements.txt
├── tailwind.config.js
├── next.config.js
├── AGENTS.md                      # Academic governance rules
└── package.json
```

1. Create Next.js layout with theme support:

```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes'
import { ReactQueryProvider } from '@/lib/react-query'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import '@/styles/globals.css'

export const metadata = {
  title: 'Clinical Simulator | Sentra',
  description: 'AI-powered clinical scenario simulation and evaluation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          <ReactQueryProvider>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <Header />
                {children}
              </main>
            </div>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

1. Create Simulation Runner component:

```typescript
// src/components/simulation/SimulationRunner.tsx
'use client'

import { useState } from 'react'
import { Button, Card, Badge } from '@the-abyss/ui'
import { useOrchestrator } from '@/hooks/useOrchestrator'
import PerformanceChart from './PerformanceChart'

interface SimulationRunnerProps {
  scenarioId: string
  modelId: string
}

export default function SimulationRunner({ scenarioId, modelId }: SimulationRunnerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const { executeFlow } = useOrchestrator()

  const handleRunSimulation = async () => {
    setIsRunning(true)
    try {
      const result = await executeFlow({
        flowId: 'clinical-evaluation-v1',
        input: {
          scenarioId,
          modelId,
          timestamp: new Date().toISOString(),
        },
      })

      setResults({
        accuracy: result.output.accuracy,
        latencyMs: result.latencyMs,
        tokensUsed: result.tokensUsed,
        cost: result.output.cost,
        feedback: result.output.feedback,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Run Simulation</h3>
          <Button
            onClick={handleRunSimulation}
            disabled={isRunning}
            variant="clinical"
          >
            {isRunning ? 'Running...' : 'Start Simulation'}
          </Button>
        </div>
      </Card>

      {results && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-3xl font-bold">
              {(results.accuracy * 100).toFixed(1)}%
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Latency</p>
            <p className="text-3xl font-bold">{results.latencyMs}ms</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Tokens</p>
            <p className="text-3xl font-bold">{results.tokensUsed}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Cost</p>
            <p className="text-3xl font-bold">${results.cost.toFixed(4)}</p>
          </Card>
        </div>
      )}

      {results?.feedback && (
        <PerformanceChart data={results.feedback} />
      )}
    </div>
  )
}
```

1. Create Python evaluation engine (FastAPI):

```python
# python/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from evaluator import ClinicalEvaluator
import logging

app = FastAPI(title="Clinical Simulator Evaluator")
evaluator = ClinicalEvaluator()

class SimulationRequest(BaseModel):
    scenario_id: str
    model_id: str
    ai_response: str
    expected_output: str

class SimulationResponse(BaseModel):
    accuracy: float
    latency_ms: int
    tokens_used: int
    cost: float
    feedback: dict
    model_performance: dict

@app.post("/evaluate")
async def evaluate_response(request: SimulationRequest) -> SimulationResponse:
    """Evaluate AI response against clinical scenario expectations."""
    try:
        result = await evaluator.evaluate(
            scenario_id=request.scenario_id,
            model_id=request.model_id,
            ai_response=request.ai_response,
            expected_output=request.expected_output,
        )
        
        return SimulationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

1. Create Academic governance rules (AGENTS.md):

```markdown
# Academic Domain Governance Rules

## Core Principles

### Educational Integrity
- All simulations must have documented expected outcomes
- Performance metrics must be transparent and auditable
- Model comparisons require reproducible test data

### Evaluation Standards
- Accuracy benchmarks aligned with medical licensing exams (USMLE, AAMC)
- Performance reports must include confidence intervals
- Cost-per-simulation tracked for resource optimization

### Research Ethics
- All AI model usage logged for reproducibility
- Experimental models clearly labeled as "research only"
- No clinical decision-making on unevaluated models

## Permitted Activities
- ✅ A/B testing multiple models on same scenarios
- ✅ Rapid iteration of evaluation metrics
- ✅ Long-running benchmark suites
- ✅ Export raw performance data for analysis

## Prohibited Activities
- ❌ Using evaluation results for clinical decisions
- ❌ Mixing healthcare patient data with academic simulations
- ❌ Publishing unapproved performance comparisons
```

1. Create Docker setup for Python evaluator:

```dockerfile
# Dockerfile.evaluator
FROM python:3.11-slim
WORKDIR /app

COPY python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY python/ .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

1. Create Docker Compose for local development:

```yaml
# docker-compose.yml
version: '3.8'

services:
  simulator:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://evaluator:8000

  evaluator:
    build:
      context: .
      dockerfile: Dockerfile.evaluator
    ports:
      - "8000:8000"
    environment:
      LOG_LEVEL: info
```

#### Success Criteria

- Next.js app starts with `pnpm dev` without errors
- All shared UI components render correctly
- Simulation runner executes Langflow flows successfully
- Python evaluator responds in <1 second for benchmark requests
- Performance charts render with real data
- Academic ESLint rules enforced
- Docker Compose orchestrates frontend + evaluator backend
- E2E tests validate simulation workflow (create → run → report)

#### Deliverables

- Fully scaffolded Next.js 14 application
- Simulation runner component with flow integration
- Performance visualization components
- Python FastAPI evaluation engine
- Docker Compose setup for local development
- Academic-specific AGENTS.md governance file
- Scenario library and simulation templates

---

### Sub-Task 5.3: Incubator Application Scaffolding (Edge AI Prototype)

**Owner:** ML Engineer / Research Lead  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Initialize a lightweight experimental environment for rapid small language model (SLM) testing and iteration with minimal governance overhead, enabling edge deployment.

#### Detailed Steps

1. Initialize lightweight Node.js project:

```bash
cd apps/incubator
pnpm create-app edge-ai-prototype --template node
cd edge-ai-prototype
pnpm add express @the-abyss/shared-types @the-abyss/ai-core \
  axios dotenv cors compression
```

1. Create minimal structure:

```
apps/incubator/edge-ai-prototype/
├── src/
│   ├── index.ts                   # Express server
│   ├── routes/
│   │   ├── models.ts              # Model management
│   │   └── inference.ts           # Inference API
│   ├── services/
│   │   ├── model-loader.ts
│   │   └── inference-engine.ts
│   └── types/
│       └── model.ts
├── models/                        # Model storage
│   └── .gitkeep
├── AGENTS.md                      # Incubator governance (relaxed)
├── package.json
└── README.md
```

1. Create Express server with model management:

```typescript
// src/index.ts
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import modelsRouter from './routes/models'
import inferenceRouter from './routes/inference'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(compression())
app.use(express.json())

// Routes
app.use('/models', modelsRouter)
app.use('/inference', inferenceRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() })
})

app.listen(PORT, () => {
  console.log(`Edge AI Prototype listening on port ${PORT}`)
})
```

1. Create model management API:

```typescript
// src/routes/models.ts
import express from 'express'
import { ModelLoader } from '../services/model-loader'

const router = express.Router()
const modelLoader = new ModelLoader()

// List available models
router.get('/', async (req, res) => {
  const models = await modelLoader.listModels()
  res.json(models)
})

// Load model into memory
router.post('/:modelId/load', async (req, res) => {
  try {
    const model = await modelLoader.loadModel(req.params.modelId)
    res.json({ success: true, model })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Unload model
router.post('/:modelId/unload', async (req, res) => {
  await modelLoader.unloadModel(req.params.modelId)
  res.json({ success: true })
})

export default router
```

1. Create incubator-specific governance rules:

```markdown
# Incubator Domain Governance Rules

## Philosophy
Incubator is a **"move fast and break things"** environment for rapid experimentation with AI models, with minimal governance overhead.

## Core Principles

### Rapid Iteration
- Experimental code allowed without full test coverage
- Models can be swapped or updated without approval
- Failures logged but not blocking

### Relaxed Governance
- ⚠️ WARNING labels required on experimental models
- No HIPAA requirements (never use patient data)
- No production deployment without chief approval

## Permitted Activities
- ✅ Load/unload SLMs dynamically
- ✅ Test cutting-edge model architectures
- ✅ Skip comprehensive testing for prototypes
- ✅ Iterate rapidly based on real-time feedback

## Prohibited Activities
- ❌ No production traffic to incubator models
- ❌ No patient/clinical data in incubator
- ❌ No promises to end users about model stability
- ❌ No permanent deployment without moving to proper app

## Approval Gate
Before moving experimental model to healthcare or academic:
1. Comprehensive test suite required (>80% coverage)
2. Chief engineer approval required
3. Move model code to appropriate package
```

1. Create Docker image for edge deployment:

```dockerfile
# Dockerfile
FROM node:22-slim
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

COPY dist ./dist

EXPOSE 5000
CMD ["node", "dist/index.js"]
```

#### Success Criteria

- Express server starts and responds to `/health`
- Model loading/unloading works without crashes
- Inference API returns results in <500ms
- Docker image builds and runs on edge device (ARM64)
- Models can be updated without restarting server
- Incubator AGENTS.md enforces warning labels on experimental code

#### Deliverables

- Lightweight Node.js Express application
- Model management API for loading/unloading
- Inference API with minimal validation
- Incubator-specific AGENTS.md (relaxed rules)
- Docker image for edge deployment
- README with experimental model documentation

---

### Sub-Task 5.4: Internal Application Scaffolding (Sentratorium Web)

**Owner:** Frontend Engineer / DevOps Lead  
**Duration:** 5-7 days  
**Status:** Scheduled

#### Objective

Initialize a comprehensive Next.js dashboard for real-time monitoring of AI sessions, token usage, costs, performance metrics, and governance violations.

#### Detailed Steps

1. Initialize Next.js with dashboard dependencies:

```bash
cd apps/internal
pnpm create-app sentratorium-web --template nextjs
cd sentratorium-web
pnpm add @the-abyss/ui @the-abyss/shared-types @the-abyss/database \
  recharts date-fns axios react-query next-auth @tanstack/react-query \
  zustand @tanstack/react-table lucide-react
```

1. Create dashboard structure:

```
apps/internal/sentratorium-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Dashboard home
│   │   ├── sessions/
│   │   │   ├── page.tsx           # Session explorer
│   │   │   └── [id]/page.tsx      # Session detail
│   │   ├── analytics/
│   │   │   ├── page.tsx           # Cost analysis
│   │   │   └── models.tsx         # Model performance
│   │   ├── violations/
│   │   │   └── page.tsx           # Governance violations
│   │   └── settings/
│   │       └── page.tsx           # Dashboard settings
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── MetricsCard.tsx
│   │   │   ├── SessionTable.tsx
│   │   │   └── CostChart.tsx
│   │   ├── sessions/
│   │   │   ├── SessionExplorer.tsx
│   │   │   ├── SessionDetail.tsx
│   │   │   └── SessionFilter.tsx
│   │   └── analytics/
│   │       ├── TokenUsageChart.tsx
│   │       ├── CostAnalysis.tsx
│   │       └── ModelComparison.tsx
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   ├── store.ts               # Zustand store
│   │   └── utils.ts
│   └── hooks/
│       ├── useSessions.ts
│       └── useAnalytics.ts
├── AGENTS.md                      # Internal governance
└── package.json
```

1. Create main dashboard page:

```typescript
// src/app/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, Button } from '@the-abyss/ui'
import MetricsCard from '@/components/dashboard/MetricsCard'
import SessionTable from '@/components/dashboard/SessionTable'
import CostChart from '@/components/dashboard/CostChart'
import { getMetrics, getSessions } from '@/lib/api'

export default function DashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: getMetrics,
    refetchInterval: 5000,
  })

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
    refetchInterval: 10000,
  })

  return (
    <div className="space-y-8 p-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricsCard
          title="Total Sessions"
          value={metrics?.totalSessions || 0}
          trend="+12%"
        />
        <MetricsCard
          title="Success Rate"
          value={`${(metrics?.successRate * 100).toFixed(1)}%`}
          trend={metrics?.successRateTrend}
        />
        <MetricsCard
          title="Avg Latency"
          value={`${metrics?.avgLatency}ms`}
          trend={metrics?.latencyTrend}
        />
        <MetricsCard
          title="Daily Cost"
          value={`$${metrics?.dailyCost.toFixed(2)}`}
          trend={metrics?.costTrend}
        />
      </div>

      {/* Recent Sessions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        <SessionTable sessions={sessions?.slice(0, 10)} />
      </Card>

      {/* Cost Trend */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">7-Day Cost Trend</h2>
        <CostChart data={metrics?.costTrend} />
      </Card>
    </div>
  )
}
```

1. Create Session Explorer component:

```typescript
// src/components/sessions/SessionExplorer.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table, Badge, Button } from '@the-abyss/ui'
import SessionFilter from './SessionFilter'
import { getSessions } from '@/lib/api'

export default function SessionExplorer() {
  const [filters, setFilters] = useState({
    domain: null,
    status: null,
    startDate: null,
    endDate: null,
  })

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => getSessions(filters),
  })

  if (isLoading) return <div>Loading sessions...</div>

  return (
    <div className="space-y-4">
      <SessionFilter onChange={setFilters} />

      <Table
        columns={[
          { key: 'sessionId', header: 'Session ID' },
          { key: 'domain', header: 'Domain' },
          { key: 'agentType', header: 'Agent Type' },
          { key: 'modelUsed', header: 'Model' },
          { key: 'latencyMs', header: 'Latency (ms)' },
          { key: 'costUsd', header: 'Cost' },
          {
            key: 'status',
            header: 'Status',
            render: (value) => (
              <Badge variant={value === 'success' ? 'success' : 'error'}>
                {value}
              </Badge>
            ),
          },
        ]}
        data={sessions || []}
      />
    </div>
  )
}
```

1. Create Cost Analysis chart:

```typescript
// src/components/analytics/CostAnalysis.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { getCostAnalysis } from '@/lib/api'

export default function CostAnalysis() {
  const { data } = useQuery({
    queryKey: ['costAnalysis'],
    queryFn: () => getCostAnalysis({ period: '7days' }),
  })

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Cost by Domain</h3>
      <BarChart width={600} height={300} data={data?.costByDomain}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="domain" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="cost" fill="#EF4444" />
      </BarChart>
    </div>
  )
}
```

1. Create internal governance rules:

```markdown
# Internal Domain Governance Rules

## Purpose
Sentratorium is the **operational hub** for monitoring and managing The Abyss platform.

## Core Principles

### Operational Oversight
- Real-time visibility into all AI agent sessions
- Cost tracking and budget enforcement
- Performance monitoring and alerting
- Governance violation detection

### Data Access
- All users can view their own organization's data
- Admins can view cross-organization analytics
- No modification of session data (audit logs are immutable)

### Alerting & Response
- Cost overages trigger immediate alerts
- Performance degradation triggers auto-scaling
- Governance violations block deployments

## Required Dashboards
- ✅ Session explorer with filtering
- ✅ Real-time cost tracking
- ✅ Model performance comparison
- ✅ Governance violation tracker
- ✅ System health status

## Alert Thresholds
- Cost/hour exceeds $1000 → Alert
- Error rate > 5% → Alert
- P99 latency > 5s → Alert
- Shadow mode agreement < 90% → Automatic rollback
```

1. Create Zustand store for real-time updates:

```typescript
// src/lib/store.ts
import { create } from 'zustand'

interface DashboardStore {
  metrics: any
  sessions: any[]
  filters: Record<string, any>
  setMetrics: (metrics: any) => void
  setSessions: (sessions: any[]) => void
  setFilters: (filters: Record<string, any>) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  metrics: null,
  sessions: [],
  filters: {},
  setMetrics: (metrics) => set({ metrics }),
  setSessions: (sessions) => set({ sessions }),
  setFilters: (filters) => set({ filters }),
}))
```

#### Success Criteria

- Dashboard loads <3 seconds
- Real-time metrics update every 5 seconds
- Session filtering works across domain, date, status
- Cost charts render with historical data
- Dark mode toggle works consistently
- Mobile responsive on tablets and phones
- All queries optimized with React Query caching
- Export to CSV functional for compliance audits

#### Deliverables

- Fully scaffolded Next.js dashboard application
- Session explorer with filtering capabilities
- Real-time metrics and cost visualization
- Model performance comparison dashboard
- Governance violation tracker
- Dark mode support via `@the-abyss/ui`
- Internal-specific AGENTS.md governance file
- Docker deployment manifests

---

### Sub-Task 5.5: Shared Substrate Integration

**Owner:** Technical Lead / Platform Engineer  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Verify that all four applications correctly consume shared libraries via workspace dependencies, with zero conflicts or circular dependencies.

#### Detailed Steps

1. Verify workspace dependency resolution:

```bash
# In each app directory
pnpm list @the-abyss/ui @the-abyss/database @the-abyss/ai-core @the-abyss/langflow-client

# Should output:
# @the-abyss/ui@1.0.0 (workspace:*)
# @the-abyss/database@1.0.0 (workspace:*)
# @the-abyss/ai-core@1.0.0 (workspace:*)
# @the-abyss/langflow-client@1.0.0 (workspace:*)
```

1. Run dependency audit across monorepo:

```bash
pnpm turbo run lint --filter="./apps/*"
pnpm turbo run type-check --filter="./apps/*"
pnpm turbo run build --filter="./packages/*" --filter="./apps/*"
```

1. Create integration test for shared packages:

```typescript
// Integration test file
describe('Shared Substrate Integration', () => {
  it('All apps import @the-abyss/ui successfully', async () => {
    const ui = await import('@the-abyss/ui')
    expect(ui.Button).toBeDefined()
    expect(ui.Card).toBeDefined()
  })

  it('All apps import @the-abyss/database successfully', async () => {
    const db = await import('@the-abyss/database')
    expect(db.prisma).toBeDefined()
  })

  it('All apps import @the-abyss/ai-core successfully', async () => {
    const aiCore = await import('@the-abyss/ai-core')
    expect(aiCore.ConsensusEngine).toBeDefined()
  })

  it('All apps import @the-abyss/langflow-client successfully', async () => {
    const client = await import('@the-abyss/langflow-client')
    expect(client.LangflowClient).toBeDefined()
  })
})
```

1. Verify circular dependency detection:

```bash
# Use madge to detect circular dependencies
pnpm add --save-dev madge

pnpm madge apps/*/src --circular --extensions ts,tsx,js
# Should output: No circular dependencies found
```

1. Document dependency consumption per app:

```markdown
# Shared Substrate Consumption

## apps/healthcare/referralink-api
- @the-abyss/database → Prisma, audit logging
- @the-abyss/fhir-engine → FHIR validation
- @the-abyss/ai-core → Consensus engine
- @the-abyss/langflow-client → Flow execution
- @the-abyss/shared-types → Type contracts

## apps/academic/clinical-simulator
- @the-abyss/ui → React components
- @the-abyss/database → Session storage
- @the-abyss/ai-core → Model evaluation
- @the-abyss/langflow-client → Scenario flows
- @the-abyss/shared-types → Type contracts

## apps/incubator/edge-ai-prototype
- @the-abyss/ai-core → Model inference
- @the-abyss/shared-types → Type contracts

## apps/internal/sentratorium-web
- @the-abyss/ui → Dashboard components
- @the-abyss/database → Query sessions
- @the-abyss/shared-types → Type contracts
```

#### Success Criteria

- All workspace dependencies resolve correctly
- Zero circular dependencies detected
- All apps build successfully with shared packages
- Type checking passes across all apps and packages
- No duplicate packages in node_modules
- Shared package updates automatically cascade to apps
- Integration tests pass 100%

#### Deliverables

- Dependency resolution verification report
- Circular dependency check results
- Integration test suite
- Shared substrate consumption documentation
- Build cache validation results

---

### Sub-Task 5.6: Domain-Specific Governance Integration

**Owner:** Platform Lead / Chief Engineer  
**Duration:** 2-3 days  
**Status:** Scheduled

#### Objective

Establish domain-specific governance rules via local AGENTS.md files and CI/CD enforcement, ensuring healthcare HIPAA compliance, academic standards, and incubator flexibility.

#### Detailed Steps

1. Create healthcare-specific pre-commit hooks:

```bash
# .husky/pre-commit

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check if file is in healthcare domain
if [[ $(git diff --cached --name-only) == *"apps/healthcare"* ]]; then
  echo "🏥 Healthcare domain detected - Running strict ESLint rules..."
  pnpm lint --filter="healthcare" --fix
  
  # Validate HIPAA compliance
  if ! pnpm validate:hipaa --filter="healthcare"; then
    echo "❌ HIPAA validation failed"
    exit 1
  fi
fi
```

1. Create domain boundary validator in CI:

```yaml
# .github/workflows/domain-boundary-check.yml
name: Domain Boundary Enforcement

on:
  pull_request:
    paths:
      - "apps/**"
      - "packages/**"

jobs:
  boundary-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check Healthcare Imports
        run: |
          # Block healthcare from importing incubator packages
          if grep -r "@the-abyss/incubator" apps/healthcare/; then
            echo "❌ Healthcare cannot import incubator packages"
            exit 1
          fi
      
      - name: Validate AGENTS.md Rules
        run: |
          pnpm validate:governance
```

1. Create governance validation script:

```typescript
// scripts/validate-governance.ts
import fs from 'fs'
import path from 'path'

interface GovernanceRule {
  domain: string
  rules: {
    prohibited: string[]
    required: string[]
    relaxed: boolean
  }
}

const domains: Record<string, GovernanceRule> = {
  healthcare: {
    domain: 'healthcare',
    rules: {
      prohibited: [
        'console.log', // No PHI logging
        '@the-abyss/incubator', // No experimental imports
      ],
      required: [
        '@the-abyss/fhir-engine', // FHIR validation
        'audit-logging-middleware', // Audit trails
      ],
      relaxed: false,
    },
  },
  academic: {
    domain: 'academic',
    rules: {
      prohibited: [],
      required: ['performance-tracking'],
      relaxed: false,
    },
  },
  incubator: {
    domain: 'incubator',
    rules: {
      prohibited: [
        'patient-data', // No PHI
      ],
      required: [],
      relaxed: true, // Allow experimental code
    },
  },
}

export function validateGovernance(appPath: string) {
  const appName = path.basename(appPath)
  const domain = appPath.split('/')[1] // apps/healthcare → healthcare

  const rules = domains[domain]?.rules
  if (!rules) {
    console.warn(`⚠️  No governance rules defined for ${domain}`)
    return true
  }

  console.log(`🛡️  Validating ${domain} domain governance...`)

  // Check prohibited imports
  for (const prohibited of rules.prohibited) {
    const command = `grep -r "${prohibited}" "${appPath}/src"`
    // Execute and check for violations
  }

  console.log(`✅ Governance validation passed for ${domain}`)
  return true
}
```

1. Create governance violation reporter:

```typescript
// scripts/report-violations.ts
import { prisma } from '@the-abyss/database'

async function reportGovernanceViolations() {
  const violations = await prisma.governanceViolation.findMany({
    where: {
      resolvedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  console.log(`\n📋 Governance Violations Report\n`)
  console.log(`Total Unresolved: ${violations.length}`)

  const byDomain = violations.reduce((acc, v) => {
    acc[v.domain] = (acc[v.domain] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  for (const [domain, count] of Object.entries(byDomain)) {
    console.log(`  ${domain}: ${count}`)
  }
}

reportGovernanceViolations()
```

#### Success Criteria

- Pre-commit hooks validate domain-specific rules
- CI blocks healthcare PRs with HIPAA violations
- Domain boundary imports enforced (healthcare ≠ incubator)
- Governance violations logged to database
- Dashboard displays active violations
- Local AGENTS.md files match enforcement rules
- 100% of PRs validated for governance compliance

#### Deliverables

- Pre-commit and pre-push hook configurations
- Domain boundary validation CI/CD workflow
- Governance rule definitions and validators
- Violation reporter script
- Documentation of governance enforcement

---

### Sub-Task 5.7: End-to-End Integration Testing & Validation

**Owner:** QA Engineer / Test Automation Lead  
**Duration:** 4-5 days  
**Status:** Scheduled

#### Objective

Develop comprehensive Playwright E2E tests validating complete workflows across all applications (healthcare referral → academic simulation → Sentratorium logging).

#### Detailed Steps

1. Initialize Playwright:

```bash
pnpm add --save-dev @playwright/test @playwright/test-utils

pnpm exec playwright install
```

1. Create Playwright configuration:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
```

1. Create end-to-end test suite:

```typescript
// e2e/healthcare-to-sentratorium.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Healthcare → Academic → Sentratorium Workflow', () => {
  test('Complete referral creation and evaluation workflow', async ({ page }) => {
    // 1. Navigate to Healthcare API and create referral
    await page.goto('http://localhost:3001/referrals/new')
    
    await page.fill('input[name="patientId"]', 'patient-123')
    await page.fill('input[name="specialty"]', 'cardiology')
    await page.fill('textarea[name="reason"]', 'Chest pain evaluation')
    
    const createButton = page.locator('button:has-text("Create Referral")')
    await createButton.click()
    
    // Verify referral created
    await expect(page.locator('text=Referral created successfully')).toBeVisible()
    const referralId = await page.locator('[data-testid="referral-id"]').textContent()
    
    // 2. Navigate to Academic Simulator
    await page.goto('http://localhost:3002/simulations/new')
    
    // Link referral to simulation
    await page.fill('input[name="referralId"]', referralId)
    await page.selectOption('select[name="scenario"]', 'chest-pain-diagnosis')
    
    // Run simulation
    await page.click('button:has-text("Run Simulation")')
    
    // Wait for simulation to complete
    await expect(page.locator('[data-testid="simulation-complete"]')).toBeVisible({ timeout: 30000 })
    
    // Verify results displayed
    const accuracy = await page.locator('[data-testid="accuracy-score"]').textContent()
    expect(parseFloat(accuracy)).toBeGreaterThan(0.8)
    
    // 3. Verify session logged in Sentratorium
    await page.goto('http://localhost:3003')
    
    // Search for session
    await page.fill('input[name="search"]', referralId)
    await page.click('button:has-text("Search")')
    
    // Verify session appears
    await expect(page.locator(`text=${referralId}`)).toBeVisible()
    
    // Verify cost calculated
    const cost = await page.locator('[data-testid="session-cost"]').textContent()
    expect(parseFloat(cost)).toBeGreaterThan(0)
    
    // Verify audit log created
    await page.click('button:has-text("View Audit Log")')
    await expect(page.locator('text=FHIR validation passed')).toBeVisible()
  })

  test('Healthcare governance enforced on referral creation', async ({ page }) => {
    await page.goto('http://localhost:3001/referrals/new')
    
    // Try to submit with PHI exposure (should be blocked)
    await page.fill('input[name="notes"]', 'Patient SSN: 123-45-6789')
    
    const createButton = page.locator('button:has-text("Create Referral")')
    await createButton.click()
    
    // Expect validation error (PHI detected)
    await expect(page.locator('text=Contains protected health information')).toBeVisible()
  })

  test('Shadow mode comparison in academic simulator', async ({ page }) => {
    await page.goto('http://localhost:3002/simulations/new')
    
    await page.selectOption('select[name="scenario"]', 'chest-pain-diagnosis')
    await page.check('input[name="enableShadowMode"]')
    await page.selectOption('select[name="shadowModel"]', 'gpt-4-turbo')
    
    await page.click('button:has-text("Run Simulation")')
    
    // Wait for both primary and shadow to complete
    await expect(page.locator('[data-testid="shadow-comparison"]')).toBeVisible({ timeout: 60000 })
    
    // Verify agreement score displayed
    const agreement = await page.locator('[data-testid="agreement-score"]').textContent()
    expect(parseFloat(agreement)).toBeGreaterThan(0.85)
  })

  test('Cost tracking and alerts in Sentratorium', async ({ page }) => {
    await page.goto('http://localhost:3003')
    
    // Check for cost alerts
    const costWarning = page.locator('[data-testid="cost-warning"]')
    
    // If hourly cost exceeds $1000, warning should appear
    if (await costWarning.isVisible()) {
      await expect(costWarning).toContainText('Cost threshold exceeded')
    }
    
    // Verify cost trend chart renders
    await expect(page.locator('[data-testid="cost-trend-chart"]')).toBeVisible()
  })
})
```

1. Create API integration tests:

```typescript
// e2e/api-integration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('API Integration Tests', () => {
  test('Healthcare API returns valid FHIR response', async ({ request }) => {
    const response = await request.post('http://localhost:3001/referrals', {
      data: {
        subject: 'patient-123',
        requester: 'prac-001',
        specialty: '394579002', // SNOMED code for cardiology
        reason: 'Chest pain evaluation',
      },
    })

    expect(response.status()).toBe(201)
    
    const body = await response.json()
    expect(body).toHaveProperty('id')
    expect(body.fhirResource).toHaveProperty('resourceType', 'Referral')
  })

  test('Orchestrator executes flow and returns metrics', async ({ request }) => {
    const response = await request.post('http://localhost:4000/flows/clinical-eval-v1/run', {
      data: {
        input: {
          scenario: 'chest-pain',
          modelId: 'gpt-4-turbo',
        },
      },
    })

    expect(response.status()).toBe(200)
    
    const body = await response.json()
    expect(body).toHaveProperty('output')
    expect(body).toHaveProperty('latencyMs')
    expect(body).toHaveProperty('tokensUsed')
    expect(body).toHaveProperty('costUsd')
  })

  test('Sentratorium session logging works end-to-end', async ({ request }) => {
    // Trigger a flow execution
    await request.post('http://localhost:4000/flows/test-flow/run', {
      data: {
        input: { test: 'data' },
        sessionId: 'sess_test_123',
      },
    })

    // Query Sentratorium to verify session logged
    const response = await request.get('http://localhost:3003/api/sessions/sess_test_123')

    expect(response.status()).toBe(200)
    
    const body = await response.json()
    expect(body).toHaveProperty('sessionId', 'sess_test_123')
    expect(body).toHaveProperty('output')
    expect(body).toHaveProperty('tokenUsed')
  })
})
```

1. Create performance E2E tests:

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance & Load Tests', () => {
  test('Healthcare API responds within 500ms', async ({ request }) => {
    const start = Date.now()
    
    await request.post('http://localhost:3001/referrals', {
      data: {
        subject: 'patient-123',
        requester: 'prac-001',
        specialty: '394579002',
      },
    })
    
    const latency = Date.now() - start
    expect(latency).toBeLessThan(500)
  })

  test('Sentratorium dashboard loads in < 3 seconds', async ({ page }) => {
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' })
    
    const loadTime = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0].loadEventEnd
    })
    
    expect(loadTime).toBeLessThan(3000)
  })

  test('Simulation execution completes within 10 seconds', async ({ page }) => {
    await page.goto('http://localhost:3002/simulations/new')
    
    await page.selectOption('select[name="scenario"]', 'test-scenario')
    
    const start = Date.now()
    await page.click('button:has-text("Run Simulation")')
    await expect(page.locator('[data-testid="simulation-complete"]')).toBeVisible()
    
    const executionTime = Date.now() - start
    expect(executionTime).toBeLessThan(10000)
  })
})
```

#### Success Criteria

- All E2E tests pass 100% (3 browsers: Chromium, Firefox, WebKit)
- Cross-app workflows execute without errors
- Healthcare governance rules enforced in tests
- Performance benchmarks met (latency <500ms, dashboard <3s)
- Session logging verified end-to-end
- Cost tracking and alerts functional
- Test execution time <10 minutes for full suite
- Screenshot and trace artifacts generated for failures

#### Deliverables

- Playwright test suite with 20+ E2E tests
- API integration test suite
- Performance benchmark tests
- Cross-app workflow validation tests
- Healthcare governance rule enforcement tests
- Test execution reports and artifacts
- CI/CD integration for automated E2E testing

---

## Implementation Timeline

| Week | Sub-Tasks | Milestones |
| --- | --- | --- |
| **Week 1** | 5.1, 5.2 | Healthcare API scaffolded, Academic UI scaffolded |
| **Week 2** | 5.3, 5.4 | Incubator initialized, Sentratorium dashboard live |
| **Week 3** | 5.5, 5.6 | Shared substrate verified, governance rules enforced |
| **Week 4** | 5.7 | E2E tests written and passing 100% |
| **Week 5-6** | Integration & Documentation | All apps integrated, documented, staging-ready |

---

## Success Metrics & Verification Checklist

### Technical Metrics

- All 4 apps build successfully with `pnpm turbo run build`
- Zero TypeScript errors across all applications
- Healthcare API passes FHIR R4 validation suite
- Academic simulator benchmarks complete in <10 seconds
- Sentratorium dashboard loads <3 seconds

### Performance Metrics

- Healthcare API latency: <500ms (p99)
- Academic simulator execution: <10 seconds
- Sentratorium session search: <100ms
- Shared package imports: <100ms (tree-shaking verified)

### Compliance Metrics

- Healthcare commits blocked if HIPAA rules violated
- All patient data access logged to AuditLog
- FHIR validation passes official HL7 test suite
- Zero incubator package imports in healthcare

### Governance Metrics

- All 4 apps have local AGENTS.md files
- Domain boundary validation enforced in CI
- Governance violation tracker operational
- 100% of PRs validated for compliance

### Developer Experience

- Developers can scaffold new app in <15 minutes
- All shared packages documented with examples
- Storybook running with all UI components
- Local development: `pnpm dev` starts all apps

---

## Risks & Mitigation Strategies

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| **Shared package version conflicts** | Medium | High | Workspace dependency locking, monorepo builds |
| **Healthcare data accidentally exposed in logs** | Medium | Critical | ESLint rules block console.log, code review checklist |
| **Cross-app integration failures** | Medium | High | Comprehensive E2E tests, API contracts in shared-types |
| **Performance degradation in Sentratorium** | Low | Medium | Database indexing, query optimization, pagination |
| **Governance rule enforcement lag** | Low | Medium | Pre-commit hooks, CI gate enforcement, alerts |
| **Docker image bloat** | Low | Medium | Multi-stage builds, dependency pruning, slim base images |

---

## Dependencies & Assumptions

### External Dependencies

- PostgreSQL 15+ (for Prisma + pgvector)
- Langflow server (for flow execution)
- Node.js 22+ (for all apps)
- Docker and Docker Compose (for containerization)
- Kubernetes cluster (for production deployment)

### Assumptions

- Phases 1-4 completed and operational
- Shared packages (`@the-abyss/ui`, `@the-abyss/database`, etc.) fully functional
- Langflow flows defined in `flows/definitions/` and tested
- Team trained on monorepo workflow and AGENTS.md governance
- HIPAA-compliant hosting infrastructure available

---

## Next Phase Preview

After Phase 5 completion, the team transitions to **Phase 6: Abyss CLI & Automation**, building internal developer tools:

- **`abyss init-task`** — Auto-generate HANDOFF.md templates
- **`abyss sync-flow`** — Import Langflow flows to version control
- **`abyss go`** — Chief approval stamping for GO-Gate
- **`abyss create`** — Scaffolding engine for new apps/packages
- **`abyss validate`** — Comprehensive monorepo validation

Phase 6 empowers developers to ship faster while maintaining strict governance and quality standards across The Abyss platform.