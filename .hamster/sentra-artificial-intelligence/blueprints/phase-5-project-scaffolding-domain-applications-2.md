---
id: "aa9241a0-a157-47a6-b5d0-39613b14388b"
entity_type: "blueprint"
entity_id: "aa9241a0-a157-47a6-b5d0-39613b14388b"
title: "Phase 5: Project Scaffolding - Domain Applications"
status: ""
priority: ""
updated_at: "2026-03-31T08:04:08.370507+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Project Description

**Phase 5: Project Scaffolding** transforms the reusable substrate and orchestration infrastructure from Phases 1-4 into functional, production-ready applications. This phase initializes four domain-specific applications that serve different organizational needs: healthcare referrals (Referralink), academic clinical simulation, rapid AI experimentation (incubator), and internal monitoring (Sentratorium).

During Phase 5, the team will:

- Initialize **NestJS backend** for healthcare with FHIR R4 validation, multi-tenant architecture, and HIPAA audit logging
- Build **Next.js frontends** for academic simulation engine and internal Sentratorium dashboard with real-time monitoring
- Scaffold **incubator environment** with minimal governance for rapid SLM prototyping
- Integrate all applications with **shared substrate packages** (`@the-abyss/ui`, `@the-abyss/ai-core`, `@the-abyss/database`, `@the-abyss/langflow-client`)
- Implement **domain-specific governance** via local `AGENTS.md` files enforcing healthcare HIPAA rules
- Establish **standardized Docker and Kubernetes deployment** patterns across all applications
- Create **end-to-end testing framework** validating cross-application workflows (e.g., healthcare API → orchestrator → Langflow → Sentratorium)

Without Phase 5, the shared packages remain abstract utilities with no concrete user-facing applications. Phase 5 proves the architecture works end-to-end and delivers business value.

---

## Primary Objectives

### 1. Scaffold Healthcare API (Referralink)

Initialize `apps/healthcare/referralink-api` as a NestJS application with FHIR R4 compliance, multi-tenant support, and HIPAA audit trails. This is the primary patient referral system.

**Success Indicator:** Healthcare API accepts POST requests to `/fhir/Patient`, validates using `@the-abyss/fhir-engine`, logs to Sentratorium, and returns FHIR-compliant responses. All healthcare code follows strict ESLint rules enforcing no PHI in logs.

### 2. Build Academic Simulation UI

Initialize `apps/academic/clinical-simulator` as a Next.js application with React components from `@the-abyss/ui`, integration with simulation engine, and real-time AI evaluation feedback.

**Success Indicator:** Academic frontend renders simulation scenarios, captures student input, calls orchestrator via `@the-abyss/langflow-client`, displays AI-generated feedback with sentiment analysis, and tracks session metrics in Sentratorium.

### 3. Establish Incubator Environment

Initialize `apps/incubator/edge-ai-prototype` with relaxed governance for rapid experimentation. This is the R&D sandbox.

**Success Indicator:** Developers can quickly deploy new SLM-based features without full testing/approval. Incubator apps use local `AGENTS.md` with minimal restrictions. All incubator code is isolated from production healthcare code.

### 4. Create Internal Monitoring Dashboard

Initialize `apps/internal/sentratorium-web` as a Next.js application displaying real-time AI session monitoring, token usage analytics, and compliance audit trails.

**Success Indicator:** Sentratorium dashboard connects to `@the-abyss/database` via API, queries AiSession table, visualizes execution metrics, and supports role-based access control (RBAC).

### 5. Integrate Shared Substrate Across Applications

Ensure all four applications correctly import and use `@the-abyss/ui`, `@the-abyss/ai-core`, `@the-abyss/database`, `@the-abyss/fhir-engine`, and `@the-abyss/langflow-client`.

**Success Indicator:** All applications build without dependency errors. Path aliases (`@the-abyss/*`) resolve correctly. Turbo dependency graph shows correct workspace relationships.

### 6. Implement Domain-Specific Governance

Create local `AGENTS.md` files for healthcare (strict HIPAA rules), academic (simulation-specific rules), and incubator (permissive rules). Enforce via CI/CD.

**Success Indicator:** `abyss validate` command checks domain boundaries. Healthcare app cannot import incubator packages. CI blocks PRs violating `AGENTS.md` rules.

### 7. Establish E2E Testing Framework

Create integration tests validating workflows: healthcare API → Langflow orchestrator → Sentratorium logging → dashboard visualization.

**Success Indicator:** E2E tests execute in CI/CD. Full workflow (patient referral input → AI processing → result display) passes in <10 seconds. Test coverage includes happy path and error scenarios.

---

## Scope & Deliverables

**Phase 5 Duration:** 5-6 weeks (35-42 calendar days)

**Key Deliverables:**

- `apps/healthcare/referralink-api/` - NestJS API with FHIR endpoints, multi-tenancy, audit logging
- `apps/academic/clinical-simulator/` - Next.js frontend with simulation UI and AI integration
- `apps/incubator/edge-ai-prototype/` - Rapid prototyping environment (minimal scaffolding)
- `apps/internal/sentratorium-web/` - Next.js dashboard with real-time monitoring
- Local `AGENTS.md` files for each application domain
- Standardized Docker and Kubernetes manifests for all apps
- E2E test suite with Playwright or Cypress
- Documentation: API documentation, deployment guides, architecture ADRs

---

## Phase 5 Sub-Tasks Breakdown

### Sub-Task 5.1: Healthcare Application Scaffolding (Referralink API)

**Owner:** Senior Backend Engineer  
**Duration:** 5-6 days  
**Status:** Scheduled

#### Objective

Initialize `apps/healthcare/referralink-api` as a production-ready NestJS API implementing FHIR R4 endpoints, multi-tenant support with organization isolation, HIPAA audit logging, and integration with `@the-abyss/fhir-engine`.

#### Detailed Steps

1. Initialize NestJS project structure:

```bash
cd apps/healthcare
pnpm create-app referralink-api --template nestjs
cd referralink-api
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/jwt @nestjs/passport
pnpm add @the-abyss/database @the-abyss/fhir-engine @the-abyss/ai-core @the-abyss/shared-types
pnpm add passport passport-jwt jsonwebtoken
```

1. Create application directory structure:

```
apps/healthcare/referralink-api/
├── src/
│   ├── main.ts                      # Entry point
│   ├── app.module.ts                # Root module
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── auth.module.ts
│   │   ├── patients/
│   │   │   ├── patients.controller.ts
│   │   │   ├── patients.service.ts
│   │   │   ├── dto/create-patient.dto.ts
│   │   │   └── patients.module.ts
│   │   ├── practitioners/
│   │   │   ├── practitioners.controller.ts
│   │   │   ├── practitioners.service.ts
│   │   │   └── practitioners.module.ts
│   │   ├── referrals/
│   │   │   ├── referrals.controller.ts
│   │   │   ├── referrals.service.ts
│   │   │   ├── dto/create-referral.dto.ts
│   │   │   └── referrals.module.ts
│   │   └── audit/
│   │       ├── audit.service.ts
│   │       └── audit.module.ts
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── organization.middleware.ts   # Extract organization from JWT
│   │   │   └── audit.middleware.ts          # Log all requests
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   └── organization.guard.ts        # Enforce org isolation
│   │   ├── decorators/
│   │   │   ├── current-organization.decorator.ts
│   │   │   └── audit-log.decorator.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   └── AGENTS.md                    # Healthcare-specific steering rules
├── test/
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

1. Implement organization isolation middleware:

```typescript
// src/common/middleware/organization.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ForbiddenException('No authorization token provided');
    }

    try {
      const decoded = this.jwtService.verify(token);
      req['organizationId'] = decoded.organizationId;
      req['userId'] = decoded.sub;
      next();
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
  }
}
```

1. Implement FHIR Patient endpoint:

```typescript
// src/modules/patients/patients.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from '@common/guards/jwt.guard';
import { CurrentOrganization } from '@common/decorators/current-organization.decorator';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('fhir/Patient')
@UseGuards(JwtGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentOrganization() organizationId: string,
  ) {
    return await this.patientsService.createPatient({
      ...createPatientDto,
      organizationId,
    });
  }

  @Get(':id')
  async getPatient(
    @Param('id') patientId: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return await this.patientsService.getPatient(patientId, organizationId);
  }
}
```

1. Implement service with FHIR validation and audit logging:

```typescript
// src/modules/patients/patients.service.ts
import { Injectable } from '@nestjs/common';
import { prisma } from '@the-abyss/database';
import { FHIRValidator } from '@the-abyss/fhir-engine';
import { AuditService } from '@modules/audit/audit.service';

@Injectable()
export class PatientsService {
  constructor(private auditService: AuditService) {}

  async createPatient(params: {
    resourceType: string;
    resourceData: Record<string, unknown>;
    organizationId: string;
  }) {
    // Validate FHIR R4 Patient resource
    const validator = new FHIRValidator({ profile: 'us-core', strict: true });
    const validationResult = validator.validatePatient(params.resourceData);

    if (!validationResult.valid) {
      throw new Error(`FHIR validation failed: ${JSON.stringify(validationResult.errors)}`);
    }

    // Create patient in database
    const patient = await prisma.patient.create({
      data: {
        organizationId: params.organizationId,
        fhirData: params.resourceData,
      },
    });

    // Log to audit trail
    await this.auditService.logAction({
      organizationId: params.organizationId,
      action: 'created',
      resource: 'Patient',
      resourceId: patient.id,
      metadata: {
        fhirValid: true,
        validator: 'fhir-engine@1.0.0',
      },
    });

    return {
      resourceType: 'Patient',
      id: patient.id,
      ...patient.fhirData,
    };
  }

  async getPatient(patientId: string, organizationId: string) {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, organizationId },
    });

    if (!patient) {
      throw new Error('Patient not found or access denied');
    }

    // Log access (for HIPAA audit trail)
    await this.auditService.logAction({
      organizationId,
      action: 'accessed',
      resource: 'Patient',
      resourceId: patientId,
    });

    return {
      resourceType: 'Patient',
      id: patient.id,
      ...patient.fhirData,
    };
  }
}
```

1. Implement audit service for HIPAA compliance:

```typescript
// src/modules/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { prisma, createAuditLog } from '@the-abyss/database';

@Injectable()
export class AuditService {
  async logAction(params: {
    organizationId: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }) {
    // Always log to immutable audit trail (HIPAA requirement)
    await createAuditLog({
      organizationId: params.organizationId,
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      metadata: params.metadata,
    });

    // Also log to console/structured logging (with no PHI)
    console.log(`[AUDIT] ${params.action} on ${params.resource} (${params.resourceId})`);
  }
}
```

1. Create healthcare-specific AGENTS.md:

```markdown
# Healthcare Application Steering Rules

## Domain: Healthcare (HIPAA/FHIR Compliance)

### Core Principles
- **PHI Protection**: No Protected Health Information in logs, error messages, or Sentratorium output
- **FHIR Compliance**: All patient data must conform to FHIR R4 specification
- **Audit Trail**: Every access to patient data must be logged to immutable audit trail
- **Data Isolation**: Multi-tenant: organization A cannot access organization B's patients

### Prohibited Actions
- ❌ Never use `console.log()` with PHI data (use audit service only)
- ❌ Never modify patient FHIR data without re-validation
- ❌ Never bypass organization isolation checks
- ❌ Never use experimental models (use gpt-4-turbo or claude-3.5-sonnet)
- ❌ Never skip FHIR validation before database storage

### Required Validations
- ✅ All Patient resources must pass FHIR R4 US Core validation
- ✅ All endpoints require JWT token with organizationId
- ✅ All database queries must include organizationId filter
- ✅ All PHI access logged to AuditLog table (append-only)

### Model Usage
- Primary model: `gpt-4-turbo` (HIPAA-compliant)
- Secondary model: `claude-3.5-sonnet` (for consensus)
- Prohibited: Any unvetted or experimental models
```

1. Create Docker and Kubernetes manifests:

```dockerfile
# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm turbo run build --filter=apps/healthcare/referralink-api

FROM node:22-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/apps/healthcare/referralink-api/dist ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
USER nodejs
EXPOSE 3001
CMD ["node", "main.js"]
```

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: referralink-api
  namespace: healthcare
spec:
  replicas: 3
  selector:
    matchLabels:
      app: referralink-api
  template:
    metadata:
      labels:
        app: referralink-api
    spec:
      containers:
      - name: referralink-api
        image: referralink-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: referralink-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: referralink-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
```

#### Success Criteria

- NestJS application initializes without errors
- POST `/fhir/Patient` accepts FHIR Patient resource
- FHIR validation rejects invalid resources with clear error messages
- All patient access logged to AuditLog table
- Organization middleware prevents cross-tenant data access
- Healthcare-specific ESLint rules block `console.log()` with data
- Docker builds and runs successfully
- Kubernetes manifests deploy and pass health checks
- No PHI appears in application logs

#### Deliverables

- `apps/healthcare/referralink-api/` fully scaffolded NestJS application
- Controllers for Patients, Practitioners, Referrals
- Services integrating `@the-abyss/fhir-engine` and `@the-abyss/database`
- Middleware for organization isolation and audit logging
- Local `apps/healthcare/AGENTS.md` healthcare steering rules
- Dockerfile and Kubernetes deployment manifests
- OpenAPI/Swagger documentation for FHIR endpoints
- Unit tests for controllers and services (>80% coverage)

---

### Sub-Task 5.2: Academic Application Scaffolding (Clinical Simulator)

**Owner:** Frontend Engineer / Full-Stack Engineer  
**Duration:** 5-6 days  
**Status:** Scheduled

#### Objective

Initialize `apps/academic/clinical-simulator` as a Next.js application providing an interactive clinical simulation UI, integration with AI evaluation engine via Langflow, real-time feedback display, and session tracking.

#### Detailed Steps

1. Create Next.js project with App Router:

```bash
cd apps/academic
pnpm create-app clinical-simulator --template=next
cd clinical-simulator
pnpm add @the-abyss/ui @the-abyss/langflow-client @the-abyss/shared-types
pnpm add axios zustand react-query
pnpm add -D tailwindcss postcss autoprefixer
```

1. Create application structure:

```
apps/academic/clinical-simulator/
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Homepage
│   ├── scenarios/
│   │   ├── page.tsx                 # Scenarios list
│   │   ├── [id]/page.tsx            # Simulation view
│   │   └── [id]/layout.tsx
│   ├── results/
│   │   ├── page.tsx                 # Results dashboard
│   │   └── [sessionId]/page.tsx
│   └── api/
│       ├── scenarios/route.ts
│       ├── simulate/route.ts
│       └── feedback/route.ts
├── components/
│   ├── simulation/
│   │   ├── ScenarioCard.tsx
│   │   ├── SimulationView.tsx
│   │   ├── FeedbackDisplay.tsx
│   │   └── EvaluationMetrics.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── hooks/
│   ├── useSimulation.ts
│   ├── useFeedback.ts
│   └── useMetrics.ts
├── services/
│   ├── simulationService.ts         # API client
│   ├── orchestratorService.ts       # Langflow integration
│   └── analyticsService.ts
├── store/
│   └── simulationStore.ts           # Zustand store
├── lib/
│   ├── constants.ts
│   └── utils.ts
├── types/
│   └── simulation.ts
├── AGENTS.md                        # Academic-specific rules
├── next.config.js
├── tailwind.config.js
└── package.json
```

1. Implement simulation service integrating Langflow:

```typescript
// services/orchestratorService.ts
import { LangflowClient } from '@the-abyss/langflow-client';
import { ResultType } from '@the-abyss/shared-types';

export class OrchestratorService {
  private langflowClient: LangflowClient;

  constructor() {
    this.langflowClient = new LangflowClient({
      baseUrl: process.env.NEXT_PUBLIC_ORCHESTRATOR_URL,
      apiKey: process.env.ORCHESTRATOR_API_KEY,
    });
  }

  async generateFeedback(params: {
    scenarioId: string;
    studentResponse: string;
    sessionId: string;
  }): Promise<ResultType<{
    feedback: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    suggestions: string[];
  }>> {
    try {
      const result = await this.langflowClient.executeFlow({
        flowId: 'academic-feedback-generator',
        input: {
          scenario_id: params.scenarioId,
          student_response: params.studentResponse,
        },
        sessionId: params.sessionId,
      });

      return {
        success: true,
        data: {
          feedback: result.output.feedback,
          sentiment: result.output.sentiment,
          score: result.output.score,
          suggestions: result.output.suggestions || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: new Error(`Orchestrator error: ${error.message}`),
      };
    }
  }

  async evaluatePerformance(params: {
    sessionId: string;
    responses: Array<{ questionId: string; answer: string }>;
  }): Promise<ResultType<{
    overallScore: number;
    categoryScores: Record<string, number>;
    recommendations: string[];
  }>> {
    try {
      const result = await this.langflowClient.executeFlow({
        flowId: 'academic-performance-evaluator',
        input: {
          responses: params.responses,
        },
        sessionId: params.sessionId,
      });

      return {
        success: true,
        data: result.output,
      };
    } catch (error) {
      return {
        success: false,
        error: new Error(`Performance evaluation failed: ${error.message}`),
      };
    }
  }
}
```

1. Create simulation view component:

```typescript
// components/simulation/SimulationView.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Button, Card, Textarea } from '@the-abyss/ui';
import { FeedbackDisplay } from './FeedbackDisplay';
import { OrchestratorService } from '@/services/orchestratorService';

interface SimulationViewProps {
  scenarioId: string;
  scenarioContent: string;
  sessionId: string;
}

export function SimulationView({
  scenarioId,
  scenarioContent,
  sessionId,
}: SimulationViewProps) {
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const orchestratorService = new OrchestratorService();

  const handleSubmit = useCallback(async () => {
    if (!response.trim()) return;

    setLoading(true);
    try {
      const result = await orchestratorService.generateFeedback({
        scenarioId,
        studentResponse: response,
        sessionId,
      });

      if (result.success) {
        setFeedback(result.data);
      } else {
        console.error('Feedback generation failed:', result.error);
      }
    } finally {
      setLoading(false);
    }
  }, [response, scenarioId, sessionId]);

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Scenario */}
      <Card className="col-span-1">
        <h2 className="text-xl font-semibold mb-4">Clinical Scenario</h2>
        <div className="prose prose-sm max-w-none">
          {scenarioContent}
        </div>
      </Card>

      {/* Response Input */}
      <Card className="col-span-1">
        <h2 className="text-xl font-semibold mb-4">Your Response</h2>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Enter your clinical decision or response..."
          rows={8}
          className="mb-4"
        />
        <Button
          onClick={handleSubmit}
          disabled={loading || !response.trim()}
          className="w-full"
        >
          {loading ? 'Generating Feedback...' : 'Submit Response'}
        </Button>
      </Card>

      {/* AI Feedback */}
      {feedback && (
        <div className="col-span-2">
          <FeedbackDisplay feedback={feedback} />
        </div>
      )}
    </div>
  );
}
```

1. Create feedback display component with sentiment visualization:

```typescript
// components/simulation/FeedbackDisplay.tsx
'use client';

import React from 'react';
import { Card, Badge } from '@the-abyss/ui';

interface FeedbackDisplayProps {
  feedback: {
    feedback: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    suggestions: string[];
  };
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Feedback</h3>
        <div className="flex gap-2">
          <Badge variant={getSentimentColor(feedback.sentiment)}>
            {feedback.sentiment.toUpperCase()}
          </Badge>
          <Badge variant="outline">Score: {(feedback.score * 100).toFixed(0)}%</Badge>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{feedback.feedback}</p>

      {feedback.suggestions.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Suggestions for Improvement:</h4>
          <ul className="list-disc list-inside space-y-1">
            {feedback.suggestions.map((suggestion, idx) => (
              <li key={idx} className="text-sm text-gray-600">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
```

1. Create API route for simulation submission:

```typescript
// app/api/simulate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@the-abyss/database';
import { OrchestratorService } from '@/services/orchestratorService';

export async function POST(req: NextRequest) {
  try {
    const { scenarioId, studentResponse, studentId } = await req.json();

    // Create session in database
    const session = await prisma.aiSession.create({
      data: {
        sessionId: `sess_${Date.now()}`,
        organizationId: 'academic-org', // Placeholder
        agentType: 'academic-simulator',
        domain: 'academic',
        userId: studentId,
        inputPrompt: JSON.stringify({ scenarioId, studentResponse }),
        modelUsed: 'gpt-4-turbo',
        output: JSON.stringify({}), // Placeholder, will be updated
      },
    });

    // Call orchestrator
    const orchestratorService = new OrchestratorService();
    const result = await orchestratorService.generateFeedback({
      scenarioId,
      studentResponse,
      sessionId: session.sessionId,
    });

    // Update session with output
    await prisma.aiSession.update({
      where: { id: session.id },
      data: {
        output: JSON.stringify(result.data),
        approved: true,
      },
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Simulation failed' },
      { status: 500 }
    );
  }
}
```

1. Create academic-specific AGENTS.md:

```markdown
# Academic Application Steering Rules

## Domain: Academic (Clinical Simulation)

### Core Principles
- **Educational Value**: All AI feedback must be pedagogically sound and constructive
- **Student Safety**: Feedback should encourage, not discourage learning
- **Simulation Fidelity**: Scenarios should reflect realistic clinical decisions
- **Progress Tracking**: All student interactions logged for learning analytics

### Approved AI Models
- ✅ `gpt-4-turbo` (primary for feedback generation)
- ✅ `claude-3.5-sonnet` (for consensus evaluation)
- ❌ Experimental/unvetted models

### Required Features
- ✅ Student response submission via form
- ✅ Real-time AI feedback generation (<5 seconds)
- ✅ Sentiment analysis on feedback (positive/neutral/negative)
- ✅ Score calculation (0-100%)
- ✅ Session tracking in Sentratorium

### Prohibited
- ❌ No real patient data in scenarios
- ❌ No random/unrealistic scenario generation
- ❌ No feedback that violates medical ethics
```

#### Success Criteria

- Next.js application initializes and builds successfully
- Scenario list page displays available clinical scenarios
- Simulation view renders scenario content and response input
- Response submission calls orchestrator via Langflow
- Feedback displays with sentiment badge and score
- All session data logged to AiSession table
- Component library (`@the-abyss/ui`) imported and used
- Academic AGENTS.md created and enforced in CI
- E2E test validates full simulation workflow

#### Deliverables

- `apps/academic/clinical-simulator/` fully scaffolded Next.js application
- Scenario management components and pages
- Simulation view with real-time feedback
- Integration with `@the-abyss/langflow-client` for orchestrator calls
- Zustand store for simulation state management
- Academic-specific AGENTS.md
- Dockerfile and Kubernetes manifests
- E2E tests using Playwright or Cypress
- User documentation and scenario creation guide

---

### Sub-Task 5.3: Incubator Application Scaffolding

**Owner:** Junior Full-Stack Engineer / Experimental Team Lead  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Initialize `apps/incubator/edge-ai-prototype` as a lightweight experimental environment for rapidly prototyping small language models (SLMs) and AI features. Incubator has relaxed governance to enable fast iteration.

#### Detailed Steps

1. Create minimal Next.js setup for incubator:

```bash
cd apps/incubator
pnpm create-app edge-ai-prototype --template=next-minimal
cd edge-ai-prototype
pnpm add @the-abyss/shared-types axios
```

1. Create lightweight incubator structure:

```
apps/incubator/edge-ai-prototype/
├── app/
│   ├── page.tsx                     # Main experiment board
│   ├── experiments/
│   │   ├── page.tsx                 # List experiments
│   │   ├── [id]/page.tsx
│   │   └── create/page.tsx
│   └── api/
│       ├── experiments/route.ts
│       └── run/route.ts
├── components/
│   ├── ExperimentCard.tsx
│   ├── ExperimentEditor.tsx
│   └── ResultsViewer.tsx
├── lib/
│   ├── slmModels.ts                 # Local SLM model definitions
│   └── experimentRunner.ts
├── AGENTS.md                        # Permissive incubator rules
├── package.json
└── README.md
```

1. Create incubator AGENTS.md with relaxed governance:

```markdown
# Incubator Application Steering Rules

## Domain: Incubator (R&D Sandbox)

### Philosophy
Incubator is a **low-governance, high-velocity** environment for experimenting with new AI models and features. Code here is NOT production-ready and must be explicitly approved before graduation to other domains.

### Core Principles
- **Rapid Experimentation**: Minimal approval gates, fast iteration
- **Isolated Scope**: Incubator changes do NOT impact production users
- **Learning Environment**: Failures are expected and valuable
- **Code Review Lite**: Single reviewer OK (vs. 2+ for production)

### Permitted Actions
- ✅ Experiment with unvetted LLMs (gpt-4o, claude-3-opus, local models)
- ✅ Use console.log() freely (incubator data only, never PHI)
- ✅ Skip full test coverage (aim for >50%)
- ✅ Deploy directly to staging without full CI gates
- ✅ Prototype new UI patterns without design system

### Prohibited
- ❌ Never move incubator code to healthcare/academic without re-approval
- ❌ Never use real patient data (PHI) for experiments
- ❌ Never commit to `main` branch (use feature branches only)
- ❌ Never bypass security audit (vulnerabilities still matter)

### Graduation Path
To move an experiment from incubator to production:
1. Write comprehensive tests (>80% coverage)
2. Get approval from Chief Engineer
3. Refactor to follow domain-specific AGENTS.md
4. Add to Phase 5 roadmap for integration
```

1. Create SLM model runner:

```typescript
// lib/experimentRunner.ts
import axios from 'axios';

export type SLMModel = 'phi-2' | 'mistral-7b' | 'neural-chat' | 'code-llama';

interface ExperimentRequest {
  model: SLMModel;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface ExperimentResult {
  model: SLMModel;
  output: string;
  latencyMs: number;
  tokensUsed: number;
  timestamp: Date;
}

export class ExperimentRunner {
  async runLocalSLM(params: ExperimentRequest): Promise<ExperimentResult> {
    const startTime = Date.now();

    try {
      // Call local Ollama instance or remote SLM API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SLM_API_URL}/generate`,
        {
          model: params.model,
          prompt: params.prompt,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 512,
        },
        { timeout: 30000 }
      );

      return {
        model: params.model,
        output: response.data.output,
        latencyMs: Date.now() - startTime,
        tokensUsed: response.data.tokensUsed || 0,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`SLM error (${params.model}):`, error.message);
      throw error;
    }
  }

  async compareModels(
    prompt: string,
    models: SLMModel[]
  ): Promise<ExperimentResult[]> {
    const results = await Promise.all(
      models.map(model =>
        this.runLocalSLM({ model, prompt }).catch(err => ({
          model,
          error: err.message,
        }))
      )
    );

    return results.filter(r => !('error' in r));
  }
}
```

1. Create experiment API endpoint:

```typescript
// app/api/run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ExperimentRunner } from '@/lib/experimentRunner';

export async function POST(req: NextRequest) {
  try {
    const { model, prompt, temperature, maxTokens } = await req.json();

    const runner = new ExperimentRunner();
    const result = await runner.runLocalSLM({
      model,
      prompt,
      temperature,
      maxTokens,
    });

    // Log to local experiments table (no Sentratorium, lightweight)
    console.log(`[EXPERIMENT] ${model}: ${result.latencyMs}ms, ${result.tokensUsed} tokens`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Experiment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### Success Criteria

- Next.js application initializes without external dependencies
- Experiment creation form works
- SLM model runner connects to local/remote SLM API
- Results displayed with latency and token metrics
- Incubator AGENTS.md created with permissive rules
- Can be deployed independently without affecting production
- Minimal CI gates (single test requirement)

#### Deliverables

- `apps/incubator/edge-ai-prototype/` lightweight Next.js app
- Experiment creation and runner components
- SLM integration library (`experimentRunner.ts`)
- Incubator AGENTS.md with relaxed governance
- Simple Dockerfile (no multi-stage build needed)
- Basic README with experiment examples

---

### Sub-Task 5.4: Internal Application Scaffolding (Sentratorium Dashboard)

**Owner:** Frontend Engineer  
**Duration:** 5-7 days  
**Status:** Scheduled

#### Objective

Initialize `apps/internal/sentratorium-web` as a Next.js real-time monitoring dashboard displaying AI session analytics, token usage costs, compliance violations, and performance trends.

#### Detailed Steps

1. Create Next.js dashboard project:

```bash
cd apps/internal
pnpm create-app sentratorium-web --template=next
cd sentratorium-web
pnpm add @the-abyss/ui @the-abyss/database @the-abyss/shared-types
pnpm add recharts zustand next-auth react-query axios
```

1. Create dashboard structure:

```
apps/internal/sentratorium-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                     # Dashboard home
│   ├── sessions/
│   │   ├── page.tsx                 # Sessions explorer
│   │   └── [sessionId]/page.tsx     # Session detail
│   ├── analytics/
│   │   ├── page.tsx                 # Token usage, costs
│   │   └── metrics.tsx
│   ├── violations/
│   │   └── page.tsx                 # Governance violations
│   ├── audit-logs/
│   │   └── page.tsx                 # HIPAA audit trail
│   └── api/
│       ├── sessions/route.ts
│       ├── analytics/route.ts
│       └── violations/route.ts
├── components/
│   ├── dashboard/
│   │   ├── SessionFeed.tsx
│   │   ├── TokenUsageChart.tsx
│   │   ├── CostAnalysis.tsx
│   │   └── ViolationAlert.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   └── auth/
│       └── LoginForm.tsx
├── hooks/
│   ├── useSessions.ts
│   ├── useAnalytics.ts
│   └── useWebSocket.ts              # Real-time updates
├── services/
│   ├── sessionService.ts
│   └── analyticsService.ts
├── middleware.ts                    # Auth middleware
├── auth.config.ts                   # NextAuth configuration
└── package.json
```

1. Implement sessions API with filtering:

```typescript
// app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@the-abyss/database';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  const agentType = searchParams.get('agentType');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  const where = {
    ...(domain && { domain }),
    ...(agentType && { agentType }),
  };

  const [sessions, total] = await Promise.all([
    prisma.aiSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        sessionId: true,
        agentType: true,
        domain: true,
        modelUsed: true,
        latencyMs: true,
        tokenUsed: true,
        costUsd: true,
        approved: true,
        createdAt: true,
      },
    }),
    prisma.aiSession.count({ where }),
  ]);

  return NextResponse.json({
    items: sessions,
    total,
    page,
    pageSize,
    hasNext: page * pageSize < total,
  });
}
```

1. Create session detail view:

```typescript
// app/sessions/[sessionId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, Badge, Table } from '@the-abyss/ui';
import { useParams } from 'next/navigation';
import { sessionService } from '@/services/sessionService';

export default function SessionDetailPage() {
  const params = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const data = await sessionService.getSession(params.sessionId as string);
      setSession(data);
      setLoading(false);
    };
    loadSession();
  }, [params.sessionId]);

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Session {session.sessionId}</h1>
        <div className="flex gap-2">
          <Badge variant={session.approved ? 'success' : 'warning'}>
            {session.approved ? 'APPROVED' : 'PENDING'}
          </Badge>
          <Badge variant="outline">{session.agentType}</Badge>
          <Badge variant="outline">{session.domain}</Badge>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Execution Details</h2>
        <Table columns={['Property', 'Value']}>
          <tr>
            <td className="font-semibold">Model</td>
            <td>{session.modelUsed}</td>
          </tr>
          <tr>
            <td className="font-semibold">Latency</td>
            <td>{session.latencyMs}ms</td>
          </tr>
          <tr>
            <td className="font-semibold">Tokens Used</td>
            <td>{session.tokenUsed}</td>
          </tr>
          <tr>
            <td className="font-semibold">Cost</td>
            <td>${session.costUsd.toFixed(4)}</td>
          </tr>
          <tr>
            <td className="font-semibold">Timestamp</td>
            <td>{new Date(session.createdAt).toLocaleString()}</td>
          </tr>
        </Table>
      </Card>

      {/* Input Prompt */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Input Prompt</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-48">
          {JSON.stringify(JSON.parse(session.inputPrompt), null, 2)}
        </pre>
      </Card>

      {/* Output */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Output</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-48">
          {JSON.stringify(JSON.parse(session.output), null, 2)}
        </pre>
      </Card>
    </div>
  );
}
```

1. Create real-time analytics dashboard:

```typescript
// components/dashboard/TokenUsageChart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@the-abyss/ui';
import { analyticsService } from '@/services/analyticsService';

export function TokenUsageChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const analytics = await analyticsService.getTokenUsageTrend('7days');
      setData(analytics);
    };
    loadData();
  }, []);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Token Usage (Last 7 Days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="gpt4"
            stroke="#3B82F6"
            name="GPT-4 Turbo"
          />
          <Line
            type="monotone"
            dataKey="claude"
            stroke="#10B981"
            name="Claude 3.5 Sonnet"
          />
          <Line
            type="monotone"
            dataKey="ollama"
            stroke="#8B5CF6"
            name="Local Models"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

1. Implement auth with NextAuth:

```typescript
// auth.config.ts
import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        // Verify JWT token from header or validate against database
        if (!credentials?.token) return null;

        // In production, verify token signature
        return {
          id: '1',
          name: 'Internal User',
          email: 'user@sentra.io',
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
} satisfies NextAuthConfig;
```

#### Success Criteria

- Dashboard initializes and authenticates users
- Sessions explorer displays real-time AI execution data
- Filtering by domain, agent type, and date range works
- Session detail view shows input/output/metadata
- Token usage chart displays trends over time
- Cost analysis calculates USD cost per model
- Violation tracker highlights governance/FHIR failures
- RBAC prevents unauthorized access to sensitive data
- Real-time updates via WebSocket (optional, can use polling)

#### Deliverables

- `apps/internal/sentratorium-web/` fully scaffolded Next.js dashboard
- Sessions explorer with filtering and pagination
- Session detail view with full context
- Analytics dashboard with token usage and cost charts
- Violation tracker for governance alerts
- HIPAA audit log viewer with export to CSV
- NextAuth integration for role-based access
- Dockerfile and Kubernetes manifests
- Comprehensive README with dashboard guide

---

### Sub-Task 5.5: Shared Substrate Integration

**Owner:** Backend Lead / Architecture Lead  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Verify all four applications correctly import and integrate with shared substrate packages: `@the-abyss/ui`, `@the-abyss/ai-core`, `@the-abyss/database`, `@the-abyss/fhir-engine`, `@the-abyss/langflow-client`, and `@the-abyss/shared-types`.

#### Detailed Steps

1. Verify workspace dependencies in all apps:

```json
{
  "dependencies": {
    "@the-abyss/database": "workspace:*",
    "@the-abyss/ui": "workspace:*",
    "@the-abyss/ai-core": "workspace:*",
    "@the-abyss/shared-types": "workspace:*",
    "@the-abyss/fhir-engine": "workspace:*",
    "@the-abyss/langflow-client": "workspace:*"
  }
}
```

1. Verify Turbo dependency graph:

```bash
pnpm turbo graph --json > monorepo-graph.json
# Validate that apps depend on correct packages
# apps/healthcare → fhir-engine, database, shared-types
# apps/academic → langflow-client, ui, shared-types
# apps/incubator → ai-core (optional)
# apps/internal → database, ui, shared-types
```

1. Create integration smoke tests:

```typescript
// test/integration/substrate.test.ts
import { prisma } from '@the-abyss/database';
import { FHIRValidator } from '@the-abyss/fhir-engine';
import { ConsensusEngine } from '@the-abyss/ai-core';
import { Button } from '@the-abyss/ui';

describe('Shared Substrate Integration', () => {
  it('should import database client', () => {
    expect(prisma).toBeDefined();
    expect(prisma.aiSession).toBeDefined();
  });

  it('should import and use FHIR validator', () => {
    const validator = new FHIRValidator({ profile: 'us-core' });
    expect(validator).toBeDefined();
  });

  it('should import UI components', () => {
    expect(Button).toBeDefined();
  });

  it('should resolve path aliases', async () => {
    // Test that @the-abyss/* imports work
    const { user } = await import('@the-abyss/shared-types');
    expect(user).toBeDefined();
  });
});
```

1. Test Prisma migrations across all apps:

```bash
# In each app directory
DATABASE_URL=postgresql://user:pass@localhost/test pnpm exec prisma migrate deploy
pnpm exec prisma db seed
```

1. Verify CI/CD builds all apps with shared packages:

```yaml
# .github/workflows/build-apps.yml
name: Build All Applications

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      # Build all apps in dependency order
      - run: pnpm turbo run build --filter="./apps/*"
      
      # Verify no unresolved imports
      - run: pnpm turbo run lint --filter="./apps/*"
```

#### Success Criteria

- All apps have correct `workspace:*` dependency declarations
- Turbo dependency graph shows correct app → package relationships
- All path aliases resolve (`@the-abyss/ui`, etc.)
- Shared packages export correctly to all consumers
- No circular dependencies
- Prisma migrations run successfully across all apps
- All apps build without errors in CI
- TypeScript strict mode passes for all app imports

#### Deliverables

- Updated `package.json` for all apps with correct dependencies
- CI/CD workflow validating substrate integration
- Smoke test suite for each app
- Dependency graph visualization
- Integration test results

---

### Sub-Task 5.6: Domain-Specific Governance

**Owner:** Architect / DevOps Lead  
**Duration:** 2-3 days  
**Status:** Scheduled

#### Objective

Create and enforce domain-specific `AGENTS.md` files for healthcare (strict), academic (moderate), and incubator (permissive) applications. Ensure governance is validated in CI/CD.

#### Detailed Steps

1. Already created in Sub-Tasks 5.1, 5.2, 5.3. Consolidate and validate:

```
apps/
├── healthcare/AGENTS.md
├── academic/AGENTS.md
└── incubator/AGENTS.md
```

1. Update root `.agents/AGENTS.md` with routing:

```markdown
# Global Agent Steering (Updated for Phase 5)

## Application Routing
- **Healthcare requests** → Route to `apps/healthcare/AGENTS.md` (STRICT)
- **Academic requests** → Route to `apps/academic/AGENTS.md` (MODERATE)
- **Incubator requests** → Route to `apps/incubator/AGENTS.md` (PERMISSIVE)
- **Internal requests** → Route to `.agents/AGENTS.md` (MODERATE)

## Boundary Enforcement
- `apps/healthcare/*` CAN import: `fhir-engine`, `database`, `shared-types`
- `apps/healthcare/*` CANNOT import: `incubator/*`, `@the-abyss/incubator-*`
- `apps/incubator/*` is isolated: cannot export to healthcare/academic
```

1. Extend `iskandar-gatekeeper` to validate domain boundaries:

```typescript
// packages/iskandar-gatekeeper/src/validators/domain-boundary-validator.ts
export class DomainBoundaryValidator {
  private boundaries = {
    'apps/healthcare': {
      allowedImports: ['fhir-engine', 'database', 'shared-types', 'ai-core', 'ui'],
      forbiddenImports: ['apps/incubator'],
    },
    'apps/academic': {
      allowedImports: ['ui', 'langflow-client', 'shared-types', 'ai-core'],
      forbiddenImports: ['apps/incubator'],
    },
    'apps/incubator': {
      allowedImports: ['shared-types'],
      forbiddenImports: ['apps/healthcare', 'apps/academic', 'fhir-engine'],
    },
  };

  async validateImports(sourceFile: string, imports: string[]): Promise<Violation[]> {
    const domain = this.getDomain(sourceFile);
    const allowedImports = this.boundaries[domain]?.allowedImports || [];
    const forbiddenImports = this.boundaries[domain]?.forbiddenImports || [];

    const violations = [];

    for (const imp of imports) {
      if (forbiddenImports.some(f => imp.includes(f))) {
        violations.push({
          file: sourceFile,
          import: imp,
          message: `${domain} cannot import from ${imp}`,
          severity: 'error',
        });
      }
    }

    return violations;
  }
}
```

1. Update CI/CD to enforce governance:

```yaml
# .github/workflows/governance-check.yml
name: Governance Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      
      # Validate domain boundaries
      - run: pnpm abyss validate:boundaries
      
      # Check local AGENTS.md existence
      - run: |
          if [ ! -f "apps/healthcare/AGENTS.md" ]; then
            echo "ERROR: apps/healthcare/AGENTS.md missing"
            exit 1
          fi
      
      # Prevent incubator code from reaching main
      - run: pnpm abyss validate:incubator-isolation
```

#### Success Criteria

- Local `AGENTS.md` files exist for all apps
- CI validates domain boundaries (prevents healthcare import incubator)
- Healthcare app enforces strict ESLint rules (no console.log with data)
- Incubator app allows permissive rules (for rapid experimentation)
- `abyss validate:boundaries` command works
- PR validation blocks boundary violations

#### Deliverables

- Local `AGENTS.md` for healthcare, academic, incubator
- Extended `iskandar-gatekeeper` with domain boundary validation
- GitHub Actions workflow for governance enforcement
- `abyss validate:boundaries` CLI command
- Governance documentation for developers

---

### Sub-Task 5.7: End-to-End Testing & Validation

**Owner:** QA Engineer / Test Automation Engineer  
**Duration:** 4-5 days  
**Status:** Scheduled

#### Objective

Create comprehensive E2E tests validating complete workflows across all four applications: patient referral submission → FHIR validation → Langflow orchestration → Sentratorium logging → dashboard visualization.

#### Detailed Steps

1. Setup E2E testing framework (Playwright):

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

1. Create E2E test structure:

```
test/e2e/
├── fixtures/
│   ├── auth.ts                      # Login fixtures
│   ├── test-data.ts                 # Sample FHIR resources
│   └── api-client.ts                # Reusable API helpers
├── workflows/
│   ├── healthcare-referral.spec.ts  # Referral creation → validation
│   ├── academic-simulation.spec.ts  # Scenario → feedback loop
│   ├── incubator-experiment.spec.ts # SLM experimentation
│   └── dashboard-monitoring.spec.ts # Session tracking
└── utils/
    ├── wait-for.ts
    └── assertions.ts
```

1. Create healthcare referral E2E test:

```typescript
// test/e2e/workflows/healthcare-referral.spec.ts
import { test, expect } from '@playwright/test';
import { prisma } from '@the-abyss/database';
import { authFixture, testPatient } from '../fixtures';

test.describe('Healthcare Referral Workflow', () => {
  test.beforeAll(async () => {
    // Setup: ensure database is clean
    await prisma.aiSession.deleteMany({});
  });

  test('should create FHIR-validated patient referral', async ({ page, context }) => {
    // Step 1: Authenticate
    const cookies = await authFixture.getAuthCookies();
    await context.addCookies(cookies);

    // Step 2: Navigate to healthcare app
    await page.goto('http://localhost:3001/referrals/create');
    expect(page.url()).toContain('referrals/create');

    // Step 3: Fill referral form with FHIR Patient data
    await page.fill('[name="patientId"]', testPatient.id);
    await page.fill('[name="name"]', testPatient.name);
    await page.fill('[name="birthDate"]', testPatient.birthDate);
    await page.selectOption('[name="gender"]', testPatient.gender);

    // Step 4: Submit form
    await page.click('button:has-text("Submit Referral")');

    // Step 5: Verify FHIR validation success
    await expect(page.locator('[role="alert"]:has-text("Validation Passed")')).toBeVisible({ timeout: 5000 });

    // Step 6: Verify session logged in Sentratorium
    await page.waitForTimeout(2000); // Allow time for async logging
    const session = await prisma.aiSession.findFirst({
      where: { domain: 'healthcare' },
      orderBy: { createdAt: 'desc' },
    });

    expect(session).toBeDefined();
    expect(session.approved).toBe(true);

    // Step 7: Verify audit log created
    const auditLog = await prisma.auditLog.findFirst({
      where: { action: 'created', resource: 'Patient' },
      orderBy: { timestamp: 'desc' },
    });

    expect(auditLog).toBeDefined();
    expect(auditLog.organizationId).toBe(cookies[0].value); // From auth token
  });

  test('should reject invalid FHIR Patient resource', async ({ page, context }) => {
    const cookies = await authFixture.getAuthCookies();
    await context.addCookies(cookies);

    await page.goto('http://localhost:3001/referrals/create');

    // Submit incomplete data (missing required fields)
    await page.fill('[name="patientId"]', 'patient-123');
    await page.click('button:has-text("Submit Referral")');

    // Verify validation error displayed
    await expect(page.locator('[role="alert"][role="error"]')).toBeVisible();
    await expect(page.locator('text=FHIR validation failed')).toBeVisible();

    // Verify no session logged on validation failure
    const sessions = await prisma.aiSession.findMany({
      where: { domain: 'healthcare' },
    });

    expect(sessions.every(s => !s.output.includes('invalid'))).toBe(true);
  });
});
```

1. Create academic simulation E2E test:

```typescript
// test/e2e/workflows/academic-simulation.spec.ts
import { test, expect } from '@playwright/test';
import { prisma } from '@the-abyss/database';
import { authFixture } from '../fixtures';

test.describe('Academic Simulation Workflow', () => {
  test('should run complete simulation with AI feedback', async ({ page, context }) => {
    const cookies = await authFixture.getAuthCookies();
    await context.addCookies(cookies);

    // Step 1: Navigate to scenarios list
    await page.goto('http://localhost:3002/scenarios');
    expect(page.url()).toContain('scenarios');

    // Step 2: Select a scenario
    await page.click('button:has-text("Hypertension Management")');
    await expect(page).toHaveURL(/scenarios\/\d+/);

    // Step 3: View scenario content
    const scenarioText = await page.locator('[role="article"]').textContent();
    expect(scenarioText).toContain('A 58-year-old patient');

    // Step 4: Submit student response
    await page.fill('[name="response"]', 'I would prescribe ACE inhibitor therapy and monitor BP weekly');
    await page.click('button:has-text("Submit Response")');

    // Step 5: Wait for AI feedback (calls orchestrator/Langflow)
    const feedbackLocator = page.locator('[data-testid="feedback-section"]');
    await feedbackLocator.waitFor({ state: 'visible', timeout: 10000 });

    // Step 6: Verify feedback displayed
    const feedback = await feedbackLocator.textContent();
    expect(feedback).toContain('feedback'); // Or check specific content

    // Step 7: Verify sentiment badge
    const sentimentBadge = page.locator('[data-testid="sentiment-badge"]');
    const sentimentText = await sentimentBadge.textContent();
    expect(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).toContain(sentimentText);

    // Step 8: Verify session logged
    const session = await prisma.aiSession.findFirst({
      where: { domain: 'academic', agentType: 'academic-simulator' },
      orderBy: { createdAt: 'desc' },
    });

    expect(session).toBeDefined();
    expect(session.approved).toBe(true);
  });
});
```

1. Create dashboard monitoring E2E test:

```typescript
// test/e2e/workflows/dashboard-monitoring.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Sentratorium Dashboard Monitoring', () => {
  test('should display real-time AI session metrics', async ({ page, context }) => {
    const cookies = await authFixture.getAuthCookies();
    await context.addCookies(cookies);

    // Step 1: Navigate to dashboard
    await page.goto('http://localhost:3003');

    // Step 2: Verify session feed loads
    const sessionFeed = page.locator('[data-testid="session-feed"]');
    await sessionFeed.waitFor({ state: 'visible' });

    // Step 3: Verify columns present
    const columns = ['Flow ID', 'Model', 'Latency', 'Cost'];
    for (const col of columns) {
      await expect(page.locator(`th:has-text("${col}")`)).toBeVisible();
    }

    // Step 4: Verify analytics chart renders
    const tokenChart = page.locator('[data-testid="token-usage-chart"]');
    await expect(tokenChart).toBeVisible();

    // Step 5: Filter by domain
    await page.selectOption('[name="domain-filter"]', 'healthcare');
    await page.click('button:has-text("Apply Filter")');

    // Step 6: Verify healthcare sessions displayed
    const sessionRows = page.locator('[data-testid="session-row"]');
    const count = await sessionRows.count();
    expect(count).toBeGreaterThan(0);

    // Step 7: Click on session detail
    await sessionRows.first().click();
    await expect(page).toHaveURL(/sessions\/sess_\w+/);

    // Step 8: Verify session detail view
    const detailCard = page.locator('[data-testid="session-detail"]');
    await expect(detailCard).toBeVisible();
    await expect(page.locator('text=Execution Details')).toBeVisible();
  });

  test('should alert on governance violations', async ({ page, context }) => {
    const cookies = await authFixture.getAuthCookies();
    await context.addCookies(cookies);

    await page.goto('http://localhost:3003/violations');

    // Verify violations list renders
    const violationsList = page.locator('[data-testid="violations-list"]');
    await expect(violationsList).toBeVisible();

    // Check for healthcare-incubator boundary violation alert
    const boundaryViolation = page.locator('text=Boundary violation');
    if (await boundaryViolation.isVisible()) {
      expect(boundaryViolation).toBeVisible();
    }
  });
});
```

1. Create test runner CI/CD configuration:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  - pull_request
  - push

jobs:
  e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Setup database
      - run: |
          DATABASE_URL=postgresql://postgres:test@localhost/test pnpm exec prisma migrate deploy
          DATABASE_URL=postgresql://postgres:test@localhost/test pnpm exec prisma db seed

      # Start apps in background
      - run: |
          pnpm turbo run dev --filter="./apps/*" &
          sleep 10 # Wait for apps to start

      # Run E2E tests
      - run: pnpm exec playwright test

      # Upload test results
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

#### Success Criteria

- All E2E tests pass (happy path and error scenarios)
- Healthcare referral workflow: submit → validate → log → audit
- Academic simulation: scenario view → response → AI feedback → logging
- Dashboard: real-time session display, filtering, drill-down
- Cross-app data consistency (input in healthcare → visible in Sentratorium)
- Governance violations detected and logged
- CI/CD runs E2E tests on all PRs
- Test execution time <10 minutes
- >90% test coverage for critical workflows

#### Deliverables

- Playwright test suite with 10+ E2E tests
- Test fixtures for auth, sample data, API helpers
- CI/CD workflow for automated E2E test execution
- Test results dashboard (optional)
- E2E testing documentation and best practices
- Selenium/Cypress alternative setup (optional)

---

## Implementation Timeline

| Week | Sub-Tasks | Milestones |
| --- | --- | --- |
| **Week 1** | 5.1, 5.2 | Healthcare API + Academic UI scaffolded |
| **Week 2** | 5.3, 5.4 | Incubator + Sentratorium Dashboard operational |
| **Week 3** | 5.5, 5.6 | Substrate integration + governance enforcement |
| **Week 4** | 5.7 | E2E tests passing, full workflow validation |
| **Week 5-6** | Integration & Documentation | All apps deployed, documentation complete |

---

## Success Metrics & Verification Checklist

### Technical Metrics

- All four applications build without errors in CI
- Workspace dependencies resolved correctly
- Zero unresolved TypeScript types (strict mode)
- All API endpoints documented (OpenAPI/Swagger)
- Database migrations execute successfully
- Turbo build time <5 minutes for all apps

### Functional Metrics

- Healthcare API accepts and validates FHIR Patient resources
- Academic app displays scenarios and captures feedback
- Incubator app runs SLM experiments
- Sentratorium dashboard displays real-time metrics
- All apps connect to shared database
- All sessions logged to AiSession table

### Governance Metrics

- Healthcare app enforces HIPAA audit logging
- Domain boundaries enforced (healthcare cannot import incubator)
- Local AGENTS.md rules enforced in CI
- No PHI appears in application logs
- All governance violations detected by `abyss validate`

### Performance Metrics

- FHIR validation <10ms per resource
- Dashboard page load <3 seconds
- Orchestrator round-trip <500ms (excluding LLM)
- E2E tests complete in <10 minutes

### Compliance Metrics

- All PHI access logged to AuditLog table (append-only)
- FHIR R4 US Core validation passes for all test resources
- Multi-tenant isolation verified (organization A ≠ organization B data access)

### Developer Experience

- New developers can run all apps locally with `pnpm dev`
- Documentation includes architecture diagrams and deployment guides
- Storybook displays UI components with examples
- API documentation auto-generated and published

---

## Risks & Mitigation Strategies

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| **Database migration failures** | Medium | High | Test migrations in CI before production deploy; create rollback scripts |
| **Workspace dependency conflicts** | Medium | High | Use `pnpm dedupe` and validate lockfile; test with `npm audit` |
| **HIPAA compliance gaps** | Low | Critical | Security audit; third-party compliance review; automated PHI detection |
| **Cross-app integration issues** | Medium | Medium | Comprehensive E2E tests; contract testing for APIs |
| **Performance degradation** | Low | Medium | Load testing with 1000 concurrent users; Lighthouse audits for frontend |
| **Domain governance violations in PRs** | Medium | Medium | Automated linting (`abyss validate`); required code reviews |

---

## Dependencies & Assumptions

### External Dependencies

- PostgreSQL 15+ (database)
- Node.js 22+ (runtime)
- Docker + Kubernetes (deployment)
- Langflow server (orchestration)
- OpenAI/Anthropic API (LLM access)

### Team Assumptions

- Developers familiar with NestJS, Next.js, and React
- DevOps team available for Kubernetes deployment
- Security team can conduct HIPAA audit
- Database administrator manages PostgreSQL

### Technical Assumptions

- Phase 1-4 completed and operational
- Shared packages (`@the-abyss/ui`, etc.) stable
- Monorepo workspace setup working
- CI/CD pipelines configured

---

## Next Phase Preview

After Phase 5 completion, the team transitions to **Phase 6: Abyss CLI & Automation**, building internal developer tools:

- **`abyss init-task`**: Auto-generate HANDOFF.md templates
- **`abyss sync-flow`**: Export Langflow flows to version control
- **`abyss go`**: Chief approval stamp for GO-Gate
- **`abyss validate`**: Run governance checks across monorepo
- **`abyss status`**: Health check for monorepo integrity

Phase 6 makes governance frictionless and accelerates developer velocity across all domains.