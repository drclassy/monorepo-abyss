# Claudesy Memory Engine - Introduction

## Overview

The Claudesy Memory Engine is a sophisticated memory management system designed specifically for AI agents. It provides persistent, intelligent storage and retrieval of contextual information, enabling agents to maintain continuity across sessions and improve their performance through accumulated knowledge.

Version: 1.1.0  
Author: Claudesy Team  
License: Proprietary

## Purpose

AI agents often operate in short-lived sessions with limited context windows. The Claudesy Memory Engine addresses this limitation by:

- **Persistent Memory**: Storing facts and experiences across multiple sessions
- **Intelligent Consolidation**: Using decay algorithms to prioritize important information
- **Contextual Bootstrapping**: Providing relevant context at agent startup
- **Automated Extraction**: Converting session logs into structured, searchable facts

## Key Features

### Core Functionality

- **Session Logging**: Append timestamped events to daily session logs
- **Fact Extraction**: Automatically extract meaningful facts from session content using hybrid rule-based and AI-powered methods
- **Memory Consolidation**: Apply forgetting curves and deduplication to maintain optimal memory size
- **Context Generation**: Build boot contexts with identity, recent facts, and session summaries

### Storage & Persistence

- **SQLite Backend**: Robust, concurrent database storage with WAL mode
- **File-Based Archives**: Automatic compression of old sessions
- **Agent Isolation**: Separate memory spaces for different agents
- **Atomic Operations**: File locking for safe concurrent access

### Integration & Extensibility

- **Ollama Integration**: Leverages local LLM for advanced fact extraction
- **CLI Interface**: Command-line tools for all operations
- **Web Dashboard**: Primary graphical interface for monitoring and management
- **Optional Desktop Console**: Local operator interface for desktop workflows
- **Python API**: Programmatic access via Python classes

## Architecture Overview

The system is built as a modular Python package with the following components:

- **Engine**: Central orchestrator managing all memory operations
- **Storage**: Handles data persistence and retrieval
- **Extractor**: Processes session logs into facts
- **Consolidator**: Manages memory decay and optimization
- **BootLoader**: Generates startup contexts
- **Scheduler**: Background daemon for automated tasks

## Target Audience

This system is designed for:

- AI agent developers building persistent memory capabilities
- Researchers studying agent learning and memory
- Organizations deploying AI agents in production environments
- Developers integrating memory systems into larger AI frameworks

## System Requirements

- Python 3.8+
- Ollama server (optional, for enhanced extraction)
- SQLite 3
- Node.js (for web dashboard and optional desktop console)

## Getting Started

For a quick start, see the [Deployment Guide](DEPLOYMENT.md) and [User Manual](USER_MANUAL.md).

## Project Structure

```
claudsy-memory/
├── claudesy_memory/          # Core Python package
│   ├── __init__.py          # Package exports
│   ├── engine.py            # Main engine class
│   ├── storage.py           # Data persistence layer
│   ├── extractor.py         # Fact extraction logic
│   ├── consolidator.py      # Memory optimization
│   ├── boot.py              # Context generation
│   ├── cli.py               # Command-line interface
│   ├── config.py            # Configuration classes
│   ├── models.py            # Data models
│   ├── scheduler.py         # Background tasks
│   └── session_logger.py    # Session management
├── src/                     # Next.js web dashboard (App Router)
│   ├── app/                 # Pages + API route handlers
│   ├── components/          # React components (zones, sidebar, etc.)
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Engine wrapper, types, config
└── docs/                    # Documentation
```

## Design Principles

- **Modularity**: Clean separation of concerns with well-defined interfaces
- **Reliability**: Graceful degradation when external dependencies fail
- **Performance**: Efficient storage and retrieval optimized for agent workloads
- **Extensibility**: Plugin architecture for custom extractors and consolidators
- **Observability**: Comprehensive logging and health monitoring

## Next Steps

- [Requirements Specifications](REQUIREMENTS.md)
- [System Design](SYSTEM_DESIGN.md)
- [Implementation Details](IMPLEMENTATION.md)
- [User Manual](USER_MANUAL.md)
- [Deployment Guide](DEPLOYMENT.md)
