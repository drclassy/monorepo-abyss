# @the-abyss/vector-store

RAGOps and vector search abstraction for the Abyss monorepo. Wraps the underlying vector database (e.g., pgvector) with a consistent query interface used by `sentra-assist` for context retrieval.

## Install

```bash
pnpm add @the-abyss/vector-store
```

## Usage

```typescript
import { createVectorStore } from '@the-abyss/vector-store'

const store = createVectorStore({ connectionUrl: process.env.VECTOR_DB_URL })

// Upsert a document
await store.upsert({ id: 'doc-1', content: 'Clinical note...', embedding: [...] })

// Similarity search
const results = await store.query({ embedding: queryEmbedding, topK: 5 })
```

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `VectorStore` | class | Vector database client with upsert, query, delete |
| `createVectorStore` | function | Factory — returns a configured `VectorStore` instance |
| `VectorDocument` | type | Document shape: id, content, embedding, metadata |
| `QueryResult` | type | Search result shape with score and document |
| `VectorStoreConfig` | type | Connection and index configuration |
