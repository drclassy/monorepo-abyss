# API Reference

## ClaudesyEngine

The main engine class for memory operations.

### Initialization

```python
from claudesy_memory import ClaudesyEngine

engine = ClaudesyEngine()  # Uses default config
```

### Methods

#### extract_from_text(agent_name: str, session_text: str, source: str) -> list[dict]

Extract facts from session text.

**Parameters:**

- `agent_name`: Name of the agent
- `session_text`: Raw session text
- `source`: Source identifier

**Returns:** List of extracted fact dictionaries

#### consolidate(agent_name: str) -> dict

Apply memory consolidation with decay algorithm.

**Parameters:**

- `agent_name`: Name of the agent

**Returns:** Consolidation summary

#### search(query: str, agent_name: str, category: str, status: str, limit: int) -> list[dict]

Search facts by query.

**Parameters:**

- `query`: Search query
- `agent_name`: Agent name (optional)
- `category`: Fact category filter (optional)
- `status`: Status filter (optional)
- `limit`: Max results (default 10)

**Returns:** List of matching facts

#### boot_context(agent_name: str) -> str

Generate boot context for agent startup.

**Parameters:**

- `agent_name`: Agent name

**Returns:** Formatted context string

## Data Structures

### Fact Dictionary

```json
{
  "id": "unique_id",
  "category": "semantic|episodic|procedural|preference",
  "fact": "The extracted fact text",
  "importance": 0.8,
  "status": "active|consolidated|forgotten",
  "source": "session_file",
  "tags": ["tag1", "tag2"],
  "created": "2026-03-25T18:30:00",
  "updated_at": "2026-03-25T18:30:00"
}
```
