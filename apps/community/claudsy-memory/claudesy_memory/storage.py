from __future__ import annotations

import contextlib
import hashlib
import json
import logging
import math
import os
import sqlite3
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from .config import APP_NAME, APP_VERSION, CATEGORIES, EngineConfig

try:
    import tiktoken
    TIKTOKEN_AVAILABLE = True
except ImportError:
    TIKTOKEN_AVAILABLE = False
    tiktoken = None

try:
    from cryptography.fernet import Fernet
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False
    Fernet = None


LOGGER = logging.getLogger("claudesy.storage")
FALLBACK_TOKEN_SAFETY_MARGIN = 1.15
_TOKEN_ENCODING = None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def local_now() -> datetime:
    return datetime.now()


def now_iso() -> str:
    return utc_now().isoformat(timespec="seconds")


def today_str() -> str:
    return local_now().strftime("%Y-%m-%d")


def estimate_tokens(text: str, chars_per_token: float = 4.0) -> int:
    if not text:
        return 0
    if TIKTOKEN_AVAILABLE:
        global _TOKEN_ENCODING
        try:
            if _TOKEN_ENCODING is None:
                _TOKEN_ENCODING = tiktoken.get_encoding("cl100k_base")
            return len(_TOKEN_ENCODING.encode(text, disallowed_special=()))
        except Exception:
            LOGGER.debug("Falling back to heuristic token estimation", exc_info=True)
    chars = max(1.0, float(chars_per_token))
    naive_estimate = math.ceil(len(text) / chars)
    return max(1, math.ceil(naive_estimate * FALLBACK_TOKEN_SAFETY_MARGIN))


def normalize_text(value: str) -> str:
    import re

    value = re.sub(r"\s+", " ", value.strip().lower())
    return re.sub(r"[^a-z0-9\s:/#._-]", "", value)


def generate_id(prefix: str) -> str:
    import uuid

    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


@contextlib.contextmanager
def file_lock(lock_path: Path) -> Iterator[None]:
    ensure_parent(lock_path)
    handle = open(lock_path, "a+b")
    try:
        if os.name == "nt":
            import msvcrt

            while True:
                try:
                    handle.seek(0)
                    msvcrt.locking(handle.fileno(), msvcrt.LK_LOCK, 1)
                    break
                except OSError:
                    time.sleep(0.05)
        else:
            import fcntl

            fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        yield
    finally:
        if os.name == "nt":
            import msvcrt

            handle.seek(0)
            try:
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            except OSError:
                pass
        else:
            import fcntl

            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
        handle.close()


def read_text(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def atomic_write_text(path: Path, content: str) -> None:
    ensure_parent(path)
    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8", dir=str(path.parent)) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    tmp_path.replace(path)


def read_jsonl(path: Path, encryption_key: str = "") -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line:
                continue
            try:
                parsed = json.loads(line)
            except json.JSONDecodeError:
                LOGGER.warning("Skipping invalid JSONL line in %s", path)
                continue
            if isinstance(parsed, dict):
                # Decrypt fact if encryption is enabled
                if encryption_key and 'fact' in parsed:
                    try:
                        parsed['fact'] = decrypt_data(parsed['fact'], encryption_key)
                    except Exception as e:
                        LOGGER.warning("Failed to decrypt fact in %s: %s", path, e)
                        continue
                rows.append(parsed)
    return rows


def atomic_write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    payload = "\n".join(json.dumps(record, ensure_ascii=False) for record in records)
    if payload:
        payload += "\n"
    atomic_write_text(path, payload)


def append_jsonl(path: Path, record: dict[str, Any]) -> None:
    ensure_parent(path)
    lock_path = path.with_suffix(path.suffix + ".lock")
    with file_lock(lock_path):
        with path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def encrypt_data(data: str, key: str) -> str:
    if not CRYPTOGRAPHY_AVAILABLE or not key:
        return data
    f = Fernet(key.encode())
    return f.encrypt(data.encode()).decode()


def decrypt_data(data: str, key: str) -> str:
    if not CRYPTOGRAPHY_AVAILABLE or not key:
        return data
    f = Fernet(key.encode())
    return f.decrypt(data.encode()).decode()


class MemoryStorage:
    def __init__(self, config: EngineConfig):
        self.config = config

    def agent_dir(self, agent_name: str | None = None) -> Path:
        return self.config.agent_dir(agent_name)

    def ensure_agent_dirs(self, agent_name: str | None = None) -> Path:
        agent = agent_name or self.config.agent_name
        agent_dir = self.agent_dir(agent)
        (agent_dir / "sessions").mkdir(parents=True, exist_ok=True)
        (agent_dir / "extracted").mkdir(parents=True, exist_ok=True)
        self.config.shared_dir.mkdir(parents=True, exist_ok=True)
        self._ensure_identity_files(agent_dir, agent)
        self._ensure_sqlite(agent_dir)
        return agent_dir

    def _ensure_identity_files(self, agent_dir: Path, agent_name: str) -> None:
        defaults = {
            "SOUL.md": "\n".join(
                [
                    f"# {agent_name} - Agent Identity",
                    "",
                    "## Role",
                    "Persistent memory operator for Sentra AI.",
                    "",
                    "## Communication Protocol",
                    "- Gather context",
                    "- Analyze",
                    "- Wait for GO before execution on high-impact tasks",
                    "- Never fabricate facts or results",
                    "",
                ]
            ),
            "MEMORY.md": "\n".join(
                [
                    "# Long-Term Memory",
                    "",
                    f"> Last consolidated: {now_iso()}",
                    "> Total active facts: 0",
                    "",
                    "## Architecture Decisions",
                    "(none yet)",
                    "",
                    "## Preferences",
                    "(none yet)",
                    "",
                    "## Active Project State",
                    "(none yet)",
                    "",
                    "## Recent Sessions",
                    "(none yet)",
                    "",
                    "## Known Issues",
                    "(none)",
                    "",
                ]
            ),
            "SKILLS.md": "# Learned Skills\n\n(no skills learned yet)\n",
        }
        for name, content in defaults.items():
            path = agent_dir / name
            if not path.exists():
                atomic_write_text(path, content)

    def sqlite_path(self, agent_name: str | None = None) -> Path:
        return self.ensure_agent_dirs(agent_name) / "state.sqlite3"

    def _connect(self, agent_name: str | None = None) -> sqlite3.Connection:
        connection = sqlite3.connect(self.sqlite_path(agent_name))
        connection.row_factory = sqlite3.Row
        return connection

    def _ensure_sqlite(self, agent_dir: Path) -> None:
        connection = sqlite3.connect(agent_dir / "state.sqlite3")
        try:
            connection.execute("PRAGMA journal_mode=WAL;")
            connection.execute("PRAGMA synchronous=NORMAL;")
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS facts_index (
                    id TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    fact TEXT NOT NULL,
                    normalized_fact TEXT NOT NULL,
                    importance REAL NOT NULL,
                    status TEXT NOT NULL,
                    source TEXT NOT NULL,
                    tags_json TEXT NOT NULL,
                    operation TEXT NOT NULL DEFAULT 'ADD',
                    related_to TEXT,
                    summary TEXT,
                    session TEXT,
                    name TEXT,
                    steps_json TEXT NOT NULL DEFAULT '[]',
                    last_accessed TEXT,
                    access_count INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS runs (
                    run_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_name TEXT NOT NULL,
                    kind TEXT NOT NULL,
                    status TEXT NOT NULL,
                    details TEXT,
                    created_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS archives (
                    archive_name TEXT PRIMARY KEY,
                    file_count INTEGER NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS processed_sessions (
                    source TEXT PRIMARY KEY,
                    content_hash TEXT NOT NULL,
                    processed_at TEXT NOT NULL
                )
                """
            )
            self._ensure_facts_index_columns(connection)
            connection.commit()
        finally:
            connection.close()

    def _ensure_facts_index_columns(self, connection: sqlite3.Connection) -> None:
        existing_columns = {
            row[1]
            for row in connection.execute("PRAGMA table_info(facts_index)").fetchall()
        }
        column_definitions = {
            "operation": "TEXT NOT NULL DEFAULT 'ADD'",
            "related_to": "TEXT",
            "summary": "TEXT",
            "session": "TEXT",
            "name": "TEXT",
            "steps_json": "TEXT NOT NULL DEFAULT '[]'",
            "last_accessed": "TEXT",
            "access_count": "INTEGER NOT NULL DEFAULT 1",
        }
        for column_name, definition in column_definitions.items():
            if column_name in existing_columns:
                continue
            connection.execute(f"ALTER TABLE facts_index ADD COLUMN {column_name} {definition}")

    def content_hash(self, text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def is_session_processed(self, agent_name: str, source: str, content_hash: str) -> bool:
        connection = self._connect(agent_name)
        try:
            row = connection.execute(
                "SELECT content_hash FROM processed_sessions WHERE source = ?",
                (source,),
            ).fetchone()
            return bool(row and row["content_hash"] == content_hash)
        finally:
            connection.close()

    def mark_session_processed(self, agent_name: str, source: str, content_hash: str) -> None:
        connection = self._connect(agent_name)
        try:
            connection.execute(
                """
                INSERT INTO processed_sessions(source, content_hash, processed_at)
                VALUES (?, ?, ?)
                ON CONFLICT(source) DO UPDATE SET
                    content_hash = excluded.content_hash,
                    processed_at = excluded.processed_at
                """,
                (source, content_hash, now_iso()),
            )
            connection.commit()
        finally:
            connection.close()

    def log_run(self, agent_name: str, kind: str, status: str, details: dict[str, Any] | None = None) -> None:
        connection = self._connect(agent_name)
        try:
            connection.execute(
                "INSERT INTO runs(agent_name, kind, status, details, created_at) VALUES (?, ?, ?, ?, ?)",
                (agent_name, kind, status, json.dumps(details or {}), now_iso()),
            )
            connection.commit()
        finally:
            connection.close()

    def append_fact(self, agent_name: str, record: dict[str, Any]) -> None:
        agent_dir = self.ensure_agent_dirs(agent_name)
        jsonl_path = agent_dir / "extracted" / f"{record['category']}.jsonl"
        # Encrypt fact if encryption is enabled
        encrypted_record = record.copy()
        if self.config.encryption.enabled and self.config.encryption.key:
            encrypted_record['fact'] = encrypt_data(record['fact'], self.config.encryption.key)
        append_jsonl(jsonl_path, encrypted_record)
        self.index_fact(agent_name, record)

    def index_fact(self, agent_name: str, record: dict[str, Any]) -> None:
        connection = self._connect(agent_name)
        try:
            connection.execute(
                """
                INSERT INTO facts_index(
                    id, category, fact, normalized_fact, importance, status, source, tags_json,
                    operation, related_to, summary, session, name, steps_json, last_accessed,
                    access_count, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    category = excluded.category,
                    fact = excluded.fact,
                    normalized_fact = excluded.normalized_fact,
                    importance = excluded.importance,
                    status = excluded.status,
                    source = excluded.source,
                    tags_json = excluded.tags_json,
                    operation = excluded.operation,
                    related_to = excluded.related_to,
                    summary = excluded.summary,
                    session = excluded.session,
                    name = excluded.name,
                    steps_json = excluded.steps_json,
                    last_accessed = excluded.last_accessed,
                    access_count = excluded.access_count,
                    updated_at = excluded.updated_at
                """,
                (
                    record["id"],
                    record["category"],
                    record["fact"],
                    normalize_text(record["fact"]),
                    record["importance"],
                    record["status"],
                    record["source"],
                    json.dumps(record.get("tags", [])),
                    record.get("operation", "ADD"),
                    record.get("related_to"),
                    record.get("summary"),
                    record.get("session"),
                    record.get("name"),
                    json.dumps(record.get("steps") or []),
                    record.get("last_accessed"),
                    int(record.get("access_count", 1)),
                    record["created"],
                    now_iso(),
                ),
            )
            connection.commit()
        finally:
            connection.close()

    def rewrite_category(self, agent_name: str, category: str, facts: list[dict[str, Any]]) -> None:
        agent_dir = self.ensure_agent_dirs(agent_name)
        # Encrypt facts if encryption is enabled
        encrypted_facts = facts.copy()
        if self.config.encryption.enabled and self.config.encryption.key:
            for fact in encrypted_facts:
                if 'fact' in fact:
                    fact['fact'] = encrypt_data(fact['fact'], self.config.encryption.key)
        atomic_write_jsonl(agent_dir / "extracted" / f"{category}.jsonl", encrypted_facts)

    def rewrite_indexes(self, agent_name: str, grouped: dict[str, list[dict[str, Any]]]) -> None:
        connection = self._connect(agent_name)
        try:
            connection.execute("DELETE FROM facts_index")
            for category, facts in grouped.items():
                for fact in facts:
                    connection.execute(
                        """
                        INSERT INTO facts_index(
                            id, category, fact, normalized_fact, importance, status, source, tags_json,
                            operation, related_to, summary, session, name, steps_json, last_accessed,
                            access_count, created_at, updated_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            fact["id"],
                            category,
                            fact["fact"],
                            normalize_text(fact["fact"]),
                            fact["importance"],
                            fact["status"],
                            fact["source"],
                            json.dumps(fact.get("tags", [])),
                            fact.get("operation", "ADD"),
                            fact.get("related_to"),
                            fact.get("summary"),
                            fact.get("session"),
                            fact.get("name"),
                            json.dumps(fact.get("steps") or []),
                            fact.get("last_accessed"),
                            int(fact.get("access_count", 1)),
                            fact["created"],
                            now_iso(),
                        ),
                    )
            connection.commit()
        finally:
            connection.close()

    def _row_to_fact(self, row: sqlite3.Row) -> dict[str, Any]:
        steps = json.loads(row["steps_json"] or "[]")
        return {
            "id": row["id"],
            "category": row["category"],
            "fact": row["fact"],
            "importance": row["importance"],
            "status": row["status"],
            "source": row["source"],
            "tags": json.loads(row["tags_json"] or "[]"),
            "operation": row["operation"],
            "related_to": row["related_to"],
            "summary": row["summary"],
            "session": row["session"],
            "name": row["name"],
            "steps": steps if isinstance(steps, list) else [],
            "created": row["created_at"],
            "last_accessed": row["last_accessed"] or row["created_at"],
            "access_count": row["access_count"] or 1,
            "updated_at": row["updated_at"],
        }

    def load_grouped_facts(self, agent_name: str) -> dict[str, list[dict[str, Any]]]:
        agent_dir = self.ensure_agent_dirs(agent_name)
        encryption_key = self.config.encryption.key if self.config.encryption.enabled else ""
        return {
            category: read_jsonl(agent_dir / "extracted" / f"{category}.jsonl", encryption_key)
            for category in CATEGORIES
        }

    def read_identity(self, agent_name: str, name: str) -> str:
        return read_text(self.ensure_agent_dirs(agent_name) / name)

    def write_identity(self, agent_name: str, name: str, content: str) -> None:
        atomic_write_text(self.ensure_agent_dirs(agent_name) / name, content)

    def latest_session_file(self, agent_name: str) -> Path | None:
        files = sorted((self.ensure_agent_dirs(agent_name) / "sessions").glob("*.md"))
        return files[-1] if files else None

    def search_facts(
        self,
        agent_name: str,
        query: str,
        category: str | None = None,
        status: str | None = None,
        limit: int = 10,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        normalized = f"%{normalize_text(query)}%"
        clauses = ["(normalized_fact LIKE ? OR fact LIKE ?)"]
        params: list[Any] = [normalized, f"%{query}%"]
        if category:
            clauses.append("category = ?")
            params.append(category)
        if status:
            clauses.append("status = ?")
            params.append(status)
        params.extend([limit, max(0, offset)])
        sql = (
            "SELECT "
            "id, category, fact, importance, status, source, tags_json, operation, "
            "related_to, summary, session, name, steps_json, created_at, "
            "last_accessed, access_count, updated_at "
            "FROM facts_index WHERE "
            + " AND ".join(clauses)
            + " ORDER BY importance DESC, updated_at DESC LIMIT ? OFFSET ?"
        )
        connection = self._connect(agent_name)
        try:
            rows = connection.execute(sql, params).fetchall()
            return [self._row_to_fact(row) for row in rows]
        finally:
            connection.close()

    def inspect_fact(self, agent_name: str, fact_id: str) -> dict[str, Any] | None:
        connection = self._connect(agent_name)
        try:
            row = connection.execute(
                """
                SELECT
                    id, category, fact, importance, status, source, tags_json, operation,
                    related_to, summary, session, name, steps_json, created_at, last_accessed,
                    access_count, updated_at
                FROM facts_index
                WHERE id = ?
                """,
                (fact_id,),
            ).fetchone()
            return self._row_to_fact(row) if row else None
        finally:
            connection.close()

    def recent_facts(
        self,
        agent_name: str,
        limit: int = 10,
        category: str | None = None,
        status: str | None = None,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        clauses: list[str] = []
        params: list[Any] = []
        if category:
            clauses.append("category = ?")
            params.append(category)
        if status:
            clauses.append("status = ?")
            params.append(status)
        params.extend([limit, max(0, offset)])
        sql = (
            "SELECT "
            "id, category, fact, importance, status, source, tags_json, operation, "
            "related_to, summary, session, name, steps_json, created_at, "
            "last_accessed, access_count, updated_at "
            "FROM facts_index "
        )
        if clauses:
            sql += "WHERE " + " AND ".join(clauses) + " "
        sql += "ORDER BY created_at DESC, updated_at DESC LIMIT ? OFFSET ?"

        connection = self._connect(agent_name)
        try:
            rows = connection.execute(sql, params).fetchall()
            return [self._row_to_fact(row) for row in rows]
        finally:
            connection.close()

    def health(
        self,
        agent_name: str,
        ollama_reachable: bool,
        model: str | None = None,
        fallback_model: str | None = None,
        ollama_url: str | None = None,
    ) -> dict[str, Any]:
        agent_dir = self.ensure_agent_dirs(agent_name)
        grouped = self.load_grouped_facts(agent_name)
        return {
            "app": APP_NAME,
            "version": APP_VERSION,
            "agent": agent_name,
            "agent_dir": str(agent_dir),
            "sqlite_path": str(self.sqlite_path(agent_name)),
            "ollama_reachable": ollama_reachable,
            "ollama_model": model,
            "ollama_fallback_model": fallback_model,
            "ollama_url": ollama_url,
            "facts": {category: len(grouped[category]) for category in CATEGORIES},
            "sessions": len(list((agent_dir / "sessions").glob("*.md"))),
            "archives": len(list((agent_dir / "archive").glob("*.zip"))),
        }
