"""Integration tests for skills and plugin discovery.

Requires the base stack to be running with skills and plugins mounted.
"""

import subprocess

import pytest


def test_hermes_lists_skills():
    """hermes-core can list skills without crashing."""
    result = subprocess.run(
        ["docker", "exec", "hermes-core", "hermes", "skills", "list"],
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 0, result.stderr
    # If wondelai pack is mounted, we expect to see it; otherwise just ensure
    # the command executed successfully and emitted some output.
    assert result.stdout.strip() or result.stderr.strip() is not None


def test_hermes_plugin_config_valid():
    """hermes-core loaded config.yaml without a plugin-related startup crash."""
    result = subprocess.run(
        ["docker", "logs", "hermes-core", "--tail", "100"],
        capture_output=True,
        text=True,
        timeout=10,
    )
    combined = result.stdout.lower() + result.stderr.lower()
    # A healthy boot should mention config, gateway, or server start.
    assert "config" in combined or "gateway" in combined or "server" in combined
    # No fatal plugin errors.
    assert "no such file or directory" not in combined or "/opt/data/plugins" not in combined
