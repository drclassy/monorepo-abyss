# Claudsy Memory — Architecture Overview

## System Context

Claudsy Memory is a memory system for AI agents that extracts, consolidates, and stores facts from conversations. It supports multiple agents with persistent memory across sessions.

## Container Diagram

- **Python Engine**: Core memory processing
- **Ollama Service**: AI-powered extraction
- **SQLite Database**: Fact storage
- **Electron UI**: Monitoring interface
- **CLI**: Command-line operations

## Package Map

| Package                        | Purpose            | Key Exports    |
| ------------------------------ | ------------------ | -------------- |
| `claudesy_memory.engine`       | Main orchestration | `MemoryEngine` |
| `claudesy_memory.extractor`    | Text extraction    | `Extractor`    |
| `claudesy_memory.consolidator` | Memory decay       | `Consolidator` |
| `claudesy_memory.storage`      | Data persistence   | `Storage`      |
| `desktop`                      | UI application     | Electron app   |

## Data Flow

1. Agent conversation → Session logger
2. Session text → Extractor (regex + Ollama)
3. Facts → Consolidator (decay algorithm)
4. Consolidated facts → Storage (SQLite)

## Key Architectural Decisions

- Hybrid extraction for reliability
- Ebbinghaus curve for realistic forgetting
- WAL mode for concurrent access
- JSONL storage for fact categories

## Security Architecture

- Local-only operation
- No network exposure by default
- Data stored in user directory

## Infrastructure

- Runs locally on developer machines
- Ollama server as separate deployment
- No cloud dependencies
