from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from .config import CATEGORIES, EngineConfig
from .storage import MemoryStorage, now_iso


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


class MemoryConsolidator:
    def __init__(self, config: EngineConfig, storage: MemoryStorage):
        self.config = config
        self.storage = storage

    def _resolve_operations(self, grouped: dict[str, list[dict[str, Any]]]) -> dict[str, list[dict[str, Any]]]:
        all_facts = [fact for facts in grouped.values() for fact in facts]
        facts_by_id = {fact["id"]: fact for fact in all_facts}
        for fact in all_facts:
            related = fact.get("related_to")
            if not related or related not in facts_by_id:
                continue
            if fact.get("operation") == "DELETE":
                facts_by_id[related]["status"] = "deleted"
            elif fact.get("operation") == "UPDATE":
                facts_by_id[related]["status"] = "superseded"
        output: dict[str, list[dict[str, Any]]] = {category: [] for category in CATEGORIES}
        for fact in all_facts:
            if fact.get("status") in {"deleted", "superseded"}:
                continue
            output[fact["category"]].append(fact)
        return output

    def _deduplicate(self, facts: list[dict[str, Any]]) -> list[dict[str, Any]]:
        from .storage import normalize_text

        seen: dict[str, dict[str, Any]] = {}
        for fact in facts:
            key = normalize_text(fact.get("fact", ""))
            existing = seen.get(key)
            if existing is None or fact.get("importance", 0.0) > existing.get("importance", 0.0):
                seen[key] = fact
        return sorted(seen.values(), key=lambda item: item.get("importance", 0.0), reverse=True)

    def _apply_decay(self, facts: list[dict[str, Any]]) -> list[dict[str, Any]]:
        kept: list[dict[str, Any]] = []
        for fact in facts:
            importance = calculate_decay(
                float(fact.get("importance", 0.5)),
                str(fact.get("last_accessed", fact.get("created", now_iso()))),
                int(fact.get("access_count", 1)),
                self.config,
            )
            if importance < self.config.decay.prune_below:
                continue
            fact["importance"] = round(importance, 3)
            if importance < self.config.decay.minimum_threshold:
                fact["status"] = "stale"
            kept.append(fact)
        return kept

    def _build_memory_md(self, grouped: dict[str, list[dict[str, Any]]]) -> str:
        semantic = grouped["semantic"]
        episodic = grouped["episodic"]
        preference = grouped["preference"]
        issues = [fact for fact in semantic if any(tag in fact.get("tags", []) for tag in ("error", "bug", "issue", "warning"))]
        lines = [
            "# Long-Term Memory",
            "",
            f"> Last consolidated: {now_iso()}",
            f"> Total active facts: {sum(len(items) for items in grouped.values())}",
            "",
            "## Architecture Decisions",
        ]
        architecture = [fact for fact in semantic if fact.get("importance", 0.0) >= 0.7][:20]
        lines.extend([f"- {fact['fact']}" for fact in architecture] or ["(none yet)"])
        lines.extend(["", "## Preferences"])
        lines.extend([f"- {fact['fact']} (confidence: {fact['importance']:.2f})" for fact in preference[:15]] or ["(none yet)"])
        lines.extend(["", "## Active Project State"])
        recent_semantic = sorted(semantic, key=lambda item: item.get("created", ""), reverse=True)[:12]
        lines.extend([f"- {fact['fact']}" for fact in recent_semantic] or ["(none yet)"])
        lines.extend(["", "## Recent Sessions"])
        recent_episodes = sorted(episodic, key=lambda item: item.get("created", ""), reverse=True)[:5]
        if recent_episodes:
            for fact in recent_episodes:
                summary = fact.get("summary") or fact["fact"]
                session = fact.get("session") or fact["source"]
                lines.append(f"- {session}: {summary}")
        else:
            lines.append("(none yet)")
        lines.extend(["", "## Known Issues"])
        lines.extend([f"- {fact['fact']}" for fact in issues[:10]] or ["(none)"])
        lines.append("")
        return "\n".join(lines)

    def _build_skills_md(self, procedural: list[dict[str, Any]]) -> str:
        lines = ["# Learned Skills", ""]
        if not procedural:
            lines.append("(no skills learned yet)")
            lines.append("")
            return "\n".join(lines)
        for fact in procedural:
            title = fact.get("name") or fact["fact"]
            lines.append(f"## {title}")
            steps = fact.get("steps") or []
            if steps:
                for step_index, step in enumerate(steps, start=1):
                    lines.append(f"{step_index}. {step}")
            else:
                lines.append(fact["fact"])
            lines.append("")
        return "\n".join(lines)

    def consolidate(self, agent_name: str) -> dict[str, Any]:
        grouped = self.storage.load_grouped_facts(agent_name)
        grouped = self._resolve_operations(grouped)
        for category in CATEGORIES:
            grouped[category] = self._apply_decay(self._deduplicate(grouped[category]))
            self.storage.rewrite_category(agent_name, category, grouped[category])
        self.storage.write_identity(agent_name, "MEMORY.md", self._build_memory_md(grouped))
        self.storage.write_identity(agent_name, "SKILLS.md", self._build_skills_md(grouped["procedural"]))
        self.storage.rewrite_indexes(agent_name, grouped)
        summary = {category: len(facts) for category, facts in grouped.items()}
        summary["total"] = sum(summary.values())
        self.storage.log_run(agent_name, "consolidate", "success", summary)
        return summary
