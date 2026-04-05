# Implementation Details

## 1. Core Architecture Implementation

### 1.1 Engine Initialization

The `ClaudesyEngine` class serves as the main entry point, initializing all components with dependency injection:

```python
class ClaudesyEngine:
    def __init__(self, config: EngineConfig | None = None):
        self.config = config or EngineConfig()
        self.storage = MemoryStorage(self.config)
        self.extractor = MemoryExtractor(self.config, self.storage)
        self.consolidator = MemoryConsolidator(self.config, self.storage)
        self.boot_loader = BootLoader(self.config, self.storage)
        self.daemon = MemoryDaemon(self)
```

This pattern ensures:

- Single responsibility per component
- Testable units with mockable dependencies
- Configuration-driven behavior

### 1.2 Configuration System

Configuration uses Python dataclasses with environment variable support:

```python
@dataclass(slots=True)
class OllamaConfig:
    model: str = os.environ.get("CLAUDESY_OLLAMA_MODEL", "nuextract")
    fallback_model: str = os.environ.get("CLAUDESY_OLLAMA_FALLBACK_MODEL", "llama3.1:8b")
    base_url: str = os.environ.get("CLAUDESY_OLLAMA_URL", "http://localhost:11434")
    temperature: float = 0.0
    timeout_seconds: int = 90
    max_retries: int = 2
```

**Benefits**:

- Type safety with `slots=True`
- Environment-driven configuration
- Immutable configuration objects

## 2. Data Persistence Implementation

### 2.1 SQLite Storage Backend

The storage layer uses SQLite with WAL mode for concurrent access:

```python
def _init_db(self, db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA cache_size=-64000")  # 64MB cache
    return conn
```

**WAL Mode Benefits**:

- Concurrent readers and writers
- Better performance for read-heavy workloads
- Automatic checkpointing

### 2.2 File Locking Mechanism

Atomic operations use file-based locking:

```python
@contextlib.contextmanager
def file_lock(lock_path: Path):
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    with open(lock_path, 'w') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
```

**Cross-Platform Compatibility**:

- Uses `fcntl` on Unix systems
- Falls back to file existence checks on Windows

### 2.3 Fact Storage Format

Facts are stored as JSONL (JSON Lines) for efficient streaming:

```json
{"id": "fact_001", "category": "semantic", "fact": "Python uses indentation for code blocks", "importance": 0.85, "created": "2024-01-01T10:00:00Z", "last_accessed": "2024-01-01T10:00:00Z", "access_count": 1, "status": "active"}
{"id": "fact_002", "category": "procedural", "fact": "Use virtual environments for Python projects", "importance": 0.72, "created": "2024-01-01T10:15:00Z", "last_accessed": "2024-01-01T10:15:00Z", "access_count": 1, "status": "active"}
```

**Advantages**:

- Append-only operations
- Easy parsing and streaming
- Human-readable format
- Efficient for large datasets

## 3. Memory Extraction Implementation

### 3.1 Hybrid Extraction Pipeline

The extraction process combines rule-based prefiltering with AI analysis:

```python
def prefilter_session(self, session_text: str) -> list[dict[str, Any]]:
    sections = re.split(r"\n###\s+", session_text)
    candidates = []
    for raw_section in sections:
        section = raw_section.strip()
        if len(section) < 20:
            continue
        # Apply always_rules and never_rules
        best_match = self._find_best_category(section)
        if best_match:
            candidates.append({
                "text": section,
                "category": best_match[0],
                "importance": best_match[1],
                "source": "prefilter"
            })
    return candidates
```

### 3.2 Rule-Based Categorization

Prefilter uses compiled regex patterns for efficiency:

```python
always_rules = [
    (re.compile(r"(?i)(chief|boss|directive|instruksi|meminta|minta|approve|reject)"), "preference", 0.85),
    (re.compile(r"(?i)(architecture|decision|refactor|migration|breaking change)"), "semantic", 0.78),
    (re.compile(r"(?i)(error|bug|fix|issue|warning|fail|crash)"), "semantic", 0.72),
    (re.compile(r"(?i)(workflow|sop|procedure|steps|protocol)"), "procedural", 0.80),
    (re.compile(r"(?i)(prefer|always|never|wajib|harus|jangan)"), "preference", 0.82),
    (re.compile(r"(?i)(summary|session recap|retrospective|learned)"), "episodic", 0.65),
]
```

### 3.3 Ollama Integration

AI extraction uses structured prompting:

```python
def _extract_with_ollama(self, text: str) -> dict[str, Any]:
    prompt = f"""
    Extract memory facts from this session text. Return JSON with:
    - facts: array of fact objects
    - each fact: {{text, category, importance (0-1)}}

    Categories: semantic, episodic, procedural, preference

    Text: {text}
    """

    response = self._call_ollama(prompt)
    return json.loads(response)
```

**Fallback Strategy**:

1. Try primary model (nuextract)
2. Fall back to llama3.1:8b
3. Use rules-only extraction

## 4. Memory Consolidation Implementation

### 4.1 Decay Algorithm

Implements Ebbinghaus forgetting curve with access boosting:

```python
def calculate_decay(base_importance: float, last_accessed: str, access_count: int, config: EngineConfig) -> float:
    try:
        last_dt = datetime.fromisoformat(last_accessed.replace("Z", "+00:00"))
    except ValueError:
        return base_importance
    elapsed_days = max(0.0, (datetime.now(timezone.utc) - last_dt).total_seconds() / 86400)
    decay_factor = math.pow(2, -elapsed_days / config.decay.half_life_days)
    return max(
        0.0,
        min(1.0, (base_importance * decay_factor) + (access_count * config.decay.access_boost)),
    )
```

**Parameters**:

- `half_life_days`: 30 (importance halves every 30 days)
- `access_boost`: 0.08 (each access adds 8% importance)
- `minimum_threshold`: 0.30 (prune below this)
- `prune_below`: 0.20 (hard cutoff)

### 4.2 Deduplication Logic

Uses normalized text similarity for deduplication:

```python
def _deduplicate(self, facts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: dict[str, dict[str, Any]] = {}
    for fact in facts:
        normalized = normalize_text(fact["fact"])
        if normalized in seen:
            # Keep higher importance fact
            if fact.get("importance", 0) > seen[normalized].get("importance", 0):
                seen[normalized] = fact
        else:
            seen[normalized] = fact
    return list(seen.values())
```

**Normalization**:

```python
def normalize_text(value: str) -> str:
    import re
    value = re.sub(r"\s+", " ", value.strip().lower())
    return re.sub(r"[^a-z0-9\s:/#._-]", "", value)
```

### 4.3 Operation Resolution

Handles fact relationships for ADD/UPDATE/DELETE operations:

```python
def _resolve_operations(self, grouped: dict[str, list[dict[str, Any]]]) -> dict[str, list[dict[str, Any]]]:
    all_facts = [fact for facts in grouped.values() for fact in facts]
    facts_by_id = {fact["id"]: fact for fact in all_facts}
    for fact in all_facts:
        related = fact.get("related_to")
        if related and related in facts_by_id:
            if fact.get("operation") == "DELETE":
                facts_by_id[related]["status"] = "deleted"
            elif fact.get("operation") == "UPDATE":
                facts_by_id[related]["status"] = "superseded"
    # Filter active facts
    output = {category: [] for category in CATEGORIES}
    for fact in all_facts:
        if fact.get("status") == "deleted":
            continue
        output[fact["category"]].append(fact)
    return output
```

## 5. Boot Context Implementation

### 5.1 Context Assembly

Boot loader collects and prioritizes context components:

```python
def boot_context(self, agent_name: str) -> str:
    sections = []
    # Load identity documents
    soul = self.storage.read_identity(agent_name, "SOUL.md")
    memory = self.storage.read_identity(agent_name, "MEMORY.md")
    skills = self.storage.read_identity(agent_name, "SKILLS.md")

    # Get recent facts
    grouped = self.storage.load_grouped_facts(agent_name)
    semantic = grouped["semantic"]
    episodic = grouped["episodic"]

    # Add sections with priorities
    if soul:
        sections.append(("SOUL.md", soul, 1))
    if semantic:
        recent = sorted(semantic, key=lambda item: item.get("created", ""), reverse=True)[:self.config.boot.recent_fact_count]
        rendered = "## Recent Context\n" + "\n".join(f"- [{fact.get('created', '?')[:10]}] {fact['fact']}" for fact in recent)
        sections.append(("recent", rendered, 2))
    # ... more sections

    # Fit within token budget
    return self._fit_sections(sections)
```

### 5.2 Token Budgeting

Uses character-based token estimation:

```python
def _fit_sections(self, sections: list[tuple[str, str, int]]) -> str:
    budget = self.config.boot.max_tokens
    fitted = []
    used = 0
    chars_per_token = self.config.boot.chars_per_token

    for _, content, priority in sorted(sections, key=lambda item: item[2]):
        tokens = estimate_tokens(content, chars_per_token)
        if used + tokens <= budget:
            fitted.append(content)
            used += tokens
        else:
            remaining = budget - used
            if remaining > 100:  # Minimum useful chunk
                truncated = self._truncate_content(content, remaining, chars_per_token)
                fitted.append(truncated)
                used += remaining
            break

    return "\n\n".join(fitted)
```

## 6. CLI Implementation

### 6.1 Command Parser

Uses argparse with subcommands:

```python
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=f"{APP_NAME} {APP_VERSION}")
    parser.add_argument("--agent", default=DEFAULT_AGENT, help="Agent name")
    parser.add_argument("--base-dir", default=str(DEFAULT_BASE_DIR), help="Base directory")

    subparsers = parser.add_subparsers(dest="command", required=True)

    # Run command
    subparsers.add_parser("run", help="Archive, extract, and consolidate")

    # Log command
    log_parser = subparsers.add_parser("log", help="Append event to session")
    log_parser.add_argument("--title", required=True, help="Event title")
    log_parser.add_argument("--description", required=True, help="Event description")
    # ... more commands

    return parser
```

### 6.2 Command Execution

Each command maps to engine methods:

```python
def main():
    parser = build_parser()
    args = parser.parse_args()

    config = EngineConfig(agent_name=args.agent, base_dir=Path(args.base_dir))
    engine = ClaudesyEngine(config)

    if args.command == "run":
        # Archive old sessions
        archive_result = engine.archive_old_sessions()
        # Extract latest facts
        extract_result = engine.extractor.extract_latest()
        # Consolidate memory
        consolidate_result = engine.consolidator.consolidate()
        # Print results
    elif args.command == "log":
        logger = engine.logger()
        event = SessionEvent(args.title, args.description, args.decision, args.tags.split(",") if args.tags else [])
        logger.log_event(event)
    # ... handle other commands
```

## 7. Web Dashboard Implementation

### 7.1 Application Shell

The primary graphical interface is implemented as a Next.js App Router application:

```typescript
// src/app/page.tsx
import { Dashboard } from '@/components/dashboard'

export default function Home() {
  return <Dashboard />
}
```

This structure keeps the browser entrypoint thin while delegating orchestration to dedicated UI components and server-side route handlers.

### 7.2 Server Boundary

The web dashboard uses Route Handlers as a backend-for-frontend layer for Python engine access, filesystem reads/writes, and agent management:

```typescript
// Example route shape
export async function POST(req: NextRequest) {
  const body = await req.json()
  // Validate agent / command
  // Call Python engine via a server-only helper
  // Return normalized JSON to the client
}
```

Implemented server concerns include:

- state hydration
- command execution
- document read/write
- agent add/remove
- search requests

### 7.3 Client State Management

The dashboard client manages:

- selected agent
- engine state hydration
- activity log
- command output history
- document editor content
- search results and active workspace tabs

Recent fixes ensure:

- engine status tiles hydrate from server health state
- switching agents clears stale per-agent UI state
- document editors use controlled state instead of stale `defaultValue`
- document save failures surface explicit UI feedback

### 7.4 Optional Electron Compatibility Layer

The Electron console remains a supported local operator surface, but it is no longer the primary implementation target for GUI conformance. Desktop work should follow the same engine contracts and operational semantics defined for the web dashboard.

### 7.5 State Persistence

```javascript
function persistState() {
  const payload = {
    baseDir: state.baseDir,
    selectedAgent: state.selectedAgent,
    settings: state.settings,
  };
  fs.writeFileSync(getStateFilePath(), JSON.stringify(payload, null, 2));
}
```

## 8. Background Daemon Implementation

### 8.1 Daemon Loop

Runs consolidation cycles:

```python
class MemoryDaemon:
    def __init__(self, engine: ClaudesyEngine):
        self.engine = engine
        self.running = False

    def start(self, interval_seconds: int = 300, mode: str = "full"):
        self.running = True
        while self.running:
            try:
                if mode == "full":
                    self.engine.archive_old_sessions()
                    self.engine.extractor.extract_latest()
                self.engine.consolidator.consolidate()
                time.sleep(interval_seconds)
            except KeyboardInterrupt:
                self.running = False
            except Exception as e:
                logger.error(f"Daemon error: {e}")
                time.sleep(60)  # Backoff on error
```

### 8.2 Signal Handling

Graceful shutdown:

```python
import signal

def signal_handler(signum, frame):
    logger.info("Received signal, shutting down daemon")
    daemon.running = False

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)
```

## 9. Error Handling Patterns

### 9.1 Graceful Degradation

Ollama failure fallback:

```python
def _call_ollama(self, prompt: str) -> str:
    try:
        return self._call_ollama_model(self.config.ollama.model, prompt)
    except Exception as e:
        logger.warning(f"Primary model failed: {e}")
        try:
            return self._call_ollama_model(self.config.ollama.fallback_model, prompt)
        except Exception as e2:
            logger.error(f"Fallback model failed: {e2}")
            raise OllamaUnavailableError("All Ollama models unavailable")
```

### 9.2 Retry Logic

Network operations with backoff:

```python
def _call_ollama_model(self, model: str, prompt: str) -> str:
    for attempt in range(self.config.ollama.max_retries):
        try:
            # HTTP request to Ollama
            req = urllib.request.Request(
                f"{self.config.ollama.base_url}/api/generate",
                data=json.dumps({
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": self.config.ollama.temperature}
                }).encode(),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=self.config.ollama.timeout_seconds) as response:
                result = json.loads(response.read().decode())
                return result["response"]
        except urllib.error.URLError as e:
            if attempt < self.config.ollama.max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise
```

## 10. Testing Implementation

### 10.1 Unit Tests

Component isolation testing:

```python
def test_memory_consolidator_decay():
    config = EngineConfig()
    storage = Mock()
    consolidator = MemoryConsolidator(config, storage)

    # Test decay calculation
    importance = consolidator.calculate_decay(1.0, "2024-01-01T00:00:00Z", 5, config)
    assert 0.0 <= importance <= 1.0
```

### 10.2 Integration Tests

End-to-end testing:

```python
def test_full_memory_cycle(tmp_path):
    config = EngineConfig(base_dir=tmp_path)
    engine = ClaudesyEngine(config)

    # Create test session
    logger = engine.logger("test_agent")
    event = SessionEvent("Test Event", "Test description")
    logger.log_event(event)

    # Run extraction
    facts = engine.extractor.extract_latest("test_agent")
    assert len(facts) > 0

    # Run consolidation
    engine.consolidator.consolidate("test_agent")
```

### 10.3 Performance Benchmarks

```python
def benchmark_boot_context():
    config = EngineConfig()
    storage = MemoryStorage(config)
    boot_loader = BootLoader(config, storage)

    # Load test data
    # Measure time
    start = time.time()
    context = boot_loader.boot_context("test_agent")
    duration = time.time() - start
    assert duration < 5.0  # Should complete within 5 seconds
```

## 11. Performance Optimizations

### 11.1 Lazy Loading

Storage loads facts on demand:

```python
def load_grouped_facts(self, agent_name: str) -> dict[str, list[dict[str, Any]]]:
    grouped = {category: [] for category in CATEGORIES}
    for category in CATEGORIES:
        facts_file = self.ensure_agent_dirs(agent_name) / "facts" / f"{category}.jsonl"
        if facts_file.exists():
            with open(facts_file, 'r', encoding='utf-8') as f:
                for line in f:
                    fact = json.loads(line.strip())
                    grouped[category].append(fact)
    return grouped
```

### 11.2 Streaming Processing

Large files processed in chunks:

```python
def stream_facts(self, agent_name: str, category: str):
    facts_file = self._get_facts_path(agent_name, category)
    if not facts_file.exists():
        return
    with open(facts_file, 'r', encoding='utf-8') as f:
        for line in f:
            yield json.loads(line.strip())
```

### 11.3 Caching Strategies

Frequently accessed data cached in memory:

```python
class MemoryStorage:
    def __init__(self, config: EngineConfig):
        self.config = config
        self._fact_cache: dict[str, dict[str, list[dict]]] = {}
        self._cache_ttl = 300  # 5 minutes

    def _get_cached_facts(self, agent_name: str, category: str) -> list[dict] | None:
        cache_key = f"{agent_name}:{category}"
        if cache_key in self._fact_cache:
            timestamp, facts = self._fact_cache[cache_key]
            if time.time() - timestamp < self._cache_ttl:
                return facts
        return None
```

## 12. Security Implementation

### 12.1 Input Validation

All inputs sanitized:

```python
def normalize_text(value: str) -> str:
    import re
    value = re.sub(r"\s+", " ", value.strip().lower())
    return re.sub(r"[^a-z0-9\s:/#._-]", "", value)
```

### 12.2 Path Traversal Protection

Safe path construction:

```python
def agent_dir(self, agent_name: str | None = None) -> Path:
    name = agent_name or self.config.agent_name
    # Validate agent name
    if not re.match(r"^[a-zA-Z0-9_-]+$", name):
        raise ValueError(f"Invalid agent name: {name}")
    return self.agents_dir / name
```

### 12.3 File Permissions

Restrictive permissions on sensitive files:

```python
def _write_identity_file(self, agent_name: str, filename: str, content: str):
    file_path = self.ensure_agent_dirs(agent_name) / "identity" / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    # Set restrictive permissions
    file_path.chmod(0o600)
```
