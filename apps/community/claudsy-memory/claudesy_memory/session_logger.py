from __future__ import annotations

from pathlib import Path

from .models import SessionEvent
from .storage import MemoryStorage, local_now, read_text, today_str, atomic_write_text, file_lock


class SessionLogger:
    def __init__(self, storage: MemoryStorage, agent_name: str):
        self.storage = storage
        self.agent_name = agent_name
        self.agent_dir = storage.ensure_agent_dirs(agent_name)
        self.session_file = self.agent_dir / "sessions" / f"{today_str()}.md"
        self._active = False

    def start(self, project: str = "", directive_from: str = "Chief") -> Path:
        current = read_text(self.session_file)
        now = local_now().isoformat(timespec="seconds")
        if not current:
            header = "\n".join(
                [
                    f"# Session Log - {today_str()}",
                    "",
                    "## Meta",
                    f"- agent: {self.agent_name}",
                    f"- project: {project or 'unspecified'}",
                    f"- session_start: {now}",
                    f"- directive_from: {directive_from}",
                    "",
                    "## Timeline",
                    "",
                ]
            )
            atomic_write_text(self.session_file, header)
        else:
            entry = "\n".join(
                [
                    "",
                    "---",
                    "",
                    f"## Session resumed - {local_now().strftime('%H:%M')}",
                    f"- project: {project or 'unspecified'}",
                    "",
                ]
            )
            lock_path = self.session_file.with_suffix(self.session_file.suffix + ".lock")
            with file_lock(lock_path):
                with self.session_file.open("a", encoding="utf-8") as handle:
                    handle.write(entry)
        self._active = True
        return self.session_file

    def log(self, event: SessionEvent) -> None:
        if not self._active:
            self.start()
        lock_path = self.session_file.with_suffix(self.session_file.suffix + ".lock")
        with file_lock(lock_path):
            with self.session_file.open("a", encoding="utf-8") as handle:
                handle.write("\n" + event.render())

    def end(self) -> str:
        if self._active:
            self.log(
                SessionEvent(
                    title="Session End",
                    description=f"session_end: {local_now().isoformat(timespec='seconds')}",
                )
            )
            self._active = False
        return read_text(self.session_file)
