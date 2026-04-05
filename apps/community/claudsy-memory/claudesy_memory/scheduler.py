from __future__ import annotations

import logging
import time
from typing import Any


LOGGER = logging.getLogger("claudesy.scheduler")


class MemoryDaemon:
    def __init__(self, engine: "ClaudesyEngine"):
        self.engine = engine

    def run(
        self,
        agent_name: str,
        interval_seconds: int = 300,
        mode: str = "full",
        iterations: int = 0,
    ) -> dict[str, Any]:
        runs = 0
        while True:
            runs += 1
            if mode == "consolidate":
                result = self.engine.consolidate(agent_name)
            else:
                result = self.engine.run_full_cycle(agent_name)
            LOGGER.info("Daemon cycle %s complete for %s", runs, agent_name)
            if iterations and runs >= iterations:
                return {"runs": runs, "mode": mode, "last_result": result}
            try:
                time.sleep(max(1, interval_seconds))
            except KeyboardInterrupt:
                return {"runs": runs, "mode": mode, "last_result": result, "stopped": "keyboard_interrupt"}
