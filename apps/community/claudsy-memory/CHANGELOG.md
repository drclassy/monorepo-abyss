# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Initial memory extraction and consolidation system
- Hybrid extraction using regex prefilter + Ollama structured JSON
- SQLite storage with WAL mode for concurrent access
- Electron desktop UI for monitoring
- CLI interface for operations
- Session logging with daily Markdown files
- Memory consolidation using Ebbinghaus forgetting curve
- Fact categorization (semantic/episodic/procedural/preference)

### Changed

-

### Fixed

-

### Security

- Atomic writes with lock files for session safety
