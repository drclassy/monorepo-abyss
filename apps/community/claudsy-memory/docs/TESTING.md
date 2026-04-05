# Testing Procedures

## Current Repository Status

The executable regression suite currently shipped in this repository is the root-level file `test_claudesy_engine.py`.

Run it with:

```bash
python -m unittest test_claudesy_engine.py -v
```

The broader `pytest tests/...` matrix described below remains a target structure and should not be treated as available in the current workspace until those test directories are added back.

## 1. Testing Overview

The Claudesy Memory Engine employs a comprehensive testing strategy combining unit tests, integration tests, performance benchmarks, and manual testing procedures. Testing focuses on reliability, performance, and correctness across all components.

## 2. Test Environment Setup

### 2.1 Prerequisites

- Python 3.8+
- pytest testing framework
- Ollama server (for integration tests)
- Test data fixtures

### 2.2 Test Directory Structure

```
tests/
├── unit/
│   ├── test_boot.py
│   ├── test_config.py
│   ├── test_consolidator.py
│   ├── test_extractor.py
│   ├── test_models.py
│   ├── test_storage.py
│   └── test_session_logger.py
├── integration/
│   ├── test_engine.py
│   ├── test_cli.py
│   └── test_daemon.py
├── performance/
│   ├── test_benchmarks.py
│   └── test_load.py
├── fixtures/
│   ├── sample_sessions/
│   ├── expected_facts/
│   └── test_configs/
└── conftest.py
```

### 2.3 Test Configuration

```python
# conftest.py
import pytest
import tempfile
from pathlib import Path
from claudesy_memory import EngineConfig, ClaudesyEngine

@pytest.fixture
def temp_dir():
    with tempfile.TemporaryDirectory() as tmp:
        yield Path(tmp)

@pytest.fixture
def test_config(temp_dir):
    return EngineConfig(
        agent_name="test_agent",
        base_dir=temp_dir,
        ollama=None  # Disable Ollama for unit tests
    )

@pytest.fixture
def test_engine(test_config):
    return ClaudesyEngine(test_config)
```

## 3. Unit Testing Procedures

### 3.1 Configuration Testing

**Test File**: `tests/unit/test_config.py`

```python
import os
from claudesy_memory.config import EngineConfig, OllamaConfig

def test_config_from_env():
    """Test configuration loading from environment variables."""
    os.environ["CLAUDESY_AGENT_NAME"] = "test_agent"
    os.environ["CLAUDESY_OLLAMA_MODEL"] = "test_model"

    config = EngineConfig()
    assert config.agent_name == "test_agent"
    assert config.ollama.model == "test_model"

def test_ollama_config_defaults():
    """Test Ollama configuration defaults."""
    config = OllamaConfig()
    assert config.model == "nuextract"
    assert config.base_url == "http://localhost:11434"
    assert config.temperature == 0.0
```

**Execution**:

```bash
pytest tests/unit/test_config.py -v
```

### 3.2 Storage Testing

**Test File**: `tests/unit/test_storage.py`

```python
import json
from claudesy_memory.storage import MemoryStorage, normalize_text

def test_normalize_text():
    """Test text normalization for deduplication."""
    assert normalize_text("Hello, World!") == "hello world"
    assert normalize_text("Python 3.8+") == "python 3.8"

def test_fact_storage(test_config):
    """Test fact storage and retrieval."""
    storage = MemoryStorage(test_config)

    fact = {
        "id": "test_fact_001",
        "category": "semantic",
        "fact": "Test fact",
        "importance": 0.8,
        "created": "2024-01-01T00:00:00Z",
        "last_accessed": "2024-01-01T00:00:00Z",
        "access_count": 1,
        "status": "active"
    }

    # Store fact
    storage.store_fact("test_agent", fact)

    # Retrieve facts
    facts = storage.load_grouped_facts("test_agent")
    assert len(facts["semantic"]) == 1
    assert facts["semantic"][0]["fact"] == "Test fact"
```

**Execution**:

```bash
pytest tests/unit/test_storage.py -v
```

### 3.3 Extractor Testing

**Test File**: `tests/unit/test_extractor.py`

```python
from unittest.mock import Mock
from claudesy_memory.extractor import MemoryExtractor

def test_prefilter_extraction(test_config):
    """Test rule-based fact extraction."""
    storage = Mock()
    extractor = MemoryExtractor(test_config, storage)

    session_text = """
    ### 10:00 - Architecture Decision
    We decided to use SQLite for the database due to its reliability.
    This is a semantic fact about our system design.
    """

    facts = extractor.prefilter_session(session_text)
    assert len(facts) >= 1
    assert any("architecture" in fact["text"].lower() for fact in facts)

def test_category_assignment():
    """Test that facts are assigned to correct categories."""
    # Test semantic category
    assert extractor._find_best_category("error handling is important") == ("semantic", 0.72)
    # Test procedural category
    assert extractor._find_best_category("follow these steps") == ("procedural", 0.80)
    # Test preference category
    assert extractor._find_best_category("always use virtual environments") == ("preference", 0.82)
```

**Execution**:

```bash
pytest tests/unit/test_extractor.py -v
```

### 3.4 Consolidator Testing

**Test File**: `tests/unit/test_consolidator.py`

```python
from datetime import datetime, timezone
from claudesy_memory.consolidator import calculate_decay

def test_decay_calculation(test_config):
    """Test memory decay algorithm."""
    # Fresh fact (high importance)
    importance = calculate_decay(1.0, datetime.now(timezone.utc).isoformat(), 0, test_config)
    assert importance == 1.0

    # Old fact with access boost
    old_time = (datetime.now(timezone.utc).replace(year=2023)).isoformat()
    importance = calculate_decay(1.0, old_time, 5, test_config)
    # Should be decayed but boosted by access
    assert 0.0 < importance < 1.0

def test_deduplication():
    """Test fact deduplication."""
    consolidator = MemoryConsolidator(test_config, Mock())

    facts = [
        {"id": "1", "fact": "Use Python for scripting", "importance": 0.8},
        {"id": "2", "fact": "use python for scripting", "importance": 0.6},  # Duplicate
        {"id": "3", "fact": "JavaScript is for web development", "importance": 0.9}
    ]

    deduplicated = consolidator._deduplicate(facts)
    assert len(deduplicated) == 2  # One duplicate removed
    # Higher importance fact should be kept
    python_facts = [f for f in deduplicated if "python" in f["fact"].lower()]
    assert len(python_facts) == 1
    assert python_facts[0]["importance"] == 0.8
```

**Execution**:

```bash
pytest tests/unit/test_consolidator.py -v
```

### 3.5 Boot Loader Testing

**Test File**: `tests/unit/test_boot.py`

```python
from unittest.mock import Mock, patch
from claudesy_memory.boot import BootLoader

def test_boot_context_assembly(test_config):
    """Test boot context generation."""
    storage = Mock()
    storage.read_identity.side_effect = lambda agent, file: {
        "SOUL.md": "I am an AI assistant.",
        "MEMORY.md": "I remember important facts.",
        "SKILLS.md": "I can write code."
    }.get(file)

    storage.load_grouped_facts.return_value = {
        "semantic": [{"fact": "Python is great", "created": "2024-01-01"}],
        "episodic": [],
        "procedural": [],
        "preference": []
    }

    boot_loader = BootLoader(test_config, storage)
    context = boot_loader.boot_context("test_agent")

    assert "I am an AI assistant" in context
    assert "Python is great" in context

def test_token_budgeting():
    """Test that boot context respects token limits."""
    # Mock estimate_tokens to return predictable values
    with patch('claudesy_memory.storage.estimate_tokens') as mock_estimate:
        mock_estimate.return_value = 100

        # Set low token budget
        test_config.boot.max_tokens = 150
        boot_loader = BootLoader(test_config, Mock())

        # Should fit 1 section but not 2
        sections = [
            ("section1", "Content 1", 1),
            ("section2", "Content 2", 2)
        ]

        result = boot_loader._fit_sections(sections)
        assert "Content 1" in result
        assert "Content 2" not in result
```

**Execution**:

```bash
pytest tests/unit/test_boot.py -v
```

## 4. Integration Testing Procedures

### 4.1 Engine Integration

**Test File**: `tests/integration/test_engine.py`

```python
def test_full_memory_cycle(test_engine, temp_dir):
    """Test complete memory cycle: log → extract → consolidate."""
    # Log an event
    logger = test_engine.logger()
    event = SessionEvent("Test Event", "This is a test session event about Python programming.")
    logger.log_event(event)

    # Extract facts
    facts = test_engine.extractor.extract_latest()
    assert len(facts) > 0

    # Consolidate memory
    test_engine.consolidator.consolidate()

    # Verify facts were stored
    stored_facts = test_engine.storage.load_grouped_facts(test_engine.config.agent_name)
    total_facts = sum(len(facts) for facts in stored_facts.values())
    assert total_facts > 0

def test_agent_isolation(test_config):
    """Test that agents have isolated memory spaces."""
    engine1 = ClaudesyEngine(test_config)
    config2 = test_config.copy()
    config2.agent_name = "agent2"
    engine2 = ClaudesyEngine(config2)

    # Add fact to agent1
    fact = {"id": "test_001", "category": "semantic", "fact": "Agent1 fact", "importance": 0.8,
            "created": "2024-01-01T00:00:00Z", "last_accessed": "2024-01-01T00:00:00Z", "access_count": 1}
    engine1.storage.store_fact("agent1", fact)

    # Agent2 should not see agent1's facts
    facts2 = engine2.storage.load_grouped_facts("agent2")
    total_facts2 = sum(len(facts) for facts in facts2.values())
    assert total_facts2 == 0
```

**Execution**:

```bash
pytest tests/integration/test_engine.py -v
```

### 4.2 CLI Integration

**Test File**: `tests/integration/test_cli.py`

```python
import subprocess
from pathlib import Path

def test_cli_log_command(temp_dir):
    """Test CLI log command."""
    # Create test session
    result = subprocess.run([
        "python", "-m", "claudesy_memory.cli",
        "--agent", "test_agent",
        "--base-dir", str(temp_dir),
        "log",
        "--title", "Test Event",
        "--description", "Test description"
    ], capture_output=True, text=True)

    assert result.returncode == 0
    assert "Event logged" in result.stdout

    # Verify session file was created
    session_file = temp_dir / "agents" / "test_agent" / "sessions" / "2024-01-01.md"
    assert session_file.exists()
    content = session_file.read_text()
    assert "Test Event" in content

def test_cli_extract_command(temp_dir):
    """Test CLI extract command."""
    # First log an event
    subprocess.run([
        "python", "-m", "claudesy_memory.cli",
        "--agent", "test_agent",
        "--base-dir", str(temp_dir),
        "log",
        "--title", "Architecture Decision",
        "--description", "We chose SQLite for its reliability and ease of use."
    ], capture_output=True)

    # Extract facts
    result = subprocess.run([
        "python", "-m", "claudesy_memory.cli",
        "--agent", "test_agent",
        "--base-dir", str(temp_dir),
        "extract"
    ], capture_output=True, text=True)

    assert result.returncode == 0
    assert "Extracted" in result.stdout
```

**Execution**:

```bash
pytest tests/integration/test_cli.py -v
```

### 4.3 Daemon Integration

**Test File**: `tests/integration/test_daemon.py`

```python
import time
import signal
from multiprocessing import Process
from claudesy_memory.scheduler import MemoryDaemon

def test_daemon_operation(test_engine):
    """Test daemon background operation."""
    daemon = MemoryDaemon(test_engine)

    # Start daemon in background process
    def run_daemon():
        daemon.start(interval_seconds=1, mode="consolidate")

    process = Process(target=run_daemon)
    process.start()

    # Wait a bit
    time.sleep(2)

    # Stop daemon
    process.terminate()
    process.join(timeout=5)

    assert not process.is_alive()

def test_daemon_signal_handling(test_engine):
    """Test daemon responds to signals."""
    daemon = MemoryDaemon(test_engine)

    def run_daemon():
        daemon.start(interval_seconds=10)  # Long interval

    process = Process(target=run_daemon)
    process.start()

    # Send SIGTERM
    process.terminate()
    process.join(timeout=5)

    assert not process.is_alive()
```

**Execution**:

```bash
pytest tests/integration/test_daemon.py -v
```

## 5. Performance Testing Procedures

### 5.1 Benchmark Tests

**Test File**: `tests/performance/test_benchmarks.py`

```python
import time
import pytest
from claudesy_memory.storage import estimate_tokens

def test_boot_context_performance(test_engine):
    """Benchmark boot context generation."""
    # Create many facts
    for i in range(1000):
        fact = {
            "id": f"bench_fact_{i}",
            "category": "semantic",
            "fact": f"Benchmark fact number {i} with some content to make it realistic.",
            "importance": 0.5,
            "created": "2024-01-01T00:00:00Z",
            "last_accessed": "2024-01-01T00:00:00Z",
            "access_count": 1
        }
        test_engine.storage.store_fact(test_engine.config.agent_name, fact)

    # Benchmark boot context generation
    start_time = time.time()
    context = test_engine.boot_loader.boot_context(test_engine.config.agent_name)
    duration = time.time() - start_time

    # Should complete within 5 seconds
    assert duration < 5.0
    # Should contain some facts
    assert len(context) > 100

def test_extraction_performance():
    """Benchmark fact extraction."""
    # Create large session text
    session_lines = []
    for i in range(100):
        session_lines.append(f"### {i:02d}:00 - Event {i}")
        session_lines.append(f"This is event number {i} with some detailed description.")
        session_lines.append("It contains information about system architecture and decisions.")
        session_lines.append("")

    session_text = "\n".join(session_lines)

    start_time = time.time()
    facts = test_engine.extractor.prefilter_session(session_text)
    duration = time.time() - start_time

    # Should complete within 1 second
    assert duration < 1.0
    assert len(facts) > 0

def test_search_performance(test_engine):
    """Benchmark fact search."""
    # Create many facts
    for i in range(1000):
        fact = {
            "id": f"search_fact_{i}",
            "category": "semantic",
            "fact": f"Searchable content number {i} about Python programming.",
            "importance": 0.5,
            "created": "2024-01-01T00:00:00Z",
            "last_accessed": "2024-01-01T00:00:00Z",
            "access_count": 1
        }
        test_engine.storage.store_fact(test_engine.config.agent_name, fact)

    # Benchmark search
    start_time = time.time()
    results = test_engine.storage.search_facts("Python", limit=50)
    duration = time.time() - start_time

    # Should complete within 2 seconds
    assert duration < 2.0
    assert len(results) > 0
```

**Execution**:

```bash
pytest tests/performance/test_benchmarks.py -v --tb=short
```

### 5.2 Load Testing

**Test File**: `tests/performance/test_load.py`

```python
def test_concurrent_operations(test_engine):
    """Test concurrent read/write operations."""
    import threading
    import queue

    results = queue.Queue()
    errors = queue.Queue()

    def worker(worker_id):
        try:
            # Each worker performs operations
            for i in range(10):
                fact = {
                    "id": f"load_fact_{worker_id}_{i}",
                    "category": "semantic",
                    "fact": f"Load test fact from worker {worker_id} iteration {i}",
                    "importance": 0.5,
                    "created": "2024-01-01T00:00:00Z",
                    "last_accessed": "2024-01-01T00:00:00Z",
                    "access_count": 1
                }
                test_engine.storage.store_fact(test_engine.config.agent_name, fact)

            # Read facts
            facts = test_engine.storage.load_grouped_facts(test_engine.config.agent_name)
            total_facts = sum(len(fact_list) for fact_list in facts.values())
            results.put(total_facts)

        except Exception as e:
            errors.put(e)

    # Start multiple workers
    threads = []
    for i in range(5):
        t = threading.Thread(target=worker, args=(i,))
        threads.append(t)
        t.start()

    # Wait for completion
    for t in threads:
        t.join()

    # Check results
    assert errors.empty(), f"Errors occurred: {list(errors.queue)}"
    total_results = 0
    while not results.empty():
        total_results += results.get()

    assert total_results > 0
```

**Execution**:

```bash
pytest tests/performance/test_load.py -v --tb=short
```

## 6. Manual Testing Procedures

### 6.1 Installation Testing

1. **Clean Environment Setup**

   ```bash
   # Create isolated Python environment
   python -m venv test_env
   source test_env/bin/activate  # On Windows: test_env\Scripts\activate

   # Install package
   pip install -e .
   ```

2. **Dependency Verification**

   ```bash
   # Check Python version
   python --version  # Should be 3.8+

   # Verify SQLite
   python -c "import sqlite3; print('SQLite available')"

   # Check Ollama (optional)
   curl http://localhost:11434/api/tags
   ```

3. **Basic Functionality Test**

   ```bash
   # Test CLI help
   claudesy-engine --help

   # Test basic log command
   claudesy-engine log --title "Test" --description "Manual test"
   ```

### 6.2 GUI Testing

1. **Web Dashboard Setup**

   ```bash
   npm install
   npm run dev
   ```

2. **Web Dashboard Functionality Tests**
   - Agent selection and switching
   - Document editing (SOUL.md, MEMORY.md, SKILLS.md)
   - Activity log display
   - Command execution buttons
   - Search flow and health panel

3. **Browser Validation**
   - Desktop Chrome/Edge latest stable
   - Responsive pass for laptop and tablet widths
   - Error-state visibility for failed commands or document saves

4. **Cross-Platform GUI Testing**
   - Windows: Test with different DPI settings
   - macOS: Test with dark mode
   - Linux: Test with various window managers

### 6.3 Data Integrity Testing

1. **File System Corruption Test**

   ```bash
   # Create test data
   claudesy-engine log --title "Test" --description "Data integrity test"

   # Simulate file corruption
   # Edit session file manually to introduce errors

   # Test recovery
   claudesy-engine extract
   ```

2. **Database Integrity Test**

   ```bash
   # Check database file
   sqlite3 ~/.claudesy/agents/test_agent/memory.db ".schema"
   sqlite3 ~/.claudesy/agents/test_agent/memory.db "SELECT COUNT(*) FROM facts;"

   # Test database recovery
   sqlite3 ~/.claudesy/agents/test_agent/memory.db "PRAGMA integrity_check;"
   ```

### 6.4 Performance Manual Testing

1. **Large Dataset Testing**

   ```bash
   # Create many session entries
   for i in {1..100}; do
     claudesy-engine log --title "Entry $i" --description "Large dataset test entry $i"
   done

   # Time extraction
   time claudesy-engine extract

   # Time consolidation
   time claudesy-engine consolidate

   # Time boot context
   time claudesy-engine boot
   ```

2. **Memory Usage Testing**

   ```bash
   # Monitor memory usage during operations
   /usr/bin/time -v claudesy-engine run

   # Check for memory leaks in daemon
   timeout 300 claudesy-engine daemon --interval-seconds 10
   ```

### 6.5 Error Condition Testing

1. **Network Failure Testing**

   ```bash
   # Stop Ollama server
   # Test extraction (should fall back to rules-only)
   claudesy-engine extract

   # Test with invalid Ollama URL
   CLAUDESY_OLLAMA_URL=http://invalid.url claudesy-engine extract
   ```

2. **Disk Space Testing**

   ```bash
   # Fill disk to simulate low space condition
   # Test operations
   claudesy-engine log --title "Low space test" --description "Test"
   ```

3. **Permission Testing**

   ```bash
   # Change directory permissions
   chmod 444 ~/.claudesy

   # Test operations (should fail gracefully)
   claudesy-engine log --title "Permission test" --description "Test"
   ```

## 7. Continuous Integration

### 7.1 CI Pipeline Configuration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.8, 3.9, 3.10, 3.11]

    steps:
      - uses: actions/checkout@v3
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -e .[test]

      - name: Run unit tests
        run: pytest tests/unit/ -v

      - name: Run integration tests
        run: pytest tests/integration/ -v

      - name: Run performance tests
        run: pytest tests/performance/ -v --tb=short
```

### 7.2 Test Coverage

```bash
# Run tests with coverage
pytest --cov=claudesy_memory --cov-report=html

# Coverage requirements
# - Unit tests: >90% coverage
# - Integration tests: Key user journeys covered
# - Performance tests: Benchmarks established
```

## 8. Test Data Management

### 8.1 Test Fixtures

```python
# tests/fixtures/sample_sessions.py
SAMPLE_SESSIONS = {
    "architecture_session": """
### 09:00 - Architecture Discussion
We decided to use a microservices architecture for scalability.
This allows independent deployment of components.

### 10:30 - Database Choice
SQLite was chosen for its reliability and zero-configuration setup.
No server process required, which simplifies deployment.
""",

    "error_session": """
### 14:00 - Bug Fix
Fixed a memory leak in the extraction process.
The issue was caused by not closing file handles properly.
Root cause: Missing context manager in file operations.

### 15:00 - Error Handling
Added try-catch blocks around all Ollama API calls.
Fallback to rule-based extraction when AI fails.
"""
}
```

### 8.2 Expected Results

```python
# tests/fixtures/expected_facts.py
EXPECTED_FACTS = {
    "architecture_session": [
        {
            "category": "semantic",
            "importance": 0.78,
            "contains": "microservices architecture"
        },
        {
            "category": "semantic",
            "importance": 0.72,
            "contains": "SQLite"
        }
    ]
}
```

## 9. Test Reporting and Analysis

### 9.1 Test Results Analysis

```bash
# Generate test report
pytest --html=report.html --self-contained-html

# Performance profiling
pytest tests/performance/ --profile --profile-svg

# Coverage analysis
coverage report --show-missing
coverage html
```

### 9.2 Failure Investigation

1. **Log Analysis**

   ```bash
   # Check application logs
   tail -f ~/.claudesy/logs/claudesy.log

   # Check test logs
   pytest tests/ -v -s --log-cli-level=DEBUG
   ```

2. **Database Inspection**

   ```bash
   # Inspect test database
   sqlite3 /tmp/test_db.db ".schema"
   sqlite3 /tmp/test_db.db "SELECT * FROM facts LIMIT 10;"
   ```

3. **Memory Analysis**
   ```bash
   # Profile memory usage
   python -m memory_profiler test_script.py
   ```

## 10. Regression Testing

### 10.1 Automated Regression Suite

```python
def test_regression_memory_leak():
    """Regression test for memory leak bug #123."""
    # Test that was failing before fix
    # Ensure it passes after fix
    pass

def test_regression_ollama_fallback():
    """Regression test for Ollama fallback issue #456."""
    # Simulate Ollama failure
    with patch('claudesy_memory.extractor._call_ollama') as mock_call:
        mock_call.side_effect = Exception("Ollama unavailable")

        # Should fall back to rules
        facts = extractor.prefilter_session(test_session)
        assert len(facts) > 0
```

### 10.2 Version Compatibility Testing

- Test with different Python versions
- Test with different SQLite versions
- Test with different Ollama versions
- Test with different operating systems

## 11. Test Maintenance

### 11.1 Test Code Quality

- Keep tests DRY (Don't Repeat Yourself)
- Use descriptive test names
- Document complex test scenarios
- Review and update tests with code changes

### 11.2 Flaky Test Management

```python
@pytest.mark.flaky(reruns=3, reruns_delay=2)
def test_unreliable_network_operation():
    """Test that may fail due to network issues."""
    # Test implementation
    pass
```

### 11.3 Test Data Refresh

- Regularly update test fixtures
- Ensure test data reflects real usage patterns
- Clean up test data after runs
- Use factories for dynamic test data generation
