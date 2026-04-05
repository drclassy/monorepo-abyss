from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

from .config import APP_NAME, APP_VERSION, DEFAULT_AGENT, DEFAULT_BASE_DIR, EngineConfig
from .engine import ClaudesyEngine
from .models import SessionEvent
from .storage import read_text


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=f"{APP_NAME} {APP_VERSION}")
    parser.add_argument("--agent", default=DEFAULT_AGENT, help="Agent name")
    parser.add_argument("--base-dir", default=str(DEFAULT_BASE_DIR), help="Base directory for memory storage")
    parser.add_argument("--log-level", default="INFO", help="Python log level")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("run", help="Archive old sessions, extract latest facts, and consolidate memory")

    log_parser = subparsers.add_parser("log", help="Append an event to today's session log")
    log_parser.add_argument("--project", default="", help="Project name for session start")
    log_parser.add_argument("--title", required=True, help="Event title")
    log_parser.add_argument("--description", required=True, help="Event description")
    log_parser.add_argument("--decision", default=None, help="Optional decision")
    log_parser.add_argument("--tags", default="", help="Comma-separated tags")

    extract_parser = subparsers.add_parser("extract", help="Extract facts from latest session or provided file")
    extract_parser.add_argument("--file", default="", help="Optional session markdown file")

    subparsers.add_parser("consolidate", help="Rebuild long-term memory from extracted facts")
    subparsers.add_parser("boot", help="Render boot context")
    subparsers.add_parser("health", help="Show health/status report")

    search_parser = subparsers.add_parser("search", help="Search indexed facts in local memory")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--category", default=None, help="Optional category filter")
    search_parser.add_argument("--status", default=None, help="Optional status filter")
    search_parser.add_argument("--limit", type=int, default=10, help="Max results")
    search_parser.add_argument("--offset", type=int, default=0, help="Result offset for pagination")

    inspect_parser = subparsers.add_parser("inspect", help="Inspect one fact by id or list recent facts")
    inspect_parser.add_argument("--id", default=None, help="Fact id")
    inspect_parser.add_argument("--category", default=None, help="Optional category filter")
    inspect_parser.add_argument("--status", default=None, help="Optional status filter for recent facts")
    inspect_parser.add_argument("--limit", type=int, default=10, help="Max recent facts")
    inspect_parser.add_argument("--offset", type=int, default=0, help="Result offset for recent facts")

    daemon_parser = subparsers.add_parser("daemon", help="Run lightweight foreground daemon for auto-consolidation")
    daemon_parser.add_argument("--interval-seconds", type=int, default=300, help="Polling interval in seconds")
    daemon_parser.add_argument("--mode", choices=["full", "consolidate"], default="full", help="Daemon work mode")
    daemon_parser.add_argument("--iterations", type=int, default=0, help="0 means run forever")
    return parser


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
    )


def engine_from_args(args: argparse.Namespace) -> ClaudesyEngine:
    config = EngineConfig(agent_name=args.agent, base_dir=Path(args.base_dir))
    return ClaudesyEngine(config)


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    configure_logging(args.log_level)
    engine = engine_from_args(args)

    if args.command == "run":
        print(json.dumps(engine.run_full_cycle(), indent=2))
        return 0

    if args.command == "log":
        logger = engine.logger(args.agent)
        logger.start(project=args.project)
        tags = [tag.strip() for tag in args.tags.split(",") if tag.strip()]
        logger.log(SessionEvent(title=args.title, description=args.description, decision=args.decision, tags=tags))
        logger.end()
        print(json.dumps({"status": "logged", "session_file": str(logger.session_file)}, indent=2))
        return 0

    if args.command == "extract":
        if args.file:
            path = Path(args.file).expanduser().resolve(strict=False)
            stored = engine.extract_from_text(args.agent, read_text(path), f"session/{path.stem}")
        else:
            stored = engine.extract_latest_session(args.agent)
        print(json.dumps({"stored": len(stored)}, indent=2))
        return 0

    if args.command == "consolidate":
        print(json.dumps(engine.consolidate(args.agent), indent=2))
        return 0

    if args.command == "boot":
        print(engine.boot_context(args.agent))
        return 0

    if args.command == "health":
        print(json.dumps(engine.health(args.agent), indent=2))
        return 0

    if args.command == "search":
        print(json.dumps(engine.search(args.query, args.agent, args.category, args.status, args.limit, args.offset), indent=2, ensure_ascii=False))
        return 0

    if args.command == "inspect":
        print(json.dumps(engine.inspect(args.id, args.agent, args.category, args.status, args.limit, args.offset), indent=2, ensure_ascii=False))
        return 0

    if args.command == "daemon":
        print(json.dumps(engine.run_daemon(args.agent, args.interval_seconds, args.mode, args.iterations), indent=2))
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
