# Architected and built by Claudesy.
from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from claudesy_memory import ClaudesyEngine, EngineConfig, SessionEvent
from claudesy_memory.boot import BootLoader
from claudesy_memory.consolidator import MemoryConsolidator
from claudesy_memory.extractor import MemoryExtractor
from claudesy_memory.storage import MemoryStorage


REPO_ROOT = Path(__file__).resolve().parent


class ClaudesyEngineRegressionTests(unittest.TestCase):
    def test_engine_config_resolves_base_dir_absolute(self) -> None:
        config = EngineConfig(agent_name="test-agent", base_dir=Path(".tmp-relative-check"))
        self.assertTrue(config.base_dir.is_absolute())

    def test_memory_cycle_persists_across_engine_instances(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config = EngineConfig(agent_name="review-agent", base_dir=Path(temp_dir))
            engine = ClaudesyEngine(config)
            engine.extractor._call_ollama = lambda prompt: None

            logger = engine.logger("review-agent")
            logger.start(project="regression")
            logger.log(
                SessionEvent(
                    title="Smoke Flow",
                    description="Chief meminta workflow memory engine stabil untuk review end-to-end.",
                )
            )
            logger.end()

            stored = engine.extract_latest_session("review-agent")
            self.assertGreaterEqual(len(stored), 1)

            summary = engine.consolidate("review-agent")
            self.assertGreaterEqual(summary["total"], 1)

            second_engine = ClaudesyEngine(EngineConfig(agent_name="review-agent", base_dir=Path(temp_dir)))
            results = second_engine.search("workflow", "review-agent")
            self.assertGreaterEqual(len(results), 1)

            memory_md = second_engine.storage.read_identity("review-agent", "MEMORY.md")
            self.assertIn("Chief meminta workflow memory engine stabil", memory_md)

            boot = second_engine.boot_context("review-agent")
            self.assertIn("Chief meminta workflow memory engine stabil", boot)

            health = second_engine.health("review-agent")
            self.assertEqual(health["facts"]["preference"], 1)
            self.assertEqual(health["sessions"], 1)

    def test_relative_base_dir_is_consistent_between_cli_and_runtime(self) -> None:
        with tempfile.TemporaryDirectory(dir=str(REPO_ROOT)) as temp_dir:
            absolute_base_dir = Path(temp_dir).resolve()
            relative_base_dir = absolute_base_dir.relative_to(REPO_ROOT)
            agent = "cli-agent"

            command = [
                sys.executable,
                "claudesy_engine.py",
                "--base-dir",
                str(relative_base_dir),
                "--agent",
                agent,
                "log",
                "--project",
                "cli-regression",
                "--title",
                "CLI Smoke Flow",
                "--description",
                "Chief meminta review konsistensi relative base dir.",
            ]
            result = subprocess.run(
                command,
                cwd=REPO_ROOT,
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 0, msg=result.stderr)

            engine = ClaudesyEngine(EngineConfig(agent_name=agent, base_dir=relative_base_dir))
            engine.extractor._call_ollama = lambda prompt: None

            stored = engine.extract_latest_session(agent)
            self.assertGreaterEqual(len(stored), 1)

            summary = engine.consolidate(agent)
            self.assertGreaterEqual(summary["total"], 1)

            search = engine.search("relative base dir", agent)
            self.assertGreaterEqual(len(search), 1)

            memory_md = engine.storage.read_identity(agent, "MEMORY.md")
            self.assertIn("Chief meminta review konsistensi relative base dir.", memory_md)


class ClaudesyMemoryCoreTests(unittest.TestCase):
    def test_engine_config_rejects_invalid_agent_name(self) -> None:
        with self.assertRaises(ValueError):
            EngineConfig(agent_name="../../etc/passwd")

        config = EngineConfig(agent_name="safe_agent-01")
        agent_dir = config.agent_dir()
        self.assertEqual(agent_dir.name, "safe_agent-01")
        self.assertEqual(agent_dir.parent, config.agents_dir.resolve(strict=False))

    def test_storage_inspect_fact_reads_from_sqlite_index(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config = EngineConfig(agent_name="storage-agent", base_dir=Path(temp_dir))
            storage = MemoryStorage(config)
            storage.ensure_agent_dirs("storage-agent")
            record = {
                "id": "pre-123",
                "fact": "Chief selalu minta evidence sebelum approval.",
                "importance": 0.91,
                "category": "preference",
                "operation": "ADD",
                "tags": ["chief", "review"],
                "related_to": None,
                "summary": "Approval guidance",
                "session": "session/2026-03-26",
                "name": "Approval Preference",
                "steps": ["Collect evidence", "Report status"],
                "source": "session/2026-03-26",
                "created": "2026-03-26T01:00:00+00:00",
                "last_accessed": "2026-03-26T01:00:00+00:00",
                "access_count": 2,
                "status": "active",
            }
            storage.append_fact("storage-agent", record)

            extracted_file = storage.agent_dir("storage-agent") / "extracted" / "preference.jsonl"
            extracted_file.unlink()

            inspected = storage.inspect_fact("storage-agent", "pre-123")
            self.assertIsNotNone(inspected)
            self.assertEqual(inspected["fact"], record["fact"])
            self.assertEqual(inspected["summary"], "Approval guidance")
            self.assertEqual(inspected["steps"], ["Collect evidence", "Report status"])
            self.assertEqual(inspected["access_count"], 2)

    def test_storage_search_and_recent_support_filters_and_offsets(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config = EngineConfig(agent_name="search-agent", base_dir=Path(temp_dir))
            storage = MemoryStorage(config)
            storage.ensure_agent_dirs("search-agent")
            records = [
                {
                    "id": "pre-001",
                    "fact": "Chief meminta evidence sebelum approval.",
                    "importance": 0.95,
                    "category": "preference",
                    "operation": "ADD",
                    "tags": ["chief"],
                    "related_to": None,
                    "summary": None,
                    "session": "session/2026-03-26",
                    "name": None,
                    "steps": [],
                    "source": "session/2026-03-26",
                    "created": "2026-03-26T01:00:00+00:00",
                    "last_accessed": "2026-03-26T01:00:00+00:00",
                    "access_count": 1,
                    "status": "active",
                },
                {
                    "id": "pre-002",
                    "fact": "Chief meminta summary singkat saat review.",
                    "importance": 0.85,
                    "category": "preference",
                    "operation": "ADD",
                    "tags": ["chief"],
                    "related_to": None,
                    "summary": None,
                    "session": "session/2026-03-27",
                    "name": None,
                    "steps": [],
                    "source": "session/2026-03-27",
                    "created": "2026-03-27T01:00:00+00:00",
                    "last_accessed": "2026-03-27T01:00:00+00:00",
                    "access_count": 1,
                    "status": "active",
                },
                {
                    "id": "sem-003",
                    "fact": "Evidence logs are required in the review pipeline.",
                    "importance": 0.75,
                    "category": "semantic",
                    "operation": "ADD",
                    "tags": ["evidence"],
                    "related_to": None,
                    "summary": None,
                    "session": "session/2026-03-28",
                    "name": None,
                    "steps": [],
                    "source": "session/2026-03-28",
                    "created": "2026-03-28T01:00:00+00:00",
                    "last_accessed": "2026-03-28T01:00:00+00:00",
                    "access_count": 1,
                    "status": "superseded",
                },
            ]
            for record in records:
                storage.append_fact("search-agent", record)

            filtered = storage.search_facts("search-agent", "Chief", category="preference", status="active", limit=1, offset=1)
            self.assertEqual(len(filtered), 1)
            self.assertEqual(filtered[0]["id"], "pre-002")

            recent = storage.recent_facts("search-agent", limit=1, category="preference", status="active", offset=0)
            self.assertEqual(len(recent), 1)
            self.assertEqual(recent[0]["id"], "pre-002")

    def test_extractor_prefilter_and_fact_record_validation(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config = EngineConfig(agent_name="extractor-agent", base_dir=Path(temp_dir))
            storage = MemoryStorage(config)
            extractor = MemoryExtractor(config, storage)
            session_text = (
                "### 10:00 - Directive\n"
                "Chief meminta semua perubahan wajib disertai evidence dan tidak boleh fabricate hasil.\n"
            )

            candidates = extractor.prefilter_session(session_text)
            self.assertEqual(len(candidates), 1)
            self.assertEqual(candidates[0]["category"], "preference")

            record = extractor._fact_record(
                {
                    "fact": "Chief meminta semua perubahan wajib disertai evidence.",
                    "importance": 0.87,
                    "category": "preference",
                    "operation": "ADD",
                    "tags": ["chief", "evidence"],
                },
                "semantic",
                "session/2026-03-26",
            )
            self.assertIsNotNone(record)
            self.assertEqual(record["operation"], "ADD")
            self.assertEqual(record["category"], "preference")
            self.assertEqual(record["tags"], ["chief", "evidence"])

    def test_consolidator_resolves_update_operations(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config = EngineConfig(agent_name="consolidator-agent", base_dir=Path(temp_dir))
            storage = MemoryStorage(config)
            consolidator = MemoryConsolidator(config, storage)
            grouped = {
                "semantic": [
                    {
                        "id": "sem-001",
                        "fact": "Use SQLite WAL mode.",
                        "importance": 0.9,
                        "category": "semantic",
                        "operation": "ADD",
                        "tags": [],
                        "related_to": None,
                        "summary": None,
                        "session": None,
                        "name": None,
                        "steps": None,
                        "source": "session/2026-03-26",
                        "created": "2026-03-26T01:00:00+00:00",
                        "last_accessed": "2026-03-26T01:00:00+00:00",
                        "access_count": 1,
                        "status": "active",
                    }
                ],
                "episodic": [],
                "procedural": [],
                "preference": [
                    {
                        "id": "pre-002",
                        "fact": "Chief prefers runtime evidence in reports.",
                        "importance": 0.93,
                        "category": "preference",
                        "operation": "UPDATE",
                        "tags": [],
                        "related_to": "sem-001",
                        "summary": None,
                        "session": None,
                        "name": None,
                        "steps": None,
                        "source": "session/2026-03-26",
                        "created": "2026-03-26T01:10:00+00:00",
                        "last_accessed": "2026-03-26T01:10:00+00:00",
                        "access_count": 1,
                        "status": "active",
                    }
                ],
            }

            resolved = consolidator._resolve_operations(grouped)
            self.assertEqual(resolved["semantic"], [])
            self.assertEqual(len(resolved["preference"]), 1)
            self.assertEqual(resolved["preference"][0]["id"], "pre-002")

    def test_boot_loader_trims_to_budget(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            config = EngineConfig(agent_name="boot-agent", base_dir=Path(temp_dir))
            config.boot.max_tokens = 120
            config.boot.chars_per_token = 1.0
            storage = MemoryStorage(config)
            storage.ensure_agent_dirs("boot-agent")
            storage.write_identity("boot-agent", "SOUL.md", "# boot-agent\n\n" + ("Chief context.\n" * 80))

            boot_loader = BootLoader(config, storage)
            context = boot_loader.boot_context("boot-agent")

            self.assertIn("... (trimmed)", context)
            self.assertLessEqual(len(context), 170)


if __name__ == "__main__":
    unittest.main()
