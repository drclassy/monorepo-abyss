# System Design

## 1. Architecture Overview

The Claudesy Memory Engine follows a modular, layered architecture designed for reliability, extensibility, and performance. The system is built around a central engine that orchestrates memory operations across multiple specialized components.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interfaces                          │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │   CLI (cli.py)  │  │ Next.js Web Dashboard (src/)    │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│                 Core Engine Layer                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            ClaudesyEngine (engine.py)              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│               Service Components                            │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│  │Boot │  │Sess │  │Mem  │  │Extr │  │Cons │  │Daem │       │
│  │Load │  │Log  │  │Stor │  │act  │  │olid │  │on  │       │
│  │er   │  │ger  │  │age  │  │or   │  │ator │  │    │       │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘       │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│               Data Persistence Layer                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         SQLite Database + File System               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────┐
│               External Dependencies                         │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Ollama LLM    │  │   File System   │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Component Descriptions

### 2.1 Core Engine (ClaudesyEngine)

**Location**: `claudesy_memory/engine.py`

The central orchestrator that:

- Initializes all service components
- Coordinates memory operations
- Manages configuration
- Provides unified API

**Key Methods**:

- `logger()`: Returns SessionLogger instance
- `archive_old_sessions()`: Compresses old session files
- Integration point for all memory operations

### 2.2 BootLoader

**Location**: `claudesy_memory/boot.py`

Responsible for generating agent startup contexts:

- Loads identity documents (SOUL.md, MEMORY.md, SKILLS.md)
- Retrieves recent facts and session summaries
- Applies token budgeting and prioritization
- Formats context for agent consumption

**Algorithm**:

1. Collect identity + recent facts + session summaries
2. Estimate token usage
3. Fit within budget using priority ordering
4. Return formatted context string

### 2.3 SessionLogger

**Location**: `claudesy_memory/session_logger.py`

Manages session event logging:

- Creates/appends to daily Markdown files
- Formats events with timestamps and metadata
- Handles concurrent access safely

**Session Format**:

```
### HH:MM - Event Title
Event description text.

Decision: Optional decision text
Tags: tag1, tag2
```

### 2.4 MemoryStorage

**Location**: `claudesy_memory/storage.py`

Data persistence layer providing:

- SQLite database operations with WAL mode
- File system management with locking
- Fact indexing and search
- Agent directory isolation

**Storage Structure**:

```
~/.claudesy/
├── agents/
│   └── {agent_name}/
│       ├── facts/
│       │   ├── semantic.jsonl
│       │   ├── episodic.jsonl
│       │   ├── procedural.jsonl
│       │   └── preference.jsonl
│       ├── sessions/
│       │   ├── 2024-01-01.md
│       │   └── archive_2024-01.zip
│       ├── identity/
│       │   ├── SOUL.md
│       │   ├── MEMORY.md
│       │   └── SKILLS.md
│       └── memory.db
└── shared/
```

### 2.5 MemoryExtractor

**Location**: `claudesy_memory/extractor.py`

Fact extraction engine using hybrid approach:

- **Prefilter**: Rule-based categorization with regex patterns
- **AI Extraction**: Ollama-powered structured extraction
- **Fallback**: Rules-only when AI unavailable

**Extraction Pipeline**:

```
Session Text → Prefilter Rules → Candidate Facts → Ollama JSON → Structured Facts
```

**Categories**:

- **Semantic**: Factual knowledge, decisions, architecture
- **Episodic**: Session-specific events, experiences
- **Procedural**: Workflows, procedures, methods
- **Preference**: Agent preferences, policies, directives

### 2.6 MemoryConsolidator

**Location**: `claudesy_memory/consolidator.py`

Memory optimization component:

- Applies Ebbinghaus forgetting curve decay
- Deduplicates similar facts
- Prunes low-importance facts
- Handles fact relationships (ADD/UPDATE/DELETE operations)

**Decay Formula**:

```
importance = base_importance × 2^(-days_elapsed / half_life) + access_boost × access_count
```

### 2.7 MemoryDaemon

**Location**: `claudesy_memory/scheduler.py`

Background processing scheduler:

- Runs consolidation cycles at intervals
- Supports full or consolidate-only modes
- Interruptible and restartable

### 2.8 CLI Interface

**Location**: `claudesy_memory/cli.py`

Command-line interface providing:

- Agent selection and configuration
- All memory operations as commands
- Batch processing capabilities
- Error handling and logging

**Command Structure**:

```
claudesy-engine <command> [options]
```

### 2.9 Web Dashboard

**Location**: `src/`

Primary graphical user interface:

- Agent management and selection
- Document editing interface
- Activity monitoring
- Health visualization
- Search workflow and command orchestration

**Implementation shape**:

- Next.js App Router entrypoint
- Route Handlers as server-side BFF layer
- React client components for workspace state and operator actions
- Server-owned filesystem and Python engine bridge

## 3. Data Flow Diagrams

### 3.1 Session Logging Flow

```
User Event → CLI/Web Dashboard/Desktop Console → SessionLogger → Daily Markdown File
```

### 3.2 Memory Cycle Flow

```
Session Files → MemoryExtractor → Raw Facts → MemoryConsolidator → Optimized Facts → MemoryStorage
```

### 3.3 Boot Context Flow

```
Agent Request → BootLoader → Identity Docs + Recent Facts + Session Summaries → Token Budgeting → Formatted Context
```

### 3.4 Search Flow

```
Query → MemoryStorage → SQLite Index → Filtered Results → Response
```

## 4. Database Schema

### 4.1 Facts Table

```sql
CREATE TABLE facts (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    fact TEXT NOT NULL,
    importance REAL NOT NULL,
    created TEXT NOT NULL,
    last_accessed TEXT NOT NULL,
    access_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    related_to TEXT,
    source TEXT,
    session TEXT
);
```

### 4.2 Archives Table

```sql
CREATE TABLE archives (
    name TEXT PRIMARY KEY,
    created TEXT NOT NULL,
    file_count INTEGER NOT NULL,
    total_size INTEGER NOT NULL
);
```

### 4.3 Indexes

```sql
CREATE INDEX idx_facts_category ON facts(category);
CREATE INDEX idx_facts_status ON facts(status);
CREATE INDEX idx_facts_created ON facts(created);
CREATE INDEX idx_facts_importance ON facts(importance);
CREATE FULLTEXT INDEX idx_facts_fts ON facts(fact);
```

## 5. Configuration Design

Configuration is hierarchical and environment-driven:

```python
@dataclass
class EngineConfig:
    agent_name: str = DEFAULT_AGENT
    base_dir: Path = DEFAULT_BASE_DIR
    ollama: OllamaConfig
    decay: DecayConfig
    boot: BootConfig
    archive: ArchiveConfig
```

**Environment Variables**:

- `CLAUDESY_AGENT_NAME`: Default agent name
- `CLAUDESY_BASE_DIR`: Base directory for storage
- `CLAUDESY_OLLAMA_MODEL`: Ollama model for extraction
- `CLAUDESY_OLLAMA_URL`: Ollama server URL

## 6. Error Handling and Resilience

### 6.1 Graceful Degradation

- Ollama unavailable → Rules-only extraction
- Database locked → Retry with backoff
- File system full → Skip non-critical operations
- Network timeout → Continue with cached data

### 6.2 Logging Strategy

- Structured logging with levels (DEBUG, INFO, WARNING, ERROR)
- Component-specific loggers
- Activity tracking for GUI
- Error correlation with request IDs

### 6.3 Recovery Mechanisms

- Database transactions for consistency
- File locking for atomic operations
- Checkpoint-based processing
- Manual recovery commands

## 7. Security Considerations

### 7.1 Agent Isolation

- Separate directories per agent
- File system permissions
- No cross-agent data access

### 7.2 Data Protection

- No sensitive data storage
- Environment variable configuration
- Local-only Ollama communication

### 7.3 Access Control

- CLI requires file system access
- Web dashboard runs through server-owned route handlers and user permissions at the host boundary
- Optional desktop console runs with local user permissions
- No network exposure by default

## 8. Performance Characteristics

### 8.1 Benchmarks

- Boot context: <5 seconds for 4000 tokens
- Fact extraction: <90 seconds per session
- Search: <2 seconds for 10k facts
- Consolidation: Linear scaling with fact count

### 8.2 Optimization Strategies

- Lazy loading of large datasets
- Incremental processing
- Memory-efficient streaming
- Concurrent read operations

## 9. Extensibility Points

### 9.1 Custom Extractors

```python
class CustomExtractor(MemoryExtractor):
    def extract_facts(self, session_text: str) -> list[dict]:
        # Custom logic
        pass
```

### 9.2 Storage Backends

Abstract `MemoryStorage` interface allows:

- Alternative databases (PostgreSQL, MongoDB)
- Cloud storage (S3, GCS)
- Distributed systems

### 9.3 Integration APIs

- REST API endpoints
- WebSocket real-time updates
- Plugin system for custom operations

## 10. Deployment Architecture

### 10.1 Single-Agent Deployment

```
Browser/CLI/Desktop Console ←→ Web BFF or Local CLI ←→ Claudesy Engine ←→ Local Storage
```

### 10.2 Multi-Agent Deployment

```
Browser/Operator UI
        ↓
Route Handlers / CLI
        ↓
Agent 1 ←→ Engine 1 ←→ Storage 1
Agent 2 ←→ Engine 2 ←→ Storage 2
Shared Config
```

### 10.3 Distributed Deployment

```
Agents ←→ API Gateway ←→ Engine Cluster ←→ Shared Database
```

## 11. Monitoring and Observability

### 11.1 Health Checks

- Database connectivity
- File system access
- Ollama service availability
- Memory usage and performance metrics

### 11.2 Metrics

- Operation latency histograms
- Fact count by category
- Storage utilization
- Error rates by component

### 11.3 Logging

- Structured JSON logs
- Request tracing
- Performance profiling
- Audit trails for operations
