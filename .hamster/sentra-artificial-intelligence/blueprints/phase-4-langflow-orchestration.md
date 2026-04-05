---
id: "3ea1ba1e-f34c-4396-a886-c6fdb948326b"
entity_type: "blueprint"
entity_id: "3ea1ba1e-f34c-4396-a886-c6fdb948326b"
title: "Phase 4: Langflow & Orchestration"
status: ""
priority: ""
updated_at: "2026-03-31T08:01:27.063031+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Project Description

**Phase 4: Langflow & Orchestration** builds the "nervous system" of The Abyss—a comprehensive AI orchestration layer that coordinates intelligent workflows across all domains. This phase transforms the reusable libraries from Phase 3 into executable, version-controlled, production-ready AI flows with automated quality testing and real-time monitoring.

During Phase 4, the team will:

- Establish a **version-controlled flow repository** where all Langflow definitions are exported as JSON and tracked in Git
- Develop **custom domain-specific components** (Python/JavaScript nodes) for healthcare (FHIR validation), academic (simulation logic), and orchestration tasks
- Build **the Orchestrator Gateway API** — a centralized NestJS/FastAPI service exposing `/run/{flowId}` that all applications use to execute AI workflows
- Implement **Shadow Mode A/B testing** — safely test improved flow versions against production flows without impacting end users
- Create **automated flow testing framework** using Promptfoo/Ragas to evaluate AI accuracy, cost, and latency before production deployment
- Develop **Sentratorium Flow Dashboard** to visualize real-time flow execution, model performance, token usage, and cost tracking
- Configure **production deployment pipeline** with CI/CD automation, cost controls, and rollback capabilities

Without Phase 4, applications would need to directly call Langflow APIs independently, leading to inconsistent error handling, no A/B testing capability, poor observability, and inability to manage costs across multiple flows.

---

## Primary Objectives

### 1. Establish Version-Controlled Flow Repository

Create `flows/definitions/` directory where all Langflow flow definitions are exported as JSON files, version-controlled in Git, with metadata tracking (version, owner, last modified, test coverage).

**Success Indicator:** Every active flow in Langflow has a corresponding JSON export in Git; flow deployments are traceable to specific commits.

### 2. Create Custom Domain-Specific Langflow Components

Build reusable Langflow components (Python and JavaScript) for domain logic: FHIR validation, medical code lookups, sentiment analysis for academic feedback, and orchestration utilities.

**Success Indicator:** 10+ custom components deployed to Langflow; components are tested and documented with input/output schemas.

### 3. Build Orchestrator Gateway API

Develop a centralized NestJS/FastAPI service that exposes `/run/{flowId}` endpoint for all applications, with unified error handling, session logging, cost tracking, and webhook support.

**Success Indicator:** All flow executions route through Orchestrator; 99.9% uptime; response latency <500ms (excluding LLM).

### 4. Implement Shadow Mode A/B Testing

Create a safe testing framework where improved flow versions (shadow) execute alongside production flows (primary), with metrics collection but no impact on user-facing results.

**Success Indicator:** Shadow flows execute without impacting primary latency; automatic rollback triggered if shadow success rate drops below 90%.

### 5. Setup Flow Quality Testing Framework

Integrate Promptfoo (for LLM accuracy testing) and Ragas (for RAG evaluation) to automatically test flows before production deployment with measurable quality gates.

**Success Indicator:** Every flow deployment requires passing test suite; flows achieve >95% accuracy on test vectors before production release.

### 6. Create Real-Time Monitoring Dashboard

Develop Sentratorium Flow Dashboard visualizing active executions, error rates, token usage, cost per flow, model performance comparison, and historical trend analysis.

**Success Indicator:** Dashboard displays live data with <5 second latency; operators can identify flow failures and cost anomalies in real-time.

### 7. Configure Production Deployment Pipeline

Setup CI/CD automation for flow deployments: JSON validation, test suite execution, staging deployment, production rollout with canary strategy, and cost budget enforcement.

**Success Indicator:** Flows deploy from Git to production automatically; rollback available with single command; cost overages trigger alerts.

---

## Scope & Deliverables

**Phase 4 Duration:** 5-6 weeks (35-42 calendar days)

**Key Deliverables:**

- `flows/definitions/` repository with 8-10 production flows (FHIR validation, code generation, simulator logic)
- `flows/components/` custom components package (Python + JavaScript) with FHIR, medical code lookup, orchestration utilities
- `apps/orchestrator/` NestJS/FastAPI gateway service with `/run/{flowId}` endpoint and session logging
- Shadow Mode framework integrated into Orchestrator with A/B testing harness
- Promptfoo + Ragas test configurations for 8-10 flows
- Sentratorium Flow Dashboard (Next.js) with real-time execution visualization
- GitHub Actions workflow for automated flow testing and deployment
- Complete documentation: flow architecture, component development guide, testing framework, deployment runbooks

---

## Phase 4 Sub-Tasks Breakdown

### Sub-Task 4.1: Langflow Integration Setup & Version Control

**Owner:** Senior Backend Engineer / ML Engineer  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Establish a Git-based repository structure for version-controlled Langflow flow definitions with metadata tracking and deployment automation.

#### Detailed Steps

1. Create `flows/definitions/` directory structure:

```
flows/
   ├── definitions/
   │   ├── healthcare/
   │   │   ├── fhir-validator-v1.json
   │   │   ├── fhir-validator-v2.json
   │   │   └── metadata.yaml
   │   ├── academic/
   │   │   ├── simulator-engine-v1.json
   │   │   └── metadata.yaml
   │   ├── orchestrator/
   │   │   ├── langflow-router-v1.json
   │   │   └── metadata.yaml
   │   └── flows.registry.json
   ├── components/
   ├── tests/
   └── scripts/
```

1. Define flow metadata schema in `flows/definitions/metadata.yaml`:

```yaml
flows:
     fhir-validator-v1:
       flowId: "flow-fhir-v1"
       domain: "healthcare"
       version: "1.0.0"
       owner: "healthcare-team"
       description: "Validates FHIR Patient resources against R4 profiles"
       createdAt: "2025-01-15"
       lastModified: "2025-01-15"
       status: "production"
       testCoverage: 0.95
       expectedLatency: "2000ms" # including LLM
       costPerRun: "$0.025"
       dependencies:
         - "@the-abyss/fhir-engine"
         - "@the-abyss/ai-core"
       shadowMode:
         enabled: true
         shadowFlowId: "flow-fhir-v2"
         minAgreementRate: 0.90
```

1. Create `flows/scripts/sync-flows.ts` — CLI tool to export flows from Langflow and commit to Git:

```typescript
import { LangflowClient } from '@the-abyss/langflow-client';
   import * as fs from 'fs';
   
   async function syncFlows() {
     const client = new LangflowClient({
       baseUrl: process.env.LANGFLOW_API_URL,
       apiKey: process.env.LANGFLOW_API_KEY,
     });
     
     // Export all flows from Langflow
     const flows = await client.listFlows();
     
     for (const flow of flows) {
       const definition = await client.exportFlow(flow.id);
       const filePath = `flows/definitions/${flow.domain}/${flow.name}-v${flow.version}.json`;
       
       fs.writeFileSync(filePath, JSON.stringify(definition, null, 2));
       console.log(`✅ Exported: ${filePath}`);
     }
   }
```

1. Setup Git hooks for flow validation:

- Pre-commit hook: Validate JSON schema of flow definitions
- Pre-push hook: Run `abyss validate-flows` to check component compatibility
- Post-merge hook: Auto-sync flows from Git to Langflow staging environment

1. Create GitHub Actions workflow `workflows/sync-flows.yml`:

```yaml
name: Sync Langflow Definitions
   
   on:
     schedule:
       - cron: '0 */6 * * *' # Every 6 hours
     workflow_dispatch:
   
   jobs:
     sync:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Sync Flows from Langflow
           run: pnpm abyss sync-flows
         - name: Validate Flow Definitions
           run: pnpm abyss validate-flows
         - name: Commit Changes
           if: changes detected
           run: |
             git config user.name "Langflow Bot"
             git add flows/definitions/
             git commit -m "chore: sync flows from Langflow"
             git push
```

1. Document flow development workflow in `flows/README.md`:

- How to create new flows in Langflow UI
- How to export and version flows
- How to test flows locally
- How to promote flows to production

#### Success Criteria

- `flows/definitions/` directory structure created with metadata schema
- `abyss sync-flows` command exports all Langflow flows to JSON
- All flow JSON files validate against schema
- Git hooks prevent invalid flows from being committed
- Flows can be recovered from Git history (full version control)
- Metadata tracking includes owner, version, test coverage, cost estimates
- Shadow Mode flows tracked separately with min agreement rates

#### Deliverables

- `flows/definitions/` with 8-10 production flow definitions
- `flows/definitions/metadata.yaml` with complete flow registry
- `flows/scripts/sync-flows.ts` CLI tool
- Git hooks configuration (pre-commit, pre-push)
- GitHub Actions workflow for automated syncing
- Flow development documentation and best practices guide

---

### Sub-Task 4.2: Custom Domain-Specific Langflow Components

**Owner:** ML Engineer / Backend Engineer  
**Duration:** 4-5 days  
**Status:** Scheduled

#### Objective

Develop reusable custom Langflow components (nodes) for domain-specific logic: FHIR validation, medical code lookups, orchestration, and AI logic.

#### Detailed Steps

1. Create `flows/components/` directory structure:

```
flows/components/
   ├── python/
   │   ├── fhir-validator-component/
   │   │   ├── component.py
   │   │   ├── metadata.json
   │   │   └── requirements.txt
   │   ├── medical-code-lookup/
   │   │   ├── component.py
   │   │   └── metadata.json
   │   ├── sentiment-analyzer/
   │   │   ├── component.py
   │   │   └── metadata.json
   │   └── __init__.py
   ├── javascript/
   │   ├── fhir-bundle-builder/
   │   │   ├── index.ts
   │   │   └── metadata.json
   │   └── orchestration-router/
   │       ├── index.ts
   │       └── metadata.json
   └── README.md
```

1. Implement Python FHIR Validator component:

```python
# flows/components/python/fhir-validator-component/component.py
   from langflow.custom.base import Component
   from langflow.io import Output
   from the_abyss.fhir_engine import FHIRValidator
   from the_abyss.database import create_audit_log
   
   class FHIRValidatorComponent(Component):
       """Validate FHIR resources and log to audit trail."""
       
       display_name = "FHIR Validator"
       description = "Validates FHIR Patient, Observation, Practitioner resources"
       
       def build(
           self,
           resource_type: str,
           resource_data: dict,
           profile: str = "us-core",
           organization_id: str = None,
       ):
           validator = FHIRValidator(profile=profile, strict=True)
           
           # Validate resource
           result = validator.validate(resource_type, resource_data)
           
           # Log to audit trail
           if organization_id:
               await create_audit_log(
                   organization_id=organization_id,
                   action="validated",
                   resource=resource_type,
                   metadata={
                       "valid": result.valid,
                       "errors": result.errors,
                       "warnings": result.warnings,
                   }
               )
           
           return {
               "valid": result.valid,
               "errors": result.errors,
               "warnings": result.warnings,
               "resource": resource_data if result.valid else None,
           }
```

1. Implement Medical Code Lookup component:

```python
# flows/components/python/medical-code-lookup/component.py
   from langflow.custom.base import Component
   from the_abyss.fhir_engine import CodeSystemValidator
   
   class MedicalCodeLookupComponent(Component):
       """Look up SNOMED CT, LOINC, RxNorm codes."""
       
       display_name = "Medical Code Lookup"
       description = "Resolves medical codes (SNOMED CT, LOINC, RxNorm)"
       
       def build(
           self,
           code_system: str,  # "snomed", "loinc", "rxnorm"
           code: str,
       ):
           validator = CodeSystemValidator()
           
           result = await validator.lookup(
               system=f"http://terminology.hl7.org/{code_system}",
               code=code,
           )
           
           return {
               "code": code,
               "system": code_system,
               "display": result.display,
               "valid": result.valid,
               "metadata": result.metadata,
           }
```

1. Implement Sentiment Analyzer component for academic feedback:

```python
# flows/components/python/sentiment-analyzer/component.py
   from langflow.custom.base import Component
   from transformers import pipeline
   
   class SentimentAnalyzerComponent(Component):
       """Analyze sentiment of student feedback."""
       
       display_name = "Sentiment Analyzer"
       description = "Classifies academic feedback sentiment"
       
       def build(self, feedback_text: str):
           classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
           
           result = classifier(feedback_text)
           
           return {
               "sentiment": result[0]['label'],  # POSITIVE, NEGATIVE, NEUTRAL
               "confidence": result[0]['score'],
               "feedback": feedback_text,
           }
```

1. Create JavaScript FHIR Bundle Builder component:

```typescript
// flows/components/javascript/fhir-bundle-builder/index.ts
   import { Component } from "langflow";
   
   export class FHIRBundleBuilderComponent extends Component {
     displayName = "FHIR Bundle Builder";
     description = "Constructs FHIR Bundles from resources";
     
     async build(
       bundleType: string, // "transaction", "batch", "document"
       resources: Record<string, unknown>[],
     ) {
       const bundle = {
         resourceType: "Bundle",
         type: bundleType,
         entry: resources.map((resource, index) => ({
           request: {
             method: bundleType === "transaction" ? "POST" : "GET",
             url: resource.resourceType,
           },
           resource,
         })),
       };
       
       return {
         bundle,
         entryCount: resources.length,
         valid: true,
       };
     }
   }
```

1. Package components for distribution:

```json
// flows/components/python/fhir-validator-component/metadata.json
   {
     "name": "fhir-validator",
     "version": "1.0.0",
     "description": "Validates FHIR R4 resources",
     "author": "Healthcare Team",
     "inputs": {
       "resource_type": {
         "type": "string",
         "description": "FHIR resource type (Patient, Observation, etc.)",
         "enum": ["Patient", "Practitioner", "Observation", "Bundle"]
       },
       "resource_data": {
         "type": "object",
         "description": "FHIR resource in JSON format"
       },
       "profile": {
         "type": "string",
         "description": "FHIR profile (us-core, ipa)",
         "default": "us-core"
       },
       "organization_id": {
         "type": "string",
         "description": "Organization for audit logging"
       }
     },
     "outputs": {
       "valid": { "type": "boolean" },
       "errors": { "type": "array" },
       "warnings": { "type": "array" },
       "resource": { "type": "object" }
     }
   }
```

1. Document component development guide:

- How to create custom components
- Input/output schema specification
- Testing custom components
- Deployment to Langflow server

#### Success Criteria

- 10+ custom components created (5 Python, 5 JavaScript)
- All components have input/output schemas defined in metadata.json
- FHIR validator component integrates with `packages/fhir-engine`
- Medical code lookup integrates with terminology systems
- Components tested with unit tests (>80% coverage)
- Components deployed to Langflow server
- Documentation includes examples and best practices

#### Deliverables

- `flows/components/python/` with 5 Python components
- `flows/components/javascript/` with 5 JavaScript components
- Component metadata files (metadata.json for each)
- Unit tests for all components
- Component development guide and examples
- Deployment instructions to Langflow server

---

### Sub-Task 4.3: Orchestrator Gateway API

**Owner:** Senior Backend Engineer  
**Duration:** 5-6 days  
**Status:** Scheduled

#### Objective

Build a centralized NestJS/FastAPI service that acts as the single entry point for all flow executions, with unified error handling, session logging, cost tracking, and observability.

#### Detailed Steps

1. Initialize `apps/orchestrator/` NestJS application:

```bash
pnpm create-app orchestrator --template nestjs
   cd apps/orchestrator
   pnpm add @nestjs/common @nestjs/core @the-abyss/langflow-client @the-abyss/database axios
```

1. Create core flow controller (`src/flows/flows.controller.ts`):

```typescript
import { Controller, Post, Body, Param } from '@nestjs/common';
   import { FlowsService } from './flows.service';
   import { FlowExecutionDto } from './dto/flow-execution.dto';
   
   @Controller('flows')
   export class FlowsController {
     constructor(private flowsService: FlowsService) {}
     
     @Post(':flowId/run')
     async executeFlow(
       @Param('flowId') flowId: string,
       @Body() executionDto: FlowExecutionDto,
     ) {
       return await this.flowsService.executeFlow({
         flowId,
         input: executionDto.input,
         sessionId: executionDto.sessionId,
         organizationId: executionDto.organizationId,
         shadowMode: executionDto.shadowMode || false,
       });
     }
   }
```

1. Implement flows service with error handling and logging:

```typescript
// src/flows/flows.service.ts
   import { Injectable } from '@nestjs/common';
   import { LangflowClient } from '@the-abyss/langflow-client';
   import { prisma, createAuditLog } from '@the-abyss/database';
   import { SentratorialLogger } from '@the-abyss/ai-core';
   
   @Injectable()
   export class FlowsService {
     constructor(
       private langflowClient: LangflowClient,
       private sentratorialLogger: SentratorialLogger,
     ) {}
     
     async executeFlow(params: {
       flowId: string;
       input: Record<string, unknown>;
       sessionId?: string;
       organizationId: string;
       shadowMode?: boolean;
     }) {
       const startTime = Date.now();
       const sessionId = params.sessionId || `sess_${Date.now()}`;
       
       try {
         // Validate flow exists
         const flowMetadata = await this.getFlowMetadata(params.flowId);
         
         // Execute flow
         const result = await this.langflowClient.executeFlow({
           flowId: params.flowId,
           input: params.input,
         });
         
         const latencyMs = Date.now() - startTime;
         
         // Log session to Sentratorium
         await prisma.aiSession.create({
           data: {
             sessionId,
             organizationId: params.organizationId,
             agentType: 'flow-executor',
             domain: flowMetadata.domain,
             inputPrompt: JSON.stringify(params.input),
             modelUsed: flowMetadata.modelUsed || 'langflow',
             tokenUsed: result.tokensUsed || 0,
             latencyMs,
             output: JSON.stringify(result.output),
             costUsd: this.calculateCost(flowMetadata, result.tokensUsed),
             metadata: {
               flowId: params.flowId,
               shadowMode: params.shadowMode || false,
             },
           },
         });
         
         // Log to audit trail if FHIR-related
         if (flowMetadata.domain === 'healthcare') {
           await createAuditLog({
             organizationId: params.organizationId,
             action: 'executed_flow',
             resource: 'Flow',
             resourceId: params.flowId,
             metadata: {
               sessionId,
               latencyMs,
               success: true,
             },
           });
         }
         
         return {
           sessionId,
           output: result.output,
           latencyMs,
           costUsd: this.calculateCost(flowMetadata, result.tokensUsed),
           tokensUsed: result.tokensUsed,
         };
       } catch (error) {
         // Log errors to Sentratorium
         await prisma.aiSession.create({
           data: {
             sessionId,
             organizationId: params.organizationId,
             agentType: 'flow-executor',
             domain: 'unknown',
             inputPrompt: JSON.stringify(params.input),
             modelUsed: 'langflow',
             tokenUsed: 0,
             latencyMs: Date.now() - startTime,
             output: JSON.stringify({ error: error.message }),
             metadata: { flowId: params.flowId, error: true },
           },
         });
         
         throw error;
       }
     }
     
     private calculateCost(flowMetadata: any, tokensUsed: number): number {
       // Cost calculation: model-specific token pricing
       const tokenPricing = {
         'gpt-4': 0.00003,
         'claude-3.5-sonnet': 0.00003,
         'ollama': 0,
       };
       
       const modelUsed = flowMetadata.modelUsed || 'gpt-4';
       return tokensUsed * tokenPricing[modelUsed];
     }
   }
```

1. Create DTO for flow execution requests:

```typescript
// src/flows/dto/flow-execution.dto.ts
   import { IsString, IsObject, IsOptional } from 'class-validator';
   
   export class FlowExecutionDto {
     @IsString()
     flowId: string;
     
     @IsObject()
     input: Record<string, unknown>;
     
     @IsString()
     organizationId: string;
     
     @IsOptional()
     @IsString()
     sessionId?: string;
     
     @IsOptional()
     shadowMode?: boolean;
   }
```

1. Implement webhook handler for async completions:

```typescript
@Post('webhooks/flow-completion')
   async handleFlowCompletion(@Body() payload: WebhookPayload) {
     const { sessionId, status, output, error } = payload;
     
     // Update session with final result
     await prisma.aiSession.update({
       where: { sessionId },
       data: {
         output: JSON.stringify(output),
         approved: status === 'completed',
         metadata: { completedViaWebhook: true },
       },
     });
   }
```

1. Add health check and metrics endpoints:

```typescript
@Get('health')
   async health() {
     const langflowHealthy = await this.langflowClient.healthCheck();
     const databaseHealthy = await this.checkDatabaseConnection();
     
     return {
       status: langflowHealthy && databaseHealthy ? 'healthy' : 'degraded',
       langflow: langflowHealthy,
       database: databaseHealthy,
       timestamp: new Date(),
     };
   }
   
   @Get('metrics')
   async metrics() {
     const lastHour = new Date(Date.now() - 3600000);
     
     const sessions = await prisma.aiSession.groupBy({
       by: ['agentType'],
       where: { createdAt: { gte: lastHour } },
       _count: { id: true },
       _sum: { tokenUsed: true, costUsd: true },
       _avg: { latencyMs: true },
     });
     
     return { metrics: sessions, period: 'last_hour' };
   }
```

1. Document API specification:

- OpenAPI/Swagger schema for `/flows/:flowId/run`
- Request/response examples
- Error codes and handling
- Rate limiting policies
- Cost tracking endpoint

#### Success Criteria

- Orchestrator API deployed and accessible
- `/flows/:flowId/run` endpoint accepts flow executions
- Response latency <500ms (excluding LLM execution time)
- All sessions logged to Sentratorium with metadata
- Webhook support for async flow completions
- Health check endpoint reports Langflow and database status
- Metrics endpoint provides usage, token count, and cost data
- 99.9% uptime in staging for 1 week
- Complete API documentation with examples

#### Deliverables

- `apps/orchestrator/` fully functional NestJS application
- Flow execution controller with error handling
- Service layer integrating with Langflow, Sentratorium, database
- WebhooksController for async completions
- Health check and metrics endpoints
- OpenAPI/Swagger documentation
- Load testing results (1000 req/s target)

---

### Sub-Task 4.4: Shadow Mode A/B Testing Framework

**Owner:** ML Engineer / Quality Assurance  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Implement safe testing mechanism where improved flow versions execute alongside production flows without impacting user-facing results, with automatic rollback on degradation.

#### Detailed Steps

1. Extend flow execution service to support shadow mode:

```typescript
// src/flows/shadow-mode.service.ts
   import { Injectable } from '@nestjs/common';
   import { LangflowClient } from '@the-abyss/langflow-client';
   import { prisma } from '@the-abyss/database';
   
   @Injectable()
   export class ShadowModeService {
     constructor(
       private langflowClient: LangflowClient,
     ) {}
     
     async executeShadowMode(params: {
       primaryFlowId: string;
       shadowFlowId: string;
       input: Record<string, unknown>;
       organizationId: string;
       comparisonStrategy: 'output-diff' | 'quality-score' | 'cost';
     }) {
       // Execute both flows in parallel
       const [primaryResult, shadowResult] = await Promise.all([
         this.langflowClient.executeFlow({ flowId: params.primaryFlowId, input: params.input }),
         this.langflowClient.executeFlow({ flowId: params.shadowFlowId, input: params.input }),
       ]);
       
       // Compare outputs
       const comparison = this.compareOutputs(
         primaryResult.output,
         shadowResult.output,
         params.comparisonStrategy,
       );
       
       // Log shadow execution
       await prisma.aiSession.create({
         data: {
           sessionId: `sess_shadow_${Date.now()}`,
           organizationId: params.organizationId,
           agentType: 'shadow-mode',
           domain: 'orchestration',
           inputPrompt: JSON.stringify(params.input),
           modelUsed: 'langflow-shadow',
           tokenUsed: shadowResult.tokensUsed,
           latencyMs: shadowResult.latencyMs,
           output: JSON.stringify({
             primaryOutput: primaryResult.output,
             shadowOutput: shadowResult.output,
             comparison,
           }),
           metadata: {
             primaryFlowId: params.primaryFlowId,
             shadowFlowId: params.shadowFlowId,
             match: comparison.match,
             latencyDiff: shadowResult.latencyMs - primaryResult.latencyMs,
             costDiff: shadowResult.costUsd - primaryResult.costUsd,
           },
         },
       });
       
       // Return primary result (shadow is for monitoring only)
       return {
         output: primaryResult.output,
         sessionId: `sess_${Date.now()}`,
         shadowMetadata: {
           executed: true,
           match: comparison.match,
           latencyDiff: shadowResult.latencyMs - primaryResult.latencyMs,
           costDiff: shadowResult.costUsd - primaryResult.costUsd,
         },
       };
     }
     
     private compareOutputs(primary: unknown, shadow: unknown, strategy: string) {
       switch (strategy) {
         case 'output-diff':
           return {
             match: JSON.stringify(primary) === JSON.stringify(shadow),
             similarity: this.calculateSimilarity(primary, shadow),
           };
         case 'quality-score':
           return {
             match: Math.abs(this.scoreOutput(primary) - this.scoreOutput(shadow)) < 0.05,
             primaryScore: this.scoreOutput(primary),
             shadowScore: this.scoreOutput(shadow),
           };
         case 'cost':
           return {
             match: true,
             costAnalysis: 'shadow cheaper' || 'similar cost',
           };
         default:
           return { match: false };
       }
     }
     
     private calculateSimilarity(a: unknown, b: unknown): number {
       // Implement string similarity (Levenshtein or cosine similarity)
       return 0.95; // Placeholder
     }
     
     private scoreOutput(output: unknown): number {
       // Score output quality based on length, structure, coherence
       return 0.9; // Placeholder
     }
   }
```

1. Create automatic rollback mechanism:

```typescript
// src/flows/rollback.service.ts
   @Injectable()
   export class RollbackService {
     async monitorShadowFlow(
       primaryFlowId: string,
       shadowFlowId: string,
       minAgreementRate: number = 0.90,
     ) {
       // Monitor shadow flow for 24-48 hours
       setInterval(async () => {
         const lastExecutions = await prisma.aiSession.findMany({
           where: {
             metadata: {
               path: ['shadowFlowId'],
               equals: shadowFlowId,
             },
             createdAt: { gte: new Date(Date.now() - 3600000) }, // Last 1 hour
           },
           take: 100,
         });
         
         const matchCount = lastExecutions.filter(
           (s) => s.metadata.match === true,
         ).length;
         
         const agreementRate = matchCount / lastExecutions.length;
         
         if (agreementRate < minAgreementRate) {
           // Trigger rollback
           await this.rollbackFlow(shadowFlowId);
           
           // Send alert
           await this.sendAlert({
             type: 'SHADOW_MODE_ROLLBACK',
             flowId: shadowFlowId,
             agreementRate,
             threshold: minAgreementRate,
             action: 'reverted_to_primary',
           });
         }
       }, 300000); // Check every 5 minutes
     }
     
     private async rollbackFlow(shadowFlowId: string) {
       // Mark shadow flow as disabled in metadata
       const flows = await prisma.$queryRaw`
         UPDATE flow_metadata SET status = 'rollback' WHERE flow_id = ${shadowFlowId}
       `;
     }
   }
```

1. Create shadow mode dashboard component:

```typescript
// apps/internal/sentratorium-web/src/components/ShadowModeCard.tsx
   import React, { useEffect, useState } from 'react';
   import { Card, LineChart, Badge } from '@the-abyss/ui';
   
   export function ShadowModeCard({ flowId }: { flowId: string }) {
     const [metrics, setMetrics] = useState(null);
     
     useEffect(() => {
       fetch(`/api/flows/${flowId}/shadow-metrics`)
         .then(r => r.json())
         .then(setMetrics);
     }, [flowId]);
     
     if (!metrics) return <div>Loading...</div>;
     
     return (
       <Card>
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-semibold">Shadow Mode</h3>
           <Badge variant={metrics.match ? 'success' : 'warning'}>
             {metrics.agreementRate}% agreement
           </Badge>
         </div>
         
         <div className="grid grid-cols-3 gap-4 mb-4">
           <div>
             <p className="text-sm text-gray-600">Latency Diff</p>
             <p className="text-2xl font-bold">{metrics.latencyDiff}ms</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Cost Diff</p>
             <p className="text-2xl font-bold">${metrics.costDiff}</p>
           </div>
           <div>
             <p className="text-sm text-gray-600">Execution #</p>
             <p className="text-2xl font-bold">{metrics.executionCount}</p>
           </div>
         </div>
         
         <LineChart data={metrics.historicalTrend} />
       </Card>
     );
   }
```

1. Document shadow mode strategy and rollback procedures

#### Success Criteria

- Shadow flows execute without impacting primary flow latency
- Shadow mode latency overhead <2% of primary execution time
- Automatic rollback triggered when agreement rate drops below 90%
- All shadow executions logged with comparison metrics
- Dashboard visualizes agreement rate, latency diff, cost diff
- Rollback can be triggered manually via API
- Alerts sent when shadow agreement drops or when rollback occurs

#### Deliverables

- `ShadowModeService` with parallel execution and comparison logic
- `RollbackService` with automated monitoring and rollback
- Shadow mode dashboard component showing metrics
- Documentation: shadow mode strategy, rollback procedures, best practices

---

### Sub-Task 4.5: Flow Testing Framework (Promptfoo + Ragas)

**Owner:** QA Engineer / ML Engineer  
**Duration:** 4-5 days  
**Status:** Scheduled

#### Objective

Integrate automated testing frameworks (Promptfoo for LLM accuracy, Ragas for RAG quality) to establish quality gates before production deployment.

#### Detailed Steps

1. Install and configure Promptfoo:

```bash
cd flows/tests
   npm init
   npm install promptfoo
```

1. Create test configuration for FHIR validator flow:

```yaml
# flows/tests/promptfoo-config-fhir-validator.yaml
   testCases:
     - input:
         resource_type: Patient
         resource_data:
           resourceType: Patient
           id: patient-123
           name:
             - family: Smith
               given:
                 - John
           birthDate: "1980-01-01"
           gender: male
       expected:
         valid: true
         errors: []
   
     - input:
         resource_type: Patient
         resource_data:
           resourceType: Patient
           id: patient-456
           # Missing required fields
       expected:
         valid: false
         errors:
           - path: "/name"
             message: "Required field missing"
   
   prompts:
     - flows/definitions/healthcare/fhir-validator-v1.json
     - flows/definitions/healthcare/fhir-validator-v2.json
   
   evaluators:
     - type: "factuality"
       threshold: 0.95
     - type: "javascript"
       code: |
         (output) => {
           const result = JSON.parse(output);
           return {
             pass: result.valid === expected.valid,
             score: result.valid === expected.valid ? 1.0 : 0.0,
           };
         }
```

1. Create Ragas test configuration for RAG-based flows:

```python
# flows/tests/ragas-config.py
   from ragas import evaluate
   from ragas.metrics import (
       context_precision,
       context_recall,
       faithfulness,
       answer_relevancy,
   )
   from datasets import Dataset
   
   # Sample healthcare RAG test data
   test_data = {
       "question": [
           "What is the treatment for hypertension?",
           "How to validate a FHIR Patient resource?",
       ],
       "answer": [
           "Hypertension is treated with lifestyle changes and medications...",
           "Use the FHIR validation engine with US Core profile...",
       ],
       "contexts": [
           [
               "Hypertension is a common cardiovascular condition...",
               "First-line medications include ACE inhibitors...",
           ],
           [
               "FHIR Patient resource requires name and identifier...",
               "US Core profile defines additional requirements...",
           ],
       ],
   }
   
   dataset = Dataset.from_dict(test_data)
   
   # Evaluate RAG quality
   results = evaluate(
       dataset=dataset,
       metrics=[
           context_precision,
           context_recall,
           faithfulness,
           answer_relevancy,
       ],
   )
   
   print(f"Context Recall: {results['context_recall']}")
   print(f"Faithfulness: {results['faithfulness']}")
   print(f"Answer Relevancy: {results['answer_relevancy']}")
```

1. Create GitHub Actions workflow for test execution:

```yaml
# .github/workflows/test-flows.yml
   name: Test Flow Definitions
   
   on:
     pull_request:
       paths:
         - "flows/definitions/**"
   
   jobs:
     test-flows:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: "22"
         
         - name: Setup Python
           uses: actions/setup-python@v4
           with:
             python-version: "3.11"
         
         - name: Install dependencies
           run: |
             npm install -g promptfoo
             pip install ragas
         
         - name: Run Promptfoo tests
           run: promptfoo eval -c flows/tests/promptfoo-config.yaml
         
         - name: Run Ragas tests
           run: python flows/tests/ragas-config.py
         
         - name: Check quality gates
           run: |
             if [ "$PROMPTFOO_PASS_RATE" -lt 95 ]; then
               echo "Promptfoo tests failed: $PROMPTFOO_PASS_RATE% pass rate"
               exit 1
             fi
             if [ "$RAGAS_SCORE" -lt 0.85 ]; then
               echo "Ragas tests failed: $RAGAS_SCORE score"
               exit 1
             fi
         
         - name: Report results
           if: always()
           run: |
             echo "Promptfoo Results:" >> $GITHUB_STEP_SUMMARY
             cat flows/tests/.promptfoo/results.md >> $GITHUB_STEP_SUMMARY
```

1. Create test quality dashboard:

```typescript
// apps/internal/sentratorium-web/src/components/FlowTestDashboard.tsx
   import React, { useEffect, useState } from 'react';
   import { Table, Badge, LineChart } from '@the-abyss/ui';
   
   export function FlowTestDashboard() {
     const [testResults, setTestResults] = useState([]);
     
     useEffect(() => {
       fetch('/api/flows/test-results')
         .then(r => r.json())
         .then(setTestResults);
     }, []);
     
     return (
       <div className="space-y-6">
         <Table columns={['Flow ID', 'Promptfoo Pass Rate', 'Ragas Score', 'Status']}>
           {testResults.map(result => (
             <tr key={result.flowId}>
               <td>{result.flowId}</td>
               <td>{result.promptfooRate}%</td>
               <td>{result.ragasScore.toFixed(2)}</td>
               <td>
                 <Badge variant={result.passesQualityGate ? 'success' : 'error'}>
                   {result.passesQualityGate ? 'PASS' : 'FAIL'}
                 </Badge>
               </td>
             </tr>
           ))}
         </Table>
         
         <LineChart title="Test Success Rate Over Time" data={testResults} />
       </div>
     );
   }
```

1. Document testing strategy and best practices

#### Success Criteria

- Promptfoo configured for 8+ flows with >95% target pass rate
- Ragas configured for RAG flows with minimum 0.85 score
- Quality gates enforced: PR cannot merge unless tests pass
- Test results reported to GitHub and Sentratorium
- Test execution time <10 minutes per flow
- Historical test trends tracked (improvement over time)
- Test coverage includes normal cases and edge cases

#### Deliverables

- `flows/tests/promptfoo-config.yaml` for all flows
- `flows/tests/ragas-config.py` for RAG flows
- GitHub Actions workflow for automated testing
- Test results dashboard component
- Testing documentation and best practices guide

---

### Sub-Task 4.6: Sentratorium Flow Dashboard

**Owner:** Frontend Engineer  
**Duration:** 4-5 days  
**Status:** Scheduled

#### Objective

Develop a real-time monitoring dashboard visualizing flow executions, error rates, token usage, costs, and model performance trends.

#### Detailed Steps

1. Create dashboard layout component:

```typescript
// apps/internal/sentratorium-web/src/pages/flows/dashboard.tsx
   import React from 'react';
   import { Card, Container } from '@the-abyss/ui';
   import { FlowMetricsCard } from '@/components/flows/FlowMetricsCard';
   import { RealTimeExecutionFeed } from '@/components/flows/RealTimeExecutionFeed';
   import { CostAnalysisChart } from '@/components/flows/CostAnalysisChart';
   import { ModelPerformanceComparison } from '@/components/flows/ModelPerformanceComparison';
   
   export default function FlowsDashboard() {
     return (
       <Container>
         <div className="space-y-6">
           <div className="grid grid-cols-4 gap-4">
             <FlowMetricsCard metric="totalExecutions" />
             <FlowMetricsCard metric="successRate" />
             <FlowMetricsCard metric="avgLatency" />
             <FlowMetricsCard metric="dailyCost" />
           </div>
           
           <RealTimeExecutionFeed />
           <CostAnalysisChart />
           <ModelPerformanceComparison />
         </div>
       </Container>
     );
   }
```

1. Implement real-time execution feed with WebSocket:

```typescript
// src/components/flows/RealTimeExecutionFeed.tsx
   import React, { useEffect, useState } from 'react';
   import { Table, Badge } from '@the-abyss/ui';
   import { useWebSocket } from '@/hooks/useWebSocket';
   
   export function RealTimeExecutionFeed() {
     const [executions, setExecutions] = useState([]);
     const { data } = useWebSocket('/api/flows/ws/executions');
     
     useEffect(() => {
       if (data) {
         setExecutions(prev => [data, ...prev].slice(0, 50));
       }
     }, [data]);
     
     return (
       <div>
         <h2 className="text-xl font-semibold mb-4">Live Flow Executions</h2>
         <Table columns={['Flow ID', 'Input', 'Status', 'Latency', 'Cost', 'Time']}>
           {executions.map(exec => (
             <tr key={exec.sessionId} className="hover:bg-gray-50">
               <td className="font-mono text-sm">{exec.flowId}</td>
               <td className="text-gray-600">{JSON.stringify(exec.input).slice(0, 50)}...</td>
               <td>
                 <Badge variant={exec.success ? 'success' : 'error'}>
                   {exec.success ? 'SUCCESS' : 'ERROR'}
                 </Badge>
               </td>
               <td>{exec.latencyMs}ms</td>
               <td>${exec.costUsd.toFixed(4)}</td>
               <td className="text-xs text-gray-500">
                 {new Date(exec.createdAt).toLocaleTimeString()}
               </td>
             </tr>
           ))}
         </Table>
       </div>
     );
   }
```

1. Create cost analysis chart:

```typescript
// src/components/flows/CostAnalysisChart.tsx
   import React, { useEffect, useState } from 'react';
   import { LineChart, BarChart } from '@the-abyss/ui';
   
   export function CostAnalysisChart() {
     const [costData, setCostData] = useState(null);
     
     useEffect(() => {
       fetch('/api/flows/cost-analysis?period=7days')
         .then(r => r.json())
         .then(setCostData);
     }, []);
     
     if (!costData) return <div>Loading...</div>;
     
     return (
       <div className="grid grid-cols-2 gap-6">
         <div>
           <h3 className="text-lg font-semibold mb-4">Daily Cost Trend</h3>
           <LineChart 
             data={costData.dailyCosts}
             xAxis="date"
             yAxis="cost"
             line={{ color: '#EF4444' }}
           />
         </div>
         
         <div>
           <h3 className="text-lg font-semibold mb-4">Cost by Flow</h3>
           <BarChart
             data={costData.costByFlow}
             xAxis="flowId"
             yAxis="cost"
           />
         </div>
       </div>
     );
   }
```

1. Create model performance comparison:

```typescript
// src/components/flows/ModelPerformanceComparison.tsx
   import React, { useEffect, useState } from 'react';
   import { Table, Badge } from '@the-abyss/ui';
   
   export function ModelPerformanceComparison() {
     const [comparison, setComparison] = useState(null);
     
     useEffect(() => {
       fetch('/api/flows/model-comparison')
         .then(r => r.json())
         .then(setComparison);
     }, []);
     
     if (!comparison) return <div>Loading...</div>;
     
     return (
       <div>
         <h2 className="text-xl font-semibold mb-4">Model Performance</h2>
         <Table columns={['Model', 'Avg Latency', 'Accuracy', 'Cost/1K Tokens', 'Usage']}>
           {comparison.models.map(model => (
             <tr key={model.name}>
               <td className="font-semibold">{model.name}</td>
               <td>{model.avgLatencyMs}ms</td>
               <td>
                 <Badge variant={model.accuracy > 0.95 ? 'success' : 'warning'}>
                   {(model.accuracy * 100).toFixed(2)}%
                 </Badge>
               </td>
               <td>${model.costPer1kTokens.toFixed(4)}</td>
               <td>{model.usageCount} executions</td>
             </tr>
           ))}
         </Table>
       </div>
     );
   }
```

1. Implement API endpoints for dashboard data:

```typescript
// apps/orchestrator/src/analytics/analytics.controller.ts
   import { Controller, Get, Query } from '@nestjs/common';
   import { AnalyticsService } from './analytics.service';
   
   @Controller('api/flows')
   export class AnalyticsController {
     constructor(private analyticsService: AnalyticsService) {}
     
     @Get('cost-analysis')
     async getCostAnalysis(@Query('period') period: string) {
       return await this.analyticsService.analyzeCosts(period);
     }
     
     @Get('model-comparison')
     async getModelComparison() {
       return await this.analyticsService.compareModels();
     }
     
     @Get('error-rates')
     async getErrorRates() {
       return await this.analyticsService.calculateErrorRates();
     }
   }
```

1. Setup WebSocket for real-time updates:

```typescript
// apps/orchestrator/src/websocket/flows.gateway.ts
   import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
   import { Server } from 'socket.io';
   
   @WebSocketGateway({
     namespace: 'flows',
     cors: { origin: '*' },
   })
   export class FlowsGateway {
     @WebSocketServer()
     server: Server;
     
     broadcastExecution(execution: any) {
       this.server.emit('execution', execution);
     }
   }
```

#### Success Criteria

- Dashboard displays real-time flow executions (<5 second latency)
- Cost analysis shows daily trends and per-flow breakdowns
- Model performance comparison updated hourly
- Error tracking with ability to drill down to specific sessions
- WebSocket updates for live execution feed
- Dashboard loads in <3 seconds
- Filters available: date range, flow ID, domain, status

#### Deliverables

- `apps/internal/sentratorium-web/` dashboard application (Next.js)
- Real-time execution feed component
- Cost analysis and trend charts
- Model performance comparison table
- WebSocket gateway for live updates
- API endpoints for dashboard data
- Complete documentation

---

### Sub-Task 4.7: Monitoring, Alerting & Deployment Pipeline

**Owner:** DevOps Engineer / Backend Lead  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Setup comprehensive monitoring, alerting, and CI/CD automation for safe, reliable flow deployments with cost controls and automatic rollback.

#### Detailed Steps

1. Create GitHub Actions deployment workflow:

```yaml
# .github/workflows/deploy-flows.yml
   name: Deploy Flows to Production
   
   on:
     workflow_dispatch:
       inputs:
         flowId:
           description: Flow ID to deploy
           required: true
         environment:
           description: Target environment
           required: true
           default: staging
           type: choice
           options:
             - staging
             - production
   
   jobs:
     validate:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Validate flow JSON
           run: |
             FLOW_FILE="flows/definitions/${{ github.event.inputs.flowId }}.json"
             if [ ! -f "$FLOW_FILE" ]; then
               echo "Flow file not found: $FLOW_FILE"
               exit 1
             fi
             jq empty "$FLOW_FILE"
         
         - name: Run Promptfoo tests
           run: promptfoo eval -c flows/tests/promptfoo-config.yaml --flow ${{ github.event.inputs.flowId }}
         
         - name: Check quality gates
           run: |
             PASS_RATE=$(promptfoo view --json | jq .passRate)
             if [ "$PASS_RATE" -lt 95 ]; then
               echo "Quality gate failed: $PASS_RATE% < 95%"
               exit 1
             fi
     
     deploy-staging:
       needs: validate
       runs-on: ubuntu-latest
       environment: staging
       steps:
         - uses: actions/checkout@v4
         - name: Deploy to Langflow staging
           run: |
             curl -X POST http://langflow-staging:7860/api/flows \
               -H "Content-Type: application/json" \
               -d @flows/definitions/${{ github.event.inputs.flowId }}.json \
               -H "Authorization: Bearer ${{ secrets.LANGFLOW_API_KEY_STAGING }}"
         
         - name: Run smoke tests
           run: |
             npm run test:smoke -- --flow ${{ github.event.inputs.flowId }}
         
         - name: Report deployment
           if: success()
           run: |
             echo "✅ Deployed to staging: ${{ github.event.inputs.flowId }}"
     
     deploy-production:
       needs: deploy-staging
       if: github.event.inputs.environment == 'production'
       runs-on: ubuntu-latest
       environment: production
       steps:
         - uses: actions/checkout@v4
         - name: Deploy to Langflow production
           run: |
             curl -X POST http://langflow-prod:7860/api/flows \
               -H "Content-Type: application/json" \
               -d @flows/definitions/${{ github.event.inputs.flowId }}.json \
               -H "Authorization: Bearer ${{ secrets.LANGFLOW_API_KEY_PROD }}"
         
         - name: Start canary deployment
           run: |
             # 10% traffic to new flow
             kubectl patch service orchestrator -p '{"spec":{"selector":{"version":"canary"}}}'
         
         - name: Monitor metrics for 5 minutes
           run: sleep 300
         
         - name: Check success rate
           run: |
             SUCCESS_RATE=$(curl http://metrics-server/success-rate?flow=${{ github.event.inputs.flowId }})
             if [ "$SUCCESS_RATE" -lt 98 ]; then
               echo "Canary failed: $SUCCESS_RATE% < 98%"
               exit 1
             fi
         
         - name: Complete rollout
           if: success()
           run: |
             kubectl patch service orchestrator -p '{"spec":{"selector":{"version":"stable"}}}'
```

1. Create monitoring alerts configuration:

```yaml
# infrastructure/monitoring/prometheus-rules.yaml
   groups:
     - name: flow-alerts
       interval: 30s
       rules:
         - alert: HighFlowErrorRate
           expr: |
             (
               sum(rate(flow_execution_errors[5m]))
               /
               sum(rate(flow_executions[5m]))
             ) > 0.05
           for: 5m
           annotations:
             summary: "Flow error rate > 5%"
             description: "Flow {{ $labels.flow_id }} has error rate {{ $value }}"
         
         - alert: FlowCostOverrun
           expr: |
             increase(flow_cost_usd[1h]) > 1000
           for: 10m
           annotations:
             summary: "Hourly flow cost exceeds $1000"
             description: "Cost: ${{ $value }}"
         
         - alert: LowShadowModeAgreement
           expr: |
             shadow_mode_agreement_rate < 0.90
           for: 30m
           annotations:
             summary: "Shadow mode agreement rate dropped below 90%"
             description: "Flow {{ $labels.flow_id }} agreement: {{ $value }}"
         
         - alert: FlowExecutionLatencyHigh
           expr: |
             histogram_quantile(0.95, flow_execution_latency_ms) > 5000
           for: 5m
           annotations:
             summary: "Flow p95 latency > 5 seconds"
```

1. Create logging and tracing setup:

```typescript
// apps/orchestrator/src/tracing/tracing.module.ts
   import { Module } from '@nestjs/common';
   import { TracingService } from './tracing.service';
   
   @Module({
     providers: [TracingService],
     exports: [TracingService],
   })
   export class TracingModule {}
   
   // Implementation with OpenTelemetry
   export class TracingService {
     configureTracing() {
       const tracer = trace.getTracer('orchestrator');
       
       // Trace flow execution
       const flowSpan = tracer.startSpan('flow-execution', {
         attributes: {
           'flow.id': flowId,
           'organization.id': organizationId,
         },
       });
     }
   }
```

1. Create cost control limits:

```typescript
// apps/orchestrator/src/cost/cost-limiter.service.ts
   @Injectable()
   export class CostLimiterService {
     private costLimits = {
       hourly: 5000,  // $5000 per hour
       daily: 50000,  // $50000 per day
       monthly: 1000000, // $1M per month
     };
     
     async checkCostLimit(organizationId: string): Promise<boolean> {
       const hourlySpend = await this.getHourlySpend(organizationId);
       const dailySpend = await this.getDailySpend(organizationId);
       const monthlySpend = await this.getMonthlySpend(organizationId);
       
       if (hourlySpend > this.costLimits.hourly) {
         await this.sendAlert({
           type: 'COST_LIMIT_EXCEEDED',
           level: 'critical',
           spend: hourlySpend,
           limit: this.costLimits.hourly,
         });
         return false;
       }
       return true;
     }
   }
```

1. Create health check and readiness probes:

```yaml
# infrastructure/kubernetes/orchestrator-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: orchestrator
   spec:
     replicas: 3
     template:
       spec:
         containers:
           - name: orchestrator
             livenessProbe:
               httpGet:
                 path: /health
                 port: 3000
               initialDelaySeconds: 30
               periodSeconds: 10
             readinessProbe:
               httpGet:
                 path: /ready
                 port: 3000
               initialDelaySeconds: 10
               periodSeconds: 5
```

1. Document runbook for incidents:

```markdown
# Orchestrator Runbook
   
   ## High Error Rate Alert
   1. Check Langflow health: `curl http://langflow:7860/health`
   2. Query recent errors: `curl /api/flows/errors?limit=100`
   3. Identify affected flow: `SELECT DISTINCT flow_id FROM errors WHERE created_at > NOW() - INTERVAL 10m`
   4. If needed, trigger rollback: `kubectl rollout undo deployment/orchestrator`
   5. Update incident status in Slack
   
   ## Cost Overrun Alert
   1. Investigate high-cost flows: `SELECT flow_id, SUM(cost_usd) FROM sessions GROUP BY flow_id ORDER BY SUM DESC`
   2. Check for runaway executions or infinite loops
   3. Pause problematic flows: `kubectl patch flows-config --patch '{"spec":{"pausedFlows": ["flow-id"]}}'`
   4. Notify stakeholders
```

#### Success Criteria

- CI/CD pipeline enforces quality gates (>95% Promptfoo pass rate)
- Canary deployment for production with automatic rollback
- Monitoring alerts for error rate, cost, latency, shadow mode agreement
- Cost limits enforced: hourly, daily, monthly budgets
- Health checks report system status every 30 seconds
- Kubernetes deployments with 3 replicas for high availability
- Incident runbooks documented and tested

#### Deliverables

- `flows/workflows/deploy-flows.yml` GitHub Actions workflow
- `infrastructure/monitoring/prometheus-rules.yaml` alert configuration
- Kubernetes deployment manifests with health checks
- Cost limiter service with budget enforcement
- Tracing and logging configuration (OpenTelemetry)
- Complete incident runbooks and troubleshooting guides

---

## Implementation Timeline

| Week | Sub-Tasks | Milestones |
| --- | --- | --- |
| **Week 1** | 4.1, 4.2 | Flow repository + custom components deployed |
| **Week 2** | 4.3, 4.4 | Orchestrator API + shadow mode operational |
| **Week 3** | 4.5, 4.6 | Testing framework + dashboard live |
| **Week 4** | 4.7 | Monitoring, alerts, deployment pipeline complete |
| **Week 5-6** | Integration & Documentation | All flows tested, documented, production-ready |

---

## Success Metrics & Verification Checklist

### Technical Metrics

- All flow definitions versioned in Git with metadata
- 10+ custom components created and deployed
- Orchestrator API responds in <500ms (p99)
- 99.9% API uptime (monitored over 1 week)
- Zero data loss in session logging

### Quality Metrics

- All flows pass Promptfoo tests (>95% pass rate)
- RAG flows achieve Ragas score >0.85
- Shadow mode agreement rate >90%
- Production error rate <1%

### Operational Metrics

- Flow deployment <10 minutes (staging to production)
- Automatic rollback triggered within 5 minutes of degradation
- Cost tracking accurate to within 1%
- Dashboard loads in <3 seconds

### Compliance Metrics

- All flow executions logged to Sentratorium
- HIPAA audit trail complete for healthcare flows
- Cost alerts triggered before budget exceeds 80%

### Developer Experience

- `abyss sync-flows` command works reliably
- Developers can test flows locally before deployment
- Complete documentation for flow development
- New developers can deploy a flow within 1 hour

---

## Risks & Mitigation Strategies

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| **Langflow API instability** | Medium | High | Implement circuit breaker + fallback to cached responses |
| **Shadow mode overhead** | Medium | Medium | Async shadow execution; queue shadow jobs separately |
| **Cost overruns** | High | High | Hard limit enforcement; budget alerts at 50%, 75%, 90% |
| **Test flakiness** | Medium | Medium | Seed test data; retry failed tests 3x before failure |
| **Monitoring data loss** | Low | High | Dual-write to PostgreSQL + time-series DB; retention policies |
| **Slow dashboard** | Low | Medium | Pagination for large result sets; cache aggregations hourly |

---

## Dependencies & Assumptions

### External Dependencies

- Langflow server (self-hosted or managed)
- OpenAI API / Anthropic API (for LLM flows)
- PostgreSQL database (Sentratorium logging)
- Kubernetes cluster (production deployment)
- Prometheus + Grafana (monitoring)

### Assumptions

- Phase 1-3 completed and operational
- Langflow server accessible via API
- All team members trained on Git workflow
- Cost budgets defined per organization
- Incident response procedures in place

---

## Next Phase Preview

After Phase 4 completion, the team transitions to **Phase 5: Project Scaffolding**, building domain-specific applications:

- **Healthcare App**: Referralink API (NestJS) with FHIR endpoints
- **Academic App**: Clinical Simulator (React) with Langflow integration
- **Internal App**: Sentratorium Web Dashboard (Next.js) — already in progress
- **Incubator App**: Edge AI Prototype (experimental, relaxed governance)

Phase 5 leverages all Phase 4 infrastructure: flows are deployed and executed via the Orchestrator Gateway, monitoring happens in Sentratorium, and testing happens via Promptfoo/Ragas.