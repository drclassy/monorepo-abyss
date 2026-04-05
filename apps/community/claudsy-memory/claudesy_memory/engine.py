from __future__ import annotations

import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from .boot import BootLoader
from .config import EngineConfig
from .consolidator import MemoryConsolidator
from .extractor import MemoryExtractor
from .models import SessionEvent
from .scheduler import MemoryDaemon
from .session_logger import SessionLogger
from .storage import MemoryStorage, file_lock, now_iso


class ClaudesyEngine:
    def __init__(self, config: EngineConfig | None = None):
        self.config = config or EngineConfig()
        self.storage = MemoryStorage(self.config)
        self.extractor = MemoryExtractor(self.config, self.storage)
        self.consolidator = MemoryConsolidator(self.config, self.storage)
        self.boot_loader = BootLoader(self.config, self.storage)
        self.daemon = MemoryDaemon(self)

    def logger(self, agent_name: str | None = None) -> SessionLogger:
        return SessionLogger(self.storage, agent_name or self.config.agent_name)

    def archive_old_sessions(self, agent_name: str | None = None) -> dict[str, Any]:
        agent = agent_name or self.config.agent_name
        agent_dir = self.storage.ensure_agent_dirs(agent)
        if not self.config.archive.enabled:
            return {"archived": 0, "archive": None}

        session_dir = agent_dir / "sessions"
        archive_dir = agent_dir / "archive"
        archive_dir.mkdir(parents=True, exist_ok=True)
        threshold = datetime.now() - timedelta(days=self.config.archive.compress_after_days)
        files_to_archive: list[Path] = []
        for session_file in sorted(session_dir.glob("*.md")):
            if datetime.fromtimestamp(session_file.stat().st_mtime) < threshold:
                files_to_archive.append(session_file)

        if not files_to_archive:
            return {"archived": 0, "archive": None}

        archive_name = f"archive_{datetime.now().strftime('%Y-%m')}.zip"
        archive_path = archive_dir / archive_name
        lock_path = archive_path.with_suffix(".lock")
        with file_lock(lock_path):
            with zipfile.ZipFile(archive_path, "a", zipfile.ZIP_DEFLATED) as bundle:
                for source in files_to_archive:
                    bundle.write(source, source.name)
            for source in files_to_archive:
                source.unlink(missing_ok=True)

        connection = self.storage._connect(agent)
        try:
            connection.execute(
                """
                INSERT INTO archives(archive_name, file_count, created_at)
                VALUES (?, ?, ?)
                ON CONFLICT(archive_name) DO UPDATE SET
                    file_count = excluded.file_count,
                    created_at = excluded.created_at
                """,
                (archive_name, len(files_to_archive), now_iso()),
            )
            connection.commit()
        finally:
            connection.close()

        summary = {"archived": len(files_to_archive), "archive": str(archive_path)}
        self.storage.log_run(agent, "archive", "success", summary)
        return summary

    def extract_from_text(self, agent_name: str, session_text: str, source: str) -> list[dict[str, Any]]:
        return self.extractor.extract_from_text(agent_name, session_text, source)

    def extract_latest_session(self, agent_name: str | None = None) -> list[dict[str, Any]]:
        return self.extractor.extract_latest_session(agent_name or self.config.agent_name)

    def consolidate(self, agent_name: str | None = None) -> dict[str, Any]:
        return self.consolidator.consolidate(agent_name or self.config.agent_name)

    def boot_context(self, agent_name: str | None = None) -> str:
        return self.boot_loader.boot_context(agent_name or self.config.agent_name)

    def health(self, agent_name: str | None = None) -> dict[str, Any]:
        agent = agent_name or self.config.agent_name
        return self.storage.health(
            agent,
            self.extractor.ollama_reachable(),
            model=self.config.ollama.model,
            fallback_model=self.config.ollama.fallback_model,
            ollama_url=self.config.ollama.base_url,
        )

    def search(
        self,
        query: str,
        agent_name: str | None = None,
        category: str | None = None,
        status: str | None = None,
        limit: int = 10,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        return self.storage.search_facts(agent_name or self.config.agent_name, query, category, status, limit, offset)

    def inspect(
        self,
        fact_id: str | None = None,
        agent_name: str | None = None,
        category: str | None = None,
        status: str | None = None,
        limit: int = 10,
        offset: int = 0,
    ) -> Any:
        agent = agent_name or self.config.agent_name
        if fact_id:
            return self.storage.inspect_fact(agent, fact_id)
        return self.storage.recent_facts(agent, limit=limit, category=category, status=status, offset=offset)

    def run_full_cycle(self, agent_name: str | None = None) -> dict[str, Any]:
        agent = agent_name or self.config.agent_name
        archive = self.archive_old_sessions(agent)
        extracted = self.extract_latest_session(agent)
        consolidated = self.consolidate(agent)
        return {"archive": archive, "extracted": len(extracted), "consolidated": consolidated}

    def run_daemon(
        self,
        agent_name: str | None = None,
        interval_seconds: int = 300,
        mode: str = "full",
        iterations: int = 0,
    ) -> dict[str, Any]:
        return self.daemon.run(agent_name or self.config.agent_name, interval_seconds, mode, iterations)
