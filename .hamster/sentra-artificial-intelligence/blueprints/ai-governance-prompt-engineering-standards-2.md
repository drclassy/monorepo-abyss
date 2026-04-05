---
id: "dbd9801e-4759-4379-8beb-d346aaf81baa"
entity_type: "blueprint"
entity_id: "dbd9801e-4759-4379-8beb-d346aaf81baa"
title: "AI Governance & Prompt Engineering Standards"
status: ""
priority: ""
updated_at: "2026-03-31T09:31:26.048511+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Strategic Overview

The Abyss healthcare platform leverages large language models (LLMs) and AI orchestration through Langflow to deliver clinical decision support, patient data summarization, and research assistance. This document establishes governance standards that ensure **safety, compliance, quality, and cost-efficiency** across all AI-driven features.

**Core Principle:** All AI decisions in clinical contexts must be auditable, reversible, and subject to human oversight via the GO-Gate approval workflow.

---

## 1. Prompt Engineering Standards

### 1.1 Prompt Template Format & Versioning

All prompts must be stored as versioned YAML files with semantic versioning (Major.Minor.Patch):

```yaml
# flows/prompts/clinical-summarizer/v1.2.0.yaml
apiVersion: prompts.abyss.io/v1
kind: Prompt
metadata:
  name: clinical-summarizer
  version: "1.2.0"
  prompt_id: "sha256:a3f5b9c2e8d1f4a7b9c2e8d1f4a7b9c2"
  created_at: "2024-01-15T10:00:00Z"
  created_by: "engineering@abyss.io"
  domain: "healthcare"
  sensitivity: "PHI"  # Options: public, internal, PHI

spec:
  model:
    provider: "azure-openai"  # Options: azure-openai, self-hosted, anthropic
    name: "gpt-4-turbo"
    temperature: 0.3
    max_tokens: 2000
    top_p: 0.95
  
  description: |
    Summarizes patient medical records from FHIR data into a clinician-friendly format.
    - Extracts diagnoses, medications, lab results
    - Uses FHIR R4 standard terminology
    - Redacts PHI in output unless explicitly allowed
  
  variables:
    - name: patient_id
      type: string
      required: true
      description: "FHIR Patient resource ID"
      validation: "^[a-zA-Z0-9-]{1,64}$"
    
    - name: date_range
      type: string
      required: false
      default: "last_30_days"
      description: "Time period for medical history"
      options: ["last_7_days", "last_30_days", "last_90_days", "all"]
    
    - name: summary_type
      type: string
      required: true
      default: "concise"
      description: "Level of detail in summary"
      options: ["brief", "concise", "comprehensive"]
  
  system_prompt: |
    You are a clinical documentation assistant. Your role is to transform raw FHIR data 
    into clear, structured clinical summaries for physician review.
    
    Guidelines:
    - Use medical terminology accurately
    - Organize findings by system (cardiovascular, respiratory, etc.)
    - Flag critical values or concerning trends
    - Cite data sources (e.g., Lab 2024-01-10)
    - Never invent data not present in the source records
    - Format output as structured markdown
  
  user_prompt_template: |
    Summarize the patient record for {{patient_id}} over the {{date_range}} period.
    
    Provide a {{summary_type}} summary covering:
    - Active diagnoses (with ICD-10 codes)
    - Current medications (with dosages)
    - Recent lab results (with reference ranges)
    - Recent imaging/procedures
    
    Source data (FHIR):
    {{fhir_data}}
    
    Output format:
    ## Clinical Summary
    ### Diagnoses
    ### Medications
    ### Lab Results
    ### Recent Events
  
  output_schema:
    type: object
    properties:
      summary:
        type: string
        description: "Clinical summary text"
      confidence_score:
        type: number
        minimum: 0
        maximum: 1
        description: "Model confidence in accuracy"
      critical_flags:
        type: array
        items:
          type: string
        description: "Any critical findings requiring immediate attention"
      sources_cited:
        type: array
        items:
          type: string
        description: "FHIR references used in summary"
  
  tests:
    - name: "standard_patient_summary"
      input:
        patient_id: "test-patient-001"
        date_range: "last_30_days"
        summary_type: "concise"
      expected_output:
        - contains: ["Diagnosis:", "Medications:", "Lab Results:"]
        - contains_no: ["PHI", "SSN", "MRN"]
        - output_matches_schema: true
    
    - name: "handles_missing_data"
      input:
        patient_id: "test-patient-minimal"
        date_range: "last_7_days"
        summary_type: "brief"
      expected_output:
        - contains: ["No recent data available", "Last recorded:"]
        - does_not_error: true
  
  deployment:
    environments:
      dev:
        auto_sync: true
        eval_threshold: 0.70
        approval_required: false
        max_daily_cost: 50  # USD
      
      staging:
        auto_sync: true
        eval_threshold: 0.85
        approval_required: false
        max_daily_cost: 200
      
      production:
        auto_sync: false
        eval_threshold: 0.90
        approval_required: true
        approvers: ["chief-engineer@abyss.io", "medical-advisor@abyss.io"]
        max_daily_cost: 1000
  
  changelog:
    - version: "1.2.0"
      date: "2024-01-15"
      changes:
        - "Added critical_flags output field"
        - "Improved handling of missing lab results"
        - "Reduced hallucination rate from 3.2% to 1.1%"
      ragas_score: 0.91
    
    - version: "1.1.0"
      date: "2024-01-08"
      changes:
        - "Initial production release"
      ragas_score: 0.87
```

### 1.2 Handlebars/Mustache Templating Rules

Prompts use **Handlebars.js** for variable interpolation with strict naming conventions:

```javascript
// packages/prompt-engine/src/template-compiler.ts
import Handlebars from 'handlebars';

export class PromptTemplateCompiler {
  private template: HandlebarsTemplateDelegate;
  
  constructor(promptYaml: PromptDefinition) {
    // Register custom Handlebars helpers for healthcare
    Handlebars.registerHelper('formatDate', (date: string) => {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    });
    
    Handlebars.registerHelper('abbreviateICD10', (code: string) => {
      // E.g., "I10" for hypertension
      return code.substring(0, 3);
    });
    
    Handlebars.registerHelper('redactPHI', (text: string) => {
      // Redact SSN, MRN, phone
      return text
        .replace(/\d{3}-\d{2}-\d{4}/g, '[SSN]')
        .replace(/\d{6,8}/g, '[MRN]')
        .replace(/\(\d{3}\)\s?\d{3}-\d{4}/g, '[PHONE]');
    });
    
    this.template = Handlebars.compile(promptYaml.spec.user_prompt_template);
  }
  
  compile(variables: Record<string, unknown>): string {
    // Validate variables match schema
    this.validateVariables(variables);
    
    // Render template
    const rendered = this.template(variables);
    
    // Final validation: no unrendered variables
    if (rendered.includes('{{')) {
      throw new Error('Unresolved template variables detected');
    }
    
    return rendered;
  }
  
  private validateVariables(variables: Record<string, unknown>) {
    const required = this.template.required || [];
    for (const varName of required) {
      if (!variables[varName]) {
        throw new Error(`Missing required variable: ${varName}`);
      }
    }
  }
}
```

**Templating Rules:**

- Variable names: `{{snake_case_only}}`
- Helpers: `{{#if condition}}...{{/if}}`
- Filters: `{{value | sanitize}}` (custom health filters only)
- No nested templates (depth limit: 2 levels max)
- All variables must be explicitly declared in prompt YAML

### 1.3 Prompt Documentation Requirements

Every production prompt requires:

1. **Purpose Statement** — What clinical problem does it solve?
2. **Input/Output Examples** — Real-world examples (anonymized)
3. **Limitations** — When it should NOT be used
4. **Model Rationale** — Why GPT-4 vs Claude vs local model
5. **Cost Estimate** — Typical token usage and cost per invocation
6. **Clinical Context** — Domain-specific guidance (e.g., FHIR standard)

```markdown
# Clinical Summarizer Prompt (v1.2.0)

## Purpose
Transforms unstructured EHR data into structured clinical summaries for physician review.
Used in the Healthcare API's `/patients/{id}/summary` endpoint.

## Clinical Applicability
- **Appropriate for:** Discharge summaries, patient handoffs, clinical note review
- **NOT appropriate for:** Diagnosis recommendations, medication adjustments, treatment decisions
- **Risk level:** Medium (summarization, not decision-making)

## Input Example
```json
{
  "patient_id": "patient-123",
  "fhir_data": {
    "Condition": [
      {"code": "I10", "display": "Essential hypertension"}
    ],
    "MedicationRequest": [
      {"medicationCodeableConcept": "lisinopril 10mg daily"}
    ],
    "Observation": [
      {"code": "8480-6", "value": "140", "unit": "mmHg"}
    ]
  }
}
```

## Output Example

```
## Clinical Summary
### Diagnoses
- Essential hypertension (I10)

### Medications
- Lisinopril 10mg daily

### Lab Results
- Blood pressure: 140/90 mmHg (2024-01-10)
```

## Model Selection Rationale

- **Model:** GPT-4-Turbo
- **Reasoning:** Requires high accuracy for medical terminology, structured output generation
- **Cost:** ~200 tokens per patient ≈ $0.008 per call
- **Alternative:** Claude-3-Sonnet (lower cost, 5% lower accuracy)

## Limitations

1. Requires well-structured FHIR input (garbage in → garbage out)
2. May hallucinate if critical fields missing
3. Limited context window (cannot process >20 years history in one call)
4. Temperature 0.3 reduces creativity but may miss context-specific nuances

## Security & Compliance

- Input: May contain PHI → encrypt in transit (TLS 1.3)
- Output: Contains clinical summary → audit log all access
- Provider: Azure OpenAI with BAA → compliant with HIPAA

```
---

## 2. AI Quality & Evaluation Framework

### 2.1 Automated Evaluation Pipeline (RAGAS + G-Eval)

Every prompt change triggers automatic evaluation before deployment:

```yaml
# .github/workflows/eval-suite.yml
name: AI Quality Gate

on:
  pull_request:
    paths:
      - 'flows/prompts/**/*.yaml'

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install eval framework
        run: |
          pip install ragas deepeval langfuse python-dotenv
      
      - name: Run RAGAS evaluation
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          python scripts/eval/ragas_suite.py \
            --prompt-file=${{ github.event.pull_request.head.ref }} \
            --output=ragas-results.json
      
      - name: Run G-Eval (clinical criteria)
        run: |
          python scripts/eval/deepeval_medical.py \
            --prompt-file=${{ github.event.pull_request.head.ref }} \
            --output=geeval-results.json
      
      - name: Aggregate scores
        run: |
          python scripts/eval/aggregate_scores.py \
            --ragas=ragas-results.json \
            --geeval=geeval-results.json \
            --output=final-score.json
      
      - name: Block merge if score < threshold
        run: |
          SCORE=$(jq .overall_score final-score.json)
          if (( $(echo "$SCORE < 0.85" | bc -l) )); then
            echo "❌ Evaluation score ($SCORE) below threshold (0.85)"
            exit 1
          fi
      
      - name: Post results as PR comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('final-score.json', 'utf8'));
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 AI Quality Evaluation Results\n\n${JSON.stringify(results, null, 2)}`
            });
```

### 2.2 Clinical Accuracy Benchmarks

```python
# packages/eval-framework/healthcare_metrics.py
from ragas.metrics import Metric, MetricWithLLM
from dataclasses import dataclass
from typing import Optional

@dataclass
class HealthcareMetrics:
    """Clinical-specific evaluation metrics"""
    
    faithfulness: float  # Does output match FHIR data?
    context_precision: float  # Is retrieved clinical data relevant?
    context_recall: float  # Comprehensive retrieval of medical history?
    answer_relevance: float  # Does output answer the clinical question?
    medical_hallucination_rate: float  # % of unsupported medical claims
    fhir_compliance_score: float  # Valid FHIR R4 output?
    clinical_safety_score: float  # No harmful recommendations?

class MedicalFaithfulness(MetricWithLLM):
    """Verify AI output matches clinical source data"""
    
    def _score(self, row):
        prompt = f"""
        Clinical data (source of truth):
        {row.context}
        
        AI-generated summary:
        {row.response}
        
        Questions:
        1. Extract all medical claims from the summary
        2. Verify each claim against the source clinical data
        3. Rate faithfulness 0-1 (1 = all claims grounded in data)
        4. Flag any hallucinations or unsupported claims
        """
        
        result = self.llm.generate(prompt)
        return float(result['faithfulness_score'])

class FHIRCompliance(Metric):
    """Validate output matches FHIR R4 standard"""
    
    def _score(self, row):
        import json
        try:
            parsed = json.loads(row.response)
            # Validate against US Core profiles
            required_fields = ['resourceType', 'id', 'meta']
            if not all(field in parsed for field in required_fields):
                return 0.0
            
            # Check FHIR types
            valid_types = ['Patient', 'Condition', 'Observation', 'Medication']
            if parsed.get('resourceType') not in valid_types:
                return 0.0
            
            return 1.0
        except:
            return 0.0

class ClinicalSafetyScore(MetricWithLLM):
    """Detect harmful or unsafe medical recommendations"""
    
    def _score(self, row):
        unsafe_terms = [
            'increase dose', 'stop medication', 'switch treatment',
            'diagnose', 'prescribe', 'recommend surgery'
        ]
        
        lower_response = row.response.lower()
        harmful_count = sum(1 for term in unsafe_terms if term in lower_response)
        
        # Flag for review if recommendations present
        if harmful_count > 0:
            print(f"⚠️  WARNING: AI made {harmful_count} treatment recommendations. HITL review required.")
            return 0.0  # Force human review
        
        return 1.0

# Benchmark targets for healthcare workflows
HEALTHCARE_BENCHMARKS = {
    'clinical-summarizer': {
        'faithfulness': 0.90,
        'context_precision': 0.85,
        'context_recall': 0.80,
        'medical_hallucination_rate': 0.01,  # Max 1% hallucination
        'fhir_compliance_score': 1.0,
        'clinical_safety_score': 1.0,
    },
    'diagnosis-assistant': {
        'faithfulness': 0.95,
        'medical_hallucination_rate': 0.001,  # Max 0.1%
        'clinical_safety_score': 1.0,  # Absolute requirement
    },
    'medication-interaction-checker': {
        'faithfulness': 0.98,
        'clinical_safety_score': 1.0,
    }
}
```

### 2.3 Shadow Mode Protocol

New prompts must operate in **shadow mode** (non-blocking) for 100+ real interactions before production deployment:

```typescript
// apps/healthcare/referralink-api/src/middleware/shadow-mode.ts
export class ShadowModeMiddleware {
  async processRequest(req: Request, prompt: PromptDefinition) {
    // If prompt is in shadow mode, run both old and new versions
    if (prompt.status === 'shadow') {
      const legacyResult = await this.runLegacyPrompt(req);
      const newResult = await this.runNewPrompt(req, prompt);
      
      // Compare results
      const comparison = {
        legacy: legacyResult,
        new: newResult,
        divergence_score: this.calculateDivergence(legacyResult, newResult),
        timestamp: new Date(),
      };
      
      // Log for analysis (HIPAA compliance: audit trail)
      await this.auditLog.record({
        event: 'SHADOW_MODE_COMPARISON',
        prompt_version: prompt.metadata.version,
        comparison,
        user_id: req.user.id,
      });
      
      // Return legacy result to user (safety-first)
      return legacyResult;
    }
    
    // Production mode: use only new prompt
    return await this.runNewPrompt(req, prompt);
  }
  
  private calculateDivergence(legacy: any, newVersion: any): number {
    // Semantic similarity score (0-1)
    // If divergence > 0.3, escalate for review
    return this.semanticSimilarity(legacy, newVersion);
  }
}
```

---

## 3. Governance & Compliance Framework

### 3.1 HIPAA-Compliant LLM Usage

```typescript
// packages/ai-core/src/providers/hipaa-llm-router.ts
import { OpenAI } from 'openai';
import { createAuditLog } from '@the-abyss/audit-logger';

export class HIPAACompliantLLMRouter {
  private providers = {
    'azure-openai': {
      hasBaa: true,
      supportsPhi: true,
      description: 'Microsoft Azure OpenAI with Business Associate Agreement',
    },
    'self-hosted': {
      hasBaa: true,
      supportsPhi: true,
      description: 'MedAlpaca or ClinicalCamel (self-hosted)',
    },
    'anthropic': {
      hasBaa: false,
      supportsPhi: false,
      description: 'Claude API (no PHI processing)',
    },
    'openai-public': {
      hasBaa: false,
      supportsPhi: false,
      description: 'GPT-4 API (no PHI processing)',
    },
  };
  
  async routeRequest(
    prompt: PromptDefinition,
    containsPHI: boolean,
    user: User
  ): Promise<string> {
    // Rule 1: Never send PHI to non-BAA providers
    if (containsPHI && !this.providers[prompt.spec.model.provider].hasBaa) {
      throw new Error(
        `HIPAA violation: Prompt "${prompt.metadata.name}" requires BAA provider ` +
        `but ${prompt.spec.model.provider} does not have BAA`
      );
    }
    
    // Rule 2: Log all PHI access (audit trail)
    if (containsPHI) {
      await createAuditLog({
        action: 'PHI_PROCESSING_REQUEST',
        prompt_name: prompt.metadata.name,
        provider: prompt.spec.model.provider,
        user_id: user.id,
        timestamp: new Date(),
        request_id: crypto.randomUUID(),
      });
    }
    
    // Rule 3: Encrypt in transit (TLS 1.3+)
    const client = new OpenAI({
      baseURL: this.getProviderEndpoint(prompt.spec.model.provider),
      apiKey: this.getProviderKey(prompt.spec.model.provider),
      defaultHeaders: {
        'X-HIPAA-Compliant': 'true',
        'X-Audit-ID': createAuditLog.getCurrentId(),
      },
    });
    
    return prompt.spec.model.provider;
  }
}

// Usage in application
const router = new HIPAACompliantLLMRouter();
const provider = await router.routeRequest(
  clinicalSummarizerPrompt,
  true, // Contains patient PHI
  currentUser
);
```

### 3.2 PHI De-identification Rules

```typescript
// packages/phi-scrubber/src/deidentifier.ts
import * as nlp from 'compromise';

export class PHIDeidentifier {
  private patterns = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    mrn: /\b[A-Z]{2}\d{6,8}\b/g,
    phone: /\b(\+?1[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    zip: /\b\d{5}(-\d{4})?\b/g,
    medicalRecordNumber: /\bMRN[:=\s]*([A-Z0-9]+)\b/gi,
    dateOfBirth: /\b(DOB|DATE OF BIRTH)[:=\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/gi,
  };
  
  private nlpRules = {
    // Use NLP to find person names
    personNames: (text: string) => {
      const doc = nlp(text);
      return doc.people().out('array');
    },
    
    // Find medication names not in approved list
    medicationNames: (text: string) => {
      // Only redact if NOT in clinical context (i.e., not in standard FHIR terminology)
      return [];
    },
  };
  
  deidentify(text: string, rules: 'strict' | 'balanced' | 'permissive' = 'balanced'): string {
    let result = text;
    
    // Rule 1: Structured patterns (always redact)
    for (const [pattern, regex] of Object.entries(this.patterns)) {
      result = result.replace(regex, `[${pattern.toUpperCase()}]`);
    }
    
    // Rule 2: NLP-based patterns (depends on sensitivity level)
    if (rules === 'strict') {
      const names = this.nlpRules.personNames(result);
      names.forEach(name => {
        result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), '[NAME]');
      });
    }
    
    // Rule 3: Validate output (ensure 99.95% privacy)
    const privacyScore = this.assessPrivacy(result);
    if (privacyScore < 0.9995) {
      console.warn(`⚠️  Privacy score ${privacyScore} below threshold. Applying stricter rules.`);
      result = this.deidentify(result, 'strict');
    }
    
    return result;
  }
  
  private assessPrivacy(text: string): number {
    // BERT-based privacy assessment
    const privacyModel = require('@the-abyss/privacy-scorer');
    return privacyModel.score(text);
  }
}
```

### 3.3 Audit Logging for AI Decisions

Every AI invocation must be logged with full traceability:

```typescript
// packages/audit-logger/src/ai-decision-logger.ts
export class AIDecisionAuditLog {
  async logAIDecision(event: {
    action: 'AI_PROMPT_EXECUTED' | 'AI_DECISION_MADE' | 'HITL_REVIEW_STARTED';
    prompt_name: string;
    prompt_version: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
    model: string;
    cost_usd: number;
    latency_ms: number;
    confidence_score?: number;
    user_id: string;
    patient_id?: string;  // If PHI involved
    contains_phi: boolean;
    approved_by?: string;  // For HITL decisions
    timestamp: Date;
  }) {
    // Rule 1: Never log PHI in output (redact before storage)
    if (event.contains_phi) {
      event.output = this.deidentify(event.output);
    }
    
    // Rule 2: Immutable audit trail (append-only log)
    await this.auditDB.append({
      ...event,
      audit_id: crypto.randomUUID(),
      signature: await this.signEntry(event), // Cryptographic signature
    });
    
    // Rule 3: Trigger retention policies
    if (event.action === 'HITL_REVIEW_STARTED') {
      // Retain for 7 years per HIPAA
      await this.setRetentionPolicy(event.prompt_name, 7);
    }
    
    // Rule 4: Alert on high-risk decisions
    if (event.confidence_score && event.confidence_score < 0.7) {
      await this.alertChiefEngineer({
        message: `Low confidence AI decision: ${event.prompt_name} (${event.confidence_score})`,
        decision_id: event.audit_id,
        requires_review: true,
      });
    }
  }
  
  async exportAuditReport(startDate: Date, endDate: Date) {
    // For compliance audits (HIPAA, FDA)
    return await this.auditDB.query({
      timestamp: { $gte: startDate, $lte: endDate },
    });
  }
}
```

---

## 4. Operational Guidelines

### 4.1 Model Selection Decision Matrix

```typescript
// packages/ai-core/src/model-selector.ts
export class ModelSelector {
  private decisionMatrix = {
    'clinical-summary': {
      'high-accuracy-required': 'gpt-4-turbo',
      'cost-sensitive': 'gpt-3.5-turbo',
      'phi-processing': 'self-hosted-medalpaca',
      'local-only': 'mistral-7b',
    },
    'coding-assistance': {
      'default': 'gpt-4o',
      'cost-optimized': 'claude-3-haiku',
    },
    'patient-communication': {
      'default': 'gpt-4-turbo',
      'reasoning': 'o1-preview',
    },
  };
  
  selectModel(
    workflowType: string,
    constraints: {
      maxCostPerCall?: number;
      requiresPHI?: boolean;
      latencyBudgetMs?: number;
      accuracyThreshold?: number;
    }
  ): string {
    const options = this.decisionMatrix[workflowType];
    
    // Filter by constraints
    if (constraints.requiresPHI) {
      return 'self-hosted-medalpaca'; // Only option with BAA
    }
    
    if (constraints.maxCostPerCall && constraints.maxCostPerCall < 0.01) {
      return 'gpt-3.5-turbo';
    }
    
    if (constraints.latencyBudgetMs && constraints.latencyBudgetMs < 1000) {
      return 'claude-3-haiku'; // Fastest response
    }
    
    return options['default'] || 'gpt-4-turbo';
  }
}
```

### 4.2 Cost Tracking & Rate Limiting

```typescript
// packages/ai-core/src/cost-manager.ts
export class AIResourceManager {
  private budgets = {
    perUser: {
      daily: 10, // USD
      monthly: 100,
    },
    perFeature: {
      'clinical-assistant': { daily: 500, monthly: 10000 },
      'coding-helper': { daily: 100, monthly: 2000 },
      'research-summarizer': { daily: 200, monthly: 5000 },
    },
    perModel: {
      'gpt-4-turbo': { daily: 5000, monthly: 50000 },
      'gpt-3.5-turbo': { daily: 2000, monthly: 20000 },
    },
  };
  
  async checkBudgetAndExecute(
    request: AIRequest,
    executeFunc: () => Promise<AIResponse>
  ): Promise<AIResponse> {
    const estimatedCost = this.estimateCost(request);
    
    // Check user budget
    const userSpend = await this.getUserDailySpend(request.userId);
    if (userSpend + estimatedCost > this.budgets.perUser.daily) {
      throw new Error('Daily user budget exceeded. Contact admin for increase.');
    }
    
    // Check feature budget
    const featureSpend = await this.getFeatureDailySpend(request.feature);
    if (featureSpend + estimatedCost > this.budgets.perFeature[request.feature].daily) {
      // Degrade to cheaper model
      request.fallbackModel = 'gpt-3.5-turbo';
      console.warn(`Feature budget nearly exhausted. Degrading to ${request.fallbackModel}`);
    }
    
    // Execute with cost tracking
    const startTime = Date.now();
    const response = await executeFunc();
    const actualCost = this.calculateActualCost(response);
    
    // Log cost for analytics
    await this.costLog.record({
      userId: request.userId,
      feature: request.feature,
      model: request.model,
      tokens: response.usage,
      cost: actualCost,
      latency: Date.now() - startTime,
    });
    
    return response;
  }
  
  private estimateCost(request: AIRequest): number {
    // Rough estimate based on model and request size
    const costPerToken = this.getCostPerToken(request.model);
    const estimatedTokens = Math.ceil(request.input.length / 4); // Rough heuristic
    return estimatedTokens * costPerToken;
  }
  
  private getCostPerToken(model: string): number {
    const costs = {
      'gpt-4-turbo': 0.00003, // $0.03 / 1K input tokens
      'gpt-3.5-turbo': 0.0000005, // $0.0005 / 1K
      'claude-3-haiku': 0.00025,
      'self-hosted-medalpaca': 0, // Amortized cost
    };
    return costs[model] || 0.00001;
  }
}
```

### 4.3 Rate Limiting & Circuit Breaker

```typescript
// packages/ai-core/src/rate-limiter.ts
export class AIRateLimiter {
  async executeWithRateLimit(
    key: string, // user_id or feature_name
    executeFunc: () => Promise<unknown>,
    config: {
      requestsPerMinute: number;
      tokensPerHour: number;
      concurrentRequests: number;
    }
  ) {
    // Token bucket algorithm
    const bucket = await this.getBucket(key);
    
    if (bucket.tokens < 1) {
      throw new Error(`Rate limit exceeded for ${key}. Retry after ${bucket.refillTime}ms`);
    }
    
    bucket.tokens--;
    
    try {
      const result = await executeFunc();
      return result;
    } catch (error) {
      if (error.code === 'rate_limit_exceeded') {
        // Circuit breaker: switch to fallback
        console.warn(`LLM provider rate limited. Activating circuit breaker.`);
        await this.circuitBreaker.open(config.fallbackModel);
      }
      throw error;
    }
  }
}
```

---

## 5. Integration with The Abyss Ecosystem

### 5.1 GO-Gate Integration for AI Decisions

High-risk AI decisions must be approved via Phase 2 GO-Gate:

```typescript
// Integration between AI Core and GO-Gate (Phase 2)
export class AIGOGateIntegration {
  async requireApprovalForAIDecision(
    decision: AIDecision,
    riskLevel: 'low' | 'medium' | 'high'
  ) {
    if (riskLevel === 'low') {
      // Auto-approve
      return { approved: true, approvedBy: 'AI_SYSTEM' };
    }
    
    if (riskLevel === 'medium' || riskLevel === 'high') {
      // Create HANDOFF.md task
      const task = await execSync(`abyss init-task \
        --name "AI Decision Review: ${decision.name}" \
        --phase governance \
        --severity ${riskLevel}`);
      
      // Block execution until Chief Engineer approves
      const approval = await this.waitForGOGateApproval(task.id);
      
      if (!approval.approved) {
        throw new Error(`AI decision rejected by Chief Engineer: ${approval.reason}`);
      }
      
      return approval;
    }
  }
}
```

### 5.2 Langflow Orchestration Integration (Phase 4)

AI governance standards apply to all Langflow flows:

```yaml
# flows/clinical-assistant/flow.json
{
  "name": "Clinical Assistant",
  "version": "1.0.0",
  "governance": {
    "prompt_version": "clinical-summarizer:v1.2.0",
    "evaluation_required": true,
    "shadow_mode": false,
    "approval_required": false,
    "audit_log_all_interactions": true
  },
  "nodes": [
    {
      "id": "retrieve-fhir-data",
      "type": "fhir-client",
      "config": {
        "endpoint": "{{FHIR_SERVER_URL}}"
      }
    },
    {
      "id": "check-phi-present",
      "type": "condition",
      "condition": "input.contains_phi === true"
    },
    {
      "id": "dedentify-if-needed",
      "type": "python",
      "script": "from packages.phi_scrubber import PHIDeidentifier"
    },
    {
      "id": "invoke-prompt",
      "type": "llm",
      "prompt_ref": "clinical-summarizer:v1.2.0",
      "model_selection_strategy": "cost-optimized",
      "max_cost_per_call": 0.05
    },
    {
      "id": "evaluate-output",
      "type": "condition",
      "condition": "output.confidence_score > 0.85"
    },
    {
      "id": "hitl-review-if-low-confidence",
      "type": "human_approval",
      "condition": "output.confidence_score < 0.85",
      "assignees": ["chief-engineer@abyss.io"]
    }
  ]
}
```

### 5.3 CLI Integration (`abyss` Commands)

```bash
# Phase 6: Abyss CLI integration with AI governance

# View all prompts with status
abyss prompt list --show-status

# Deploy new prompt to staging with evaluation
abyss prompt deploy clinical-summarizer:v1.2.0 --env staging --run-eval

# Check cost of prompt
abyss cost estimate --prompt clinical-summarizer:v1.2.0 --num-requests 1000

# View audit log for specific prompt
abyss audit list --prompt clinical-summarizer --date-range last-30-days

# Run manual evaluation on existing prompt
abyss eval run --prompt clinical-summarizer:v1.1.0 --test-cases 100

# Monitor AI spend in real-time
abyss dashboard ai-spend --live
```

---

## 6. Success Metrics & Monitoring

### 6.1 Key Performance Indicators

```yaml
# Success metrics for AI governance in The Abyss

Model Accuracy:
  - Clinical Hallucination Rate: < 1% (target: 0.5%)
  - FHIR Compliance Score: 100% (no invalid output)
  - Medical Faithfulness (RAGAS): > 0.90
  - Clinical Safety Score: 100% (no harmful recommendations)

Operational Metrics:
  - Latency (p95): < 3 seconds for clinical workflows
  - Cost per Token: Track monthly trend (target: reduce 10% QoQ)
  - AI Request Success Rate: > 99.5% (failures < 0.5%)
  - Shadow Mode Divergence: < 10% (before production promotion)

Governance Metrics:
  - % of AI Decisions Audited: 100% (all logged)
  - % of High-Risk Decisions with HITL Review: 100%
  - Prompt Versioning Compliance: 100% (all in Git)
  - GO-Gate Approval Rate: 95%+ (automated approvals OK for low-risk)

Safety & Compliance:
  - HIPAA Audit Log Completeness: 100%
  - PHI Incident Rate: 0 (zero tolerance)
  - De-identification Accuracy: > 99.95%
  - Regulatory Change Response Time: < 48 hours

Cost Metrics:
  - AI API Spend (monthly): Track per feature
  - Cost per Patient Summary: < $0.01
  - Model Downgrade Rate: < 5% (only when necessary)
  - Budget Utilization Efficiency: 80-90% (not over/under-allocated)
```

### 6.2 Monitoring Dashboard (Grafana)

```json
{
  "dashboard": {
    "title": "AI Governance & Quality Metrics",
    "panels": [
      {
        "title": "Model Accuracy (RAGAS Score Trend)",
        "targets": [
          {
            "expr": "avg(ragas_score{prompt_name=~\".*\"}) by (prompt_name)"
          }
        ],
        "alert": {
          "condition": "value < 0.85",
          "message": "Prompt accuracy degraded"
        }
      },
      {
        "title": "AI API Cost (7-Day Rolling)",
        "targets": [
          {
            "expr": "sum(rate(ai_cost_usd_total[7d])) by (model)"
          }
        ]
      },
      {
        "title": "Hallucination Rate (%)",
        "targets": [
          {
            "expr": "rate(ai_hallucination_detected_total[1h]) / rate(ai_total_requests[1h]) * 100"
          }
        ],
        "alert": {
          "condition": "value > 1",
          "severity": "critical"
        }
      },
      {
        "title": "HITL Review Backlog",
        "targets": [
          {
            "expr": "count(hitl_review_pending)"
          }
        ]
      },
      {
        "title": "Audit Log Latency (ms)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, audit_log_write_duration_ms)"
          }
        ]
      }
    ]
  }
}
```

### 6.3 Compliance Reporting

Automated monthly compliance report for regulatory bodies:

```python
# scripts/compliance/monthly_report.py
def generate_hipaa_compliance_report(month: str, year: int):
    report = {
        "period": f"{month} {year}",
        "audit_logs_generated": count_audit_logs(month, year),
        "phi_breaches": 0,  # Must be zero
        "ai_decisions_logged": count_ai_decisions_logged(month, year),
        "hitl_review_completion_rate": calculate_review_rate(month, year),
        "prompts_evaluated": count_evaluated_prompts(month, year),
        "failed_evaluations": count_failed_evals(month, year),
        "incidents": fetch_security_incidents(month, year),
    }
    
    # Generate PDF report
    generate_pdf_report(report)
    
    # Send to compliance officer
    send_email("compliance@abyss.io", report)
```

---

## 7. Rollout Roadmap

**Week 1-2:** Establish prompt versioning and templating standards
**Week 3-4:** Deploy RAGAS + G-Eval evaluation pipeline in CI/CD
**Week 5-6:** Implement HIPAA-compliant LLM routing and audit logging
**Week 7-8:** Launch shadow mode for new prompts
**Week 9-10:** Integrate GO-Gate approval workflow
**Week 11-12:** Establish monitoring dashboards and compliance reporting

---

## 8. Escalation & Support

- **Prompt Governance Questions:** governance@abyss.io
- **HIPAA Compliance Issues:** compliance@abyss.io
- **AI Performance Issues:** ai-team@abyss.io
- **Emergency (PHI Breach):** security@abyss.io + immediate escalation to CTO