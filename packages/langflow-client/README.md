# @the-abyss/langflow-client

HTTP client for the Langflow AI orchestration server. Handles flow execution
with retry + exponential backoff, shadow mode execution, and Zod-validated
responses. Used by the platform orchestrator sagas.

## Install

```bash
pnpm add @the-abyss/langflow-client
```

## Environment variables

| Variable           | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `LANGFLOW_API_URL` | Langflow server base URL (default: `http://localhost:7860`) |
| `LANGFLOW_API_KEY` | Bearer token for authenticated Langflow instances           |

## Usage

```typescript
import { getFlowClient } from '@the-abyss/langflow-client'

const client = getFlowClient()

// Execute a flow
const { output, metadata } = await client.runFlow('my-flow-id', {
  input_value: 'Patient presents with fever and cough',
})

// Shadow mode — execute without surfacing the result (for A/B comparison)
const meta = await client.runFlowShadow('my-flow-id', { input_value: '...' })
```

## Exports

| Export                  | Type       | Description                                          |
| ----------------------- | ---------- | ---------------------------------------------------- |
| `AbyssFlowClient`       | class      | Langflow HTTP client with retry and shadow mode      |
| `getFlowClient`         | function   | Singleton factory — returns a shared client instance |
| `resetFlowClient`       | function   | Reset the singleton (useful in tests)                |
| `FlowInputSchema`       | Zod schema | Input payload validation schema                      |
| `FlowOutputSchema`      | Zod schema | Output response validation schema                    |
| `FlowMetadataSchema`    | Zod schema | Execution metadata validation schema                 |
| `FlowInput`             | type       | Inferred from `FlowInputSchema`                      |
| `FlowOutput`            | type       | Inferred from `FlowOutputSchema`                     |
| `FlowMetadata`          | type       | Inferred from `FlowMetadataSchema`                   |
| `AbyssFlowClientConfig` | type       | Constructor configuration options                    |
