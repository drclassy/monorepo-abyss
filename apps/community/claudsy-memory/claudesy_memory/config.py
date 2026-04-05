from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from pathlib import Path


APP_NAME = "Claudesy Memory Engine"
APP_VERSION = "1.1.0"
CATEGORIES = ("semantic", "episodic", "procedural", "preference")
DEFAULT_AGENT = os.environ.get("CLAUDESY_AGENT_NAME", "claude-code")
DEFAULT_BASE_DIR = Path(
    os.environ.get("CLAUDESY_BASE_DIR", str(Path.home() / ".claudesy"))
).expanduser()
AGENT_NAME_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


@dataclass(slots=True)
class OllamaConfig:
    model: str = os.environ.get("CLAUDESY_OLLAMA_MODEL", "nuextract")
    fallback_model: str = os.environ.get("CLAUDESY_OLLAMA_FALLBACK_MODEL", "llama3.1:8b")
    base_url: str = os.environ.get("CLAUDESY_OLLAMA_URL", "http://localhost:11434")
    temperature: float = 0.0
    timeout_seconds: int = 90
    max_retries: int = 2


@dataclass(slots=True)
class DecayConfig:
    half_life_days: int = 30
    access_boost: float = 0.08
    minimum_threshold: float = 0.30
    prune_below: float = 0.20


@dataclass(slots=True)
class BootConfig:
    max_tokens: int = 4000
    recent_fact_count: int = 5
    latest_session_count: int = 1
    chars_per_token: float = 4.0


@dataclass(slots=True)
class ArchiveConfig:
    enabled: bool = True
    compress_after_days: int = 14


@dataclass(slots=True)
class EncryptionConfig:
    enabled: bool = False
    key: str = ""  # Base64 encoded Fernet key


@dataclass(slots=True)
class EngineConfig:
    agent_name: str = DEFAULT_AGENT
    base_dir: Path = DEFAULT_BASE_DIR
    ollama: OllamaConfig = field(default_factory=OllamaConfig)
    decay: DecayConfig = field(default_factory=DecayConfig)
    boot: BootConfig = field(default_factory=BootConfig)
    archive: ArchiveConfig = field(default_factory=ArchiveConfig)
    encryption: EncryptionConfig = field(default_factory=EncryptionConfig)

    def __post_init__(self) -> None:
        self.base_dir = Path(self.base_dir).expanduser().resolve(strict=False)
        self.agent_name = self.validate_agent_name(self.agent_name)

    @staticmethod
    def validate_agent_name(agent_name: str) -> str:
        candidate = str(agent_name or "").strip()
        if not candidate:
            raise ValueError("Agent name is required")
        if not AGENT_NAME_PATTERN.fullmatch(candidate):
            raise ValueError(
                "Agent name may only contain letters, numbers, hyphens, and underscores"
            )
        return candidate

    @property
    def agents_dir(self) -> Path:
        return self.base_dir / "agents"

    @property
    def shared_dir(self) -> Path:
        return self.base_dir / "shared"

    def agent_dir(self, agent_name: str | None = None) -> Path:
        validated_name = self.validate_agent_name(agent_name or self.agent_name)
        target = (self.agents_dir / validated_name).resolve(strict=False)
        agents_root = self.agents_dir.resolve(strict=False)
        if target.parent != agents_root:
            raise ValueError("Resolved agent path escapes agents directory")
        return target
