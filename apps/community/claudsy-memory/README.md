# Claudsy Memory Engine

A sophisticated memory management system for AI agents providing persistent,
intelligent storage and retrieval of contextual information.

## Table of Contents

- [Project Purpose and Overview](#project-purpose-and-overview)
- [Architecture and Component Breakdown](#architecture-and-component-breakdown)
- [Supported Environments and Prerequisites](#supported-environments-and-prerequisites)
- [Installation and Build Steps](#installation-and-build-steps)
- [Quickstart](#quickstart)
- [Configuration](#configuration)
- [Usage Examples and Common Workflows](#usage-examples-and-common-workflows)
- [API/CLI Reference](#apicli-reference)
- [Testing](#testing)
- [Deployment Guidance](#deployment-guidance)
- [Security Considerations and Known Limitations](#security-considerations-and-known-limitations)
- [Troubleshooting](#troubleshooting)
- [Contributing Guidelines](#contributing-guidelines)
- [License and Attribution](#license-and-attribution)
- [Changelog / Roadmap Pointers](#changelog--roadmap-pointers)
- [Glossary](#glossary)
- [References](#references)

## Project Purpose and Overview

The Claudesy Memory Engine is a sophisticated memory management system designed
specifically for AI agents. It provides persistent, intelligent storage and
retrieval of contextual information, enabling agents to maintain continuity
across sessions and improve their performance through accumulated knowledge
([`docs/INTRODUCTION.md`](docs/INTRODUCTION.md)).

The system addresses the limitation of AI agents operating in short-lived
sessions with limited context windows by:

- **Persistent Memory**: Storing facts and experiences across multiple sessions
- **Intelligent Consolidation**: Using decay algorithms to prioritize important
  information
- **Contextual Bootstrapping**: Providing relevant context at agent startup
- **Automated Extraction**: Converting session logs into structured, searchable
  facts

Key features include session logging, fact extraction using hybrid rule-based
and AI-powered methods, memory consolidation with forgetting curves, and support
for multiple interfaces including CLI, web dashboard, and optional desktop
console ([`docs/INTRODUCTION.md`](docs/INTRODUCTION.md)).

The architecture consists of modular Python components: Engine (central
orchestrator), Storage (data persistence), Extractor (fact processing),
Consolidator (memory optimization), BootLoader (context generation), Scheduler
(background tasks), with integration to Ollama for enhanced extraction
([`docs/INTRODUCTION.md`](docs/INTRODUCTION.md),
[`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md)).

## Architecture and Component Breakdown

The system follows a modular, layered architecture with clean separation of
concerns ([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md)).

### Core Components

- **ClaudesyEngine**: Central orchestrator managing all memory operations,
  initializing components, and providing unified API
  ([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md),
  [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md))
- **BootLoader**: Generates agent startup contexts by loading identity
  documents, retrieving recent facts, and applying token budgeting
  ([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md))
- **SessionLogger**: Manages session event logging with timestamped Markdown
  files and concurrent access safety
  ([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md))
- **MemoryStorage**: Handles data persistence using SQLite with WAL mode, file
  system management, and fact indexing
  ([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md))
- **MemoryExtractor**: Processes session logs into facts using hybrid prefilter
  (rule-based) and AI extraction via Ollama
  ([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md))
- **MemoryConsolidator**: Optimizes memory with Ebbinghaus decay, deduplication,
  and pruning ([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md))
- **MemoryDaemon**: Background scheduler for automated consolidation cycles
  ([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md))

### Data Flow

1. User events flow through CLI/Web Dashboard/Desktop Console to SessionLogger,
   creating daily Markdown files
2. Session files are processed by MemoryExtractor into raw facts
3. Facts are consolidated by MemoryConsolidator and stored via MemoryStorage
4. BootLoader generates contexts from stored facts for agent initialization
5. Search queries are handled through MemoryStorage's SQLite index

### Storage Structure

Data is organized per agent in isolated directories under
`~/.claudesy/agents/{agent_name}/`, with facts stored as JSONL files by category
(semantic, episodic, procedural, preference), session logs as daily Markdown
files, and identity documents (SOUL.md, MEMORY.md, SKILLS.md)
([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md),
[`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)).

## Supported Environments and Prerequisites

### Operating Systems

- Linux (Ubuntu 20.04+ recommended)
- macOS
- Windows

### Runtime Requirements

- Python 3.8 or higher
- Node.js 20+ (for web dashboard build/runtime and optional desktop console)
- SQLite 3.0 or higher (usually included with Python)

### External Dependencies

- Ollama server (optional, for enhanced extraction) with models nuextract
  (primary) and llama3.1:8b (fallback)
- Operating system support for file locking

### Hardware Requirements

- Minimum RAM: 512 MB
- Minimum Disk Space: 100 MB
- Recommended CPU: Multi-core processor for concurrent operations

## Installation and Build Steps

### Prerequisites Installation

1. Install Python 3.10 or higher
2. Install Ollama from https://ollama.ai and pull required models:

   ```
   ollama pull nuextract
   ollama pull llama3.1:8b
   ```

3. Install Git

### Package Installation

Clone the repository and install:

```
git clone https://github.com/claudesy/memory-engine.git
cd claudsy-memory
pip install -e .
```

For web dashboard development:

```
cd src/
npm install
```

### Verification

Run the CLI to verify installation:

```
claudesy-engine --help
```

## Quickstart

### Basic Setup

1. Set agent name: `export CLAUDESY_AGENT_NAME=my_agent`
2. Log first event:
   `claudesy-engine log --title "Setup" --description "Initializing memory system"`
3. Extract facts: `claudesy-engine extract`
4. View stored facts: `claudesy-engine search "Setup"`

### Web Dashboard

Start the web interface:

```
cd src/
npm run dev
```

Open http://localhost:3000 to access the dashboard for agent management,
document editing, and monitoring.

### Expected Outputs

- Log command outputs event confirmation
- Extract command shows number of facts extracted
- Search returns matching facts with metadata
- Boot command generates formatted context string

## Configuration

### Environment Variables

Core settings:

- `CLAUDESY_AGENT_NAME`: Default agent name
- `CLAUDESY_BASE_DIR`: Base directory for storage (default: ~/.claudesy)
- `CLAUDESY_OLLAMA_MODEL`: Ollama model (default: nuextract)
- `CLAUDESY_OLLAMA_URL`: Ollama server URL (default: http://localhost:11434)
- `CLAUDESY_DECAY_HALF_LIFE_DAYS`: Memory decay rate (default: 30)
- `CLAUDESY_BOOT_MAX_TOKENS`: Maximum boot context tokens (default: 4000)

### Configuration Files

Create `config.py` for advanced settings or use environment variables.
Configuration supports hierarchical setup with defaults
([`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md),
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)).

### Secure Handling

- Agent memory spaces are isolated
- File system permissions restrict access to agent directories
- Optional encryption available via `CLAUDESY_ENCRYPTION_KEY` environment
  variable
- SSL verification enabled for Ollama connections
  ([`docs/SECURITY.md`](docs/SECURITY.md))

## Usage Examples and Common Workflows

### Development Workflow

```
# Start session
claudesy-engine log --title "Feature Implementation" --description "Implementing user authentication"

# Extract facts
claudesy-engine extract

# Search related work
claudesy-engine search "authentication"

# Generate context
claudesy-engine boot
```

### Research Workflow

```
# Log findings
claudesy-engine log --title "Literature Review" --description "Reviewed memory consolidation papers"

# Process
claudesy-engine run

# Find insights
claudesy-engine search "memory consolidation" --category semantic
```

### Team Collaboration

```
# Daily updates
claudesy-engine log --title "Standup" --description "Completed API endpoints"

# Share knowledge
claudesy-engine log --title "Knowledge Share" --description "Documented OAuth flow"

# Team search
claudesy-engine search "OAuth" --category procedural
```

## API/CLI Reference

### CLI Commands

Primary commands:

- `run`: Execute full memory cycle (archive, extract, consolidate)
- `log`: Append event to session log
- `extract`: Extract facts from sessions
- `consolidate`: Rebuild long-term memory
- `boot`: Generate boot context
- `search`: Query stored facts
- `inspect`: View fact details
- `health`: System status check
- `daemon`: Background processing

### Python API

Key classes:

- `ClaudesyEngine`: Main engine interface
- `SessionLogger`: Session management
- `MemoryStorage`: Data access layer
- `MemoryExtractor`: Fact extraction
- `MemoryConsolidator`: Memory optimization

### Web Dashboard

Provides agent selection, document editing (SOUL.md, MEMORY.md, SKILLS.md),
activity monitoring, daemon control, and search interface
([`docs/USER_MANUAL.md`](docs/USER_MANUAL.md), [`docs/API.md`](docs/API.md)).

## Testing

### Running Tests

Execute the regression suite:

```
python -m unittest test_claudesy_engine.py -v
```

For comprehensive testing:

```
pytest tests/unit/ tests/integration/ tests/performance/
```

### Test Coverage

- Unit tests for individual components
- Integration tests for end-to-end workflows
- Performance benchmarks for scaling validation
- Manual testing procedures for GUI and deployment

### Interpreting Results

- Tests pass with 0 exit code
- Performance benchmarks report timing within specified limits (<5s for boot,
  <2s for search)
- Health checks return OK/WARNING/CRITICAL status
  ([`docs/TESTING.md`](docs/TESTING.md))

## Deployment Guidance

### Development Deployment

Local setup with:

```
pip install -e .
npm install
npm run dev
```

### Production Deployment

Use systemd services for daemon management, configure environment variables, and
set up monitoring. Supports single-agent and multi-agent configurations with
load balancing options ([`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)).

### Scaling

- Vertical: Increase RAM/CPU for larger datasets
- Horizontal: Multiple instances with shared storage
- Cloud: Docker containers with persistent volumes

## Security Considerations and Known Limitations

### Security Features

- Agent isolation prevents cross-agent data access
- Local-only operation avoids network exposure
- Input validation using Pydantic schemas
- Optional data encryption at rest
- File system permissions control access

### Limitations

- Single-threaded extraction per agent
- Memory operations scoped to individual agents
- Requires Ollama for enhanced extraction (falls back to rules-only)
- Desktop console requires desktop environment
- Web dashboard needs Node.js deployment target

### Known Issues

- Database locks during concurrent operations (mitigated by WAL mode)
- Memory usage scales with fact count
- Network timeouts when Ollama unavailable
  ([`docs/SECURITY.md`](docs/SECURITY.md),
  [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md))

## Troubleshooting

### Common Issues

**Ollama Connection Failed**: Ensure Ollama is running (`ollama serve`) and
models are pulled. System falls back to rule-based extraction
([`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)).

**Database Locked**: Wait for operations to complete or restart daemon. Use WAL
mode for concurrency ([`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)).

**Permission Denied**: Check directory ownership and permissions. Run with
appropriate user account ([`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)).

### Health Checks

Run `claudesy-engine health` to verify system status, including database
connectivity, file access, and Ollama availability
([`docs/MAINTENANCE.md`](docs/MAINTENANCE.md)).

### Recovery Procedures

- Corrupted sessions: Restore from backups or re-extract
- Lost facts: Re-run extraction on session files
- Daemon issues: Kill and restart process
  ([`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md))

## Contributing Guidelines

Follow the existing code of conduct. Submit changes via pull requests with tests
and documentation updates. Use PEP 8 style, type hints, and comprehensive
docstrings ([`CONTRIBUTING.md`](CONTRIBUTING.md)).

## License and Attribution

Licensed under MIT License. See [`LICENSE`](LICENSE) for full text.

Attributions: Ollama for LLM capabilities, SQLite for database functionality,
Python community for libraries.

## Changelog / Roadmap Pointers

See [`CHANGELOG.md`](CHANGELOG.md) for version history.

Roadmap includes enhanced extraction, multi-agent support, analytics dashboard,
and production readiness ([`docs/project/ROADMAP.md`](docs/project/ROADMAP.md)).

## Glossary

- **Agent**: AI system using the memory engine
- **Boot Context**: Curated information for agent startup
- **Consolidation**: Memory optimization with decay algorithms
- **Decay**: Automatic importance reduction over time
- **Episodic Memory**: Event-based memory storage
- **Extraction**: Converting sessions to structured facts
- **Fact**: Structured piece of information
- **Procedural Memory**: Workflow and process knowledge
- **Semantic Memory**: Factual and conceptual knowledge
- **Session**: Daily log of agent interactions
- **Token Budget**: Maximum context size limit
  ([`docs/APPENDICES.md`](docs/APPENDICES.md))

## References

- [`docs/README.md`](docs/README.md): Documentation overview
- [`docs/INTRODUCTION.md`](docs/INTRODUCTION.md): Project introduction
- [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md): Requirements specification
- [`docs/SETUP.md`](docs/SETUP.md): Setup instructions
- [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md): System architecture
- [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md): Implementation details
- [`docs/API.md`](docs/API.md): API reference
- [`docs/TESTING.md`](docs/TESTING.md): Testing procedures
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md): Troubleshooting guide
- [`docs/USER_MANUAL.md`](docs/USER_MANUAL.md): User manual
- [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md): Maintenance instructions
- [`docs/PRIVACY.md`](docs/PRIVACY.md): Privacy policy
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): Deployment guide
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md): Data model
- [`docs/APPENDICES.md`](docs/APPENDICES.md): Additional references
- [`docs/AI_GOVERNANCE.md`](docs/AI_GOVERNANCE.md): AI governance
- [`docs/project/ARCHITECTURE.md`](docs/project/ARCHITECTURE.md): Architecture
  overview
- [`docs/project/DECISION_LOG.md`](docs/project/DECISION_LOG.md): Decision log
- [`docs/project/ROADMAP.md`](docs/project/ROADMAP.md): Roadmap
- [`docs/sentratorium/review-dashboard-design.md`](docs/sentratorium/review-dashboard-design.md):
  Dashboard review
- [`docs/sentratorium/security-implementation-review-2026-03-25.md`](docs/sentratorium/security-implementation-review-2026-03-25.md):
  Security review
- [`package.json`](package.json): Node.js dependencies
- [`pyproject.toml`](pyproject.toml): Python project metadata
- [`LICENSE`](LICENSE): License text
- [`CHANGELOG.md`](CHANGELOG.md): Changelog
- [`CONTRIBUTING.md`](CONTRIBUTING.md): Contributing guidelines
- [`SECURITY.md`](SECURITY.md): Security policy
- [`test_claudesy_engine.py`](test_claudesy_engine.py): Test suite
