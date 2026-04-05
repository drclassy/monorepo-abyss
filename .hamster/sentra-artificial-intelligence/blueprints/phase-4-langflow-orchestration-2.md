---
id: "69323d8c-adf7-4dc6-900b-fefcc56eec00"
entity_type: "blueprint"
entity_id: "69323d8c-adf7-4dc6-900b-fefcc56eec00"
title: "Phase 4: Langflow & Orchestration"
status: ""
priority: ""
updated_at: "2026-03-31T07:10:28.680787+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Project Description

**Phase 4: Langflow & Orchestration** builds the **"nervous system" of The Abyss** — an AI orchestration layer that integrates Langflow for workflow automation, enables shadow mode A/B testing, and provides comprehensive flow quality evaluation. This phase transforms the reusable substrate (Phase 3) into executable AI pipelines accessible via a unified API gateway.

Phase 4 establishes:

- **Version-Controlled Flow Definitions**: Langflow JSON exports tracked in Git with automatic validation
- **Custom Components**: Domain-specific Python/JavaScript nodes for healthcare workflows, academic simulations, and research operations
- **Orchestrator Gateway**: FastAPI/NestJS API exposing unified `/run/{flowId}` and `/test/{flowId}` endpoints
- **Shadow Mode Testing**: A/B testing framework for comparing flow versions without impacting production
- **Flow Quality Assurance**: Automated testing using Promptfoo (prompt evaluation) and Ragas (RAG evaluation)
- **Sentratorium Integration**: Real-time monitoring of flow executions with detailed audit trails and cost tracking

This phase is critical because:

- **Consistency**: All AI operations go through standardized flow definitions
- **Safety**: Shadow mode lets teams test flow improvements before production rollout
- **Compliance**: Every flow execution is logged with full audit trails (HIPAA requirement)
- **Quality**: Automated testing prevents regression in AI model outputs
- **Cost Control**: Token usage and API costs are tracked per flow, per organization

Without this orchestration layer, each application would implement its own Langflow integration, leading to inconsistency, duplicated logic, and difficulty tracking performance across the entire system.

---

## Primary Objectives

### 1. Version-Control Langflow Flow Definitions

Create a Git-tracked repository of Langflow flow definitions with automated validation, change tracking, and deployment coordination.

**Success Indicator:** All flows can be exported from Langflow UI, committed to `flows/definitions/`, and deployed via CI/CD without manual API calls.

### 2. Build Custom Domain-Specific Components

Develop reusable Langflow components for healthcare (FHIR validation), academic (simulation engines), and research operations.

**Success Indicator:** Healthcare flows exclusively use custom FHIR validation nodes; 100% of custom components have unit tests and documentation.

### 3. Unified API Gateway for Flow Execution

Implement a single orchestrator service exposing `/run/{flowId}` and `/test/{flowId}` endpoints with request validation, error handling, and session tracking.

**Success Indicator:** All flows execute through the gateway; latency <2 seconds (excluding LLM); 99.9% uptime SLA.

### 4. Shadow Mode A/B Testing Framework

Enable teams to test new flow versions alongside production flows, compare outputs, and gradually promote improvements.

**Success Indicator:** Shadow mode overhead <100ms; comparison accuracy (match detection) >95%; dashboard shows pass/fail rates per flow.

### 5. Comprehensive Flow Quality Testing

Implement automated testing for prompt evaluation (Promptfoo) and RAG accuracy (Ragas) to catch regressions before production.

**Success Indicator:** All flows have defined test suites; no flow with <80% test pass rate deploys to production; regression detection catches 95% of quality issues.

### 6. Real-Time Monitoring & Cost Tracking

Extend Sentratorium dashboard to visualize flow executions, token usage, costs, and shadow mode effectiveness.

**Success Indicator:** Dashboard shows real-time metrics for all active flows; cost tracking accuracy ±2%; historical data retained for 7 years (healthcare compliance).

---

## Scope & Deliverables

**Phase 4 Duration:** 5-6 weeks (35-42 calendar days)

**Key Deliverables:**

- `flows/definitions/` with 15-20 production-ready flow definitions
- `flows/components/` with 8-12 custom Langflow components (Python + JS)
- `apps/orchestrator/` FastAPI/NestJS service with `/run/{flowId}` and `/test/{flowId}` endpoints
- Shadow mode execution framework in `packages/langflow-client`
- Promptfoo test suite configuration for prompt evaluation
- Ragas test suite configuration for RAG pipeline evaluation
- Sentratorium flow dashboard with real-time metrics
- Flow deployment pipeline via GitHub Actions (with shadow mode staging)
- Cost tracking & analytics system
- Complete documentation for flow development lifecycle

---

## Phase 4 Sub-Tasks Breakdown

### Sub-Task 4.1: Langflow Integration Setup & Flow Definitions Repository

**Owner:** Langflow / Orchestration Lead  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Establish version control for Langflow flow definitions with automated validation and deployment coordination.

#### Detailed Steps

1. Initialize `flows/` directory structure:

```
flows/
├── definitions/                    # Version-controlled flow exports
│   ├── healthcare/
│   │   ├── fhir-validator-v1.json
│   │   ├── patient-intake-v2.json
│   │   └── referral-processor-v1.json
│   ├── academic/
│   │   ├── clinical-simulator-v1.json
│   │   └── assessment-grader-v1.json
│   ├── incubator/
│   │   └── experimental-rag-v0.json
│   └── schema.json               # Flow definition JSON schema
├── components/                     # Custom component source code
│   ├── python/
│   │   ├── fhir_validator.py
│   │   └── medical_terminology.py
│   └── javascript/
│       ├── data-formatter.js
│       └── webhook-notifier.js
├── tests/                          # Flow testing configuration
│   ├── promptfoo/
│   │   └── config.yaml
│   └── ragas/
│       └── test_suites.py
├── migrations/                     # Flow version tracking
│   ├── 2025-01-15_add-patient-intake.md
│   └── 2025-01-20_fhir-validator-v2.md
└── README.md                       # Flow development guide
```

1. Create flow definition JSON schema (`flows/schema.json`):

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Langflow Flow Definition",
  "type": "object",
  "required": ["id", "name", "version", "domain", "nodes", "edges"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "name": { "type": "string" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "domain": {
      "enum": ["healthcare", "academic", "incubator", "internal"]
    },
    "description": { "type": "string" },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type", "data"],
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string" },
          "data": { "type": "object" },
          "position": {
            "type": "object",
            "properties": { "x": { "type": "number" }, "y": { "type": "number" } }
          }
        }
      }
    },
    "edges": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "source", "target"],
        "properties": {
          "id": { "type": "string" },
          "source": { "type": "string" },
          "target": { "type": "string" }
        }
      }
    },
    "requiredApprovals": {
      "type": "array",
      "enum": ["healthcare", "academic", "incubator"]
    },
    "shadowModeEnabled": { "type": "boolean" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

1. Set up flow export automation:

- Create GitHub Actions workflow that triggers on demand: `abyss sync-flow [flow-id]`
- Workflow downloads flow JSON from Langflow API using `packages/langflow-client`
- Validates against `flows/schema.json`
- Auto-increments version number (patch bump)
- Creates PR with flow definition change
- Requires approval from domain owner (healthcare → healthcare approver)

1. Implement flow metadata tracking:

```yaml
# flows/definitions/healthcare/fhir-validator-v1.json (metadata section)
{
  "id": "fhir-validator",
  "metadata": {
    "langflowId": "abc123xyz",
    "lastExportedAt": "2025-01-15T14:30:00Z",
    "exportedBy": "automation@the-abyss.internal",
    "requiredApprovals": ["healthcare"],
    "shadowModeConfig": {
      "enabled": true,
      "comparisonStrategy": "output-diff",
      "threshold": 0.95
    },
    "testCoverage": {
      "promptfoo": {
        "testCount": 15,
        "passRate": 0.92
      },
      "ragas": {
        "testCount": 10,
        "passRate": 0.88
      }
    },
    "costEstimate": {
      "inputTokensPerExecution": 450,
      "outputTokensPerExecution": 280,
      "estimatedCostPerExecution": 0.0085
    }
  }
}
```

1. Create flow migration log (`flows/migrations/`):

- Each flow change is documented in a timestamped markdown file
- Includes: what changed, why, impact analysis, rollback procedure
- Migrations linked to GitHub issues/PR for traceability

#### Success Criteria

- All Langflow flows exported to `flows/definitions/` with valid schema
- Version numbers follow semver and auto-increment on export
- Flow validation passes for all commits to main branch
- Healthcare flows marked with `requiredApprovals: ["healthcare"]`
- Shadow mode configuration present in all production flows
- Flow migration log exists for every version change
- Export automation works via `abyss sync-flow` command

#### Deliverables

- `flows/` directory structure with schema
- GitHub Actions workflow for flow synchronization
- Flow export automation integrated with `abyss-cli`
- JSON schema validator (`flows/schema.json`)
- Migration logging system
- Documentation: Flow development lifecycle

---

### Sub-Task 4.2: Custom Langflow Components (Python & JavaScript)

**Owner:** Backend Lead / AI Engineer  
**Duration:** 4-5 days  
**Status:** Scheduled

#### Objective

Build domain-specific custom components for healthcare, academic, and research workflows.

#### Detailed Steps

1. Initialize `flows/components/python/` for Python-based components:

```python
# flows/components/python/base_component.py
from langflow.custom.base import Component
from typing import Optional, Dict, Any

class BaseAbyss Component(Component):
    """Base class for all custom Abyss components."""
    
    display_name = "Base Component"
    description = "Base class for custom components"
    documentation = "https://docs.the-abyss.internal/components"
    
    def __init__(self):
        super().__init__()
        self.session_logger = SentratorialLogger()
    
    async def log_execution(self, data: Dict[str, Any]):
        """Auto-log component execution to Sentratorium."""
        await self.session_logger.log({
            "component_name": self.display_name,
            "input": data,
            "timestamp": datetime.now(),
        })
```

1. Build healthcare-specific components:

```python
# flows/components/python/fhir_validator.py
from base_component import BaseAbyssComponent
from packages.fhir_engine import FHIRValidator
import logging

class FHIRValidatorComponent(BaseAbyssComponent):
    display_name = "FHIR Resource Validator"
    description = "Validates FHIR R4 resources against official schemas"
    
    def __init__(self):
        super().__init__()
        self.fhir_validator = FHIRValidator(profile="us-core", strict=True)
    
    async def trigger(
        self,
        resource_type: str,
        resource_data: Dict[str, Any],
        organization_id: str,
        audit_required: bool = True,
    ) -> Dict[str, Any]:
        """
        Validate FHIR resource and optionally create audit log.
        
        Args:
            resource_type: e.g., "Patient", "Observation"
            resource_data: FHIR resource JSON
            organization_id: For multi-tenancy
            audit_required: Whether to log to AuditLog table
        
        Returns:
            {
                "valid": bool,
                "errors": List[str],
                "warnings": List[str],
                "resource_id": str
            }
        """
        
        # Validate
        result = self.fhir_validator.validate(
            resource_type=resource_type,
            resource=resource_data
        )
        
        # Log execution
        await self.log_execution({
            "resource_type": resource_type,
            "valid": result.valid,
            "error_count": len(result.errors),
        })
        
        # Optional audit trail
        if audit_required:
            from packages.database import createAuditLog
            await createAuditLog({
                "organizationId": organization_id,
                "action": "validated",
                "resource": resource_type,
                "resourceId": resource_data.get("id"),
                "metadata": {
                    "valid": result.valid,
                    "errors": result.errors,
                    "component": "FHIRValidatorComponent",
                }
            })
        
        return {
            "valid": result.valid,
            "errors": result.errors,
            "warnings": result.warnings,
            "resource_id": resource_data.get("id"),
        }
```

```python
# flows/components/python/medical_terminology.py
class MedicalTerminologyComponent(BaseAbyssComponent):
    display_name = "Medical Terminology Lookup"
    description = "Look up SNOMED CT, LOINC, and RxNorm codes"
    
    async def trigger(
        self,
        system: str,  # "snomed", "loinc", "rxnorm"
        code: str,
        display_text: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Look up medical terminology code and return expanded information.
        """
        
        from packages.fhir_engine import CodeSystemValidator
        
        validator = CodeSystemValidator()
        
        is_valid = await validator.validate({
            "system": self._resolve_system_url(system),
            "code": code,
            "display": display_text,
        })
        
        if is_valid:
            return {
                "found": True,
                "code": code,
                "system": system,
                "display": display_text or f"Code {code}",
            }
        else:
            return {
                "found": False,
                "code": code,
                "error": f"Invalid {system} code",
            }
    
    def _resolve_system_url(self, system: str) -> str:
        """Convert system shorthand to full URL."""
        mapping = {
            "snomed": "http://snomed.info/sct",
            "loinc": "http://loinc.org",
            "rxnorm": "http://www.nlm.nih.gov/research/umls/rxnorm",
        }
        return mapping.get(system, system)
```

1. Build JavaScript/TypeScript components:

```javascript
// flows/components/javascript/data-formatter.js
import { Component } from 'langflow-sdk';

export class DataFormatterComponent extends Component {
  displayName = 'Data Formatter';
  description = 'Format data into various output formats (JSON, CSV, XML)';
  
  async trigger(inputData, format = 'json') {
    const formatters = {
      json: (data) => JSON.stringify(data, null, 2),
      csv: (data) => this.toCSV(data),
      xml: (data) => this.toXML(data),
      markdown: (data) => this.toMarkdown(data),
    };
    
    if (!formatters[format]) {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    try {
      const formatted = formatters[format](inputData);
      
      // Log execution
      await this.logExecution({
        format,
        inputSize: JSON.stringify(inputData).length,
        outputSize: formatted.length,
      });
      
      return {
        success: true,
        data: formatted,
        format,
        size: formatted.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  toCSV(data) {
    // Implementation...
  }
  
  toXML(data) {
    // Implementation...
  }
  
  toMarkdown(data) {
    // Implementation...
  }
}
```

```javascript
// flows/components/javascript/webhook-notifier.js
export class WebhookNotifierComponent extends Component {
  displayName = 'Webhook Notifier';
  description = 'Send flow results to external webhooks with retry logic';
  
  async trigger(webhookUrl, payload, retryCount = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`,
          },
          body: JSON.stringify(payload),
          timeout: 10000,
        });
        
        if (response.ok) {
          return {
            success: true,
            statusCode: response.status,
            attempt,
          };
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        lastError = error;
        
        if (attempt < retryCount) {
          // Exponential backoff
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return {
      success: false,
      error: lastError.message,
      failedAttempts: retryCount,
    };
  }
}
```

1. Register components in Langflow:

- Create `flows/components/__init__.py` exporting all components
- Document component interface (inputs, outputs, configuration)
- Add type hints and validation for all inputs

1. Write component tests:

```python
# flows/components/tests/test_fhir_validator.py
import pytest
from components.python.fhir_validator import FHIRValidatorComponent

@pytest.mark.asyncio
async def test_valid_patient_resource():
    component = FHIRValidatorComponent()
    
    result = await component.trigger(
        resource_type="Patient",
        resource_data={
            "resourceType": "Patient",
            "id": "patient-123",
            "name": [{"family": "Smith", "given": ["John"]}],
            "birthDate": "1980-01-01",
            "gender": "male",
        },
        organization_id="org-123",
    )
    
    assert result["valid"] is True
    assert len(result["errors"]) == 0

@pytest.mark.asyncio
async def test_invalid_patient_resource():
    component = FHIRValidatorComponent()
    
    result = await component.trigger(
        resource_type="Patient",
        resource_data={"resourceType": "Patient"},  # Missing required fields
        organization_id="org-123",
    )
    
    assert result["valid"] is False
    assert len(result["errors"]) > 0
```

#### Success Criteria

- 8-12 custom components implemented (4-6 Python, 4-6 JavaScript)
- All components have type hints and input validation
- FHIR components integrate with `packages/fhir-engine`
- Medical terminology components have 100% code coverage
- Webhook notifier has retry logic with exponential backoff
- All components log execution to Sentratorium
- Test coverage >80% for all components

#### Deliverables

- `flows/components/python/` with 6-8 Python components
- `flows/components/javascript/` with 4-6 JavaScript components
- Component interface documentation
- Unit test suite for all components
- Integration tests with Langflow SDK

---

### Sub-Task 4.3: Orchestrator Gateway API

**Owner:** Backend / NestJS Lead  
**Duration:** 5-6 days  
**Status:** Scheduled

#### Objective

Build a unified API gateway for executing Langflow flows with request validation, error handling, and session tracking.

#### Detailed Steps

1. Initialize `apps/orchestrator/` (NestJS-based):

```bash
pnpm create-app orchestrator --template nestjs
cd apps/orchestrator

# Install dependencies
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @the-abyss/langflow-client @the-abyss/shared-types @the-abyss/database
npm install zod class-validator
npm install axios pino-logger
```

1. Create application structure:

```
apps/orchestrator/
├── src/
│   ├── main.ts                      # Entry point
│   ├── app.module.ts                # Root module
│   ├── flows/
│   │   ├── flows.controller.ts      # POST /run/:flowId
│   │   ├── flows.service.ts         # Business logic
│   │   ├── dto/
│   │   │   ├── execute-flow.dto.ts
│   │   │   └── test-flow.dto.ts
│   │   └── schemas/
│   │       └── flow-execution.schema.ts
│   ├── shadow-mode/
│   │   ├── shadow-mode.service.ts
│   │   └── shadow-mode.controller.ts
│   ├── health/
│   │   └── health.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── logging.middleware.ts
│   │   └── error-handler.middleware.ts
│   └── config/
│       └── configuration.ts
├── test/
├── Dockerfile
└── package.json
```

1. Implement flows controller:

```typescript
// src/flows/flows.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards, UseFilters } from '@nestjs/common';
import { FlowsService } from './flows.service';
import { ExecuteFlowDto, TestFlowDto } from './dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { ExceptionFilter } from '../middleware/error-handler.middleware';

@Controller('flows')
@UseFilters(ExceptionFilter)
@UseGuards(AuthGuard)
export class FlowsController {
  constructor(private flowsService: FlowsService) {}

  /**
   * Execute a Langflow flow
   * POST /flows/run/:flowId
   */
  @Post('run/:flowId')
  async executeFlow(
    @Param('flowId') flowId: string,
    @Body() dto: ExecuteFlowDto,
  ) {
    return this.flowsService.executeFlow({
      flowId,
      input: dto.input,
      organizationId: dto.organizationId,
      userId: dto.userId,
      shadowMode: dto.shadowMode === true,
      metadata: dto.metadata,
    });
  }

  /**
   * Test a flow with shadow mode comparison
   * POST /flows/test/:flowId
   */
  @Post('test/:flowId')
  async testFlow(
    @Param('flowId') flowId: string,
    @Body() dto: TestFlowDto,
  ) {
    return this.flowsService.testFlow({
      primaryFlowId: flowId,
      shadowFlowId: dto.shadowFlowId,
      input: dto.input,
      organizationId: dto.organizationId,
      comparisonStrategy: dto.comparisonStrategy || 'output-diff',
    });
  }

  /**
   * Get flow execution history
   * GET /flows/:flowId/history?limit=50&offset=0
   */
  @Get(':flowId/history')
  async getFlowHistory(
    @Param('flowId') flowId: string,
    @Body() query: { limit: number; offset: number; organizationId: string },
  ) {
    return this.flowsService.getFlowHistory(flowId, query);
  }

  /**
   * Health check for orchestrator service
   */
  @Get('health')
  async health() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      langflowConnected: await this.flowsService.checkLangflowHealth(),
      databaseConnected: await this.flowsService.checkDatabaseHealth(),
    };
  }
}
```

1. Implement flows service:

```typescript
// src/flows/flows.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { LangflowClient } from '@the-abyss/langflow-client';
import { prisma } from '@the-abyss/database';
import { ShadowModeExecutor } from '@the-abyss/langflow-client';

@Injectable()
export class FlowsService {
  private logger = new Logger(FlowsService.name);
  private langflowClient: LangflowClient;
  private shadowMode: ShadowModeExecutor;

  constructor() {
    this.langflowClient = new LangflowClient({
      baseUrl: process.env.LANGFLOW_API_URL,
      apiKey: process.env.LANGFLOW_API_KEY,
    });
    this.shadowMode = new ShadowModeExecutor(this.langflowClient);
  }

  async executeFlow(params: {
    flowId: string;
    input: Record<string, unknown>;
    organizationId: string;
    userId?: string;
    shadowMode: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const startTime = Date.now();

    try {
      // Load flow definition from Git
      const flowDef = await this.loadFlowDefinition(params.flowId);
      
      // Validate input against flow schema
      this.validateFlowInput(params.input, flowDef.inputSchema);

      // Execute primary flow
      const result = await this.langflowClient.executeFlow({
        flowId: params.flowId,
        input: params.input,
      });

      const latencyMs = Date.now() - startTime;

      // Log to Sentratorium
      const sessionId = `sess_${Date.now()}`;
      await prisma.aiSession.create({
        data: {
          sessionId,
          organizationId: params.organizationId,
          agentType: 'flow-execution',
          domain: flowDef.domain,
          userId: params.userId,
          inputPrompt: JSON.stringify(params.input),
          modelUsed: 'langflow-orchestrator',
          tokenUsed: result.tokensUsed || 0,
          latencyMs,
          output: JSON.stringify(result.output),
          approved: true,
          metadata: {
            flowId: params.flowId,
            shadowMode: params.shadowMode,
            ...params.metadata,
          },
        },
      });

      return {
        success: true,
        sessionId,
        output: result.output,
        latencyMs,
        tokensUsed: result.tokensUsed,
        metadata: {
          flowId: params.flowId,
          flowVersion: flowDef.version,
        },
      };
    } catch (error) {
      this.logger.error(`Flow execution failed: ${error.message}`, error);

      // Log failure
      await prisma.aiSession.create({
        data: {
          sessionId: `sess_error_${Date.now()}`,
          organizationId: params.organizationId,
          agentType: 'flow-execution',
          domain: 'error',
          inputPrompt: JSON.stringify(params.input),
          modelUsed: 'langflow-orchestrator',
          tokenUsed: 0,
          latencyMs: Date.now() - startTime,
          output: JSON.stringify({ error: error.message }),
          approved: false,
          metadata: {
            flowId: params.flowId,
            errorType: error.constructor.name,
          },
        },
      });

      throw error;
    }
  }

  async testFlow(params: {
    primaryFlowId: string;
    shadowFlowId: string;
    input: Record<string, unknown>;
    organizationId: string;
    comparisonStrategy: 'output-diff' | 'structure-match' | 'semantic-similarity';
  }) {
    return this.shadowMode.execute({
      primaryFlowId: params.primaryFlowId,
      shadowFlowId: params.shadowFlowId,
      input: params.input,
      comparisonStrategy: params.comparisonStrategy,
    });
  }

  private async loadFlowDefinition(flowId: string) {
    // Load from flows/definitions/ in Git
    // For now, hardcode example
    return {
      id: flowId,
      version: '1.0.0',
      domain: 'healthcare',
      inputSchema: {
        type: 'object',
        required: ['resourceType'],
        properties: {
          resourceType: { type: 'string' },
        },
      },
    };
  }

  private validateFlowInput(input: Record<string, unknown>, schema: any) {
    // Zod validation here
  }

  async checkLangflowHealth(): Promise<boolean> {
    try {
      const response = await this.langflowClient.health();
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkDatabaseHealth(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
```

1. Implement error handling and logging:

```typescript
// src/middleware/error-handler.middleware.ts
import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.logger.error(`[${request.method}] ${request.url}`, exception);

    response.status(500).json({
      success: false,
      error: exception instanceof Error ? exception.message : 'Internal server error',
      timestamp: new Date(),
      path: request.url,
    });
  }
}
```

#### Success Criteria

- `POST /flows/run/:flowId` executes flows with <2 second latency (excluding LLM)
- All executions logged to AiSession with organization isolation
- Request validation rejects invalid inputs with 400 error
- Error handling includes retry logic and graceful degradation
- Health check endpoint returns realistic status
- Authentication/authorization enforced per organization
- API documentation available (Swagger/OpenAPI)
- 99.9% uptime SLA in production

#### Deliverables

- `apps/orchestrator/` NestJS application with controllers and services
- Flow execution service with Langflow integration
- Shadow mode execution support
- Error handling and logging middleware
- Health check and monitoring endpoints
- API documentation (Swagger/OpenAPI)
- Dockerfile for containerization

---

### Sub-Task 4.4: Shadow Mode A/B Testing Framework

**Owner:** Data Science / QA Lead  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Implement safe A/B testing for flow improvements with detailed comparison metrics.

#### Detailed Steps

1. Extend shadow mode in `packages/langflow-client`:

```typescript
// packages/langflow-client/src/flows/shadow-mode.ts
export interface ShadowModeConfig {
  primaryFlowId: string;
  shadowFlowId: string;
  trafficAllocation: 0.0 | 0.1 | 0.25 | 0.5 | 1.0; // % of traffic to shadow
  comparisonStrategy: 'output-diff' | 'structure-match' | 'semantic-similarity';
  rolloutThreshold: 0.95; // Promote when 95% match
  maxShadowLatencyDiff: 500; // ms
}

export class ShadowModeExecutor {
  async execute(config: ShadowModeConfig, input: any): Promise<ShadowModeResult> {
    // Execute both flows in parallel
    const [primaryResult, shadowResult] = await Promise.all([
      this.executeFlow(config.primaryFlowId, input),
      this.executeFlow(config.shadowFlowId, input),
    ]);

    // Compare outputs
    const comparison = this.compare(
      primaryResult.output,
      shadowResult.output,
      config.comparisonStrategy
    );

    // Log to Sentratorium
    await this.logComparison({
      primaryFlowId: config.primaryFlowId,
      shadowFlowId: config.shadowFlowId,
      input,
      primaryOutput: primaryResult.output,
      shadowOutput: shadowResult.output,
      match: comparison.match,
      diff: comparison.diff,
      primaryLatency: primaryResult.latencyMs,
      shadowLatency: shadowResult.latencyMs,
    });

    // Return primary result to user (shadow is invisible)
    return {
      ...primaryResult,
      shadowMetadata: {
        executed: true,
        match: comparison.match,
        matchScore: comparison.score,
        latencyDiff: shadowResult.latencyMs - primaryResult.latencyMs,
        recommendation: this.getRecommendation(comparison, config),
      },
    };
  }

  private compare(
    primaryOutput: any,
    shadowOutput: any,
    strategy: string
  ): ComparisonResult {
    switch (strategy) {
      case 'output-diff':
        return this.compareOutputDiff(primaryOutput, shadowOutput);
      case 'structure-match':
        return this.compareStructure(primaryOutput, shadowOutput);
      case 'semantic-similarity':
        return this.compareSemanticSimilarity(primaryOutput, shadowOutput);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  private compareOutputDiff(primary: any, shadow: any): ComparisonResult {
    const primaryStr = JSON.stringify(primary);
    const shadowStr = JSON.stringify(shadow);
    
    // Exact match
    if (primaryStr === shadowStr) {
      return {
        match: true,
        score: 1.0,
        diff: [],
      };
    }

    // Partial match (same keys, different values)
    const primaryKeys = Object.keys(primary || {}).sort();
    const shadowKeys = Object.keys(shadow || {}).sort();

    if (JSON.stringify(primaryKeys) === JSON.stringify(shadowKeys)) {
      const differences = [];
      for (const key of primaryKeys) {
        if (primary[key] !== shadow[key]) {
          differences.push({
            field: key,
            primary: primary[key],
            shadow: shadow[key],
          });
        }
      }

      return {
        match: false,
        score: (primaryKeys.length - differences.length) / primaryKeys.length,
        diff: differences,
      };
    }

    // No match
    return {
      match: false,
      score: 0.0,
      diff: [{ error: 'Output structure mismatch' }],
    };
  }

  private getRecommendation(comparison: ComparisonResult, config: ShadowModeConfig) {
    if (comparison.score >= config.rolloutThreshold) {
      return {
        action: 'PROMOTE',
        reason: `Shadow flow matches primary at ${(comparison.score * 100).toFixed(1)}% - ready for rollout`,
      };
    } else if (comparison.score > 0.8) {
      return {
        action: 'INVESTIGATE',
        reason: `Shadow flow matches at ${(comparison.score * 100).toFixed(1)}% - review differences before promotion`,
      };
    } else {
      return {
        action: 'REJECT',
        reason: `Shadow flow matches at ${(comparison.score * 100).toFixed(1)}% - too many differences`,
      };
    }
  }
}
```

1. Create Sentratorium shadow mode dashboard visualization:

```typescript
// apps/internal/sentratorium-web/components/ShadowModeChart.tsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function ShadowModeChart({ flowId }: { flowId: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch shadow mode metrics from API
    fetchShadowModeMetrics(flowId).then(setData);
  }, [flowId]);

  return (
    <div className="shadow-mode-chart">
      <h3>Shadow Mode Performance: {flowId}</h3>
      
      <LineChart width={800} height={300} data={data}>
        <CartesianGrid />
        <XAxis dataKey="timestamp" />
        <YAxis yAxisId="left" label={{ value: 'Match Score (%)', angle: -90 }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: 'Latency Diff (ms)' }} />
        <Tooltip />
        <Legend />
        
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="matchScore"
          stroke="#22C55E"
          name="Match Score"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="latencyDiff"
          stroke="#F59E0B"
          name="Latency Diff (ms)"
        />
      </LineChart>

      <ShadowModeStats flowId={flowId} />
    </div>
  );
}

function ShadowModeStats({ flowId }: { flowId: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchShadowModeStats(flowId).then(setStats);
  }, [flowId]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="shadow-mode-stats grid grid-cols-3 gap-4 mt-6">
      <div className="stat-card">
        <h4>Match Rate</h4>
        <p className="text-2xl font-bold">{(stats.matchRate * 100).toFixed(1)}%</p>
        <p className="text-sm text-gray-500">Executions where shadow matches primary</p>
      </div>

      <div className="stat-card">
        <h4>Avg Latency Impact</h4>
        <p className="text-2xl font-bold">{stats.avgLatencyDiff.toFixed(0)}ms</p>
        <p className="text-sm text-gray-500">Shadow mode overhead</p>
      </div>

      <div className="stat-card">
        <h4>Recommendation</h4>
        <p className={`text-2xl font-bold ${stats.recommendation === 'PROMOTE' ? 'text-green-500' : 'text-yellow-500'}`}>
          {stats.recommendation}
        </p>
        <p className="text-sm text-gray-500">Based on {stats.executionCount} comparisons</p>
      </div>
    </div>
  );
}
```

1. Create shadow mode promotion workflow:

```bash
# GitHub Actions workflow to promote shadow flows
# .github/workflows/promote-shadow-flow.yml

name: Promote Shadow Flow

on:
  workflow_dispatch:
    inputs:
      flowId:
        description: 'Flow ID to promote'
        required: true
      shadowFlowId:
        description: 'Shadow flow ID to promote to primary'
        required: true

jobs:
  promote:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check shadow mode metrics
        run: |
          pnpm abyss shadow-mode stats \
            --primary ${{ github.event.inputs.flowId }} \
            --shadow ${{ github.event.inputs.shadowFlowId }}
      
      - name: Verify match rate > 95%
        run: |
          # Fail if match rate < 95%
          MATCH_RATE=$(pnpm abyss shadow-mode stats ... | grep "Match Rate")
          if (( $(echo "$MATCH_RATE < 95" | bc -l) )); then
            echo "Match rate below 95% - aborting promotion"
            exit 1
          fi
      
      - name: Create promotion PR
        run: |
          # Rename shadow flow to primary in flows/definitions/
          mv flows/definitions/*/${{ github.event.inputs.shadowFlowId }}.json \
             flows/definitions/*/${{ github.event.inputs.flowId }}-v2.json
          
          # Update metadata
          jq '.version |= split(".") | .[1] += 1 | join(".")' \
             flows/definitions/*/${{ github.event.inputs.flowId }}-v2.json > temp.json && \
             mv temp.json flows/definitions/*/${{ github.event.inputs.flowId }}-v2.json
          
          git config user.name "abyss-automation"
          git config user.email "automation@the-abyss.internal"
          git add flows/definitions/
          git commit -m "Promote shadow flow: ${{ github.event.inputs.flowId }}"
          git push origin promote-${{ github.event.inputs.flowId }}
          
          # Create PR
          gh pr create \
            --title "Promote shadow flow: ${{ github.event.inputs.flowId }}" \
            --body "Shadow mode match rate: >95%\nAutomated promotion from shadow mode testing"
```

#### Success Criteria

- Shadow mode overhead <100ms per execution
- Comparison accuracy (match detection) >95%
- Dashboard shows match rate, latency diff, and recommendations
- Promotion workflow prevents rollout if match rate <95%
- All shadow executions logged with comparison metadata
- Traffic allocation works (0%, 10%, 25%, 50%, 100%)

#### Deliverables

- Enhanced `packages/langflow-client` with shadow mode strategies
- Sentratorium dashboard for shadow mode visualization
- GitHub Actions promotion workflow
- Shadow mode comparison metrics and recommendations
- Documentation: shadow mode best practices

---

### Sub-Task 4.5: Flow Testing with Promptfoo & Ragas

**Owner:** QA / ML Lead  
**Duration:** 4-5 days  
**Status:** Scheduled

#### Objective

Implement automated testing for prompt quality (Promptfoo) and RAG accuracy (Ragas) to catch regressions.

#### Detailed Steps

1. Setup Promptfoo for prompt evaluation:

```yaml
# flows/tests/promptfoo/config.yaml
prompts:
  - name: "FHIR Validator Prompt"
    path: "flows/definitions/healthcare/fhir-validator-v1.json"
    template: true

providers:
  - id: langflow
    config:
      baseUrl: ${LANGFLOW_API_URL}
      apiKey: ${LANGFLOW_API_KEY}

tests:
  - description: "Valid Patient resource should pass validation"
    input:
      resourceType: "Patient"
      resourceData:
        resourceType: "Patient"
        id: "patient-123"
        name: [{ family: "Smith", given: ["John"] }]
        birthDate: "1980-01-01"
        gender: "male"
    expected:
      contains: "valid: true"
      
  - description: "Invalid Patient (missing required fields) should fail"
    input:
      resourceType: "Patient"
      resourceData:
        resourceType: "Patient"
        id: "patient-456"
    expected:
      contains: "valid: false"
      contains: "errors"
      
  - description: "Observation with LOINC code should validate"
    input:
      resourceType: "Observation"
      resourceData:
        resourceType: "Observation"
        id: "obs-123"
        code:
          coding:
            - system: "http://loinc.org"
              code: "85354-9"
              display: "Blood pressure panel"
    expected:
      contains: "valid: true"

assertions:
  - type: "contains"
  - type: "regex"
  - type: "json-schema"
  
metrics:
  - name: "latency"
    description: "Average execution latency"
    threshold: 1000 # ms
    
  - name: "pass_rate"
    description: "Percentage of tests passing"
    threshold: 0.95

thresholds:
  passRate: 0.80
  latency: 1000
```

1. Implement Ragas for RAG evaluation:

```python
# flows/tests/ragas/test_fhir_rag.py
import asyncio
from ragas import RunConfig, evaluate
from ragas.metrics import (
    context_precision,
    context_recall,
    answer_relevancy,
    answer_similarity,
)
from datasets import Dataset

# Healthcare FHIR RAG test suite
class FHIRRAGEvaluator:
    def __init__(self, flow_id: str):
        self.flow_id = flow_id
        self.langflow_client = LangflowClient(...)
    
    async def evaluate_rag_quality(self):
        """
        Evaluate RAG quality for FHIR documentation search.
        Tests semantic relevance and context precision.
        """
        
        test_cases = [
            {
                "query": "How to validate a Patient resource?",
                "ground_truth_answer": (
                    "Use the FHIR R4 Patient profile validation. "
                    "Required fields: id, name, birthDate, gender. "
                    "Use code system validators for telecom and address."
                ),
                "contexts": [
                    "FHIR R4 Patient resource specification...",
                    "Validation rules for Patient.name element...",
                ],
            },
            {
                "query": "What are the required SNOMED CT bindings for Observation?",
                "ground_truth_answer": (
                    "Observation.code must use SNOMED CT (http://snomed.info/sct). "
                    "Observation.value can use specific value sets depending on code."
                ),
                "contexts": [
                    "SNOMED CT binding for Observation.code...",
                    "Observation value set requirements...",
                ],
            },
        ]
        
        # Execute flow for each test case
        predictions = []
        for test in test_cases:
            result = await self.langflow_client.executeFlow({
                "flowId": self.flow_id,
                "input": {"query": test["query"]},
            })
            
            predictions.append({
                "query": test["query"],
                "response": result["output"],
                "contexts": test["contexts"],
                "ground_truth": test["ground_truth_answer"],
            })
        
        # Create Ragas dataset
        dataset = Dataset.from_dict({
            "question": [p["query"] for p in predictions],
            "answer": [p["response"] for p in predictions],
            "contexts": [p["contexts"] for p in predictions],
            "ground_truth": [p["ground_truth"] for p in predictions],
        })
        
        # Evaluate with Ragas metrics
        results = await evaluate(
            dataset,
            metrics=[
                context_precision,
                context_recall,
                answer_relevancy,
                answer_similarity,
            ],
            run_config=RunConfig(timeout=600),
        )
        
        return {
            "flow_id": self.flow_id,
            "test_count": len(test_cases),
            "metrics": {
                "context_precision": float(results["context_precision"]),
                "context_recall": float(results["context_recall"]),
                "answer_relevancy": float(results["answer_relevancy"]),
                "answer_similarity": float(results["answer_similarity"]),
            },
            "pass": all(v > 0.80 for v in results.values()),
        }

# Run evaluation
async def main():
    evaluator = FHIRRAGEvaluator("fhir-validator-v1")
    results = await evaluator.evaluate_rag_quality()
    print(f"RAG Quality Results: {results}")

asyncio.run(main())
```

1. Integrate tests into CI/CD:

```yaml
# .github/workflows/test-flows.yml
name: Test Flows

on:
  pull_request:
    paths:
      - 'flows/**'
  workflow_dispatch:

jobs:
  promptfoo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install promptfoo
        run: npm install -g promptfoo
      
      - name: Run Promptfoo tests
        run: |
          cd flows/tests/promptfoo
          promptfoo eval --config config.yaml --output results.json
      
      - name: Check pass rate
        run: |
          PASS_RATE=$(jq '.results.passRate' results.json)
          if (( $(echo "$PASS_RATE < 0.80" | bc -l) )); then
            echo "Promptfoo pass rate below 80% - failing"
            exit 1
          fi
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: promptfoo-results
          path: flows/tests/promptfoo/results.json

  ragas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Ragas
        run: pip install ragas langchain
      
      - name: Run Ragas evaluation
        run: |
          cd flows/tests/ragas
          python -m pytest test_*.py -v --ragas-evaluate
      
      - name: Check metrics
        run: |
          # Verify all metrics > 0.80
          python -c "
            import json
            with open('ragas-results.json') as f:
              results = json.load(f)
            for metric, value in results['metrics'].items():
              if value < 0.80:
                print(f'Metric {metric} below 0.80: {value}')
                exit(1)
          "
```

1. Create test reporting in Sentratorium:

```typescript
// apps/internal/sentratorium-web/components/FlowTestResults.tsx
export function FlowTestResults({ flowId }: { flowId: string }) {
  const [promptfooResults, setPromptfooResults] = useState<any>(null);
  const [ragasResults, setRagasResults] = useState<any>(null);

  useEffect(() => {
    fetchTestResults(flowId).then(({ promptfoo, ragas }) => {
      setPromptfooResults(promptfoo);
      setRagasResults(ragas);
    });
  }, [flowId]);

  return (
    <div className="flow-test-results">
      <h2>Test Results for {flowId}</h2>

      {promptfooResults && (
        <Card title="Promptfoo Evaluation">
          <div className="grid grid-cols-2 gap-4">
            <div className="metric">
              <p className="label">Pass Rate</p>
              <p className={`value ${promptfooResults.passRate > 0.80 ? 'text-green-500' : 'text-red-500'}`}>
                {(promptfooResults.passRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="metric">
              <p className="label">Test Count</p>
              <p className="value">{promptfooResults.testCount}</p>
            </div>
          </div>
          
          <div className="test-details mt-4">
            <h4>Test Details</h4>
            {promptfooResults.tests.map((test: any) => (
              <div key={test.id} className={`test-result ${test.passed ? 'pass' : 'fail'}`}>
                <span className="status">{test.passed ? '✓' : '✗'}</span>
                <span className="description">{test.description}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {ragasResults && (
        <Card title="Ragas RAG Evaluation">
          <div className="grid grid-cols-4 gap-4">
            <div className="metric">
              <p className="label">Context Precision</p>
              <p className="value">{(ragasResults.metrics.context_precision * 100).toFixed(1)}%</p>
            </div>
            <div className="metric">
              <p className="label">Context Recall</p>
              <p className="value">{(ragasResults.metrics.context_recall * 100).toFixed(1)}%</p>
            </div>
            <div className="metric">
              <p className="label">Answer Relevancy</p>
              <p className="value">{(ragasResults.metrics.answer_relevancy * 100).toFixed(1)}%</p>
            </div>
            <div className="metric">
              <p className="label">Answer Similarity</p>
              <p className="value">{(ragasResults.metrics.answer_similarity * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
```

#### Success Criteria

- All flows have defined test suites (Promptfoo + Ragas)
- No flow with <80% test pass rate deploys to production
- Regression detection catches 95% of quality issues
- Test results stored in Sentratorium with historical tracking
- CI/CD blocks merge if tests fail
- Dashboard shows test pass/fail rates per flow

#### Deliverables

- Promptfoo configuration for prompt evaluation
- Ragas test suite for RAG evaluation
- CI/CD integration for automated testing
- Test result reporting in Sentratorium
- Documentation: test best practices and metrics

---

### Sub-Task 4.6: Sentratorium Flow Monitoring Dashboard

**Owner:** Frontend / Analytics Lead  
**Duration:** 4-5 days  
**Status:** Scheduled

#### Objective

Build comprehensive real-time monitoring dashboard for flow executions, cost tracking, and quality metrics.

#### Detailed Steps

1. Create flow execution monitoring views:

```typescript
// apps/internal/sentratorium-web/pages/flows/index.tsx
export function FlowsMonitoringDashboard() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  return (
    <div className="flows-dashboard">
      <header>
        <h1>Flow Monitoring</h1>
        <div className="controls">
          <DateRangePicker />
          <Select label="Domain" options={['healthcare', 'academic', 'incubator']} />
          <Select label="Status" options={['healthy', 'degraded', 'failed']} />
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 metrics-summary">
        <MetricCard
          title="Total Executions"
          value={flows.reduce((sum, f) => sum + f.executionCount, 0)}
          trend={8.2}
        />
        <MetricCard
          title="Success Rate"
          value={`${(flows.reduce((sum, f) => sum + f.successRate, 0) / flows.length).toFixed(1)}%`}
          trend={-0.5}
        />
        <MetricCard
          title="Avg Latency"
          value={`${Math.round(flows.reduce((sum, f) => sum + f.avgLatency, 0) / flows.length)}ms`}
          trend={-5.2}
        />
        <MetricCard
          title="Total Cost (Today)"
          value={`$${flows.reduce((sum, f) => sum + f.dailyCost, 0).toFixed(2)}`}
          trend={12.3}
        />
      </div>

      <div className="flows-grid">
        {flows.map((flow) => (
          <FlowCard
            key={flow.id}
            flow={flow}
            onSelect={() => setSelectedFlow(flow.id)}
            isSelected={selectedFlow === flow.id}
          />
        ))}
      </div>

      {selectedFlow && <FlowDetailView flowId={selectedFlow} />}
    </div>
  );
}

function FlowCard({ flow }: { flow: Flow }) {
  return (
    <Card className="flow-card">
      <div className="header">
        <h3>{flow.name}</h3>
        <Badge variant={flow.status}>{flow.status}</Badge>
      </div>

      <div className="metrics grid grid-cols-2 gap-2 mt-4">
        <div>
          <p className="label">Success Rate</p>
          <p className="value">{(flow.successRate * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="label">Avg Latency</p>
          <p className="value">{Math.round(flow.avgLatency)}ms</p>
        </div>
        <div>
          <p className="label">Executions (24h)</p>
          <p className="value">{flow.executionCount}</p>
        </div>
        <div>
          <p className="label">Cost (24h)</p>
          <p className="value">${flow.dailyCost.toFixed(2)}</p>
        </div>
      </div>

      <div className="mini-chart mt-4">
        <LineChart width={300} height={100} data={flow.latencyTrend}>
          <Line type="monotone" dataKey="latency" stroke="#0066CC" dot={false} />
        </LineChart>
      </div>
    </Card>
  );
}
```

1. Implement cost tracking analytics:

```typescript
// apps/internal/sentratorium-web/components/CostAnalytics.tsx
export function CostAnalytics({ flowId, timeRange }: any) {
  const [costData, setCostData] = useState<CostRecord[]>([]);

  useEffect(() => {
    fetchCostData(flowId, timeRange).then(setCostData);
  }, [flowId, timeRange]);

  const totalCost = costData.reduce((sum, record) => sum + record.totalCost, 0);
  const averageCost = totalCost / costData.length;
  const modelBreakdown = groupByModel(costData);

  return (
    <div className="cost-analytics">
      <div className="metrics grid grid-cols-3 gap-4">
        <MetricCard title="Total Cost" value={`$${totalCost.toFixed(2)}`} />
        <MetricCard title="Average Cost/Execution" value={`$${averageCost.toFixed(4)}`} />
        <MetricCard title="Executions" value={costData.length} />
      </div>

      <div className="breakdown mt-6">
        <h3>Cost Breakdown by Model</h3>
        <div className="model-costs">
          {modelBreakdown.map((model) => (
            <div key={model.name} className="model-row">
              <span className="model-name">{model.name}</span>
              <span className="model-cost">${model.totalCost.toFixed(2)}</span>
              <span className="model-percentage">{((model.totalCost / totalCost) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <BarChart width={800} height={300} data={costData} className="mt-6">
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
        <Bar dataKey="totalCost" fill="#0066CC" />
      </BarChart>
    </div>
  );
}
```

1. Create alert and health check system:

```typescript
// apps/internal/sentratorium-web/services/flow-alerts.ts
export class FlowAlertService {
  async checkFlowHealth(flowId: string): Promise<HealthStatus> {
    const [latency, errors, cost] = await Promise.all([
      this.getLatencyMetrics(flowId),
      this.getErrorMetrics(flowId),
      this.getCostMetrics(flowId),
    ]);

    const alerts: Alert[] = [];

    // Latency alert
    if (latency.p99 > 3000) {
      alerts.push({
        type: 'latency',
        severity: 'warning',
        message: `Flow latency (p99: ${latency.p99}ms) exceeds 3s threshold`,
      });
    }

    // Error rate alert
    if (errors.rate > 0.05) {
      alerts.push({
        type: 'error_rate',
        severity: 'critical',
        message: `Error rate (${(errors.rate * 100).toFixed(1)}%) exceeds 5% threshold`,
      });
    }

    // Cost alert
    const estimatedDaily = cost.avgPerExecution * 1000;
    if (estimatedDaily > cost.budgetDaily) {
      alerts.push({
        type: 'cost',
        severity: 'warning',
        message: `Estimated daily cost ($${estimatedDaily.toFixed(2)}) exceeds budget ($${cost.budgetDaily.toFixed(2)})`,
      });
    }

    return {
      flowId,
      status: alerts.length === 0 ? 'healthy' : alerts.some(a => a.severity === 'critical') ? 'critical' : 'warning',
      alerts,
      checkedAt: new Date(),
    };
  }

  async notifyAlerts(alerts: Alert[]) {
    // Send to Slack/Teams
    for (const alert of alerts) {
      await this.sendNotification({
        channel: `#flow-alerts-${alert.type}`,
        message: alert.message,
        severity: alert.severity,
      });
    }
  }
}
```

#### Success Criteria

- Real-time monitoring shows latency, success rate, cost metrics
- Cost tracking accuracy ±2%
- Dashboard responsive with <1 second load time
- Historical data retained for 7 years (healthcare compliance)
- Alerts trigger for latency >3s, error rate >5%, cost overages
- Export functionality for compliance audits (CSV)

#### Deliverables

- Real-time flow execution dashboard
- Cost tracking and analytics views
- Alert and health check system
- Historical metrics storage
- Export and compliance reporting

---

### Sub-Task 4.7: Monitoring, Logging & Deployment Pipeline

**Owner:** DevOps / Infrastructure Lead  
**Duration:** 3-4 days  
**Status:** Scheduled

#### Objective

Implement comprehensive logging, monitoring, and deployment automation for flows.

#### Detailed Steps

1. Set up centralized logging for flows:

```yaml
# infrastructure/logging/loki-config.yaml
auth_enabled: false

ingester:
  chunk_idle_period: 3m
  max_chunk_age: 3h
  max_streams_per_user: 10000

storage_config:
  filesystem:
    directory: /loki/chunks

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema:
        version: v11
        index:
          prefix: index_
          period: 24h

query_config:
  results_cache_config:
    cache:
      enable_fifocache: true
      default_validity: 1m
```

1. Create flow deployment pipeline:

```yaml
# .github/workflows/deploy-flows.yml
name: Deploy Flows

on:
  push:
    branches: [main]
    paths:
      - 'flows/definitions/**'
  workflow_dispatch:
    inputs:
      flowId:
        description: 'Specific flow ID to deploy'
        required: false

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate flow definitions
        run: |
          pnpm install
          pnpm run validate:flows
      
      - name: Run Promptfoo tests
        run: |
          cd flows/tests/promptfoo
          promptfoo eval --config config.yaml
      
      - name: Run Ragas tests
        run: |
          cd flows/tests/ragas
          python -m pytest test_*.py
  
  deploy:
    needs: validate
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Load flow definitions
        run: |
          # Load flows from flows/definitions/
          # Register with Langflow via API
          python scripts/deploy-flows.py
      
      - name: Verify deployments
        run: |
          # Test each deployed flow
          python scripts/test-deployed-flows.py
      
      - name: Update Sentratorium
        run: |
          # Log deployment to AiSession table
          curl -X POST $SENTRATORIUM_API \
            -H "Content-Type: application/json" \
            -d '{
              "event": "flow_deployment",
              "flows": '$DEPLOYED_FLOWS',
              "timestamp": "'$(date -Iseconds)'"
            }'
```

1. Implement monitoring and alerting:

```typescript
// infrastructure/monitoring/prometheus-alerts.yaml
groups:
  - name: flow-alerts
    interval: 30s
    rules:
      - alert: FlowHighLatency
        expr: histogram_quantile(0.99, flow_latency_ms) > 3000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Flow {{ $labels.flow_id }} has high latency"

      - alert: FlowErrorRate
        expr: rate(flow_errors_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Flow {{ $labels.flow_id }} error rate exceeds 5%"

      - alert: FlowCostOverage
        expr: flow_daily_cost_usd > flow_daily_budget_usd
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Flow {{ $labels.flow_id }} exceeds daily budget"
```

#### Success Criteria

- All flow executions logged with latency, tokens, errors
- Logs searchable by flowId, organizationId, timestamp
- Monitoring shows real-time metrics (latency, errors, cost)
- Alerts trigger for SLA violations
- Deployment pipeline validates flows before production
- Zero-downtime deployments (canary strategy)

#### Deliverables

- Centralized logging infrastructure
- Prometheus/Grafana monitoring setup
- Deployment pipeline (GitHub Actions)
- Alert rules and notifications
- Monitoring dashboards

---

## Phase 4 Implementation Timeline

| Sub-Task | Focus | Duration | Dependencies |
| --- | --- | --- | --- |
| **4.1** | Flow Definitions Repository | 3-4 days | Phase 3 complete |
| **4.2** | Custom Components | 4-5 days | 4.1 complete |
| **4.3** | Orchestrator Gateway | 5-6 days | 3.3 (database) |
| **4.4** | Shadow Mode Framework | 3-4 days | 4.3 complete |
| **4.5** | Flow Testing (Promptfoo/Ragas) | 4-5 days | 4.2 complete |
| **4.6** | Sentratorium Dashboard | 4-5 days | Phase 2 (database) |
| **4.7** | Deployment & Monitoring | 3-4 days | 4.1, 4.3 complete |

**Total Estimated Timeline: 5-6 weeks**

---

## Success Metrics for Phase 4

### Technical Metrics

- All flows deployed via version control (no manual API calls)
- Flow execution latency <2 seconds (excluding LLM)
- Custom components achieve >80% test pass rate
- Shadow mode matches primary flow at >95% accuracy
- Cost tracking accuracy ±2%

### Quality Metrics

- Promptfoo test pass rate >80% for all flows
- Ragas RAG evaluation scores >0.80 (context precision, recall, answer relevancy)
- Regression detection catches 95% of quality issues
- Zero regressions deployed to production

### Operational Metrics

- 99.9% uptime SLA for orchestrator gateway
- All flow executions logged to Sentratorium
- Real-time monitoring dashboard <1 second load time
- Alerts trigger within 2 minutes of SLA violation

### Compliance Metrics

- HIPAA audit trail captures 100% of healthcare flow executions
- No PHI in flow logs or error messages
- Historical data retention: 7 years (healthcare requirement)

---

## Deliverables Summary

1. **Version-Controlled Flows** — 15-20 production flows in `flows/definitions/`
2. **Custom Components** — 8-12 domain-specific Python/JS components
3. **Orchestrator Gateway** — NestJS API with `/run/{flowId}` endpoint
4. **Shadow Mode Framework** — A/B testing with comparison metrics
5. **Automated Testing** — Promptfoo + Ragas integration in CI/CD
6. **Monitoring Dashboard** — Real-time metrics and cost tracking
7. **Deployment Pipeline** — Automated validation and promotion workflow

---

## Next Phase Preview

**Phase 5: Project Scaffolding** will focus on:

- Healthcare App (Referralink API): FHIR-compliant clinical workflows
- Academic App (Clinical Simulator): Simulation engine with Langflow integration
- Internal App (Sentratorium Web): Next.js monitoring dashboard
- Incubator App: Experimental AI prototyping environment

Phase 5 depends entirely on Phase 4 completion — the orchestrator gateway is the foundation for all downstream applications.

---

## Key References

- **Langflow Documentation**: https://docs.langflow.org
- **Promptfoo**: https://docs.promptfoo.dev
- **Ragas**: https://docs.ragas.io
- **FHIR R4 Specification**: https://www.hl7.org/fhir/R4
- **NestJS Documentation**: https://docs.nestjs.com