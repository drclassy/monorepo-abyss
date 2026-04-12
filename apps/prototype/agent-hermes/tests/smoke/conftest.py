import os
import time
import httpx
import pytest

HERMES_HOST = os.getenv("HERMES_HOST", "127.0.0.1")


def wait_for_health(port: int, path: str = "/health", timeout: int = 120) -> bool:
    url = f"http://{HERMES_HOST}:{port}{path}"
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = httpx.get(url, timeout=5)
            if r.status_code == 200:
                return True
        except httpx.HTTPError:
            pass
        time.sleep(2)
    return False


@pytest.fixture(scope="session")
def health_probe():
    return wait_for_health
