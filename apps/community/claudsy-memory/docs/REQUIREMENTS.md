# Requirements Specifications

## 1. Introduction

This document specifies the functional and non-functional requirements for the Claudesy Memory Engine version 1.1.0. The system provides persistent memory capabilities for AI agents, enabling them to maintain and utilize knowledge across sessions.

## 2. System Overview

The Claudesy Memory Engine is a Python-based memory management system that:

- Stores agent experiences as structured facts
- Applies intelligent consolidation algorithms
- Provides contextual information for agent initialization
- Supports multiple agents with isolated memory spaces

## 3. Functional Requirements

### 3.1 Session Management

**REQ-SESS-001**: The system shall allow appending timestamped events to daily session logs.

**REQ-SESS-002**: Session logs shall be stored as Markdown files with standardized formatting.

**REQ-SESS-003**: The system shall support multiple concurrent agents with separate session logs.

### 3.2 Fact Extraction

**REQ-EXT-001**: The system shall extract facts from session logs using a hybrid approach of rule-based prefiltering and AI-powered analysis.

**REQ-EXT-002**: Facts shall be categorized into semantic, episodic, procedural, and preference types.

**REQ-EXT-003**: The system shall support fallback to rule-only extraction when AI services are unavailable.

**REQ-EXT-004**: Extracted facts shall include metadata such as importance scores, timestamps, and relationships.

### 3.3 Memory Consolidation

**REQ-CONS-001**: The system shall apply Ebbinghaus forgetting curve decay to fact importance scores.

**REQ-CONS-002**: The system shall deduplicate facts based on normalized text similarity.

**REQ-CONS-003**: The system shall prune facts below minimum importance thresholds.

**REQ-CONS-004**: Access patterns shall boost fact importance scores.

### 3.4 Context Generation

**REQ-BOOT-001**: The system shall generate boot contexts containing agent identity, recent facts, and session summaries.

**REQ-BOOT-002**: Boot contexts shall be limited to configurable token budgets.

**REQ-BOOT-003**: The system shall prioritize boot context components by importance.

### 3.5 Data Persistence

**REQ-STOR-001**: The system shall use SQLite with WAL mode for concurrent access.

**REQ-STOR-002**: The system shall implement file locking for atomic operations.

**REQ-STOR-003**: Facts shall be stored in JSONL format per category.

**REQ-STOR-004**: The system shall maintain searchable indexes of facts.

### 3.6 Archiving

**REQ-ARCH-001**: The system shall automatically compress old session logs into ZIP archives.

**REQ-ARCH-002**: Archive operations shall be configurable by age threshold.

**REQ-ARCH-003**: Archives shall be tracked in the database with metadata.

### 3.7 User Interfaces

**REQ-UI-001**: The system shall provide a command-line interface for all operations.

**REQ-UI-002**: The system shall provide a web-based graphical dashboard as the primary graphical interface.

**REQ-UI-003**: The CLI shall support agent selection, configuration overrides, and batch operations.

**REQ-UI-004**: The graphical dashboard shall display real-time activity, allow document editing, and show health status.

**REQ-UI-005**: The system may provide an optional desktop console for local operator workflows, but feature parity shall be measured against the web dashboard.

### 3.8 Search and Inspection

**REQ-SEARCH-001**: The system shall support full-text search across stored facts.

**REQ-SEARCH-002**: Search results shall be filterable by category, status, and date range.

**REQ-SEARCH-003**: The system shall allow inspection of individual facts by ID.

**REQ-SEARCH-004**: The system shall provide recent fact listings with pagination.

### 3.9 Background Processing

**REQ-DAEMON-001**: The system shall support a lightweight daemon for automated consolidation.

**REQ-DAEMON-002**: The daemon shall be configurable for polling intervals and operation modes.

**REQ-DAEMON-003**: Daemon operations shall be interruptible and restartable.

### 3.10 Health Monitoring

**REQ-HEALTH-001**: The system shall provide health check endpoints reporting system status.

**REQ-HEALTH-002**: Health checks shall include database connectivity, file system access, and external service availability.

**REQ-HEALTH-003**: The system shall log health status changes and anomalies.

## 4. Non-Functional Requirements

### 4.1 Performance

**REQ-PERF-001**: Fact extraction shall complete within 90 seconds for typical session logs.

**REQ-PERF-002**: Boot context generation shall complete within 5 seconds.

**REQ-PERF-003**: Search queries shall return results within 2 seconds for datasets up to 10,000 facts.

**REQ-PERF-004**: Memory consolidation shall scale linearly with fact count.

### 4.2 Reliability

**REQ-REL-001**: The system shall gracefully degrade when Ollama services are unavailable.

**REQ-REL-002**: Database operations shall use transactions to ensure consistency.

**REQ-REL-003**: File operations shall use locking to prevent corruption from concurrent access.

**REQ-REL-004**: The system shall maintain operation logs for troubleshooting.

### 4.3 Security

**REQ-SEC-001**: Agent memory spaces shall be isolated from each other.

**REQ-SEC-002**: File system permissions shall restrict access to agent directories.

**REQ-SEC-003**: External service communications shall use secure protocols.

**REQ-SEC-004**: Sensitive configuration shall be environment-variable controlled.

### 4.4 Usability

**REQ-USAB-001**: CLI commands shall follow consistent naming conventions.

**REQ-USAB-002**: Error messages shall be descriptive and actionable.

**REQ-USAB-003**: Configuration shall support sensible defaults.

**REQ-USAB-004**: The GUI shall provide intuitive navigation and real-time feedback.

### 4.5 Maintainability

**REQ-MAINT-001**: Code shall be modular with clear separation of concerns.

**REQ-MAINT-002**: The system shall support configuration-driven behavior changes.

**REQ-MAINT-003**: Logging shall be comprehensive and configurable.

**REQ-MAINT-004**: The system shall provide programmatic APIs for integration.

### 4.6 Portability

**REQ-PORT-001**: The system shall run on Windows, macOS, and Linux.

**REQ-PORT-002**: Python dependencies shall be minimal and widely available.

**REQ-PORT-003**: The system shall work with standard file systems and SQLite installations.

## 5. System Requirements

### 5.1 Hardware Requirements

- Minimum RAM: 512 MB
- Minimum Disk Space: 100 MB
- Recommended CPU: Multi-core processor for concurrent operations

### 5.2 Software Requirements

- Python 3.8 or higher
- SQLite 3.0 or higher
- Node.js 20+ (for web dashboard build/runtime and optional desktop console)
- Ollama server (optional, for enhanced extraction)

### 5.3 External Dependencies

- Ollama models: nuextract (primary), llama3.1:8b (fallback)
- Operating system support for file locking
- Network access for Ollama communication (localhost)

## 6. Interface Requirements

### 6.1 CLI Interface

The command-line interface shall support the following commands:

- `run`: Execute full memory cycle
- `log`: Append session event
- `extract`: Extract facts from session
- `consolidate`: Rebuild long-term memory
- `boot`: Generate boot context
- `search`: Query stored facts
- `inspect`: View fact details
- `health`: System status check
- `daemon`: Background processing

### 6.2 API Interface

The Python API shall provide classes:

- `ClaudesyEngine`: Main engine interface
- `SessionLogger`: Session management
- `MemoryStorage`: Data access layer
- `MemoryExtractor`: Fact extraction
- `MemoryConsolidator`: Memory optimization

### 6.3 GUI Interface

The web dashboard shall provide:

- Agent selection and management
- Document editing (SOUL.md, MEMORY.md, SKILLS.md)
- Activity monitoring
- Daemon control
- Search interface

An optional desktop console may expose a subset of the same operations for local operator use, but the web dashboard is the canonical GUI target for requirements conformance.

## 7. Data Requirements

### 7.1 Fact Structure

Facts shall contain:

- Unique ID
- Category (semantic/episodic/procedural/preference)
- Text content
- Importance score (0.0-1.0)
- Creation timestamp
- Last access timestamp
- Access count
- Status (active/superseded/deleted)
- Related fact IDs

### 7.2 Session Format

Session logs shall be Markdown files with:

- Daily file naming (YYYY-MM-DD.md)
- Section headers (### HH:MM - Title)
- Structured event data
- Optional decision and tag fields

### 7.3 Configuration

Configuration shall support:

- Agent name and base directory
- Ollama connection settings
- Decay algorithm parameters
- Boot context limits
- Archive policies

## 8. Assumptions and Constraints

### 8.1 Assumptions

- Agents operate in text-based environments
- Session logs are written in English or supported languages
- Network connectivity is available for Ollama services
- File system provides adequate performance

### 8.2 Constraints

- Single-threaded extraction per agent
- Memory operations are agent-scoped
- Archive compression is CPU-intensive
- Desktop console requires a desktop environment
- Web dashboard requires a Node.js-capable deployment target and browser access

## 9. Future Considerations

- Multi-language support
- Distributed storage backends
- Real-time collaboration features
- Advanced ML-based extraction
- Integration with external knowledge bases
