from __future__ import annotations

from .config import EngineConfig
from .storage import MemoryStorage, estimate_tokens


class BootLoader:
    def __init__(self, config: EngineConfig, storage: MemoryStorage):
        self.config = config
        self.storage = storage

    def boot_context(self, agent_name: str) -> str:
        sections: list[tuple[str, str, int]] = []
        soul = self.storage.read_identity(agent_name, "SOUL.md")
        memory = self.storage.read_identity(agent_name, "MEMORY.md")
        skills = self.storage.read_identity(agent_name, "SKILLS.md")
        grouped = self.storage.load_grouped_facts(agent_name)
        semantic = grouped["semantic"]
        episodic = grouped["episodic"]

        if soul:
            sections.append(("SOUL.md", soul, 1))
        if semantic:
            recent = sorted(semantic, key=lambda item: item.get("created", ""), reverse=True)[: self.config.boot.recent_fact_count]
            rendered = "## Recent Context\n" + "\n".join(
                f"- [{fact.get('created', '?')[:10]}] {fact['fact']}" for fact in recent
            )
            sections.append(("recent", rendered, 2))
        if memory:
            sections.append(("MEMORY.md", memory, 3))
        if skills:
            sections.append(("SKILLS.md", skills, 4))
        if episodic:
            last_sessions = sorted(episodic, key=lambda item: item.get("created", ""), reverse=True)[: self.config.boot.latest_session_count]
            rendered = "## Last Session Summary\n" + "\n".join(
                f"- {(fact.get('session') or fact.get('source') or '?')}: {(fact.get('summary') or fact['fact'])}"
                for fact in last_sessions
            )
            sections.append(("last_session", rendered, 5))

        budget = self.config.boot.max_tokens
        fitted: list[str] = []
        used = 0
        for _, content, priority in sorted(sections, key=lambda item: item[2]):
            tokens = estimate_tokens(content, self.config.boot.chars_per_token)
            if used + tokens <= budget:
                fitted.append(content)
                used += tokens
                continue
            remaining = budget - used
            if remaining > 100 and priority <= 3:
                cutoff = int(remaining * self.config.boot.chars_per_token)
                fitted.append(content[:cutoff] + "\n\n... (trimmed)")
                break
        context = "\n\n---\n\n".join(fitted) or f"# {agent_name}\n\nNo memory found."
        self.storage.log_run(
            agent_name,
            "boot",
            "success",
            {"estimated_tokens": estimate_tokens(context, self.config.boot.chars_per_token)},
        )
        return context
