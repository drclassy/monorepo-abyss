`Agen, buatkan file-file kunci untuk 'The Abyss' sesuai dengan Blueprint Scaffolding yang diberikan. Pastikan folder sudah dibuat sebelumnya dan semua file berada di path yang benar. Setelah selesai, jalankan pnpm install."`

### 1. Konfigurasi Root (The Foundation)

#### 

`pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/**'
  - 'packages/**'
  - 'flows/**'
  - 'tooling/**'
```

#### 

`turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": { "dependsOn": ["build"] },
    "lint": {},
    "dev": { "cache": false, "persistent": true },
    "db:generate": { "cache": false },
    "db:push": { "cache": false }
  }
}
```

#### 

`package.json` (Root)

```json
{
  "name": "the-abyss",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "abyss": "pnpm --filter abyss-cli"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "latest",
    "typescript": "latest"
  }
}
```

---

### 

🧠 2. Agentic Steering & Governance

#### 

`.agents/AGENTS.md` (Global Rules)

```markdown
# 🌐 The Abyss: Global Agent Steering

Semua Agen AI wajib mematuhi **Claudesy Workflow**:
1. **HANDOFF FIRST:** Dilarang coding tanpa `HANDOFF.md` di folder sesi.
2. **GO-GATE:** Eksekusi hanya setelah ada string `✅ GO` dari Chief.
3. **TRACEABILITY:** Commit wajib menggunakan trailer `Agent:`, `Phase:`, `Handoff:`.
4. **MODULAR MONOLITH:** Patuhi batas domain; gunakan `@the-abyss/ui` untuk semua frontend.
```

#### 

`docs/templates/HANDOFF.md`

```markdown
# 📝 HANDOFF: [Judul Tugas]
**Status:** 🛑 PENDING / ✅ GO
**Agent:** [Nama Agent]

## 🔍 Diagnosis
[Masalah/Fitur]

## 🏗️ Proposed Architecture
[Daftar file yang diubah & logic baru]

## 🛡️ Proof-of-Verification
[Unit Test & Security Scan Plan]

## 🔑 Chief Approval
> Approval String: 
```

#### 

`packages/iskandar-gatekeeper/index.ts` (The Gatekeeper Script)

```typescript
import fs from 'fs';
import path from 'path';

// Script untuk mengecek file HANDOFF terbaru di docs/sentratorium/sessions
const sessionsPath = path.join(__dirname, '../../docs/sentratorium/sessions');
const files = fs.readdirSync(sessionsPath).filter(f => f.endsWith('.md'));

if (files.length === 0) {
  console.error("❌ No HANDOFF session found!");
  process.exit(1);
}

const latestHandoff = fs.readFileSync(path.join(sessionsPath, files[files.length - 1]), 'utf-8');

if (!latestHandoff.includes('✅ GO') && !latestHandoff.includes('GO APPROVED')) {
  console.error("❌ CI/CD REJECTED: No 'GO' Approval found in HANDOFF.md");
  process.exit(1);
}

console.log("✅ GO-Gate Passed. Proceeding to build...");
```

---

### 

🏗️ 3. The Reusable Substrate (Shared Packages)

#### 

`packages/database/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Organization {
  id    String @id @default(uuid())
  name  String
  apps  App[]
}

model App {
  id             String       @id @default(uuid())
  name           String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
}

model AiSession {
  id        String   @id @default(uuid())
  agentName String
  handoffUrl String
  status    String   // PENDING, COMPLETED, FAILED
  logs      String?
  createdAt DateTime @default(now())
}
```

#### 

`packages/langflow-client/src/index.ts`

```typescript
export class AbyssFlowClient {
  private baseUrl: string;

  constructor(apiKey: string) {
    this.baseUrl = process.env.LANGFLOW_API_URL || 'http://localhost:7860';
  }

  async runFlow(flowId: string, input: any) {
    const response = await fetch(`${this.baseUrl}/api/v1/run/${flowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input_value: input })
    });
    return response.json();
  }
}
```

---

### 

🛡️ 4. CI/CD & Infrastructure

#### 

`.github/workflows/ci.yml`

```yaml
name: The Abyss CI
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - name: Install Dependencies
        run: pnpm install
      
      - name: Run Iskandar GO-Gate
        run: pnpm --filter @the-abyss/iskandar-gatekeeper run start
      
      - name: Build Affected Projects
        run: pnpm turbo run build --filter=[HEAD^1]
      
      - name: Test Affected Projects
        run: pnpm turbo run test --filter=[HEAD^1]
```

#### 

`infrastructure/docker/Dockerfile` (Multi-stage)

```dockerfile
# Context: Monorepo Root
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN npx turbo run build --filter=@the-abyss/referralink-api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/healthcare/referralink-api/dist ./
USER node
CMD ["node", "main.js"]
```

---

### 

🔧 5. Tooling

#### 

`tooling/abyss-cli/index.ts` (Example: init-task command)

```typescript
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .command('init-task <title>')
  .action((title) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionDir = path.join(process.cwd(), 'docs/sentratorium/sessions', `SESSION-${timestamp}`);
    fs.mkdirSync(sessionDir, { recursive: true });
    
    const template = fs.readFileSync(path.join(process.cwd(), 'docs/templates/HANDOFF.md'), 'utf-8');
    const handoffContent = template.replace('[Judul Tugas]', title);
    
    fs.writeFileSync(path.join(sessionDir, 'HANDOFF.md'), handoffContent);
    console.log(`🚀 Task initialized: ${sessionDir}/HANDOFF.md`);
  });

program.parse();
```