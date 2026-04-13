"""Real smoke tests for the Hermes Maximus base profile.

Requires the base stack to be running:
    docker compose -f docker-compose.base.yml up -d
"""

import os
import subprocess

import httpx
import pytest

HERMES_HOST = os.getenv("HERMES_HOST", "127.0.0.1")


@pytest.fixture(scope="session")
def http_client():
    return httpx.Client(timeout=10)


def test_hindsight_postgres_ready():
    """hindsight standalone must accept Postgres connections."""
    result = subprocess.run(
        ["docker", "exec", "hindsight", "/home/hindsight/.pg0/installation/18.1.0/bin/pg_isready", "-U", "postgres"],
        capture_output=True,
        text=True,
        timeout=10,
    )
    assert result.returncode == 0, result.stderr or result.stdout


def test_hermes_core_cli_responds():
    """hermes-core CLI returns a version string."""
    result = subprocess.run(
        ["docker", "exec", "hermes-core", "hermes", "--version"],
        capture_output=True,
        text=True,
        timeout=20,
    )
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip(), "empty version output"


def test_hermes_gateway_http_reachable(http_client):
    """Gateway HTTP port accepts TCP and returns a non-5xx status."""
    url = f"http://{HERMES_HOST}:8642/health"
    try:
        r = http_client.get(url)
    except httpx.ConnectError as exc:
        pytest.fail(f"Cannot connect to Hermes gateway at {url}: {exc}")
    assert r.status_code < 500, f"gateway returned 5xx: {r.status_code}"


def test_mission_control_ui_loads(http_client):
    """Mission Control serves its landing page."""
    url = f"http://{HERMES_HOST}:3000/"
    r = http_client.get(url, follow_redirects=True)
    assert r.status_code == 200, f"unexpected status: {r.status_code}"
    assert "Mission Control" in r.text or "mission-control" in r.text.lower()


def test_workspace_ui_loads(http_client):
    """Workspace UI serves its landing page."""
    url = f"http://{HERMES_HOST}:3001/"
    r = http_client.get(url, follow_redirects=True)
    assert r.status_code == 200, f"unexpected status: {r.status_code}"
    assert "Hermes" in r.text or "Workspace" in r.text or "workspace" in r.text.lower()
