# @the-abyss/integration-bridge

External service integration layer for the Abyss monorepo. Syncs session
handoffs to Notion databases and updates Linear ticket status. Used by
automation scripts and the platform orchestrator.

## Install

```bash
pnpm add @the-abyss/integration-bridge
```

## Environment variables

| Variable             | Description               |
| -------------------- | ------------------------- |
| `NOTION_API_KEY`     | Notion integration token  |
| `NOTION_DATABASE_ID` | Target Notion database ID |
| `LINEAR_API_KEY`     | Linear API key            |

## Usage

```typescript
import { AbyssIntegrationBridge } from '@the-abyss/integration-bridge'

const bridge = new AbyssIntegrationBridge()

// Sync a session handoff to Notion
await bridge.syncHandoffToNotion('.agent/sessions/2026-04-15')

// Update a Linear ticket status
await bridge.syncToLinear('ENG-123', 'GO APPROVED')
```

## Exports

| Export                   | Type  | Description                        |
| ------------------------ | ----- | ---------------------------------- |
| `AbyssIntegrationBridge` | class | Notion + Linear integration client |
