---
id: "80ea6523-c545-47a0-82df-bb43e5bc9265"
entity_type: "blueprint"
entity_id: "80ea6523-c545-47a0-82df-bb43e5bc9265"
title: "Phase 6: Abyss CLI & Automation – Complete Technical Specification"
status: ""
priority: ""
updated_at: "2026-03-31T09:06:54.652997+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Strategic Overview

**Phase 6: Abyss CLI & Automation** builds the internal developer tools that make monorepo governance, workflow management, and scaffolding frictionless for your engineering team. The CLI becomes the primary interface for developers to interact with The Abyss platform—automating task creation, flow synchronization, approvals, project scaffolding, and health diagnostics.

This phase transforms governance from a manual, documentation-heavy process into an automated, CLI-driven workflow that enforces the Claudesy Protocol at every step.

---

## Core Architecture

The Abyss CLI is built as a modular, extensible command-line tool with:

- **Commander.js** framework for command parsing
- **Plugin system** for extending functionality
- **Interactive prompts** for guided workflows (Inquirer.js)
- **Configuration management** (cosmiconfig for .abyssrc)
- **Shell completion** support (bash, zsh, fish)
- **Package distribution** via npm, Homebrew, and Docker

```
abyss/
├── packages/abyss-cli/
│   ├── src/
│   │   ├── index.ts              # CLI entry point
│   │   ├── commands/
│   │   │   ├── init-task.ts      # Create HANDOFF.md
│   │   │   ├── sync-flow.ts      # Bidirectional Langflow sync
│   │   │   ├── go.ts             # GO-Gate approval workflow
│   │   │   ├── create.ts         # Scaffold apps/packages
│   │   │   ├── deploy.ts         # Deploy to Kubernetes
│   │   │   ├── status.ts         # Health diagnostics
│   │   │   └── config.ts         # Manage .abyssrc
│   │   ├── plugins/
│   │   │   ├── plugin-loader.ts
│   │   │   └── plugin-registry.ts
│   │   ├── utils/
│   │   │   ├── git.ts
│   │   │   ├── handoff-generator.ts
│   │   │   ├── crypto.ts         # Signing/verification
│   │   │   ├── logger.ts
│   │   │   └── config.ts
│   │   └── types/
│   │       └── cli.ts
│   ├── templates/               # Scaffolding templates
│   │   ├── app-nextjs/
│   │   ├── package-library/
│   │   └── app-nestjs/
│   ├── bin/
│   │   └── abyss.js            # CLI executable
│   └── package.json
```

---

## 6.1 CLI Framework & Architecture Setup

**Owner:** DevOps Lead | **Duration:** 4-5 days

### Objective

Establish the Commander.js foundation with centralized configuration, logging, and plugin infrastructure that all CLI commands extend.

### Technical Specification

#### Core Dependencies

```json
{
  "dependencies": {
    "commander": "^11.x",
    "inquirer": "^8.x",
    "chalk": "^5.x",
    "ora": "^7.x",
    "table": "^6.x",
    "cosmiconfig": "^9.x",
    "dotenv": "^16.x",
    "axios": "^1.x",
    "@octokit/rest": "^20.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/inquirer": "^8.x",
    "typescript": "^5.x",
    "ts-node": "^10.x",
    "jest": "^29.x"
  }
}
```

#### Main CLI Entry Point

```typescript
// src/index.ts
import { Command, OptionValues } from 'commander';
import chalk from 'chalk';
import { loadConfig } from './utils/config';
import { setupLogger } from './utils/logger';
import * as commands from './commands';

const pkg = require('../package.json');

export async function createCLI(): Promise<Command> {
  const program = new Command();
  
  // Global setup
  program
    .name('abyss')
    .description('🌑 The Abyss CLI - Monorepo Governance & Workflow Automation')
    .version(pkg.version)
    .option('-v, --verbose', 'Enable verbose logging', false)
    .option('--config <path>', 'Path to .abyssrc configuration file')
    .option('--dry-run', 'Show what would be done without making changes', false);
  
  // Global hook: Load config and setup logger before any command
  program.hook('preAction', async (thisCommand: Command) => {
    const options = thisCommand.optsWithGlobals() as OptionValues;
    
    // Load configuration
    const config = await loadConfig(options.config);
    
    // Setup logger
    const logger = setupLogger(options.verbose);
    
    // Attach to global context for commands
    (global as any).__abyssConfig = config;
    (global as any).__abyssLogger = logger;
  });
  
  // Register commands
  program.addCommand(commands.initTask());
  program.addCommand(commands.syncFlow());
  program.addCommand(commands.go());
  program.addCommand(commands.create());
  program.addCommand(commands.deploy());
  program.addCommand(commands.status());
  program.addCommand(commands.config());
  
  // Help text
  program.on('--help', () => {
    console.log();
    console.log(chalk.cyan('  Examples:'));
    console.log();
    console.log('    $ abyss init-task --name "Add FHIR validation"');
    console.log('    $ abyss sync-flow --flow-id patient-validator');
    console.log('    $ abyss go TASK-001 --approve');
    console.log('    $ abyss create app --template nextjs');
    console.log();
  });
  
  return program;
}

export async function main() {
  const program = await createCLI();
  await program.parseAsync(process.argv);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  });
}
```

#### Configuration Management (.abyssrc)

```typescript
// src/utils/config.ts
import { cosmiconfigSync } from 'cosmiconfig';
import { resolve } from 'path';

export interface AbyssConfig {
  organization?: string;
  email?: string;
  gitHubToken?: string;
  langflowApiUrl?: string;
  langflowApiKey?: string;
  kubernetesContext?: string;
  environment?: 'dev' | 'staging' | 'production';
  plugins?: string[];
}

export async function loadConfig(configPath?: string): Promise<AbyssConfig> {
  const explorer = cosmiconfigSync('abyss', {
    searchPlaces: [
      'package.json',
      '.abyssrc',
      '.abyssrc.json',
      '.abyssrc.yaml',
      '.abyssrc.yml',
      'abyss.config.js',
      'abyss.config.ts',
    ],
  });
  
  const result = configPath 
    ? explorer.load(configPath)
    : explorer.search();
  
  return {
    organization: process.env.ABYSS_ORG,
    email: process.env.ABYSS_EMAIL,
    gitHubToken: process.env.GITHUB_TOKEN,
    langflowApiUrl: process.env.LANGFLOW_API_URL || 'http://localhost:7860',
    langflowApiKey: process.env.LANGFLOW_API_KEY,
    kubernetesContext: process.env.K8S_CONTEXT || 'production',
    environment: (process.env.ABYSS_ENV as any) || 'dev',
    plugins: [],
    ...result?.config,
  };
}

export async function saveConfig(config: AbyssConfig, path: string = '.abyssrc.json') {
  const fs = await import('fs').then(m => m.promises);
  await fs.writeFile(path, JSON.stringify(config, null, 2));
}
```

#### Logger Setup

```typescript
// src/utils/logger.ts
import chalk from 'chalk';

export interface Logger {
  info: (msg: string) => void;
  success: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
  debug: (msg: string) => void;
}

export function setupLogger(verbose: boolean = false): Logger {
  return {
    info: (msg) => console.log(chalk.blue('ℹ'), msg),
    success: (msg) => console.log(chalk.green('✓'), msg),
    warn: (msg) => console.log(chalk.yellow('⚠'), msg),
    error: (msg) => console.log(chalk.red('✗'), msg),
    debug: (msg) => {
      if (verbose) console.log(chalk.gray('→'), msg);
    },
  };
}
```

### Success Criteria

- CLI executable runs with `abyss --help`
- Configuration loads from .abyssrc or environment variables
- Logger outputs colored, formatted messages
- Global hooks execute before every command
- Plugin system can load external commands
- Help text is comprehensive and includes examples
- Verbose mode provides debug output

### Deliverables

- CLI framework bootstrapped with Commander.js
- Configuration management system (cosmiconfig)
- Centralized logging utility
- Global context for command access
- Plugin infrastructure skeleton

---

## 6.2 Task Management - `abyss init-task`

**Owner:** DevOps Lead | **Duration:** 4-5 days

### Objective

Automate the generation of `HANDOFF.md` files with the required GO-Gate structure, versioning, and metadata to enforce governance workflows.

### Technical Specification

#### Command Implementation

```typescript
// src/commands/init-task.ts
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { generateHandoff } from '../utils/handoff-generator';
import { createAuditLog } from '../utils/audit';

export function initTask(): Command {
  return new Command('init-task')
    .alias('task')
    .description('Create a new HANDOFF.md task for the Claudesy Workflow')
    .option('-n, --name <name>', 'Task name/title')
    .option('-d, --description <desc>', 'Task description')
    .option('-a, --assignee <email>', 'Assignee email')
    .option('-p, --phase <phase>', 'Phase (1-7)')
    .option('-o, --output <path>', 'Output file path', 'docs/tasks')
    .action(async (options) => {
      const logger = (global as any).__abyssLogger;
      const config = (global as any).__abyssConfig;
      
      logger.info('🚀 Starting task creation...');
      
      // Interactive prompts if options not provided
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Task name:',
          default: options.name,
          validate: (input) => input.length > 0 || 'Name cannot be empty',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Task description:',
          default: options.description,
        },
        {
          type: 'input',
          name: 'assignee',
          message: 'Assignee email:',
          default: options.assignee || config.email,
        },
        {
          type: 'list',
          name: 'phase',
          message: 'Phase:',
          choices: Array.from({ length: 7 }, (_, i) => ({
            name: `Phase ${i + 1}`,
            value: i + 1,
          })),
          default: parseInt(options.phase) || 1,
        },
        {
          type: 'checkbox',
          name: 'labels',
          message: 'Labels:',
          choices: [
            { name: 'backend', value: 'backend' },
            { name: 'frontend', value: 'frontend' },
            { name: 'infrastructure', value: 'infrastructure' },
            { name: 'security', value: 'security' },
            { name: 'hipaa', value: 'hipaa' },
          ],
        },
      ]);
      
      // Generate HANDOFF.md
      const handoff = await generateHandoff({
        name: answers.name,
        description: answers.description,
        assignee: answers.assignee,
        phase: answers.phase,
        labels: answers.labels,
        createdBy: config.email,
      });
      
      // Write file
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path').then(m => m);
      
      const taskId = `TASK-${Date.now()}`;
      const filePath = path.join(options.output, `HANDOFF-${taskId}.md`);
      
      await fs.mkdir(options.output, { recursive: true });
      await fs.writeFile(filePath, handoff);
      
      logger.success(`✅ Task created: ${taskId}`);
      console.log(chalk.cyan(`📄 File: ${filePath}`));
      
      // Log to audit trail
      await createAuditLog({
        action: 'task_created',
        taskId,
        assignee: answers.assignee,
        phase: answers.phase,
      });
      
      console.log();
      console.log(chalk.green('Next steps:'));
      console.log(`  1. Edit the file: ${filePath}`);
      console.log(`  2. Commit to Git: git add ${filePath}`);
      console.log(`  3. Get approval: abyss go ${taskId} --approve`);
    });
}
```

#### HANDOFF.md Template Generator

```typescript
// src/utils/handoff-generator.ts
import { v4 as uuidv4 } from 'uuid';

interface HandoffParams {
  name: string;
  description: string;
  assignee: string;
  phase: number;
  labels: string[];
  createdBy: string;
}

export async function generateHandoff(params: HandoffParams): Promise<string> {
  const taskId = `TASK-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  return `---
task_id: ${taskId}
title: ${params.name}
phase: ${params.phase}
assignee: ${params.assignee}
created_by: ${params.createdBy}
created_at: ${timestamp}
approved_by: null
approved_at: null
labels:
${params.labels.map(l => `  - ${l}`).join('\n')}
status: pending
estimate_hours: null
---

# ${params.name}

## Description
${params.description}

## Objectives
- [ ] Primary objective
- [ ] Secondary objective

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Plan
### Step 1: Setup
Describe the setup phase.

### Step 2: Development
Describe the development phase.

### Step 3: Testing
Describe the testing phase.

### Step 4: Deployment
Describe the deployment phase.

## Dependencies
- [ ] Dependency 1
- [ ] Dependency 2

## Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| Risk 1 | Mitigation 1 |
| Risk 2 | Mitigation 2 |

## Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2

## Sign-Off
- **Assignee**: ${params.assignee}
- **Created**: ${timestamp}
- **Status**: Pending Approval
- **Next Step**: Request approval with \`abyss go ${taskId} --approve\`

---
*This HANDOFF.md is part of the Claudesy Workflow. It requires approval from the Chief Engineer before proceeding to implementation.*
`;
}
```

### Success Criteria

- Interactive prompts guide task creation
- Generated HANDOFF.md includes all required YAML frontmatter
- Task ID generated and tracked
- Audit log created for task creation
- Templates support customization via flags
- Output file created in correct location
- Validation ensures required fields are present

### Deliverables

- `abyss init-task` command fully functional
- HANDOFF.md template with Claudesy metadata
- Audit logging for task creation
- Interactive prompt system

---

## 6.3 Flow Synchronization - `abyss sync-flow`

**Owner:** DevOps Lead | **Duration:** 4-5 days

### Objective

Enable bidirectional synchronization between Langflow UI and version-controlled Git repository, allowing flows to be edited visually and synced back to Git.

### Technical Specification

#### Command Implementation

```typescript
// src/commands/sync-flow.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { syncFlowFromLangflow, syncFlowToLangflow } from '../utils/langflow-sync';

export function syncFlow(): Command {
  return new Command('sync-flow')
    .description('Synchronize Langflow flows with Git repository')
    .option('-f, --flow-id <id>', 'Langflow flow ID')
    .option('--direction <dir>', 'Sync direction: langflow-to-git or git-to-langflow', 'langflow-to-git')
    .option('--output <path>', 'Output path for Git flows', 'flows/definitions')
    .option('--force', 'Force overwrite without confirmation', false)
    .action(async (options) => {
      const logger = (global as any).__abyssLogger;
      const config = (global as any).__abyssConfig;
      
      if (!options.flowId) {
        logger.error('Flow ID required. Use --flow-id');
        process.exit(1);
      }
      
      logger.info(`🔄 Syncing flow: ${options.flowId} (${options.direction})`);
      
      try {
        if (options.direction === 'langflow-to-git') {
          const result = await syncFlowFromLangflow({
            flowId: options.flowId,
            outputPath: options.output,
            force: options.force,
            langflowUrl: config.langflowApiUrl,
            langflowApiKey: config.langflowApiKey,
          });
          
          logger.success(`✅ Flow synced from Langflow`);
          console.log(chalk.cyan(`📁 Saved to: ${result.filePath}`));
          console.log(chalk.cyan(`📦 Flow version: ${result.version}`));
        } else {
          const result = await syncFlowToLangflow({
            flowId: options.flowId,
            gitPath: options.output,
            langflowUrl: config.langflowApiUrl,
            langflowApiKey: config.langflowApiKey,
          });
          
          logger.success(`✅ Flow synced to Langflow`);
          console.log(chalk.cyan(`🔗 Updated flow: ${result.flowId}`));
        }
      } catch (error) {
        logger.error(`Failed to sync flow: ${error.message}`);
        process.exit(1);
      }
    });
}
```

#### Langflow Sync Utilities

```typescript
// src/utils/langflow-sync.ts
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface FlowDefinition {
  id: string;
  name: string;
  version: string;
  nodes: any[];
  edges: any[];
  metadata: Record<string, unknown>;
}

export async function syncFlowFromLangflow(options: {
  flowId: string;
  outputPath: string;
  force: boolean;
  langflowUrl: string;
  langflowApiKey: string;
}): Promise<{ filePath: string; version: string }> {
  // Fetch flow from Langflow API
  const response = await axios.get(
    `${options.langflowUrl}/api/v1/flows/${options.flowId}`,
    {
      headers: {
        'Authorization': `Bearer ${options.langflowApiKey}`,
      },
    }
  );
  
  const flow: FlowDefinition = response.data;
  
  // Validate flow
  if (!flow.id || !flow.nodes || !flow.edges) {
    throw new Error('Invalid Langflow response');
  }
  
  // Create output directory
  await fs.mkdir(options.outputPath, { recursive: true });
  
  // Write flow to Git
  const filePath = join(options.outputPath, `${flow.id}.json`);
  const content = JSON.stringify(flow, null, 2);
  
  await fs.writeFile(filePath, content);
  
  return {
    filePath,
    version: flow.version || '1.0.0',
  };
}

export async function syncFlowToLangflow(options: {
  flowId: string;
  gitPath: string;
  langflowUrl: string;
  langflowApiKey: string;
}): Promise<{ flowId: string }> {
  // Read flow from Git
  const filePath = join(options.gitPath, `${options.flowId}.json`);
  const content = await fs.readFile(filePath, 'utf-8');
  const flow: FlowDefinition = JSON.parse(content);
  
  // Push to Langflow API
  await axios.put(
    `${options.langflowUrl}/api/v1/flows/${options.flowId}`,
    flow,
    {
      headers: {
        'Authorization': `Bearer ${options.langflowApiKey}`,
      },
    }
  );
  
  return { flowId: options.flowId };
}
```

### Success Criteria

- Bidirectional sync works (Langflow ↔ Git)
- Flow versioning preserved
- Conflict detection for concurrent edits
- Audit trail logged for all syncs
- Compression for large flows
- Automatic retry on API failures
- Validation of flow structure before sync

### Deliverables

- `abyss sync-flow` command fully functional
- Langflow API integration wrapper
- Bidirectional sync logic
- Conflict resolution mechanism

---

## 6.4 GO-Gate Approval Workflow - `abyss go`

**Owner:** DevOps Lead | **Duration:** 3-4 days

### Objective

Implement the command-line interface for approving or rejecting tasks with cryptographic signatures and HIPAA-compliant audit trail.

### Technical Specification

#### Command Implementation

```typescript
// src/commands/go.ts
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { approveTask, rejectTask } from '../utils/go-gate';
import { signApproval, verifySignature } from '../utils/crypto';

export function go(): Command {
  return new Command('go')
    .description('Approve or reject a task via GO-Gate workflow')
    .argument('<taskId>', 'Task ID (e.g., TASK-001)')
    .option('-a, --approve', 'Approve the task')
    .option('-r, --reject', 'Reject the task')
    .option('--reason <text>', 'Approval/rejection reason')
    .action(async (taskId: string, options) => {
      const logger = (global as any).__abyssLogger;
      const config = (global as any).__abyssConfig;
      
      // Validate task ID
      if (!taskId.match(/^TASK-\d+$/)) {
        logger.error('Invalid task ID format. Expected: TASK-001');
        process.exit(1);
      }
      
      // Determine action
      if (!options.approve && !options.reject) {
        const action = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'Action:',
            choices: [
              { name: 'Approve', value: 'approve' },
              { name: 'Reject', value: 'reject' },
            ],
          },
        ]);
        options.approve = action.action === 'approve';
      }
      
      const action = options.approve ? 'approve' : 'reject';
      
      // Get reason if not provided
      let reason = options.reason;
      if (!reason) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'reason',
            message: `Reason for ${action}ing:`,
            validate: (input) => input.length > 0 || 'Reason cannot be empty',
          },
        ]);
        reason = answers.reason;
      }
      
      logger.info(`🔐 ${options.approve ? 'Approving' : 'Rejecting'} task: ${taskId}`);
      
      try {
        // Sign approval with private key
        const signature = await signApproval({
          taskId,
          action,
          approver: config.email,
          reason,
          timestamp: new Date().toISOString(),
        });
        
        // Update HANDOFF.md
        if (options.approve) {
          await approveTask({
            taskId,
            approver: config.email,
            signature,
            reason,
          });
          logger.success(`✅ Task approved: ${taskId}`);
        } else {
          await rejectTask({
            taskId,
            rejector: config.email,
            signature,
            reason,
          });
          logger.success(`✅ Task rejected: ${taskId}`);
        }
        
        console.log(chalk.cyan(`📋 Signature: ${signature.substring(0, 20)}...`));
        console.log(chalk.cyan(`✍️  Approved by: ${config.email}`));
        
      } catch (error) {
        logger.error(`Failed to ${action} task: ${error.message}`);
        process.exit(1);
      }
    });
}
```

#### Cryptographic Signing

```typescript
// src/utils/crypto.ts
import { createSign, createVerify, generateKeyPairSync } from 'crypto';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const KEY_PATH = join(homedir(), '.abyss', 'keys');

export interface SignaturePayload {
  taskId: string;
  action: 'approve' | 'reject';
  approver: string;
  reason: string;
  timestamp: string;
}

export async function signApproval(payload: SignaturePayload): Promise<string> {
  // Load private key
  const keyPath = join(KEY_PATH, 'private.pem');
  const privateKey = await fs.readFile(keyPath, 'utf-8');
  
  // Sign payload
  const sign = createSign('sha256');
  sign.update(JSON.stringify(payload));
  const signature = sign.sign(privateKey, 'hex');
  
  return signature;
}

export async function verifySignature(
  payload: SignaturePayload,
  signature: string,
  publicKeyPath: string
): Promise<boolean> {
  const publicKey = await fs.readFile(publicKeyPath, 'utf-8');
  
  const verify = createVerify('sha256');
  verify.update(JSON.stringify(payload));
  
  return verify.verify(publicKey, signature, 'hex');
}

export async function generateKeyPair(): Promise<void> {
  await fs.mkdir(KEY_PATH, { recursive: true });
  
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  
  await fs.writeFile(join(KEY_PATH, 'public.pem'), publicKey);
  await fs.writeFile(join(KEY_PATH, 'private.pem'), privateKey);
}
```

#### GO-Gate Utilities

```typescript
// src/utils/go-gate.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

export async function approveTask(options: {
  taskId: string;
  approver: string;
  signature: string;
  reason: string;
}): Promise<void> {
  // Find HANDOFF.md
  const filePath = await findHandoffFile(options.taskId);
  
  // Read current content
  const content = await fs.readFile(filePath, 'utf-8');
  const [frontmatter, body] = content.split('---').slice(1, 3);
  
  // Parse YAML
  const metadata = yaml.load(frontmatter) as any;
  
  // Update metadata
  metadata.approved_by = options.approver;
  metadata.approved_at = new Date().toISOString();
  metadata.status = 'approved';
  metadata.approval_signature = options.signature;
  metadata.approval_reason = options.reason;
  
  // Reconstruct file
  const newFrontmatter = yaml.dump(metadata);
  const newContent = `---\n${newFrontmatter}---\n${body}`;
  
  await fs.writeFile(filePath, newContent);
}

export async function rejectTask(options: {
  taskId: string;
  rejector: string;
  signature: string;
  reason: string;
}): Promise<void> {
  // Similar to approveTask but set status to 'rejected'
  const filePath = await findHandoffFile(options.taskId);
  const content = await fs.readFile(filePath, 'utf-8');
  const [frontmatter, body] = content.split('---').slice(1, 3);
  
  const metadata = yaml.load(frontmatter) as any;
  
  metadata.rejected_by = options.rejector;
  metadata.rejected_at = new Date().toISOString();
  metadata.status = 'rejected';
  metadata.rejection_reason = options.reason;
  
  const newFrontmatter = yaml.dump(metadata);
  const newContent = `---\n${newFrontmatter}---\n${body}`;
  
  await fs.writeFile(filePath, newContent);
}

async function findHandoffFile(taskId: string): Promise<string> {
  const docsPath = 'docs/tasks';
  const files = await fs.readdir(docsPath);
  
  const handoffFile = files.find(f => f.includes(taskId));
  if (!handoffFile) {
    throw new Error(`Task not found: ${taskId}`);
  }
  
  return join(docsPath, handoffFile);
}
```

### Success Criteria

- Cryptographic signatures prevent tampering
- Audit trail records all approvals/rejections
- Signatures verify correctly
- HANDOFF.md updated atomically
- Public keys distributed to team
- Approval reason logged for compliance
- Command blocks invalid task IDs

### Deliverables

- `abyss go` command fully functional
- RSA-based cryptographic signing
- HANDOFF.md metadata updates
- Audit trail logging

---

## 6.5 Scaffolding Engine - `abyss create`

**Owner:** DevOps Lead | **Duration:** 5-6 days

### Objective

Generate new applications and packages with Plop.js templates that enforce monorepo standards, TypeScript configuration, and Claudesy governance.

### Technical Specification

#### Command Implementation

```typescript
// src/commands/create.ts
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { scaffoldApp, scaffoldPackage } from '../utils/scaffolder';

export function create(): Command {
  return new Command('create')
    .description('Scaffold a new app or package from templates')
    .argument('<type>', 'Type: app or package')
    .action(async (type: string) => {
      const logger = (global as any).__abyssLogger;
      
      if (!['app', 'package'].includes(type)) {
        logger.error('Type must be "app" or "package"');
        process.exit(1);
      }
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: `${type} name (kebab-case):`,
          validate: (input) => /^[a-z0-9-]+$/.test(input) || 'Use kebab-case',
        },
        ...(type === 'app' ? [
          {
            type: 'list',
            name: 'template',
            message: 'Template:',
            choices: [
              { name: 'Next.js (React)', value: 'nextjs' },
              { name: 'NestJS (Backend)', value: 'nestjs' },
              { name: 'CLI Tool', value: 'cli' },
            ],
          },
        ] : [
          {
            type: 'list',
            name: 'template',
            message: 'Template:',
            choices: [
              { name: 'React Library', value: 'react-library' },
              { name: 'Utilities Library', value: 'utils-library' },
              { name: 'Backend Library', value: 'backend-library' },
            ],
          },
        ]),
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
        },
      ]);
      
      logger.info(`🏗️  Creating ${type}: ${answers.name}`);
      
      try {
        if (type === 'app') {
          await scaffoldApp({
            name: answers.name,
            template: answers.template,
            description: answers.description,
          });
        } else {
          await scaffoldPackage({
            name: answers.name,
            template: answers.template,
            description: answers.description,
          });
        }
        
        logger.success(`✅ ${type} created: ${answers.name}`);
        console.log(chalk.cyan(`📁 Location: ${type === 'app' ? 'apps' : 'packages'}/${answers.name}`));
      } catch (error) {
        logger.error(`Failed to create ${type}: ${error.message}`);
        process.exit(1);
      }
    });
}
```

#### Scaffolder Utilities (using Plop)

```typescript
// src/utils/scaffolder.ts
import { NodePlopAPI } from 'plop';
import { join } from 'path';
import { execSync } from 'child_process';

export async function scaffoldApp(options: {
  name: string;
  template: string;
  description: string;
}): Promise<void> {
  const templatesPath = join(__dirname, '../templates');
  const outputPath = `apps/${options.name}`;
  
  const files = getTemplateFiles(options.template, 'app');
  
  // Copy template files
  for (const file of files) {
    const sourcePath = join(templatesPath, `app-${options.template}`, file);
    const targetPath = join(outputPath, file);
    
    // Interpolate template variables
    const content = await readAndInterpolate(sourcePath, {
      appName: options.name,
      description: options.description,
      timestamp: new Date().toISOString(),
    });
    
    await writeFile(targetPath, content);
  }
  
  // Run pnpm install
  execSync('pnpm install', { cwd: outputPath, stdio: 'inherit' });
  
  // Initialize git
  execSync('git add .', { cwd: outputPath });
}

export async function scaffoldPackage(options: {
  name: string;
  template: string;
  description: string;
}): Promise<void> {
  const templatesPath = join(__dirname, '../templates');
  const outputPath = `packages/${options.name}`;
  
  const files = getTemplateFiles(options.template, 'package');
  
  for (const file of files) {
    const sourcePath = join(templatesPath, `package-${options.template}`, file);
    const targetPath = join(outputPath, file);
    
    const content = await readAndInterpolate(sourcePath, {
      packageName: `@the-abyss/${options.name}`,
      description: options.description,
      timestamp: new Date().toISOString(),
    });
    
    await writeFile(targetPath, content);
  }
  
  execSync('pnpm install', { cwd: outputPath, stdio: 'inherit' });
}

function getTemplateFiles(template: string, type: 'app' | 'package'): string[] {
  return [
    'package.json',
    'README.md',
    'tsconfig.json',
    '.eslintrc.js',
    'src/index.ts',
    'src/__tests__/index.test.ts',
  ];
}

async function readAndInterpolate(filePath: string, vars: Record<string, string>): Promise<string> {
  let content = await fs.readFile(filePath, 'utf-8');
  
  // Replace {{variable}} placeholders
  for (const [key, value] of Object.entries(vars)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return content;
}
```

### Success Criteria

- New apps/packages follow monorepo structure
- TypeScript config inherited from config-typescript
- ESLint config inherited from config-eslint
- package.json properly configured for workspace
- README with setup instructions
- Pre-commit hooks installed
- Tests boilerplate included

### Deliverables

- `abyss create` command fully functional
- 5+ scaffolding templates (Next.js, NestJS, React lib, etc.)
- Template variable interpolation
- Automated workspace integration

---

## 6.6 Monorepo Health & Diagnostics - `abyss status`

**Owner:** DevOps Lead | **Duration:** 3-4 days

### Objective

Provide real-time health checks for workspace integrity, dependency conflicts, governance compliance, and CI/CD status.

### Technical Specification

#### Command Implementation

```typescript
// src/commands/status.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { Table } from 'table';
import {
  checkWorkspaceIntegrity,
  checkDependencies,
  checkGovernance,
  checkCI,
} from '../utils/health-check';

export function status(): Command {
  return new Command('status')
    .description('Check monorepo health and diagnostics')
    .option('--detailed', 'Show detailed health information', false)
    .action(async (options) => {
      const logger = (global as any).__abyssLogger;
      
      logger.info('🏥 Running monorepo health check...');
      
      try {
        const [workspace, deps, gov, ci] = await Promise.all([
          checkWorkspaceIntegrity(),
          checkDependencies(),
          checkGovernance(),
          checkCI(),
        ]);
        
        // Display summary
        console.log();
        console.log(chalk.bold('📊 Monorepo Health Summary'));
        console.log();
        
        const summaryTable = [
          ['Component', 'Status', 'Details'],
          [
            'Workspace',
            workspace.healthy ? chalk.green('✓') : chalk.red('✗'),
            workspace.message,
          ],
          [
            'Dependencies',
            deps.healthy ? chalk.green('✓') : chalk.red('✗'),
            `${deps.conflicts} conflicts`,
          ],
          [
            'Governance',
            gov.healthy ? chalk.green('✓') : chalk.red('✗'),
            `${gov.unapprovedTasks} unapproved tasks`,
          ],
          [
            'CI/CD',
            ci.healthy ? chalk.green('✓') : chalk.red('✗'),
            ci.lastStatus,
          ],
        ];
        
        console.log(Table(summaryTable));
        
        if (options.detailed) {
          console.log();
          console.log(chalk.bold('📋 Detailed Health Report'));
          console.log(chalk.cyan('Workspace:'), workspace.details);
          console.log(chalk.cyan('Dependencies:'), deps.details);
          console.log(chalk.cyan('Governance:'), gov.details);
        }
        
        // Exit code based on health
        if (!workspace.healthy || !deps.healthy || !gov.healthy) {
          process.exit(1);
        }
        
      } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        process.exit(1);
      }
    });
}
```

#### Health Check Utilities

```typescript
// src/utils/health-check.ts
import { execSync } from 'child_process';
import { promises as fs } from 'fs';

export async function checkWorkspaceIntegrity(): Promise<HealthCheckResult> {
  try {
    // Check pnpm-workspace.yaml
    const workspace = await fs.readFile('pnpm-workspace.yaml', 'utf-8');
    
    // Check all packages are listed
    const packages = workspace.match(/packages\/\*|apps\/\*/);
    
    return {
      healthy: !!packages,
      message: 'Workspace configured correctly',
      details: `Found ${packages?.length || 0} workspaces`,
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'Missing or invalid pnpm-workspace.yaml',
      details: error.message,
    };
  }
}

export async function checkDependencies(): Promise<HealthCheckResult> {
  try {
    const output = execSync('pnpm audit --json', { encoding: 'utf-8' });
    const audit = JSON.parse(output);
    
    const vulnerabilities = audit.vulnerabilities || {};
    const criticalCount = Object.values(vulnerabilities).filter(
      (v: any) => v.severity === 'critical'
    ).length;
    
    return {
      healthy: criticalCount === 0,
      message: criticalCount === 0 ? 'No vulnerabilities' : `${criticalCount} critical vulnerabilities`,
      conflicts: criticalCount,
      details: `Dependencies audited successfully`,
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'Dependency audit failed',
      conflicts: -1,
      details: error.message,
    };
  }
}

export async function checkGovernance(): Promise<HealthCheckResult> {
  try {
    const tasks = await fs.readdir('docs/tasks');
    const unapproved = tasks.filter((f) => {
      // Check if task has approved_by in frontmatter
      return !f.includes('approved');
    }).length;
    
    return {
      healthy: unapproved === 0,
      message: unapproved === 0 ? 'All tasks approved' : `${unapproved} unapproved tasks`,
      unapprovedTasks: unapproved,
      details: `${tasks.length} total tasks`,
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'Governance check failed',
      unapprovedTasks: -1,
      details: error.message,
    };
  }
}

export async function checkCI(): Promise<HealthCheckResult> {
  try {
    const output = execSync('gh run list --limit 1 --json status', {
      encoding: 'utf-8',
    });
    
    const runs = JSON.parse(output);
    const lastRun = runs[0];
    
    return {
      healthy: lastRun.status === 'completed',
      message: `Last CI run: ${lastRun.status}`,
      lastStatus: lastRun.status,
      details: `Check GitHub Actions for details`,
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'CI check failed (GitHub CLI not available?)',
      lastStatus: 'unknown',
      details: error.message,
    };
  }
}

interface HealthCheckResult {
  healthy: boolean;
  message: string;
  details: string;
  [key: string]: any;
}
```

### Success Criteria

- All health checks complete in <30 seconds
- Detailed output available with --detailed flag
- Exit code reflects overall health status
- Actionable error messages guide remediation
- Integration with GitHub CLI for CI status
- Dependency audit from pnpm
- Governance task validation

### Deliverables

- `abyss status` command fully functional
- 4+ health check modules
- Formatted output tables
- Integration with external tools (pnpm, gh)

---

## 6.7 Plugin System & Distribution

**Owner:** DevOps Lead | **Duration:** 3-4 days

### Objective

Establish a plugin system for extending CLI functionality and distribute the CLI via npm, Homebrew, and Docker.

### Technical Specification

#### Plugin System

```typescript
// src/plugins/plugin-loader.ts
import { Command } from 'commander';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface AbyssPlugin {
  name: string;
  version: string;
  commands: () => Command[];
}

export async function loadPlugins(pluginNames: string[]): Promise<AbyssPlugin[]> {
  const plugins: AbyssPlugin[] = [];
  
  for (const pluginName of pluginNames) {
    try {
      // Try to load from node_modules
      const plugin = require(`abyss-plugin-${pluginName}`);
      plugins.push(plugin.default || plugin);
    } catch (error) {
      console.warn(`⚠️  Failed to load plugin: ${pluginName}`);
    }
  }
  
  return plugins;
}

export async function registerPlugins(program: Command, plugins: AbyssPlugin[]): Promise<void> {
  for (const plugin of plugins) {
    const commands = plugin.commands();
    for (const command of commands) {
      program.addCommand(command);
    }
  }
}
```

#### Distribution (npm)

```json
{
  "name": "@the-abyss/cli",
  "version": "1.0.0",
  "description": "🌑 The Abyss CLI - Monorepo Governance & Workflow Automation",
  "bin": {
    "abyss": "bin/abyss.js"
  },
  "files": [
    "bin/",
    "dist/",
    "templates/"
  ],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "publish": "npm publish"
  }
}
```

#### Homebrew Formula

```ruby
# Formula/abyss.rb
class Abyss < Formula
  desc "🌑 The Abyss CLI - Monorepo Governance & Workflow Automation"
  homepage "https://github.com/your-org/the-abyss"
  url "https://github.com/your-org/the-abyss/releases/download/v1.0.0/abyss-v1.0.0.tar.gz"
  sha256 "abc123..."
  license "MIT"
  
  depends_on "node@20"
  
  def install
    bin.install "abyss"
  end
  
  test do
    system "#{bin}/abyss", "--version"
  end
end
```

#### Docker Distribution

```dockerfile
# infrastructure/docker/abyss-cli.dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

COPY bin/ ./bin/
COPY dist/ ./dist/
COPY templates/ ./templates/

RUN chmod +x /app/bin/abyss.js

ENTRYPOINT ["/app/bin/abyss.js"]
```

#### Shell Completion Script

```bash
# completions/abyss.bash
_abyss_completions() {
  local cur prev
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  
  local commands="init-task sync-flow go create deploy status config"
  
  if [[ ${cur} == -* ]]; then
    COMPREPLY=($(compgen -W "--verbose --config --dry-run --help" -- ${cur}))
    return 0
  fi
  
  if [[ ${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=($(compgen -W "${commands}" -- ${cur}))
    return 0
  fi
}

complete -F _abyss_completions abyss
```

### Success Criteria

- CLI publishable to npm
- Homebrew formula installs CLI correctly
- Docker image <50MB
- Shell completion works (bash, zsh, fish)
- Plugins load dynamically
- >90% of developers adopt CLI
- Zero breaking changes between versions

### Deliverables

- Published npm package (@the-abyss/cli)
- Homebrew formula
- Docker image published to GitHub Container Registry
- Shell completion scripts
- Plugin system documentation

---

## **Phase 6 Implementation Timeline**

| Sub-Task | Component | Duration | Dependencies |
| --- | --- | --- | --- |
| **6.1** | CLI Framework & Architecture | 4-5 days | Phase 1-2 complete |
| **6.2** | Task Management (`init-task`) | 4-5 days | 6.1 complete |
| **6.3** | Flow Synchronization (`sync-flow`) | 4-5 days | 6.1, Phase 4 complete |
| **6.4** | GO-Gate Approval (`go`) | 3-4 days | 6.2, Phase 2 complete |
| **6.5** | Scaffolding Engine (`create`) | 5-6 days | 6.1 complete |
| **6.6** | Monorepo Health (`status`) | 3-4 days | 6.1 complete |
| **6.7** | Plugin System & Distribution | 3-4 days | 6.1-6.6 complete |

**Total Estimated Timeline: 5–6 weeks**

---

## **Success Metrics for Phase 6**

### **Functional Metrics**

- 7 CLI commands fully operational
- All commands have help text and examples
- Interactive prompts guide users through workflows
- Error messages are actionable and helpful

### **Developer Experience**

- New developers can use CLI within 5 minutes
- >90% adoption rate among engineering team
- <2 minutes to scaffold a new application
- Zero manual `git` commands needed for governance

### **Distribution & Installation**

- `npm install -g @the-abyss/cli` works
- `brew install abyss` installs latest version
- `docker run ghcr.io/the-abyss/cli` executes commands
- Shell completion available for bash, zsh, fish

### **Security & Compliance**

- Cryptographic signatures prevent tampering
- All operations logged to audit trail
- Private keys stored securely (~/.abyss/keys)
- Plugin system validates plugin signatures

---

## **Next Phase Preview**

With Phase 6 complete, the Abyss CLI becomes the primary interface for your entire platform. Developers interact with the platform through:

```bash
# Daily workflows
abyss init-task --name "Add patient endpoint"
abyss sync-flow --flow-id patient-validator
abyss go TASK-001 --approve
abyss create app --template nextjs
abyss deploy --env staging
abyss status --detailed
```

**Phase 7: CI/CD, GitOps & Containerization** will integrate this CLI into GitHub Actions, ArgoCD, and Kubernetes, creating a fully automated deployment pipeline where the CLI is the orchestration layer.