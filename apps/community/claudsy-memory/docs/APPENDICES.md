# Appendices

## Appendix A: Glossary

### A.1 Core Concepts

**Agent**: An AI system that uses the Claudesy Memory Engine to maintain persistent memory across sessions.

**Boot Context**: A curated set of information provided to an agent at startup, containing identity, recent facts, and session summaries.

**Consolidation**: The process of optimizing long-term memory by applying decay algorithms, deduplication, and pruning.

**Decay**: The automatic reduction of fact importance over time, following Ebbinghaus forgetting curves.

**Episodic Memory**: Memory of specific events and experiences, stored with temporal context.

**Extraction**: The process of converting session logs into structured facts using rule-based and AI-powered methods.

**Fact**: A structured piece of information extracted from agent interactions, categorized and scored for importance.

**Importance Score**: A numerical value (0.0-1.0) indicating the relevance and retention priority of a fact.

**Memory Cycle**: The complete workflow of archiving sessions, extracting facts, and consolidating memory.

**Procedural Memory**: Memory of processes, workflows, and step-by-step instructions.

**Preference Memory**: Memory of agent preferences, policies, and behavioral guidelines.

**Semantic Memory**: Memory of factual knowledge, concepts, and relationships.

**Session**: A period of agent activity recorded in a daily Markdown file with timestamped events.

**Session Log**: A daily file containing all agent interactions, decisions, and observations.

### A.2 Technical Terms

**JSONL**: JSON Lines format - a text file where each line is a valid JSON object.

**Ollama**: A tool for running large language models locally.

**Prefilter**: Rule-based text analysis that categorizes content before AI processing.

**SQLite WAL**: Write-Ahead Logging mode in SQLite for better concurrent access.

**Token Budget**: The maximum number of tokens allowed in a boot context.

**WAL Mode**: SQLite's Write-Ahead Logging for improved concurrency and crash recovery.

### A.3 Architecture Terms

**BootLoader**: Component responsible for generating agent startup contexts.

**MemoryExtractor**: Component that processes session logs into structured facts.

**MemoryConsolidator**: Component that optimizes and maintains long-term memory.

**MemoryStorage**: Component handling data persistence and retrieval.

**SessionLogger**: Component managing session event recording.

## Appendix B: API Reference

### B.1 Python API

#### ClaudesyEngine Class

**Initialization:**

```python
from claudesy_memory import ClaudesyEngine, EngineConfig

# Default configuration
engine = ClaudesyEngine()

# Custom configuration
config = EngineConfig(agent_name="my_agent", base_dir="/custom/path")
engine = ClaudesyEngine(config)
```

**Methods:**

- `logger(agent_name: str | None = None) -> SessionLogger`
  - Returns a session logger for the specified agent
  - Parameters: agent_name (optional, defaults to config agent)
  - Returns: SessionLogger instance

- `archive_old_sessions(agent_name: str | None = None) -> dict[str, Any]`
  - Archives session files older than configured threshold
  - Parameters: agent_name (optional)
  - Returns: Dictionary with archiving statistics

#### SessionLogger Class

**Methods:**

- `log_event(event: SessionEvent) -> None`
  - Appends an event to today's session log
  - Parameters: event (SessionEvent object)

#### SessionEvent Class

**Initialization:**

```python
from claudesy_memory import SessionEvent

event = SessionEvent(
    title="Event Title",
    description="Detailed description of the event",
    decision="Optional decision made",
    tags=["tag1", "tag2"]
)
```

**Methods:**

- `render() -> str`
  - Returns the event formatted as Markdown text

### B.2 CLI Commands

#### Command Structure

```
claudesy-engine [global-options] <command> [command-options]
```

#### Global Options

- `--agent <name>`: Agent name (default: from CLAUDESY_AGENT_NAME or "claude-code")
- `--base-dir <path>`: Base directory (default: from CLAUDESY_BASE_DIR or ~/.claudesy)
- `--log-level <level>`: Logging level (DEBUG, INFO, WARNING, ERROR)

#### Command Reference

**run**

- Description: Execute full memory cycle (archive, extract, consolidate)
- Options: None
- Exit Codes: 0 (success), 1 (error)

**log**

- Description: Append event to session log
- Options:
  - `--title <text>`: Event title (required)
  - `--description <text>`: Event description (required)
  - `--decision <text>`: Optional decision
  - `--tags <csv>`: Comma-separated tags
- Exit Codes: 0 (success), 1 (error)

**extract**

- Description: Extract facts from session logs
- Options:
  - `--file <path>`: Specific session file (default: latest)
- Exit Codes: 0 (success), 1 (error)

**consolidate**

- Description: Rebuild long-term memory
- Options: None
- Exit Codes: 0 (success), 1 (error)

**boot**

- Description: Generate and display boot context
- Options: None
- Exit Codes: 0 (success), 1 (error)

**search**

- Description: Search stored facts
- Options:
  - `query`: Search query (positional)
  - `--category <type>`: Filter by category
  - `--status <status>`: Filter by status
  - `--limit <number>`: Maximum results (default: 10)
- Exit Codes: 0 (success), 1 (error)

**inspect**

- Description: View fact details
- Options:
  - `--id <fact_id>`: Specific fact ID
  - `--category <type>`: Filter by category
  - `--limit <number>`: Number of facts (default: 10)
- Exit Codes: 0 (success), 1 (error)

**daemon**

- Description: Run background consolidation daemon
- Options:
  - `--interval-seconds <seconds>`: Polling interval (default: 300)
  - `--mode <mode>`: Operation mode (full/consolidate, default: full)
- Exit Codes: 0 (success), 1 (error)

**health**

- Description: Display system health status
- Options: None
- Exit Codes: 0 (healthy), 1 (warnings), 2 (critical)

### B.3 Configuration Classes

#### EngineConfig

```python
@dataclass(slots=True)
class EngineConfig:
    agent_name: str = DEFAULT_AGENT
    base_dir: Path = DEFAULT_BASE_DIR
    ollama: OllamaConfig = field(default_factory=OllamaConfig)
    decay: DecayConfig = field(default_factory=DecayConfig)
    boot: BootConfig = field(default_factory=BootConfig)
    archive: ArchiveConfig = field(default_factory=ArchiveConfig)
```

#### OllamaConfig

```python
@dataclass(slots=True)
class OllamaConfig:
    model: str = "nuextract"
    fallback_model: str = "llama3.1:8b"
    base_url: str = "http://localhost:11434"
    temperature: float = 0.0
    timeout_seconds: int = 90
    max_retries: int = 2
```

#### DecayConfig

```python
@dataclass(slots=True)
class DecayConfig:
    half_life_days: int = 30
    access_boost: float = 0.08
    minimum_threshold: float = 0.30
    prune_below: float = 0.20
```

#### BootConfig

```python
@dataclass(slots=True)
class BootConfig:
    max_tokens: int = 4000
    recent_fact_count: int = 5
    latest_session_count: int = 1
    chars_per_token: float = 4.0
```

#### ArchiveConfig

```python
@dataclass(slots=True)
class ArchiveConfig:
    enabled: bool = True
    compress_after_days: int = 14
```

## Appendix C: Error Codes and Messages

### C.1 CLI Exit Codes

- **0**: Success - Operation completed successfully
- **1**: General Error - Operation failed with error message
- **2**: Critical Error - System is in an unusable state

### C.2 Common Error Messages

**"Ollama service unavailable"**

- Cause: Ollama server not running or unreachable
- Solution: Start Ollama service or check network connectivity
- Fallback: System continues with rule-based extraction

**"Database locked"**

- Cause: Concurrent access conflict or crashed process
- Solution: Wait for other operations to complete, or restart daemon
- Prevention: Use proper file locking and transaction handling

**"Permission denied"**

- Cause: Insufficient file system permissions
- Solution: Check directory ownership and permissions
- Command: `chmod 755 ~/.claudesy && chown -R $USER:$USER ~/.claudesy`

**"Invalid agent name"**

- Cause: Agent name contains invalid characters
- Solution: Use only alphanumeric characters, hyphens, and underscores
- Validation: `^[a-zA-Z0-9_-]+$`

**"Session file corrupted"**

- Cause: Manual editing or disk corruption
- Solution: Restore from backup or recreate session
- Recovery: Use backup archives in `sessions/archive/`

### C.3 Health Check Status

**OK (0)**

- All systems functioning normally
- Database accessible
- Ollama service responding (if configured)
- File system writable

**WARNING (1)**

- Non-critical issues detected
- Some operations may be degraded
- Manual intervention recommended

**CRITICAL (2)**

- System in unusable state
- Immediate attention required
- Core functionality impaired

### C.4 Logging Levels

**DEBUG**

- Detailed diagnostic information
- Function entry/exit points
- Variable values and state changes

**INFO**

- General operational messages
- Operation completion status
- Configuration loading

**WARNING**

- Potentially harmful situations
- Deprecated feature usage
- Performance degradation

**ERROR**

- Error conditions that don't stop operation
- Failed operations with recovery
- Invalid user input

## Appendix D: File Formats

### D.1 Session Log Format

Session logs are daily Markdown files with the following structure:

```
# Session Log - 2024-01-15

### 09:30 - Morning Planning
Discussed project priorities and timeline adjustments.
Decision: Focus on core features before optimization.
Tags: planning,priority

### 14:00 - Code Review
Reviewed pull request #123 for authentication improvements.
Approved with minor documentation updates requested.
Tags: review,security,authentication
```

**Format Rules:**

- Daily files: `YYYY-MM-DD.md`
- Section headers: `### HH:MM - Title`
- Optional decision field
- Optional tags field
- Blank lines between sections

### D.2 Fact Storage Format

Facts are stored in JSONL format with the following schema:

```json
{
  "id": "fact_001",
  "category": "semantic",
  "fact": "Python uses indentation for code blocks",
  "importance": 0.85,
  "created": "2024-01-01T10:00:00Z",
  "last_accessed": "2024-01-01T10:00:00Z",
  "access_count": 1,
  "status": "active",
  "related_to": null,
  "source": "session_2024-01-01.md",
  "session": "2024-01-01"
}
```

**Field Descriptions:**

- `id`: Unique identifier (generated)
- `category`: semantic/episodic/procedural/preference
- `fact`: The actual fact text
- `importance`: 0.0-1.0 relevance score
- `created`: ISO 8601 timestamp
- `last_accessed`: ISO 8601 timestamp
- `access_count`: Number of times accessed
- `status`: active/superseded/deleted
- `related_to`: ID of related fact (optional)
- `source`: Source session file
- `session`: Session date

### D.3 Identity Document Format

Identity documents are Markdown files:

**SOUL.md** - Agent personality and core identity:

```
# My Identity

I am Claude, an AI assistant created by Anthropic. I am helpful, honest, and harmless.

## Core Principles
- Always be truthful and accurate
- Help users effectively and efficiently
- Maintain user privacy and security
```

**MEMORY.md** - Long-term context:

```
# Long-term Memory

## Key Experiences
- Successfully helped users with coding tasks
- Learned to explain complex concepts simply
- Developed expertise in Python and web development

## Important Patterns
- Users often need step-by-step guidance
- Code examples are more helpful than abstract explanations
- Proactive suggestions improve user experience
```

**SKILLS.md** - Capabilities and expertise:

```
# Skills and Capabilities

## Programming Languages
- Python (expert)
- JavaScript (proficient)
- SQL (proficient)

## Tools and Frameworks
- Git version control
- Docker containerization
- REST API design

## Domains
- Software development
- System architecture
- Technical writing
```

### D.4 Archive Format

Session archives are ZIP files containing compressed Markdown files:

```
archive_2024-01.zip
├── 2024-01-01.md
├── 2024-01-02.md
├── 2024-01-03.md
└── ...
```

**Archive Metadata:**

- Naming: `archive_YYYY-MM.zip`
- Compression: Standard ZIP compression
- Contents: Original session Markdown files
- Retention: Configurable (default: 14 days)

## Appendix E: Performance Benchmarks

### E.1 Baseline Performance

**Test Environment:**

- CPU: Intel i5-8250U (4 cores, 8 threads)
- RAM: 16 GB DDR4
- Storage: SSD
- OS: Ubuntu 22.04 LTS
- Python: 3.10.6
- Ollama: llama3.1:8b model

**Dataset Sizes:**

- Small: 1,000 facts
- Medium: 5,000 facts
- Large: 10,000 facts

### E.2 Operation Benchmarks

**Boot Context Generation:**

```
Small dataset:  0.8 ± 0.1 seconds
Medium dataset: 1.5 ± 0.2 seconds
Large dataset:  2.8 ± 0.3 seconds
```

**Fact Search (100 results):**

```
Small dataset:  0.3 ± 0.05 seconds
Medium dataset: 0.8 ± 0.1 seconds
Large dataset:  1.5 ± 0.2 seconds
```

**Fact Extraction (100 session sections):**

```
With Ollama:    45 ± 5 seconds
Rules only:      2 ± 0.5 seconds
```

**Memory Consolidation:**

```
Small dataset:  1.2 ± 0.2 seconds
Medium dataset: 3.5 ± 0.5 seconds
Large dataset:  8.2 ± 1.0 seconds
```

### E.3 Resource Usage

**Memory Usage (peak):**

```
Boot context:     150 ± 20 MB
Fact extraction:  300 ± 50 MB
Consolidation:    200 ± 30 MB
Idle daemon:       80 ± 10 MB
```

**Storage Requirements:**

```
Per 1,000 facts: 2.5 ± 0.5 MB
Session logs:     50 ± 10 KB per day
Archives:         10 ± 2 KB per day (compressed)
```

**CPU Usage (average):**

```
Boot context:     15 ± 5%
Fact extraction:  60 ± 10%
Consolidation:    40 ± 8%
Idle daemon:       2 ± 1%
```

### E.4 Scalability Metrics

**Concurrent Operations:**

```
5 simultaneous searches:  2.1 ± 0.3 seconds (vs 0.3s single)
10 simultaneous searches: 4.2 ± 0.5 seconds (vs 0.3s single)
```

**Database Growth:**

```
Facts: Linear growth with sessions
Indexes: ~20% overhead
WAL files: Temporary, auto-checkpointed
```

**Network Usage (Ollama):**

```
Per extraction: 50 ± 10 KB request
Average latency: 2 ± 1 seconds
Error rate: <1% (with retries)
```

## Appendix F: Troubleshooting Quick Reference

### F.1 Symptoms and Solutions

**Symptom: Daemon not starting**

```
Check: ps aux | grep claudesy-engine
Solution: Remove lock files, check permissions, restart
Command: rm ~/.claudesy/*.lock; claudesy-engine daemon
```

**Symptom: Slow performance**

```
Check: time claudesy-engine search "test"
Solution: Optimize database, check resources, reduce dataset
Command: sqlite3 memory.db "VACUUM; ANALYZE;"
```

**Symptom: Extraction failing**

```
Check: ollama list; curl http://localhost:11434/api/tags
Solution: Start Ollama, check network, use fallback
Command: ollama serve &
```

**Symptom: Database errors**

```
Check: sqlite3 memory.db "PRAGMA integrity_check;"
Solution: Restore from backup, repair database
Command: ./restore_backup.sh latest_backup.tar.gz
```

**Symptom: Permission errors**

```
Check: ls -la ~/.claudesy
Solution: Fix ownership and permissions
Command: chown -R $USER:$USER ~/.claudesy; chmod -R 755 ~/.claudesy
```

### F.2 Diagnostic Commands

**System Health:**

```bash
claudesy-engine health
```

**Process Status:**

```bash
ps aux | grep claudesy
lsof ~/.claudesy/agents/*/memory.db
```

**Log Analysis:**

```bash
tail -50 ~/.claudesy/logs/claudesy.log
grep ERROR ~/.claudesy/logs/claudesy.log | tail -10
```

**Database Diagnostics:**

```bash
sqlite3 ~/.claudesy/agents/*/memory.db ".dbinfo"
sqlite3 ~/.claudesy/agents/*/memory.db "PRAGMA integrity_check;"
```

**Performance Testing:**

```bash
time claudesy-engine boot
time claudesy-engine search "" --limit 1000
du -sh ~/.claudesy
```

### F.3 Emergency Procedures

**Stop All Operations:**

```bash
pkill -f "claudesy-engine"
pkill -f "ollama"
```

**Force Database Unlock:**

```bash
# Find and kill locking processes
lsof ~/.claudesy/agents/*/memory.db
kill -9 <pid>

# Clear WAL files if needed
rm ~/.claudesy/agents/*/*.db-wal
```

**Complete Reset:**

```bash
# Backup current state
tar czf emergency_backup_$(date +%Y%m%d_%H%M%S).tar.gz ~/.claudesy

# Stop services
systemctl stop claudesy-daemon
systemctl stop ollama

# Clean state
rm -rf ~/.claudesy/agents/*/facts/*.jsonl
rm -rf ~/.claudesy/agents/*/memory.db*

# Restart services
systemctl start ollama
systemctl start claudesy-daemon
```

## Appendix G: Configuration Examples

### G.1 Development Configuration

**Environment Variables:**

```bash
export CLAUDESY_AGENT_NAME=dev_agent
export CLAUDESY_BASE_DIR=/home/user/projects/claudesy-dev
export CLAUDESY_OLLAMA_MODEL=llama3.1:8b
export CLAUDESY_LOG_LEVEL=DEBUG
```

**Python Configuration:**

```python
from claudesy_memory.config import EngineConfig, OllamaConfig

config = EngineConfig(
    agent_name="dev_agent",
    base_dir="/home/user/projects/claudesy-dev",
    ollama=OllamaConfig(
        model="llama3.1:8b",
        timeout_seconds=60
    )
)
```

### G.2 Production Configuration

**Systemd Environment:**

```bash
# /etc/systemd/system/claudesy.env
CLAUDESY_AGENT_NAME=production_agent
CLAUDESY_BASE_DIR=/var/lib/claudesy
CLAUDESY_OLLAMA_URL=http://ollama.internal:11434
CLAUDESY_DECAY_HALF_LIFE_DAYS=45
CLAUDESY_BOOT_MAX_TOKENS=8000
```

**Docker Configuration:**

```yaml
version: "3.8"
services:
  claudesy:
    image: claudesy-memory:latest
    environment:
      - CLAUDESY_AGENT_NAME=prod_agent
      - CLAUDESY_BASE_DIR=/app/data
      - CLAUDESY_OLLAMA_URL=http://ollama:11434
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### G.3 Multi-Agent Configuration

**Agent-Specific Configs:**

```bash
# Agent 1
export CLAUDESY_AGENT_NAME=agent1
export CLAUDESY_BASE_DIR=/var/lib/claudesy/agent1

# Agent 2
export CLAUDESY_AGENT_NAME=agent2
export CLAUDESY_BASE_DIR=/var/lib/claudesy/agent2
```

**Systemd Multi-Instance:**

```bash
# Create separate services
for agent in agent1 agent2 agent3; do
    cat > /etc/systemd/system/claudesy-${agent}.service << EOF
[Unit]
Description=Claudesy Memory Engine - ${agent}

[Service]
Type=simple
User=claudesy-${agent}
Environment=CLAUDESY_AGENT_NAME=${agent}
Environment=CLAUDESY_BASE_DIR=/var/lib/claudesy-${agent}
ExecStart=/usr/local/bin/claudesy-engine daemon
Restart=always

[Install]
WantedBy=multi-user.target
EOF
done
```

## Appendix H: Migration Guide

### H.1 Version Migration

**From 1.0.x to 1.1.0:**

1. Backup existing data
2. Update package: `pip install --upgrade claudesy-memory`
3. Run migration: `claudesy-engine run`
4. Verify functionality: `claudesy-engine health`

**Breaking Changes:**

- Configuration class structure updated
- Default Ollama model changed to `nuextract`
- Archive compression now enabled by default

### H.2 Data Migration

**From Legacy Format:**

```bash
# Export old data (if applicable)
# Transform to new format
# Import into new system

# Example migration script
#!/bin/bash
OLD_DIR="/path/to/old/data"
NEW_DIR="/path/to/new/data"

# Convert old facts to JSONL
find "$OLD_DIR" -name "*.json" -exec \
    jq -c '.facts[]' {} \; > "$NEW_DIR/facts.jsonl"

# Rebuild indexes
claudesy-engine consolidate
```

**Cross-Agent Migration:**

```bash
# Export from source agent
claudesy-engine --agent source_agent search "" --limit 10000 > source_facts.json

# Import to target agent
# (Custom script needed for import)
```

### H.3 System Migration

**Server Migration:**

1. Stop services on old server
2. Backup data: `tar czf backup.tar.gz ~/.claudesy`
3. Transfer backup to new server
4. Install Claudesy on new server
5. Restore data: `tar xzf backup.tar.gz -C /`
6. Start services on new server
7. Update DNS/client configurations

**Cloud Migration:**

```bash
# AWS migration example
aws s3 cp backup.tar.gz s3://migration-bucket/

# On new instance
aws s3 cp s3://migration-bucket/backup.tar.gz .
tar xzf backup.tar.gz -C /
```

## Appendix I: References

### I.1 Academic References

**Memory Systems:**

- Ebbinghaus, H. (1885). _Memory: A Contribution to Experimental Psychology_
- Tulving, E. (1972). Episodic and semantic memory. _Organization of Memory_
- Squire, L. R. (2004). Memory systems of the brain: A brief history and current perspective. _Neurobiology of Learning and Memory_

**Consolidation Theory:**

- Dudai, Y. (2004). The neurobiology of consolidations, or, how stable is the engram? _Annual Review of Psychology_
- McClelland, J. L. (2013). Incorporating rapid neocortical learning of new schema-consistent information into complementary learning systems theory. _Journal of Cognitive Neuroscience_

### I.2 Technical References

**SQLite Documentation:**

- https://www.sqlite.org/docs.html
- https://www.sqlite.org/wal.html (WAL mode)

**Ollama Documentation:**

- https://github.com/jmorganca/ollama
- https://github.com/jmorganca/ollama/blob/main/docs/api.md

**Python Documentation:**

- https://docs.python.org/3/library/sqlite3.html
- https://docs.python.org/3/library/json.html

### I.3 Related Projects

**Memory Systems:**

- MemGPT: https://github.com/cpacker/MemGPT
- LangChain Memory: https://python.langchain.com/docs/modules/memory/
- AutoGen Memory: https://microsoft.github.io/autogen/docs/topics/memory/

**AI Agent Frameworks:**

- CrewAI: https://www.crewai.com/
- LangChain Agents: https://python.langchain.com/docs/modules/agents/
- AutoGen: https://microsoft.github.io/autogen/

### I.4 Standards and Specifications

**Data Formats:**

- JSON Lines (JSONL): https://jsonlines.org/
- ISO 8601 Date/Time: https://www.iso.org/iso-8601-date-and-time-format.html

**API Design:**

- REST API Guidelines: https://restfulapi.net/
- JSON API Specification: https://jsonapi.org/

**Security:**

- OWASP Guidelines: https://owasp.org/www-project-top-ten/
- Python Security Best Practices: https://owasp.org/www-pdf-archive/OWASP_Python_Security.pdf

## Appendix J: Support and Contributing

### J.1 Getting Help

**Documentation:**

- Read the user manual: `docs/USER_MANUAL.md`
- Check troubleshooting: `docs/MAINTENANCE.md`
- Review examples: `docs/APPENDICES.md`

**Community Support:**

- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions and share experiences
- Documentation Issues: Report unclear or missing documentation

**Professional Support:**

- Enterprise support available
- Custom deployment assistance
- Performance optimization consulting

### J.2 Contributing

**Development Setup:**

```bash
git clone <repository-url>
cd claudsy-memory
python -m venv venv
source venv/bin/activate
pip install -e .[dev,test]
```

**Code Standards:**

- Follow PEP 8 style guidelines
- Use type hints for all functions
- Write comprehensive docstrings
- Add unit tests for new features

**Testing:**

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=claudesy_memory

# Run specific tests
pytest tests/unit/test_config.py
```

**Pull Request Process:**

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run full test suite
5. Update documentation
6. Submit pull request

**Documentation Updates:**

- Update relevant docs for code changes
- Add examples for new features
- Update API reference
- Test documentation builds

### J.3 Issue Reporting

**Bug Reports:**

- Use GitHub issue templates
- Include system information
- Provide reproduction steps
- Attach relevant logs

**Feature Requests:**

- Describe the problem being solved
- Explain the proposed solution
- Consider alternative approaches
- Provide use cases

**Security Issues:**

- Report privately to security@claudesy.com
- Do not post security issues publicly
- Include detailed reproduction information

### J.4 License and Attribution

**License:**
This project is licensed under the [MIT License](LICENSE).

**Attributions:**

- Ollama for local LLM capabilities
- SQLite for database functionality
- Python community for excellent libraries
- Open source contributors

**Third-Party Licenses:**

- Electron: MIT License
- SQLite: Public Domain
- Python dependencies: Various permissive licenses

---

This appendices document provides comprehensive reference material for the Claudesy Memory Engine, including technical details, examples, and resources for users and developers.
