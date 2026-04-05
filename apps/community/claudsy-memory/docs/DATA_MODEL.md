# Data Model

## Overview

Claudsy Memory stores facts in JSONL format categorized by type, with SQLite indexing for fast search.

## Fact Structure

Each fact is a JSON object with the following fields:

| Field        | Type   | Description                             | Required |
| ------------ | ------ | --------------------------------------- | -------- |
| `id`         | string | Unique identifier                       | Yes      |
| `category`   | string | semantic/episodic/procedural/preference | Yes      |
| `fact`       | string | The fact content                        | Yes      |
| `importance` | float  | Importance score (0.0-1.0)              | Yes      |
| `status`     | string | active/consolidated/forgotten           | Yes      |
| `source`     | string | Source identifier                       | Yes      |
| `tags`       | array  | List of tags                            | No       |
| `created`    | string | ISO timestamp                           | Yes      |
| `updated_at` | string | ISO timestamp                           | Yes      |

## Storage Layout

```
~/.claudesy/agents/{agent_name}/
├── extracted/
│   ├── semantic.jsonl
│   ├── episodic.jsonl
│   ├── procedural.jsonl
│   └── preference.jsonl
├── consolidated/
│   └── {category}.jsonl
├── sessions/
│   └── YYYY-MM-DD.md
├── archive/
│   └── archive_YYYY-MM.zip
└── memory.db
```

## Categories

- **Semantic**: Factual knowledge (e.g., "Python is a programming language")
- **Episodic**: Event-based memories (e.g., "User asked about API on 2026-03-25")
- **Procedural**: How-to knowledge (e.g., "To install, run pip install")
- **Preference**: User preferences (e.g., "User prefers dark mode")

## SQLite Index

Facts are indexed in SQLite for fast search with the following schema:

```sql
CREATE TABLE facts_index (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    fact TEXT NOT NULL,
    normalized_fact TEXT NOT NULL,
    importance REAL NOT NULL,
    status TEXT NOT NULL,
    source TEXT NOT NULL,
    tags_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```
