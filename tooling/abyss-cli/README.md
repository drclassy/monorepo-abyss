# Abyss CLI

Internal CLI for The Abyss monorepo development.

## Installation

```bash
pnpm install
```

## Usage

### Initialize a new task

```bash
pnpm abyss init-task "Implement FHIR validation"
```

This creates a new session folder with HANDOFF.md template.

### Add GO approval

```bash
pnpm abyss go .agent/sessions/SESSION-2026-03-30-my-task --by "Chief" --comments "Looks good"
```

### Sync Langflow

```bash
pnpm abyss sync-flow ~/Downloads/flow.json --name "diagnosis-flow" --version "1.0.0"
```

### Create new app

```bash
pnpm abyss create app my-app --domain internal
```

### Check status

```bash
pnpm abyss status
```

## Commands

| Command                | Description                           |
| ---------------------- | ------------------------------------- |
| `init-task <title>`    | Initialize a new task with HANDOFF.md |
| `go <sessionPath>`     | Add GO approval to a HANDOFF.md       |
| `sync-flow <flowPath>` | Sync a Langflow JSON file             |
| `create app <name>`    | Create a new application              |
| `status`               | Show monorepo health status           |

---

© 2026 Sentra AI
