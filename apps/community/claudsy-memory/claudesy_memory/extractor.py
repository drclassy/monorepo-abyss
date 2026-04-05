from __future__ import annotations

import json
import logging
import re
import ssl
import urllib.error
import urllib.request
from typing import Any

from .config import CATEGORIES, EngineConfig
from .models import FactRecord
from .storage import MemoryStorage, generate_id, now_iso, read_text


LOGGER = logging.getLogger("claudesy.extractor")


class MemoryExtractor:
    def __init__(self, config: EngineConfig, storage: MemoryStorage):
        self.config = config
        self.storage = storage

    def prefilter_session(self, session_text: str) -> list[dict[str, Any]]:
        sections = re.split(r"\n###\s+", session_text)
        always_rules = [
            (re.compile(r"(?i)(chief|boss|directive|instruksi|meminta|minta|approve|reject)"), "preference", 0.85),
            (re.compile(r"(?i)(architecture|decision|refactor|migration|breaking change)"), "semantic", 0.78),
            (re.compile(r"(?i)(error|bug|fix|issue|warning|fail|crash)"), "semantic", 0.72),
            (re.compile(r"(?i)(workflow|sop|procedure|steps|protocol)"), "procedural", 0.80),
            (re.compile(r"(?i)(prefer|always|never|wajib|harus|jangan)"), "preference", 0.82),
            (re.compile(r"(?i)(summary|session recap|retrospective|learned)"), "episodic", 0.65),
        ]
        never_rules = [
            re.compile(r"(?i)^(thinking|hmm|okay so|let me|um|uh)\b"),
            re.compile(r"(?i)^(import|from\s+\w+\s+import|```|---)\b"),
        ]
        candidates: list[dict[str, Any]] = []
        for raw_section in sections:
            section = raw_section.strip()
            if len(section) < 20:
                continue
            if section.startswith("# Session Log") or section.startswith("## Meta"):
                continue
            if any(pattern.search(section) for pattern in never_rules):
                continue
            best_match: tuple[str, float] | None = None
            for pattern, category, min_importance in always_rules:
                if pattern.search(section):
                    if best_match is None or min_importance > best_match[1]:
                        best_match = (category, min_importance)
            if best_match:
                category, min_importance = best_match
                candidates.append(
                    {
                        "text": section[:2200],
                        "category": category,
                        "importance": min_importance,
                        "matched": True,
                    }
                )
            elif len(section) > 80:
                candidates.append(
                    {
                        "text": section[:2200],
                        "category": "semantic",
                        "importance": 0.45,
                        "matched": False,
                    }
                )
        return candidates

    def ollama_schema(self) -> dict[str, Any]:
        return {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "fact": {"type": "string"},
                    "importance": {"type": "number"},
                    "category": {"type": "string", "enum": list(CATEGORIES)},
                    "operation": {"type": "string", "enum": ["ADD", "UPDATE", "DELETE", "NOOP"]},
                    "tags": {"type": "array", "items": {"type": "string"}},
                    "related_to": {"type": ["string", "null"]},
                    "name": {"type": ["string", "null"]},
                    "summary": {"type": ["string", "null"]},
                    "session": {"type": ["string", "null"]},
                    "steps": {"type": ["array", "null"], "items": {"type": "string"}},
                },
                "required": ["fact", "importance", "category", "operation", "tags"],
            },
        }

    def extraction_prompt(self, segment: str) -> str:
        return (
            "You are a memory extraction engine for an AI agent.\n"
            "Extract only durable facts worth storing for future sessions.\n"
            "Use category values semantic, episodic, procedural, or preference.\n"
            "Use operation UPDATE or DELETE only when the text clearly supersedes prior knowledge.\n"
            "For procedural memories, include steps when available.\n"
            "For episodic memories, include summary and session when available.\n"
            "Respond strictly as JSON matching the provided schema.\n\n"
            f"Session segment:\n{segment}"
        )

    def _call_ollama(self, prompt: str) -> str | None:
        payload_template = {
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": self.config.ollama.temperature},
            "format": self.ollama_schema(),
        }
        url = self.config.ollama.base_url.rstrip("/") + "/api/generate"
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = True
        ssl_context.verify_mode = ssl.CERT_REQUIRED

        for attempt in range(self.config.ollama.max_retries + 1):
            model = self.config.ollama.model if attempt == 0 else self.config.ollama.fallback_model
            payload = dict(payload_template)
            payload["model"] = model
            request = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(request, timeout=self.config.ollama.timeout_seconds, context=ssl_context) as response:
                    body = response.read().decode("utf-8")
                parsed = json.loads(body)
                if isinstance(parsed, dict):
                    return parsed.get("response", "")
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                LOGGER.warning("Ollama request failed using model %s: %s", model, exc)
                continue
        return None

    def _parse_extraction(self, raw: str | None) -> list[dict[str, Any]]:
        if not raw:
            return []
        text = raw.strip()
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\[.*\]", text, re.DOTALL)
            if not match:
                return []
            parsed = json.loads(match.group(0))
        if isinstance(parsed, dict):
            for key in ("facts", "results", "memories", "items"):
                value = parsed.get(key)
                if isinstance(value, list):
                    return [item for item in value if isinstance(item, dict)]
            return [parsed]
        if isinstance(parsed, list):
            return [item for item in parsed if isinstance(item, dict)]
        return []

    def _rules_fallback_fact(self, candidate: dict[str, Any]) -> dict[str, Any]:
        lines = [
            line.strip()
            for line in candidate["text"].splitlines()
            if line.strip()
            and not line.lstrip().startswith("#")
            and not re.match(r"^\d{2}:\d{2}\s+-\s+", line.strip())
            and not line.startswith("Tags:")
            and not line.startswith("Decision:")
            and not line.startswith("- ")
        ]
        best_line = lines[0] if lines else candidate["text"][:200]
        return {
            "fact": best_line[:200],
            "importance": candidate["importance"],
            "category": candidate["category"],
            "operation": "ADD",
            "tags": [],
        }

    def _fact_record(self, raw_fact: dict[str, Any], fallback_category: str, source: str) -> dict[str, Any] | None:
        fact = str(raw_fact.get("fact", "")).strip()
        if not fact:
            return None
        category = str(raw_fact.get("category") or fallback_category).strip().lower()
        if category not in CATEGORIES:
            category = fallback_category

        # Prepare validated data
        validated_data = {
            "id": str(raw_fact.get("id") or generate_id(category[:3])),
            "fact": fact[:500],
            "importance": max(0.0, min(1.0, float(raw_fact.get("importance", 0.5)))),
            "category": category,
            "operation": str(raw_fact.get("operation", "ADD")).upper(),
            "tags": [str(tag)[:32] for tag in (raw_fact.get("tags", []) if isinstance(raw_fact.get("tags"), list) else [])[:6]],
            "related_to": raw_fact.get("related_to"),
            "summary": raw_fact.get("summary"),
            "session": raw_fact.get("session"),
            "name": raw_fact.get("name"),
            "steps": raw_fact.get("steps") if isinstance(raw_fact.get("steps"), list) else None,
            "source": source,
            "created": now_iso(),
            "last_accessed": now_iso(),
            "access_count": 1,
            "status": "active",
        }

        try:
            # Validate with Pydantic
            fact_record = FactRecord(**validated_data)
            record = fact_record.model_dump()
            if record["operation"] == "NOOP":
                return None
            return record
        except Exception as e:
            LOGGER.warning("Fact validation failed: %s", e)
            return None

    def extract_from_text(self, agent_name: str, session_text: str, source: str) -> list[dict[str, Any]]:
        content_hash = self.storage.content_hash(session_text)
        if self.storage.is_session_processed(agent_name, source, content_hash):
            self.storage.log_run(agent_name, "extract", "skipped", {"reason": "session unchanged", "source": source})
            return []

        candidates = self.prefilter_session(session_text)
        if not candidates:
            self.storage.mark_session_processed(agent_name, source, content_hash)
            return []

        combined_text = "\n\n---\n\n".join(candidate["text"] for candidate in candidates)[:8000]
        raw_response = self._call_ollama(self.extraction_prompt(combined_text))
        parsed = self._parse_extraction(raw_response)

        if not parsed:
            parsed = [self._rules_fallback_fact(candidate) for candidate in candidates if candidate["matched"]]

        stored: list[dict[str, Any]] = []
        for index, item in enumerate(parsed):
            fallback = candidates[min(index, len(candidates) - 1)]
            record = self._fact_record(item, fallback["category"], source)
            if not record:
                continue
            self.storage.append_fact(agent_name, record)
            stored.append(record)

        self.storage.mark_session_processed(agent_name, source, content_hash)
        self.storage.log_run(agent_name, "extract", "success", {"stored": len(stored), "source": source})
        return stored

    def extract_latest_session(self, agent_name: str) -> list[dict[str, Any]]:
        latest = self.storage.latest_session_file(agent_name)
        if not latest:
            return []
        return self.extract_from_text(agent_name, read_text(latest), f"session/{latest.stem}")

    def ollama_reachable(self) -> bool:
        return self._call_ollama("Return []") is not None
