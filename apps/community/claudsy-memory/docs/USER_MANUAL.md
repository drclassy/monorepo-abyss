# User Manual - Claudesy Memory Engine

## Table of Contents

1. [Introduction](#1-introduction)
2. [Quick Start](#2-quick-start)
3. [CLI Usage](#3-cli-usage)
4. [GUI Console](#4-gui-console)
5. [Agent Management](#5-agent-management)
6. [Session Logging](#6-session-logging)
7. [Memory Operations](#7-memory-operations)
8. [Search and Inspection](#8-search-and-inspection)
9. [Configuration](#9-configuration)
10. [Troubleshooting](#10-troubleshooting)
11. [Advanced Usage](#11-advanced-usage)
12. [Examples](#12-examples)

## 1. Introduction

The Claudesy Memory Engine is a memory management system for AI agents. It allows agents to store, retrieve, and consolidate contextual information across sessions, enabling persistent learning and improved performance.

This manual covers:

- Installation and setup
- Command-line interface usage
- Graphical console operation
- Memory management workflows
- Configuration options
- Troubleshooting common issues

## 2. Quick Start

### 2.1 Installation

**Prerequisites:**

- Python 3.8 or higher
- SQLite 3 (usually included with Python)
- Ollama (optional, for enhanced extraction)

**Install from source:**

```bash
git clone <repository-url>
cd claudsy-memory
pip install -e .
```

**Verify installation:**

```bash
claudesy-engine --help
```

### 2.2 First Session

1. **Log your first event:**

   ```bash
   claudesy-engine log --title "Getting Started" --description "Setting up Claudesy Memory Engine for the first time."
   ```

2. **Extract facts:**

   ```bash
   claudesy-engine extract
   ```

3. **View stored facts:**

   ```bash
   claudesy-engine search "Getting Started"
   ```

4. **Generate boot context:**
   ```bash
   claudesy-engine boot
   ```

### 2.3 GUI Console (Alternative)

```bash
cd desktop
npm install
npm start
```

## 3. CLI Usage

### 3.1 Command Structure

All commands follow the pattern:

```bash
claudesy-engine [global-options] <command> [command-options]
```

**Global Options:**

- `--agent <name>`: Specify agent name (default: from environment or "claude-code")
- `--base-dir <path>`: Base directory for storage (default: ~/.claudesy)
- `--log-level <level>`: Set logging level (DEBUG, INFO, WARNING, ERROR)

### 3.2 Core Commands

#### 3.2.1 Session Logging

**Log an event:**

```bash
claudesy-engine log --title "Meeting Notes" --description "Discussed project architecture and timeline."
```

**Log with decision:**

```bash
claudesy-engine log --title "Architecture Decision" --description "Chose microservices over monolith for scalability." --decision "Proceed with microservices implementation."
```

**Log with tags:**

```bash
claudesy-engine log --title "Bug Fix" --description "Fixed memory leak in extraction process." --tags "bug,performance,extraction"
```

#### 3.2.2 Memory Operations

**Run full cycle (archive, extract, consolidate):**

```bash
claudesy-engine run
```

**Extract facts from latest session:**

```bash
claudesy-engine extract
```

**Extract from specific file:**

```bash
claudesy-engine extract --file /path/to/session.md
```

**Consolidate memory:**

```bash
claudesy-engine consolidate
```

**Generate boot context:**

```bash
claudesy-engine boot
```

#### 3.2.3 Search and Inspection

**Search facts:**

```bash
claudesy-engine search "Python programming"
```

**Search with filters:**

```bash
claudesy-engine search "error" --category semantic --limit 10
```

**Inspect specific fact:**

```bash
claudesy-engine inspect --id fact_001
```

**List recent facts:**

```bash
claudesy-engine inspect --limit 5
```

#### 3.2.4 Background Processing

**Start daemon:**

```bash
claudesy-engine daemon
```

**Daemon with custom interval:**

```bash
claudesy-engine daemon --interval-seconds 600
```

**Daemon in consolidate-only mode:**

```bash
claudesy-engine daemon --mode consolidate
```

#### 3.2.5 Health and Status

**Check system health:**

```bash
claudesy-engine health
```

### 3.3 Command Reference

#### log

Append an event to today's session log.

**Options:**

- `--title <text>`: Event title (required)
- `--description <text>`: Event description (required)
- `--decision <text>`: Optional decision made
- `--tags <csv>`: Comma-separated tags

**Example:**

```bash
claudesy-engine log \
  --title "Code Review" \
  --description "Reviewed pull request #123 for authentication improvements." \
  --decision "Approved with minor changes requested." \
  --tags "review,security,authentication"
```

#### extract

Extract facts from session logs using hybrid AI/rule-based approach.

**Options:**

- `--file <path>`: Specific session file to process (default: latest)

**Example:**

```bash
# Extract from latest session
claudesy-engine extract

# Extract from specific file
claudesy-engine extract --file sessions/2024-01-15.md
```

#### consolidate

Rebuild long-term memory from extracted facts, applying decay and deduplication.

**Example:**

```bash
claudesy-engine consolidate
```

#### search

Search stored facts using full-text search.

**Options:**

- `--category <type>`: Filter by category (semantic/episodic/procedural/preference)
- `--status <status>`: Filter by status (active/superseded/deleted)
- `--limit <number>`: Maximum results (default: 10)

**Examples:**

```bash
# Search all facts
claudesy-engine search "database"

# Search semantic facts only
claudesy-engine search "architecture" --category semantic

# Search with limit
claudesy-engine search "error" --limit 20
```

#### inspect

View detailed information about facts.

**Options:**

- `--id <fact_id>`: Specific fact ID to inspect
- `--category <type>`: Filter by category
- `--limit <number>`: Number of recent facts to show (default: 10)

**Examples:**

```bash
# Show recent facts
claudesy-engine inspect

# Inspect specific fact
claudesy-engine inspect --id fact_abc123

# Show recent semantic facts
claudesy-engine inspect --category semantic --limit 5
```

#### daemon

Run background daemon for automated memory consolidation.

**Options:**

- `--interval-seconds <seconds>`: Polling interval (default: 300)
- `--mode <mode>`: Operation mode (full/consolidate, default: full)

**Examples:**

```bash
# Standard daemon (archive + extract + consolidate every 5 minutes)
claudesy-engine daemon

# Consolidate only every 10 minutes
claudesy-engine daemon --interval-seconds 600 --mode consolidate
```

#### health

Display system health and status information.

**Output includes:**

- Database connectivity
- File system access
- Ollama service status
- Memory statistics
- Recent activity

**Example:**

```bash
claudesy-engine health
```

## 4. GUI Console

### 4.1 Starting the Console

```bash
cd desktop
npm install
npm start
```

The console provides a graphical interface for memory management.

### 4.2 Interface Overview

**Main Areas:**

- **Agent Selector**: Choose active agent
- **Document Editor**: Edit identity documents (SOUL.md, MEMORY.md, SKILLS.md)
- **Activity Log**: Real-time operation log
- **Control Panel**: Execute commands and view status

### 4.3 Agent Management

- **Select Agent**: Use dropdown to switch between agents
- **Agent Status**: View memory statistics and health
- **Settings**: Configure daemon intervals and modes

### 4.4 Document Editing

**Identity Documents:**

- **SOUL.md**: Agent's core identity and personality
- **MEMORY.md**: Long-term memory and context
- **SKILLS.md**: Agent's capabilities and expertise

**Editing Features:**

- Syntax highlighting for Markdown
- Auto-save on changes
- Version history (basic)

### 4.5 Activity Monitoring

**Activity Types:**

- Command execution results
- Daemon operations
- Error messages
- Health status updates

**Filtering:**

- Filter by activity type
- Search activity log
- Export log to file

### 4.6 Command Execution

**Quick Commands:**

- Run full memory cycle
- Extract latest facts
- Consolidate memory
- Generate boot context

**Custom Commands:**

- Execute arbitrary CLI commands
- View command output
- Copy commands for reuse

## 5. Agent Management

### 5.1 Creating Agents

Agents are automatically created when first used:

```bash
# Switch to new agent
claudesy-engine --agent my_agent log --title "First Event" --description "Initializing new agent."
```

### 5.2 Agent Isolation

Each agent has isolated storage:

```
~/.claudesy/
├── agents/
│   ├── agent1/
│   │   ├── facts/
│   │   ├── sessions/
│   │   ├── identity/
│   │   └── memory.db
│   └── agent2/
│       ├── facts/
│       ├── sessions/
│       ├── identity/
│       └── memory.db
```

### 5.3 Agent Configuration

Configure per-agent settings:

```bash
# Agent-specific base directory
claudesy-engine --agent agent1 --base-dir /custom/path run

# Environment variables
export CLAUDESY_AGENT_NAME=agent1
claudesy-engine run
```

### 5.4 Switching Agents

```bash
# CLI switching
claudesy-engine --agent agent1 health
claudesy-engine --agent agent2 health

# GUI switching
# Use agent selector dropdown in console
```

## 6. Session Logging

### 6.1 Session Format

Sessions are stored as daily Markdown files:

```markdown
# Session Log - 2024-01-15

### 09:30 - Morning Standup

Discussed project progress and blockers.
Decision: Focus on critical bug fixes this week.
Tags: meeting,planning

### 14:00 - Code Review

Reviewed authentication module implementation.
Approved with suggestions for error handling improvements.
Tags: review,security
```

### 6.2 Logging Best Practices

**Event Titles:**

- Use descriptive, actionable titles
- Include context (e.g., "API Design Review" vs "Meeting")

**Descriptions:**

- Be specific and detailed
- Include relevant technical details
- Note outcomes and decisions

**Tags:**

- Use consistent tagging
- Common tags: bug, feature, meeting, review, architecture, performance

**Decisions:**

- Document important choices
- Explain reasoning when possible
- Reference alternatives considered

### 6.3 Batch Logging

For logging multiple events:

```bash
# Log multiple events in sequence
claudesy-engine log --title "Task 1" --description "Completed task 1"
claudesy-engine log --title "Task 2" --description "Completed task 2"

# Or use a script
#!/bin/bash
events=(
    "Task 1:Completed task 1"
    "Task 2:Completed task 2"
)

for event in "${events[@]}"; do
    IFS=':' read -r title desc <<< "$event"
    claudesy-engine log --title "$title" --description "$desc"
done
```

## 7. Memory Operations

### 7.1 Memory Cycle

The standard memory workflow:

1. **Archive**: Compress old session files
2. **Extract**: Process sessions into facts
3. **Consolidate**: Apply decay and deduplication

**Manual execution:**

```bash
claudesy-engine run
```

**Automated (daemon):**

```bash
claudesy-engine daemon
```

### 7.2 Fact Categories

Facts are categorized automatically:

- **Semantic**: Factual knowledge, architecture decisions, technical knowledge
- **Episodic**: Session-specific events, experiences, meetings
- **Procedural**: Workflows, procedures, step-by-step processes
- **Preference**: Agent preferences, policies, directives

### 7.3 Memory Decay

Facts naturally decay over time following Ebbinghaus curve:

- Half-life: 30 days
- Access boost: +8% importance per access
- Pruning: Facts below 20% importance are removed

### 7.4 Boot Context

Generate context for agent initialization:

```bash
claudesy-engine boot
```

**Includes:**

- Agent identity (SOUL.md)
- Recent semantic facts
- Latest session summaries
- Skills and capabilities

**Token limiting:**

- Default: 4000 tokens
- Configurable via environment
- Prioritizes most important information

## 8. Search and Inspection

### 8.1 Search Syntax

Full-text search across fact content:

```bash
# Simple search
claudesy-engine search "database"

# Phrase search
claudesy-engine search "error handling"

# Multiple terms
claudesy-engine search "python flask"
```

### 8.2 Search Filters

**Category filtering:**

```bash
claudesy-engine search "architecture" --category semantic
```

**Status filtering:**

```bash
claudesy-engine search "deprecated" --status superseded
```

**Combined filters:**

```bash
claudesy-engine search "security" --category semantic --status active --limit 5
```

### 8.3 Fact Inspection

**View fact details:**

```bash
claudesy-engine inspect --id fact_abc123
```

**Output includes:**

- Fact ID and category
- Content and importance
- Creation and access timestamps
- Access count and status
- Related facts

**List recent facts:**

```bash
claudesy-engine inspect --limit 10
```

## 9. Configuration

### 9.1 Environment Variables

**Core Settings:**

```bash
export CLAUDESY_AGENT_NAME=my_agent
export CLAUDESY_BASE_DIR=/path/to/storage
export CLAUDESY_OLLAMA_MODEL=nuextract
export CLAUDESY_OLLAMA_URL=http://localhost:11434
```

**Advanced Settings:**

```bash
export CLAUDESY_OLLAMA_FALLBACK_MODEL=llama3.1:8b
export CLAUDESY_OLLAMA_TIMEOUT_SECONDS=90
```

### 9.2 Configuration Files

Create `config.py` or use environment:

```python
# config.py
from claudesy_memory.config import EngineConfig

config = EngineConfig(
    agent_name="custom_agent",
    base_dir="/custom/path",
    ollama=OllamaConfig(
        model="custom-model",
        temperature=0.1
    ),
    decay=DecayConfig(
        half_life_days=45,
        access_boost=0.1
    )
)
```

### 9.3 Runtime Configuration

Override settings per command:

```bash
# Temporary agent switch
claudesy-engine --agent temp_agent log --title "Test" --description "Testing"

# Custom base directory
claudesy-engine --base-dir /tmp/memory run
```

## 10. Troubleshooting

### 10.1 Common Issues

**"Ollama service unavailable"**

```
Error: Ollama models nuextract and llama3.1:8b failed
```

**Solution:**

- Ensure Ollama is running: `ollama serve`
- Check model availability: `ollama list`
- Pull models: `ollama pull nuextract`
- System falls back to rule-based extraction

**"Database locked"**

```
Error: database is locked
```

**Solution:**

- Wait for other operations to complete
- Check for crashed processes
- Restart daemon if running

**"Permission denied"**

```
Error: [Errno 13] Permission denied
```

**Solution:**

- Check directory permissions: `ls -la ~/.claudesy`
- Ensure user owns directories
- Run with appropriate user account

### 10.2 Health Checks

**System health:**

```bash
claudesy-engine health
```

**Database integrity:**

```bash
sqlite3 ~/.claudesy/agents/agent_name/memory.db "PRAGMA integrity_check;"
```

**File system check:**

```bash
find ~/.claudesy -type f -exec file {} \; | grep -v "SQLite"
```

### 10.3 Log Analysis

**View application logs:**

```bash
tail -f ~/.claudesy/logs/claudesy.log
```

**Debug logging:**

```bash
claudesy-engine --log-level DEBUG run
```

**Log rotation:**

- Logs are rotated automatically
- Old logs: `~/.claudesy/logs/claudesy.log.1`, etc.

### 10.4 Recovery Procedures

**Corrupted session file:**

```bash
# Backup corrupted file
cp sessions/2024-01-15.md sessions/2024-01-15.md.backup

# Edit manually or recreate
# Then re-extract
claudesy-engine extract --file sessions/2024-01-15.md
```

**Lost facts:**

```bash
# Re-extract from all sessions
find sessions -name "*.md" -exec claudesy-engine extract --file {} \;

# Re-consolidate
claudesy-engine consolidate
```

**Daemon not responding:**

```bash
# Find daemon process
ps aux | grep claudesy-engine

# Kill if necessary
kill <pid>

# Restart
claudesy-engine daemon
```

### 10.5 Performance Issues

**Slow extraction:**

- Check Ollama performance
- Reduce session file size
- Use rules-only mode: stop Ollama service

**High memory usage:**

- Monitor with `top` or `htop`
- Check for memory leaks in daemon
- Restart daemon periodically

**Slow search:**

- Rebuild search indexes
- Check database fragmentation
- Consider database optimization

## 11. Advanced Usage

### 11.1 Custom Extraction Rules

Modify extraction patterns in code:

```python
# In extractor.py, add custom rules
custom_rules = [
    (re.compile(r"(?i)(custom|pattern)"), "semantic", 0.85),
]
```

### 11.2 Batch Operations

**Process multiple sessions:**

```bash
# Extract from all sessions in date range
for file in sessions/2024-01-*.md; do
    claudesy-engine extract --file "$file"
done
```

**Bulk search and export:**

```bash
# Export all facts to JSON
claudesy-engine search "" --limit 10000 > all_facts.json
```

### 11.3 Integration with Scripts

**Python integration:**

```python
from claudesy_memory import ClaudesyEngine

engine = ClaudesyEngine()
logger = engine.logger()

# Log event
from claudesy_memory.models import SessionEvent
event = SessionEvent("Script Event", "Logged from Python script")
logger.log_event(event)

# Get boot context
context = engine.boot_loader.boot_context(engine.config.agent_name)
print(context)
```

**Shell scripting:**

```bash
#!/bin/bash
# Daily memory maintenance
claudesy-engine run

# Backup memory
tar czf memory_backup_$(date +%Y%m%d).tar.gz ~/.claudesy

# Health check
if ! claudesy-engine health > /dev/null; then
    echo "Memory system unhealthy" | mail -s "Alert" admin@example.com
fi
```

### 11.4 Monitoring and Alerts

**Nagios/Icinga check:**

```bash
#!/bin/bash
# check_claudesy_health.sh
OUTPUT=$(claudesy-engine health 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    echo "OK - $OUTPUT"
    exit 0
else
    echo "CRITICAL - $OUTPUT"
    exit 2
fi
```

**Prometheus metrics:**

```python
# metrics.py
from prometheus_client import Gauge, Counter

facts_total = Gauge('claudesy_facts_total', 'Total stored facts', ['agent', 'category'])
extraction_duration = Gauge('claudesy_extraction_duration_seconds', 'Extraction duration')
```

## 12. Examples

### 12.1 Development Workflow

```bash
# Start of day
claudesy-engine boot > context.txt

# During development
claudesy-engine log --title "Feature Implementation" --description "Implemented user authentication with JWT tokens."

# Code review
claudesy-engine log --title "Code Review" --description "Reviewed PR #456, approved with suggestions." --tags "review,security"

# End of day
claudesy-engine run

# Search for similar work
claudesy-engine search "authentication"
```

### 12.2 Research Workflow

```bash
# Log research findings
claudesy-engine log --title "Literature Review" --description "Reviewed papers on memory consolidation algorithms." --tags "research,ml"

# Document insights
claudesy-engine log --title "Algorithm Insight" --description "Ebbinghaus curve provides good model for fact decay." --decision "Implement exponential decay with access boosting."

# Extract and consolidate
claudesy-engine run

# Find related research
claudesy-engine search "memory consolidation" --category semantic
```

### 12.3 Team Collaboration

```bash
# Daily standup
claudesy-engine log --title "Standup" --description "Completed API endpoints, starting on frontend integration." --tags "meeting,daily"

# Share knowledge
claudesy-engine log --title "Knowledge Share" --description "Documented OAuth2 flow implementation in wiki." --tags "documentation,oauth"

# Sprint retrospective
claudesy-engine log --title "Sprint Retrospective" --description "Good progress on core features, need better testing." --decision "Add automated testing pipeline."

# Team learning
claudesy-engine search "testing" --category procedural
```

### 12.4 Automated Agent Integration

```python
# agent_integration.py
import subprocess
from claudesy_memory import ClaudesyEngine

class MemoryEnabledAgent:
    def __init__(self):
        self.engine = ClaudesyEngine()

    def log_interaction(self, user_input, agent_response, outcome):
        """Log agent interactions for learning."""
        title = f"Interaction: {user_input[:50]}..."
        description = f"User: {user_input}\nAgent: {agent_response}\nOutcome: {outcome}"
        tags = ["interaction", "learning"]

        if "error" in outcome.lower():
            tags.append("error")

        subprocess.run([
            "claudesy-engine", "log",
            "--title", title,
            "--description", description,
            "--tags", ",".join(tags)
        ])

    def get_context(self):
        """Get relevant context for response generation."""
        result = subprocess.run(
            ["claudesy-engine", "boot"],
            capture_output=True, text=True
        )
        return result.stdout

    def learn_from_interaction(self):
        """Process recent interactions into memory."""
        subprocess.run(["claudesy-engine", "run"])
```

### 12.5 Backup and Recovery

```bash
#!/bin/bash
# backup_memory.sh
BACKUP_DIR="/backups/claudesy"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mkdir -p "$BACKUP_DIR"
tar czf "$BACKUP_DIR/memory_$DATE.tar.gz" ~/.claudesy

# Verify backup
if tar tf "$BACKUP_DIR/memory_$DATE.tar.gz" > /dev/null; then
    echo "Backup successful: memory_$DATE.tar.gz"

    # Clean old backups (keep last 7 days)
    find "$BACKUP_DIR" -name "memory_*.tar.gz" -mtime +7 -delete
else
    echo "Backup failed!"
    exit 1
fi
```

```bash
#!/bin/bash
# restore_memory.sh
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop daemon if running
pkill -f "claudesy-engine daemon" || true

# Restore backup
tar xzf "$BACKUP_FILE" -C /

# Restart daemon
claudesy-engine daemon &

echo "Memory restored from $BACKUP_FILE"
```

This comprehensive user manual provides all the information needed to effectively use the Claudesy Memory Engine for AI agent memory management.
