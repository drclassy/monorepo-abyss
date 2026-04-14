# @the-abyss/artificial-core

Multi-model LLM orchestration and consensus engine for the Abyss stack. Routes requests across multiple AI providers and aggregates responses via consensus voting. Used by `sentra-assist` and the platform orchestrator.

## Install

```bash
pnpm add @the-abyss/artificial-core
```

## Usage

```typescript
import { AiCoreClient, getConsensus, PromptManager } from '@the-abyss/artificial-core'

const client = new AiCoreClient({ providers: ['gemini', 'openai'] })
const pm = new PromptManager()

const prompt = pm.render('diagnosis', { symptoms: 'fever, cough' })
const result = await getConsensus(client, prompt, { minAgreement: 0.7 })
```

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `AiCoreClient` | class | Multi-provider LLM client |
| `getConsensus` | function | Run a prompt across providers and return a consensus result |
| `PromptManager` | class | Template-based prompt builder with versioning |
| `ModelProvider` | type | Supported model provider identifiers |
| `ModelResponse` | type | Normalized LLM response shape |
| `ConsensusResult` | type | Consensus output with agreement score and merged response |
