---
id: "d7e44198-ed8c-472d-a600-d78fb79146bf"
entity_type: "blueprint"
entity_id: "d7e44198-ed8c-472d-a600-d78fb79146bf"
title: "Phase 3: Reusable Substrate (Shared Libraries)"
status: ""
priority: ""
updated_at: "2026-03-31T06:15:32.490095+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Project Description

**Phase 3: Reusable Substrate** builds the foundational "muscles" of The Abyss monorepo — a comprehensive ecosystem of highly reusable, type-safe libraries that power all applications across healthcare, academic, and incubator domains. These packages enforce consistency, eliminate duplication, and dramatically accelerate development velocity across teams.

This phase transforms the monorepo skeleton (Phase 1) and governance framework (Phase 2) into a production-grade library ecosystem. Every package is designed for multi-tenant deployments, HIPAA compliance, and seamless integration across domains.

**Why Phase 3 Matters:**

- **Developer Velocity:** Teams no longer rebuild common patterns — they import battle-tested libraries
- **Consistency:** Single source of truth for UI components, database schemas, AI orchestration
- **Compliance:** Built-in HIPAA audit trails, FHIR validation, and security scanning
- **Scalability:** Shared infrastructure scales with minimal per-application configuration
- **Ecosystem:** Creates internal "npm registry" of Sentra IP

**Target State After Phase 3:**
All applications (`apps/*`) and flows (`flows/*`) consume 8 production-ready packages with complete documentation, test coverage, and Storybook examples. New feature development starts by importing libraries, not writing infrastructure code.

---

## Primary Objectives

### 1. Configuration Foundation (Packages 3.1–3.2)

Establish monorepo-wide TypeScript and ESLint standards with domain-specific overrides (e.g., healthcare requires stricter linting rules).

### 2. Type Safety & Contracts (Package 3.3)

Define global TypeScript interfaces for User, Organization, AiSession, FHIR resources, and Langflow definitions. Enable end-to-end type safety from database to UI.

### 3. Data Persistence Layer (Package 3.4)

Implement Prisma schema with multi-tenancy, immutable audit trails, AI session logging, and pgvector for semantic search. Foundation for all data operations.

### 4. User Interface System (Package 3.5)

Build 40+ React components (Button, Card, Table, Modal) with Tailwind CSS 4, dark mode, accessibility (WCAG 2.1 AA), and Storybook documentation.

### 5. AI Orchestration Engine (Package 3.6)

Implement multi-model consensus engine supporting OpenAI (GPT-4), Anthropic (Claude 3.5 Sonnet), and Ollama. Include retry logic, token counting, and HIPAA-aware prompts.

### 6. Vector Database Abstraction (Package 3.7)

Unified interface for Pinecone, Weaviate, Chroma, and PostgreSQL pgvector. Enable semantic search with hybrid search (vector + keyword) and RAGOps best practices.

### 7. Langflow Integration SDK (Package 3.8)

TypeScript SDK for Langflow API with shadow mode (A/B testing), session management, and Sentratorium logging. Enable safe experimentation with flow variants.

### 8. Healthcare Compliance Engine (Package 3.9)

HL7 FHIR R4 validator with US Core profiles, SNOMED CT/LOINC terminology support, and audit trail logging. All FHIR operations logged to AuditLog table.

---

## Scope & Deliverables

**Phase 3 Duration:** 5–6 weeks (35–42 calendar days)

**Packages to Deliver:**

- `packages/config-typescript` — Centralized TypeScript configs
- `packages/config-eslint` — Unified linting standards
- `packages/shared-types` — Global type contracts
- `packages/database` — Prisma schema + migrations
- `packages/ui` — React component library + Storybook
- `packages/ai-core` — Multi-model LLM orchestration
- `packages/vector-store` — RAGOps abstraction layer
- `packages/langflow-client` — Langflow SDK
- `packages/fhir-engine` — FHIR R4 validation engine

**Key Milestones:**

- Week 1: Configuration packages + shared types
- Week 2: Database schema + UI components (in parallel)
- Week 3: AI core + Vector store
- Week 4: Langflow client + FHIR engine
- Week 5–6: Testing, documentation, and integration

---

## Phase 3 Sub-Tasks Breakdown

### Sub-Task 3.1: Configuration Packages (TypeScript & ESLint)

**Owner:** DevOps Engineer / Build System Lead  
**Duration:** 4 days  
**Status:** Scheduled

#### Objective

Create `packages/config-typescript` and `packages/config-eslint` to enforce consistent code quality standards across the monorepo with domain-specific overrides (healthcare requires stricter rules).

#### Detailed Steps

**Step 1: Initialize ****`packages/config-typescript`**

```bash
mkdir -p packages/config-typescript
cd packages/config-typescript
cat > package.json << 'EOF'
{
  "name": "@the-abyss/config-typescript",
  "version": "1.0.0",
  "description": "Shared TypeScript configuration for The Abyss monorepo",
  "main": "index.js",
  "files": ["base.json", "nextjs.json", "react-library.json", "node.json"],
  "keywords": ["typescript", "config", "monorepo"]
}
EOF
```

**Step 2: Create TypeScript configuration variants**

```json
// base.json - Shared settings for all packages
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@the-abyss/*": ["../../packages/*/src"]
    },
    "types": ["node", "jest"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

```json
// nextjs.json - Next.js specific configuration
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

```json
// react-library.json - React component library configuration
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "declaration": true,
    "emitDeclarationOnly": true
  }
}
```

```json
// node.json - Node.js backend configuration
{
  "extends": "./base.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["ES2022"]
  }
}
```

**Step 3: Initialize ****`packages/config-eslint`**

```bash
mkdir -p packages/config-eslint
cd packages/config-eslint
cat > package.json << 'EOF'
{
  "name": "@the-abyss/config-eslint",
  "version": "1.0.0",
  "description": "Shared ESLint configuration for The Abyss monorepo",
  "main": "index.js",
  "files": ["base.js", "react.js", "node.js", "healthcare.js"],
  "peerDependencies": {
    "eslint": "^8.x"
  },
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^6.x",
    "@typescript-eslint/parser": "^6.x",
    "eslint-config-airbnb-typescript": "^17.x",
    "eslint-config-prettier": "^9.x",
    "eslint-plugin-import": "^2.x",
    "eslint-plugin-react": "^7.x",
    "eslint-plugin-react-hooks": "^4.x"
  }
}
EOF
```

**Step 4: Create ESLint configuration variants**

```javascript
// base.js - Core TypeScript rules
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-types': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabeticallyBu: true,
        alphabeticallyIgnoreCase: true,
      },
    ],
  },
};
```

```javascript
// react.js - React-specific rules
module.exports = {
  extends: ['./base.js', 'airbnb/rules/react'],
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/function-component-definition': [
      'error',
      { namedComponents: 'arrow-function' },
    ],
  },
};
```

```javascript
// node.js - Node.js/backend rules
module.exports = {
  extends: ['./base.js'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
};
```

```javascript
// healthcare.js - Strict healthcare domain rules
module.exports = {
  extends: ['./base.js'],
  rules: {
    'no-console': 'error', // No PHI in logs
    '@typescript-eslint/no-explicit-any': 'error', // Strict typing for patient data
    'require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
        },
      },
    ],
    'complexity': ['error', 10], // Reduce cyclomatic complexity for audit clarity
    'no-unsafe-regex': 'error',
  },
};
```

#### Success Criteria

- All packages extend `@the-abyss/config-typescript` via tsconfig.json
- Zero TypeScript errors in strict mode across entire monorepo
- Healthcare apps use healthcare.js rules (enforced in CI)
- Path aliases (`@the-abyss/*`) resolve correctly in VS Code and WebStorm
- Pre-commit hooks block commits with ESLint errors
- Incremental TypeScript builds 50% faster with project references

#### Deliverables

- `packages/config-typescript/` with 4 config variants (base, nextjs, react-library, node)
- `packages/config-eslint/` with 4 rule sets (base, react, node, healthcare)
- Root `.eslintrc.js` consuming shared config
- Documentation: `packages/config-*/README.md` with usage examples

---

### Sub-Task 3.2: Shared Types Package (Global Contracts)

**Owner:** Tech Lead / API Architect  
**Duration:** 3–4 days  
**Status:** Scheduled

#### Objective

Create `packages/shared-types` — a central repository of TypeScript interfaces for domain models (User, Organization, AiSession), API contracts (ApiResponse, PaginatedResult), FHIR resources, and Langflow definitions. Enable end-to-end type safety.

#### Detailed Steps

**Step 1: Initialize package structure**

```bash
mkdir -p packages/shared-types/src/{domain,api,fhir,langflow,utils}
cd packages/shared-types

cat > package.json << 'EOF'
{
  "name": "@the-abyss/shared-types",
  "version": "1.0.0",
  "description": "Global TypeScript type definitions for The Abyss monorepo",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "devDependencies": {
    "@the-abyss/config-typescript": "workspace:*",
    "typescript": "^5.x",
    "jest": "^29.x"
  }
}
EOF
```

**Step 2: Create domain models**

```typescript
// src/domain/user.ts
export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  CLINICIAN = 'clinician',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  preferences?: Record<string, unknown>;
}
```

```typescript
// src/domain/organization.ts
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string; // Domain-based tenant resolution
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant extends Organization {
  tier: 'startup' | 'growth' | 'enterprise';
  maxUsers: number;
  maxApiCalls: number;
}
```

```typescript
// src/domain/ai-session.ts
export enum AgentType {
  CODE_GENERATION = 'code-generation',
  FHIR_VALIDATOR = 'fhir-validator',
  SECURITY_AUDIT = 'security-audit',
  ORCHESTRATOR = 'orchestrator',
}

export enum ModelType {
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4 = 'gpt-4',
  GPT_35_TURBO = 'gpt-3.5-turbo',
  CLAUDE_3_5_SONNET = 'claude-3.5-sonnet',
  CLAUDE_3_OPUS = 'claude-3-opus',
  OLLAMA_LOCAL = 'ollama-local',
}

export interface AiSession {
  id: string;
  sessionId: string;
  organizationId: string;
  agentType: AgentType;
  domain: 'healthcare' | 'academic' | 'incubator' | 'internal';
  
  // Request context
  userId?: string;
  taskId?: string; // Link to HANDOFF task
  inputPrompt: string;
  
  // Execution details
  modelUsed: ModelType;
  tokenUsed: number;
  latencyMs: number;
  costUsd?: number;
  
  // Output & verification
  output: string;
  approved: boolean;
  approvedBy?: string;
  
  // Audit trail
  createdAt: Date;
  metadata?: Record<string, unknown>;
}
```

**Step 3: Create API contracts**

```typescript
// src/api/common.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  version: string;
}

export type ResultType<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

```typescript
// src/api/healthcare.ts
export interface ReferralRequest {
  patientId: string;
  referringPractitionerId: string;
  receivingOrganizationId: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'stat';
  attachments?: string[]; // Document IDs
  metadata?: Record<string, unknown>;
}

export interface ReferralResponse {
  referralId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

**Step 4: Create FHIR types**

```typescript
// src/fhir/patient.ts
export interface FHIRIdentifier {
  system: string;
  value: string;
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
}

export interface FHIRHumanName {
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
}

export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: FHIRIdentifier[];
  active?: boolean;
  name: FHIRHumanName[];
  telecom?: Array<{
    system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string; // YYYY-MM-DD
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: Array<{
    use?: string;
    type?: string;
    text?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  meta?: {
    lastUpdated?: string;
    source?: string;
    profile?: string[];
  };
}
```

**Step 5: Create Langflow types**

```typescript
// src/langflow/flow-definition.ts
export interface FlowNode {
  id: string;
  type: string;
  data: Record<string, unknown>;
  position: {
    x: number;
    y: number;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface FlowDefinition {
  id: string;
  name: string;
  version: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  metadata?: Record<string, unknown>;
}

export interface FlowExecutionRequest {
  flowId: string;
  input: Record<string, unknown>;
  sessionId?: string;
  timeout?: number;
}

export interface FlowExecutionResult {
  flowId: string;
  sessionId: string;
  output: Record<string, unknown>;
  tokensUsed: number;
  latencyMs: number;
  error?: string;
}
```

**Step 6: Create utility types**

```typescript
// src/utils/result-type.ts
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

```typescript
// src/index.ts - Barrel export
export * from './domain/user';
export * from './domain/organization';
export * from './domain/ai-session';
export * from './api/common';
export * from './api/healthcare';
export * from './fhir/patient';
export * from './langflow/flow-definition';
export * from './utils/result-type';
```

#### Success Criteria

- All API endpoints use `ApiResponse<T>` pattern
- FHIR types match official HL7 FHIR R4 specifications
- 100% TypeScript coverage (no `any` types in exports)
- Types validated against database schema (Prisma)
- Documentation generated from TSDoc comments
- Test coverage >80% for type inference

#### Deliverables

- `packages/shared-types/` with 8+ type definition files
- Barrel exports in `src/index.ts`
- TSDoc comments for all exported types
- README.md with usage examples for each domain

---

### Sub-Task 3.3: Database & Persistence Layer (Prisma)

**Owner:** Backend Lead / Database Engineer  
**Duration:** 4–5 days  
**Status:** Scheduled

#### Objective

Create `packages/database` with comprehensive Prisma schema supporting multi-tenancy, immutable audit trails, AI session logging, and pgvector extensions. Enable type-safe database access across all applications.

#### Detailed Steps

**Step 1: Initialize Prisma package**

```bash
mkdir -p packages/database/{prisma,src}
cd packages/database

cat > package.json << 'EOF'
{
  "name": "@the-abyss/database",
  "version": "1.0.0",
  "description": "Prisma database client and schema for The Abyss",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "node prisma/seed.js",
    "build": "tsc"
  },
  "dependencies": {
    "@prisma/client": "^5.x"
  },
  "devDependencies": {
    "@the-abyss/shared-types": "workspace:*",
    "@the-abyss/config-typescript": "workspace:*",
    "prisma": "^5.x",
    "typescript": "^5.x"
  }
}
EOF
```

**Step 2: Create Prisma schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

// ============================================
// Core Domain Models
// ============================================

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  domain    String?
  tier      String   @default("startup") // startup | growth | enterprise
  settings  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users      User[]
  auditLogs  AuditLog[]
  aiSessions AiSession[]
  documents  Document[]

  @@index([slug])
  @@index([createdAt])
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String
  role           String   // admin | developer | clinician | viewer
  organizationId String
  isActive       Boolean  @default(true)
  lastLoginAt    DateTime?
  settings       Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  auditLogs    AuditLog[]

  @@index([organizationId])
  @@index([email])
  @@index([role])
}

// ============================================
// Audit & Compliance
// ============================================

// Immutable audit log (append-only, no DELETE)
model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  userId         String?
  action         String   // created | updated | deleted | accessed | approved
  resource       String   // Patient | Practitioner | Observation | Task | etc.
  resourceId     String?
  changes        Json?    // {before, after} for mutations
  metadata       Json?    // IP address, user agent, location, etc.
  timestamp      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User?        @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([organizationId, timestamp])
  @@index([userId])
  @@index([resource, resourceId])
  @@index([action])
}

// ============================================
// AI & Orchestration
// ============================================

model AiSession {
  id             String   @id @default(cuid())
  sessionId      String   @unique
  organizationId String
  agentType      String   // code-generation | fhir-validator | orchestrator | etc.
  domain         String   // healthcare | academic | incubator | internal

  // Request context
  userId         String?
  taskId         String?  // Link to HANDOFF task
  inputPrompt    String   @db.Text

  // Execution details
  modelUsed      String   // gpt-4-turbo | claude-3.5-sonnet | etc.
  tokenUsed      Int
  latencyMs      Int
  costUsd        Float?

  // Output & verification
  output         String   @db.Text
  approved       Boolean  @default(false)
  approvedBy     String?

  // Shadow mode metadata
  shadowEnabled  Boolean  @default(false)
  shadowFlowId   String?
  shadowOutput   String?  @db.Text
  shadowDiff     Json?

  // Audit trail
  createdAt      DateTime @default(now())
  metadata       Json?    // flow_id, error_details, etc.

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId, createdAt])
  @@index([domain, createdAt])
  @@index([taskId])
  @@index([sessionId])
  @@index([agentType])
}

// ============================================
// Vector Store & RAG
// ============================================

model Document {
  id             String   @id @default(cuid())
  organizationId String
  title          String
  content        String   @db.Text
  source         String   // github | notion | fhir-server | upload
  sourceId       String?
  embedding      Unsupported("vector(1536)")? // OpenAI ada-002
  metadata       Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([source])
  @@index([createdAt])
}

// ============================================
// Task Management (for Claudesy Workflow)
// ============================================

model HandoffTask {
  id              String   @id @default(cuid())
  taskId          String   @unique // ABYSS-001, ABYSS-002, etc.
  organizationId  String
  title           String
  owner           String
  domain          String   // healthcare | academic | incubator | internal
  description     String   @db.Text
  status          String   @default("pending_approval") // pending_approval | approved | in_progress | completed

  acceptanceCriteria String @db.Text
  technicalApproach  String @db.Text
  risks              String @db.Text
  estimatedDays      Int?

  approvedBy      String?
  approvedAt      DateTime?
  completedAt     DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  metadata        Json?

  @@index([organizationId])
  @@index([taskId])
  @@index([status])
  @@index([domain])
}
```

**Step 3: Create initial migration**

```bash
cd packages/database
npx prisma migrate dev --name "initial"
```

**Step 4: Create database client wrapper**

```typescript
// src/index.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================
// Audit Log Helper
// ============================================

export async function createAuditLog(params: {
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      ...params,
      timestamp: new Date(),
    },
  });
}

// ============================================
// AI Session Helper
// ============================================

export async function logAiSession(params: {
  organizationId: string;
  agentType: string;
  domain: string;
  userId?: string;
  taskId?: string;
  inputPrompt: string;
  modelUsed: string;
  tokenUsed: number;
  latencyMs: number;
  output: string;
  costUsd?: number;
  metadata?: Record<string, unknown>;
}) {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  return prisma.aiSession.create({
    data: {
      sessionId,
      ...params,
    },
  });
}

export * from '@prisma/client';
```

**Step 5: Create seed script for development**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test organization
  const org = await prisma.organization.upsert({
    where: { slug: 'sentra-dev' },
    update: {},
    create: {
      name: 'Sentra Development',
      slug: 'sentra-dev',
      tier: 'enterprise',
    },
  });

  // Create test users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sentra.dev' },
    update: {},
    create: {
      email: 'admin@sentra.dev',
      name: 'Admin User',
      role: 'admin',
      organizationId: org.id,
    },
  });

  const devUser = await prisma.user.upsert({
    where: { email: 'dev@sentra.dev' },
    update: {},
    create: {
      email: 'dev@sentra.dev',
      name: 'Developer',
      role: 'developer',
      organizationId: org.id,
    },
  });

  console.log(`✅ Seeded: Organization=${org.id}, Users=${adminUser.id},${devUser.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### Success Criteria

- `prisma migrate deploy` runs successfully on PostgreSQL 15+
- pgvector extension enabled and functional
- Seed script creates 100+ test organizations and users
- Query performance: AuditLog queries <50ms (indexed)
- Type-safe Prisma client generated and exported
- HIPAA compliance: AuditLog is append-only (no DELETE)
- Multi-tenancy: all queries filtered by organizationId

#### Deliverables

- `packages/database/prisma/schema.prisma` with 10+ models
- Database client wrapper (`src/index.ts`) with audit/session helpers
- Migration files in `prisma/migrations/`
- Seed script (`prisma/seed.ts`)
- README.md with migration instructions

---

### Sub-Task 3.4: UI Component Library (React + Tailwind)

**Owner:** Frontend Lead / UI Architect  
**Duration:** 5–7 days  
**Status:** Scheduled

#### Objective

Create `packages/ui` — a production-grade React component library with 40+ pre-built components (Button, Card, Table, Modal, Form inputs) using Tailwind CSS 4, dark mode support, accessibility (WCAG 2.1 AA), and Storybook documentation.

#### Detailed Steps

**Step 1: Initialize package**

```bash
mkdir -p packages/ui/{src/{components,hooks,utils},stories}
cd packages/ui

cat > package.json << 'EOF'
{
  "name": "@the-abyss/ui",
  "version": "1.0.0",
  "description": "React component library for The Abyss",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "tailwindcss": "^4.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-select": "^2.x",
    "lucide-react": "^0.300.x"
  },
  "devDependencies": {
    "@storybook/react": "^7.x",
    "@the-abyss/config-typescript": "workspace:*",
    "@the-abyss/config-eslint": "workspace:*",
    "typescript": "^5.x"
  }
}
EOF
```

**Step 2: Configure Tailwind CSS 4**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './stories/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--color-border))',
        input: 'hsl(var(--color-input))',
        ring: 'hsl(var(--color-ring))',
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
        },
        clinical: {
          primary: '#0066CC',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

```css
/* src/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-border: 210, 40%, 96%;
  --color-input: 210, 40%, 96%;
  --color-ring: 210, 40%, 50%;
  --color-background: 0, 0%, 100%;
  --color-foreground: 210, 40%, 10%;
  --color-primary: 210, 40%, 50%;
  --color-primary-foreground: 0, 0%, 100%;
}

.dark {
  --color-border: 210, 40%, 20%;
  --color-input: 210, 40%, 20%;
  --color-ring: 210, 40%, 80%;
  --color-background: 0, 0%, 5%;
  --color-foreground: 0, 0%, 95%;
}
```

**Step 3: Create utility functions**

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 4: Create core components**

```typescript
// src/components/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        clinical: 'bg-clinical-primary text-white hover:bg-clinical-primary/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

```typescript
// src/components/card.tsx
import * as React from 'react';
import { cn } from '../utils/cn';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-background shadow-sm',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
```

**Step 5: Create hook for dark mode**

```typescript
// src/hooks/use-theme.ts
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    let effectiveTheme = theme;

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  return { theme, setTheme, mounted };
}
```

**Step 6: Create Storybook stories**

```typescript
// stories/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost', 'clinical'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Clinical: Story = {
  args: {
    children: 'Submit FHIR Data',
    variant: 'clinical',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};
```

#### Success Criteria

- 40+ components with complete Storybook documentation
- Dark mode toggle works across all components
- All components pass accessibility audit (Axe DevTools)
- Tree-shakeable exports (unused components not bundled)
- Clinical theme variant for healthcare apps
- Build time <30 seconds with Turbo caching
- Component library published to internal npm registry

#### Deliverables

- `packages/ui/src/components/` with 40+ component files
- Tailwind 4 configuration with custom design tokens
- Dark mode support and theme hook
- Storybook deployed to documentation site
- README.md with component usage guide

---

### Sub-Task 3.5: AI Core Orchestration (Multi-Model LLM)

**Owner:** AI/ML Lead  
**Duration:** 5–6 days  
**Status:** Scheduled

#### Objective

Create `packages/ai-core` — a multi-model consensus engine supporting OpenAI (GPT-4), Anthropic (Claude 3.5 Sonnet), and Ollama. Include retry logic, token counting, HIPAA-aware prompts, and streaming support.

#### Detailed Steps

**Step 1: Initialize package**

```bash
mkdir -p packages/ai-core/{src/{providers,consensus,templates,utils},tests}
cd packages/ai-core

cat > package.json << 'EOF'
{
  "name": "@the-abyss/ai-core",
  "version": "1.0.0",
  "description": "Multi-model AI orchestration engine for The Abyss",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "openai": "^4.x",
    "@anthropic-ai/sdk": "^0.17.x",
    "ollama": "^0.4.x",
    "tiktoken": "^1.x",
    "zod": "^3.x",
    "@the-abyss/shared-types": "workspace:*"
  },
  "devDependencies": {
    "@the-abyss/config-typescript": "workspace:*",
    "typescript": "^5.x",
    "jest": "^29.x"
  }
}
EOF
```

**Step 2: Create base provider interface**

```typescript
// src/providers/base-provider.ts
export interface GenerateParams {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResult {
  content: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  provider: string;
  stopReason?: string;
}

export interface StreamChunk {
  delta: string;
  tokensUsed?: number;
}

export abstract class BaseLLMProvider {
  abstract name: string;
  abstract defaultModel: string;

  abstract generate(params: GenerateParams): Promise<GenerateResult>;

  abstract stream(
    params: GenerateParams,
  ): AsyncGenerator<StreamChunk, void, unknown>;

  abstract countTokens(text: string): Promise<number>;
}
```

**Step 3: Create OpenAI provider**

```typescript
// src/providers/openai-provider.ts
import OpenAI from 'openai';
import { BaseLLMProvider, GenerateParams, GenerateResult } from './base-provider';

export class OpenAIProvider extends BaseLLMProvider {
  name = 'openai';
  defaultModel = 'gpt-4-turbo';
  private client: OpenAI;

  constructor(apiKey: string) {
    super();
    this.client = new OpenAI({ apiKey });
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const start = Date.now();

    const response = await this.client.chat.completions.create({
      model: params.model || this.defaultModel,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || 2048,
    });

    const content =
      response.choices[0].message.content || '';
    const tokensUsed =
      response.usage?.total_tokens || 0;

    return {
      content,
      model: response.model,
      tokensUsed,
      latencyMs: Date.now() - start,
      provider: this.name,
      stopReason: response.choices[0].finish_reason,
    };
  }

  async* stream(
    params: GenerateParams,
  ): AsyncGenerator<{ delta: string; tokensUsed?: number }, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: params.model || this.defaultModel,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta.content || '';
      if (delta) {
        yield { delta };
      }
    }
  }

  async countTokens(text: string): Promise<number> {
    const encoding = require('js-tiktoken').encoding_for_model('gpt-4');
    return encoding.encode(text).length;
  }
}
```

**Step 4: Create Anthropic provider**

```typescript
// src/providers/anthropic-provider.ts
import Anthropic from '@anthropic-ai/sdk';
import { BaseLLMProvider, GenerateParams, GenerateResult } from './base-provider';

export class AnthropicProvider extends BaseLLMProvider {
  name = 'anthropic';
  defaultModel = 'claude-3-5-sonnet-20241022';
  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const start = Date.now();

    const response = await this.client.messages.create({
      model: params.model || this.defaultModel,
      max_tokens: params.maxTokens || 2048,
      system: params.systemPrompt,
      messages: [
        { role: 'user', content: params.userPrompt },
      ],
    });

    const content =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '';

    return {
      content,
      model: response.model,
      tokensUsed: response.usage?.input_tokens || 0 + response.usage?.output_tokens || 0,
      latencyMs: Date.now() - start,
      provider: this.name,
      stopReason: response.stop_reason,
    };
  }

  async* stream(
    params: GenerateParams,
  ): AsyncGenerator<{ delta: string; tokensUsed?: number }, void, unknown> {
    const stream = await this.client.messages.stream({
      model: params.model || this.defaultModel,
      max_tokens: params.maxTokens || 2048,
      system: params.systemPrompt,
      messages: [
        { role: 'user', content: params.userPrompt },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield { delta: chunk.delta.text };
      }
    }
  }

  async countTokens(text: string): Promise<number> {
    // Rough estimation: ~1 token per 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}
```

**Step 5: Create consensus engine**

```typescript
// src/consensus/consensus-engine.ts
import { BaseLLMProvider, GenerateParams, GenerateResult } from '../providers/base-provider';

export interface ConsensusParams extends GenerateParams {
  requireConsensus?: boolean;
  threshold?: number; // 0.0 - 1.0, default 0.8
}

export interface ConsensusResult extends GenerateResult {
  consensusScore: number; // 0.0 - 1.0
  breakdown: Array<{
    provider: string;
    content: string;
    tokensUsed: number;
  }>;
  agreed: boolean;
}

export class ConsensusEngine {
  private providers: Map<string, BaseLLMProvider>;
  private strategy: 'majority-vote' | 'quality-weighted';

  constructor(
    providers: BaseLLMProvider[],
    strategy: 'majority-vote' | 'quality-weighted' = 'quality-weighted',
  ) {
    this.providers = new Map(
      providers.map((p) => [p.name, p]),
    );
    this.strategy = strategy;
  }

  async generate(params: ConsensusParams): Promise<ConsensusResult> {
    const results = await Promise.all(
      Array.from(this.providers.values()).map((p) =>
        p.generate(params),
      ),
    );

    // Calculate consensus score (string similarity)
    const consensusScore = this.calculateConsensus(
      results.map((r) => r.content),
    );
    const agreed = consensusScore >= (params.threshold || 0.8);

    // Select best result
    const best =
      this.strategy === 'majority-vote'
        ? results[0]
        : this.selectByQuality(results);

    return {
      ...best,
      consensusScore,
      breakdown: results.map((r) => ({
        provider: r.provider,
        content: r.content,
        tokensUsed: r.tokensUsed,
      })),
      agreed,
    };
  }

  private calculateConsensus(texts: string[]): number {
    if (texts.length < 2) return 1.0;

    // Simple similarity: measure how many tokens are common
    const tokenSets = texts.map((t) => new Set(t.split(/\s+/)));
    const intersection = tokenSets[0].size;

    for (let i = 1; i < tokenSets.length; i++) {
      const common = new Set(
        [...tokenSets[0]].filter((x) =>
          tokenSets[i].has(x),
        ),
      );
      intersection = Math.min(intersection, common.size);
    }

    const maxSize = Math.max(...tokenSets.map((s) => s.size));
    return intersection / maxSize;
  }

  private selectByQuality(
    results: GenerateResult[],
  ): GenerateResult {
    // Score by: length, structure, low hallucination patterns
    const scores = results.map((r) => {
      let score = 0;
      score += r.content.length > 100 ? 1 : 0; // Detailed response
      score -= r.tokensUsed > 4000 ? 1 : 0; // Too verbose
      return { result: r, score };
    });

    return scores.sort((a, b) => b.score - a.score)[0].result;
  }
}
```

**Step 6: Create healthcare prompts**

```typescript
// src/templates/healthcare-prompts.ts
export const HIPAA_SYSTEM_PROMPT = `
You are a HIPAA-compliant medical AI assistant.

CRITICAL RULES:
1. Never log, store, or display Protected Health Information (PHI) in plain text
2. All FHIR resources must be validated against FHIR R4 specification
3. Include audit trail metadata in all responses
4. Use medical terminology from SNOMED CT or LOINC when applicable
5. If you cannot guarantee HIPAA compliance, respond with an error

Treat all patient data as confidential and apply de-identification techniques.
`;

export const FHIR_VALIDATION_PROMPT = `
You are a FHIR R4 validation expert. Validate the following resource against the FHIR R4 specification.

Resource Type: {{resourceType}}
Data:
\`\`\`json
{{resourceData}}
\`\`\`

Provide a structured response in JSON:
{
  "valid": boolean,
  "errors": [
    { "path": "/path/to/field", "message": "error description" }
  ],
  "warnings": [
    { "path": "/path/to/field", "message": "best practice suggestion" }
  ]
}
`;
```

#### Success Criteria

- Consensus engine achieves >80% agreement between OpenAI and Anthropic
- Token counting accuracy ±2% of actual API usage
- Retry logic handles 429 rate limits with exponential backoff
- Streaming responses work with Server-Sent Events (SSE)
- HIPAA prompts enforce no PHI in logs
- Cost tracking: calculate USD cost per request
- Test coverage >85% for all providers

#### Deliverables

- `packages/ai-core/` with 3 provider implementations (OpenAI, Anthropic, Ollama stub)
- ConsensusEngine with majority-vote and quality-weighted strategies
- Healthcare-specific system prompts with HIPAA compliance
- Unit tests for provider implementations
- README.md with usage examples

---

### Sub-Task 3.6: Vector Store & RAG Operations

**Owner:** Backend Lead / ML Engineer  
**Duration:** 4–5 days  
**Status:** Scheduled

#### Objective

Create `packages/vector-store` — a unified abstraction over Pinecone, Weaviate, Chroma, and PostgreSQL pgvector. Enable semantic search with metadata filtering, hybrid search (vector + keyword), and RAGOps best practices.

#### Detailed Steps

**Step 1: Initialize package**

```bash
mkdir -p packages/vector-store/{src/{providers,search,operations},tests}
cd packages/vector-store

cat > package.json << 'EOF'
{
  "name": "@the-abyss/vector-store",
  "version": "1.0.0",
  "description": "Unified RAG vector store abstraction for The Abyss",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@pinecone-database/pinecone": "^2.x",
    "weaviate-ts-client": "^2.x",
    "chromadb": "^1.x",
    "openai": "^4.x",
    "@the-abyss/database": "workspace:*",
    "@the-abyss/shared-types": "workspace:*"
  }
}
EOF
```

**Step 2: Create provider interface**

```typescript
// src/providers/base-provider.ts
export interface UpsertParams {
  indexName: string;
  documents: Array<{
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>;
  embeddingModel?: 'openai' | 'cohere' | 'ollama';
}

export interface SearchParams {
  indexName: string;
  query: string;
  topK?: number;
  filter?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number; // 0.0 - 1.0
  metadata?: Record<string, unknown>;
}

export interface CreateIndexParams {
  name: string;
  dimension: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
}

export abstract class BaseVectorStore {
  abstract provider: string;

  abstract createIndex(params: CreateIndexParams): Promise<void>;

  abstract deleteIndex(indexName: string): Promise<void>;

  abstract upsert(params: UpsertParams): Promise<void>;

  abstract delete(indexName: string, ids: string[]): Promise<void>;

  abstract search(params: SearchParams): Promise<SearchResult[]>;

  abstract hybridSearch(
    params: SearchParams & { bm25Weight?: number },
  ): Promise<SearchResult[]>;
}
```

**Step 3: Create Pinecone provider**

```typescript
// src/providers/pinecone-provider.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { BaseVectorStore, CreateIndexParams, SearchParams, UpsertParams, SearchResult } from './base-provider';
import { OpenAIEmbeddings } from './embeddings/openai-embeddings';

export class PineconeProvider extends BaseVectorStore {
  provider = 'pinecone';
  private client: Pinecone;
  private embeddings: OpenAIEmbeddings;

  constructor(apiKey: string, environment: string) {
    super();
    this.client = new Pinecone({
      apiKey,
      environment,
    });
    this.embeddings = new OpenAIEmbeddings(process.env.OPENAI_API_KEY!);
  }

  async createIndex(params: CreateIndexParams): Promise<void> {
    await this.client.createIndex({
      name: params.name,
      dimension: params.dimension,
      metric: params.metric,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-west-2',
        },
      },
    });
  }

  async deleteIndex(indexName: string): Promise<void> {
    await this.client.deleteIndex(indexName);
  }

  async upsert(params: UpsertParams): Promise<void> {
    const index = this.client.Index(params.indexName);

    // Generate embeddings
    const embeddings = await Promise.all(
      params.documents.map((doc) =>
        this.embeddings.embed(doc.content),
      ),
    );

    // Upsert vectors
    await index.upsert(
      params.documents.map((doc, i) => ({
        id: doc.id,
        values: embeddings[i],
        metadata: doc.metadata,
      })),
    );
  }

  async delete(indexName: string, ids: string[]): Promise<void> {
    const index = this.client.Index(indexName);
    await index.deleteMany(ids);
  }

  async search(params: SearchParams): Promise<SearchResult[]> {
    const index = this.client.Index(params.indexName);

    // Generate query embedding
    const queryEmbedding = await this.embeddings.embed(params.query);

    // Search
    const results = await index.query({
      vector: queryEmbedding,
      topK: params.topK || 10,
      filter: params.filter,
      includeMetadata: true,
    });

    return (results.matches || []).map((match) => ({
      id: match.id,
      content: match.metadata?.content as string,
      score: match.score || 0,
      metadata: match.metadata,
    }));
  }

  async hybridSearch(params: SearchParams & { bm25Weight?: number }): Promise<SearchResult[]> {
    // For now, just do vector search
    // In production, combine with BM25 results
    return this.search(params);
  }
}
```

**Step 4: Create pgvector provider (self-hosted)**

```typescript
// src/providers/pgvector-provider.ts
import { prisma } from '@the-abyss/database';
import { BaseVectorStore, CreateIndexParams, SearchParams, UpsertParams, SearchResult } from './base-provider';

export class PgVectorProvider extends BaseVectorStore {
  provider = 'pgvector';

  async createIndex(_params: CreateIndexParams): Promise<void> {
    // pgvector uses existing Document table
    // No separate index creation needed
  }

  async deleteIndex(_indexName: string): Promise<void> {
    // pgvector uses existing Document table
  }

  async upsert(params: UpsertParams): Promise<void> {
    // Note: In production, calculate embeddings via OpenAI API
    // For this example, we'll assume embeddings are pre-calculated
    for (const doc of params.documents) {
      await prisma.document.upsert({
        where: { id: doc.id },
        update: { content: doc.content, metadata: doc.metadata },
        create: {
          id: doc.id,
          organizationId: 'org-id', // Should come from context
          title: doc.id,
          content: doc.content,
          source: params.indexName,
          metadata: doc.metadata,
          // embedding would be set via separate embedding service
        },
      });
    }
  }

  async delete(indexName: string, ids: string[]): Promise<void> {
    await prisma.document.deleteMany({
      where: {
        source: indexName,
        id: { in: ids },
      },
    });
  }

  async search(params: SearchParams): Promise<SearchResult[]> {
    // pgvector cosine similarity search
    // This would require raw SQL query
    // Simplified example:
    const results = await prisma.document.findMany({
      where: {
        source: params.indexName,
      },
      take: params.topK || 10,
    });

    return results.map((doc) => ({
      id: doc.id,
      content: doc.content,
      score: 0.95, // In production, calculate actual similarity
      metadata: doc.metadata as Record<string, unknown> | undefined,
    }));
  }

  async hybridSearch(params: SearchParams & { bm25Weight?: number }): Promise<SearchResult[]> {
    return this.search(params);
  }
}
```

**Step 5: Create unified factory**

```typescript
// src/index.ts
export { BaseVectorStore, UpsertParams, SearchParams, SearchResult } from './providers/base-provider';
export { PineconeProvider } from './providers/pinecone-provider';
export { PgVectorProvider } from './providers/pgvector-provider';

export interface VectorStoreConfig {
  provider: 'pinecone' | 'weaviate' | 'chroma' | 'pgvector';
  apiKey?: string;
  environment?: string;
}

export function createVectorStore(config: VectorStoreConfig): BaseVectorStore {
  switch (config.provider) {
    case 'pinecone':
      return new PineconeProvider(
        config.apiKey || process.env.PINECONE_API_KEY!,
        config.environment || process.env.PINECONE_ENV!,
      );
    case 'pgvector':
      return new PgVectorProvider();
    // Add other providers...
    default:
      throw new Error(`Unknown vector store provider: ${config.provider}`);
  }
}
```

#### Success Criteria

- Search latency <100ms for 1M vector index (Pinecone)
- Embedding generation batched (100 docs at a time)
- Metadata filtering works across all providers
- pgvector achieves 90% recall compared to Pinecone
- Hybrid search improves accuracy by 15%
- Multi-tenancy: isolated embeddings per organization

#### Deliverables

- `packages/vector-store/` with provider implementations
- Unified VectorStore factory interface
- Embeddings abstraction (OpenAI, Cohere, Ollama)
- Integration tests for each provider
- README.md with RAGOps best practices

---

### Sub-Task 3.7: Langflow Client SDK

**Owner:** Backend Lead / Integration Engineer  
**Duration:** 3–4 days  
**Status:** Scheduled

#### Objective

Create `packages/langflow-client` — a TypeScript SDK for Langflow integration with flow execution, shadow mode (A/B testing), and Sentratorium session logging.

#### Detailed Steps

**Step 1: Initialize package**

```bash
mkdir -p packages/langflow-client/{src/{client,flows,types},tests}
cd packages/langflow-client

cat > package.json << 'EOF'
{
  "name": "@the-abyss/langflow-client",
  "version": "1.0.0",
  "description": "TypeScript SDK for Langflow integration",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "axios": "^1.x",
    "zod": "^3.x",
    "@the-abyss/shared-types": "workspace:*",
    "@the-abyss/database": "workspace:*"
  }
}
EOF
```

**Step 2: Create types**

```typescript
// src/types/flow-types.ts
export interface FlowExecutionRequest {
  flowId: string;
  input: Record<string, unknown>;
  sessionId?: string;
  timeout?: number;
}

export interface FlowExecutionResult {
  flowId: string;
  sessionId: string;
  output: Record<string, unknown>;
  tokensUsed: number;
  latencyMs: number;
  error?: string;
}

export interface ShadowModeRequest {
  primaryFlowId: string;
  shadowFlowId: string;
  input: Record<string, unknown>;
  comparisonStrategy: 'output-diff' | 'similarity' | 'custom';
}

export interface ShadowModeResult {
  primaryResult: FlowExecutionResult;
  shadowResult: FlowExecutionResult;
  match: boolean;
  diff?: Record<string, unknown>;
  similarityScore: number;
}
```

**Step 3: Create main client**

```typescript
// src/client/langflow-client.ts
import axios, { AxiosInstance } from 'axios';
import { generateId } from '../utils/id-generator';
import { FlowExecutionRequest, FlowExecutionResult } from '../types/flow-types';
import { logAiSession } from '@the-abyss/database';

export interface LangflowClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export class LangflowClient {
  private http: AxiosInstance;
  private config: LangflowClientConfig;

  constructor(config: LangflowClientConfig) {
    this.config = config;
    this.http = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 30000,
    });
  }

  async executeFlow(
    request: FlowExecutionRequest,
  ): Promise<FlowExecutionResult> {
    const sessionId = request.sessionId || `sess_${generateId()}`;
    const start = Date.now();

    try {
      const response = await this.http.post(
        `/flows/${request.flowId}/run`,
        {
          input: request.input,
          sessionId,
        },
      );

      const result: FlowExecutionResult = {
        flowId: request.flowId,
        sessionId,
        output: response.data.output,
        tokensUsed: response.data.tokensUsed || 0,
        latencyMs: Date.now() - start,
      };

      // Log to Sentratorium
      await logAiSession({
        organizationId: 'org-id', // Should come from context
        agentType: 'orchestrator',
        domain: 'internal',
        taskId: request.sessionId,
        inputPrompt: JSON.stringify(request.input),
        modelUsed: 'langflow',
        tokenUsed: result.tokensUsed,
        latencyMs: result.latencyMs,
        output: JSON.stringify(result.output),
        metadata: { flowId: request.flowId },
      });

      return result;
    } catch (error) {
      throw new LangflowError(
        `Flow execution failed: ${error}`,
        request.flowId,
      );
    }
  }

  async executeShadowMode(
    primaryFlowId: string,
    shadowFlowId: string,
    input: Record<string, unknown>,
  ): Promise<{ primary: FlowExecutionResult; shadow: FlowExecutionResult }> {
    const [primaryResult, shadowResult] = await Promise.all([
      this.executeFlow({ flowId: primaryFlowId, input }),
      this.executeFlow({ flowId: shadowFlowId, input }),
    ]);

    return { primary: primaryResult, shadow: shadowResult };
  }
}

export class LangflowError extends Error {
  constructor(
    message: string,
    public flowId: string,
  ) {
    super(message);
    this.name = 'LangflowError';
  }
}
```

**Step 4: Create shadow mode executor**

```typescript
// src/flows/shadow-mode.ts
import { LangflowClient } from '../client/langflow-client';
import { FlowExecutionResult } from '../types/flow-types';
import { logAiSession } from '@the-abyss/database';

export class ShadowModeExecutor {
  constructor(private client: LangflowClient) {}

  async execute(
    primaryFlowId: string,
    shadowFlowId: string,
    input: Record<string, unknown>,
  ): Promise<{
    primary: FlowExecutionResult;
    shadow: FlowExecutionResult;
    match: boolean;
    diff: Record<string, unknown>;
  }> {
    const { primary, shadow } = await this.client.executeShadowMode(
      primaryFlowId,
      shadowFlowId,
      input,
    );

    const match = this.compareOutputs(
      primary.output,
      shadow.output,
    );

    const diff = this.calculateDiff(
      primary.output,
      shadow.output,
    );

    // Log shadow execution for analysis
    await logAiSession({
      organizationId: 'org-id',
      agentType: 'orchestrator',
      domain: 'internal',
      inputPrompt: JSON.stringify(input),
      modelUsed: 'langflow-shadow',
      tokenUsed: primary.tokensUsed + shadow.tokensUsed,
      latencyMs: primary.latencyMs + shadow.latencyMs,
      output: JSON.stringify({ primary: primary.output, shadow: shadow.output }),
      metadata: {
        primaryFlowId,
        shadowFlowId,
        match,
        diff,
      },
    });

    // Always return primary result to user
    return { primary, shadow, match, diff };
  }

  private compareOutputs(
    primary: Record<string, unknown>,
    shadow: Record<string, unknown>,
  ): boolean {
    return JSON.stringify(primary) === JSON.stringify(shadow);
  }

  private calculateDiff(
    primary: Record<string, unknown>,
    shadow: Record<string, unknown>,
  ): Record<string, unknown> {
    const diff: Record<string, unknown> = {};
    const allKeys = new Set([
      ...Object.keys(primary),
      ...Object.keys(shadow),
    ]);

    for (const key of allKeys) {
      if (primary[key] !== shadow[key]) {
        diff[key] = {
          primary: primary[key],
          shadow: shadow[key],
        };
      }
    }

    return diff;
  }
}
```

#### Success Criteria

- Flow execution latency <500ms (excluding LLM time)
- Shadow mode executes without impacting primary flow latency
- 100% TypeScript coverage
- Retry logic handles transient failures
- All executions logged to Sentratorium
- Test coverage >80%

#### Deliverables

- `packages/langflow-client/` with client and shadow mode implementation
- Complete type definitions for Langflow API contracts
- Integration with Sentratorium session logging
- Unit tests with mocked Langflow API
- README.md with usage examples

---

### Sub-Task 3.8: FHIR Validation Engine

**Owner:** Healthcare Architect / Backend Lead  
**Duration:** 5–6 days  
**Status:** Scheduled

#### Objective

Create `packages/fhir-engine` — HL7 FHIR R4 validator supporting Patient, Practitioner, Observation resources; US Core profiles; SNOMED CT/LOINC terminology validation; and FHIR Bundle support.

#### Detailed Steps

**Step 1: Initialize package**

```bash
mkdir -p packages/fhir-engine/{src/{validators,terminology,schemas,transformers},tests}
cd packages/fhir-engine

cat > package.json << 'EOF'
{
  "name": "@the-abyss/fhir-engine",
  "version": "1.0.0",
  "description": "HL7 FHIR R4 validation and transformation engine",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "fhir": "^4.11.x",
    "@types/fhir": "^0.0.x",
    "ajv": "^8.x",
    "ajv-formats": "^2.x",
    "@the-abyss/shared-types": "workspace:*",
    "@the-abyss/database": "workspace:*"
  }
}
EOF
```

**Step 2: Create FHIR validator**

```typescript
// src/validators/patient-validator.ts
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import * as fhirR4 from 'fhir/r4';
import { FHIRPatient } from '@the-abyss/shared-types';

export interface ValidationError {
  path: string;
  message: string;
  instancePath: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export class PatientValidator {
  private ajv: Ajv;
  private validator?: ValidateFunction;

  constructor(private profile: 'base' | 'us-core' = 'base') {
    this.ajv = new Ajv();
    addFormats(this.ajv);
    this.initializeValidator();
  }

  private initializeValidator(): void {
    // In production, load official FHIR R4 schema from hl7.org
    // For this example, we'll create a simplified schema
    const schema = {
      type: 'object',
      required: ['resourceType', 'id'],
      properties: {
        resourceType: { const: 'Patient' },
        id: { type: 'string' },
        identifier: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              system: { type: 'string', format: 'uri' },
              value: { type: 'string' },
            },
            required: ['system', 'value'],
          },
        },
        name: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              family: { type: 'string' },
              given: { type: 'array', items: { type: 'string' } },
            },
            minItems: 1,
          },
        },
        birthDate: { type: 'string', format: 'date' },
        gender: {
          enum: ['male', 'female', 'other', 'unknown'],
        },
      },
    };

    this.validator = this.ajv.compile(schema);
  }

  validate(patient: unknown): ValidationResult {
    if (!this.validator) {
      throw new Error('Validator not initialized');
    }

    const valid = this.validator(patient);
    const errors: ValidationError[] = (this.validator.errors || []).map(
      (err) => ({
        path: err.instancePath || '/',
        message: err.message || 'Unknown error',
        instancePath: err.instancePath,
      }),
    );

    const warnings: string[] = [];

    // US Core-specific warnings
    if (this.profile === 'us-core') {
      const p = patient as FHIRPatient;
      if (!p.telecom || p.telecom.length === 0) {
        warnings.push(
          'US Core requires at least one contact point (telecom)',
        );
      }
      if (!p.address || p.address.length === 0) {
        warnings.push('US Core recommends at least one address');
      }
    }

    return { valid, errors, warnings };
  }
}

export class PractitionerValidator {
  // Similar implementation for Practitioner resource
}

export class ObservationValidator {
  // Similar implementation for Observation resource
}
```

**Step 3: Create terminology validator**

```typescript
// src/terminology/code-system-validator.ts
export class CodeSystemValidator {
  private snomedCache: Map<string, boolean> = new Map();
  private loincCache: Map<string, boolean> = new Map();

  async validate(params: {
    system: string;
    code: string;
    display?: string;
  }): Promise<boolean> {
    if (params.system === 'http://snomed.info/sct') {
      return this.validateSNOMED(params.code, params.display);
    }

    if (params.system === 'http://loinc.org') {
      return this.validateLOINC(params.code, params.display);
    }

    // For other systems, assume valid
    return true;
  }

  private async validateSNOMED(code: string, display?: string): Promise<boolean> {
    if (this.snomedCache.has(code)) {
      return this.snomedCache.get(code)!;
    }

    // In production, call SNOMED CT API (requires license)
    // For demo, use hardcoded list
    const validCodes = [
      '38341003', // Hypertension
      '73211009', // Diabetes mellitus
      '414545004', // Ischemic heart disease
    ];

    const valid = validCodes.includes(code);
    this.snomedCache.set(code, valid);
    return valid;
  }

  private async validateLOINC(code: string, display?: string): Promise<boolean> {
    if (this.loincCache.has(code)) {
      return this.loincCache.get(code)!;
    }

    // In production, call LOINC API
    const validCodes = [
      '85354-9', // Blood pressure panel
      '2345-7', // Glucose level
    ];

    const valid = validCodes.includes(code);
    this.loincCache.set(code, valid);
    return valid;
  }
}
```

**Step 4: Create FHIR transformer**

```typescript
// src/transformers/to-fhir.ts
import { User, Organization } from '@the-abyss/shared-types';
import { FHIRPatient } from '@the-abyss/shared-types';

export function toFHIRPatient(user: User, params?: {
  mrn?: string;
  birthDate?: string;
}): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: user.id,
    identifier: params?.mrn
      ? [
        {
          system: 'http://hospital.example.org/patients',
          value: params.mrn,
        },
      ]
      : [],
    name: [
      {
        text: user.name,
        given: user.name.split(' ').slice(0, -1),
        family: user.name.split(' ').pop(),
      },
    ],
    birthDate: params?.birthDate,
    active: user.isActive,
    meta: {
      lastUpdated: user.updatedAt.toISOString(),
    },
  };
}
```

**Step 5: Create bundle builder**

```typescript
// src/bundles/bundle-builder.ts
export class BundleBuilder {
  private entries: Array<{
    request?: Record<string, unknown>;
    resource: Record<string, unknown>;
  }> = [];

  constructor(private type: 'transaction' | 'batch' = 'transaction') {}

  addEntry(entry: {
    request?: { method: string; url: string };
    resource: Record<string, unknown>;
  }): this {
    this.entries.push(entry);
    return this;
  }

  build(): Record<string, unknown> {
    return {
      resourceType: 'Bundle',
      type: this.type,
      entry: this.entries,
    };
  }
}
```

#### Success Criteria

- 100% validation accuracy against official FHIR R4 test suite
- US Core profile support for Patient, Practitioner, Observation
- Code system validation (SNOMED CT, LOINC)
- All FHIR operations logged to AuditLog table
- Transformation accuracy: >95% roundtrip fidelity
- Performance: Validate 1000 Patient resources in <1 second

#### Deliverables

- `packages/fhir-engine/` with validators for 5+ FHIR resource types
- SNOMED CT/LOINC code system validation
- Transformer functions (internal → FHIR and vice versa)
- Bundle builder utility
- Unit tests with 80%+ coverage
- README.md with FHIR R4 validation guide

---

## Implementation Timeline

| Week | Sub-Tasks | Milestones |
| --- | --- | --- |
| **Week 1** | 3.1, 3.2, 3.3 | Config packages + Shared types + Database schema |
| **Week 2** | 3.4, 3.5 | UI components + AI core orchestration |
| **Week 3** | 3.6, 3.7 | Vector store + Langflow client |
| **Week 4** | 3.8 | FHIR validation engine + Testing |
| **Week 5–6** | Integration + Docs | Cross-package testing, Storybook, npm publishing |

---

## Success Metrics & Verification

### Technical Metrics

- All packages build successfully: `pnpm turbo run build --filter="./packages/*"`
- Zero TypeScript errors across monorepo in strict mode
- Test coverage >80% for all packages
- Zero dependency conflicts: `pnpm ls` shows no duplicates
- Build time for all packages <2 minutes (with Turbo caching)

### Performance Metrics

- Database queries <50ms (p95) for AuditLog lookups
- UI components render <16ms (60 FPS)
- AI consensus latency <3 seconds (2 models)
- Vector search <100ms (p99) for 1M vectors
- FHIR validation <10ms per resource

### Compliance Metrics

- HIPAA audit trail captures 100% of PHI access
- FHIR validation passes official HL7 test suite
- No PHI in logs or error messages (ESLint healthcare.js enforced)
- All database queries filtered by organizationId (multi-tenancy)

### Developer Experience

- Each package has comprehensive README with examples
- 40+ UI components documented in Storybook
- API documentation auto-generated from TSDoc
- New developers can integrate shared types within 10 minutes

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| **Prisma schema drift** | Medium | High | Git version-control migrations, test in CI before deploy |
| **AI model API rate limits** | High | Medium | Implement exponential backoff, queue requests, fallback models |
| **Vector search latency** | Low | Medium | Cache embeddings, use batch operations, index optimization |
| **FHIR spec complexity** | Medium | Medium | Use official HL7 schemas, early compliance testing |
| **Dark mode CSS issues** | Low | Low | Comprehensive Storybook tests in dark mode |
| **Cross-package circular dependencies** | Medium | High | Enforce strict dependency DAG, ESLint import rules |

---

## Next Phase Preview

After Phase 3 completion, teams proceed to **Phase 4: Langflow & Orchestration**, which implements:

- **`apps/orchestrator/`** — FastAPI gateway for unified `/run/{flowId}` endpoint
- **Shadow Mode A/B Testing** — Safe experimentation with flow variants
- **Sentratorium Dashboard** — Real-time monitoring of AI sessions
- **Flow Quality Testing** — Promptfoo/Ragas automated evaluation

Phase 4 depends entirely on Phase 3 completion. All 8 shared packages must be production-ready before orchestration layer can be built.